using FlowMaster.Shared.DTOs;

namespace FlowMaster.Application.Interfaces;

public interface IServiceExecutionService
{
    Task<ServiceExecutionResultDto> ExecuteServiceAsync(ServiceExecutionRequestDto request);
    Task<ServiceExecutionResultDto> ExecuteServiceNodeAsync(Guid workflowInstanceId, string nodeId, Dictionary<string, object> context);
    Task<ServiceExecutionResultDto> GetExecutionResultAsync(Guid executionId);
    Task<List<ServiceExecutionResultDto>> GetExecutionResultsAsync(Guid workflowInstanceId);
    Task<bool> CancelExecutionAsync(Guid executionId);
    Task<bool> RetryExecutionAsync(Guid executionId);
    Task<ServiceExecutionResultDto> TestServiceConfigurationAsync(CreateServiceConfigurationDto config, Dictionary<string, object> testParameters);
}
