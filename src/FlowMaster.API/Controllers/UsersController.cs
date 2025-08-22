using Microsoft.AspNetCore.Mvc;
using FlowMaster.Application.Interfaces;
using FlowMaster.Shared.DTOs;

namespace FlowMaster.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    #region User Management

    /// <summary>
    /// Create a new user
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto dto)
    {
        try
        {
            var result = await _userService.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get all users with optional filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll(
        [FromQuery] string? department,
        [FromQuery] UserStatus? status)
    {
        try
        {
            var result = await _userService.GetAllUsersAsync(department, status);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(Guid id)
    {
        try
        {
            var result = await _userService.GetUserByIdAsync(id);
            if (result == null)
                return NotFound();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get user by username
    /// </summary>
    [HttpGet("username/{username}")]
    public async Task<ActionResult<UserDto>> GetByUsername(string username)
    {
        try
        {
            var result = await _userService.GetUserByUsernameAsync(username);
            if (result == null)
                return NotFound();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by username {Username}", username);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Update user
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> Update(Guid id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            var result = await _userService.UpdateUserAsync(id, dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Delete user
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Deactivate user
    /// </summary>
    [HttpPost("{id}/deactivate")]
    public async Task<ActionResult> Deactivate(Guid id)
    {
        try
        {
            var result = await _userService.DeactivateUserAsync(id);
            if (!result)
                return NotFound();

            return Ok(new { message = "User deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating user {UserId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Activate user
    /// </summary>
    [HttpPost("{id}/activate")]
    public async Task<ActionResult> Activate(Guid id)
    {
        try
        {
            var result = await _userService.ActivateUserAsync(id);
            if (!result)
                return NotFound();

            return Ok(new { message = "User activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating user {UserId}", id);
            return BadRequest(new { error = ex.Message });
        }
    }

    #endregion

    #region Task Assignment

    /// <summary>
    /// Assign task to user
    /// </summary>
    [HttpPost("tasks/assign")]
    public async Task<ActionResult> AssignTask([FromBody] AssignTaskDto dto)
    {
        try
        {
            var assignedBy = User.Identity?.Name ?? "System";
            var result = await _userService.AssignTaskAsync(dto, assignedBy);
            
            if (!result)
                return BadRequest(new { error = "Failed to assign task" });

            return Ok(new { message = "Task assigned successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning task {TaskId} to user {UserId}", dto.TaskId, dto.AssignedToUserId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Reassign task to different user
    /// </summary>
    [HttpPost("tasks/reassign")]
    public async Task<ActionResult> ReassignTask([FromBody] ReassignTaskDto dto)
    {
        try
        {
            var reassignedBy = User.Identity?.Name ?? "System";
            var result = await _userService.ReassignTaskAsync(dto, reassignedBy);
            
            if (!result)
                return BadRequest(new { error = "Failed to reassign task" });

            return Ok(new { message = "Task reassigned successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reassigning task {TaskId} to user {UserId}", dto.TaskId, dto.NewAssignedToUserId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Unassign task
    /// </summary>
    [HttpPost("tasks/{taskId}/unassign")]
    public async Task<ActionResult> UnassignTask(Guid taskId)
    {
        try
        {
            var unassignedBy = User.Identity?.Name ?? "System";
            var result = await _userService.UnassignTaskAsync(taskId, unassignedBy);
            
            if (!result)
                return BadRequest(new { error = "Failed to unassign task" });

            return Ok(new { message = "Task unassigned successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unassigning task {TaskId}", taskId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get tasks assigned to a specific user
    /// </summary>
    [HttpGet("{userId}/tasks")]
    public async Task<ActionResult<List<TaskAssignmentDto>>> GetUserTasks(
        Guid userId,
        [FromQuery] FlowMaster.Shared.DTOs.TaskStatus? status)
    {
        try
        {
            var result = await _userService.GetUserTasksAsync(userId, status);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for user {UserId}", userId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get all unassigned tasks
    /// </summary>
    [HttpGet("tasks/unassigned")]
    public async Task<ActionResult<List<TaskAssignmentDto>>> GetUnassignedTasks()
    {
        try
        {
            var result = await _userService.GetUnassignedTasksAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving unassigned tasks");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get task summary for a specific user
    /// </summary>
    [HttpGet("{userId}/tasks/summary")]
    public async Task<ActionResult<UserTaskSummaryDto>> GetUserTaskSummary(Guid userId)
    {
        try
        {
            var result = await _userService.GetUserTaskSummaryAsync(userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task summary for user {UserId}", userId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get task summary for all users
    /// </summary>
    [HttpGet("tasks/summary")]
    public async Task<ActionResult<List<UserTaskSummaryDto>>> GetAllUsersTaskSummary()
    {
        try
        {
            var result = await _userService.GetAllUsersTaskSummaryAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all users task summary");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Complete a task
    /// </summary>
    [HttpPost("tasks/{taskId}/complete")]
    public async Task<ActionResult> CompleteTask(Guid taskId, [FromBody] CompleteTaskRequest request)
    {
        try
        {
            var completedBy = User.Identity?.Name ?? "System";
            var result = await _userService.CompleteTaskAsync(taskId, request.Result, completedBy);
            
            if (!result)
                return BadRequest(new { error = "Failed to complete task" });

            return Ok(new { message = "Task completed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing task {TaskId}", taskId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Cancel a task
    /// </summary>
    [HttpPost("tasks/{taskId}/cancel")]
    public async Task<ActionResult> CancelTask(Guid taskId, [FromBody] CancelTaskRequest request)
    {
        try
        {
            var cancelledBy = User.Identity?.Name ?? "System";
            var result = await _userService.CancelTaskAsync(taskId, request.Reason, cancelledBy);
            
            if (!result)
                return BadRequest(new { error = "Failed to cancel task" });

            return Ok(new { message = "Task cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling task {TaskId}", taskId);
            return BadRequest(new { error = ex.Message });
        }
    }

    #endregion

    #region Task Assignment Strategies

    /// <summary>
    /// Get next available user for task assignment
    /// </summary>
    [HttpGet("next-available")]
    public async Task<ActionResult<Guid?>> GetNextAvailableUser(
        [FromQuery] string? department,
        [FromQuery] string? role)
    {
        try
        {
            var result = await _userService.GetNextAvailableUserAsync(department, role);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting next available user");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get least busy user for task assignment
    /// </summary>
    [HttpGet("least-busy")]
    public async Task<ActionResult<Guid?>> GetLeastBusyUser(
        [FromQuery] string? department,
        [FromQuery] string? role)
    {
        try
        {
            var result = await _userService.GetLeastBusyUserAsync(department, role);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting least busy user");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Auto-assign task to available user
    /// </summary>
    [HttpPost("tasks/{taskId}/auto-assign")]
    public async Task<ActionResult> AutoAssignTask(
        Guid taskId,
        [FromQuery] string? department,
        [FromQuery] string? role)
    {
        try
        {
            var result = await _userService.AutoAssignTaskAsync(taskId, department, role);
            
            if (!result)
                return BadRequest(new { error = "No available users found for assignment" });

            return Ok(new { message = "Task auto-assigned successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error auto-assigning task {TaskId}", taskId);
            return BadRequest(new { error = ex.Message });
        }
    }

    #endregion
}

public class CompleteTaskRequest
{
    public string Result { get; set; } = string.Empty;
}

public class CancelTaskRequest
{
    public string Reason { get; set; } = string.Empty;
}
