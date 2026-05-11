import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!fullName || !email || !password) {
      setError('Kérlek töltsd ki az összes mezőt.');
      return;
    }
    if (password.length < 6) {
      setError('A jelszónak legalább 6 karakter hosszúnak kell lennie.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.replace('/(tabs)/dashboard');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Text className="text-slate-400">← Vissza</Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-white mb-8">Regisztráció</Text>

          {error && (
            <View className="bg-red-900/50 border border-red-700 rounded-xl p-3 mb-4">
              <Text className="text-red-300 text-sm">{error}</Text>
            </View>
          )}

          <View className="mb-4">
            <Text className="text-slate-400 text-sm mb-2">Teljes név</Text>
            <TextInput
              className="bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700"
              placeholder="Kovács János"
              placeholderTextColor="#64748b"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View className="mb-4">
            <Text className="text-slate-400 text-sm mb-2">Email cím</Text>
            <TextInput
              className="bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700"
              placeholder="email@example.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="mb-6">
            <Text className="text-slate-400 text-sm mb-2">Jelszó (min. 6 karakter)</Text>
            <TextInput
              className="bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700"
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            className="bg-orange-500 rounded-xl py-4 items-center mb-4"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-bold text-base">Regisztráció</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
