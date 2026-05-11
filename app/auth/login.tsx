import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !password) {
      setError('Kérlek add meg az email-t és a jelszót.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError('Hibás email vagy jelszó.');
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
          <View className="items-center mb-10">
            <Text className="text-4xl font-bold text-orange-500 mb-2">🏋️ UG KB</Text>
            <Text className="text-slate-400 text-base">Underground Kettlebell</Text>
          </View>

          <Text className="text-2xl font-bold text-white mb-8">Bejelentkezés</Text>

          {error && (
            <View className="bg-red-900/50 border border-red-700 rounded-xl p-3 mb-4">
              <Text className="text-red-300 text-sm">{error}</Text>
            </View>
          )}

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
            <Text className="text-slate-400 text-sm mb-2">Jelszó</Text>
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
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-bold text-base">Bejelentkezés</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            className="items-center py-2"
          >
            <Text className="text-slate-400">
              Nincs még fiókod?{' '}
              <Text className="text-orange-500 font-semibold">Regisztrálj</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
