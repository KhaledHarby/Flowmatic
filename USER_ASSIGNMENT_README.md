# User Assignment to Tasks - Implementation Guide

This document describes the comprehensive user assignment system implemented in FlowMaster for managing task assignments to users.

## 🎯 Overview

The user assignment system provides:
- **User Management**: Create, update, and manage users with roles and departments
- **Task Assignment**: Assign tasks to specific users with priorities and due dates
- **Assignment Strategies**: Automatic assignment based on workload and availability
- **Task Tracking**: Monitor task status, completion, and reassignment
- **User Analytics**: Track user performance and task statistics

## 🏗️ Architecture

### Backend Components

#### 1. Domain Entities
- **`User`**: Core user entity with profile information
- **`WorkflowTask`**: Enhanced task entity with assignment properties
- **`UserStatus`**: Enum for user states (Active, Inactive, Suspended, Pending)
- **`TaskAssignmentType`**: Enum for assignment strategies

#### 2. DTOs (Data Transfer Objects)
- **`UserDto`**: User data for API responses
- **`CreateUserDto`**: User creation request
- **`UpdateUserDto`**: User update request
- **`AssignTaskDto`**: Task assignment request
- **`ReassignTaskDto`**: Task reassignment request
- **`TaskAssignmentDto`**: Task assignment details
- **`UserTaskSummaryDto`**: User performance summary

#### 3. Services
- **`IUserService`**: Interface defining user and task assignment operations
- **`UserService`**: Implementation with business logic for:
  - User CRUD operations
  - Task assignment and reassignment
  - Assignment strategies (round-robin, load balancing)
  - Task completion and cancellation
  - User performance analytics

#### 4. Controllers
- **`UsersController`**: REST API endpoints for:
  - User management (CRUD operations)
  - Task assignment operations
  - Assignment strategies
  - Task completion workflows

### Frontend Components

#### 1. Services
- **`userService.ts`**: Frontend service for API communication
- **`apiService.ts`**: Enhanced with user assignment capabilities

#### 2. Components
- **`Users.tsx`**: User management interface
- **`TaskAssignmentDialog.tsx`**: Task assignment dialog
- **`Layout.tsx`**: Updated navigation with Users menu

#### 3. Types
- **`user.ts`**: TypeScript type definitions for all user-related data

## 🚀 Features

### 1. User Management

#### Create Users
```typescript
const newUser: CreateUserDto = {
  username: "john.doe",
  email: "john.doe@company.com",
  firstName: "John",
  lastName: "Doe",
  department: "Engineering",
  role: "Developer",
  password: "securePassword123"
};

await userService.createUser(newUser);
```

#### User Status Management
- **Active**: Can be assigned tasks
- **Inactive**: Cannot be assigned new tasks
- **Suspended**: Temporarily blocked
- **Pending**: Awaiting activation

### 2. Task Assignment

#### Manual Assignment
```typescript
const assignment: AssignTaskDto = {
  taskId: "task-123",
  assignedToUserId: "user-456",
  assignmentNotes: "Please review the code changes",
  dueDate: "2024-01-15T10:00:00Z",
  priority: TaskPriority.High
};

await userService.assignTask(assignment);
```

#### Automatic Assignment Strategies

##### Round Robin
```typescript
// Get next available user
const nextUser = await userService.getNextAvailableUser("Engineering", "Developer");
```

##### Load Balancing
```typescript
// Get least busy user
const leastBusyUser = await userService.getLeastBusyUser("Engineering", "Developer");
```

##### Auto Assignment
```typescript
// Automatically assign task to available user
await userService.autoAssignTask("task-123", "Engineering", "Developer");
```

### 3. Task Management

#### Task Status Tracking
- **Pending**: Assigned but not started
- **InProgress**: Currently being worked on
- **Completed**: Finished successfully
- **Cancelled**: Task cancelled
- **Overdue**: Past due date
- **Reassigned**: Moved to different user

#### Task Completion
```typescript
await userService.completeTask("task-123", "Code review completed successfully");
```

#### Task Reassignment
```typescript
const reassignment: ReassignTaskDto = {
  taskId: "task-123",
  newAssignedToUserId: "user-789",
  reassignmentReason: "Original assignee is on vacation",
  newDueDate: "2024-01-20T10:00:00Z"
};

await userService.reassignTask(reassignment);
```

### 4. Analytics & Reporting

#### User Task Summary
```typescript
const summary = await userService.getUserTaskSummary("user-123");
// Returns: totalTasks, pendingTasks, inProgressTasks, completedTasks, 
//          overdueTasks, averageCompletionTime, recentTasks
```

#### All Users Summary
```typescript
const allSummaries = await userService.getAllUsersTaskSummary();
// Returns performance metrics for all users
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Username NVARCHAR(100) UNIQUE NOT NULL,
    Email NVARCHAR(200) UNIQUE NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Department NVARCHAR(100),
    Role NVARCHAR(100),
    Status INT NOT NULL DEFAULT 0, -- UserStatus enum
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastLoginAt DATETIME2,
    IsActive BIT NOT NULL DEFAULT 1
);
```

### Enhanced WorkflowTasks Table
```sql
ALTER TABLE WorkflowTasks ADD
    AssignedToUserId UNIQUEIDENTIFIER,
    AssignedAt DATETIME2,
    AssignmentNotes NVARCHAR(500),
    ReminderSentAt DATETIME2,
    ReminderCount INT DEFAULT 0,
    AssignmentType INT DEFAULT 0, -- TaskAssignmentType enum
    CompletedByUserId UNIQUEIDENTIFIER;

-- Foreign key relationships
ALTER TABLE WorkflowTasks ADD CONSTRAINT FK_WorkflowTasks_AssignedToUser 
    FOREIGN KEY (AssignedToUserId) REFERENCES Users(Id);
ALTER TABLE WorkflowTasks ADD CONSTRAINT FK_WorkflowTasks_CompletedByUser 
    FOREIGN KEY (CompletedByUserId) REFERENCES Users(Id);
```

## 🔧 API Endpoints

### User Management
```
POST   /api/Users                    # Create user
GET    /api/Users                    # Get all users
GET    /api/Users/{id}               # Get user by ID
GET    /api/Users/username/{username} # Get user by username
PUT    /api/Users/{id}               # Update user
DELETE /api/Users/{id}               # Delete user
POST   /api/Users/{id}/activate      # Activate user
POST   /api/Users/{id}/deactivate    # Deactivate user
```

### Task Assignment
```
POST   /api/Users/tasks/assign       # Assign task to user
POST   /api/Users/tasks/reassign     # Reassign task
POST   /api/Users/tasks/{taskId}/unassign # Unassign task
GET    /api/Users/{userId}/tasks     # Get user's tasks
GET    /api/Users/tasks/unassigned   # Get unassigned tasks
POST   /api/Users/tasks/{taskId}/complete # Complete task
POST   /api/Users/tasks/{taskId}/cancel # Cancel task
```

### Analytics
```
GET    /api/Users/{userId}/tasks/summary    # User task summary
GET    /api/Users/tasks/summary             # All users summary
GET    /api/Users/next-available            # Next available user
GET    /api/Users/least-busy               # Least busy user
POST   /api/Users/tasks/{taskId}/auto-assign # Auto-assign task
```

## 🎨 Frontend Usage

### User Management Page
Navigate to `/users` to access the user management interface:

1. **View Users**: See all users with their status and task counts
2. **Create User**: Add new users with roles and departments
3. **Edit User**: Update user information and status
4. **Activate/Deactivate**: Manage user availability
5. **Delete User**: Remove users from the system

### Task Assignment in Workflow Designer
When designing workflows:

1. **Select Task Node**: Click on a task node in the workflow
2. **Open Assignment Dialog**: Use the assignment button
3. **Choose User**: Select from available active users
4. **Set Priority**: Choose task priority (Low, Normal, High, Critical)
5. **Set Due Date**: Optional deadline for the task
6. **Add Notes**: Provide context or instructions
7. **Assign**: Complete the assignment

### Task Assignment Strategies
- **Manual**: Select specific user
- **Automatic**: System chooses based on availability
- **Round Robin**: Distribute tasks evenly
- **Load Balanced**: Assign to least busy user
- **Role-Based**: Filter by department or role

## 🔒 Security Considerations

### User Authentication
- Password requirements (minimum 6 characters)
- Email validation
- Username uniqueness
- Status-based access control

### Task Assignment Security
- Only active users can be assigned tasks
- Assignment audit trail
- Reassignment reason tracking
- Completion verification

### Data Protection
- Soft delete for users (IsActive flag)
- Assignment history preservation
- Performance metrics privacy

## 🧪 Testing

### Backend Testing
```bash
# Run user service tests
dotnet test --filter "Category=UserService"

# Run task assignment tests
dotnet test --filter "Category=TaskAssignment"
```

### Frontend Testing
```bash
# Run user management tests
npm test -- --testPathPattern=Users

# Run task assignment tests
npm test -- --testPathPattern=TaskAssignment
```

## 📈 Performance Considerations

### Database Optimization
- Indexes on frequently queried fields
- Efficient user filtering by status
- Task assignment query optimization
- Summary calculation caching

### API Performance
- Pagination for large user lists
- Efficient task summary calculations
- Caching for user availability
- Background job processing for analytics

## 🔄 Future Enhancements

### Planned Features
1. **Advanced Assignment Rules**: Custom assignment logic
2. **Task Templates**: Predefined task configurations
3. **Notification System**: Email/SMS task notifications
4. **Mobile App**: Task management on mobile devices
5. **Integration APIs**: Connect with external HR systems
6. **Advanced Analytics**: Predictive workload analysis
7. **Team Management**: Group users into teams
8. **Skill-Based Assignment**: Match tasks to user skills

### Scalability Improvements
1. **Microservices**: Split user service into separate service
2. **Event Sourcing**: Track all assignment changes
3. **CQRS**: Separate read/write models
4. **Distributed Caching**: Redis for user data
5. **Message Queues**: Async task assignment processing

## 🐛 Troubleshooting

### Common Issues

#### User Not Found
```bash
# Check if user exists and is active
GET /api/Users/{userId}
```

#### Task Assignment Fails
```bash
# Verify user status is Active
GET /api/Users/{userId}

# Check user's current task load
GET /api/Users/{userId}/tasks/summary
```

#### Performance Issues
```bash
# Monitor database performance
SELECT * FROM Users WHERE Status = 0 AND IsActive = 1

# Check task assignment queries
SELECT * FROM WorkflowTasks WHERE AssignedToUserId IS NOT NULL
```

### Debug Logging
Enable detailed logging in `appsettings.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "FlowMaster.Application.Services.UserService": "Debug"
    }
  }
}
```

## 📚 Additional Resources

- [Entity Framework Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [ASP.NET Core API Best Practices](https://docs.microsoft.com/en-us/aspnet/core/web-api/)
- [Material-UI Components](https://mui.com/components/)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)

---

This implementation provides a robust foundation for user assignment in workflow management, with room for future enhancements and scalability improvements.


