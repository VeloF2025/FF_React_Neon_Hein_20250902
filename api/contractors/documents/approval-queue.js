/**
 * Contractor Document Approval Queue API Endpoint
 * 
 * Provides GET endpoint for retrieving approval queue items:
 * - GET: Get approval queue for specific approver or all items (admin)
 * 
 * Integrates with ApprovalWorkflowEngine service for queue management
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetApprovalQueue(req, res);
      default:
        return res.status(405).json({ 
          success: false, 
          error: 'Method not allowed',
          allowedMethods: ['GET']
        });
    }
  } catch (error) {
    console.error('🔴 BROKEN: Approval queue API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

/**
 * GET /api/contractors/documents/approval-queue
 * Get approval queue for specific approver or all items (admin)
 * 
 * Query params:
 * - approverUserId?: string - Get queue for specific approver (required for non-admin)
 * - priorityLevel?: 'low' | 'normal' | 'high' | 'urgent' | 'critical' - Filter by priority
 * - documentType?: string - Filter by document type
 * - overdue?: 'true' | 'false' - Filter overdue items
 * - limit?: number - Limit results (default 50, max 200)
 * - offset?: number - Pagination offset (default 0)
 * - sortBy?: 'priority' | 'due_date' | 'assigned_date' - Sort order
 * - sortOrder?: 'asc' | 'desc' - Sort direction (default 'asc')
 * - isAdmin?: 'true' | 'false' - Admin access flag
 */
async function handleGetApprovalQueue(req, res) {
  try {
    const {
      approverUserId,
      priorityLevel,
      documentType,
      overdue,
      limit = 50,
      offset = 0,
      sortBy = 'due_date',
      sortOrder = 'asc',
      isAdmin = 'false'
    } = req.query;

    // 🟢 WORKING: Input validation
    const numLimit = Math.min(parseInt(limit) || 50, 200); // Max 200 items
    const numOffset = Math.max(parseInt(offset) || 0, 0);

    if (isAdmin !== 'true' && !approverUserId) {
      return res.status(400).json({
        success: false,
        error: 'Approver user ID is required for non-admin access'
      });
    }

    // Validate sort parameters
    const validSortBy = ['priority', 'due_date', 'assigned_date'];
    const validSortOrder = ['asc', 'desc'];
    
    if (!validSortBy.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sortBy parameter. Must be one of: ${validSortBy.join(', ')}`
      });
    }

    if (!validSortOrder.includes(sortOrder)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sortOrder parameter. Must be one of: ${validSortOrder.join(', ')}`
      });
    }

    // Validate priority level if provided
    if (priorityLevel) {
      const validPriorities = ['low', 'normal', 'high', 'urgent', 'critical'];
      if (!validPriorities.includes(priorityLevel)) {
        return res.status(400).json({
          success: false,
          error: `Invalid priority level. Must be one of: ${validPriorities.join(', ')}`
        });
      }
    }

    // 🟢 WORKING: Build base query
    let whereConditions = ['q.status = $1'];
    let queryParams = ['pending'];
    let paramIndex = 2;

    // Filter by approver (if not admin or if admin specified approver)
    if (isAdmin !== 'true' || approverUserId) {
      whereConditions.push(`q.approver_id = $${paramIndex}`);
      queryParams.push(approverUserId);
      paramIndex++;
    }

    // Filter by priority level
    if (priorityLevel) {
      whereConditions.push(`q.priority_level = $${paramIndex}`);
      queryParams.push(priorityLevel);
      paramIndex++;
    }

    // Filter by document type
    if (documentType) {
      whereConditions.push(`d.document_type = $${paramIndex}`);
      queryParams.push(documentType);
      paramIndex++;
    }

    // Filter by overdue status
    if (overdue === 'true') {
      whereConditions.push('w.sla_due_date < NOW()');
    } else if (overdue === 'false') {
      whereConditions.push('w.sla_due_date >= NOW()');
    }

    // 🟢 WORKING: Build sort order
    let orderClause = '';
    switch (sortBy) {
      case 'priority':
        // Custom priority order: critical, urgent, high, normal, low
        orderClause = `ORDER BY 
          CASE q.priority_level 
            WHEN 'critical' THEN 1 
            WHEN 'urgent' THEN 2 
            WHEN 'high' THEN 3 
            WHEN 'normal' THEN 4 
            WHEN 'low' THEN 5 
          END ${sortOrder.toUpperCase()}`;
        break;
      case 'due_date':
        orderClause = `ORDER BY w.sla_due_date ${sortOrder.toUpperCase()}`;
        break;
      case 'assigned_date':
        orderClause = `ORDER BY q.assigned_at ${sortOrder.toUpperCase()}`;
        break;
    }

    // Add secondary sort by due date if not primary sort
    if (sortBy !== 'due_date') {
      orderClause += `, w.sla_due_date ASC`;
    }

    // 🟢 WORKING: Execute main query
    const queueQuery = `
      SELECT 
        q.id,
        q.workflow_id,
        q.approver_id,
        q.priority_level,
        q.assigned_at,
        q.estimated_review_time,
        w.document_id,
        w.workflow_stage as current_stage,
        w.sla_due_date,
        w.is_overdue,
        w.escalation_level,
        d.document_name,
        d.document_type,
        d.contractor_id,
        -- Calculate if overdue in real-time
        CASE WHEN w.sla_due_date < NOW() THEN true ELSE false END as is_currently_overdue,
        -- Calculate time remaining
        EXTRACT(epoch FROM (w.sla_due_date - NOW())) / 3600 as hours_remaining
      FROM approval_queue_items q
      INNER JOIN document_approval_workflows w ON q.workflow_id = w.id
      INNER JOIN contractor_documents d ON w.document_id = d.id
      WHERE ${whereConditions.join(' AND ')}
      ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(numLimit, numOffset);

    const queueItems = await sql(queueQuery, queryParams);

    // 🟢 WORKING: Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM approval_queue_items q
      INNER JOIN document_approval_workflows w ON q.workflow_id = w.id
      INNER JOIN contractor_documents d ON w.document_id = d.id
      WHERE ${whereConditions.join(' AND ')}
    `;

    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    const countResult = await sql(countQuery, countParams);
    const totalCount = parseInt(countResult[0]?.total || 0);

    // 🟢 WORKING: Get stage names mapping
    const getStageNames = (stageNumber) => {
      const stageNames = {
        1: 'Automated Validation',
        2: 'Compliance Review',
        3: 'Legal Review',
        4: 'Final Approval'
      };
      return stageNames[stageNumber] || `Stage ${stageNumber}`;
    };

    // 🟢 WORKING: Format response data
    const formattedQueueItems = queueItems.map(item => ({
      id: item.id,
      workflowId: item.workflow_id,
      documentId: item.document_id,
      documentName: item.document_name || 'Untitled Document',
      documentType: item.document_type || 'unknown',
      contractorId: item.contractor_id,
      // TODO: Add contractor company name lookup
      contractorCompanyName: item.contractor_id || 'Unknown Contractor',
      currentStage: item.current_stage,
      stageName: getStageNames(item.current_stage),
      priorityLevel: item.priority_level || 'normal',
      approverId: item.approver_id,
      assignedAt: item.assigned_at,
      slaDueDate: item.sla_due_date,
      isOverdue: item.is_currently_overdue,
      escalationLevel: item.escalation_level || 0,
      estimatedReviewTime: item.estimated_review_time,
      hoursRemaining: Math.max(item.hours_remaining || 0, 0),
      // Calculate urgency score for frontend sorting/highlighting
      urgencyScore: item.is_currently_overdue ? 100 : 
                   (item.hours_remaining < 2 ? 90 : 
                   (item.hours_remaining < 8 ? 70 : 
                   (item.hours_remaining < 24 ? 50 : 10)))
    }));

    // 🟢 WORKING: Add summary statistics
    const stats = {
      total: totalCount,
      overdue: formattedQueueItems.filter(item => item.isOverdue).length,
      urgent: formattedQueueItems.filter(item => item.priorityLevel === 'urgent' || item.priorityLevel === 'critical').length,
      dueToday: formattedQueueItems.filter(item => {
        const dueDate = new Date(item.slaDueDate);
        const today = new Date();
        return dueDate.toDateString() === today.toDateString();
      }).length,
      byPriority: {
        critical: formattedQueueItems.filter(item => item.priorityLevel === 'critical').length,
        urgent: formattedQueueItems.filter(item => item.priorityLevel === 'urgent').length,
        high: formattedQueueItems.filter(item => item.priorityLevel === 'high').length,
        normal: formattedQueueItems.filter(item => item.priorityLevel === 'normal').length,
        low: formattedQueueItems.filter(item => item.priorityLevel === 'low').length,
      },
      byStage: {
        1: formattedQueueItems.filter(item => item.currentStage === 1).length,
        2: formattedQueueItems.filter(item => item.currentStage === 2).length,
        3: formattedQueueItems.filter(item => item.currentStage === 3).length,
        4: formattedQueueItems.filter(item => item.currentStage === 4).length,
      }
    };

    const response = {
      success: true,
      data: {
        items: formattedQueueItems,
        pagination: {
          total: totalCount,
          limit: numLimit,
          offset: numOffset,
          hasMore: numOffset + numLimit < totalCount,
          page: Math.floor(numOffset / numLimit) + 1,
          totalPages: Math.ceil(totalCount / numLimit)
        },
        statistics: stats,
        filters: {
          approverUserId: isAdmin === 'true' ? null : approverUserId,
          priorityLevel,
          documentType,
          overdue,
          isAdmin: isAdmin === 'true'
        },
        sort: {
          sortBy,
          sortOrder
        }
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('🔴 BROKEN: Error getting approval queue:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get approval queue',
      message: error.message
    });
  }
}