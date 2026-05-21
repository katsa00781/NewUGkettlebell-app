import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLatestMeasurement } from '@/hooks/useMeasurements';
import { useLatestFmsAssessment } from '@/hooks/useFMS';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

export default function MeasurementsScreen() {
  const router = useRouter();
  const { data: latestMeasurement, isLoading: loadingMeasurement } = useLatestMeasurement();
  const { data: latestFms, isLoading: loadingFms } = useLatestFmsAssessment();

  const fmsColor = latestFms
    ? latestFms.total_score >= 14
      ? '#10b981'
      : latestFms.total_score >= 11
      ? '#f59e0b'
      : '#ef4444'
    : '#94a3b8';

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold">Mérések</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>

        {/* Testkompo kártya */}
        <TouchableOpacity
          className="bg-slate-800 rounded-2xl p-4 mb-3"
          onPress={() => router.push('/(tabs)/measurements/body')}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="body" size={20} color="#f97316" />
              <Text className="text-white font-bold text-base">Testkomponens</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#64748b" />
          </View>

          {loadingMeasurement ? (
            <ActivityIndicator color="#f97316" size="small" />
          ) : latestMeasurement ? (
            <>
              <Text className="text-slate-400 text-xs mb-2">
                Utolsó mérés: {format(new Date(latestMeasurement.date), 'yyyy. MMM d.', { locale: hu })}
              </Text>
              <View className="flex-row flex-wrap gap-3">
                <MetricChip label="Testsúly" value={`${latestMeasurement.weight} kg`} />
                {latestMeasurement.body_fat_pct != null && (
                  <MetricChip label="Testzsír" value={`${latestMeasurement.body_fat_pct}%`} />
                )}
                {latestMeasurement.muscle_mass_kg != null && (
                  <MetricChip label="Izom" value={`${latestMeasurement.muscle_mass_kg} kg`} />
                )}
                {latestMeasurement.bmi != null && (
                  <MetricChip label="BMI" value={`${latestMeasurement.bmi.toFixed(1)}`} />
                )}
              </View>
            </>
          ) : (
            <View className="flex-row items-center gap-2 py-2">
              <Ionicons name="add-circle-outline" size={18} color="#64748b" />
              <Text className="text-slate-400 text-sm">Még nincs testkomponens mérés</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* FMS kártya */}
        <TouchableOpacity
          className="bg-slate-800 rounded-2xl p-4 mb-3"
          onPress={() => router.push('/(tabs)/measurements/fms')}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="bar-chart" size={20} color="#f97316" />
              <Text className="text-white font-bold text-base">FMS Felmérés</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#64748b" />
          </View>

          {loadingFms ? (
            <ActivityIndicator color="#f97316" size="small" />
          ) : latestFms ? (
            <>
              <Text className="text-slate-400 text-xs mb-2">
                Utolsó felmérés: {format(new Date(latestFms.date), 'yyyy. MMM d.', { locale: hu })}
              </Text>
              <View className="flex-row items-center gap-3">
                <View className="bg-slate-700 rounded-xl px-4 py-2">
                  <Text style={{ color: fmsColor }} className="text-2xl font-bold">
                    {latestFms.total_score}/21
                  </Text>
                </View>
                <Text className="text-slate-400 text-sm">
                  {latestFms.total_score >= 14
                    ? 'Megfelelő mozgáskontroll'
                    : latestFms.total_score >= 11
                    ? 'Enyhe diszfunkció'
                    : 'Mozgásdiszfunkció'}
                </Text>
              </View>
            </>
          ) : (
            <View className="flex-row items-center gap-2 py-2">
              <Ionicons name="add-circle-outline" size={18} color="#64748b" />
              <Text className="text-slate-400 text-sm">Még nincs FMS felmérés</Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-slate-700 rounded-lg px-3 py-1.5">
      <Text className="text-slate-400 text-xs">{label}</Text>
      <Text className="text-white font-semibold text-sm">{value}</Text>
    </View>
  );
}
