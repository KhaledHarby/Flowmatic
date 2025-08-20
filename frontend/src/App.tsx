import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import WorkflowDesigner from './pages/WorkflowDesigner/WorkflowDesigner';
import WorkflowList from './pages/WorkflowList/WorkflowList';
import WorkflowInstances from './pages/WorkflowInstances/WorkflowInstances';
import ApplicationStatus from './pages/ApplicationStatus/ApplicationStatus';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workflows" element={<WorkflowList />} />
            <Route path="/workflows/design" element={<WorkflowDesigner />} />
            <Route path="/workflows/design/:id" element={<WorkflowDesigner />} />
            <Route path="/instances" element={<WorkflowInstances />} />
            <Route path="/applications" element={<ApplicationStatus />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Box>
    </Router>
  );
}

export default App;
