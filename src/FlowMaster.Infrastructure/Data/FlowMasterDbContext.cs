using Microsoft.EntityFrameworkCore;
using FlowMaster.Domain.Entities;

namespace FlowMaster.Infrastructure.Data;

public class FlowMasterDbContext : DbContext
{
    public FlowMasterDbContext(DbContextOptions<FlowMasterDbContext> options) : base(options)
    {
    }

    public DbSet<WorkflowDefinition> WorkflowDefinitions { get; set; }
    public DbSet<WorkflowInstance> WorkflowInstances { get; set; }
    public DbSet<WorkflowNode> WorkflowNodes { get; set; }
    public DbSet<WorkflowEdge> WorkflowEdges { get; set; }
    public DbSet<WorkflowTask> WorkflowTasks { get; set; }
    public DbSet<WorkflowInstanceLog> WorkflowInstanceLogs { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<ServiceConfiguration> ServiceConfigurations { get; set; }
    public DbSet<ServiceExecutionResult> ServiceExecutionResults { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // WorkflowDefinition configuration
        modelBuilder.Entity<WorkflowDefinition>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.DefinitionJson).IsRequired();
            entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.UpdatedBy).HasMaxLength(100);
            entity.HasIndex(e => e.CreatedAt);
        });

        // WorkflowInstance configuration
        modelBuilder.Entity<WorkflowInstance>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ApplicationId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CurrentNodeId).HasMaxLength(100);
            entity.Property(e => e.StartedBy).HasMaxLength(100);
            entity.Property(e => e.ErrorMessage).HasMaxLength(500);
            entity.Property(e => e.Variables).HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
            );
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.StartedAt);
            entity.HasOne(e => e.WorkflowDefinition)
                  .WithMany(e => e.Instances)
                  .HasForeignKey(e => e.WorkflowDefinitionId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // WorkflowNode configuration
        modelBuilder.Entity<WorkflowNode>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NodeId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Configuration);
            entity.HasIndex(e => e.WorkflowDefinitionId);
            entity.HasOne(e => e.WorkflowDefinition)
                  .WithMany(e => e.Nodes)
                  .HasForeignKey(e => e.WorkflowDefinitionId)
                  .OnDelete(DeleteBehavior.Cascade);
            // Ignore navigation properties that can't be properly mapped
            entity.Ignore(e => e.SourceEdges);
            entity.Ignore(e => e.TargetEdges);
        });

        // WorkflowEdge configuration
        modelBuilder.Entity<WorkflowEdge>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EdgeId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.SourceNodeId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.TargetNodeId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Label).HasMaxLength(200);
            entity.Property(e => e.Condition);
            entity.HasIndex(e => e.WorkflowDefinitionId);
            entity.HasOne(e => e.WorkflowDefinition)
                  .WithMany(e => e.Edges)
                  .HasForeignKey(e => e.WorkflowDefinitionId)
                  .OnDelete(DeleteBehavior.Cascade);
            // Ignore navigation properties that can't be properly mapped
            entity.Ignore(e => e.SourceNode);
            entity.Ignore(e => e.TargetNode);
        });

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.Role).HasMaxLength(100);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Department);
            entity.HasIndex(e => e.Role);
            entity.HasIndex(e => e.Status);
        });

        // WorkflowTask configuration
        modelBuilder.Entity<WorkflowTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TaskId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.AssignedTo).HasMaxLength(100);
            entity.Property(e => e.CompletedBy).HasMaxLength(100);
            entity.Property(e => e.Result);
            entity.Property(e => e.NodeId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.AssignmentNotes).HasMaxLength(500);
            entity.HasIndex(e => e.WorkflowInstanceId);
            entity.HasIndex(e => e.AssignedToUserId);
            entity.HasIndex(e => e.AssignedTo);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Priority);
            entity.HasIndex(e => e.DueDate);
            entity.HasOne(e => e.WorkflowInstance)
                  .WithMany(e => e.Tasks)
                  .HasForeignKey(e => e.WorkflowInstanceId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.AssignedToUser)
                  .WithMany(u => u.AssignedTasks)
                  .HasForeignKey(e => e.AssignedToUserId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.CompletedByUser)
                  .WithMany(u => u.CompletedTasks)
                  .HasForeignKey(e => e.CompletedByUserId)
                  .OnDelete(DeleteBehavior.NoAction);
        });

        // WorkflowInstanceLog configuration
        modelBuilder.Entity<WorkflowInstanceLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NodeId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.NodeName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Message).IsRequired();
            entity.Property(e => e.Data);
            entity.Property(e => e.ExecutedBy).HasMaxLength(100);
            entity.Property(e => e.ErrorDetails);
            entity.HasIndex(e => e.WorkflowInstanceId);
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.Level);
            entity.HasOne(e => e.WorkflowInstance)
                  .WithMany(e => e.ExecutionLog)
                  .HasForeignKey(e => e.WorkflowInstanceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ServiceConfiguration configuration
        modelBuilder.Entity<ServiceConfiguration>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Endpoint).HasMaxLength(500);
            entity.Property(e => e.Method).HasMaxLength(10);
            entity.Property(e => e.Headers);
            entity.Property(e => e.Parameters);
            entity.Property(e => e.Authentication);
            entity.Property(e => e.ValidationSchema);
            entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.UpdatedBy).HasMaxLength(100);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.Type);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.CreatedAt);
        });

        // ServiceExecutionResult configuration
        modelBuilder.Entity<ServiceExecutionResult>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NodeId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ServiceName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.RequestData);
            entity.Property(e => e.ResponseData);
            entity.Property(e => e.ErrorMessage);
            entity.Property(e => e.ErrorDetails);
            entity.HasIndex(e => e.WorkflowInstanceId);
            entity.HasIndex(e => e.NodeId);
            entity.HasIndex(e => e.ServiceName);
            entity.HasIndex(e => e.ServiceType);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.StartedAt);
            entity.HasIndex(e => e.IsSuccess);
            entity.HasOne(e => e.WorkflowInstance)
                  .WithMany()
                  .HasForeignKey(e => e.WorkflowInstanceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
