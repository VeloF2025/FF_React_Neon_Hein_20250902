/**
 * BOQ Viewer Filters Component
 */

import { Search, Settings } from 'lucide-react';
import { FilterState, VisibleColumns, INITIAL_FILTERS } from './BOQViewerTypes';

interface BOQViewerFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  filterOptions: {
    phases: string[];
    categories: string[];
  };
  visibleColumns: VisibleColumns;
  setVisibleColumns: (columns: VisibleColumns) => void;
}

export default function BOQViewerFilters({
  filters,
  setFilters,
  filterOptions,
  visibleColumns,
  setVisibleColumns
}: BOQViewerFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>

        {/* Mapping Status */}
        <select
          value={filters.mappingStatus}
          onChange={(e) => setFilters({ ...filters, mappingStatus: e.target.value as any })}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All Mapping Status</option>
          <option value="pending">Pending</option>
          <option value="mapped">Mapped</option>
          <option value="manual">Manual</option>
          <option value="exception">Exception</option>
        </select>

        {/* Procurement Status */}
        <select
          value={filters.procurementStatus}
          onChange={(e) => setFilters({ ...filters, procurementStatus: e.target.value as any })}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All Procurement Status</option>
          <option value="pending">Pending</option>
          <option value="rfq_created">RFQ Created</option>
          <option value="quoted">Quoted</option>
          <option value="awarded">Awarded</option>
          <option value="ordered">Ordered</option>
        </select>

        {/* Phase */}
        <select
          value={filters.phase}
          onChange={(e) => setFilters({ ...filters, phase: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All Phases</option>
          {filterOptions.phases.map(phase => (
            <option key={phase} value={phase}>{phase}</option>
          ))}
        </select>

        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All Categories</option>
          {filterOptions.categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hasIssues === true}
              onChange={(e) => setFilters({ 
                ...filters, 
                hasIssues: e.target.checked ? true : null 
              })}
              className="rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Show only items with issues</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilters(INITIAL_FILTERS)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>

          {/* Column Settings */}
          <div className="relative group">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Settings className="h-4 w-4" />
            </button>
            
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border hidden group-hover:block z-10">
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-700 px-2 py-1">Visible Columns</div>
                {Object.keys(visibleColumns).map(key => (
                  <label key={key} className="flex items-center px-2 py-1 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={visibleColumns[key as keyof VisibleColumns]}
                      onChange={(e) => setVisibleColumns({
                        ...visibleColumns,
                        [key]: e.target.checked
                      })}
                      className="rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}