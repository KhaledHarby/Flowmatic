using FlowMaster.Application.Interfaces;
using FlowMaster.Infrastructure.Data;
using FlowMaster.Shared.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace FlowMaster.Infrastructure.Repositories;

public class WorkflowDefinitionRepository : IWorkflowDefinitionRepository
{
	private readonly FlowMasterDbContext _context;

	public WorkflowDefinitionRepository(FlowMasterDbContext context)
	{
		_context = context;
	}

	public async Task<WorkflowDefinitionDto> CreateAsync(CreateWorkflowDefinitionDto dto)
	{
		var entity = new Domain.Entities.WorkflowDefinition
		{
			Id = Guid.NewGuid(),
			Name = dto.Name,
			Description = dto.Description,
			Category = dto.Category,
			Status = Domain.Entities.WorkflowStatus.Draft,
			DefinitionJson = dto.DefinitionJson,
			CreatedBy = "System",
			CreatedAt = DateTime.UtcNow,
			Version = 1,
			IsActive = true
		};

		// Map nodes
		entity.Nodes = dto.Nodes.Select(n => new Domain.Entities.WorkflowNode
		{
			Id = Guid.NewGuid(),
			NodeId = n.NodeId,
			Name = n.Name,
			Type = (Domain.Entities.NodeType)n.Type,
			PositionX = n.PositionX,
			PositionY = n.PositionY,
			Configuration = n.Configuration,
			IsStartNode = n.IsStartNode,
			IsEndNode = n.IsEndNode,
			Order = n.Order,
			WorkflowDefinitionId = entity.Id
		}).ToList();

		// Map edges
		entity.Edges = dto.Edges.Select(e => new Domain.Entities.WorkflowEdge
		{
			Id = Guid.NewGuid(),
			EdgeId = e.EdgeId,
			SourceNodeId = e.SourceNodeId,
			TargetNodeId = e.TargetNodeId,
			Label = e.Label,
			Condition = e.Condition,
			Order = e.Order,
			WorkflowDefinitionId = entity.Id
		}).ToList();

		_context.WorkflowDefinitions.Add(entity);
		await _context.SaveChangesAsync();
		return MapToDto(entity);
	}

	public async Task<WorkflowDefinitionDto?> GetByIdAsync(Guid id)
	{
		var entity = await _context.WorkflowDefinitions
			.Include(w => w.Nodes)
			.Include(w => w.Edges)
			.FirstOrDefaultAsync(w => w.Id == id && w.IsActive);
		return entity != null ? MapToDto(entity) : null;
	}

	public async Task<List<WorkflowDefinitionDto>> GetAllAsync()
	{
		var list = await _context.WorkflowDefinitions
			.Include(w => w.Nodes)
			.Include(w => w.Edges)
			.Where(w => w.IsActive)
			.OrderByDescending(w => w.CreatedAt)
			.ToListAsync();
		return list.Select(MapToDto).ToList();
	}

	public async Task<WorkflowDefinitionDto> UpdateAsync(Guid id, UpdateWorkflowDefinitionDto dto)
	{
		await using var tx = await _context.Database.BeginTransactionAsync();

		var existing = await _context.WorkflowDefinitions
			.FirstOrDefaultAsync(w => w.Id == id);

		if (existing == null)
			throw new InvalidOperationException($"Workflow definition with ID {id} not found");

		// Update scalar fields on the root entity
		existing.Name = dto.Name;
		existing.Description = dto.Description;
		existing.Category = dto.Category;
		existing.DefinitionJson = dto.DefinitionJson;
		existing.UpdatedBy = "System";
		existing.UpdatedAt = DateTime.UtcNow;

		await _context.SaveChangesAsync();

		// Replace children using set-based deletes to avoid tracking/concurrency issues
		await _context.WorkflowNodes
			.Where(n => n.WorkflowDefinitionId == existing.Id)
			.ExecuteDeleteAsync();
		await _context.WorkflowEdges
			.Where(e => e.WorkflowDefinitionId == existing.Id)
			.ExecuteDeleteAsync();

		// Create new nodes from DTO
		var newNodes = dto.Nodes.Select(n => new Domain.Entities.WorkflowNode
		{
			Id = Guid.NewGuid(),
			NodeId = n.NodeId,
			Name = n.Name,
			Type = (Domain.Entities.NodeType)n.Type,
			PositionX = n.PositionX,
			PositionY = n.PositionY,
			Configuration = n.Configuration,
			IsStartNode = n.IsStartNode,
			IsEndNode = n.IsEndNode,
			Order = n.Order,
			WorkflowDefinitionId = existing.Id
		}).ToList();

		// Create new edges from DTO
		var newEdges = dto.Edges.Select(e => new Domain.Entities.WorkflowEdge
		{
			Id = Guid.NewGuid(),
			EdgeId = e.EdgeId,
			SourceNodeId = e.SourceNodeId,
			TargetNodeId = e.TargetNodeId,
			Label = e.Label,
			Condition = e.Condition,
			Order = e.Order,
			WorkflowDefinitionId = existing.Id
		}).ToList();

		await _context.WorkflowNodes.AddRangeAsync(newNodes);
		await _context.WorkflowEdges.AddRangeAsync(newEdges);
		await _context.SaveChangesAsync();

		await tx.CommitAsync();

		// Reload to return fresh DTO
		var reloaded = await _context.WorkflowDefinitions
			.Include(w => w.Nodes)
			.Include(w => w.Edges)
			.FirstAsync(w => w.Id == existing.Id);
		return MapToDto(reloaded);
	}

	public async Task<bool> DeleteAsync(Guid id)
	{
		var entity = await _context.WorkflowDefinitions.FirstOrDefaultAsync(w => w.Id == id && w.IsActive);
		if (entity == null) return false;
		entity.IsActive = false;
		await _context.SaveChangesAsync();
		return true;
	}

	public async Task<bool> PublishAsync(Guid id)
	{
		var entity = await _context.WorkflowDefinitions.FirstOrDefaultAsync(w => w.Id == id && w.IsActive);
		if (entity == null) return false;
		entity.Status = Domain.Entities.WorkflowStatus.Published;
		entity.UpdatedBy = "System";
		entity.UpdatedAt = DateTime.UtcNow;
		await _context.SaveChangesAsync();
		return true;
	}

	public async Task<bool> ArchiveAsync(Guid id)
	{
		var entity = await _context.WorkflowDefinitions.FirstOrDefaultAsync(w => w.Id == id && w.IsActive);
		if (entity == null) return false;
		entity.Status = Domain.Entities.WorkflowStatus.Archived;
		entity.UpdatedBy = "System";
		entity.UpdatedAt = DateTime.UtcNow;
		await _context.SaveChangesAsync();
		return true;
	}

	private static WorkflowDefinitionDto MapToDto(Domain.Entities.WorkflowDefinition entity)
	{
		return new WorkflowDefinitionDto
		{
			Id = entity.Id,
			Name = entity.Name,
			Description = entity.Description,
			Category = entity.Category,
			Status = (WorkflowStatus)entity.Status,
			DefinitionJson = entity.DefinitionJson,
			Nodes = entity.Nodes.Select(n => new WorkflowNodeDto
			{
				Id = n.Id,
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
			Edges = entity.Edges.Select(e => new WorkflowEdgeDto
			{
				Id = e.Id,
				EdgeId = e.EdgeId,
				SourceNodeId = e.SourceNodeId,
				TargetNodeId = e.TargetNodeId,
				Label = e.Label,
				Condition = e.Condition,
				Order = e.Order
			}).ToList(),
			CreatedAt = entity.CreatedAt,
			CreatedBy = entity.CreatedBy,
			UpdatedAt = entity.UpdatedAt,
			UpdatedBy = entity.UpdatedBy,
			Version = entity.Version,
			IsActive = entity.IsActive
		};
	}
}
