using FlowMaster.Domain.Entities;

namespace FlowMaster.Application.Interfaces;

public interface IServiceExecutionRepository
{
    Task<ServiceExecutionResult> CreateAsync(ServiceExecutionResult executionResult);
    Task<ServiceExecutionResult?> GetByIdAsync(Guid id);
    Task<List<ServiceExecutionResult>> GetByWorkflowInstanceAsync(Guid workflowInstanceId);
    Task<List<ServiceExecutionResult>> GetByNodeIdAsync(Guid workflowInstanceId, string nodeId);
    Task<ServiceExecutionResult> UpdateAsync(ServiceExecutionResult executionResult);
    Task<bool> DeleteAsync(Guid id);
    Task<List<ServiceExecutionResult>> GetRecentExecutionsAsync(int count = 100);
    Task<List<ServiceExecutionResult>> GetFailedExecutionsAsync(DateTime? since = null);
}
