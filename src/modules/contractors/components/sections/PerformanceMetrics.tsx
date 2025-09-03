/**
 * Performance Metrics Section
 * Displays RAG scores and performance ratings
 */

import { Award } from 'lucide-react';
import { Contractor } from '@/types/contractor.types';

interface PerformanceMetricsProps {
  contractor: Contractor;
}

export function PerformanceMetrics({ contractor }: PerformanceMetricsProps) {
  const ragColors = {
    green: 'bg-green-100 text-green-800',
    amber: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Performance & RAG Scores</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{contractor.performanceScore || 'N/A'}</p>
          <p className="text-sm text-gray-600">Performance</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{contractor.safetyScore || 'N/A'}</p>
          <p className="text-sm text-gray-600">Safety</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Financial</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ragColors[contractor.ragFinancial || 'amber']}`}>
            {(contractor.ragFinancial || 'amber').toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Compliance</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ragColors[contractor.ragCompliance || 'amber']}`}>
            {(contractor.ragCompliance || 'amber').toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Performance</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ragColors[contractor.ragPerformance || 'amber']}`}>
            {(contractor.ragPerformance || 'amber').toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Safety</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ragColors[contractor.ragSafety || 'amber']}`}>
            {(contractor.ragSafety || 'amber').toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}