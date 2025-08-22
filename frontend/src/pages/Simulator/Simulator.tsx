import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Snackbar,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Assignment,
  Approval,
  PlayArrow,
  Refresh,
  Add
} from '@mui/icons-material';
import apiService, { NodeType } from '../../services/apiService';
import type { WorkflowDefinitionDto } from '../../services/apiService';
import workflowInstanceService from '../../services/workflowInstanceService';

const Simulator: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowDefinitionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{
    workflowId: string;
    workflowName: string;
    nodeId: string;
    nodeName: string;
    action: string;
  } | null>(null);
  const [applicationId, setApplicationId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    setError(null);
    try {
      const workflowsData = await apiService.getAllWorkflowDefinitions();
      setWorkflows(workflowsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const openActionDialog = (workflowId: string, workflowName: string, nodeId: string, nodeName: string, action: string) => {
    setSelectedAction({ workflowId, workflowName, nodeId, nodeName, action });
    setApplicationId('');
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedAction || !applicationId.trim()) {
      setSnackbar({ open: true, message: 'Please enter Application ID', severity: 'error' });
      return;
    }

    setActionLoading(true);
    try {
      const res = await workflowInstanceService.takeAction({
        workflowDefinitionId: selectedAction.workflowId,
        applicationId: applicationId.trim(),
        action: selectedAction.action,
      });
      
      setSnackbar({ 
        open: true, 
        message: `Action "${selectedAction.action}" applied successfully to workflow "${selectedAction.workflowName}". Instance: ${res.id}`, 
        severity: 'success' 
      });
      setActionDialogOpen(false);
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error?.message || 'Failed to apply workflow action', 
        severity: 'error' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Get actionable nodes (TaskNode, ApprovalNode, etc.)
  const getActionableNodes = (workflow: WorkflowDefinitionDto) => {
    return workflow.nodes.filter(node => 
      node.type === NodeType.TaskNode || 
      node.type === NodeType.ApprovalNode ||
      node.type === NodeType.DecisionNode
    );
  };

  // Get available actions for a node based on outgoing edges
  const getNodeActions = (workflow: WorkflowDefinitionDto, nodeId: string) => {
    const outgoingEdges = workflow.edges.filter(edge => edge.sourceNodeId === nodeId);
    return outgoingEdges.map(edge => edge.label).filter(label => label && label.trim() !== '');
  };

  const getNodeIcon = (nodeType: NodeType) => {
    switch (nodeType) {
      case NodeType.ApprovalNode:
        return <Approval sx={{ mr: 1, color: 'primary.main' }} />;
      case NodeType.TaskNode:
        return <Assignment sx={{ mr: 1, color: 'secondary.main' }} />;
      case NodeType.DecisionNode:
        return <PlayArrow sx={{ mr: 1, color: 'success.main' }} />;
      default:
        return <Assignment sx={{ mr: 1 }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'success';
      case 'Draft':
        return 'warning';
      case 'Archived':
        return 'default';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading workflows...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadWorkflows}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Workflow Simulator
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Refresh />}
          onClick={loadWorkflows}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Test and simulate workflow actions with different application IDs
      </Typography>

      {workflows.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No workflow definitions found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create some workflows first to test them in the simulator
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {workflows.map((workflow) => {
            const actionableNodes = getActionableNodes(workflow);
            
            return (
              <Grid item xs={12} key={workflow.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h5" gutterBottom>
                          {workflow.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {workflow.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={workflow.status} 
                            color={getStatusColor(workflow.status) as any}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={`ID: ${workflow.id}`} 
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {actionableNodes.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No actionable nodes found in this workflow
                      </Typography>
                    ) : (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Available Actions:
                        </Typography>
                        <Grid container spacing={2}>
                          {actionableNodes.map((node) => {
                            const actions = getNodeActions(workflow, node.nodeId);
                            
                            return (
                              <Grid item xs={12} sm={6} md={4} key={node.nodeId}>
                                <Paper elevation={1} sx={{ p: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    {getNodeIcon(node.type)}
                                    <Typography variant="subtitle1" fontWeight="bold">
                                      {node.name}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Type: {node.type}
                                  </Typography>
                                  
                                  {actions.length > 0 ? (
                                    <Box sx={{ mt: 2 }}>
                                      {actions.map((action) => (
                                        <Button
                                          key={action}
                                          variant="contained"
                                          size="small"
                                          fullWidth
                                          sx={{ mb: 1 }}
                                          onClick={() => openActionDialog(
                                            workflow.id,
                                            workflow.name,
                                            node.nodeId,
                                            node.name,
                                            action
                                          )}
                                        >
                                          {action}
                                        </Button>
                                      ))}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No actions available
                                    </Typography>
                                  )}
                                </Paper>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Execute Workflow Action</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              Workflow: {selectedAction?.workflowName}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Node: {selectedAction?.nodeName}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Action: {selectedAction?.action}
            </Typography>
            <TextField
              label="Application ID"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              fullWidth
              placeholder="Enter application ID (e.g., APP-001, USER-123)"
              helperText="This ID will be used to identify the workflow instance"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            variant="contained"
            disabled={actionLoading || !applicationId.trim()}
            startIcon={<PlayArrow />}
          >
            {actionLoading ? 'Executing...' : 'Execute Action'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Simulator;


