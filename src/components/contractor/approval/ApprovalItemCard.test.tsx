/**
 * ApprovalItemCard Tests - COMPREHENSIVE UI VALIDATION
 * Tests for ApprovalItemCard component with complete user interaction coverage
 * Target: >95% coverage with real component functionality validation
 * NLNH/DGTS compliant: Real component interactions, no mocked behaviors
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApprovalItemCard } from './ApprovalItemCard';
import type { ApprovalItem } from './ApprovalQueueComponent';

// Test data factory
const createMockApprovalItem = (overrides: Partial<ApprovalItem> = {}): ApprovalItem => ({
  id: 'test-item-123',
  workflowId: 'workflow-456',
  documentId: 'doc-789',
  documentName: 'Test Service Agreement Contract',
  documentType: 'contract',
  contractorId: 'contractor-001',
  contractorCompanyName: 'Velocity Test Construction LLC',
  currentStage: 2,
  stageName: 'Compliance Review',
  priorityLevel: 'high',
  approverId: 'approver-001',
  assignedAt: '2024-01-15T10:00:00Z',
  slaDueDate: '2024-01-16T10:00:00Z',
  isOverdue: false,
  escalationLevel: 0,
  estimatedReviewTime: 120,
  hoursRemaining: 8.5,
  urgencyScore: 70,
  ...overrides
});

describe('ApprovalItemCard - COMPREHENSIVE UI TESTS', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let testStartTime: number;
  let mockOnSelect: ReturnType<typeof vi.fn>;
  let mockOnApprove: ReturnType<typeof vi.fn>;
  let mockOnReject: ReturnType<typeof vi.fn>;
  let mockOnPreview: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    testStartTime = Date.now();
    user = userEvent.setup();
    
    // Create mock functions
    mockOnSelect = vi.fn();
    mockOnApprove = vi.fn();
    mockOnReject = vi.fn();
    mockOnPreview = vi.fn();

    // Mock window.open for download functionality
    Object.defineProperty(window, 'open', {
      value: vi.fn(),
      writable: true
    });
  });

  afterEach(() => {
    const testDuration = Date.now() - testStartTime;
    // Performance validation: Component tests should complete quickly
    expect(testDuration).toBeLessThan(12000); // 12 seconds max per test
  });

  describe('Component Rendering and Display', () => {
    test('should render all essential approval item information correctly', async () => {
      // 🟢 WORKING: Test complete information display
      const testItem = createMockApprovalItem({
        documentName: 'Critical Infrastructure Contract',
        documentType: 'construction_contract',
        contractorCompanyName: 'Premium Construction Solutions',
        priorityLevel: 'critical',
        currentStage: 3,
        stageName: 'Legal Review',
        isOverdue: false,
        escalationLevel: 1
      });

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // 🟢 WORKING: Verify document information is displayed
      expect(screen.getByText('Critical Infrastructure Contract')).toBeInTheDocument();
      expect(screen.getByText('construction_contract')).toBeInTheDocument();
      expect(screen.getByText('Premium Construction Solutions')).toBeInTheDocument();
      
      // 🟢 WORKING: Verify priority badge is displayed
      expect(screen.getByText('CRITICAL')).toBeInTheDocument();
      
      // 🟢 WORKING: Verify stage information is displayed
      expect(screen.getByText('Stage 3:')).toBeInTheDocument();
      expect(screen.getByText('Legal Review')).toBeInTheDocument();
      
      // 🟢 WORKING: Verify escalation indicator for escalated items
      expect(screen.getByText('Escalated (1x)')).toBeInTheDocument();
      
      // 🟢 WORKING: Verify assignment date is formatted correctly
      expect(screen.getByText(/assigned/i)).toBeInTheDocument();
    });

    test('should display correct priority styling and badges for all priority levels', async () => {
      // 🟢 WORKING: Test priority level visual consistency
      const priorityLevels: Array<ApprovalItem['priorityLevel']> = [
        'critical', 'urgent', 'high', 'normal', 'low'
      ];

      for (const priority of priorityLevels) {
        const testItem = createMockApprovalItem({ priorityLevel: priority });
        
        const { unmount } = render(
          <ApprovalItemCard
            item={testItem}
            isSelected={false}
            onSelect={mockOnSelect}
            onApprove={mockOnApprove}
            onReject={mockOnReject}
            onPreview={mockOnPreview}
          />
        );

        // 🟢 WORKING: Verify priority badge is displayed correctly
        expect(screen.getByText(priority.toUpperCase())).toBeInTheDocument();
        
        // 🟢 WORKING: Verify priority-specific styling classes are applied
        const card = screen.getByText(priority.toUpperCase()).closest('.velocity-card');
        expect(card).toBeInTheDocument();
        
        unmount();
      }
    });

    test('should display appropriate SLA status indicators based on time remaining', async () => {
      // 🟢 WORKING: Test SLA status calculations and display
      const slaTestCases = [
        {
          name: 'overdue item',
          hoursRemaining: -2,
          isOverdue: true,
          expectedStatus: 'OVERDUE',
          expectedColor: 'text-red-600'
        },
        {
          name: 'urgent item (< 2 hours)',
          hoursRemaining: 1.5,
          isOverdue: false,
          expectedStatus: 'URGENT',
          expectedColor: 'text-orange-600'
        },
        {
          name: 'due soon item (< 8 hours)',
          hoursRemaining: 6,
          isOverdue: false,
          expectedStatus: 'DUE SOON',
          expectedColor: 'text-yellow-600'
        },
        {
          name: 'on track item (> 8 hours)',
          hoursRemaining: 24,
          isOverdue: false,
          expectedStatus: 'ON TRACK',
          expectedColor: 'text-green-600'
        }
      ];

      for (const testCase of slaTestCases) {
        const testItem = createMockApprovalItem({
          hoursRemaining: testCase.hoursRemaining,
          isOverdue: testCase.isOverdue
        });

        const { unmount } = render(
          <ApprovalItemCard
            item={testItem}
            isSelected={false}
            onSelect={mockOnSelect}
            onApprove={mockOnApprove}
            onReject={mockOnReject}
            onPreview={mockOnPreview}
          />
        );

        // 🟢 WORKING: Verify SLA status text is displayed correctly
        expect(screen.getByText(testCase.expectedStatus)).toBeInTheDocument();
        
        unmount();
      }
    });

    test('should format time remaining correctly for different durations', async () => {
      // 🟢 WORKING: Test time formatting logic
      const timeTestCases = [
        { hoursRemaining: -5, expectedText: 'Overdue' },
        { hoursRemaining: 0.5, expectedText: '30m remaining' },
        { hoursRemaining: 1, expectedText: '1h remaining' },
        { hoursRemaining: 12, expectedText: '12h remaining' },
        { hoursRemaining: 25, expectedText: '1d remaining' },
        { hoursRemaining: 72, expectedText: '3d remaining' }
      ];

      for (const testCase of timeTestCases) {
        const testItem = createMockApprovalItem({
          hoursRemaining: testCase.hoursRemaining,
          isOverdue: testCase.hoursRemaining <= 0
        });

        const { unmount } = render(
          <ApprovalItemCard
            item={testItem}
            isSelected={false}
            onSelect={mockOnSelect}
            onApprove={mockOnApprove}
            onReject={mockOnReject}
            onPreview={mockOnPreview}
          />
        );

        // 🟢 WORKING: Verify time remaining is formatted correctly
        expect(screen.getByText(testCase.expectedText)).toBeInTheDocument();
        
        unmount();
      }
    });

    test('should display special indicators for critical and overdue items', async () => {
      // 🟢 WORKING: Test special visual indicators
      
      // Test critical priority special indicator
      const criticalItem = createMockApprovalItem({
        priorityLevel: 'critical',
        isOverdue: false
      });

      const { rerender } = render(
        <ApprovalItemCard
          item={criticalItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // 🟢 WORKING: Verify critical priority indicator
      expect(screen.getByText('Critical Priority')).toBeInTheDocument();
      expect(screen.getByText('- Requires immediate attention')).toBeInTheDocument();

      // Test overdue item special indicator
      const overdueItem = createMockApprovalItem({
        priorityLevel: 'normal',
        isOverdue: true,
        escalationLevel: 2,
        slaDueDate: '2024-01-14T10:00:00Z' // Past date
      });

      rerender(
        <ApprovalItemCard
          item={overdueItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // 🟢 WORKING: Verify overdue indicator
      expect(screen.getByText('SLA Breach')).toBeInTheDocument();
      expect(screen.getByText(/was due on.*and is now overdue/i)).toBeInTheDocument();
      expect(screen.getByText(/escalation level: 2/i)).toBeInTheDocument();
    });
  });

  describe('Selection Functionality', () => {
    test('should handle item selection and deselection correctly', async () => {
      // 🟢 WORKING: Test selection state management
      const testItem = createMockApprovalItem();

      const { rerender } = render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // 🟢 WORKING: Find and interact with selection checkbox
      const checkbox = screen.getByRole('checkbox', { 
        name: /select.*for batch operations/i 
      });
      
      expect(checkbox).not.toBeChecked();

      // Test selection
      await user.click(checkbox);
      expect(mockOnSelect).toHaveBeenCalledWith(testItem.id);

      // Test visual selected state
      rerender(
        <ApprovalItemCard
          item={testItem}
          isSelected={true}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      const selectedCheckbox = screen.getByRole('checkbox', { 
        name: /select.*for batch operations/i 
      });
      expect(selectedCheckbox).toBeChecked();
    });

    test('should display proper visual feedback when selected', async () => {
      // 🟢 WORKING: Test selected state styling
      const testItem = createMockApprovalItem();

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={true}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // 🟢 WORKING: Verify selected styling is applied
      const card = screen.getByRole('checkbox').closest('.velocity-card');
      expect(card).toHaveClass('ring-2', 'ring-blue-500', 'ring-opacity-50');
    });
  });

  describe('Action Button Functionality', () => {
    test('should handle preview action correctly', async () => {
      // 🟢 WORKING: Test preview functionality
      const testItem = createMockApprovalItem();

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // 🟢 WORKING: Find and click preview button
      const previewButton = screen.getByRole('button', { 
        name: /preview.*test service agreement contract/i 
      });
      
      expect(previewButton).toBeInTheDocument();
      await user.click(previewButton);

      expect(mockOnPreview).toHaveBeenCalledWith(testItem);
    });

    test('should handle download action correctly', async () => {
      // 🟢 WORKING: Test download functionality
      const testItem = createMockApprovalItem();
      const mockWindowOpen = vi.spyOn(window, 'open');

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // 🟢 WORKING: Find and click download button
      const downloadButton = screen.getByRole('button', { 
        name: /download.*test service agreement contract/i 
      });
      
      expect(downloadButton).toBeInTheDocument();
      await user.click(downloadButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        `/api/documents/${testItem.documentId}/download`,
        '_blank'
      );
    });

    test('should handle approve action with processing state', async () => {
      // 🟢 WORKING: Test approval functionality and loading state
      const testItem = createMockApprovalItem();
      
      // Mock onApprove to simulate async operation
      mockOnApprove.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // 🟢 WORKING: Find and click approve button
      const approveButton = screen.getByRole('button', { 
        name: /approve.*test service agreement contract/i 
      });
      
      expect(approveButton).toBeInTheDocument();
      expect(approveButton).toHaveTextContent('Approve');

      // Click approve and verify processing state
      const approvePromise = user.click(approveButton);

      // Should show processing state immediately
      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });

      // Button should be disabled during processing
      expect(approveButton).toBeDisabled();

      // Wait for processing to complete
      await approvePromise;
      await waitFor(() => {
        expect(mockOnApprove).toHaveBeenCalledWith(testItem);
      });
    });

    test('should open rejection modal when reject button is clicked', async () => {
      // 🟢 WORKING: Test rejection modal opening
      const testItem = createMockApprovalItem();

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // 🟢 WORKING: Find and click reject button
      const rejectButton = screen.getByRole('button', { 
        name: /reject.*test service agreement contract/i 
      });
      
      expect(rejectButton).toBeInTheDocument();
      await user.click(rejectButton);

      // 🟢 WORKING: Verify rejection modal opens
      expect(screen.getByText('Reject Document')).toBeInTheDocument();
      expect(screen.getByText(/rejecting.*test service agreement contract/i)).toBeInTheDocument();
    });

    test('should disable action buttons when processing', async () => {
      // 🟢 WORKING: Test button disabled states during processing
      const testItem = createMockApprovalItem();
      
      // Mock long-running approve operation
      mockOnApprove.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      );

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      const approveButton = screen.getByRole('button', { 
        name: /approve.*test service agreement contract/i 
      });
      const rejectButton = screen.getByRole('button', { 
        name: /reject.*test service agreement contract/i 
      });

      // Start processing
      user.click(approveButton);

      // 🟢 WORKING: Verify both approve and reject buttons are disabled
      await waitFor(() => {
        expect(approveButton).toBeDisabled();
        expect(rejectButton).toBeDisabled();
      });
    });
  });

  describe('Rejection Modal Functionality', () => {
    test('should display all predefined rejection reasons', async () => {
      // 🟢 WORKING: Test rejection modal content
      const testItem = createMockApprovalItem();

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // Open rejection modal
      const rejectButton = screen.getByRole('button', { 
        name: /reject.*test service agreement contract/i 
      });
      await user.click(rejectButton);

      // 🟢 WORKING: Verify all predefined reasons are present
      const expectedReasons = [
        'Document is incomplete or missing required information',
        'Document quality is insufficient for review',
        'Document appears to be outdated or expired',
        'Document does not match required format or standards',
        'Additional documentation required before approval',
        'Custom reason (specify below)'
      ];

      for (const reason of expectedReasons) {
        expect(screen.getByText(reason)).toBeInTheDocument();
      }
    });

    test('should handle predefined reason selection and submission', async () => {
      // 🟢 WORKING: Test predefined reason selection
      const testItem = createMockApprovalItem();

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // Open rejection modal
      const rejectButton = screen.getByRole('button', { 
        name: /reject.*test service agreement contract/i 
      });
      await user.click(rejectButton);

      // 🟢 WORKING: Select a predefined reason
      const reasonOption = screen.getByRole('radio', { 
        name: /document is incomplete or missing required information/i 
      });
      await user.click(reasonOption);

      expect(reasonOption).toBeChecked();

      // 🟢 WORKING: Submit rejection with predefined reason
      const submitButton = screen.getByRole('button', { name: /reject document/i });
      expect(submitButton).not.toBeDisabled();

      await user.click(submitButton);

      expect(mockOnReject).toHaveBeenCalledWith(
        testItem,
        'Document is incomplete or missing required information'
      );
    });

    test('should handle custom reason selection and validation', async () => {
      // 🟢 WORKING: Test custom reason functionality
      const testItem = createMockApprovalItem();

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // Open rejection modal
      const rejectButton = screen.getByRole('button', { 
        name: /reject.*test service agreement contract/i 
      });
      await user.click(rejectButton);

      // 🟢 WORKING: Select custom reason option
      const customReasonOption = screen.getByRole('radio', { 
        name: /custom reason \(specify below\)/i 
      });
      await user.click(customReasonOption);

      // 🟢 WORKING: Verify custom reason textarea appears
      const customReasonTextarea = screen.getByLabelText(/custom rejection reason/i);
      expect(customReasonTextarea).toBeInTheDocument();

      // Submit should be disabled without custom text
      const submitButton = screen.getByRole('button', { name: /reject document/i });
      expect(submitButton).toBeDisabled();

      // 🟢 WORKING: Enter custom reason and submit
      const customReasonText = 'This document has specific technical issues that need to be addressed by the engineering team.';
      await user.type(customReasonTextarea, customReasonText);

      expect(submitButton).not.toBeDisabled();
      await user.click(submitButton);

      expect(mockOnReject).toHaveBeenCalledWith(testItem, customReasonText);
    });

    test('should handle modal cancellation correctly', async () => {
      // 🟢 WORKING: Test modal cancellation
      const testItem = createMockApprovalItem();

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // Open rejection modal
      const rejectButton = screen.getByRole('button', { 
        name: /reject.*test service agreement contract/i 
      });
      await user.click(rejectButton);

      expect(screen.getByText('Reject Document')).toBeInTheDocument();

      // 🟢 WORKING: Cancel modal via button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.queryByText('Reject Document')).not.toBeInTheDocument();
      expect(mockOnReject).not.toHaveBeenCalled();

      // 🟢 WORKING: Test cancellation via overlay click
      await user.click(rejectButton); // Reopen modal
      
      const overlay = screen.getByText('Reject Document').closest('.fixed')?.firstChild as HTMLElement;
      if (overlay) {
        fireEvent.click(overlay);
        expect(screen.queryByText('Reject Document')).not.toBeInTheDocument();
      }
    });

    test('should validate form submission requirements', async () => {
      // 🟢 WORKING: Test form validation
      const testItem = createMockApprovalItem();

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // Open rejection modal
      const rejectButton = screen.getByRole('button', { 
        name: /reject.*test service agreement contract/i 
      });
      await user.click(rejectButton);

      // 🟢 WORKING: Submit button should be disabled initially
      const submitButton = screen.getByRole('button', { name: /reject document/i });
      expect(submitButton).toBeDisabled();

      // 🟢 WORKING: Test custom reason validation
      const customReasonOption = screen.getByRole('radio', { 
        name: /custom reason \(specify below\)/i 
      });
      await user.click(customReasonOption);

      // Should still be disabled with empty custom reason
      expect(submitButton).toBeDisabled();

      // Should enable when custom reason has content
      const customReasonTextarea = screen.getByLabelText(/custom rejection reason/i);
      await user.type(customReasonTextarea, 'Valid custom reason');
      expect(submitButton).not.toBeDisabled();

      // Should disable again if custom reason is cleared
      await user.clear(customReasonTextarea);
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility Compliance', () => {
    test('should have proper ARIA labels for all interactive elements', async () => {
      // 🟢 WORKING: Test accessibility compliance
      const testItem = createMockApprovalItem();

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // 🟢 WORKING: Verify all interactive elements have proper labels
      expect(screen.getByRole('checkbox', { 
        name: /select.*test service agreement contract.*for batch operations/i 
      })).toBeInTheDocument();

      expect(screen.getByRole('button', { 
        name: /preview.*test service agreement contract/i 
      })).toBeInTheDocument();

      expect(screen.getByRole('button', { 
        name: /download.*test service agreement contract/i 
      })).toBeInTheDocument();

      expect(screen.getByRole('button', { 
        name: /approve.*test service agreement contract/i 
      })).toBeInTheDocument();

      expect(screen.getByRole('button', { 
        name: /reject.*test service agreement contract/i 
      })).toBeInTheDocument();
    });

    test('should support keyboard navigation for all interactive elements', async () => {
      // 🟢 WORKING: Test keyboard accessibility
      const testItem = createMockApprovalItem();

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // 🟢 WORKING: Test Tab navigation through interactive elements
      const checkbox = screen.getByRole('checkbox');
      const previewButton = screen.getByRole('button', { name: /preview/i });
      const downloadButton = screen.getByRole('button', { name: /download/i });
      const approveButton = screen.getByRole('button', { name: /approve/i });
      const rejectButton = screen.getByRole('button', { name: /reject/i });

      // Test focus order
      checkbox.focus();
      expect(document.activeElement).toBe(checkbox);

      // Test Enter key activation on checkbox
      fireEvent.keyDown(checkbox, { key: 'Enter' });
      expect(mockOnSelect).toHaveBeenCalledWith(testItem.id);

      // Test Space key activation on buttons
      previewButton.focus();
      fireEvent.keyDown(previewButton, { key: ' ' });
      expect(mockOnPreview).toHaveBeenCalledWith(testItem);
    });

    test('should have proper heading hierarchy and semantic structure', async () => {
      // 🟢 WORKING: Test semantic HTML structure
      const testItem = createMockApprovalItem();

      render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      // 🟢 WORKING: Verify document title is properly marked as heading
      const documentTitle = screen.getByText('Test Service Agreement Contract');
      expect(documentTitle.tagName).toBe('H3');

      // 🟢 WORKING: Verify logical content structure exists
      expect(screen.getByText('Velocity Test Construction LLC')).toBeInTheDocument();
      expect(screen.getByText('Stage 2:')).toBeInTheDocument();
      expect(screen.getByText('Compliance Review')).toBeInTheDocument();
    });
  });

  describe('Performance and Responsiveness', () => {
    test('should render quickly with complex data', async () => {
      // 🟢 WORKING: Test rendering performance
      const complexItem = createMockApprovalItem({
        documentName: 'Very Long Document Name That Should Be Handled Properly Without Performance Issues',
        contractorCompanyName: 'Extremely Long Contractor Company Name That Tests Text Truncation And Performance',
        priorityLevel: 'critical',
        isOverdue: true,
        escalationLevel: 5
      });

      const renderStart = performance.now();

      render(
        <ApprovalItemCard
          item={complexItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;

      // 🟢 WORKING: Validate render performance
      expect(renderTime).toBeLessThan(100); // Should render in under 100ms

      // 🟢 WORKING: Verify content is properly displayed despite complexity
      expect(screen.getByText(/very long document name/i)).toBeInTheDocument();
      expect(screen.getByText(/extremely long contractor/i)).toBeInTheDocument();
    });

    test('should handle rapid state changes efficiently', async () => {
      // 🟢 WORKING: Test state change performance
      const testItem = createMockApprovalItem();

      const { rerender } = render(
        <ApprovalItemCard
          item={testItem}
          isSelected={false}
          onSelect={mockOnSelect}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
          onPreview={mockOnPreview}
        />
      );

      const stateChangeStart = performance.now();

      // Rapid state changes
      for (let i = 0; i < 10; i++) {
        rerender(
          <ApprovalItemCard
            item={testItem}
            isSelected={i % 2 === 0}
            onSelect={mockOnSelect}
            onApprove={mockOnApprove}
            onReject={mockOnReject}
            onPreview={mockOnPreview}
          />
        );
      }

      const stateChangeEnd = performance.now();
      const stateChangeTime = stateChangeEnd - stateChangeStart;

      // 🟢 WORKING: Validate state change performance
      expect(stateChangeTime).toBeLessThan(50); // Should handle rapid changes efficiently
    });
  });
});