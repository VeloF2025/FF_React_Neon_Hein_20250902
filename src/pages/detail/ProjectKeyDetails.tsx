/**
 * Project Key Details Component
 * Sidebar showing key project information
 */

import { Calendar, DollarSign, Clock, Users } from 'lucide-react';
import { Project } from '@/types/project.types';
import { formatDate, formatCurrency } from './ProjectDetailUtils';

interface ProjectKeyDetailsProps {
  project: Project;
}

export function ProjectKeyDetails({ project }: ProjectKeyDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Details</h2>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">Start Date</p>
            <p className="text-sm text-gray-500">{formatDate(project.startDate)}</p>
          </div>
        </div>

        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">Expected End</p>
            <p className="text-sm text-gray-500">{formatDate(project.endDate)}</p>
          </div>
        </div>

        <div className="flex items-center">
          <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">Budget</p>
            <p className="text-sm text-gray-500">{formatCurrency(project.budget || 0)}</p>
          </div>
        </div>

        <div className="flex items-center">
          <Clock className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">Working Hours</p>
            <p className="text-sm text-gray-500">N/A</p>
          </div>
        </div>

        {project.projectManager && (
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Project Manager</p>
              <p className="text-sm text-gray-500">{project.projectManager}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}