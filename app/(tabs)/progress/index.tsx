import { useState, useMemo } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { subMonths, subYears, parseISO, isAfter, format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useUserMeasurements } from '@/hooks/useMeasurements';
import { useFmsAssessments } from '@/hooks/useFMS';
import type { UserMeasurement, FmsAssessment } from '@/types/supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 48;

// Y-tengely ~38px, initialSpacing=10, endSpacing=20 – ebből számoljuk a pontonkénti távolságot
function chartSpacing(dataLen: number, width: number): number {
  if (dataLen <= 1) return 40;
  const available = width - 38 - 10 - 20; // yAxis + initialSpacing + endSpacing
  return Math.max(15, Math.floor(available / (dataLen - 1)));
}

type Period = '1m' | '3m' | '6m' | '1y';
type Metric = 'weight' | 'fat' | 'fms';

const PERIODS: { key: Period; label: string }[] = [
  { key: '1m', label: '1 hó' },
  { key: '3m', label: '3 hó' },
  { key: '6m', label: '6 hó' },
  { key: '1y', label: '1 év' },
];

const METRICS: { key: Metric; label: string }[] = [
  { key: 'weight', label: 'Testsúly' },
  { key: 'fat', label: 'Testzsír' },
  { key: 'fms', label: 'FMS' },
];

function filterByPeriod<T extends { date: string }>(items: T[], period: Period): T[] {
  const now = new Date();
  const cutoff =
    period === '1m' ? subMonths(now, 1)
    : period === '3m' ? subMonths(now, 3)
    : period === '6m' ? subMonths(now, 6)
    : subYears(now, 1);
  return items.filter((item) => isAfter(parseISO(item.date), cutoff));
}

function toMonthLabels(items: { date: string }[]): string[] {
  const seen = new Set<string>();
  return items.map((item) => {
    const lbl = format(parseISO(item.date), 'MMM', { locale: hu }).toUpperCase();
    if (seen.has(lbl)) return '';
    seen.add(lbl);
    return lbl;
  });
}

type LinePoint = { value: number; label: string; hideDataPoint: boolean };
type BarPoint = { value: number; label: string; frontColor: string };

function weightPoints(items: UserMeasurement[]): LinePoint[] {
  const valid = items.filter((m) => m.weight != null);
  const labels = toMonthLabels(valid);
  return valid.map((m, i) => ({
    value: m.weight,
    label: labels[i],
    hideDataPoint: i < valid.length - 1,
  }));
}

function fatPoints(items: UserMeasurement[]): LinePoint[] {
  const valid = items.filter((m) => m.body_fat_pct != null);
  const labels = toMonthLabels(valid);
  return valid.map((m, i) => ({
    value: m.body_fat_pct as number,
    label: labels[i],
    hideDataPoint: i < valid.length - 1,
  }));
}

function fmsPoints(items: FmsAssessment[]): BarPoint[] {
  const labels = toMonthLabels(items);
  return items.map((a, i) => ({
    value: a.total_score,
    label: labels[i],
    frontColor: a.total_score >= 14 ? '#10b981' : a.total_score >= 11 ? '#f59e0b' : '#ef4444',
  }));
}

interface Delta {
  abs: string;
  pct: string;
  arrow: string;
  color: string;
  fullText: string;
}

function calcDelta(first: number, last: number, unit: string, lowerIsBetter = false): Delta {
  const d = parseFloat((last - first).toFixed(1));
  const p = parseFloat(((d / first) * 100).toFixed(1));
  const arrow = d < 0 ? '↓' : d > 0 ? '↑' : '→';
  const sign = d > 0 ? '+' : '';
  const improved = lowerIsBetter ? d < 0 : d > 0;
  const color = d === 0 ? '#94a3b8' : improved ? '#10b981' : '#ef4444';
  return {
    abs: `${sign}${d}${unit}`,
    pct: `${sign}${p}%`,
    arrow,
    color,
    fullText: `${arrow} ${sign}${d}${unit} · ${sign}${p}%`,
  };
}

function PeriodSelector({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <View className="flex-row gap-2 mb-4">
      {PERIODS.map((p) => (
        <TouchableOpacity
          key={p.key}
          className="py-1.5 px-3.5 rounded-full"
          style={{
            backgroundColor: value === p.key ? '#f97316' : '#1e293b',
            borderWidth: 1,
            borderColor: value === p.key ? '#f97316' : '#1e2a3f',
          }}
          onPress={() => onChange(p.key)}
        >
          <Text
            className="font-bold"
            style={{ fontSize: 13, color: value === p.key ? '#fff' : '#94a3b8' }}
          >
            {p.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MetricTabs({ value, onChange }: { value: Metric; onChange: (m: Metric) => void }) {
  return (
    <View className="flex-row gap-2 mb-4">
      {METRICS.map((m) => (
        <TouchableOpacity
          key={m.key}
          className="py-1.5 px-4 rounded-xl"
          style={{
            borderWidth: 1.5,
            borderColor: value === m.key ? '#f97316' : '#334155',
            backgroundColor: '#1e293b',
          }}
          onPress={() => onChange(m.key)}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: value === m.key ? '#f97316' : '#64748b',
            }}
          >
            {m.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <View className="items-center py-8">
      <Text className="text-slate-500 text-sm">{message}</Text>
    </View>
  );
}

interface ChartCardProps {
  currentValue: number | null;
  unit: string;
  delta: Delta | null;
  children: React.ReactNode;
}

function ChartCard({ currentValue, unit, delta, children }: ChartCardProps) {
  return (
    <View
      className="bg-slate-800 rounded-2xl p-4 mb-4"
      style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
    >
      <Text
        className="text-slate-500 font-semibold mb-2"
        style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' }}
      >
        Jelenleg
      </Text>
      <View className="flex-row items-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        {currentValue != null ? (
          <>
            <Text className="text-white font-bold" style={{ fontSize: 38, letterSpacing: -1 }}>
              {currentValue}
              <Text style={{ fontSize: 20, fontWeight: '500', color: '#cbd5e1' }}> {unit}</Text>
            </Text>
            {delta && (
              <View
                style={{
                  backgroundColor: delta.color + '22',
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: delta.color, fontSize: 12, fontWeight: '700' }}>
                  {delta.fullText}
                </Text>
              </View>
            )}
          </>
        ) : (
          <Text className="text-slate-400" style={{ fontSize: 16 }}>Nincs adat</Text>
        )}
      </View>
      {children}
    </View>
  );
}

interface SummaryRowProps {
  label: string;
  from: number | null;
  to: number | null;
  unit: string;
  delta: Delta | null;
  isLast?: boolean;
}

function SummaryRow({ label, from, to, unit, delta, isLast = false }: SummaryRowProps) {
  if (from == null || to == null) return null;
  return (
    <View
      className="flex-row items-center justify-between py-3"
      style={!isLast ? { borderBottomWidth: 1, borderBottomColor: '#1e2a3f' } : undefined}
    >
      <View>
        <Text className="text-white font-semibold" style={{ fontSize: 15 }}>{label}</Text>
        <Text className="text-slate-400" style={{ fontSize: 12, marginTop: 2 }}>
          {from}{unit} → {to}{unit}
        </Text>
      </View>
      {delta && (
        <Text style={{ color: delta.color, fontSize: 14, fontWeight: '700' }}>
          {delta.arrow} {delta.abs}
        </Text>
      )}
    </View>
  );
}

export default function ProgressScreen() {
  const [period, setPeriod] = useState<Period>('3m');
  const [metric, setMetric] = useState<Metric>('weight');
  const { data: allMeasurements, isLoading: loadingM } = useUserMeasurements();
  const { data: allFms, isLoading: loadingF } = useFmsAssessments();

  const measurements = useMemo(
    () => filterByPeriod(allMeasurements ?? [], period),
    [allMeasurements, period],
  );

  const fmsItems = useMemo(
    () => filterByPeriod(allFms ?? [], period),
    [allFms, period],
  );

  const wPoints = useMemo(() => weightPoints(measurements), [measurements]);
  const fPoints = useMemo(() => fatPoints(measurements), [measurements]);
  const fmsBarData = useMemo(() => fmsPoints(fmsItems), [fmsItems]);

  const currentWeight = wPoints.length > 0 ? wPoints[wPoints.length - 1].value : null;
  const firstWeight = wPoints.length > 1 ? wPoints[0].value : null;
  const currentFat = fPoints.length > 0 ? fPoints[fPoints.length - 1].value : null;
  const firstFat = fPoints.length > 1 ? fPoints[0].value : null;
  const currentFms = fmsItems.length > 0 ? fmsItems[fmsItems.length - 1].total_score : null;
  const firstFms = fmsItems.length > 1 ? fmsItems[0].total_score : null;

  const weightDelta = firstWeight != null && currentWeight != null
    ? calcDelta(firstWeight, currentWeight, ' kg', true)
    : null;
  const fatDelta = firstFat != null && currentFat != null
    ? calcDelta(firstFat, currentFat, '%', true)
    : null;
  const fmsDelta = firstFms != null && currentFms != null
    ? calcDelta(firstFms, currentFms, '/21', false)
    : null;

  const hasWeightSummary = firstWeight != null && currentWeight != null;
  const hasFatSummary = firstFat != null && currentFat != null;
  const hasSummary = hasWeightSummary || hasFatSummary;

  const periodLabel =
    period === '1m' ? 'UTOLSÓ 1 HÓNAP'
    : period === '3m' ? 'UTOLSÓ 3 HÓNAP'
    : period === '6m' ? 'UTOLSÓ 6 HÓNAP'
    : 'UTOLSÓ 1 ÉV';

  const innerWidth = CHART_WIDTH - 32;

  const AREA_PROPS = {
    areaChart: true,
    startFillColor: '#f97316',
    startOpacity: 0.3,
    endFillColor: '#f97316',
    endOpacity: 0,
    color: '#f97316',
    thickness: 2,
    dataPointsColor: '#f97316',
    dataPointsRadius: 5,
    yAxisTextStyle: { color: '#94a3b8', fontSize: 10 },
    xAxisLabelTextStyle: { color: '#94a3b8', fontSize: 10 },
    backgroundColor: 'transparent' as const,
    rulesColor: '#1e293b',
    yAxisColor: '#1e293b',
    xAxisColor: '#1e293b',
    noOfSections: 4,
    initialSpacing: 10,
    endSpacing: 20,
  };

  function renderActiveChart() {
    if (metric === 'weight') {
      return (
        <ChartCard
          currentValue={currentWeight}
          unit="kg"
          delta={weightDelta}
        >
          {wPoints.length >= 2 ? (
            <LineChart
              data={wPoints}
              width={innerWidth}
              height={160}
              spacing={chartSpacing(wPoints.length, innerWidth)}
              {...AREA_PROPS}
            />
          ) : (
            <EmptyChart message="Legalább 2 mérés kell a grafikonhoz" />
          )}
        </ChartCard>
      );
    }

    if (metric === 'fat') {
      return (
        <ChartCard
          currentValue={currentFat}
          unit="%"
          delta={fatDelta}
        >
          {fPoints.length >= 2 ? (
            <LineChart
              data={fPoints}
              width={innerWidth}
              height={160}
              spacing={chartSpacing(fPoints.length, innerWidth)}
              {...AREA_PROPS}
            />
          ) : (
            <EmptyChart message="Legalább 2 mérés kell a grafikonhoz" />
          )}
        </ChartCard>
      );
    }

    return (
      <ChartCard
        currentValue={currentFms}
        unit="/21"
        delta={fmsDelta}
      >
        {fmsBarData.length >= 1 ? (
          <BarChart
            data={fmsBarData}
            width={innerWidth}
            height={160}
            spacing={chartSpacing(fmsBarData.length, innerWidth)}
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
            initialSpacing={10}
            endSpacing={20}
          />
        ) : (
          <EmptyChart message="Nincs FMS felmérés ebben az időszakban" />
        )}
      </ChartCard>
    );
  }

  if (loadingM || loadingF) {
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
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
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
        <MetricTabs value={metric} onChange={setMetric} />

        {renderActiveChart()}

        {hasSummary && (
          <View
            className="bg-slate-800 rounded-2xl p-4 mb-4"
            style={{ borderWidth: 1, borderColor: '#1e2a3f' }}
          >
            <Text
              className="text-slate-500 font-bold mb-1"
              style={{ fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase' }}
            >
              Összefoglaló — {periodLabel}
            </Text>
            <SummaryRow
              label="Testsúly"
              from={firstWeight}
              to={currentWeight}
              unit=" kg"
              delta={weightDelta}
            />
            <SummaryRow
              label="Testzsír"
              from={firstFat}
              to={currentFat}
              unit="%"
              delta={fatDelta}
              isLast
            />
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
