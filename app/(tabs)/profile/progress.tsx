import { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserWeights, useAddWeight, useDeleteWeight } from '@/hooks/useProgress';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

export default function ProgressScreen() {
  const router = useRouter();
  const { data: weights, isLoading } = useUserWeights();
  const addWeight = useAddWeight();
  const deleteWeight = useDeleteWeight();

  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const latestWeight = weights && weights.length > 0 ? weights[weights.length - 1] : null;
  const firstWeight = weights && weights.length > 0 ? weights[0] : null;
  const weightChange = latestWeight && firstWeight
    ? (latestWeight.weight - firstWeight.weight).toFixed(1)
    : null;

  async function handleAddWeight() {
    const w = parseFloat(newWeight);
    if (!w || w <= 0 || w > 999) {
      Alert.alert('Hiba', 'Érvényes súlyt adj meg (0-999 kg)');
      return;
    }
    await addWeight.mutateAsync({ weight: w, date: newDate, notes: notes || undefined });
    setNewWeight('');
    setNotes('');
    setShowForm(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#f97316" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">Fejlődés</Text>
        <TouchableOpacity
          className="bg-orange-500 rounded-xl px-4 py-2"
          onPress={() => setShowForm(!showForm)}
        >
          <Ionicons name="add" size={18} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-slate-800 rounded-2xl p-4">
            <Text className="text-slate-400 text-xs">Jelenlegi súly</Text>
            <Text className="text-white text-xl font-bold mt-1">
              {latestWeight ? `${latestWeight.weight} kg` : '–'}
            </Text>
          </View>
          <View className="flex-1 bg-slate-800 rounded-2xl p-4">
            <Text className="text-slate-400 text-xs">Változás</Text>
            <Text
              className="text-xl font-bold mt-1"
              style={{ color: weightChange ? (parseFloat(weightChange) <= 0 ? '#10b981' : '#f97316') : '#94a3b8' }}
            >
              {weightChange ? `${parseFloat(weightChange) > 0 ? '+' : ''}${weightChange} kg` : '–'}
            </Text>
          </View>
          <View className="flex-1 bg-slate-800 rounded-2xl p-4">
            <Text className="text-slate-400 text-xs">Mérések</Text>
            <Text className="text-white text-xl font-bold mt-1">{weights?.length ?? 0}</Text>
          </View>
        </View>

        {/* Add form */}
        {showForm && (
          <View className="bg-slate-800 rounded-2xl p-4 mb-4">
            <Text className="text-orange-500 font-bold text-sm mb-3">Új mérés</Text>
            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <Text className="text-slate-400 text-xs mb-1">Súly (kg)</Text>
                <TextInput
                  className="bg-slate-900 text-white rounded-xl px-3 py-2.5"
                  placeholder="75.5"
                  placeholderTextColor="#64748b"
                  value={newWeight}
                  onChangeText={setNewWeight}
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-xs mb-1">Dátum</Text>
                <TextInput
                  className="bg-slate-900 text-white rounded-xl px-3 py-2.5"
                  value={newDate}
                  onChangeText={setNewDate}
                />
              </View>
            </View>
            <TouchableOpacity
              className="bg-orange-500 rounded-xl py-3 items-center"
              onPress={handleAddWeight}
              disabled={addWeight.isPending}
            >
              {addWeight.isPending
                ? <ActivityIndicator size="small" color="white" />
                : <Text className="text-white font-semibold">Mentés</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Weight history */}
        <Text className="text-white font-bold text-base mb-3">Mérési előzmények</Text>
        {isLoading ? (
          <ActivityIndicator color="#f97316" />
        ) : !weights || weights.length === 0 ? (
          <View className="bg-slate-800 rounded-2xl p-6 items-center">
            <Ionicons name="scale-outline" size={48} color="#334155" />
            <Text className="text-slate-400 mt-3 text-sm">Még nincs mérési adat</Text>
          </View>
        ) : (
          [...weights].reverse().map((w) => (
            <View key={w.id} className="bg-slate-800 rounded-2xl p-4 mb-2 flex-row items-center">
              <View className="flex-1">
                <Text className="text-white font-bold">{w.weight} kg</Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  {format(new Date(w.date), 'yyyy. MMM d.', { locale: hu })}
                </Text>
                {w.notes && (
                  <Text className="text-slate-500 text-xs mt-0.5">{w.notes}</Text>
                )}
              </View>
              <TouchableOpacity
                className="p-2"
                onPress={() => {
                  Alert.alert('Törlés', 'Biztosan törlöd ezt a mérést?', [
                    { text: 'Mégsem', style: 'cancel' },
                    { text: 'Törlés', style: 'destructive', onPress: () => deleteWeight.mutate(w.id) },
                  ]);
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
          ))
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
