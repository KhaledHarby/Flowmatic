using FlowMaster.Application.Interfaces;
using FlowMaster.Shared.DTOs;
using Microsoft.Extensions.Logging;
using System.Linq;
using DWorkflowStatus = FlowMaster.Domain.Entities.WorkflowStatus;
using DNodeType = FlowMaster.Domain.Entities.NodeType;

namespace FlowMaster.Application.Services;

public class WorkflowDefinitionService : IWorkflowDefinitionService
{
    private readonly IWorkflowDefinitionRepository _repository;
    private readonly ILogger<WorkflowDefinitionService> _logger;

    public WorkflowDefinitionService(IWorkflowDefinitionRepository repository, ILogger<WorkflowDefinitionService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<WorkflowDefinitionDto> CreateAsync(CreateWorkflowDefinitionDto dto, string createdBy)
    {
        try
        {
            var workflowDefinition = new Domain.Entities.WorkflowDefinition
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                Category = dto.Category,
                Status = DWorkflowStatus.Draft,
                DefinitionJson = dto.DefinitionJson,
                CreatedBy = createdBy,
                CreatedAt = DateTime.UtcNow,
                Version = 1,
                IsActive = true
            };

            // Map nodes
            workflowDefinition.Nodes = dto.Nodes.Select(n => new Domain.Entities.WorkflowNode
            {
                Id = Guid.NewGuid(),
                NodeId = n.NodeId,
                Name = n.Name,
                Type = (DNodeType)n.Type,
                PositionX = n.PositionX,
                PositionY = n.PositionY,
                Configuration = n.Configuration,
                IsStartNode = n.IsStartNode,
                IsEndNode = n.IsEndNode,
                Order = n.Order,
                WorkflowDefinitionId = workflowDefinition.Id
            }).ToList();

            // Map edges
            workflowDefinition.Edges = dto.Edges.Select(e => new Domain.Entities.WorkflowEdge
            {
                Id = Guid.NewGuid(),
                EdgeId = e.EdgeId,
                SourceNodeId = e.SourceNodeId,
                TargetNodeId = e.TargetNodeId,
                Label = e.Label,
                Condition = e.Condition,
                Order = e.Order,
                WorkflowDefinitionId = workflowDefinition.Id
            }).ToList();

            var createDto = new CreateWorkflowDefinitionDto
            {
                Name = dto.Name,
                Description = dto.Description,
                Category = dto.Category,
                DefinitionJson = dto.DefinitionJson,
                Nodes = dto.Nodes,
                Edges = dto.Edges
            };

            return await _repository.CreateAsync(createDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating workflow definition");
            throw;
        }
    }

    public async Task<WorkflowDefinitionDto> GetByIdAsync(Guid id)
    {
        try
        {
            var workflowDefinition = await _repository.GetByIdAsync(id);
            return workflowDefinition ?? null!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow definition {Id}", id);
            throw;
        }
    }

    public async Task<List<WorkflowDefinitionDto>> GetAllAsync(string? category = null, WorkflowStatus? status = null)
    {
        try
        {
            return await _repository.GetAllAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow definitions");
            throw;
        }
    }

    public async Task<WorkflowDefinitionDto> UpdateAsync(Guid id, UpdateWorkflowDefinitionDto dto, string updatedBy)
    {
        try
        {
            var existingWorkflow = await _repository.GetByIdAsync(id);
            if (existingWorkflow == null)
                throw new InvalidOperationException($"Workflow definition with ID {id} not found");

            var workflowDefinition = new Domain.Entities.WorkflowDefinition
            {
                Id = id,
                Name = dto.Name,
                Description = dto.Description,
                Category = dto.Category,
                Status = (DWorkflowStatus)existingWorkflow.Status,
                DefinitionJson = dto.DefinitionJson,
                CreatedBy = existingWorkflow.CreatedBy,
                CreatedAt = existingWorkflow.CreatedAt,
                UpdatedBy = updatedBy,
                UpdatedAt = DateTime.UtcNow,
                Version = existingWorkflow.Version,
                IsActive = existingWorkflow.IsActive
            };

            // Map nodes
            workflowDefinition.Nodes = dto.Nodes.Select(n => new Domain.Entities.WorkflowNode
            {
                Id = Guid.NewGuid(),
                NodeId = n.NodeId,
                Name = n.Name,
                Type = (DNodeType)n.Type,
                PositionX = n.PositionX,
                PositionY = n.PositionY,
                Configuration = n.Configuration,
                IsStartNode = n.IsStartNode,
                IsEndNode = n.IsEndNode,
                Order = n.Order,
                WorkflowDefinitionId = workflowDefinition.Id
            }).ToList();

            // Map edges
            workflowDefinition.Edges = dto.Edges.Select(e => new Domain.Entities.WorkflowEdge
            {
                Id = Guid.NewGuid(),
                EdgeId = e.EdgeId,
                SourceNodeId = e.SourceNodeId,
                TargetNodeId = e.TargetNodeId,
                Label = e.Label,
                Condition = e.Condition,
                Order = e.Order,
                WorkflowDefinitionId = workflowDefinition.Id
            }).ToList();

            return await _repository.UpdateAsync(id, dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating workflow definition {Id}", id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        try
        {
            return await _repository.DeleteAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting workflow definition {Id}", id);
            throw;
        }
    }

    public async Task<bool> PublishAsync(Guid id, string publishedBy)
    {
        try
        {
            return await _repository.PublishAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing workflow definition {Id}", id);
            throw;
        }
    }

    public async Task<bool> ArchiveAsync(Guid id, string archivedBy)
    {
        try
        {
            return await _repository.ArchiveAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving workflow definition {Id}", id);
            throw;
        }
    }

    public async Task<bool> ValidateAsync(Guid id)
    {
        try
        {
            var workflowDefinition = await _repository.GetByIdAsync(id);
            if (workflowDefinition == null)
                return false;

            // Basic validation logic
            var hasStartNode = workflowDefinition.Nodes.Any(n => n.IsStartNode);
            var hasEndNode = workflowDefinition.Nodes.Any(n => n.IsEndNode);
            var hasNodes = workflowDefinition.Nodes.Any();

            return hasStartNode && hasEndNode && hasNodes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating workflow definition {Id}", id);
            throw;
        }
    }

    public async Task<WorkflowDefinitionDto> CreateVersionAsync(Guid id, string createdBy)
    {
        try
        {
            var originalWorkflow = await _repository.GetByIdAsync(id);
            if (originalWorkflow == null)
                throw new InvalidOperationException($"Workflow definition with ID {id} not found");

            var newVersion = new Domain.Entities.WorkflowDefinition
            {
                Id = Guid.NewGuid(),
                Name = originalWorkflow.Name,
                Description = originalWorkflow.Description,
                Category = originalWorkflow.Category,
                Status = DWorkflowStatus.Draft,
                DefinitionJson = originalWorkflow.DefinitionJson,
                CreatedBy = createdBy,
                CreatedAt = DateTime.UtcNow,
                Version = originalWorkflow.Version + 1,
                IsActive = true
            };

            // Copy nodes
            newVersion.Nodes = originalWorkflow.Nodes.Select(n => new Domain.Entities.WorkflowNode
            {
                Id = Guid.NewGuid(),
                NodeId = n.NodeId,
                Name = n.Name,
                Type = (DNodeType)n.Type,
                PositionX = n.PositionX,
                PositionY = n.PositionY,
                Configuration = n.Configuration,
                IsStartNode = n.IsStartNode,
                IsEndNode = n.IsEndNode,
                Order = n.Order,
                WorkflowDefinitionId = newVersion.Id
            }).ToList();

            // Copy edges
            newVersion.Edges = originalWorkflow.Edges.Select(e => new Domain.Entities.WorkflowEdge
            {
                Id = Guid.NewGuid(),
                EdgeId = e.EdgeId,
                SourceNodeId = e.SourceNodeId,
                TargetNodeId = e.TargetNodeId,
                Label = e.Label,
                Condition = e.Condition,
                Order = e.Order,
                WorkflowDefinitionId = newVersion.Id
            }).ToList();

            var createDto = new CreateWorkflowDefinitionDto
            {
                Name = newVersion.Name,
                Description = newVersion.Description,
                Category = newVersion.Category,
                DefinitionJson = newVersion.DefinitionJson,
                Nodes = newVersion.Nodes.Select(n => new WorkflowNodeDto
                {
                    NodeId = n.NodeId,
                    Name = n.Name,
                    Type = (NodeType)n.Type,
                    PositionX = n.PositionX,
                    PositionY = n.PositionY,
                    Configuration = n.Configuration,
                    IsStartNode = n.IsStartNode,
                    IsEndNode = n.IsEndNode,
                    Order = n.Order
                }).ToList(),
                Edges = newVersion.Edges.Select(e => new WorkflowEdgeDto
                {
                    EdgeId = e.EdgeId,
                    SourceNodeId = e.SourceNodeId,
                    TargetNodeId = e.TargetNodeId,
                    Label = e.Label,
                    Condition = e.Condition,
                    Order = e.Order
                }).ToList()
            };

            return await _repository.CreateAsync(createDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating version for workflow definition {Id}", id);
            throw;
        }
    }


}
