import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useFmsAssessments } from '@/hooks/useFMS';
import { useUserMeasurements } from '@/hooks/useMeasurements';
import { format, differenceInCalendarDays, getISOWeek } from 'date-fns';
import { hu } from 'date-fns/locale';
import type { Json } from '@/types/supabase';
import type { WorkoutSection } from '@/lib/workouts';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function parseSections(sections: Json): WorkoutSection[] {
  try {
    const arr = typeof sections === 'string' ? JSON.parse(sections) : sections;
    return Array.isArray(arr) ? (arr as WorkoutSection[]) : [];
  } catch {
    return [];
  }
}

function calcWorkoutStats(sections: Json) {
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;
  for (const sec of parseSections(sections)) {
    for (const ex of sec.exercises ?? []) {
      const s = ex.sets ?? 0;
      const r = typeof ex.reps === 'number' ? ex.reps : parseInt(String(ex.reps ?? '0'), 10);
      const reps = isNaN(r) ? 0 : r;
      totalSets += s;
      totalReps += s * reps;
      if (ex.weight) totalVolume += s * reps * ex.weight;
    }
  }
  return { totalSets, totalReps, totalVolume };
}

function workoutDateLabel(dateStr: string): string {
  const diff = differenceInCalendarDays(new Date(), new Date(dateStr));
  if (diff === 0) return 'Ma';
  if (diff === 1) return 'Tegnap';
  return format(new Date(dateStr), 'MMM d.', { locale: hu });
}

function StatCard({
  label,
  value,
  unit,
  iconName,
  delta,
  deltaUnit,
  deltaTrend = 'neutral',
}: {
  label: string;
  value: string;
  unit?: string;
  iconName: IoniconsName;
  delta?: number | null;
  deltaUnit?: string;
  deltaTrend?: 'lower-better' | 'higher-better' | 'neutral';
}) {
  let deltaColor = '#94a3b8';
  let deltaText = '';
  if (delta != null && Math.abs(delta) >= 0.05) {
    if (deltaTrend === 'lower-better') deltaColor = delta < 0 ? '#4ade80' : '#f87171';
    else if (deltaTrend === 'higher-better') deltaColor = delta > 0 ? '#4ade80' : '#f87171';
    else deltaColor = '#94a3b8';
    const sign = delta > 0 ? '+' : '';
    deltaText = `${sign}${delta.toFixed(1)}${deltaUnit ? ` ${deltaUnit}` : ''}`;
  }

  return (
    <View
      className="flex-1 bg-slate-800 rounded-2xl p-3 mx-1"
      style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
    >
      <Ionicons name={iconName} size={18} color="#f97316" style={{ marginBottom: 8 }} />
      <View className="flex-row items-baseline">
        <Text className="text-white font-bold" style={{ fontSize: 20, letterSpacing: -0.5 }}>
          {value}
        </Text>
        {unit ? (
          <Text className="text-slate-400 font-semibold ml-0.5" style={{ fontSize: 11 }}>
            {unit}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center mt-1 flex-wrap">
        <Text className="text-slate-500 font-semibold" style={{ fontSize: 11 }}>
          {label}
        </Text>
        {deltaText ? (
          <Text style={{ fontSize: 11, fontWeight: '600', color: deltaColor, marginLeft: 3 }}>
            {deltaText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      className="text-slate-500 font-bold mb-3"
      style={{ fontSize: 11.5, letterSpacing: 1.3, textTransform: 'uppercase' }}
    >
      {children}
    </Text>
  );
}

function WorkoutStatItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-slate-500 font-bold mb-1" style={{ fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text className="text-white font-bold" style={{ fontSize: 16, letterSpacing: -0.3 }}>
        {value}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts();
  const { data: fmsAssessments } = useFmsAssessments();
  const { data: allMeasurements } = useUserMeasurements();

  const firstName = profile?.first_name ?? profile?.full_name?.split(' ')[0] ?? 'Sportoló';
  const today = new Date();
  const rawDate = format(today, 'EEEE, MMM. d.', { locale: hu });
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
  const weekNumber = getISOWeek(today);

  const latestMeasurement = allMeasurements && allMeasurements.length > 0
    ? allMeasurements[0]
    : null;
  const prevMeasurement = allMeasurements && allMeasurements.length > 1
    ? allMeasurements[1]
    : null;

  const latestFms = fmsAssessments && fmsAssessments.length > 0
    ? fmsAssessments[0]
    : null;
  const prevFms = fmsAssessments && fmsAssessments.length > 1
    ? fmsAssessments[1]
    : null;

  const weightDelta =
    latestMeasurement?.weight != null && prevMeasurement?.weight != null
      ? latestMeasurement.weight - prevMeasurement.weight
      : null;
  const fatDelta =
    latestMeasurement?.body_fat_pct != null && prevMeasurement?.body_fat_pct != null
      ? latestMeasurement.body_fat_pct - prevMeasurement.body_fat_pct
      : null;
  const fmsDelta =
    latestFms?.total_score != null && prevFms?.total_score != null
      ? latestFms.total_score - prevFms.total_score
      : null;

  const latestWorkout = workouts && workouts.length > 0 ? workouts[0] : null;
  const workoutStats = latestWorkout ? calcWorkoutStats(latestWorkout.sections) : null;

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-6">

          {/* Header */}
          <View className="mb-6">
            <Text
              className="text-slate-500 font-semibold mb-1"
              style={{ fontSize: 12.5, letterSpacing: 0.2 }}
            >
              {dateLabel}
            </Text>
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-white font-extrabold" style={{ fontSize: 26, letterSpacing: -0.5 }}>
                Szia, {firstName}
              </Text>
              <Text style={{ fontSize: 22 }}>👊</Text>
            </View>
            <Text className="text-slate-400" style={{ fontSize: 13.5 }}>
              Készen állsz a {weekNumber}. hétre?
            </Text>
          </View>

          {/* Stats Row */}
          <View className="flex-row mb-6">
            <StatCard
              label="Testsúly"
              value={latestMeasurement?.weight != null ? String(latestMeasurement.weight) : '–'}
              unit="kg"
              iconName="scale-outline"
              delta={weightDelta}
              deltaUnit="kg"
              deltaTrend="neutral"
            />
            <StatCard
              label="Testzsír"
              value={latestMeasurement?.body_fat_pct != null ? String(latestMeasurement.body_fat_pct) : '–'}
              unit="%"
              iconName="water-outline"
              delta={fatDelta}
              deltaUnit="%"
              deltaTrend="lower-better"
            />
            <StatCard
              label="FMS"
              value={latestFms ? String(latestFms.total_score) : '–'}
              unit="/21"
              iconName="checkmark-circle-outline"
              delta={fmsDelta}
              deltaTrend="higher-better"
            />
          </View>

          {/* Legutóbbi edzés */}
          <View className="mb-6">
            <SectionLabel>Legutóbbi edzés</SectionLabel>
            {workoutsLoading ? (
              <ActivityIndicator color="#f97316" />
            ) : !latestWorkout ? (
              <View
                className="bg-slate-800 rounded-2xl p-4 items-center"
                style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
              >
                <Text className="text-slate-400 text-sm">Még nincs rögzített edzés</Text>
                <TouchableOpacity
                  className="mt-3 bg-orange-500/20 rounded-xl px-4 py-2"
                  onPress={() => router.push('/(tabs)/workouts')}
                >
                  <Text className="text-orange-500 text-sm font-semibold">Edzés megtekintése</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-slate-800 rounded-2xl p-4"
                style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
                onPress={() => router.push(`/(tabs)/workouts/${latestWorkout.id}`)}
              >
                <View className="flex-row items-center mb-4">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: 'rgba(249,115,22,0.16)' }}
                  >
                    <Ionicons name="fitness" size={24} color="#f97316" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base" numberOfLines={1}>
                      {latestWorkout.title}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                      {latestWorkout.duration > 0 && (
                        <>
                          <Ionicons name="time-outline" size={12} color="#64748b" />
                          <Text className="text-slate-400 text-xs ml-1">
                            {latestWorkout.duration} perc
                          </Text>
                          <Text className="text-slate-600 text-xs mx-2">·</Text>
                        </>
                      )}
                      <Text className="text-slate-400 text-xs">
                        {workoutDateLabel(latestWorkout.date)}
                      </Text>
                    </View>
                  </View>
                </View>

                {workoutStats && (workoutStats.totalSets > 0 || workoutStats.totalReps > 0) && (
                  <>
                    <View
                      className="h-px mb-4"
                      style={{ backgroundColor: '#1e2a3f' }}
                    />
                    <View className="flex-row">
                      {workoutStats.totalVolume > 0 && (
                        <>
                          <WorkoutStatItem
                            label="Volume"
                            value={`${Math.round(workoutStats.totalVolume).toLocaleString('hu-HU')} kg`}
                          />
                          <View className="w-px" style={{ backgroundColor: '#1e2a3f' }} />
                        </>
                      )}
                      <WorkoutStatItem
                        label="Szettek"
                        value={String(workoutStats.totalSets)}
                      />
                      <View className="w-px" style={{ backgroundColor: '#1e2a3f' }} />
                      <WorkoutStatItem
                        label="Ismétlés"
                        value={String(workoutStats.totalReps)}
                      />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Actions */}
          <View>
            <SectionLabel>Gyors műveletek</SectionLabel>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-2xl p-4"
                style={{
                  backgroundColor: '#f97316',
                  minHeight: 100,
                  justifyContent: 'space-between',
                  shadowColor: '#f97316',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                }}
                onPress={() => router.push('/(tabs)/workouts')}
              >
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center mb-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
                >
                  <Ionicons name="flash" size={20} color="#fff" />
                </View>
                <Text className="text-white font-bold" style={{ fontSize: 15, letterSpacing: -0.2 }}>
                  Edzés indítása
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 }}>
                  Heti terv megtekintése
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-slate-800 rounded-2xl p-4"
                style={{
                  borderWidth: 1,
                  borderColor: '#1e2a3f',
                  minHeight: 100,
                  justifyContent: 'space-between',
                }}
                onPress={() => router.push('/(tabs)/measurements/body')}
              >
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center mb-3"
                  style={{ backgroundColor: 'rgba(249,115,22,0.14)' }}
                >
                  <Ionicons name="add" size={20} color="#f97316" />
                </View>
                <Text className="text-white font-bold" style={{ fontSize: 15, letterSpacing: -0.2 }}>
                  Mérés felvétele
                </Text>
                <Text className="text-slate-400" style={{ fontSize: 12, marginTop: 2 }}>
                  Testkompo
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
