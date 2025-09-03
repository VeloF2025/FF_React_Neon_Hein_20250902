/**
 * API SQL Adapter
 * Replaces direct database connections with API calls
 * Maintains the same interface as the original sql template literal
 */

import { apiClient } from '@/services/api/apiClient';

/**
 * SQL Template Literal Replacement
 * Routes all SQL queries through the API instead of direct database access
 */
export function sql(template: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  // Reconstruct the SQL query from template literal
  let query = '';
  for (let i = 0; i < template.length; i++) {
    query += template[i];
    if (i < values.length) {
      // Simple parameter substitution (for basic queries)
      const value = values[i];
      if (typeof value === 'string') {
        query += `'${value.replace(/'/g, "''")}'`; // Basic SQL escaping
      } else if (value instanceof Date) {
        query += `'${value.toISOString()}'`;
      } else if (Array.isArray(value)) {
        query += `ARRAY[${value.map(v => typeof v === 'string' ? `'${v}'` : v).join(',')}]`;
      } else {
        query += String(value);
      }
    }
  }

  // Route through API instead of direct database
  return apiClient.post('query', { sql: query });
}

// Export as default for compatibility
export default sql;

/**
 * Common query helpers that route through API
 */
export const apiSql = {
  // Generic query execution
  async query(sql: string, params: any[] = []): Promise<any[]> {
    return apiClient.post('query', { sql, params });
  },

  // Table-specific shortcuts
  async selectFrom(table: string, where?: Record<string, any>, limit?: number): Promise<any[]> {
    return apiClient.post('query', { table, where, limit, action: 'select' });
  },

  async insertInto(table: string, data: Record<string, any>): Promise<any> {
    return apiClient.post('query', { table, data, action: 'insert' });
  },

  async updateTable(table: string, data: Record<string, any>, where: Record<string, any>): Promise<any> {
    return apiClient.post('query', { table, data, where, action: 'update' });
  },

  async deleteFrom(table: string, where: Record<string, any>): Promise<any> {
    return apiClient.post('query', { table, where, action: 'delete' });
  }
};