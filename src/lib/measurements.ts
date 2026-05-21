import { supabase } from './supabase';
import type { UserMeasurement } from '../types/supabase';
import type { Tables } from '../types/supabase';

type UserWeightRow = Tables<'user_weights'>;

function toMeasurement(row: UserWeightRow): UserMeasurement {
  return {
    id: row.id,
    user_id: row.user_id ?? '',
    date: row.date,
    weight: row.weight ?? 0,
    body_fat_pct: row.bodyfat ?? null,
    muscle_mass_kg: row.muscle ?? null,
    visceral_fat: null,
    bmi: row.bmi ?? null,
    body_water_pct: null,
    bone_mass_kg: null,
    notes: null,
    created_at: row.created_at ?? '',
  };
}

export type MeasurementInsert = {
  date: string;
  weight: number;
  body_fat_pct?: number | null;
  muscle_mass_kg?: number | null;
  bmi?: number | null;
};

export async function getMeasurements(userId: string): Promise<UserMeasurement[]> {
  const { data, error } = await supabase
    .from('user_weights')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toMeasurement);
}

export async function getLatestMeasurement(userId: string): Promise<UserMeasurement | null> {
  const { data, error } = await supabase
    .from('user_weights')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? toMeasurement(data) : null;
}

export async function addMeasurement(measurement: MeasurementInsert): Promise<UserMeasurement> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_weights')
    .insert({
      user_id: user.id,
      date: measurement.date,
      weight: measurement.weight,
      bodyfat: measurement.body_fat_pct ?? null,
      muscle: measurement.muscle_mass_kg ?? null,
      bmi: measurement.bmi ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return toMeasurement(data);
}

export async function deleteMeasurement(id: string): Promise<void> {
  const { error } = await supabase
    .from('user_weights')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
