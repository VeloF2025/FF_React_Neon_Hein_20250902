/**
 * Neon Database Schema - Document Approval Workflow Domain
 * Document Approval Workflows and Queue Management
 */

import { pgTable, text, varchar, integer, timestamp, boolean, json, uuid, index } from 'drizzle-orm/pg-core';
import { contractorDocuments } from './contractor.schema';

// ============================================
// DOCUMENT APPROVAL WORKFLOW TABLES
// ============================================

// Document Approval Workflows (4-stage approval process)
export const documentApprovalWorkflows = pgTable('document_approval_workflows', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').notNull().references(() => contractorDocuments.id, { onDelete: 'cascade' }),
  workflowStage: integer('workflow_stage').notNull().default(1),
  currentApproverId: varchar('current_approver_id', { length: 255 }),
  workflowStatus: varchar('workflow_status', { length: 20 }).notNull().default('pending'), // pending, in_review, approved, rejected
  
  // Stage 1: Automated Validation
  stage1Status: varchar('stage_1_status', { length: 20 }).default('pending'), // automated_validation
  stage1CompletedAt: timestamp('stage_1_completed_at'),
  
  // Stage 2: Compliance Review
  stage2Status: varchar('stage_2_status', { length: 20 }).default('pending'), // compliance_review
  stage2ApproverId: varchar('stage_2_approver_id', { length: 255 }),
  stage2CompletedAt: timestamp('stage_2_completed_at'),
  
  // Stage 3: Legal Review
  stage3Status: varchar('stage_3_status', { length: 20 }).default('pending'), // legal_review
  stage3ApproverId: varchar('stage_3_approver_id', { length: 255 }),
  stage3CompletedAt: timestamp('stage_3_completed_at'),
  
  // Stage 4: Final Approval
  stage4Status: varchar('stage_4_status', { length: 20 }).default('pending'), // final_approval
  stage4ApproverId: varchar('stage_4_approver_id', { length: 255 }),
  stage4CompletedAt: timestamp('stage_4_completed_at'),
  
  // SLA Tracking
  slaDueDate: timestamp('sla_due_date').notNull(),
  isOverdue: boolean('is_overdue').default(false),
  escalationLevel: integer('escalation_level').default(0),
  escalationReason: text('escalation_reason'),
  
  // Comments & Notes
  approvalNotes: json('approval_notes'), // Array of approval comments
  rejectionReason: text('rejection_reason'),
  resubmissionCount: integer('resubmission_count').default(0),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    workflowStatusIdx: index('idx_approval_workflows_status').on(table.workflowStatus, table.slaDueDate),
    documentWorkflowIdx: index('approval_workflow_document_idx').on(table.documentId),
    currentApproverIdx: index('approval_workflow_approver_idx').on(table.currentApproverId),
    stageStatusIdx: index('approval_workflow_stage_idx').on(table.workflowStage, table.workflowStatus),
  }
});

// Approval Queue Management
export const approvalQueueItems = pgTable('approval_queue_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  workflowId: uuid('workflow_id').notNull().references(() => documentApprovalWorkflows.id, { onDelete: 'cascade' }),
  approverId: varchar('approver_id', { length: 255 }).notNull(),
  queuePosition: integer('queue_position'),
  assignedAt: timestamp('assigned_at').defaultNow(),
  priorityLevel: varchar('priority_level', { length: 20 }).default('normal'), // low, normal, high, urgent
  estimatedReviewTime: integer('estimated_review_time'), // minutes
  
  // Status tracking
  status: varchar('status', { length: 20 }).default('pending'), // pending, in_progress, completed, skipped
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  
  // Notes
  approverNotes: text('approver_notes'),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    approverQueueIdx: index('idx_approval_queue_approver').on(table.approverId, table.priorityLevel),
    workflowQueueIdx: index('approval_queue_workflow_idx').on(table.workflowId),
    statusQueueIdx: index('approval_queue_status_idx').on(table.status, table.assignedAt),
    priorityQueueIdx: index('approval_queue_priority_idx').on(table.priorityLevel, table.queuePosition),
  }
});

// Workflow Stage Configuration (for different document types)
export const workflowStageConfigurations = pgTable('workflow_stage_configurations', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentType: varchar('document_type', { length: 50 }).notNull(), // matches contractor_documents.document_type
  
  // Stage Configuration
  stageName: varchar('stage_name', { length: 100 }).notNull(),
  stageNumber: integer('stage_number').notNull(),
  isRequired: boolean('is_required').default(true),
  
  // Approver Configuration
  requiredApproverRole: varchar('required_approver_role', { length: 50 }),
  allowedApproverRoles: json('allowed_approver_roles'), // Array of roles
  
  // Timing Configuration
  standardSlaHours: integer('standard_sla_hours').default(24),
  escalationThresholdHours: integer('escalation_threshold_hours').default(48),
  
  // Auto-approval Rules
  autoApprovalEnabled: boolean('auto_approval_enabled').default(false),
  autoApprovalRules: json('auto_approval_rules'), // Conditions for auto-approval
  
  // Workflow Rules
  canSkip: boolean('can_skip').default(false),
  requiresComment: boolean('requires_comment').default(true),
  parallelApproval: boolean('parallel_approval').default(false),
  
  // Status
  isActive: boolean('is_active').default(true),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    documentTypeStageIdx: index('workflow_config_doc_type_idx').on(table.documentType, table.stageNumber),
    approverRoleIdx: index('workflow_config_approver_idx').on(table.requiredApproverRole),
    activeConfigIdx: index('workflow_config_active_idx').on(table.isActive, table.documentType),
  }
});

// Approval History (audit trail)
export const approvalHistory = pgTable('approval_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  workflowId: uuid('workflow_id').notNull().references(() => documentApprovalWorkflows.id, { onDelete: 'cascade' }),
  
  // Action Details
  action: varchar('action', { length: 50 }).notNull(), // approve, reject, escalate, reassign, comment
  stageNumber: integer('stage_number').notNull(),
  
  // Actor Information
  actorId: varchar('actor_id', { length: 255 }).notNull(),
  actorRole: varchar('actor_role', { length: 50 }),
  
  // Decision Details
  decision: varchar('decision', { length: 20 }), // approve, reject, escalate
  comments: text('comments'),
  rejectionReason: text('rejection_reason'),
  
  // Context
  previousStatus: varchar('previous_status', { length: 20 }),
  newStatus: varchar('new_status', { length: 20 }),
  
  // Timing
  timeSpentMinutes: integer('time_spent_minutes'),
  isWithinSla: boolean('is_within_sla'),
  
  // Metadata
  metadata: json('metadata'), // Additional context data
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  // Audit
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    workflowHistoryIdx: index('approval_history_workflow_idx').on(table.workflowId, table.createdAt),
    actorHistoryIdx: index('approval_history_actor_idx').on(table.actorId, table.createdAt),
    actionHistoryIdx: index('approval_history_action_idx').on(table.action, table.stageNumber),
    decisionHistoryIdx: index('approval_history_decision_idx').on(table.decision, table.createdAt),
  }
});

// Workflow Templates (predefined workflows for different scenarios)
export const workflowTemplates = pgTable('workflow_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Template Details
  templateName: varchar('template_name', { length: 100 }).notNull(),
  templateDescription: text('template_description'),
  documentType: varchar('document_type', { length: 50 }).notNull(),
  
  // Workflow Configuration
  stageCount: integer('stage_count').notNull(),
  totalSlaHours: integer('total_sla_hours').default(72),
  
  // Stage Definitions
  stageDefinitions: json('stage_definitions'), // Array of stage configurations
  
  // Business Rules
  escalationRules: json('escalation_rules'), // Array of escalation configurations
  autoApprovalRules: json('auto_approval_rules'), // Global auto-approval rules
  notificationRules: json('notification_rules'), // Notification configurations
  
  // Template Settings
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(1), // Higher number = higher priority
  
  // Usage Statistics
  usageCount: integer('usage_count').default(0),
  lastUsedAt: timestamp('last_used_at'),
  averageCompletionHours: integer('average_completion_hours'),
  successRate: integer('success_rate'), // Percentage
  
  // Audit
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  updatedBy: varchar('updated_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    templateDocTypeIdx: index('workflow_template_doc_type_idx').on(table.documentType, table.isActive),
    templateDefaultIdx: index('workflow_template_default_idx').on(table.isDefault, table.documentType),
    templatePriorityIdx: index('workflow_template_priority_idx').on(table.priority, table.isActive),
    templateUsageIdx: index('workflow_template_usage_idx').on(table.usageCount, table.lastUsedAt),
  }
});

// ============================================
// TYPE EXPORTS
// ============================================

// Document Approval Workflow Types
export type DocumentApprovalWorkflow = typeof documentApprovalWorkflows.$inferSelect;
export type NewDocumentApprovalWorkflow = typeof documentApprovalWorkflows.$inferInsert;

// Approval Queue Types
export type ApprovalQueueItem = typeof approvalQueueItems.$inferSelect;
export type NewApprovalQueueItem = typeof approvalQueueItems.$inferInsert;

// Workflow Stage Configuration Types
export type WorkflowStageConfiguration = typeof workflowStageConfigurations.$inferSelect;
export type NewWorkflowStageConfiguration = typeof workflowStageConfigurations.$inferInsert;

// Approval History Types
export type ApprovalHistory = typeof approvalHistory.$inferSelect;
export type NewApprovalHistory = typeof approvalHistory.$inferInsert;

// Workflow Template Types
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type NewWorkflowTemplate = typeof workflowTemplates.$inferInsert;

// ============================================
// WORKFLOW STATUS ENUMS
// ============================================

export const WorkflowStatus = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ESCALATED: 'escalated',
  CANCELLED: 'cancelled'
} as const;

export const StageStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SKIPPED: 'skipped',
  AUTO_APPROVED: 'auto_approved'
} as const;

export const PriorityLevel = {
  LOW: 'low',
  NORMAL: 'normal', 
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
} as const;

export const ApprovalAction = {
  APPROVE: 'approve',
  REJECT: 'reject',
  ESCALATE: 'escalate',
  REASSIGN: 'reassign',
  COMMENT: 'comment',
  SKIP: 'skip'
} as const;

// ============================================
// WORKFLOW BUSINESS LOGIC TYPES
// ============================================

export interface WorkflowStageDefinition {
  stageNumber: number;
  stageName: string;
  requiredApproverRole: string;
  allowedApproverRoles: string[];
  slaHours: number;
  isRequired: boolean;
  autoApprovalRules?: AutoApprovalRule[];
  parallelApproval: boolean;
}

export interface AutoApprovalRule {
  condition: string;
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
}

export interface EscalationRule {
  triggerAfterHours: number;
  escalateToRole: string;
  escalateToUserId?: string;
  notificationTemplate: string;
  maxEscalationLevel: number;
}

export interface ApprovalDecision {
  decision: 'approve' | 'reject';
  comments?: string;
  rejectionReason?: string;
  reassignTo?: string;
  skipToStage?: number;
}

export interface WorkflowMetrics {
  totalWorkflows: number;
  pendingWorkflows: number;
  overdueWorkflows: number;
  averageCompletionTime: number;
  approvalRate: number;
  slaComplianceRate: number;
}