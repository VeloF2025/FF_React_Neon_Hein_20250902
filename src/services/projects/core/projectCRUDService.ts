/**
 * Project CRUD Service
 * Routes all database operations through API endpoints
 */

import type { ProjectFormData } from '@/types/project.types';
import { projectApi } from '@/services/api/projectApi';

/**
 * Project CRUD operations service
 */
export class ProjectCRUDService {
  /**
   * Create a new project
   */
  static async createProject(data: ProjectFormData): Promise<string> {
    return projectApi.createProject(data);
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, data: Partial<ProjectFormData>): Promise<void> {
    return projectApi.updateProject(id, data);
  }

  /**
   * Delete a project (soft delete by setting is_active = false)
   */
  static async deleteProject(id: string): Promise<void> {
    return projectApi.deleteProject(id);
  }

  /**
   * Hard delete a project (permanent removal)
   */
  static async hardDeleteProject(id: string): Promise<void> {
    return projectApi.deleteProject(id);
  }

  /**
   * Update project status
   */
  static async updateProjectStatus(id: string, status: string): Promise<void> {
    return projectApi.updateProjectStatus(id, status);
  }

  /**
   * Update project progress
   */
  static async updateProjectProgress(id: string, progress: number): Promise<void> {
    return projectApi.updateProjectProgress(id, progress);
  }

  /**
   * Update project budget
   */
  static async updateProjectBudget(id: string, budget: number): Promise<void> {
    return projectApi.updateProjectBudget(id, budget);
  }

  /**
   * Restore a soft-deleted project
   */
  static async restoreProject(id: string): Promise<void> {
    // Update status to restore the project
    return projectApi.updateProjectStatus(id, 'ACTIVE');
  }

  /**
   * Bulk update project status
   */
  static async bulkUpdateStatus(projectIds: string[], status: string): Promise<void> {
    // Call API for each project - could be optimized with a bulk endpoint
    await Promise.all(
      projectIds.map(id => projectApi.updateProjectStatus(id, status))
    );
  }

  /**
   * Assign project to client
   */
  static async assignProjectToClient(projectId: string, clientId: string): Promise<void> {
    return projectApi.assignProjectToClient(projectId, clientId);
  }

  /**
   * Update project dates
   */
  static async updateProjectDates(
    id: string, 
    startDate?: Date | null, 
    endDate?: Date | null
  ): Promise<void> {
    return projectApi.updateProjectDates(id, startDate, endDate);
  }
}