import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useUpcomingAppointments } from '@/hooks/useAppointments';
import { useUserWeights } from '@/hooks/useProgress';
import { useLatestFmsAssessment } from '@/hooks/useFMS';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <View className="flex-1 bg-slate-800 rounded-2xl p-4 mx-1">
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <Text className="text-2xl font-bold text-white mt-2">{value}</Text>
      <Text className="text-slate-400 text-xs mt-1">{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts();
  const { data: appointments, isLoading: appointmentsLoading } = useUpcomingAppointments();
  const { data: weights } = useUserWeights();
  const { data: latestFms } = useLatestFmsAssessment();

  const latestWeight = weights && weights.length > 0 ? weights[weights.length - 1] : null;
  const recentWorkouts = workouts?.slice(0, 3) ?? [];
  const upcomingAppointments = appointments?.slice(0, 3) ?? [];

  const firstName = profile?.first_name ?? profile?.full_name?.split(' ')[0] ?? 'Sportoló';

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-slate-400 text-sm">Üdvözöljük,</Text>
              <Text className="text-white text-2xl font-bold">{firstName} 💪</Text>
            </View>
            <View className="bg-orange-500/20 rounded-full p-2">
              <Text className="text-2xl">🏋️</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row mb-6">
            <StatCard
              label="Edzések száma"
              value={String(workouts?.length ?? 0)}
              icon="🏃"
              color="#f97316"
            />
            <StatCard
              label="Aktuális súly"
              value={latestWeight ? `${latestWeight.weight} kg` : '–'}
              icon="⚖️"
              color="#3b82f6"
            />
            <StatCard
              label="FMS pontszám"
              value={latestFms ? String(latestFms.total_score) : '–'}
              icon="📊"
              color="#10b981"
            />
          </View>

          {/* Recent Workouts */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-lg font-bold">Legutóbbi edzések</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/workouts')}>
                <Text className="text-orange-500 text-sm">Összes →</Text>
              </TouchableOpacity>
            </View>
            {workoutsLoading ? (
              <ActivityIndicator color="#f97316" />
            ) : recentWorkouts.length === 0 ? (
              <View className="bg-slate-800 rounded-2xl p-4 items-center">
                <Text className="text-slate-400 text-sm">Még nincs rögzített edzés</Text>
                <TouchableOpacity
                  className="mt-3 bg-orange-500/20 rounded-xl px-4 py-2"
                  onPress={() => router.push('/(tabs)/workouts')}
                >
                  <Text className="text-orange-500 text-sm font-semibold">Edzés hozzáadása</Text>
                </TouchableOpacity>
              </View>
            ) : (
              recentWorkouts.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  className="bg-slate-800 rounded-2xl p-4 mb-2 flex-row items-center"
                  onPress={() => router.push(`/(tabs)/workouts/${w.id}`)}
                >
                  <View className="w-10 h-10 bg-orange-500/20 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="fitness" size={20} color="#f97316" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">{w.title}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">
                      {format(new Date(w.date), 'yyyy. MMM d.', { locale: hu })}
                      {w.duration ? ` · ${w.duration} perc` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Upcoming Appointments */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-lg font-bold">Közelgő időpontok</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/appointments')}>
                <Text className="text-orange-500 text-sm">Összes →</Text>
              </TouchableOpacity>
            </View>
            {appointmentsLoading ? (
              <ActivityIndicator color="#f97316" />
            ) : upcomingAppointments.length === 0 ? (
              <View className="bg-slate-800 rounded-2xl p-4 items-center">
                <Text className="text-slate-400 text-sm">Nincs közelgő időpont</Text>
              </View>
            ) : (
              upcomingAppointments.map((a) => (
                <View key={a.id} className="bg-slate-800 rounded-2xl p-4 mb-2 flex-row items-center">
                  <View className="w-10 h-10 bg-blue-500/20 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="calendar" size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">{a.title}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">
                      {format(new Date(a.start_time), 'MMM d. HH:mm', { locale: hu })}
                      {' · '}
                      {a.current_participants}/{a.max_participants} fő
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Quick Actions */}
          <View>
            <Text className="text-white text-lg font-bold mb-3">Gyors műveletek</Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { label: 'Edzéstervező', icon: 'flash', route: '/(tabs)/workouts/planner' },
                { label: 'Új edzés', icon: 'add-circle', route: '/(tabs)/workouts/create' },
                { label: 'Súlymérés', icon: 'scale', route: '/(tabs)/profile/progress' },
                { label: 'FMS felmérés', icon: 'bar-chart', route: '/(tabs)/profile/fms' },
                { label: 'Időpontfoglalás', icon: 'calendar-outline', route: '/(tabs)/appointments' },
              ].map((action) => (
                <TouchableOpacity
                  key={action.label}
                  className="bg-slate-800 rounded-2xl p-4 items-center flex-1 min-w-[40%]"
                  onPress={() => router.push(action.route as any)}
                >
                  <Ionicons name={action.icon as any} size={24} color="#f97316" />
                  <Text className="text-slate-300 text-xs mt-2 text-center">{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
