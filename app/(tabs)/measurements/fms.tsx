import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFmsAssessments, useSaveFmsAssessment, useDeleteFmsAssessment } from '@/hooks/useFMS';
import { FMS_MOVEMENTS } from '@/lib/fms';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

const SCORE_CONFIG = [
  { label: 'Fájdalom', bgClass: 'bg-red-600', color: '#dc2626' },
  { label: 'Képtelen', bgClass: 'bg-red-900', color: '#7f1d1d' },
  { label: 'Kompenzáció', bgClass: 'bg-amber-500', color: '#f59e0b' },
  { label: 'Tiszta', bgClass: 'bg-green-500', color: '#10b981' },
] as const;

type BiScore = { left: number; right: number };

type FmsScores = {
  deep_squat: number;
  hurdle_step: BiScore;
  inline_lunge: BiScore;
  shoulder_mobility: BiScore;
  active_straight_leg_raise: BiScore;
  trunk_stability_pushup: number;
  rotary_stability: BiScore;
};

type ClearingTests = {
  sm_clearing: boolean;
  tspu_clearing: boolean;
  rs_clearing: boolean;
};

const INITIAL_SCORES: FmsScores = {
  deep_squat: 0,
  hurdle_step: { left: 0, right: 0 },
  inline_lunge: { left: 0, right: 0 },
  shoulder_mobility: { left: 0, right: 0 },
  active_straight_leg_raise: { left: 0, right: 0 },
  trunk_stability_pushup: 0,
  rotary_stability: { left: 0, right: 0 },
};

const INITIAL_CLEARING: ClearingTests = {
  sm_clearing: false,
  tspu_clearing: false,
  rs_clearing: false,
};

// Mely mozgáshoz melyik clearing teszt tartozik
const CLEARING_MAP: Partial<Record<keyof FmsScores, keyof ClearingTests>> = {
  shoulder_mobility: 'sm_clearing',
  trunk_stability_pushup: 'tspu_clearing',
  rotary_stability: 'rs_clearing',
};

function effectiveScore(s: number | BiScore, clearingPositive: boolean): number {
  if (clearingPositive) return 0;
  if (typeof s === 'number') return s;
  return Math.min(s.left, s.right);
}

function calcTotal(scores: FmsScores, clearing: ClearingTests): number {
  return FMS_MOVEMENTS.reduce((sum, m) => {
    const key = m.key as keyof FmsScores;
    const clearingKey = CLEARING_MAP[key];
    const clearingPositive = clearingKey ? clearing[clearingKey] : false;
    return sum + effectiveScore(scores[key] as number | BiScore, clearingPositive);
  }, 0);
}

function getQuality(total: number): { label: string; color: string } {
  if (total >= 14) return { label: 'JÓ', color: '#10b981' };
  if (total >= 11) return { label: 'KÖZEPES', color: '#f59e0b' };
  return { label: 'GYENGE', color: '#ef4444' };
}

function ScoreBtn({
  value,
  selected,
  disabled,
  onPress,
}: {
  value: number;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const cfg = SCORE_CONFIG[value];
  return (
    <TouchableOpacity
      className={`w-11 h-11 rounded-xl items-center justify-center ${
        disabled ? 'bg-slate-800 opacity-40' : selected ? cfg.bgClass : 'bg-slate-700'
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={`text-base font-bold ${selected && !disabled ? 'text-white' : 'text-slate-500'}`}>
        {value}
      </Text>
    </TouchableOpacity>
  );
}

function ClearingToggle({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      className={`flex-row items-center gap-2 rounded-xl px-3 py-2 mt-3 ${
        active ? 'bg-red-600' : 'bg-slate-700'
      }`}
      onPress={onToggle}
    >
      <Ionicons
        name={active ? 'warning' : 'warning-outline'}
        size={16}
        color={active ? 'white' : '#94a3b8'}
      />
      <Text className={`text-xs font-semibold flex-1 ${active ? 'text-white' : 'text-slate-400'}`}>
        Fájdalom teszt: {label}
      </Text>
      <View
        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
          active ? 'border-white bg-white' : 'border-slate-500'
        }`}
      >
        {active && <View className="w-2.5 h-2.5 rounded-full bg-red-600" />}
      </View>
    </TouchableOpacity>
  );
}

export default function FmsScreen() {
  const router = useRouter();
  const { assessmentId } = useLocalSearchParams<{ assessmentId?: string }>();
  const { data: assessments, isLoading } = useFmsAssessments();
  const saveAssessment = useSaveFmsAssessment();
  const deleteAssessment = useDeleteFmsAssessment();
  const [scores, setScores] = useState<FmsScores>(INITIAL_SCORES);
  const [clearing, setClearing] = useState<ClearingTests>(INITIAL_CLEARING);
  const [showHistory, setShowHistory] = useState(false);

  const selectedAssessment = assessmentId
    ? assessments?.find((a) => a.id === assessmentId) ?? null
    : null;

  const total = calcTotal(scores, clearing);
  const quality = getQuality(total);

  function setUni(key: keyof FmsScores, v: number) {
    setScores((prev) => ({ ...prev, [key]: v }));
  }

  function setBi(key: keyof FmsScores, side: 'left' | 'right', v: number) {
    setScores((prev) => {
      const cur = prev[key] as BiScore;
      return { ...prev, [key]: { ...cur, [side]: v } };
    });
  }

  function toggleClearing(key: keyof ClearingTests) {
    setClearing((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    const clearingKey = (key: keyof FmsScores) => {
      const ck = CLEARING_MAP[key];
      return ck ? clearing[ck] : false;
    };

    await saveAssessment.mutateAsync({
      deep_squat: effectiveScore(scores.deep_squat, clearingKey('deep_squat')),
      hurdle_step: effectiveScore(scores.hurdle_step, clearingKey('hurdle_step')),
      inline_lunge: effectiveScore(scores.inline_lunge, clearingKey('inline_lunge')),
      shoulder_mobility: effectiveScore(scores.shoulder_mobility, clearingKey('shoulder_mobility')),
      sm_clearing: clearing.sm_clearing,
      active_straight_leg_raise: effectiveScore(scores.active_straight_leg_raise, clearingKey('active_straight_leg_raise')),
      trunk_stability_pushup: effectiveScore(scores.trunk_stability_pushup, clearingKey('trunk_stability_pushup')),
      tspu_clearing: clearing.tspu_clearing,
      rotary_stability: effectiveScore(scores.rotary_stability, clearingKey('rotary_stability')),
      rs_clearing: clearing.rs_clearing,
      date: new Date().toISOString(),
    });
    setScores(INITIAL_SCORES);
    setClearing(INITIAL_CLEARING);
  }

  if (selectedAssessment) {
    return <FmsDetailView assessment={selectedAssessment} onBack={() => router.back()} onDelete={(id) => { deleteAssessment.mutate(id); router.back(); }} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#f97316" />
        </TouchableOpacity>
        <View>
          <Text className="text-orange-500 text-xs font-semibold tracking-widest uppercase">
            Új felmérés
          </Text>
          <Text className="text-white text-2xl font-bold">FMS felmérés</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Live score card */}
        <View className="bg-slate-800 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                Élő pontszám
              </Text>
              <Text className="text-slate-500 text-xs mt-0.5">7 teszt · max. 21 pont</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Text className="text-white text-3xl font-bold">
                {total}
                <Text className="text-slate-500 text-lg font-normal"> / 21</Text>
              </Text>
              <View
                style={{
                  backgroundColor: quality.color,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                  {quality.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Score legend */}
          <View className="flex-row gap-2">
            {SCORE_CONFIG.map((cfg, i) => (
              <View key={i} className={`flex-1 ${cfg.bgClass} rounded-lg py-2 items-center`}>
                <Text className="text-white text-sm font-bold">{i}</Text>
                <Text className="text-white text-xs" style={{ opacity: 0.85 }}>
                  {cfg.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Movement cards */}
        {FMS_MOVEMENTS.map((movement, index) => {
          const key = movement.key as keyof FmsScores;
          const score = scores[key];
          const clearingKey = CLEARING_MAP[key];
          const clearingPositive = clearingKey ? clearing[clearingKey] : false;
          const eff = effectiveScore(score as number | BiScore, clearingPositive);
          const scoreCfg = SCORE_CONFIG[eff];

          return (
            <View key={movement.key} className="bg-slate-800 rounded-2xl p-4 mb-3">
              {/* Movement header */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-row flex-1 mr-3">
                  <Text className="text-slate-500 text-sm font-bold mr-2 mt-0.5">
                    {index + 1}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-white text-base font-bold">{movement.label}</Text>
                    <Text className="text-slate-500 text-xs">{movement.englishLabel}</Text>
                    <Text className="text-slate-400 text-xs mt-1">{movement.description}</Text>
                  </View>
                </View>
                {/* Score badge */}
                <View
                  style={{
                    backgroundColor: scoreCfg.color,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    alignItems: 'center',
                    minWidth: 52,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{eff}</Text>
                  <Text style={{ color: 'white', fontSize: 10, opacity: 0.85 }}>
                    {movement.bilateral ? 'MIN' : 'PONT'}
                  </Text>
                </View>
              </View>

              {/* Score buttons */}
              {movement.bilateral ? (
                <>
                  <View className="flex-row items-center gap-2 mb-2">
                    <Text className="text-slate-400 text-xs font-semibold w-9">BAL</Text>
                    {([0, 1, 2, 3] as const).map((v) => (
                      <ScoreBtn
                        key={v}
                        value={v}
                        selected={(score as BiScore).left === v}
                        disabled={clearingPositive}
                        onPress={() => setBi(key, 'left', v)}
                      />
                    ))}
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-slate-400 text-xs font-semibold w-9">JOBB</Text>
                    {([0, 1, 2, 3] as const).map((v) => (
                      <ScoreBtn
                        key={v}
                        value={v}
                        selected={(score as BiScore).right === v}
                        disabled={clearingPositive}
                        onPress={() => setBi(key, 'right', v)}
                      />
                    ))}
                  </View>
                </>
              ) : (
                <View className="flex-row gap-2">
                  {([0, 1, 2, 3] as const).map((v) => (
                    <ScoreBtn
                      key={v}
                      value={v}
                      selected={(score as number) === v}
                      disabled={clearingPositive}
                      onPress={() => setUni(key, v)}
                    />
                  ))}
                </View>
              )}

              {/* Clearing test (csak az érintett mozgásoknál) */}
              {clearingKey && (
                <ClearingToggle
                  label={clearingPositive ? 'Fájdalom – pontszám 0' : 'Nincs fájdalom'}
                  active={clearingPositive}
                  onToggle={() => toggleClearing(clearingKey)}
                />
              )}
            </View>
          );
        })}

        {/* Save button */}
        <TouchableOpacity
          className="bg-orange-500 rounded-xl py-4 items-center mb-5"
          onPress={handleSave}
          disabled={saveAssessment.isPending}
        >
          {saveAssessment.isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Mentés · {total}/21</Text>
          )}
        </TouchableOpacity>

        {/* History toggle */}
        <TouchableOpacity
          className="flex-row items-center justify-between mb-3"
          onPress={() => setShowHistory(!showHistory)}
        >
          <Text className="text-white font-bold text-base">Előző felmérések</Text>
          <Ionicons
            name={showHistory ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#94a3b8"
          />
        </TouchableOpacity>

        {showHistory &&
          (isLoading ? (
            <ActivityIndicator color="#f97316" />
          ) : !assessments?.length ? (
            <View className="bg-slate-800 rounded-2xl p-6 items-center">
              <Ionicons name="bar-chart-outline" size={48} color="#334155" />
              <Text className="text-slate-400 mt-3 text-sm">Még nincs FMS felmérés</Text>
            </View>
          ) : (
            assessments.map((a) => {
              const c =
                a.total_score >= 14
                  ? '#10b981'
                  : a.total_score >= 11
                    ? '#f59e0b'
                    : '#ef4444';
              return (
                <View key={a.id} className="bg-slate-800 rounded-2xl p-4 mb-3">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-slate-400 text-sm">
                      {format(new Date(a.date), 'yyyy. MMM d.', { locale: hu })}
                    </Text>
                    <View className="flex-row items-center gap-3">
                      <Text style={{ color: c }} className="text-2xl font-bold">
                        {a.total_score}/21
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert('Törlés', 'Biztosan törlöd ezt a felmérést?', [
                            { text: 'Mégsem', style: 'cancel' },
                            {
                              text: 'Törlés',
                              style: 'destructive',
                              onPress: () => deleteAssessment.mutate(a.id),
                            },
                          ])
                        }
                        className="p-1"
                      >
                        <Ionicons name="trash-outline" size={18} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {FMS_MOVEMENTS.map((m) => (
                      <View key={m.key} className="bg-slate-700 rounded-lg px-2 py-1">
                        <Text className="text-slate-300 text-xs">
                          {m.label.split(' ')[0]}: {String(a[m.key as keyof typeof a])}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })
          ))}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function FmsDetailView({
  assessment: a,
  onBack,
  onDelete,
}: {
  assessment: ReturnType<typeof useFmsAssessments>['data'] extends (infer T)[] | undefined ? T : never;
  onBack: () => void;
  onDelete: (id: string) => void;
}) {
  const c =
    a.total_score >= 14 ? '#10b981' : a.total_score >= 11 ? '#f59e0b' : '#ef4444';
  const qualityLabel =
    a.total_score >= 14 ? 'JÓ' : a.total_score >= 11 ? 'KÖZEPES' : 'GYENGE';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <TouchableOpacity onPress={onBack} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#f97316" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-orange-500 text-xs font-semibold tracking-widest uppercase">
            {format(new Date(a.date), 'yyyy. MMM d.', { locale: hu })}
          </Text>
          <Text className="text-white text-2xl font-bold">FMS felmérés</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Törlés', 'Biztosan törlöd ezt a felmérést?', [
              { text: 'Mégsem', style: 'cancel' },
              { text: 'Törlés', style: 'destructive', onPress: () => onDelete(a.id) },
            ])
          }
          className="p-2"
        >
          <Ionicons name="trash-outline" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Összpontszám */}
        <View className="bg-slate-800 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                Összpontszám
              </Text>
              <Text className="text-slate-500 text-xs mt-0.5">7 teszt · max. 21 pont</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Text className="text-white text-3xl font-bold">
                {a.total_score}
                <Text className="text-slate-500 text-lg font-normal"> / 21</Text>
              </Text>
              <View style={{ backgroundColor: c, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{qualityLabel}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mozgások */}
        {FMS_MOVEMENTS.map((movement, index) => {
          const score = a[movement.key as keyof typeof a] as number;
          const scoreCfg = SCORE_CONFIG[score] ?? SCORE_CONFIG[0];
          return (
            <View key={movement.key} className="bg-slate-800 rounded-2xl p-4 mb-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-row flex-1 mr-3">
                  <Text className="text-slate-500 text-sm font-bold mr-2 mt-0.5">{index + 1}</Text>
                  <View className="flex-1">
                    <Text className="text-white text-base font-bold">{movement.label}</Text>
                    <Text className="text-slate-500 text-xs">{movement.englishLabel}</Text>
                    <Text className="text-slate-400 text-xs mt-1">{movement.description}</Text>
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: scoreCfg.color,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    alignItems: 'center',
                    minWidth: 52,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{score}</Text>
                  <Text style={{ color: 'white', fontSize: 10, opacity: 0.85 }}>
                    {movement.bilateral ? 'MIN' : 'PONT'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
