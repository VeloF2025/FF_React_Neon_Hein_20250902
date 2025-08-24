/**
 * SOW Data Status Component
 */

import { CheckCircle } from 'lucide-react';

interface SOWDataStatusProps {
  sowData: any;
  polesCount: number;
  dropsCount: number;
  fibreCount: number;
}

export function SOWDataStatus({ 
  sowData, 
  polesCount, 
  dropsCount, 
  fibreCount 
}: SOWDataStatusProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3">Data Status</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Source:</span>
          <span className="ml-2 font-medium">Firebase Firestore</span>
        </div>
        <div>
          <span className="text-gray-600">Last Updated:</span>
          <span className="ml-2 font-medium">
            {sowData?.poles?.uploadedAt ? new Date(sowData.poles.uploadedAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Total Items:</span>
          <span className="ml-2 font-medium">
            {polesCount + dropsCount + fibreCount}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Status:</span>
          <span className="ml-2 font-medium text-green-600">
            <CheckCircle className="inline w-4 h-4 mr-1" />
            Active
          </span>
        </div>
      </div>
    </div>
  );
}