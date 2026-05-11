import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useWorkoutPlannerStore } from '@/stores/workoutStore';
import { generateWorkoutPlan } from '@/lib/workoutGenerator';
import type { GeneratedWorkoutPlan, WorkoutSectionGenerated } from '@/lib/workoutGenerator';
import { createWorkout } from '@/lib/workouts';
import { useAuthStore } from '@/stores/authStore';

const TRAINING_FOCUS_OPTIONS = [
  { value: 'strength', label: 'Erő' },
  { value: 'power', label: 'Robbanékonyság' },
  { value: 'endurance', label: 'Állóképesség' },
  { value: 'hypertrophy', label: 'Hipertrófia' },
  { value: 'maxStrength', label: 'Max Erő' },
  { value: 'maxStrengthHypertrophy', label: 'Max Erő + Hipertrófia' },
  { value: 'hypertrophyFatLoss', label: 'Hipertrófia + Zsírcsökkentés' },
] as const;

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-3 py-2 rounded-xl mr-2 mb-2 ${selected ? 'bg-orange-500' : 'bg-slate-700'}`}
    >
      <Text className={`text-sm font-medium ${selected ? 'text-white' : 'text-slate-300'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SectionPreview({ section }: { section: WorkoutSectionGenerated }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="bg-slate-800 rounded-xl mb-3 overflow-hidden">
      <TouchableOpacity
        className="flex-row items-center justify-between p-4"
        onPress={() => setExpanded(!expanded)}
      >
        <View className="flex-1">
          <Text className="text-white font-semibold">{section.name}</Text>
          <Text className="text-slate-400 text-xs mt-0.5">
            {section.exercises.length} gyakorlat
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#94a3b8"
        />
      </TouchableOpacity>

      {expanded && (
        <View className="border-t border-slate-700 px-4 pb-4">
          {section.exercises.map((ex, idx) => (
            <View key={idx} className="mt-3">
              <Text className="text-white text-sm font-medium">
                {ex.name || `Gyakorlat (${ex.exerciseId.slice(0, 8)}...)`}
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                {ex.sets} × {ex.reps}
                {ex.weight ? ` · ${ex.weight} kg` : ''}
                {ex.restPeriod ? ` · ${ex.restPeriod}s pihenő` : ''}
              </Text>
              {ex.notes ? (
                <Text className="text-slate-500 text-xs mt-0.5 italic">{ex.notes}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function ConfigStep({ onGenerate }: { onGenerate: () => void }) {
  const store = useWorkoutPlannerStore();

  return (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      <View className="mb-6 mt-2">
        <Text className="text-slate-400 text-sm mb-2">Mód</Text>
        <View className="flex-row">
          <Chip
            label="Template"
            selected={store.mode === 'template'}
            onPress={() => store.setMode('template')}
          />
          <Chip
            label="Periodizált"
            selected={store.mode === 'periodized'}
            onPress={() => store.setMode('periodized')}
          />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-slate-400 text-sm mb-2">Nap</Text>
        <View className="flex-row">
          {([1, 2, 3, 4] as const).map((d) => (
            <Chip
              key={d}
              label={`${d}. nap`}
              selected={store.day === d}
              onPress={() => store.setDay(d)}
            />
          ))}
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-slate-400 text-sm mb-2">Dátum</Text>
        <TextInput
          className="bg-slate-800 text-white rounded-xl px-4 py-3"
          value={store.date}
          onChangeText={store.setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#64748b"
        />
      </View>

      {store.mode === 'periodized' && (
        <>
          <View className="mb-6">
            <Text className="text-slate-400 text-sm mb-2">Programtípus</Text>
            <View className="flex-row">
              {(['2napos', '3napos', '4napos'] as const).map((pt) => (
                <Chip
                  key={pt}
                  label={pt}
                  selected={store.programType === pt}
                  onPress={() => store.setProgramType(pt)}
                />
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-400 text-sm mb-2">Hét (1–6)</Text>
            <View className="flex-row flex-wrap">
              {([1, 2, 3, 4, 5, 6] as const).map((w) => (
                <Chip
                  key={w}
                  label={`${w}. hét`}
                  selected={store.cycleWeek === w}
                  onPress={() => store.setCycleWeek(w)}
                />
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-400 text-sm mb-2">Fókusz</Text>
            <View className="flex-row flex-wrap">
              {TRAINING_FOCUS_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={store.trainingFocus === opt.value}
                  onPress={() =>
                    store.setTrainingFocus(
                      store.trainingFocus === opt.value ? null : opt.value
                    )
                  }
                />
              ))}
            </View>
          </View>
        </>
      )}

      <TouchableOpacity
        className="bg-orange-500 rounded-2xl py-4 items-center mt-2 mb-8"
        onPress={onGenerate}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="flash" size={20} color="white" />
          <Text className="text-white font-bold text-base">Edzés generálása</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

function PreviewStep({
  workout,
  onSave,
  onRegenerate,
  isSaving,
}: {
  workout: GeneratedWorkoutPlan;
  onSave: (title: string) => void;
  onRegenerate: () => void;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(workout.title);

  return (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      <View className="mb-4 mt-2">
        <Text className="text-slate-400 text-sm mb-2">Edzés neve</Text>
        <TextInput
          className="bg-slate-800 text-white rounded-xl px-4 py-3 text-base"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#64748b"
        />
      </View>

      {workout.description ? (
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="text-slate-300 text-sm">{workout.description}</Text>
        </View>
      ) : null}

      <View className="flex-row gap-3 mb-4">
        <View className="bg-slate-800 rounded-xl px-3 py-2 flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#94a3b8" />
          <Text className="text-slate-300 text-xs ml-1">{workout.duration} perc</Text>
        </View>
        <View className="bg-slate-800 rounded-xl px-3 py-2 flex-row items-center">
          <Ionicons name="layers-outline" size={14} color="#94a3b8" />
          <Text className="text-slate-300 text-xs ml-1">{workout.sections.length} szekció</Text>
        </View>
      </View>

      <Text className="text-slate-400 text-sm mb-3">Szekciók</Text>
      {workout.sections.map((section, idx) => (
        <SectionPreview key={idx} section={section} />
      ))}

      {workout.notes ? (
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="text-slate-400 text-xs mb-1">Megjegyzések</Text>
          <Text className="text-slate-300 text-sm">{workout.notes}</Text>
        </View>
      ) : null}

      <View className="flex-row gap-3 mb-8 mt-2">
        <TouchableOpacity
          className="flex-1 bg-slate-700 rounded-2xl py-4 items-center"
          onPress={onRegenerate}
          disabled={isSaving}
        >
          <Text className="text-white font-semibold">Újragenerálás</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-orange-500 rounded-2xl py-4 items-center"
          onPress={() => onSave(title)}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold">Mentés</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function PlannerScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const store = useWorkoutPlannerStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState<'config' | 'preview'>('config');
  const [isSaving, setIsSaving] = useState(false);

  async function handleGenerate() {
    if (!user?.id) return;
    store.setIsGenerating(true);
    try {
      const workout = await generateWorkoutPlan({
        userId: user.id,
        day: store.day,
        includeWeights: true,
        adjustForFMS: true,
      });
      store.setGeneratedWorkout(workout);
      setStep('preview');
    } catch (err: any) {
      Alert.alert('Hiba', err?.message ?? 'Nem sikerült az edzés generálása. Ellenőrizd, hogy az adatbázisban elég gyakorlat van.');
    } finally {
      store.setIsGenerating(false);
    }
  }

  async function handleSave(title: string) {
    if (!store.generatedWorkout) return;
    setIsSaving(true);
    try {
      const saved = await createWorkout({
        title,
        date: store.date,
        duration: store.generatedWorkout.duration,
        notes: store.generatedWorkout.notes ?? null,
        sections: JSON.stringify(
          store.generatedWorkout.sections.map((s, si) => ({
            id: `section-${si}`,
            name: s.name,
            exercises: s.exercises.map((ex, ei) => ({
              id: `ex-${si}-${ei}`,
              exerciseId: ex.exerciseId,
              name: ex.name ?? '',
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight ?? undefined,
              rest: ex.restPeriod,
              notes: ex.notes,
            })),
          }))
        ),
      });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      store.reset();
      router.replace(`/(tabs)/workouts/${saved.id}` as any);
    } catch (err: any) {
      Alert.alert('Hiba', err?.message ?? 'Nem sikerült menteni az edzést.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">Edzéstervező</Text>
        {step === 'preview' && (
          <TouchableOpacity
            onPress={() => setStep('config')}
            className="p-1"
          >
            <Ionicons name="settings-outline" size={22} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {store.isGenerating ? (
        <View className="flex-1 items-center justify-center gap-4">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-slate-400 text-sm">Edzés generálása...</Text>
        </View>
      ) : step === 'config' ? (
        <ConfigStep onGenerate={handleGenerate} />
      ) : store.generatedWorkout ? (
        <PreviewStep
          workout={store.generatedWorkout}
          onSave={handleSave}
          onRegenerate={() => setStep('config')}
          isSaving={isSaving}
        />
      ) : null}
    </SafeAreaView>
  );
}
