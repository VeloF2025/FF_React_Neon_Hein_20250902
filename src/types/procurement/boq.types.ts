// ============= BOQ (Bill of Quantities) Types =============
// Updated to match Drizzle database schema

// BOQ Status enumeration matching database schema
export enum BOQStatus {
  DRAFT = 'draft',
  MAPPING_REVIEW = 'mapping_review',
  APPROVED = 'approved',
  ARCHIVED = 'archived'
}

export type BOQStatusType = 'draft' | 'mapping_review' | 'approved' | 'archived';

// Mapping Status enumeration
export enum MappingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export type MappingStatusType = 'pending' | 'in_progress' | 'completed' | 'failed';

// BOQ Item Mapping Status
export enum BOQItemMappingStatus {
  PENDING = 'pending',
  MAPPED = 'mapped',
  MANUAL = 'manual',
  EXCEPTION = 'exception'
}

export type BOQItemMappingStatusType = 'pending' | 'mapped' | 'manual' | 'exception';

// BOQ Item Procurement Status
export enum ProcurementStatus {
  PENDING = 'pending',
  RFQ_CREATED = 'rfq_created',
  QUOTED = 'quoted',
  AWARDED = 'awarded',
  ORDERED = 'ordered'
}

export type ProcurementStatusType = 'pending' | 'rfq_created' | 'quoted' | 'awarded' | 'ordered';

// Main BOQ interface matching database schema exactly
export interface BOQ {
  id: string;
  projectId: string; // Firebase project ID
  
  // BOQ Details
  version: string;
  title?: string;
  description?: string;
  
  // Status and Workflow
  status: BOQStatusType;
  mappingStatus?: MappingStatusType;
  mappingConfidence?: number; // 0-100
  
  // Upload Information
  uploadedBy: string;
  uploadedAt: Date;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number; // bytes
  
  // Approval Workflow
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Metadata
  itemCount: number;
  mappedItems: number;
  unmappedItems: number;
  exceptionsCount: number;
  
  // Totals
  totalEstimatedValue?: number;
  currency: string; // Default 'ZAR'
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// BOQ Item interface matching database schema
export interface BOQItem {
  id: string;
  boqId: string;
  projectId: string; // Denormalized for performance
  
  // Line Item Details
  lineNumber: number;
  itemCode?: string;
  description: string;
  category?: string;
  subcategory?: string;
  
  // Quantities and Units
  quantity: number;
  uom: string; // unit of measure
  unitPrice?: number;
  totalPrice?: number;
  
  // Project Structure
  phase?: string;
  task?: string;
  site?: string;
  location?: string;
  
  // Catalog Mapping
  catalogItemId?: string;
  catalogItemCode?: string;
  catalogItemName?: string;
  mappingConfidence?: number; // 0-100
  mappingStatus: BOQItemMappingStatusType;
  
  // Technical Specifications
  specifications?: Record<string, any>;
  technicalNotes?: string;
  alternativeItems?: any[]; // Array of alternative catalog items
  
  // Procurement Status
  procurementStatus: ProcurementStatusType;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// BOQ Exception interface for mapping issues
export interface BOQException {
  id: string;
  boqId: string;
  boqItemId: string;
  projectId: string;
  
  // Exception Details
  exceptionType: 'no_match' | 'multiple_matches' | 'data_issue' | 'manual_review';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Issue Description
  issueDescription: string;
  suggestedAction?: string;
  systemSuggestions?: any[]; // Array of suggested mappings
  
  // Resolution
  status: 'open' | 'in_review' | 'resolved' | 'ignored';
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  resolutionAction?: 'manual_mapping' | 'catalog_update' | 'item_split' | 'item_ignore';
  
  // Assignment
  assignedTo?: string;
  assignedAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Alternative catalog item suggestion
export interface AlternativeItem {
  catalogItemId: string;
  catalogItemCode: string;
  catalogItemName: string;
  matchingScore: number; // 0-100
  priceVariance?: number;
  specifications?: Record<string, any>;
}

// Mapping suggestion for automated catalog matching
export interface MappingSuggestion {
  catalogItemId: string;
  catalogItemCode: string;
  catalogItemName: string;
  confidence: number; // 0-100
  matchingCriteria: {
    descriptionMatch?: number;
    codeMatch?: number;
    specificationMatch?: number;
    categoryMatch?: number;
  };
  priceEstimate?: number;
  leadTimeEstimate?: number;
}

// BOQ Import data structure (for Excel/CSV uploads)
export interface BOQImportData {
  fileName: string;
  fileSize: number;
  projectId: string;
  version: string;
  title?: string;
  description?: string;
  uploadedBy: string;
  rows: BOQImportRow[];
}

export interface BOQImportRow {
  lineNumber: number;
  itemCode?: string;
  description: string;
  category?: string;
  subcategory?: string;
  quantity: number;
  uom: string;
  unitPrice?: number;
  totalPrice?: number;
  phase?: string;
  task?: string;
  site?: string;
  location?: string;
  specifications?: string;
  technicalNotes?: string;
}

// Form data for creating/updating BOQ
export interface BOQFormData {
  version: string;
  title?: string;
  description?: string;
  projectId: string;
  currency?: string;
}

// BOQ with populated items (for display)
export interface BOQWithItems extends BOQ {
  items: BOQItem[];
  exceptions: BOQException[];
}

// BOQ statistics for dashboard
export interface BOQStats {
  totalBOQs: number;
  activeBOQs: number;
  approvedBOQs: number;
  pendingApproval: number;
  totalItems: number;
  mappedItems: number;
  unmappedItems: number;
  exceptionsCount: number;
  totalValue: number;
  averageValue: number;
}

// Type exports that match Drizzle inferred types
export type { BOQ as DrizzleBOQ, NewBOQ as NewDrizzleBOQ } from '../../lib/neon/schema';
export type { BOQItem as DrizzleBOQItem, NewBOQItem as NewDrizzleBOQItem } from '../../lib/neon/schema';
export type { BOQException as DrizzleBOQException, NewBOQException as NewDrizzleBOQException } from '../../lib/neon/schema';