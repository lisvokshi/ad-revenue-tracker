import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AdsSetupScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="settings" size={64} color="#22C55E" />
      </View>
      <Text style={styles.title}>Welcome to the Ads Setup tab!</Text>
      <Text style={styles.description}>
        Configure your ad categories, tiers, and placements here.
      </Text>
      <Text style={styles.description}>
        This section will help you manage your advertising settings and optimize your revenue.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E5E7EB',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});
