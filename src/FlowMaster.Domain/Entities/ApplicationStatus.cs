using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Domain.Entities;

public class ApplicationStatus
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string ApplicationId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string CurrentStatus { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? PreviousStatus { get; set; }
    
    public Dictionary<string, object> Metadata { get; set; } = new();
    
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    
    [Required]
    [MaxLength(100)]
    public string UpdatedBy { get; set; } = string.Empty;
    
    public List<StatusHistory> History { get; set; } = new();
    
    public Guid? CurrentWorkflowInstanceId { get; set; }
    
    // Navigation properties
    public WorkflowInstance? CurrentWorkflowInstance { get; set; }
}

public class StatusHistory
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Status { get; set; } = string.Empty;
    
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    [MaxLength(100)]
    public string ChangedBy { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Reason { get; set; }
    
    public Dictionary<string, object> Metadata { get; set; } = new();
    
    public Guid ApplicationStatusId { get; set; }
    
    // Navigation properties
    public ApplicationStatus ApplicationStatus { get; set; } = null!;
}
