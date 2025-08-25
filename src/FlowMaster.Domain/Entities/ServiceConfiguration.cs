using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Domain.Entities;

public class ServiceConfiguration
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public ServiceType Type { get; set; }
    
    [MaxLength(500)]
    public string Endpoint { get; set; } = string.Empty;
    
    [MaxLength(10)]
    public string Method { get; set; } = "GET";
    
    public int Timeout { get; set; } = 30000;
    
    public int RetryAttempts { get; set; } = 3;
    
    public string Headers { get; set; } = string.Empty; // JSON
    
    public string Parameters { get; set; } = string.Empty; // JSON
    
    public string Authentication { get; set; } = string.Empty; // JSON
    
    public string ValidationSchema { get; set; } = string.Empty; // JSON Schema
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    [MaxLength(100)]
    public string CreatedBy { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? UpdatedBy { get; set; }
}

public enum ServiceType
{
    ExternalApi,
    InternalService,
    Database,
    Validation,
    Transformation,
    Notification,
    Email,
    Sms,
    Webhook,
    FileProcessing,
    DataSync,
    Integration
}
