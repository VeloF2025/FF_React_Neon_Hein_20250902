/**
 * ProjectRepository
 * 
 * Central repository for all project CRUD operations.
 * Ensures data consistency across create, read, update, and delete operations.
 * 
 * This is the SINGLE source of truth for project data operations.
 * All project data access should go through this repository.
 */

import { ProjectTransformer } from './ProjectTransformer';
import { ProjectApiClient } from './ProjectApiClient';
import {
  Project,
  DbProject,
  ProjectFormData,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilter,
  ProjectQueryOptions,
  ProjectStatus,
  ProjectPriority,
  ProjectType
} from '@/types/project.types';

export class ProjectRepository {
  private static instance: ProjectRepository;
  private apiClient: ProjectApiClient;
  private cache: Map<string, Project> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private lastCacheTime: number = 0;
  
  private constructor() {
    this.apiClient = new ProjectApiClient();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): ProjectRepository {
    if (!ProjectRepository.instance) {
      ProjectRepository.instance = new ProjectRepository();
    }
    return ProjectRepository.instance;
  }
  
  // ============================================================================
  // CRUD Operations
  // ============================================================================
  
  /**
   * Create a new project
   * Ensures consistent data structure from creation through all subsequent operations
   */
  async create(formData: ProjectFormData): Promise<Project> {
    // Transform form data to project structure
    const projectData = ProjectTransformer.fromFormData(formData);
    
    // Set defaults for required fields
    projectData.createdAt = new Date().toISOString();
    projectData.createdBy = this.getCurrentUserId();
    projectData.progressPercentage = 0;
    projectData.isActive = true;
    projectData.isArchived = false;
    
    // Validate and normalize
    const normalizedProject = ProjectTransformer.normalize(projectData as Project);
    
    // Transform to database format
    const dbData = ProjectTransformer.toDatabase(normalizedProject);
    
    // Validate database requirements
    const errors = ProjectTransformer.validateForDatabase(dbData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    
    // Send to API
    const createdDbProject = await this.apiClient.create(dbData as DbProject);
    
    // Transform response back to application format
    const createdProject = ProjectTransformer.fromDatabase(createdDbProject);
    
    // Populate related data
    await this.populateRelatedData(createdProject);
    
    // Cache the created project
    this.cache.set(createdProject.id, createdProject);
    
    return createdProject;
  }
  
  /**
   * Get a project by ID
   * Returns the exact same structure that was created/updated
   */
  async getById(id: string, forceRefresh = false): Promise<Project | null> {
    // Check cache first
    if (!forceRefresh && this.cache.has(id)) {
      const cached = this.cache.get(id)!;
      if (this.isCacheValid()) {
        return cached;
      }
    }
    
    // Fetch from API
    const dbProject = await this.apiClient.getById(id);
    if (!dbProject) {
      return null;
    }
    
    // Transform to application format
    const project = ProjectTransformer.fromDatabase(dbProject);
    
    // Populate related data
    await this.populateRelatedData(project);
    
    // Update cache
    this.cache.set(project.id, project);
    
    return project;
  }
  
  /**
   * Update a project
   * Ensures the updated data maintains the same structure
   */
  async update(id: string, formData: Partial<ProjectFormData>): Promise<Project> {
    // Get existing project to preserve data
    const existingProject = await this.getById(id, true);
    if (!existingProject) {
      throw new Error(`Project ${id} not found`);
    }
    
    // Transform form data to project structure, preserving existing data
    const updates = ProjectTransformer.fromFormData(formData as ProjectFormData, existingProject);
    
    // Add audit fields
    updates.updatedAt = new Date().toISOString();
    updates.updatedBy = this.getCurrentUserId();
    
    // Merge with existing data
    const updatedProject = {
      ...existingProject,
      ...updates
    };
    
    // Normalize to ensure consistency
    const normalizedProject = ProjectTransformer.normalize(updatedProject);
    
    // Transform to database format (only send changed fields)
    const dbUpdates = ProjectTransformer.toDatabase(updates);
    
    // Send to API
    const updatedDbProject = await this.apiClient.update(id, dbUpdates);
    
    // Transform response back to application format
    const resultProject = ProjectTransformer.fromDatabase(updatedDbProject);
    
    // Populate related data
    await this.populateRelatedData(resultProject);
    
    // Update cache
    this.cache.set(resultProject.id, resultProject);
    
    return resultProject;
  }
  
  /**
   * Delete a project
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.apiClient.delete(id);
    
    // Remove from cache
    this.cache.delete(id);
    
    return result;
  }
  
  /**
   * Get all projects with optional filtering
   */
  async getAll(options?: ProjectQueryOptions): Promise<Project[]> {
    // Check if we can use cached data
    if (!options && this.isCacheValid() && this.cache.size > 0) {
      return Array.from(this.cache.values());
    }
    
    // Fetch from API
    const dbProjects = await this.apiClient.getAll(options);
    
    // Transform to application format
    const projects = await Promise.all(
      dbProjects.map(async (dbProject) => {
        const project = ProjectTransformer.fromDatabase(dbProject);
        await this.populateRelatedData(project);
        return project;
      })
    );
    
    // Update cache if no filters applied
    if (!options) {
      this.cache.clear();
      projects.forEach(project => this.cache.set(project.id, project));
      this.lastCacheTime = Date.now();
    }
    
    return projects;
  }
  
  // ============================================================================
  // Specialized Queries
  // ============================================================================
  
  /**
   * Get active projects
   */
  async getActiveProjects(): Promise<Project[]> {
    return this.getAll({
      filter: {
        status: [ProjectStatus.ACTIVE, ProjectStatus.IN_PROGRESS]
      }
    });
  }
  
  /**
   * Get projects by client
   */
  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return this.getAll({
      filter: { clientId }
    });
  }
  
  /**
   * Get projects by status
   */
  async getProjectsByStatus(status: ProjectStatus | ProjectStatus[]): Promise<Project[]> {
    return this.getAll({
      filter: { status }
    });
  }
  
  /**
   * Search projects
   */
  async searchProjects(searchTerm: string): Promise<Project[]> {
    return this.getAll({
      filter: { search: searchTerm }
    });
  }
  
  /**
   * Get project summary statistics
   */
  async getProjectSummary(): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
    totalBudget: number;
    totalActualCost: number;
    averageProgress: number;
  }> {
    const projects = await this.getAll();
    
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => 
        p.status === ProjectStatus.ACTIVE || p.status === ProjectStatus.IN_PROGRESS
      ).length,
      completedProjects: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
      onHoldProjects: projects.filter(p => p.status === ProjectStatus.ON_HOLD).length,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      totalActualCost: projects.reduce((sum, p) => sum + (p.actualCost || 0), 0),
      averageProgress: projects.length > 0
        ? projects.reduce((sum, p) => sum + p.progressPercentage, 0) / projects.length
        : 0
    };
  }
  
  // ============================================================================
  // Data Consistency Methods
  // ============================================================================
  
  /**
   * Validate project data consistency
   * Ensures that created data matches what's retrieved
   */
  async validateConsistency(projectId: string): Promise<{
    isConsistent: boolean;
    differences: string[];
  }> {
    const differences: string[] = [];
    
    // Get fresh data from API
    const dbProject = await this.apiClient.getById(projectId);
    if (!dbProject) {
      return {
        isConsistent: false,
        differences: ['Project not found in database']
      };
    }
    
    // Transform and get cached version
    const apiProject = ProjectTransformer.fromDatabase(dbProject);
    const cachedProject = this.cache.get(projectId);
    
    if (!cachedProject) {
      return { isConsistent: true, differences: [] };
    }
    
    // Compare key fields
    const fieldsToCheck: (keyof Project)[] = [
      'code', 'name', 'type', 'status', 'priority',
      'clientId', 'startDate', 'endDate', 'budget',
      'progressPercentage', 'description'
    ];
    
    for (const field of fieldsToCheck) {
      if (apiProject[field] !== cachedProject[field]) {
        differences.push(
          `Field '${field}' mismatch: API="${apiProject[field]}" vs Cache="${cachedProject[field]}"`
        );
      }
    }
    
    return {
      isConsistent: differences.length === 0,
      differences
    };
  }
  
  /**
   * Refresh project data from database
   * Ensures cache is synchronized with database
   */
  async refresh(projectId?: string): Promise<void> {
    if (projectId) {
      // Refresh specific project
      const dbProject = await this.apiClient.getById(projectId);
      if (dbProject) {
        const project = ProjectTransformer.fromDatabase(dbProject);
        await this.populateRelatedData(project);
        this.cache.set(project.id, project);
      }
    } else {
      // Refresh all cached projects
      this.cache.clear();
      this.lastCacheTime = 0;
      await this.getAll();
    }
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  /**
   * Populate related data for a project
   * Fetches and attaches client name, manager name, etc.
   */
  private async populateRelatedData(project: Project): Promise<void> {
    // This would typically fetch related data from other services
    // For now, we'll just ensure the data structure is complete
    
    // Ensure arrays are initialized
    project.teamMembers = project.teamMembers || [];
    project.milestones = project.milestones || [];
    project.deliverables = project.deliverables || [];
    project.risks = project.risks || [];
    project.dependencies = project.dependencies || [];
    project.tags = project.tags || [];
    
    // In a real implementation, we would fetch:
    // - Client name from clients service
    // - Project manager name from staff service
    // - Team lead name from staff service
    // - Team member details from staff service
  }
  
  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheTime < this.cacheTimeout;
  }
  
  /**
   * Get current user ID
   * In a real app, this would come from auth context
   */
  private getCurrentUserId(): string {
    // TODO: Get from auth context
    return 'system';
  }
  
  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    this.lastCacheTime = 0;
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    isValid: boolean;
    age: number;
  } {
    return {
      size: this.cache.size,
      isValid: this.isCacheValid(),
      age: Date.now() - this.lastCacheTime
    };
  }
}

// Export singleton instance
export const projectRepository = ProjectRepository.getInstance();