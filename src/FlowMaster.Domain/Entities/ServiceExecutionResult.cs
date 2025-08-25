using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Domain.Entities;

public class ServiceExecutionResult
{
    public Guid Id { get; set; }
    
    public Guid WorkflowInstanceId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string NodeId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string ServiceName { get; set; } = string.Empty;
    
    public ServiceType ServiceType { get; set; }
    
    public ExecutionStatus Status { get; set; }
    
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? CompletedAt { get; set; }
    
    public TimeSpan? Duration { get; set; }
    
    public int RetryCount { get; set; } = 0;
    
    public string RequestData { get; set; } = string.Empty; // JSON
    
    public string ResponseData { get; set; } = string.Empty; // JSON
    
    public int? HttpStatusCode { get; set; }
    
    public string? ErrorMessage { get; set; }
    
    public string? ErrorDetails { get; set; }
    
    public bool IsSuccess { get; set; } = false;
    
    // Navigation properties
    public WorkflowInstance WorkflowInstance { get; set; } = null!;
}

public enum ExecutionStatus
{
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
    Retrying
}
