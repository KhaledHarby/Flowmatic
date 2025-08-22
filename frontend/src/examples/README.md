# Workflow Designer Examples

This directory contains pre-built workflow examples that demonstrate the capabilities of the FlowMaster workflow designer. These examples serve as templates and learning resources for creating your own workflows.

## Available Examples

### 1. Employee Onboarding Process
**Category**: Human Resources  
**Complexity**: Advanced  
**Nodes**: 13 | **Connections**: 12

A comprehensive workflow that demonstrates:
- **Complex multi-step processes** with conditional branching
- **External service integrations** (background check API)
- **Timer and wait nodes** for asynchronous operations
- **Loop patterns** for training completion tracking
- **Email notifications** and task assignments
- **Decision points** with multiple outcome paths

**Workflow Steps**:
1. Start onboarding process
2. Collect required documents
3. Perform background check (external service)
4. Decision: Background check passed?
   - If failed: End process with rejection
   - If passed: Continue to system setup
5. Setup system access (internal service)
6. Wait for IT team completion
7. Send welcome email
8. Assign training modules
9. Loop: Check training completion
   - If incomplete: Wait and check again
   - If complete: Continue to final setup
10. Complete final onboarding tasks
11. End process with success notification

### 2. Simple Approval Workflow
**Category**: Approval  
**Complexity**: Basic  
**Nodes**: 5 | **Connections**: 4

A straightforward approval process that demonstrates:
- **Basic approval patterns** with single decision point
- **Task assignment** and completion
- **Conditional routing** based on approval status
- **Simple decision logic**

**Workflow Steps**:
1. Submit request
2. Manager approval task
3. Decision: Approved?
   - If approved: End with success
   - If rejected: End with rejection

### 3. Data Processing Pipeline
**Category**: Data Processing  
**Complexity**: Intermediate  
**Nodes**: 6 | **Connections**: 5

A sequential data processing workflow that demonstrates:
- **Sequential data processing** through multiple stages
- **Service node configurations** for data operations
- **Database operations** for data storage
- **Notification workflows** for completion alerts

**Workflow Steps**:
1. Data input
2. Validate data (service)
3. Transform data (service)
4. Store data (database service)
5. Send completion notification
6. End process

## How to Use Examples

### Loading an Example

1. **Open the Workflow Designer**
   - Navigate to the Workflow Designer page
   - You'll see an empty canvas ready for workflow creation

2. **Access the Example Loader**
   - In the left sidebar, find the "Examples" section
   - Click the "Load Example" button

3. **Select an Example**
   - Browse through the available examples
   - Click on any example to view its details
   - Review the description, components, and features

4. **Load the Example**
   - Click "Load Example" to populate the canvas
   - The workflow will be loaded with all nodes and connections
   - You can now explore, modify, or use it as a starting point

### Customizing Examples

Once loaded, you can:
- **Modify node configurations** by clicking on nodes
- **Add new nodes** from the node palette
- **Remove nodes** using the delete function
- **Reconnect nodes** by dragging new connections
- **Save your modified version** as a new workflow

### Understanding Node Types

The examples use various node types:

- **Start Node**: Entry point of the workflow
- **End Node**: Exit point of the workflow
- **Task Node**: Manual tasks assigned to users
- **Service Node**: Automated service calls (APIs, databases)
- **Condition Node**: Decision points with branching logic
- **Timer Node**: Delays and wait periods
- **Notification Node**: Email/SMS notifications
- **Loop Node**: Repeated execution patterns

## Example Use Cases

### For Learning
- Study the node configurations to understand how different features work
- Examine the connection patterns to learn about workflow logic
- Use as templates to build similar workflows

### For Development
- Test the workflow engine with complex scenarios
- Validate node and edge configurations
- Debug workflow execution paths

### For Production
- Use as starting points for real business processes
- Customize for specific organizational needs
- Scale up for enterprise workflows

## Best Practices

### When Using Examples
1. **Start Simple**: Begin with the Simple Approval Workflow if you're new to workflow design
2. **Study Patterns**: Pay attention to how conditional logic and loops are implemented
3. **Test Thoroughly**: Always test workflows before using them in production
4. **Document Changes**: Keep track of modifications made to examples

### When Creating Your Own
1. **Plan Your Flow**: Sketch out your workflow before building it
2. **Use Meaningful Names**: Give nodes and connections descriptive names
3. **Test Each Step**: Verify that each node works as expected
4. **Handle Errors**: Include error handling and fallback paths
5. **Optimize Performance**: Avoid unnecessary complexity in your workflows

## Technical Details

### File Structure
```
examples/
├── EmployeeOnboardingExample.ts  # Example workflow definitions
├── README.md                     # This documentation
└── index.ts                      # Export file (if needed)
```

### Data Structure
Each example follows this structure:
```typescript
interface ExampleWorkflow {
  name: string;           // Display name
  description: string;    // Detailed description
  category: string;       // Workflow category
  nodes: Node[];         // ReactFlow nodes
  edges: Edge[];         // ReactFlow edges
}
```

### Node Configuration
Nodes include configuration data that defines:
- **Node type** (start, end, task, service, etc.)
- **Display properties** (label, description)
- **Behavior settings** (assignees, timeouts, conditions)
- **Integration details** (API endpoints, service methods)

## Troubleshooting

### Common Issues
1. **Nodes not loading**: Check that all required components are imported
2. **Connections missing**: Verify that edge data is properly formatted
3. **Configuration errors**: Ensure node configurations match expected schemas

### Getting Help
- Check the main application documentation
- Review the ReactFlow documentation for node/edge details
- Contact the development team for technical support

## Contributing

To add new examples:
1. Create a new workflow definition following the existing pattern
2. Add it to the `allExamples` array
3. Update this documentation
4. Test the example thoroughly
5. Submit a pull request

## Version History

- **v1.0.0**: Initial release with three example workflows
- Employee Onboarding Process
- Simple Approval Workflow  
- Data Processing Pipeline

---

For more information about the FlowMaster workflow designer, refer to the main application documentation.

