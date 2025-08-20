import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as TestIcon,
  Publish as PublishIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitScreenIcon,
} from '@mui/icons-material';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import NodePalette from './components/NodePalette';
import PropertiesPanel from './components/PropertiesPanel';
import { useWorkflowDesigner } from './hooks/useWorkflowDesigner';
import { nodeTypes } from './nodeTypes';
import { edgeTypes } from './edgeTypes';

const WorkflowDesigner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewWorkflow = !id;

  const {
    workflow,
    loading,
    saveWorkflow,
    testWorkflow,
    publishWorkflow,
    validationErrors,
  } = useWorkflowDesigner(id);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    workflow?.nodes || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    workflow?.edges || []
  );

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const handleSave = async () => {
    try {
      await saveWorkflow({
        nodes,
        edges,
        name: workflow?.name || 'New Workflow',
        description: workflow?.description || '',
        category: workflow?.category || 'General',
      });
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  const handleTest = async () => {
    try {
      await testWorkflow();
    } catch (error) {
      console.error('Failed to test workflow:', error);
    }
  };

  const handlePublish = async () => {
    try {
      await publishWorkflow();
    } catch (error) {
      console.error('Failed to publish workflow:', error);
    }
  };

  const handleBack = () => {
    navigate('/workflows');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading workflow designer...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Button variant="outlined" onClick={handleBack}>
              Back to Workflows
            </Button>
          </Grid>
          <Grid item xs />
          <Grid item>
            <Tooltip title="Undo">
              <IconButton>
                <UndoIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Redo">
              <IconButton>
                <RedoIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Zoom In">
              <IconButton>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Zoom Out">
              <IconButton>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Fit to Screen">
              <IconButton>
                <FitScreenIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={validationErrors.length > 0}
            >
              Save
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<TestIcon />}
              onClick={handleTest}
              disabled={validationErrors.length > 0}
            >
              Test
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="success"
              startIcon={<PublishIcon />}
              onClick={handlePublish}
              disabled={validationErrors.length > 0}
            >
              Publish
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, gap: 2 }}>
        {/* Node Palette */}
        <Card sx={{ width: 250, flexShrink: 0 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Node Palette
            </Typography>
            <NodePalette />
          </CardContent>
        </Card>

        {/* Workflow Canvas */}
        <Paper sx={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <Background />
            <MiniMap />
          </ReactFlow>
        </Paper>

        {/* Properties Panel */}
        <Card sx={{ width: 300, flexShrink: 0 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Properties
            </Typography>
            <PropertiesPanel
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              onNodeUpdate={(updatedNode) => {
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === updatedNode.id ? updatedNode : node
                  )
                );
              }}
              onEdgeUpdate={(updatedEdge) => {
                setEdges((eds) =>
                  eds.map((edge) =>
                    edge.id === updatedEdge.id ? updatedEdge : edge
                  )
                );
              }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'error.light' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Validation Errors:
          </Typography>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>
                <Typography color="error">{error}</Typography>
              </li>
            ))}
          </ul>
        </Paper>
      )}
    </Box>
  );
};

export default WorkflowDesigner;
