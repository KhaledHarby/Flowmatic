using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Domain.Entities;

public class WorkflowInstance
{
    public Guid Id { get; set; }
    
    public Guid WorkflowDefinitionId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string ApplicationId { get; set; } = string.Empty;
    
    public WorkflowInstanceStatus Status { get; set; } = WorkflowInstanceStatus.Running;
    
    [MaxLength(100)]
    public string? CurrentNodeId { get; set; }
    
    public Dictionary<string, object> Variables { get; set; } = new();
    
    public List<WorkflowInstanceLog> ExecutionLog { get; set; } = new();
    
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? CompletedAt { get; set; }
    
    public DateTime? LastActivityAt { get; set; }
    
    [MaxLength(100)]
    public string? StartedBy { get; set; }
    
    [MaxLength(500)]
    public string? ErrorMessage { get; set; }
    
    public int RetryCount { get; set; } = 0;
    
    public int MaxRetries { get; set; } = 3;
    
    // Navigation properties
    public WorkflowDefinition WorkflowDefinition { get; set; } = null!;
    public List<WorkflowTask> Tasks { get; set; } = new();
}

public enum WorkflowInstanceStatus
{
    Running,
    Completed,
    Failed,
    Cancelled,
    Suspended
}
