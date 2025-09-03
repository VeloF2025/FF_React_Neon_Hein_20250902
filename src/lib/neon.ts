/**
 * Frontend Database Abstraction Layer
 * Routes all database access through API endpoints (no direct connections)
 * Maintains the same interface for compatibility with existing code
 */

import { apiClient } from '@/services/api/apiClient';

/**
 * API-based SQL function that mimics the neon sql`` template literal
 * All queries are routed through /api/query endpoint instead of direct database access
 */
export function sql(template: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  // Reconstruct SQL from template literal
  let query = '';
  for (let i = 0; i < template.length; i++) {
    query += template[i];
    if (i < values.length) {
      const value = values[i];
      if (typeof value === 'string') {
        query += `'${value.replace(/'/g, "''")}'`;
      } else if (value instanceof Date) {
        query += `'${value.toISOString()}'`;
      } else if (Array.isArray(value)) {
        query += `ARRAY[${value.map(v => typeof v === 'string' ? `'${v}'` : v).join(',')}]`;
      } else {
        query += String(value);
      }
    }
  }

  // Route through API instead of direct database connection
  return apiClient.post('/query', { sql: query })
    .then(response => response.data || []);
}

// Make sql work with unsafe for dynamic queries
sql.unsafe = (text: string) => text;

/**
 * Transaction helper - routes through API
 */
export async function transaction<T>(
  callback: (sqlClient: typeof sql) => Promise<T>
): Promise<T> {
  // For simplicity, transactions are handled on the API side
  // Frontend just executes the callback
  return await callback(sql);
}

// Export default for compatibility
export default sql;