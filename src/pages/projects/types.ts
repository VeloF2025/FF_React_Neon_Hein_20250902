/**
 * Projects Page Types
 * Type definitions for projects page components
 */

import { Project, ProjectStatus, ProjectType, ProjectPriority } from '@/types/project.types';
import { LucideIcon } from 'lucide-react';

export interface ProjectsPageProps {
  searchTerm?: string;
  initialFilter?: ProjectFilter;
}

export interface ProjectFilter {
  status?: ProjectStatus[];
  projectType?: ProjectType[];
  priority?: ProjectPriority[];
  clientId?: string[];
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
  };
}

export interface ProjectSummaryCard {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend: {
    value: number;
    isPositive: boolean;
  };
}

export interface ProjectTableColumn {
  key: string;
  header: string;
  render?: (project: Project) => React.ReactNode;
}

export interface ProjectCardProps {
  project: Project;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (timestamp: any) => string;
}

export interface ProjectFiltersProps {
  filter: ProjectFilter;
  onUpdateFilter: (updates: Partial<ProjectFilter>) => void;
  onClearFilter: () => void;
  showFilters: boolean;
  onToggleFilters: (show: boolean) => void;
}

export interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
  viewMode: 'card' | 'table';
  searchTerm: string;
  onProjectView: (id: string) => void;
  onProjectEdit: (id: string) => void;
  onProjectDelete: (id: string) => void;
}

// Status and priority styling
export const statusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: 'bg-gray-100 text-gray-800',
  [ProjectStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [ProjectStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
  [ProjectStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
  [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

export const priorityColors: Record<ProjectPriority, string> = {
  [ProjectPriority.LOW]: 'bg-gray-100 text-gray-800',
  [ProjectPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [ProjectPriority.HIGH]: 'bg-orange-100 text-orange-800',
  [ProjectPriority.CRITICAL]: 'bg-red-100 text-red-800',
};