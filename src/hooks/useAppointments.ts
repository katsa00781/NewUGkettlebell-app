import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUpcomingAppointments, getUserBookings, bookAppointment, cancelBooking } from '../lib/appointments';
import { useAuth } from './useAuth';

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: getUpcomingAppointments,
  });
}

export function useUserBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['appointments', 'bookings', user?.id],
    queryFn: () => getUserBookings(user!.id),
    enabled: !!user,
  });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (appointmentId: string) => bookAppointment(appointmentId, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (appointmentId: string) => cancelBooking(appointmentId, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
