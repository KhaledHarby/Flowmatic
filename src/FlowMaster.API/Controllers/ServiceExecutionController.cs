using Microsoft.AspNetCore.Mvc;
using FlowMaster.Application.Interfaces;
using FlowMaster.Shared.DTOs;

namespace FlowMaster.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceExecutionController : ControllerBase
{
    private readonly IServiceExecutionService _serviceExecutionService;
    private readonly ILogger<ServiceExecutionController> _logger;

    public ServiceExecutionController(
        IServiceExecutionService serviceExecutionService,
        ILogger<ServiceExecutionController> logger)
    {
        _serviceExecutionService = serviceExecutionService;
        _logger = logger;
    }

    /// <summary>
    /// Execute a service
    /// </summary>
    [HttpPost("execute")]
    public async Task<ActionResult<ServiceExecutionResultDto>> ExecuteService([FromBody] ServiceExecutionRequestDto request)
    {
        try
        {
            var result = await _serviceExecutionService.ExecuteServiceAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing service");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Execute a service node in a workflow instance
    /// </summary>
    [HttpPost("workflow/{workflowInstanceId}/node/{nodeId}/execute")]
    public async Task<ActionResult<ServiceExecutionResultDto>> ExecuteServiceNode(
        Guid workflowInstanceId, 
        string nodeId, 
        [FromBody] Dictionary<string, object> context)
    {
        try
        {
            var result = await _serviceExecutionService.ExecuteServiceNodeAsync(workflowInstanceId, nodeId, context);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing service node {NodeId} for workflow instance {WorkflowInstanceId}", nodeId, workflowInstanceId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get service execution result by ID
    /// </summary>
    [HttpGet("result/{executionId}")]
    public async Task<ActionResult<ServiceExecutionResultDto>> GetExecutionResult(Guid executionId)
    {
        try
        {
            var result = await _serviceExecutionService.GetExecutionResultAsync(executionId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service execution result {ExecutionId}", executionId);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get all service execution results for a workflow instance
    /// </summary>
    [HttpGet("workflow/{workflowInstanceId}/results")]
    public async Task<ActionResult<List<ServiceExecutionResultDto>>> GetExecutionResults(Guid workflowInstanceId)
    {
        try
        {
            var results = await _serviceExecutionService.GetExecutionResultsAsync(workflowInstanceId);
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving service execution results for workflow instance {WorkflowInstanceId}", workflowInstanceId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Cancel a service execution
    /// </summary>
    [HttpPost("result/{executionId}/cancel")]
    public async Task<ActionResult> CancelExecution(Guid executionId)
    {
        try
        {
            var success = await _serviceExecutionService.CancelExecutionAsync(executionId);
            if (!success)
                return NotFound(new { error = "Service execution not found" });

            return Ok(new { message = "Service execution cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling service execution {ExecutionId}", executionId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Retry a service execution
    /// </summary>
    [HttpPost("result/{executionId}/retry")]
    public async Task<ActionResult> RetryExecution(Guid executionId)
    {
        try
        {
            var success = await _serviceExecutionService.RetryExecutionAsync(executionId);
            if (!success)
                return NotFound(new { error = "Service execution not found" });

            return Ok(new { message = "Service execution retry initiated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrying service execution {ExecutionId}", executionId);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Test a service configuration
    /// </summary>
    [HttpPost("test")]
    public async Task<ActionResult<ServiceExecutionResultDto>> TestServiceConfiguration(
        [FromBody] CreateServiceConfigurationDto config,
        [FromQuery] Dictionary<string, object> testParameters)
    {
        try
        {
            var result = await _serviceExecutionService.TestServiceConfigurationAsync(config, testParameters);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing service configuration");
            return BadRequest(new { error = ex.Message });
        }
    }
}
