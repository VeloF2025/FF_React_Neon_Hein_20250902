/**
 * Client Service - Main export file
 * Using API routes for browser, Neon for server/build
 */

import { clientNeonService } from './client/clientNeonService';
import { clientApiService } from './client/clientApiService';
import { clientImportService } from './client/clientImportService';
import { clientExportService } from './client/clientExportService';
import { transformClientFormDataToClient } from './client/clientDataAdapter';

// Use API service in browser, Neon service for server/build
const isBrowser = typeof window !== 'undefined';
const baseService = isBrowser ? clientApiService : clientNeonService;

export const clientService = {
  // CRUD operations
  getAll: baseService.getAll,
  getById: baseService.getById,
  
  // ✅ FIXED: Transform ClientFormData to Client interface before API call
  create: async (clientFormData: any) => {
    const transformedData = transformClientFormDataToClient(clientFormData);
    return baseService.create(transformedData);
  },
  
  // ✅ FIXED: Transform ClientFormData to Client interface for updates
  update: async (id: string, clientFormData: any) => {
    const transformedData = transformClientFormDataToClient(clientFormData);
    return baseService.update(id, transformedData);
  },
  
  delete: baseService.delete,
  getActiveClients: async () => {
    console.log('🔧 clientService.getActiveClients called, isBrowser:', isBrowser);
    const result = await baseService.getActiveClients();
    console.log('🔧 clientService.getActiveClients result:', result);
    return result;
  },
  getActiveClientsForDropdown: isBrowser 
    ? (baseService as any).getActiveClientsForDropdown || baseService.getActiveClients
    : baseService.getActiveClients,
  getClientSummary: baseService.getClientSummary,
  
  // Extended operations
  getContactHistory: async () => {
    // Mock implementation - should be implemented in clientNeonService
    return Promise.resolve([]);
  },
  
  updateClientMetrics: async () => {
    // Mock implementation - should be implemented in clientNeonService
    return Promise.resolve({ success: true });
  },
  
  addContactHistory: async () => {
    // Mock implementation - should be implemented in clientNeonService
    return Promise.resolve({ success: true });
  },
  
  // Import/Export operations
  import: clientImportService,
  export: clientExportService,
};