using Microsoft.AspNetCore.Mvc;
using FlowMaster.Application.Interfaces;
using FlowMaster.Shared.DTOs;

namespace FlowMaster.API.Controllers;

[ApiController]
[Route("api/applications")]
public class ApplicationStatusController : ControllerBase
{
    private readonly IApplicationStatusService _applicationStatusService;
    private readonly ILogger<ApplicationStatusController> _logger;

    public ApplicationStatusController(
        IApplicationStatusService applicationStatusService,
        ILogger<ApplicationStatusController> logger)
    {
        _applicationStatusService = applicationStatusService;
        _logger = logger;
    }

    /// <summary>
    /// Get application status by application ID
    /// </summary>
    [HttpGet("{applicationId}/status")]
    public async Task<ActionResult<ApplicationStatusDto>> GetStatus(string applicationId)
    {
        try
        {
            var result = await _applicationStatusService.GetByApplicationIdAsync(applicationId);
            if (result == null)
                return NotFound();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving status for application {ApplicationId}", applicationId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Update application status
    /// </summary>
    [HttpPut("{applicationId}/status")]
    public async Task<ActionResult<ApplicationStatusDto>> UpdateStatus(string applicationId, [FromBody] UpdateApplicationStatusDto dto)
    {
        try
        {
            var result = await _applicationStatusService.UpdateStatusAsync(applicationId, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for application {ApplicationId}", applicationId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get status history for an application
    /// </summary>
    [HttpGet("{applicationId}/history")]
    public async Task<ActionResult<List<ApplicationStatusDto>>> GetHistory(string applicationId)
    {
        try
        {
            var result = await _applicationStatusService.GetStatusHistoryAsync(applicationId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving history for application {ApplicationId}", applicationId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Bulk update application statuses
    /// </summary>
    [HttpPost("bulk-status")]
    public async Task<ActionResult> BulkUpdateStatus([FromBody] BulkUpdateApplicationStatusDto dto)
    {
        try
        {
            var result = await _applicationStatusService.BulkUpdateStatusAsync(dto);
            if (!result)
                return BadRequest(new { error = "Failed to update one or more applications" });

            return Ok(new { message = "Bulk status update completed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing bulk status update");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get applications by status
    /// </summary>
    [HttpGet("by-status/{status}")]
    public async Task<ActionResult<List<ApplicationStatusDto>>> GetByStatus(string status)
    {
        try
        {
            var result = await _applicationStatusService.GetByStatusAsync(status);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving applications by status {Status}", status);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get applications by workflow instance
    /// </summary>
    [HttpGet("by-workflow/{workflowInstanceId}")]
    public async Task<ActionResult<List<ApplicationStatusDto>>> GetByWorkflowInstance(Guid workflowInstanceId)
    {
        try
        {
            var result = await _applicationStatusService.GetByWorkflowInstanceAsync(workflowInstanceId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving applications by workflow instance {WorkflowInstanceId}", workflowInstanceId);
            return BadRequest(new { error = ex.Message });
        }
    }
}
