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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Save,
  Close,
  ExpandMore,
  Add,
  Delete,
  Settings
} from '@mui/icons-material';

interface ServiceConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (service: any) => void;
}

const ServiceConfigDialog: React.FC<ServiceConfigDialogProps> = ({
  open,
  onClose,
  onSave
}) => {
  const [service, setService] = useState<any>({
    name: '',
    type: 'external-api',
    endpoint: '',
    method: 'GET',
    timeout: 30000,
    retryAttempts: 3,
    headers: {},
    parameters: {},
    authentication: {
      type: 'none',
      credentials: {}
    },
    validation: {
      enabled: false,
      schema: ''
    }
  });

  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [parameters, setParameters] = useState<Array<{ key: string; value: string }>>([]);

  const handleSave = () => {
    // Convert arrays to objects
    const headersObj = headers.reduce((acc, header) => {
      if (header.key && header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {});

    const parametersObj = parameters.reduce((acc, param) => {
      if (param.key && param.value) {
        acc[param.key] = param.value;
      }
      return acc;
    }, {});

    const finalService = {
      ...service,
      headers: headersObj,
      parameters: parametersObj
    };

    onSave(finalService);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addParameter = () => {
    setParameters([...parameters, { key: '', value: '' }]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, field: 'key' | 'value', value: string) => {
    const newParameters = [...parameters];
    newParameters[index][field] = value;
    setParameters(newParameters);
  };

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
            Configure Service
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Basic Configuration
          </Typography>
          
          <TextField
            fullWidth
            label="Service Name"
            value={service.name}
            onChange={(e) => setService({ ...service, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Service Type</InputLabel>
            <Select
              value={service.type}
              onChange={(e) => setService({ ...service, type: e.target.value })}
            >
              <MenuItem value="external-api">External API</MenuItem>
              <MenuItem value="internal-service">Internal Service</MenuItem>
              <MenuItem value="database">Database</MenuItem>
              <MenuItem value="validation">Validation Service</MenuItem>
              <MenuItem value="transformation">Data Transformation</MenuItem>
              <MenuItem value="notification">Notification Service</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Endpoint/Service Name"
            value={service.endpoint}
            onChange={(e) => setService({ ...service, endpoint: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="https://api.example.com/endpoint or ServiceName"
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>HTTP Method</InputLabel>
            <Select
              value={service.method}
              onChange={(e) => setService({ ...service, method: e.target.value })}
            >
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
              <MenuItem value="PATCH">PATCH</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Performance Settings
          </Typography>
          
          <TextField
            fullWidth
            label="Timeout (milliseconds)"
            type="number"
            value={service.timeout}
            onChange={(e) => setService({ ...service, timeout: parseInt(e.target.value) || 30000 })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Retry Attempts"
            type="number"
            value={service.retryAttempts}
            onChange={(e) => setService({ ...service, retryAttempts: parseInt(e.target.value) || 3 })}
            sx={{ mb: 2 }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Headers Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">HTTP Headers</Typography>
                <Button
                  startIcon={<Add />}
                  onClick={addHeader}
                  size="small"
                >
                  Add Header
                </Button>
              </Box>
              
              <List>
                {headers.map((header, index) => (
                  <ListItem key={index} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            label="Key"
                            value={header.key}
                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            label="Value"
                            value={header.value}
                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => removeHeader(index)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              
              {headers.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No headers configured. Click "Add Header" to add one.
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Parameters Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Request Parameters</Typography>
                <Button
                  startIcon={<Add />}
                  onClick={addParameter}
                  size="small"
                >
                  Add Parameter
                </Button>
              </Box>
              
              <List>
                {parameters.map((param, index) => (
                  <ListItem key={index} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            label="Key"
                            value={param.key}
                            onChange={(e) => updateParameter(index, 'key', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            label="Value"
                            value={param.value}
                            onChange={(e) => updateParameter(index, 'value', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => removeParameter(index)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              
              {parameters.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No parameters configured. Click "Add Parameter" to add one.
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Authentication</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Authentication Type</InputLabel>
                <Select
                  value={service.authentication.type}
                  onChange={(e) => setService({
                    ...service,
                    authentication: { ...service.authentication, type: e.target.value }
                  })}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="basic">Basic Auth</MenuItem>
                  <MenuItem value="bearer">Bearer Token</MenuItem>
                  <MenuItem value="api-key">API Key</MenuItem>
                  <MenuItem value="oauth2">OAuth 2.0</MenuItem>
                </Select>
              </FormControl>
              
              {service.authentication.type === 'basic' && (
                <Box>
                  <TextField
                    fullWidth
                    label="Username"
                    value={service.authentication.credentials.username || ''}
                    onChange={(e) => setService({
                      ...service,
                      authentication: {
                        ...service.authentication,
                        credentials: { ...service.authentication.credentials, username: e.target.value }
                      }
                    })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={service.authentication.credentials.password || ''}
                    onChange={(e) => setService({
                      ...service,
                      authentication: {
                        ...service.authentication,
                        credentials: { ...service.authentication.credentials, password: e.target.value }
                      }
                    })}
                  />
                </Box>
              )}
              
              {service.authentication.type === 'bearer' && (
                <TextField
                  fullWidth
                  label="Bearer Token"
                  value={service.authentication.credentials.token || ''}
                  onChange={(e) => setService({
                    ...service,
                    authentication: {
                      ...service.authentication,
                      credentials: { ...service.authentication.credentials, token: e.target.value }
                    }
                  })}
                />
              )}
              
              {service.authentication.type === 'api-key' && (
                <Box>
                  <TextField
                    fullWidth
                    label="API Key Name"
                    value={service.authentication.credentials.keyName || ''}
                    onChange={(e) => setService({
                      ...service,
                      authentication: {
                        ...service.authentication,
                        credentials: { ...service.authentication.credentials, keyName: e.target.value }
                      }
                    })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="API Key Value"
                    value={service.authentication.credentials.keyValue || ''}
                    onChange={(e) => setService({
                      ...service,
                      authentication: {
                        ...service.authentication,
                        credentials: { ...service.authentication.credentials, keyValue: e.target.value }
                      }
                    })}
                  />
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Response Validation</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={service.validation.enabled}
                    onChange={(e) => setService({
                      ...service,
                      validation: { ...service.validation, enabled: e.target.checked }
                    })}
                  />
                }
                label="Enable Response Validation"
                sx={{ mb: 2 }}
              />
              
              {service.validation.enabled && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Validation Schema (JSON)"
                  value={service.validation.schema}
                  onChange={(e) => setService({
                    ...service,
                    validation: { ...service.validation, schema: e.target.value }
                  })}
                  placeholder='{"type": "object", "properties": {...}}'
                  helperText="JSON Schema for response validation"
                />
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Save Service Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceConfigDialog;
