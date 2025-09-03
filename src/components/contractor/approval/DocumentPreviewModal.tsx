/**
 * DocumentPreviewModal - Document review and approval interface
 * Provides document viewing with inline approval/rejection capabilities
 * Following VelocityFibre theme and accessibility standards
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  FileText,
  Eye,
  Check,
  AlertTriangle,
  Clock,
  User,
  Building,
  Calendar,
  Flag
} from 'lucide-react';
import type { ApprovalItem } from './ApprovalQueueComponent';

interface DocumentPreviewModalProps {
  document: ApprovalItem;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  className?: string;
}

interface DocumentViewerProps {
  documentUrl: string;
  documentType: string;
  documentName: string;
  onLoadError?: () => void;
}

function DocumentViewer({ documentName, onLoadError }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(documentName);
  const isPDF = /\.pdf$/i.test(documentName);
  const isDocument = /\.(doc|docx|txt|rtf)$/i.test(documentName);

  const handleZoomIn = () => setZoom(prev => Math.min(300, prev + 25));
  const handleZoomOut = () => setZoom(prev => Math.max(25, prev - 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleResetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleImageLoad = () => setLoading(false);
  const handleImageError = () => {
    setLoading(false);
    setError('Failed to load document image');
    onLoadError?.();
  };

  // Mock document URL - in real implementation, this would come from the API
  const mockDocumentUrl = `/api/documents/${documentName.split('.')[0]}/preview`;

  return (
    <div className={`relative bg-gray-50 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-60' : 'h-96'}`}>
      {/* Viewer controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-black bg-opacity-50 rounded-lg px-3 py-2">
          <button
            onClick={handleZoomOut}
            className="text-white hover:text-gray-300 p-1"
            disabled={zoom <= 25}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-white text-sm font-mono min-w-[4rem] text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            className="text-white hover:text-gray-300 p-1"
            disabled={zoom >= 300}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-400 mx-1" />
          <button
            onClick={handleRotate}
            className="text-white hover:text-gray-300 p-1"
            aria-label="Rotate document"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-black bg-opacity-50 rounded-lg px-3 py-2">
          <button
            onClick={handleResetView}
            className="text-white hover:text-gray-300 text-sm px-2 py-1"
          >
            Reset
          </button>
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-gray-300 p-1"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Document content */}
      <div 
        ref={viewerRef}
        className="w-full h-full flex items-center justify-center p-4 overflow-auto"
        style={{ backgroundColor: isFullscreen ? '#1f2937' : '#f9fafb' }}
      >
        {loading && (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="text-sm text-gray-500">Loading document...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <FileText className="w-12 h-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Document Preview Unavailable</h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <a
                href={mockDocumentUrl}
                download={documentName}
                className="velocity-button-primary inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download to View
              </a>
            </div>
          </div>
        )}

        {/* Image viewer */}
        {isImage && !error && (
          <img
            src={mockDocumentUrl}
            alt={`Preview of ${documentName}`}
            className="max-w-none shadow-lg"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* PDF viewer placeholder */}
        {isPDF && !error && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Document</h3>
              <p className="text-sm text-gray-500 mb-4">
                {documentName}
              </p>
              <p className="text-sm text-gray-600 mb-6">
                PDF preview requires a PDF viewer. You can download the document or view it in a new tab.
              </p>
              <div className="flex gap-3 justify-center">
                <a
                  href={mockDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="velocity-button-primary inline-flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Open in New Tab
                </a>
                <a
                  href={mockDocumentUrl}
                  download={documentName}
                  className="velocity-button-primary bg-gray-600 hover:bg-gray-700 inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Document viewer placeholder for other types */}
        {isDocument && !error && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Document File</h3>
              <p className="text-sm text-gray-500 mb-4">
                {documentName}
              </p>
              <p className="text-sm text-gray-600 mb-6">
                This document type requires downloading for full preview.
              </p>
              <a
                href={mockDocumentUrl}
                download={documentName}
                className="velocity-button-primary inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Document
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RejectionPanel({ onReject, onCancel }: { onReject: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const predefinedReasons = [
    'Document is incomplete or missing required information',
    'Document quality is insufficient for review',
    'Document appears to be outdated or expired',
    'Document does not match required format or standards',
    'Additional documentation required before approval',
    'Document contains errors or inconsistencies',
    'Custom reason (specify below)'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Custom reason (specify below)' ? customReason : reason;
    if (finalReason.trim()) {
      onReject(finalReason);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h4 className="font-medium text-red-800">Rejection Reason Required</h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select reason for rejection <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
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
            onClick={onCancel}
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
  );
}

export function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
  onApprove,
  onReject,
  className = ''
}: DocumentPreviewModalProps) {
  const [showRejectionPanel, setShowRejectionPanel] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowRejectionPanel(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.document.addEventListener('keydown', handleKeyDown);
    return () => window.document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    setIsProcessing(true);
    try {
      await onReject(reason);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format time remaining
  const formatTimeRemaining = (hours: number) => {
    if (hours <= 0) return 'Overdue';
    if (hours < 1) return `${Math.round(hours * 60)}m remaining`;
    if (hours < 24) return `${Math.round(hours)}h remaining`;
    const days = Math.round(hours / 24);
    return `${days}d remaining`;
  };

  // Get priority styling
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'high': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`
          inline-block align-bottom velocity-glass-medium rounded-lg text-left overflow-hidden shadow-xl transform transition-all 
          sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full
          ${className}
        `}>
          {/* Header */}
          <div className="velocity-gradient-surface px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {document.documentName}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{document.contractorCompanyName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>Stage {document.currentStage}: {document.stageName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {new Date(document.slaDueDate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Priority badge */}
                <div className={`
                  inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
                  ${getPriorityColor(document.priorityLevel)}
                `}>
                  {document.priorityLevel.toUpperCase()} PRIORITY
                </div>

                {/* SLA status */}
                <div className={`
                  inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                  ${document.isOverdue ? 'text-red-600 bg-red-50' : 
                    document.hoursRemaining <= 2 ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}
                `}>
                  <Clock className="w-4 h-4" />
                  {formatTimeRemaining(document.hoursRemaining)}
                </div>

                {/* Escalation indicator */}
                {document.escalationLevel > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    <Flag className="w-3 h-3" />
                    Escalated ({document.escalationLevel}x)
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex">
            {/* Document viewer */}
            <div className="flex-1 p-6">
              <DocumentViewer
                documentUrl={`/api/documents/${document.documentId}/preview`}
                documentType={document.documentType}
                documentName={document.documentName}
              />
            </div>

            {/* Sidebar with actions */}
            <div className="w-80 border-l border-gray-200 p-6 velocity-gradient-card">
              {!showRejectionPanel ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h3>
                  
                  <div className="space-y-4">
                    {/* Document info */}
                    <div className="velocity-glass-light p-4 rounded-lg space-y-3">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Document Type:</span>
                        <span className="ml-2 text-gray-600">{document.documentType}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Assigned:</span>
                        <span className="ml-2 text-gray-600">{new Date(document.assignedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Est. Review Time:</span>
                        <span className="ml-2 text-gray-600">{Math.round(document.estimatedReviewTime)} minutes</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="w-full velocity-button-primary bg-green-600 hover:bg-green-700 text-white py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                        {isProcessing ? 'Processing...' : 'Approve Document'}
                      </button>

                      <button
                        onClick={() => setShowRejectionPanel(true)}
                        disabled={isProcessing}
                        className="w-full velocity-button-primary bg-red-600 hover:bg-red-700 text-white py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <AlertTriangle className="w-5 h-5" />
                        Reject Document
                      </button>

                      <a
                        href={`/api/documents/${document.documentId}/download`}
                        download={document.documentName}
                        className="w-full velocity-button-primary bg-gray-600 hover:bg-gray-700 text-white py-3 flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download Document
                      </a>
                    </div>

                    {/* Urgency indicator */}
                    {(document.priorityLevel === 'critical' || document.isOverdue) && (
                      <div className="velocity-glass-light border border-red-200 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-red-800 mb-1">
                              {document.isOverdue ? 'SLA Breach' : 'Critical Priority'}
                            </h4>
                            <p className="text-sm text-red-700">
                              {document.isOverdue 
                                ? 'This document is overdue and requires immediate attention.'
                                : 'This critical priority document needs urgent review.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <RejectionPanel
                  onReject={handleReject}
                  onCancel={() => setShowRejectionPanel(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreviewModal;