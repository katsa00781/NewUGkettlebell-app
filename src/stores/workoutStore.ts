import { create } from 'zustand';

interface WorkoutLoggerState {
  activeWorkoutId: string | null;
  setActiveWorkoutId: (id: string | null) => void;
}

export const useWorkoutLoggerStore = create<WorkoutLoggerState>((set) => ({
  activeWorkoutId: null,
  setActiveWorkoutId: (id) => set({ activeWorkoutId: id }),
}));
