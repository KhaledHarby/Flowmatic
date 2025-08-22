import React from 'react';
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { Box, Chip, Tooltip } from '@mui/material';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition?: any;
  targetPosition?: any;
  data?: {
    label?: string;
    condition?: string;
    service?: any;
  };
  selected?: boolean;
}

const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={selected ? '#1976d2' : '#bdbdbd'}
        strokeWidth={selected ? 3 : 2}
        fill="none"
        style={{
          strokeDasharray: data?.condition ? '5,5' : 'none',
        }}
      />
      
      <EdgeLabelRenderer>
        <Box
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
            backgroundColor: 'white',
            padding: '2px 6px',
            borderRadius: 1,
            border: '1px solid #ccc',
            boxShadow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 80,
          }}
        >
          {data?.label && (
            <Box sx={{ fontWeight: 'medium', fontSize: '0.75rem' }}>
              {data.label}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
            {data?.condition && (
              <Tooltip title={data.condition}>
                <Chip
                  label="Condition"
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    borderStyle: 'dashed',
                  }}
                />
              </Tooltip>
            )}
            
            {data?.service && (
              <Chip
                label="Service"
                size="small"
                variant="outlined"
                sx={{
                  height: 16,
                  fontSize: '0.6rem',
                }}
              />
            )}
          </Box>
        </Box>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
