using Microsoft.AspNetCore.Mvc;
using FlowMaster.Application.Interfaces;
using FlowMaster.Shared.DTOs;

namespace FlowMaster.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserAssignmentController : ControllerBase
{
    private readonly IUserAssignmentService _userAssignmentService;
    private readonly ILogger<UserAssignmentController> _logger;

    public UserAssignmentController(
        IUserAssignmentService userAssignmentService,
        ILogger<UserAssignmentController> logger)
    {
        _userAssignmentService = userAssignmentService;
        _logger = logger;
    }

    /// <summary>
    /// Assign a user to a workflow task based on node configuration
    /// </summary>
    [HttpPost("assign")]
    public async Task<ActionResult<UserAssignmentResult>> AssignUserToTask([FromBody] AssignUserRequest request)
    {
        try
        {
            var result = await _userAssignmentService.AssignUserToTaskAsync(
                request.WorkflowDefinitionId, 
                request.ApplicationId, 
                request.NodeId);

            if (result == null)
            {
                return NotFound(new { message = "No suitable user found for assignment or no assignees configured" });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning user to task for workflow {WorkflowId}, application {ApplicationId}, node {NodeId}", 
                request.WorkflowDefinitionId, request.ApplicationId, request.NodeId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get available assignees for a specific node
    /// </summary>
    [HttpGet("assignees/{workflowDefinitionId}/{nodeId}")]
    public async Task<ActionResult<List<string>>> GetAvailableAssignees(Guid workflowDefinitionId, string nodeId)
    {
        try
        {
            var assignees = await _userAssignmentService.GetAvailableAssigneesAsync(workflowDefinitionId, nodeId);
            return Ok(assignees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting available assignees for workflow {WorkflowId}, node {NodeId}", 
                workflowDefinitionId, nodeId);
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class AssignUserRequest
{
    public Guid WorkflowDefinitionId { get; set; }
    public string ApplicationId { get; set; } = string.Empty;
    public string NodeId { get; set; } = string.Empty;
}



