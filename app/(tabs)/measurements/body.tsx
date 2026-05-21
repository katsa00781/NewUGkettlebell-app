import { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useUserMeasurements, useAddMeasurement, useDeleteMeasurement } from '@/hooks/useMeasurements';
import { MeasurementCard } from '@/components/measurements/MeasurementCard';

type FormField = {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
  decimal?: boolean;
};

const FIELDS: FormField[] = [
  { key: 'weight', label: 'Testsúly', unit: 'kg', placeholder: '75.0', decimal: true },
  { key: 'body_fat_pct', label: 'Testzsír', unit: '%', placeholder: '18.5', decimal: true },
  { key: 'muscle_mass_kg', label: 'Izomtömeg', unit: 'kg', placeholder: '35.0', decimal: true },
  { key: 'visceral_fat', label: 'Zsigeri zsír', unit: 'index', placeholder: '8', decimal: true },
  { key: 'body_water_pct', label: 'Testfolyadék', unit: '%', placeholder: '55.0', decimal: true },
  { key: 'bone_mass_kg', label: 'Csonttömeg', unit: 'kg', placeholder: '3.5', decimal: true },
];

type FormValues = Record<string, string>;

const EMPTY_FORM: FormValues = {
  weight: '',
  body_fat_pct: '',
  muscle_mass_kg: '',
  visceral_fat: '',
  body_water_pct: '',
  bone_mass_kg: '',
  notes: '',
};

export default function BodyMeasurementsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data: measurements, isLoading } = useUserMeasurements();
  const addMeasurement = useAddMeasurement();
  const deleteMeasurement = useDeleteMeasurement();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const weightNum = parseFloat(form.weight);
  const heightM = profile?.height ? profile.height / 100 : null;
  const computedBmi =
    heightM && weightNum > 0 ? parseFloat((weightNum / (heightM * heightM)).toFixed(1)) : null;

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    const w = parseFloat(form.weight);
    if (!w || w <= 0) return;

    await addMeasurement.mutateAsync({
      date,
      weight: w,
      body_fat_pct: form.body_fat_pct ? parseFloat(form.body_fat_pct) : null,
      muscle_mass_kg: form.muscle_mass_kg ? parseFloat(form.muscle_mass_kg) : null,
      visceral_fat: form.visceral_fat ? parseFloat(form.visceral_fat) : null,
      bmi: computedBmi,
      body_water_pct: form.body_water_pct ? parseFloat(form.body_water_pct) : null,
      bone_mass_kg: form.bone_mass_kg ? parseFloat(form.bone_mass_kg) : null,
      notes: form.notes || null,
    });

    setForm(EMPTY_FORM);
    setDate(new Date().toISOString().split('T')[0]);
    setShowForm(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row items-center px-4 pt-4 pb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#f97316" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">Testkomponens</Text>
          <TouchableOpacity
            className="bg-orange-500 rounded-xl px-4 py-2"
            onPress={() => setShowForm((v) => !v)}
          >
            <Text className="text-white font-semibold text-sm">+ Új</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {showForm && (
            <View className="bg-slate-800 rounded-2xl p-4 mb-4">
              <Text className="text-orange-500 font-bold text-sm mb-4">Új mérés</Text>

              {/* Dátum */}
              <View className="mb-3">
                <Text className="text-slate-400 text-xs mb-1">Dátum</Text>
                <TextInput
                  style={{ backgroundColor: '#0f172a', color: 'white', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}
                  value={date}
                  onChangeText={setDate}
                  placeholderTextColor="#64748b"
                />
              </View>

              {/* Mezők 2 oszlopban */}
              <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                {FIELDS.map((field) => (
                  <View key={field.key} style={{ width: '47%' }}>
                    <Text className="text-slate-400 text-xs mb-1">
                      {field.label} ({field.unit})
                    </Text>
                    <TextInput
                      style={{ backgroundColor: '#0f172a', color: 'white', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}
                      value={form[field.key]}
                      onChangeText={(v) => set(field.key, v)}
                      placeholder={field.placeholder}
                      placeholderTextColor="#64748b"
                      keyboardType="decimal-pad"
                    />
                  </View>
                ))}
              </View>

              {/* BMI auto */}
              {computedBmi != null && (
                <View className="bg-slate-700 rounded-xl px-4 py-3 mt-3 flex-row items-center justify-between">
                  <Text className="text-slate-300 text-sm">BMI (számított)</Text>
                  <Text className="text-white font-bold">{computedBmi}</Text>
                </View>
              )}
              {!heightM && (
                <Text className="text-slate-500 text-xs mt-2">
                  A BMI számításhoz add meg a magasságod a Profilban.
                </Text>
              )}

              {/* Megjegyzés */}
              <View className="mt-3">
                <Text className="text-slate-400 text-xs mb-1">Megjegyzés</Text>
                <TextInput
                  style={{ backgroundColor: '#0f172a', color: 'white', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}
                  value={form.notes}
                  onChangeText={(v) => set('notes', v)}
                  placeholder="Opcionális megjegyzés…"
                  placeholderTextColor="#64748b"
                  multiline
                />
              </View>

              <TouchableOpacity
                className="bg-orange-500 rounded-xl py-3 items-center mt-4"
                onPress={handleSave}
                disabled={addMeasurement.isPending || !form.weight}
              >
                {addMeasurement.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold">Mentés</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Text className="text-white font-bold text-base mb-3">Előzmények</Text>
          {isLoading ? (
            <ActivityIndicator color="#f97316" />
          ) : !measurements || measurements.length === 0 ? (
            <View className="bg-slate-800 rounded-2xl p-6 items-center">
              <Ionicons name="body-outline" size={48} color="#334155" />
              <Text className="text-slate-400 mt-3 text-sm">Még nincs testkomponens mérés</Text>
            </View>
          ) : (
            measurements.map((m) => (
              <MeasurementCard
                key={m.id}
                measurement={m}
                onDelete={(id) => deleteMeasurement.mutate(id)}
              />
            ))
          )}
          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
