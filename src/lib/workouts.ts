import { supabase } from './supabase';
import type { Database, Json } from '../types/supabase';

export type Workout = Database['public']['Tables']['workouts']['Row'];
export type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];

export interface WorkoutSection {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: number | string;
  weight?: number;
  rest?: number;
  notes?: string;
  // Tényleges teljesítmény – az atléta tölti ki edzés közben
  actualSets?: number;
  actualReps?: number | string;
  actualWeight?: number;
  personalNotes?: string;
  completed?: boolean;
}

function parseSections(sections: Json): WorkoutSection[] {
  if (typeof sections === 'string') {
    try {
      return JSON.parse(sections) as WorkoutSection[];
    } catch {
      return [];
    }
  }
  return (sections as unknown as WorkoutSection[]) ?? [];
}

export async function getWorkouts(userId: string): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getWorkout(id: string): Promise<Workout & { parsedSections: WorkoutSection[] }> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  const sections = parseSections(data.sections);

  // Collect exerciseIds that are missing a name
  const missingIds = new Set<string>();
  sections.forEach(s =>
    s.exercises?.forEach(ex => {
      if (ex.exerciseId && !ex.name) missingIds.add(ex.exerciseId);
    })
  );

  if (missingIds.size > 0) {
    const { data: exerciseRows } = await supabase
      .from('exercises')
      .select('id, name, description')
      .in('id', [...missingIds]);

    if (exerciseRows) {
      const byId = new Map(exerciseRows.map(e => [e.id, e]));
      sections.forEach(s => {
        s.exercises = s.exercises?.map(ex => ({
          ...ex,
          name: ex.name || byId.get(ex.exerciseId)?.name || '',
        }));
      });
    }
  }

  return { ...data, parsedSections: sections };
}

export async function createWorkout(workout: Omit<WorkoutInsert, 'user_id'>): Promise<Workout> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('workouts')
    .insert({ ...workout, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWorkout(id: string, updates: Database['public']['Tables']['workouts']['Update']): Promise<Workout> {
  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function duplicateWorkout(id: string): Promise<Workout> {
  const original = await getWorkout(id);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('workouts')
    .insert({
      title: `${original.title} (másolat)`,
      date: new Date().toISOString().split('T')[0],
      duration: original.duration,
      notes: original.notes,
      sections: original.sections,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
