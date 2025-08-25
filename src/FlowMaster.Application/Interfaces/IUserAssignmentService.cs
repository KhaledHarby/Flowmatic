using FlowMaster.Shared.DTOs;

namespace FlowMaster.Application.Interfaces;

public interface IUserAssignmentService
{
    /// <summary>
    /// Assigns a user to a workflow task based on the node configuration
    /// </summary>
    /// <param name="workflowDefinitionId">The workflow definition ID</param>
    /// <param name="applicationId">The application ID</param>
    /// <param name="nodeId">The node ID to assign users to</param>
    /// <returns>The assigned user information or null if no assignment possible</returns>
    Task<UserAssignmentResult?> AssignUserToTaskAsync(Guid workflowDefinitionId, string applicationId, string nodeId);
    
    /// <summary>
    /// Gets the available assignees for a specific node based on its configuration
    /// </summary>
    /// <param name="workflowDefinitionId">The workflow definition ID</param>
    /// <param name="nodeId">The node ID</param>
    /// <returns>List of available assignees for the node</returns>
    Task<List<string>> GetAvailableAssigneesAsync(Guid workflowDefinitionId, string nodeId);
}

public class UserAssignmentResult
{
    public Guid? UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string AssignmentReason { get; set; } = string.Empty;
    public TaskAssignmentType AssignmentType { get; set; }
}



