# Contractors Module - Implementation PRD v2.0
**Complete Feature Implementation with API-First Architecture**

## Document Information
- **Version**: 2.0 (Implementation Ready)
- **Date**: September 2, 2025
- **Status**: Ready for Development
- **Based On**: Reverse-engineered analysis + Missing features enhancement
- **Target Platform**: Neon PostgreSQL + Next.js API Routes
- **Implementation Approach**: TDD (Test-Driven Development)

---

## Executive Summary

This PRD defines the **complete implementation roadmap** for the FibreFlow Contractors Module, building upon the existing 75% implementation to achieve 100% functionality. The focus is on completing missing critical features while maintaining the excellent architectural foundation already established.

### Implementation Status & Goals
- **Current**: 75% complete with excellent foundation
- **Target**: 100% feature-complete production system
- **Approach**: API-first development with comprehensive testing
- **Timeline**: 8-12 weeks for full implementation

### Critical Implementation Priorities
1. **Document Approval Workflow Engine** (Weeks 1-3)
2. **External API Integrations** (Weeks 4-6) 
3. **Advanced Compliance Automation** (Weeks 7-8)
4. **Enhanced Analytics & Reporting** (Weeks 9-10)
5. **Financial Management Module** (Weeks 11-12)

---

## 1. API-First Architecture Design

### 1.1 Core API Endpoints Structure

**Base URL**: `/api/contractors`

#### 1.1.1 Contractor Management APIs ✅ EXISTING (Enhanced)
```typescript
// Core CRUD (Already implemented - enhance with additional fields)
GET    /api/contractors                    // List with advanced filtering
POST   /api/contractors                    // Create with validation
GET    /api/contractors/[id]               // Get by ID with related data
PUT    /api/contractors/[id]               // Update with audit trail
DELETE /api/contractors/[id]               // Soft delete with dependencies
GET    /api/contractors/[id]/audit-trail   // Full change history

// Advanced Contractor Operations (NEW)
POST   /api/contractors/bulk-import        // CSV/Excel import
POST   /api/contractors/bulk-update        // Batch operations
GET    /api/contractors/analytics          // Dashboard analytics
GET    /api/contractors/export             // Export to various formats
```

#### 1.1.2 Document Management APIs 🟡 ENHANCE EXISTING
```typescript
// Document CRUD (Enhance existing)
GET    /api/contractors/[id]/documents           // List contractor documents
POST   /api/contractors/[id]/documents           // Upload new document
GET    /api/contractors/[id]/documents/[docId]   // Get document details
PUT    /api/contractors/[id]/documents/[docId]   // Update document metadata
DELETE /api/contractors/[id]/documents/[docId]   // Delete document

// NEW: Document Processing & Approval
POST   /api/contractors/[id]/documents/[docId]/submit-for-approval
GET    /api/contractors/[id]/documents/[docId]/approval-status
POST   /api/contractors/[id]/documents/[docId]/approve
POST   /api/contractors/[id]/documents/[docId]/reject
GET    /api/contractors/[id]/documents/[docId]/versions
POST   /api/contractors/[id]/documents/[docId]/ocr-process

// NEW: Document Approval Queue Management
GET    /api/contractors/documents/approval-queue     // All pending documents
GET    /api/contractors/documents/approval-queue/[userId] // User-specific queue
POST   /api/contractors/documents/bulk-approve       // Batch approvals
GET    /api/contractors/documents/sla-report         // SLA compliance report
```

#### 1.1.3 Compliance Management APIs 🔴 NEW IMPLEMENTATION
```typescript
// Compliance Status & Monitoring
GET    /api/contractors/[id]/compliance-status      // Real-time compliance
GET    /api/contractors/[id]/compliance-issues      // Active issues list
GET    /api/contractors/[id]/compliance-score       // Calculated score
POST   /api/contractors/[id]/compliance-check       // Manual compliance check

// Compliance Automation
GET    /api/contractors/compliance/expiring         // Documents expiring soon
POST   /api/contractors/compliance/batch-check      // Check all contractors
GET    /api/contractors/compliance/dashboard        // Compliance dashboard data
POST   /api/contractors/compliance/send-reminders   // Send expiry reminders

// External Verification Integration
POST   /api/contractors/[id]/verify-cipc           // CIPC company verification
POST   /api/contractors/[id]/verify-sars           // SARS tax compliance
POST   /api/contractors/[id]/verify-bbbee          // SANAS B-BBEE verification
GET    /api/contractors/[id]/verification-status    // All verification statuses
```

#### 1.1.4 Team Management APIs ✅ EXISTING (Complete)
```typescript
// Team Operations (Already well implemented)
GET    /api/contractors/[id]/teams                // List contractor teams
POST   /api/contractors/[id]/teams                // Create new team
GET    /api/contractors/[id]/teams/[teamId]       // Get team details
PUT    /api/contractors/[id]/teams/[teamId]       // Update team
DELETE /api/contractors/[id]/teams/[teamId]       // Delete team

// Team Member Operations
GET    /api/contractors/[id]/teams/[teamId]/members     // List team members
POST   /api/contractors/[id]/teams/[teamId]/members     // Add team member
PUT    /api/contractors/[id]/teams/[teamId]/members/[memberId] // Update member
DELETE /api/contractors/[id]/teams/[teamId]/members/[memberId] // Remove member
```

#### 1.1.5 Performance & Analytics APIs 🟡 ENHANCE EXISTING
```typescript
// Performance Management (Enhance existing)
GET    /api/contractors/[id]/performance           // Performance metrics
POST   /api/contractors/[id]/performance-update   // Update performance data
GET    /api/contractors/[id]/rag-scores           // Current RAG scores
POST   /api/contractors/[id]/rag-recalculate      // Recalculate RAG scores

// NEW: Advanced Analytics
GET    /api/contractors/analytics/dashboard        // System-wide analytics
GET    /api/contractors/analytics/performance-trends // Performance trends
GET    /api/contractors/analytics/compliance-trends  // Compliance trends
GET    /api/contractors/analytics/top-performers     // Top performing contractors
GET    /api/contractors/analytics/risk-assessment    // Risk analysis report
POST   /api/contractors/analytics/custom-report      // Generate custom reports
```

#### 1.1.6 Financial Management APIs 🔴 NEW IMPLEMENTATION
```typescript
// Rate Card Management (NEW)
GET    /api/contractors/[id]/rate-cards            // Contractor rate cards
POST   /api/contractors/[id]/rate-cards            // Create rate card
PUT    /api/contractors/[id]/rate-cards/[cardId]   // Update rate card
DELETE /api/contractors/[id]/rate-cards/[cardId]   // Delete rate card

// Financial Performance (NEW)
GET    /api/contractors/[id]/financial-summary     // Financial overview
GET    /api/contractors/[id]/payment-history       // Payment track record
GET    /api/contractors/[id]/invoices              // Invoice management
POST   /api/contractors/[id]/financial-assessment  // Credit assessment
GET    /api/contractors/financial-dashboard        // Financial analytics
```

#### 1.1.7 Project Assignment APIs 🟡 ENHANCE EXISTING
```typescript
// Project Integration (Enhance existing schema)
GET    /api/contractors/[id]/projects              // Assigned projects
POST   /api/contractors/[id]/projects              // Assign to project
GET    /api/contractors/[id]/projects/[projectId]  // Project assignment details
PUT    /api/contractors/[id]/projects/[projectId]  // Update assignment
DELETE /api/contractors/[id]/projects/[projectId]  // Remove from project

// Project Performance
GET    /api/contractors/[id]/projects/[projectId]/performance // Project performance
POST   /api/contractors/[id]/projects/[projectId]/review     // Performance review
GET    /api/contractors/projects/availability                // Contractor availability
```

---

## 2. Database Schema Enhancements

### 2.1 Additional Tables Needed 🔴 NEW

#### 2.1.1 Document Approval Workflow Tables
```sql
-- Document Approval Workflows
CREATE TABLE document_approval_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES contractor_documents(id) ON DELETE CASCADE,
  workflow_stage INTEGER NOT NULL DEFAULT 1,
  current_approver_id VARCHAR(255),
  workflow_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in_review, approved, rejected
  
  -- Stage Tracking
  stage_1_status VARCHAR(20) DEFAULT 'pending', -- automated_validation
  stage_1_completed_at TIMESTAMP,
  stage_2_status VARCHAR(20) DEFAULT 'pending', -- compliance_review  
  stage_2_approver_id VARCHAR(255),
  stage_2_completed_at TIMESTAMP,
  stage_3_status VARCHAR(20) DEFAULT 'pending', -- legal_review
  stage_3_approver_id VARCHAR(255), 
  stage_3_completed_at TIMESTAMP,
  stage_4_status VARCHAR(20) DEFAULT 'pending', -- final_approval
  stage_4_approver_id VARCHAR(255),
  stage_4_completed_at TIMESTAMP,
  
  -- SLA Tracking
  sla_due_date TIMESTAMP NOT NULL,
  is_overdue BOOLEAN DEFAULT FALSE,
  escalation_level INTEGER DEFAULT 0,
  escalation_reason TEXT,
  
  -- Comments & Notes
  approval_notes JSON, -- Array of approval comments
  rejection_reason TEXT,
  resubmission_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Approval Queue Management
CREATE TABLE approval_queue_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES document_approval_workflows(id) ON DELETE CASCADE,
  approver_id VARCHAR(255) NOT NULL,
  queue_position INTEGER,
  assigned_at TIMESTAMP DEFAULT NOW(),
  priority_level VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  estimated_review_time INTEGER, -- minutes
  
  UNIQUE(workflow_id, approver_id)
);

CREATE INDEX idx_approval_queue_approver ON approval_queue_items(approver_id, priority_level);
CREATE INDEX idx_approval_workflows_status ON document_approval_workflows(workflow_status, sla_due_date);
```

#### 2.1.2 Compliance Management Tables
```sql
-- Compliance Requirements Template
CREATE TABLE compliance_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_type VARCHAR(100) NOT NULL, -- insurance, bbbee, tax_clearance, etc.
  requirement_name TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT TRUE,
  renewal_period_months INTEGER, -- How often renewal is required
  warning_days INTEGER DEFAULT 30, -- Days before expiry to warn
  critical_days INTEGER DEFAULT 7, -- Days before expiry for critical alerts
  
  -- Validation Rules
  validation_rules JSON, -- Automated validation criteria
  external_api_endpoint VARCHAR(255), -- For automated verification
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Compliance Status Tracking
CREATE TABLE contractor_compliance_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES compliance_requirements(id),
  
  -- Current Status
  compliance_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- compliant, non_compliant, pending, expired
  last_check_date TIMESTAMP,
  next_check_date TIMESTAMP,
  
  -- Document References
  current_document_id UUID REFERENCES contractor_documents(id),
  expiry_date TIMESTAMP,
  days_until_expiry INTEGER,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by VARCHAR(255),
  verified_at TIMESTAMP,
  verification_method VARCHAR(50), -- manual, api, automated
  external_verification_id VARCHAR(255), -- Reference from external API
  
  -- Alerts & Actions
  alert_sent_30_days BOOLEAN DEFAULT FALSE,
  alert_sent_7_days BOOLEAN DEFAULT FALSE,
  alert_sent_expired BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(contractor_id, requirement_id)
);

CREATE INDEX idx_compliance_status_contractor ON contractor_compliance_status(contractor_id);
CREATE INDEX idx_compliance_expiry ON contractor_compliance_status(expiry_date, compliance_status);
```

#### 2.1.3 Financial Management Tables
```sql
-- Rate Cards
CREATE TABLE contractor_rate_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  
  -- Rate Card Details
  card_name TEXT NOT NULL,
  service_category VARCHAR(100) NOT NULL, -- installation, maintenance, survey
  service_description TEXT,
  
  -- Pricing
  hourly_rate DECIMAL(10,2),
  daily_rate DECIMAL(10,2),
  unit_rate DECIMAL(10,2),
  unit_type VARCHAR(50), -- per_meter, per_drop, per_pole
  
  -- Location & Time Modifiers
  location_multiplier DECIMAL(4,2) DEFAULT 1.0,
  overtime_multiplier DECIMAL(4,2) DEFAULT 1.5,
  weekend_multiplier DECIMAL(4,2) DEFAULT 1.25,
  
  -- Validity
  effective_date DATE NOT NULL,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Terms
  minimum_charge_hours DECIMAL(4,2),
  travel_rate DECIMAL(10,2),
  travel_threshold_km INTEGER DEFAULT 50,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial Performance Tracking
CREATE TABLE contractor_financial_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  
  -- Period Tracking
  record_period DATE NOT NULL, -- Monthly records
  
  -- Revenue Metrics
  total_invoiced DECIMAL(15,2) DEFAULT 0,
  total_paid DECIMAL(15,2) DEFAULT 0,
  outstanding_amount DECIMAL(15,2) DEFAULT 0,
  
  -- Performance Metrics
  average_payment_days INTEGER,
  payment_compliance_score INTEGER, -- 0-100
  dispute_count INTEGER DEFAULT 0,
  
  -- Project Metrics
  projects_completed INTEGER DEFAULT 0,
  projects_on_time INTEGER DEFAULT 0,
  projects_on_budget INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(contractor_id, record_period)
);

CREATE INDEX idx_rate_cards_contractor ON contractor_rate_cards(contractor_id, is_active);
CREATE INDEX idx_financial_records_period ON contractor_financial_records(record_period);
```

### 2.2 Enhanced Existing Tables

#### 2.2.1 Contractors Table Additions
```sql
-- Add new fields to existing contractors table
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS:
  
-- Enhanced Financial Information
  credit_limit DECIMAL(15,2),
  payment_terms_days INTEGER DEFAULT 30,
  preferred_payment_method VARCHAR(50),
  
-- Enhanced Status Tracking
  onboarding_stage VARCHAR(50) DEFAULT 'registration', -- registration, documentation, review, approval, active
  last_compliance_check TIMESTAMP,
  next_compliance_review TIMESTAMP,
  
-- Performance Enhancements
  total_revenue DECIMAL(15,2) DEFAULT 0,
  average_project_rating DECIMAL(3,2),
  customer_satisfaction_score INTEGER, -- 1-10
  
-- Risk Management
  risk_category VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  insurance_expiry_date DATE,
  last_safety_incident DATE,
  
-- Advanced Metadata
  preferred_communication_method VARCHAR(50) DEFAULT 'email',
  time_zone VARCHAR(50) DEFAULT 'Africa/Johannesburg',
  language_preference VARCHAR(10) DEFAULT 'en',
  
-- Integration Fields
  external_contractor_id VARCHAR(100), -- Integration with other systems
  legacy_system_id VARCHAR(100),
  
-- Audit Enhancement
  created_by_user_id VARCHAR(255),
  last_modified_by_user_id VARCHAR(255),
  modification_count INTEGER DEFAULT 0;
```

---

## 3. Missing Feature Implementation

### 3.1 Document Approval Workflow Engine 🔴 CRITICAL

#### 3.1.1 Workflow State Machine
```typescript
// Service: /src/services/contractor/approval/approvalWorkflowService.ts

interface ApprovalWorkflowConfig {
  documentType: string;
  stages: ApprovalStage[];
  slaHours: number;
  escalationRules: EscalationRule[];
}

interface ApprovalStage {
  stageNumber: number;
  stageName: string;
  approverRole: string;
  isRequired: boolean;
  autoApprovalRules?: AutoApprovalRule[];
  parallelApproval: boolean;
}

export class ApprovalWorkflowEngine {
  async initiateWorkflow(documentId: string, workflowConfig: ApprovalWorkflowConfig): Promise<string>
  async processApproval(workflowId: string, approverUserId: string, decision: 'approve' | 'reject', notes?: string): Promise<ApprovalResult>
  async escalateOverdueApprovals(): Promise<EscalationResult[]>
  async getApprovalQueue(approverUserId: string): Promise<QueueItem[]>
  async batchApprove(approverUserId: string, workflowIds: string[], notes?: string): Promise<BatchResult>
}
```

#### 3.1.2 API Implementation
```typescript
// API Route: /pages/api/contractors/documents/approval-workflow.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST': // Initiate workflow
      const { documentId, contractorId } = req.body;
      const workflowId = await approvalWorkflowService.initiate(documentId, contractorId);
      return res.status(201).json({ workflowId });
      
    case 'PUT': // Process approval decision
      const { workflowId, decision, notes } = req.body;
      const result = await approvalWorkflowService.processDecision(workflowId, decision, notes);
      return res.status(200).json(result);
      
    case 'GET': // Get workflow status
      const status = await approvalWorkflowService.getStatus(req.query.workflowId as string);
      return res.status(200).json(status);
  }
}
```

### 3.2 External API Integration Layer 🔴 CRITICAL

#### 3.2.1 Government API Integration Service
```typescript
// Service: /src/services/contractor/verification/externalVerificationService.ts

export class ExternalVerificationService {
  // CIPC Company Registration Verification
  async verifyCIPCRegistration(registrationNumber: string): Promise<CIPCVerificationResult> {
    // Integration with CIPC API
    const response = await fetch(`${CIPC_API_BASE}/companies/${registrationNumber}`, {
      headers: { 'Authorization': `Bearer ${process.env.CIPC_API_KEY}` }
    });
    
    if (!response.ok) {
      throw new Error(`CIPC verification failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      isValid: data.status === 'active',
      companyName: data.companyName,
      registrationDate: data.registrationDate,
      status: data.status,
      directors: data.directors,
      verificationDate: new Date(),
      verificationReference: data.reference
    };
  }
  
  // SARS Tax Compliance Verification
  async verifySARSCompliance(taxNumber: string): Promise<SARSVerificationResult> {
    // Integration with SARS API
    // Implementation details...
  }
  
  // SANAS B-BBEE Certificate Verification
  async verifyBBBEECertificate(certificateNumber: string): Promise<BBBEEVerificationResult> {
    // Integration with SANAS API
    // Implementation details...
  }
}
```

#### 3.2.2 Verification API Endpoints
```typescript
// API Route: /pages/api/contractors/[id]/verify/[verificationType].ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: contractorId, verificationType } = req.query;
  
  if (req.method === 'POST') {
    try {
      let result;
      
      switch (verificationType) {
        case 'cipc':
          const contractor = await contractorService.getById(contractorId as string);
          result = await verificationService.verifyCIPCRegistration(contractor.registrationNumber);
          break;
          
        case 'sars':
          const { taxNumber } = req.body;
          result = await verificationService.verifySARSCompliance(taxNumber);
          break;
          
        case 'bbbee':
          const { certificateNumber } = req.body;
          result = await verificationService.verifyBBBEECertificate(certificateNumber);
          break;
          
        default:
          return res.status(400).json({ error: 'Invalid verification type' });
      }
      
      // Store verification result
      await verificationService.storeVerificationResult(contractorId as string, verificationType as string, result);
      
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
```

### 3.3 Advanced Compliance Automation 🔴 HIGH PRIORITY

#### 3.3.1 Automated Compliance Monitoring Service
```typescript
// Service: /src/services/contractor/compliance/complianceAutomationService.ts

export class ComplianceAutomationService {
  // Daily compliance monitoring job
  async runDailyComplianceCheck(): Promise<ComplianceCheckResult[]> {
    const contractors = await contractorService.getAllActive();
    const results: ComplianceCheckResult[] = [];
    
    for (const contractor of contractors) {
      const complianceStatus = await this.checkContractorCompliance(contractor.id);
      
      // Check for expiring documents
      const expiringDocs = await this.getExpiringDocuments(contractor.id, 30);
      
      // Send notifications if needed
      if (expiringDocs.length > 0) {
        await this.sendExpiryNotifications(contractor, expiringDocs);
      }
      
      // Update compliance scores
      await this.updateComplianceScore(contractor.id, complianceStatus);
      
      results.push({
        contractorId: contractor.id,
        overallStatus: complianceStatus.overall,
        issuesFound: complianceStatus.issues.length,
        documentsExpiring: expiringDocs.length
      });
    }
    
    return results;
  }
  
  // Real-time compliance scoring
  async calculateComplianceScore(contractorId: string): Promise<ComplianceScore> {
    const [documents, verifications, performance] = await Promise.all([
      this.getDocumentComplianceScore(contractorId),
      this.getVerificationComplianceScore(contractorId), 
      this.getPerformanceComplianceScore(contractorId)
    ]);
    
    const weightedScore = (
      documents.score * 0.4 +
      verifications.score * 0.35 +
      performance.score * 0.25
    );
    
    return {
      overall: Math.round(weightedScore),
      breakdown: { documents, verifications, performance },
      ragStatus: this.scoreToRAG(weightedScore),
      lastCalculated: new Date()
    };
  }
}
```

### 3.4 Enhanced Analytics & Reporting 🟡 MEDIUM PRIORITY

#### 3.4.1 Advanced Analytics Service
```typescript
// Service: /src/services/contractor/analytics/contractorAnalyticsService.ts

export class ContractorAnalyticsService {
  // Performance trend analysis
  async getPerformanceTrends(period: 'month' | 'quarter' | 'year'): Promise<PerformanceTrends> {
    const query = `
      SELECT 
        DATE_TRUNC('${period}', created_at) as period,
        AVG(performance_score) as avg_performance,
        AVG(safety_score) as avg_safety,
        AVG(quality_score) as avg_quality,
        COUNT(*) as contractor_count
      FROM contractors 
      WHERE created_at >= NOW() - INTERVAL '2 ${period}s'
      GROUP BY period
      ORDER BY period
    `;
    
    return await db.execute(query);
  }
  
  // Risk assessment analysis  
  async generateRiskAssessment(): Promise<RiskAssessmentReport> {
    // Complex analysis combining multiple factors
    const contractors = await contractorService.getAll();
    
    return {
      highRiskContractors: contractors.filter(c => c.riskCategory === 'high'),
      complianceRisks: await this.identifyComplianceRisks(),
      financialRisks: await this.identifyFinancialRisks(),
      operationalRisks: await this.identifyOperationalRisks(),
      recommendations: await this.generateRiskMitigationRecommendations()
    };
  }
  
  // Custom report generation
  async generateCustomReport(config: ReportConfig): Promise<CustomReport> {
    // Dynamic report generation based on configuration
  }
}
```

### 3.5 Financial Management Module 🔴 NEW IMPLEMENTATION

#### 3.5.1 Rate Card Management Service
```typescript
// Service: /src/services/contractor/financial/rateCardService.ts

export class RateCardService {
  async createRateCard(contractorId: string, rateCardData: CreateRateCardData): Promise<RateCard> {
    // Validate rate card data
    const validation = await this.validateRateCard(rateCardData);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    
    // Create rate card with approval workflow
    const rateCard = await db.insert(contractorRateCards).values({
      ...rateCardData,
      contractorId,
      effectiveDate: rateCardData.effectiveDate || new Date(),
      isActive: false // Requires approval
    }).returning();
    
    // Initiate approval workflow for rate card
    if (rateCardData.requiresApproval) {
      await approvalWorkflowService.initiateRateCardApproval(rateCard.id);
    }
    
    return rateCard;
  }
  
  async calculateProjectCost(contractorId: string, projectRequirements: ProjectRequirements): Promise<CostEstimate> {
    const rateCards = await this.getActiveRateCards(contractorId);
    
    let totalCost = 0;
    const breakdown: CostBreakdownItem[] = [];
    
    for (const requirement of projectRequirements) {
      const applicableRateCard = this.findApplicableRateCard(rateCards, requirement);
      if (!applicableRateCard) {
        throw new Error(`No rate card found for service: ${requirement.serviceType}`);
      }
      
      const itemCost = this.calculateItemCost(applicableRateCard, requirement);
      totalCost += itemCost.total;
      breakdown.push(itemCost);
    }
    
    return {
      totalCost,
      breakdown,
      validUntil: this.calculateValidityDate(rateCards),
      assumptions: this.generateCostAssumptions()
    };
  }
}
```

---

## 4. Test-Driven Development (TDD) Implementation

### 4.1 Testing Strategy & Coverage Requirements

#### 4.1.1 API Endpoint Testing
```typescript
// Test: /src/tests/api/contractors/approval-workflow.test.ts

describe('Document Approval Workflow API', () => {
  describe('POST /api/contractors/documents/approval-workflow', () => {
    it('should initiate approval workflow for uploaded document', async () => {
      const mockDocument = await createMockDocument();
      
      const response = await request(app)
        .post('/api/contractors/documents/approval-workflow')
        .send({
          documentId: mockDocument.id,
          contractorId: mockDocument.contractorId
        })
        .expect(201);
      
      expect(response.body.workflowId).toBeDefined();
      
      // Verify workflow was created in database
      const workflow = await db.select().from(documentApprovalWorkflows)
        .where(eq(documentApprovalWorkflows.id, response.body.workflowId));
      
      expect(workflow).toHaveLength(1);
      expect(workflow[0].workflowStatus).toBe('pending');
    });
    
    it('should return 400 for invalid document ID', async () => {
      await request(app)
        .post('/api/contractors/documents/approval-workflow')
        .send({
          documentId: 'invalid-id',
          contractorId: 'test-contractor'
        })
        .expect(400);
    });
  });
  
  describe('PUT /api/contractors/documents/approval-workflow', () => {
    it('should process approval decision and advance workflow', async () => {
      const workflow = await createMockWorkflow();
      
      const response = await request(app)
        .put('/api/contractors/documents/approval-workflow')
        .send({
          workflowId: workflow.id,
          decision: 'approve',
          notes: 'Document meets all requirements'
        })
        .expect(200);
      
      expect(response.body.status).toBe('approved');
      expect(response.body.currentStage).toBe(2); // Advanced to next stage
    });
  });
});
```

#### 4.1.2 Service Layer Testing
```typescript
// Test: /src/tests/services/contractor/approvalWorkflowService.test.ts

describe('ApprovalWorkflowService', () => {
  let service: ApprovalWorkflowService;
  
  beforeEach(() => {
    service = new ApprovalWorkflowService();
  });
  
  describe('initiateWorkflow', () => {
    it('should create workflow with correct initial state', async () => {
      const documentId = 'test-doc-id';
      const workflowConfig = createTestWorkflowConfig();
      
      const workflowId = await service.initiateWorkflow(documentId, workflowConfig);
      
      expect(workflowId).toBeDefined();
      
      const workflow = await service.getWorkflowById(workflowId);
      expect(workflow.workflowStage).toBe(1);
      expect(workflow.workflowStatus).toBe('pending');
      expect(workflow.slaDueDate).toBeDefined();
    });
  });
  
  describe('processApproval', () => {
    it('should advance workflow to next stage on approval', async () => {
      const workflow = await createTestWorkflow();
      
      const result = await service.processApproval(
        workflow.id, 
        'approver-user-id', 
        'approve',
        'Test approval'
      );
      
      expect(result.success).toBe(true);
      expect(result.nextStage).toBe(workflow.workflowStage + 1);
    });
    
    it('should handle rejection with resubmission flow', async () => {
      const workflow = await createTestWorkflow();
      
      const result = await service.processApproval(
        workflow.id,
        'approver-user-id',
        'reject', 
        'Document requires corrections'
      );
      
      expect(result.success).toBe(true);
      expect(result.requiresResubmission).toBe(true);
      expect(result.rejectionReason).toBe('Document requires corrections');
    });
  });
});
```

#### 4.1.3 Integration Testing
```typescript
// Test: /src/tests/integration/contractor-compliance.integration.test.ts

describe('Contractor Compliance Integration', () => {
  describe('CIPC Verification Integration', () => {
    it('should verify valid company registration number', async () => {
      const contractor = await createTestContractor({
        registrationNumber: '2021/123456/07'
      });
      
      // Mock CIPC API response
      mockCIPCAPI.verifyCompany.mockResolvedValue({
        isValid: true,
        companyName: 'Test Company (Pty) Ltd',
        status: 'active'
      });
      
      const result = await verificationService.verifyCIPCRegistration(
        contractor.registrationNumber
      );
      
      expect(result.isValid).toBe(true);
      expect(result.companyName).toBe('Test Company (Pty) Ltd');
      
      // Verify result was stored in database
      const storedResult = await db.select()
        .from(contractorVerifications)
        .where(eq(contractorVerifications.contractorId, contractor.id));
      
      expect(storedResult).toHaveLength(1);
    });
  });
  
  describe('Compliance Score Calculation', () => {
    it('should calculate correct compliance score based on all factors', async () => {
      const contractor = await createTestContractorWithCompleteDocuments();
      
      const score = await complianceService.calculateComplianceScore(contractor.id);
      
      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.ragStatus).toBeOneOf(['red', 'amber', 'green']);
    });
  });
});
```

### 4.2 Test Coverage Requirements

```typescript
// Test Coverage Configuration: jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/services/contractor/**/*.{ts,tsx}',
    'src/pages/api/contractors/**/*.{ts,tsx}',
    'src/components/contractor/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.types.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    // Critical services require higher coverage
    'src/services/contractor/approval/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    'src/services/contractor/compliance/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

---

## 5. Implementation Phases & Timeline

### Phase 1: Core Workflow Implementation (Weeks 1-3) 🔥 CRITICAL
**Priority**: Critical Path - Blocks production deployment

#### Week 1: Document Approval Workflow Foundation
- **Day 1-2**: Database schema for approval workflows
- **Day 3-4**: Core workflow service implementation
- **Day 5**: Basic API endpoints for workflow management

#### Week 2: Approval Engine Implementation  
- **Day 1-3**: Workflow state machine and business logic
- **Day 4-5**: SLA tracking and escalation system

#### Week 3: UI Integration & Testing
- **Day 1-2**: Approval queue UI components
- **Day 3-4**: Document approval interface
- **Day 5**: Integration testing and bug fixes

**Deliverables:**
- ✅ Multi-stage document approval workflow
- ✅ Approval queue management
- ✅ SLA tracking and escalation
- ✅ 90%+ test coverage for workflow logic

### Phase 2: External Integration Layer (Weeks 4-6) 🔴 HIGH PRIORITY
**Priority**: High - Enables automation and reduces manual work

#### Week 4: Government API Integration Setup
- **Day 1-2**: CIPC API integration service
- **Day 3-4**: SARS tax compliance verification  
- **Day 5**: SANAS B-BBEE verification setup

#### Week 5: Verification Service Implementation
- **Day 1-2**: External verification orchestration service
- **Day 3-4**: API endpoints for verification requests
- **Day 5**: Error handling and retry mechanisms

#### Week 6: Integration Testing & Optimization
- **Day 1-2**: End-to-end integration testing
- **Day 3-4**: Performance optimization and caching
- **Day 5**: Production readiness and monitoring setup

**Deliverables:**
- ✅ CIPC company registration verification
- ✅ SARS tax compliance checking
- ✅ SANAS B-BBEE certificate validation
- ✅ Automated verification workflows

### Phase 3: Compliance Automation (Weeks 7-8) 🟡 MEDIUM PRIORITY
**Priority**: Medium - Improves operational efficiency

#### Week 7: Automated Compliance Monitoring
- **Day 1-2**: Compliance requirements template system
- **Day 3-4**: Automated compliance checking service
- **Day 5**: Notification and alerting system

#### Week 8: Compliance Dashboard & Reporting
- **Day 1-2**: Real-time compliance dashboard
- **Day 3-4**: Compliance reporting and analytics
- **Day 5**: Integration with existing dashboard

**Deliverables:**
- ✅ Automated daily compliance monitoring
- ✅ Proactive expiry notifications
- ✅ Compliance dashboard and reporting
- ✅ Risk assessment automation

### Phase 4: Enhanced Analytics (Weeks 9-10) 🟡 MEDIUM PRIORITY  
**Priority**: Medium - Provides business intelligence

#### Week 9: Advanced Analytics Service
- **Day 1-2**: Performance trend analysis
- **Day 3-4**: Risk assessment algorithms
- **Day 5**: Custom report generation framework

#### Week 10: Analytics Dashboard & Visualization
- **Day 1-2**: Advanced analytics UI components
- **Day 3-4**: Dashboard integration and testing
- **Day 5**: Performance optimization

**Deliverables:**
- ✅ Performance trend analysis
- ✅ Risk assessment reporting  
- ✅ Custom report generation
- ✅ Advanced analytics dashboard

### Phase 5: Financial Management (Weeks 11-12) 🟢 NICE TO HAVE
**Priority**: Nice to Have - Completes full feature set

#### Week 11: Rate Card Management
- **Day 1-2**: Rate card data model and service
- **Day 3-4**: Rate card management API
- **Day 5**: Rate card UI components

#### Week 12: Financial Analytics
- **Day 1-2**: Financial performance tracking
- **Day 3-4**: Cost estimation and reporting
- **Day 5**: Integration and final testing

**Deliverables:**
- ✅ Rate card management system
- ✅ Financial performance tracking
- ✅ Cost estimation tools
- ✅ Financial reporting dashboard

---

## 6. Success Criteria & Acceptance Testing

### 6.1 Critical Success Criteria

#### 6.1.1 Document Approval Workflow (Must Have)
- [ ] **Workflow Completion**: Documents progress through all approval stages automatically
- [ ] **SLA Compliance**: 95% of approvals completed within 24-hour SLA
- [ ] **Escalation Functionality**: Overdue approvals automatically escalate to managers
- [ ] **Batch Operations**: Approvers can process multiple documents simultaneously
- [ ] **Audit Trail**: Complete approval history with approver identity and timestamps

#### 6.1.2 External API Integration (Must Have)
- [ ] **CIPC Integration**: Company registration verification with 99% uptime
- [ ] **SARS Integration**: Tax compliance verification with proper error handling
- [ ] **SANAS Integration**: B-BBEE certificate validation with real-time updates
- [ ] **Performance**: API calls complete within 10 seconds with proper timeout handling
- [ ] **Error Handling**: Graceful degradation when external APIs are unavailable

#### 6.1.3 Compliance Automation (Should Have)
- [ ] **Daily Monitoring**: Automated compliance checks run without manual intervention
- [ ] **Notification System**: Contractors receive timely expiry notifications (30/7 days)
- [ ] **Score Calculation**: Compliance scores update in real-time based on document status
- [ ] **Dashboard Accuracy**: Compliance dashboard shows accurate real-time data

### 6.2 Performance Acceptance Criteria

```typescript
// Performance Test Suite
describe('Performance Acceptance Tests', () => {
  it('should handle 1000+ concurrent users', async () => {
    const loadTest = await simulateConcurrentUsers(1000);
    expect(loadTest.averageResponseTime).toBeLessThan(2000); // 2 seconds
    expect(loadTest.errorRate).toBeLessThan(0.01); // <1% error rate
  });
  
  it('should process document uploads within SLA', async () => {
    const uploadTest = await simulateDocumentUpload(10, '10MB');
    expect(uploadTest.averageUploadTime).toBeLessThan(30000); // 30 seconds
  });
  
  it('should complete approval workflows within SLA', async () => {
    const approvalTest = await simulateApprovalWorkflow(100);
    expect(approvalTest.averageCompletionTime).toBeLessThan(86400000); // 24 hours
  });
});
```

### 6.3 Security Acceptance Criteria

- [ ] **Data Encryption**: All sensitive data encrypted at rest (AES-256) and in transit (TLS 1.3)
- [ ] **Access Control**: Role-based access control with proper permission enforcement
- [ ] **Audit Logging**: All sensitive operations logged with user identification
- [ ] **API Security**: All API endpoints protected with authentication and rate limiting
- [ ] **File Upload Security**: Document uploads scanned for viruses and malware

---

## 7. Maintenance & Operations

### 7.1 Monitoring & Alerting

#### 7.1.1 Application Performance Monitoring
```typescript
// Monitoring Configuration
const monitoringConfig = {
  // Performance Metrics
  responseTimeAlert: 2000, // ms
  errorRateAlert: 0.01, // 1%
  
  // Business Metrics  
  approvalSLAAlert: 0.95, // 95% within SLA
  complianceScoreAlert: 70, // Minimum compliance score
  
  // System Health
  databaseConnectionAlert: true,
  externalAPIAlert: true,
  
  // Custom Dashboards
  dashboards: [
    'contractor-overview',
    'approval-workflow-health', 
    'compliance-monitoring',
    'external-api-status'
  ]
};
```

#### 7.1.2 Automated Health Checks
```typescript
// Health Check Service
export class ContractorHealthCheckService {
  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks = await Promise.allSettled([
      this.checkDatabaseConnectivity(),
      this.checkExternalAPIs(),
      this.checkApprovalWorkflowHealth(),
      this.checkComplianceMonitoring(),
      this.checkFileStorageHealth()
    ]);
    
    return {
      overall: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'degraded',
      checks: checks.map((check, index) => ({
        name: this.healthCheckNames[index],
        status: check.status,
        result: check.status === 'fulfilled' ? check.value : check.reason
      })),
      timestamp: new Date()
    };
  }
}
```

### 7.2 Data Backup & Recovery

#### 7.2.1 Backup Strategy
- **Database Backups**: Daily automated backups with 30-day retention
- **Document Storage**: Real-time replication with versioning
- **Configuration Backups**: Weekly configuration snapshots
- **Disaster Recovery**: RTO 4 hours, RPO 1 hour

#### 7.2.2 Data Migration & Upgrades
```sql
-- Database Migration Strategy
-- Each migration includes rollback procedures
-- Version control for all schema changes
-- Zero-downtime deployment support

-- Example Migration: Add new compliance fields
BEGIN;

-- Add new columns with defaults
ALTER TABLE contractors 
  ADD COLUMN next_compliance_review TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days'),
  ADD COLUMN compliance_officer_id VARCHAR(255);

-- Populate new fields with calculated values
UPDATE contractors 
SET compliance_officer_id = 'default-compliance-officer'
WHERE compliance_officer_id IS NULL;

-- Verify migration success
SELECT COUNT(*) as migrated_records 
FROM contractors 
WHERE next_compliance_review IS NOT NULL;

COMMIT;
```

---

## 8. Conclusion & Next Steps

### 8.1 Implementation Readiness Assessment ✅

The contractors module is **ready for comprehensive implementation** with:
- **Strong Foundation**: 75% existing implementation with excellent architecture
- **Clear Requirements**: Well-defined missing features with detailed specifications
- **Test-Driven Approach**: Comprehensive testing strategy for quality assurance
- **Phased Delivery**: Risk-managed implementation with clear priorities

### 8.2 Critical Path Dependencies

**Immediate Blockers** (Must resolve for production):
1. **Document Approval Workflow** - Core business process
2. **External API Integration** - Compliance automation dependency
3. **Comprehensive Testing** - Quality assurance requirement

**Success Enablers**:
- Existing Neon database schema excellence
- Well-architected service layer
- Comprehensive API endpoint planning
- Strong development team capabilities

### 8.3 Recommended Implementation Approach

1. **Start with Phase 1 immediately** - Document approval workflow is critical path
2. **Parallel development** - Begin API integration setup during Phase 1
3. **TDD throughout** - Implement comprehensive testing from day one
4. **Incremental deployment** - Deploy phases as they complete for faster value delivery

### 8.4 Success Probability: HIGH ⭐⭐⭐⭐⭐

Based on analysis:
- **Technical Risk**: LOW (excellent foundation exists)
- **Requirements Risk**: LOW (well-defined specifications)  
- **Timeline Risk**: MEDIUM (aggressive 12-week timeline)
- **Quality Risk**: LOW (TDD approach with high coverage requirements)

---

**Final Assessment**: This PRD provides a complete roadmap to transform the contractors module from 75% to 100% implementation with production-ready enterprise features. The API-first architecture with Neon database integration ensures scalable, maintainable, and high-performance contractor management capabilities.

**Recommended Action**: ✅ PROCEED WITH IMPLEMENTATION

---

**Document Control:**
- Implementation PRD: Complete and Ready ✅
- API Specifications: Comprehensive and Detailed ✅  
- TDD Strategy: Defined with Coverage Requirements ✅
- Timeline: Realistic 12-week Phased Approach ✅
- Next Step: Begin Phase 1 Implementation ✅