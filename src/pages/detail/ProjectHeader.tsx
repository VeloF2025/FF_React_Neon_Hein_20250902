/**
 * Project Detail Header Component
 */

import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Project } from '@/types/project.types';
import { statusColors, priorityColors } from './ProjectDetailHelpers';

interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function ProjectHeader({ 
  project, 
  onBack, 
  onEdit, 
  onDelete, 
  isDeleting 
}: ProjectHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.code}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Project Status & Priority */}
      <div className="flex items-center gap-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>
          {project.status ? (project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')) : 'Unknown'}
        </span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityColors[project.priority] || 'bg-gray-100 text-gray-800'}`}>
          {project.priority ? (project.priority.charAt(0).toUpperCase() + project.priority.slice(1) + ' Priority') : 'No Priority'}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          {project.projectType ? project.projectType.toUpperCase() : 'STANDARD'}
        </span>
      </div>
    </>
  );
}