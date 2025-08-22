using FlowMaster.Shared.DTOs;

namespace FlowMaster.Application.Interfaces;

public interface IWorkflowInstanceRepository
{
    Task<Guid> CreateInstanceAsync(Guid workflowDefinitionId, string applicationId, Dictionary<string, object> variables, string? startedBy = null);
    Task<bool> UpdateInstanceStatusAsync(Guid instanceId, WorkflowInstanceStatus status);
    Task<bool> UpdateCurrentNodeAsync(Guid instanceId, string nodeId);
    Task<bool> AddExecutionLogAsync(Guid instanceId, string nodeId, string nodeName, NodeType nodeType, LogLevel level, string message, string? data = null, string? executedBy = null, bool isError = false, string? errorDetails = null);
    Task<bool> CompleteTaskAsync(Guid instanceId, string nodeId, Dictionary<string, object> result, string completedBy);
    Task<bool> CreateTaskAsync(Guid instanceId, string nodeId, string title, string description, TaskPriority priority, Guid? assignedToUserId = null, string assignedTo = "System", TaskAssignmentType assignmentType = TaskAssignmentType.Automatic, string? assignmentNotes = null);
    Task<WorkflowInstanceDto?> GetInstanceAsync(Guid instanceId);
    Task<List<WorkflowInstanceDto>> GetActiveInstancesAsync();
    Task<List<WorkflowInstanceLogDto>> GetInstanceLogsAsync(Guid instanceId);
    Task<bool> IncrementRetryCountAsync(Guid instanceId);
}
