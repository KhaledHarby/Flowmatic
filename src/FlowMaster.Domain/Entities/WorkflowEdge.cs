using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Domain.Entities;

public class WorkflowEdge
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
    
    public string Condition { get; set; } = string.Empty; // JSON condition expression
    
    public int Order { get; set; } = 0;
    
    public Guid WorkflowDefinitionId { get; set; }
    
    // Navigation properties
    public WorkflowDefinition WorkflowDefinition { get; set; } = null!;
    public WorkflowNode SourceNode { get; set; } = null!;
    public WorkflowNode TargetNode { get; set; } = null!;
}
