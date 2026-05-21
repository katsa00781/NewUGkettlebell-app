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
            <Text className="text-white font-bold" style={{ fontSize: 26, letterSpacing: -0.5 }}>Profil</Text>
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
            <View
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{ backgroundColor: '#f97316' }}
            >
              <Text className="text-white font-extrabold" style={{ fontSize: 34 }}>
                {firstName ? firstName[0].toUpperCase() : user?.email?.[0].toUpperCase() ?? '?'}
              </Text>
            </View>
            <Text className="text-white font-bold text-lg mt-3" style={{ letterSpacing: -0.3 }}>
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.email}
            </Text>
            <View
              className="mt-2 rounded-full px-3 py-1"
              style={{
                backgroundColor: isAdmin ? 'rgba(249,115,22,0.15)' : '#1e293b',
                borderWidth: 1,
                borderColor: isAdmin ? 'rgba(249,115,22,0.4)' : '#334155',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: isAdmin ? '#f97316' : '#94a3b8',
                }}
              >
                {isAdmin ? 'Admin' : 'Felhasználó'}
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="bg-slate-800 rounded-2xl p-4 mb-4" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
            <Text
              className="text-orange-500 font-bold mb-4"
              style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' }}
            >
              Személyes adatok
            </Text>

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
          <View className="bg-slate-800 rounded-2xl mb-4" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
            {[
              { label: 'Fejlődés / Súlynapló', icon: 'trending-up', route: '/(tabs)/profile/progress' },
              { label: 'FMS Felmérés', icon: 'bar-chart', route: '/(tabs)/profile/fms' },
            ].map((item, i) => (
              <TouchableOpacity
                key={item.label}
                className="flex-row items-center px-4 py-4"
                style={i < 1 ? { borderBottomWidth: 1, borderBottomColor: '#1e2a3f' } : undefined}
                onPress={() => router.push(item.route as any)}
              >
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: 'rgba(249,115,22,0.14)' }}
                >
                  <Ionicons name={item.icon as any} size={16} color="#f97316" />
                </View>
                <Text className="text-white flex-1 font-semibold" style={{ fontSize: 14.5 }}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#64748b" />
              </TouchableOpacity>
            ))}
          </View>

          {isAdmin && (
            <View className="bg-slate-800 rounded-2xl mb-4" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
              <Text
                className="text-orange-500 font-bold px-4 pt-4 pb-2"
                style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' }}
              >
                Admin
              </Text>
              {[
                { label: 'Felhasználók', icon: 'people', route: '/admin/users' },
                { label: 'Gyakorlatok kezelése', icon: 'barbell', route: '/admin/exercises' },
                { label: 'Időpontok kezelése', icon: 'calendar', route: '/admin/appointments' },
              ].map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  className="flex-row items-center px-4 py-4"
                  style={i < 2 ? { borderBottomWidth: 1, borderBottomColor: '#1e2a3f' } : undefined}
                  onPress={() => router.push(item.route as any)}
                >
                  <View
                    className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                    style={{ backgroundColor: 'rgba(249,115,22,0.14)' }}
                  >
                    <Ionicons name={item.icon as any} size={16} color="#f97316" />
                  </View>
                  <Text className="text-white flex-1 font-semibold" style={{ fontSize: 14.5 }}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            className="rounded-2xl py-4 items-center"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' }}
            onPress={handleLogout}
          >
            <Text className="font-semibold" style={{ color: '#ef4444' }}>Kijelentkezés</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
