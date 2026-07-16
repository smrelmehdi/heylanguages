import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Key, Lock, Mail, Send, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { supabase } from '../utils/supabase';

async function mergeGuestProgress(userId: string) {
  const guestProgress = await AsyncStorage.getItem('guest_progress');
  const guestXpRaw = await AsyncStorage.getItem('guest_xp_cache');
  if (!guestProgress) return;

  const progressMap: Record<string, boolean> = JSON.parse(guestProgress);

  for (const [scenario, completed] of Object.entries(progressMap)) {
    if (!completed) continue;
    const { data: existing } = await supabase
      .from('scenario_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('scenario', scenario)
      .maybeSingle();
    if (!existing) {
      await supabase.from('scenario_progress').insert({
        user_id: userId,
        scenario,
        dialect: 'gulf',
        completed: true,
        best_score: 100,
        attempts: 1,
      });
    }
  }

  const completedCount = Object.values(progressMap).filter(Boolean).length;
  const guestXp = guestXpRaw ? parseInt(guestXpRaw, 10) : NaN;
  const xpEarned = Number.isFinite(guestXp) ? guestXp : completedCount * 60;
  const { data: existingUser } = await supabase.from('users').select('xp').eq('id', userId).single();
  await supabase.from('users').update({ xp: (existingUser?.xp ?? 0) + xpEarned }).eq('id', userId);

  await AsyncStorage.removeItem('guest_progress');
  await AsyncStorage.removeItem('guest_xp_cache');
  await AsyncStorage.removeItem('guest_chat_count');
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [awaitingVerification, setAwaitingVerification] = useState(false);

    async function handleAuth() {
    if (!email || !password) {
      Alert.alert("Hold up", "Please enter both your email and password.");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    const wizardDialect = await AsyncStorage.getItem('wizard_dialect');
    const wizardLevel = await AsyncStorage.getItem('wizard_level');

    if (isLoginMode) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert("Login Error", error.message);
      } else if (data.session) {
        await supabase.from('users').update({
          onboarding_completed: true,
          dialect: wizardDialect ?? 'gulf',
          level: wizardLevel ?? 'beginner',
          last_active: new Date().toISOString(),
        }).eq('id', data.session.user.id);
        await mergeGuestProgress(data.session.user.id);
        router.replace('/(tabs)');
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert("Sign Up Error", error.message);
      } else if (data.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          level: wizardLevel ?? 'beginner',
          dialect: wizardDialect ?? 'gulf',
          onboarding_completed: true,
          streak_count: 0,
          last_active: new Date().toISOString(),
        });

        if (insertError) {
          // Row may already exist (e.g. re-signup) — not fatal, continue
          console.warn('users insert:', insertError.message);
        }

        if (data.session) {
          await mergeGuestProgress(data.session.user.id);
          router.replace('/(tabs)');
        } else {
          setAwaitingVerification(true);
        }
      }
    }

    setLoading(false);
  }

  const handleSocialMock = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} Sign In will be available in the next update!`);
  };

  if (awaitingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(28, 176, 246, 0.1)' }]}>
            <Send color="#1CB0F6" size={48} />
          </View>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a confirmation link to{' '}
            <Text style={{ color: theme.colors.textPrimary, fontWeight: theme.fontWeight.medium }}>{email}</Text>.
            {' '}Click it to verify your account.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              setAwaitingVerification(false);
              setIsLoginMode(true);
              setPassword('');
            }}
          >
            <Text style={styles.primaryButtonText}>I've verified my email</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.closeButton}>
          <X color={theme.colors.textPrimary} size={24} />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Lock color={theme.colors.accentPrimary} size={48} />
          </View>

          <Text style={styles.title}>{isLoginMode ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={styles.subtitle}>
            {isLoginMode ? 'Log in to continue your Arabic journey.' : 'Sign up to save your XP and chat history.'}
          </Text>

          <View style={styles.form}>
            <View style={[styles.inputWrapper, focusedInput === 'email' && styles.inputFocused]}>
              <Mail color={focusedInput === 'email' ? theme.colors.accentPrimary : theme.colors.textTertiary} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={theme.colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>

            <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputFocused]}>
              <Key color={focusedInput === 'password' ? theme.colors.accentPrimary : theme.colors.textTertiary} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>

            <Pressable
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={theme.colors.bgBase} />
                : <Text style={styles.primaryButtonText}>{isLoginMode ? 'Log In' : 'Sign Up'}</Text>
              }
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <Pressable style={styles.socialButton} onPress={() => handleSocialMock('Google')}>
                <Ionicons name="logo-google" size={20} color={theme.colors.textPrimary} />
                <Text style={styles.socialText}>Google</Text>
              </Pressable>
              <Pressable style={styles.socialButton} onPress={() => handleSocialMock('Apple')}>
                <Ionicons name="logo-apple" size={20} color={theme.colors.textPrimary} />
                <Text style={styles.socialText}>Apple</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.toggleContainer}
              onPress={() => { setIsLoginMode(!isLoginMode); setEmail(''); setPassword(''); }}
              disabled={loading}
            >
              <Text style={styles.toggleText}>
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <Text style={styles.toggleTextBold}>{isLoginMode ? 'Sign up' : 'Log in'}</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },
  flex: { flex: 1 },
  closeButton: { padding: 8, alignSelf: 'flex-start' },
  content: { flex: 1, padding: 32, justifyContent: 'center', alignItems: 'center', width: '100%' },
  iconContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(61, 212, 192, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  form: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderDefault, borderRadius: theme.radii.lg, paddingHorizontal: 16, height: 60, marginBottom: 16 },
  inputFocused: { borderColor: theme.colors.borderAccent },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: theme.colors.textPrimary, fontSize: 16, height: '100%' },
  primaryButton: { backgroundColor: theme.colors.accentPrimary, width: '100%', height: 60, borderRadius: theme.radii.lg, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: theme.colors.bgBase, fontSize: 18, fontWeight: theme.fontWeight.medium },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.borderDefault },
  dividerText: { color: theme.colors.textTertiary, paddingHorizontal: 16, fontSize: 14, fontWeight: theme.fontWeight.regular },
  socialRow: { flexDirection: 'row', gap: 16 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bgSurface, height: 56, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.borderDefault },
  socialText: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: theme.fontWeight.medium, marginLeft: 10 },
  toggleContainer: { marginTop: 32, padding: 10, alignItems: 'center' },
  toggleText: { color: theme.colors.textSecondary, fontSize: 15 },
  toggleTextBold: { color: theme.colors.textAccent, fontWeight: theme.fontWeight.medium },
});
