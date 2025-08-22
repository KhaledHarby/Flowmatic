using FlowMaster.Shared.DTOs;

namespace FlowMaster.Application.Interfaces;

public interface IUserRepository
{
    // User CRUD operations
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<UserDto?> GetByIdAsync(Guid id);
    Task<UserDto?> GetByUsernameAsync(string username);
    Task<UserDto?> GetByEmailAsync(string email);
    Task<List<UserDto>> GetAllAsync(string? department = null, UserStatus? status = null);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> DeactivateAsync(Guid id);
    Task<bool> ActivateAsync(Guid id);

    // Task assignment operations
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

    // User lookup operations
    Task<List<UserDto>> GetUsersByUsernamesAsync(List<string> usernames);
}
