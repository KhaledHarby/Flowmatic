using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Shared.DTOs;

public class ServiceConfigurationDto
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
    
    public Dictionary<string, string> Headers { get; set; } = new();
    
    public Dictionary<string, object> Parameters { get; set; } = new();
    
    public AuthenticationConfig Authentication { get; set; } = new();
    
    public ValidationConfig Validation { get; set; } = new();
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
    
    [MaxLength(100)]
    public string CreatedBy { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? UpdatedBy { get; set; }
}

public class CreateServiceConfigurationDto
{
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
    
    public Dictionary<string, string> Headers { get; set; } = new();
    
    public Dictionary<string, object> Parameters { get; set; } = new();
    
    public AuthenticationConfig Authentication { get; set; } = new();
    
    public ValidationConfig Validation { get; set; } = new();
}

public class UpdateServiceConfigurationDto
{
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
    
    public Dictionary<string, string> Headers { get; set; } = new();
    
    public Dictionary<string, object> Parameters { get; set; } = new();
    
    public AuthenticationConfig Authentication { get; set; } = new();
    
    public ValidationConfig Validation { get; set; } = new();
    
    public bool IsActive { get; set; } = true;
}

public class ServiceExecutionRequestDto
{
    [Required]
    public Guid WorkflowInstanceId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string NodeId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string ServiceName { get; set; } = string.Empty;
    
    [Required]
    public ServiceType ServiceType { get; set; }
    
    public Dictionary<string, object> Parameters { get; set; } = new();
    
    public Dictionary<string, object> Context { get; set; } = new();
}

public class ServiceExecutionResultDto
{
    public Guid Id { get; set; }
    
    public Guid WorkflowInstanceId { get; set; }
    
    [MaxLength(100)]
    public string NodeId { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string ServiceName { get; set; } = string.Empty;
    
    public ServiceType ServiceType { get; set; }
    
    public ExecutionStatus Status { get; set; }
    
    public DateTime StartedAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    public TimeSpan? Duration { get; set; }
    
    public int RetryCount { get; set; }
    
    public Dictionary<string, object> RequestData { get; set; } = new();
    
    public Dictionary<string, object> ResponseData { get; set; } = new();
    
    public int? HttpStatusCode { get; set; }
    
    public string? ErrorMessage { get; set; }
    
    public string? ErrorDetails { get; set; }
    
    public bool IsSuccess { get; set; }
}

public class AuthenticationConfig
{
    public string Type { get; set; } = "none"; // none, basic, bearer, api-key, oauth2
    
    public Dictionary<string, string> Credentials { get; set; } = new();
}

public class ValidationConfig
{
    public bool Enabled { get; set; } = false;
    
    public string Schema { get; set; } = string.Empty; // JSON Schema
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

public enum ExecutionStatus
{
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
    Retrying
}
