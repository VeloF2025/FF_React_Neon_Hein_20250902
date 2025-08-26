/**
 * ApplicationTable Component - Data table for contractor applications
 * Displays applications with progress indicators, actions, and sorting capabilities
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Building2, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  FileText,
  Loader2
} from 'lucide-react';
import { ApplicationSummary, ApprovalAction, ApprovalActionResult } from '@/types/contractor.types';
import { ApplicationActions } from './ApplicationActions';
import { OnboardingProgressCard } from './OnboardingProgressCard';

// 🟢 WORKING: Props interface for ApplicationTable
interface ApplicationTableProps {
  /** Array of application summaries to display */
  applications: ApplicationSummary[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Selected application IDs for bulk operations */
  selectedIds?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Callback for individual actions */
  onAction?: (contractorId: string, action: ApprovalAction, data?: any) => Promise<ApprovalActionResult>;
  /** Callback for viewing application details */
  onView?: (contractorId: string) => void;
  /** Callback for editing application */
  onEdit?: (contractorId: string) => void;
  /** Current sort configuration */
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
}

// 🟢 WORKING: Table column configuration
interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * ApplicationTable Component
 * Comprehensive data table for managing contractor applications
 */
export function ApplicationTable({
  applications,
  isLoading = false,
  error = null,
  selectedIds = [],
  onSelectionChange,
  onAction,
  onView,
  onEdit,
  sortBy,
  sortOrder,
  onSort,
  emptyMessage = 'No applications found',
  className = ''
}: ApplicationTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // 🟢 WORKING: Table column definitions
  const columns: TableColumn[] = [
    { key: 'selection', label: '', sortable: false, width: '48px', align: 'center' },
    { key: 'company', label: 'Company', sortable: true, width: '250px' },
    { key: 'contact', label: 'Contact', sortable: true, width: '200px' },
    { key: 'status', label: 'Status', sortable: true, width: '140px', align: 'center' },
    { key: 'progress', label: 'Progress', sortable: true, width: '120px', align: 'center' },
    { key: 'documents', label: 'Documents', sortable: false, width: '100px', align: 'center' },
    { key: 'applicationDate', label: 'Applied', sortable: true, width: '120px', align: 'center' },
    { key: 'lastActivity', label: 'Last Activity', sortable: true, width: '120px', align: 'center' },
    { key: 'actions', label: 'Actions', sortable: false, width: '200px', align: 'center' },
    { key: 'expand', label: '', sortable: false, width: '40px', align: 'center' }
  ];

  // 🟢 WORKING: Handle column sorting
  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    
    if (sortBy === columnKey) {
      // Toggle sort order
      onSort(columnKey, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column
      onSort(columnKey, 'asc');
    }
  };

  // 🟢 WORKING: Handle row selection
  const handleRowSelection = (applicationId: string, selected: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelectedIds = selected 
      ? [...selectedIds, applicationId]
      : selectedIds.filter(id => id !== applicationId);
    
    onSelectionChange(newSelectedIds);
  };

  // 🟢 WORKING: Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelectedIds = selected ? applications.map(app => app.id) : [];
    onSelectionChange(newSelectedIds);
  };

  // 🟢 WORKING: Toggle row expansion
  const toggleRowExpansion = (applicationId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId);
    } else {
      newExpanded.add(applicationId);
    }
    setExpandedRows(newExpanded);
  };

  // 🟢 WORKING: Get status display properties
  const getStatusDisplay = (status: string, _urgentFlags: string[] = []) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    
    switch (status) {
      case 'pending':
        return {
          className: `${baseClasses} bg-yellow-100 text-yellow-800`,
          label: 'Pending',
          icon: <Clock className="h-3 w-3" />
        };
      case 'under_review':
        return {
          className: `${baseClasses} bg-blue-100 text-blue-800`,
          label: 'Under Review',
          icon: <FileText className="h-3 w-3" />
        };
      case 'documentation_incomplete':
        return {
          className: `${baseClasses} bg-red-100 text-red-800`,
          label: 'Docs Incomplete',
          icon: <AlertTriangle className="h-3 w-3" />
        };
      case 'approved':
        return {
          className: `${baseClasses} bg-green-100 text-green-800`,
          label: 'Approved',
          icon: <CheckCircle2 className="h-3 w-3" />
        };
      case 'rejected':
        return {
          className: `${baseClasses} bg-gray-100 text-gray-800`,
          label: 'Rejected',
          icon: <AlertTriangle className="h-3 w-3" />
        };
      default:
        return {
          className: `${baseClasses} bg-gray-100 text-gray-600`,
          label: status,
          icon: <Clock className="h-3 w-3" />
        };
    }
  };

  // 🟢 WORKING: Format date for display
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // 🟢 WORKING: Calculate days in review
  const getDaysInReview = (applicationDate: Date | string) => {
    const appDate = typeof applicationDate === 'string' ? new Date(applicationDate) : applicationDate;
    const now = new Date();
    const diffTime = now.getTime() - appDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 🟢 WORKING: Memoized sorted applications
  const sortedApplications = useMemo(() => {
    if (!sortBy) return applications;
    
    return [...applications].sort((a, b) => {
      let aValue: any = a[sortBy as keyof ApplicationSummary];
      let bValue: any = b[sortBy as keyof ApplicationSummary];
      
      // Handle date sorting
      if (sortBy === 'applicationDate' || sortBy === 'lastActivity') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      // Handle numeric sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string sorting
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();
      
      if (sortOrder === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [applications, sortBy, sortOrder]);

  // 🟢 WORKING: Loading state
  if (isLoading) {
    return (
      <div className={`ff-card ${className}`}>
        <div className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  // 🟢 WORKING: Error state
  if (error) {
    return (
      <div className={`ff-card ${className}`}>
        <div className="p-8 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-4" />
          <p className="text-red-600 mb-2">Error loading applications</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // 🟢 WORKING: Empty state
  if (applications.length === 0) {
    return (
      <div className={`ff-card ${className}`}>
        <div className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg mb-2">No Applications Found</p>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ff-card overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  {column.key === 'selection' ? (
                    <input
                      type="checkbox"
                      checked={selectedIds.length === applications.length && applications.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  ) : column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="group inline-flex items-center space-x-1 hover:text-gray-900"
                    >
                      <span>{column.label}</span>
                      <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible">
                        {sortBy === column.key ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        ) : (
                          <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedApplications.map((application) => {
              const statusDisplay = getStatusDisplay(application.status, application.urgentFlags);
              const isSelected = selectedIds.includes(application.id);
              const isExpanded = expandedRows.has(application.id);
              const daysInReview = getDaysInReview(application.applicationDate);
              
              return (
                <React.Fragment key={application.id}>
                  {/* Main Row */}
                  <tr 
                    className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} cursor-pointer`}
                    onClick={(e) => {
                      // Only trigger if not clicking on interactive elements
                      const target = e.target as HTMLElement;
                      const isInteractiveElement = target.closest('input, button, a, .no-row-click');
                      if (!isInteractiveElement && onView) {
                        onView(application.id);
                      }
                    }}
                  >
                    {/* Selection Checkbox */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowSelection(application.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>

                    {/* Company */}
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.companyName}
                          </div>
                          {application.urgentFlags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {application.urgentFlags.slice(0, 2).map((flag, index) => (
                                <span
                                  key={index}
                                  className="px-1 py-0.5 text-xs bg-red-100 text-red-800 rounded"
                                >
                                  {flag}
                                </span>
                              ))}
                              {application.urgentFlags.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{application.urgentFlags.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-900">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{application.contactPerson}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{application.email}</span>
                        </div>
                        {application.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <Phone className="h-3 w-3" />
                            <span>{application.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className={statusDisplay.className}>
                          <span className="flex items-center space-x-1">
                            {statusDisplay.icon}
                            <span>{statusDisplay.label}</span>
                          </span>
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {daysInReview} days
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="relative w-12 h-12">
                          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
                            <circle
                              cx="20"
                              cy="20"
                              r="16"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                              fill="none"
                            />
                            <circle
                              cx="20"
                              cy="20"
                              r="16"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 16}`}
                              strokeDashoffset={`${2 * Math.PI * 16 * (1 - application.progress / 100)}`}
                              className={`transition-all duration-300 ${
                                application.progress >= 80 ? 'text-green-500' :
                                application.progress >= 50 ? 'text-blue-500' :
                                application.progress >= 25 ? 'text-yellow-500' :
                                'text-red-500'
                              }`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-700">
                              {application.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Documents */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className={`text-sm font-medium ${
                          application.documentsComplete ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {application.documentsComplete ? 'Complete' : 'Incomplete'}
                        </span>
                      </div>
                    </td>

                    {/* Application Date */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(application.applicationDate)}
                        </span>
                      </div>
                    </td>

                    {/* Last Activity */}
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-900">
                        {application.lastActivity ? formatDate(application.lastActivity) : 'N/A'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 no-row-click">
                      <ApplicationActions
                        {...{
                          contractorId: application.id,
                          status: application.status as any,
                          progress: application.progress,
                          compact: true,
                          ...(onAction && { onAction }),
                          ...(onView && { onView }),
                          ...(onEdit && { onEdit })
                        }}
                      />
                    </td>

                    {/* Expand Toggle */}
                    <td className="px-4 py-4 text-center no-row-click">
                      <button
                        onClick={() => toggleRowExpansion(application.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row Details */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-6 bg-gray-50">
                        <div className="max-w-4xl">
                          <h4 className="text-sm font-medium text-gray-900 mb-4">
                            Application Details
                          </h4>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Progress Card */}
                            <OnboardingProgressCard
                              progress={{
                                contractorId: application.id,
                                overallProgress: application.progress,
                                stagesCompleted: Math.floor(application.progress / 20),
                                totalStages: 5,
                                documentsUploaded: application.documentsComplete ? 5 : 3,
                                documentsRequired: 5,
                                stages: [], // TODO: Add actual stages data
                                ...(application.lastActivity && { lastActivity: application.lastActivity })
                              }}
                              companyName={application.companyName}
                              contactPerson={application.contactPerson}
                              {...(application.estimatedCompletion && { estimatedCompletion: application.estimatedCompletion })}
                              showStages={true}
                              compact={false}
                            />
                            
                            {/* Additional Details */}
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                  Contact Information
                                </h5>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <a href={`mailto:${application.email}`} className="text-blue-600 hover:underline">
                                      {application.email}
                                    </a>
                                  </div>
                                  {application.phone && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                      <Phone className="h-4 w-4 text-gray-400" />
                                      <a href={`tel:${application.phone}`} className="text-blue-600 hover:underline">
                                        {application.phone}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {application.nextAction && (
                                <div>
                                  <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Next Action
                                  </h5>
                                  <p className="text-sm text-gray-900">{application.nextAction}</p>
                                </div>
                              )}
                              
                              {application.urgentFlags.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Urgent Flags
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {application.urgentFlags.map((flag, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full"
                                      >
                                        {flag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApplicationTable;