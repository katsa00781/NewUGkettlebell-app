import { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCreateWorkout } from '@/hooks/useWorkouts';

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const createWorkout = useCreateWorkout();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  async function handleSave() {
    if (!title.trim()) return;
    await createWorkout.mutateAsync({
      title: title.trim(),
      date,
      duration: parseInt(duration) || 0,
      notes: notes.trim() || null,
      sections: [],
    });
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#f97316" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">Új edzés</Text>
        <TouchableOpacity
          className="bg-orange-500 rounded-xl px-4 py-2"
          onPress={handleSave}
          disabled={createWorkout.isPending || !title.trim()}
        >
          {createWorkout.isPending
            ? <ActivityIndicator size="small" color="white" />
            : <Text className="text-white font-semibold">Mentés</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="mb-4">
          <Text className="text-slate-400 text-sm mb-2">Edzés neve *</Text>
          <TextInput
            className="bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700"
            placeholder="pl. Hétfői KB edzés"
            placeholderTextColor="#64748b"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="mb-4">
          <Text className="text-slate-400 text-sm mb-2">Dátum</Text>
          <TextInput
            className="bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700"
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#64748b"
            value={date}
            onChangeText={setDate}
          />
        </View>

        <View className="mb-4">
          <Text className="text-slate-400 text-sm mb-2">Időtartam (perc)</Text>
          <TextInput
            className="bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700"
            placeholder="60"
            placeholderTextColor="#64748b"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        <View className="mb-4">
          <Text className="text-slate-400 text-sm mb-2">Megjegyzés</Text>
          <TextInput
            className="bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700"
            placeholder="Opcionális megjegyzés..."
            placeholderTextColor="#64748b"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
