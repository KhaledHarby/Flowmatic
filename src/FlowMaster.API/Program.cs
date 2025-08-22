using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using Hangfire;
using Hangfire.SqlServer;
using Hangfire.Dashboard;
using FlowMaster.Infrastructure.Data;
using FlowMaster.Application.Interfaces;
using FlowMaster.Infrastructure.Repositories;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/flowmaster-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Configure Entity Framework
builder.Services.AddDbContext<FlowMasterDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Hangfire
builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHangfireServer();

// Configure SignalR
builder.Services.AddSignalR();

// Configure CORS (environment-driven)
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
var allowCredentials = builder.Configuration.GetValue<bool>("Cors:AllowCredentials");

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCors", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // In development, allow all origins for easier debugging
            policy.AllowAnyOrigin()
                  .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                  .AllowAnyHeader();
        }
        else if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                  .AllowAnyHeader();

            if (allowCredentials)
            {
                policy.AllowCredentials();
            }
            else
            {
                policy.DisallowCredentials();
            }
        }
        else
        {
            // Fallback for development if not configured
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
    });
});

// Configure AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Configure MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Register application services
builder.Services.AddScoped<IWorkflowDefinitionService, FlowMaster.Application.Services.WorkflowDefinitionService>();
builder.Services.AddScoped<IWorkflowDefinitionRepository, WorkflowDefinitionRepository>();
builder.Services.AddScoped<IUserService, FlowMaster.Application.Services.UserService>();
builder.Services.AddScoped<IUserRepository, FlowMaster.Infrastructure.Repositories.UserRepository>();
builder.Services.AddScoped<IWorkflowInstanceRepository, FlowMaster.Infrastructure.Repositories.WorkflowInstanceRepository>();
builder.Services.AddScoped<IUserAssignmentService, FlowMaster.Application.Services.UserAssignmentService>();
builder.Services.AddScoped<IWorkflowEngine, FlowMaster.Application.Services.WorkflowEngine>();
// TODO: Implement these services
// builder.Services.AddScoped<IApplicationStatusService, ApplicationStatusService>();

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "FlowMaster API", 
        Version = "v1",
        Description = "Business Process Automation and Workflow Management System API"
    });
    
    // Add JWT authentication
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "FlowMaster API v1");
        c.RoutePrefix = string.Empty; // Serve Swagger UI at root
    });
}

// Only enforce HTTPS redirection outside Development to avoid redirect issues during local dev
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// CORS must be registered before auth/endpoints
app.UseCors("FrontendCors");

app.UseAuthorization();

// Configure Hangfire Dashboard
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAuthorizationFilter() }
});

// Map controllers
app.MapControllers();

// Map SignalR hubs
app.MapHub<WorkflowHub>("/workflowhub");

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FlowMasterDbContext>();
    context.Database.EnsureCreated();
}

Log.Information("FlowMaster API starting up...");

app.Run();

// Hangfire authorization filter
public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context) => true; // In production, implement proper authorization
}

// SignalR Hub for real-time updates
public class WorkflowHub : Microsoft.AspNetCore.SignalR.Hub
{
    public async Task JoinWorkflowGroup(string workflowInstanceId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"workflow-{workflowInstanceId}");
    }

    public async Task LeaveWorkflowGroup(string workflowInstanceId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"workflow-{workflowInstanceId}");
    }
}
