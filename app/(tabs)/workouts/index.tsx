import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWorkouts } from '@/hooks/useWorkouts';
import { format } from 'date-fns';
import { useMemo } from 'react';
import type { Workout, WorkoutSection } from '@/lib/workouts';
import type { Json } from '@/types/supabase';

type WorkoutStatus = 'completed' | 'today' | 'upcoming';

function parseSections(sections: Json): WorkoutSection[] {
  try {
    const arr = typeof sections === 'string' ? JSON.parse(sections) : sections;
    return Array.isArray(arr) ? (arr as WorkoutSection[]) : [];
  } catch {
    return [];
  }
}

function getSectionNames(sections: Json): string {
  return parseSections(sections)
    .map(s => s.name)
    .slice(0, 3)
    .join(' · ');
}

function getTotalSets(sections: Json): number {
  return parseSections(sections).reduce(
    (acc, s) => acc + (s.exercises?.reduce((sum, ex) => sum + (ex.sets ?? 0), 0) ?? 0),
    0
  );
}

function extractTitleParts(title: string): { dayLabel: string | null; shortTitle: string } {
  const match = title.match(/^([A-D]\s+nap)\s*[—\-–]\s*(.+)$/i);
  if (match) return { dayLabel: match[1].trim(), shortTitle: match[2].trim() };
  return { dayLabel: null, shortTitle: title };
}

function getDayLetter(title: string, index: number): string {
  const match = title.match(/^([A-D])\s+nap/i);
  if (match) return match[1].toUpperCase();
  return ['A', 'B', 'C', 'D', 'E', 'F', 'G'][index % 7];
}

function getStatus(dateStr: string, todayStr: string): WorkoutStatus {
  if (dateStr < todayStr) return 'completed';
  if (dateStr === todayStr) return 'today';
  return 'upcoming';
}

function HeroCard({ workout, onPress }: { workout: Workout; onPress: () => void }) {
  const { dayLabel } = extractTitleParts(workout.title);
  const sectionNames = getSectionNames(workout.sections);
  const totalSets = getTotalSets(workout.sections);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isToday = workout.date === todayStr;

  return (
    <View
      className="bg-slate-800 rounded-2xl p-4 mb-6"
      style={{ borderWidth: 1.5, borderColor: 'rgba(249,115,22,0.4)' }}
    >
      <View className="flex-row items-center mb-2">
        <View
          className="rounded-md px-2 py-0.5 mr-2"
          style={{ backgroundColor: '#f97316' }}
        >
          <Text className="text-white font-bold" style={{ fontSize: 11, letterSpacing: 0.5 }}>
            {isToday ? 'MA' : 'Következő'}
          </Text>
        </View>
        {dayLabel && (
          <Text
            className="text-slate-300 font-bold"
            style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' }}
          >
            {dayLabel}
          </Text>
        )}
      </View>

      <Text className="text-white font-bold mb-1" style={{ fontSize: 22, letterSpacing: -0.5 }}>
        {workout.title}
      </Text>

      {sectionNames ? (
        <Text className="text-slate-400 mb-3" style={{ fontSize: 13 }}>
          {sectionNames}
        </Text>
      ) : null}

      <View className="flex-row items-center mb-4" style={{ gap: 16 }}>
        {workout.duration > 0 && (
          <View className="flex-row items-center" style={{ gap: 5 }}>
            <Ionicons name="time-outline" size={15} color="#64748b" />
            <Text className="text-slate-300 text-sm">~{workout.duration} perc</Text>
          </View>
        )}
        {totalSets > 0 && (
          <View className="flex-row items-center" style={{ gap: 5 }}>
            <Ionicons name="layers-outline" size={15} color="#64748b" />
            <Text className="text-slate-300 text-sm">{totalSets} szett</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        className="rounded-xl py-3 flex-row items-center justify-center"
        style={{ backgroundColor: '#f97316', gap: 8 }}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Ionicons name="play" size={15} color="#fff" />
        <Text className="text-white font-bold" style={{ fontSize: 15 }}>
          Edzés indítása
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function WeeklyRow({
  workout,
  status,
  dayLetter,
  onPress,
}: {
  workout: Workout;
  status: WorkoutStatus;
  dayLetter: string;
  onPress: () => void;
}) {
  const { shortTitle } = extractTitleParts(workout.title);

  const badgeBg =
    status === 'completed' ? '#14532d'
    : status === 'today' ? '#f97316'
    : '#0f172a';

  const statusText =
    status === 'completed'
      ? `Befejezve${workout.duration > 0 ? ` · ${workout.duration} perc` : ''}`
      : status === 'today'
      ? `Ma esedékes${workout.duration > 0 ? ` · ${workout.duration} perc` : ''}`
      : `Várakozik${workout.duration > 0 ? ` · ${workout.duration} perc` : ''}`;

  const statusColor =
    status === 'completed' ? '#4ade80'
    : status === 'today' ? '#f97316'
    : '#64748b';

  return (
    <TouchableOpacity
      className="bg-slate-800 rounded-2xl px-4 py-3 mb-2 flex-row items-center"
      style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: badgeBg }}
      >
        {status === 'completed' ? (
          <Ionicons name="checkmark" size={20} color="#4ade80" />
        ) : (
          <Text
            className="font-bold"
            style={{ fontSize: 15, color: status === 'today' ? '#fff' : '#94a3b8' }}
          >
            {dayLetter}
          </Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-white font-semibold" style={{ fontSize: 14.5 }}>
          {shortTitle}
        </Text>
        <Text style={{ fontSize: 12, color: statusColor, marginTop: 2 }}>
          {statusText}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#475569" />
    </TouchableOpacity>
  );
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const { data: workouts, isLoading } = useWorkouts();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const { sortedWorkouts, heroWorkout, completedCount } = useMemo(() => {
    const sorted = [...(workouts ?? [])].sort((a, b) => a.date.localeCompare(b.date));
    const completed = sorted.filter(w => w.date < todayStr).length;
    const heroIdx = sorted.findIndex(w => w.date >= todayStr);
    const hero =
      heroIdx >= 0
        ? sorted[heroIdx]
        : sorted.length > 0
        ? sorted[sorted.length - 1]
        : null;
    return { sortedWorkouts: sorted, heroWorkout: hero, completedCount: completed };
  }, [workouts, todayStr]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View className="px-5 pt-4 pb-2">
        <Text
          className="text-slate-500 font-semibold mb-0.5"
          style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' }}
        >
          {sortedWorkouts.length > 0
            ? `Heti terv · ${completedCount} / ${sortedWorkouts.length}`
            : 'Heti terv'}
        </Text>
        <Text className="text-white font-extrabold" style={{ fontSize: 28, letterSpacing: -0.5 }}>
          Edzések
        </Text>
      </View>

      {sortedWorkouts.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
        >
          <Ionicons name="fitness-outline" size={64} color="#334155" />
          <Text className="text-white text-lg font-bold mt-4">Nincs edzésterved</Text>
          <Text className="text-slate-400 text-center mt-2">
            Az edző még nem rendelt hozzád edzéstervet.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
        >
          {heroWorkout && (
            <HeroCard
              workout={heroWorkout}
              onPress={() => router.push(`/(tabs)/workouts/${heroWorkout.id}`)}
            />
          )}

          <Text
            className="text-slate-500 font-bold mb-3"
            style={{ fontSize: 11.5, letterSpacing: 1.3, textTransform: 'uppercase' }}
          >
            Heti program
          </Text>

          {sortedWorkouts.map((workout, index) => (
            <WeeklyRow
              key={workout.id}
              workout={workout}
              status={getStatus(workout.date, todayStr)}
              dayLetter={getDayLetter(workout.title, index)}
              onPress={() => router.push(`/(tabs)/workouts/${workout.id}`)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
