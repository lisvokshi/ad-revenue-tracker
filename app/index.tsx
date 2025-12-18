import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import MainTabs from '../navigation/MainTabs';
import AuthScreen from './screens/AuthScreen';
import { supabase } from './supabaseClient';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

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

  if (checkingSession) {
    return (
      <NavigationIndependentTree>
        <NavigationContainer>
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
      </NavigationIndependentTree>
    );
  }

  const navKey = session ? 'authed' : 'guest';

  return (
    <NavigationIndependentTree>
      <NavigationContainer key={navKey}>
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
    </NavigationIndependentTree>
  );
}
