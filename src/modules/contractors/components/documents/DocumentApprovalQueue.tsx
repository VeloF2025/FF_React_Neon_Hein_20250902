/**
 * DocumentApprovalQueue Component - Enhanced document approval workflow interface
 * Implements GitHub Issue #32 requirements with full approval workflow
 * @module DocumentApprovalQueue
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  FileText,
  Eye,
  Download,
  CheckCheck,
  Users
} from 'lucide-react';
import { contractorService } from '@/services/contractorService';
import { ContractorDocument } from '@/types/contractor.types';
import { 
  DocumentQueueStats, 
  DocumentSortOptions,
  BulkApprovalRequest
} from './types/documentApproval.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DocumentViewer } from './DocumentViewer';
import { ApprovalActions } from './ApprovalActions';
import { DocumentFilters } from './DocumentFilters';
import { ComplianceTracker } from './ComplianceTracker';
import { BatchApprovalModal } from './BatchApprovalModal';
import toast from 'react-hot-toast';

interface DocumentApprovalQueueProps {
  /**
   * Optional contractor ID to filter documents for specific contractor
   */
  contractorId?: string;
  /**
   * Initial filter status for documents
   */
  initialFilter?: 'all' | 'pending' | 'approved' | 'rejected' | 'expired';
  /**
   * Enable batch operations for multiple documents
   */
  enableBatchOperations?: boolean;
  /**
   * Auto-refresh interval in seconds (0 to disable)
   */
  autoRefreshInterval?: number;
  /**
   * Callback when document approval status changes
   */
  onApprovalChange?: (documentId: string, newStatus: string) => void;
  /**
   * Callback when queue stats update
   */
  onStatsUpdate?: (stats: DocumentQueueStats) => void;
}

/**
 * DocumentApprovalQueue - Main component for document approval workflow
 */
export function DocumentApprovalQueue({
  contractorId,
  initialFilter = 'pending',
  enableBatchOperations = true,
  autoRefreshInterval = 30,
  onApprovalChange,
  onStatsUpdate
}: DocumentApprovalQueueProps) {
  // 🟢 WORKING: State management
  const [documents, setDocuments] = useState<ContractorDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<ContractorDocument[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [currentDocument, setCurrentDocument] = useState<ContractorDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [sortOptions] = useState<DocumentSortOptions>({
    field: 'createdAt',
    direction: 'desc'
  });
  
  // Modal states
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showComplianceTracker, setShowComplianceTracker] = useState(false);
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingDocuments, setProcessingDocuments] = useState<Set<string>>(new Set());

  /**
   * Load documents from service
   */
  const loadDocuments = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true);
      else setIsRefreshing(true);
      
      setError(null);
      
      let docs: ContractorDocument[];
      
      if (contractorId) {
        // Load documents for specific contractor
        docs = await contractorService.documents.getByContractor(contractorId);
      } else {
        // Load all pending documents across contractors
        docs = await loadAllPendingDocuments();
      }
      
      setDocuments(docs);
      
      // Calculate and emit stats
      const stats = calculateQueueStats(docs);
      onStatsUpdate?.(stats);
      
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError('Failed to load documents. Please try again.');
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [contractorId, onStatsUpdate]);

  /**
   * Load all pending documents across contractors
   */
  const loadAllPendingDocuments = async (): Promise<ContractorDocument[]> => {
    // 🟡 PARTIAL: This would need a service method to get all pending documents
    // For now, we'll throw an error to indicate this needs implementation
    throw new Error('Loading all pending documents not yet implemented. Please provide contractorId.');
  };

  /**
   * Calculate queue statistics
   */
  const calculateQueueStats = (docs: ContractorDocument[]): DocumentQueueStats => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      total: docs.length,
      pending: docs.filter(d => d.verificationStatus === 'pending').length,
      approved: docs.filter(d => d.verificationStatus === 'verified').length,
      rejected: docs.filter(d => d.verificationStatus === 'rejected').length,
      expired: docs.filter(d => d.expiryDate && new Date(d.expiryDate) < now).length,
      expiringWithin30Days: docs.filter(d => 
        d.expiryDate && 
        new Date(d.expiryDate) > now && 
        new Date(d.expiryDate) <= thirtyDaysFromNow
      ).length,
      averageProcessingTime: 0, // 🔴 BROKEN: Would need processing time data
      queuedToday: docs.filter(d => 
        d.createdAt && new Date(d.createdAt) >= todayStart
      ).length,
      processedToday: docs.filter(d => 
        d.verifiedAt && new Date(d.verifiedAt) >= todayStart
      ).length
    };
  };

  /**
   * Apply filters and search to documents
   */
  const applyFilters = useMemo(() => {
    let filtered = [...documents];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'pending':
          filtered = filtered.filter(d => d.verificationStatus === 'pending');
          break;
        case 'approved':
          filtered = filtered.filter(d => d.verificationStatus === 'verified');
          break;
        case 'rejected':
          filtered = filtered.filter(d => d.verificationStatus === 'rejected');
          break;
        case 'expired':
          filtered = filtered.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date());
          break;
      }
    }
    
    // Apply document type filter
    if (documentTypeFilter !== 'all') {
      filtered = filtered.filter(d => d.documentType === documentTypeFilter);
    }
    
    // Apply expiry filter
    if (expiryFilter !== 'all') {
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      switch (expiryFilter) {
        case 'expiring':
          filtered = filtered.filter(d => 
            d.expiryDate && 
            new Date(d.expiryDate) > now && 
            new Date(d.expiryDate) <= thirtyDays
          );
          break;
        case 'expired':
          filtered = filtered.filter(d => d.expiryDate && new Date(d.expiryDate) < now);
          break;
        case 'valid':
          filtered = filtered.filter(d => !d.expiryDate || new Date(d.expiryDate) > thirtyDays);
          break;
      }
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.documentName.toLowerCase().includes(term) ||
        d.documentType.toLowerCase().includes(term) ||
        (d.documentNumber && d.documentNumber.toLowerCase().includes(term)) ||
        (d.notes && d.notes.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting with proper type handling
    filtered.sort((a, b) => {
      const getSortValue = (doc: ContractorDocument, field: string) => {
        switch (field) {
          case 'priority':
            // Calculate priority based on expiry date
            if (doc.expiryDate) {
              const daysUntilExpiry = Math.ceil(
                (new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              if (daysUntilExpiry < 0) return 0; // Expired (highest priority)
              if (daysUntilExpiry <= 7) return 1; // Urgent
              if (daysUntilExpiry <= 30) return 2; // Warning
              return 3; // Normal
            }
            return 3; // Normal priority for docs without expiry
          case 'contractorName':
            return doc.contractorId; // Use contractorId as proxy
          default:
            return (doc as any)[field];
        }
      };
      
      const aValue = getSortValue(a, sortOptions.field);
      const bValue = getSortValue(b, sortOptions.field);
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      else if (aValue > bValue) comparison = 1;
      
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [documents, statusFilter, documentTypeFilter, expiryFilter, searchTerm, sortOptions]);

  /**
   * Handle document approval
   */
  const handleApproval = async (documentId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      setProcessingDocuments(prev => new Set([...prev, documentId]));
      
      const status = action === 'approve' ? 'verified' : 'rejected';
      const currentUser = 'current_user'; // 🟡 PARTIAL: Would get from auth context
      
      await contractorService.documents.verifyDocument(
        documentId,
        currentUser,
        status,
        notes
      );
      
      // Update local state with proper type handling
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              verificationStatus: status,
              verifiedBy: currentUser,
              verifiedAt: new Date(),
              ...(action === 'reject' && notes ? { rejectionReason: notes } : {})
            } as ContractorDocument
          : doc
      ));
      
      // Remove from selection
      setSelectedDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
      
      onApprovalChange?.(documentId, status);
      
      toast.success(`Document ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      
    } catch (error) {
      console.error('Failed to process document:', error);
      toast.error(`Failed to ${action} document`);
    } finally {
      setProcessingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  /**
   * Handle batch approval
   */
  const handleBatchApproval = async (request: BulkApprovalRequest) => {
    try {
      setIsProcessing(true);
      
      const promises = request.documentIds.map(id => 
        handleApproval(id, request.action, request.notes)
      );
      
      await Promise.all(promises);
      
      setSelectedDocuments(new Set());
      setShowBatchModal(false);
      
      toast.success(`${request.documentIds.length} documents ${request.action === 'approve' ? 'approved' : 'rejected'}`);
      
    } catch (error) {
      console.error('Failed to process batch approval:', error);
      toast.error('Failed to process batch approval');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Toggle document selection
   */
  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(documentId)) {
        newSet.delete(documentId);
      } else {
        newSet.add(documentId);
      }
      return newSet;
    });
  };

  /**
   * Select all filtered documents
   */
  const selectAllDocuments = () => {
    const selectableDocuments = filteredDocuments
      .filter(d => d.verificationStatus === 'pending')
      .map(d => d.id);
    setSelectedDocuments(new Set(selectableDocuments));
  };

  /**
   * Clear all selections
   */
  const clearSelection = () => {
    setSelectedDocuments(new Set());
  };

  /**
   * Get document priority class
   */
  const getDocumentPriorityClass = (document: ContractorDocument): string => {
    if (document.expiryDate) {
      const daysUntilExpiry = Math.ceil(
        (new Date(document.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilExpiry < 0) return 'border-l-4 border-l-red-500'; // Expired
      if (daysUntilExpiry <= 7) return 'border-l-4 border-l-orange-500'; // Urgent
      if (daysUntilExpiry <= 30) return 'border-l-4 border-l-yellow-500'; // Warning
    }
    
    return 'border-l-4 border-l-gray-200'; // Normal
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        loadDocuments(false);
      }, autoRefreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
    // Return undefined explicitly for no cleanup needed
    return undefined;
  }, [loadDocuments, autoRefreshInterval]);

  // Initial load
  useEffect(() => {
    loadDocuments(true);
  }, [loadDocuments]);

  // Update filtered documents
  useEffect(() => {
    setFilteredDocuments(applyFilters);
  }, [applyFilters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" label="Loading document approval queue..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Documents</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => loadDocuments(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  const selectedCount = selectedDocuments.size;
  const pendingCount = documents.filter(d => d.verificationStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Document Approval Queue</h2>
            <p className="text-gray-600">
              {pendingCount} documents pending review
              {contractorId && ' for this contractor'}
            </p>
          </div>
          
          {isRefreshing && (
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {enableBatchOperations && selectedCount > 0 && (
            <button
              onClick={() => setShowBatchModal(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              disabled={isProcessing}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Batch Process ({selectedCount})
            </button>
          )}
          
          <button
            onClick={() => setShowComplianceTracker(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Users className="w-4 h-4 mr-2" />
            Compliance Dashboard
          </button>
          
          <button
            onClick={() => loadDocuments(false)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <DocumentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={(status: string) => setStatusFilter(status as 'all' | 'expired' | 'approved' | 'rejected' | 'pending')}
        documentTypeFilter={documentTypeFilter}
        onDocumentTypeFilterChange={setDocumentTypeFilter}
        expiryFilter={expiryFilter}
        onExpiryFilterChange={setExpiryFilter}
        totalCount={documents.length}
        filteredCount={filteredDocuments.length}
      />

      {/* Selection Controls */}
      {enableBatchOperations && filteredDocuments.some(d => d.verificationStatus === 'pending') && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">
            {selectedCount > 0 ? `${selectedCount} selected` : 'Select documents for batch processing'}
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllDocuments}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Select All Pending
            </button>
            
            {selectedCount > 0 && (
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">
              {statusFilter === 'pending' 
                ? 'No documents are pending approval' 
                : 'Try adjusting your filters to see more documents'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((document) => {
              const isSelected = selectedDocuments.has(document.id);
              const isProcessingDoc = processingDocuments.has(document.id);
              const priorityClass = getDocumentPriorityClass(document);
              
              return (
                <div 
                  key={document.id} 
                  className={`p-6 hover:bg-gray-50 transition-colors ${priorityClass}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      {enableBatchOperations && document.verificationStatus === 'pending' && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDocumentSelection(document.id)}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      )}
                      
                      {/* Document Icon */}
                      <div className="flex-shrink-0">
                        <FileText className="w-10 h-10 text-gray-600" />
                      </div>
                      
                      {/* Document Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {document.documentName}
                        </h4>
                        
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Type:</span> {document.documentType.replace('_', ' ')}
                          </div>
                          <div>
                            <span className="font-medium">Uploaded:</span> {new Date(document.createdAt).toLocaleDateString()}
                          </div>
                          {document.expiryDate && (
                            <div>
                              <span className="font-medium">Expires:</span> {new Date(document.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                          {document.documentNumber && (
                            <div>
                              <span className="font-medium">Number:</span> {document.documentNumber}
                            </div>
                          )}
                        </div>
                        
                        {document.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {document.notes}
                          </div>
                        )}
                        
                        {document.rejectionReason && (
                          <div className="mt-2 p-3 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-700">
                              <span className="font-medium">Rejection Reason:</span> {document.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Status Badge */}
                      <div className="flex items-center">
                        {document.verificationStatus === 'pending' && (
                          <div className="flex items-center px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </div>
                        )}
                        {document.verificationStatus === 'verified' && (
                          <div className="flex items-center px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approved
                          </div>
                        )}
                        {document.verificationStatus === 'rejected' && (
                          <div className="flex items-center px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            <XCircle className="w-3 h-3 mr-1" />
                            Rejected
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setCurrentDocument(document);
                            setShowDocumentViewer(true);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          title="View document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => window.open(document.fileUrl, '_blank')}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Approval Actions for Pending Documents */}
                      {document.verificationStatus === 'pending' && (
                        <ApprovalActions
                          document={document}
                          onApprove={(notes) => handleApproval(document.id, 'approve', notes)}
                          onReject={(notes) => handleApproval(document.id, 'reject', notes)}
                          isProcessing={isProcessingDoc}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {showDocumentViewer && currentDocument && (
        <DocumentViewer
          document={currentDocument}
          onClose={() => {
            setShowDocumentViewer(false);
            setCurrentDocument(null);
          }}
        />
      )}

      {/* Batch Approval Modal */}
      {showBatchModal && selectedDocuments.size > 0 && (
        <BatchApprovalModal
          documentIds={Array.from(selectedDocuments)}
          onSubmit={handleBatchApproval}
          onClose={() => setShowBatchModal(false)}
          isProcessing={isProcessing}
        />
      )}

      {/* Compliance Tracker Modal */}
      {showComplianceTracker && (
        <ComplianceTracker
          documents={documents}
          onClose={() => setShowComplianceTracker(false)}
        />
      )}
    </div>
  );
}