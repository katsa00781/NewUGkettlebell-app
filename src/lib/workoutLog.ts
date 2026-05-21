import { supabase } from './supabase';
import type { Json } from '../types/supabase';
import type { WorkoutSection } from './workouts';

export async function logWorkout(
  workoutId: string,
  sections: WorkoutSection[],
  notes: string | null
): Promise<void> {
  const updateData: { sections: Json; notes?: string } = {
    sections: sections as unknown as Json,
  };
  if (notes) updateData.notes = notes;

  const { error } = await supabase
    .from('workouts')
    .update(updateData)
    .eq('id', workoutId);

  if (error) throw error;
}
