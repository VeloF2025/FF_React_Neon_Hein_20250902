/**
 * BOQ Viewer Statistics Component
 */

import { FileText, CheckCircle, AlertTriangle, Calculator } from 'lucide-react';
import { BOQWithItems } from '@/types/procurement/boq.types';

interface BOQViewerStatisticsProps {
  boqData: BOQWithItems;
}

export default function BOQViewerStatistics({ boqData }: BOQViewerStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-blue-500" />
          <span className="ml-2 text-sm font-medium text-gray-900">Total Items</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-1">{boqData.itemCount}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="ml-2 text-sm font-medium text-gray-900">Mapped</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-1">{boqData.mappedItems}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span className="ml-2 text-sm font-medium text-gray-900">Exceptions</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-1">{boqData.exceptionsCount}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center">
          <Calculator className="h-5 w-5 text-purple-500" />
          <span className="ml-2 text-sm font-medium text-gray-900">Est. Value</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {boqData.totalEstimatedValue 
            ? `R${boqData.totalEstimatedValue.toLocaleString()}` 
            : 'TBD'
          }
        </p>
      </div>
    </div>
  );
}