# PHASE 1 EXECUTION PLAN - Document Approval Workflow
**Status**: Strategic Planning Complete
**Timeline**: Weeks 1-3 (15 working days)
**Scope**: Document Approval Workflow Implementation ONLY

## Executive Summary
Build the missing 25% of the contractors module - specifically the document approval workflow system that manages SLA-based approvals, escalation chains, and automated queue processing. This builds on the existing contractor infrastructure (75% complete) without rebuilding any existing components.

## EXISTING FOUNDATION (75% Complete - DO NOT REBUILD)

### ✅ Database Layer
- `contractors` table - Full schema with 70+ fields
- `contractor_documents` table - Document storage with verification
- `contractor_teams` table - Team management
- `project_assignments` table - Project assignments
- Complete indexes and relationships

### ✅ Service Layer  
- `contractorApiService.ts` - API integration
- `contractorDocumentService.ts` - Document management
- `contractorOnboardingService.ts` - Onboarding logic
- `OnboardingApprovalService.ts` - Basic approval structure (needs workflow engine)
- `contractorComplianceService.ts` - Compliance tracking
- Full CRUD operations

### ✅ UI Components
- `ContractorsDashboard.tsx` - Main dashboard
- Document upload components
- Form components
- Performance tracking UI
- Onboarding workflow UI

### ✅ API Routes
- `/api/contractors/*` - CRUD endpoints
- Document upload/download endpoints
- Team management endpoints

## MISSING COMPONENTS (25% - TO BUILD)

### 🔴 Database Tables Needed
1. `document_approval_workflows` - Workflow definitions
2. `approval_queue_items` - Active approval queue
3. `approval_history` - Audit trail
4. `approval_escalations` - Escalation tracking

### 🔴 Services Needed
1. `ApprovalWorkflowEngine` - Core workflow processing
2. `ApprovalQueueService` - Queue management
3. `SLAMonitoringService` - SLA tracking
4. `EscalationService` - Auto-escalation

### 🔴 UI Components Needed
1. Approval queue dashboard
2. Approval action interface
3. SLA status indicators
4. Workflow configuration UI

## WEEK 1: Database & Core Services (Days 1-5)

### Day 1: Database Schema Implementation (6 hours)
- [ ] **Task 1.1**: Create workflow schema files (2h)
  - File: `src/lib/neon/schema/workflow.schema.ts`
  - Tables: document_approval_workflows, approval_queue_items
  - Acceptance: Schema compiles, follows existing patterns
  - Dependencies: contractor.schema.ts

- [ ] **Task 1.2**: Create migration files (1h)
  - Generate Drizzle migrations
  - Test rollback/forward
  - Acceptance: Migrations run successfully
  - Dependencies: Task 1.1

- [ ] **Task 1.3**: Create audit/history tables (2h)
  - Tables: approval_history, approval_escalations
  - Include proper indexes
  - Acceptance: Full referential integrity
  - Dependencies: Task 1.1

- [ ] **Task 1.4**: Seed test workflow data (1h)
  - Create 3 standard workflows
  - Add test queue items
  - Acceptance: Test data queryable
  - Dependencies: Tasks 1.2, 1.3

### Day 2: Workflow Engine Core (8 hours)
- [ ] **Task 2.1**: Create ApprovalWorkflowEngine base (3h)
  - File: `src/services/workflow/ApprovalWorkflowEngine.ts`
  - Core state machine logic
  - Acceptance: Unit tests pass for state transitions
  - Dependencies: Day 1 completion

- [ ] **Task 2.2**: Implement workflow definition loader (2h)
  - Load workflows from database
  - Validate workflow rules
  - Acceptance: Loads all seed workflows
  - Dependencies: Task 2.1

- [ ] **Task 2.3**: Build approval action processor (3h)
  - Approve/reject/escalate logic
  - Update queue items
  - Acceptance: Process test approvals
  - Dependencies: Task 2.1

### Day 3: Queue Management Service (7 hours)
- [ ] **Task 3.1**: Create ApprovalQueueService (3h)
  - File: `src/services/workflow/ApprovalQueueService.ts`
  - Queue CRUD operations
  - Acceptance: Can add/remove items
  - Dependencies: Day 2 completion

- [ ] **Task 3.2**: Implement priority logic (2h)
  - SLA-based prioritization
  - Urgency calculations
  - Acceptance: Items sorted by priority
  - Dependencies: Task 3.1

- [ ] **Task 3.3**: Build queue filters/search (2h)
  - Filter by status, approver, SLA
  - Full-text search
  - Acceptance: Filters return correct results
  - Dependencies: Task 3.1

### Day 4: SLA & Escalation Services (7 hours)
- [ ] **Task 4.1**: Create SLAMonitoringService (3h)
  - File: `src/services/workflow/SLAMonitoringService.ts`
  - Calculate SLA status
  - Track time remaining
  - Acceptance: Accurate SLA calculations
  - Dependencies: Day 3 completion

- [ ] **Task 4.2**: Build EscalationService (2h)
  - File: `src/services/workflow/EscalationService.ts`
  - Auto-escalation logic
  - Notification triggers
  - Acceptance: Escalates on SLA breach
  - Dependencies: Task 4.1

- [ ] **Task 4.3**: Implement scheduled jobs (2h)
  - Cron for SLA checks
  - Queue cleanup
  - Acceptance: Jobs run on schedule
  - Dependencies: Tasks 4.1, 4.2

### Day 5: Integration & Testing (6 hours)
- [ ] **Task 5.1**: Integrate with existing services (2h)
  - Connect to OnboardingApprovalService
  - Update contractorDocumentService
  - Acceptance: Services communicate
  - Dependencies: Days 1-4

- [ ] **Task 5.2**: Create integration tests (2h)
  - End-to-end workflow tests
  - Error handling tests
  - Acceptance: 90% coverage
  - Dependencies: Task 5.1

- [ ] **Task 5.3**: Performance testing (2h)
  - Load test with 1000 queue items
  - Measure response times
  - Acceptance: <200ms API responses
  - Dependencies: Task 5.1

## WEEK 2: API & Advanced Features (Days 6-10)

### Day 6: REST API Endpoints (7 hours)
- [ ] **Task 6.1**: Create workflow API routes (3h)
  - Files: `src/app/api/workflows/*`
  - CRUD for workflows
  - Acceptance: Postman tests pass
  - Dependencies: Week 1 completion

- [ ] **Task 6.2**: Build queue API endpoints (2h)
  - Get queue items
  - Bulk operations
  - Acceptance: Handles pagination
  - Dependencies: Task 6.1

- [ ] **Task 6.3**: Implement approval actions API (2h)
  - Approve/reject endpoints
  - Batch approvals
  - Acceptance: Updates queue correctly
  - Dependencies: Task 6.1

### Day 7: Notification System (6 hours)
- [ ] **Task 7.1**: Create notification templates (2h)
  - Email templates for approvals
  - In-app notification format
  - Acceptance: Templates render correctly
  - Dependencies: None

- [ ] **Task 7.2**: Build notification service (2h)
  - Send approval requests
  - Escalation alerts
  - Acceptance: Notifications sent
  - Dependencies: Task 7.1

- [ ] **Task 7.3**: Implement notification preferences (2h)
  - User notification settings
  - Channel selection (email/in-app)
  - Acceptance: Respects preferences
  - Dependencies: Task 7.2

### Day 8: Analytics & Reporting (6 hours)
- [ ] **Task 8.1**: Create approval metrics service (3h)
  - Average approval time
  - SLA compliance rate
  - Acceptance: Accurate calculations
  - Dependencies: Week 1 completion

- [ ] **Task 8.2**: Build reporting queries (2h)
  - Approval history reports
  - Bottleneck analysis
  - Acceptance: Reports generate
  - Dependencies: Task 8.1

- [ ] **Task 8.3**: Export functionality (1h)
  - CSV/PDF export
  - Scheduled reports
  - Acceptance: Files download correctly
  - Dependencies: Task 8.2

### Day 9: Role-Based Access Control (6 hours)
- [ ] **Task 9.1**: Define approval roles (2h)
  - Approver, Admin, Viewer
  - Role hierarchy
  - Acceptance: Roles created in DB
  - Dependencies: None

- [ ] **Task 9.2**: Implement authorization (3h)
  - Route protection
  - Action validation
  - Acceptance: Unauthorized blocked
  - Dependencies: Task 9.1

- [ ] **Task 9.3**: Delegation system (1h)
  - Temporary delegation
  - Out-of-office handling
  - Acceptance: Delegation works
  - Dependencies: Task 9.2

### Day 10: Error Handling & Recovery (5 hours)
- [ ] **Task 10.1**: Implement retry logic (2h)
  - Failed approval retries
  - Dead letter queue
  - Acceptance: Retries execute
  - Dependencies: Week 1 completion

- [ ] **Task 10.2**: Build recovery procedures (2h)
  - Rollback mechanisms
  - Data consistency checks
  - Acceptance: Can recover from failures
  - Dependencies: Task 10.1

- [ ] **Task 10.3**: Audit logging (1h)
  - Log all actions
  - Compliance tracking
  - Acceptance: Full audit trail
  - Dependencies: Task 10.1

## WEEK 3: UI Implementation & Testing (Days 11-15)

### Day 11: Approval Queue Dashboard (7 hours)
- [ ] **Task 11.1**: Create queue list component (3h)
  - File: `src/components/workflow/ApprovalQueue.tsx`
  - Table with sorting/filtering
  - Acceptance: Displays queue items
  - Dependencies: Week 2 APIs

- [ ] **Task 11.2**: Build queue item details (2h)
  - Expandable rows
  - Document preview
  - Acceptance: Shows all details
  - Dependencies: Task 11.1

- [ ] **Task 11.3**: Implement real-time updates (2h)
  - WebSocket/polling for updates
  - Live SLA countdown
  - Acceptance: Updates without refresh
  - Dependencies: Task 11.1

### Day 12: Approval Actions Interface (6 hours)
- [ ] **Task 12.1**: Create approval modal (3h)
  - File: `src/components/workflow/ApprovalModal.tsx`
  - Approve/reject forms
  - Comments field
  - Acceptance: Actions submit correctly
  - Dependencies: Day 11

- [ ] **Task 12.2**: Build bulk actions (2h)
  - Multi-select
  - Batch operations
  - Acceptance: Processes multiple items
  - Dependencies: Task 12.1

- [ ] **Task 12.3**: Add keyboard shortcuts (1h)
  - Quick approve/reject
  - Navigation shortcuts
  - Acceptance: Shortcuts work
  - Dependencies: Task 12.1

### Day 13: SLA Visualization (6 hours)
- [ ] **Task 13.1**: Create SLA indicators (2h)
  - Color-coded status
  - Progress bars
  - Acceptance: Visual clarity
  - Dependencies: Day 11

- [ ] **Task 13.2**: Build SLA dashboard widget (2h)
  - Summary statistics
  - Trend charts
  - Acceptance: Accurate metrics
  - Dependencies: Task 13.1

- [ ] **Task 13.3**: Implement alerts UI (2h)
  - SLA breach warnings
  - Escalation notices
  - Acceptance: Alerts display
  - Dependencies: Task 13.1

### Day 14: End-to-End Testing (8 hours)
- [ ] **Task 14.1**: Write E2E test scenarios (3h)
  - Full approval workflow
  - Escalation scenarios
  - Acceptance: Tests documented
  - Dependencies: Days 11-13

- [ ] **Task 14.2**: Implement Playwright tests (3h)
  - File: `tests/e2e/approval-workflow.spec.ts`
  - UI interaction tests
  - Acceptance: Tests pass
  - Dependencies: Task 14.1

- [ ] **Task 14.3**: Performance testing (2h)
  - Load test UI
  - Measure render times
  - Acceptance: <1.5s page loads
  - Dependencies: Task 14.2

### Day 15: Documentation & Deployment Prep (6 hours)
- [ ] **Task 15.1**: Write user documentation (2h)
  - Approval process guide
  - Admin configuration
  - Acceptance: Clear instructions
  - Dependencies: All previous tasks

- [ ] **Task 15.2**: Create API documentation (2h)
  - OpenAPI spec
  - Integration examples
  - Acceptance: All endpoints documented
  - Dependencies: Task 15.1

- [ ] **Task 15.3**: Deployment checklist (2h)
  - Environment variables
  - Migration scripts
  - Acceptance: Ready for staging
  - Dependencies: All tasks

## Dependencies & Prerequisites

### Technical Dependencies
- Neon PostgreSQL database (✅ Existing)
- Drizzle ORM (✅ Existing)
- Next.js/React framework (✅ Existing)
- TypeScript/Node.js (✅ Existing)

### Data Dependencies
- Contractor records (✅ Existing in DB)
- Document records (✅ Existing in DB)
- User/role data (⚠️ Needs verification)

### External Dependencies
- Email service for notifications (⚠️ Needs setup)
- File storage for documents (✅ Existing)

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Existing service integration complexity | Medium | High | Allocate extra time for integration testing, create adapters |
| SLA calculation accuracy | Low | High | Extensive unit testing, use proven date libraries |
| Database migration failures | Low | High | Test migrations in staging, maintain rollback scripts |
| Performance with large queues | Medium | Medium | Implement pagination, add database indexes |
| User adoption resistance | Medium | Low | Include user training, intuitive UI design |

## Required Resources

### AI Agents Needed
- **strategic-planner**: Task breakdown and planning (Current)
- **system-architect**: Database schema design
- **code-implementer**: Service implementation
- **test-coverage-validator**: Test creation and validation
- **ui-ux-optimizer**: Dashboard UI development

### Tools Required
- VS Code with TypeScript support
- Postman for API testing
- pgAdmin for database management
- Chrome DevTools for UI debugging

### Human Resources
- Technical review at end of each week
- UAT testing in Week 3
- Deployment support on Day 15

## Success Criteria

### Functional Criteria
- [ ] Complete approval workflow from submission to completion
- [ ] SLA monitoring with automatic escalation
- [ ] Bulk approval operations working
- [ ] Full audit trail maintained
- [ ] Real-time queue updates

### Technical Criteria
- [ ] Zero TypeScript/ESLint errors
- [ ] >90% test coverage achieved
- [ ] All API responses <200ms
- [ ] Page load times <1.5s
- [ ] No console.log statements

### Business Criteria
- [ ] Reduces approval time by 50%
- [ ] Eliminates manual tracking
- [ ] Provides complete visibility
- [ ] Ensures SLA compliance

## Timeline Summary

**Week 1 (Days 1-5): Foundation**
- Database schema implementation
- Core workflow engine
- Basic services

**Week 2 (Days 6-10): Features**
- REST API implementation
- Advanced features (notifications, RBAC)
- Analytics and reporting

**Week 3 (Days 11-15): UI & Polish**
- Dashboard implementation
- End-to-end testing
- Documentation and deployment

**Critical Path**: Days 1-2-3-6-11 (Database → Engine → Queue → API → UI)

## Validation Checkpoints

### Week 1 Checkpoint (Day 5)
- [ ] All database tables created
- [ ] Workflow engine processing approvals
- [ ] Integration tests passing

### Week 2 Checkpoint (Day 10)
- [ ] All APIs functional
- [ ] Notifications working
- [ ] RBAC implemented

### Week 3 Checkpoint (Day 15)
- [ ] UI fully functional
- [ ] All tests passing
- [ ] Documentation complete

## IMPORTANT NOTES

### What We're NOT Building
- ❌ New contractor CRUD (already exists)
- ❌ Document upload system (already exists)
- ❌ Basic approval functions (already exists)
- ❌ Contractor dashboard (already exists)

### What We ARE Building
- ✅ Workflow engine for multi-step approvals
- ✅ SLA monitoring and escalation
- ✅ Approval queue management
- ✅ Automated workflow processing

### Integration Points
1. **OnboardingApprovalService** - Extend with workflow engine
2. **contractorDocumentService** - Add workflow triggers
3. **ContractorsDashboard** - Add approval queue widget
4. **Notification system** - New but integrates with existing services

---

**Implementation Guarantee**: This plan builds ONLY the missing 25% without touching the working 75%. All new components integrate with existing services through well-defined interfaces.

**Next Step**: Begin Day 1, Task 1.1 - Create workflow schema files