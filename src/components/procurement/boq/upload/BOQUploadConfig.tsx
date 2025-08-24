/**
 * BOQ Upload Configuration Component
 */

import { ImportConfig } from '@/services/procurement/boqImportService';

interface BOQUploadConfigProps {
  config: Partial<ImportConfig>;
  showAdvanced: boolean;
  onConfigChange: (config: Partial<ImportConfig>) => void;
  onToggleAdvanced: () => void;
}

export function BOQUploadConfig({ 
  config, 
  showAdvanced, 
  onConfigChange, 
  onToggleAdvanced 
}: BOQUploadConfigProps) {
  return (
    <div className="border rounded-lg p-4">
      <button
        onClick={onToggleAdvanced}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-medium text-gray-900">Import Configuration</span>
        <span className="text-sm text-gray-500">
          {showAdvanced ? 'Hide' : 'Show'} advanced options
        </span>
      </button>
      
      {showAdvanced && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.autoApprove}
                  onChange={(e) => onConfigChange({ ...config, autoApprove: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Auto-approve items
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                Automatically approve items with high confidence mapping
              </p>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.strictValidation}
                  onChange={(e) => onConfigChange({ ...config, strictValidation: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Strict validation
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                Reject items with any validation errors
              </p>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.createNewItems}
                  onChange={(e) => onConfigChange({ ...config, createNewItems: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Create new catalog items
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                Add unmapped items to the catalog
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duplicate handling
              </label>
              <select
                value={config.duplicateHandling}
                onChange={(e) => onConfigChange({ ...config, duplicateHandling: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="skip">Skip duplicates</option>
                <option value="update">Update existing</option>
                <option value="append">Add as new</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Minimum mapping confidence: {Math.round((config.minMappingConfidence || 0.8) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={(config.minMappingConfidence || 0.8) * 100}
              onChange={(e) => onConfigChange({ ...config, minMappingConfidence: parseInt(e.target.value) / 100 })}
              className="mt-1 block w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}