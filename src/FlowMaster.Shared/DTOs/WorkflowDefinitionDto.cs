using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Shared.DTOs;

public class WorkflowDefinitionDto
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;
    
    public WorkflowStatus Status { get; set; }
    
    public string DefinitionJson { get; set; } = string.Empty;
    
    public List<WorkflowNodeDto> Nodes { get; set; } = new();
    
    public List<WorkflowEdgeDto> Edges { get; set; } = new();
    
    public DateTime CreatedAt { get; set; }
    
    public string CreatedBy { get; set; } = string.Empty;
    
    public DateTime? UpdatedAt { get; set; }
    
    public string? UpdatedBy { get; set; }
    
    public int Version { get; set; }
    
    public bool IsActive { get; set; }
}

public class CreateWorkflowDefinitionDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;
    
    public string DefinitionJson { get; set; } = string.Empty;
    
    public List<WorkflowNodeDto> Nodes { get; set; } = new();
    
    public List<WorkflowEdgeDto> Edges { get; set; } = new();
}

public class UpdateWorkflowDefinitionDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;
    
    public string DefinitionJson { get; set; } = string.Empty;
    
    public List<WorkflowNodeDto> Nodes { get; set; } = new();
    
    public List<WorkflowEdgeDto> Edges { get; set; } = new();
}

public class WorkflowNodeDto
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string NodeId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    public NodeType Type { get; set; }
    
    public double PositionX { get; set; }
    
    public double PositionY { get; set; }
    
    public string Configuration { get; set; } = string.Empty;
    
    public bool IsStartNode { get; set; }
    
    public bool IsEndNode { get; set; }
    
    public int Order { get; set; }
}

public class WorkflowEdgeDto
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string EdgeId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string SourceNodeId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string TargetNodeId { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string Label { get; set; } = string.Empty;
    
    public string Condition { get; set; } = string.Empty;
    
    public int Order { get; set; }
}

public enum WorkflowStatus
{
    Draft,
    Published,
    Archived
}

public enum NodeType
{
    StartNode,
    EndNode,
    TaskNode,
    DecisionNode,
    ServiceNode,
    ApprovalNode,
    DelayNode,
    NotificationNode,
    ScriptNode
}
