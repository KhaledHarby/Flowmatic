import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import apiService from '../services/apiService';

const ApiTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testApiConnection = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('Testing API connection...');
      const workflows = await apiService.getAllWorkflowDefinitions();
      setResult(`✅ API Connection Successful! Found ${workflows.length} workflows.`);
      console.log('API test successful:', workflows);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`❌ API Connection Failed: ${errorMessage}`);
      console.error('API test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        API Connection Test
      </Typography>
      
      <Button
        variant="contained"
        onClick={testApiConnection}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={20} /> : 'Test API Connection'}
      </Button>

      {result && (
        <Alert severity="success" sx={{ mb: 1 }}>
          {result}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary">
        This will test the connection to the backend API. Check the browser console for detailed logs.
      </Typography>
    </Box>
  );
};

export default ApiTest;



