const API_BASE_URL = 'https://localhost:51057/api';

export interface ApplicationWorkflowInstance {
  id: string;
  workflowDefinitionId: string;
  applicationId: string;
  status: string;
  currentNodeId?: string;
  startedAt: string;
  completedAt?: string;
  lastActivityAt?: string;
  startedBy?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  variables: Record<string, any>;
  workflowDefinition?: {
    id: string;
    name: string;
    description?: string;
  };
  tasks: WorkflowTask[];
  executionLog: WorkflowLog[];
}

export interface WorkflowTask {
  id: string;
  taskId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  completedBy?: string;
  result: string;
  nodeId: string;
}

export interface WorkflowLog {
  id: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  level: string;
  message: string;
  data?: string;
  timestamp: string;
  executedBy?: string;
  duration?: string;
  isError: boolean;
  errorDetails?: string;
}

class ApplicationsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    console.log('Applications Service initialized with base URL:', this.baseUrl);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('Making API request to:', url);
    console.log('Request options:', options);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        mode: 'cors',
        credentials: 'omit',
        ...options,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response ok:', response.ok);

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
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the API server. Please ensure the backend is running and CORS is properly configured.');
      }
      throw error;
    }
  }

  async getAllApplications(): Promise<ApplicationWorkflowInstance[]> {
    try {
      return await this.request<ApplicationWorkflowInstance[]>('/workflowinstances');
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw new Error('Failed to fetch applications');
    }
  }

  async getApplicationById(id: string): Promise<ApplicationWorkflowInstance> {
    try {
      return await this.request<ApplicationWorkflowInstance>(`/workflowinstances/${id}`);
    } catch (error) {
      console.error('Error fetching application:', error);
      throw new Error('Failed to fetch application');
    }
  }

  async getApplicationTasks(instanceId: string): Promise<WorkflowTask[]> {
    try {
      const instance = await this.request<ApplicationWorkflowInstance>(`/workflowinstances/${instanceId}`);
      return instance.tasks || [];
    } catch (error) {
      console.error('Error fetching application tasks:', error);
      throw new Error('Failed to fetch application tasks');
    }
  }

  async getApplicationLogs(instanceId: string): Promise<WorkflowLog[]> {
    try {
      return await this.request<WorkflowLog[]>(`/workflowinstances/${instanceId}/logs`);
    } catch (error) {
      console.error('Error fetching application logs:', error);
      throw new Error('Failed to fetch application logs');
    }
  }

  async cancelApplication(instanceId: string, reason: string): Promise<void> {
    try {
      await this.request<void>(`/workflowinstances/${instanceId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    } catch (error) {
      console.error('Error cancelling application:', error);
      throw new Error('Failed to cancel application');
    }
  }

  async retryApplication(instanceId: string): Promise<void> {
    try {
      await this.request<void>(`/workflowinstances/${instanceId}/retry`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error retrying application:', error);
      throw new Error('Failed to retry application');
    }
  }
}

const applicationsService = new ApplicationsService();
export default applicationsService;
