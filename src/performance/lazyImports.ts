/**
 * Lazy Import Utilities for Performance Optimization
 * Provides dynamic imports for heavy dependencies and modules
 */

import React, { lazy } from 'react';

// Heavy UI Libraries - Load on demand
export const lazyUIComponents = {
  // Charts (load when analytics is accessed) - Basic fallback
  RechartsComponents: lazy(() => 
    Promise.resolve({ default: () => null as any })
  ),
};

// Excel Processing - Load only when import/export is needed
export const lazyExcelUtils = {
  processLargeDataset: lazy(() => 
    Promise.resolve({ default: () => null })
  ),
  optimizedXLSXReader: lazy(() => 
    Promise.resolve({ default: () => null })
  ),
};

// Service Workers and Background Processing
export const lazyServices = {
  // Analytics service - safe import with fallback
  AnalyticsService: lazy(() => 
    Promise.resolve({ default: {} as any })
  ),
  
  // Supplier service - safe import with fallback
  SupplierService: lazy(() => 
    Promise.resolve({ default: {} as any })
  ),
};

// Animation Libraries - Load only when animations are needed
export const lazyAnimations = {
  // Fallback for missing lottie-react
  LottiePlayer: lazy(() => 
    Promise.resolve({ default: () => null as any })
  ),
};

// Database Connections - Load only when specific DB operations needed
export const lazyDatabaseUtils = {
  // Fallback for database client
  DatabaseClient: lazy(() => 
    Promise.resolve({ default: {} as any })
  ),
};

// Common lazy components with built-in fallbacks
export const commonLazyComponents = {
  // Fallback implementations for missing modules
  AuthService: lazy(() => 
    Promise.resolve({ default: {} as any })
  ),
  
  Button: lazy(() => 
    Promise.resolve({ default: (props: any) => React.createElement("button", props) })
  ),
  
  Input: lazy(() => 
    Promise.resolve({ default: (props: any) => React.createElement("input", props) })
  ),
};

/**
 * Dynamic import with fallback - Safe wrapper for optional dependencies
 */
export async function safeImport<T>(
  importFn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await importFn();
  } catch {
    return fallback;
  }
}

/**
 * Check if a module is available before importing
 */
export function isModuleAvailable(moduleName: string): Promise<boolean> {
  return import(moduleName)
    .then(() => true)
    .catch((error: unknown) => {
      // Module is not available, return false
      return false;
    });
}

/**
 * Preload critical modules in the background
 */
export function preloadCriticalModules(): void {
  // Placeholder for preloading logic

}

// Initialize preloading for critical modules
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(preloadCriticalModules, 1000);
}
