/**
 * Contractor Info Section
 * Main contractor information display with status and RAG score
 */

import { Contractor } from '@/types/contractor.types';

interface ContractorInfoProps {
  contractor: Contractor;
}

export function ContractorInfo({ contractor }: ContractorInfoProps) {
  const ragColors = {
    green: 'bg-green-100 text-green-800',
    amber: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    blacklisted: 'bg-red-100 text-red-800',
    under_review: 'bg-blue-100 text-blue-800'
  };

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