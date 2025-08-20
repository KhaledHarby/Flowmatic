using FlowMaster.Shared.DTOs;

namespace FlowMaster.Application.Interfaces;

public interface IApplicationStatusService
{
    Task<ApplicationStatusDto> GetByApplicationIdAsync(string applicationId);
    Task<ApplicationStatusDto> UpdateStatusAsync(string applicationId, UpdateApplicationStatusDto dto);
    Task<List<ApplicationStatusDto>> GetStatusHistoryAsync(string applicationId);
    Task<bool> BulkUpdateStatusAsync(BulkUpdateApplicationStatusDto dto);
    Task<List<ApplicationStatusDto>> GetByStatusAsync(string status);
    Task<List<ApplicationStatusDto>> GetByWorkflowInstanceAsync(Guid workflowInstanceId);
}
