using Microsoft.AspNetCore.Mvc;
using FlowMaster.Application.Interfaces;
using FlowMaster.Shared.DTOs;

namespace FlowMaster.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceConfigurationController : ControllerBase
{
    private readonly IServiceConfigurationService _serviceConfigurationService;
    private readonly ILogger<ServiceConfigurationController> _logger;

    public ServiceConfigurationController(
        IServiceConfigurationService serviceConfigurationService,
        ILogger<ServiceConfigurationController> logger)
    {
        _serviceConfigurationService = serviceConfigurationService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new service configuration
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ServiceConfigurationDto>> Create([FromBody] CreateServiceConfigurationDto dto)
    {
        try
        {
            var createdBy = User.Identity?.Name ?? "System";
            var result = await _serviceConfigurationService.CreateAsync(dto, createdBy);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating service configuration");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get all service configurations with optional filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ServiceConfigurationDto>>> GetAll(
        [FromQuery] ServiceType? type,
        [FromQuery] bool? isActive)
    {
        try
        {
            var result = await _serviceConfigurationService.GetAllAsync(type, isActive);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service configurations");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get service configuration by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceConfigurationDto>> GetById(Guid id)
    {
        try
        {
            var result = await _serviceConfigurationService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service configuration {ServiceId}", id);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get service configuration by name
    /// </summary>
    [HttpGet("name/{name}")]
    public async Task<ActionResult<ServiceConfigurationDto>> GetByName(string name)
    {
        try
        {
            var result = await _serviceConfigurationService.GetByNameAsync(name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service configuration by name {ServiceName}", name);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get service configurations by type
    /// </summary>
    [HttpGet("type/{type}")]
    public async Task<ActionResult<List<ServiceConfigurationDto>>> GetByType(ServiceType type)
    {
        try
        {
            var result = await _serviceConfigurationService.GetByTypeAsync(type);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service configurations by type {ServiceType}", type);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Update service configuration
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ServiceConfigurationDto>> Update(Guid id, [FromBody] UpdateServiceConfigurationDto dto)
    {
        try
        {
            var updatedBy = User.Identity?.Name ?? "System";
            var result = await _serviceConfigurationService.UpdateAsync(id, dto, updatedBy);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating service configuration {ServiceId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Delete service configuration
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var success = await _serviceConfigurationService.DeleteAsync(id);
            if (!success)
                return NotFound(new { error = "Service configuration not found" });

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting service configuration {ServiceId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Activate service configuration
    /// </summary>
    [HttpPost("{id}/activate")]
    public async Task<ActionResult> Activate(Guid id)
    {
        try
        {
            var activatedBy = User.Identity?.Name ?? "System";
            var success = await _serviceConfigurationService.ActivateAsync(id, activatedBy);
            if (!success)
                return NotFound(new { error = "Service configuration not found" });

            return Ok(new { message = "Service configuration activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating service configuration {ServiceId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Deactivate service configuration
    /// </summary>
    [HttpPost("{id}/deactivate")]
    public async Task<ActionResult> Deactivate(Guid id)
    {
        try
        {
            var deactivatedBy = User.Identity?.Name ?? "System";
            var success = await _serviceConfigurationService.DeactivateAsync(id, deactivatedBy);
            if (!success)
                return NotFound(new { error = "Service configuration not found" });

            return Ok(new { message = "Service configuration deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating service configuration {ServiceId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }
}
