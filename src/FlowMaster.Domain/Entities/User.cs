using System.ComponentModel.DataAnnotations;

namespace FlowMaster.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? Department { get; set; }
    
    [MaxLength(100)]
    public string? Role { get; set; }
    
    public UserStatus Status { get; set; } = UserStatus.Active;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? LastLoginAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public List<WorkflowTask> AssignedTasks { get; set; } = new();
    public List<WorkflowTask> CompletedTasks { get; set; } = new();
}

public enum UserStatus
{
    Active,
    Inactive,
    Suspended,
    Pending
}


