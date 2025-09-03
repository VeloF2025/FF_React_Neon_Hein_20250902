/**
 * TypeScript interfaces for Contractor Document Approval Workflow API
 * 
 * Provides comprehensive type definitions for all API request/response types
 * Used by both API endpoints and frontend clients
 */

// ============================================
// COMMON TYPES
// ============================================

export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent' | 'critical';
export type WorkflowStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'cancelled' | 'escalated';
export type StageStatus = 'not_started' | 'pending' | 'in_progress' | 'approved' | 'rejected';
export type ApprovalDecision = 'approve' | 'reject';
export type ApprovalAction = 'initiate' | 'approve' | 'reject' | 'escalate' | 'cancel' | 'reassign';

// ============================================
// REQUEST TYPES
// ============================================

/**
 * POST /api/contractors/documents/approval-workflow
 * Initialize approval workflow for a document
 */
export interface InitiateWorkflowRequest {
  /** UUID of the document to start workflow for */
  documentId: string;
  /** Type/category of the document */
  documentType: string;
  /** Priority level (optional, defaults to 'normal') */
  priorityLevel?: PriorityLevel;
  /** Custom SLA hours (optional, defaults to 24) */
  customSlaHours?: number;
  /** Stages to skip (optional) */
  skipStages?: number[];
  /** Specific approver assignments (optional) */
  assignSpecificApprovers?: Array<{
    stage: number;
    approverId: string;
  }>;
}

/**
 * PUT /api/contractors/documents/approval-workflow
 * Process approval decision
 */
export interface ProcessApprovalRequest {
  /** UUID of the workflow */
  workflowId: string;
  /** User ID of the approver making the decision */
  approverUserId: string;
  /** Approval decision */
  decision: ApprovalDecision;
  /** Optional comments */
  comments?: string;
  /** Required when rejecting */
  rejectionReason?: string;
  /** Reassign to different user (optional) */
  reassignTo?: string;
  /** Time spent on review in minutes (optional) */
  timeSpentMinutes?: number;
}

/**
 * GET /api/contractors/documents/approval-workflow
 * Get workflow status query parameters
 */
export interface GetWorkflowStatusQuery {
  /** UUID of the workflow (required) */
  workflowId: string;
  /** Include full approval history (optional, default false) */
  includeHistory?: boolean;
}

/**
 * DELETE /api/contractors/documents/approval-workflow
 * Cancel workflow (admin only)
 */
export interface CancelWorkflowRequest {
  /** UUID of the workflow */
  workflowId: string;
  /** Admin user ID */
  adminUserId: string;
  /** Reason for cancellation */
  cancelReason: string;
}

/**
 * GET /api/contractors/documents/approval-queue
 * Get approval queue query parameters
 */
export interface GetApprovalQueueQuery {
  /** Approver user ID (required for non-admin) */
  approverUserId?: string;
  /** Filter by priority level */
  priorityLevel?: PriorityLevel;
  /** Filter by document type */
  documentType?: string;
  /** Filter overdue items */
  overdue?: boolean;
  /** Limit results (default 50, max 200) */
  limit?: number;
  /** Pagination offset (default 0) */
  offset?: number;
  /** Sort field */
  sortBy?: 'priority' | 'due_date' | 'assigned_date';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Admin access flag */
  isAdmin?: boolean;
}

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, string | null>;
}

/**
 * Response for workflow initiation
 */
export interface InitiateWorkflowResponse {
  workflowId: string;
  currentStage: number;
  status: WorkflowStatus;
  nextApproverId: string | null;
  slaDueDate: string;
  message: string;
}

/**
 * Response for processing approval
 */
export interface ProcessApprovalResponse {
  workflowId: string;
  status: WorkflowStatus;
  currentStage: number;
  nextApproverId?: string | null;
  isComplete: boolean;
  message: string;
}

/**
 * Workflow stage information
 */
export interface WorkflowStage {
  stageNumber: number;
  stageName: string;
  status: StageStatus;
  completedAt: string | null;
  approverId: string | null;
  isCurrent: boolean;
}

/**
 * Document information in workflow
 */
export interface WorkflowDocument {
  id: string;
  name: string;
  type: string;
  contractorId: string;
}

/**
 * Approval history entry
 */
export interface ApprovalHistoryEntry {
  id: string;
  action: ApprovalAction;
  stageNumber: number;
  actorId: string;
  actorRole: string;
  decision: ApprovalDecision | null;
  comments: string | null;
  rejectionReason: string | null;
  previousStatus: WorkflowStatus | null;
  newStatus: WorkflowStatus;
  timeSpentMinutes: number | null;
  isWithinSla: boolean;
  metadata: any;
  createdAt: string;
}

/**
 * Complete workflow status response
 */
export interface WorkflowStatusResponse {
  workflowId: string;
  document: WorkflowDocument;
  status: WorkflowStatus;
  currentStage: number;
  currentApproverId: string | null;
  slaDueDate: string;
  isOverdue: boolean;
  escalationLevel: number;
  escalationReason: string | null;
  rejectionReason: string | null;
  stages: WorkflowStage[];
  createdAt: string;
  updatedAt: string;
  history?: ApprovalHistoryEntry[];
}

/**
 * Response for workflow cancellation
 */
export interface CancelWorkflowResponse {
  workflowId: string;
  status: 'cancelled';
  cancelledBy: string;
  cancelReason: string;
  message: string;
}

/**
 * Approval queue item
 */
export interface ApprovalQueueItem {
  id: string;
  workflowId: string;
  documentId: string;
  documentName: string;
  documentType: string;
  contractorId: string;
  contractorCompanyName: string;
  currentStage: number;
  stageName: string;
  priorityLevel: PriorityLevel;
  approverId: string;
  assignedAt: string;
  slaDueDate: string;
  isOverdue: boolean;
  escalationLevel: number;
  estimatedReviewTime: number | null;
  hoursRemaining: number;
  urgencyScore: number;
}

/**
 * Queue statistics
 */
export interface QueueStatistics {
  total: number;
  overdue: number;
  urgent: number;
  dueToday: number;
  byPriority: {
    critical: number;
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
  byStage: {
    1: number;
    2: number;
    3: number;
    4: number;
  };
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  page: number;
  totalPages: number;
}

/**
 * Applied filters information
 */
export interface AppliedFilters {
  approverUserId: string | null;
  priorityLevel: PriorityLevel | null;
  documentType: string | null;
  overdue: boolean | null;
  isAdmin: boolean;
}

/**
 * Sort information
 */
export interface SortInfo {
  sortBy: 'priority' | 'due_date' | 'assigned_date';
  sortOrder: 'asc' | 'desc';
}

/**
 * Complete approval queue response
 */
export interface ApprovalQueueResponse {
  items: ApprovalQueueItem[];
  pagination: PaginationInfo;
  statistics: QueueStatistics;
  filters: AppliedFilters;
  sort: SortInfo;
}

// ============================================
// ERROR TYPES
// ============================================

/**
 * Validation error details
 */
export interface ValidationErrorDetails {
  [field: string]: string | null;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: ValidationErrorDetails;
  allowedMethods?: string[];
}

// ============================================
// INTERNAL TYPES (for service integration)
// ============================================

/**
 * Workflow configuration for ApprovalWorkflowEngine
 */
export interface WorkflowEngineConfig {
  documentType: string;
  priorityLevel?: PriorityLevel;
  customSlaHours?: number;
  skipStages?: number[];
  assignSpecificApprovers?: Array<{
    stage: number;
    approverId: string;
  }>;
}

/**
 * Approval decision for ApprovalWorkflowEngine
 */
export interface WorkflowEngineDecision {
  decision: ApprovalDecision;
  comments?: string;
  rejectionReason?: string;
  reassignTo?: string;
  timeSpentMinutes?: number;
}

/**
 * Database workflow record structure
 */
export interface DatabaseWorkflow {
  id: string;
  document_id: string;
  workflow_stage: number;
  workflow_status: WorkflowStatus;
  current_approver_id: string | null;
  sla_due_date: string;
  is_overdue: boolean;
  escalation_level: number;
  escalation_reason: string | null;
  stage1_status: StageStatus | null;
  stage1_completed_at: string | null;
  stage1_approver_id: string | null;
  stage2_status: StageStatus | null;
  stage2_completed_at: string | null;
  stage2_approver_id: string | null;
  stage3_status: StageStatus | null;
  stage3_completed_at: string | null;
  stage3_approver_id: string | null;
  stage4_status: StageStatus | null;
  stage4_completed_at: string | null;
  stage4_approver_id: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database queue item structure
 */
export interface DatabaseQueueItem {
  id: string;
  workflow_id: string;
  approver_id: string;
  priority_level: PriorityLevel;
  status: 'pending' | 'completed' | 'cancelled';
  assigned_at: string;
  completed_at: string | null;
  estimated_review_time: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Database history entry structure
 */
export interface DatabaseHistoryEntry {
  id: string;
  workflow_id: string;
  action: ApprovalAction;
  stage_number: number;
  actor_id: string;
  actor_role: string;
  decision: ApprovalDecision | null;
  comments: string | null;
  rejection_reason: string | null;
  previous_status: WorkflowStatus | null;
  new_status: WorkflowStatus;
  time_spent_minutes: number | null;
  is_within_sla: boolean;
  metadata: any;
  created_at: string;
}