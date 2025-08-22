import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save,
  Publish,
  Archive,
  CheckCircle,
  ContentCopy,
  Delete,
  Edit,
  Visibility,
  PlayArrow,
  Stop,
  Refresh,
} from '@mui/icons-material';
import type { Node, Edge } from 'reactflow';
import apiService, { 
  type WorkflowDefinitionDto, 
  type CreateWorkflowDefinitionDto, 
  type UpdateWorkflowDefinitionDto,
  WorkflowStatus 
} from '../../../services/apiService';

interface WorkflowActionsProps {
  nodes: Node[];
  edges: Edge[];
  currentWorkflow?: WorkflowDefinitionDto;
  onWorkflowSaved?: (workflow: WorkflowDefinitionDto) => void;
  onWorkflowUpdated?: (workflow: WorkflowDefinitionDto) => void;
  onWorkflowDeleted?: () => void;
}

interface SaveDialogData {
  name: string;
  description: string;
  category: string;
}

const WorkflowActions: React.FC<WorkflowActionsProps> = ({
  nodes,
  edges,
  currentWorkflow,
  onWorkflowSaved,
  onWorkflowUpdated,
  onWorkflowDeleted,
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saveData, setSaveData] = useState<SaveDialogData>({
    name: currentWorkflow?.name || '',
    description: currentWorkflow?.description || '',
    category: currentWorkflow?.category || '',
  });

  const handleSave = async () => {
    if (!saveData.name.trim()) {
      setError('Workflow name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { nodes: backendNodes, edges: backendEdges, definitionJson } = 
        apiService.convertReactFlowToBackend(nodes, edges);

      if (currentWorkflow) {
        // Update existing workflow
        const updateDto: UpdateWorkflowDefinitionDto = {
          name: saveData.name,
          description: saveData.description,
          category: saveData.category,
          definitionJson,
          nodes: backendNodes,
          edges: backendEdges,
        };

        const updatedWorkflow = await apiService.updateWorkflowDefinition(
          currentWorkflow.id,
          updateDto
        );

        setSuccess('Workflow updated successfully!');
        onWorkflowUpdated?.(updatedWorkflow);
      } else {
        // Create new workflow
        const createDto: CreateWorkflowDefinitionDto = {
          name: saveData.name,
          description: saveData.description,
          category: saveData.category,
          definitionJson,
          nodes: backendNodes,
          edges: backendEdges,
        };

        const newWorkflow = await apiService.createWorkflowDefinition(createDto);

        setSuccess('Workflow created successfully!');
        onWorkflowSaved?.(newWorkflow);
      }

      setSaveDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUpdate = async () => {
    if (!currentWorkflow) {
      setError('No workflow to update');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { nodes: backendNodes, edges: backendEdges, definitionJson } =
        apiService.convertReactFlowToBackend(nodes, edges);

      const updateDto: UpdateWorkflowDefinitionDto = {
        name: currentWorkflow.name,
        description: currentWorkflow.description || '',
        category: currentWorkflow.category || '',
        definitionJson,
        nodes: backendNodes,
        edges: backendEdges,
      };

      const updatedWorkflow = await apiService.updateWorkflowDefinition(
        currentWorkflow.id,
        updateDto
      );

      setSuccess('Workflow updated successfully!');
      onWorkflowUpdated?.(updatedWorkflow);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workflow');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!currentWorkflow) {
      setError('Please save the workflow first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.publishWorkflowDefinition(currentWorkflow.id);
      setSuccess('Workflow published successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!currentWorkflow) {
      setError('Please save the workflow first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.archiveWorkflowDefinition(currentWorkflow.id);
      setSuccess('Workflow archived successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!currentWorkflow) {
      setError('Please save the workflow first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.validateWorkflowDefinition(currentWorkflow.id);
      setSuccess('Workflow validation passed!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Workflow validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentWorkflow) {
      setError('No workflow to delete');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.deleteWorkflowDefinition(currentWorkflow.id);
      setSuccess('Workflow deleted successfully!');
      onWorkflowDeleted?.();
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!currentWorkflow) {
      setError('Please save the workflow first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newVersion = await apiService.createWorkflowVersion(currentWorkflow.id);
      setSuccess(`New version ${newVersion.version} created successfully!`);
      onWorkflowUpdated?.(newVersion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create new version');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Status and Info */}
      {currentWorkflow && (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>
            {currentWorkflow.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip 
              label={currentWorkflow.status} 
              color={currentWorkflow.status === WorkflowStatus.Published ? 'success' : 'default'}
              size="small"
            />
            <Chip 
              label={`v${currentWorkflow.version}`} 
              variant="outlined" 
              size="small"
            />
            <Chip 
              label={currentWorkflow.category} 
              variant="outlined" 
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {currentWorkflow.description}
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <Save />}
          onClick={currentWorkflow ? handleQuickUpdate : () => setSaveDialogOpen(true)}
          disabled={loading}
        >
          {currentWorkflow ? 'Update' : 'Save'}
        </Button>

        {currentWorkflow && (
          <>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <Publish />}
              onClick={handlePublish}
              disabled={loading || currentWorkflow.status === WorkflowStatus.Published}
            >
              Publish
            </Button>

            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}
              onClick={handleValidate}
              disabled={loading}
            >
              Validate
            </Button>

            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <ContentCopy />}
              onClick={handleCreateVersion}
              disabled={loading}
            >
              New Version
            </Button>

            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <Archive />}
              onClick={handleArchive}
              disabled={loading || currentWorkflow.status === WorkflowStatus.Archived}
            >
              Archive
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={loading}
            >
              Delete
            </Button>
          </>
        )}
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" onClose={clearMessages}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={clearMessages}>
          {success}
        </Alert>
      )}

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentWorkflow ? 'Update Workflow' : 'Save New Workflow'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Workflow Name"
              value={saveData.name}
              onChange={(e) => setSaveData({ ...saveData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={saveData.description}
              onChange={(e) => setSaveData({ ...saveData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={saveData.category}
                onChange={(e) => setSaveData({ ...saveData, category: e.target.value })}
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

            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Summary:</strong> {nodes.length} nodes, {edges.length} connections
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading || !saveData.name.trim()}
          >
            {loading ? <CircularProgress size={16} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Workflow</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{currentWorkflow?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={16} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowActions;
