import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  getIntervalTimers,
  saveIntervalTimer,
  deleteIntervalTimer,
} from '@/lib/intervalTimers';
import type { IntervalTimer } from '@/lib/intervalTimers';

export function useIntervalTimers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['interval_timers', user?.id],
    queryFn: () => getIntervalTimers(user!.id),
    enabled: !!user,
  });
}

export function useSaveIntervalTimer() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (timer: Omit<IntervalTimer, 'id' | 'created_at'>) =>
      saveIntervalTimer(timer),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['interval_timers', user?.id] }),
  });
}

export function useDeleteIntervalTimer() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteIntervalTimer(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['interval_timers', user?.id] }),
  });
}
