import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'Active' | 'Inactive' | 'Draft';
  createdAt: string;
  updatedAt: string;
  nodes: any[];
  edges: any[];
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Suspended' | 'Cancelled';
  currentStep: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
  duration: string;
  lastActivity: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: {
    condition?: string;
    service?: any;
    [key: string]: any;
  };
}

interface WorkflowState {
  definitions: WorkflowDefinition[];
  instances: WorkflowInstance[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkflowState = {
  definitions: [],
  instances: [],
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
    setInstances: (state, action: PayloadAction<WorkflowInstance[]>) => {
      state.instances = action.payload;
    },
    addDefinition: (state, action: PayloadAction<WorkflowDefinition>) => {
      state.definitions.push(action.payload);
    },
    updateDefinition: (state, action: PayloadAction<WorkflowDefinition>) => {
      const index = state.definitions.findIndex(def => def.id === action.payload.id);
      if (index !== -1) {
        state.definitions[index] = action.payload;
      }
    },
    deleteDefinition: (state, action: PayloadAction<string>) => {
      state.definitions = state.definitions.filter(def => def.id !== action.payload);
    },
    addInstance: (state, action: PayloadAction<WorkflowInstance>) => {
      state.instances.push(action.payload);
    },
    updateInstance: (state, action: PayloadAction<WorkflowInstance>) => {
      const index = state.instances.findIndex(inst => inst.id === action.payload.id);
      if (index !== -1) {
        state.instances[index] = action.payload;
      }
    },
    deleteInstance: (state, action: PayloadAction<string>) => {
      state.instances = state.instances.filter(inst => inst.id !== action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  setDefinitions,
  setInstances,
  addDefinition,
  updateDefinition,
  deleteDefinition,
  addInstance,
  updateInstance,
  deleteInstance,
} = workflowSlice.actions;

export default workflowSlice.reducer;
