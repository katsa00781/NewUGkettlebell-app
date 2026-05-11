import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useExercise } from '@/hooks/useExercises';

const DIFFICULTY_LABELS = ['', 'Kezdő', 'Alapszint', 'Középhaladó', 'Haladó', 'Profi'];
const DIFFICULTY_COLORS = ['', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#7c3aed'];

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: exercise, isLoading } = useExercise(id);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-red-400">Gyakorlat nem található</Text>
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
          {exercise.name}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row gap-2 mb-4 flex-wrap">
          <View className="bg-orange-500/20 rounded-lg px-3 py-2">
            <Text className="text-orange-400 text-sm">{exercise.category}</Text>
          </View>
          {exercise.difficulty > 0 && (
            <View
              className="rounded-lg px-3 py-2"
              style={{ backgroundColor: `${DIFFICULTY_COLORS[exercise.difficulty]}20` }}
            >
              <Text style={{ color: DIFFICULTY_COLORS[exercise.difficulty] }} className="text-sm font-semibold">
                {DIFFICULTY_LABELS[exercise.difficulty]}
              </Text>
            </View>
          )}
          <View className="bg-slate-700 rounded-lg px-3 py-2">
            <Text className="text-slate-300 text-sm">{exercise.movement_pattern?.replace(/_/g, ' ')}</Text>
          </View>
        </View>

        {exercise.description && (
          <View className="bg-slate-800 rounded-2xl p-4 mb-4">
            <Text className="text-orange-500 font-bold text-sm mb-2">Leírás</Text>
            <Text className="text-slate-300 text-sm leading-6">{exercise.description}</Text>
          </View>
        )}

        {exercise.instructions && (
          <View className="bg-slate-800 rounded-2xl p-4 mb-4">
            <Text className="text-orange-500 font-bold text-sm mb-2">Végrehajtás</Text>
            <Text className="text-slate-300 text-sm leading-6">{exercise.instructions}</Text>
          </View>
        )}

        {exercise.video_url && (
          <TouchableOpacity
            className="bg-blue-600 rounded-2xl p-4 mb-4 flex-row items-center justify-center"
            onPress={() => Linking.openURL(exercise.video_url!)}
          >
            <Ionicons name="play-circle" size={24} color="white" />
            <Text className="text-white font-bold ml-2">Videó megtekintése</Text>
          </TouchableOpacity>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
