import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import type { UserMeasurement } from '@/types/supabase';

type Props = {
  measurement: UserMeasurement;
  onDelete?: (id: string) => void;
};

type MetricRow = {
  label: string;
  value: number | null;
  unit: string;
};

export function MeasurementCard({ measurement: m, onDelete }: Props) {
  const metrics: MetricRow[] = [
    { label: 'Testzsír', value: m.body_fat_pct, unit: '%' },
    { label: 'Izomtömeg', value: m.muscle_mass_kg, unit: 'kg' },
    { label: 'Zsigeri zsír', value: m.visceral_fat, unit: '' },
    { label: 'Víz', value: m.body_water_pct, unit: '%' },
    { label: 'Csonttömeg', value: m.bone_mass_kg, unit: 'kg' },
    { label: 'BMI', value: m.bmi, unit: '' },
  ].filter((row) => row.value != null);

  function handleDelete() {
    Alert.alert('Törlés', 'Biztosan törlöd ezt a mérést?', [
      { text: 'Mégsem', style: 'cancel' },
      { text: 'Törlés', style: 'destructive', onPress: () => onDelete?.(m.id) },
    ]);
  }

  return (
    <View className="bg-slate-800 rounded-2xl p-4 mb-3">
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-slate-400 text-xs">
            {format(new Date(m.date), 'yyyy. MMM d.', { locale: hu })}
          </Text>
          <Text className="text-white text-xl font-bold mt-0.5">{m.weight} kg</Text>
        </View>
        <View className="flex-row items-center gap-3">
          {m.bmi != null && (
            <View className="bg-slate-700 rounded-xl px-3 py-1.5">
              <Text className="text-slate-300 text-xs">BMI</Text>
              <Text className="text-white font-bold text-sm">{m.bmi.toFixed(1)}</Text>
            </View>
          )}
          {onDelete && (
            <TouchableOpacity onPress={handleDelete} className="p-1">
              <Ionicons name="trash-outline" size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {metrics.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {metrics
            .filter((r) => r.label !== 'BMI')
            .map((row) => (
              <View key={row.label} className="bg-slate-700 rounded-lg px-2.5 py-1.5">
                <Text className="text-slate-400 text-xs">{row.label}</Text>
                <Text className="text-white text-sm font-semibold">
                  {row.value}{row.unit}
                </Text>
              </View>
            ))}
        </View>
      )}

      {m.notes ? (
        <Text className="text-slate-500 text-xs mt-2">{m.notes}</Text>
      ) : null}
    </View>
  );
}
