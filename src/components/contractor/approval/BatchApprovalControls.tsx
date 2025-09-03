/**
 * BatchApprovalControls - Bulk operations component for approval queue
 * Provides batch approve, reject, and reassign functionality
 * Following VelocityFibre theme and accessibility standards
 */

import React, { useState } from 'react';
import {
  Check,
  X,
  UserCheck,
  AlertTriangle,
  ChevronDown,
  Users,
  Zap,
  Clock
} from 'lucide-react';

interface BatchApprovalControlsProps {
  selectedItems: string[];
  onBatchApprove: (itemIds: string[]) => Promise<void>;
  onBatchReject?: (itemIds: string[], reason: string) => Promise<void>;
  onBatchReassign?: (itemIds: string[], newApproverId: string) => Promise<void>;
  onDeselectAll: () => void;
  isLoading: boolean;
  className?: string;
}

interface BatchRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  selectedCount: number;
}

interface BatchReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (approverId: string, reason: string) => void;
  selectedCount: number;
}

function BatchRejectModal({ isOpen, onClose, onConfirm, selectedCount }: BatchRejectModalProps) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const predefinedReasons = [
    'Documents are incomplete or missing required information',
    'Document quality is insufficient for review',
    'Documents appear to be outdated or expired',
    'Documents do not match required format or standards',
    'Additional documentation required before approval',
    'Batch rejected for administrative reasons',
    'Custom reason (specify below)'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Custom reason (specify below)' ? customReason : reason;
    if (finalReason.trim()) {
      onConfirm(finalReason);
      setReason('');
      setCustomReason('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom velocity-glass-medium rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <X className="w-5 h-5 text-red-500" />
              Batch Reject Documents
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              You are about to reject <span className="font-medium">{selectedCount}</span> documents.
              This action cannot be undone.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for batch rejection <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {predefinedReasons.map((reasonOption) => (
                  <label key={reasonOption} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      value={reasonOption}
                      checked={reason === reasonOption}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{reasonOption}</span>
                  </label>
                ))}
              </div>
            </div>

            {reason === 'Custom reason (specify below)' && (
              <div>
                <label htmlFor="custom-reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom rejection reason
                </label>
                <textarea
                  id="custom-reason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Please specify the reason for batch rejection..."
                  required
                />
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!reason.trim() || (reason === 'Custom reason (specify below)' && !customReason.trim())}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reject {selectedCount} Documents
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function BatchReassignModal({ isOpen, onClose, onConfirm, selectedCount }: BatchReassignModalProps) {
  const [selectedApproverId, setSelectedApproverId] = useState('');
  const [reason, setReason] = useState('');

  // Mock approver data - in real implementation, this would come from props or API
  const availableApprovers = [
    { id: 'compliance-officer-1', name: 'Sarah Johnson', role: 'Compliance Officer', department: 'Compliance' },
    { id: 'compliance-manager-1', name: 'Mike Chen', role: 'Compliance Manager', department: 'Compliance' },
    { id: 'legal-reviewer-1', name: 'Emma Davis', role: 'Legal Reviewer', department: 'Legal' },
    { id: 'operations-manager-1', name: 'David Rodriguez', role: 'Operations Manager', department: 'Operations' },
    { id: 'senior-reviewer-1', name: 'Lisa Thompson', role: 'Senior Reviewer', department: 'Quality' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedApproverId && reason.trim()) {
      onConfirm(selectedApproverId, reason);
      setSelectedApproverId('');
      setReason('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom velocity-glass-medium rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              Batch Reassign Documents
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Reassign <span className="font-medium">{selectedCount}</span> documents to a different approver.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="approver-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select new approver <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="approver-select"
                  value={selectedApproverId}
                  onChange={(e) => setSelectedApproverId(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an approver...</option>
                  {availableApprovers.map(approver => (
                    <option key={approver.id} value={approver.id}>
                      {approver.name} - {approver.role} ({approver.department})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="reassign-reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for reassignment <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reassign-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Please specify the reason for reassignment (e.g., workload balancing, expertise requirements, etc.)..."
                required
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedApproverId || !reason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reassign {selectedCount} Documents
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function BatchApprovalControls({
  selectedItems,
  onBatchApprove,
  onBatchReject,
  onBatchReassign,
  onDeselectAll,
  isLoading,
  className = ''
}: BatchApprovalControlsProps) {
  const [showBatchRejectModal, setShowBatchRejectModal] = useState(false);
  const [showBatchReassignModal, setShowBatchReassignModal] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const selectedCount = selectedItems.length;

  const handleBatchApprove = async () => {
    setProcessing('approve');
    try {
      await onBatchApprove(selectedItems);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Batch approve failed:', error);
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleBatchRejectConfirm = async (reason: string) => {
    if (onBatchReject) {
      setProcessing('reject');
      try {
        await onBatchReject(selectedItems, reason);
        setShowBatchRejectModal(false);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Batch reject failed:', error);
        }
      } finally {
        setProcessing(null);
      }
    }
  };

  const handleBatchReassignConfirm = async (approverId: string, _reason: string) => {
    if (onBatchReassign) {
      setProcessing('reassign');
      try {
        await onBatchReassign(selectedItems, approverId);
        setShowBatchReassignModal(false);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Batch reassign failed:', error);
        }
      } finally {
        setProcessing(null);
      }
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className={`velocity-glass-light border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Selection info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>
            <button
              onClick={onDeselectAll}
              className="text-sm text-blue-600 hover:text-blue-500 underline"
              disabled={isLoading || !!processing}
            >
              Deselect all
            </button>
          </div>

          {/* Batch action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchApprove}
              disabled={isLoading || !!processing}
              className="velocity-button-primary bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
              aria-label={`Batch approve ${selectedCount} documents`}
            >
              {processing === 'approve' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Approve All ({selectedCount})
                </>
              )}
            </button>

            {onBatchReject && (
              <button
                onClick={() => setShowBatchRejectModal(true)}
                disabled={isLoading || !!processing}
                className="velocity-button-primary bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                aria-label={`Batch reject ${selectedCount} documents`}
              >
                {processing === 'reject' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Reject All ({selectedCount})
                  </>
                )}
              </button>
            )}

            {onBatchReassign && (
              <button
                onClick={() => setShowBatchReassignModal(true)}
                disabled={isLoading || !!processing}
                className="velocity-button-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                aria-label={`Batch reassign ${selectedCount} documents`}
              >
                {processing === 'reassign' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Reassign ({selectedCount})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Batch operation warnings */}
        <div className="mt-3 space-y-2">
          {selectedCount >= 10 && (
            <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-orange-800">Large batch operation:</span>
                <span className="text-orange-700 ml-1">
                  Processing {selectedCount} items may take several minutes.
                </span>
              </div>
            </div>
          )}

          {selectedCount >= 50 && (
            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
              <Zap className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-red-800">Very large batch:</span>
                <span className="text-red-700 ml-1">
                  Consider processing in smaller batches for better performance and reliability.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick stats for selected items */}
        <div className="mt-3 text-xs text-gray-500 border-t border-gray-200 pt-3">
          <span>Batch operations will be processed sequentially with progress tracking.</span>
          {processing && (
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3" />
              <span>Processing {processing} operation for {selectedCount} items...</span>
            </div>
          )}
        </div>
      </div>

      {/* Batch reject modal */}
      <BatchRejectModal
        isOpen={showBatchRejectModal}
        onClose={() => setShowBatchRejectModal(false)}
        onConfirm={handleBatchRejectConfirm}
        selectedCount={selectedCount}
      />

      {/* Batch reassign modal */}
      <BatchReassignModal
        isOpen={showBatchReassignModal}
        onClose={() => setShowBatchReassignModal(false)}
        onConfirm={handleBatchReassignConfirm}
        selectedCount={selectedCount}
      />
    </>
  );
}

export default BatchApprovalControls;