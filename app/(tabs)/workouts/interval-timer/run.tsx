import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { CircularCountdown } from '@/components/timer/CircularCountdown';
import { useIntervalTimerStore } from '@/stores/intervalTimerStore';
import { INTRO_COLOR, COOLDOWN_COLOR, formatTimerTime } from '@/lib/intervalTimers';
import type { Phase } from '@/stores/intervalTimerStore';

const PHASE_LABELS: Record<Phase, string> = {
  intro: 'BEVEZETÉS',
  work: 'MUNKA',
  rest: 'PIHENŐ',
  cooldown: 'LEVEZETÉS',
  done: 'KÉSZ',
};

function getPhaseColor(phase: Phase, workColor: string, restColor: string): string {
  switch (phase) {
    case 'intro': return INTRO_COLOR;
    case 'work': return workColor;
    case 'rest': return restColor;
    case 'cooldown': return COOLDOWN_COLOR;
    case 'done': return '#22c55e';
  }
}

interface NextInfo {
  label: string;
  sec: number;
  color: string;
}

function getNextPhase(
  phase: Phase,
  currentRound: number,
  workColor: string,
  restColor: string,
  config: { work_sec: number; rest_sec: number; cooldown_sec: number; rounds: number } | null
): NextInfo | null {
  if (!config) return null;
  switch (phase) {
    case 'intro':
      return { label: 'Munka', sec: config.work_sec, color: workColor };
    case 'work':
      if (config.rest_sec > 0)
        return { label: 'Pihenő', sec: config.rest_sec, color: restColor };
      if (currentRound < config.rounds)
        return { label: 'Munka', sec: config.work_sec, color: workColor };
      if (config.cooldown_sec > 0)
        return { label: 'Levezetés', sec: config.cooldown_sec, color: COOLDOWN_COLOR };
      return null;
    case 'rest':
      if (currentRound < config.rounds)
        return { label: 'Munka', sec: config.work_sec, color: workColor };
      if (config.cooldown_sec > 0)
        return { label: 'Levezetés', sec: config.cooldown_sec, color: COOLDOWN_COLOR };
      return null;
    case 'cooldown':
    case 'done':
      return null;
  }
}

export default function RunTimerScreen() {
  const router = useRouter();
  const { config, phase, currentRound, secondsLeft, isPlaying, start, pause, reset, tick } =
    useIntervalTimerStore();

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, tick]);

  function handleClose() {
    if (isPlaying) {
      Alert.alert('Kilépés', 'Biztosan megszakítod az időzítőt?', [
        { text: 'Mégse', style: 'cancel' },
        {
          text: 'Kilépés',
          style: 'destructive',
          onPress: () => {
            pause();
            reset();
            router.back();
          },
        },
      ]);
    } else {
      reset();
      router.back();
    }
  }

  if (!config) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#64748b' }}>Nincs betöltött időzítő.</Text>
      </SafeAreaView>
    );
  }

  const phaseColor = getPhaseColor(phase, config.work_color, config.rest_color);
  const nextPhase = getNextPhase(phase, currentRound, config.work_color, config.rest_color, config);
  const isDone = phase === 'done';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={0.7}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#1e293b',
            borderWidth: 1,
            borderColor: '#334155',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="close" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            color: '#f1f5f9',
            fontSize: 17,
            fontWeight: '700',
            letterSpacing: -0.3,
          }}
        >
          {config.name}
        </Text>

        {/* Kör számláló jobb oldalon */}
        {!isDone && (
          <View style={{ minWidth: 36, alignItems: 'flex-end' }}>
            <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600' }}>
              {currentRound} / {config.rounds}
            </Text>
          </View>
        )}
      </View>

      {/* Fázis badge */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View
          style={{
            paddingHorizontal: 18,
            paddingVertical: 7,
            borderRadius: 999,
            borderWidth: 1.5,
            borderColor: phaseColor,
            backgroundColor: phaseColor + '18',
          }}
        >
          <Text
            style={{
              color: phaseColor,
              fontSize: 13,
              fontWeight: '800',
              letterSpacing: 1.5,
            }}
          >
            {PHASE_LABELS[phase]}
          </Text>
        </View>
      </View>

      {/* Körös visszaszámláló */}
      <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <CircularCountdown secondsLeft={secondsLeft} color={phaseColor} />

        {/* Következő fázis */}
        <View style={{ marginTop: 24, height: 20 }}>
          {nextPhase && !isDone && (
            <Text style={{ color: '#64748b', fontSize: 14 }}>
              Következik:{' '}
              <Text style={{ color: nextPhase.color, fontWeight: '700' }}>{nextPhase.label}</Text>
              {' · '}
              <Text style={{ color: '#94a3b8' }}>{formatTimerTime(nextPhase.sec)}</Text>
            </Text>
          )}
          {isDone && (
            <Text style={{ color: '#22c55e', fontSize: 15, fontWeight: '700' }}>
              Időzítő vége!
            </Text>
          )}
        </View>
      </View>

      {/* Alsó gombok */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32, gap: 12 }}>
        {isDone ? (
          <TouchableOpacity
            onPress={() => {
              reset();
              router.back();
            }}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#22c55e',
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Bezárás</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              onPress={isPlaying ? pause : start}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#f97316',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 10,
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
                {isPlaying ? 'Szünet' : 'Indítás'}
              </Text>
            </TouchableOpacity>

            {!isPlaying && (
              <TouchableOpacity
                onPress={() => {
                  reset();
                }}
                activeOpacity={0.7}
                style={{ alignItems: 'center', paddingVertical: 6 }}
              >
                <Text style={{ color: '#475569', fontSize: 13, fontWeight: '600' }}>
                  Újraindítás
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
