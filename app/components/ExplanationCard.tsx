// app/components/ExplanationCard.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ExplanationCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>How this works</Text>
      <Text style={styles.text}>
        This calculator estimates AdSense revenue based on your monthly pageviews,
        region tier, and content category. RPMs vary depending on advertiser demand,
        so treat these numbers as directional benchmarks rather than guaranteed income.
      </Text>
      <Text style={styles.text}>
        Header bidding often increases yield compared to AdSense alone, which is why
        we show both scenarios. Try adjusting traffic and categories to see how your
        potential revenue changes.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 6,
  },
});
