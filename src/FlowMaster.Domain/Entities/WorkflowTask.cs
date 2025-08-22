using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Domain.Entities;

public class WorkflowTask
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string TaskId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    public TaskStatus Status { get; set; } = TaskStatus.Pending;
    
    public TaskPriority Priority { get; set; } = TaskPriority.Normal;
    
    // User assignment properties
    public Guid? AssignedToUserId { get; set; }
    
    [MaxLength(100)]
    public string AssignedTo { get; set; } = string.Empty; // Legacy field for backward compatibility
    
    public DateTime? AssignedAt { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? CompletedAt { get; set; }
    
    public Guid? CompletedByUserId { get; set; }
    
    [MaxLength(100)]
    public string? CompletedBy { get; set; } // Legacy field for backward compatibility
    
    public string Result { get; set; } = string.Empty; // JSON result data
    
    public Guid WorkflowInstanceId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string NodeId { get; set; } = string.Empty;
    
    // Assignment metadata
    public TaskAssignmentType AssignmentType { get; set; } = TaskAssignmentType.Manual;
    
    [MaxLength(500)]
    public string? AssignmentNotes { get; set; }
    
    public DateTime? ReminderSentAt { get; set; }
    
    public int ReminderCount { get; set; } = 0;
    
    // Navigation properties
    public WorkflowInstance WorkflowInstance { get; set; } = null!;
    public User? AssignedToUser { get; set; }
    public User? CompletedByUser { get; set; }
}

public enum TaskStatus
{
    Pending,
    InProgress,
    Completed,
    Cancelled,
    Overdue,
    Reassigned
}

public enum TaskPriority
{
    Low,
    Normal,
    High,
    Critical
}

public enum TaskAssignmentType
{
    Manual,
    Automatic,
    RoundRobin,
    LoadBalanced,
    RoleBased
}
