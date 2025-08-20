using Microsoft.AspNetCore.Mvc;
using FlowMaster.Application.Interfaces;
using FlowMaster.Shared.DTOs;

namespace FlowMaster.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkflowInstancesController : ControllerBase
{
    private readonly IWorkflowEngine _workflowEngine;
    private readonly ILogger<WorkflowInstancesController> _logger;

    public WorkflowInstancesController(
        IWorkflowEngine workflowEngine,
        ILogger<WorkflowInstancesController> logger)
    {
        _workflowEngine = workflowEngine;
        _logger = logger;
    }

    /// <summary>
    /// Start a new workflow instance
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<WorkflowInstanceDto>> Start([FromBody] CreateWorkflowInstanceDto dto)
    {
        try
        {
            var startedBy = User.Identity?.Name ?? "System";
            var instanceId = await _workflowEngine.StartWorkflowAsync(
                dto.WorkflowDefinitionId, 
                dto.ApplicationId, 
                dto.Variables, 
                startedBy);

            var result = await _workflowEngine.GetInstanceAsync(instanceId);
            return CreatedAtAction(nameof(GetById), new { id = instanceId }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting workflow instance");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get all active workflow instances
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<WorkflowInstanceDto>>> GetAll()
    {
        try
        {
            var result = await _workflowEngine.GetActiveInstancesAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow instances");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get workflow instance by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkflowInstanceDto>> GetById(Guid id)
    {
        try
        {
            var result = await _workflowEngine.GetInstanceAsync(id);
            if (result == null)
                return NotFound();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow instance {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Complete a task in a workflow instance
    /// </summary>
    [HttpPost("{id}/complete-task")]
    public async Task<ActionResult> CompleteTask(Guid id, [FromBody] CompleteTaskDto dto)
    {
        try
        {
            var result = await _workflowEngine.CompleteTaskAsync(id, dto.TaskId, 
                new Dictionary<string, object> { { "result", dto.Result } }, dto.CompletedBy);
            
            if (!result)
                return NotFound();

            return Ok(new { message = "Task completed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing task in workflow instance {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Cancel a workflow instance
    /// </summary>
    [HttpPost("{id}/cancel")]
    public async Task<ActionResult> Cancel(Guid id, [FromBody] CancelInstanceDto dto)
    {
        try
        {
            var result = await _workflowEngine.CancelInstanceAsync(id, dto.Reason);
            if (!result)
                return NotFound();

            return Ok(new { message = "Workflow instance cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling workflow instance {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Suspend a workflow instance
    /// </summary>
    [HttpPost("{id}/suspend")]
    public async Task<ActionResult> Suspend(Guid id)
    {
        try
        {
            var result = await _workflowEngine.SuspendInstanceAsync(id);
            if (!result)
                return NotFound();

            return Ok(new { message = "Workflow instance suspended successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error suspending workflow instance {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Resume a workflow instance
    /// </summary>
    [HttpPost("{id}/resume")]
    public async Task<ActionResult> Resume(Guid id)
    {
        try
        {
            var result = await _workflowEngine.ResumeInstanceAsync(id);
            if (!result)
                return NotFound();

            return Ok(new { message = "Workflow instance resumed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resuming workflow instance {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get execution logs for a workflow instance
    /// </summary>
    [HttpGet("{id}/logs")]
    public async Task<ActionResult<List<WorkflowInstanceLogDto>>> GetLogs(Guid id)
    {
        try
        {
            var result = await _workflowEngine.GetInstanceLogsAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving logs for workflow instance {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Retry a failed workflow instance
    /// </summary>
    [HttpPost("{id}/retry")]
    public async Task<ActionResult> Retry(Guid id)
    {
        try
        {
            var result = await _workflowEngine.RetryInstanceAsync(id);
            if (!result)
                return NotFound();

            return Ok(new { message = "Workflow instance retry initiated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrying workflow instance {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class CancelInstanceDto
{
    public string Reason { get; set; } = string.Empty;
}
