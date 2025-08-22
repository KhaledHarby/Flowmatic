using FlowMaster.Application.Interfaces;
using FlowMaster.Shared.DTOs;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace FlowMaster.Application.Services;

public class UserAssignmentService : IUserAssignmentService
{
    private readonly IWorkflowDefinitionRepository _workflowDefinitionRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserAssignmentService> _logger;

    public UserAssignmentService(
        IWorkflowDefinitionRepository workflowDefinitionRepository,
        IUserRepository userRepository,
        ILogger<UserAssignmentService> logger)
    {
        _workflowDefinitionRepository = workflowDefinitionRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<UserAssignmentResult?> AssignUserToTaskAsync(Guid workflowDefinitionId, string applicationId, string nodeId)
    {
        try
        {
            _logger.LogInformation("Attempting to assign user for workflow {WorkflowId}, application {ApplicationId}, node {NodeId}", 
                workflowDefinitionId, applicationId, nodeId);

            // Get the workflow definition and find the specific node
            var workflowDefinition = await _workflowDefinitionRepository.GetByIdAsync(workflowDefinitionId);
            if (workflowDefinition == null)
            {
                _logger.LogWarning("Workflow definition {WorkflowId} not found", workflowDefinitionId);
                return null;
            }

            var node = workflowDefinition.Nodes.FirstOrDefault(n => n.NodeId == nodeId);
            if (node == null)
            {
                _logger.LogWarning("Node {NodeId} not found in workflow {WorkflowId}", nodeId, workflowDefinitionId);
                return null;
            }

            // Parse the node configuration to get assignees
            var assignees = await GetAvailableAssigneesAsync(workflowDefinitionId, nodeId);
            if (!assignees.Any())
            {
                _logger.LogInformation("No assignees configured for node {NodeId} in workflow {WorkflowId}", nodeId, workflowDefinitionId);
                return null;
            }

            // Select a user based on assignment strategy
            var selectedUser = await SelectUserForAssignmentAsync(assignees, applicationId, nodeId);
            if (selectedUser == null)
            {
                _logger.LogWarning("No suitable user found for assignment from assignees: {Assignees}", string.Join(", ", assignees));
                return null;
            }

            var result = new UserAssignmentResult
            {
                UserId = selectedUser.Id,
                Username = selectedUser.Username,
                Email = selectedUser.Email,
                FullName = $"{selectedUser.FirstName} {selectedUser.LastName}",
                AssignmentReason = $"Assigned based on node configuration for {node.Name}",
                AssignmentType = TaskAssignmentType.Automatic
            };

            _logger.LogInformation("Successfully assigned user {Username} to node {NodeId} for application {ApplicationId}", 
                selectedUser.Username, nodeId, applicationId);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning user to task for workflow {WorkflowId}, application {ApplicationId}, node {NodeId}", 
                workflowDefinitionId, applicationId, nodeId);
            return null;
        }
    }

    public async Task<List<string>> GetAvailableAssigneesAsync(Guid workflowDefinitionId, string nodeId)
    {
        try
        {
            var workflowDefinition = await _workflowDefinitionRepository.GetByIdAsync(workflowDefinitionId);
            if (workflowDefinition == null)
            {
                _logger.LogWarning("Workflow definition {WorkflowId} not found", workflowDefinitionId);
                return new List<string>();
            }

            var node = workflowDefinition.Nodes.FirstOrDefault(n => n.NodeId == nodeId);
            if (node == null)
            {
                _logger.LogWarning("Node {NodeId} not found in workflow {WorkflowId}", nodeId, workflowDefinitionId);
                return new List<string>();
            }

            // Parse the configuration JSON
            if (string.IsNullOrWhiteSpace(node.Configuration))
            {
                _logger.LogInformation("No configuration found for node {NodeId}", nodeId);
                return new List<string>();
            }

            try
            {
                var config = JsonSerializer.Deserialize<Dictionary<string, object>>(node.Configuration);
                if (config == null || !config.ContainsKey("assignee"))
                {
                    _logger.LogInformation("No assignees configuration found for node {NodeId}", nodeId);
                    return new List<string>();
                }

                var assigneesValue = config["assignee"].ToString();
                if (string.IsNullOrWhiteSpace(assigneesValue))
                {
                    return new List<string>();
                }

                // Parse the assignees array - handle both JSON array and string array formats
                List<string> assignees;
                if (assigneesValue.StartsWith("[") && assigneesValue.EndsWith("]"))
                {
                    // JSON array format: ["user1", "user2", "user3"]
                    assignees = JsonSerializer.Deserialize<List<string>>(assigneesValue.Replace('\'', '\"')) ?? new List<string>();
                }
                else
                {
                    // String format: "user1,user2,user3" or "user1;user2;user3"
                    assignees = assigneesValue.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                        .Select(s => s.Trim())
                        .Where(s => !string.IsNullOrWhiteSpace(s))
                        .ToList();
                }

                _logger.LogInformation("Found {Count} assignees for node {NodeId}: {Assignees}", 
                    assignees.Count, nodeId, string.Join(", ", assignees));

                return assignees;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Error parsing configuration JSON for node {NodeId}: {Configuration}", 
                    nodeId, node.Configuration);
                return new List<string>();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting available assignees for workflow {WorkflowId}, node {NodeId}", 
                workflowDefinitionId, nodeId);
            return new List<string>();
        }
    }

    private async Task<UserDto?> SelectUserForAssignmentAsync(List<string> assignees, string applicationId, string nodeId)
    {
        try
        {
            // Get all users that match the assignee usernames
            var users = await _userRepository.GetUsersByUsernamesAsync(assignees);
            var activeUsers = users.Where(u => u.Status == UserStatus.Active).ToList();

            if (!activeUsers.Any())
            {
                _logger.LogWarning("No active users found for assignees: {Assignees}", string.Join(", ", assignees));
                return null;
            }

            // Simple round-robin assignment based on application ID hash
            // This ensures consistent assignment for the same application
            var hash = Math.Abs(applicationId.GetHashCode());
            var selectedIndex = hash % activeUsers.Count;
            var selectedUser = activeUsers[selectedIndex];

            _logger.LogInformation("Selected user {Username} for assignment (index {Index} of {Total})", 
                selectedUser.Username, selectedIndex, activeUsers.Count);

            return selectedUser;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error selecting user for assignment from assignees: {Assignees}", 
                string.Join(", ", assignees));
            return null;
        }
    }
}
