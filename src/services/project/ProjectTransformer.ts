/**
 * ProjectTransformer
 * 
 * Handles all data transformations between different project representations:
 * - Database (snake_case) ↔ Application (camelCase)
 * - API responses ↔ Internal models
 * - Form data ↔ API payloads
 * 
 * This ensures consistent data handling across all layers of the application.
 */

import {
  Project,
  DbProject,
  ProjectFormData,
  ProjectLocation,
  TeamMember,
  Milestone,
  Deliverable,
  Risk,
  ProjectStatus,
  ProjectPriority,
  ProjectType,
  ProjectPhase
} from '@/types/project.types';

export class ProjectTransformer {
  /**
   * Transform database record to application Project
   */
  static fromDatabase(dbProject: DbProject): Project {
    // Parse location data
    const location = this.parseLocation(dbProject);
    
    // Parse JSON fields
    const tags = this.parseJsonField<string[]>(dbProject.tags, []);
    const customFields = this.parseJsonField<Record<string, any>>(dbProject.custom_fields, {});
    
    return {
      // Core identifiers
      id: dbProject.id,
      code: dbProject.project_code,
      name: dbProject.project_name,
      
      // Classification
      type: (dbProject.project_type as ProjectType) || ProjectType.OTHER,
      status: (dbProject.status as ProjectStatus) || ProjectStatus.PLANNING,
      priority: (dbProject.priority as ProjectPriority) || ProjectPriority.MEDIUM,
      phase: dbProject.phase as ProjectPhase | undefined,
      
      // Relationships
      clientId: dbProject.client_id,
      clientName: undefined, // Will be populated by join
      projectManagerId: dbProject.project_manager,
      projectManagerName: undefined, // Will be populated by join
      teamLeadId: dbProject.team_lead,
      teamLeadName: undefined, // Will be populated by join
      
      // Dates
      startDate: this.formatDate(dbProject.start_date),
      endDate: this.formatDate(dbProject.end_date),
      actualStartDate: dbProject.actual_start_date ? this.formatDate(dbProject.actual_start_date) : undefined,
      actualEndDate: dbProject.actual_end_date ? this.formatDate(dbProject.actual_end_date) : undefined,
      
      // Location
      location,
      
      // Financial
      budget: dbProject.budget,
      actualCost: dbProject.actual_cost,
      currency: dbProject.currency || 'ZAR',
      
      // Progress
      progressPercentage: dbProject.progress_percentage || 0,
      plannedProgress: dbProject.planned_progress,
      
      // Details
      description: dbProject.description,
      contractNumber: dbProject.contract_number,
      sowNumber: dbProject.sow_number,
      
      // Complex fields (to be populated by separate queries)
      teamMembers: [],
      milestones: [],
      deliverables: [],
      risks: [],
      dependencies: [],
      
      // Metadata
      tags,
      customFields,
      
      // Audit fields
      createdAt: this.formatDate(dbProject.created_at),
      createdBy: dbProject.created_by,
      updatedAt: dbProject.updated_at ? this.formatDate(dbProject.updated_at) : undefined,
      updatedBy: dbProject.updated_by,
      
      // Status flags
      isActive: dbProject.is_active !== false,
      isArchived: dbProject.is_archived === true
    };
  }
  
  /**
   * Transform application Project to database record
   */
  static toDatabase(project: Partial<Project>): Partial<DbProject> {
    const dbProject: Partial<DbProject> = {};
    
    // Map fields that exist
    if (project.id !== undefined) dbProject.id = project.id;
    if (project.code !== undefined) dbProject.project_code = project.code;
    if (project.name !== undefined) dbProject.project_name = project.name;
    if (project.clientId !== undefined) dbProject.client_id = project.clientId;
    if (project.description !== undefined) dbProject.description = project.description;
    if (project.type !== undefined) dbProject.project_type = project.type;
    if (project.status !== undefined) dbProject.status = project.status;
    if (project.priority !== undefined) dbProject.priority = project.priority;
    if (project.phase !== undefined) dbProject.phase = project.phase;
    
    // Dates
    if (project.startDate !== undefined) dbProject.start_date = this.toDbDate(project.startDate);
    if (project.endDate !== undefined) dbProject.end_date = this.toDbDate(project.endDate);
    if (project.actualStartDate !== undefined) dbProject.actual_start_date = this.toDbDate(project.actualStartDate);
    if (project.actualEndDate !== undefined) dbProject.actual_end_date = this.toDbDate(project.actualEndDate);
    
    // Financial
    if (project.budget !== undefined) dbProject.budget = project.budget;
    if (project.actualCost !== undefined) dbProject.actual_cost = project.actualCost;
    if (project.currency !== undefined) dbProject.currency = project.currency;
    
    // People
    if (project.projectManagerId !== undefined) dbProject.project_manager = project.projectManagerId;
    if (project.teamLeadId !== undefined) dbProject.team_lead = project.teamLeadId;
    
    // Location
    if (project.location) {
      if (project.location.address) {
        dbProject.location = this.formatLocationString(project.location);
      }
      if (project.location.coordinates) {
        dbProject.latitude = project.location.coordinates.latitude;
        dbProject.longitude = project.location.coordinates.longitude;
      }
    }
    
    // Progress
    if (project.progressPercentage !== undefined) dbProject.progress_percentage = project.progressPercentage;
    if (project.plannedProgress !== undefined) dbProject.planned_progress = project.plannedProgress;
    
    // Details
    if (project.contractNumber !== undefined) dbProject.contract_number = project.contractNumber;
    if (project.sowNumber !== undefined) dbProject.sow_number = project.sowNumber;
    
    // JSON fields
    if (project.tags !== undefined) dbProject.tags = JSON.stringify(project.tags);
    if (project.customFields !== undefined) dbProject.custom_fields = JSON.stringify(project.customFields);
    
    // Audit fields
    if (project.createdAt !== undefined) dbProject.created_at = this.toDbDate(project.createdAt);
    if (project.createdBy !== undefined) dbProject.created_by = project.createdBy;
    if (project.updatedAt !== undefined) dbProject.updated_at = this.toDbDate(project.updatedAt);
    if (project.updatedBy !== undefined) dbProject.updated_by = project.updatedBy;
    
    // Status flags
    if (project.isActive !== undefined) dbProject.is_active = project.isActive;
    if (project.isArchived !== undefined) dbProject.is_archived = project.isArchived;
    
    return dbProject;
  }
  
  /**
   * Transform form data to Project for creation/update
   */
  static fromFormData(formData: ProjectFormData, existingProject?: Project): Partial<Project> {
    const project: Partial<Project> = {
      name: formData.name,
      type: formData.type,
      status: formData.status || ProjectStatus.PLANNING,
      priority: formData.priority || ProjectPriority.MEDIUM,
      clientId: formData.clientId,
      startDate: formData.startDate,
      endDate: formData.endDate
    };
    
    // Auto-generate code if not provided
    if (formData.code) {
      project.code = formData.code;
    } else if (!existingProject) {
      project.code = this.generateProjectCode(formData.name);
    }
    
    // Optional fields
    if (formData.description !== undefined) project.description = formData.description;
    if (formData.projectManagerId !== undefined) project.projectManagerId = formData.projectManagerId;
    if (formData.teamLeadId !== undefined) project.teamLeadId = formData.teamLeadId;
    if (formData.location !== undefined) project.location = formData.location as ProjectLocation;
    if (formData.budget !== undefined) project.budget = formData.budget;
    if (formData.currency !== undefined) project.currency = formData.currency;
    if (formData.phase !== undefined) project.phase = formData.phase;
    if (formData.contractNumber !== undefined) project.contractNumber = formData.contractNumber;
    if (formData.sowNumber !== undefined) project.sowNumber = formData.sowNumber;
    if (formData.tags !== undefined) project.tags = formData.tags;
    if (formData.teamMembers !== undefined) project.teamMembers = formData.teamMembers;
    if (formData.milestones !== undefined) project.milestones = formData.milestones;
    
    // Preserve existing data if updating
    if (existingProject) {
      project.id = existingProject.id;
      project.createdAt = existingProject.createdAt;
      project.createdBy = existingProject.createdBy;
      project.progressPercentage = existingProject.progressPercentage;
      project.isActive = existingProject.isActive;
      project.isArchived = existingProject.isArchived;
    } else {
      // Defaults for new projects
      project.progressPercentage = 0;
      project.isActive = true;
      project.isArchived = false;
    }
    
    return project;
  }
  
  /**
   * Transform Project to form data for editing
   */
  static toFormData(project: Project): ProjectFormData {
    return {
      name: project.name,
      code: project.code,
      type: project.type,
      status: project.status,
      priority: project.priority,
      clientId: project.clientId,
      startDate: project.startDate,
      endDate: project.endDate,
      description: project.description,
      projectManagerId: project.projectManagerId,
      teamLeadId: project.teamLeadId,
      location: project.location,
      budget: project.budget,
      currency: project.currency,
      phase: project.phase,
      contractNumber: project.contractNumber,
      sowNumber: project.sowNumber,
      tags: project.tags,
      teamMembers: project.teamMembers,
      milestones: project.milestones
    };
  }
  
  /**
   * Ensure consistent API response format
   */
  static toApiResponse(project: Project | Project[]): any {
    if (Array.isArray(project)) {
      return {
        success: true,
        data: project,
        total: project.length
      };
    }
    
    return {
      success: true,
      data: project
    };
  }
  
  /**
   * Parse API response to extract Project data
   */
  static fromApiResponse(response: any): Project | Project[] | null {
    // Handle different response formats
    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data;
    }
    
    // Direct data response
    if (Array.isArray(response)) {
      return response;
    }
    
    // Single project response
    if (response.id && response.name) {
      return response;
    }
    
    return null;
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  private static parseLocation(dbProject: DbProject): ProjectLocation | undefined {
    if (!dbProject.location && !dbProject.latitude && !dbProject.longitude) {
      return undefined;
    }
    
    const location: ProjectLocation = {};
    
    // Parse location string (format: "address, city, province, postalCode")
    if (dbProject.location) {
      const parts = dbProject.location.split(',').map(s => s.trim());
      if (parts[0]) location.address = parts[0];
      if (parts[1]) location.city = parts[1];
      if (parts[2]) location.province = parts[2];
      if (parts[3]) location.postalCode = parts[3];
    }
    
    // Add coordinates if available
    if (dbProject.latitude && dbProject.longitude) {
      location.coordinates = {
        latitude: dbProject.latitude,
        longitude: dbProject.longitude
      };
    }
    
    return Object.keys(location).length > 0 ? location : undefined;
  }
  
  private static formatLocationString(location: ProjectLocation): string {
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.province) parts.push(location.province);
    if (location.postalCode) parts.push(location.postalCode);
    return parts.join(', ');
  }
  
  private static parseJsonField<T>(field: string | undefined, defaultValue: T): T {
    if (!field) return defaultValue;
    
    try {
      return JSON.parse(field) as T;
    } catch {
      return defaultValue;
    }
  }
  
  private static formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    
    if (typeof date === 'string') {
      // Already in ISO format
      if (date.includes('T')) return date;
      // Date only, add time
      return `${date}T00:00:00Z`;
    }
    
    return date.toISOString();
  }
  
  private static toDbDate(date: string | Date): string {
    if (typeof date === 'string') {
      // Extract just the date part if it's a datetime
      if (date.includes('T')) {
        return date.split('T')[0];
      }
      return date;
    }
    
    return date.toISOString().split('T')[0];
  }
  
  private static generateProjectCode(name: string): string {
    const prefix = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
    
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${prefix}-${year}-${random}`;
  }
  
  /**
   * Validate that all required fields are present for database insertion
   */
  static validateForDatabase(project: Partial<DbProject>): string[] {
    const errors: string[] = [];
    
    if (!project.project_code) errors.push('Project code is required');
    if (!project.project_name) errors.push('Project name is required');
    if (!project.client_id) errors.push('Client ID is required');
    if (!project.project_type) errors.push('Project type is required');
    if (!project.status) errors.push('Status is required');
    if (!project.priority) errors.push('Priority is required');
    if (!project.start_date) errors.push('Start date is required');
    if (!project.end_date) errors.push('End date is required');
    
    return errors;
  }
  
  /**
   * Ensure data consistency by normalizing values
   */
  static normalize(project: Project): Project {
    return {
      ...project,
      // Ensure enums are valid
      type: this.normalizeEnum(project.type, ProjectType, ProjectType.OTHER),
      status: this.normalizeEnum(project.status, ProjectStatus, ProjectStatus.PLANNING),
      priority: this.normalizeEnum(project.priority, ProjectPriority, ProjectPriority.MEDIUM),
      
      // Ensure numbers are valid
      progressPercentage: Math.max(0, Math.min(100, project.progressPercentage || 0)),
      plannedProgress: project.plannedProgress ? Math.max(0, Math.min(100, project.plannedProgress)) : undefined,
      
      // Ensure dates are ISO strings
      startDate: this.formatDate(project.startDate),
      endDate: this.formatDate(project.endDate),
      createdAt: this.formatDate(project.createdAt),
      
      // Ensure arrays are initialized
      teamMembers: project.teamMembers || [],
      milestones: project.milestones || [],
      deliverables: project.deliverables || [],
      risks: project.risks || [],
      dependencies: project.dependencies || [],
      tags: project.tags || []
    };
  }
  
  private static normalizeEnum<T>(value: any, enumObj: any, defaultValue: T): T {
    const values = Object.values(enumObj);
    return values.includes(value) ? value : defaultValue;
  }
}