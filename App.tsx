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
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#020617' },
          tabBarActiveTintColor: '#22C55E',
          tabBarInactiveTintColor: '#9CA3AF',
        }}
      >
        {/* First tab: Calculator */}
        <Tab.Screen
          name="Calculator"
          component={AdSenseRevenueCalculatorScreen}
        />

        {/* Second tab: Ads Setup */}
        <Tab.Screen
          name="Ads Setup"
          component={AdsSetupScreen}
        />

        {/* Third tab: Profile */}
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
