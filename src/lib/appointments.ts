import { supabase } from './supabase';
import type { Database } from '../types/supabase';

export type Appointment = Database['public']['Tables']['appointments']['Row'];

export async function getUpcomingAppointments(): Promise<Appointment[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('is_cancelled', false)
    .gte('start_time', now)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getUserBookings(userId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments_participants')
    .select('appointment_id, appointments(*)')
    .eq('user_id', userId);

  if (error) throw error;
  const now = new Date().toISOString();
  return (data ?? [])
    .map((row: any) => row.appointments)
    .filter((a: Appointment) => a && !a.is_cancelled && a.start_time >= now);
}

export async function bookAppointment(appointmentId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('appointments_participants')
    .insert({ appointment_id: appointmentId, user_id: userId });

  if (error) throw error;

  await (supabase.rpc as any)('increment_participants', { appointment_id: appointmentId });
}

export async function cancelBooking(appointmentId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('appointments_participants')
    .delete()
    .eq('appointment_id', appointmentId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function isUserBooked(appointmentId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('appointments_participants')
    .select('appointment_id')
    .eq('appointment_id', appointmentId)
    .eq('user_id', userId)
    .maybeSingle();

  return !!data;
}
