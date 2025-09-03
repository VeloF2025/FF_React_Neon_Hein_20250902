/**
 * Client Data Adapter
 * Transforms between ClientFormData and API/Database structures
 * Fixes the data mismatch issue in client creation
 */

import { ClientFormData } from '@/types/client/forms.types';
import { Client } from '@/types/client/core.types';

/**
 * Transforms ClientFormData to Client interface for API calls
 * Handles field name mapping and structure conversion
 */
export function transformClientFormDataToClient(formData: ClientFormData): Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy' | 'currentBalance' | 'totalProjects' | 'activeProjects' | 'completedProjects' | 'totalProjectValue' | 'averageProjectValue'> {
  return {
    // ✅ FIXED: Map 'name' to what the API expects
    name: formData.name, // Client interface expects 'name', not 'companyName'
    contactPerson: formData.contactPerson,
    email: formData.email,
    phone: formData.phone,
    
    // ✅ FIXED: Flatten address structure
    address: formData.address.street,
    city: formData.address.city,
    province: formData.address.state, // Map 'state' to 'province'
    postalCode: formData.address.postalCode,
    country: formData.address.country,
    billingAddress: formData.billingAddress,
    
    // Business information
    registrationNumber: formData.registrationNumber,
    vatNumber: formData.vatNumber,
    industry: formData.industry,
    website: formData.website,
    
    // Contact details
    alternativeEmail: formData.alternativeEmail,
    alternativePhone: formData.alternativePhone,
    
    // Financial information
    creditLimit: formData.creditLimit,
    paymentTerms: formData.paymentTerms,
    creditRating: formData.creditRating,
    
    // Status and categories
    status: formData.status,
    category: formData.category,
    priority: formData.priority,
    
    // Communication preferences
    preferredContactMethod: formData.preferredContactMethod,
    communicationLanguage: formData.communicationLanguage,
    timezone: formData.timezone,
    
    // Additional fields
    taxExempt: formData.taxExempt,
    requiresPO: formData.requiresPO,
    autoApproveOrders: formData.autoApproveOrders,
    allowBackorders: formData.allowBackorders,
    
    // Notes and tags
    notes: formData.notes,
    tags: formData.tags,
    serviceTypes: formData.serviceTypes,
    specialRequirements: formData.specialRequirements,
  };
}

/**
 * Transforms Client to ClientFormData for form editing
 * Handles reverse mapping for edit scenarios
 */
export function transformClientToFormData(client: Client): ClientFormData {
  return {
    name: client.name,
    contactPerson: client.contactPerson,
    email: client.email,
    phone: client.phone,
    
    // ✅ FIXED: Structure address for form
    address: {
      street: client.address,
      city: client.city,
      state: client.province, // Map 'province' back to 'state'
      postalCode: client.postalCode,
      country: client.country,
    },
    billingAddress: client.billingAddress,
    
    // Business information
    registrationNumber: client.registrationNumber,
    vatNumber: client.vatNumber,
    industry: client.industry,
    website: client.website,
    
    // Contact details
    alternativeEmail: client.alternativeEmail,
    alternativePhone: client.alternativePhone,
    
    // Financial information
    creditLimit: client.creditLimit,
    paymentTerms: client.paymentTerms,
    creditRating: client.creditRating,
    
    // Status and categories
    status: client.status,
    category: client.category,
    priority: client.priority,
    
    // Communication preferences
    preferredContactMethod: client.preferredContactMethod,
    communicationLanguage: client.communicationLanguage,
    timezone: client.timezone,
    
    // Additional fields
    taxExempt: client.taxExempt,
    requiresPO: client.requiresPO,
    autoApproveOrders: client.autoApproveOrders,
    allowBackorders: client.allowBackorders,
    
    // Notes and tags
    notes: client.notes || '',
    tags: client.tags || [],
    serviceTypes: client.serviceTypes || [],
    specialRequirements: client.specialRequirements,
  };
}

/**
 * Transforms ClientFormData to match the API test expectations
 * Based on the test file structure in clients.test.ts
 */
export function transformForApiTest(formData: ClientFormData) {
  return {
    name: formData.name, // Tests expect 'name'
    contactEmail: formData.email, // Tests expect 'contactEmail'
    contactPhone: formData.phone, // Tests expect 'contactPhone' 
    contactPerson: formData.contactPerson,
    address: formData.address.street,
    city: formData.address.city,
    state: formData.address.state,
    zipCode: formData.address.postalCode, // Tests expect 'zipCode'
    status: formData.status,
  };
}

/**
 * Validation helper to check if ClientFormData is complete
 */
export function validateClientFormData(formData: ClientFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields validation
  if (!formData.name.trim()) errors.push('Company name is required');
  if (!formData.contactPerson.trim()) errors.push('Contact person is required');
  if (!formData.email.trim()) errors.push('Email is required');
  if (!formData.phone.trim()) errors.push('Phone number is required');
  if (!formData.industry.trim()) errors.push('Industry is required');
  
  // Address validation
  if (!formData.address.street.trim()) errors.push('Street address is required');
  if (!formData.address.city.trim()) errors.push('City is required');
  if (!formData.address.postalCode.trim()) errors.push('Postal code is required');
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.email && !emailRegex.test(formData.email)) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}