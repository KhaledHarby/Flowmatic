# FlowMaster Service System

## Overview

The FlowMaster Service System provides a comprehensive backend infrastructure to handle all service types in workflow nodes. This system supports multiple service types including External APIs, Internal Services, Database operations, Validation, Data Transformation, Notifications, and more.

## Architecture

### Core Components

1. **Service Configuration Management**
   - `ServiceConfiguration` entity for storing service configurations
   - `ServiceConfigurationService` for CRUD operations
   - `ServiceConfigurationRepository` for data access

2. **Service Execution Engine**
   - `ServiceExecutionService` for executing different service types
   - `ServiceExecutionResult` entity for tracking execution results
   - `ServiceExecutionRepository` for storing execution history

3. **API Controllers**
   - `ServiceConfigurationController` for managing service configurations
   - `ServiceExecutionController` for executing services and retrieving results

## Supported Service Types

### 1. External API (`ExternalApi`)
- **Purpose**: Call external REST APIs
- **Configuration**:
  - Endpoint URL
  - HTTP Method (GET, POST, PUT, DELETE, PATCH)
  - Headers
  - Authentication (Basic, Bearer, API Key, OAuth2)
  - Timeout settings
  - Retry configuration

### 2. Internal Service (`InternalService`)
- **Purpose**: Call internal system services
- **Configuration**:
  - Service name
  - Method name
  - Parameters
  - Integration with internal service bus

### 3. Database (`Database`)
- **Purpose**: Execute database operations
- **Configuration**:
  - Connection string
  - SQL query or stored procedure
  - Parameters
  - Transaction settings

### 4. Validation (`Validation`)
- **Purpose**: Validate data using JSON Schema
- **Configuration**:
  - Validation schema
  - Input data mapping
  - Error handling

### 5. Data Transformation (`Transformation`)
- **Purpose**: Transform data between formats
- **Configuration**:
  - Transformation rules
  - Input/output mapping
  - Data format specifications

### 6. Notification Services
- **Email** (`Email`): Send email notifications
- **SMS** (`Sms`): Send SMS messages
- **General** (`Notification`): Generic notification system

### 7. Webhook (`Webhook`)
- **Purpose**: Trigger webhooks
- **Configuration**:
  - Webhook URL
  - Payload format
  - Authentication

### 8. File Processing (`FileProcessing`)
- **Purpose**: Process files (upload, download, transform)
- **Configuration**:
  - File paths
  - Processing rules
  - Output formats

### 9. Data Sync (`DataSync`)
- **Purpose**: Synchronize data between systems
- **Configuration**:
  - Source and target systems
  - Sync rules
  - Conflict resolution

### 10. Integration (`Integration`)
- **Purpose**: Complex system integrations
- **Configuration**:
  - Integration type
  - System mappings
  - Business rules

## API Endpoints

### Service Configuration Management

```http
# Create service configuration
POST /api/serviceconfiguration
{
  "name": "Background Check API",
  "type": "ExternalApi",
  "endpoint": "https://api.background-check.com/verify",
  "method": "POST",
  "timeout": 30000,
  "retryAttempts": 3,
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{token}}"
  },
  "parameters": {
    "employeeId": "{{employeeId}}",
    "checkType": "comprehensive"
  },
  "authentication": {
    "type": "bearer",
    "credentials": {
      "token": "your-api-token"
    }
  },
  "validation": {
    "enabled": true,
    "schema": "{\"type\":\"object\",\"properties\":{\"status\":{\"type\":\"string\"}}}"
  }
}

# Get all service configurations
GET /api/serviceconfiguration

# Get service configuration by ID
GET /api/serviceconfiguration/{id}

# Get service configuration by name
GET /api/serviceconfiguration/name/{name}

# Get service configurations by type
GET /api/serviceconfiguration/type/{type}

# Update service configuration
PUT /api/serviceconfiguration/{id}

# Delete service configuration
DELETE /api/serviceconfiguration/{id}

# Activate service configuration
POST /api/serviceconfiguration/{id}/activate

# Deactivate service configuration
POST /api/serviceconfiguration/{id}/deactivate
```

### Service Execution

```http
# Execute a service
POST /api/serviceexecution/execute
{
  "workflowInstanceId": "guid",
  "nodeId": "background-check",
  "serviceName": "Background Check API",
  "serviceType": "ExternalApi",
  "parameters": {
    "employeeId": "EMP001",
    "checkType": "comprehensive"
  },
  "context": {
    "workflowVariables": {}
  }
}

# Execute service node in workflow
POST /api/serviceexecution/workflow/{workflowInstanceId}/node/{nodeId}/execute
{
  "employeeId": "EMP001",
  "department": "IT"
}

# Get execution result
GET /api/serviceexecution/result/{executionId}

# Get execution results for workflow instance
GET /api/serviceexecution/workflow/{workflowInstanceId}/results

# Cancel execution
POST /api/serviceexecution/result/{executionId}/cancel

# Retry execution
POST /api/serviceexecution/result/{executionId}/retry

# Test service configuration
POST /api/serviceexecution/test
{
  "name": "Test API",
  "type": "ExternalApi",
  "endpoint": "https://httpbin.org/post",
  "method": "POST"
}
```

## Service Configuration Examples

### External API Configuration

```json
{
  "name": "Employee Verification API",
  "type": "ExternalApi",
  "endpoint": "https://api.verification.com/employee/verify",
  "method": "POST",
  "timeout": 60000,
  "retryAttempts": 3,
  "headers": {
    "Content-Type": "application/json",
    "X-API-Version": "v1"
  },
  "parameters": {
    "employeeId": "{{employeeId}}",
    "verificationType": "{{verificationType}}"
  },
  "authentication": {
    "type": "api-key",
    "credentials": {
      "keyName": "X-API-Key",
      "keyValue": "your-api-key"
    }
  },
  "validation": {
    "enabled": true,
    "schema": "{\"type\":\"object\",\"properties\":{\"verified\":{\"type\":\"boolean\"},\"details\":{\"type\":\"object\"}}}"
  }
}
```

### Internal Service Configuration

```json
{
  "name": "User Management Service",
  "type": "InternalService",
  "endpoint": "UserManagementService",
  "method": "CreateUser",
  "timeout": 30000,
  "retryAttempts": 2,
  "parameters": {
    "username": "{{username}}",
    "email": "{{email}}",
    "department": "{{department}}"
  },
  "authentication": {
    "type": "none"
  },
  "validation": {
    "enabled": false
  }
}
```

### Database Service Configuration

```json
{
  "name": "Employee Database Query",
  "type": "Database",
  "endpoint": "EmployeeDB",
  "method": "GetEmployeeDetails",
  "timeout": 15000,
  "retryAttempts": 1,
  "parameters": {
    "employeeId": "{{employeeId}}"
  },
  "authentication": {
    "type": "none"
  },
  "validation": {
    "enabled": true,
    "schema": "{\"type\":\"object\",\"properties\":{\"employeeId\":{\"type\":\"string\"},\"name\":{\"type\":\"string\"}}}"
  }
}
```

## Integration with Workflow Engine

The service system integrates seamlessly with the workflow engine:

1. **Automatic Service Execution**: When a workflow reaches a ServiceNode, the system automatically executes the configured service
2. **Context Passing**: Workflow variables are passed to the service execution context
3. **Result Handling**: Service execution results are stored and can be used in subsequent workflow steps
4. **Error Handling**: Failed service executions are logged and can trigger workflow error handling

### Workflow Node Configuration Example

```json
{
  "id": "background-check",
  "type": "service",
  "data": {
    "label": "Background Check",
    "nodeType": "service",
    "description": "Automated background verification",
    "config": {
      "serviceType": "external-api",
      "endpoint": "https://api.background-check.com/verify",
      "method": "POST",
      "timeout": 300000,
      "retryAttempts": 3,
      "parameters": {
        "employeeId": "{{employeeId}}",
        "checkType": "comprehensive"
      },
      "headers": {
        "Authorization": "Bearer {{apiToken}}"
      }
    }
  }
}
```

## Error Handling and Retry Logic

### Retry Configuration
- **Retry Attempts**: Configurable number of retry attempts
- **Backoff Strategy**: Exponential backoff between retries
- **Timeout Handling**: Configurable timeout for each service type

### Error Categories
1. **Network Errors**: Connection timeouts, DNS failures
2. **HTTP Errors**: 4xx and 5xx status codes
3. **Validation Errors**: Schema validation failures
4. **Authentication Errors**: Invalid credentials, expired tokens
5. **Business Logic Errors**: Service-specific error responses

### Error Response Format

```json
{
  "id": "execution-guid",
  "workflowInstanceId": "workflow-guid",
  "nodeId": "service-node-id",
  "serviceName": "Background Check API",
  "serviceType": "ExternalApi",
  "status": "Failed",
  "startedAt": "2024-01-01T10:00:00Z",
  "completedAt": "2024-01-01T10:00:05Z",
  "duration": "00:00:05",
  "retryCount": 3,
  "requestData": {
    "employeeId": "EMP001"
  },
  "responseData": {},
  "httpStatusCode": 500,
  "errorMessage": "Internal server error",
  "errorDetails": "Detailed error stack trace",
  "isSuccess": false
}
```

## Monitoring and Logging

### Execution Logging
- All service executions are logged with detailed information
- Request and response data are stored for debugging
- Performance metrics are tracked (duration, retry count)

### Monitoring Endpoints
- Recent executions: `/api/serviceexecution/recent`
- Failed executions: `/api/serviceexecution/failed`
- Performance metrics: `/api/serviceexecution/metrics`

## Security Considerations

### Authentication Methods
1. **Basic Auth**: Username/password for simple APIs
2. **Bearer Token**: JWT tokens for modern APIs
3. **API Key**: Header-based API keys
4. **OAuth2**: Full OAuth2 flow support

### Security Best Practices
- Credentials are encrypted in storage
- HTTPS is enforced for external API calls
- Input validation prevents injection attacks
- Rate limiting prevents abuse

## Performance Optimization

### Caching
- Service configurations are cached for performance
- HTTP client connection pooling
- Response caching for frequently called services

### Scalability
- Async/await pattern for non-blocking operations
- Connection pooling for database operations
- Horizontal scaling support through stateless design

## Testing and Validation

### Service Testing
- Built-in service testing endpoint
- Configuration validation before execution
- Mock service support for development

### Test Configuration Example

```json
{
  "name": "Test Service",
  "type": "ExternalApi",
  "endpoint": "https://httpbin.org/post",
  "method": "POST",
  "parameters": {
    "testParam": "testValue"
  }
}
```

## Deployment and Configuration

### Environment Variables
```bash
# Service execution settings
SERVICE_EXECUTION_TIMEOUT=30000
SERVICE_EXECUTION_MAX_RETRIES=3
SERVICE_EXECUTION_ENABLE_CACHING=true

# HTTP client settings
HTTP_CLIENT_TIMEOUT=30000
HTTP_CLIENT_MAX_CONNECTIONS=100
```

### Database Migration
The service system requires database tables for:
- `ServiceConfigurations`: Store service configurations
- `ServiceExecutionResults`: Store execution results and history

## Future Enhancements

### Planned Features
1. **Service Templates**: Pre-built service configurations
2. **Service Marketplace**: Share and reuse service configurations
3. **Advanced Monitoring**: Real-time service health monitoring
4. **Service Composition**: Chain multiple services together
5. **Event-Driven Services**: Support for event-based service execution

### Integration Roadmap
1. **Message Queues**: RabbitMQ, Azure Service Bus integration
2. **Microservices**: Direct microservice communication
3. **Cloud Services**: AWS, Azure, GCP service integration
4. **Legacy Systems**: Mainframe and legacy system connectors

## Conclusion

The FlowMaster Service System provides a robust, scalable, and flexible foundation for executing various types of services within workflows. With comprehensive error handling, monitoring, and security features, it enables organizations to build complex business process automation solutions that integrate with both internal and external systems.
