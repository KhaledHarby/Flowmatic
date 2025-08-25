using FlowMaster.Application.Interfaces;
using FlowMaster.Domain.Entities;
using FlowMaster.Shared.DTOs;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace FlowMaster.Application.Services;

public class ServiceConfigurationService : IServiceConfigurationService
{
    private readonly IServiceConfigurationRepository _repository;
    private readonly ILogger<ServiceConfigurationService> _logger;

    public ServiceConfigurationService(
        IServiceConfigurationRepository repository,
        ILogger<ServiceConfigurationService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ServiceConfigurationDto> CreateAsync(CreateServiceConfigurationDto dto, string createdBy)
    {
        try
        {
            // Check if service with same name already exists
            if (await _repository.ExistsByNameAsync(dto.Name))
                throw new InvalidOperationException($"Service configuration with name '{dto.Name}' already exists");

            var entity = new ServiceConfiguration
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Type = (FlowMaster.Domain.Entities.ServiceType)dto.Type,
                Endpoint = dto.Endpoint,
                Method = dto.Method,
                Timeout = dto.Timeout,
                RetryAttempts = dto.RetryAttempts,
                Headers = JsonSerializer.Serialize(dto.Headers),
                Parameters = JsonSerializer.Serialize(dto.Parameters),
                Authentication = JsonSerializer.Serialize(dto.Authentication),
                ValidationSchema = JsonSerializer.Serialize(dto.Validation),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy
            };

            var created = await _repository.CreateAsync(entity);
            return MapToDto(created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating service configuration {ServiceName}", dto.Name);
            throw;
        }
    }

    public async Task<ServiceConfigurationDto> GetByIdAsync(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new InvalidOperationException($"Service configuration with ID {id} not found");

        return MapToDto(entity);
    }

    public async Task<List<ServiceConfigurationDto>> GetAllAsync(FlowMaster.Shared.DTOs.ServiceType? type = null, bool? isActive = null)
    {
        try
        {
            List<ServiceConfiguration> entities;

            if (type.HasValue)
            {
                entities = await _repository.GetByTypeAsync((FlowMaster.Domain.Entities.ServiceType)type.Value);
            }
            else if (isActive.HasValue && isActive.Value)
            {
                entities = await _repository.GetActiveAsync();
            }
            else
            {
                entities = await _repository.GetAllAsync();
            }

            return entities.Select(MapToDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service configurations");
            throw;
        }
    }

    public async Task<ServiceConfigurationDto> UpdateAsync(Guid id, UpdateServiceConfigurationDto dto, string updatedBy)
    {
        try
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                throw new InvalidOperationException($"Service configuration with ID {id} not found");

            // Check if name is being changed and if it conflicts with existing service
            if (entity.Name != dto.Name && await _repository.ExistsByNameAsync(dto.Name))
                throw new InvalidOperationException($"Service configuration with name '{dto.Name}' already exists");

            entity.Name = dto.Name;
            entity.Type = (FlowMaster.Domain.Entities.ServiceType)dto.Type;
            entity.Endpoint = dto.Endpoint;
            entity.Method = dto.Method;
            entity.Timeout = dto.Timeout;
            entity.RetryAttempts = dto.RetryAttempts;
            entity.Headers = JsonSerializer.Serialize(dto.Headers);
            entity.Parameters = JsonSerializer.Serialize(dto.Parameters);
            entity.Authentication = JsonSerializer.Serialize(dto.Authentication);
            entity.ValidationSchema = JsonSerializer.Serialize(dto.Validation);
            entity.IsActive = dto.IsActive;
            entity.UpdatedAt = DateTime.UtcNow;
            entity.UpdatedBy = updatedBy;

            var updated = await _repository.UpdateAsync(entity);
            return MapToDto(updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating service configuration {ServiceId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        try
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            return await _repository.DeleteAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting service configuration {ServiceId}", id);
            throw;
        }
    }

    public async Task<bool> ActivateAsync(Guid id, string activatedBy)
    {
        try
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return false;

            entity.IsActive = true;
            entity.UpdatedAt = DateTime.UtcNow;
            entity.UpdatedBy = activatedBy;

            await _repository.UpdateAsync(entity);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating service configuration {ServiceId}", id);
            throw;
        }
    }

    public async Task<bool> DeactivateAsync(Guid id, string deactivatedBy)
    {
        try
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return false;

            entity.IsActive = false;
            entity.UpdatedAt = DateTime.UtcNow;
            entity.UpdatedBy = deactivatedBy;

            await _repository.UpdateAsync(entity);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating service configuration {ServiceId}", id);
            throw;
        }
    }

    public async Task<ServiceConfigurationDto> GetByNameAsync(string name)
    {
        var entity = await _repository.GetByNameAsync(name);
        if (entity == null)
            throw new InvalidOperationException($"Service configuration with name '{name}' not found");

        return MapToDto(entity);
    }

    public async Task<List<ServiceConfigurationDto>> GetByTypeAsync(FlowMaster.Shared.DTOs.ServiceType type)
    {
        try
        {
            var entities = await _repository.GetByTypeAsync((FlowMaster.Domain.Entities.ServiceType)type);
            return entities.Select(MapToDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service configurations by type {ServiceType}", type);
            throw;
        }
    }

    private ServiceConfigurationDto MapToDto(ServiceConfiguration entity)
    {
        return new ServiceConfigurationDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Type = (FlowMaster.Shared.DTOs.ServiceType)entity.Type,
            Endpoint = entity.Endpoint,
            Method = entity.Method,
            Timeout = entity.Timeout,
            RetryAttempts = entity.RetryAttempts,
            Headers = JsonSerializer.Deserialize<Dictionary<string, string>>(entity.Headers) ?? new(),
            Parameters = JsonSerializer.Deserialize<Dictionary<string, object>>(entity.Parameters) ?? new(),
            Authentication = JsonSerializer.Deserialize<AuthenticationConfig>(entity.Authentication) ?? new(),
            Validation = JsonSerializer.Deserialize<ValidationConfig>(entity.ValidationSchema) ?? new(),
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedBy = entity.UpdatedBy
        };
    }
}
