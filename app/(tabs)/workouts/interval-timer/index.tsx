import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TimerCard } from '@/components/timer/TimerCard';
import { FACTORY_TIMERS } from '@/lib/intervalTimers';
import { useIntervalTimers, useDeleteIntervalTimer } from '@/hooks/useIntervalTimers';
import { useIntervalTimerStore } from '@/stores/intervalTimerStore';
import type { TimerConfig, FactoryTimer } from '@/lib/intervalTimers';
import type { IntervalTimer } from '@/types/supabase';

function timerToConfig(t: IntervalTimer): TimerConfig {
  return {
    name: t.name,
    intro_sec: t.intro_sec,
    work_sec: t.work_sec,
    rest_sec: t.rest_sec,
    cooldown_sec: t.cooldown_sec,
    rounds: t.rounds,
    work_color: t.work_color,
    rest_color: t.rest_color,
  };
}

function factoryToConfig(t: FactoryTimer): TimerConfig {
  return {
    name: t.name,
    intro_sec: t.intro_sec,
    work_sec: t.work_sec,
    rest_sec: t.rest_sec,
    cooldown_sec: t.cooldown_sec,
    rounds: t.rounds,
    work_color: t.work_color,
    rest_color: t.rest_color,
  };
}

export default function IntervalTimerHubScreen() {
  const router = useRouter();
  const { data: userTimers, isLoading } = useIntervalTimers();
  const { mutate: deleteTimer } = useDeleteIntervalTimer();
  const loadTimer = useIntervalTimerStore((s) => s.loadTimer);
  const setPreloadFactoryId = useIntervalTimerStore((s) => s.setPreloadFactoryId);

  function startTimer(config: TimerConfig) {
    loadTimer(config);
    router.push('/(tabs)/workouts/interval-timer/run');
  }

  function handleDelete(id: string, name: string) {
    Alert.alert('Törlés', `Töröljük a „${name}" időzítőt?`, [
      { text: 'Mégse', style: 'cancel' },
      { text: 'Törlés', style: 'destructive', onPress: () => deleteTimer(id) },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 12,
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
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
          <Ionicons name="chevron-back" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: '#64748b',
              fontSize: 11.5,
              fontWeight: '600',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            EDZÉS ESZKÖZ
          </Text>
          <Text style={{ color: '#f1f5f9', fontSize: 22, fontWeight: '800', letterSpacing: -0.4 }}>
            Intervallum időzítő
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/workouts/interval-timer/edit')}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: '#f97316',
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Új</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        {/* Saját időzítők */}
        <Text
          style={{
            color: '#64748b',
            fontSize: 11.5,
            fontWeight: '700',
            letterSpacing: 1.3,
            textTransform: 'uppercase',
            marginBottom: 10,
            marginTop: 4,
          }}
        >
          Saját időzítők
        </Text>

        {isLoading ? (
          <ActivityIndicator color="#f97316" style={{ marginVertical: 24 }} />
        ) : userTimers && userTimers.length > 0 ? (
          userTimers.map((t) => (
            <TimerCard
              key={t.id}
              config={timerToConfig(t)}
              onPlay={() => startTimer(timerToConfig(t))}
              onDelete={() => handleDelete(t.id, t.name)}
            />
          ))
        ) : (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/workouts/interval-timer/edit')}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#1e2a3f',
              borderStyle: 'dashed',
              alignItems: 'center',
              paddingVertical: 28,
              marginBottom: 12,
              gap: 10,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: 'rgba(249,115,22,0.14)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="add" size={24} color="#f97316" />
            </View>
            <Text style={{ color: '#f1f5f9', fontSize: 14.5, fontWeight: '700' }}>
              Hozz létre egy időzítőt
            </Text>
            <Text style={{ color: '#64748b', fontSize: 12.5 }}>
              Vagy indíts egy gyári mintát alább
            </Text>
          </TouchableOpacity>
        )}

        {/* Gyári minták */}
        <Text
          style={{
            color: '#64748b',
            fontSize: 11.5,
            fontWeight: '700',
            letterSpacing: 1.3,
            textTransform: 'uppercase',
            marginBottom: 10,
            marginTop: 16,
          }}
        >
          Gyári minták
        </Text>

        {FACTORY_TIMERS.map((t) => (
          <TimerCard
            key={t.id}
            config={factoryToConfig(t)}
            isFactory
            onPlay={() => startTimer(factoryToConfig(t))}
            onCopy={() => {
              setPreloadFactoryId(t.id);
              router.push('/(tabs)/workouts/interval-timer/edit');
            }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
