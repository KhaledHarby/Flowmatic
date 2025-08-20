# FlowMaster - Business Process Automation & Workflow Management System

FlowMaster is a modern, comprehensive Business Process Automation (BPA) and Workflow Management System that enables organizations to design, execute, and monitor business workflows through an intuitive visual interface. Built with .NET Core 8.0 and React, it provides powerful workflow orchestration capabilities with real-time monitoring and application status management.

## 🚀 Features

### Core Capabilities
- **Visual Workflow Designer**: Drag-and-drop interface for creating complex business workflows
- **Application Status Management**: Track and manage application states through defined processes
- **Process Automation**: Execute workflows automatically based on triggers and conditions
- **Real-time Monitoring**: Live tracking of workflow execution and application statuses
- **User-friendly Interface**: Intuitive UI that non-technical users can navigate easily

### Advanced Features
- **Workflow Templates**: Pre-built templates for common processes
- **Integration Capabilities**: REST API connectors, database queries, email/SMS notifications
- **Business Rules Engine**: Dynamic condition evaluation and rule-based routing
- **Reporting & Analytics**: Performance metrics, bottleneck identification, SLA monitoring
- **Security & Compliance**: Role-based access control, audit trails, GDPR compliance

## 🏗️ Architecture

### Backend (.NET Core 8.0)
```
FlowMaster/
├── src/
│   ├── FlowMaster.API/              # Web API controllers and middleware
│   ├── FlowMaster.Application/       # Business logic and services
│   ├── FlowMaster.Domain/           # Domain entities and business rules
│   ├── FlowMaster.Infrastructure/    # Data access and external services
│   └── FlowMaster.Shared/           # Shared DTOs and contracts
├── frontend/                        # React application
├── tests/                          # Unit and integration tests
└── docker/                         # Container configurations
```

### Technology Stack
- **Backend**: ASP.NET Core 8.0, Entity Framework Core, SignalR, Hangfire
- **Frontend**: React 18+, TypeScript, Material-UI, React Flow
- **Database**: SQL Server
- **Real-time**: SignalR for live updates
- **Background Jobs**: Hangfire for task processing
- **Validation**: FluentValidation
- **Mapping**: AutoMapper
- **Logging**: Serilog

## 📋 Prerequisites

- .NET 8.0 SDK
- Node.js 18+ and npm
- SQL Server (LocalDB for development)
- Visual Studio 2022 or VS Code

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/flowmaster.git
cd flowmaster
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd src
dotnet restore
```

#### Database Setup
```bash
# Update connection string in appsettings.json
# For development, LocalDB is used by default
dotnet ef database update --project FlowMaster.Infrastructure --startup-project FlowMaster.API
```

#### Run the API
```bash
cd FlowMaster.API
dotnet run
```

The API will be available at:
- **API**: https://localhost:7001
- **Swagger UI**: https://localhost:7001
- **Hangfire Dashboard**: https://localhost:7001/hangfire

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Run the React App
```bash
npm start
```

The frontend will be available at: http://localhost:3000

## 🎯 Quick Start

### 1. Create Your First Workflow

1. Navigate to **Workflows** in the sidebar
2. Click **Create New Workflow**
3. Use the visual designer to:
   - Drag nodes from the palette to the canvas
   - Connect nodes to create the workflow flow
   - Configure node properties in the properties panel
4. Click **Save** to store your workflow
5. Click **Publish** to make it available for execution

### 2. Start a Workflow Instance

1. Go to **Instances** in the sidebar
2. Click **Start New Instance**
3. Select your published workflow
4. Provide an application ID and any required variables
5. Click **Start** to begin execution

### 3. Monitor Execution

1. View real-time updates in the **Instances** page
2. Check **Applications** to see status changes
3. Use the **Dashboard** for overview metrics

## 📚 API Documentation

### Workflow Definition Endpoints
```
POST /api/workflows                    # Create workflow
GET /api/workflows                     # List workflows
GET /api/workflows/{id}               # Get workflow details
PUT /api/workflows/{id}               # Update workflow
DELETE /api/workflows/{id}            # Delete workflow
POST /api/workflows/{id}/publish      # Publish workflow
POST /api/workflows/{id}/validate     # Validate workflow
```

### Workflow Instance Endpoints
```
POST /api/instances                   # Start workflow instance
GET /api/instances                    # List instances
GET /api/instances/{id}              # Get instance details
POST /api/instances/{id}/complete-task # Complete task
POST /api/instances/{id}/cancel       # Cancel instance
GET /api/instances/{id}/logs         # Get execution logs
```

### Application Status Endpoints
```
GET /api/applications/{id}/status     # Get application status
PUT /api/applications/{id}/status     # Update application status
GET /api/applications/{id}/history    # Get status history
POST /api/applications/bulk-status    # Bulk status update
```

## 🔧 Configuration

### Database Connection
Update the connection string in `src/FlowMaster.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-server;Database=FlowMasterDb;Trusted_Connection=true;"
  }
}
```

### CORS Settings
Configure allowed origins in `appsettings.json`:

```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-domain.com"
    ]
  }
}
```

### Workflow Engine Settings
```json
{
  "WorkflowEngine": {
    "MaxRetries": 3,
    "RetryDelaySeconds": 30,
    "DefaultTimeoutMinutes": 60
  }
}
```

## 🧪 Testing

### Backend Tests
```bash
cd tests
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🐳 Docker Deployment

### Build Images
```bash
docker build -t flowmaster-api ./src
docker build -t flowmaster-frontend ./frontend
```

### Run with Docker Compose
```bash
docker-compose up -d
```

## 📊 Monitoring & Logging

### Logs
- Application logs are stored in `logs/flowmaster-{date}.txt`
- Log level can be configured in `appsettings.json`
- Serilog is used for structured logging

### Hangfire Dashboard
- Access at `/hangfire` for background job monitoring
- View job queues, retries, and execution history

### SignalR Real-time Updates
- Workflow status updates are pushed in real-time
- Connect to `/workflowhub` for live notifications

## 🔒 Security

### Authentication
- JWT-based authentication (configure in production)
- Role-based access control
- API key authentication for external integrations

### Data Protection
- Encrypted sensitive data storage
- Secure API communications
- Audit trails for all actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-org/flowmaster/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/flowmaster/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/flowmaster/discussions)

## 🗺️ Roadmap

### Phase 1 (Completed)
- ✅ Core workflow engine
- ✅ Visual workflow designer
- ✅ Basic API endpoints
- ✅ React frontend

### Phase 2 (In Progress)
- 🔄 Advanced node types
- 🔄 Integration connectors
- 🔄 Business rules engine
- 🔄 Enhanced monitoring

### Phase 3 (Planned)
- 📋 Advanced analytics
- 📋 Machine learning integration
- 📋 Mobile application
- 📋 Enterprise features

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for the workflow designer
- [Material-UI](https://mui.com/) for the UI components
- [ASP.NET Core](https://dotnet.microsoft.com/) for the backend framework
- [Entity Framework](https://docs.microsoft.com/en-us/ef/) for data access

---

**FlowMaster** - Empowering organizations with intelligent workflow automation.