import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  Box,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import {
  Business,
  Approval,
  DataObject,
  Description,
  Category,
  PlayArrow
} from '@mui/icons-material';
import { allExamples, type ExampleWorkflow } from '../../../examples/EmployeeOnboardingExample';

interface ExampleLoaderProps {
  open: boolean;
  onClose: () => void;
  onLoadExample: (example: ExampleWorkflow) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'human resources':
      return <Business />;
    case 'approval':
      return <Approval />;
    case 'data processing':
      return <DataObject />;
    default:
      return <Description />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'human resources':
      return 'primary';
    case 'approval':
      return 'success';
    case 'data processing':
      return 'info';
    default:
      return 'default';
  }
};

const ExampleLoader: React.FC<ExampleLoaderProps> = ({ open, onClose, onLoadExample }) => {
  const [selectedExample, setSelectedExample] = useState<ExampleWorkflow | null>(null);

  const handleLoadExample = () => {
    if (selectedExample) {
      onLoadExample(selectedExample);
      onClose();
      setSelectedExample(null);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedExample(null);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Load Example Workflow
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose from our pre-built workflow examples to get started quickly
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, height: '400px' }}>
          {/* Example List */}
          <Box sx={{ width: '40%', borderRight: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Available Examples
            </Typography>
            <List sx={{ pt: 0 }}>
              {allExamples.map((example, index) => (
                <React.Fragment key={example.name}>
                  <ListItem
                    button
                    selected={selectedExample?.name === example.name}
                    onClick={() => setSelectedExample(example)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                    }}
                  >
                    <ListItemIcon>
                      {getCategoryIcon(example.category)}
                    </ListItemIcon>
                    <ListItemText
                      primary={example.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={example.category}
                            size="small"
                            color={getCategoryColor(example.category) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < allExamples.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>

          {/* Example Details */}
          <Box sx={{ width: '60%', pl: 2 }}>
            {selectedExample ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedExample.name}
                </Typography>
                
                <Chip
                  label={selectedExample.category}
                  color={getCategoryColor(selectedExample.category) as any}
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {selectedExample.description}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Workflow Components:
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip label={`${selectedExample.nodes.length} Nodes`} size="small" />
                  <Chip label={`${selectedExample.edges.length} Connections`} size="small" />
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Node Types Included:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {Array.from(new Set(selectedExample.nodes.map(node => node.data.nodeType))).map(nodeType => (
                    <Chip
                      key={nodeType}
                      label={nodeType}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    This example demonstrates:
                  </Typography>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {selectedExample.name === "Employee Onboarding Process" && (
                      <>
                        <li>Complex multi-step workflows</li>
                        <li>Conditional branching and decision points</li>
                        <li>External service integrations</li>
                        <li>Timer and wait nodes</li>
                        <li>Loop patterns for training completion</li>
                        <li>Email notifications and task assignments</li>
                      </>
                    )}
                    {selectedExample.name === "Simple Approval Workflow" && (
                      <>
                        <li>Basic approval patterns</li>
                        <li>Task assignment and completion</li>
                        <li>Conditional routing</li>
                        <li>Simple decision logic</li>
                      </>
                    )}
                    {selectedExample.name === "Data Processing Pipeline" && (
                      <>
                        <li>Sequential data processing</li>
                        <li>Service node configurations</li>
                        <li>Database operations</li>
                        <li>Notification workflows</li>
                      </>
                    )}
                  </ul>
                </Box>
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: 'text.secondary'
              }}>
                <Typography variant="body1">
                  Select an example from the list to view details
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={handleLoadExample}
          disabled={!selectedExample}
        >
          Load Example
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExampleLoader;

