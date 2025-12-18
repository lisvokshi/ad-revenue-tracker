import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Session } from '@supabase/supabase-js';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import AuthScreen from './app/screens/AuthScreen';
import { supabase } from './app/supabaseClient';
import MainTabs from './navigation/MainTabs';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const navRef = useRef<any>(null);

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error) {
        setSession(data.session);
      }
      setCheckingSession(false);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setCheckingSession(false);
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || checkingSession) return;

    if (session) {
      nav.reset({
        index: 0,
        routes: [{ name: 'Main' as const }],
      });
    } else {
      nav.reset({
        index: 0,
        routes: [{ name: 'Auth' as const }],
      });
    }
  }, [session, checkingSession]);

  if (checkingSession) {
    return (
      <NavigationContainer ref={navRef}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#020617',
          }}
        >
          <ActivityIndicator color="#22C55E" />
        </View>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Auth">
            {() => <AuthScreen onAuthSuccess={(newSession) => setSession(newSession)} />} 
          </Stack.Screen>
        ) : null}

        {session ? (
          <Stack.Screen name="Main">
            {() => (
              <MainTabs
                user={session.user}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
