/**
 * Client API Service
 * Uses API routes instead of direct database access for security
 */

import type { Client, ClientDropdownOption } from '@/types/client';
import { ClientStatus } from '@/types/client';

const API_BASE = '/api';

interface DbClient {
  id?: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  client_type?: string;
  status?: string;
  payment_terms?: string;
  contract_value?: number;
  created_at?: string;
  updated_at?: string;
}


async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  const data = await response.json();
  return data.data || data;
}

function transformDbToClient(dbClient: DbClient): Client {
  return {
    id: dbClient.id,
    name: dbClient.company_name, // ✅ FIXED: Map to 'name' in Client interface
    contactPerson: dbClient.contact_person || '',
    email: dbClient.email || '',
    phone: dbClient.phone || '',
    address: dbClient.address || '',
    city: dbClient.city || '',
    province: dbClient.state || '', // ✅ FIXED: Map to 'province' in Client interface
    postalCode: '', // Default empty - may need to be added to DbClient
    country: 'South Africa', // Default
    category: dbClient.client_type as any || 'SME',
    status: (dbClient.status as ClientStatus) || ClientStatus.PROSPECT, 
    paymentTerms: dbClient.payment_terms as any || 'NET_30',
    creditLimit: dbClient.contract_value || 100000,
    
    // Required fields with defaults
    industry: '',
    priority: 'MEDIUM' as any,
    creditRating: 'UNRATED' as any,
    preferredContactMethod: 'EMAIL' as any,
    communicationLanguage: 'English',
    timezone: 'Africa/Johannesburg',
    currentBalance: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalProjectValue: dbClient.contract_value || 0,
    averageProjectValue: 0,
    tags: [],
    serviceTypes: [],
    
    // Audit fields - will be set by backend
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
    createdBy: 'system',
    lastModifiedBy: 'system'
  };
}

function transformClientToDb(client: Partial<Client>): Partial<DbClient> {
  return {
    id: client.id,
    company_name: client.name, // ✅ FIXED: Use 'name' not 'companyName'
    contact_person: client.contactPerson,
    email: client.email,
    phone: client.phone,
    address: client.address,
    city: client.city,
    state: client.province, // ✅ FIXED: Use 'province' not 'state' 
    client_type: client.category,
    status: client.status,
    payment_terms: client.paymentTerms,
    contract_value: client.creditLimit // ✅ FIXED: Use creditLimit for contract_value
  };
}

function transformDbToDropdownOption(dbClient: DbClient): ClientDropdownOption {
  return {
    id: dbClient.id || '',
    name: dbClient.company_name,
    contactPerson: dbClient.contact_person || '',
    email: dbClient.email || '',
    phone: dbClient.phone || '',
    status: (dbClient.status as any) || 'ACTIVE',
    category: (dbClient.client_type as any) || 'SME'
  };
}

export const clientApiService = {
  async getAll(): Promise<Client[]> {
    console.log('🌐 Fetching clients from:', `${API_BASE}/clients`);
    const response = await fetch(`${API_BASE}/clients`);
    const dbClients = await handleResponse<DbClient[]>(response);
    console.log('📦 Raw API response:', dbClients);
    const transformedClients = dbClients.map(transformDbToClient);
    console.log('✨ Transformed clients:', transformedClients);
    return transformedClients;
  },

  async getById(id: string): Promise<Client | null> {
    const response = await fetch(`${API_BASE}/clients?id=${id}`);
    const dbClient = await handleResponse<DbClient | null>(response);
    return dbClient ? transformDbToClient(dbClient) : null;
  },

  async create(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const dbData = transformClientToDb(clientData);
    const response = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbData)
    });
    const dbClient = await handleResponse<DbClient>(response);
    return transformDbToClient(dbClient);
  },

  async update(id: string, updates: Partial<Client>): Promise<Client> {
    const dbUpdates = transformClientToDb(updates);
    const response = await fetch(`${API_BASE}/clients?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbUpdates)
    });
    const dbClient = await handleResponse<DbClient>(response);
    return transformDbToClient(dbClient);
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/clients?id=${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  // Compatibility methods to match existing service interface
  async getActiveClients(): Promise<Client[]> {
    console.log('🌐 getActiveClients: Fetching active clients from API');
    const response = await fetch(`${API_BASE}/clients`);
    const dbClients = await handleResponse<DbClient[]>(response);
    console.log('📦 getActiveClients: Raw API response:', dbClients);
    
    // Filter active clients from raw data, then transform
    const activeDbClients = dbClients.filter(c => c.status === 'active');
    console.log('🎯 getActiveClients: Filtered active clients:', activeDbClients);
    
    const transformedClients = activeDbClients.map(transformDbToClient);
    console.log('✨ getActiveClients: Final transformed clients:', transformedClients);
    
    return transformedClients;
  },

  // New method for dropdown options
  async getActiveClientsForDropdown(): Promise<ClientDropdownOption[]> {
    const response = await fetch(`${API_BASE}/clients`);
    const dbClients = await handleResponse<DbClient[]>(response);
    return dbClients
      .filter(c => c.status === 'active')
      .map(transformDbToDropdownOption);
  },

  async getClientSummary(): Promise<{
    totalClients: number;
    activeClients: number;
    newThisMonth: number;
  }> {
    const clients = await this.getAll();
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const newThisMonth = clients.filter(c => {
      if (!c.created_at) return false;
      const created = new Date(c.created_at);
      return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
    }).length;

    return {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'active').length,
      newThisMonth
    };
  }
};