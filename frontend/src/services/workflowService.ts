import type { WorkflowDefinition, WorkflowInstance } from '../store/slices/workflowSlice';

// Mock data for workflow definitions
const mockWorkflows: WorkflowDefinition[] = [
  {
    id: '1',
    name: 'Order Processing Workflow',
    description: 'Automated order processing and fulfillment workflow',
    version: '1.0.0',
    status: 'Active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    nodes: [],
    edges: []
  },
  {
    id: '2',
    name: 'Customer Onboarding',
    description: 'New customer registration and verification process',
    version: '2.1.0',
    status: 'Active',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    nodes: [],
    edges: []
  },
  {
    id: '3',
    name: 'Invoice Generation',
    description: 'Automated invoice creation and sending workflow',
    version: '1.5.0',
    status: 'Draft',
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z',
    nodes: [],
    edges: []
  },
  {
    id: '4',
    name: 'Support Ticket Processing',
    description: 'Customer support ticket routing and resolution',
    version: '1.2.0',
    status: 'Active',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-22T13:20:00Z',
    nodes: [],
    edges: []
  },
  {
    id: '5',
    name: 'Data Backup Workflow',
    description: 'Automated data backup and verification process',
    version: '1.0.0',
    status: 'Inactive',
    createdAt: '2024-01-08T07:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    nodes: [],
    edges: []
  }
];

// Mock data for workflow instances
const mockInstances: WorkflowInstance[] = [
  {
    id: '1',
    workflowId: '1',
    workflowName: 'Order Processing Workflow',
    status: 'Running',
    currentStep: 'Payment Verification',
    progress: 65,
    startedAt: '2024-01-20T10:30:00Z',
    duration: '2h 15m',
    lastActivity: '2024-01-20T12:45:00Z',
    priority: 'High',
    description: 'Processing order #ORD-2024-001'
  },
  {
    id: '2',
    workflowId: '2',
    workflowName: 'Customer Onboarding',
    status: 'Completed',
    currentStep: 'Account Activation',
    progress: 100,
    startedAt: '2024-01-19T14:00:00Z',
    completedAt: '2024-01-19T15:30:00Z',
    duration: '1h 30m',
    lastActivity: '2024-01-19T15:30:00Z',
    priority: 'Medium',
    description: 'Onboarding for customer john.doe@example.com'
  },
  {
    id: '3',
    workflowId: '1',
    workflowName: 'Order Processing Workflow',
    status: 'Failed',
    currentStep: 'Inventory Check',
    progress: 25,
    startedAt: '2024-01-20T09:00:00Z',
    duration: '45m',
    lastActivity: '2024-01-20T09:45:00Z',
    priority: 'Critical',
    description: 'Processing order #ORD-2024-002'
  },
  {
    id: '4',
    workflowId: '4',
    workflowName: 'Support Ticket Processing',
    status: 'Suspended',
    currentStep: 'Technical Review',
    progress: 80,
    startedAt: '2024-01-20T08:00:00Z',
    duration: '3h 20m',
    lastActivity: '2024-01-20T11:20:00Z',
    priority: 'Medium',
    description: 'Ticket #TKT-2024-005 - Database connection issue'
  },
  {
    id: '5',
    workflowId: '2',
    workflowName: 'Customer Onboarding',
    status: 'Running',
    currentStep: 'Document Verification',
    progress: 40,
    startedAt: '2024-01-20T13:00:00Z',
    duration: '1h 45m',
    lastActivity: '2024-01-20T14:45:00Z',
    priority: 'Low',
    description: 'Onboarding for customer jane.smith@example.com'
  }
];

// Workflow Definitions API
export const getWorkflowDefinitions = async (): Promise<WorkflowDefinition[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockWorkflows;
};

export const createWorkflowDefinition = async (workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newWorkflow: WorkflowDefinition = {
    ...workflow,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockWorkflows.push(newWorkflow);
  return newWorkflow;
};

export const updateWorkflowDefinition = async (id: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockWorkflows.findIndex(w => w.id === id);
  if (index === -1) throw new Error('Workflow not found');
  
  mockWorkflows[index] = {
    ...mockWorkflows[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return mockWorkflows[index];
};

export const deleteWorkflowDefinition = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockWorkflows.findIndex(w => w.id === id);
  if (index === -1) throw new Error('Workflow not found');
  mockWorkflows.splice(index, 1);
};

// Workflow Instances API
export const getWorkflowInstances = async (): Promise<WorkflowInstance[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockInstances;
};

export const createWorkflowInstance = async (instance: Omit<WorkflowInstance, 'id' | 'startedAt'>): Promise<WorkflowInstance> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newInstance: WorkflowInstance = {
    ...instance,
    id: Date.now().toString(),
    startedAt: new Date().toISOString(),
  };
  mockInstances.push(newInstance);
  return newInstance;
};

export const updateWorkflowInstance = async (id: string, updates: Partial<WorkflowInstance>): Promise<WorkflowInstance> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockInstances.findIndex(i => i.id === id);
  if (index === -1) throw new Error('Instance not found');
  
  mockInstances[index] = {
    ...mockInstances[index],
    ...updates,
  };
  return mockInstances[index];
};

export const deleteWorkflowInstance = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockInstances.findIndex(i => i.id === id);
  if (index === -1) throw new Error('Instance not found');
  mockInstances.splice(index, 1);
};

// Instance Actions
export const suspendInstance = async (id: string): Promise<WorkflowInstance> => {
  return updateWorkflowInstance(id, { status: 'Suspended' });
};

export const resumeInstance = async (id: string): Promise<WorkflowInstance> => {
  return updateWorkflowInstance(id, { status: 'Running' });
};

export const cancelInstance = async (id: string): Promise<WorkflowInstance> => {
  return updateWorkflowInstance(id, { 
    status: 'Cancelled',
    completedAt: new Date().toISOString()
  });
};

export const retryInstance = async (id: string): Promise<WorkflowInstance> => {
  return updateWorkflowInstance(id, { 
    status: 'Running',
    progress: 0,
    currentStep: 'Start'
  });
};

// Dashboard Statistics
export const getDashboardStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const totalWorkflows = mockWorkflows.length;
  const activeWorkflows = mockWorkflows.filter(w => w.status === 'Active').length;
  const runningInstances = mockInstances.filter(i => i.status === 'Running').length;
  const completedInstances = mockInstances.filter(i => i.status === 'Completed').length;
  const failedInstances = mockInstances.filter(i => i.status === 'Failed').length;
  
  const recentInstances = mockInstances
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 5);
  
  return {
    totalWorkflows,
    activeWorkflows,
    runningInstances,
    completedInstances,
    failedInstances,
    recentInstances,
  };
};
