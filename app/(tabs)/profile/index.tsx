import { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, user, setProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [height, setHeight] = useState(String(profile?.height ?? ''));
  const [weight, setWeight] = useState(String(profile?.weight ?? ''));

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        full_name: `${firstName.trim()} ${lastName.trim()}`.trim() || null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
      })
      .eq('id', user.id)
      .select()
      .single();
    setSaving(false);
    if (!error && data) setProfile(data);
  }

  async function handleLogout() {
    Alert.alert('Kijelentkezés', 'Biztosan ki szeretnél jelentkezni?', [
      { text: 'Mégsem', style: 'cancel' },
      {
        text: 'Kijelentkezés',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/auth/login');
        },
      },
    ]);
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-2xl font-bold">Profil</Text>
            <TouchableOpacity
              className="bg-orange-500 rounded-xl px-4 py-2"
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="white" />
                : <Text className="text-white font-semibold">Mentés</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-orange-500/20 rounded-full items-center justify-center">
              <Text className="text-5xl">
                {firstName ? firstName[0].toUpperCase() : user?.email?.[0].toUpperCase() ?? '?'}
              </Text>
            </View>
            <Text className="text-white font-bold text-lg mt-3">
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.email}
            </Text>
            <View className={`mt-2 rounded-full px-3 py-1 ${isAdmin ? 'bg-orange-500/20' : 'bg-slate-700'}`}>
              <Text className={`text-xs font-semibold ${isAdmin ? 'text-orange-400' : 'text-slate-400'}`}>
                {isAdmin ? 'Admin' : 'Felhasználó'}
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="bg-slate-800 rounded-2xl p-4 mb-4">
            <Text className="text-orange-500 font-bold text-sm mb-4">Személyes adatok</Text>

            <View className="mb-3">
              <Text className="text-slate-400 text-xs mb-1">Keresztnév</Text>
              <TextInput
                className="bg-slate-900 text-white rounded-xl px-4 py-3"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Keresztnév"
                placeholderTextColor="#64748b"
              />
            </View>

            <View className="mb-3">
              <Text className="text-slate-400 text-xs mb-1">Vezetéknév</Text>
              <TextInput
                className="bg-slate-900 text-white rounded-xl px-4 py-3"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Vezetéknév"
                placeholderTextColor="#64748b"
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-slate-400 text-xs mb-1">Magasság (cm)</Text>
                <TextInput
                  className="bg-slate-900 text-white rounded-xl px-4 py-3"
                  value={height}
                  onChangeText={setHeight}
                  placeholder="175"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-xs mb-1">Súly (kg)</Text>
                <TextInput
                  className="bg-slate-900 text-white rounded-xl px-4 py-3"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="75"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Quick links */}
          <View className="bg-slate-800 rounded-2xl mb-4">
            {[
              { label: 'Fejlődés / Súlynapló', icon: 'trending-up', route: '/(tabs)/profile/progress' },
              { label: 'FMS Felmérés', icon: 'bar-chart', route: '/(tabs)/profile/fms' },
            ].map((item, i) => (
              <TouchableOpacity
                key={item.label}
                className={`flex-row items-center px-4 py-4 ${i < 1 ? 'border-b border-slate-700' : ''}`}
                onPress={() => router.push(item.route as any)}
              >
                <Ionicons name={item.icon as any} size={20} color="#f97316" />
                <Text className="text-white ml-3 flex-1">{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#64748b" />
              </TouchableOpacity>
            ))}
          </View>

          {isAdmin && (
            <View className="bg-slate-800 rounded-2xl mb-4">
              <Text className="text-orange-500 font-bold text-xs px-4 pt-4 pb-2">ADMIN</Text>
              {[
                { label: 'Felhasználók', icon: 'people', route: '/admin/users' },
                { label: 'Gyakorlatok kezelése', icon: 'barbell', route: '/admin/exercises' },
                { label: 'Időpontok kezelése', icon: 'calendar', route: '/admin/appointments' },
              ].map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  className={`flex-row items-center px-4 py-4 ${i < 2 ? 'border-b border-slate-700' : ''}`}
                  onPress={() => router.push(item.route as any)}
                >
                  <Ionicons name={item.icon as any} size={20} color="#f97316" />
                  <Text className="text-white ml-3 flex-1">{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            className="bg-red-900/30 border border-red-800/50 rounded-2xl py-4 items-center"
            onPress={handleLogout}
          >
            <Text className="text-red-400 font-semibold">Kijelentkezés</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
