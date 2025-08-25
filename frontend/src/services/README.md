# Backend Integration

This document describes the integration between the frontend workflow designer and the backend API.

## API Service

The `apiService.ts` file provides a complete interface to the backend workflow management API.

### Configuration

Set the API base URL in your environment:

```bash
# .env file
VITE_API_BASE_URL=http://localhost:5000/api
```

### Features

#### Workflow Definition Operations
- ✅ **Create** - Create new workflow definitions
- ✅ **Read** - Get all workflows or by ID
- ✅ **Update** - Update existing workflows
- ✅ **Delete** - Delete workflows
- ✅ **Publish** - Publish workflows for execution
- ✅ **Archive** - Archive workflows
- ✅ **Validate** - Validate workflow structure
- ✅ **Version** - Create new versions

#### Data Conversion
- ✅ **Frontend to Backend** - Convert ReactFlow nodes/edges to backend DTOs
- ✅ **Backend to Frontend** - Convert backend DTOs to ReactFlow format
- ✅ **Type Mapping** - Map between frontend and backend node types

### Usage Examples

#### Creating a Workflow
```typescript
import apiService from '../services/apiService';

const createWorkflow = async (nodes: Node[], edges: Edge[]) => {
  const { nodes: backendNodes, edges: backendEdges, definitionJson } = 
    apiService.convertReactFlowToBackend(nodes, edges);

  const workflow = await apiService.createWorkflowDefinition({
    name: 'My Workflow',
    description: 'A sample workflow',
    category: 'Business Process',
    definitionJson,
    nodes: backendNodes,
    edges: backendEdges,
  });
};
```

#### Loading a Workflow
```typescript
const loadWorkflow = async (id: string) => {
  const workflow = await apiService.getWorkflowDefinitionById(id);
  const { nodes, edges } = apiService.convertBackendToReactFlow(workflow);
  // Use nodes and edges in ReactFlow
};
```

## Workflow Actions Component

The `WorkflowActions.tsx` component provides a complete UI for workflow management:

### Features
- ✅ **Save/Update** - Save new workflows or update existing ones
- ✅ **Publish** - Publish workflows for execution
- ✅ **Validate** - Validate workflow structure
- ✅ **Archive** - Archive workflows
- ✅ **Delete** - Delete workflows with confirmation
- ✅ **Version** - Create new versions
- ✅ **Status Display** - Show workflow status and metadata

### Integration
The component is integrated into the main WorkflowDesigner and provides:
- Real-time status updates
- Error handling and user feedback
- Loading states
- Confirmation dialogs

## Workflows List Page

The updated `Workflows.tsx` page provides:

### Features
- ✅ **List View** - Display all workflows in a table
- ✅ **Filtering** - Filter by category and status
- ✅ **Search** - Search by name and description
- ✅ **Actions** - View, edit, publish, archive, delete
- ✅ **Create** - Create new workflows
- ✅ **Real-time Updates** - Refresh data from backend

### Navigation
- Click "View" or "Edit" to open in WorkflowDesigner
- Click "Create Workflow" to start a new workflow
- Use filters to find specific workflows

## Backend API Endpoints

The integration uses these backend endpoints:

### Workflow Definitions
- `GET /api/WorkflowDefinitions` - Get all workflows
- `GET /api/WorkflowDefinitions/{id}` - Get workflow by ID
- `POST /api/WorkflowDefinitions` - Create workflow
- `PUT /api/WorkflowDefinitions/{id}` - Update workflow
- `DELETE /api/WorkflowDefinitions/{id}` - Delete workflow
- `POST /api/WorkflowDefinitions/{id}/publish` - Publish workflow
- `POST /api/WorkflowDefinitions/{id}/archive` - Archive workflow
- `POST /api/WorkflowDefinitions/{id}/validate` - Validate workflow
- `POST /api/WorkflowDefinitions/{id}/version` - Create new version

## Data Flow

1. **Design** - User creates workflow in ReactFlow designer
2. **Convert** - Frontend converts ReactFlow data to backend format
3. **Save** - Data is sent to backend API
4. **Store** - Backend stores workflow definition
5. **Load** - When editing, backend data is converted back to ReactFlow format

## Error Handling

The integration includes comprehensive error handling:
- Network errors
- Validation errors
- Backend API errors
- User-friendly error messages
- Loading states
- Retry mechanisms

## Type Safety

All API calls are fully typed with TypeScript:
- Request/response DTOs
- Error types
- Status enums
- Node/edge types

This ensures compile-time safety and better developer experience.



