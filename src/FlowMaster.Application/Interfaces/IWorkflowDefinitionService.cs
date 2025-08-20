using FlowMaster.Shared.DTOs;

namespace FlowMaster.Application.Interfaces;

public interface IWorkflowDefinitionService
{
    Task<WorkflowDefinitionDto> CreateAsync(CreateWorkflowDefinitionDto dto, string createdBy);
    Task<WorkflowDefinitionDto> GetByIdAsync(Guid id);
    Task<List<WorkflowDefinitionDto>> GetAllAsync(string? category = null, WorkflowStatus? status = null);
    Task<WorkflowDefinitionDto> UpdateAsync(Guid id, UpdateWorkflowDefinitionDto dto, string updatedBy);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> PublishAsync(Guid id, string publishedBy);
    Task<bool> ArchiveAsync(Guid id, string archivedBy);
    Task<bool> ValidateAsync(Guid id);
    Task<WorkflowDefinitionDto> CreateVersionAsync(Guid id, string createdBy);
}
