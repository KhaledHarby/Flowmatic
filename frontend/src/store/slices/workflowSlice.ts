import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; [key: string]: any };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'Draft' | 'Published' | 'Archived';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  createdBy: string;
}

export interface WorkflowInstance {
  id: string;
  workflowDefinitionId: string;
  applicationId: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Cancelled' | 'Suspended';
  currentNodeId?: string;
  variables: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  startedBy?: string;
}

interface WorkflowState {
  definitions: WorkflowDefinition[];
  instances: WorkflowInstance[];
  selectedDefinition: WorkflowDefinition | null;
  selectedInstance: WorkflowInstance | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkflowState = {
  definitions: [],
  instances: [],
  selectedDefinition: null,
  selectedInstance: null,
  loading: false,
  error: null,
};

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setDefinitions: (state, action: PayloadAction<WorkflowDefinition[]>) => {
      state.definitions = action.payload;
    },
    addDefinition: (state, action: PayloadAction<WorkflowDefinition>) => {
      state.definitions.push(action.payload);
    },
    updateDefinition: (state, action: PayloadAction<WorkflowDefinition>) => {
      const index = state.definitions.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.definitions[index] = action.payload;
      }
    },
    deleteDefinition: (state, action: PayloadAction<string>) => {
      state.definitions = state.definitions.filter(d => d.id !== action.payload);
    },
    setInstances: (state, action: PayloadAction<WorkflowInstance[]>) => {
      state.instances = action.payload;
    },
    addInstance: (state, action: PayloadAction<WorkflowInstance>) => {
      state.instances.push(action.payload);
    },
    updateInstance: (state, action: PayloadAction<WorkflowInstance>) => {
      const index = state.instances.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.instances[index] = action.payload;
      }
    },
    setSelectedDefinition: (state, action: PayloadAction<WorkflowDefinition | null>) => {
      state.selectedDefinition = action.payload;
    },
    setSelectedInstance: (state, action: PayloadAction<WorkflowInstance | null>) => {
      state.selectedInstance = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setDefinitions,
  addDefinition,
  updateDefinition,
  deleteDefinition,
  setInstances,
  addInstance,
  updateInstance,
  setSelectedDefinition,
  setSelectedInstance,
} = workflowSlice.actions;

export default workflowSlice.reducer;
