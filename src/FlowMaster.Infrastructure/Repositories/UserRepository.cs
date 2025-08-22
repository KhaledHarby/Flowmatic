using FlowMaster.Application.Interfaces;
using FlowMaster.Infrastructure.Data;
using FlowMaster.Shared.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FlowMaster.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly FlowMasterDbContext _context;
    private readonly ILogger<UserRepository> _logger;

    public UserRepository(FlowMasterDbContext context, ILogger<UserRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    #region User CRUD Operations

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        try
        {
            // Check if username or email already exists
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                throw new InvalidOperationException($"Username '{dto.Username}' already exists");

            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                throw new InvalidOperationException($"Email '{dto.Email}' already exists");

            var user = new Domain.Entities.User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Department = dto.Department,
                Role = dto.Role,
                Status = Domain.Entities.UserStatus.Active,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return MapToDto(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            throw;
        }
    }

    public async Task<UserDto?> GetByIdAsync(Guid id)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.AssignedTasks)
                .FirstOrDefaultAsync(u => u.Id == id && u.IsActive);

            if (user == null) return null;

            var dto = MapToDto(user);
            
            // Calculate task statistics
            dto.ActiveTaskCount = user.AssignedTasks.Count(t => 
                t.Status == Domain.Entities.TaskStatus.Pending || 
                t.Status == Domain.Entities.TaskStatus.InProgress);
            
            dto.CompletedTaskCount = user.AssignedTasks.Count(t => 
                t.Status == Domain.Entities.TaskStatus.Completed);
            
            dto.OverdueTaskCount = user.AssignedTasks.Count(t => 
                t.Status == Domain.Entities.TaskStatus.Overdue);
            
            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", id);
            throw;
        }
    }

    public async Task<UserDto?> GetByUsernameAsync(string username)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);

            return user != null ? MapToDto(user) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by username {Username}", username);
            throw;
        }
    }

    public async Task<UserDto?> GetByEmailAsync(string email)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);

            return user != null ? MapToDto(user) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by email {Email}", email);
            throw;
        }
    }

    public async Task<List<UserDto>> GetAllAsync(string? department = null, UserStatus? status = null)
    {
        try
        {
            var query = _context.Users.Where(u => u.IsActive);

            if (!string.IsNullOrEmpty(department))
                query = query.Where(u => u.Department == department);

            if (status.HasValue)
                query = query.Where(u => u.Status == (Domain.Entities.UserStatus)status.Value);

            var users = await query
                .Include(u => u.AssignedTasks)
                .ToListAsync();

            return users.Select(u =>
            {
                var dto = MapToDto(u);
                
                // Calculate task statistics
                dto.ActiveTaskCount = u.AssignedTasks.Count(t => 
                    t.Status == Domain.Entities.TaskStatus.Pending || 
                    t.Status == Domain.Entities.TaskStatus.InProgress);
                
                dto.CompletedTaskCount = u.AssignedTasks.Count(t => 
                    t.Status == Domain.Entities.TaskStatus.Completed);
                
                dto.OverdueTaskCount = u.AssignedTasks.Count(t => 
                    t.Status == Domain.Entities.TaskStatus.Overdue);
                
                return dto;
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            throw;
        }
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new InvalidOperationException($"User with ID {id} not found");

            if (!string.IsNullOrEmpty(dto.FirstName))
                user.FirstName = dto.FirstName;

            if (!string.IsNullOrEmpty(dto.LastName))
                user.LastName = dto.LastName;

            if (dto.Department != null)
                user.Department = dto.Department;

            if (dto.Role != null)
                user.Role = dto.Role;

            if (dto.Status.HasValue)
                user.Status = (Domain.Entities.UserStatus)dto.Status.Value;

            await _context.SaveChangesAsync();

            return MapToDto(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            throw;
        }
    }

    public async Task<bool> DeactivateAsync(Guid id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.IsActive = false;
            user.Status = Domain.Entities.UserStatus.Inactive;
            await _context.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating user {UserId}", id);
            throw;
        }
    }

    public async Task<bool> ActivateAsync(Guid id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.IsActive = true;
            user.Status = Domain.Entities.UserStatus.Active;
            await _context.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating user {UserId}", id);
            throw;
        }
    }

    #endregion

    #region Task Assignment Operations

    public async Task<bool> AssignTaskAsync(AssignTaskDto dto, string assignedBy)
    {
        try
        {
            var task = await _context.WorkflowTasks.FindAsync(dto.TaskId);
            if (task == null) return false;

            var user = await _context.Users.FindAsync(dto.AssignedToUserId);
            if (user == null) return false;

            task.AssignedToUserId = dto.AssignedToUserId;
            task.AssignedTo = user.Username; // Legacy field
            task.AssignedAt = DateTime.UtcNow;
            task.AssignmentNotes = dto.AssignmentNotes;
            task.DueDate = dto.DueDate;
            task.Priority = (Domain.Entities.TaskPriority)dto.Priority;
            task.AssignmentType = Domain.Entities.TaskAssignmentType.Manual;
            task.Status = Domain.Entities.TaskStatus.Pending;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Task {TaskId} assigned to user {UserId} by {AssignedBy}", dto.TaskId, dto.AssignedToUserId, assignedBy);
            return true;
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
            var task = await _context.WorkflowTasks.FindAsync(dto.TaskId);
            if (task == null) return false;

            var newUser = await _context.Users.FindAsync(dto.NewAssignedToUserId);
            if (newUser == null) return false;

            task.AssignedToUserId = dto.NewAssignedToUserId;
            task.AssignedTo = newUser.Username; // Legacy field
            task.AssignedAt = DateTime.UtcNow;
            task.AssignmentNotes = dto.ReassignmentReason;
            task.DueDate = dto.NewDueDate;
            task.Status = Domain.Entities.TaskStatus.Reassigned;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Task {TaskId} reassigned from user {OldUserId} to user {NewUserId} by {ReassignedBy}", 
                dto.TaskId, task.AssignedToUserId, dto.NewAssignedToUserId, reassignedBy);
            return true;
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
            var task = await _context.WorkflowTasks.FindAsync(taskId);
            if (task == null) return false;

            task.AssignedToUserId = null;
            task.AssignedTo = string.Empty;
            task.AssignedAt = null;
            task.AssignmentNotes = $"Unassigned by {unassignedBy}";
            task.Status = Domain.Entities.TaskStatus.Pending;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Task {TaskId} unassigned by {UnassignedBy}", taskId, unassignedBy);
            return true;
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
            var query = _context.WorkflowTasks
                .Include(t => t.AssignedToUser)
                .Where(t => t.AssignedToUserId == userId);

            if (status.HasValue)
                query = query.Where(t => t.Status == (Domain.Entities.TaskStatus)status.Value);

            var tasks = await query.ToListAsync();

            return tasks.Select(t => new TaskAssignmentDto
            {
                TaskId = t.Id,
                TaskTitle = t.Title,
                TaskDescription = t.Description,
                Status = (FlowMaster.Shared.DTOs.TaskStatus)t.Status,
                Priority = (TaskPriority)t.Priority,
                AssignedToUserId = t.AssignedToUserId,
                AssignedToName = t.AssignedToUser?.Username ?? t.AssignedTo,
                AssignedAt = t.AssignedAt,
                DueDate = t.DueDate,
                CreatedAt = t.CreatedAt,
                AssignmentType = (TaskAssignmentType)t.AssignmentType,
                AssignmentNotes = t.AssignmentNotes,
                WorkflowInstanceId = t.WorkflowInstanceId.ToString(),
                NodeId = t.NodeId
            }).ToList();
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
            var tasks = await _context.WorkflowTasks
                .Where(t => t.AssignedToUserId == null && t.Status != Domain.Entities.TaskStatus.Completed)
                .ToListAsync();

            return tasks.Select(t => new TaskAssignmentDto
            {
                TaskId = t.Id,
                TaskTitle = t.Title,
                TaskDescription = t.Description,
                Status = (FlowMaster.Shared.DTOs.TaskStatus)t.Status,
                Priority = (TaskPriority)t.Priority,
                AssignedToUserId = null,
                AssignedToName = string.Empty,
                AssignedAt = null,
                DueDate = t.DueDate,
                CreatedAt = t.CreatedAt,
                AssignmentType = (TaskAssignmentType)t.AssignmentType,
                AssignmentNotes = t.AssignmentNotes,
                WorkflowInstanceId = t.WorkflowInstanceId.ToString(),
                NodeId = t.NodeId
            }).ToList();
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
            var user = await _context.Users
                .Include(u => u.AssignedTasks)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new InvalidOperationException($"User with ID {userId} not found");

            var tasks = user.AssignedTasks;
            var completedTasks = tasks.Where(t => t.Status == Domain.Entities.TaskStatus.Completed).ToList();

            var summary = new UserTaskSummaryDto
            {
                UserId = user.Id,
                UserName = $"{user.FirstName} {user.LastName}",
                TotalTasks = tasks.Count,
                PendingTasks = tasks.Count(t => t.Status == Domain.Entities.TaskStatus.Pending),
                InProgressTasks = tasks.Count(t => t.Status == Domain.Entities.TaskStatus.InProgress),
                CompletedTasks = completedTasks.Count,
                OverdueTasks = tasks.Count(t => t.Status == Domain.Entities.TaskStatus.Overdue),
                AverageCompletionTime = completedTasks.Any() 
                    ? completedTasks.Average(t => (t.CompletedAt!.Value - t.AssignedAt!.Value).TotalHours)
                    : 0,
                RecentTasks = await GetUserTasksAsync(userId, FlowMaster.Shared.DTOs.TaskStatus.Pending)
            };

            return summary;
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
            var users = await _context.Users
                .Include(u => u.AssignedTasks)
                .Where(u => u.IsActive)
                .ToListAsync();

            var summaries = new List<UserTaskSummaryDto>();

            foreach (var user in users)
            {
                var summary = await GetUserTaskSummaryAsync(user.Id);
                summaries.Add(summary);
            }

            return summaries;
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
            var query = _context.Users.Where(u => u.IsActive && u.Status == Domain.Entities.UserStatus.Active);

            if (!string.IsNullOrEmpty(department))
                query = query.Where(u => u.Department == department);

            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role == role);

            var user = await query
                .OrderBy(u => u.AssignedTasks.Count(t => t.Status == Domain.Entities.TaskStatus.Pending || t.Status == Domain.Entities.TaskStatus.InProgress))
                .FirstOrDefaultAsync();

            return user?.Id;
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
            var query = _context.Users
                .Include(u => u.AssignedTasks)
                .Where(u => u.IsActive && u.Status == Domain.Entities.UserStatus.Active);

            if (!string.IsNullOrEmpty(department))
                query = query.Where(u => u.Department == department);

            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role == role);

            var user = await query
                .OrderBy(u => u.AssignedTasks.Count(t => t.Status == Domain.Entities.TaskStatus.Pending || t.Status == Domain.Entities.TaskStatus.InProgress))
                .FirstOrDefaultAsync();

            return user?.Id;
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
            var userId = await GetLeastBusyUserAsync(department, role);
            if (!userId.HasValue) return false;

            var assignDto = new AssignTaskDto
            {
                TaskId = taskId,
                AssignedToUserId = userId.Value,
                AssignmentNotes = "Auto-assigned by system",
                Priority = TaskPriority.Normal
            };

            return await AssignTaskAsync(assignDto, "System");
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
            var task = await _context.WorkflowTasks.FindAsync(taskId);
            if (task == null) return false;

            task.Status = Domain.Entities.TaskStatus.Completed;
            task.CompletedAt = DateTime.UtcNow;
            task.Result = result;
            task.CompletedBy = completedBy;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Task {TaskId} completed by {CompletedBy}", taskId, completedBy);
            return true;
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
            var task = await _context.WorkflowTasks.FindAsync(taskId);
            if (task == null) return false;

            task.Status = Domain.Entities.TaskStatus.Cancelled;
            task.AssignmentNotes = $"Cancelled by {cancelledBy}: {reason}";

            await _context.SaveChangesAsync();

            _logger.LogInformation("Task {TaskId} cancelled by {CancelledBy}", taskId, cancelledBy);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling task {TaskId}", taskId);
            throw;
        }
    }

    #endregion

    #region User Lookup Operations

    public async Task<List<UserDto>> GetUsersByUsernamesAsync(List<string> usernames)
    {
        try
        {
            var users = await _context.Users
                .Where(u => usernames.Contains(u.Username) && u.IsActive)
                .ToListAsync();

            return users.Select(MapToDto).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users by usernames: {Usernames}", string.Join(", ", usernames));
            throw;
        }
    }

    #endregion

    #region Helper Methods

    private static UserDto MapToDto(Domain.Entities.User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Department = user.Department,
            Role = user.Role,
            Status = (UserStatus)user.Status,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            IsActive = user.IsActive,
            ActiveTaskCount = 0, // Will be set by caller
            CompletedTaskCount = 0,
            OverdueTaskCount = 0
        };
    }

    #endregion
}
