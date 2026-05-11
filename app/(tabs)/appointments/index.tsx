import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useUpcomingAppointments, useUserBookings,
  useBookAppointment, useCancelBooking
} from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import { isUserBooked } from '@/lib/appointments';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import type { Appointment } from '@/lib/appointments';

function AppointmentCard({ appointment, isBooked, onBook, onCancel, loading }: {
  appointment: Appointment;
  isBooked: boolean;
  onBook: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isFull = appointment.current_participants >= appointment.max_participants;
  const spotsLeft = appointment.max_participants - appointment.current_participants;

  return (
    <View className="bg-slate-800 rounded-2xl p-4 mb-3 mx-4">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-white font-bold text-base">{appointment.title}</Text>
          {appointment.description && (
            <Text className="text-slate-400 text-xs mt-1" numberOfLines={2}>
              {appointment.description}
            </Text>
          )}
        </View>
        <View className={`rounded-full px-3 py-1 ml-2 ${isBooked ? 'bg-green-500/20' : isFull ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
          <Text className={`text-xs font-semibold ${isBooked ? 'text-green-400' : isFull ? 'text-red-400' : 'text-blue-400'}`}>
            {isBooked ? 'Foglalt' : isFull ? 'Telt ház' : `${spotsLeft} hely`}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-4 mb-3">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#64748b" />
          <Text className="text-slate-400 text-xs ml-1">
            {format(new Date(appointment.start_time), 'MMM d. HH:mm', { locale: hu })}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="people-outline" size={14} color="#64748b" />
          <Text className="text-slate-400 text-xs ml-1">
            {appointment.current_participants}/{appointment.max_participants} fő
          </Text>
        </View>
      </View>

      {isBooked ? (
        <TouchableOpacity
          className="bg-red-500/20 rounded-xl py-2.5 items-center border border-red-500/30"
          onPress={onCancel}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator size="small" color="#ef4444" />
            : <Text className="text-red-400 font-semibold text-sm">Lemondás</Text>
          }
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className={`rounded-xl py-2.5 items-center ${isFull ? 'bg-slate-700' : 'bg-orange-500'}`}
          onPress={onBook}
          disabled={isFull || loading}
        >
          {loading
            ? <ActivityIndicator size="small" color="white" />
            : <Text className={`font-semibold text-sm ${isFull ? 'text-slate-500' : 'text-white'}`}>
                {isFull ? 'Betelt' : 'Foglalás'}
              </Text>
          }
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const { data: appointments, isLoading } = useUpcomingAppointments();
  const { data: bookings } = useUserBookings();
  const bookAppointment = useBookAppointment();
  const cancelBooking = useCancelBooking();

  const bookedIds = new Set((bookings ?? []).map((b: Appointment) => b.id));

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-4 pt-4 pb-3">
        <Text className="text-white text-2xl font-bold">Időpontok</Text>
        <Text className="text-slate-400 text-sm mt-1">Közelgő edzések és időpontok</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : !appointments || appointments.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="calendar-outline" size={64} color="#334155" />
          <Text className="text-white text-lg font-bold mt-4">Nincs elérhető időpont</Text>
          <Text className="text-slate-400 text-center mt-2">
            Jelenleg nincsenek meghirdetett edzések
          </Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              isBooked={bookedIds.has(item.id)}
              onBook={() => bookAppointment.mutate(item.id)}
              onCancel={() => {
                Alert.alert(
                  'Lemondás',
                  'Biztosan le szeretnéd mondani ezt az időpontot?',
                  [
                    { text: 'Mégsem', style: 'cancel' },
                    { text: 'Lemondás', style: 'destructive', onPress: () => cancelBooking.mutate(item.id) },
                  ]
                );
              }}
              loading={bookAppointment.isPending || cancelBooking.isPending}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 4 }}
        />
      )}
    </SafeAreaView>
  );
}
