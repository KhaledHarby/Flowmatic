using FlowMaster.Shared.DTOs;

namespace FlowMaster.Application.Interfaces;

public interface IUserService
{
    // User management
    Task<UserDto> CreateUserAsync(CreateUserDto dto);
    Task<UserDto?> GetUserByIdAsync(Guid id);
    Task<UserDto?> GetUserByUsernameAsync(string username);
    Task<UserDto?> GetUserByEmailAsync(string email);
    Task<List<UserDto>> GetAllUsersAsync(string? department = null, UserStatus? status = null);
    Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto dto);
    Task<bool> DeleteUserAsync(Guid id);
    Task<bool> DeactivateUserAsync(Guid id);
    Task<bool> ActivateUserAsync(Guid id);
    
    // Task assignment
    Task<bool> AssignTaskAsync(AssignTaskDto dto, string assignedBy);
    Task<bool> ReassignTaskAsync(ReassignTaskDto dto, string reassignedBy);
    Task<bool> UnassignTaskAsync(Guid taskId, string unassignedBy);
    Task<List<TaskAssignmentDto>> GetUserTasksAsync(Guid userId, FlowMaster.Shared.DTOs.TaskStatus? status = null);
    Task<List<TaskAssignmentDto>> GetUnassignedTasksAsync();
    Task<UserTaskSummaryDto> GetUserTaskSummaryAsync(Guid userId);
    Task<List<UserTaskSummaryDto>> GetAllUsersTaskSummaryAsync();
    
    // Task assignment strategies
    Task<Guid?> GetNextAvailableUserAsync(string? department = null, string? role = null);
    Task<Guid?> GetLeastBusyUserAsync(string? department = null, string? role = null);
    Task<bool> AutoAssignTaskAsync(Guid taskId, string? department = null, string? role = null);
    
    // Task completion
    Task<bool> CompleteTaskAsync(Guid taskId, string result, string completedBy);
    Task<bool> CancelTaskAsync(Guid taskId, string reason, string cancelledBy);
}
