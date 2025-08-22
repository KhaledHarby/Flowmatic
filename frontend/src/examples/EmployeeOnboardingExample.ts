import type { Node, Edge } from 'reactflow';

export interface ExampleWorkflow {
  name: string;
  description: string;
  category: string;
  nodes: Node[];
  edges: Edge[];
}

export const employeeOnboardingExample: ExampleWorkflow = {
  name: "Employee Onboarding Process",
  description: "A comprehensive workflow for onboarding new employees, including document collection, system access setup, and training coordination.",
  category: "Human Resources",
  nodes: [
    // Start Node
    {
      id: 'start',
      type: 'custom',
      position: { x: 100, y: 100 },
      data: {
        label: 'Start Onboarding',
        nodeType: 'start',
        description: 'New employee onboarding process begins',
        config: {
          triggerType: 'manual',
          variables: ['employeeId', 'employeeName', 'department', 'startDate']
        }
      }
    },

    // Document Collection Task
    {
      id: 'documents',
      type: 'custom',
      position: { x: 300, y: 100 },
      data: {
        label: 'Collect Documents',
        nodeType: 'task',
        description: 'Collect required employee documents',
        config: {
          assignee: 'hr-manager',
          dueDate: '3 days',
          requiredDocuments: [
            'Employment Contract',
            'Tax Forms',
            'ID Verification',
            'Emergency Contact'
          ],
          instructions: 'Please collect all required documents from the new employee'
        }
      }
    },

    // Service Node - Background Check
    {
      id: 'background-check',
      type: 'custom',
      position: { x: 500, y: 100 },
      data: {
        label: 'Background Check',
        nodeType: 'service',
        description: 'Automated background verification',
        config: {
          serviceType: 'external-api',
          endpoint: '/api/background-check',
          method: 'POST',
          timeout: 300000,
          retryAttempts: 3,
          parameters: {
            employeeId: '{{employeeId}}',
            checkType: 'comprehensive'
          }
        }
      }
    },

    // Decision Node - Background Check Result
    {
      id: 'background-decision',
      type: 'custom',
      position: { x: 700, y: 100 },
      data: {
        label: 'Background Check Passed?',
        nodeType: 'condition',
        description: 'Evaluate background check results',
        config: {
          condition: 'backgroundCheckResult === "passed"',
          truePath: 'approved',
          falsePath: 'rejected'
        }
      }
    },

    // Rejection Path
    {
      id: 'rejected',
      type: 'custom',
      position: { x: 700, y: 250 },
      data: {
        label: 'Onboarding Rejected',
        nodeType: 'end',
        description: 'Background check failed - process terminated',
        config: {
          status: 'rejected',
          notification: {
            type: 'email',
            recipients: ['hr-manager', 'hiring-manager'],
            template: 'onboarding-rejected'
          }
        }
      }
    },

    // Approval Path - System Access Setup
    {
      id: 'system-access',
      type: 'custom',
      position: { x: 900, y: 100 },
      data: {
        label: 'Setup System Access',
        nodeType: 'service',
        description: 'Create user accounts and access permissions',
        config: {
          serviceType: 'internal-service',
          serviceName: 'UserManagementService',
          method: 'CreateUser',
          parameters: {
            employeeId: '{{employeeId}}',
            department: '{{department}}',
            role: 'employee'
          },
          systems: [
            'Email System',
            'HR Portal',
            'Time Tracking',
            'Project Management'
          ]
        }
      }
    },

    // Timer Node - Wait for IT Setup
    {
      id: 'wait-it',
      type: 'custom',
      position: { x: 1100, y: 100 },
      data: {
        label: 'Wait for IT Setup',
        nodeType: 'timer',
        description: 'Wait for IT team to complete system setup',
        config: {
          duration: '2 hours',
          maxWaitTime: '24 hours',
          escalationAfter: '4 hours',
          escalationRecipients: ['it-manager']
        }
      }
    },

    // Notification Node - Welcome Email
    {
      id: 'welcome-email',
      type: 'custom',
      position: { x: 1300, y: 100 },
      data: {
        label: 'Send Welcome Email',
        nodeType: 'notification',
        description: 'Send welcome email with login credentials',
        config: {
          type: 'email',
          template: 'welcome-email',
          recipients: ['{{employeeEmail}}'],
          cc: ['hr-manager'],
          variables: {
            employeeName: '{{employeeName}}',
            loginUrl: '{{loginUrl}}',
            temporaryPassword: '{{tempPassword}}'
          }
        }
      }
    },

    // Task Node - Training Assignment
    {
      id: 'training',
      type: 'custom',
      position: { x: 1500, y: 100 },
      data: {
        label: 'Assign Training Modules',
        nodeType: 'task',
        description: 'Assign required training courses',
        config: {
          assignee: 'training-coordinator',
          dueDate: '7 days',
          trainingModules: [
            'Company Policies',
            'Safety Training',
            'Software Training',
            'Compliance Training'
          ],
          instructions: 'Assign and track completion of all required training modules'
        }
      }
    },

    // Loop Node - Training Completion Check
    {
      id: 'training-check',
      type: 'custom',
      position: { x: 1700, y: 100 },
      data: {
        label: 'Training Completed?',
        nodeType: 'condition',
        description: 'Check if all training modules are completed',
        config: {
          condition: 'trainingProgress === 100',
          truePath: 'training-complete',
          falsePath: 'wait-training',
          maxIterations: 30
        }
      }
    },

    // Wait Node - Training Progress
    {
      id: 'wait-training',
      type: 'custom',
      position: { x: 1700, y: 250 },
      data: {
        label: 'Wait for Training',
        nodeType: 'timer',
        description: 'Wait for employee to complete training',
        config: {
          duration: '1 day',
          checkInterval: '4 hours',
          reminderAfter: '3 days',
          reminderRecipients: ['{{employeeEmail}}', 'training-coordinator']
        }
      }
    },

    // Service Node - Final Setup
    {
      id: 'final-setup',
      type: 'custom',
      position: { x: 1900, y: 100 },
      data: {
        label: 'Final Setup Complete',
        nodeType: 'service',
        description: 'Complete final onboarding tasks',
        config: {
          serviceType: 'internal-service',
          serviceName: 'OnboardingService',
          method: 'CompleteOnboarding',
          parameters: {
            employeeId: '{{employeeId}}',
            onboardingDate: '{{startDate}}'
          }
        }
      }
    },

    // End Node - Success
    {
      id: 'success',
      type: 'custom',
      position: { x: 2100, y: 100 },
      data: {
        label: 'Onboarding Complete',
        nodeType: 'end',
        description: 'Employee onboarding successfully completed',
        config: {
          status: 'completed',
          notification: {
            type: 'email',
            recipients: ['hr-manager', 'hiring-manager', '{{employeeEmail}}'],
            template: 'onboarding-complete'
          },
          metrics: {
            trackDuration: true,
            trackSteps: true
          }
        }
      }
    }
  ],
  edges: [
    // Main flow
    {
      id: 'start-documents',
      source: 'start',
      target: 'documents',
      type: 'custom',
      data: {
        label: 'Begin Process'
      }
    },
    {
      id: 'documents-background',
      source: 'documents',
      target: 'background-check',
      type: 'custom',
      data: {
        label: 'Documents Collected'
      }
    },
    {
      id: 'background-decision',
      source: 'background-check',
      target: 'background-decision',
      type: 'custom',
      data: {
        label: 'Check Complete'
      }
    },
    {
      id: 'decision-rejected',
      source: 'background-decision',
      target: 'rejected',
      type: 'custom',
      data: {
        label: 'Failed',
        condition: 'backgroundCheckResult !== "passed"'
      }
    },
    {
      id: 'decision-approved',
      source: 'background-decision',
      target: 'system-access',
      type: 'custom',
      data: {
        label: 'Passed',
        condition: 'backgroundCheckResult === "passed"'
      }
    },
    {
      id: 'system-wait',
      source: 'system-access',
      target: 'wait-it',
      type: 'custom',
      data: {
        label: 'Access Created'
      }
    },
    {
      id: 'wait-welcome',
      source: 'wait-it',
      target: 'welcome-email',
      type: 'custom',
      data: {
        label: 'Setup Complete'
      }
    },
    {
      id: 'welcome-training',
      source: 'welcome-email',
      target: 'training',
      type: 'custom',
      data: {
        label: 'Email Sent'
      }
    },
    {
      id: 'training-check',
      source: 'training',
      target: 'training-check',
      type: 'custom',
      data: {
        label: 'Training Assigned'
      }
    },
    {
      id: 'check-wait',
      source: 'training-check',
      target: 'wait-training',
      type: 'custom',
      data: {
        label: 'Incomplete',
        condition: 'trainingProgress < 100'
      }
    },
    {
      id: 'wait-check',
      source: 'wait-training',
      target: 'training-check',
      type: 'custom',
      data: {
        label: 'Check Again'
      }
    },
    {
      id: 'check-final',
      source: 'training-check',
      target: 'final-setup',
      type: 'custom',
      data: {
        label: 'Complete',
        condition: 'trainingProgress === 100'
      }
    },
    {
      id: 'final-success',
      source: 'final-setup',
      target: 'success',
      type: 'custom',
      data: {
        label: 'Setup Complete'
      }
    }
  ]
};

// Additional example workflows
export const simpleApprovalExample: ExampleWorkflow = {
  name: "Simple Approval Workflow",
  description: "A basic approval workflow with a single decision point",
  category: "Approval",
  nodes: [
    {
      id: 'start',
      type: 'custom',
      position: { x: 100, y: 100 },
      data: {
        label: 'Submit Request',
        nodeType: 'start',
        description: 'Request submission starts the workflow'
      }
    },
    {
      id: 'approval',
      type: 'custom',
      position: { x: 300, y: 100 },
      data: {
        label: 'Manager Approval',
        nodeType: 'task',
        description: 'Manager reviews and approves the request',
        config: {
          assignee: 'manager',
          dueDate: '2 days'
        }
      }
    },
    {
      id: 'decision',
      type: 'custom',
      position: { x: 500, y: 100 },
      data: {
        label: 'Approved?',
        nodeType: 'condition',
        description: 'Check if request was approved',
        config: {
          condition: 'approvalStatus === "approved"'
        }
      }
    },
    {
      id: 'approved',
      type: 'custom',
      position: { x: 500, y: 250 },
      data: {
        label: 'Request Approved',
        nodeType: 'end',
        description: 'Request has been approved'
      }
    },
    {
      id: 'rejected',
      type: 'custom',
      position: { x: 700, y: 100 },
      data: {
        label: 'Request Rejected',
        nodeType: 'end',
        description: 'Request has been rejected'
      }
    }
  ],
  edges: [
    {
      id: 'start-approval',
      source: 'start',
      target: 'approval',
      type: 'custom'
    },
    {
      id: 'approval-decision',
      source: 'approval',
      target: 'decision',
      type: 'custom'
    },
    {
      id: 'decision-approved',
      source: 'decision',
      target: 'approved',
      type: 'custom',
      data: {
        condition: 'approvalStatus === "approved"'
      }
    },
    {
      id: 'decision-rejected',
      source: 'decision',
      target: 'rejected',
      type: 'custom',
      data: {
        condition: 'approvalStatus === "rejected"'
      }
    }
  ]
};

export const dataProcessingExample: ExampleWorkflow = {
  name: "Data Processing Pipeline",
  description: "A workflow that processes data through multiple stages",
  category: "Data Processing",
  nodes: [
    {
      id: 'start',
      type: 'custom',
      position: { x: 100, y: 100 },
      data: {
        label: 'Data Input',
        nodeType: 'start',
        description: 'Data processing begins'
      }
    },
    {
      id: 'validate',
      type: 'custom',
      position: { x: 300, y: 100 },
      data: {
        label: 'Validate Data',
        nodeType: 'service',
        description: 'Validate input data format and content',
        config: {
          serviceType: 'validation',
          rules: ['format', 'completeness', 'consistency']
        }
      }
    },
    {
      id: 'transform',
      type: 'custom',
      position: { x: 500, y: 100 },
      data: {
        label: 'Transform Data',
        nodeType: 'service',
        description: 'Transform data to required format',
        config: {
          serviceType: 'transformation',
          operations: ['normalize', 'aggregate', 'enrich']
        }
      }
    },
    {
      id: 'store',
      type: 'custom',
      position: { x: 700, y: 100 },
      data: {
        label: 'Store Data',
        nodeType: 'service',
        description: 'Store processed data in database',
        config: {
          serviceType: 'database',
          operation: 'insert',
          table: 'processed_data'
        }
      }
    },
    {
      id: 'notify',
      type: 'custom',
      position: { x: 900, y: 100 },
      data: {
        label: 'Send Notification',
        nodeType: 'notification',
        description: 'Notify stakeholders of completion',
        config: {
          type: 'email',
          recipients: ['data-team'],
          template: 'processing-complete'
        }
      }
    },
    {
      id: 'end',
      type: 'custom',
      position: { x: 1100, y: 100 },
      data: {
        label: 'Processing Complete',
        nodeType: 'end',
        description: 'Data processing workflow completed'
      }
    }
  ],
  edges: [
    {
      id: 'start-validate',
      source: 'start',
      target: 'validate',
      type: 'custom'
    },
    {
      id: 'validate-transform',
      source: 'validate',
      target: 'transform',
      type: 'custom'
    },
    {
      id: 'transform-store',
      source: 'transform',
      target: 'store',
      type: 'custom'
    },
    {
      id: 'store-notify',
      source: 'store',
      target: 'notify',
      type: 'custom'
    },
    {
      id: 'notify-end',
      source: 'notify',
      target: 'end',
      type: 'custom'
    }
  ]
};

export const allExamples = [
  employeeOnboardingExample,
  simpleApprovalExample,
  dataProcessingExample
];
