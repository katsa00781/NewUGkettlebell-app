import { supabase } from './supabase';
import type { Database } from '../types/supabase';

export type FmsAssessment = Database['public']['Tables']['fms_assessments']['Row'];
export type FmsInsert = Database['public']['Tables']['fms_assessments']['Insert'];

export const FMS_MOVEMENTS = [
  { key: 'deep_squat', label: 'Mély guggolás' },
  { key: 'hurdle_step', label: 'Akadálylépés' },
  { key: 'inline_lunge', label: 'Egyenes kitörés' },
  { key: 'shoulder_mobility', label: 'Vállmobilitás' },
  { key: 'active_straight_leg_raise', label: 'Aktív egyenes lábemelésel' },
  { key: 'trunk_stability_pushup', label: 'Törzsstabilitás fekvőtámasz' },
  { key: 'rotary_stability', label: 'Forgási stabilitás' },
] as const;

export async function getFmsAssessments(userId: string): Promise<FmsAssessment[]> {
  const { data, error } = await supabase
    .from('fms_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getLatestFmsAssessment(userId: string): Promise<FmsAssessment | null> {
  const { data, error } = await supabase
    .from('fms_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveFmsAssessment(assessment: Omit<FmsInsert, 'user_id'>): Promise<FmsAssessment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const total =
    assessment.deep_squat +
    assessment.hurdle_step +
    assessment.inline_lunge +
    assessment.shoulder_mobility +
    assessment.active_straight_leg_raise +
    assessment.trunk_stability_pushup +
    assessment.rotary_stability;

  const { data, error } = await supabase
    .from('fms_assessments')
    .insert({ ...assessment, user_id: user.id } as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}
