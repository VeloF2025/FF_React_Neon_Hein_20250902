/**
 * Project API Service
 * Handles all project-related API calls
 */

import { Project, ProjectFilter, ProjectFormData } from '@/types/project.types';
import { log } from '@/lib/logger';

const API_BASE = import.meta.env.DEV ? 'http://localhost:5173/api' : '/api';

export const projectApi = {
  /**
   * Get all projects with optional filtering
   */
  async getAllProjects(filter?: ProjectFilter): Promise<Project[]> {
    try {
      let url = `${API_BASE}/projects`;
      const params = new URLSearchParams();

      if (filter) {
        if (filter.status) {
          params.append('status', filter.status);
        }
        if (filter.clientId) {
          params.append('clientId', filter.clientId);
        }
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      log.error('Error fetching projects:', { error }, 'projectApi');
      throw error;
    }
  },

  /**
   * Get a single project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const response = await fetch(`${API_BASE}/projects?id=${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.status}`);
      }

      const result = await response.json();
      return result.data || null;
    } catch (error) {
      log.error('Error fetching project by ID:', { error, id }, 'projectApi');
      throw error;
    }
  },

  /**
   * Get projects by client ID
   */
  async getProjectsByClient(clientId: string): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE}/projects?clientId=${clientId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch projects by client: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      log.error('Error fetching projects by client:', { error, clientId }, 'projectApi');
      return [];
    }
  },

  /**
   * Get projects by status
   */
  async getProjectsByStatus(status: string): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE}/projects?status=${status}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch projects by status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      log.error('Error fetching projects by status:', { error, status }, 'projectApi');
      return [];
    }
  },

  /**
   * Search projects by name or code
   */
  async searchProjects(searchTerm: string): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE}/projects?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`Failed to search projects: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      log.error('Error searching projects:', { error, searchTerm }, 'projectApi');
      return [];
    }
  },

  /**
   * Get active projects only
   */
  async getActiveProjects(): Promise<Project[]> {
    try {
      // Get all projects that are not completed, archived, or cancelled
      const response = await fetch(`${API_BASE}/projects`);
      if (!response.ok) {
        throw new Error(`Failed to fetch active projects: ${response.status}`);
      }

      const result = await response.json();
      // Filter out completed, archived, and cancelled projects on the client side
      const activeProjects = (result.data || []).filter((project: Project) => {
        const inactiveStatuses = ['completed', 'archived', 'cancelled', 'on_hold'];
        return !inactiveStatuses.includes(project.status?.toLowerCase() || '');
      });
      
      return activeProjects;
    } catch (error) {
      log.error('Error fetching active projects:', { error }, 'projectApi');
      return [];
    }
  },
  /**
   * Create a new project
   */
  async createProject(data: ProjectFormData): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_code: data.code,
          project_name: data.name,
          client_id: data.clientId,
          description: data.description,
          project_type: data.projectType,
          status: data.status || 'PLANNING',
          priority: data.priority || 'MEDIUM',
          start_date: data.startDate,
          end_date: data.endDate,
          budget: data.budget,
          project_manager: data.projectManagerId,
          location: data.location,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.status}`);
      }

      const result = await response.json();
      return result.data?.id || '';
    } catch (error) {
      log.error('Error creating project:', { error, data }, 'projectApi');
      throw error;
    }
  },

  /**
   * Update an existing project
   */
  async updateProject(id: string, data: Partial<ProjectFormData>): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_name: data.name,
          project_code: data.code,
          client_id: data.clientId,
          description: data.description,
          project_type: data.projectType,
          status: data.status,
          priority: data.priority,
          start_date: data.startDate,
          end_date: data.endDate,
          budget: data.budget,
          project_manager: data.projectManagerId,
          location: data.location,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.status}`);
      }
    } catch (error) {
      log.error('Error updating project:', { error, id, data }, 'projectApi');
      throw error;
    }
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.status}`);
      }
    } catch (error) {
      log.error('Error deleting project:', { error, id }, 'projectApi');
      throw error;
    }
  },

  /**
   * Update project status
   */
  async updateProjectStatus(id: string, status: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update project status: ${response.status}`);
      }
    } catch (error) {
      log.error('Error updating project status:', { error, id, status }, 'projectApi');
      throw error;
    }
  },

  /**
   * Update project progress
   */
  async updateProjectProgress(id: string, progress: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update project progress: ${response.status}`);
      }
    } catch (error) {
      log.error('Error updating project progress:', { error, id, progress }, 'projectApi');
      throw error;
    }
  },

  /**
   * Update project budget
   */
  async updateProjectBudget(id: string, budget: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ budget }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update project budget: ${response.status}`);
      }
    } catch (error) {
      log.error('Error updating project budget:', { error, id, budget }, 'projectApi');
      throw error;
    }
  },

  /**
   * Assign project to client
   */
  async assignProjectToClient(projectId: string, clientId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ client_id: clientId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to assign project to client: ${response.status}`);
      }
    } catch (error) {
      log.error('Error assigning project to client:', { error, projectId, clientId }, 'projectApi');
      throw error;
    }
  },

  /**
   * Update project dates
   */
  async updateProjectDates(
    id: string,
    startDate?: Date | null,
    endDate?: Date | null
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update project dates: ${response.status}`);
      }
    } catch (error) {
      log.error('Error updating project dates:', { error, id, startDate, endDate }, 'projectApi');
      throw error;
    }
  },
};