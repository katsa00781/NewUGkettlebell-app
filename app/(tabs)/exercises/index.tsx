import { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useExercises } from '@/hooks/useExercises';
import type { ExerciseCategory } from '@/lib/exercises';
import type { Exercise } from '@/types/supabase';

const CATEGORIES: { label: string; value: ExerciseCategory | null }[] = [
  { label: 'Összes', value: null },
  { label: 'Kettlebell', value: 'kettlebell' },
  { label: 'Erő', value: 'strength training' },
  { label: 'Kardió', value: 'cardio' },
  { label: 'Mobilitás', value: 'mobility/flexibility' },
  { label: 'HIIT', value: 'HIIT' },
  { label: 'FMS', value: 'fms' },
];

const DIFFICULTY_COLORS = ['', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#7c3aed'];

function ExerciseCard({ exercise, onPress }: { exercise: Exercise; onPress: () => void }) {
  return (
    <TouchableOpacity
      className="bg-slate-800 rounded-2xl p-4 mb-3 mx-4"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white font-bold text-base" numberOfLines={1}>{exercise.name}</Text>
          <Text className="text-slate-400 text-xs mt-1" numberOfLines={1}>{exercise.description}</Text>
          <View className="flex-row mt-2 gap-2 flex-wrap">
            <View className="bg-orange-500/20 rounded-lg px-2 py-1">
              <Text className="text-orange-400 text-xs">{exercise.category}</Text>
            </View>
            {exercise.difficulty > 0 && (
              <View className="rounded-lg px-2 py-1" style={{ backgroundColor: `${DIFFICULTY_COLORS[exercise.difficulty]}20` }}>
                <Text className="text-xs" style={{ color: DIFFICULTY_COLORS[exercise.difficulty] }}>
                  {'★'.repeat(exercise.difficulty)}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#64748b" />
      </View>
    </TouchableOpacity>
  );
}

export default function ExercisesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);

  const { data: exercises, isLoading } = useExercises({
    search: search || undefined,
    category: selectedCategory ?? undefined,
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold mb-3">Gyakorlatok</Text>
        <View className="flex-row items-center bg-slate-800 rounded-xl px-3 py-2 border border-slate-700">
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            className="flex-1 text-white ml-2"
            placeholder="Keresés..."
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 pb-2"
        contentContainerStyle={{ paddingRight: 16, gap: 8 }}
        style={{ maxHeight: 48, flexGrow: 0 }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.label}
            className={`rounded-full px-4 py-2 ${selectedCategory === cat.value ? 'bg-orange-500' : 'bg-slate-800'}`}
            onPress={() => setSelectedCategory(cat.value)}
          >
            <Text className={`text-sm font-semibold ${selectedCategory === cat.value ? 'text-white' : 'text-slate-400'}`}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : !exercises || exercises.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="barbell-outline" size={64} color="#334155" />
          <Text className="text-white text-lg font-bold mt-4">Nincs találat</Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <ExerciseCard
              exercise={item}
              onPress={() => router.push(`/(tabs)/exercises/${item.id}`)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 4 }}
        />
      )}
    </SafeAreaView>
  );
}
