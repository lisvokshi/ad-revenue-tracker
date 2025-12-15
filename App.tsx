import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import AdSenseRevenueCalculatorScreen from './app/screens/AdSenseRevenueCalculatorScreen';
import AdsSetupScreen from './app/screens/AdsSetupScreen';
import ProfileScreen from './app/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
        {/* First tab: Calculator */}
        <Tab.Screen
          name="Calculator"
          component={AdSenseRevenueCalculatorScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calculator" size={size} color={color} />
            ),
          }}
        />

        {/* Second tab: Ads Setup */}
        <Tab.Screen
          name="Ads Setup"
          component={AdsSetupScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />

        {/* Third tab: Profile */}
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
