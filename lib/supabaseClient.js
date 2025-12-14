// app/supabaseClient.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

export const createSupabaseClient = () => {
  const SUPABASE_URL =
    Constants.expoConfig?.extra?.supabaseUrl ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    '';
  const SUPABASE_ANON_KEY =
    Constants.expoConfig?.extra?.supabaseAnonKey ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials are missing');
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};

export default createSupabaseClient;
