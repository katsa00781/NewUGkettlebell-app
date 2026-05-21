import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { differenceInYears } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

function useWorkoutCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['workout-count', userId],
    queryFn: async () => {
      const { count } = await supabase
        .from('workouts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId!);
      return count ?? 0;
    },
    enabled: !!userId,
  });
}

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, user, setProfile } = useAuth();
  const { data: workoutCount = 0 } = useWorkoutCount(user?.id);

  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [height, setHeight] = useState(String(profile?.height ?? ''));
  const [weight, setWeight] = useState(String(profile?.weight ?? ''));

  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  const fullName =
    profile?.first_name || profile?.last_name
      ? `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
      : user?.email ?? '';

  const shortTitle =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name[0]}.`
      : profile?.first_name ?? user?.email?.split('@')[0] ?? '';

  const age = profile?.birthdate
    ? differenceInYears(new Date(), new Date(profile.birthdate))
    : null;

  const isAdmin = profile?.role === 'admin';

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
    if (!error && data) {
      setProfile(data);
      setEditVisible(false);
    }
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

  const SETTINGS_ITEMS = [
    { label: 'Edzés terv', icon: 'fitness' },
    { label: 'Edző hozzárendelése', icon: 'person-add' },
    { label: 'Értesítések', icon: 'notifications' },
    { label: 'Mértékegységek', icon: 'scale' },
    { label: 'Adatkezelés', icon: 'shield-checkmark' },
  ] as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-8">

          {/* Header */}
          <Text
            className="text-slate-400 font-semibold mb-1"
            style={{ fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase' }}
          >
            Sportoló
          </Text>
          <Text className="text-white font-bold mb-5" style={{ fontSize: 28, letterSpacing: -0.5 }}>
            {shortTitle}
          </Text>

          {/* Profil kártya */}
          <View className="bg-slate-800 rounded-2xl p-4 mb-3" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
            <View className="flex-row items-center mb-4">
              {/* Avatar */}
              <View
                className="w-14 h-14 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#f97316' }}
              >
                <Text className="text-white font-extrabold" style={{ fontSize: 22 }}>
                  {initials}
                </Text>
              </View>

              {/* Név + alcím */}
              <View className="flex-1">
                <Text className="text-white font-bold" style={{ fontSize: 16, letterSpacing: -0.3 }}>
                  {fullName}
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">Underground KB</Text>
              </View>

              {/* Szerkeszt gomb */}
              <TouchableOpacity
                onPress={() => setEditVisible(true)}
                className="rounded-xl px-4 py-2"
                style={{ backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' }}
              >
                <Text className="text-slate-300 font-semibold" style={{ fontSize: 13 }}>
                  Szerkeszt
                </Text>
              </TouchableOpacity>
            </View>

            {/* Statisztikák */}
            <View
              className="flex-row rounded-xl overflow-hidden"
              style={{ backgroundColor: '#0f172a' }}
            >
              <StatBox value={profile?.height ? `${profile.height}` : '–'} unit="cm" label="Magasság" />
              <View style={{ width: 1, backgroundColor: '#1e2a3f' }} />
              <StatBox value={age != null ? `${age}` : '–'} unit="év" label="Életkor" />
              <View style={{ width: 1, backgroundColor: '#1e2a3f' }} />
              <StatBox value={`${workoutCount}`} unit="" label="Edzések" />
            </View>
          </View>

          {/* Beállítások */}
          <Text
            className="text-slate-500 font-semibold mb-2 mt-2"
            style={{ fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase' }}
          >
            Beállítások
          </Text>

          <View className="bg-slate-800 rounded-2xl mb-4" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
            {SETTINGS_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                className="flex-row items-center px-4 py-4"
                style={i < SETTINGS_ITEMS.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#1e2a3f' } : undefined}
                activeOpacity={0.6}
              >
                <Text className="text-white flex-1 font-medium" style={{ fontSize: 15 }}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#475569" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Admin */}
          {isAdmin && (
            <View className="bg-slate-800 rounded-2xl mb-4" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
              <Text
                className="text-orange-500 font-bold px-4 pt-4 pb-2"
                style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' }}
              >
                Admin
              </Text>
              {[
                { label: 'Felhasználók', route: '/admin/users' },
                { label: 'Gyakorlatok kezelése', route: '/admin/exercises' },
              ].map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  className="flex-row items-center px-4 py-4"
                  style={i < 1 ? { borderBottomWidth: 1, borderBottomColor: '#1e2a3f' } : undefined}
                  onPress={() => router.push(item.route as any)}
                >
                  <Text className="text-white flex-1 font-medium" style={{ fontSize: 15 }}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#475569" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Kijelentkezés */}
          <TouchableOpacity onPress={handleLogout} className="px-1 py-2">
            <Text style={{ color: '#ef4444', fontSize: 15, fontWeight: '600' }}>Kijelentkezés</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Szerkesztő modal */}
      <Modal visible={editVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Text className="text-slate-400 font-medium" style={{ fontSize: 15 }}>Mégsem</Text>
              </TouchableOpacity>
              <Text className="text-white font-bold" style={{ fontSize: 16 }}>Profil szerkesztése</Text>
              <TouchableOpacity onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator size="small" color="#f97316" />
                  : <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 15 }}>Mentés</Text>
                }
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 pt-2">
              <View className="bg-slate-800 rounded-2xl p-4 mb-4" style={{ borderWidth: 1, borderColor: '#1e2a3f' }}>
                <EditField label="Keresztnév" value={firstName} onChange={setFirstName} placeholder="Keresztnév" />
                <View style={{ height: 1, backgroundColor: '#1e2a3f', marginVertical: 2 }} />
                <EditField label="Vezetéknév" value={lastName} onChange={setLastName} placeholder="Vezetéknév" />
                <View style={{ height: 1, backgroundColor: '#1e2a3f', marginVertical: 2 }} />
                <EditField label="Magasság (cm)" value={height} onChange={setHeight} placeholder="182" numeric />
                <View style={{ height: 1, backgroundColor: '#1e2a3f', marginVertical: 2 }} />
                <EditField label="Súly (kg)" value={weight} onChange={setWeight} placeholder="75" numeric />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function StatBox({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <View className="flex-1 items-center py-3">
      <View className="flex-row items-baseline gap-0.5">
        <Text className="text-white font-bold" style={{ fontSize: 20, letterSpacing: -0.5 }}>{value}</Text>
        {unit ? <Text className="text-slate-400 font-semibold" style={{ fontSize: 12 }}>{unit}</Text> : null}
      </View>
      <Text
        className="text-slate-500 font-semibold mt-0.5"
        style={{ fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase' }}
      >
        {label}
      </Text>
    </View>
  );
}

function EditField({
  label,
  value,
  onChange,
  placeholder,
  numeric,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  numeric?: boolean;
}) {
  return (
    <View className="flex-row items-center py-3">
      <Text className="text-slate-400 font-medium flex-1" style={{ fontSize: 14 }}>{label}</Text>
      <TextInput
        style={{ color: 'white', fontSize: 15, fontWeight: '500', textAlign: 'right', minWidth: 100 }}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#475569"
        keyboardType={numeric ? 'decimal-pad' : 'default'}
      />
    </View>
  );
}
