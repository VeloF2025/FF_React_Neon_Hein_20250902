/**
 * Contractor Info Section
 * Header section with company name, status, and basic info
 */

import { ContractorSectionProps, ragColors, statusColors } from './types';

export function ContractorInfoSection({ contractor }: ContractorSectionProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{contractor.companyName}</h1>
      <div className="flex items-center gap-4 mt-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[contractor.status || 'pending']}`}>
          {(contractor.status || 'pending').replace('_', ' ').toUpperCase()}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ragColors[contractor.ragOverall || 'amber']}`}>
          RAG: {(contractor.ragOverall || 'amber').toUpperCase()}
        </span>
        <span className="text-sm text-gray-500">
          {contractor.registrationNumber || 'N/A'}
        </span>
      </div>
      <p className="text-gray-600 mt-1">{contractor.industryCategory || 'Not specified'}</p>
    </div>
  );
}