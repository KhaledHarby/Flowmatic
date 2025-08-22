export interface UserDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  role?: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  activeTaskCount: number;
  completedTaskCount: number;
  overdueTaskCount: number;
}

export interface CreateUserDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  role?: string;
  password: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  department?: string;
  role?: string;
  status?: UserStatus;
}

export interface AssignTaskDto {
  taskId: string;
  assignedToUserId: string;
  assignmentNotes?: string;
  dueDate?: string;
  priority: TaskPriority;
}

export interface ReassignTaskDto {
  taskId: string;
  newAssignedToUserId: string;
  reassignmentReason?: string;
  newDueDate?: string;
}

export interface TaskAssignmentDto {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToUserId?: string;
  assignedToName: string;
  assignedAt?: string;
  dueDate?: string;
  createdAt: string;
  assignmentType: TaskAssignmentType;
  assignmentNotes?: string;
  workflowInstanceId: string;
  nodeId: string;
}

export interface UserTaskSummaryDto {
  userId: string;
  userName: string;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageCompletionTime: number; // in hours
  recentTasks: TaskAssignmentDto[];
}

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended',
  Pending = 'Pending'
}

export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Overdue = 'Overdue',
  Reassigned = 'Reassigned'
}

export enum TaskPriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Critical = 'Critical'
}

export enum TaskAssignmentType {
  Manual = 'Manual',
  Automatic = 'Automatic',
  RoundRobin = 'RoundRobin',
  LoadBalanced = 'LoadBalanced',
  RoleBased = 'RoleBased'
}


