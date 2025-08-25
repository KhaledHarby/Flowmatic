using FlowMaster.Shared.DTOs;

namespace FlowMaster.Application.Interfaces;

public interface IServiceConfigurationService
{
    Task<ServiceConfigurationDto> CreateAsync(CreateServiceConfigurationDto dto, string createdBy);
    Task<ServiceConfigurationDto> GetByIdAsync(Guid id);
    Task<List<ServiceConfigurationDto>> GetAllAsync(ServiceType? type = null, bool? isActive = null);
    Task<ServiceConfigurationDto> UpdateAsync(Guid id, UpdateServiceConfigurationDto dto, string updatedBy);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ActivateAsync(Guid id, string activatedBy);
    Task<bool> DeactivateAsync(Guid id, string deactivatedBy);
    Task<ServiceConfigurationDto> GetByNameAsync(string name);
    Task<List<ServiceConfigurationDto>> GetByTypeAsync(FlowMaster.Shared.DTOs.ServiceType type);
}
