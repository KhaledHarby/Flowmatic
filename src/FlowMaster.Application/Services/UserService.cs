using FlowMaster.Application.Interfaces;
using FlowMaster.Shared.DTOs;
using Microsoft.Extensions.Logging;

namespace FlowMaster.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository userRepository, ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    #region User Management

    public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
    {
        try
        {
            return await _userRepository.CreateAsync(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            throw;
        }
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id)
    {
        try
        {
            return await _userRepository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", id);
            throw;
        }
    }

    public async Task<UserDto?> GetUserByUsernameAsync(string username)
    {
        try
        {
            return await _userRepository.GetByUsernameAsync(username);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by username {Username}", username);
            throw;
        }
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        try
        {
            return await _userRepository.GetByEmailAsync(email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by email {Email}", email);
            throw;
        }
    }

    public async Task<List<UserDto>> GetAllUsersAsync(string? department = null, UserStatus? status = null)
    {
        try
        {
            return await _userRepository.GetAllAsync(department, status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            throw;
        }
    }

    public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto dto)
    {
        try
        {
            return await _userRepository.UpdateAsync(id, dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        try
        {
            return await _userRepository.DeleteAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            throw;
        }
    }

    public async Task<bool> DeactivateUserAsync(Guid id)
    {
        try
        {
            return await _userRepository.DeactivateAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating user {UserId}", id);
            throw;
        }
    }

    public async Task<bool> ActivateUserAsync(Guid id)
    {
        try
        {
            return await _userRepository.ActivateAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating user {UserId}", id);
            throw;
        }
    }

    #endregion

    #region Task Assignment

    public async Task<bool> AssignTaskAsync(AssignTaskDto dto, string assignedBy)
    {
        try
        {
            return await _userRepository.AssignTaskAsync(dto, assignedBy);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning task {TaskId} to user {UserId}", dto.TaskId, dto.AssignedToUserId);
            throw;
        }
    }

    public async Task<bool> ReassignTaskAsync(ReassignTaskDto dto, string reassignedBy)
    {
        try
        {
            return await _userRepository.ReassignTaskAsync(dto, reassignedBy);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reassigning task {TaskId} to user {UserId}", dto.TaskId, dto.NewAssignedToUserId);
            throw;
        }
    }

    public async Task<bool> UnassignTaskAsync(Guid taskId, string unassignedBy)
    {
        try
        {
            return await _userRepository.UnassignTaskAsync(taskId, unassignedBy);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unassigning task {TaskId}", taskId);
            throw;
        }
    }

    public async Task<List<TaskAssignmentDto>> GetUserTasksAsync(Guid userId, FlowMaster.Shared.DTOs.TaskStatus? status = null)
    {
        try
        {
            return await _userRepository.GetUserTasksAsync(userId, status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for user {UserId}", userId);
            throw;
        }
    }

    public async Task<List<TaskAssignmentDto>> GetUnassignedTasksAsync()
    {
        try
        {
            return await _userRepository.GetUnassignedTasksAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving unassigned tasks");
            throw;
        }
    }

    public async Task<UserTaskSummaryDto> GetUserTaskSummaryAsync(Guid userId)
    {
        try
        {
            return await _userRepository.GetUserTaskSummaryAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task summary for user {UserId}", userId);
            throw;
        }
    }

    public async Task<List<UserTaskSummaryDto>> GetAllUsersTaskSummaryAsync()
    {
        try
        {
            return await _userRepository.GetAllUsersTaskSummaryAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all users task summary");
            throw;
        }
    }

    #endregion

    #region Task Assignment Strategies

    public async Task<Guid?> GetNextAvailableUserAsync(string? department = null, string? role = null)
    {
        try
        {
            return await _userRepository.GetNextAvailableUserAsync(department, role);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding next available user");
            throw;
        }
    }

    public async Task<Guid?> GetLeastBusyUserAsync(string? department = null, string? role = null)
    {
        try
        {
            return await _userRepository.GetLeastBusyUserAsync(department, role);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding least busy user");
            throw;
        }
    }

    public async Task<bool> AutoAssignTaskAsync(Guid taskId, string? department = null, string? role = null)
    {
        try
        {
            return await _userRepository.AutoAssignTaskAsync(taskId, department, role);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error auto-assigning task {TaskId}", taskId);
            throw;
        }
    }

    #endregion

    #region Task Completion

    public async Task<bool> CompleteTaskAsync(Guid taskId, string result, string completedBy)
    {
        try
        {
            return await _userRepository.CompleteTaskAsync(taskId, result, completedBy);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing task {TaskId}", taskId);
            throw;
        }
    }

    public async Task<bool> CancelTaskAsync(Guid taskId, string reason, string cancelledBy)
    {
        try
        {
            return await _userRepository.CancelTaskAsync(taskId, reason, cancelledBy);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling task {TaskId}", taskId);
            throw;
        }
    }

    #endregion
}
