/**
 * Projects Data Hook
 * Custom hook for projects data management and statistics
 */

import { useMemo } from 'react';
import { ProjectStatus, ProjectPriority } from '@/types/project.types';
import { useProjects, useDeleteProject, useProjectFilters } from '@/hooks/useProjects';
import { ProjectSummaryCard } from '../types';
import { ProjectFilter } from '@/types/project/form.types';
import { Building2, Activity, Clock, AlertCircle } from 'lucide-react';

export function useProjectsData(filter?: ProjectFilter) {
  const { 
    filter: appliedFilter, 
    updateFilter, 
    clearFilter, 
    hasActiveFilters 
  } = useProjectFilters();
  
  const { data: projects = [], isLoading, error } = useProjects(filter || appliedFilter);
  const deleteMutation = useDeleteProject();

  // Calculate summary statistics
  const summaryStats: ProjectSummaryCard[] = useMemo(() => [
    {
      title: 'Total Projects',
      value: projects.length,
      icon: Building2,
      color: 'blue' as const,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Active Projects',
      value: projects.filter(p => p.status === ProjectStatus.ACTIVE).length,
      icon: Activity,
      color: 'green' as const,
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'On Hold',
      value: projects.filter(p => p.status === ProjectStatus.ON_HOLD).length,
      icon: Clock,
      color: 'yellow' as const,
      trend: { value: 3, isPositive: false }
    },
    {
      title: 'Critical Priority',
      value: projects.filter(p => p.priority === ProjectPriority.CRITICAL).length,
      icon: AlertCircle,
      color: 'red' as const,
      trend: { value: 2, isPositive: false }
    }
  ], [projects]);

  // Filter projects by search term
  const getFilteredProjects = (searchTerm: string) => {
    return projects.filter(project => {
      // Handle both 'name' and 'project_name' fields for compatibility
      const projectName = (project.name || project.project_name || '');
      const projectCode = (project.code || project.project_code || '');
      const clientName = (project.clientName || project.client_name || '');
      
      return projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return {
    projects,
    isLoading,
    error,
    summaryStats,
    filter: appliedFilter,
    updateFilter,
    clearFilter,
    hasActiveFilters,
    getFilteredProjects,
    handleDeleteProject,
    deleteMutation
  };
}