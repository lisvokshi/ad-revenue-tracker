import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AdsSetupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ads Setup</Text>
      <Text style={styles.label}>Configure your ad categories, tiers, and placements here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E5E7EB',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
