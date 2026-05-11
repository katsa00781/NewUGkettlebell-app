import { supabase } from './supabase';
import type { Database } from '../types/supabase';

export type UserWeight = Database['public']['Tables']['user_weights']['Row'];

export async function getUserWeights(userId: string): Promise<UserWeight[]> {
  const { data, error } = await supabase
    .from('user_weights')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function addWeight(weight: number, date: string, notes?: string): Promise<UserWeight> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_weights')
    .insert({ user_id: user.id, weight, date, notes: notes ?? null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWeight(id: string): Promise<void> {
  const { error } = await supabase
    .from('user_weights')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
