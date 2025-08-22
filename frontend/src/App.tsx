import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store/store';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Workflows from './pages/Workflows/Workflows';
import Instances from './pages/Instances/Instances';
import WorkflowDesigner from './pages/WorkflowDesigner/WorkflowDesigner';
import Examples from './pages/Examples/Examples';
import Users from './pages/Users/Users';
import Applications from './pages/Applications/Applications';
import Simulator from './pages/Simulator/Simulator';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/workflows" element={<Workflows />} />
                <Route path="/instances" element={<Instances />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/users" element={<Users />} />
                <Route path="/examples" element={<Examples />} />
                <Route path="/simulator" element={<Simulator />} />
                <Route path="/workflow-designer" element={
                  <ErrorBoundary>
                    <WorkflowDesigner />
                  </ErrorBoundary>
                } />
                <Route path="/workflow-designer/:id" element={
                  <ErrorBoundary>
                    <WorkflowDesigner />
                  </ErrorBoundary>
                } />
              </Routes>
            </Layout>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
