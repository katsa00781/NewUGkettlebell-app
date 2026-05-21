import { create } from 'zustand';

interface WorkoutLogState {
  activeWorkoutId: string | null;
  startedAt: string | null;
  setActiveWorkout: (id: string, startedAt: string) => void;
  clearActiveWorkout: () => void;
}

export const useWorkoutLogStore = create<WorkoutLogState>(set => ({
  activeWorkoutId: null,
  startedAt: null,
  setActiveWorkout: (id, startedAt) => set({ activeWorkoutId: id, startedAt }),
  clearActiveWorkout: () => set({ activeWorkoutId: null, startedAt: null }),
}));
