export interface WorkflowInstanceDto {
  id: string;
  workflowDefinitionId: string;
  applicationId: string;
  status: WorkflowInstanceStatus;
  currentNodeId?: string;
  variables: Record<string, any>;
  executionLog: WorkflowInstanceLogDto[];
  startedAt: string;
  completedAt?: string;
  lastActivityAt?: string;
  startedBy?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  workflowDefinition?: WorkflowDefinitionDto;
  tasks: WorkflowTaskDto[];
}

export interface CreateWorkflowInstanceDto {
  workflowDefinitionId: string;
  applicationId: string;
  variables: Record<string, any>;
  startedBy?: string;
}

export interface WorkflowInstanceLogDto {
  id: string;
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  level: LogLevel;
  message: string;
  data?: string;
  timestamp: string;
  executedBy?: string;
  duration?: string;
  isError: boolean;
  errorDetails?: string;
}

export interface WorkflowTaskDto {
  id: string;
  taskId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  completedBy?: string;
  result: string;
  nodeId: string;
}

export interface CompleteTaskDto {
  taskId: string;
  completedBy: string;
  result: string;
}

export interface CancelInstanceDto {
  reason: string;
}

export interface TakeActionRequest {
  workflowDefinitionId: string;
  applicationId: string;
  action: string;
}

export interface WorkflowDefinitionDto {
  id: string;
  name: string;
  description?: string;
  category?: string;
  definitionJson: string;
  status: WorkflowStatus;
  version: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
  nodes: WorkflowNodeDto[];
  edges: WorkflowEdgeDto[];
}

export interface WorkflowNodeDto {
  id: string;
  nodeId: string;
  name: string;
  type: NodeType;
  configuration?: string;
  workflowDefinitionId: string;
}

export interface WorkflowEdgeDto {
  id: string;
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  condition?: string;
  workflowDefinitionId: string;
}

export enum WorkflowInstanceStatus {
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  Suspended = 'Suspended'
}

export enum WorkflowStatus {
  Draft = 'Draft',
  Active = 'Active',
  Inactive = 'Inactive',
  Archived = 'Archived'
}

export enum NodeType {
  Start = 'Start',
  End = 'End',
  Task = 'Task',
  Decision = 'Decision',
  Parallel = 'Parallel',
  SubProcess = 'SubProcess',
  Service = 'Service'
}

export enum LogLevel {
  Debug = 'Debug',
  Information = 'Information',
  Warning = 'Warning',
  Error = 'Error',
  Critical = 'Critical'
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
