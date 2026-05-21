import { supabase } from './supabase';
import type { UserMeasurement } from '../types/supabase';

export type MeasurementInsert = {
  date: string;
  weight: number;
  body_fat_pct?: number | null;
  muscle_mass_kg?: number | null;
  visceral_fat?: number | null;
  bmi?: number | null;
  body_water_pct?: number | null;
  bone_mass_kg?: number | null;
  notes?: string | null;
};

export async function getMeasurements(userId: string): Promise<UserMeasurement[]> {
  const { data, error } = await supabase
    .from('user_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getLatestMeasurement(userId: string): Promise<UserMeasurement | null> {
  const { data, error } = await supabase
    .from('user_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function addMeasurement(measurement: MeasurementInsert): Promise<UserMeasurement> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_measurements')
    .insert({ ...measurement, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMeasurement(id: string): Promise<void> {
  const { error } = await supabase
    .from('user_measurements')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
