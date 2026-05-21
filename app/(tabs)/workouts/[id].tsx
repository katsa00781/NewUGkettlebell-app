import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout } from '@/hooks/useWorkouts';
import { useLogWorkout } from '@/hooks/useWorkoutLog';
import { useWorkoutLogStore } from '@/stores/workoutLogStore';
import type { WorkoutExercise, WorkoutSection } from '@/lib/workouts';

type SetLog = {
  reps: string;
  weight: string;
  completed: boolean;
};

type RestTimerState = { remaining: number; total: number } | null;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function buildDescription(ex: WorkoutExercise): string {
  const parts: string[] = [];
  if (ex.weight) parts.push(`${ex.weight} kg`);
  if (ex.notes) parts.push(ex.notes);
  if (ex.sets && ex.reps) parts.push(`${ex.sets} × ${ex.reps} ismétlés`);
  else if (ex.reps) parts.push(`${ex.reps} ismétlés`);
  if (ex.rest) parts.push(`${ex.rest} mp pihenő`);
  return parts.join(' · ');
}

function buildUpdatedSections(
  parsedSections: WorkoutSection[],
  setLogs: SetLog[][]
): WorkoutSection[] {
  let flatIdx = 0;
  return parsedSections.map(section => ({
    ...section,
    exercises: (section.exercises ?? []).map(ex => {
      const logs = setLogs[flatIdx] ?? [];
      flatIdx++;
      const completedLogs = logs.filter(l => l.completed);
      const lastCompleted = completedLogs[completedLogs.length - 1];
      return {
        ...ex,
        actualSets: completedLogs.length,
        actualReps: lastCompleted
          ? parseInt(lastCompleted.reps, 10) || ex.reps
          : ex.reps,
        actualWeight: lastCompleted
          ? parseFloat(lastCompleted.weight) || ex.weight
          : ex.weight,
        completed: completedLogs.length > 0,
      };
    }),
  }));
}

function RestTimerBanner({
  timer,
  onDismiss,
}: {
  timer: RestTimerState;
  onDismiss: () => void;
}) {
  if (!timer) return null;
  const progress = timer.remaining / timer.total;
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 10,
        backgroundColor: '#1e293b',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.35)',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="timer-outline" size={16} color="#f97316" />
          <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 14 }}>
            Pihenő · {formatTime(timer.remaining)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            backgroundColor: '#0f172a',
            borderRadius: 8,
          }}
          activeOpacity={0.7}
        >
          <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>Kész</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{ height: 4, backgroundColor: '#0f172a', borderRadius: 2, overflow: 'hidden' }}
      >
        <View
          style={{
            height: 4,
            backgroundColor: '#f97316',
            borderRadius: 2,
            width: `${Math.round(progress * 100)}%`,
          }}
        />
      </View>
    </View>
  );
}

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: workout, isLoading, error } = useWorkout(id);
  const { mutate: logWorkout, isPending: isSaving } = useLogWorkout();
  const { setActiveWorkout, clearActiveWorkout } = useWorkoutLogStore();

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const [restTimer, setRestTimer] = useState<RestTimerState>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  const startRestTimer = useCallback((seconds: number) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimer({ remaining: seconds, total: seconds });
    restTimerRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (!prev || prev.remaining <= 1) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          return null;
        }
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
  }, []);

  const dismissRestTimer = useCallback(() => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimer(null);
  }, []);

  const [showSummary, setShowSummary] = useState(false);
  const [finishNotes, setFinishNotes] = useState('');

  const flatExercises = useMemo<WorkoutExercise[]>(() => {
    if (!workout) return [];
    const result: WorkoutExercise[] = [];
    workout.parsedSections.forEach((section: WorkoutSection) => {
      (section.exercises ?? []).forEach((ex: WorkoutExercise) => {
        result.push(ex);
      });
    });
    return result;
  }, [workout]);

  useEffect(() => {
    if (!workout) return;
    setActiveWorkout(workout.id, new Date().toISOString());
    return () => clearActiveWorkout();
  }, [workout?.id, setActiveWorkout, clearActiveWorkout]);

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
    (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: string) => {
      setSetLogs(prev =>
        prev.map((exSets, eIdx) => {
          if (eIdx !== exIdx) return exSets;
          return exSets.map((s, sIdx) => (sIdx === setIdx ? { ...s, [field]: value } : s));
        })
      );
    },
    []
  );

  const toggleComplete = useCallback(
    (exIdx: number, setIdx: number) => {
      setSetLogs(prev => {
        const wasCompleted = prev[exIdx]?.[setIdx]?.completed ?? false;
        const updated = prev.map((exSets, eIdx) => {
          if (eIdx !== exIdx) return exSets;
          return exSets.map((s, sIdx) => (sIdx === setIdx ? { ...s, completed: !s.completed } : s));
        });
        if (!wasCompleted) {
          const restSeconds = flatExercises[exIdx]?.rest ?? 60;
          startRestTimer(restSeconds);
        } else {
          dismissRestTimer();
        }
        return updated;
      });
    },
    [flatExercises, startRestTimer, dismissRestTimer]
  );

  const handleClose = () => {
    Alert.alert('Edzés megszakítása', 'Biztosan ki akarsz lépni? A haladásod elvész.', [
      { text: 'Mégsem', style: 'cancel' },
      {
        text: 'Kilépés',
        style: 'destructive',
        onPress: () => {
          clearActiveWorkout();
          router.back();
        },
      },
    ]);
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    dismissRestTimer();
    setShowSummary(true);
  };

  const handleSave = () => {
    if (!workout) return;
    const updatedSections = buildUpdatedSections(workout.parsedSections, setLogs);
    logWorkout(
      {
        workoutId: workout.id,
        sections: updatedSections,
        notes: finishNotes.trim() || null,
      },
      {
        onSuccess: () => {
          clearActiveWorkout();
          router.back();
        },
        onError: () => {
          Alert.alert('Hiba', 'Nem sikerült menteni az edzést. Próbáld újra.');
        },
      }
    );
  };

  const totalSets = setLogs.reduce((acc, exSets) => acc + exSets.length, 0);
  const totalCompletedSets = setLogs.reduce(
    (acc, exSets) => acc + exSets.filter(s => s.completed).length,
    0
  );
  const canFinish = totalCompletedSets > 0;

  // First flat index that has incomplete sets (for MOST badge)
  const firstIncompleteIdx = setLogs.findIndex(
    exSets => exSets.some(s => !s.completed)
  );

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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#1e293b',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}
        >
          <Ionicons name="fitness-outline" size={48} color="#334155" />
          <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700', marginTop: 16 }}>
            Nincs gyakorlat
          </Text>
          <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 8 }}>
            Ez az edzés nem tartalmaz gyakorlatokat.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Build section-to-flatIdx mapping
  const sectionFlatOffsets: number[] = [];
  let offset = 0;
  workout.parsedSections.forEach((section: WorkoutSection) => {
    sectionFlatOffsets.push(offset);
    offset += section.exercises?.length ?? 0;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        <TouchableOpacity
          onPress={handleClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#1e293b',
            alignItems: 'center',
            justifyContent: 'center',
          }}
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
            <View
              style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#f97316' }}
            />
            <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 15 }}>
              {formatTime(elapsed)}
            </Text>
          </View>
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* Workout title + total progress */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            letterSpacing: 1.2,
            color: '#64748b',
            fontWeight: '600',
            textTransform: 'uppercase',
            flex: 1,
          }}
          numberOfLines={1}
        >
          {workout.title}
        </Text>
        <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginLeft: 12 }}>
          {totalCompletedSets} / {totalSets}
        </Text>
      </View>

      {/* Rest timer banner */}
      <RestTimerBanner timer={restTimer} onDismiss={dismissRestTimer} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {workout.parsedSections.map((section: WorkoutSection, sectionIdx: number) => {
          const sectionLetter = String.fromCharCode(65 + sectionIdx);
          const sectionOffset = sectionFlatOffsets[sectionIdx];
          const sectionExercises = section.exercises ?? [];
          const sectionHasCurrent = sectionExercises.some(
            (_, exIdx) => sectionOffset + exIdx === firstIncompleteIdx
          );

          return (
            <View key={section.id ?? sectionIdx} style={{ marginBottom: 16 }}>
              {/* Section header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderLeftWidth: 3,
                  borderLeftColor: '#f97316',
                  paddingLeft: 10,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#f97316',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>
                    {sectionLetter}
                  </Text>
                </View>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15, flex: 1 }}>
                  {section.name}
                </Text>
                {sectionHasCurrent && (
                  <View
                    style={{
                      backgroundColor: 'rgba(249,115,22,0.15)',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ color: '#f97316', fontSize: 11, fontWeight: '700' }}>
                      MOST
                    </Text>
                  </View>
                )}
              </View>

              {/* Exercise cards */}
              {sectionExercises.map((ex: WorkoutExercise, exIdxInSection: number) => {
                const flatIdx = sectionOffset + exIdxInSection;
                const exerciseLabel = `${sectionLetter}${exIdxInSection + 1}`;
                const sets = setLogs[flatIdx] ?? [];
                const completedCount = sets.filter(s => s.completed).length;
                const isCurrent = flatIdx === firstIncompleteIdx;
                const description = buildDescription(ex);

                return (
                  <View
                    key={ex.id ?? flatIdx}
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: 16,
                      marginBottom: 10,
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: isCurrent
                        ? 'rgba(249,115,22,0.4)'
                        : 'transparent',
                    }}
                  >
                    {/* Orange left accent bar */}
                    <View
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        backgroundColor: isCurrent ? '#f97316' : '#334155',
                        borderTopLeftRadius: 16,
                        borderBottomLeftRadius: 16,
                      }}
                    />

                    <View style={{ paddingLeft: 14, paddingRight: 12, paddingTop: 12, paddingBottom: 12 }}>
                      {/* Card header: label + badge + set counter */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 6,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: isCurrent
                              ? 'rgba(249,115,22,0.2)'
                              : '#0f172a',
                            borderRadius: 6,
                            paddingHorizontal: 7,
                            paddingVertical: 3,
                            marginRight: 6,
                          }}
                        >
                          <Text
                            style={{
                              color: isCurrent ? '#f97316' : '#64748b',
                              fontSize: 11,
                              fontWeight: '700',
                            }}
                          >
                            {exerciseLabel}
                          </Text>
                        </View>
                        {isCurrent && (
                          <View
                            style={{
                              backgroundColor: 'rgba(249,115,22,0.15)',
                              borderRadius: 6,
                              paddingHorizontal: 7,
                              paddingVertical: 3,
                              marginRight: 6,
                            }}
                          >
                            <Text style={{ color: '#f97316', fontSize: 11, fontWeight: '700' }}>
                              MOST
                            </Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }} />
                        <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600' }}>
                          {completedCount} / {sets.length}
                        </Text>
                      </View>

                      {/* Exercise name */}
                      <Text
                        style={{
                          color: '#ffffff',
                          fontSize: 17,
                          fontWeight: '800',
                          marginBottom: 3,
                          letterSpacing: -0.3,
                        }}
                      >
                        {ex.name}
                      </Text>

                      {/* Description */}
                      {description ? (
                        <Text
                          style={{
                            color: '#94a3b8',
                            fontSize: 12,
                            marginBottom: 12,
                            lineHeight: 17,
                          }}
                        >
                          {description}
                        </Text>
                      ) : (
                        <View style={{ marginBottom: 12 }} />
                      )}

                      {/* Set table header */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingBottom: 4,
                          borderBottomWidth: 1,
                          borderBottomColor: '#0f172a',
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            width: 28,
                            color: '#475569',
                            fontSize: 10,
                            fontWeight: '600',
                            letterSpacing: 0.5,
                          }}
                        >
                          #
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            color: '#475569',
                            fontSize: 10,
                            fontWeight: '600',
                            textAlign: 'center',
                            letterSpacing: 0.5,
                          }}
                        >
                          SZETT REPS
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            color: '#475569',
                            fontSize: 10,
                            fontWeight: '600',
                            textAlign: 'center',
                            letterSpacing: 0.5,
                          }}
                        >
                          SÚLY (KG)
                        </Text>
                        <View style={{ width: 40 }} />
                      </View>

                      {/* Set rows */}
                      {sets.map((setLog, setIdx) => (
                        <View
                          key={setIdx}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: setLog.completed
                              ? 'rgba(249,115,22,0.08)'
                              : '#0f172a',
                            borderRadius: 10,
                            marginBottom: 6,
                            paddingVertical: 6,
                            paddingHorizontal: 4,
                            borderWidth: 1,
                            borderColor: setLog.completed
                              ? 'rgba(249,115,22,0.3)'
                              : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              width: 28,
                              color: '#64748b',
                              fontSize: 13,
                              fontWeight: '600',
                              paddingLeft: 4,
                            }}
                          >
                            {setIdx + 1}
                          </Text>

                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <View
                              style={{
                                backgroundColor: setLog.completed ? '#1e293b' : '#1e293b',
                                borderRadius: 8,
                                paddingVertical: 7,
                                width: 72,
                                alignItems: 'center',
                              }}
                            >
                              <TextInput
                                value={setLog.reps}
                                onChangeText={v => updateSetLog(flatIdx, setIdx, 'reps', v)}
                                keyboardType="numeric"
                                selectTextOnFocus
                                style={{
                                  color: '#ffffff',
                                  fontSize: 16,
                                  fontWeight: '700',
                                  textAlign: 'center',
                                  width: 72,
                                }}
                              />
                            </View>
                          </View>

                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <View
                              style={{
                                backgroundColor: '#1e293b',
                                borderRadius: 8,
                                paddingVertical: 7,
                                width: 72,
                                alignItems: 'center',
                              }}
                            >
                              <TextInput
                                value={setLog.weight}
                                onChangeText={v => updateSetLog(flatIdx, setIdx, 'weight', v)}
                                keyboardType="numeric"
                                selectTextOnFocus
                                style={{
                                  color: '#ffffff',
                                  fontSize: 16,
                                  fontWeight: '700',
                                  textAlign: 'center',
                                  width: 72,
                                }}
                              />
                            </View>
                          </View>

                          <TouchableOpacity
                            onPress={() => toggleComplete(flatIdx, setIdx)}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              backgroundColor: setLog.completed ? '#f97316' : '#334155',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginLeft: 6,
                            }}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name="checkmark"
                              size={17}
                              color={setLog.completed ? '#fff' : '#64748b'}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}

        <View style={{ height: 16 }} />

        {/* Finish button */}
        <TouchableOpacity
          onPress={canFinish ? handleFinish : undefined}
          style={{
            backgroundColor: canFinish ? '#f97316' : '#1e293b',
            borderRadius: 14,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: canFinish ? 1 : 0.5,
          }}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color: canFinish ? '#ffffff' : '#475569',
              fontSize: 15,
              fontWeight: '600',
            }}
          >
            Edzés befejezése
          </Text>
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={canFinish ? '#ffffff' : '#475569'}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Summary modal */}
      <Modal visible={showSummary} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
          <View
            style={{
              backgroundColor: '#0f172a',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: '#334155',
                borderRadius: 2,
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />

            <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '800', marginBottom: 4 }}>
              Edzés kész!
            </Text>
            <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
              Remek munka – mentjük a haladásodat.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#1e293b',
                  borderRadius: 16,
                  padding: 16,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ color: '#f97316', fontSize: 28, fontWeight: '800', lineHeight: 32 }}
                >
                  {totalCompletedSets}
                </Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
                  Befejezett szett
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#1e293b',
                  borderRadius: 16,
                  padding: 16,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ color: '#f97316', fontSize: 28, fontWeight: '800', lineHeight: 32 }}
                >
                  {formatTime(elapsed)}
                </Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Edzési idő</Text>
              </View>
            </View>

            <Text
              style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8 }}
            >
              Megjegyzés (opcionális)
            </Text>
            <TextInput
              value={finishNotes}
              onChangeText={setFinishNotes}
              placeholder="Hogyan ment az edzés?"
              placeholderTextColor="#475569"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 12,
                padding: 14,
                color: '#ffffff',
                fontSize: 15,
                minHeight: 72,
                textAlignVertical: 'top',
                marginBottom: 20,
              }}
            />

            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={{
                backgroundColor: '#f97316',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 10,
                opacity: isSaving ? 0.7 : 1,
              }}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
                  Edzés mentése
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowSummary(false);
                clearActiveWorkout();
                router.back();
              }}
              style={{ paddingVertical: 12, alignItems: 'center' }}
              activeOpacity={0.7}
            >
              <Text style={{ color: '#475569', fontSize: 14 }}>Mentés nélkül kilépés</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
