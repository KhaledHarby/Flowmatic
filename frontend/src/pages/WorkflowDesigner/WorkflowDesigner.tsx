import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import {
  Add,
  Save,
  PlayArrow,
  Settings,
  Code,
  DataObject,
  Api,
  Storage,
  Email,
  Notifications,
  Schedule,
  FilterAlt,
  Loop,
  CallMerge,
  CallSplit,
  PlayArrow as StartIcon,
  Stop,
  ExpandMore,
  Edit,
  Delete,
  LibraryBooks
} from '@mui/icons-material';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  ReactFlowProvider
} from 'reactflow';
import type { Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './components/CustomNode';
import CustomEdge from './components/CustomEdge';
import NodeConfigPanel from './components/NodeConfigPanel';
import EdgeConfigPanel from './components/EdgeConfigPanel';
import ServiceConfigDialog from './components/ServiceConfigDialog';
import ExampleLoader from './components/ExampleLoader';
import WorkflowActions from './components/WorkflowActions';
import type { ExampleWorkflow } from '../../examples/EmployeeOnboardingExample';
import apiService, { type WorkflowDefinitionDto } from '../../services/apiService';



const nodeTypesList = [
  { type: 'start', label: 'Start', icon: <StartIcon /> },
  { type: 'end', label: 'End', icon: <Stop /> },
  { type: 'task', label: 'Task', icon: <Code /> },
  { type: 'service', label: 'Service', icon: <Api /> },
  { type: 'database', label: 'Database', icon: <Storage /> },
  { type: 'email', label: 'Email', icon: <Email /> },
  { type: 'notification', label: 'Notification', icon: <Notifications /> },
  { type: 'timer', label: 'Timer', icon: <Schedule /> },
  { type: 'condition', label: 'Condition', icon: <FilterAlt /> },
  { type: 'loop', label: 'Loop', icon: <Loop /> },
  { type: 'split', label: 'Split', icon: <CallSplit /> },
  { type: 'merge', label: 'Merge', icon: <CallMerge /> },
];

interface WorkflowDesignerProps {
  workflow?: any;
  onSave?: (workflow: any) => void;
}

const WorkflowDesignerContent: React.FC<WorkflowDesignerProps> = ({ workflow, onSave }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [nodeConfigOpen, setNodeConfigOpen] = useState(false);
  const [edgeConfigOpen, setEdgeConfigOpen] = useState(false);
  const [serviceConfigOpen, setServiceConfigOpen] = useState(false);
  const [exampleLoaderOpen, setExampleLoaderOpen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowDefinitionDto | undefined>(undefined);

  // Memoize node and edge types to prevent ReactFlow warnings
  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), []);

  useEffect(() => {
    if (workflow) {
      console.log('Loading workflow:', workflow);
      setNodes(workflow.nodes || []);
      setEdges(workflow.edges || []);
    } else {
      console.log('No workflow provided, starting with empty canvas');
      setNodes([]);
      setEdges([]);
    }
  }, [workflow, setNodes, setEdges]);

  // Load workflow from backend if ID is provided in URL
  useEffect(() => {
    const loadWorkflowFromBackend = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const workflowId = urlParams.get('id');
      
      if (workflowId && !currentWorkflow) {
        try {
          const workflow = await apiService.getWorkflowDefinitionById(workflowId);
          const { nodes: reactFlowNodes, edges: reactFlowEdges } = apiService.convertBackendToReactFlow(workflow);
          setNodes(reactFlowNodes);
          setEdges(reactFlowEdges);
          setCurrentWorkflow(workflow);
        } catch (error) {
          console.error('Failed to load workflow:', error);
          setSnackbar({
            open: true,
            message: 'Failed to load workflow from backend',
            severity: 'error'
          });
        }
      }
    };

    loadWorkflowFromBackend();
  }, [currentWorkflow, setNodes, setEdges]);

  // Debug effect to monitor nodes and edges changes
  useEffect(() => {
    console.log('Nodes updated:', nodes.length, nodes);
  }, [nodes]);

  useEffect(() => {
    console.log('Edges updated:', edges.length, edges);
  }, [edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const newEdge: Edge = {
          id: `edge-${Date.now()}`,
          source: params.source,
          target: params.target,
          type: 'custom',
          data: {
            label: '',
            condition: '',
            service: null
          }
        };
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [setEdges]
  );

  const onNodeDragStop = useCallback(
    (event: any, node: Node) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return { ...n, position: node.position };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  const addNode = (type: string) => {
    console.log('Adding node of type:', type);
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        type,
        label: `New ${type}`,
        description: '',
        enabled: true,
        config: {},
        services: []
      }
    };
    console.log('Created node:', newNode);
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  };

  const deleteEdge = (edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  };

  const updateNode = (nodeId: string, updates: any) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, ...updates } };
        }
        return n;
      })
    );
  };

  const updateEdge = (edgeId: string, updates: any) => {
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === edgeId) {
          return { ...e, data: { ...e.data, ...updates } };
        }
        return e;
      })
    );
  };

  const openServiceConfig = () => {
    setServiceConfigOpen(true);
  };

  const loadExample = (example: ExampleWorkflow) => {
    // Simple direct approach - just set the nodes and edges
    const simpleNodes = example.nodes.map(node => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: {
        label: node.data.label,
        type: node.data.nodeType || 'task',
        description: node.data.description || '',
        enabled: true,
        config: node.data.config || {}
      }
    }));

    const simpleEdges = example.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'custom',
      data: edge.data || {}
    }));

    console.log('Setting nodes:', simpleNodes.length);
    console.log('Setting edges:', simpleEdges.length);
    
    setNodes(simpleNodes);
    setEdges(simpleEdges);
    
    // Close the example loader
    setExampleLoaderOpen(false);
    
    setSnackbar({
      open: true,
      message: `Loaded: ${example.name}`,
      severity: 'success'
    });
  };

  const handleWorkflowSaved = (workflow: WorkflowDefinitionDto) => {
    setCurrentWorkflow(workflow);
    setSnackbar({
      open: true,
      message: 'Workflow saved successfully!',
      severity: 'success'
    });
  };

  const handleWorkflowUpdated = (workflow: WorkflowDefinitionDto) => {
    setCurrentWorkflow(workflow);
    setSnackbar({
      open: true,
      message: 'Workflow updated successfully!',
      severity: 'success'
    });
  };

  const handleWorkflowDeleted = () => {
    setCurrentWorkflow(undefined);
    setNodes([]);
    setEdges([]);
    setSnackbar({
      open: true,
      message: 'Workflow deleted successfully!',
      severity: 'success'
    });
  };

  const onNodeClick = useCallback((event: any, node: Node) => {
    console.log('Node clicked:', node);
    setSelectedNode(node);
    setSelectedEdge(null);
    setNodeConfigOpen(true);
  }, []);

  const onEdgeClick = useCallback((event: any, edge: Edge) => {
    console.log('Edge clicked:', edge);
    setSelectedEdge(edge);
    setSelectedNode(null);
    setEdgeConfigOpen(true);
  }, []);

  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden' }}>
        {/* Node Palette */}
        <Card sx={{ width: 250, mr: 2, height: 'fit-content', flexShrink: 0 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Node Types
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {nodeTypesList.map((nodeType) => (
                <Button
                  key={nodeType.type}
                  variant="outlined"
                  startIcon={nodeType.icon}
                  onClick={() => addNode(nodeType.type)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {nodeType.label}
                </Button>
              ))}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Examples
            </Typography>
            <Button
              variant="outlined"
              startIcon={<LibraryBooks />}
              onClick={() => setExampleLoaderOpen(true)}
              sx={{ justifyContent: 'flex-start', mb: 1 }}
            >
              Load Example
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                // Test with a simple example
                const testExample = {
                  name: "Test Example",
                  description: "Simple test workflow",
                  category: "Test",
                  nodes: [
                    {
                      id: 'test-start',
                      type: 'custom',
                      position: { x: 100, y: 100 },
                      data: {
                        label: 'Test Start',
                        nodeType: 'start',
                        description: 'Test start node'
                      }
                    },
                    {
                      id: 'test-task',
                      type: 'custom',
                      position: { x: 300, y: 100 },
                      data: {
                        label: 'Test Task',
                        nodeType: 'task',
                        description: 'Test task node'
                      }
                    }
                  ],
                  edges: [
                    {
                      id: 'test-edge',
                      source: 'test-start',
                      target: 'test-task',
                      type: 'custom',
                      data: { label: 'Test Connection' }
                    }
                  ]
                };
                loadExample(testExample);
              }}
              sx={{ justifyContent: 'flex-start' }}
            >
              Test Load
            </Button>
          </CardContent>
        </Card>

        {/* Workflow Actions */}
        <Card sx={{ width: 250, mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Workflow Actions
            </Typography>
            <WorkflowActions
              nodes={nodes}
              edges={edges}
              currentWorkflow={currentWorkflow}
              onWorkflowSaved={handleWorkflowSaved}
              onWorkflowUpdated={handleWorkflowUpdated}
              onWorkflowDeleted={handleWorkflowDeleted}
            />
          </CardContent>
        </Card>

        {/* React Flow Canvas */}
        <Box sx={{ flexGrow: 1, position: 'relative', height: '100vh', minWidth: 0 }}>
          {nodes.length === 0 && (
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 1
            }}>
              <Typography variant="h6" color="text.secondary">
                No nodes loaded. Click "Load Example" to get started.
              </Typography>
            </Box>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            onInit={(instance) => {
              console.log('ReactFlow initialized');
              setReactFlowInstance(instance);
            }}
            onLoad={() => console.log('ReactFlow loaded, nodes:', nodes.length, 'edges:', edges.length)}
          >
            <Controls />
            <Background />
            <MiniMap />
            <Panel position="top-right">
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrow />}
                >
                  Test
                </Button>
              </Box>
            </Panel>
          </ReactFlow>
        </Box>

        {/* Configuration Panels */}
        {selectedNode && (
          <NodeConfigPanel
            open={nodeConfigOpen}
            node={selectedNode}
            onClose={() => {
              setNodeConfigOpen(false);
              setSelectedNode(null);
            }}
            onSave={(updates) => {
              updateNode(selectedNode.id, updates);
              setNodeConfigOpen(false);
              setSelectedNode(null);
            }}
            onServiceConfig={openServiceConfig}
            onDelete={() => {
              deleteNode(selectedNode.id);
              setNodeConfigOpen(false);
              setSelectedNode(null);
            }}
          />
        )}

        {selectedEdge && (
          <EdgeConfigPanel
            open={edgeConfigOpen}
            edge={selectedEdge}
            onClose={() => {
              setEdgeConfigOpen(false);
              setSelectedEdge(null);
            }}
            onSave={(updates) => {
              updateEdge(selectedEdge.id, updates);
              setEdgeConfigOpen(false);
              setSelectedEdge(null);
            }}
            onServiceConfig={openServiceConfig}
            onDelete={() => {
              deleteEdge(selectedEdge.id);
              setEdgeConfigOpen(false);
              setSelectedEdge(null);
            }}
          />
        )}

        <ServiceConfigDialog
          open={serviceConfigOpen}
          onClose={() => setServiceConfigOpen(false)}
          onSave={(service) => {
            // Handle service configuration
            setServiceConfigOpen(false);
          }}
        />

        <ExampleLoader
          open={exampleLoaderOpen}
          onClose={() => setExampleLoaderOpen(false)}
          onLoadExample={loadExample}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
  );
};

const WorkflowDesigner: React.FC<WorkflowDesignerProps> = (props) => (
  <ReactFlowProvider>
    <WorkflowDesignerContent {...props} />
  </ReactFlowProvider>
);

export default WorkflowDesigner;
