// components/RevenueStats.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { globalStyles } from '../styles/styles';

type Props = {
  adsenseMonthly: number;
  adsenseAnnual: number;
  headerAnnual: number;
};

export default function RevenueStats({
  adsenseMonthly,
  adsenseAnnual,
  headerAnnual,
}: Props) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statCard}>
        <Text style={globalStyles.label}>Monthly AdSense</Text>
        <Text style={styles.statValue}>€{adsenseMonthly.toFixed(0)}</Text>
        <Text style={styles.statMeta}>Baseline estimate</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={globalStyles.label}>Annual AdSense</Text>
        <Text style={styles.statValue}>€{adsenseAnnual.toFixed(0)}</Text>
        <Text style={styles.statMeta}>Current traffic</Text>
      </View>

      <View style={[styles.statCard, styles.statCardAccent]}>
        <Text style={globalStyles.label}>Header bidding</Text>
        <Text style={styles.statValue}>€{headerAnnual.toFixed(0)}</Text>
        <Text style={styles.statMeta}>AdSense × 1.5 uplift</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#111827',
  },
  statCardAccent: {
    borderColor: '#22C55E',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  statMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
});
