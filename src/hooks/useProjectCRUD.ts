/**
 * useProjectCRUD Hook
 * 
 * Custom React hook for project CRUD operations.
 * Provides a consistent interface for components to interact with projects.
 * Ensures data consistency across create, read, update, and delete operations.
 */

import { useState, useCallback, useEffect } from 'react';
import { projectRepository, Project, ProjectFormData, ProjectFilter } from '@/services/project';

interface UseProjectCRUDResult {
  // Data
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  
  // Operations
  createProject: (formData: ProjectFormData) => Promise<Project>;
  updateProject: (id: string, formData: Partial<ProjectFormData>) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;
  getProject: (id: string) => Promise<Project | null>;
  refreshProjects: () => Promise<void>;
  searchProjects: (searchTerm: string) => Promise<void>;
  filterProjects: (filter: ProjectFilter) => Promise<void>;
  
  // State management
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
  
  // Statistics
  getStatistics: () => Promise<any>;
}

export function useProjectCRUD(): UseProjectCRUDResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Load all projects
   */
  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allProjects = await projectRepository.getAll();
      setProjects(allProjects);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects';
      setError(message);
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Create a new project
   */
  const createProject = useCallback(async (formData: ProjectFormData): Promise<Project> => {
    setLoading(true);
    setError(null);
    
    try {
      const newProject = await projectRepository.create(formData);
      
      // Update local state
      setProjects(prev => [...prev, newProject]);
      setCurrentProject(newProject);
      
      return newProject;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      setError(message);
      console.error('Error creating project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Update an existing project
   */
  const updateProject = useCallback(async (
    id: string, 
    formData: Partial<ProjectFormData>
  ): Promise<Project> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await projectRepository.update(id, formData);
      
      // Update local state
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      
      // Update current project if it's the one being updated
      if (currentProject?.id === id) {
        setCurrentProject(updatedProject);
      }
      
      return updatedProject;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update project';
      setError(message);
      console.error('Error updating project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);
  
  /**
   * Delete a project
   */
  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await projectRepository.delete(id);
      
      if (result) {
        // Update local state
        setProjects(prev => prev.filter(p => p.id !== id));
        
        // Clear current project if it's the one being deleted
        if (currentProject?.id === id) {
          setCurrentProject(null);
        }
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      setError(message);
      console.error('Error deleting project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);
  
  /**
   * Get a specific project by ID
   */
  const getProject = useCallback(async (id: string): Promise<Project | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const project = await projectRepository.getById(id);
      
      if (project) {
        setCurrentProject(project);
        
        // Update in local projects list if present
        setProjects(prev => {
          const index = prev.findIndex(p => p.id === id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = project;
            return updated;
          }
          return prev;
        });
      }
      
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get project';
      setError(message);
      console.error('Error getting project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Refresh all projects
   */
  const refreshProjects = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);
  
  /**
   * Search projects
   */
  const searchProjects = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await projectRepository.searchProjects(searchTerm);
      setProjects(results);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search projects';
      setError(message);
      console.error('Error searching projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Filter projects
   */
  const filterProjects = useCallback(async (filter: ProjectFilter) => {
    setLoading(true);
    setError(null);
    
    try {
      const filtered = await projectRepository.getAll({ filter });
      setProjects(filtered);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to filter projects';
      setError(message);
      console.error('Error filtering projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Get project statistics
   */
  const getStatistics = useCallback(async () => {
    try {
      return await projectRepository.getProjectSummary();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get statistics';
      setError(message);
      console.error('Error getting statistics:', err);
      throw err;
    }
  }, []);
  
  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);
  
  return {
    // Data
    projects,
    currentProject,
    loading,
    error,
    
    // Operations
    createProject,
    updateProject,
    deleteProject,
    getProject,
    refreshProjects,
    searchProjects,
    filterProjects,
    
    // State management
    setCurrentProject,
    clearError,
    
    // Statistics
    getStatistics
  };
}

/**
 * Hook for managing a single project
 */
export function useProject(projectId: string | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadProject = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const loadedProject = await projectRepository.getById(projectId);
      setProject(loadedProject);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load project';
      setError(message);
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  const updateProject = useCallback(async (formData: Partial<ProjectFormData>) => {
    if (!projectId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const updated = await projectRepository.update(projectId, formData);
      setProject(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update project';
      setError(message);
      console.error('Error updating project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  const deleteProject = useCallback(async () => {
    if (!projectId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await projectRepository.delete(projectId);
      if (result) {
        setProject(null);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      setError(message);
      console.error('Error deleting project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  const refresh = useCallback(async () => {
    await loadProject();
  }, [loadProject]);
  
  useEffect(() => {
    loadProject();
  }, [loadProject]);
  
  return {
    project,
    loading,
    error,
    updateProject,
    deleteProject,
    refresh
  };
}