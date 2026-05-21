import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { logWorkout } from '@/lib/workoutLog';
import type { WorkoutSection } from '@/lib/workouts';

export function useLogWorkout() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({
      workoutId,
      sections,
      notes,
    }: {
      workoutId: string;
      sections: WorkoutSection[];
      notes: string | null;
    }) => logWorkout(workoutId, sections, notes),
    onSuccess: (_, { workoutId }) => {
      qc.invalidateQueries({ queryKey: ['workouts', user?.id] });
      qc.invalidateQueries({ queryKey: ['workout', workoutId] });
    },
  });
}
