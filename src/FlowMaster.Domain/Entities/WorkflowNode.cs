using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Domain.Entities;

public class WorkflowNode
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
    
    public string Configuration { get; set; } = string.Empty; // JSON configuration
    
    public bool IsStartNode { get; set; } = false;
    
    public bool IsEndNode { get; set; } = false;
    
    public int Order { get; set; } = 0;
    
    public Guid WorkflowDefinitionId { get; set; }
    
    // Navigation properties
    public WorkflowDefinition WorkflowDefinition { get; set; } = null!;
    public List<WorkflowEdge> SourceEdges { get; set; } = new();
    public List<WorkflowEdge> TargetEdges { get; set; } = new();
}

public enum NodeType
{
    StartNode,      // Workflow entry point
    EndNode,        // Workflow completion
    TaskNode,       // Manual task assignment
    DecisionNode,   // Conditional branching
    ServiceNode,    // Automated service call
    ApprovalNode,   // Approval/rejection step
    DelayNode,      // Timed delays
    NotificationNode, // Email/SMS notifications
    ScriptNode      // Custom script execution
}
