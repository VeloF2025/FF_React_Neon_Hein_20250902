/**
 * Project Client Information Form Section
 */

import { ProjectFormData } from '@/types/project.types';
import { ClientDropdownOption } from '@/types/client.types';

interface ProjectClientInfoProps {
  formData: ProjectFormData;
  onInputChange: (field: keyof ProjectFormData, value: any) => void;
  clients: ClientDropdownOption[];
  isClientsLoading: boolean;
}

export function ProjectClientInfo({ 
  formData, 
  onInputChange, 
  clients, 
  isClientsLoading 
}: ProjectClientInfoProps) {
  // Debug logging
  console.log('🎯 ProjectClientInfo - clients:', clients);
  console.log('🎯 ProjectClientInfo - isClientsLoading:', isClientsLoading);
  console.log('🎯 ProjectClientInfo - clients length:', clients?.length);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Organization *
            </label>
            <select
              value={formData.clientId || ''}
              onChange={(e) => onInputChange('clientId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 force-dark-text"
              style={{ 
                color: '#000000', 
                backgroundColor: '#ffffff',
                '--tw-text-opacity': '1' 
              } as React.CSSProperties}
              required
              disabled={isClientsLoading}
            >
              <option value="" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                {isClientsLoading ? 'Loading clients...' : 'Select a client'}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id} style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                  {client.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Choose the client organization for this project
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}