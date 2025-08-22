import React from 'react';
import { Handle, Position } from 'reactflow';
import {
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Code,
  Api,
  Storage,
  Email,
  Notifications,
  Schedule,
  FilterAlt,
  Loop,
  CallMerge,
  CallSplit,
  Settings,
  Delete
} from '@mui/icons-material';

const nodeTypeConfig = {
  start: { icon: <PlayArrow />, color: '#4caf50', bgColor: '#e8f5e8' },
  end: { icon: <Stop />, color: '#9e9e9e', bgColor: '#f5f5f5' },
  task: { icon: <Code />, color: '#2196f3', bgColor: '#e3f2fd' },
  service: { icon: <Api />, color: '#ff9800', bgColor: '#fff3e0' },
  database: { icon: <Storage />, color: '#9c27b0', bgColor: '#f3e5f5' },
  email: { icon: <Email />, color: '#f44336', bgColor: '#ffebee' },
  notification: { icon: <Notifications />, color: '#607d8b', bgColor: '#eceff1' },
  timer: { icon: <Schedule />, color: '#795548', bgColor: '#efebe9' },
  condition: { icon: <FilterAlt />, color: '#e91e63', bgColor: '#fce4ec' },
  loop: { icon: <Loop />, color: '#3f51b5', bgColor: '#e8eaf6' },
  split: { icon: <CallSplit />, color: '#009688', bgColor: '#e0f2f1' },
  merge: { icon: <CallMerge />, color: '#ff5722', bgColor: '#fbe9e7' }
};

interface CustomNodeProps {
  data: {
    type?: string;
    nodeType?: string;
    label: string;
    description?: string;
    enabled?: boolean;
    config?: any;
    services?: any[];
  };
  selected?: boolean;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data, selected }) => {
  const nodeType = data.type || data.nodeType || 'task';
  const config = nodeTypeConfig[nodeType as keyof typeof nodeTypeConfig] || nodeTypeConfig.task;

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        minWidth: 150,
        maxWidth: 200,
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        backgroundColor: config.bgColor,
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <Box sx={{ p: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ color: config.color }}>
              {config.icon}
            </Box>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
              {nodeType}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Configure">
              <IconButton size="small">
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error">
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Label */}
        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
          {data.label}
        </Typography>

        {/* Description */}
        {data.description && (
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
            {data.description}
          </Typography>
        )}

        {/* Status */}
        <Chip
          label={data.enabled ? 'Enabled' : 'Disabled'}
          size="small"
          color={data.enabled ? 'success' : 'default'}
          sx={{ mb: 1 }}
        />

        {/* Type-specific details */}
                 {(data.type || 'task') === 'condition' && data.config?.condition && (
          <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>
            {data.config.condition}
          </Typography>
        )}

                 {(data.type || 'task') === 'service' && data.config?.endpoint && (
          <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>
            {data.config.endpoint}
          </Typography>
        )}

        {/* Services */}
        {data.services && data.services.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {data.services.slice(0, 2).map((service, index) => (
              <Chip
                key={index}
                label={service.name}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            {data.services.length > 2 && (
              <Typography variant="caption" color="textSecondary">
                +{data.services.length - 2} more
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Handle type="source" position={Position.Bottom} />
    </Paper>
  );
};

export default CustomNode;
