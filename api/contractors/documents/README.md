# Contractor Document Approval Workflow API

This directory contains the API endpoints for managing contractor document approval workflows. The system implements a 4-stage approval process with SLA tracking, escalation, and comprehensive audit trails.

## 🏗️ Architecture Overview

The approval workflow follows these stages:
1. **Automated Validation** - Initial document validation
2. **Compliance Review** - Compliance officer review
3. **Legal Review** - Legal team assessment
4. **Final Approval** - Operations manager final approval

## 📁 File Structure

```
api/contractors/documents/
├── approval-workflow.js    # Main workflow management (POST, PUT, GET, DELETE)
├── approval-queue.js       # Queue management (GET)
├── types.ts               # TypeScript interface definitions
├── test-endpoints.js      # API testing suite
└── README.md             # This documentation
```

## 🔌 API Endpoints

### 1. Workflow Management

#### POST /api/contractors/documents/approval-workflow
**Initialize a new approval workflow for a document**

```json
{
  "documentId": "uuid",
  "documentType": "string",
  "priorityLevel": "low|normal|high|urgent|critical",
  "customSlaHours": 24,
  "skipStages": [2],
  "assignSpecificApprovers": [
    { "stage": 1, "approverId": "user-123" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workflowId": "uuid",
    "currentStage": 1,
    "status": "in_review",
    "nextApproverId": "compliance-officer-1",
    "slaDueDate": "2025-01-15T10:30:00Z",
    "message": "Workflow initiated successfully..."
  }
}
```

#### PUT /api/contractors/documents/approval-workflow
**Process an approval decision (approve/reject)**

```json
{
  "workflowId": "uuid",
  "approverUserId": "string",
  "decision": "approve|reject",
  "comments": "Optional comments",
  "rejectionReason": "Required when rejecting",
  "timeSpentMinutes": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workflowId": "uuid",
    "status": "in_review",
    "currentStage": 2,
    "nextApproverId": "legal-reviewer-1",
    "isComplete": false,
    "message": "Stage 1 approved. Moved to stage 2..."
  }
}
```

#### GET /api/contractors/documents/approval-workflow
**Get workflow status and history**

**Query Parameters:**
- `workflowId`: string (required)
- `includeHistory`: boolean (optional, default false)

**Response:**
```json
{
  "success": true,
  "data": {
    "workflowId": "uuid",
    "document": {
      "id": "uuid",
      "name": "Insurance Certificate",
      "type": "insurance_certificate",
      "contractorId": "uuid"
    },
    "status": "in_review",
    "currentStage": 2,
    "currentApproverId": "legal-reviewer-1",
    "slaDueDate": "2025-01-15T10:30:00Z",
    "isOverdue": false,
    "stages": [
      {
        "stageNumber": 1,
        "stageName": "Automated Validation",
        "status": "approved",
        "completedAt": "2025-01-14T09:15:00Z",
        "approverId": "compliance-officer-1",
        "isCurrent": false
      }
    ],
    "history": [] // If includeHistory=true
  }
}
```

#### DELETE /api/contractors/documents/approval-workflow
**Cancel/abort a workflow (admin only)**

```json
{
  "workflowId": "uuid",
  "adminUserId": "string",
  "cancelReason": "string"
}
```

### 2. Approval Queue Management

#### GET /api/contractors/documents/approval-queue
**Get approval queue for approvers**

**Query Parameters:**
- `approverUserId`: string (required for non-admin)
- `priorityLevel`: string (optional filter)
- `documentType`: string (optional filter)
- `overdue`: boolean (optional filter)
- `limit`: number (default 50, max 200)
- `offset`: number (default 0)
- `sortBy`: "priority|due_date|assigned_date"
- `sortOrder`: "asc|desc"
- `isAdmin`: boolean (admin access flag)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "workflowId": "uuid",
        "documentId": "uuid",
        "documentName": "Insurance Certificate",
        "documentType": "insurance_certificate",
        "contractorCompanyName": "ABC Construction",
        "currentStage": 2,
        "stageName": "Compliance Review",
        "priorityLevel": "high",
        "slaDueDate": "2025-01-15T10:30:00Z",
        "isOverdue": false,
        "hoursRemaining": 18.5,
        "urgencyScore": 70
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 50,
      "offset": 0,
      "hasMore": false,
      "page": 1,
      "totalPages": 1
    },
    "statistics": {
      "total": 25,
      "overdue": 3,
      "urgent": 8,
      "dueToday": 5,
      "byPriority": { "critical": 2, "urgent": 8, "high": 10, "normal": 5, "low": 0 },
      "byStage": { "1": 8, "2": 12, "3": 4, "4": 1 }
    }
  }
}
```

## 🧪 Testing

### Running the Test Suite

The project includes a comprehensive test suite to validate all endpoints:

```bash
# Ensure your development server is running on localhost:3000
npm run dev

# Run the test suite
node api/contractors/documents/test-endpoints.js
```

### Test Categories

1. **Functionality Tests**
   - Workflow initiation
   - Approval processing
   - Status retrieval
   - Workflow cancellation
   - Queue management

2. **Validation Tests**
   - Required field validation
   - UUID format validation
   - Priority level validation
   - Authorization checks

3. **Error Handling Tests**
   - Invalid HTTP methods
   - Missing parameters
   - Invalid data formats
   - Permission checks

## 🔒 Authentication & Authorization

### Access Control
- **Workflow Initiation**: System or authorized users
- **Approval Processing**: Assigned approvers only
- **Status Viewing**: Workflow participants and administrators
- **Workflow Cancellation**: Administrators only
- **Queue Access**: Assigned approvers (filtered) or administrators (full access)

### Security Features
- Input validation and sanitization
- SQL injection prevention
- Authorization checks at every stage
- Audit trail for all actions
- SLA tracking and escalation

## 📊 Database Schema

### Core Tables
- `document_approval_workflows`: Main workflow state
- `approval_queue_items`: Pending approval assignments  
- `approval_history`: Complete audit trail
- `workflow_stage_configurations`: Stage definitions by document type
- `contractor_documents`: Source documents

### Key Relationships
```sql
contractor_documents (1) -> (*) document_approval_workflows
document_approval_workflows (1) -> (*) approval_queue_items
document_approval_workflows (1) -> (*) approval_history
```

## 🚀 Integration with ApprovalWorkflowEngine

These API endpoints integrate with the `ApprovalWorkflowEngine` service located at:
```
src/services/contractor/approval/approvalWorkflowService.ts
```

The service provides:
- Business logic for workflow management
- SLA tracking and escalation
- Automatic approver assignment
- Performance metrics and analytics

## 📝 Usage Examples

### Frontend Integration

```javascript
// Initialize workflow
const response = await fetch('/api/contractors/documents/approval-workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId: '123e4567-e89b-12d3-a456-426614174000',
    documentType: 'insurance_certificate',
    priorityLevel: 'high'
  })
});

const { data } = await response.json();
console.log(`Workflow ${data.workflowId} initiated for stage ${data.currentStage}`);

// Get approver queue
const queueResponse = await fetch(
  '/api/contractors/documents/approval-queue?approverUserId=compliance-officer-1&sortBy=priority&sortOrder=desc'
);
const queueData = await queueResponse.json();
console.log(`${queueData.data.items.length} items in queue`);

// Process approval
const approvalResponse = await fetch('/api/contractors/documents/approval-workflow', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflowId: data.workflowId,
    approverUserId: 'compliance-officer-1',
    decision: 'approve',
    comments: 'Document approved - all requirements met',
    timeSpentMinutes: 10
  })
});
```

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: Neon database connection string
- `API_BASE_URL`: Base URL for API endpoints (testing)
- `NODE_ENV`: Environment mode (development/production)

### Default Settings
- Default SLA: 24 hours
- Escalation threshold: 48 hours  
- Maximum queue size: 200 items
- Default priority: normal
- Stage count: 4 stages

## 📈 Monitoring & Analytics

### Metrics Tracked
- Workflow completion times
- SLA compliance rates
- Stage-specific performance
- Approver workload distribution
- Escalation frequency

### Performance Targets
- API response time: < 200ms
- Workflow initiation: < 500ms
- Queue loading: < 300ms
- 99.9% uptime SLA

---

## 🤝 Contributing

When extending these APIs:

1. **Follow Existing Patterns**: Maintain consistent response formats
2. **Add Tests**: Update test suite for new functionality
3. **Update Documentation**: Keep this README current
4. **Type Safety**: Add TypeScript interfaces to types.ts
5. **Database Integrity**: Ensure proper foreign key relationships
6. **Error Handling**: Comprehensive validation and error responses

## 🆘 Support

For issues or questions regarding the approval workflow API:

1. Check the test suite results
2. Verify database schema matches expectations  
3. Ensure proper environment configuration
4. Review the ApprovalWorkflowEngine service logs

---

*Last Updated: 2025-01-14*