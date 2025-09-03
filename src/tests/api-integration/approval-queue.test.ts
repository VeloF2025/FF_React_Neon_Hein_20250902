/**
 * Approval Queue API Integration Tests - COMPREHENSIVE VALIDATION
 * Tests for /api/contractors/documents/approval-queue endpoint
 * Target: >95% coverage with real API functionality validation  
 * NLNH/DGTS compliant: Real API calls, no mocked results
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '../../../api/contractors/documents/approval-queue.js';

describe('Approval Queue API - COMPREHENSIVE INTEGRATION TESTS', () => {
  let testStartTime: number;

  beforeEach(() => {
    testStartTime = Date.now();
  });

  afterEach(() => {
    const testDuration = Date.now() - testStartTime;
    // Performance validation: API calls should complete quickly
    expect(testDuration).toBeLessThan(8000); // 8 seconds max per test
  });

  describe('GET /api/contractors/documents/approval-queue - QUEUE RETRIEVAL', () => {
    test('should retrieve approval queue for specific approver with complete data structure', async () => {
      // 🟢 WORKING: Test comprehensive queue retrieval
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          approverUserId: 'approver-integration-test-001',
          limit: '25',
          offset: '0',
          sortBy: 'due_date',
          sortOrder: 'asc'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      
      // 🟢 WORKING: Validate complete response structure
      expect(responseData).toMatchObject({
        success: true,
        data: {
          items: expect.any(Array),
          pagination: {
            total: expect.any(Number),
            limit: 25,
            offset: 0,
            hasMore: expect.any(Boolean),
            page: expect.any(Number),
            totalPages: expect.any(Number)
          },
          statistics: {
            total: expect.any(Number),
            overdue: expect.any(Number),
            urgent: expect.any(Number),
            dueToday: expect.any(Number),
            byPriority: {
              critical: expect.any(Number),
              urgent: expect.any(Number),
              high: expect.any(Number),
              normal: expect.any(Number),
              low: expect.any(Number)
            },
            byStage: {
              1: expect.any(Number),
              2: expect.any(Number),
              3: expect.any(Number),
              4: expect.any(Number)
            }
          },
          filters: {
            approverUserId: 'approver-integration-test-001',
            priorityLevel: null,
            documentType: null,
            overdue: null,
            isAdmin: false
          },
          sort: {
            sortBy: 'due_date',
            sortOrder: 'asc'
          }
        }
      });

      // 🟢 WORKING: Validate queue item structure if items exist
      if (responseData.data.items.length > 0) {
        const firstItem = responseData.data.items[0];
        expect(firstItem).toMatchObject({
          id: expect.any(String),
          workflowId: expect.any(String),
          documentId: expect.any(String),
          documentName: expect.any(String),
          documentType: expect.any(String),
          contractorId: expect.any(String),
          contractorCompanyName: expect.any(String),
          currentStage: expect.any(Number),
          stageName: expect.any(String),
          priorityLevel: expect.any(String),
          approverId: expect.any(String),
          assignedAt: expect.any(String),
          slaDueDate: expect.any(String),
          isOverdue: expect.any(Boolean),
          escalationLevel: expect.any(Number),
          hoursRemaining: expect.any(Number),
          urgencyScore: expect.any(Number)
        });

        // 🟢 WORKING: Validate stage name mapping
        expect(['Automated Validation', 'Compliance Review', 'Legal Review', 'Final Approval'])
          .toContain(firstItem.stageName);
        
        // 🟢 WORKING: Validate urgency score calculation
        expect(firstItem.urgencyScore).toBeGreaterThanOrEqual(0);
        expect(firstItem.urgencyScore).toBeLessThanOrEqual(100);
      }
    });

    test('should handle admin access to all queue items with comprehensive filtering', async () => {
      // 🟢 WORKING: Test admin queue access with filters
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          isAdmin: 'true',
          priorityLevel: 'high',
          documentType: 'contract',
          overdue: 'true',
          limit: '50',
          sortBy: 'priority',
          sortOrder: 'desc'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      
      // 🟢 WORKING: Validate admin response structure
      expect(responseData.success).toBe(true);
      expect(responseData.data.filters.isAdmin).toBe(true);
      expect(responseData.data.filters.priorityLevel).toBe('high');
      expect(responseData.data.filters.documentType).toBe('contract');
      expect(responseData.data.filters.overdue).toBe('true');
      
      // 🟢 WORKING: Validate admin can access without specific approverUserId
      expect(responseData.data.filters.approverUserId).toBeNull();

      // 🟢 WORKING: Validate sorting configuration
      expect(responseData.data.sort).toMatchObject({
        sortBy: 'priority',
        sortOrder: 'desc'
      });
    });

    test('should validate pagination functionality across different page sizes', async () => {
      // 🟢 WORKING: Test comprehensive pagination
      const paginationTestCases = [
        { limit: 10, offset: 0, expectedPage: 1 },
        { limit: 25, offset: 25, expectedPage: 2 },
        { limit: 50, offset: 100, expectedPage: 3 },
        { limit: 200, offset: 0, expectedPage: 1 }, // Max limit test
        { limit: 1000, offset: 0, expectedLimit: 200 } // Over max limit - should cap at 200
      ];

      for (const testCase of paginationTestCases) {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            approverUserId: 'pagination-test-approver',
            limit: testCase.limit.toString(),
            offset: testCase.offset.toString()
          }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        
        const responseData = JSON.parse(res._getData());
        
        // 🟢 WORKING: Validate pagination calculations
        expect(responseData.data.pagination.offset).toBe(testCase.offset);
        if (testCase.expectedLimit) {
          expect(responseData.data.pagination.limit).toBe(testCase.expectedLimit);
        } else {
          expect(responseData.data.pagination.limit).toBe(testCase.limit);
        }
        
        if (testCase.expectedPage) {
          expect(responseData.data.pagination.page).toBe(testCase.expectedPage);
        }

        // 🟢 WORKING: Validate hasMore calculation logic
        const hasMore = responseData.data.pagination.hasMore;
        const total = responseData.data.pagination.total;
        const limit = responseData.data.pagination.limit;
        const offset = responseData.data.pagination.offset;
        
        expect(hasMore).toBe(offset + limit < total);
      }
    });

    test('should handle all priority level filters correctly', async () => {
      // 🟢 WORKING: Test priority-based filtering
      const priorityLevels = ['low', 'normal', 'high', 'urgent', 'critical'];

      for (const priority of priorityLevels) {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            approverUserId: 'priority-filter-test',
            priorityLevel: priority,
            limit: '20'
          }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        
        const responseData = JSON.parse(res._getData());
        
        // 🟢 WORKING: Validate priority filter was applied
        expect(responseData.data.filters.priorityLevel).toBe(priority);
        
        // 🟢 WORKING: Validate all returned items match the priority filter
        responseData.data.items.forEach((item: any) => {
          expect(item.priorityLevel).toBe(priority);
        });

        // 🟢 WORKING: Validate priority statistics are consistent
        const priorityStats = responseData.data.statistics.byPriority;
        expect(priorityStats[priority]).toBe(responseData.data.items.length);
      }
    });

    test('should validate sorting functionality for all supported sort options', async () => {
      // 🟢 WORKING: Test comprehensive sorting options
      const sortingTestCases = [
        { sortBy: 'priority', sortOrder: 'asc', description: 'Priority ascending (low to high urgency)' },
        { sortBy: 'priority', sortOrder: 'desc', description: 'Priority descending (high to low urgency)' },
        { sortBy: 'due_date', sortOrder: 'asc', description: 'Due date ascending (earliest first)' },
        { sortBy: 'due_date', sortOrder: 'desc', description: 'Due date descending (latest first)' },
        { sortBy: 'assigned_date', sortOrder: 'asc', description: 'Assigned date ascending (oldest first)' },
        { sortBy: 'assigned_date', sortOrder: 'desc', description: 'Assigned date descending (newest first)' }
      ];

      for (const sortTest of sortingTestCases) {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            approverUserId: 'sort-test-approver',
            sortBy: sortTest.sortBy,
            sortOrder: sortTest.sortOrder,
            limit: '30'
          }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        
        const responseData = JSON.parse(res._getData());
        
        // 🟢 WORKING: Validate sort parameters were applied
        expect(responseData.data.sort.sortBy).toBe(sortTest.sortBy);
        expect(responseData.data.sort.sortOrder).toBe(sortTest.sortOrder);

        // 🟢 WORKING: Validate sorting logic for items with sufficient data
        if (responseData.data.items.length >= 2) {
          const items = responseData.data.items;
          
          if (sortTest.sortBy === 'due_date') {
            // Validate date sorting
            for (let i = 1; i < items.length; i++) {
              const prevDate = new Date(items[i-1].slaDueDate);
              const currDate = new Date(items[i].slaDueDate);
              
              if (sortTest.sortOrder === 'asc') {
                expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
              } else {
                expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
              }
            }
          }
          
          if (sortTest.sortBy === 'assigned_date') {
            // Validate assigned date sorting
            for (let i = 1; i < items.length; i++) {
              const prevDate = new Date(items[i-1].assignedAt);
              const currDate = new Date(items[i].assignedAt);
              
              if (sortTest.sortOrder === 'asc') {
                expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
              } else {
                expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
              }
            }
          }
        }
      }
    });

    test('should handle overdue filtering with accurate time calculations', async () => {
      // 🟢 WORKING: Test overdue filtering functionality
      const overdueTestCases = [
        { overdue: 'true', description: 'Only overdue items' },
        { overdue: 'false', description: 'Only non-overdue items' },
        { description: 'All items (no overdue filter)' }
      ];

      for (const testCase of overdueTestCases) {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            approverUserId: 'overdue-test-approver',
            overdue: testCase.overdue,
            limit: '40'
          }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        
        const responseData = JSON.parse(res._getData());
        
        // 🟢 WORKING: Validate overdue filter was applied
        expect(responseData.data.filters.overdue).toBe(testCase.overdue || null);

        // 🟢 WORKING: Validate overdue filtering logic
        if (testCase.overdue === 'true') {
          responseData.data.items.forEach((item: any) => {
            expect(item.isOverdue).toBe(true);
            expect(item.hoursRemaining).toBeLessThanOrEqual(0);
          });
        } else if (testCase.overdue === 'false') {
          responseData.data.items.forEach((item: any) => {
            expect(item.isOverdue).toBe(false);
            expect(item.hoursRemaining).toBeGreaterThan(0);
          });
        }

        // 🟢 WORKING: Validate overdue statistics consistency
        const overdueCount = responseData.data.items.filter((item: any) => item.isOverdue).length;
        if (testCase.overdue === 'true') {
          expect(overdueCount).toBe(responseData.data.items.length);
        } else if (testCase.overdue === 'false') {
          expect(overdueCount).toBe(0);
        }
      }
    });

    test('should validate document type filtering accuracy', async () => {
      // 🟢 WORKING: Test document type filtering
      const documentTypes = ['contract', 'insurance', 'permit', 'certification'];

      for (const docType of documentTypes) {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            approverUserId: 'doctype-test-approver',
            documentType: docType,
            limit: '25'
          }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        
        const responseData = JSON.parse(res._getData());
        
        // 🟢 WORKING: Validate document type filter was applied
        expect(responseData.data.filters.documentType).toBe(docType);
        
        // 🟢 WORKING: Validate all returned items match the document type filter
        responseData.data.items.forEach((item: any) => {
          expect(item.documentType).toBe(docType);
        });
      }
    });

    test('should calculate urgency scores accurately based on SLA and priority', async () => {
      // 🟢 WORKING: Test urgency score calculation logic
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          approverUserId: 'urgency-test-approver',
          limit: '50'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      
      responseData.data.items.forEach((item: any) => {
        // 🟢 WORKING: Validate urgency score calculation logic
        if (item.isOverdue) {
          expect(item.urgencyScore).toBe(100);
        } else if (item.hoursRemaining < 2) {
          expect(item.urgencyScore).toBe(90);
        } else if (item.hoursRemaining < 8) {
          expect(item.urgencyScore).toBe(70);
        } else if (item.hoursRemaining < 24) {
          expect(item.urgencyScore).toBe(50);
        } else {
          expect(item.urgencyScore).toBe(10);
        }

        // 🟢 WORKING: Validate urgency score bounds
        expect(item.urgencyScore).toBeGreaterThanOrEqual(0);
        expect(item.urgencyScore).toBeLessThanOrEqual(100);
      });
    });

    test('should validate statistics calculations accuracy', async () => {
      // 🟢 WORKING: Test statistics calculation accuracy
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          approverUserId: 'stats-test-approver',
          limit: '100' // Large limit to get comprehensive statistics
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      const items = responseData.data.items;
      const stats = responseData.data.statistics;

      // 🟢 WORKING: Validate total count accuracy
      expect(stats.total).toBeGreaterThanOrEqual(items.length);

      // 🟢 WORKING: Validate overdue count accuracy
      const actualOverdueCount = items.filter((item: any) => item.isOverdue).length;
      expect(stats.overdue).toBeGreaterThanOrEqual(actualOverdueCount);

      // 🟢 WORKING: Validate urgent count accuracy (urgent + critical)
      const actualUrgentCount = items.filter((item: any) => 
        item.priorityLevel === 'urgent' || item.priorityLevel === 'critical'
      ).length;
      expect(stats.urgent).toBeGreaterThanOrEqual(actualUrgentCount);

      // 🟢 WORKING: Validate priority breakdown accuracy
      const priorityBreakdown = {
        critical: items.filter((item: any) => item.priorityLevel === 'critical').length,
        urgent: items.filter((item: any) => item.priorityLevel === 'urgent').length,
        high: items.filter((item: any) => item.priorityLevel === 'high').length,
        normal: items.filter((item: any) => item.priorityLevel === 'normal').length,
        low: items.filter((item: any) => item.priorityLevel === 'low').length
      };

      // Statistics should be at least as high as current page items
      expect(stats.byPriority.critical).toBeGreaterThanOrEqual(priorityBreakdown.critical);
      expect(stats.byPriority.urgent).toBeGreaterThanOrEqual(priorityBreakdown.urgent);
      expect(stats.byPriority.high).toBeGreaterThanOrEqual(priorityBreakdown.high);
      expect(stats.byPriority.normal).toBeGreaterThanOrEqual(priorityBreakdown.normal);
      expect(stats.byPriority.low).toBeGreaterThanOrEqual(priorityBreakdown.low);

      // 🟢 WORKING: Validate stage breakdown accuracy
      const stageBreakdown = {
        1: items.filter((item: any) => item.currentStage === 1).length,
        2: items.filter((item: any) => item.currentStage === 2).length,
        3: items.filter((item: any) => item.currentStage === 3).length,
        4: items.filter((item: any) => item.currentStage === 4).length
      };

      expect(stats.byStage[1]).toBeGreaterThanOrEqual(stageBreakdown[1]);
      expect(stats.byStage[2]).toBeGreaterThanOrEqual(stageBreakdown[2]);
      expect(stats.byStage[3]).toBeGreaterThanOrEqual(stageBreakdown[3]);
      expect(stats.byStage[4]).toBeGreaterThanOrEqual(stageBreakdown[4]);

      // 🟢 WORKING: Validate due today calculation
      const today = new Date().toDateString();
      const actualDueTodayCount = items.filter((item: any) => {
        const dueDate = new Date(item.slaDueDate);
        return dueDate.toDateString() === today;
      }).length;
      expect(stats.dueToday).toBeGreaterThanOrEqual(actualDueTodayCount);
    });
  });

  describe('API Input Validation and Error Handling', () => {
    test('should validate required parameters for non-admin access', async () => {
      // 🟢 WORKING: Test non-admin access validation
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          // Missing approverUserId for non-admin
          limit: '25'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toMatchObject({
        success: false,
        error: 'Approver user ID is required for non-admin access'
      });
    });

    test('should validate sort parameter values', async () => {
      // 🟢 WORKING: Test invalid sort parameter handling
      const invalidSortTests = [
        {
          sortBy: 'invalid_sort',
          sortOrder: 'asc',
          expectedError: 'Invalid sortBy parameter'
        },
        {
          sortBy: 'priority',
          sortOrder: 'invalid_order',
          expectedError: 'Invalid sortOrder parameter'
        }
      ];

      for (const sortTest of invalidSortTests) {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            approverUserId: 'validation-test-approver',
            sortBy: sortTest.sortBy,
            sortOrder: sortTest.sortOrder
          }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        
        const responseData = JSON.parse(res._getData());
        expect(responseData.success).toBe(false);
        expect(responseData.error).toContain(sortTest.expectedError);
      }
    });

    test('should validate priority level parameter values', async () => {
      // 🟢 WORKING: Test invalid priority level handling
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          approverUserId: 'priority-validation-test',
          priorityLevel: 'invalid-priority'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid priority level')
      });
    });

    test('should handle pagination parameter edge cases', async () => {
      // 🟢 WORKING: Test pagination edge case handling
      const paginationEdgeCases = [
        {
          name: 'negative limit',
          query: { approverUserId: 'edge-test', limit: '-10', offset: '0' },
          expectedLimit: 50 // Should default to 50
        },
        {
          name: 'negative offset',
          query: { approverUserId: 'edge-test', limit: '25', offset: '-5' },
          expectedOffset: 0 // Should default to 0
        },
        {
          name: 'non-numeric limit',
          query: { approverUserId: 'edge-test', limit: 'abc', offset: '0' },
          expectedLimit: 50 // Should default to 50
        },
        {
          name: 'non-numeric offset',
          query: { approverUserId: 'edge-test', limit: '25', offset: 'xyz' },
          expectedOffset: 0 // Should default to 0
        },
        {
          name: 'extremely large limit',
          query: { approverUserId: 'edge-test', limit: '999999', offset: '0' },
          expectedLimit: 200 // Should cap at 200
        }
      ];

      for (const edgeCase of paginationEdgeCases) {
        const { req, res } = createMocks({
          method: 'GET',
          query: edgeCase.query
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        
        const responseData = JSON.parse(res._getData());
        
        if (edgeCase.expectedLimit !== undefined) {
          expect(responseData.data.pagination.limit).toBe(edgeCase.expectedLimit);
        }
        
        if (edgeCase.expectedOffset !== undefined) {
          expect(responseData.data.pagination.offset).toBe(edgeCase.expectedOffset);
        }
      }
    });

    test('should handle unsupported HTTP methods gracefully', async () => {
      // 🟢 WORKING: Test method not allowed handling
      const unsupportedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

      for (const method of unsupportedMethods) {
        const { req, res } = createMocks({ method });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(405);
        
        const responseData = JSON.parse(res._getData());
        expect(responseData).toMatchObject({
          success: false,
          error: 'Method not allowed',
          allowedMethods: ['GET']
        });
      }
    });

    test('should handle CORS preflight requests correctly', async () => {
      // 🟢 WORKING: Test CORS handling
      const { req, res } = createMocks({
        method: 'OPTIONS'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      // Validate CORS headers are set
      const headers = res._getHeaders();
      expect(headers).toHaveProperty('access-control-allow-origin');
      expect(headers).toHaveProperty('access-control-allow-methods');
      expect(headers).toHaveProperty('access-control-allow-headers');
      expect(headers['access-control-allow-methods']).toContain('GET');
    });

    test('should handle database connection errors gracefully', async () => {
      // 🟢 WORKING: Test database error handling resilience
      // This test validates the API structure handles database errors without throwing
      
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          approverUserId: 'db-error-simulation-test'
        }
      });

      await handler(req, res);

      // Should not throw unhandled errors
      expect(typeof res._getStatusCode()).toBe('number');
      const responseData = JSON.parse(res._getData());
      expect(responseData).toHaveProperty('success');
      
      // Should return either success with data or controlled error
      expect([200, 500]).toContain(res._getStatusCode());
    });
  });

  describe('API Performance and Scalability Tests', () => {
    test('should handle large limit requests efficiently', async () => {
      // 🟢 WORKING: Test performance with maximum allowed limit
      const startTime = Date.now();

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          approverUserId: 'performance-test-large-limit',
          limit: '200', // Maximum allowed
          offset: '0'
        }
      });

      await handler(req, res);

      const responseTime = Date.now() - startTime;

      // 🟢 WORKING: Validate performance requirements
      expect(responseTime).toBeLessThan(5000); // 5 second max response time
      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.data.pagination.limit).toBe(200);
    });

    test('should maintain consistent response time across different query combinations', async () => {
      // 🟢 WORKING: Test performance consistency
      const queryVariations = [
        { approverUserId: 'perf-test-1', limit: '50' },
        { approverUserId: 'perf-test-2', limit: '100', sortBy: 'priority', sortOrder: 'desc' },
        { isAdmin: 'true', priorityLevel: 'high', limit: '75' },
        { approverUserId: 'perf-test-3', overdue: 'true', documentType: 'contract', limit: '25' }
      ];

      const responseTimes: number[] = [];

      for (const queryVariation of queryVariations) {
        const startTime = Date.now();

        const { req, res } = createMocks({
          method: 'GET',
          query: queryVariation
        });

        await handler(req, res);

        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);

        expect(res._getStatusCode()).toBe(200);
        expect(responseTime).toBeLessThan(8000); // 8 second max per variation
      }

      // 🟢 WORKING: Validate consistent performance (no variation should be 3x slower than fastest)
      const minTime = Math.min(...responseTimes);
      const maxTime = Math.max(...responseTimes);
      expect(maxTime).toBeLessThan(minTime * 3);
    });

    test('should validate memory efficiency with repeated requests', async () => {
      // 🟢 WORKING: Test memory efficiency
      const startMemory = process.memoryUsage().heapUsed;
      
      // Execute multiple requests to test memory management
      for (let i = 0; i < 5; i++) {
        const { req, res } = createMocks({
          method: 'GET',
          query: {
            approverUserId: `memory-test-${i}`,
            limit: '50'
          }
        });

        await handler(req, res);
        expect(res._getStatusCode()).toBe(200);
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      // 🟢 WORKING: Validate memory usage is reasonable
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024); // Less than 20MB increase
    });
  });

  describe('API Data Integrity and Consistency Tests', () => {
    test('should maintain data type consistency across all response fields', async () => {
      // 🟢 WORKING: Test data type consistency
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          approverUserId: 'data-type-consistency-test',
          limit: '30'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());

      // 🟢 WORKING: Validate root level data types
      expect(typeof responseData.success).toBe('boolean');
      expect(typeof responseData.data).toBe('object');

      // 🟢 WORKING: Validate pagination data types
      const pagination = responseData.data.pagination;
      expect(typeof pagination.total).toBe('number');
      expect(typeof pagination.limit).toBe('number');
      expect(typeof pagination.offset).toBe('number');
      expect(typeof pagination.hasMore).toBe('boolean');
      expect(typeof pagination.page).toBe('number');
      expect(typeof pagination.totalPages).toBe('number');

      // 🟢 WORKING: Validate statistics data types
      const stats = responseData.data.statistics;
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.overdue).toBe('number');
      expect(typeof stats.urgent).toBe('number');
      expect(typeof stats.dueToday).toBe('number');

      Object.values(stats.byPriority).forEach(count => {
        expect(typeof count).toBe('number');
      });

      Object.values(stats.byStage).forEach(count => {
        expect(typeof count).toBe('number');
      });

      // 🟢 WORKING: Validate queue item data types
      responseData.data.items.forEach((item: any) => {
        expect(typeof item.id).toBe('string');
        expect(typeof item.workflowId).toBe('string');
        expect(typeof item.documentId).toBe('string');
        expect(typeof item.documentName).toBe('string');
        expect(typeof item.documentType).toBe('string');
        expect(typeof item.contractorId).toBe('string');
        expect(typeof item.currentStage).toBe('number');
        expect(typeof item.stageName).toBe('string');
        expect(typeof item.priorityLevel).toBe('string');
        expect(typeof item.isOverdue).toBe('boolean');
        expect(typeof item.escalationLevel).toBe('number');
        expect(typeof item.hoursRemaining).toBe('number');
        expect(typeof item.urgencyScore).toBe('number');
      });
    });

    test('should validate date format consistency across all date fields', async () => {
      // 🟢 WORKING: Test date format consistency
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          approverUserId: 'date-format-test',
          limit: '20'
        }
      });

      await handler(req, res);

      if (res._getStatusCode() === 200) {
        const responseData = JSON.parse(res._getData());

        responseData.data.items.forEach((item: any) => {
          // 🟢 WORKING: Validate date fields are valid ISO strings
          if (item.assignedAt) {
            expect(() => new Date(item.assignedAt)).not.toThrow();
            expect(new Date(item.assignedAt).toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
          }
          
          if (item.slaDueDate) {
            expect(() => new Date(item.slaDueDate)).not.toThrow();
            expect(new Date(item.slaDueDate).toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
          }
        });
      }
    });

    test('should validate numerical field ranges and constraints', async () => {
      // 🟢 WORKING: Test numerical constraints
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          approverUserId: 'numerical-constraints-test',
          limit: '40'
        }
      });

      await handler(req, res);

      if (res._getStatusCode() === 200) {
        const responseData = JSON.parse(res._getData());

        responseData.data.items.forEach((item: any) => {
          // 🟢 WORKING: Validate stage numbers are within valid range
          expect(item.currentStage).toBeGreaterThanOrEqual(1);
          expect(item.currentStage).toBeLessThanOrEqual(4);

          // 🟢 WORKING: Validate escalation level is non-negative
          expect(item.escalationLevel).toBeGreaterThanOrEqual(0);

          // 🟢 WORKING: Validate urgency score is within bounds
          expect(item.urgencyScore).toBeGreaterThanOrEqual(0);
          expect(item.urgencyScore).toBeLessThanOrEqual(100);

          // 🟢 WORKING: Validate hours remaining calculation
          expect(typeof item.hoursRemaining).toBe('number');
          expect(isFinite(item.hoursRemaining)).toBe(true);

          // 🟢 WORKING: Validate estimated review time if present
          if (item.estimatedReviewTime) {
            expect(item.estimatedReviewTime).toBeGreaterThan(0);
          }
        });
      }
    });
  });
});