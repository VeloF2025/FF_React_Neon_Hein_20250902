/**
 * Test Page for Approval Queue Components
 * 
 * This page is for testing the approval queue UI components
 * with real API integration and accessibility validation
 */

import React from 'react';
import { ApprovalQueueComponent } from '@/components/contractor/approval';

export default function TestApprovalQueuePage() {
  const handleItemApproved = (item: any) => {
    console.log('Item approved:', item);
  };

  const handleItemRejected = (item: any) => {
    console.log('Item rejected:', item);
  };

  const handleBatchOperationComplete = (operation: string, items: any[]) => {
    console.log('Batch operation completed:', operation, items);
  };

  return (
    <div className="min-h-screen velocity-gradient-ambient p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Approval Queue Test Environment
          </h1>
          <p className="text-gray-600">
            Testing approval queue components with real API integration
          </p>
        </div>

        <ApprovalQueueComponent
          approverUserId="test-approver-1"
          isAdmin={false}
          onItemApproved={handleItemApproved}
          onItemRejected={handleItemRejected}
          onBatchOperationComplete={handleBatchOperationComplete}
          className="max-w-full"
        />
      </div>
    </div>
  );
}