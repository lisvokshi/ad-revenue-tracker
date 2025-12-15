import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabaseClient';
import AuthScreen from './screens/AuthScreen';
import AdSenseRevenueCalculatorScreen from './screens/AdSenseRevenueCalculatorScreen';
import AdsSetupScreen from './screens/AdsSetupScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const supabase = createSupabaseClient();

function TabNavigator() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        setEmail(data.user.email ?? null);
      }
    };
    loadUser();
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Calculator"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: '#020617',
          borderTopColor: '#1E293B',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Calculator"
        component={AdSenseRevenueCalculatorScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Ads Setup"
        component={AdsSetupScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      >
        {() => <ProfileScreen userId={userId ?? undefined} email={email} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setIsLoading(false);
    };
    
    checkAuth();

    if (!supabase) return;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer independent={true}>
      {!isAuthenticated ? <AuthScreen /> : <TabNavigator />}
    </NavigationContainer>
  );
}
