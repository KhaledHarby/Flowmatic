using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Shared.DTOs;

public class UserDto
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? Department { get; set; }
    
    [MaxLength(100)]
    public string? Role { get; set; }
    
    public UserStatus Status { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? LastLoginAt { get; set; }
    
    public bool IsActive { get; set; }
    
    // Task statistics
    public int ActiveTaskCount { get; set; }
    public int CompletedTaskCount { get; set; }
    public int OverdueTaskCount { get; set; }
}

public class CreateUserDto
{
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? Department { get; set; }
    
    [MaxLength(100)]
    public string? Role { get; set; }
    
    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class UpdateUserDto
{
    [MaxLength(100)]
    public string? FirstName { get; set; }
    
    [MaxLength(100)]
    public string? LastName { get; set; }
    
    [MaxLength(100)]
    public string? Department { get; set; }
    
    [MaxLength(100)]
    public string? Role { get; set; }
    
    public UserStatus? Status { get; set; }
}

public class AssignTaskDto
{
    [Required]
    public Guid TaskId { get; set; }
    
    [Required]
    public Guid AssignedToUserId { get; set; }
    
    [MaxLength(500)]
    public string? AssignmentNotes { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    public TaskPriority Priority { get; set; } = TaskPriority.Normal;
}

public class ReassignTaskDto
{
    [Required]
    public Guid TaskId { get; set; }
    
    [Required]
    public Guid NewAssignedToUserId { get; set; }
    
    [MaxLength(500)]
    public string? ReassignmentReason { get; set; }
    
    public DateTime? NewDueDate { get; set; }
}

public class TaskAssignmentDto
{
    public Guid TaskId { get; set; }
    
    public string TaskTitle { get; set; } = string.Empty;
    
    public string TaskDescription { get; set; } = string.Empty;
    
    public TaskStatus Status { get; set; }
    
    public TaskPriority Priority { get; set; }
    
    public Guid? AssignedToUserId { get; set; }
    
    public string AssignedToName { get; set; } = string.Empty;
    
    public DateTime? AssignedAt { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public TaskAssignmentType AssignmentType { get; set; }
    
    public string? AssignmentNotes { get; set; }
    
    public string WorkflowInstanceId { get; set; } = string.Empty;
    
    public string NodeId { get; set; } = string.Empty;
}

public class UserTaskSummaryDto
{
    public Guid UserId { get; set; }
    
    public string UserName { get; set; } = string.Empty;
    
    public int TotalTasks { get; set; }
    
    public int PendingTasks { get; set; }
    
    public int InProgressTasks { get; set; }
    
    public int CompletedTasks { get; set; }
    
    public int OverdueTasks { get; set; }
    
    public double AverageCompletionTime { get; set; } // in hours
    
    public List<TaskAssignmentDto> RecentTasks { get; set; } = new();
}

public enum UserStatus
{
    Active,
    Inactive,
    Suspended,
    Pending
}
