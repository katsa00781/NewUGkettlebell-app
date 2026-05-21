import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFmsAssessments, useSaveFmsAssessment } from '@/hooks/useFMS';
import { FMS_MOVEMENTS } from '@/lib/fms';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

type FmsScores = {
  deep_squat: number;
  hurdle_step: number;
  inline_lunge: number;
  shoulder_mobility: number;
  active_straight_leg_raise: number;
  trunk_stability_pushup: number;
  rotary_stability: number;
};

const INITIAL_SCORES: FmsScores = {
  deep_squat: 0,
  hurdle_step: 0,
  inline_lunge: 0,
  shoulder_mobility: 0,
  active_straight_leg_raise: 0,
  trunk_stability_pushup: 0,
  rotary_stability: 0,
};

function ScoreButton({ value, selected, onPress }: { value: number; selected: boolean; onPress: () => void }) {
  const colors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  return (
    <TouchableOpacity
      className={`w-12 h-12 rounded-xl items-center justify-center ${selected ? colors[value] : 'bg-slate-700'}`}
      onPress={onPress}
    >
      <Text className={`text-lg font-bold ${selected ? 'text-white' : 'text-slate-400'}`}>{value}</Text>
    </TouchableOpacity>
  );
}

export default function FmsScreen() {
  const router = useRouter();
  const { data: assessments, isLoading } = useFmsAssessments();
  const saveAssessment = useSaveFmsAssessment();
  const [scores, setScores] = useState<FmsScores>(INITIAL_SCORES);
  const [showForm, setShowForm] = useState(false);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  async function handleSave() {
    await saveAssessment.mutateAsync({
      ...scores,
      date: new Date().toISOString(),
    });
    setScores(INITIAL_SCORES);
    setShowForm(false);
  }

  const totalColor = total >= 14 ? '#10b981' : total >= 11 ? '#f59e0b' : '#ef4444';

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#f97316" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">FMS Felmérés</Text>
        <TouchableOpacity
          className="bg-orange-500 rounded-xl px-4 py-2"
          onPress={() => setShowForm(!showForm)}
        >
          <Text className="text-white font-semibold text-sm">+ Új</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {showForm && (
          <View className="bg-slate-800 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-orange-500 font-bold text-sm">Új felmérés</Text>
              <View className="bg-slate-700 rounded-xl px-4 py-2">
                <Text style={{ color: totalColor }} className="text-xl font-bold">{total}/21</Text>
              </View>
            </View>

            {FMS_MOVEMENTS.map((movement) => (
              <View key={movement.key} className="mb-4">
                <Text className="text-slate-300 text-sm mb-2">{movement.label}</Text>
                <View className="flex-row gap-2">
                  {[0, 1, 2, 3].map((v) => (
                    <ScoreButton
                      key={v}
                      value={v}
                      selected={scores[movement.key as keyof FmsScores] === v}
                      onPress={() => setScores((prev) => ({ ...prev, [movement.key]: v }))}
                    />
                  ))}
                </View>
              </View>
            ))}

            <TouchableOpacity
              className="bg-orange-500 rounded-xl py-3 items-center mt-2"
              onPress={handleSave}
              disabled={saveAssessment.isPending}
            >
              {saveAssessment.isPending
                ? <ActivityIndicator size="small" color="white" />
                : <Text className="text-white font-semibold">Mentés ({total}/21)</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        <Text className="text-white font-bold text-base mb-3">Előző felmérések</Text>
        {isLoading ? (
          <ActivityIndicator color="#f97316" />
        ) : !assessments || assessments.length === 0 ? (
          <View className="bg-slate-800 rounded-2xl p-6 items-center">
            <Ionicons name="bar-chart-outline" size={48} color="#334155" />
            <Text className="text-slate-400 mt-3 text-sm">Még nincs FMS felmérés</Text>
          </View>
        ) : (
          assessments.map((a) => {
            const color = a.total_score >= 14 ? '#10b981' : a.total_score >= 11 ? '#f59e0b' : '#ef4444';
            return (
              <View key={a.id} className="bg-slate-800 rounded-2xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-slate-400 text-sm">
                    {format(new Date(a.date), 'yyyy. MMM d.', { locale: hu })}
                  </Text>
                  <Text style={{ color }} className="text-2xl font-bold">{a.total_score}/21</Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {FMS_MOVEMENTS.map((m) => (
                    <View key={m.key} className="bg-slate-700 rounded-lg px-2 py-1">
                      <Text className="text-slate-300 text-xs">
                        {m.label.split(' ')[0]}: {a[m.key as keyof typeof a]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
