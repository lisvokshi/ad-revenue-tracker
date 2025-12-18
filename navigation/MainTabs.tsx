import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { User } from '@supabase/supabase-js';
import React from 'react';

import AdSenseRevenueCalculatorScreen from '../app/screens/AdSenseRevenueCalculatorScreen';
import AdsSetupScreen from '../app/screens/AdsSetupScreen';
import ProfileScreen from '../app/screens/ProfileScreen';
import ReportsScreen from '../app/screens/ReportsScreen';

type Props = {
  user: User;
  onLogout: () => void;
};

const Tab = createBottomTabNavigator();

export default function MainTabs({ user, onLogout }: Props) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#020617' },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = {
            Calculator: focused ? 'calculator' : 'calculator-outline',
            'Ads Setup': focused ? 'construct' : 'construct-outline',
            Profile: focused ? 'person-circle' : 'person-circle-outline',
            Reports: focused ? 'stats-chart' : 'stats-chart-outline',
          } as const;

          const name = iconName[route.name as keyof typeof iconName] ?? 'ellipse-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
      initialRouteName="Calculator"
    >
      <Tab.Screen
        name="Calculator"
        options={{ tabBarLabel: 'Calculator' }}
      >
        {() => <AdSenseRevenueCalculatorScreen onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen
        name="Ads Setup"
        component={AdsSetupScreen}
        options={{ tabBarLabel: 'Ads Setup' }}
      />

      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ tabBarLabel: 'Reports' }}
      />

      <Tab.Screen name="Profile" options={{ tabBarLabel: 'Profile' }}>
        {() => (
          <ProfileScreen
            user={user}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
