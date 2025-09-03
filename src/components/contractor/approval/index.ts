/**
 * Approval Queue Components Export Index
 * 
 * Exports all approval queue UI components for easy importing
 * following VelocityFibre theme and accessibility standards
 */

export { ApprovalQueueComponent } from './ApprovalQueueComponent';
export { ApprovalItemCard } from './ApprovalItemCard';
export { BatchApprovalControls } from './BatchApprovalControls';
export { SLAStatusIndicator } from './SLAStatusIndicator';
export { DocumentPreviewModal } from './DocumentPreviewModal';

export type {
  ApprovalItem,
  ApprovalQueueStats,
  ApprovalQueueData
} from './ApprovalQueueComponent';

// Default exports for convenience
export { ApprovalQueueComponent as default } from './ApprovalQueueComponent';