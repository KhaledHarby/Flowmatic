import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Visibility
} from '@mui/icons-material';
import workflowInstanceService from '../../services/workflowInstanceService';
import apiService from '../../services/apiService';
import type { 
  WorkflowInstanceDto, 
  CreateWorkflowInstanceDto,
  WorkflowDefinitionDto,
  WorkflowInstanceStatus 
} from '../../types/workflowInstance';

const Instances: React.FC = () => {
  const [instances, setInstances] = useState<WorkflowInstanceDto[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowDefinitionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstanceDto | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [instancesData, workflowsData] = await Promise.all([
        workflowInstanceService.getAllInstances(),
        apiService.getAllWorkflowDefinitions()
      ]);
      setInstances(instancesData);
      setWorkflows(workflowsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedInstance(null);
    setOpenDialog(true);
  };

  const handleEdit = (instance: WorkflowInstanceDto) => {
    setSelectedInstance(instance);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    setDeleteDialog(id);
  };

  const confirmDelete = async () => {
    if (deleteDialog) {
      try {
        await workflowInstanceService.cancelInstance(deleteDialog, 'Deleted by user');
        setSuccess('Instance cancelled successfully!');
        setDeleteDialog(null);
        fetchData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to cancel instance');
      }
    }
  };

  const handleSave = async (instanceData: CreateWorkflowInstanceDto) => {
    try {
      await workflowInstanceService.startInstance(instanceData);
      setSuccess('Workflow instance started successfully!');
      setOpenDialog(false);
      setSelectedInstance(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start instance');
    }
  };

  const handleAction = async (action: string, instanceId: string) => {
    try {
      switch (action) {
        case 'suspend':
          await workflowInstanceService.suspendInstance(instanceId);
          setSuccess('Instance suspended successfully!');
          break;
        case 'resume':
          await workflowInstanceService.resumeInstance(instanceId);
          setSuccess('Instance resumed successfully!');
          break;
        case 'cancel':
          await workflowInstanceService.cancelInstance(instanceId, 'Cancelled by user');
          setSuccess('Instance cancelled successfully!');
          break;
        case 'retry':
          await workflowInstanceService.retryInstance(instanceId);
          setSuccess('Instance retry initiated successfully!');
          break;
        default:
          return;
      }
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} instance`);
    }
  };

  const filteredInstances = instances.filter(instance => {
    const workflowName = instance.workflowDefinition?.name || '';
    const applicationId = instance.applicationId || '';
    const currentStep = workflowInstanceService.getCurrentStep(instance);
    
    return (
      workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currentStep.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: WorkflowInstanceStatus) => {
    return workflowInstanceService.getStatusColor(status);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading instances...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Workflow Instances
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
          >
            Start Instance
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search instances..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Workflow</TableCell>
              <TableCell>Application ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Current Step</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Last Activity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInstances.map((instance) => {
              const progress = workflowInstanceService.calculateProgress(instance);
              const currentStep = workflowInstanceService.getCurrentStep(instance);
              const duration = workflowInstanceService.formatDuration(instance.startedAt, instance.completedAt);
              
              return (
                <TableRow key={instance.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {instance.workflowDefinition?.name || 'Unknown Workflow'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {instance.workflowDefinition?.description || 'No description'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{instance.applicationId}</TableCell>
                  <TableCell>
                    <Chip
                      label={instance.status}
                      color={getStatusColor(instance.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{currentStep}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ flexGrow: 1 }}
                      />
                      <Typography variant="caption">
                        {progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{duration}</TableCell>
                  <TableCell>
                    {new Date(instance.lastActivityAt || instance.startedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {instance.status === 'Running' && (
                        <>
                          <Tooltip title="Suspend">
                            <IconButton 
                              size="small" 
                              onClick={() => handleAction('suspend', instance.id)}
                            >
                              <Pause />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleAction('cancel', instance.id)}
                            >
                              <Stop />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {instance.status === 'Suspended' && (
                        <Tooltip title="Resume">
                          <IconButton 
                            size="small" 
                            onClick={() => handleAction('resume', instance.id)}
                          >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                      )}
                      {instance.status === 'Failed' && (
                        <Tooltip title="Retry">
                          <IconButton 
                            size="small" 
                            onClick={() => handleAction('retry', instance.id)}
                          >
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(instance)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(instance.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Start Instance Dialog */}
      <InstanceDialog
        open={openDialog}
        instance={selectedInstance}
        workflows={workflows}
        onClose={() => {
          setOpenDialog(false);
          setSelectedInstance(null);
        }}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Confirm Cancel</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this workflow instance? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Cancel Instance
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Instance Dialog Component
interface InstanceDialogProps {
  open: boolean;
  instance: WorkflowInstanceDto | null;
  workflows: WorkflowDefinitionDto[];
  onClose: () => void;
  onSave: (data: CreateWorkflowInstanceDto) => void;
}

const InstanceDialog: React.FC<InstanceDialogProps> = ({ open, instance, workflows, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    workflowDefinitionId: '',
    applicationId: '',
    variables: {}
  });

  React.useEffect(() => {
    if (instance) {
      setFormData({
        workflowDefinitionId: instance.workflowDefinitionId,
        applicationId: instance.applicationId,
        variables: instance.variables
      });
    } else {
      setFormData({
        workflowDefinitionId: '',
        applicationId: '',
        variables: {}
      });
    }
  }, [instance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {instance ? 'View Instance Details' : 'Start New Workflow Instance'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Workflow</InputLabel>
                <Select
                  value={formData.workflowDefinitionId}
                  label="Workflow"
                  onChange={(e) => setFormData({ ...formData, workflowDefinitionId: e.target.value })}
                  disabled={!!instance}
                >
                  {workflows.map((workflow) => (
                    <MenuItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Application ID"
                value={formData.applicationId}
                onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                required
                disabled={!!instance}
                helperText="Unique identifier for this workflow instance"
              />
            </Grid>
            {instance && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Status"
                    value={instance.status}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Started At"
                    value={new Date(instance.startedAt).toLocaleString()}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {instance.errorMessage && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Error Message"
                      value={instance.errorMessage}
                      InputProps={{ readOnly: true }}
                      multiline
                      rows={3}
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          {!instance && (
            <Button type="submit" variant="contained">
              Start Instance
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default Instances;

