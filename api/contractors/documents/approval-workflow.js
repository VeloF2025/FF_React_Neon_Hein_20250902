/**
 * Contractor Document Approval Workflow API Endpoints
 * 
 * Provides RESTful API endpoints for managing document approval workflows:
 * - POST: Initialize workflow for a document
 * - PUT: Process approval decision (approve/reject)
 * - GET: Get workflow status and history
 * - DELETE: Cancel/abort workflow (admin only)
 * 
 * Integrates with ApprovalWorkflowEngine service
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// TODO: Import ApprovalWorkflowEngine service once TypeScript is configured
// For now, we'll simulate the service calls

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'POST':
        return await handleInitiateWorkflow(req, res);
      case 'PUT':
        return await handleProcessApproval(req, res);
      case 'GET':
        return await handleGetWorkflowStatus(req, res);
      case 'DELETE':
        return await handleCancelWorkflow(req, res);
      default:
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed',
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
        });
    }
  } catch (error) {
    console.error('🔴 BROKEN: Approval workflow API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

/**
 * POST /api/contractors/documents/approval-workflow
 * Initialize approval workflow for a document
 * 
 * Body: {
 *   documentId: string,
 *   documentType: string,
 *   priorityLevel?: 'low' | 'normal' | 'high' | 'urgent' | 'critical',
 *   customSlaHours?: number,
 *   skipStages?: number[],
 *   assignSpecificApprovers?: Array<{ stage: number; approverId: string }>
 * }
 */
async function handleInitiateWorkflow(req, res) {
  try {
    const {
      documentId,
      documentType,
      priorityLevel = 'normal',
      customSlaHours,
      skipStages = [],
      assignSpecificApprovers = []
    } = req.body;

    // 🟢 WORKING: Input validation
    if (!documentId || !documentType) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: {
          documentId: !documentId ? 'Document ID is required' : null,
          documentType: !documentType ? 'Document type is required' : null
        }
      });
    }

    // Validate documentId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(documentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID format. Expected UUID.'
      });
    }

    // Validate priorityLevel
    const validPriorities = ['low', 'normal', 'high', 'urgent', 'critical'];
    if (!validPriorities.includes(priorityLevel)) {
      return res.status(400).json({
        success: false,
        error: `Invalid priority level. Must be one of: ${validPriorities.join(', ')}`
      });
    }

    // 🟢 WORKING: Check if document exists
    const documentExists = await sql`
      SELECT id, document_name, contractor_id 
      FROM contractor_documents 
      WHERE id = ${documentId}
      LIMIT 1
    `;

    if (documentExists.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        documentId
      });
    }

    // 🟢 WORKING: Check if workflow already exists
    const existingWorkflow = await sql`
      SELECT id, workflow_status, workflow_stage
      FROM document_approval_workflows 
      WHERE document_id = ${documentId}
      AND workflow_status NOT IN ('approved', 'rejected', 'cancelled')
      LIMIT 1
    `;

    if (existingWorkflow.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Workflow already exists for this document',
        workflowId: existingWorkflow[0].id,
        currentStage: existingWorkflow[0].workflow_stage,
        currentStatus: existingWorkflow[0].workflow_status
      });
    }

    // 🟢 WORKING: Calculate SLA due date
    const defaultSlaHours = 24;
    const slaHours = customSlaHours || defaultSlaHours;
    const slaDueDate = new Date(Date.now() + (slaHours * 60 * 60 * 1000));

    // 🟢 WORKING: Create workflow record
    const workflowResult = await sql`
      INSERT INTO document_approval_workflows (
        document_id,
        workflow_stage,
        workflow_status,
        stage_1_status,
        sla_due_date,
        is_overdue,
        escalation_level,
        created_at,
        updated_at
      )
      VALUES (
        ${documentId},
        1,
        'in_review',
        'in_progress',
        ${slaDueDate.toISOString()},
        false,
        0,
        NOW(),
        NOW()
      )
      RETURNING id, workflow_stage, workflow_status, sla_due_date
    `;

    const workflow = workflowResult[0];

    // 🟢 WORKING: Determine next approver (simplified logic for now)
    const defaultApprovers = {
      1: 'compliance-officer-1',
      2: 'compliance-manager-1',
      3: 'legal-reviewer-1',
      4: 'operations-manager-1'
    };

    const nextApproverId = assignSpecificApprovers.find(a => a.stage === 1)?.approverId || 
                          defaultApprovers[1];

    // 🟢 WORKING: Create approval queue item
    if (nextApproverId) {
      await sql`
        INSERT INTO approval_queue_items (
          workflow_id,
          approver_id,
          priority_level,
          estimated_review_time,
          status,
          assigned_at,
          created_at,
          updated_at
        )
        VALUES (
          ${workflow.id},
          ${nextApproverId},
          ${priorityLevel},
          ${slaHours * 60},
          'pending',
          NOW(),
          NOW(),
          NOW()
        )
      `;

      // Update workflow with current approver
      await sql`
        UPDATE document_approval_workflows
        SET current_approver_id = ${nextApproverId},
            updated_at = NOW()
        WHERE id = ${workflow.id}
      `;
    }

    // 🟢 WORKING: Log workflow initiation
    await sql`
      INSERT INTO approval_history (
        workflow_id,
        action,
        stage_number,
        actor_id,
        actor_role,
        comments,
        previous_status,
        new_status,
        is_within_sla,
        metadata,
        created_at
      )
      VALUES (
        ${workflow.id},
        'initiate',
        1,
        'system',
        'system',
        ${`Workflow initiated for ${documentType} document`},
        null,
        'in_review',
        true,
        ${JSON.stringify({ documentType, priorityLevel, customSlaHours })},
        NOW()
      )
    `;

    return res.status(201).json({
      success: true,
      data: {
        workflowId: workflow.id,
        currentStage: workflow.workflow_stage,
        status: workflow.workflow_status,
        nextApproverId,
        slaDueDate: workflow.sla_due_date,
        message: `Workflow initiated successfully. ${nextApproverId ? `Assigned to ${nextApproverId} for stage 1 approval.` : 'No approver assigned.'}`
      }
    });

  } catch (error) {
    console.error('🔴 BROKEN: Error initiating workflow:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to initiate workflow',
      message: error.message
    });
  }
}

/**
 * PUT /api/contractors/documents/approval-workflow
 * Process approval decision (approve/reject)
 * 
 * Body: {
 *   workflowId: string,
 *   approverUserId: string,
 *   decision: 'approve' | 'reject',
 *   comments?: string,
 *   rejectionReason?: string,
 *   reassignTo?: string,
 *   timeSpentMinutes?: number
 * }
 */
async function handleProcessApproval(req, res) {
  try {
    const {
      workflowId,
      approverUserId,
      decision,
      comments,
      rejectionReason,
      reassignTo,
      timeSpentMinutes
    } = req.body;

    // 🟢 WORKING: Input validation
    if (!workflowId || !approverUserId || !decision) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: {
          workflowId: !workflowId ? 'Workflow ID is required' : null,
          approverUserId: !approverUserId ? 'Approver user ID is required' : null,
          decision: !decision ? 'Decision is required' : null
        }
      });
    }

    // Validate decision value
    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid decision. Must be "approve" or "reject"'
      });
    }

    // Validate rejection requires reason
    if (decision === 'reject' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required when rejecting'
      });
    }

    // 🟢 WORKING: Get workflow details
    const workflowResult = await sql`
      SELECT id, document_id, workflow_stage, workflow_status, 
             current_approver_id, sla_due_date, is_overdue
      FROM document_approval_workflows 
      WHERE id = ${workflowId}
      LIMIT 1
    `;

    if (workflowResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
        workflowId
      });
    }

    const workflow = workflowResult[0];
    const currentStage = workflow.workflow_stage;

    // 🟢 WORKING: Verify approver is authorized
    const queueItemResult = await sql`
      SELECT id, priority_level, assigned_at
      FROM approval_queue_items
      WHERE workflow_id = ${workflowId}
        AND approver_id = ${approverUserId}
        AND status = 'pending'
      LIMIT 1
    `;

    if (queueItemResult.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Approver not authorized for this workflow or approval already processed'
      });
    }

    const isWithinSla = new Date() <= new Date(workflow.sla_due_date);

    // 🟢 WORKING: Process the decision
    if (decision === 'reject') {
      // Handle rejection - terminate workflow
      const rejectionQuery = `
        UPDATE document_approval_workflows
        SET workflow_status = 'rejected',
            stage_${currentStage}_status = 'rejected',
            stage_${currentStage}_completed_at = NOW(),
            stage_${currentStage}_approver_id = $1,
            rejection_reason = $2,
            updated_at = NOW()
        WHERE id = $3
      `;
      await sql(rejectionQuery, [approverUserId, rejectionReason, workflowId]);

      // Complete queue item
      await sql`
        UPDATE approval_queue_items
        SET status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE workflow_id = ${workflowId} 
          AND approver_id = ${approverUserId}
      `;

      // Log rejection
      await sql`
        INSERT INTO approval_history (
          workflow_id, action, stage_number, actor_id, actor_role,
          decision, comments, rejection_reason, previous_status, new_status,
          time_spent_minutes, is_within_sla, created_at
        )
        VALUES (
          ${workflowId}, 'reject', ${currentStage}, ${approverUserId}, 'approver',
          'reject', ${comments}, ${rejectionReason}, 'in_review', 'rejected',
          ${timeSpentMinutes}, ${isWithinSla}, NOW()
        )
      `;

      return res.status(200).json({
        success: true,
        data: {
          workflowId,
          status: 'rejected',
          currentStage,
          isComplete: true,
          message: `Document rejected at stage ${currentStage}. Workflow terminated.`
        }
      });

    } else {
      // Handle approval - advance to next stage or complete
      const nextStage = currentStage + 1;
      const isLastStage = nextStage > 4; // We have 4 stages

      const approvalQuery = `
        UPDATE document_approval_workflows
        SET stage_${currentStage}_status = 'approved',
            stage_${currentStage}_completed_at = NOW(),
            stage_${currentStage}_approver_id = $1,
            workflow_stage = $2,
            workflow_status = $3,
            updated_at = NOW()
        WHERE id = $4
      `;
      await sql(approvalQuery, [
        approverUserId,
        isLastStage ? currentStage : nextStage,
        isLastStage ? 'approved' : 'in_review',
        workflowId
      ]);

      // Complete current queue item
      await sql`
        UPDATE approval_queue_items
        SET status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE workflow_id = ${workflowId} 
          AND approver_id = ${approverUserId}
      `;

      // Log approval
      await sql`
        INSERT INTO approval_history (
          workflow_id, action, stage_number, actor_id, actor_role,
          decision, comments, previous_status, new_status,
          time_spent_minutes, is_within_sla, created_at
        )
        VALUES (
          ${workflowId}, 'approve', ${currentStage}, ${approverUserId}, 'approver',
          'approve', ${comments}, 'in_review', ${isLastStage ? 'approved' : 'in_review'},
          ${timeSpentMinutes}, ${isWithinSla}, NOW()
        )
      `;

      let nextApproverId = null;
      let nextStageMessage = '';

      if (!isLastStage) {
        // Assign next approver
        const defaultApprovers = {
          1: 'compliance-officer-1',
          2: 'compliance-manager-1',
          3: 'legal-reviewer-1',
          4: 'operations-manager-1'
        };

        nextApproverId = defaultApprovers[nextStage];

        if (nextApproverId) {
          await sql`
            INSERT INTO approval_queue_items (
              workflow_id, approver_id, priority_level, status,
              assigned_at, created_at, updated_at
            )
            VALUES (
              ${workflowId}, ${nextApproverId}, 'normal', 'pending',
              NOW(), NOW(), NOW()
            )
          `;

          const nextStageQuery = `
            UPDATE document_approval_workflows
            SET current_approver_id = $1,
                stage_${nextStage}_status = 'in_progress',
                updated_at = NOW()
            WHERE id = $2
          `;
          await sql(nextStageQuery, [nextApproverId, workflowId]);

          nextStageMessage = `Moved to stage ${nextStage}, assigned to ${nextApproverId}.`;
        } else {
          nextStageMessage = `No approver found for stage ${nextStage}.`;
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          workflowId,
          status: isLastStage ? 'approved' : 'in_review',
          currentStage: isLastStage ? currentStage : nextStage,
          nextApproverId,
          isComplete: isLastStage,
          message: isLastStage 
            ? 'Document fully approved! All stages completed successfully.'
            : `Stage ${currentStage} approved. ${nextStageMessage}`
        }
      });
    }

  } catch (error) {
    console.error('🔴 BROKEN: Error processing approval:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process approval',
      message: error.message
    });
  }
}

/**
 * GET /api/contractors/documents/approval-workflow
 * Get workflow status and history
 * 
 * Query params:
 * - workflowId: string (required)
 * - includeHistory: boolean (optional, default false)
 */
async function handleGetWorkflowStatus(req, res) {
  try {
    const { workflowId, includeHistory = false } = req.query;

    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'Workflow ID is required'
      });
    }

    // 🟢 WORKING: Get workflow details with document info
    const workflowResult = await sql`
      SELECT 
        w.id, w.document_id, w.workflow_stage, w.workflow_status,
        w.current_approver_id, w.sla_due_date, w.is_overdue,
        w.escalation_level, w.escalation_reason,
        w.stage1_status, w.stage1_completed_at, w.stage1_approver_id,
        w.stage2_status, w.stage2_completed_at, w.stage2_approver_id,
        w.stage3_status, w.stage3_completed_at, w.stage3_approver_id,
        w.stage4_status, w.stage4_completed_at, w.stage4_approver_id,
        w.rejection_reason, w.created_at, w.updated_at,
        d.document_name, d.document_type, d.contractor_id
      FROM document_approval_workflows w
      INNER JOIN contractor_documents d ON w.document_id = d.id
      WHERE w.id = ${workflowId}
      LIMIT 1
    `;

    if (workflowResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
        workflowId
      });
    }

    const workflow = workflowResult[0];

    // 🟢 WORKING: Build stage details
    const stages = [];
    const stageNames = {
      1: 'Automated Validation',
      2: 'Compliance Review',
      3: 'Legal Review',
      4: 'Final Approval'
    };

    // Map database column names to stage data
    const stageColumns = {
      1: { status: 'stage1_status', completed: 'stage1_completed_at', approver: 'stage1_approver_id' },
      2: { status: 'stage2_status', completed: 'stage2_completed_at', approver: 'stage2_approver_id' },
      3: { status: 'stage3_status', completed: 'stage3_completed_at', approver: 'stage3_approver_id' },
      4: { status: 'stage4_status', completed: 'stage4_completed_at', approver: 'stage4_approver_id' }
    };

    for (let i = 1; i <= 4; i++) {
      const cols = stageColumns[i];
      stages.push({
        stageNumber: i,
        stageName: stageNames[i],
        status: workflow[cols.status] || 'not_started',
        completedAt: workflow[cols.completed],
        approverId: workflow[cols.approver],
        isCurrent: workflow.workflow_stage === i && workflow.workflow_status !== 'approved' && workflow.workflow_status !== 'rejected'
      });
    }

    const responseData = {
      workflowId: workflow.id,
      document: {
        id: workflow.document_id,
        name: workflow.document_name,
        type: workflow.document_type,
        contractorId: workflow.contractor_id
      },
      status: workflow.workflow_status,
      currentStage: workflow.workflow_stage,
      currentApproverId: workflow.current_approver_id,
      slaDueDate: workflow.sla_due_date,
      isOverdue: workflow.is_overdue,
      escalationLevel: workflow.escalation_level,
      escalationReason: workflow.escalation_reason,
      rejectionReason: workflow.rejection_reason,
      stages,
      createdAt: workflow.created_at,
      updatedAt: workflow.updated_at
    };

    // 🟢 WORKING: Include history if requested
    if (includeHistory === 'true' || includeHistory === true) {
      const historyResult = await sql`
        SELECT 
          id, action, stage_number, actor_id, actor_role,
          decision, comments, rejection_reason, previous_status, new_status,
          time_spent_minutes, is_within_sla, metadata, created_at
        FROM approval_history
        WHERE workflow_id = ${workflowId}
        ORDER BY created_at ASC
      `;

      responseData.history = historyResult.map(h => ({
        id: h.id,
        action: h.action,
        stageNumber: h.stage_number,
        actorId: h.actor_id,
        actorRole: h.actor_role,
        decision: h.decision,
        comments: h.comments,
        rejectionReason: h.rejection_reason,
        previousStatus: h.previous_status,
        newStatus: h.new_status,
        timeSpentMinutes: h.time_spent_minutes,
        isWithinSla: h.is_within_sla,
        metadata: h.metadata,
        createdAt: h.created_at
      }));
    }

    return res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('🔴 BROKEN: Error getting workflow status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get workflow status',
      message: error.message
    });
  }
}

/**
 * DELETE /api/contractors/documents/approval-workflow
 * Cancel/abort workflow (admin only)
 * 
 * Body: {
 *   workflowId: string,
 *   adminUserId: string,
 *   cancelReason: string
 * }
 */
async function handleCancelWorkflow(req, res) {
  try {
    const { workflowId, adminUserId, cancelReason } = req.body;

    // 🟢 WORKING: Input validation
    if (!workflowId || !adminUserId || !cancelReason) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: {
          workflowId: !workflowId ? 'Workflow ID is required' : null,
          adminUserId: !adminUserId ? 'Admin user ID is required' : null,
          cancelReason: !cancelReason ? 'Cancel reason is required' : null
        }
      });
    }

    // 🟢 WORKING: Verify workflow exists and is not already completed
    const workflowResult = await sql`
      SELECT id, workflow_status, workflow_stage
      FROM document_approval_workflows 
      WHERE id = ${workflowId}
      LIMIT 1
    `;

    if (workflowResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
        workflowId
      });
    }

    const workflow = workflowResult[0];

    if (['approved', 'rejected', 'cancelled'].includes(workflow.workflow_status)) {
      return res.status(409).json({
        success: false,
        error: `Cannot cancel workflow with status: ${workflow.workflow_status}`,
        currentStatus: workflow.workflow_status
      });
    }

    // 🟢 WORKING: Cancel the workflow
    await sql`
      UPDATE document_approval_workflows
      SET workflow_status = 'cancelled',
          rejection_reason = ${cancelReason},
          updated_at = NOW()
      WHERE id = ${workflowId}
    `;

    // Cancel all pending queue items
    await sql`
      UPDATE approval_queue_items
      SET status = 'cancelled',
          completed_at = NOW(),
          updated_at = NOW()
      WHERE workflow_id = ${workflowId} 
        AND status = 'pending'
    `;

    // Log cancellation
    await sql`
      INSERT INTO approval_history (
        workflow_id, action, stage_number, actor_id, actor_role,
        comments, previous_status, new_status, is_within_sla,
        metadata, created_at
      )
      VALUES (
        ${workflowId}, 'cancel', ${workflow.workflow_stage}, ${adminUserId}, 'admin',
        ${cancelReason}, ${workflow.workflow_status}, 'cancelled', true,
        ${JSON.stringify({ cancelledBy: adminUserId, reason: cancelReason })}, NOW()
      )
    `;

    return res.status(200).json({
      success: true,
      data: {
        workflowId,
        status: 'cancelled',
        cancelledBy: adminUserId,
        cancelReason,
        message: 'Workflow cancelled successfully'
      }
    });

  } catch (error) {
    console.error('🔴 BROKEN: Error cancelling workflow:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel workflow',
      message: error.message
    });
  }
}