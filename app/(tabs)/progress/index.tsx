import { useState, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { subMonths, parseISO, isAfter } from 'date-fns';
import { useUserMeasurements } from '@/hooks/useMeasurements';
import { useFmsAssessments } from '@/hooks/useFMS';
import type { UserMeasurement } from '@/types/supabase';
import type { FmsAssessment } from '@/types/supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 48;

type Period = '1m' | '3m' | '6m' | 'all';

const PERIODS: { key: Period; label: string }[] = [
  { key: '1m', label: '1 hó' },
  { key: '3m', label: '3 hó' },
  { key: '6m', label: '6 hó' },
  { key: 'all', label: 'Összes' },
];

function filterByPeriod<T extends { date: string }>(items: T[], period: Period): T[] {
  if (period === 'all') return items;
  const months = period === '1m' ? 1 : period === '3m' ? 3 : 6;
  const cutoff = subMonths(new Date(), months);
  return items.filter((item) => isAfter(parseISO(item.date), cutoff));
}

function PeriodSelector({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <View className="flex-row gap-2 mb-4">
      {PERIODS.map((p) => (
        <TouchableOpacity
          key={p.key}
          className="py-2 px-4 rounded-full"
          style={{
            backgroundColor: value === p.key ? '#f97316' : '#1e293b',
            borderWidth: 1,
            borderColor: value === p.key ? '#f97316' : '#1e2a3f',
          }}
          onPress={() => onChange(p.key)}
        >
          <Text
            className="font-bold"
            style={{ fontSize: 12.5, color: value === p.key ? '#fff' : '#94a3b8' }}
          >
            {p.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

type DeltaCardProps = {
  label: string;
  first: number | null;
  last: number | null;
  unit: string;
  lowerIsBetter?: boolean;
};

function DeltaCard({ label, first, last, unit, lowerIsBetter = false }: DeltaCardProps) {
  if (first == null || last == null) return null;
  const delta = parseFloat((last - first).toFixed(1));
  const improved = lowerIsBetter ? delta < 0 : delta > 0;
  const neutral = delta === 0;
  const color = neutral ? '#94a3b8' : improved ? '#10b981' : '#ef4444';
  const sign = delta > 0 ? '+' : '';

  return (
    <View
      className="bg-slate-800 rounded-2xl p-4 flex-1 mx-1"
      style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
    >
      <Text className="text-slate-500 font-semibold mb-1" style={{ fontSize: 11 }}>{label}</Text>
      <Text className="text-white font-bold" style={{ fontSize: 18, letterSpacing: -0.3 }}>
        {last}{unit}
      </Text>
      <Text style={{ color, fontSize: 11, fontWeight: '700' }} className="mt-1">
        {sign}{delta}{unit}
      </Text>
    </View>
  );
}

type SectionProps = { title: string; children: React.ReactNode };

function Section({ title, children }: SectionProps) {
  return (
    <View className="mb-6">
      <Text
        className="text-slate-500 font-bold mb-3"
        style={{ fontSize: 11.5, letterSpacing: 1.2, textTransform: 'uppercase' }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View
      className="bg-slate-800 rounded-2xl p-6 items-center"
      style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
    >
      <Text className="text-slate-400 text-sm">{message}</Text>
    </View>
  );
}

function buildLineData(items: UserMeasurement[], field: keyof UserMeasurement) {
  return items
    .filter((m) => m[field] != null)
    .map((m) => ({ value: m[field] as number }));
}

function buildFmsBarData(items: FmsAssessment[]) {
  return items.map((a) => ({
    value: a.total_score,
    frontColor: a.total_score >= 14 ? '#10b981' : a.total_score >= 11 ? '#f59e0b' : '#ef4444',
  }));
}

const LINE_CONFIG = {
  color: '#f97316',
  thickness: 2,
  hideDataPoints: false,
  dataPointsColor: '#f97316',
  dataPointsRadius: 4,
};

export default function ProgressScreen() {
  const [period, setPeriod] = useState<Period>('3m');
  const { data: allMeasurements, isLoading: loadingM } = useUserMeasurements();
  const { data: allFms, isLoading: loadingF } = useFmsAssessments();

  const measurements = useMemo(
    () => filterByPeriod(allMeasurements ?? [], period).slice().reverse(),
    [allMeasurements, period],
  );

  const fmsData = useMemo(
    () => filterByPeriod(allFms ?? [], period).slice().reverse(),
    [allFms, period],
  );

  const isLoading = loadingM || loadingF;

  const firstM = measurements[0] ?? null;
  const lastM = measurements[measurements.length - 1] ?? null;
  const firstFms = fmsData[0] ?? null;
  const lastFms = fmsData[fmsData.length - 1] ?? null;

  const weightData = buildLineData(measurements, 'weight');
  const fatData = buildLineData(measurements, 'body_fat_pct');
  const muscleData = buildLineData(measurements, 'muscle_mass_kg');
  const fmsBarData = buildFmsBarData(fmsData);

  const hasDelta = measurements.length >= 2;
  const hasFmsDelta = fmsData.length >= 2;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#f97316" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <Text
          className="text-slate-500 font-semibold mb-0.5"
          style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' }}
        >
          Időszak
        </Text>
        <Text className="text-white font-bold mb-4" style={{ fontSize: 26, letterSpacing: -0.5 }}>
          Fejlődés
        </Text>

        <PeriodSelector value={period} onChange={setPeriod} />

        {/* Delta összefoglaló */}
        {(hasDelta || hasFmsDelta) && (
          <Section title="Változás">
            <View className="flex-row mb-2">
              <DeltaCard label="Testsúly" first={firstM?.weight ?? null} last={lastM?.weight ?? null} unit=" kg" lowerIsBetter={false} />
              <DeltaCard label="Testzsír" first={firstM?.body_fat_pct ?? null} last={lastM?.body_fat_pct ?? null} unit="%" lowerIsBetter={true} />
            </View>
            <View className="flex-row">
              <DeltaCard label="Izomtömeg" first={firstM?.muscle_mass_kg ?? null} last={lastM?.muscle_mass_kg ?? null} unit=" kg" lowerIsBetter={false} />
              <DeltaCard label="FMS pontszám" first={firstFms?.total_score ?? null} last={lastFms?.total_score ?? null} unit="/21" lowerIsBetter={false} />
            </View>
          </Section>
        )}

        {/* Testsúly grafikon */}
        <Section title="Testsúly (kg)">
          {weightData.length < 2 ? (
            <EmptyState message="Legalább 2 mérés kell a grafikonhoz" />
          ) : (
            <View className="bg-slate-800 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
              <LineChart
                data={weightData}
                width={CHART_WIDTH - 32}
                height={160}
                {...LINE_CONFIG}
                yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                backgroundColor="transparent"
                rulesColor="#1e293b"
                yAxisColor="#1e293b"
                xAxisColor="#1e293b"
                noOfSections={4}
                adjustToWidth
              />
            </View>
          )}
        </Section>

        {/* Testzsír % grafikon */}
        <Section title="Testzsír (%)">
          {fatData.length < 2 ? (
            <EmptyState message="Legalább 2 mérés kell a grafikonhoz" />
          ) : (
            <View className="bg-slate-800 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
              <LineChart
                data={fatData}
                width={CHART_WIDTH - 32}
                height={160}
                color="#3b82f6"
                thickness={2}
                hideDataPoints={false}
                dataPointsColor="#3b82f6"
                dataPointsRadius={4}
                yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                backgroundColor="transparent"
                rulesColor="#1e293b"
                yAxisColor="#1e293b"
                xAxisColor="#1e293b"
                noOfSections={4}
                adjustToWidth
              />
            </View>
          )}
        </Section>

        {/* Izomtömeg grafikon */}
        <Section title="Izomtömeg (kg)">
          {muscleData.length < 2 ? (
            <EmptyState message="Legalább 2 mérés kell a grafikonhoz" />
          ) : (
            <View className="bg-slate-800 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
              <LineChart
                data={muscleData}
                width={CHART_WIDTH - 32}
                height={160}
                color="#10b981"
                thickness={2}
                hideDataPoints={false}
                dataPointsColor="#10b981"
                dataPointsRadius={4}
                yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                backgroundColor="transparent"
                rulesColor="#1e293b"
                yAxisColor="#1e293b"
                xAxisColor="#1e293b"
                noOfSections={4}
                adjustToWidth
              />
            </View>
          )}
        </Section>

        {/* FMS pontszám grafikon */}
        <Section title="FMS pontszám (/21)">
          {fmsBarData.length === 0 ? (
            <EmptyState message="Még nincs FMS felmérés ebben az időszakban" />
          ) : (
            <View className="bg-slate-800 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
              <BarChart
                data={fmsBarData}
                width={CHART_WIDTH - 32}
                height={160}
                barWidth={fmsBarData.length > 8 ? 16 : 24}
                barBorderRadius={4}
                yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#94a3b8', fontSize: 10 }}
                backgroundColor="transparent"
                rulesColor="#1e293b"
                yAxisColor="#1e293b"
                xAxisColor="#1e293b"
                noOfSections={3}
                maxValue={21}
                yAxisLabelTexts={['0', '7', '14', '21']}
              />
            </View>
          )}
        </Section>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
