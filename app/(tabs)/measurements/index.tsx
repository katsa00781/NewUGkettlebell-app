import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLatestMeasurement, useUserMeasurements } from '@/hooks/useMeasurements';
import { useLatestFmsAssessment, useFmsAssessments } from '@/hooks/useFMS';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

type HistoryItem =
  | { type: 'testkompo'; id: string; date: string; weight: number; body_fat_pct: number | null }
  | { type: 'fms'; id: string; date: string; total_score: number };

export default function MeasurementsScreen() {
  const router = useRouter();
  const { data: latestMeasurement, isLoading: loadingMeasurement } = useLatestMeasurement();
  const { data: latestFms, isLoading: loadingFms } = useLatestFmsAssessment();
  const { data: allMeasurements } = useUserMeasurements();
  const { data: allFms } = useFmsAssessments();

  const fmsColor = latestFms
    ? latestFms.total_score >= 14
      ? '#10b981'
      : latestFms.total_score >= 11
      ? '#f59e0b'
      : '#ef4444'
    : '#94a3b8';

  const fmsLabel = latestFms
    ? latestFms.total_score >= 14
      ? 'JÓ'
      : latestFms.total_score >= 11
      ? 'KÖZEPES'
      : 'GYENGE'
    : '';

  const historyItems: HistoryItem[] = [
    ...(allMeasurements ?? []).map((m) => ({
      type: 'testkompo' as const,
      id: m.id,
      date: m.date,
      weight: m.weight,
      body_fat_pct: m.body_fat_pct ?? null,
    })),
    ...(allFms ?? []).map((f) => ({
      type: 'fms' as const,
      id: f.id,
      date: f.date,
      total_score: f.total_score,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-4 pt-4 pb-2">
        <Text
          className="text-slate-500 font-semibold mb-0.5"
          style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' }}
        >
          Áttekintés
        </Text>
        <Text className="text-white text-2xl font-bold" style={{ letterSpacing: -0.5 }}>
          Mérések
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-3" showsVerticalScrollIndicator={false}>

        {/* FMS kártya */}
        <View className="bg-slate-800 rounded-2xl mb-3" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
          <View className="flex-row items-center justify-between p-4 pb-3">
            <View className="flex-row items-center gap-2">
              <View
                className="w-8 h-8 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(249,115,22,0.14)' }}
              >
                <Ionicons name="bar-chart" size={16} color="#f97316" />
              </View>
              <Text className="text-white font-bold text-base">FMS felmérés</Text>
            </View>
            <Text className="text-slate-500 text-xs">
              {latestFms ? format(new Date(latestFms.date), 'MMM d.', { locale: hu }) : '–'}
            </Text>
          </View>

          <View className="px-4 pb-3">
            {loadingFms ? (
              <ActivityIndicator color="#f97316" size="small" />
            ) : latestFms ? (
              <View className="flex-row items-center justify-between">
                <Text style={{ color: '#f97316', fontSize: 34, fontWeight: '700', letterSpacing: -1 }}>
                  {latestFms.total_score}
                  <Text style={{ fontSize: 18, color: '#94a3b8', fontWeight: '600' }}>/21</Text>
                </Text>
                <View
                  className="rounded-full px-4 py-1.5"
                  style={{ borderWidth: 1.5, borderColor: fmsColor, backgroundColor: fmsColor + '20' }}
                >
                  <Text style={{ color: fmsColor, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
                    {fmsLabel}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center gap-2 py-1">
                <Ionicons name="add-circle-outline" size={18} color="#64748b" />
                <Text className="text-slate-400 text-sm">Még nincs FMS felmérés</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            className="mx-4 mb-4 rounded-xl py-3 items-center"
            style={{ backgroundColor: '#f97316' }}
            onPress={() => router.push('/(tabs)/measurements/fms')}
          >
            <Text className="text-white font-bold text-sm">Új felmérés</Text>
          </TouchableOpacity>
        </View>

        {/* Testkompo kártya */}
        <View className="bg-slate-800 rounded-2xl mb-3" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
          <View className="flex-row items-center justify-between p-4 pb-3">
            <View className="flex-row items-center gap-2">
              <View
                className="w-8 h-8 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(249,115,22,0.14)' }}
              >
                <Ionicons name="body" size={16} color="#f97316" />
              </View>
              <Text className="text-white font-bold text-base">Testkompo mérés</Text>
            </View>
            <Text className="text-slate-500 text-xs">
              {latestMeasurement ? format(new Date(latestMeasurement.date), 'MMM d.', { locale: hu }) : '–'}
            </Text>
          </View>

          <View className="px-4 pb-3">
            {loadingMeasurement ? (
              <ActivityIndicator color="#f97316" size="small" />
            ) : latestMeasurement ? (
              <View style={{ gap: 8 }}>
                <View className="flex-row justify-between">
                  <MetricItem label="Testsúly" value={`${latestMeasurement.weight}`} unit="kg" />
                  {latestMeasurement.body_fat_pct != null ? (
                    <MetricItem label="Testzsír" value={`${latestMeasurement.body_fat_pct}`} unit="%" />
                  ) : (
                    <View style={{ minWidth: '45%' }} />
                  )}
                </View>
                <View className="flex-row justify-between">
                  {latestMeasurement.muscle_mass_kg != null ? (
                    <MetricItem label="Izomtömeg" value={`${latestMeasurement.muscle_mass_kg}`} unit="kg" />
                  ) : (
                    <View style={{ minWidth: '45%' }} />
                  )}
                  {latestMeasurement.bmi != null ? (
                    <MetricItem label="BMI" value={`${latestMeasurement.bmi.toFixed(1)}`} unit="" />
                  ) : (
                    <View style={{ minWidth: '45%' }} />
                  )}
                </View>
              </View>
            ) : (
              <View className="flex-row items-center gap-2 py-1">
                <Ionicons name="add-circle-outline" size={18} color="#64748b" />
                <Text className="text-slate-400 text-sm">Még nincs testkomponens mérés</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            className="mx-4 mb-4 rounded-xl py-3 items-center"
            style={{ backgroundColor: '#f97316' }}
            onPress={() => router.push('/(tabs)/measurements/body')}
          >
            <Text className="text-white font-bold text-sm">Új mérés</Text>
          </TouchableOpacity>
        </View>

        {/* Előzmények */}
        {historyItems.length > 0 && (
          <>
            <Text
              className="text-slate-500 font-semibold mb-2 mt-1"
              style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' }}
            >
              Előzmények
            </Text>
            <View className="bg-slate-800 rounded-2xl" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
              {historyItems.map((item, index) => (
                <TouchableOpacity
                  key={`${item.type}-${item.id}`}
                  className="flex-row items-center px-4 py-3"
                  style={
                    index < historyItems.length - 1
                      ? { borderBottomWidth: 1, borderBottomColor: '#1e2a3f' }
                      : undefined
                  }
                  onPress={() =>
                    router.push(
                      item.type === 'fms'
                        ? '/(tabs)/measurements/fms'
                        : '/(tabs)/measurements/body'
                    )
                  }
                >
                  <View
                    className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: 'rgba(249,115,22,0.14)' }}
                  >
                    <Ionicons
                      name={item.type === 'fms' ? 'bar-chart' : 'body'}
                      size={16}
                      color="#f97316"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-sm">
                      {item.type === 'fms' ? 'FMS felmérés' : 'Testkompo'}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-0.5">
                      {format(new Date(item.date), 'MMM d.', { locale: hu })}
                    </Text>
                  </View>
                  <Text className="text-slate-300 text-sm mr-2">
                    {item.type === 'testkompo'
                      ? `${item.weight} kg${item.body_fat_pct != null ? ` · ${item.body_fat_pct}%` : ''}`
                      : `${item.total_score}/21`}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#475569" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricItem({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={{ minWidth: '45%' }}>
      <Text className="text-slate-400" style={{ fontSize: 12 }}>{label}</Text>
      <View className="flex-row items-baseline gap-0.5">
        <Text className="text-white font-bold" style={{ fontSize: 18 }}>{value}</Text>
        {unit ? <Text className="text-slate-500" style={{ fontSize: 11, fontWeight: '600' }}>{unit}</Text> : null}
      </View>
    </View>
  );
}
