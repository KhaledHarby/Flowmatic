import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Paper,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import {
  AccountTree,
  PlayArrow,
  LibraryBooks,
  TrendingUp,
  CheckCircle,
  Schedule,
  Assignment,
  Approval,
  Science
} from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiService, { NodeType } from '../../services/apiService';
import type { WorkflowDefinitionDto } from '../../services/apiService';
import workflowInstanceService from '../../services/workflowInstanceService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'Approve' | 'Reject'>('Approve');
  const [actionApplicationId, setActionApplicationId] = useState('');
  const [actionDefinitionId, setActionDefinitionId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [demoApplicationId, setDemoApplicationId] = useState('');
  const [takeActionDialogOpen, setTakeActionDialogOpen] = useState(false);
  const [takeActionForm, setTakeActionForm] = useState({ workflowDefinitionId: '', applicationId: '', action: 'Approve' });
  const [takeActionLoading, setTakeActionLoading] = useState(false);
  const [quickActionLoading, setQuickActionLoading] = useState(false);
  const QUICK_DEF_ID = '14C3C992-3EAF-4D24-A8F4-B613F886A1E5';
  
  // New state for workflow actions
  const [workflowDefinition, setWorkflowDefinition] = useState<WorkflowDefinitionDto | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowActionDialogOpen, setWorkflowActionDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{ nodeId: string; name: string; action: string } | null>(null);
  const [workflowActionForm, setWorkflowActionForm] = useState({ applicationId: '' });
  const [workflowActionLoading, setWorkflowActionLoading] = useState(false);
  const TARGET_WORKFLOW_ID = '3D2B086A-CB20-4D68-A2CC-632105C61CCB';

  // Load workflow definition on component mount
  useEffect(() => {
    loadWorkflowDefinition();
  }, []);

  const loadWorkflowDefinition = async () => {
    setWorkflowLoading(true);
    try {
      const workflow = await apiService.getWorkflowDefinitionById(TARGET_WORKFLOW_ID);
      setWorkflowDefinition(workflow);
    } catch (error) {
      console.error('Failed to load workflow definition:', error);
      // Try to create the workflow definition if it doesn't exist
      await createTargetWorkflowDefinition();
    } finally {
      setWorkflowLoading(false);
    }
  };

  const createTargetWorkflowDefinition = async () => {
    try {
      const workflowDto = {
        name: 'Application Approval Workflow',
        description: 'Multi-step application approval process with document review, manager approval, and final decision',
        category: 'Approval',
        definitionJson: '{}',
        nodes: [
          {
            id: '00000000-0000-0000-0000-000000000000',
            nodeId: 'start',
            name: 'Start Application',
            type: NodeType.StartNode,
            positionX: 100,
            positionY: 200,
            configuration: '',
            isStartNode: true,
            isEndNode: false,
            order: 1,
          },
          {
            id: '00000000-0000-0000-0000-000000000000',
            nodeId: 'document_review',
            name: 'Document Review',
            type: NodeType.TaskNode,
            positionX: 300,
            positionY: 200,
            configuration: '',
            isStartNode: false,
            isEndNode: false,
            order: 2,
          },
          {
            id: '00000000-0000-0000-0000-000000000000',
            nodeId: 'manager_approval',
            name: 'Manager Approval',
            type: NodeType.ApprovalNode,
            positionX: 500,
            positionY: 200,
            configuration: '',
            isStartNode: false,
            isEndNode: false,
            order: 3,
          },
          {
            id: '00000000-0000-0000-0000-000000000000',
            nodeId: 'final_decision',
            name: 'Final Decision',
            type: NodeType.DecisionNode,
            positionX: 700,
            positionY: 200,
            configuration: '',
            isStartNode: false,
            isEndNode: false,
            order: 4,
          },
          {
            id: '00000000-0000-0000-0000-000000000000',
            nodeId: 'approved',
            name: 'Application Approved',
            type: NodeType.EndNode,
            positionX: 900,
            positionY: 100,
            configuration: '',
            isStartNode: false,
            isEndNode: true,
            order: 5,
          },
          {
            id: '00000000-0000-0000-0000-000000000000',
            nodeId: 'rejected',
            name: 'Application Rejected',
            type: NodeType.EndNode,
            positionX: 900,
            positionY: 300,
            configuration: '',
            isStartNode: false,
            isEndNode: true,
            order: 6,
          },
          {
            id: '00000000-0000-0000-0000-000000000000',
            nodeId: 'request_changes',
            name: 'Request Changes',
            type: NodeType.TaskNode,
            positionX: 700,
            positionY: 350,
            configuration: '',
            isStartNode: false,
            isEndNode: false,
            order: 7,
          },
        ],
        edges: [
          {
            id: '00000000-0000-0000-0000-000000000000',
            edgeId: 'e_start_document_review',
            sourceNodeId: 'start',
            targetNodeId: 'document_review',
            label: 'Submit',
            condition: '',
            order: 1,
          },
          {
            id: '00000000-0000-0000-0000-000000000000',
            edgeId: 'e_document_review_manager_approval',
            sourceNodeId: 'document_review',
            targetNodeId: 'manager_approval',
            label: 'Complete Review',
            condition: '',
            order: 2,
          },
          {
            id: '00000000-0000-0000-0000-000000000000',
            edgeId: 'e_manager_approval_final_decision',
            sourceNodeId: 'manager_approval',
            targetNodeId: 'final_decision',
            label: 'Approve',
            condition: '',
            order: 3,
          },
          {
            id: '00000000-0000-0000-0000-000000000000',
            edgeId: 'e_manager_approval_request_changes',
            sourceNodeId: 'manager_approval',
            targetNodeId: 'request_changes',
            label: 'Request Changes',
            condition: '',
            order: 4,
          },
          {
            id: '00000000-0000-0000-0000-000000000000',
            edgeId: 'e_final_decision_approved',
            sourceNodeId: 'final_decision',
            targetNodeId: 'approved',
            label: 'Approve',
            condition: '',
            order: 5,
          },
          {
            id: '00000000-0000-0000-0000-000000000000',
            edgeId: 'e_final_decision_rejected',
            sourceNodeId: 'final_decision',
            targetNodeId: 'rejected',
            label: 'Reject',
            condition: '',
            order: 6,
          },
          {
            id: '00000000-0000-0000-0000-000000000000',
            edgeId: 'e_request_changes_document_review',
            sourceNodeId: 'request_changes',
            targetNodeId: 'document_review',
            label: 'Resubmit',
            condition: '',
            order: 7,
          },
        ],
      };

      const createdWorkflow = await apiService.createWorkflowDefinition(workflowDto);
      setWorkflowDefinition(createdWorkflow);
      setSnackbar({ 
        open: true, 
        message: `Created workflow definition: ${createdWorkflow.name}`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Failed to create workflow definition:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to create workflow definition. Please check if the workflow exists.', 
        severity: 'error' 
      });
    }
  };

  const openWorkflowActionDialog = (nodeId: string, name: string, action: string) => {
    setSelectedNode({ nodeId, name, action });
    setWorkflowActionForm({ applicationId: '' });
    setWorkflowActionDialogOpen(true);
  };

  const handleWorkflowAction = async () => {
    if (!selectedNode || !workflowActionForm.applicationId) {
      setSnackbar({ open: true, message: 'Please enter Application ID', severity: 'error' });
      return;
    }

    setWorkflowActionLoading(true);
    try {
      const res = await workflowInstanceService.takeAction({
        workflowDefinitionId: TARGET_WORKFLOW_ID,
        applicationId: workflowActionForm.applicationId,
        action: selectedNode.action,
      });
      setSnackbar({ 
        open: true, 
        message: `Action "${selectedNode.action}" applied successfully. Instance: ${res.id}`, 
        severity: 'success' 
      });
      setWorkflowActionDialogOpen(false);
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error?.message || 'Failed to apply workflow action', 
        severity: 'error' 
      });
    } finally {
      setWorkflowActionLoading(false);
    }
  };

  // Get actionable nodes (TaskNode, ApprovalNode, etc.)
  const getActionableNodes = () => {
    if (!workflowDefinition) return [];
    
    return workflowDefinition.nodes.filter(node => 
      node.type === NodeType.TaskNode || 
      node.type === NodeType.ApprovalNode ||
      node.type === NodeType.DecisionNode
    );
  };

  // Get available actions for a node based on outgoing edges
  const getNodeActions = (nodeId: string) => {
    if (!workflowDefinition) return [];
    
    const outgoingEdges = workflowDefinition.edges.filter(edge => edge.sourceNodeId === nodeId);
    return outgoingEdges.map(edge => edge.label).filter(label => label && label.trim() !== '');
  };

  const handleCreateDemo = async (applicationId: string) => {
    if (isCreatingDemo) return;
    setIsCreatingDemo(true);
    try {
      const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

      // Try to reuse an existing demo definition to avoid duplicates
      const existingList = await apiService.getAllWorkflowDefinitions('Demo');
      let def = existingList.find(w => w.name === 'Demo Approval');

      if (!def) {
        const demoDto = {
          name: 'Demo Approval',
          description: 'Auto-created demo workflow',
          category: 'Demo',
          definitionJson: '{}',
          nodes: [
            {
              id: '00000000-0000-0000-0000-000000000000',
              nodeId: 'start',
              name: 'Start',
              type: NodeType.StartNode,
              positionX: 100,
              positionY: 100,
              configuration: '',
              isStartNode: true,
              isEndNode: false,
              order: 1,
            },
            {
              id: '00000000-0000-0000-0000-000000000000',
              nodeId: 'review',
              name: 'Review Application',
              type: NodeType.ApprovalNode,
              positionX: 350,
              positionY: 100,
              configuration: '',
              isStartNode: false,
              isEndNode: false,
              order: 2,
            },
            {
              id: '00000000-0000-0000-0000-000000000000',
              nodeId: 'end_approved',
              name: 'Approved',
              type: NodeType.EndNode,
              positionX: 600,
              positionY: 40,
              configuration: '',
              isStartNode: false,
              isEndNode: true,
              order: 3,
            },
            {
              id: '00000000-0000-0000-0000-000000000000',
              nodeId: 'end_rejected',
              name: 'Rejected',
              type: NodeType.EndNode,
              positionX: 600,
              positionY: 160,
              configuration: '',
              isStartNode: false,
              isEndNode: true,
              order: 4,
            },
          ],
          edges: [
            {
              id: '00000000-0000-0000-0000-000000000000',
              edgeId: 'e_start_review',
              sourceNodeId: 'start',
              targetNodeId: 'review',
              label: '',
              condition: '',
              order: 1,
            },
            {
              id: '00000000-0000-0000-0000-000000000000',
              edgeId: 'e_review_approve',
              sourceNodeId: 'review',
              targetNodeId: 'end_approved',
              label: 'Approve',
              condition: '',
              order: 2,
            },
            {
              id: '00000000-0000-0000-0000-000000000000',
              edgeId: 'e_review_reject',
              sourceNodeId: 'review',
              targetNodeId: 'end_rejected',
              label: 'Reject',
              condition: '',
              order: 3,
            },
          ],
        };

        try {
          def = await apiService.createWorkflowDefinition(demoDto);
        } catch (e: any) {
          // transient concurrency issue: query and retry once
          await sleep(300);
          const retryList = await apiService.getAllWorkflowDefinitions('Demo');
          def = retryList.find(w => w.name === 'Demo Approval');
          if (!def) throw e;
        }
      }

      // small delay before starting instance to let DB settle
      await sleep(200);

      const instance = await workflowInstanceService.startInstance({
        workflowDefinitionId: def.id,
        applicationId: applicationId,
        variables: { applicant: 'Demo User', amount: 500 },
        startedBy: 'admin',
      });

      setSnackbar({ open: true, message: `Demo created. Instance ${instance.id} started.`, severity: 'success' });
    } catch (err: any) {
      const msg = err?.message || 'Failed to create demo';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setIsCreatingDemo(false);
    }
  };

  const openActionDialog = (type: 'Approve' | 'Reject') => {
    setActionType(type);
    setActionApplicationId('');
    setActionDefinitionId('');
    setActionDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!actionApplicationId || !actionDefinitionId) {
      setSnackbar({ open: true, message: 'Please enter both Application ID and Definition ID.', severity: 'error' });
      return;
    }
    setActionLoading(true);
    try {
      const instance = await workflowInstanceService.startInstance({
        workflowDefinitionId: actionDefinitionId,
        applicationId: actionApplicationId,
        variables: {},
        startedBy: 'admin',
      });

      const findTaskWithRetry = async (maxAttempts = 10, delayMs = 500) => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          const d = await workflowInstanceService.getInstanceById(instance.id);
          const t = d.tasks?.find(tt => {
            const status = String(tt.status);
            return status === 'Pending' || status === 'InProgress';
          });
          if (t) return t;
          await new Promise(r => setTimeout(r, delayMs));
        }
        return null;
      };

      const targetTask = await findTaskWithRetry();
      if (!targetTask) {
        throw new Error('No pending task found to act on after starting the instance.');
      }

      await workflowInstanceService.completeTask(instance.id, {
        taskId: (targetTask as any).taskId || (targetTask as any).id,
        completedBy: 'admin',
        result: actionType,
      });

      setSnackbar({ open: true, message: `${actionType} action completed on instance ${instance.id}.`, severity: 'success' });
      setActionDialogOpen(false);
    } catch (err: any) {
      const msg = err?.message || `Failed to ${actionType.toLowerCase()} task`;
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create New Workflow',
      description: 'Start building a new workflow from scratch',
      icon: <AccountTree />,
      action: () => navigate('/workflow-designer'),
      color: 'primary'
    },
    {
      title: 'View Examples',
      description: 'Explore pre-built workflow examples',
      icon: <LibraryBooks />,
      action: () => navigate('/examples'),
      color: 'secondary'
    },
    {
      title: 'Manage Workflows',
      description: 'View and manage existing workflows',
      icon: <AccountTree />,
      action: () => navigate('/workflows'),
      color: 'success'
    },
         {
       title: 'Monitor Instances',
       description: 'Track running workflow instances',
       icon: <TrendingUp />,
       action: () => navigate('/instances'),
       color: 'info'
     },
     {
       title: 'Workflow Simulator',
       description: 'Test and simulate workflow actions',
       icon: <Science />,
       action: () => navigate('/simulator'),
       color: 'warning'
     }
  ];

  const stats = [
    { label: 'Active Workflows', value: '12', icon: <AccountTree /> },
    { label: 'Running Instances', value: '8', icon: <PlayArrow /> },
    { label: 'Completed Today', value: '24', icon: <CheckCircle /> },
    { label: 'Pending Tasks', value: '5', icon: <Schedule /> }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to FlowMaster
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Your comprehensive workflow automation platform
      </Typography>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Quick Actions
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={action.action}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {React.cloneElement(action.icon, { 
                    sx: { fontSize: 48, color: `${action.color}.main` } 
                  })}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Statistics */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>
                {React.cloneElement(stat.icon, { 
                  sx: { fontSize: 32, color: 'primary.main' } 
                })}
              </Box>
              <Typography variant="h4" component="div" gutterBottom>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Getting Started */}
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Getting Started
        </Typography>
        <Typography variant="body1" paragraph>
          New to FlowMaster? Here's how to get started:
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip label="1" color="primary" sx={{ mr: 2 }} />
              <Typography variant="body1">
                Explore our <strong>Examples</strong> to see what's possible
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip label="2" color="primary" sx={{ mr: 2 }} />
              <Typography variant="body1">
                Load an example into the <strong>Workflow Designer</strong>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip label="3" color="primary" sx={{ mr: 2 }} />
              <Typography variant="body1">
                Customize the workflow for your needs
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip label="4" color="primary" sx={{ mr: 2 }} />
              <Typography variant="body1">
                Save and start your first workflow instance
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<LibraryBooks />}
            onClick={() => navigate('/examples')}
          >
            Explore Examples
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<PlayArrow />}
            sx={{ ml: 2 }}
            onClick={() => setDemoDialogOpen(true)}
            disabled={isCreatingDemo}
          >
            {isCreatingDemo ? 'Creating…' : 'Create Demo'}
          </Button>
        </Box>
      </Paper>
      <Dialog open={demoDialogOpen} onClose={() => setDemoDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Demo Instance</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Application ID"
              value={demoApplicationId}
              onChange={(e) => setDemoApplicationId(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDemoDialogOpen(false)} disabled={isCreatingDemo}>Cancel</Button>
          <Button
            onClick={async () => {
              if (!demoApplicationId) {
                setSnackbar({ open: true, message: 'Please enter Application ID.', severity: 'error' });
                return;
              }
              await handleCreateDemo(demoApplicationId);
              setDemoDialogOpen(false);
            }}
            variant="contained"
            disabled={isCreatingDemo}
          >
            {isCreatingDemo ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={() => setTakeActionDialogOpen(true)}>Take Action</Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 2 }}
          disabled={quickActionLoading}
          onClick={async () => {
            setQuickActionLoading(true);
            try {
              const randomAppId = `APP-${Date.now().toString(36)}-${Math.floor(Math.random()*1000)}`;
              const res = await workflowInstanceService.takeAction({
                workflowDefinitionId: QUICK_DEF_ID,
                applicationId: randomAppId,
                action: 'Approve',
              });
              setSnackbar({ open: true, message: `Approved. Instance ${res.id} for ${randomAppId}`, severity: 'success' });
            } catch (err: any) {
              setSnackbar({ open: true, message: err?.message || 'Quick action failed', severity: 'error' });
            } finally {
              setQuickActionLoading(false);
            }
          }}
        >
          {quickActionLoading ? 'Working…' : 'Quick Approve (Random App)'}
        </Button>
      </Box>
      <Dialog open={takeActionDialogOpen} onClose={() => setTakeActionDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Take Action</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Workflow Definition ID"
              value={takeActionForm.workflowDefinitionId}
              onChange={(e) => setTakeActionForm(f => ({ ...f, workflowDefinitionId: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Application ID"
              value={takeActionForm.applicationId}
              onChange={(e) => setTakeActionForm(f => ({ ...f, applicationId: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Action"
              value={takeActionForm.action}
              onChange={(e) => setTakeActionForm(f => ({ ...f, action: e.target.value }))}
              placeholder="Approve | Reject"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTakeActionDialogOpen(false)} disabled={takeActionLoading}>Cancel</Button>
          <Button
            onClick={async () => {
              if (!takeActionForm.workflowDefinitionId || !takeActionForm.applicationId || !takeActionForm.action) {
                setSnackbar({ open: true, message: 'Please fill all fields.', severity: 'error' });
                return;
              }
              setTakeActionLoading(true);
              try {
                const res = await workflowInstanceService.takeAction({
                  workflowDefinitionId: takeActionForm.workflowDefinitionId,
                  applicationId: takeActionForm.applicationId,
                  action: takeActionForm.action,
                });
                setSnackbar({ open: true, message: `Action applied. Instance ${res.id}`, severity: 'success' });
                setTakeActionDialogOpen(false);
              } catch (err: any) {
                setSnackbar({ open: true, message: err?.message || 'Failed to take action', severity: 'error' });
              } finally {
                setTakeActionLoading(false);
              }
            }}
            variant="contained"
            disabled={takeActionLoading}
          >
            {takeActionLoading ? 'Working…' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="success" onClick={() => openActionDialog('Approve')}>
          Approve
        </Button>
        <Button variant="outlined" color="error" onClick={() => openActionDialog('Reject')}>
          Reject
        </Button>
      </Box>

             {/* Workflow Actions Section */}
       <Divider sx={{ my: 4 }} />
       <Paper sx={{ p: 3, mt: 3 }}>
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
           <Typography variant="h5" gutterBottom>
             Workflow Actions: {TARGET_WORKFLOW_ID}
           </Typography>
           <Box>
             <Button 
               variant="outlined" 
               onClick={loadWorkflowDefinition}
               disabled={workflowLoading}
               sx={{ mr: 1 }}
             >
               {workflowLoading ? 'Loading...' : 'Refresh'}
             </Button>
             <Button 
               variant="contained" 
               onClick={createTargetWorkflowDefinition}
               disabled={workflowLoading}
               sx={{ mr: 1 }}
             >
               Create Workflow
             </Button>
             <Button 
               variant="outlined" 
               onClick={async () => {
                 try {
                   const randomAppId = `TEST-${Date.now().toString(36)}`;
                   const res = await workflowInstanceService.takeAction({
                     workflowDefinitionId: TARGET_WORKFLOW_ID,
                     applicationId: randomAppId,
                     action: 'Submit',
                   });
                   setSnackbar({ 
                     open: true, 
                     message: `Test workflow started. Instance: ${res.id} for ${randomAppId}`, 
                     severity: 'success' 
                   });
                 } catch (error: any) {
                   setSnackbar({ 
                     open: true, 
                     message: error?.message || 'Test failed', 
                     severity: 'error' 
                   });
                 }
               }}
               disabled={!workflowDefinition}
             >
               Test Workflow
             </Button>
           </Box>
         </Box>
         
         {workflowLoading ? (
           <Typography>Loading workflow definition...</Typography>
         ) : workflowDefinition ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              {workflowDefinition.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {workflowDefinition.description}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Available Actions:
              </Typography>
              <Grid container spacing={2}>
                {getActionableNodes().map((node) => {
                  const actions = getNodeActions(node.nodeId);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={node.nodeId}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {node.type === NodeType.ApprovalNode && <Approval sx={{ mr: 1 }} />}
                            {node.type === NodeType.TaskNode && <Assignment sx={{ mr: 1 }} />}
                            <Typography variant="h6">{node.name}</Typography>
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
                                  sx={{ mr: 1, mb: 1 }}
                                  onClick={() => openWorkflowActionDialog(node.nodeId, node.name, action)}
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
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Box>
        ) : (
          <Typography color="error">
            Failed to load workflow definition. Please check if the workflow exists.
          </Typography>
        )}
      </Paper>
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{actionType} Workflow Task</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Application ID"
              value={actionApplicationId}
              onChange={(e) => setActionApplicationId(e.target.value)}
              fullWidth
            />
            <TextField
              label="Workflow Definition ID"
              value={actionDefinitionId}
              onChange={(e) => setActionDefinitionId(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleSubmitAction} variant="contained" disabled={actionLoading}>
            {actionLoading ? 'Working…' : actionType}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={workflowActionDialogOpen} onClose={() => setWorkflowActionDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Apply Action to Workflow Instance</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              Workflow: {workflowDefinition?.name}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Node: {selectedNode?.name}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Action: {selectedNode?.action}
            </Typography>
            <TextField
              label="Application ID"
              value={workflowActionForm.applicationId}
              onChange={(e) => setWorkflowActionForm(f => ({ ...f, applicationId: e.target.value }))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkflowActionDialogOpen(false)} disabled={workflowActionLoading}>Cancel</Button>
          <Button
            onClick={handleWorkflowAction}
            variant="contained"
            disabled={workflowActionLoading}
          >
            {workflowActionLoading ? 'Working…' : 'Apply Action'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default Dashboard;
