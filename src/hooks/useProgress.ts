import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserWeights, addWeight, deleteWeight } from '../lib/weights';
import { useAuth } from './useAuth';

export function useUserWeights() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['weights', user?.id],
    queryFn: () => getUserWeights(user!.id),
    enabled: !!user,
  });
}

export function useAddWeight() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ weight, date, notes }: { weight: number; date: string; notes?: string }) =>
      addWeight(weight, date, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weights', user?.id] }),
  });
}

export function useDeleteWeight() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: deleteWeight,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weights', user?.id] }),
  });
}
