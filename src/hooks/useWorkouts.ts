import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkouts, getWorkout, createWorkout, updateWorkout, deleteWorkout, duplicateWorkout } from '../lib/workouts';
import { useAuth } from './useAuth';

export function useWorkouts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['workouts', user?.id],
    queryFn: () => getWorkouts(user!.id),
    enabled: !!user,
  });
}

export function useWorkout(id: string) {
  return useQuery({
    queryKey: ['workout', id],
    queryFn: () => getWorkout(id),
    enabled: !!id,
  });
}

export function useCreateWorkout() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: createWorkout,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workouts', user?.id] }),
  });
}

export function useUpdateWorkout() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateWorkout>[1] }) =>
      updateWorkout(id, updates),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['workouts', user?.id] });
      qc.invalidateQueries({ queryKey: ['workout', id] });
    },
  });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workouts', user?.id] }),
  });
}

export function useDuplicateWorkout() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: duplicateWorkout,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workouts', user?.id] }),
  });
}
