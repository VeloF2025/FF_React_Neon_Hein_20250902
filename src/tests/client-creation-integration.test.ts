/**
 * Client Creation Integration Test
 * Tests the complete client creation flow from form submission to API
 */

import { describe, test, expect } from 'vitest';
import { transformClientFormDataToClient, validateClientFormData } from '@/services/client/clientDataAdapter';
import { ClientFormData, ClientStatus, ClientCategory, ClientPriority, PaymentTerms, CreditRating, ContactMethod } from '@/types/client.types';

describe('Client Creation Integration', () => {
  const mockClientFormData: ClientFormData = {
    name: 'Test Company Ltd',
    contactPerson: 'John Smith',
    email: 'john@testcompany.com',
    phone: '+27 11 123 4567',
    address: {
      street: '123 Business Street',
      city: 'Johannesburg',
      state: 'Gauteng',
      postalCode: '2000',
      country: 'South Africa'
    },
    registrationNumber: 'REG123456',
    vatNumber: 'VAT789012',
    industry: 'Technology',
    website: 'https://testcompany.com',
    alternativeEmail: 'info@testcompany.com',
    alternativePhone: '+27 11 987 6543',
    creditLimit: 500000,
    paymentTerms: PaymentTerms.NET_30,
    creditRating: CreditRating.GOOD,
    status: ClientStatus.PROSPECT,
    category: ClientCategory.ENTERPRISE,
    priority: ClientPriority.HIGH,
    preferredContactMethod: ContactMethod.EMAIL,
    communicationLanguage: 'English',
    timezone: 'Africa/Johannesburg',
    notes: 'Important enterprise client',
    tags: ['enterprise', 'technology'],
    serviceTypes: [],
    specialRequirements: 'Requires dedicated project manager',
    taxExempt: false,
    requiresPO: true,
    autoApproveOrders: false,
    allowBackorders: true
  };

  describe('Data Transformation', () => {
    test('transforms ClientFormData to Client interface correctly', () => {
      const result = transformClientFormDataToClient(mockClientFormData);
      
      // ✅ Verify critical field mappings
      expect(result.name).toBe('Test Company Ltd');
      expect(result.contactPerson).toBe('John Smith');
      expect(result.email).toBe('john@testcompany.com');
      
      // ✅ Verify address flattening
      expect(result.address).toBe('123 Business Street');
      expect(result.city).toBe('Johannesburg');
      expect(result.province).toBe('Gauteng'); // Mapped from 'state'
      expect(result.postalCode).toBe('2000');
      expect(result.country).toBe('South Africa');
      
      // ✅ Verify enum values are preserved
      expect(result.status).toBe(ClientStatus.PROSPECT);
      expect(result.category).toBe(ClientCategory.ENTERPRISE);
      expect(result.paymentTerms).toBe(PaymentTerms.NET_30);
      
      // ✅ Verify financial data
      expect(result.creditLimit).toBe(500000);
      expect(result.creditRating).toBe(CreditRating.GOOD);
      
      // ✅ Verify arrays are preserved
      expect(result.tags).toEqual(['enterprise', 'technology']);
      expect(result.serviceTypes).toEqual([]);
    });

    test('handles minimal required data correctly', () => {
      const minimalData: ClientFormData = {
        name: 'Minimal Client',
        contactPerson: 'Jane Doe',
        email: 'jane@minimal.com',
        phone: '+27 11 000 0000',
        address: {
          street: '1 Main Road',
          city: 'Cape Town',
          state: 'Western Cape',
          postalCode: '8000',
          country: 'South Africa'
        },
        industry: 'Construction',
        creditLimit: 100000,
        paymentTerms: PaymentTerms.NET_30,
        creditRating: CreditRating.UNRATED,
        status: ClientStatus.PROSPECT,
        category: ClientCategory.SME,
        priority: ClientPriority.MEDIUM,
        preferredContactMethod: ContactMethod.EMAIL,
        communicationLanguage: 'English',
        timezone: 'Africa/Johannesburg',
        tags: [],
        serviceTypes: []
      };

      const result = transformClientFormDataToClient(minimalData);
      
      expect(result.name).toBe('Minimal Client');
      expect(result.industry).toBe('Construction');
      expect(result.tags).toEqual([]);
      expect(result.notes).toBeUndefined();
    });
  });

  describe('Form Validation', () => {
    test('validates complete form data as valid', () => {
      const validation = validateClientFormData(mockClientFormData);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('identifies missing required fields', () => {
      const incompleteData: ClientFormData = {
        ...mockClientFormData,
        name: '', // Missing required field
        email: 'invalid-email', // Invalid format
        address: {
          ...mockClientFormData.address,
          street: '', // Missing required field
        }
      };

      const validation = validateClientFormData(incompleteData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Company name is required');
      expect(validation.errors).toContain('Invalid email format');
      expect(validation.errors).toContain('Street address is required');
    });

    test('validates email format correctly', () => {
      const testCases = [
        { email: 'valid@example.com', valid: true },
        { email: 'also.valid+test@domain.co.za', valid: true },
        { email: 'invalid-email', valid: false },
        { email: '@domain.com', valid: false },
        { email: 'test@', valid: false },
      ];

      testCases.forEach(({ email, valid }) => {
        const testData = { ...mockClientFormData, email };
        const validation = validateClientFormData(testData);
        
        if (valid) {
          expect(validation.errors.find(e => e.includes('Invalid email format'))).toBeUndefined();
        } else {
          expect(validation.errors).toContain('Invalid email format');
        }
      });
    });
  });

  describe('API Compatibility', () => {
    test('transformed data should match API expectations', () => {
      const transformedData = transformClientFormDataToClient(mockClientFormData);
      
      // ✅ Check that all required Client interface fields exist
      expect(transformedData).toHaveProperty('name');
      expect(transformedData).toHaveProperty('contactPerson');
      expect(transformedData).toHaveProperty('email');
      expect(transformedData).toHaveProperty('phone');
      expect(transformedData).toHaveProperty('address');
      expect(transformedData).toHaveProperty('city');
      expect(transformedData).toHaveProperty('province');
      expect(transformedData).toHaveProperty('industry');
      expect(transformedData).toHaveProperty('status');
      expect(transformedData).toHaveProperty('category');
      expect(transformedData).toHaveProperty('creditLimit');
      expect(transformedData).toHaveProperty('paymentTerms');
      
      // ✅ Check data types are correct
      expect(typeof transformedData.name).toBe('string');
      expect(typeof transformedData.creditLimit).toBe('number');
      expect(Array.isArray(transformedData.tags)).toBe(true);
      expect(Array.isArray(transformedData.serviceTypes)).toBe(true);
    });

    test('handles undefined optional fields gracefully', () => {
      const dataWithUndefined: ClientFormData = {
        ...mockClientFormData,
        alternativeEmail: undefined,
        alternativePhone: undefined,
        website: undefined,
        notes: undefined,
        specialRequirements: undefined,
      };

      const result = transformClientFormDataToClient(dataWithUndefined);
      
      // Should not throw errors and should handle undefined fields
      expect(() => result).not.toThrow();
      expect(result.name).toBe(mockClientFormData.name);
    });
  });

  describe('Error Scenarios', () => {
    test('handles transformation of data with missing nested address fields', () => {
      const dataWithIncompleteAddress: ClientFormData = {
        ...mockClientFormData,
        address: {
          street: 'Some Street',
          city: '', // Missing
          state: '',  // Missing
          postalCode: '',  // Missing
          country: 'South Africa'
        }
      };

      const result = transformClientFormDataToClient(dataWithIncompleteAddress);
      
      expect(result.address).toBe('Some Street');
      expect(result.city).toBe('');
      expect(result.province).toBe('');
      expect(result.postalCode).toBe('');
    });
  });
});