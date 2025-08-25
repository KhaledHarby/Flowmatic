using FlowMaster.Application.Interfaces;
using FlowMaster.Domain.Entities;
using FlowMaster.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FlowMaster.Infrastructure.Repositories;

public class ServiceExecutionRepository : IServiceExecutionRepository
{
    private readonly FlowMasterDbContext _context;
    private readonly ILogger<ServiceExecutionRepository> _logger;

    public ServiceExecutionRepository(
        FlowMasterDbContext context,
        ILogger<ServiceExecutionRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ServiceExecutionResult> CreateAsync(ServiceExecutionResult executionResult)
    {
        try
        {
            _context.ServiceExecutionResults.Add(executionResult);
            await _context.SaveChangesAsync();
            return executionResult;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating service execution result {ExecutionId}", executionResult.Id);
            throw;
        }
    }

    public async Task<ServiceExecutionResult?> GetByIdAsync(Guid id)
    {
        try
        {
            return await _context.ServiceExecutionResults
                .Include(s => s.WorkflowInstance)
                .FirstOrDefaultAsync(s => s.Id == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service execution result by ID {ExecutionId}", id);
            throw;
        }
    }

    public async Task<List<ServiceExecutionResult>> GetByWorkflowInstanceAsync(Guid workflowInstanceId)
    {
        try
        {
            return await _context.ServiceExecutionResults
                .Where(s => s.WorkflowInstanceId == workflowInstanceId)
                .OrderByDescending(s => s.StartedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service execution results for workflow instance {WorkflowInstanceId}", workflowInstanceId);
            throw;
        }
    }

    public async Task<List<ServiceExecutionResult>> GetByNodeIdAsync(Guid workflowInstanceId, string nodeId)
    {
        try
        {
            return await _context.ServiceExecutionResults
                .Where(s => s.WorkflowInstanceId == workflowInstanceId && s.NodeId == nodeId)
                .OrderByDescending(s => s.StartedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service execution results for node {NodeId} in workflow instance {WorkflowInstanceId}", nodeId, workflowInstanceId);
            throw;
        }
    }

    public async Task<ServiceExecutionResult> UpdateAsync(ServiceExecutionResult executionResult)
    {
        try
        {
            _context.ServiceExecutionResults.Update(executionResult);
            await _context.SaveChangesAsync();
            return executionResult;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating service execution result {ExecutionId}", executionResult.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        try
        {
            var executionResult = await _context.ServiceExecutionResults.FindAsync(id);
            if (executionResult == null)
                return false;

            _context.ServiceExecutionResults.Remove(executionResult);
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting service execution result {ExecutionId}", id);
            throw;
        }
    }

    public async Task<List<ServiceExecutionResult>> GetRecentExecutionsAsync(int count = 100)
    {
        try
        {
            return await _context.ServiceExecutionResults
                .OrderByDescending(s => s.StartedAt)
                .Take(count)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recent service execution results");
            throw;
        }
    }

    public async Task<List<ServiceExecutionResult>> GetFailedExecutionsAsync(DateTime? since = null)
    {
        try
        {
            var query = _context.ServiceExecutionResults.Where(s => s.Status == ExecutionStatus.Failed);

            if (since.HasValue)
            {
                query = query.Where(s => s.StartedAt >= since.Value);
            }

            return await query
                .OrderByDescending(s => s.StartedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving failed service execution results");
            throw;
        }
    }
}
