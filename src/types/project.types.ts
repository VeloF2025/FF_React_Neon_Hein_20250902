/**
 * Unified Project Type Definitions
 * Single source of truth for all project-related types
 * 
 * This file defines the canonical structure for projects across the entire application.
 * All layers (database, API, forms, UI) should transform their data to/from these types.
 */

// ============================================================================
// Core Project Type - The Single Source of Truth
// ============================================================================

/**
 * The canonical Project type used throughout the application.
 * All other representations should map to/from this structure.
 */
export interface Project {
  // Core identifiers
  id: string;
  code: string;           // Unique project code (e.g., "PRJ-2024-001")
  name: string;           // Project display name
  
  // Classification
  type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  phase?: ProjectPhase;
  
  // Relationships
  clientId: string;
  clientName?: string;    // Denormalized for display
  projectManagerId?: string;
  projectManagerName?: string;  // Denormalized for display
  teamLeadId?: string;
  teamLeadName?: string;        // Denormalized for display
  
  // Dates
  startDate: string;      // ISO 8601 date string
  endDate: string;        // ISO 8601 date string
  actualStartDate?: string;
  actualEndDate?: string;
  
  // Location
  location?: ProjectLocation;
  
  // Financial
  budget?: number;
  actualCost?: number;
  currency?: string;
  
  // Progress
  progressPercentage: number;    // 0-100
  plannedProgress?: number;       // 0-100
  
  // Details
  description?: string;
  contractNumber?: string;
  sowNumber?: string;
  
  // Team
  teamMembers?: TeamMember[];
  
  // Milestones & Deliverables
  milestones?: Milestone[];
  deliverables?: Deliverable[];
  
  // Risk & Dependencies
  risks?: Risk[];
  dependencies?: string[];
  
  // Metadata
  tags?: string[];
  customFields?: Record<string, any>;
  
  // Audit fields
  createdAt: string;      // ISO 8601 datetime string
  createdBy: string;
  updatedAt?: string;     // ISO 8601 datetime string
  updatedBy?: string;
  
  // Status flags
  isActive: boolean;
  isArchived: boolean;
}

// ============================================================================
// Database Schema Type - Maps to Actual Database Tables
// ============================================================================

/**
 * Database representation of a project.
 * Uses snake_case to match PostgreSQL conventions.
 */
export interface DbProject {
  id: string;
  project_code: string;
  project_name: string;
  client_id: string;
  description?: string;
  project_type: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  budget?: number;
  actual_cost?: number;
  project_manager?: string;
  team_lead?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  progress_percentage: number;
  planned_progress?: number;
  phase?: string;
  contract_number?: string;
  sow_number?: string;
  currency?: string;
  tags?: string;
  custom_fields?: string;  // JSON string
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
  is_active: boolean;
  is_archived: boolean;
}

// ============================================================================
// API Response Types - What the API Returns
// ============================================================================

/**
 * API response format for a single project
 */
export interface ApiProjectResponse {
  success: boolean;
  data: Project;
  message?: string;
}

/**
 * API response format for multiple projects
 */
export interface ApiProjectsResponse {
  success: boolean;
  data: Project[];
  total?: number;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// Form Types - For UI Forms
// ============================================================================

/**
 * Project form data structure - used in create/edit forms
 * All fields are optional except those required for creation
 */
export interface ProjectFormData {
  // Required for creation
  name: string;
  code?: string;          // Auto-generated if not provided
  type: ProjectType;
  status?: ProjectStatus; // Defaults to PLANNING
  priority?: ProjectPriority; // Defaults to MEDIUM
  clientId: string;
  startDate: string;
  endDate: string;
  
  // Optional fields
  description?: string;
  projectManagerId?: string;
  teamLeadId?: string;
  location?: Partial<ProjectLocation>;
  budget?: number;
  currency?: string;
  phase?: ProjectPhase;
  contractNumber?: string;
  sowNumber?: string;
  tags?: string[];
  teamMembers?: TeamMember[];
  milestones?: Milestone[];
}

// ============================================================================
// Supporting Types
// ============================================================================

export interface ProjectLocation {
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  region?: string;
}

export interface TeamMember {
  id: string;
  staffId: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  department?: string;
  allocation?: number;    // Percentage (0-100)
  joinedDate?: string;
  isLead?: boolean;
  isActive?: boolean;
}

export interface Milestone {
  id?: string;
  name: string;
  description?: string;
  dueDate: string;
  completedDate?: string;
  status: MilestoneStatus;
  progress: number;       // 0-100
  deliverables?: string[];
}

export interface Deliverable {
  id?: string;
  name: string;
  description?: string;
  type: string;
  status: DeliverableStatus;
  dueDate?: string;
  submittedDate?: string;
  approvedDate?: string;
  approvedBy?: string;
  url?: string;
}

export interface Risk {
  id: string;
  description: string;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  impact: string;
  mitigation?: string;
  status: RiskStatus;
  owner?: string;
}

// ============================================================================
// Enums
// ============================================================================

export enum ProjectType {
  FIBRE = 'fibre',
  NETWORK = 'network',
  INFRASTRUCTURE = 'infrastructure',
  MAINTENANCE = 'maintenance',
  SURVEY = 'survey',
  INSTALLATION = 'installation',
  CONSULTING = 'consulting',
  OTHER = 'other'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ProjectPhase {
  INITIATION = 'initiation',
  PLANNING = 'planning',
  EXECUTION = 'execution',
  MONITORING = 'monitoring',
  CLOSURE = 'closure'
}

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled'
}

export enum DeliverableStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export enum RiskSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RiskLikelihood {
  UNLIKELY = 'unlikely',
  POSSIBLE = 'possible',
  LIKELY = 'likely',
  ALMOST_CERTAIN = 'almost_certain'
}

export enum RiskStatus {
  IDENTIFIED = 'identified',
  ANALYZING = 'analyzing',
  MITIGATING = 'mitigating',
  MITIGATED = 'mitigated',
  ACCEPTED = 'accepted',
  CLOSED = 'closed'
}

// Additional exports for backwards compatibility and specific use cases
export enum PhaseStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress', 
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export enum StepStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  SKIPPED = 'skipped',
  ON_HOLD = 'on_hold'
}

export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

// Project phase constants for fiber projects
export const FIBER_PROJECT_PHASES = [
  'initiation',
  'planning', 
  'execution',
  'monitoring',
  'closure'
] as const;

// ============================================================================
// Type Guards
// ============================================================================

export function isProject(obj: any): obj is Project {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.code === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.status === 'string';
}

export function isDbProject(obj: any): obj is DbProject {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.project_code === 'string' &&
    typeof obj.project_name === 'string';
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Project creation input - excludes auto-generated fields
 */
export type CreateProjectInput = Omit<Project, 
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 
  'progressPercentage' | 'isActive' | 'isArchived'
>;

/**
 * Project update input - all fields optional except ID
 */
export type UpdateProjectInput = Partial<Omit<Project, 'id' | 'createdAt' | 'createdBy'>> & {
  id: string;
};

/**
 * Project filter criteria for queries
 */
export interface ProjectFilter {
  status?: ProjectStatus | ProjectStatus[];
  type?: ProjectType | ProjectType[];
  priority?: ProjectPriority | ProjectPriority[];
  clientId?: string;
  projectManagerId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  isActive?: boolean;
  isArchived?: boolean;
  search?: string;        // Searches in name, code, description
  tags?: string[];
}

/**
 * Project sort options
 */
export interface ProjectSort {
  field: keyof Project;
  order: 'asc' | 'desc';
}

/**
 * Project query options
 */
export interface ProjectQueryOptions {
  filter?: ProjectFilter;
  sort?: ProjectSort;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
}