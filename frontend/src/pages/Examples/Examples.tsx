import React, { useState } from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Business,
  Approval,
  DataObject,
  PlayArrow,
  ExpandMore,
  CheckCircle,
  Schedule,
  Code,
  Api,
  Email,
  FilterAlt,
  Loop
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { allExamples } from '../../examples/EmployeeOnboardingExample';

const Examples: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'human resources':
        return <Business />;
      case 'approval':
        return <Approval />;
      case 'data processing':
        return <DataObject />;
      default:
        return <Code />;
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

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'basic':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  const getNodeTypeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'start':
        return <PlayArrow />;
      case 'end':
        return <CheckCircle />;
      case 'task':
        return <Code />;
      case 'service':
        return <Api />;
      case 'condition':
        return <FilterAlt />;
      case 'timer':
        return <Schedule />;
      case 'notification':
        return <Email />;
      case 'loop':
        return <Loop />;
      default:
        return <Code />;
    }
  };

  const handleOpenDesigner = (example: any) => {
    // Navigate to workflow designer with the example pre-loaded
    navigate('/workflow-designer', { 
      state: { 
        example: example,
        loadExample: true 
      } 
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Workflow Examples
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Explore pre-built workflow examples to understand FlowMaster's capabilities and get started quickly.
      </Typography>

      <Grid container spacing={3}>
        {allExamples.map((example, index) => {
          const nodeTypes = Array.from(new Set(example.nodes.map(node => node.data.nodeType)));
          const complexity = example.name.includes('Simple') ? 'Basic' : 
                           example.name.includes('Employee') ? 'Advanced' : 'Intermediate';

          return (
            <Grid item xs={12} key={example.name}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getCategoryIcon(example.category)}
                    <Typography variant="h5" component="h2" sx={{ ml: 1 }}>
                      {example.name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={example.category}
                      color={getCategoryColor(example.category) as any}
                      size="small"
                    />
                    <Chip
                      label={complexity}
                      color={getComplexityColor(complexity) as any}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${example.nodes.length} Nodes`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${example.edges.length} Connections`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {example.description}
                  </Typography>

                  <Accordion 
                    expanded={expanded === `panel-${index}`}
                    onChange={handleAccordionChange(`panel-${index}`)}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle1">
                        Workflow Details
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>
                            Node Types Used
                          </Typography>
                          <List dense>
                            {nodeTypes.map((nodeType) => (
                              <ListItem key={nodeType}>
                                <ListItemIcon>
                                  {getNodeTypeIcon(nodeType)}
                                </ListItemIcon>
                                <ListItemText 
                                  primary={nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} 
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>
                            Key Features
                          </Typography>
                          <List dense>
                            {example.name === "Employee Onboarding Process" && (
                              <>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="Conditional branching and decision points" />
                                </ListItem>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="External service integrations" />
                                </ListItem>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="Timer and wait nodes" />
                                </ListItem>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="Loop patterns for training completion" />
                                </ListItem>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="Email notifications and task assignments" />
                                </ListItem>
                              </>
                            )}
                            {example.name === "Simple Approval Workflow" && (
                              <>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="Basic approval patterns" />
                                </ListItem>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="Task assignment and completion" />
                                </ListItem>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="Conditional routing" />
                                </ListItem>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="Simple decision logic" />
                                </ListItem>
                              </>
                            )}
                            {example.name === "Data Processing Pipeline" && (
                              <>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="Sequential data processing" />
                                </ListItem>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="Service node configurations" />
                                </ListItem>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="Database operations" />
                                </ListItem>
                                <ListItem>
                                  <ListItemIcon><CheckCircle /></ListItemIcon>
                                  <ListItemText primary="Notification workflows" />
                                </ListItem>
                              </>
                            )}
                          </List>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>

                <CardActions>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => handleOpenDesigner(example)}
                    size="large"
                  >
                    Open in Designer
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenDesigner(example)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Getting Started
        </Typography>
        <Typography variant="body1" paragraph>
          These examples demonstrate the full range of FlowMaster's workflow capabilities. 
          Each example can be loaded into the workflow designer where you can:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><CheckCircle /></ListItemIcon>
            <ListItemText primary="Explore the workflow structure and node configurations" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircle /></ListItemIcon>
            <ListItemText primary="Modify and customize the workflow for your needs" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircle /></ListItemIcon>
            <ListItemText primary="Test the workflow execution and see how it behaves" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircle /></ListItemIcon>
            <ListItemText primary="Use as a starting point for your own workflows" />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default Examples;

