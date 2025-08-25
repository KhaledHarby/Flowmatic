using FlowMaster.Application.Interfaces;
using FlowMaster.Shared.DTOs;
using Microsoft.Extensions.Logging;
using LogLevel = FlowMaster.Shared.DTOs.LogLevel;
using NodeType = FlowMaster.Shared.DTOs.NodeType;

namespace FlowMaster.Application.Services;

public class WorkflowEngine : IWorkflowEngine
{
    private readonly IWorkflowInstanceRepository _instanceRepository;
    private readonly IUserAssignmentService _userAssignmentService;
    private readonly IServiceExecutionService _serviceExecutionService;
    private readonly ILogger<WorkflowEngine> _logger;

    public WorkflowEngine(
        IWorkflowInstanceRepository instanceRepository, 
        IUserAssignmentService userAssignmentService,
        IServiceExecutionService serviceExecutionService,
        ILogger<WorkflowEngine> logger)
    {
        _instanceRepository = instanceRepository;
        _userAssignmentService = userAssignmentService;
        _serviceExecutionService = serviceExecutionService;
        _logger = logger;
    }

    public async Task<Guid> StartWorkflowAsync(Guid workflowDefinitionId, string applicationId, Dictionary<string, object> variables, string? startedBy = null)
    {
        try
        {
            var instanceId = await _instanceRepository.CreateInstanceAsync(workflowDefinitionId, applicationId, variables, startedBy);

            _logger.LogInformation("Started workflow instance {InstanceId} for workflow {WorkflowId}", 
                instanceId, workflowDefinitionId);

            return instanceId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting workflow instance");
            throw;
        }
    }

    public async Task<bool> ProcessNodeAsync(Guid instanceId, string nodeId)
    {
        try
        {
            var instance = await _instanceRepository.GetInstanceAsync(instanceId);
            if (instance == null) return false;

            var node = instance.WorkflowDefinition?.Nodes?.FirstOrDefault(n => n.NodeId == nodeId);
            if (node == null) return false;

            // Update current node
            await _instanceRepository.UpdateCurrentNodeAsync(instanceId, nodeId);

            // Add execution log
            await _instanceRepository.AddExecutionLogAsync(
                instanceId, 
                nodeId, 
                node.Name, 
                node.Type, 
                LogLevel.Information, 
                $"Processing node: {node.Name}"
            );

            // Handle service node execution
            if (node.Type == NodeType.ServiceNode)
            {
                await ExecuteServiceNodeAsync(instanceId, nodeId, instance.Variables);
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing node {NodeId} for instance {InstanceId}", nodeId, instanceId);
            return false;
        }
    }

    private async Task ExecuteServiceNodeAsync(Guid instanceId, string nodeId, Dictionary<string, object> context)
    {
        try
        {
            _logger.LogInformation("Executing service node {NodeId} for workflow instance {InstanceId}", nodeId, instanceId);
            
            var result = await _serviceExecutionService.ExecuteServiceNodeAsync(instanceId, nodeId, context);
            
            if (result.IsSuccess)
            {
                _logger.LogInformation("Service node {NodeId} executed successfully for workflow instance {InstanceId}", nodeId, instanceId);
                
                // Add execution log for successful service execution
                await _instanceRepository.AddExecutionLogAsync(
                    instanceId,
                    nodeId,
                    "Service",
                    NodeType.ServiceNode,
                    LogLevel.Information,
                    $"Service executed successfully: {result.ServiceName}",
                    System.Text.Json.JsonSerializer.Serialize(result.ResponseData),
                    null,
                    false,
                    null
                );
            }
            else
            {
                _logger.LogError("Service node {NodeId} execution failed for workflow instance {InstanceId}: {ErrorMessage}", 
                    nodeId, instanceId, result.ErrorMessage);
                
                // Add execution log for failed service execution
                await _instanceRepository.AddExecutionLogAsync(
                    instanceId,
                    nodeId,
                    "Service",
                    NodeType.ServiceNode,
                    LogLevel.Error,
                    $"Service execution failed: {result.ErrorMessage}",
                    System.Text.Json.JsonSerializer.Serialize(result.ResponseData),
                    null,
                    true,
                    result.ErrorDetails
                );
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing service node {NodeId} for workflow instance {InstanceId}", nodeId, instanceId);
            
            // Add execution log for service execution error
            await _instanceRepository.AddExecutionLogAsync(
                instanceId,
                nodeId,
                "Service",
                NodeType.ServiceNode,
                LogLevel.Error,
                $"Service execution error: {ex.Message}",
                null,
                null,
                true,
                ex.ToString()
            );
        }
    }

    public async Task<bool> CompleteTaskAsync(Guid instanceId, string nodeId, Dictionary<string, object> result, string completedBy)
    {
        try
        {
            var success = await _instanceRepository.CompleteTaskAsync(instanceId, nodeId, result, completedBy);
            
            if (success)
            {
                // Add execution log
                await _instanceRepository.AddExecutionLogAsync(
                    instanceId,
                    nodeId,
                    "Task",
                    NodeType.TaskNode,
                    LogLevel.Information,
                    $"Task completed by {completedBy}",
                    System.Text.Json.JsonSerializer.Serialize(result),
                    completedBy
                );
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing task {NodeId} for instance {InstanceId}", nodeId, instanceId);
            return false;
        }
    }

    public async Task<WorkflowInstanceDto> GetInstanceAsync(Guid instanceId)
    {
        try
        {
            var instance = await _instanceRepository.GetInstanceAsync(instanceId);
            if (instance == null)
                throw new InvalidOperationException($"Workflow instance with ID {instanceId} not found");

            return instance;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow instance {InstanceId}", instanceId);
            throw;
        }
    }

    public async Task<List<WorkflowInstanceDto>> GetActiveInstancesAsync()
    {
        try
        {
            return await _instanceRepository.GetActiveInstancesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active workflow instances");
            throw;
        }
    }

    public async Task<bool> CancelInstanceAsync(Guid instanceId, string reason)
    {
        try
        {
            var success = await _instanceRepository.UpdateInstanceStatusAsync(instanceId, WorkflowInstanceStatus.Cancelled);
            
            if (success)
            {
                // Add execution log
                await _instanceRepository.AddExecutionLogAsync(
                    instanceId,
                    "System",
                    "System",
                    NodeType.ServiceNode,
                    LogLevel.Warning,
                    $"Workflow instance cancelled: {reason}"
                );
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling workflow instance {InstanceId}", instanceId);
            return false;
        }
    }

    public async Task<bool> SuspendInstanceAsync(Guid instanceId)
    {
        try
        {
            return await _instanceRepository.UpdateInstanceStatusAsync(instanceId, WorkflowInstanceStatus.Suspended);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error suspending workflow instance {InstanceId}", instanceId);
            return false;
        }
    }

    public async Task<bool> ResumeInstanceAsync(Guid instanceId)
    {
        try
        {
            return await _instanceRepository.UpdateInstanceStatusAsync(instanceId, WorkflowInstanceStatus.Running);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resuming workflow instance {InstanceId}", instanceId);
            return false;
        }
    }

    public async Task<List<WorkflowInstanceLogDto>> GetInstanceLogsAsync(Guid instanceId)
    {
        try
        {
            return await _instanceRepository.GetInstanceLogsAsync(instanceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving logs for workflow instance {InstanceId}", instanceId);
            throw;
        }
    }

    public async Task<bool> RetryInstanceAsync(Guid instanceId)
    {
        try
        {
            var success = await _instanceRepository.UpdateInstanceStatusAsync(instanceId, WorkflowInstanceStatus.Running);
            
            if (success)
            {
                await _instanceRepository.IncrementRetryCountAsync(instanceId);

                // Add execution log
                await _instanceRepository.AddExecutionLogAsync(
                    instanceId,
                    "System",
                    "System",
                    NodeType.ServiceNode,
                    LogLevel.Information,
                    "Workflow instance retry initiated"
                );
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrying workflow instance {InstanceId}", instanceId);
            return false;
        }
    }

    public async Task<WorkflowInstanceDto> TakeActionAsync(Guid workflowDefinitionId, string applicationId, string action, string actedBy)
    {
        // Find active instance for this workflow/app, or start a new one
        var active = (await _instanceRepository.GetActiveInstancesAsync())
            .FirstOrDefault(i => i.WorkflowDefinitionId == workflowDefinitionId && i.ApplicationId == applicationId);

        if (active == null)
        {
            var instanceId = await StartWorkflowAsync(workflowDefinitionId, applicationId, new Dictionary<string, object>(), actedBy);
            active = await _instanceRepository.GetInstanceAsync(instanceId) ?? throw new InvalidOperationException("Failed to start instance");
        }

        // Ensure we have latest with definition
        active = await _instanceRepository.GetInstanceAsync(active.Id) ?? throw new InvalidOperationException("Instance not found");

        // Resolve current node; if not set, move from Start to first outgoing
        var currentNodeId = active.CurrentNodeId;
        if (string.IsNullOrWhiteSpace(currentNodeId))
        {
            var start = active.WorkflowDefinition?.Nodes?.FirstOrDefault(n => n.Type == NodeType.StartNode || n.IsStartNode);
            if (start != null)
            {
                await _instanceRepository.UpdateCurrentNodeAsync(active.Id, start.NodeId);
                await _instanceRepository.AddExecutionLogAsync(active.Id, start.NodeId, start.Name, NodeType.StartNode, LogLevel.Information, "Entered start node");

                var firstEdge = active.WorkflowDefinition?.Edges?.FirstOrDefault(e => e.SourceNodeId == start.NodeId);
                var nextNode = active.WorkflowDefinition?.Nodes?.FirstOrDefault(n => n.NodeId == firstEdge?.TargetNodeId);
                if (nextNode != null)
                {
                    await _instanceRepository.UpdateCurrentNodeAsync(active.Id, nextNode.NodeId);
                    await _instanceRepository.AddExecutionLogAsync(active.Id, nextNode.NodeId, nextNode.Name, nextNode.Type, LogLevel.Information, $"Moved to node: {nextNode.Name}");
                    currentNodeId = nextNode.NodeId;
                }
            }
        }

        // Reload after potential current node updates
        active = await _instanceRepository.GetInstanceAsync(active.Id) ?? throw new InvalidOperationException("Instance not found");
        var current = active.WorkflowDefinition?.Nodes?.FirstOrDefault(n => n.NodeId == (currentNodeId ?? active.CurrentNodeId));

        // If current is actionable, ensure a task exists then complete it with the action
        if (current != null && (current.Type == NodeType.TaskNode || current.Type == NodeType.ApprovalNode))
        {
            var existingTask = active.Tasks.FirstOrDefault(t => t.NodeId == current.NodeId && (t.Status == FlowMaster.Shared.DTOs.TaskStatus.Pending || t.Status == FlowMaster.Shared.DTOs.TaskStatus.InProgress));
            if (existingTask == null)
            {
                // Try to assign a user based on node configuration
                var userAssignment = await _userAssignmentService.AssignUserToTaskAsync(workflowDefinitionId, applicationId, current.NodeId);
                
                // Create the task with user assignment if available
                var taskCreated = await _instanceRepository.CreateTaskAsync(
                    active.Id, 
                    current.NodeId, 
                    current.Name, 
                    current.Name, 
                    TaskPriority.Normal,
                    userAssignment?.UserId,
                    userAssignment?.Username ?? "System",
                    userAssignment?.AssignmentType ?? TaskAssignmentType.Automatic,
                    userAssignment?.AssignmentReason
                );
                
                if (!taskCreated)
                {
                    throw new InvalidOperationException($"Failed to create task for node {current.NodeId}");
                }
                
                // Reload the instance to get the newly created task
                active = await _instanceRepository.GetInstanceAsync(active.Id) ?? throw new InvalidOperationException("Instance not found after task creation");
            }

            var result = new Dictionary<string, object> { { "result", action } };
            await CompleteTaskAsync(active.Id, current.NodeId, result, actedBy);

            // Move along edge matching the action label, if present
            var matchedEdge = active.WorkflowDefinition?.Edges?.FirstOrDefault(e => e.SourceNodeId == current.NodeId && string.Equals(e.Label, action, StringComparison.OrdinalIgnoreCase));
            if (matchedEdge != null)
            {
                var target = active.WorkflowDefinition?.Nodes?.FirstOrDefault(n => n.NodeId == matchedEdge.TargetNodeId);
                if (target != null)
                {
                    await _instanceRepository.UpdateCurrentNodeAsync(active.Id, target.NodeId);
                    await _instanceRepository.AddExecutionLogAsync(active.Id, target.NodeId, target.Name, target.Type, LogLevel.Information, $"Moved to node: {target.Name} via action '{action}'");
                    if (target.Type == NodeType.EndNode || target.IsEndNode)
                    {
                        await _instanceRepository.UpdateInstanceStatusAsync(active.Id, WorkflowInstanceStatus.Completed);
                    }
                }
            }
        }
        else
        {
            throw new InvalidOperationException("No actionable task found for this instance");
        }

        return await _instanceRepository.GetInstanceAsync(active.Id) ?? throw new InvalidOperationException("Instance not found after action");
    }
}
