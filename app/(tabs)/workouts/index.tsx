import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWorkouts, useDeleteWorkout, useDuplicateWorkout } from '@/hooks/useWorkouts';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import type { Workout } from '@/lib/workouts';

function WorkoutCard({ workout, onPress, onDelete, onDuplicate }: {
  workout: Workout;
  onPress: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const sections = typeof workout.sections === 'string'
    ? JSON.parse(workout.sections)
    : workout.sections as any[];

  return (
    <TouchableOpacity
      className="bg-slate-800 rounded-2xl p-4 mb-3 mx-4"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-white font-bold text-base">{workout.title}</Text>
          <Text className="text-slate-400 text-xs mt-1">
            {format(new Date(workout.date), 'yyyy. MMMM d.', { locale: hu })}
          </Text>
          <View className="flex-row mt-2 gap-2">
            {workout.duration > 0 && (
              <View className="bg-slate-700 rounded-lg px-2 py-1">
                <Text className="text-slate-300 text-xs">{workout.duration} perc</Text>
              </View>
            )}
            {sections?.length > 0 && (
              <View className="bg-slate-700 rounded-lg px-2 py-1">
                <Text className="text-slate-300 text-xs">{sections.length} szekció</Text>
              </View>
            )}
          </View>
        </View>
        <View className="flex-row gap-2 ml-2">
          <TouchableOpacity
            className="p-2"
            onPress={onDuplicate}
          >
            <Ionicons name="copy-outline" size={18} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2"
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const { data: workouts, isLoading } = useWorkouts();
  const deleteWorkout = useDeleteWorkout();
  const duplicateWorkout = useDuplicateWorkout();

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-row justify-between items-center px-4 pt-4 pb-3">
        <Text className="text-white text-2xl font-bold">Edzéseim</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : !workouts || workouts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="fitness-outline" size={64} color="#334155" />
          <Text className="text-white text-lg font-bold mt-4">Még nincs edzésed</Text>
          <Text className="text-slate-400 text-center mt-2">
            Adj hozzá egy új edzést a + gombbal
          </Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(w) => w.id}
          renderItem={({ item }) => (
            <WorkoutCard
              workout={item}
              onPress={() => router.push(`/(tabs)/workouts/${item.id}`)}
              onDelete={() => deleteWorkout.mutate(item.id)}
              onDuplicate={() => duplicateWorkout.mutate(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 4 }}
        />
      )}
    </SafeAreaView>
  );
}
