using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Shared.DTOs;

public class WorkflowInstanceDto
{
    public Guid Id { get; set; }
    
    public Guid WorkflowDefinitionId { get; set; }
    
    public string ApplicationId { get; set; } = string.Empty;
    
    public WorkflowInstanceStatus Status { get; set; }
    
    public string? CurrentNodeId { get; set; }
    
    public Dictionary<string, object> Variables { get; set; } = new();
    
    public List<WorkflowInstanceLogDto> ExecutionLog { get; set; } = new();
    
    public DateTime StartedAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    public DateTime? LastActivityAt { get; set; }
    
    public string? StartedBy { get; set; }
    
    public string? ErrorMessage { get; set; }
    
    public int RetryCount { get; set; }
    
    public int MaxRetries { get; set; }
    
    public WorkflowDefinitionDto? WorkflowDefinition { get; set; }
    
    public List<WorkflowTaskDto> Tasks { get; set; } = new();
}

public class CreateWorkflowInstanceDto
{
    [Required]
    public Guid WorkflowDefinitionId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string ApplicationId { get; set; } = string.Empty;
    
    public Dictionary<string, object> Variables { get; set; } = new();
    
    [MaxLength(100)]
    public string? StartedBy { get; set; }
}

public class WorkflowInstanceLogDto
{
    public Guid Id { get; set; }
    
    public string NodeId { get; set; } = string.Empty;
    
    public string NodeName { get; set; } = string.Empty;
    
    public NodeType NodeType { get; set; }
    
    public LogLevel Level { get; set; }
    
    public string Message { get; set; } = string.Empty;
    
    public string? Data { get; set; }
    
    public DateTime Timestamp { get; set; }
    
    public string? ExecutedBy { get; set; }
    
    public TimeSpan? Duration { get; set; }
    
    public bool IsError { get; set; }
    
    public string? ErrorDetails { get; set; }
}

public class WorkflowTaskDto
{
    public Guid Id { get; set; }
    
    public string TaskId { get; set; } = string.Empty;
    
    public string Title { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public TaskStatus Status { get; set; }
    
    public TaskPriority Priority { get; set; }
    
    public string AssignedTo { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    public string? CompletedBy { get; set; }
    
    public string Result { get; set; } = string.Empty;
    
    public string NodeId { get; set; } = string.Empty;
}

public class CompleteTaskDto
{
    [Required]
    public string TaskId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string CompletedBy { get; set; } = string.Empty;
    
    public string Result { get; set; } = string.Empty;
}

public enum WorkflowInstanceStatus
{
    Running,
    Completed,
    Failed,
    Cancelled,
    Suspended
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

public enum LogLevel
{
    Debug,
    Information,
    Warning,
    Error,
    Critical
}
