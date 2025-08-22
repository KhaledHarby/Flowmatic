import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add,
  Delete,
  Settings
} from '@mui/icons-material';
import type { Edge } from 'reactflow';

interface EdgeConfigPanelProps {
  open: boolean;
  edge: Edge | null;
  onClose: () => void;
  onSave: (updates: any) => void;
  onServiceConfig: () => void;
  onDelete: () => void;
}

const EdgeConfigPanel: React.FC<EdgeConfigPanelProps> = ({
  open,
  edge,
  onClose,
  onSave,
  onServiceConfig,
  onDelete
}) => {
  const [config, setConfig] = useState({
    label: '',
    condition: '',
    priority: 'Normal',
    enabled: true,
    timeout: 30,
    retries: 0,
    validation: false
  });

  const [service, setService] = useState<any>(null);

  useEffect(() => {
    if (edge) {
      setConfig({
        label: edge.data?.label || '',
        condition: edge.data?.condition || '',
        priority: edge.data?.priority || 'Normal',
        enabled: edge.data?.enabled !== false,
        timeout: edge.data?.timeout || 30,
        retries: edge.data?.retries || 0,
        validation: edge.data?.validation || false
      });
      setService(edge.data?.service || null);
    }
  }, [edge]);

  const handleSave = () => {
    if (edge) {
      onSave({
        label: config.label,
        condition: config.condition,
        priority: config.priority,
        enabled: config.enabled,
        timeout: config.timeout,
        retries: config.retries,
        validation: config.validation,
        service: service
      });
    }
  };

  const addService = () => {
    const newService = {
      id: `service-${Date.now()}`,
      name: 'New Service',
      type: 'api',
      config: {}
    };
    setService(newService);
  };

  const removeService = () => {
    setService(null);
  };

  if (!edge) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Configure Edge: {edge.data?.label || 'Connection'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Basic Configuration */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Label"
                value={config.label}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                placeholder="Connection label"
              />
              <TextField
                fullWidth
                select
                label="Priority"
                value={config.priority}
                onChange={(e) => setConfig({ ...config, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </TextField>
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
          </Box>

          <Divider />

          {/* Condition Configuration */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Condition Configuration
            </Typography>
            <TextField
              fullWidth
              label="Condition Expression"
              value={config.condition}
              onChange={(e) => setConfig({ ...config, condition: e.target.value })}
              multiline
              rows={3}
              placeholder="e.g., amount > 1000 && status === 'approved'"
              helperText="JavaScript expression that determines if this path should be taken"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={config.validation}
                  onChange={(e) => setConfig({ ...config, validation: e.target.checked })}
                />
              }
              label="Validate condition before execution"
            />
          </Box>

          <Divider />

          {/* Service Configuration */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Service Configuration
              </Typography>
              {!service ? (
                <Button
                  startIcon={<Add />}
                  onClick={addService}
                  size="small"
                >
                  Add Service
                </Button>
              ) : (
                <Button
                  startIcon={<Delete />}
                  onClick={removeService}
                  size="small"
                  color="error"
                >
                  Remove Service
                </Button>
              )}
            </Box>

            {!service ? (
              <Typography variant="body2" color="textSecondary">
                No service configured. Click "Add Service" to configure one.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              >
                <Chip label={service.name} size="small" />
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Configure Service">
                  <IconButton
                    size="small"
                    onClick={onServiceConfig}
                  >
                    <Settings />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Advanced Configuration */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Advanced Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Timeout (seconds)"
                type="number"
                value={config.timeout}
                onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) || 30 })}
                helperText="Maximum execution time for this connection"
              />
              <TextField
                fullWidth
                label="Retry Count"
                type="number"
                value={config.retries}
                onChange={(e) => setConfig({ ...config, retries: parseInt(e.target.value) || 0 })}
                helperText="Number of retry attempts on failure"
              />
              <TextField
                fullWidth
                label="Custom Properties (JSON)"
                multiline
                rows={3}
                placeholder='{"key": "value"}'
                helperText="Additional properties for this connection"
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDelete} color="error">
          Delete Edge
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EdgeConfigPanel;
