import { supabase } from './supabase';
import type { Database } from '../types/supabase';

export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type ExerciseCategory = Database['public']['Enums']['exercise_category'];
export type MovementPattern = Database['public']['Enums']['movement_pattern'];

export interface ExerciseFilters {
  search?: string;
  category?: ExerciseCategory | null;
  movement_pattern?: MovementPattern | null;
  difficulty?: number | null;
}

export async function getExercises(filters: ExerciseFilters = {}): Promise<Exercise[]> {
  let query = supabase
    .from('exercises')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.movement_pattern) {
    query = query.eq('movement_pattern', filters.movement_pattern);
  }
  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getExercise(id: string): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createExercise(exercise: Database['public']['Tables']['exercises']['Insert']): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .insert(exercise)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExercise(id: string, updates: Database['public']['Tables']['exercises']['Update']): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deactivateExercise(id: string): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}
