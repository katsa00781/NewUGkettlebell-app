import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminAppointmentsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#f97316" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Időpontok kezelése</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-slate-400">Hamarosan elérhető (Phase 3)</Text>
      </View>
    </SafeAreaView>
  );
}
