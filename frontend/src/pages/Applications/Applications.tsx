import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Snackbar,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  AccountTree as WorkflowIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import applicationsService from '../../services/applicationsService';
import type { ApplicationWorkflowInstance, WorkflowTask, WorkflowLog } from '../../services/applicationsService';

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationWorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWorkflowInstance | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationsService.getAllApplications();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'InProgress':
        return 'primary';
      case 'Cancelled':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'InProgress':
        return 'primary';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'Error':
        return 'error';
      case 'Warning':
        return 'warning';
      case 'Info':
        return 'info';
      default:
        return 'default';
    }
  };

  const openDetailsDialog = (application: ApplicationWorkflowInstance) => {
    setSelectedApplication(application);
    setDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading applications...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Applications
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadApplications}
        >
          Refresh
        </Button>
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

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                                 <TableRow>
                   <TableCell>Application ID</TableCell>
                   <TableCell>Workflow</TableCell>
                   <TableCell>Status</TableCell>
                   <TableCell>Current Step</TableCell>
                   <TableCell>Started</TableCell>
                   <TableCell>Last Activity</TableCell>
                   <TableCell>Tasks</TableCell>
                   <TableCell>Actions</TableCell>
                 </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <WorkflowIcon sx={{ mr: 1 }} />
                        {application.applicationId}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {application.workflowDefinition?.name || 'Unknown Workflow'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {application.workflowDefinitionId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={application.status}
                        color={getStatusColor(application.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {application.currentNodeId || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(application.startedAt), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(application.lastActivityAt || application.startedAt), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Badge badgeContent={application.tasks.filter(t => t.status === 'Completed').length} color="success">
                          <Chip
                            label="Completed"
                            color="success"
                            size="small"
                            icon={<CheckCircleIcon />}
                          />
                        </Badge>
                        <Badge badgeContent={application.tasks.filter(t => t.status === 'Pending' || t.status === 'InProgress').length} color="primary">
                          <Chip
                            label="Active"
                            color="primary"
                            size="small"
                            icon={<AssignmentIcon />}
                          />
                        </Badge>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openDetailsDialog(application)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Application Details - {selectedApplication?.applicationId}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Grid container spacing={3}>
              {/* Application Info */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Application Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Application ID
                        </Typography>
                        <Typography variant="body1">
                          {selectedApplication.applicationId}
                        </Typography>
                      </Grid>
                                             <Grid item xs={6}>
                         <Typography variant="body2" color="textSecondary">
                           Workflow
                         </Typography>
                         <Typography variant="body1">
                           {selectedApplication.workflowDefinition?.name || 'Unknown Workflow'}
                         </Typography>
                       </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Status
                        </Typography>
                        <Chip
                          label={selectedApplication.status}
                          color={getStatusColor(selectedApplication.status) as any}
                          size="small"
                        />
                      </Grid>
                                             <Grid item xs={6}>
                         <Typography variant="body2" color="textSecondary">
                           Current Step
                         </Typography>
                         <Typography variant="body1">
                           {selectedApplication.currentNodeId || 'Unknown'}
                         </Typography>
                       </Grid>
                                             <Grid item xs={6}>
                         <Typography variant="body2" color="textSecondary">
                           Started
                         </Typography>
                         <Typography variant="body1">
                           {format(new Date(selectedApplication.startedAt), 'MMM dd, yyyy HH:mm')}
                         </Typography>
                       </Grid>
                       <Grid item xs={6}>
                         <Typography variant="body2" color="textSecondary">
                           Last Activity
                         </Typography>
                         <Typography variant="body1">
                           {format(new Date(selectedApplication.lastActivityAt || selectedApplication.startedAt), 'MMM dd, yyyy HH:mm')}
                         </Typography>
                       </Grid>
                      {selectedApplication.completedAt && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Completed
                          </Typography>
                          <Typography variant="body1">
                            {format(new Date(selectedApplication.completedAt), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tasks */}
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      Tasks ({selectedApplication.tasks.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component={Paper}>
                      <Table size="small">
                                                 <TableHead>
                           <TableRow>
                             <TableCell>Task</TableCell>
                             <TableCell>Status</TableCell>
                             <TableCell>Priority</TableCell>
                             <TableCell>Assigned To</TableCell>
                             <TableCell>Created</TableCell>
                             <TableCell>Completed</TableCell>
                             <TableCell>Result</TableCell>
                           </TableRow>
                         </TableHead>
                        <TableBody>
                          {selectedApplication.tasks.map((task) => (
                            <TableRow key={task.id}>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                  {task.title}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {task.description}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={task.status}
                                  color={getTaskStatusColor(task.status) as any}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={task.priority}
                                  color={task.priority === 'High' ? 'error' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                                                             <TableCell>
                                 {task.assignedTo ? (
                                   <Box display="flex" alignItems="center">
                                     <PersonIcon sx={{ mr: 0.5, fontSize: 16 }} />
                                     {task.assignedTo}
                                   </Box>
                                 ) : (
                                   <Typography variant="body2" color="textSecondary">
                                     Unassigned
                                   </Typography>
                                 )}
                               </TableCell>
                               <TableCell>
                                 <Typography variant="body2">
                                   {format(new Date(task.createdAt), 'MMM dd, HH:mm')}
                                 </Typography>
                               </TableCell>
                              <TableCell>
                                {task.completedAt ? (
                                  <Typography variant="body2">
                                    {format(new Date(task.completedAt), 'MMM dd, HH:mm')}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="textSecondary">
                                    -
                                  </Typography>
                                )}
                              </TableCell>
                                                             <TableCell>
                                 <Typography variant="body2">
                                   {task.result || '-'}
                                 </Typography>
                               </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Activity Log */}
              <Grid item xs={12}>
                <Accordion>
                                     <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                     <Typography variant="h6">
                       Activity Log ({selectedApplication.executionLog.length})
                     </Typography>
                   </AccordionSummary>
                  <AccordionDetails>
                                         <List dense>
                       {selectedApplication.executionLog.map((log, index) => (
                         <React.Fragment key={log.id}>
                           <ListItem>
                             <ListItemText
                               primary={
                                 <Box display="flex" alignItems="center" gap={1}>
                                   <Chip
                                     label={log.level}
                                     color={getLogLevelColor(log.level) as any}
                                     size="small"
                                   />
                                   <Typography variant="body2">
                                     {log.message}
                                   </Typography>
                                 </Box>
                               }
                               secondary={
                                 <Box display="flex" alignItems="center" gap={1}>
                                   <ScheduleIcon sx={{ fontSize: 14 }} />
                                   <Typography variant="caption">
                                     {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                                   </Typography>
                                   {log.executedBy && (
                                     <>
                                       <PersonIcon sx={{ fontSize: 14 }} />
                                       <Typography variant="caption">
                                         {log.executedBy}
                                       </Typography>
                                     </>
                                   )}
                                 </Box>
                               }
                             />
                           </ListItem>
                           {index < selectedApplication.executionLog.length - 1 && <Divider />}
                         </React.Fragment>
                       ))}
                     </List>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
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

export default Applications;
