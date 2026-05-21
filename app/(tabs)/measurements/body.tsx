import { useState } from 'react';
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

type FormValues = {
  weight: string;
  body_fat_pct: string;
  muscle_mass_kg: string;
  visceral_fat: string;
  bone_mass_kg: string;
  body_water_pct: string;
  notes: string;
};

const EMPTY_FORM: FormValues = {
  weight: '',
  body_fat_pct: '',
  muscle_mass_kg: '',
  visceral_fat: '',
  bone_mass_kg: '',
  body_water_pct: '',
  notes: '',
};

export default function BodyMeasurementsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data: measurements, isLoading } = useUserMeasurements();
  const addMeasurement = useAddMeasurement();
  const deleteMeasurement = useDeleteMeasurement();

  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [date] = useState(new Date().toISOString().split('T')[0]);

  const weightNum = parseFloat(form.weight);
  const heightM = profile?.height ? profile.height / 100 : null;
  const computedBmi =
    heightM && weightNum > 0 ? parseFloat((weightNum / (heightM * heightM)).toFixed(1)) : null;

  function set(key: keyof FormValues, value: string) {
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
      bone_mass_kg: form.bone_mass_kg ? parseFloat(form.bone_mass_kg) : null,
      body_water_pct: form.body_water_pct ? parseFloat(form.body_water_pct) : null,
      bmi: computedBmi,
      notes: form.notes || null,
    });

    setForm(EMPTY_FORM);
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-4 pb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 items-center justify-center mr-3"
          >
            <Ionicons name="chevron-back" size={24} color="#f97316" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text
              className="text-slate-500 font-semibold"
              style={{ fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase' }}
            >
              Új bejegyzés
            </Text>
            <Text className="text-white font-bold" style={{ fontSize: 20, letterSpacing: -0.4 }}>
              Testkompo mérés
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>

          {/* Testsúly */}
          <FieldRow label="Testsúly" unit="kg" value={form.weight} onChange={(v) => set('weight', v)} />

          {/* Testzsír */}
          <FieldRow label="Testzsír" unit="%" value={form.body_fat_pct} onChange={(v) => set('body_fat_pct', v)} />

          {/* Izomtömeg */}
          <FieldRow label="Izomtömeg" unit="kg" value={form.muscle_mass_kg} onChange={(v) => set('muscle_mass_kg', v)} />

          {/* Zsigeri zsír + Csontmassza – egymás mellett */}
          <View className="flex-row mb-4" style={{ gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text
                className="text-slate-400 font-medium mb-2"
                style={{ fontSize: 12 }}
              >
                Zsigeri zsír
              </Text>
              <View
                className="flex-row items-center rounded-xl px-4"
                style={{ backgroundColor: '#1e293b', minHeight: 52 }}
              >
                <TextInput
                  style={{ flex: 1, color: 'white', fontSize: 16, fontWeight: '500' }}
                  value={form.visceral_fat}
                  onChangeText={(v) => set('visceral_fat', v)}
                  placeholder="7"
                  placeholderTextColor="#475569"
                  keyboardType="decimal-pad"
                />
                <Text className="text-slate-500 font-semibold" style={{ fontSize: 13 }}>idx</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                className="text-slate-400 font-medium mb-2"
                style={{ fontSize: 12 }}
              >
                Csontmassza
              </Text>
              <View
                className="flex-row items-center rounded-xl px-4"
                style={{ backgroundColor: '#1e293b', minHeight: 52 }}
              >
                <TextInput
                  style={{ flex: 1, color: 'white', fontSize: 16, fontWeight: '500' }}
                  value={form.bone_mass_kg}
                  onChangeText={(v) => set('bone_mass_kg', v)}
                  placeholder="3.6"
                  placeholderTextColor="#475569"
                  keyboardType="decimal-pad"
                />
                <Text className="text-slate-500 font-semibold" style={{ fontSize: 13 }}>kg</Text>
              </View>
            </View>
          </View>

          {/* Testvíz */}
          <FieldRow label="Testvíz" unit="%" value={form.body_water_pct} onChange={(v) => set('body_water_pct', v)} />

          {/* BMI – automatikus */}
          <View
            className="rounded-xl px-5 py-4 mb-4 flex-row items-center justify-between"
            style={{
              backgroundColor: 'rgba(120, 53, 15, 0.45)',
              borderWidth: 1,
              borderColor: 'rgba(249,115,22,0.25)',
            }}
          >
            <View>
              <Text style={{ color: '#f97316', fontSize: 12, fontWeight: '700', letterSpacing: 1.2 }}>
                BMI (AUTO)
              </Text>
              <Text className="text-slate-400 mt-0.5" style={{ fontSize: 12 }}>
                {heightM
                  ? `Magasság: ${profile!.height} cm`
                  : 'Add meg a magasságod a Profilban'}
              </Text>
            </View>
            <Text style={{ color: 'white', fontSize: 34, fontWeight: '700', letterSpacing: -1 }}>
              {computedBmi != null ? computedBmi : '–'}
            </Text>
          </View>

          {/* Megjegyzés */}
          <Text
            className="text-slate-400 font-medium mb-2"
            style={{ fontSize: 12 }}
          >
            Megjegyzés
          </Text>
          <View
            className="rounded-xl mb-6"
            style={{ backgroundColor: '#1e293b' }}
          >
            <TextInput
              style={{
                color: 'white',
                fontSize: 15,
                paddingHorizontal: 16,
                paddingTop: 14,
                paddingBottom: 14,
                minHeight: 70,
                textAlignVertical: 'top',
              }}
              value={form.notes}
              onChangeText={(v) => set('notes', v)}
              placeholder="Hogy érezted magad? Mit változtatnál?"
              placeholderTextColor="#475569"
              multiline
            />
          </View>

          {/* Mentés gomb */}
          <TouchableOpacity
            className="rounded-xl py-4 items-center mb-6"
            style={{
              backgroundColor: '#f97316',
              opacity: !form.weight || addMeasurement.isPending ? 0.5 : 1,
            }}
            onPress={handleSave}
            disabled={addMeasurement.isPending || !form.weight}
          >
            {addMeasurement.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold" style={{ fontSize: 16 }}>
                Mentés
              </Text>
            )}
          </TouchableOpacity>

          {/* Előzmények */}
          {measurements && measurements.length > 0 && (
            <>
              <Text
                className="text-slate-500 font-semibold mb-3"
                style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' }}
              >
                Előzmények
              </Text>
              {isLoading ? (
                <ActivityIndicator color="#f97316" />
              ) : (
                measurements.map((m) => (
                  <MeasurementCard
                    key={m.id}
                    measurement={m}
                    onDelete={(id) => deleteMeasurement.mutate(id)}
                  />
                ))
              )}
            </>
          )}

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldRow({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="mb-4">
      <Text className="text-slate-400 font-medium mb-2" style={{ fontSize: 12 }}>
        {label}
      </Text>
      <View
        className="flex-row items-center rounded-xl px-4"
        style={{ backgroundColor: '#1e293b', minHeight: 52 }}
      >
        <TextInput
          style={{ flex: 1, color: 'white', fontSize: 16, fontWeight: '500' }}
          value={value}
          onChangeText={onChange}
          placeholder="0.0"
          placeholderTextColor="#475569"
          keyboardType="decimal-pad"
        />
        <Text className="text-slate-500 font-semibold" style={{ fontSize: 13 }}>
          {unit}
        </Text>
      </View>
    </View>
  );
}
