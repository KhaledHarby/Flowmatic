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
    
    [Required]
    [MaxLength(100)]
    public string AssignedTo { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? DueDate { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    [MaxLength(100)]
    public string? CompletedBy { get; set; }
    
    public string Result { get; set; } = string.Empty; // JSON result data
    
    public Guid WorkflowInstanceId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string NodeId { get; set; } = string.Empty;
    
    // Navigation properties
    public WorkflowInstance WorkflowInstance { get; set; } = null!;
}

public enum TaskStatus
{
    Pending,
    InProgress,
    Completed,
    Cancelled,
    Overdue
}

public enum TaskPriority
{
    Low,
    Normal,
    High,
    Critical
}
