import type { Node, Edge } from 'reactflow';

// API Configuration - prefers HTTPS 51057 by default; env can override
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:51057/api';

// Types matching backend DTOs
export interface WorkflowDefinitionDto {
  id: string;
  name: string;
  description: string;
  category: string;
  status: WorkflowStatus;
  definitionJson: string;
  nodes: WorkflowNodeDto[];
  edges: WorkflowEdgeDto[];
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  version: number;
  isActive: boolean;
}

export interface CreateWorkflowDefinitionDto {
  name: string;
  description: string;
  category: string;
  definitionJson: string;
  nodes: WorkflowNodeDto[];
  edges: WorkflowEdgeDto[];
}

export interface UpdateWorkflowDefinitionDto {
  name: string;
  description: string;
  category: string;
  definitionJson: string;
  nodes: WorkflowNodeDto[];
  edges: WorkflowEdgeDto[];
}

export interface WorkflowNodeDto {
  id: string;
  nodeId: string;
  name: string;
  type: NodeType;
  positionX: number;
  positionY: number;
  configuration: string;
  isStartNode: boolean;
  isEndNode: boolean;
  order: number;
}

export interface WorkflowEdgeDto {
  id: string;
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string;
  condition: string;
  order: number;
}

export enum WorkflowStatus {
  Draft = 'Draft',
  Published = 'Published',
  Archived = 'Archived'
}

export enum NodeType {
  StartNode = 'StartNode',
  EndNode = 'EndNode',
  TaskNode = 'TaskNode',
  DecisionNode = 'DecisionNode',
  ServiceNode = 'ServiceNode',
  ApprovalNode = 'ApprovalNode',
  DelayNode = 'DelayNode',
  NotificationNode = 'NotificationNode',
  ScriptNode = 'ScriptNode'
}

// API Service Class
class ApiService {
  private baseUrl: string;
  private readonly fallbacks: string[] = [
    'https://localhost:51057/api', // HTTPS profile
    'http://localhost:51058/api',  // HTTP profile
  ];

  constructor(baseUrl: string = RAW_API_BASE_URL) {
    this.baseUrl = this.normalizeBaseUrl(baseUrl);
    console.log('API Service initialized with base URL:', this.baseUrl);
  }

  private normalizeBaseUrl(input: string): string {
    // If someone configured http on the HTTPS port, force https
    try {
      const url = new URL(input);
      if (url.hostname === 'localhost' && url.port === '51057' && url.protocol === 'http:') {
        url.protocol = 'https:';
        return url.toString().replace(/\/$/, '');
      }
      // Ensure no trailing slash
      return input.replace(/\/$/, '');
    } catch {
      return 'https://localhost:51057/api';
    }
  }

  private buildCandidateBases(): string[] {
    const unique = new Set<string>();
    unique.add(this.baseUrl);
    for (const fb of this.fallbacks) unique.add(fb);
    return Array.from(unique);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // mode: 'cors' is default in browsers for cross-origin
    };

    const candidates = this.buildCandidateBases();
    let lastError: unknown = null;

    for (const base of candidates) {
      const url = `${base}${endpoint}`;
      console.log('Making API request to:', url);
      try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        console.log('API Response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => {
            return {} as any;
          });
          const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
          console.error('API Error:', errorMessage);
          lastError = new Error(errorMessage);
          continue; // try next candidate
        }

        const data = await response.json();
        // Lock onto the working base
        if (this.baseUrl !== base) {
          this.baseUrl = base;
          console.log('API base URL switched to:', this.baseUrl);
        }
        console.log('API Response data:', data);
        return data as T;
      } catch (error) {
        console.warn('API Request attempt failed for', base, error);
        lastError = error;
        continue; // try next candidate
      }
    }

    // All attempts failed
    if (lastError instanceof TypeError && (lastError as any).message?.includes('fetch')) {
      throw new Error(`Failed to connect to API. Tried: ${candidates.join(', ')}`);
    }
    throw lastError as any;
  }

  // Workflow Definition Operations
  async createWorkflowDefinition(dto: CreateWorkflowDefinitionDto): Promise<WorkflowDefinitionDto> {
    return this.request<WorkflowDefinitionDto>('/WorkflowDefinitions', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getAllWorkflowDefinitions(category?: string, status?: WorkflowStatus): Promise<WorkflowDefinitionDto[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/WorkflowDefinitions?${queryString}` : '/WorkflowDefinitions';
    
    return this.request<WorkflowDefinitionDto[]>(endpoint);
  }

  async getWorkflowDefinitionById(id: string): Promise<WorkflowDefinitionDto> {
    return this.request<WorkflowDefinitionDto>(`/WorkflowDefinitions/${id}`);
  }

  async updateWorkflowDefinition(id: string, dto: UpdateWorkflowDefinitionDto): Promise<WorkflowDefinitionDto> {
    return this.request<WorkflowDefinitionDto>(`/WorkflowDefinitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  async deleteWorkflowDefinition(id: string): Promise<void> {
    await this.request(`/WorkflowDefinitions/${id}`, {
      method: 'DELETE',
    });
  }

  async publishWorkflowDefinition(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/WorkflowDefinitions/${id}/publish`, {
      method: 'POST',
    });
  }

  async archiveWorkflowDefinition(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/WorkflowDefinitions/${id}/archive`, {
      method: 'POST',
    });
  }

  async validateWorkflowDefinition(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/WorkflowDefinitions/${id}/validate`, {
      method: 'POST',
    });
  }

  async createWorkflowVersion(id: string): Promise<WorkflowDefinitionDto> {
    return this.request<WorkflowDefinitionDto>(`/WorkflowDefinitions/${id}/version`, {
      method: 'POST',
    });
  }

  // Utility methods for converting between frontend and backend formats
  convertReactFlowToBackend(nodes: Node[], edges: Edge[]): {
    nodes: WorkflowNodeDto[];
    edges: WorkflowEdgeDto[];
    definitionJson: string;
  } {
    const workflowNodes: WorkflowNodeDto[] = nodes.map((node, index) => ({
      // Backend expects a GUID. Use Guid.Empty so server can assign new ids.
      id: '00000000-0000-0000-0000-000000000000',
      nodeId: node.id,
      name: node.data.label || node.data.name || `Node ${index + 1}`,
      type: this.mapNodeType(node.data.type || node.data.nodeType),
      positionX: node.position.x,
      positionY: node.position.y,
      configuration: JSON.stringify(node.data.config || {}),
      isStartNode: (node.data.type || node.data.nodeType) === 'start',
      isEndNode: (node.data.type || node.data.nodeType) === 'end',
      order: index,
    }));

    const workflowEdges: WorkflowEdgeDto[] = edges.map((edge, index) => ({
      // Backend expects a GUID. Use Guid.Empty so server can assign new ids.
      id: '00000000-0000-0000-0000-000000000000',
      edgeId: edge.id,
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
      label: edge.data?.label || '',
      condition: edge.data?.condition || '',
      order: index,
    }));

    const definitionJson = JSON.stringify({
      nodes: workflowNodes,
      edges: workflowEdges,
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
      },
    });

    return {
      nodes: workflowNodes,
      edges: workflowEdges,
      definitionJson,
    };
  }

  convertBackendToReactFlow(workflow: WorkflowDefinitionDto): {
    nodes: Node[];
    edges: Edge[];
  } {
    const nodes: Node[] = workflow.nodes.map((node) => ({
      id: node.nodeId,
      type: 'custom',
      position: { x: node.positionX, y: node.positionY },
      data: {
        label: node.name,
        type: this.mapBackendNodeType(node.type),
        description: '',
        enabled: true,
        config: JSON.parse(node.configuration || '{}'),
      },
    }));

    const edges: Edge[] = workflow.edges.map((edge) => ({
      id: edge.edgeId,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      type: 'custom',
      data: {
        label: edge.label,
        condition: edge.condition,
      },
    }));

    return { nodes, edges };
  }

  private mapNodeType(frontendType: string): NodeType {
    const typeMap: Record<string, NodeType> = {
      start: NodeType.StartNode,
      end: NodeType.EndNode,
      task: NodeType.TaskNode,
      condition: NodeType.DecisionNode,
      service: NodeType.ServiceNode,
      notification: NodeType.NotificationNode,
      timer: NodeType.DelayNode,
    };
    return typeMap[frontendType] || NodeType.TaskNode;
  }

  private mapBackendNodeType(backendType: NodeType): string {
    const typeMap: Record<NodeType, string> = {
      [NodeType.StartNode]: 'start',
      [NodeType.EndNode]: 'end',
      [NodeType.TaskNode]: 'task',
      [NodeType.DecisionNode]: 'condition',
      [NodeType.ServiceNode]: 'service',
      [NodeType.ApprovalNode]: 'task',
      [NodeType.DelayNode]: 'timer',
      [NodeType.NotificationNode]: 'notification',
      [NodeType.ScriptNode]: 'task',
    };
    return typeMap[backendType] || 'task';
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
