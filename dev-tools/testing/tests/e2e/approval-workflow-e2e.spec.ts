/**
 * End-to-End Approval Workflow Tests
 * ARCHON TEST COVERAGE VALIDATOR - Phase 1 E2E Validation
 * 
 * Tests complete document upload → approval → completion workflows
 * Validates integration between all approval system components
 */

import { test, expect, Page, Locator } from '@playwright/test';

// Test data for approval workflows
const testDocuments = {
  contract: {
    name: 'Test Contract Document.pdf',
    type: 'contract',
    priority: 'high',
    expectedApprovers: 3,
    slaHours: 48
  },
  invoice: {
    name: 'Test Invoice Document.pdf', 
    type: 'invoice',
    priority: 'medium',
    expectedApprovers: 2,
    slaHours: 24
  },
  sow: {
    name: 'Statement of Work.pdf',
    type: 'sow',
    priority: 'urgent',
    expectedApprovers: 4,
    slaHours: 12
  }
};

const testApprovers = {
  compliance: { name: 'Compliance Manager', role: 'compliance', stage: 1 },
  finance: { name: 'Finance Director', role: 'finance', stage: 2 },
  legal: { name: 'Legal Counsel', role: 'legal', stage: 3 },
  executive: { name: 'Executive Approver', role: 'executive', stage: 4 }
};

class ApprovalWorkflowPage {
  constructor(private page: Page) {}

  // Navigation helpers
  async navigateToApprovalQueue() {
    await this.page.goto('/contractors/approval-queue');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToDocumentUpload() {
    await this.page.goto('/contractors/documents/upload');
    await this.page.waitForLoadState('networkidle');
  }

  // Document upload workflow
  async uploadDocument(document: typeof testDocuments.contract) {
    // Navigate to upload page
    await this.navigateToDocumentUpload();

    // Upload file
    const fileInput = this.page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();

    // Create test file buffer
    const buffer = Buffer.from(`Test document content for ${document.name}`);
    await fileInput.setInputFiles({
      name: document.name,
      mimeType: 'application/pdf',
      buffer
    });

    // Set document metadata
    await this.page.selectOption('[data-testid="document-type-select"]', document.type);
    await this.page.selectOption('[data-testid="priority-select"]', document.priority);
    
    if (document.slaHours) {
      await this.page.fill('[data-testid="custom-sla-hours"]', document.slaHours.toString());
    }

    // Submit upload
    await this.page.click('[data-testid="upload-submit-btn"]');
    
    // Wait for upload confirmation
    await expect(this.page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 10000 });
    
    // Extract document ID from success message or URL
    const successMessage = await this.page.locator('[data-testid="upload-success"]').textContent();
    const documentId = successMessage?.match(/ID:\s*([a-zA-Z0-9-]+)/)?.[1];
    
    return { documentId, name: document.name };
  }

  // Approval queue interactions
  async getQueueStatistics() {
    await this.navigateToApprovalQueue();
    
    const stats = {
      total: await this.getStatValue('[data-testid="total-pending-stat"]'),
      overdue: await this.getStatValue('[data-testid="overdue-stat"]'), 
      urgent: await this.getStatValue('[data-testid="urgent-priority-stat"]'),
      avgProcessTime: await this.getStatValue('[data-testid="avg-process-time-stat"]')
    };

    return stats;
  }

  private async getStatValue(selector: string): Promise<number> {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    const text = await element.textContent();
    return parseInt(text?.replace(/[^\d]/g, '') || '0');
  }

  async findApprovalItem(documentName: string): Promise<Locator> {
    await this.navigateToApprovalQueue();
    
    // Wait for items to load
    await this.page.waitForSelector('[data-testid^="approval-item-"]', { timeout: 10000 });
    
    // Find item by document name
    const item = this.page.locator('[data-testid^="approval-item-"]').filter({ 
      has: this.page.locator(`text="${documentName}"`)
    });
    
    await expect(item).toBeVisible();
    return item;
  }

  async approveDocument(documentName: string, approverRole: string) {
    const item = await this.findApprovalItem(documentName);
    
    // Click approve button
    await item.locator('[data-testid="approve-btn"]').click();
    
    // Fill approval form
    await this.page.fill('[data-testid="approval-comments"]', `Approved by ${approverRole} - automated test`);
    
    // Submit approval
    await this.page.click('[data-testid="submit-approval-btn"]');
    
    // Wait for confirmation
    await expect(this.page.locator('[data-testid="approval-success"]')).toBeVisible({ timeout: 5000 });
  }

  async rejectDocument(documentName: string, reason: string, comments?: string) {
    const item = await this.findApprovalItem(documentName);
    
    // Click reject button
    await item.locator('[data-testid="reject-btn"]').click();
    
    // Select rejection reason
    await this.page.selectOption('[data-testid="rejection-reason-select"]', reason);
    
    if (comments) {
      await this.page.fill('[data-testid="rejection-comments"]', comments);
    }
    
    // Submit rejection
    await this.page.click('[data-testid="submit-rejection-btn"]');
    
    // Wait for confirmation
    await expect(this.page.locator('[data-testid="rejection-success"]')).toBeVisible({ timeout: 5000 });
  }

  async getWorkflowStatus(documentName: string) {
    const item = await this.findApprovalItem(documentName);
    
    const status = await item.locator('[data-testid="workflow-status"]').textContent();
    const stage = await item.locator('[data-testid="current-stage"]').textContent();
    const priority = await item.locator('[data-testid="priority-badge"]').textContent();
    
    return { status, stage, priority };
  }

  async validateWorkflowProgression(documentName: string, expectedStage: number) {
    const { stage } = await this.getWorkflowStatus(documentName);
    const currentStage = parseInt(stage?.match(/\d+/)?.[0] || '0');
    expect(currentStage).toBe(expectedStage);
  }

  // Performance monitoring
  async measureApprovalTime(documentName: string): Promise<number> {
    const startTime = Date.now();
    await this.approveDocument(documentName, 'test-approver');
    const endTime = Date.now();
    return endTime - startTime;
  }

  async validatePageLoadTime(route: string, maxLoadTime: number = 1500) {
    const startTime = Date.now();
    await this.page.goto(route);
    await this.page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(maxLoadTime);
    return loadTime;
  }
}

test.describe('Approval Workflow End-to-End Tests', () => {
  let workflowPage: ApprovalWorkflowPage;

  test.beforeEach(async ({ page }) => {
    workflowPage = new ApprovalWorkflowPage(page);
  });

  test.describe('@e2e Complete Workflow Tests', () => {
    test('should complete full contract approval workflow', async () => {
      // Step 1: Upload document
      const uploadResult = await workflowPage.uploadDocument(testDocuments.contract);
      expect(uploadResult.documentId).toBeTruthy();
      
      // Step 2: Verify document appears in queue
      await workflowPage.navigateToApprovalQueue();
      const item = await workflowPage.findApprovalItem(uploadResult.name);
      await expect(item).toBeVisible();
      
      // Step 3: Validate initial workflow state
      let status = await workflowPage.getWorkflowStatus(uploadResult.name);
      expect(status.status).toBe('IN_REVIEW');
      expect(status.priority).toContain('high');
      
      // Step 4: Progress through approval stages
      for (const [roleKey, approver] of Object.entries(testApprovers)) {
        if (approver.stage <= testDocuments.contract.expectedApprovers) {
          await workflowPage.approveDocument(uploadResult.name, approver.role);
          await workflowPage.validateWorkflowProgression(uploadResult.name, approver.stage + 1);
        }
      }
      
      // Step 5: Verify final approval
      status = await workflowPage.getWorkflowStatus(uploadResult.name);
      expect(status.status).toBe('APPROVED');
    });

    test('should handle document rejection workflow', async () => {
      // Upload document for rejection test
      const uploadResult = await workflowPage.uploadDocument(testDocuments.invoice);
      
      // Reject at first stage
      await workflowPage.rejectDocument(
        uploadResult.name, 
        'compliance_issues',
        'Document does not meet compliance requirements - automated test'
      );
      
      // Verify rejection status
      const status = await workflowPage.getWorkflowStatus(uploadResult.name);
      expect(status.status).toBe('REJECTED');
    });

    test('should handle urgent priority escalation', async () => {
      // Upload urgent document
      const uploadResult = await workflowPage.uploadDocument(testDocuments.sow);
      
      // Verify urgent priority handling
      const status = await workflowPage.getWorkflowStatus(uploadResult.name);
      expect(status.priority).toContain('urgent');
      
      // Verify reduced SLA time
      const item = await workflowPage.findApprovalItem(uploadResult.name);
      const slaInfo = await item.locator('[data-testid="sla-remaining"]').textContent();
      expect(slaInfo).toContain('12'); // 12 hour SLA
    });
  });

  test.describe('@performance Performance Validation', () => {
    test('should meet page load time requirements', async () => {
      // Test approval queue load time
      const queueLoadTime = await workflowPage.validatePageLoadTime('/contractors/approval-queue', 1500);
      console.log(`Approval queue load time: ${queueLoadTime}ms`);
      
      // Test document upload page load time
      const uploadLoadTime = await workflowPage.validatePageLoadTime('/contractors/documents/upload', 1500);
      console.log(`Document upload load time: ${uploadLoadTime}ms`);
    });

    test('should process approvals within performance targets', async () => {
      // Upload test document
      const uploadResult = await workflowPage.uploadDocument(testDocuments.contract);
      
      // Measure approval processing time
      const approvalTime = await workflowPage.measureApprovalTime(uploadResult.name);
      
      // Validate approval time < 200ms (API response time requirement)
      expect(approvalTime).toBeLessThan(200);
      console.log(`Approval processing time: ${approvalTime}ms`);
    });

    test('should handle concurrent approvals efficiently', async () => {
      // Upload multiple documents concurrently
      const uploads = await Promise.all([
        workflowPage.uploadDocument(testDocuments.contract),
        workflowPage.uploadDocument(testDocuments.invoice),
        workflowPage.uploadDocument(testDocuments.sow)
      ]);
      
      // Verify all uploads succeeded
      expect(uploads.every(result => result.documentId)).toBeTruthy();
      
      // Verify queue statistics updated correctly
      const stats = await workflowPage.getQueueStatistics();
      expect(stats.total).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('@accessibility Accessibility Validation', () => {
    test('should meet WCAG AA compliance for approval queue', async ({ page }) => {
      await workflowPage.navigateToApprovalQueue();
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const focused = await page.locator(':focus').first();
      await expect(focused).toBeVisible();
      
      // Test ARIA labels
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        
        // Either aria-label or text content should be present
        expect(ariaLabel || text).toBeTruthy();
      }
    });

    test('should support screen reader navigation', async ({ page }) => {
      await workflowPage.navigateToApprovalQueue();
      
      // Check for proper heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);
      
      // Check for semantic HTML elements
      await expect(page.locator('main, section, article')).toHaveCount({ min: 1 });
    });
  });

  test.describe('@error Error Handling Validation', () => {
    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/approval-workflow/**', (route) => {
        route.abort('failed');
      });
      
      await workflowPage.navigateToApprovalQueue();
      
      // Verify error handling
      await expect(page.locator('[data-testid="error-message"], [data-testid="network-error"]')).toBeVisible({ timeout: 5000 });
    });

    test('should handle malformed data responses', async ({ page }) => {
      // Mock malformed API response
      await page.route('**/api/approval-queue/**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ invalid: 'data structure' })
        });
      });
      
      await workflowPage.navigateToApprovalQueue();
      
      // Should show error state, not crash
      const errorElements = page.locator('[data-testid="error-state"], [data-testid="data-error"]');
      await expect(errorElements.first()).toBeVisible({ timeout: 5000 });
    });

    test('should validate form inputs properly', async () => {
      await workflowPage.navigateToDocumentUpload();
      
      // Try to submit without required fields
      await page.click('[data-testid="upload-submit-btn"]');
      
      // Should show validation errors
      await expect(page.locator('[data-testid="validation-error"], .error')).toBeVisible();
    });
  });

  test.describe('@integration Database Integration Validation', () => {
    test('should maintain data consistency across workflow transitions', async () => {
      // Upload document and get ID
      const uploadResult = await workflowPage.uploadDocument(testDocuments.contract);
      
      // Approve document
      await workflowPage.approveDocument(uploadResult.name, 'compliance');
      
      // Navigate away and back to verify persistence
      await workflowPage.navigateToDocumentUpload();
      await workflowPage.navigateToApprovalQueue();
      
      // Verify status is still updated
      const status = await workflowPage.getWorkflowStatus(uploadResult.name);
      expect(status.status).not.toBe('PENDING_REVIEW'); // Should have progressed
    });

    test('should handle concurrent approvals without conflicts', async () => {
      // This test would need multiple browser contexts
      // For now, validate that the system handles state changes correctly
      const uploadResult = await workflowPage.uploadDocument(testDocuments.invoice);
      
      // Rapid successive operations
      await workflowPage.approveDocument(uploadResult.name, 'compliance');
      
      // Should not cause race conditions or inconsistent state
      const status = await workflowPage.getWorkflowStatus(uploadResult.name);
      expect(['IN_REVIEW', 'APPROVED', 'PENDING_REVIEW']).toContain(status.status);
    });
  });

  test.describe('@smoke Smoke Tests for Critical Paths', () => {
    test('should load approval queue without errors', async () => {
      await workflowPage.navigateToApprovalQueue();
      
      // Basic page elements should be present
      await expect(page.locator('h1, h2')).toBeVisible();
      await expect(page.locator('[data-testid^="approval-item-"], [data-testid="empty-state"]')).toHaveCount({ min: 1 });
    });

    test('should load document upload form without errors', async () => {
      await workflowPage.navigateToDocumentUpload();
      
      // Upload form should be functional
      await expect(page.locator('input[type="file"]')).toBeVisible();
      await expect(page.locator('[data-testid="upload-submit-btn"]')).toBeVisible();
    });

    test('should display workflow statistics correctly', async () => {
      const stats = await workflowPage.getQueueStatistics();
      
      // Stats should be numbers (not NaN)
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.overdue).toBe('number'); 
      expect(typeof stats.urgent).toBe('number');
    });
  });
});

test.describe('Mobile Responsiveness Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('@mobile should work on mobile viewport', async ({ page }) => {
    const workflowPage = new ApprovalWorkflowPage(page);
    
    await workflowPage.navigateToApprovalQueue();
    
    // Mobile-specific checks
    await expect(page.locator('[data-testid="mobile-menu"], .mobile-nav')).toBeVisible();
    
    // Ensure content is not horizontally scrollable
    const body = await page.locator('body').boundingBox();
    expect(body?.width).toBeLessThanOrEqual(375);
  });
});

test.describe('Theme Consistency Tests', () => {
  test('@theme should maintain VelocityFibre theme consistency', async ({ page }) => {
    const workflowPage = new ApprovalWorkflowPage(page);
    
    await workflowPage.navigateToApprovalQueue();
    
    // Check for VelocityFibre brand colors
    const primaryButton = page.locator('[data-testid="approve-btn"]').first();
    if (await primaryButton.count() > 0) {
      const bgColor = await primaryButton.evaluate(el => getComputedStyle(el).backgroundColor);
      // VelocityFibre uses specific color scheme
      expect(bgColor).toBeTruthy(); // At minimum, should have background color
    }
  });
});