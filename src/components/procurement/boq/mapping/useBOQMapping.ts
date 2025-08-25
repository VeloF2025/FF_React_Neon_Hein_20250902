/**
 * BOQ Mapping Review Hook
 */

import { useState, useEffect, useMemo } from 'react';
import { BOQ, BOQItemMappingStatusType } from '@/types/procurement/boq.types';
import { procurementApiService } from '@/services/procurement/boqApiExtensions';
import { useProcurementContext } from '@/hooks/procurement/useProcurementContext';
import toast from 'react-hot-toast';
import {
  ExceptionWithItem,
  FilterState,
  SortField,
  SortDirection,
  INITIAL_FILTERS
} from './BOQMappingTypes';

export function useBOQMapping(boqId: string, onMappingComplete?: (count: number) => void) {
  const { context } = useProcurementContext();
  const [boq, setBOQ] = useState<BOQ | null>(null);
  const [exceptions, setExceptions] = useState<ExceptionWithItem[]>([]);
  const [selectedExceptions, setSelectedExceptions] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortField] = useState<SortField>('severity');
  const [sortDirection] = useState<SortDirection>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedException, setExpandedException] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, [boqId, context]);

  const loadData = async () => {
    if (!context) return;

    try {
      setIsLoading(true);
      
      // Load BOQ details
      const boqData = await procurementApiService.getBOQ(context, boqId);
      setBOQ(boqData);

      // Load exceptions with related BOQ items
      const exceptionsData = await procurementApiService.getBOQExceptions(context, boqId);
      
      // Enhance exceptions with BOQ item data and suggestions
      const enhancedExceptions: ExceptionWithItem[] = await Promise.all(
        exceptionsData.map(async (exception) => {
          const boqItem = await procurementApiService.getBOQItem(context, exception.boqItemId);
          
          // Generate fresh suggestions if none exist
          let suggestions = exception.systemSuggestions || [];
          if (suggestions.length === 0) {
            // This would call a suggestion generation service
            suggestions = [];
          }
          
          return {
            ...exception,
            boqItem,
            suggestions
          };
        })
      );

      setExceptions(enhancedExceptions);
    } catch (error) {
      console.error('Failed to load mapping data:', error);
      toast.error('Failed to load mapping data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort exceptions
  const filteredExceptions = useMemo(() => {
    let filtered = exceptions;

    // Apply filters
    if (filters.severity) {
      filtered = filtered.filter(e => e.severity === filters.severity);
    }
    if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }
    if (filters.exceptionType) {
      filtered = filtered.filter(e => e.exceptionType === filters.exceptionType);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.boqItem.description?.toLowerCase().includes(searchLower) ||
        e.boqItem.itemCode?.toLowerCase().includes(searchLower) ||
        e.exceptionDetails?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'lineNumber':
          aVal = a.boqItem.lineNumber;
          bVal = b.boqItem.lineNumber;
          break;
        case 'severity': {
          const severityOrder = { high: 3, medium: 2, low: 1 };
          aVal = severityOrder[a.severity as keyof typeof severityOrder];
          bVal = severityOrder[b.severity as keyof typeof severityOrder];
          break;
        }
        case 'confidence':
          aVal = a.suggestions[0]?.confidence || 0;
          bVal = b.suggestions[0]?.confidence || 0;
          break;
        case 'createdAt':
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [exceptions, filters, sortField, sortDirection]);

  // Handle mapping approval
  const handleApproveMapping = async (exceptionId: string, suggestionIndex: number) => {
    if (!context) return;

    try {
      setIsProcessing(true);
      const exception = exceptions.find(e => e.id === exceptionId);
      if (!exception) return;

      const suggestion = exception.suggestions[suggestionIndex];
      
      // Update BOQ item with selected mapping
      await procurementApiService.updateBOQItem(context, exception.boqItemId, {
        catalogItemId: suggestion.catalogItemId,
        catalogItemCode: suggestion.catalogItemCode,
        catalogItemName: suggestion.catalogItemName,
        mappingConfidence: suggestion.confidence,
        mappingStatus: 'mapped' as BOQItemMappingStatusType
      });

      // Resolve exception
      await procurementApiService.updateBOQException(context, exceptionId, {
        status: 'resolved',
        resolvedBy: context.userId,
        resolvedAt: new Date(),
        resolutionAction: 'manual_mapping',
        resolutionNotes: `Mapped to ${suggestion.catalogItemCode} - ${suggestion.catalogItemName}`
      });

      // Remove from local state
      setExceptions(prev => prev.filter(e => e.id !== exceptionId));
      setSelectedExceptions(prev => {
        const newSet = new Set(prev);
        newSet.delete(exceptionId);
        return newSet;
      });

      toast.success('Mapping approved successfully');
      onMappingComplete?.(1);
    } catch (error) {
      console.error('Failed to approve mapping:', error);
      toast.error('Failed to approve mapping');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle exception dismissal
  const handleDismissException = async (exceptionId: string, reason: string) => {
    if (!context) return;

    try {
      setIsProcessing(true);
      
      await procurementApiService.updateBOQException(context, exceptionId, {
        status: 'ignored',
        resolvedBy: context.userId,
        resolvedAt: new Date(),
        resolutionAction: 'item_ignore',
        resolutionNotes: reason
      });

      setExceptions(prev => prev.filter(e => e.id !== exceptionId));
      setSelectedExceptions(prev => {
        const newSet = new Set(prev);
        newSet.delete(exceptionId);
        return newSet;
      });

      toast.success('Exception dismissed');
    } catch (error) {
      console.error('Failed to dismiss exception:', error);
      toast.error('Failed to dismiss exception');
    } finally {
      setIsProcessing(false);
    }
  };

  // Batch operations
  const handleBatchApprove = async () => {
    if (selectedExceptions.size === 0) return;

    try {
      setIsProcessing(true);
      let successCount = 0;

      for (const exceptionId of selectedExceptions) {
        const exception = exceptions.find(e => e.id === exceptionId);
        if (exception && exception.suggestions.length > 0) {
          await handleApproveMapping(exceptionId, 0); // Use best match
          successCount++;
        }
      }

      toast.success(`Approved ${successCount} mappings`);
      onMappingComplete?.(successCount);
    } catch (error) {
      console.error('Batch approval failed:', error);
      toast.error('Batch approval failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchDismiss = async () => {
    if (selectedExceptions.size === 0) return;

    try {
      setIsProcessing(true);
      
      for (const exceptionId of selectedExceptions) {
        await handleDismissException(exceptionId, 'Batch dismissed');
      }

      toast.success(`Dismissed ${selectedExceptions.size} exceptions`);
    } catch (error) {
      console.error('Batch dismiss failed:', error);
      toast.error('Batch dismiss failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    boq,
    exceptions: filteredExceptions,
    totalExceptions: exceptions.length,
    selectedExceptions,
    filters,
    isLoading,
    isProcessing,
    expandedException,
    setFilters,
    setSelectedExceptions,
    setExpandedException,
    handleApproveMapping,
    handleDismissException,
    handleBatchApprove,
    handleBatchDismiss,
    loadData
  };
}