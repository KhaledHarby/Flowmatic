using FlowMaster.Shared.DTOs;

namespace FlowMaster.Application.Interfaces;

public interface IWorkflowDefinitionRepository
{
    Task<WorkflowDefinitionDto?> GetByIdAsync(Guid id);
    Task<List<WorkflowDefinitionDto>> GetAllAsync();
    Task<WorkflowDefinitionDto> CreateAsync(CreateWorkflowDefinitionDto dto);
    Task<WorkflowDefinitionDto> UpdateAsync(Guid id, UpdateWorkflowDefinitionDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> PublishAsync(Guid id);
    Task<bool> ArchiveAsync(Guid id);
}
