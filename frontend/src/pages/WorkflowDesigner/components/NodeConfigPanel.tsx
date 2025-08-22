import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import {
  Save,
  Delete,
  Settings,
  Close
} from '@mui/icons-material';
import type { Node } from 'reactflow';

interface NodeConfigPanelProps {
  open: boolean;
  node: Node | null;
  onClose: () => void;
  onSave: (updates: any) => void;
  onDelete: () => void;
  onServiceConfig: () => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  open,
  node,
  onClose,
  onSave,
  onDelete,
  onServiceConfig
}) => {
  const [config, setConfig] = useState<any>({
    label: '',
    description: '',
    enabled: true,
    config: {},
    services: []
  });

  React.useEffect(() => {
    if (node) {
      setConfig({
        label: node.data?.label || '',
        description: node.data?.description || '',
        enabled: node.data?.enabled !== false,
        config: node.data?.config || {},
        services: node.data?.services || []
      });
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      onSave(config);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleDelete = () => {
    onDelete();
  };

  const handleServiceConfig = () => {
    onServiceConfig();
  };

  const getNodeTypeSpecificFields = () => {
    if (!node) return null;

    const nodeType = node.data?.nodeType || node.data?.type;

    switch (nodeType) {
      case 'task':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Task Configuration
            </Typography>
            <TextField
              fullWidth
              label="Assignee"
              value={config.config?.assignee || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { ...config.config, assignee: e.target.value }
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Due Date"
              value={config.config?.dueDate || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { ...config.config, dueDate: e.target.value }
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Instructions"
              value={config.config?.instructions || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { ...config.config, instructions: e.target.value }
              })}
            />
          </Box>
        );

      case 'service':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Service Configuration
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Service Type</InputLabel>
              <Select
                value={config.config?.serviceType || ''}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, serviceType: e.target.value }
                })}
              >
                <MenuItem value="external-api">External API</MenuItem>
                <MenuItem value="internal-service">Internal Service</MenuItem>
                <MenuItem value="database">Database</MenuItem>
                <MenuItem value="validation">Validation</MenuItem>
                <MenuItem value="transformation">Transformation</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Endpoint/Service Name"
              value={config.config?.endpoint || config.config?.serviceName || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { 
                  ...config.config, 
                  endpoint: e.target.value,
                  serviceName: e.target.value 
                }
              })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Method</InputLabel>
              <Select
                value={config.config?.method || 'GET'}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, method: e.target.value }
                })}
              >
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={handleServiceConfig}
              sx={{ mb: 2 }}
            >
              Configure Service Details
            </Button>
          </Box>
        );

      case 'condition':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Condition Configuration
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Condition Expression"
              value={config.config?.condition || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { ...config.config, condition: e.target.value }
              })}
              sx={{ mb: 2 }}
              placeholder="e.g., approvalStatus === 'approved'"
            />
            <TextField
              fullWidth
              label="True Path Label"
              value={config.config?.truePath || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { ...config.config, truePath: e.target.value }
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="False Path Label"
              value={config.config?.falsePath || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { ...config.config, falsePath: e.target.value }
              })}
            />
          </Box>
        );

      case 'timer':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Timer Configuration
            </Typography>
            <TextField
              fullWidth
              label="Duration"
              value={config.config?.duration || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { ...config.config, duration: e.target.value }
              })}
              sx={{ mb: 2 }}
              placeholder="e.g., 2 hours, 1 day"
            />
            <TextField
              fullWidth
              label="Max Wait Time"
              value={config.config?.maxWaitTime || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { ...config.config, maxWaitTime: e.target.value }
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Escalation After"
              value={config.config?.escalationAfter || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { ...config.config, escalationAfter: e.target.value }
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Escalation Recipients"
              value={config.config?.escalationRecipients?.join(', ') || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { 
                  ...config.config, 
                  escalationRecipients: e.target.value.split(',').map(s => s.trim())
                }
              })}
              placeholder="comma-separated list"
            />
          </Box>
        );

      case 'notification':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Notification Configuration
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Notification Type</InputLabel>
              <Select
                value={config.config?.type || 'email'}
                onChange={(e) => setConfig({
                  ...config,
                  config: { ...config.config, type: e.target.value }
                })}
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="push">Push Notification</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Template"
              value={config.config?.template || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { ...config.config, template: e.target.value }
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Recipients"
              value={config.config?.recipients?.join(', ') || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { 
                  ...config.config, 
                  recipients: e.target.value.split(',').map(s => s.trim())
                }
              })}
              sx={{ mb: 2 }}
              placeholder="comma-separated list"
            />
            <TextField
              fullWidth
              label="CC Recipients"
              value={config.config?.cc?.join(', ') || ''}
              onChange={(e) => setConfig({
                ...config,
                config: { 
                  ...config.config, 
                  cc: e.target.value.split(',').map(s => s.trim())
                }
              })}
              placeholder="comma-separated list"
            />
          </Box>
        );

      default:
        return null;
    }
  };

  if (!node) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5">
            Configure Node: {node.data?.label || node.id}
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Chip 
            label={node.data?.nodeType || node.data?.type || 'Unknown'} 
            size="small" 
            color="primary" 
          />
          <Chip 
            label={`ID: ${node.id}`} 
            size="small" 
            variant="outlined" 
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Basic Properties
          </Typography>
          
          <TextField
            fullWidth
            label="Label"
            value={config.label}
            onChange={(e) => setConfig({ ...config, label: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              />
            }
            label="Enabled"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {getNodeTypeSpecificFields()}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={handleDelete}
        >
          Delete Node
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NodeConfigPanel;

