import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMeasurements, getLatestMeasurement, addMeasurement, deleteMeasurement } from '../lib/measurements';
import { useAuth } from './useAuth';

export function useUserMeasurements() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['measurements', user?.id],
    queryFn: () => getMeasurements(user!.id),
    enabled: !!user,
  });
}

export function useLatestMeasurement() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['measurements', 'latest', user?.id],
    queryFn: () => getLatestMeasurement(user!.id),
    enabled: !!user,
  });
}

export function useAddMeasurement() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: addMeasurement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['measurements', user?.id] });
    },
  });
}

export function useDeleteMeasurement() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: deleteMeasurement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['measurements', user?.id] });
    },
  });
}
