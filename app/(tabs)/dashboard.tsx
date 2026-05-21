import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useUserWeights } from '@/hooks/useProgress';
import { useLatestFmsAssessment } from '@/hooks/useFMS';
import { useLatestMeasurement, useUserMeasurements } from '@/hooks/useMeasurements';
import { format, subDays, parseISO } from 'date-fns';
import { hu } from 'date-fns/locale';
import type { UserMeasurement } from '@/types/supabase';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function StatCard({
  label,
  value,
  unit,
  iconName,
}: {
  label: string;
  value: string;
  unit?: string;
  iconName: IoniconsName;
}) {
  return (
    <View
      className="flex-1 bg-slate-800 rounded-2xl p-3 mx-1"
      style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
    >
      <Ionicons name={iconName} size={20} color="#f97316" style={{ marginBottom: 8 }} />
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
      <Text className="text-slate-500 font-semibold mt-1" style={{ fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

function DeltaText({
  delta,
  unit,
  trend = 'neutral',
}: {
  delta: number | null;
  unit: string;
  trend?: 'lower-better' | 'higher-better' | 'neutral';
}) {
  if (delta === null) return <Text className="text-slate-500 text-xs mt-0.5">–</Text>;
  if (Math.abs(delta) < 0.05) return <Text className="text-slate-400 text-xs mt-0.5">0 {unit}</Text>;

  let color = 'text-slate-300';
  if (trend === 'lower-better') color = delta < 0 ? 'text-green-400' : 'text-red-400';
  if (trend === 'higher-better') color = delta > 0 ? 'text-green-400' : 'text-red-400';

  const sign = delta > 0 ? '+' : '';
  return (
    <Text className={`text-xs mt-0.5 ${color}`}>
      {sign}{delta.toFixed(1)} {unit}
    </Text>
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

function BodyCompWidget({
  latest,
  ref30d,
  onPress,
}: {
  latest: UserMeasurement | null;
  ref30d: UserMeasurement | null;
  onPress: () => void;
}) {
  const weightDelta =
    latest?.weight != null && ref30d?.weight != null ? latest.weight - ref30d.weight : null;
  const fatDelta =
    latest?.body_fat_pct != null && ref30d?.body_fat_pct != null
      ? latest.body_fat_pct - ref30d.body_fat_pct
      : null;
  const muscleDelta =
    latest?.muscle_mass_kg != null && ref30d?.muscle_mass_kg != null
      ? latest.muscle_mass_kg - ref30d.muscle_mass_kg
      : null;

  return (
    <TouchableOpacity
      className="bg-slate-800 rounded-2xl p-4 mb-6"
      style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-white text-base font-bold">Testkompo</Text>
        <Text className="text-slate-500 text-xs">
          {latest
            ? format(parseISO(latest.date), 'yyyy. MMM d.', { locale: hu })
            : '–'}
        </Text>
      </View>

      {latest ? (
        <>
          <View className="flex-row justify-between">
            <View className="flex-1 items-center">
              <Text className="text-slate-400 text-xs mb-1">Testsúly</Text>
              <Text className="text-white font-semibold text-sm">{latest.weight} kg</Text>
              <DeltaText delta={weightDelta} unit="kg" trend="neutral" />
            </View>
            <View className="w-px bg-slate-700 mx-2" />
            <View className="flex-1 items-center">
              <Text className="text-slate-400 text-xs mb-1">Testzsír</Text>
              <Text className="text-white font-semibold text-sm">
                {latest.body_fat_pct != null ? `${latest.body_fat_pct} %` : '–'}
              </Text>
              <DeltaText delta={fatDelta} unit="%" trend="lower-better" />
            </View>
            <View className="w-px bg-slate-700 mx-2" />
            <View className="flex-1 items-center">
              <Text className="text-slate-400 text-xs mb-1">Izomtömeg</Text>
              <Text className="text-white font-semibold text-sm">
                {latest.muscle_mass_kg != null ? `${latest.muscle_mass_kg} kg` : '–'}
              </Text>
              <DeltaText delta={muscleDelta} unit="kg" trend="higher-better" />
            </View>
          </View>
          {ref30d && (
            <Text className="text-slate-600 text-xs mt-3 text-center">változás az elmúlt 30 napban</Text>
          )}
        </>
      ) : (
        <View className="items-center py-2">
          <Text className="text-slate-400 text-sm">Még nincs mérés rögzítve</Text>
          <Text className="text-orange-500 text-xs mt-1">Mérés hozzáadása →</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data: workouts, isLoading: workoutsLoading } = useWorkouts();
  const { data: weights } = useUserWeights();
  const { data: latestFms } = useLatestFmsAssessment();
  const { data: latestMeasurement } = useLatestMeasurement();
  const { data: allMeasurements } = useUserMeasurements();

  const latestWeight = weights && weights.length > 0 ? weights[weights.length - 1] : null;
  const recentWorkouts = workouts?.slice(0, 3) ?? [];
  const firstName = profile?.first_name ?? profile?.full_name?.split(' ')[0] ?? 'Sportoló';

  const thirtyDaysAgo = subDays(new Date(), 30);
  const refMeasurement: UserMeasurement | null = allMeasurements
    ? (allMeasurements.find(m => parseISO(m.date) <= thirtyDaysAgo) ?? null)
    : null;

  const today = new Date();
  const dateLabel = format(today, 'EEEE, MMM. d.', { locale: hu });

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
              Készen állsz a mai edzésre?
            </Text>
          </View>

          {/* Stats Row */}
          <View className="flex-row mb-6">
            <StatCard
              label="Edzések"
              value={String(workouts?.length ?? 0)}
              iconName="barbell-outline"
            />
            <StatCard
              label="Testsúly"
              value={latestWeight ? String(latestWeight.weight) : '–'}
              unit="kg"
              iconName="scale-outline"
            />
            <StatCard
              label="FMS"
              value={latestFms ? String(latestFms.total_score) : '–'}
              unit="/21"
              iconName="checkmark-circle-outline"
            />
          </View>

          {/* Testkompo widget */}
          <BodyCompWidget
            latest={latestMeasurement ?? null}
            ref30d={refMeasurement}
            onPress={() => router.push('/(tabs)/measurements/body')}
          />

          {/* Recent Workouts */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <SectionLabel>Legutóbbi edzések</SectionLabel>
              <TouchableOpacity onPress={() => router.push('/(tabs)/workouts')}>
                <Text className="text-orange-500 text-xs font-semibold">Összes →</Text>
              </TouchableOpacity>
            </View>
            {workoutsLoading ? (
              <ActivityIndicator color="#f97316" />
            ) : recentWorkouts.length === 0 ? (
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
              recentWorkouts.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  className="bg-slate-800 rounded-2xl p-4 mb-2 flex-row items-center"
                  style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
                  onPress={() => router.push(`/(tabs)/workouts/${w.id}`)}
                >
                  <View className="w-10 h-10 bg-orange-500/14 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: 'rgba(249,115,22,0.14)' }}
                  >
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

          {/* Quick Actions */}
          <View>
            <SectionLabel>Gyors műveletek</SectionLabel>
            <View className="flex-row gap-3">
              {/* Primary action */}
              <TouchableOpacity
                className="flex-1 rounded-2xl p-4"
                style={{
                  backgroundColor: '#f97316',
                  minHeight: 96,
                  justifyContent: 'space-between',
                  boxShadow: undefined,
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
                  Edzések
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 }}>
                  Heti terv megtekintése
                </Text>
              </TouchableOpacity>

              {/* Secondary action */}
              <TouchableOpacity
                className="flex-1 bg-slate-800 rounded-2xl p-4"
                style={{
                  borderWidth: 1,
                  borderColor: '#1e2a3f',
                  minHeight: 96,
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
                  Mérés
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
