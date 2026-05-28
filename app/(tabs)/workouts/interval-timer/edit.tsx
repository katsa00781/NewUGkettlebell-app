import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ColorPicker } from '@/components/timer/ColorPicker';
import { FACTORY_TIMERS, INTRO_COLOR, COOLDOWN_COLOR, formatTimerTime } from '@/lib/intervalTimers';
import { useSaveIntervalTimer } from '@/hooks/useIntervalTimers';
import { useAuth } from '@/hooks/useAuth';
import { useIntervalTimerStore } from '@/stores/intervalTimerStore';

const STEP = 5;
const MIN_SEC = 0;
const MAX_SEC = 600;

function clamp(val: number) {
  return Math.max(MIN_SEC, Math.min(MAX_SEC, val));
}

function Stepper({
  label,
  sub,
  value,
  color,
  fixed,
  onChange,
}: {
  label: string;
  sub?: string;
  value: number;
  color: string;
  fixed?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <View
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#1e2a3f',
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          marginRight: 12,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#f1f5f9', fontSize: 14.5, fontWeight: '600' }}>{label}</Text>
        {sub && (
          <Text style={{ color: '#64748b', fontSize: 11, marginTop: 1 }}>{sub}</Text>
        )}
      </View>
      {fixed ? (
        <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '700', minWidth: 48, textAlign: 'center' }}>
          {formatTimerTime(value)}
        </Text>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <TouchableOpacity
            onPress={() => onChange(clamp(value - STEP))}
            activeOpacity={0.7}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#0f172a',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '600', lineHeight: 22 }}>−</Text>
          </TouchableOpacity>

          <Text
            style={{
              color: '#fff',
              fontSize: 15,
              fontWeight: '700',
              minWidth: 48,
              textAlign: 'center',
              fontVariant: ['tabular-nums'],
            }}
          >
            {formatTimerTime(value)}
          </Text>

          <TouchableOpacity
            onPress={() => onChange(clamp(value + STEP))}
            activeOpacity={0.7}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#f97316',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', lineHeight: 22 }}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function RoundStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View
      style={{
        backgroundColor: '#1e293b',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1e2a3f',
      }}
    >
      <Text style={{ color: '#f1f5f9', fontSize: 14.5, fontWeight: '600', flex: 1 }}>Körszám</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <TouchableOpacity
          onPress={() => onChange(Math.max(1, value - 1))}
          activeOpacity={0.7}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: '#0f172a',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#334155',
          }}
        >
          <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '600', lineHeight: 22 }}>−</Text>
        </TouchableOpacity>

        <Text
          style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: '700',
            minWidth: 48,
            textAlign: 'center',
            fontVariant: ['tabular-nums'],
          }}
        >
          {value}
        </Text>

        <TouchableOpacity
          onPress={() => onChange(Math.min(99, value + 1))}
          activeOpacity={0.7}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: '#f97316',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', lineHeight: 22 }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: '#64748b',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 10,
        marginTop: 20,
      }}
    >
      {children}
    </Text>
  );
}

export default function EditTimerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { mutate: save, isPending } = useSaveIntervalTimer();
  const preloadFactoryId = useIntervalTimerStore((s) => s.preloadFactoryId);
  const setPreloadFactoryId = useIntervalTimerStore((s) => s.setPreloadFactoryId);

  const preset = preloadFactoryId ? FACTORY_TIMERS.find((t) => t.id === preloadFactoryId) : null;

  const [name, setName] = useState(preset?.name ?? '');
  const [introSec, setIntroSec] = useState(preset?.intro_sec ?? 10);
  const [workSec, setWorkSec] = useState(preset?.work_sec ?? 30);
  const [restSec, setRestSec] = useState(preset?.rest_sec ?? 15);
  const [cooldownSec, setCooldownSec] = useState(preset?.cooldown_sec ?? 60);
  const [rounds, setRounds] = useState(preset?.rounds ?? 8);
  const [workColor, setWorkColor] = useState(preset?.work_color ?? '#f97316');
  const [restColor, setRestColor] = useState(preset?.rest_color ?? '#10b981');

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Hiányzó adat', 'Adj nevet az időzítőnek.');
      return;
    }
    if (workSec === 0) {
      Alert.alert('Hiányzó adat', 'A munka ideje nem lehet 0.');
      return;
    }
    if (!user) return;

    save(
      {
        user_id: user.id,
        name: name.trim(),
        intro_sec: introSec,
        work_sec: workSec,
        rest_sec: restSec,
        cooldown_sec: cooldownSec,
        rounds,
        work_color: workColor,
        rest_color: restColor,
      },
      {
        onSuccess: () => {
          setPreloadFactoryId(null);
          router.back();
        },
      }
    );
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
            ÚJ IDŐZÍTŐ
          </Text>
          <Text style={{ color: '#f1f5f9', fontSize: 22, fontWeight: '800', letterSpacing: -0.4 }}>
            Időzítő beállítása
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        >
          {/* Név */}
          <SectionLabel>Név</SectionLabel>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="pl. Reggeli swing kör"
            placeholderTextColor="#475569"
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#1e2a3f',
              color: '#f1f5f9',
              fontSize: 16,
              fontWeight: '600',
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          />

          {/* Fázisok */}
          <SectionLabel>Fázisok</SectionLabel>
          <Stepper
            label="Bevezetés"
            sub="Mindig sárga"
            value={introSec}
            color={INTRO_COLOR}
            onChange={setIntroSec}
          />
          <Stepper
            label="Munka"
            value={workSec}
            color={workColor}
            onChange={setWorkSec}
          />
          <Stepper
            label="Pihenő"
            value={restSec}
            color={restColor}
            onChange={setRestSec}
          />
          <Stepper
            label="Levezetés"
            sub="Mindig kék"
            value={cooldownSec}
            color={COOLDOWN_COLOR}
            onChange={setCooldownSec}
          />

          {/* Körök */}
          <SectionLabel>Körök (munka ↔ pihenő ismétlés)</SectionLabel>
          <RoundStepper value={rounds} onChange={setRounds} />

          {/* Munka színe */}
          <SectionLabel>Munka színe</SectionLabel>
          <ColorPicker value={workColor} onChange={setWorkColor} />

          {/* Pihenő színe */}
          <SectionLabel>Pihenő színe</SectionLabel>
          <ColorPicker value={restColor} onChange={setRestColor} />

          {/* Mentés gomb */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isPending}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: 'center',
              marginTop: 28,
              opacity: isPending ? 0.6 : 1,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 }}>
              {isPending ? 'Mentés...' : 'Mentés'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
