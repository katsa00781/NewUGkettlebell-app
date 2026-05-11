import { useQuery } from '@tanstack/react-query';
import { getExercises, getExercise, type ExerciseFilters } from '../lib/exercises';

export function useExercises(filters: ExerciseFilters = {}) {
  return useQuery({
    queryKey: ['exercises', filters],
    queryFn: () => getExercises(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () => getExercise(id),
    enabled: !!id,
  });
}
