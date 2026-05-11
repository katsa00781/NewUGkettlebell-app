import { create } from 'zustand';
import { GeneratedWorkoutPlan, WorkoutDay } from '@/lib/workoutGenerator';

export type PlannerMode = 'template' | 'periodized';
export type ProgramType = '2napos' | '3napos' | '4napos';
export type TrainingFocus =
  | 'strength'
  | 'power'
  | 'endurance'
  | 'hypertrophy'
  | 'maxStrength'
  | 'maxStrengthHypertrophy'
  | 'hypertrophyFatLoss';

interface WorkoutPlannerState {
  mode: PlannerMode;
  day: WorkoutDay;
  date: string;
  programType: ProgramType;
  cycleWeek: 1 | 2 | 3 | 4 | 5 | 6;
  trainingFocus: TrainingFocus | null;
  generatedWorkout: GeneratedWorkoutPlan | null;
  isGenerating: boolean;
  setMode: (mode: PlannerMode) => void;
  setDay: (day: WorkoutDay) => void;
  setDate: (date: string) => void;
  setProgramType: (type: ProgramType) => void;
  setCycleWeek: (week: 1 | 2 | 3 | 4 | 5 | 6) => void;
  setTrainingFocus: (focus: TrainingFocus | null) => void;
  setGeneratedWorkout: (workout: GeneratedWorkoutPlan | null) => void;
  setIsGenerating: (val: boolean) => void;
  reset: () => void;
}

const today = new Date().toISOString().split('T')[0];

export const useWorkoutPlannerStore = create<WorkoutPlannerState>((set) => ({
  mode: 'template',
  day: 1,
  date: today,
  programType: '3napos',
  cycleWeek: 1,
  trainingFocus: null,
  generatedWorkout: null,
  isGenerating: false,
  setMode: (mode) => set({ mode }),
  setDay: (day) => set({ day }),
  setDate: (date) => set({ date }),
  setProgramType: (programType) => set({ programType }),
  setCycleWeek: (cycleWeek) => set({ cycleWeek }),
  setTrainingFocus: (trainingFocus) => set({ trainingFocus }),
  setGeneratedWorkout: (generatedWorkout) => set({ generatedWorkout }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  reset: () =>
    set({
      mode: 'template',
      day: 1,
      date: today,
      programType: '3napos',
      cycleWeek: 1,
      trainingFocus: null,
      generatedWorkout: null,
      isGenerating: false,
    }),
}));
