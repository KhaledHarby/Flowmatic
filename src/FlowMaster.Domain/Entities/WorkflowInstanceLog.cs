using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Domain.Entities;

public class WorkflowInstanceLog
{
    public Guid Id { get; set; }
    
    public Guid WorkflowInstanceId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string NodeId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string NodeName { get; set; } = string.Empty;
    
    public NodeType NodeType { get; set; }
    
    public LogLevel Level { get; set; } = LogLevel.Information;
    
    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;
    
    public string? Data { get; set; } // JSON data
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [MaxLength(100)]
    public string? ExecutedBy { get; set; }
    
    public TimeSpan? Duration { get; set; }
    
    public bool IsError { get; set; } = false;
    
    [MaxLength(500)]
    public string? ErrorDetails { get; set; }
    
    // Navigation properties
    public WorkflowInstance WorkflowInstance { get; set; } = null!;
}

public enum LogLevel
{
    Debug,
    Information,
    Warning,
    Error,
    Critical
}
