import React, { useState, useEffect } from 'react';
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
  Grid,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import userService from '../../../services/userService';
import type { UserDto, AssignTaskDto, TaskPriority } from '../../../types/user';

interface TaskAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  onAssign: (assignData: AssignTaskDto) => Promise<void>;
}

const TaskAssignmentDialog: React.FC<TaskAssignmentDialogProps> = ({
  open,
  onClose,
  taskId,
  taskTitle,
  onAssign
}) => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Normal);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      // Filter only active users
      const activeUsers = data.filter(user => user.status === 'Active');
      setUsers(activeUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser) {
      setError('Please select a user to assign the task to');
      return;
    }

    try {
      setAssigning(true);
      setError(null);

      const assignData: AssignTaskDto = {
        taskId,
        assignedToUserId: selectedUser.id,
        assignmentNotes: assignmentNotes.trim() || undefined,
        dueDate: dueDate?.toISOString(),
        priority
      };

      await onAssign(assignData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign task');
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setAssignmentNotes('');
    setDueDate(null);
    setPriority(TaskPriority.Normal);
    setError(null);
    onClose();
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Low:
        return 'default';
      case TaskPriority.Normal:
        return 'primary';
      case TaskPriority.High:
        return 'warning';
      case TaskPriority.Critical:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Assign Task: {taskTitle}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Select User to Assign
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Autocomplete
                options={users}
                getOptionLabel={(user) => `${user.firstName} ${user.lastName} (${user.username})`}
                value={selectedUser}
                onChange={(_, newValue) => setSelectedUser(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select User"
                    placeholder="Search users..."
                    required
                  />
                )}
                renderOption={(props, user) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {user.username} • {user.department || 'No Department'} • {user.role || 'No Role'}
                      </Typography>
                      <Box display="flex" gap={1} mt={0.5}>
                        <Chip
                          label={`${user.activeTaskCount} Active Tasks`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={`${user.completedTaskCount} Completed`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>
                )}
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <MenuItem value={TaskPriority.Low}>
                  <Chip label="Low" color="default" size="small" />
                </MenuItem>
                <MenuItem value={TaskPriority.Normal}>
                  <Chip label="Normal" color="primary" size="small" />
                </MenuItem>
                <MenuItem value={TaskPriority.High}>
                  <Chip label="High" color="warning" size="small" />
                </MenuItem>
                <MenuItem value={TaskPriority.Critical}>
                  <Chip label="Critical" color="error" size="small" />
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Due Date (Optional)"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: 'Set a deadline for this task'
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Assignment Notes (Optional)"
              placeholder="Add any specific instructions or context for this task..."
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              helperText="Provide additional context or instructions for the assigned user"
            />
          </Grid>

          {selectedUser && (
            <Grid item xs={12}>
              <Box p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Assignment Summary
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Task "{taskTitle}" will be assigned to {selectedUser.firstName} {selectedUser.lastName}
                  {dueDate && ` with a due date of ${dueDate.toLocaleString()}`}.
                  {assignmentNotes && ` Notes: ${assignmentNotes}`}
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  <Chip
                    label={`Priority: ${priority}`}
                    color={getPriorityColor(priority) as any}
                    size="small"
                  />
                  <Chip
                    label={`${selectedUser.activeTaskCount} Active Tasks`}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={assigning}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={!selectedUser || assigning}
          startIcon={assigning ? <CircularProgress size={16} /> : null}
        >
          {assigning ? 'Assigning...' : 'Assign Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskAssignmentDialog;


