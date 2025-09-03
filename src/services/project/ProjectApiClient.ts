/**
 * ProjectApiClient
 * 
 * Low-level API client for project operations.
 * Handles HTTP communication with the backend API.
 * 
 * This client works with database format (snake_case) directly.
 * All transformations are handled by ProjectRepository and ProjectTransformer.
 */

import { DbProject, ProjectQueryOptions, ProjectFilter } from '@/types/project.types';

export class ProjectApiClient {
  private baseUrl: string;
  private headers: HeadersInit;
  
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }
  
  /**
   * Create a new project
   */
  async create(projectData: DbProject): Promise<DbProject> {
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    const result = await response.json();
    return result.data || result;
  }
  
  /**
   * Get a project by ID
   */
  async getById(id: string): Promise<DbProject | null> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: 'GET',
      headers: this.headers,
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    const result = await response.json();
    return result.data || result;
  }
  
  /**
   * Update a project
   */
  async update(id: string, updates: Partial<DbProject>): Promise<DbProject> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    const result = await response.json();
    return result.data || result;
  }
  
  /**
   * Delete a project
   */
  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    const result = await response.json();
    return result.success !== false;
  }
  
  /**
   * Get all projects with optional filtering
   */
  async getAll(options?: ProjectQueryOptions): Promise<DbProject[]> {
    const queryParams = this.buildQueryParams(options);
    const url = `${this.baseUrl}/projects${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers,
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    const result = await response.json();
    return result.data || result || [];
  }
  
  /**
   * Batch create projects
   */
  async batchCreate(projects: DbProject[]): Promise<DbProject[]> {
    const response = await fetch(`${this.baseUrl}/projects/batch`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ projects }),
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    const result = await response.json();
    return result.data || result || [];
  }
  
  /**
   * Batch update projects
   */
  async batchUpdate(updates: Array<{ id: string; updates: Partial<DbProject> }>): Promise<DbProject[]> {
    const response = await fetch(`${this.baseUrl}/projects/batch`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({ updates }),
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    const result = await response.json();
    return result.data || result || [];
  }
  
  /**
   * Get project statistics
   */
  async getStatistics(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/projects/statistics`, {
      method: 'GET',
      headers: this.headers,
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    const result = await response.json();
    return result.data || result;
  }
  
  /**
   * Export projects to CSV
   */
  async exportToCsv(filter?: ProjectFilter): Promise<Blob> {
    const queryParams = this.buildQueryParams({ filter });
    const url = `${this.baseUrl}/projects/export/csv${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...this.headers,
        'Accept': 'text/csv',
      },
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    return response.blob();
  }
  
  /**
   * Import projects from CSV
   */
  async importFromCsv(file: File): Promise<{ success: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/projects/import/csv`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    const result = await response.json();
    return result.data || result;
  }
  
  /**
   * Check project code uniqueness
   */
  async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    const params = new URLSearchParams({ code });
    if (excludeId) {
      params.append('exclude', excludeId);
    }
    
    const response = await fetch(`${this.baseUrl}/projects/check-code?${params}`, {
      method: 'GET',
      headers: this.headers,
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    const result = await response.json();
    return result.unique !== false;
  }
  
  /**
   * Get project activity log
   */
  async getActivityLog(projectId: string, limit = 50): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/projects/${projectId}/activity?limit=${limit}`, {
      method: 'GET',
      headers: this.headers,
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    const result = await response.json();
    return result.data || result || [];
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  /**
   * Build query parameters from options
   */
  private buildQueryParams(options?: ProjectQueryOptions): string {
    if (!options) return '';
    
    const params = new URLSearchParams();
    
    // Add filter parameters
    if (options.filter) {
      const filter = options.filter;
      
      if (filter.status) {
        if (Array.isArray(filter.status)) {
          params.append('status', filter.status.join(','));
        } else {
          params.append('status', filter.status);
        }
      }
      
      if (filter.type) {
        if (Array.isArray(filter.type)) {
          params.append('type', filter.type.join(','));
        } else {
          params.append('type', filter.type);
        }
      }
      
      if (filter.priority) {
        if (Array.isArray(filter.priority)) {
          params.append('priority', filter.priority.join(','));
        } else {
          params.append('priority', filter.priority);
        }
      }
      
      if (filter.clientId) params.append('client_id', filter.clientId);
      if (filter.projectManagerId) params.append('project_manager', filter.projectManagerId);
      if (filter.search) params.append('search', filter.search);
      if (filter.isActive !== undefined) params.append('is_active', String(filter.isActive));
      if (filter.isArchived !== undefined) params.append('is_archived', String(filter.isArchived));
      
      // Date filters
      if (filter.startDateFrom) params.append('start_date_from', filter.startDateFrom);
      if (filter.startDateTo) params.append('start_date_to', filter.startDateTo);
      if (filter.endDateFrom) params.append('end_date_from', filter.endDateFrom);
      if (filter.endDateTo) params.append('end_date_to', filter.endDateTo);
      
      // Tags
      if (filter.tags && filter.tags.length > 0) {
        params.append('tags', filter.tags.join(','));
      }
    }
    
    // Add sort parameters
    if (options.sort) {
      params.append('sort_by', options.sort.field);
      params.append('sort_order', options.sort.order);
    }
    
    // Add pagination parameters
    if (options.page !== undefined) params.append('page', String(options.page));
    if (options.pageSize !== undefined) params.append('page_size', String(options.pageSize));
    if (options.includeArchived) params.append('include_archived', 'true');
    
    return params.toString();
  }
  
  /**
   * Handle API errors
   */
  private async handleError(response: Response): Promise<Error> {
    let message = `API Error: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.error) {
        message = errorData.error;
      } else if (errorData.message) {
        message = errorData.message;
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        message = errorData.errors.join(', ');
      }
    } catch {
      // If response is not JSON, use default message
    }
    
    return new Error(message);
  }
  
  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.headers = {
      ...this.headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  
  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    const headers = { ...this.headers };
    delete (headers as any)['Authorization'];
    this.headers = headers;
  }
  
  /**
   * Set custom headers
   */
  setHeaders(headers: HeadersInit): void {
    this.headers = {
      ...this.headers,
      ...headers,
    };
  }
}