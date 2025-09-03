/**
 * Project Detail Helper Functions and Constants
 */

import { ProjectStatus, ProjectPriority, PhaseStatus } from '@/types/project.types';
import { CheckCircle, PlayCircle, AlertCircle, Circle } from 'lucide-react';

export const statusColors = {
  [ProjectStatus.PLANNING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  [ProjectStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  [ProjectStatus.ON_HOLD]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  [ProjectStatus.COMPLETED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
};

export const priorityColors = {
  [ProjectPriority.LOW]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  [ProjectPriority.MEDIUM]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [ProjectPriority.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  [ProjectPriority.CRITICAL]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
};

export const getPhaseStatusIcon = (status: PhaseStatus) => {
  switch (status) {
    case PhaseStatus.COMPLETED:
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case PhaseStatus.IN_PROGRESS:
      return <PlayCircle className="h-5 w-5 text-blue-600" />;
    case PhaseStatus.ON_HOLD:
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
};