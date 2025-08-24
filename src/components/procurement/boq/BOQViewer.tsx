/**
 * BOQ Viewer Component - Refactored Version
 * Main container component that orchestrates all BOQ viewer functionality
 */

import { Loader2, FileText } from 'lucide-react';
import { BOQViewerProps, INITIAL_FILTERS } from './BOQViewerTypes';
import { useBOQViewer } from './hooks/useBOQViewer';
import { exportBOQToCSV } from './BOQViewerUtils';
import BOQViewerHeader from './BOQViewerHeader';
import BOQViewerStatistics from './BOQViewerStatistics';
import BOQViewerFilters from './BOQViewerFilters';
import BOQViewerTable from './BOQViewerTable';
import BOQViewerPagination from './BOQViewerPagination';
import BOQViewerEmptyState from './BOQViewerEmptyState';

export default function BOQViewer({ 
  boqId, 
  initialMode = 'view',
  onItemUpdate,
  className 
}: BOQViewerProps) {
  const {
    boqData,
    filters,
    setFilters,
    sortField,
    handleSort,
    currentPage,
    setCurrentPage,
    mode,
    setMode,
    editingItems,
    startEditing,
    cancelEditing,
    updateEditingItem,
    saveItem,
    isLoading,
    isSaving,
    showFilters,
    setShowFilters,
    visibleColumns,
    setVisibleColumns,
    loadBOQData,
    filterOptions,
    filteredAndSortedItems,
    paginatedItems,
    totalPages
  } = useBOQViewer(boqId, initialMode, onItemUpdate);

  // Handle export
  const handleExport = () => {
    if (!boqData) return;
    exportBOQToCSV(boqData, filteredAndSortedItems, visibleColumns);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading BOQ...</span>
      </div>
    );
  }

  // Error state
  if (!boqData) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">BOQ Not Found</h3>
        <p className="mt-2 text-sm text-gray-500">The requested BOQ could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <BOQViewerHeader
        boqData={boqData}
        mode={mode}
        setMode={setMode}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onExport={handleExport}
        onRefresh={loadBOQData}
      />

      {/* Statistics */}
      <BOQViewerStatistics boqData={boqData} />

      {/* Filters */}
      {showFilters && (
        <BOQViewerFilters
          filters={filters}
          setFilters={setFilters}
          filterOptions={filterOptions}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
      )}

      {/* Table */}
      {filteredAndSortedItems.length > 0 ? (
        <div className="bg-white rounded-lg border">
          <BOQViewerTable
            items={paginatedItems}
            mode={mode}
            editingItems={editingItems}
            visibleColumns={visibleColumns}
            sortField={sortField}
            onSort={handleSort}
            onStartEdit={startEditing}
            onCancelEdit={cancelEditing}
            onUpdateEdit={updateEditingItem}
            onSaveEdit={saveItem}
            isSaving={isSaving}
          />

          {/* Pagination */}
          <BOQViewerPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={boqData.items.length}
            filteredItems={filteredAndSortedItems.length}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        /* Empty State */
        <BOQViewerEmptyState
          totalItems={boqData.items.length}
          filters={filters}
          onClearFilters={handleClearFilters}
        />
      )}
    </div>
  );
}