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
        <View
          className="bg-slate-800 rounded-2xl mb-3"
          style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
        >
          <View className="flex-row items-center justify-between p-4 pb-3">
            <View className="flex-row items-center gap-2">
              <View
                className="w-8 h-8 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(249,115,22,0.14)' }}
              >
                <Ionicons name="bar-chart" size={16} color="#f97316" />
              </View>
              <Text className="text-white font-bold text-base">FMS Felmérés</Text>
            </View>
            <Text className="text-slate-500 text-xs">
              {latestFms
                ? format(new Date(latestFms.date), 'MMM d.', { locale: hu })
                : '–'}
            </Text>
          </View>

          <View className="px-4 pb-3">
            {loadingFms ? (
              <ActivityIndicator color="#f97316" size="small" />
            ) : latestFms ? (
              <View className="flex-row items-center gap-3">
                <View
                  className="rounded-xl px-5 py-2"
                  style={{ backgroundColor: 'rgba(249,115,22,0.14)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.35)' }}
                >
                  <Text style={{ color: fmsColor, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 }}>
                    {latestFms.total_score}
                    <Text style={{ fontSize: 15, color: '#94a3b8', fontWeight: '600' }}>/21</Text>
                  </Text>
                </View>
                <View>
                  <View
                    className="rounded-full px-3 py-1 mb-1"
                    style={{
                      borderWidth: 1,
                      borderColor: fmsColor,
                      backgroundColor: fmsColor + '20',
                    }}
                  >
                    <Text style={{ color: fmsColor, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                      {latestFms.total_score >= 14 ? 'JÓ' : latestFms.total_score >= 11 ? 'KÖZEPES' : 'GYENGE'}
                    </Text>
                  </View>
                  <Text className="text-slate-400 text-xs">
                    {latestFms.total_score >= 14
                      ? 'Megfelelő mozgáskontroll'
                      : latestFms.total_score >= 11
                      ? 'Enyhe diszfunkció'
                      : 'Mozgásdiszfunkció'}
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
        <View
          className="bg-slate-800 rounded-2xl mb-3"
          style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
        >
          <View className="flex-row items-center justify-between p-4 pb-3">
            <View className="flex-row items-center gap-2">
              <View
                className="w-8 h-8 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(249,115,22,0.14)' }}
              >
                <Ionicons name="body" size={16} color="#f97316" />
              </View>
              <Text className="text-white font-bold text-base">Testkomponens</Text>
            </View>
            <Text className="text-slate-500 text-xs">
              {latestMeasurement
                ? format(new Date(latestMeasurement.date), 'MMM d.', { locale: hu })
                : '–'}
            </Text>
          </View>

          <View className="px-4 pb-3">
            {loadingMeasurement ? (
              <ActivityIndicator color="#f97316" size="small" />
            ) : latestMeasurement ? (
              <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                <MetricRow label="Testsúly" value={`${latestMeasurement.weight}`} unit="kg" />
                {latestMeasurement.body_fat_pct != null && (
                  <MetricRow label="Testzsír" value={`${latestMeasurement.body_fat_pct}`} unit="%" />
                )}
                {latestMeasurement.muscle_mass_kg != null && (
                  <MetricRow label="Izomtömeg" value={`${latestMeasurement.muscle_mass_kg}`} unit="kg" />
                )}
                {latestMeasurement.bmi != null && (
                  <MetricRow label="BMI" value={`${latestMeasurement.bmi.toFixed(1)}`} unit="" />
                )}
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

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricRow({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={{ width: '47%' }}>
      <Text className="text-slate-400" style={{ fontSize: 12 }}>{label}</Text>
      <View className="flex-row items-baseline gap-0.5">
        <Text className="text-white font-bold" style={{ fontSize: 16 }}>{value}</Text>
        {unit ? <Text className="text-slate-500" style={{ fontSize: 11, fontWeight: '600' }}>{unit}</Text> : null}
      </View>
    </View>
  );
}
