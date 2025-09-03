/**
 * Project Service Module
 * 
 * Centralized exports for the unified project CRUD system.
 * All project operations should be imported from this module.
 */

// Export the singleton repository instance
export { projectRepository } from './ProjectRepository';
export { ProjectRepository } from './ProjectRepository';

// Export transformer for data conversions
export { ProjectTransformer } from './ProjectTransformer';

// Export API client for direct API access (if needed)
export { ProjectApiClient } from './ProjectApiClient';

// Re-export types for convenience
export {
  // Core types
  Project,
  DbProject,
  ProjectFormData,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilter,
  ProjectQueryOptions,
  ProjectSort,
  ApiProjectResponse,
  ApiProjectsResponse,
  
  // Supporting types
  ProjectLocation,
  TeamMember,
  Milestone,
  Deliverable,
  Risk,
  
  // Enums
  ProjectType,
  ProjectStatus,
  ProjectPriority,
  ProjectPhase,
  MilestoneStatus,
  DeliverableStatus,
  RiskSeverity,
  RiskLikelihood,
  RiskStatus,
  
  // Type guards
  isProject,
  isDbProject
} from '@/types/project.types';

/**
 * Quick reference for common operations:
 * 
 * ```typescript
 * import { projectRepository } from '@/services/project';
 * 
 * // Create a project
 * const newProject = await projectRepository.create(formData);
 * 
 * // Get a project
 * const project = await projectRepository.getById(id);
 * 
 * // Update a project
 * const updated = await projectRepository.update(id, formData);
 * 
 * // Delete a project
 * await projectRepository.delete(id);
 * 
 * // Get all projects
 * const projects = await projectRepository.getAll();
 * 
 * // Get filtered projects
 * const activeProjects = await projectRepository.getActiveProjects();
 * 
 * // Search projects
 * const results = await projectRepository.searchProjects('keyword');
 * 
 * // Get project statistics
 * const stats = await projectRepository.getProjectSummary();
 * ```
 */