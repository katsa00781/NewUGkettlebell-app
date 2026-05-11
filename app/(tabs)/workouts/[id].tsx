import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout } from '@/hooks/useWorkouts';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import type { WorkoutSection, WorkoutExercise } from '@/lib/workouts';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: workout, isLoading, error } = useWorkout(id);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (error || !workout) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-red-400">Edzés nem található</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#f97316" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1" numberOfLines={1}>
          {workout.title}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="bg-slate-800 rounded-2xl p-4 mb-4 flex-row gap-3">
          <View className="flex-1 items-center">
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
            <Text className="text-slate-400 text-xs mt-1">Dátum</Text>
            <Text className="text-white text-sm font-semibold">
              {format(new Date(workout.date), 'MMM d.', { locale: hu })}
            </Text>
          </View>
          {workout.duration > 0 && (
            <View className="flex-1 items-center">
              <Ionicons name="time-outline" size={20} color="#64748b" />
              <Text className="text-slate-400 text-xs mt-1">Időtartam</Text>
              <Text className="text-white text-sm font-semibold">{workout.duration} perc</Text>
            </View>
          )}
          <View className="flex-1 items-center">
            <Ionicons name="layers-outline" size={20} color="#64748b" />
            <Text className="text-slate-400 text-xs mt-1">Szekciók</Text>
            <Text className="text-white text-sm font-semibold">{workout.parsedSections.length}</Text>
          </View>
        </View>

        {workout.notes && (
          <View className="bg-slate-800 rounded-2xl p-4 mb-4">
            <Text className="text-slate-400 text-xs mb-1">Megjegyzés</Text>
            <Text className="text-white text-sm">{workout.notes}</Text>
          </View>
        )}

        {workout.parsedSections.map((section: WorkoutSection, i: number) => (
          <View key={section.id ?? i} className="bg-slate-800 rounded-2xl p-4 mb-3">
            <Text className="text-orange-500 font-bold text-sm mb-3">{section.name}</Text>
            {section.exercises?.map((ex: WorkoutExercise, j: number) => (
              <View key={ex.id ?? j} className="flex-row items-center py-2 border-b border-slate-700 last:border-0">
                <View className="w-8 h-8 bg-slate-700 rounded-lg items-center justify-center mr-3">
                  <Text className="text-slate-300 text-xs font-bold">{j + 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-sm font-semibold">{ex.name}</Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    {ex.sets} sorozat × {ex.reps} ism.
                    {ex.weight ? ` · ${ex.weight} kg` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
