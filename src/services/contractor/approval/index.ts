/**
 * Contractor Approval Services - Module Index
 * Exports approval workflow management services
 */

// Export the main approval workflow service and types
export { 
  ApprovalWorkflowEngine,
  approvalWorkflowService 
} from './approvalWorkflowService';

// Export types for external usage
export type {
  WorkflowConfig,
  ApprovalDecision,
  WorkflowInitiationResult,
  ApprovalQueueItem,
  EscalationResult
} from './approvalWorkflowService';

// Re-export workflow schema types for convenience
export type {
  DocumentApprovalWorkflow,
  NewDocumentApprovalWorkflow,
  ApprovalQueueItem as DbApprovalQueueItem,
  NewApprovalQueueItem,
  ApprovalHistory,
  NewApprovalHistory,
  WorkflowStageDefinition,
  AutoApprovalRule,
  EscalationRule,
  WorkflowMetrics
} from '@/lib/neon/schema/workflow.schema';

// Export workflow constants
export {
  WorkflowStatus,
  StageStatus, 
  PriorityLevel,
  ApprovalAction
} from '@/lib/neon/schema/workflow.schema';