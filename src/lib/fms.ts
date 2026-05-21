import { supabase } from './supabase';
import type { Database } from '../types/supabase';

export type FmsAssessment = Database['public']['Tables']['fms_assessments']['Row'];
export type FmsInsert = Database['public']['Tables']['fms_assessments']['Insert'];

export const FMS_MOVEMENTS = [
  {
    key: 'deep_squat',
    label: 'Mélytérdelés',
    englishLabel: 'Deep Squat',
    description: 'Bot fejteten · láb csípőszéles · sarok lent',
    bilateral: false,
  },
  {
    key: 'hurdle_step',
    label: 'Akadálylépés',
    englishLabel: 'Hurdle Step',
    description: 'Sipcsont magasság · bot vállon',
    bilateral: true,
  },
  {
    key: 'inline_lunge',
    label: 'Vonalkitörés',
    englishLabel: 'In-Line Lunge',
    description: 'Bot hát mögött · lépés egyenes vonalban',
    bilateral: true,
  },
  {
    key: 'shoulder_mobility',
    label: 'Vállmobilitás',
    englishLabel: 'Shoulder Mobility',
    description: 'Kezek hát mögött · ütközésvizsgálat',
    bilateral: true,
  },
  {
    key: 'active_straight_leg_raise',
    label: 'Aktív lábemelés',
    englishLabel: 'Active Straight Leg Raise',
    description: 'Hanyatt fekve · aktív egyenes lábemelés',
    bilateral: true,
  },
  {
    key: 'trunk_stability_pushup',
    label: 'Törzsstabilitás fekvőtámasz',
    englishLabel: 'Trunk Stability Push-Up',
    description: 'Hüvelykujj homloknál · tested egyenes',
    bilateral: false,
  },
  {
    key: 'rotary_stability',
    label: 'Forgási stabilitás',
    englishLabel: 'Rotary Stability',
    description: 'Négykézláb · könyök térd érintés',
    bilateral: true,
  },
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

export async function deleteFmsAssessment(id: string): Promise<void> {
  const { error } = await supabase
    .from('fms_assessments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function saveFmsAssessment(assessment: Omit<FmsInsert, 'user_id'>): Promise<FmsAssessment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('fms_assessments')
    .insert({ ...assessment, user_id: user.id } as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}
