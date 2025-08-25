using FlowMaster.Domain.Entities;

namespace FlowMaster.Application.Interfaces;

public interface IServiceConfigurationRepository
{
    Task<ServiceConfiguration> CreateAsync(ServiceConfiguration serviceConfiguration);
    Task<ServiceConfiguration?> GetByIdAsync(Guid id);
    Task<List<ServiceConfiguration>> GetAllAsync();
    Task<List<ServiceConfiguration>> GetByTypeAsync(FlowMaster.Domain.Entities.ServiceType type);
    Task<List<ServiceConfiguration>> GetActiveAsync();
    Task<ServiceConfiguration?> GetByNameAsync(string name);
    Task<ServiceConfiguration> UpdateAsync(ServiceConfiguration serviceConfiguration);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<bool> ExistsByNameAsync(string name);
}
