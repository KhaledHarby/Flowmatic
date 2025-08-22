import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Fab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  PlayArrow,
  Archive,
  Refresh,
  Search,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiService, { 
  type WorkflowDefinitionDto, 
  type CreateWorkflowDefinitionDto,
  WorkflowStatus 
} from '../../services/apiService';
import ApiTest from '../../components/ApiTest';

const Workflows: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowDefinitionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinitionDto | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<WorkflowStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  const [newWorkflow, setNewWorkflow] = useState<CreateWorkflowDefinitionDto>({
    name: '',
    description: '',
    category: '',
    definitionJson: '',
    nodes: [],
    edges: [],
  });

  useEffect(() => {
    loadWorkflows();
  }, [filterCategory, filterStatus]);

  const loadWorkflows = async () => {
    setLoading(true);
    setError(null);

    try {
      const statusFilter = filterStatus || undefined;
      const workflows = await apiService.getAllWorkflowDefinitions(filterCategory || undefined, statusFilter);
      setWorkflows(workflows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name.trim()) {
      setError('Workflow name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createdWorkflow = await apiService.createWorkflowDefinition(newWorkflow);
      setWorkflows(prev => [createdWorkflow, ...prev]);
      setCreateDialogOpen(false);
      setNewWorkflow({
        name: '',
        description: '',
        category: '',
        definitionJson: '',
        nodes: [],
        edges: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkflow = async () => {
    if (!selectedWorkflow) return;

    setLoading(true);
    setError(null);

    try {
      await apiService.deleteWorkflowDefinition(selectedWorkflow.id);
      setWorkflows(prev => prev.filter(w => w.id !== selectedWorkflow.id));
      setDeleteDialogOpen(false);
      setSelectedWorkflow(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishWorkflow = async (workflow: WorkflowDefinitionDto) => {
    setLoading(true);
    setError(null);

    try {
      await apiService.publishWorkflowDefinition(workflow.id);
      // Refresh the workflows list to get updated status
      await loadWorkflows();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveWorkflow = async (workflow: WorkflowDefinitionDto) => {
    setLoading(true);
    setError(null);

    try {
      await apiService.archiveWorkflowDefinition(workflow.id);
      // Refresh the workflows list to get updated status
      await loadWorkflows();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive workflow');
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.Published:
        return 'success';
      case WorkflowStatus.Archived:
        return 'default';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && workflows.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* API Test Component */}
      <ApiTest />
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Workflows
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Workflow
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Search workflows"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Business Process">Business Process</MenuItem>
                <MenuItem value="Human Resources">Human Resources</MenuItem>
                <MenuItem value="IT Operations">IT Operations</MenuItem>
                <MenuItem value="Customer Service">Customer Service</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as WorkflowStatus | '')}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value={WorkflowStatus.Draft}>Draft</MenuItem>
                <MenuItem value={WorkflowStatus.Published}>Published</MenuItem>
                <MenuItem value={WorkflowStatus.Archived}>Archived</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={loadWorkflows} disabled={loading}>
              <Refresh />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Workflows Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkflows.map((workflow) => (
              <TableRow key={workflow.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {workflow.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                    {workflow.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={workflow.category} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={workflow.status} 
                    color={getStatusColor(workflow.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">v{workflow.version}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(workflow.createdAt)}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/workflow-designer?id=${workflow.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/workflow-designer?id=${workflow.id}`)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    {workflow.status === WorkflowStatus.Draft && (
                      <Tooltip title="Publish">
                        <IconButton
                          size="small"
                          onClick={() => handlePublishWorkflow(workflow)}
                          disabled={loading}
                        >
                          <PlayArrow />
                        </IconButton>
                      </Tooltip>
                    )}
                    {workflow.status === WorkflowStatus.Published && (
                      <Tooltip title="Archive">
                        <IconButton
                          size="small"
                          onClick={() => handleArchiveWorkflow(workflow)}
                          disabled={loading}
                        >
                          <Archive />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={loading}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredWorkflows.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No workflows found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create your first workflow to get started
          </Typography>
        </Box>
      )}

      {/* Create Workflow Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Workflow Name"
              value={newWorkflow.name}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newWorkflow.description}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newWorkflow.category}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="Business Process">Business Process</MenuItem>
                <MenuItem value="Human Resources">Human Resources</MenuItem>
                <MenuItem value="IT Operations">IT Operations</MenuItem>
                <MenuItem value="Customer Service">Customer Service</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateWorkflow} 
            variant="contained" 
            disabled={loading || !newWorkflow.name.trim()}
          >
            {loading ? <CircularProgress size={16} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Workflow</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedWorkflow?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteWorkflow} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={16} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/workflow-designer')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Workflows;

