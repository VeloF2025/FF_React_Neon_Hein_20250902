/**
 * Staff Enums - All enumeration types for staff management
 */

import { Timestamp } from 'firebase/firestore';

// Department Enums
export enum Department {
  MANAGEMENT = 'management',
  PROJECT_MANAGEMENT = 'project_management',
  FIELD_OPERATIONS = 'field_operations',
  NETWORK_OPERATIONS = 'network_operations',
  ENGINEERING = 'engineering',
  INSTALLATION = 'installation',
  MAINTENANCE = 'maintenance',
  QUALITY_ASSURANCE = 'quality_assurance',
  TECHNICAL_SUPPORT = 'technical_support',
  SALES = 'sales',
  CUSTOMER_SERVICE = 'customer_service',
  LOGISTICS = 'logistics',
  ADMINISTRATION = 'administration',
  FINANCE = 'finance',
  HR = 'hr',
  IT = 'it',
  SAFETY = 'safety',
}

// Position enum for standardized roles
export enum Position {
  PROJECT_MANAGER = 'Project Manager',
  SENIOR_PROJECT_MANAGER = 'Senior Project Manager',
  SITE_SUPERVISOR = 'Site Supervisor',
  FIELD_TECHNICIAN = 'Field Technician',
  SENIOR_TECHNICIAN = 'Senior Technician',
  CABLE_JOINTER = 'Cable Jointer',
  FIBRE_SPLICER = 'Fibre Splicer',
  NETWORK_ENGINEER = 'Network Engineer',
  QUALITY_INSPECTOR = 'Quality Inspector',
  SAFETY_OFFICER = 'Safety Officer',
  TEAM_LEAD = 'Team Lead',
  OPERATIONS_MANAGER = 'Operations Manager',
  CONSTRUCTION_MANAGER = 'Construction Manager',
  LOGISTICS_COORDINATOR = 'Logistics Coordinator',
  ADMIN_ASSISTANT = 'Administrative Assistant',
  DATA_CAPTURER = 'Data Capturer',
  DRIVER = 'Driver',
  GENERAL_WORKER = 'General Worker',
  INTERN = 'Intern',
  OTHER = 'Other'
}

// Keep StaffLevel for backward compatibility but mark as deprecated
/**
 * @deprecated Use Position enum instead
 */
export enum StaffLevel {
  INTERN = 'intern',
  JUNIOR = 'junior',
  INTERMEDIATE = 'intermediate',
  SENIOR = 'senior',
  LEAD = 'lead',
  MANAGER = 'manager',
  SENIOR_MANAGER = 'senior_manager',
  DIRECTOR = 'director',
  EXECUTIVE = 'executive',
}

export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  RESIGNED = 'resigned',
  RETIRED = 'retired',
}

export enum ContractType {
  PERMANENT = 'permanent',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  FREELANCE = 'freelance',
  INTERN = 'intern',
  CONSULTANT = 'consultant',
}

export enum Skill {
  // Technical Skills
  FIBRE_SPLICING = 'fibre_splicing',
  OTDR_TESTING = 'otdr_testing',
  POWER_METER_TESTING = 'power_meter_testing',
  CABLE_INSTALLATION = 'cable_installation',
  POLE_INSTALLATION = 'pole_installation',
  TRENCHING = 'trenching',
  DUCT_INSTALLATION = 'duct_installation',
  
  // Network Skills
  NETWORK_DESIGN = 'network_design',
  NETWORK_CONFIGURATION = 'network_configuration',
  TROUBLESHOOTING = 'troubleshooting',
  MAINTENANCE = 'maintenance',
  
  // Project Management
  PROJECT_MANAGEMENT = 'project_management',
  TEAM_LEADERSHIP = 'team_leadership',
  PLANNING = 'planning',
  COORDINATION = 'coordination',
  
  // Safety and Compliance
  SAFETY_PROTOCOLS = 'safety_protocols',
  QUALITY_CONTROL = 'quality_control',
  COMPLIANCE = 'compliance',
  
  // Customer Service
  CUSTOMER_RELATIONS = 'customer_relations',
  COMMUNICATION = 'communication',
  PROBLEM_SOLVING = 'problem_solving',
}

// Certification Types
export interface Certification {
  name: string;
  issuedBy: string;
  issuedDate: Timestamp;
  expiryDate?: Timestamp;
  certificateNumber?: string;
  status: CertificationStatus;
}

export enum CertificationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING_RENEWAL = 'pending_renewal',
  SUSPENDED = 'suspended',
}

// Equipment Types
export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  serialNumber?: string;
  assignedDate: Timestamp;
  condition: EquipmentCondition;
  returnDate?: Timestamp;
}

export enum EquipmentType {
  VEHICLE = 'vehicle',
  TOOL = 'tool',
  TESTING_DEVICE = 'testing_device',
  SAFETY_EQUIPMENT = 'safety_equipment',
  LAPTOP = 'laptop',
  PHONE = 'phone',
  TABLET = 'tablet',
  OTHER = 'other',
}

export enum EquipmentCondition {
  NEW = 'new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
  NEEDS_REPAIR = 'needs_repair',
}

// Training Types
export interface TrainingRecord {
  id: string;
  trainingName: string;
  trainingType: TrainingType;
  provider: string;
  completedDate: Timestamp;
  expiryDate?: Timestamp;
  certificateUrl?: string;
  score?: number;
  status: TrainingStatus;
}

export enum TrainingType {
  SAFETY = 'safety',
  TECHNICAL = 'technical',
  MANAGEMENT = 'management',
  COMPLIANCE = 'compliance',
  SOFT_SKILLS = 'soft_skills',
  CERTIFICATION = 'certification',
}

export enum TrainingStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  SCHEDULED = 'scheduled',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}