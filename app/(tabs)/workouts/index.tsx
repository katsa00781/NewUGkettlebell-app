import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWorkouts } from '@/hooks/useWorkouts';
import { format, isToday, parseISO } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useMemo } from 'react';
import type { Workout } from '@/lib/workouts';

function WorkoutCard({ workout, isNext }: { workout: Workout; isNext: boolean }) {
  const router = useRouter();
  const sections = typeof workout.sections === 'string'
    ? JSON.parse(workout.sections)
    : workout.sections as unknown[];

  const workoutDate = parseISO(workout.date);
  const todayWorkout = isToday(workoutDate);

  return (
    <TouchableOpacity
      className="bg-slate-800 rounded-2xl p-4 mb-3 mx-4"
      style={isNext ? { borderWidth: 1, borderColor: 'rgba(249,115,22,0.35)' } : { borderWidth: 1, borderColor: '#1e2a3f' }}
      onPress={() => router.push(`/(tabs)/workouts/${workout.id}`)}
      activeOpacity={0.8}
    >
      {isNext && (
        <View className="flex-row items-center mb-2">
          <View
            className="rounded-md px-2 py-0.5 mr-2"
            style={{ backgroundColor: '#f97316' }}
          >
            <Text className="text-white font-bold" style={{ fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              {todayWorkout ? 'Ma' : 'Következő'}
            </Text>
          </View>
          <Text
            className="text-slate-400 font-semibold"
            style={{ fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' }}
          >
            Soron következő edzés
          </Text>
        </View>
      )}
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="font-bold text-base text-white">
            {workout.title}
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            {format(workoutDate, 'yyyy. MMMM d.', { locale: hu })}
          </Text>
          <View className="flex-row mt-2 gap-2">
            {workout.duration > 0 && (
              <View
                className="rounded-lg px-2 py-1"
                style={{ backgroundColor: isNext ? 'rgba(249,115,22,0.14)' : '#1e293b', borderWidth: 1, borderColor: '#1e2a3f' }}
              >
                <Text
                  className="text-xs"
                  style={{ color: isNext ? '#f97316' : '#94a3b8' }}
                >
                  {workout.duration} perc
                </Text>
              </View>
            )}
            {Array.isArray(sections) && sections.length > 0 && (
              <View
                className="rounded-lg px-2 py-1"
                style={{ backgroundColor: isNext ? 'rgba(249,115,22,0.14)' : '#1e293b', borderWidth: 1, borderColor: '#1e2a3f' }}
              >
                <Text
                  className="text-xs"
                  style={{ color: isNext ? '#f97316' : '#94a3b8' }}
                >
                  {sections.length} szekció
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#475569" />
      </View>
    </TouchableOpacity>
  );
}

type ListItem =
  | { type: 'header'; label: string }
  | { type: 'workout'; workout: Workout; isNext: boolean }
  | { type: 'empty' };

export default function WorkoutsScreen() {
  const { data: workouts, isLoading } = useWorkouts();

  const listItems = useMemo<ListItem[]>(() => {
    if (!workouts || workouts.length === 0) return [];

    const today = new Date().toISOString().split('T')[0];

    const upcoming = [...workouts]
      .filter(w => w.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    const past = [...workouts]
      .filter(w => w.date < today)
      .sort((a, b) => b.date.localeCompare(a.date));

    const items: ListItem[] = [];

    if (upcoming.length > 0) {
      items.push({ type: 'header', label: 'Közelgő edzések' });
      upcoming.forEach((w, i) =>
        items.push({ type: 'workout', workout: w, isNext: i === 0 })
      );
    }

    if (past.length > 0) {
      items.push({ type: 'header', label: 'Korábbi edzések' });
      past.forEach(w =>
        items.push({ type: 'workout', workout: w, isNext: false })
      );
    }

    return items;
  }, [workouts]);

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
      <View className="px-4 pt-4 pb-3">
        <Text
          className="text-slate-500 font-semibold mb-0.5"
          style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' }}
        >
          Heti terv
        </Text>
        <Text className="text-white text-2xl font-bold" style={{ letterSpacing: -0.5 }}>
          Edzések
        </Text>
      </View>

      {listItems.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="fitness-outline" size={64} color="#334155" />
          <Text className="text-white text-lg font-bold mt-4">Nincs edzésterved</Text>
          <Text className="text-slate-400 text-center mt-2">
            Az edző még nem rendelt hozzád edzéstervet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={(item, index) => {
            if (item.type === 'workout') return item.workout.id;
            return `${item.type}-${index}`;
          }}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <Text
                  className="text-slate-500 font-bold px-4 mb-2 mt-3"
                  style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' }}
                >
                  {item.label}
                </Text>
              );
            }
            if (item.type === 'workout') {
              return <WorkoutCard workout={item.workout} isNext={item.isNext} />;
            }
            return null;
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 4 }}
        />
      )}
    </SafeAreaView>
  );
}
