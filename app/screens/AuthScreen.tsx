// screens/AuthScreen.tsx
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../supabaseClient';

type Mode = 'login' | 'register';

type Props = {
  onAuthSuccess?: (session: Session) => void;
};

export default function AuthScreen({ onAuthSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [authScale] = useState(new Animated.Value(1));

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Email required', 'Please enter your email first.');
      return;
    }

    try {
      setResetLoading(true);

      const redirectTo = Linking.createURL('reset-password');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        console.error(error);
        Alert.alert('Reset error', error.message);
        return;
      }

      Alert.alert(
        'Check your email',
        'We sent a password reset link. Open it to set a new password.',
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Unexpected error', 'Something went wrong. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);

      const result =
        mode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (result.error) {
        console.error(result.error);
        Alert.alert('Auth error', result.error.message);
        return;
      }

      if (mode === 'login') {
        const session = result.data.session;
        if (session) {
          onAuthSuccess?.(session);
          Alert.alert('Success', 'Logged in successfully.');
        } else {
          const { data: refreshed } = await supabase.auth.getSession();
          if (refreshed.session) {
            onAuthSuccess?.(refreshed.session);
            Alert.alert('Success', 'Logged in successfully.');
          } else {
            Alert.alert(
              'Check email verification',
              'Login succeeded but no session is active. Please verify your email or try again.',
            );
          }
        }
      } else {
        if (result.data.session) {
          onAuthSuccess?.(result.data.session);
        }
        Alert.alert(
          'Success',
          'Registered successfully. Please check your email if confirmation is required.',
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Unexpected error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthPress = () => {
    Animated.sequence([
      Animated.timing(authScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(authScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(handleAuth);
  };

  return (
    <View style={styles.authRoot}>
      <View style={styles.authBrandRow}>
        <View style={styles.authBrand}>
          <Text style={styles.authLogo}>▶︎</Text>
          <View>
            <Text style={styles.authTitle}>Ad Revenue Studio</Text>
            <Text style={styles.authSubtitle}>
              Forecast your AdSense & header bidding income.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.authCard}>
        <View style={styles.authModeRow}>
          <TouchableOpacity
            style={[
              styles.authModeButton,
              mode === 'login' && styles.authModeButtonActive,
            ]}
            onPress={() => setMode('login')}
            disabled={loading}
          >
            <Text
              style={[
                styles.authModeText,
                mode === 'login' && styles.authModeTextActive,
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.authModeButton,
              mode === 'register' && styles.authModeButtonActive,
            ]}
            onPress={() => setMode('register')}
            disabled={loading}
          >
            <Text
              style={[
                styles.authModeText,
                mode === 'register' && styles.authModeTextActive,
              ]}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {mode === 'login' && (
          <TouchableOpacity
            onPress={handleForgotPassword}
            disabled={loading || resetLoading}
            style={styles.forgotRow}
          >
            {resetLoading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.forgotText}>Forgot password?</Text>
            )}
          </TouchableOpacity>
        )}

        <Animated.View style={{ transform: [{ scale: authScale }] }}>
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleAuthPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#E5E7EB" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Login' : 'Create account'}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.authHintText}>
          You can switch between login and register above. Accounts are managed
          via Supabase auth.
        </Text>
      </View>

      <Text style={styles.authFooterText}>
        By signing in you agree to the demo terms – this tool is for estimation
        only.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // SHARED TEXT
  label: {
    fontSize: 13,
    marginBottom: 4,
    marginTop: 12,
    color: '#E5E7EB',
  },

  // INPUTS
  input: {
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#020617',
    color: '#E5E7EB',
    fontSize: 14,
  },

  // BUTTONS
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#22C55E',
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#022C22',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
  },
  forgotText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '500',
  },

  // AUTH SCREEN STYLES
  authRoot: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  authBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
    justifyContent: 'space-between',
  },
  authBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authLogo: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#22C55E',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#022C22',
    fontWeight: '800',
    marginRight: 12,
    fontSize: 20,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  authSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  authCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
    elevation: 12,
  },
  authModeRow: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#111827',
    padding: 3,
    marginBottom: 14,
  },
  authModeButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 7,
    alignItems: 'center',
  },
  authModeButtonActive: {
    backgroundColor: '#111827',
  },
  authModeText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  authModeTextActive: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  authHintText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 10,
    lineHeight: 16,
  },
  authFooterText: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 16,
  },
});