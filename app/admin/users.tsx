import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/supabase';

export default function AdminUsersScreen() {
  const router = useRouter();
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#f97316" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Felhasználók</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => (
            <View className="bg-slate-800 rounded-2xl p-4 mb-2 mx-4 flex-row items-center">
              <View className="w-10 h-10 bg-orange-500/20 rounded-full items-center justify-center mr-3">
                <Text className="text-orange-400 font-bold">
                  {(item.first_name ?? item.email ?? '?')[0].toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">
                  {item.full_name ?? (`${item.first_name ?? ''} ${item.last_name ?? ''}`.trim() || item.email)}
                </Text>
                <Text className="text-slate-400 text-xs">{item.email}</Text>
              </View>
              <View className={`rounded-full px-2 py-1 ${item.role === 'admin' ? 'bg-orange-500/20' : 'bg-slate-700'}`}>
                <Text className={`text-xs ${item.role === 'admin' ? 'text-orange-400' : 'text-slate-400'}`}>
                  {item.role ?? 'user'}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 4 }}
        />
      )}
    </SafeAreaView>
  );
}
