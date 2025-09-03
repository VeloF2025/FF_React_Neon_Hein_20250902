/**
 * ApprovalQueueComponent - Main approval queue dashboard
 * Displays pending approvals with filtering, sorting, and batch operations
 * Following VelocityFibre theme and accessibility standards
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Clock,
  TrendingUp,
  Settings,
  ChevronDown
} from 'lucide-react';
import { ApprovalItemCard } from './ApprovalItemCard';
import { BatchApprovalControls } from './BatchApprovalControls';
import { SLAStatusIndicator } from './SLAStatusIndicator';
import { DocumentPreviewModal } from './DocumentPreviewModal';

export interface ApprovalItem {
  id: string;
  workflowId: string;
  documentId: string;
  documentName: string;
  documentType: string;
  contractorId: string;
  contractorCompanyName: string;
  currentStage: number;
  stageName: string;
  priorityLevel: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  approverId: string;
  assignedAt: string;
  slaDueDate: string;
  isOverdue: boolean;
  escalationLevel: number;
  estimatedReviewTime: number;
  hoursRemaining: number;
  urgencyScore: number;
}

export interface ApprovalQueueStats {
  total: number;
  overdue: number;
  urgent: number;
  dueToday: number;
  byPriority: {
    critical: number;
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
  byStage: {
    [key: number]: number;
  };
}

export interface ApprovalQueueData {
  items: ApprovalItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    page: number;
    totalPages: number;
  };
  statistics: ApprovalQueueStats;
}

interface ApprovalQueueComponentProps {
  approverUserId?: string;
  isAdmin?: boolean;
  className?: string;
  onItemApproved?: (item: ApprovalItem) => void;
  onItemRejected?: (item: ApprovalItem) => void;
  onBatchOperationComplete?: (operation: string, items: ApprovalItem[]) => void;
}

export function ApprovalQueueComponent({
  approverUserId,
  isAdmin = false,
  className = '',
  onItemApproved,
  onItemRejected,
  onBatchOperationComplete
}: ApprovalQueueComponentProps) {
  // State management
  const [queueData, setQueueData] = useState<ApprovalQueueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [previewDocument, setPreviewDocument] = useState<ApprovalItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('');
  const [overdueFilter, setOverdueFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'priority' | 'due_date' | 'assigned_date'>('due_date');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Fetch approval queue data
  const fetchApprovalQueue = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        sortBy,
        sortOrder,
        isAdmin: isAdmin.toString()
      });

      if (approverUserId) queryParams.set('approverUserId', approverUserId);
      if (priorityFilter) queryParams.set('priorityLevel', priorityFilter);
      if (documentTypeFilter) queryParams.set('documentType', documentTypeFilter);
      if (overdueFilter) queryParams.set('overdue', overdueFilter);

      const response = await fetch(`/api/contractors/documents/approval-queue?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch approval queue: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch approval queue');
      }

      setQueueData(result.data);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred while fetching the approval queue');
      // Log error for debugging
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error fetching approval queue:', error);
      }
    } finally {
      if (showLoader) setIsLoading(false);
      setRefreshing(false);
    }
  }, [approverUserId, isAdmin, currentPage, itemsPerPage, sortBy, sortOrder, priorityFilter, documentTypeFilter, overdueFilter]);

  // Initial load and refresh
  useEffect(() => {
    fetchApprovalQueue();
  }, [fetchApprovalQueue]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchApprovalQueue(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchApprovalQueue]);

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchApprovalQueue();
  };

  // Selection management
  const handleSelectItem = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleSelectAll = () => {
    if (!queueData?.items) return;
    
    if (selectedItems.size === queueData.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(queueData.items.map(item => item.id)));
    }
  };

  // Individual approval actions
  const handleApproveItem = async (item: ApprovalItem) => {
    try {
      const response = await fetch('/api/contractors/documents/approval-workflow', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId: item.workflowId,
          approverUserId: approverUserId || item.approverId,
          decision: 'approve',
          comments: 'Approved via approval queue'
        }),
      });

      if (!response.ok) {
        throw new Error(`Approval failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Approval failed');
      }

      // Remove from selected items and refresh queue
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });

      fetchApprovalQueue(false);
      onItemApproved?.(item);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error approving item:', error);
      }
      setError(error instanceof Error ? error.message : 'Failed to approve item');
    }
  };

  const handleRejectItem = async (item: ApprovalItem, rejectionReason: string) => {
    try {
      const response = await fetch('/api/contractors/documents/approval-workflow', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId: item.workflowId,
          approverUserId: approverUserId || item.approverId,
          decision: 'reject',
          rejectionReason,
          comments: 'Rejected via approval queue'
        }),
      });

      if (!response.ok) {
        throw new Error(`Rejection failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Rejection failed');
      }

      // Remove from selected items and refresh queue
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });

      fetchApprovalQueue(false);
      onItemRejected?.(item);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error rejecting item:', error);
      }
      setError(error instanceof Error ? error.message : 'Failed to reject item');
    }
  };

  // Batch operations
  const handleBatchApproval = async (itemIds: string[]) => {
    if (!queueData) return;
    
    const selectedQueueItems = queueData.items.filter(item => itemIds.includes(item.id));
    
    try {
      const promises = selectedQueueItems.map(item => 
        fetch('/api/contractors/documents/approval-workflow', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workflowId: item.workflowId,
            approverUserId: approverUserId || item.approverId,
            decision: 'approve',
            comments: 'Batch approved via approval queue'
          }),
        })
      );

      const responses = await Promise.allSettled(promises);
      
      // Count successful operations
      const successful = responses.filter(r => r.status === 'fulfilled').length;
      const failed = responses.length - successful;

      if (failed > 0) {
        setError(`${successful} items approved successfully, ${failed} failed`);
      }

      setSelectedItems(new Set());
      fetchApprovalQueue(false);
      onBatchOperationComplete?.('approve', selectedQueueItems);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error in batch approval:', error);
      }
      setError('Batch approval failed');
    }
  };

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    if (!queueData?.items) return [];
    
    return queueData.items.filter(item => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          item.documentName.toLowerCase().includes(searchLower) ||
          item.contractorCompanyName.toLowerCase().includes(searchLower) ||
          item.documentType.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [queueData?.items, searchTerm]);

  // Get unique document types for filter dropdown
  const documentTypes = useMemo(() => {
    if (!queueData?.items) return [];
    return [...new Set(queueData.items.map(item => item.documentType))];
  }, [queueData?.items]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Loading approval queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with statistics */}
      {queueData?.statistics && (
        <div className="velocity-glass-light p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Approval Queue
                {isAdmin && <span className="text-sm font-normal text-gray-500 ml-2">(Admin View)</span>}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage pending document approvals with SLA tracking
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="velocity-button-primary flex items-center gap-2"
              aria-label="Refresh approval queue"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Statistics cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="velocity-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{queueData.statistics.total}</p>
                </div>
              </div>
            </div>

            <div className="velocity-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{queueData.statistics.overdue}</p>
                </div>
              </div>
            </div>

            <div className="velocity-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Today</p>
                  <p className="text-2xl font-bold text-orange-600">{queueData.statistics.dueToday}</p>
                </div>
              </div>
            </div>

            <div className="velocity-card p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Urgent</p>
                  <p className="text-2xl font-bold text-purple-600">{queueData.statistics.urgent}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SLA Status Overview */}
          <SLAStatusIndicator statistics={queueData.statistics} className="mt-4" />
        </div>
      )}

      {/* Controls */}
      <div className="velocity-glass-light p-4 rounded-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by document name, contractor, or type..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search approval queue"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter by priority"
              >
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={documentTypeFilter}
                onChange={(e) => setDocumentTypeFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter by document type"
              >
                <option value="">All Document Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={overdueFilter}
                onChange={(e) => setOverdueFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter by overdue status"
              >
                <option value="">All Items</option>
                <option value="true">Overdue Only</option>
                <option value="false">Not Overdue</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'priority' | 'due_date' | 'assigned_date')}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Sort by"
              >
                <option value="due_date">Sort by Due Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="assigned_date">Sort by Assigned Date</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Batch operations */}
        {selectedItems.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <BatchApprovalControls
              selectedItems={Array.from(selectedItems)}
              onBatchApprove={handleBatchApproval}
              onDeselectAll={() => setSelectedItems(new Set())}
              isLoading={false}
            />
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="velocity-glass-light border border-red-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Approval items */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {/* Select all */}
          <div className="flex items-center gap-2 px-2">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredItems.length}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-label="Select all items"
            />
            <span className="text-sm text-gray-600">
              Select all ({filteredItems.length} items)
            </span>
          </div>

          {/* Items list */}
          {filteredItems.map(item => (
            <ApprovalItemCard
              key={item.id}
              item={item}
              isSelected={selectedItems.has(item.id)}
              onSelect={handleSelectItem}
              onApprove={handleApproveItem}
              onReject={handleRejectItem}
              onPreview={setPreviewDocument}
              className="velocity-transition-smooth"
            />
          ))}
        </div>
      ) : (
        <div className="velocity-glass-light p-12 rounded-lg text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-50 rounded-full">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
              <p className="text-sm text-gray-500">
                {searchTerm || priorityFilter || documentTypeFilter || overdueFilter
                  ? 'No items match your current filters'
                  : 'All caught up! No documents requiring approval at this time.'}
              </p>
            </div>
            {(searchTerm || priorityFilter || documentTypeFilter || overdueFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPriorityFilter('');
                  setDocumentTypeFilter('');
                  setOverdueFilter('');
                }}
                className="velocity-button-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {queueData?.pagination && queueData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {
              Math.min(currentPage * itemsPerPage, queueData.pagination.total)
            } of {queueData.pagination.total} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(queueData.pagination.totalPages, currentPage + 1))}
              disabled={currentPage >= queueData.pagination.totalPages}
              className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Document preview modal */}
      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          isOpen={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          onApprove={() => {
            handleApproveItem(previewDocument);
            setPreviewDocument(null);
          }}
          onReject={(reason) => {
            handleRejectItem(previewDocument, reason);
            setPreviewDocument(null);
          }}
        />
      )}
    </div>
  );
}

export default ApprovalQueueComponent;