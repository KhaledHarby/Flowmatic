using Microsoft.AspNetCore.Mvc;
using FlowMaster.Application.Interfaces;
using FlowMaster.Shared.DTOs;

namespace FlowMaster.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkflowDefinitionsController : ControllerBase
{
    private readonly IWorkflowDefinitionService _workflowDefinitionService;
    private readonly ILogger<WorkflowDefinitionsController> _logger;

    public WorkflowDefinitionsController(
        IWorkflowDefinitionService workflowDefinitionService,
        ILogger<WorkflowDefinitionsController> logger)
    {
        _workflowDefinitionService = workflowDefinitionService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new workflow definition
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<WorkflowDefinitionDto>> Create([FromBody] CreateWorkflowDefinitionDto dto)
    {
        try
        {
            var createdBy = User.Identity?.Name ?? "System";
            var result = await _workflowDefinitionService.CreateAsync(dto, createdBy);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating workflow definition");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get all workflow definitions with optional filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<WorkflowDefinitionDto>>> GetAll(
        [FromQuery] string? category,
        [FromQuery] WorkflowStatus? status)
    {
        try
        {
            var result = await _workflowDefinitionService.GetAllAsync(category, status);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow definitions");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get workflow definition by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkflowDefinitionDto>> GetById(Guid id)
    {
        try
        {
            var result = await _workflowDefinitionService.GetByIdAsync(id);
            if (result == null)
                return NotFound();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow definition {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Update workflow definition
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<WorkflowDefinitionDto>> Update(Guid id, [FromBody] UpdateWorkflowDefinitionDto dto)
    {
        try
        {
            var updatedBy = User.Identity?.Name ?? "System";
            var result = await _workflowDefinitionService.UpdateAsync(id, dto, updatedBy);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating workflow definition {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Delete workflow definition
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var result = await _workflowDefinitionService.DeleteAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting workflow definition {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Publish workflow definition
    /// </summary>
    [HttpPost("{id}/publish")]
    public async Task<ActionResult> Publish(Guid id)
    {
        try
        {
            var publishedBy = User.Identity?.Name ?? "System";
            var result = await _workflowDefinitionService.PublishAsync(id, publishedBy);
            if (!result)
                return NotFound();

            return Ok(new { message = "Workflow published successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing workflow definition {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Archive workflow definition
    /// </summary>
    [HttpPost("{id}/archive")]
    public async Task<ActionResult> Archive(Guid id)
    {
        try
        {
            var archivedBy = User.Identity?.Name ?? "System";
            var result = await _workflowDefinitionService.ArchiveAsync(id, archivedBy);
            if (!result)
                return NotFound();

            return Ok(new { message = "Workflow archived successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving workflow definition {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Validate workflow definition
    /// </summary>
    [HttpPost("{id}/validate")]
    public async Task<ActionResult> Validate(Guid id)
    {
        try
        {
            var result = await _workflowDefinitionService.ValidateAsync(id);
            if (!result)
                return BadRequest(new { error = "Workflow validation failed" });

            return Ok(new { message = "Workflow is valid" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating workflow definition {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Create new version of workflow definition
    /// </summary>
    [HttpPost("{id}/version")]
    public async Task<ActionResult<WorkflowDefinitionDto>> CreateVersion(Guid id)
    {
        try
        {
            var createdBy = User.Identity?.Name ?? "System";
            var result = await _workflowDefinitionService.CreateVersionAsync(id, createdBy);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating version for workflow definition {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }
}
