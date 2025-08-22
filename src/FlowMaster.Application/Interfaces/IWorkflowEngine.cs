using FlowMaster.Shared.DTOs;

namespace FlowMaster.Application.Interfaces;

public interface IWorkflowEngine
{
    Task<Guid> StartWorkflowAsync(Guid workflowDefinitionId, string applicationId, Dictionary<string, object> variables, string? startedBy = null);
    Task<bool> ProcessNodeAsync(Guid instanceId, string nodeId);
    Task<bool> CompleteTaskAsync(Guid instanceId, string nodeId, Dictionary<string, object> result, string completedBy);
    Task<WorkflowInstanceDto> GetInstanceAsync(Guid instanceId);
    Task<List<WorkflowInstanceDto>> GetActiveInstancesAsync();
    Task<bool> CancelInstanceAsync(Guid instanceId, string reason);
    Task<bool> SuspendInstanceAsync(Guid instanceId);
    Task<bool> ResumeInstanceAsync(Guid instanceId);
    Task<List<WorkflowInstanceLogDto>> GetInstanceLogsAsync(Guid instanceId);
    Task<bool> RetryInstanceAsync(Guid instanceId);
    Task<WorkflowInstanceDto> TakeActionAsync(Guid workflowDefinitionId, string applicationId, string action, string actedBy);
}
