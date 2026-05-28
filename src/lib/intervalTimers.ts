import { supabase } from './supabase';
import type { IntervalTimer } from '../types/supabase';

export type { IntervalTimer };

export interface TimerConfig {
  name: string;
  intro_sec: number;
  work_sec: number;
  rest_sec: number;
  cooldown_sec: number;
  rounds: number;
  work_color: string;
  rest_color: string;
}

export interface FactoryTimer extends TimerConfig {
  id: string;
  isFactory: true;
}

export const INTRO_COLOR = '#eab308';
export const COOLDOWN_COLOR = '#3b82f6';

export const FACTORY_TIMERS: FactoryTimer[] = [
  {
    id: 'tabata',
    name: 'Tabata',
    intro_sec: 10,
    work_sec: 20,
    rest_sec: 10,
    cooldown_sec: 0,
    rounds: 8,
    work_color: '#f97316',
    rest_color: '#10b981',
    isFactory: true,
  },
  {
    id: 'hiit-40-20',
    name: 'HIIT 40/20',
    intro_sec: 10,
    work_sec: 40,
    rest_sec: 20,
    cooldown_sec: 0,
    rounds: 8,
    work_color: '#f97316',
    rest_color: '#10b981',
    isFactory: true,
  },
  {
    id: 'emom-10',
    name: 'EMOM · 10 perc',
    intro_sec: 10,
    work_sec: 60,
    rest_sec: 0,
    cooldown_sec: 0,
    rounds: 10,
    work_color: '#8b5cf6',
    rest_color: '#10b981',
    isFactory: true,
  },
];

export function formatTimerTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function getTotalSec(config: TimerConfig): number {
  return config.intro_sec + (config.work_sec + config.rest_sec) * config.rounds + config.cooldown_sec;
}

export async function getIntervalTimers(userId: string): Promise<IntervalTimer[]> {
  const { data, error } = await supabase
    .from('interval_timers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveIntervalTimer(
  timer: Omit<IntervalTimer, 'id' | 'created_at'>
): Promise<IntervalTimer> {
  const { data, error } = await supabase
    .from('interval_timers')
    .insert(timer)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteIntervalTimer(id: string): Promise<void> {
  const { error } = await supabase.from('interval_timers').delete().eq('id', id);
  if (error) throw error;
}
