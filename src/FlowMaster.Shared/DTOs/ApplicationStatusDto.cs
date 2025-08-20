using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Shared.DTOs;

public class ApplicationStatusDto
{
    public Guid Id { get; set; }
    
    public string ApplicationId { get; set; } = string.Empty;
    
    public string CurrentStatus { get; set; } = string.Empty;
    
    public string? PreviousStatus { get; set; }
    
    public Dictionary<string, object> Metadata { get; set; } = new();
    
    public DateTime LastUpdated { get; set; }
    
    public string UpdatedBy { get; set; } = string.Empty;
    
    public List<StatusHistoryDto> History { get; set; } = new();
    
    public Guid? CurrentWorkflowInstanceId { get; set; }
}

public class UpdateApplicationStatusDto
{
    [Required]
    [MaxLength(100)]
    public string Status { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Reason { get; set; }
    
    public Dictionary<string, object> Metadata { get; set; } = new();
    
    [Required]
    [MaxLength(100)]
    public string UpdatedBy { get; set; } = string.Empty;
}

public class BulkUpdateApplicationStatusDto
{
    [Required]
    public List<string> ApplicationIds { get; set; } = new();
    
    [Required]
    [MaxLength(100)]
    public string Status { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Reason { get; set; }
    
    public Dictionary<string, object> Metadata { get; set; } = new();
    
    [Required]
    [MaxLength(100)]
    public string UpdatedBy { get; set; } = string.Empty;
}

public class StatusHistoryDto
{
    public Guid Id { get; set; }
    
    public string Status { get; set; } = string.Empty;
    
    public DateTime ChangedAt { get; set; }
    
    public string ChangedBy { get; set; } = string.Empty;
    
    public string? Reason { get; set; }
    
    public Dictionary<string, object> Metadata { get; set; } = new();
}
