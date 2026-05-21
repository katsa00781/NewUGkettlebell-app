import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFmsAssessments, getLatestFmsAssessment, saveFmsAssessment, deleteFmsAssessment } from '../lib/fms';
import { useAuth } from './useAuth';

export function useFmsAssessments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['fms', user?.id],
    queryFn: () => getFmsAssessments(user!.id),
    enabled: !!user,
  });
}

export function useLatestFmsAssessment() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['fms', 'latest', user?.id],
    queryFn: () => getLatestFmsAssessment(user!.id),
    enabled: !!user,
  });
}

export function useSaveFmsAssessment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: saveFmsAssessment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fms', user?.id] });
    },
  });
}

export function useDeleteFmsAssessment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: deleteFmsAssessment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fms', user?.id] });
    },
  });
}
