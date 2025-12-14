// app/supabaseClient.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

// Read credentials from app.json -> expo.extra
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || '';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] Missing credentials. Add "extra.supabaseUrl" and "extra.supabaseAnonKey" in app.json.'
  );
}

// Create a single Supabase client for the whole app
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Expo Router treats every file under `app/` as a route. To avoid the router
// attempting to render the Supabase client object as a React component (and
// causing "Element type is invalid" runtime errors), export a harmless
// default React component. Keep the actual client as a named export.
export default function SupabaseClientPlaceholder() {
  return null;
}
