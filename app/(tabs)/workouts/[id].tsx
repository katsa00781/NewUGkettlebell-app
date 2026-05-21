import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout } from '@/hooks/useWorkouts';
import type { WorkoutExercise, WorkoutSection } from '@/lib/workouts';

type FlatExercise = WorkoutExercise & { sectionName: string };

type SetLog = {
  reps: string;
  weight: string;
  completed: boolean;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function buildDetails(ex: WorkoutExercise): string {
  const parts: string[] = [];
  if (ex.weight) parts.push(`${ex.weight} kg`);
  if (ex.notes) parts.push(ex.notes);
  parts.push(`${ex.reps} ismétlés / sorozat`);
  return parts.join(' · ');
}

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: workout, isLoading, error } = useWorkout(id);

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const [exerciseIdx, setExerciseIdx] = useState(0);

  const flatExercises = useMemo<FlatExercise[]>(() => {
    if (!workout) return [];
    const result: FlatExercise[] = [];
    workout.parsedSections.forEach((section: WorkoutSection) => {
      (section.exercises ?? []).forEach((ex: WorkoutExercise) => {
        result.push({ ...ex, sectionName: section.name });
      });
    });
    return result;
  }, [workout]);

  const [setLogs, setSetLogs] = useState<SetLog[][]>([]);

  useEffect(() => {
    if (flatExercises.length > 0 && setLogs.length === 0) {
      setSetLogs(
        flatExercises.map(ex =>
          Array.from({ length: Math.max(ex.sets ?? 1, 1) }, () => ({
            reps: String(ex.reps ?? ''),
            weight: String(ex.weight ?? ''),
            completed: false,
          }))
        )
      );
    }
  }, [flatExercises, setLogs.length]);

  const updateSetLog = useCallback(
    (setIdx: number, field: 'reps' | 'weight', value: string) => {
      setSetLogs(prev =>
        prev.map((exSets, eIdx) => {
          if (eIdx !== exerciseIdx) return exSets;
          return exSets.map((s, sIdx) =>
            sIdx === setIdx ? { ...s, [field]: value } : s
          );
        })
      );
    },
    [exerciseIdx]
  );

  const toggleComplete = useCallback(
    (setIdx: number) => {
      setSetLogs(prev =>
        prev.map((exSets, eIdx) => {
          if (eIdx !== exerciseIdx) return exSets;
          return exSets.map((s, sIdx) =>
            sIdx === setIdx ? { ...s, completed: !s.completed } : s
          );
        })
      );
    },
    [exerciseIdx]
  );

  const handleClose = () => {
    Alert.alert(
      'Edzés megszakítása',
      'Biztosan ki akarsz lépni? A haladásod elvész.',
      [
        { text: 'Mégsem', style: 'cancel' },
        { text: 'Kilépés', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const handleNext = () => {
    if (exerciseIdx < flatExercises.length - 1) {
      setExerciseIdx(i => i + 1);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      Alert.alert('Edzés kész!', `Gratulálunk, befejezted az edzést! Idő: ${formatTime(elapsed)}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !workout) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#f87171' }}>Edzés nem található</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (flatExercises.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="close" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="fitness-outline" size={48} color="#334155" />
          <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700', marginTop: 16 }}>Nincs gyakorlat</Text>
          <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 8 }}>
            Ez az edzés nem tartalmaz gyakorlatokat.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentExercise = flatExercises[exerciseIdx];
  const currentSets = setLogs[exerciseIdx] ?? [];
  const completedSets = currentSets.filter(s => s.completed).length;
  const isLast = exerciseIdx === flatExercises.length - 1;
  const canProceed = completedSets > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={handleClose}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="close" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#f97316' }} />
            <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 15 }}>
              {formatTime(elapsed)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Workout title subtitle */}
      <Text
        style={{
          textAlign: 'center',
          fontSize: 11,
          letterSpacing: 1.2,
          color: '#64748b',
          fontWeight: '600',
          textTransform: 'uppercase',
          marginBottom: 20,
          paddingHorizontal: 32,
        }}
        numberOfLines={1}
      >
        {workout.title}
      </Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Exercise counter + set progress */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: '#f97316', fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
            Gyakorlat {exerciseIdx + 1} / {flatExercises.length}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600' }}>
            {completedSets} / {currentSets.length} szett
          </Text>
        </View>

        {/* Exercise name */}
        <Text style={{ color: '#ffffff', fontSize: 26, fontWeight: '800', marginBottom: 6, letterSpacing: -0.5 }}>
          {currentExercise.name}
        </Text>

        {/* Exercise details */}
        <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>
          {buildDetails(currentExercise)}
        </Text>

        {/* Section label */}
        <Text
          style={{
            color: '#475569',
            fontSize: 11,
            letterSpacing: 1,
            fontWeight: '600',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          {currentExercise.sectionName}
        </Text>

        {/* Set table header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, marginBottom: 6 }}>
          <Text style={{ width: 32, color: '#475569', fontSize: 11, fontWeight: '600' }}>#</Text>
          <Text style={{ flex: 1, color: '#475569', fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
            REPS
          </Text>
          <Text style={{ flex: 1, color: '#475569', fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
            SÚLY (KG)
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Set rows */}
        {currentSets.map((setLog, setIdx) => (
          <View
            key={setIdx}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1e293b',
              borderRadius: 12,
              marginBottom: 8,
              paddingVertical: 8,
              paddingHorizontal: 4,
              borderWidth: 1,
              borderColor: setLog.completed ? 'rgba(249,115,22,0.35)' : 'transparent',
            }}
          >
            <Text style={{ width: 32, color: '#64748b', fontSize: 14, fontWeight: '600', paddingLeft: 4 }}>
              {setIdx + 1}
            </Text>

            <View style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  paddingVertical: 8,
                  width: 76,
                  alignItems: 'center',
                }}
              >
                <TextInput
                  value={setLog.reps}
                  onChangeText={v => updateSetLog(setIdx, 'reps', v)}
                  keyboardType="numeric"
                  selectTextOnFocus
                  style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', textAlign: 'center', width: 76 }}
                />
              </View>
            </View>

            <View style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  paddingVertical: 8,
                  width: 76,
                  alignItems: 'center',
                }}
              >
                <TextInput
                  value={setLog.weight}
                  onChangeText={v => updateSetLog(setIdx, 'weight', v)}
                  keyboardType="numeric"
                  selectTextOnFocus
                  style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', textAlign: 'center', width: 76 }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => toggleComplete(setIdx)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: setLog.completed ? '#f97316' : '#0f172a',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 8,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={18} color={setLog.completed ? '#fff' : '#475569'} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 24 }} />

        {/* Next exercise / Finish button */}
        <TouchableOpacity
          onPress={canProceed ? handleNext : undefined}
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 14,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: canProceed ? 1 : 0.5,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: canProceed ? '#ffffff' : '#475569', fontSize: 15, fontWeight: '600' }}>
            {isLast ? 'Edzés befejezése' : 'Következő gyakorlat'}
          </Text>
          <Ionicons
            name={isLast ? 'checkmark-circle-outline' : 'chevron-forward'}
            size={18}
            color={canProceed ? '#ffffff' : '#475569'}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
