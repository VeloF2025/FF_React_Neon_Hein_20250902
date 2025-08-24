/**
 * BOQ List Component - Refactored Version
 * Main container for displaying and managing all BOQs
 */

import { Loader2, FileText } from 'lucide-react';
import { BOQListProps, INITIAL_FILTERS } from './list/BOQListTypes';
import { useBOQList } from './list/useBOQList';
import BOQListHeader from './list/BOQListHeader';
import BOQListFilters from './list/BOQListFilters';
import BOQCard from './list/BOQCard';

export default function BOQList({
  onSelectBOQ,
  onCreateBOQ,
  onUploadBOQ,
  selectedBOQId,
  className
}: BOQListProps) {
  const {
    boqs,
    filteredAndSortedBOQs,
    filters,
    setFilters,
    isLoading,
    showFilters,
    setShowFilters,
    actionMenuOpen,
    setActionMenuOpen,
    filterOptions,
    loadBOQs,
    handleViewBOQ,
    handleEditBOQ,
    handleDownloadBOQ,
    handleArchiveBOQ,
    handleDeleteBOQ
  } = useBOQList(onSelectBOQ);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading BOQs...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <BOQListHeader
        totalBOQs={boqs.length}
        filteredCount={filteredAndSortedBOQs.length}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onCreateBOQ={onCreateBOQ}
        onUploadBOQ={onUploadBOQ}
        onRefresh={loadBOQs}
      />

      {/* Filters */}
      {showFilters && (
        <BOQListFilters
          filters={filters}
          setFilters={setFilters}
          uploaders={filterOptions.uploaders}
        />
      )}

      {/* BOQ Grid */}
      {filteredAndSortedBOQs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedBOQs.map(boq => (
            <BOQCard
              key={boq.id}
              boq={boq}
              isSelected={selectedBOQId === boq.id}
              onClick={() => handleViewBOQ(boq)}
              onView={() => handleViewBOQ(boq)}
              onEdit={() => handleEditBOQ(boq)}
              onDownload={() => handleDownloadBOQ(boq)}
              onArchive={() => handleArchiveBOQ(boq)}
              onDelete={() => handleDeleteBOQ(boq)}
              actionMenuOpen={actionMenuOpen === boq.id}
              setActionMenuOpen={(open) => setActionMenuOpen(open ? boq.id : null)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-white rounded-lg border">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No BOQs Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {boqs.length === 0
              ? "No BOQs have been created for this project yet."
              : "No BOQs match your current filters."}
          </p>
          {boqs.length === 0 && (onCreateBOQ || onUploadBOQ) && (
            <div className="mt-6 flex justify-center space-x-3">
              {onCreateBOQ && (
                <button
                  onClick={onCreateBOQ}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Create BOQ
                </button>
              )}
              {onUploadBOQ && (
                <button
                  onClick={onUploadBOQ}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Upload BOQ
                </button>
              )}
            </div>
          )}
          {Object.values(filters).some(filter => filter !== '' && filter !== 'all') && (
            <button
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}