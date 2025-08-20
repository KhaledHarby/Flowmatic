using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Domain.Entities;

public class WorkflowDefinition
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;
    
    public WorkflowStatus Status { get; set; } = WorkflowStatus.Draft;
    
    [Required]
    public string DefinitionJson { get; set; } = string.Empty;
    
    public List<WorkflowNode> Nodes { get; set; } = new();
    
    public List<WorkflowEdge> Edges { get; set; } = new();
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    [MaxLength(100)]
    public string CreatedBy { get; set; } = string.Empty;
    
    public DateTime? UpdatedAt { get; set; }
    
    [MaxLength(100)]
    public string? UpdatedBy { get; set; }
    
    public int Version { get; set; } = 1;
    
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public List<WorkflowInstance> Instances { get; set; } = new();
}

public enum WorkflowStatus
{
    Draft,
    Published,
    Archived
}
