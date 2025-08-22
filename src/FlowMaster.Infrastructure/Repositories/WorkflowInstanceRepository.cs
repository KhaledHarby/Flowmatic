using FlowMaster.Application.Interfaces;
using FlowMaster.Infrastructure.Data;
using FlowMaster.Shared.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using LogLevel = FlowMaster.Shared.DTOs.LogLevel;

namespace FlowMaster.Infrastructure.Repositories;

public class WorkflowInstanceRepository : IWorkflowInstanceRepository
{
    private readonly FlowMasterDbContext _context;
    private readonly ILogger<WorkflowInstanceRepository> _logger;

    public WorkflowInstanceRepository(FlowMasterDbContext context, ILogger<WorkflowInstanceRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Guid> CreateInstanceAsync(Guid workflowDefinitionId, string applicationId, Dictionary<string, object> variables, string? startedBy = null)
    {
        var instance = new Domain.Entities.WorkflowInstance
        {
            Id = Guid.NewGuid(),
            WorkflowDefinitionId = workflowDefinitionId,
            ApplicationId = applicationId,
            Status = Domain.Entities.WorkflowInstanceStatus.Running,
            Variables = variables,
            StartedAt = DateTime.UtcNow,
            LastActivityAt = DateTime.UtcNow,
            StartedBy = startedBy ?? "System",
            RetryCount = 0,
            MaxRetries = 3
        };

        _context.WorkflowInstances.Add(instance);
        await _context.SaveChangesAsync();

        return instance.Id;
    }

    public async Task<bool> UpdateInstanceStatusAsync(Guid instanceId, WorkflowInstanceStatus status)
    {
        var instance = await _context.WorkflowInstances.FindAsync(instanceId);
        if (instance == null) return false;

        instance.Status = (Domain.Entities.WorkflowInstanceStatus)status;
        instance.LastActivityAt = DateTime.UtcNow;
        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            // Reload and retry once
            var fresh = await _context.WorkflowInstances.AsNoTracking().FirstOrDefaultAsync(i => i.Id == instanceId);
            if (fresh == null) return false;
            fresh.Status = (Domain.Entities.WorkflowInstanceStatus)status;
            fresh.LastActivityAt = DateTime.UtcNow;
            _context.Entry(fresh).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return true;
        }
    }

    public async Task<bool> UpdateCurrentNodeAsync(Guid instanceId, string nodeId)
    {
        var instance = await _context.WorkflowInstances.FindAsync(instanceId);
        if (instance == null) return false;

        instance.CurrentNodeId = nodeId;
        instance.LastActivityAt = DateTime.UtcNow;
        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            var fresh = await _context.WorkflowInstances.AsNoTracking().FirstOrDefaultAsync(i => i.Id == instanceId);
            if (fresh == null) return false;
            fresh.CurrentNodeId = nodeId;
            fresh.LastActivityAt = DateTime.UtcNow;
            _context.Entry(fresh).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return true;
        }
    }

    public async Task<bool> AddExecutionLogAsync(Guid instanceId, string nodeId, string nodeName, NodeType nodeType, LogLevel level, string message, string? data = null, string? executedBy = null, bool isError = false, string? errorDetails = null)
    {
        var log = new Domain.Entities.WorkflowInstanceLog
        {
            Id = Guid.NewGuid(),
            WorkflowInstanceId = instanceId,
            NodeId = nodeId,
            NodeName = nodeName,
            NodeType = (Domain.Entities.NodeType)nodeType,
            Level = (Domain.Entities.LogLevel)level,
            Message = message,
            Data = data,
            Timestamp = DateTime.UtcNow,
            ExecutedBy = executedBy,
            IsError = isError,
            ErrorDetails = errorDetails
        };

        _context.WorkflowInstanceLogs.Add(log);
        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            // Logs are append-only; retry once
            await _context.SaveChangesAsync();
            return true;
        }
    }

    public async Task<bool> CompleteTaskAsync(Guid instanceId, string nodeId, Dictionary<string, object> result, string completedBy)
    {
        var instance = await _context.WorkflowInstances
            .Include(i => i.Tasks)
            .FirstOrDefaultAsync(i => i.Id == instanceId);

        if (instance == null) return false;

        var task = instance.Tasks?.FirstOrDefault(t => t.NodeId == nodeId);
        if (task == null) return false;

        task.Status = Domain.Entities.TaskStatus.Completed;
        task.CompletedAt = DateTime.UtcNow;
        task.CompletedBy = completedBy;
        task.Result = System.Text.Json.JsonSerializer.Serialize(result);

        instance.LastActivityAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            // Re-fetch and retry
            instance = await _context.WorkflowInstances
                .Include(i => i.Tasks)
                .FirstOrDefaultAsync(i => i.Id == instanceId);
            var task2 = instance?.Tasks?.FirstOrDefault(t => t.NodeId == nodeId);
            if (task2 == null) return false;
            task2.Status = Domain.Entities.TaskStatus.Completed;
            task2.CompletedAt = DateTime.UtcNow;
            task2.CompletedBy = completedBy;
            task2.Result = System.Text.Json.JsonSerializer.Serialize(result);
            await _context.SaveChangesAsync();
            return true;
        }
    }

    public async Task<bool> CreateTaskAsync(Guid instanceId, string nodeId, string title, string description, TaskPriority priority, Guid? assignedToUserId = null, string assignedTo = "System", TaskAssignmentType assignmentType = TaskAssignmentType.Automatic, string? assignmentNotes = null)
    {
        try
        {
            var exists = await _context.WorkflowInstances.AsNoTracking().AnyAsync(i => i.Id == instanceId);
            if (!exists)
            {
                _logger.LogWarning("Instance {InstanceId} not found when creating task", instanceId);
                return false;
            }

            var safeTitle = string.IsNullOrWhiteSpace(title) ? nodeId : title;
            var safeDescription = description ?? string.Empty;
            var task = new Domain.Entities.WorkflowTask
            {
                Id = Guid.NewGuid(),
                TaskId = Guid.NewGuid().ToString(),
                WorkflowInstanceId = instanceId,
                Title = safeTitle,
                Description = safeDescription,
                Status = Domain.Entities.TaskStatus.Pending,
                Priority = (Domain.Entities.TaskPriority)priority,
                CreatedAt = DateTime.UtcNow,
                NodeId = nodeId,
                AssignedToUserId = assignedToUserId,
                AssignedTo = assignedTo,
                AssignedAt = assignedToUserId.HasValue ? DateTime.UtcNow : null,
                AssignmentType = (Domain.Entities.TaskAssignmentType)assignmentType,
                AssignmentNotes = assignmentNotes
            };

            _context.WorkflowTasks.Add(task);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Created task {TaskId} for instance {InstanceId} at node {NodeId} assigned to {AssignedTo}", 
                task.Id, instanceId, nodeId, assignedTo);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task for instance {InstanceId} at node {NodeId}", instanceId, nodeId);
            return false;
        }
    }

    public async Task<WorkflowInstanceDto?> GetInstanceAsync(Guid instanceId)
    {
        var instance = await _context.WorkflowInstances
            .Include(i => i.WorkflowDefinition)
            .ThenInclude(w => w.Nodes)
            .Include(i => i.WorkflowDefinition)
            .ThenInclude(w => w.Edges)
            .Include(i => i.Tasks)
            .Include(i => i.ExecutionLog)
            .FirstOrDefaultAsync(i => i.Id == instanceId);

        if (instance == null) return null;

        return MapToDto(instance);
    }

    public async Task<List<WorkflowInstanceDto>> GetActiveInstancesAsync()
    {
        var instances = await _context.WorkflowInstances
            .Include(i => i.WorkflowDefinition)
            .Include(i => i.Tasks)
            .Include(i => i.ExecutionLog)
            .Where(i => i.Status != Domain.Entities.WorkflowInstanceStatus.Completed && 
                       i.Status != Domain.Entities.WorkflowInstanceStatus.Cancelled)
            .ToListAsync();

        return instances.Select(MapToDto).ToList();
    }

    public async Task<List<WorkflowInstanceLogDto>> GetInstanceLogsAsync(Guid instanceId)
    {
        var logs = await _context.WorkflowInstanceLogs
            .Where(l => l.WorkflowInstanceId == instanceId)
            .OrderBy(l => l.Timestamp)
            .ToListAsync();

        return logs.Select(log => new WorkflowInstanceLogDto
        {
            Id = log.Id,
            NodeId = log.NodeId,
            NodeName = log.NodeName,
            NodeType = (NodeType)log.NodeType,
            Level = (LogLevel)log.Level,
            Message = log.Message,
            Data = log.Data,
            Timestamp = log.Timestamp,
            ExecutedBy = log.ExecutedBy,
            Duration = log.Duration,
            IsError = log.IsError,
            ErrorDetails = log.ErrorDetails
        }).ToList();
    }

    public async Task<bool> IncrementRetryCountAsync(Guid instanceId)
    {
        var instance = await _context.WorkflowInstances.FindAsync(instanceId);
        if (instance == null) return false;

        instance.RetryCount++;
        instance.LastActivityAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    private WorkflowInstanceDto MapToDto(Domain.Entities.WorkflowInstance instance)
    {
        return new WorkflowInstanceDto
        {
            Id = instance.Id,
            WorkflowDefinitionId = instance.WorkflowDefinitionId,
            ApplicationId = instance.ApplicationId,
            Status = (WorkflowInstanceStatus)instance.Status,
            CurrentNodeId = instance.CurrentNodeId,
            Variables = instance.Variables,
            StartedAt = instance.StartedAt,
            CompletedAt = instance.CompletedAt,
            LastActivityAt = instance.LastActivityAt,
            StartedBy = instance.StartedBy,
            ErrorMessage = instance.ErrorMessage,
            RetryCount = instance.RetryCount,
            MaxRetries = instance.MaxRetries,
            WorkflowDefinition = instance.WorkflowDefinition != null ? new WorkflowDefinitionDto
            {
                Id = instance.WorkflowDefinition.Id,
                Name = instance.WorkflowDefinition.Name,
                Description = instance.WorkflowDefinition.Description,
                Category = instance.WorkflowDefinition.Category,
                DefinitionJson = instance.WorkflowDefinition.DefinitionJson,
                Status = (WorkflowStatus)instance.WorkflowDefinition.Status,
                Version = instance.WorkflowDefinition.Version,
                CreatedBy = instance.WorkflowDefinition.CreatedBy,
                UpdatedBy = instance.WorkflowDefinition.UpdatedBy,
                CreatedAt = instance.WorkflowDefinition.CreatedAt,
                UpdatedAt = instance.WorkflowDefinition.UpdatedAt,
                Nodes = instance.WorkflowDefinition.Nodes?.Select(n => new WorkflowNodeDto
                {
                    Id = n.Id,
                    NodeId = n.NodeId,
                    Name = n.Name,
                    Type = (NodeType)n.Type,
                    Configuration = n.Configuration
                }).ToList() ?? new List<WorkflowNodeDto>(),
                Edges = instance.WorkflowDefinition.Edges?.Select(e => new WorkflowEdgeDto
                {
                    Id = e.Id,
                    EdgeId = e.EdgeId,
                    SourceNodeId = e.SourceNodeId,
                    TargetNodeId = e.TargetNodeId,
                    Label = e.Label,
                    Condition = e.Condition
                }).ToList() ?? new List<WorkflowEdgeDto>()
            } : null,
            Tasks = instance.Tasks?.Select(t => new WorkflowTaskDto
            {
                Id = t.Id,
                TaskId = t.TaskId,
                Title = t.Title,
                Description = t.Description,
                Status = (FlowMaster.Shared.DTOs.TaskStatus)t.Status,
                Priority = (TaskPriority)t.Priority,
                AssignedTo = t.AssignedTo,
                CreatedAt = t.CreatedAt,
                DueDate = t.DueDate,
                CompletedAt = t.CompletedAt,
                CompletedBy = t.CompletedBy,
                Result = t.Result,
                NodeId = t.NodeId
            }).ToList() ?? new List<WorkflowTaskDto>(),
            ExecutionLog = instance.ExecutionLog?.Select(l => new WorkflowInstanceLogDto
            {
                Id = l.Id,
                NodeId = l.NodeId,
                NodeName = l.NodeName,
                NodeType = (NodeType)l.NodeType,
                Level = (LogLevel)l.Level,
                Message = l.Message,
                Data = l.Data,
                Timestamp = l.Timestamp,
                ExecutedBy = l.ExecutedBy,
                Duration = l.Duration,
                IsError = l.IsError,
                ErrorDetails = l.ErrorDetails
            }).ToList() ?? new List<WorkflowInstanceLogDto>()
        };
    }
}
