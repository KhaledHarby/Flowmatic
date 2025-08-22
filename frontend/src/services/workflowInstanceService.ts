import type {
  WorkflowInstanceDto,
  CreateWorkflowInstanceDto,
  WorkflowInstanceLogDto,
  CompleteTaskDto,
  CancelInstanceDto
} from '../types/workflowInstance';

const API_BASE_URL = 'https://localhost:51057/api';

class WorkflowInstanceService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    console.log('Workflow Instance Service initialized with base URL:', this.baseUrl);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/WorkflowInstances${endpoint}`;
    console.log('Making API request to:', url);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Request failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Get all workflow instances
  async getAllInstances(): Promise<WorkflowInstanceDto[]> {
    return this.request<WorkflowInstanceDto[]>('');
  }

  // Get workflow instance by ID
  async getInstanceById(id: string): Promise<WorkflowInstanceDto> {
    return this.request<WorkflowInstanceDto>(`/${id}`);
  }

  // Start a new workflow instance
  async startInstance(instance: CreateWorkflowInstanceDto): Promise<WorkflowInstanceDto> {
    return this.request<WorkflowInstanceDto>('', {
      method: 'POST',
      body: JSON.stringify(instance),
    });
  }

  // Complete a task in a workflow instance
  async completeTask(instanceId: string, taskData: CompleteTaskDto): Promise<void> {
    return this.request<void>(`/${instanceId}/complete-task`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  // Cancel a workflow instance
  async cancelInstance(instanceId: string, reason: string): Promise<void> {
    const cancelData: CancelInstanceDto = { reason };
    return this.request<void>(`/${instanceId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(cancelData),
    });
  }

  // Suspend a workflow instance
  async suspendInstance(instanceId: string): Promise<void> {
    return this.request<void>(`/${instanceId}/suspend`, {
      method: 'POST',
    });
  }

  // Resume a workflow instance
  async resumeInstance(instanceId: string): Promise<void> {
    return this.request<void>(`/${instanceId}/resume`, {
      method: 'POST',
    });
  }

  // Retry a failed workflow instance
  async retryInstance(instanceId: string): Promise<void> {
    return this.request<void>(`/${instanceId}/retry`, {
      method: 'POST',
    });
  }

  // Get execution logs for a workflow instance
  async getInstanceLogs(instanceId: string): Promise<WorkflowInstanceLogDto[]> {
    return this.request<WorkflowInstanceLogDto[]>(`/${instanceId}/logs`);
  }

  // Take action by workflow definition and application id
  async takeAction(payload: { workflowDefinitionId: string; applicationId: string; action: string }): Promise<WorkflowInstanceDto> {
    return this.request<WorkflowInstanceDto>(`/take-action`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Helper method to calculate progress percentage
  calculateProgress(instance: WorkflowInstanceDto): number {
    if (!instance.workflowDefinition?.nodes?.length) return 0;
    
    const totalNodes = instance.workflowDefinition.nodes.length;
    const completedNodes = instance.executionLog.filter(log => 
      log.level === 'Information' && !log.isError
    ).length;
    
    return Math.round((completedNodes / totalNodes) * 100);
  }

  // Helper method to get current step name
  getCurrentStep(instance: WorkflowInstanceDto): string {
    if (!instance.currentNodeId) return 'Not Started';
    
    const currentNode = instance.workflowDefinition?.nodes?.find(
      node => node.nodeId === instance.currentNodeId
    );
    
    if (currentNode) {
      return currentNode.name;
    }
    
    // If node not found, try to get from execution log
    const lastLog = instance.executionLog
      .filter(log => log.nodeId === instance.currentNodeId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    return lastLog?.nodeName || `Node: ${instance.currentNodeId}`;
  }

  // Helper method to format duration
  formatDuration(startedAt: string, completedAt?: string): string {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Helper method to get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'Running': return 'primary';
      case 'Completed': return 'success';
      case 'Failed': return 'error';
      case 'Suspended': return 'warning';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
  }
}

const workflowInstanceService = new WorkflowInstanceService();
export default workflowInstanceService;
