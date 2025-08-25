using FlowMaster.Application.Interfaces;
using FlowMaster.Domain.Entities;
using FlowMaster.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FlowMaster.Infrastructure.Repositories;

public class ServiceConfigurationRepository : IServiceConfigurationRepository
{
    private readonly FlowMasterDbContext _context;
    private readonly ILogger<ServiceConfigurationRepository> _logger;

    public ServiceConfigurationRepository(
        FlowMasterDbContext context,
        ILogger<ServiceConfigurationRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ServiceConfiguration> CreateAsync(ServiceConfiguration serviceConfiguration)
    {
        try
        {
            _context.ServiceConfigurations.Add(serviceConfiguration);
            await _context.SaveChangesAsync();
            return serviceConfiguration;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating service configuration {ServiceName}", serviceConfiguration.Name);
            throw;
        }
    }

    public async Task<ServiceConfiguration?> GetByIdAsync(Guid id)
    {
        try
        {
            return await _context.ServiceConfigurations
                .FirstOrDefaultAsync(s => s.Id == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service configuration by ID {ServiceId}", id);
            throw;
        }
    }

    public async Task<List<ServiceConfiguration>> GetAllAsync()
    {
        try
        {
            return await _context.ServiceConfigurations
                .OrderBy(s => s.Name)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all service configurations");
            throw;
        }
    }

    public async Task<List<ServiceConfiguration>> GetByTypeAsync(FlowMaster.Domain.Entities.ServiceType type)
    {
        try
        {
            return await _context.ServiceConfigurations
                .Where(s => s.Type == type)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service configurations by type {ServiceType}", type);
            throw;
        }
    }

    public async Task<List<ServiceConfiguration>> GetActiveAsync()
    {
        try
        {
            return await _context.ServiceConfigurations
                .Where(s => s.IsActive)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active service configurations");
            throw;
        }
    }

    public async Task<ServiceConfiguration?> GetByNameAsync(string name)
    {
        try
        {
            return await _context.ServiceConfigurations
                .FirstOrDefaultAsync(s => s.Name == name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service configuration by name {ServiceName}", name);
            throw;
        }
    }

    public async Task<ServiceConfiguration> UpdateAsync(ServiceConfiguration serviceConfiguration)
    {
        try
        {
            _context.ServiceConfigurations.Update(serviceConfiguration);
            await _context.SaveChangesAsync();
            return serviceConfiguration;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating service configuration {ServiceId}", serviceConfiguration.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        try
        {
            var serviceConfiguration = await _context.ServiceConfigurations.FindAsync(id);
            if (serviceConfiguration == null)
                return false;

            _context.ServiceConfigurations.Remove(serviceConfiguration);
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting service configuration {ServiceId}", id);
            throw;
        }
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        try
        {
            return await _context.ServiceConfigurations.AnyAsync(s => s.Id == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking existence of service configuration {ServiceId}", id);
            throw;
        }
    }

    public async Task<bool> ExistsByNameAsync(string name)
    {
        try
        {
            return await _context.ServiceConfigurations.AnyAsync(s => s.Name == name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking existence of service configuration by name {ServiceName}", name);
            throw;
        }
    }
}
