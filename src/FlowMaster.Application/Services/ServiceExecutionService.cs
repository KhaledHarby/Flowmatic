using FlowMaster.Application.Interfaces;
using FlowMaster.Domain.Entities;
using FlowMaster.Shared.DTOs;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text;

namespace FlowMaster.Application.Services;

public class ServiceExecutionService : IServiceExecutionService
{
    private readonly IServiceConfigurationRepository _serviceConfigRepository;
    private readonly IServiceExecutionRepository _executionRepository;
    private readonly IWorkflowInstanceRepository _workflowInstanceRepository;
    private readonly ILogger<ServiceExecutionService> _logger;
    private readonly HttpClient _httpClient;


    public ServiceExecutionService(
        IServiceConfigurationRepository serviceConfigRepository,
        IServiceExecutionRepository executionRepository,
        IWorkflowInstanceRepository workflowInstanceRepository,
        ILogger<ServiceExecutionService> logger,
        HttpClient httpClient)
    {
        _serviceConfigRepository = serviceConfigRepository;
        _executionRepository = executionRepository;
        _workflowInstanceRepository = workflowInstanceRepository;
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task<ServiceExecutionResultDto> ExecuteServiceAsync(ServiceExecutionRequestDto request)
    {
        var executionId = Guid.NewGuid();
        var startTime = DateTime.UtcNow;

        try
        {
            _logger.LogInformation("Starting service execution {ExecutionId} for workflow instance {WorkflowInstanceId}", 
                executionId, request.WorkflowInstanceId);

            // Create execution record
            var executionResult = new ServiceExecutionResult
            {
                Id = executionId,
                WorkflowInstanceId = request.WorkflowInstanceId,
                NodeId = request.NodeId,
                ServiceName = request.ServiceName,
                ServiceType = (FlowMaster.Domain.Entities.ServiceType)request.ServiceType,
                Status = FlowMaster.Domain.Entities.ExecutionStatus.Running,
                StartedAt = startTime,
                RequestData = JsonSerializer.Serialize(request.Parameters),
                RetryCount = 0
            };

            await _executionRepository.CreateAsync(executionResult);

            // Execute based on service type
            var result = await ExecuteServiceByTypeAsync(request, executionResult);

            // Update execution record
            result.CompletedAt = DateTime.UtcNow;
            result.Duration = result.CompletedAt - startTime;
            result.Status = result.IsSuccess ? FlowMaster.Domain.Entities.ExecutionStatus.Completed : FlowMaster.Domain.Entities.ExecutionStatus.Failed;

            await _executionRepository.UpdateAsync(result);

            return MapToDto(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing service {ExecutionId}", executionId);
            
            // Update execution record with error
            var errorResult = new ServiceExecutionResult
            {
                Id = executionId,
                WorkflowInstanceId = request.WorkflowInstanceId,
                NodeId = request.NodeId,
                ServiceName = request.ServiceName,
                ServiceType = (FlowMaster.Domain.Entities.ServiceType)request.ServiceType,
                Status = FlowMaster.Domain.Entities.ExecutionStatus.Failed,
                StartedAt = startTime,
                CompletedAt = DateTime.UtcNow,
                Duration = DateTime.UtcNow - startTime,
                RequestData = JsonSerializer.Serialize(request.Parameters),
                ErrorMessage = ex.Message,
                ErrorDetails = ex.ToString(),
                IsSuccess = false
            };

            await _executionRepository.CreateAsync(errorResult);
            return MapToDto(errorResult);
        }
    }

    public async Task<ServiceExecutionResultDto> ExecuteServiceNodeAsync(Guid workflowInstanceId, string nodeId, Dictionary<string, object> context)
    {
        try
        {
            // Get workflow instance and node configuration
            var instance = await _workflowInstanceRepository.GetInstanceAsync(workflowInstanceId);
            if (instance == null)
                throw new InvalidOperationException($"Workflow instance {workflowInstanceId} not found");

            var node = instance.WorkflowDefinition?.Nodes?.FirstOrDefault(n => n.NodeId == nodeId);
            if (node == null)
                throw new InvalidOperationException($"Node {nodeId} not found in workflow instance {workflowInstanceId}");

            if (node.Type != FlowMaster.Shared.DTOs.NodeType.ServiceNode)
                throw new InvalidOperationException($"Node {nodeId} is not a service node");

            // Parse node configuration
            var nodeConfig = JsonSerializer.Deserialize<Dictionary<string, object>>(node.Configuration);
            if (nodeConfig == null)
                throw new InvalidOperationException($"Invalid configuration for node {nodeId}");

            // Create execution request
            var request = new ServiceExecutionRequestDto
            {
                WorkflowInstanceId = workflowInstanceId,
                NodeId = nodeId,
                ServiceName = node.Name,
                ServiceType = ParseServiceType(nodeConfig.GetValueOrDefault("serviceType", "external-api").ToString()),
                Parameters = nodeConfig.GetValueOrDefault("parameters", new Dictionary<string, object>()) as Dictionary<string, object> ?? new(),
                Context = context
            };

            return await ExecuteServiceAsync(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing service node {NodeId} for workflow instance {WorkflowInstanceId}", 
                nodeId, workflowInstanceId);
            throw;
        }
    }

    public async Task<ServiceExecutionResultDto> GetExecutionResultAsync(Guid executionId)
    {
        var result = await _executionRepository.GetByIdAsync(executionId);
        if (result == null)
            throw new InvalidOperationException($"Execution result {executionId} not found");

        return MapToDto(result);
    }

    public async Task<List<ServiceExecutionResultDto>> GetExecutionResultsAsync(Guid workflowInstanceId)
    {
        var results = await _executionRepository.GetByWorkflowInstanceAsync(workflowInstanceId);
        return results.Select(MapToDto).ToList();
    }

    public async Task<bool> CancelExecutionAsync(Guid executionId)
    {
        var result = await _executionRepository.GetByIdAsync(executionId);
        if (result == null) return false;

        result.Status = FlowMaster.Domain.Entities.ExecutionStatus.Cancelled;
        result.CompletedAt = DateTime.UtcNow;
        result.Duration = result.CompletedAt - result.StartedAt;

        await _executionRepository.UpdateAsync(result);
        return true;
    }

    public async Task<bool> RetryExecutionAsync(Guid executionId)
    {
        var result = await _executionRepository.GetByIdAsync(executionId);
        if (result == null) return false;

        result.Status = FlowMaster.Domain.Entities.ExecutionStatus.Retrying;
        result.RetryCount++;
        result.StartedAt = DateTime.UtcNow;
        result.CompletedAt = null;
        result.Duration = null;
        result.ErrorMessage = null;
        result.ErrorDetails = null;

        await _executionRepository.UpdateAsync(result);
        return true;
    }

    public async Task<ServiceExecutionResultDto> TestServiceConfigurationAsync(CreateServiceConfigurationDto config, Dictionary<string, object> testParameters)
    {
        var request = new ServiceExecutionRequestDto
        {
            WorkflowInstanceId = Guid.Empty, // Test execution
            NodeId = "test",
            ServiceName = config.Name,
            ServiceType = config.Type,
            Parameters = testParameters,
            Context = new Dictionary<string, object>()
        };

        return await ExecuteServiceAsync(request);
    }

    private async Task<ServiceExecutionResult> ExecuteServiceByTypeAsync(ServiceExecutionRequestDto request, ServiceExecutionResult executionResult)
    {
        switch (request.ServiceType)
        {
            case FlowMaster.Shared.DTOs.ServiceType.ExternalApi:
                return await ExecuteExternalApiAsync(request, executionResult);
            
            case FlowMaster.Shared.DTOs.ServiceType.InternalService:
                return await ExecuteInternalServiceAsync(request, executionResult);
            
            case FlowMaster.Shared.DTOs.ServiceType.Database:
                return await ExecuteDatabaseServiceAsync(request, executionResult);
            
            case FlowMaster.Shared.DTOs.ServiceType.Validation:
                return await ExecuteValidationServiceAsync(request, executionResult);
            
            case FlowMaster.Shared.DTOs.ServiceType.Transformation:
                return await ExecuteTransformationServiceAsync(request, executionResult);
            
            case FlowMaster.Shared.DTOs.ServiceType.Notification:
            case FlowMaster.Shared.DTOs.ServiceType.Email:
            case FlowMaster.Shared.DTOs.ServiceType.Sms:
                return await ExecuteNotificationServiceAsync(request, executionResult);
            
            case FlowMaster.Shared.DTOs.ServiceType.Webhook:
                return await ExecuteWebhookServiceAsync(request, executionResult);
            
            case FlowMaster.Shared.DTOs.ServiceType.FileProcessing:
                return await ExecuteFileProcessingServiceAsync(request, executionResult);
            
            case FlowMaster.Shared.DTOs.ServiceType.DataSync:
                return await ExecuteDataSyncServiceAsync(request, executionResult);
            
            case FlowMaster.Shared.DTOs.ServiceType.Integration:
                return await ExecuteIntegrationServiceAsync(request, executionResult);
            
            default:
                throw new NotSupportedException($"Service type {request.ServiceType} is not supported");
        }
    }

    private async Task<ServiceExecutionResult> ExecuteExternalApiAsync(ServiceExecutionRequestDto request, ServiceExecutionResult executionResult)
    {
        try
        {
            // Get service configuration if available
            var config = await _serviceConfigRepository.GetByNameAsync(request.ServiceName);
            
            var endpoint = config?.Endpoint ?? request.Parameters.GetValueOrDefault("endpoint", "").ToString();
            var method = config?.Method ?? request.Parameters.GetValueOrDefault("method", "GET").ToString();
            var timeout = config?.Timeout ?? 30000;
            var headers = !string.IsNullOrEmpty(config?.Headers) 
                ? JsonSerializer.Deserialize<Dictionary<string, string>>(config.Headers) ?? new Dictionary<string, string>()
                : new Dictionary<string, string>();

            if (string.IsNullOrEmpty(endpoint))
                throw new InvalidOperationException("Endpoint is required for external API calls");

            // Prepare request
            var httpMethod = new HttpMethod(method);
            var requestMessage = new HttpRequestMessage(httpMethod, endpoint);

            // Add headers
            foreach (var header in headers)
            {
                requestMessage.Headers.Add(header.Key, header.Value);
            }

            // Add authentication if configured
            if (config?.Authentication != null)
            {
                await AddAuthenticationAsync(requestMessage, config.Authentication);
            }

            // Add request body for POST/PUT/PATCH
            if (httpMethod != HttpMethod.Get && httpMethod != HttpMethod.Delete)
            {
                var body = JsonSerializer.Serialize(request.Parameters);
                requestMessage.Content = new StringContent(body, Encoding.UTF8, "application/json");
            }

            // Execute request
            using var cts = new CancellationTokenSource(timeout);
            var response = await _httpClient.SendAsync(requestMessage, cts.Token);

            // Process response
            var responseContent = await response.Content.ReadAsStringAsync();
            var responseData = JsonSerializer.Deserialize<Dictionary<string, object>>(responseContent) ?? new();

            executionResult.HttpStatusCode = (int)response.StatusCode;
            executionResult.ResponseData = responseContent;
            executionResult.IsSuccess = response.IsSuccessStatusCode;

            if (!response.IsSuccessStatusCode)
            {
                executionResult.ErrorMessage = $"HTTP {response.StatusCode}: {responseContent}";
            }

            return executionResult;
        }
        catch (Exception ex)
        {
            executionResult.ErrorMessage = ex.Message;
            executionResult.ErrorDetails = ex.ToString();
            executionResult.IsSuccess = false;
            return executionResult;
        }
    }

    private async Task<ServiceExecutionResult> ExecuteInternalServiceAsync(ServiceExecutionRequestDto request, ServiceExecutionResult executionResult)
    {
        try
        {
            // This would integrate with internal services
            // For now, we'll simulate a successful internal service call
            var result = new Dictionary<string, object>
            {
                ["status"] = "success",
                ["message"] = "Internal service executed successfully",
                ["data"] = request.Parameters,
                ["timestamp"] = DateTime.UtcNow
            };

            executionResult.ResponseData = JsonSerializer.Serialize(result);
            executionResult.IsSuccess = true;
            executionResult.HttpStatusCode = 200;

            return executionResult;
        }
        catch (Exception ex)
        {
            executionResult.ErrorMessage = ex.Message;
            executionResult.ErrorDetails = ex.ToString();
            executionResult.IsSuccess = false;
            return executionResult;
        }
    }

    private async Task<ServiceExecutionResult> ExecuteDatabaseServiceAsync(ServiceExecutionRequestDto request, ServiceExecutionResult executionResult)
    {
        try
        {
            // This would execute database operations
            // For now, we'll simulate a successful database operation
            var result = new Dictionary<string, object>
            {
                ["status"] = "success",
                ["message"] = "Database operation completed",
                ["affectedRows"] = 1,
                ["data"] = request.Parameters
            };

            executionResult.ResponseData = JsonSerializer.Serialize(result);
            executionResult.IsSuccess = true;
            executionResult.HttpStatusCode = 200;

            return executionResult;
        }
        catch (Exception ex)
        {
            executionResult.ErrorMessage = ex.Message;
            executionResult.ErrorDetails = ex.ToString();
            executionResult.IsSuccess = false;
            return executionResult;
        }
    }

    private async Task<ServiceExecutionResult> ExecuteValidationServiceAsync(ServiceExecutionRequestDto request, ServiceExecutionResult executionResult)
    {
        try
        {
            // This would perform data validation
            var result = new Dictionary<string, object>
            {
                ["status"] = "success",
                ["message"] = "Validation completed",
                ["isValid"] = true,
                ["errors"] = new List<string>()
            };

            executionResult.ResponseData = JsonSerializer.Serialize(result);
            executionResult.IsSuccess = true;
            executionResult.HttpStatusCode = 200;

            return executionResult;
        }
        catch (Exception ex)
        {
            executionResult.ErrorMessage = ex.Message;
            executionResult.ErrorDetails = ex.ToString();
            executionResult.IsSuccess = false;
            return executionResult;
        }
    }

    private async Task<ServiceExecutionResult> ExecuteTransformationServiceAsync(ServiceExecutionRequestDto request, ServiceExecutionResult executionResult)
    {
        try
        {
            // This would transform data
            var result = new Dictionary<string, object>
            {
                ["status"] = "success",
                ["message"] = "Data transformation completed",
                ["transformedData"] = request.Parameters
            };

            executionResult.ResponseData = JsonSerializer.Serialize(result);
            executionResult.IsSuccess = true;
            executionResult.HttpStatusCode = 200;

            return executionResult;
        }
        catch (Exception ex)
        {
            executionResult.ErrorMessage = ex.Message;
            executionResult.ErrorDetails = ex.ToString();
            executionResult.IsSuccess = false;
            return executionResult;
        }
    }

    private async Task<ServiceExecutionResult> ExecuteNotificationServiceAsync(ServiceExecutionRequestDto request, ServiceExecutionResult executionResult)
    {
        try
        {
            // This would send notifications (email, SMS, etc.)
            var result = new Dictionary<string, object>
            {
                ["status"] = "success",
                ["message"] = "Notification sent successfully",
                ["recipients"] = request.Parameters.GetValueOrDefault("recipients", new List<string>()),
                ["notificationType"] = request.ServiceType.ToString()
            };

            executionResult.ResponseData = JsonSerializer.Serialize(result);
            executionResult.IsSuccess = true;
            executionResult.HttpStatusCode = 200;

            return executionResult;
        }
        catch (Exception ex)
        {
            executionResult.ErrorMessage = ex.Message;
            executionResult.ErrorDetails = ex.ToString();
            executionResult.IsSuccess = false;
            return executionResult;
        }
    }

    private async Task<ServiceExecutionResult> ExecuteWebhookServiceAsync(ServiceExecutionRequestDto request, ServiceExecutionResult executionResult)
    {
        try
        {
            // This would trigger webhooks
            var result = new Dictionary<string, object>
            {
                ["status"] = "success",
                ["message"] = "Webhook triggered successfully",
                ["webhookUrl"] = request.Parameters.GetValueOrDefault("url", ""),
                ["payload"] = request.Parameters
            };

            executionResult.ResponseData = JsonSerializer.Serialize(result);
            executionResult.IsSuccess = true;
            executionResult.HttpStatusCode = 200;

            return executionResult;
        }
        catch (Exception ex)
        {
            executionResult.ErrorMessage = ex.Message;
            executionResult.ErrorDetails = ex.ToString();
            executionResult.IsSuccess = false;
            return executionResult;
        }
    }

    private async Task<ServiceExecutionResult> ExecuteFileProcessingServiceAsync(ServiceExecutionRequestDto request, ServiceExecutionResult executionResult)
    {
        try
        {
            // This would process files
            var result = new Dictionary<string, object>
            {
                ["status"] = "success",
                ["message"] = "File processing completed",
                ["processedFiles"] = request.Parameters.GetValueOrDefault("files", new List<string>()),
                ["outputPath"] = request.Parameters.GetValueOrDefault("outputPath", "")
            };

            executionResult.ResponseData = JsonSerializer.Serialize(result);
            executionResult.IsSuccess = true;
            executionResult.HttpStatusCode = 200;

            return executionResult;
        }
        catch (Exception ex)
        {
            executionResult.ErrorMessage = ex.Message;
            executionResult.ErrorDetails = ex.ToString();
            executionResult.IsSuccess = false;
            return executionResult;
        }
    }

    private async Task<ServiceExecutionResult> ExecuteDataSyncServiceAsync(ServiceExecutionRequestDto request, ServiceExecutionResult executionResult)
    {
        try
        {
            // This would sync data between systems
            var result = new Dictionary<string, object>
            {
                ["status"] = "success",
                ["message"] = "Data synchronization completed",
                ["syncedRecords"] = request.Parameters.GetValueOrDefault("records", 0),
                ["sourceSystem"] = request.Parameters.GetValueOrDefault("source", ""),
                ["targetSystem"] = request.Parameters.GetValueOrDefault("target", "")
            };

            executionResult.ResponseData = JsonSerializer.Serialize(result);
            executionResult.IsSuccess = true;
            executionResult.HttpStatusCode = 200;

            return executionResult;
        }
        catch (Exception ex)
        {
            executionResult.ErrorMessage = ex.Message;
            executionResult.ErrorDetails = ex.ToString();
            executionResult.IsSuccess = false;
            return executionResult;
        }
    }

    private async Task<ServiceExecutionResult> ExecuteIntegrationServiceAsync(ServiceExecutionRequestDto request, ServiceExecutionResult executionResult)
    {
        try
        {
            // This would handle complex integrations
            var result = new Dictionary<string, object>
            {
                ["status"] = "success",
                ["message"] = "Integration completed successfully",
                ["integrationType"] = request.Parameters.GetValueOrDefault("type", ""),
                ["systems"] = request.Parameters.GetValueOrDefault("systems", new List<string>())
            };

            executionResult.ResponseData = JsonSerializer.Serialize(result);
            executionResult.IsSuccess = true;
            executionResult.HttpStatusCode = 200;

            return executionResult;
        }
        catch (Exception ex)
        {
            executionResult.ErrorMessage = ex.Message;
            executionResult.ErrorDetails = ex.ToString();
            executionResult.IsSuccess = false;
            return executionResult;
        }
    }

    private async Task AddAuthenticationAsync(HttpRequestMessage request, string authenticationJson)
    {
        try
        {
            var auth = JsonSerializer.Deserialize<AuthenticationConfig>(authenticationJson);
            if (auth == null) return;

            switch (auth.Type.ToLower())
            {
                case "basic":
                    var username = auth.Credentials.GetValueOrDefault("username", "");
                    var password = auth.Credentials.GetValueOrDefault("password", "");
                    var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);
                    break;

                case "bearer":
                    var token = auth.Credentials.GetValueOrDefault("token", "");
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                    break;

                case "api-key":
                    var keyName = auth.Credentials.GetValueOrDefault("keyName", "X-API-Key");
                    var keyValue = auth.Credentials.GetValueOrDefault("keyValue", "");
                    request.Headers.Add(keyName, keyValue);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to add authentication to request");
        }
    }

    private FlowMaster.Shared.DTOs.ServiceType ParseServiceType(string serviceType)
    {
        return serviceType?.ToLower() switch
        {
            "external-api" => FlowMaster.Shared.DTOs.ServiceType.ExternalApi,
            "internal-service" => FlowMaster.Shared.DTOs.ServiceType.InternalService,
            "database" => FlowMaster.Shared.DTOs.ServiceType.Database,
            "validation" => FlowMaster.Shared.DTOs.ServiceType.Validation,
            "transformation" => FlowMaster.Shared.DTOs.ServiceType.Transformation,
            "notification" => FlowMaster.Shared.DTOs.ServiceType.Notification,
            "email" => FlowMaster.Shared.DTOs.ServiceType.Email,
            "sms" => FlowMaster.Shared.DTOs.ServiceType.Sms,
            "webhook" => FlowMaster.Shared.DTOs.ServiceType.Webhook,
            "file-processing" => FlowMaster.Shared.DTOs.ServiceType.FileProcessing,
            "data-sync" => FlowMaster.Shared.DTOs.ServiceType.DataSync,
            "integration" => FlowMaster.Shared.DTOs.ServiceType.Integration,
            _ => FlowMaster.Shared.DTOs.ServiceType.ExternalApi
        };
    }

    private ServiceExecutionResultDto MapToDto(ServiceExecutionResult entity)
    {
        return new ServiceExecutionResultDto
        {
            Id = entity.Id,
            WorkflowInstanceId = entity.WorkflowInstanceId,
            NodeId = entity.NodeId,
            ServiceName = entity.ServiceName,
            ServiceType = (FlowMaster.Shared.DTOs.ServiceType)entity.ServiceType,
            Status = (FlowMaster.Shared.DTOs.ExecutionStatus)entity.Status,
            StartedAt = entity.StartedAt,
            CompletedAt = entity.CompletedAt,
            Duration = entity.Duration,
            RetryCount = entity.RetryCount,
            RequestData = JsonSerializer.Deserialize<Dictionary<string, object>>(entity.RequestData) ?? new(),
            ResponseData = JsonSerializer.Deserialize<Dictionary<string, object>>(entity.ResponseData) ?? new(),
            HttpStatusCode = entity.HttpStatusCode,
            ErrorMessage = entity.ErrorMessage,
            ErrorDetails = entity.ErrorDetails,
            IsSuccess = entity.IsSuccess
        };
    }
}
