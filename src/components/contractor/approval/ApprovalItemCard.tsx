/**
 * ApprovalItemCard - Individual approval item card component
 * Displays approval item details with actions and SLA indicators
 * Following VelocityFibre theme and accessibility standards
 */

import React, { useState } from 'react';
import {
  Check,
  X,
  Eye,
  Download,
  Clock,
  AlertTriangle,
  FileText,
  Building,
  Calendar,
  Zap,
  Flag
} from 'lucide-react';
import type { ApprovalItem } from './ApprovalQueueComponent';

interface ApprovalItemCardProps {
  item: ApprovalItem;
  isSelected: boolean;
  onSelect: (itemId: string) => void;
  onApprove: (item: ApprovalItem) => void;
  onReject: (item: ApprovalItem, reason: string) => void;
  onPreview: (item: ApprovalItem) => void;
  className?: string;
}

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  documentName: string;
}

function RejectionModal({ isOpen, onClose, onConfirm, documentName }: RejectionModalProps) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const predefinedReasons = [
    'Document is incomplete or missing required information',
    'Document quality is insufficient for review',
    'Document appears to be outdated or expired',
    'Document does not match required format or standards',
    'Additional documentation required before approval',
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
              Reject Document
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Rejecting: <span className="font-medium">{documentName}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
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
                  placeholder="Please specify the reason for rejection..."
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
                Reject Document
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function ApprovalItemCard({
  item,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onPreview,
  className = ''
}: ApprovalItemCardProps) {
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Priority styling
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'critical':
        return {
          badge: 'bg-red-100 text-red-800 border border-red-200',
          card: 'velocity-neon-laser',
          icon: 'text-red-600'
        };
      case 'urgent':
        return {
          badge: 'bg-orange-100 text-orange-800 border border-orange-200',
          card: 'velocity-elevation-3',
          icon: 'text-orange-600'
        };
      case 'high':
        return {
          badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
          card: 'velocity-elevation-2',
          icon: 'text-yellow-600'
        };
      case 'normal':
        return {
          badge: 'bg-blue-100 text-blue-800 border border-blue-200',
          card: 'velocity-elevation-1',
          icon: 'text-blue-600'
        };
      case 'low':
        return {
          badge: 'bg-gray-100 text-gray-800 border border-gray-200',
          card: 'velocity-elevation-1',
          icon: 'text-gray-600'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800 border border-gray-200',
          card: 'velocity-elevation-1',
          icon: 'text-gray-600'
        };
    }
  };

  // Time remaining formatting
  const formatTimeRemaining = (hours: number) => {
    if (hours <= 0) return 'Overdue';
    if (hours < 1) return `${Math.round(hours * 60)}m remaining`;
    if (hours < 24) return `${Math.round(hours)}h remaining`;
    const days = Math.round(hours / 24);
    return `${days}d remaining`;
  };

  // SLA status indicator
  const getSLAStatus = () => {
    if (item.isOverdue) {
      return {
        color: 'text-red-600',
        bg: 'bg-red-50',
        icon: AlertTriangle,
        text: 'OVERDUE'
      };
    }
    if (item.hoursRemaining <= 2) {
      return {
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        icon: Clock,
        text: 'URGENT'
      };
    }
    if (item.hoursRemaining <= 8) {
      return {
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        icon: Clock,
        text: 'DUE SOON'
      };
    }
    return {
      color: 'text-green-600',
      bg: 'bg-green-50',
      icon: Clock,
      text: 'ON TRACK'
    };
  };

  const priorityStyles = getPriorityStyles(item.priorityLevel);
  const slaStatus = getSLAStatus();
  const StatusIcon = slaStatus.icon;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(item);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    setIsProcessing(true);
    try {
      await onReject(item, reason);
    } finally {
      setIsProcessing(false);
    }
    setIsRejectionModalOpen(false);
  };

  return (
    <>
      <div className={`
        velocity-card velocity-transition-smooth
        ${priorityStyles.card}
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${className}
      `}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Selection checkbox */}
            <div className="flex-shrink-0 pt-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(item.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-label={`Select ${item.documentName} for batch operations`}
              />
            </div>

            {/* Document icon */}
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Document title and badges */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {item.documentName}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityStyles.badge}`}>
                      {item.priorityLevel.toUpperCase()}
                    </span>
                  </div>

                  {/* Document metadata */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span className="font-medium">{item.contractorCompanyName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{item.documentType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Assigned {new Date(item.assignedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Workflow stage */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Stage {item.currentStage}:</span>
                      <span>{item.stageName}</span>
                    </div>
                    {item.escalationLevel > 0 && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                        <Flag className="w-3 h-3" />
                        Escalated ({item.escalationLevel}x)
                      </div>
                    )}
                  </div>

                  {/* SLA status */}
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${slaStatus.color} ${slaStatus.bg}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span>{slaStatus.text}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatTimeRemaining(item.hoursRemaining)}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreview(item)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Preview Document"
                    aria-label={`Preview ${item.documentName}`}
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => window.open(`/api/documents/${item.documentId}/download`, '_blank')}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Download Document"
                    aria-label={`Download ${item.documentName}`}
                  >
                    <Download className="w-5 h-5" />
                  </button>

                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="velocity-button-primary bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                    aria-label={`Approve ${item.documentName}`}
                  >
                    <Check className="w-4 h-4" />
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </button>

                  <button
                    onClick={() => setIsRejectionModalOpen(true)}
                    disabled={isProcessing}
                    className="velocity-button-primary bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                    aria-label={`Reject ${item.documentName}`}
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Urgency indicator for critical items */}
          {item.priorityLevel === 'critical' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Critical Priority</span>
                <span className="text-sm text-red-700">- Requires immediate attention</span>
              </div>
            </div>
          )}

          {/* Additional info for overdue items */}
          {item.isOverdue && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-red-800">SLA Breach</span>
                  <p className="text-sm text-red-700 mt-1">
                    This item was due on {new Date(item.slaDueDate).toLocaleString()} and is now overdue.
                    {item.escalationLevel > 0 && ` Escalation level: ${item.escalationLevel}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rejection modal */}
      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        onConfirm={handleRejectConfirm}
        documentName={item.documentName}
      />
    </>
  );
}

export default ApprovalItemCard;