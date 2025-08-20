import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { poleTrackerService } from '../services/poleTrackerService';
import { PoleTracker, PoleSearchFilters } from '../types/pole-tracker.types';

const QUERY_KEY = 'pole-trackers';

export function usePoleTrackers(filters?: PoleSearchFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => poleTrackerService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePoleTracker(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => poleTrackerService.getById(id),
    enabled: !!id,
  });
}

export function useProjectPoles(projectId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'project', projectId],
    queryFn: () => poleTrackerService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreatePole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<PoleTracker, 'id'>) => poleTrackerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdatePole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PoleTracker> }) =>
      poleTrackerService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeletePole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => poleTrackerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function usePoleStatistics(projectId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'statistics', projectId],
    queryFn: () => poleTrackerService.getStatistics(projectId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePendingSyncPoles() {
  return useQuery({
    queryKey: [QUERY_KEY, 'pending-sync'],
    queryFn: () => poleTrackerService.getPendingSync(),
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}