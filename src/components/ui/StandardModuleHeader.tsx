import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Download } from 'lucide-react';

interface StandardModuleHeaderProps {
  title: string;
  description: string;
  onImport?: () => void;
  onExport?: () => void;
  onAdd?: () => void;
  addButtonText?: string;
  addButtonPath?: string;
  itemCount?: number;
  showImport?: boolean;
  showExport?: boolean;
  showAdd?: boolean;
  exportDisabled?: boolean;
}

export function StandardModuleHeader({
  title,
  description,
  onImport,
  onExport,
  onAdd,
  addButtonText = 'Add Item',
  addButtonPath,
  itemCount = 0,
  showImport = true,
  showExport = true,
  showAdd = true,
  exportDisabled = false
}: StandardModuleHeaderProps) {
  const navigate = useNavigate();

  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    } else if (addButtonPath) {
      navigate(addButtonPath);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      <div className="flex gap-3">
        {showImport && onImport && (
          <button
            onClick={onImport}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
        )}
        {showExport && onExport && (
          <button
            onClick={onExport}
            disabled={exportDisabled || itemCount === 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        )}
        {showAdd && (
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {addButtonText}
          </button>
        )}
      </div>
    </div>
  );
}