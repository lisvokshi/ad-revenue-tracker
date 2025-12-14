// components/Gauge.tsx
import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = {
  effectiveCpm: number;
  gaugeAnim: Animated.Value;
};

export default function Gauge({ effectiveCpm, gaugeAnim }: Props) {
  return (
    <View style={styles.gaugeContainer}>
      <View style={styles.gaugeHeaderRow}>
        <Text style={styles.gaugeLabel}>RPM profile</Text>
        <Text style={styles.gaugeValue}>
          ~€{effectiveCpm.toFixed(2)} / 1000 pv
        </Text>
      </View>
      <View style={styles.gaugeBar}>
        <Animated.View
          style={[
            styles.gaugeFill,
            {
              width: gaugeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.gaugeScaleRow}>
        <Text style={styles.gaugeScaleText}>Low</Text>
        <Text style={styles.gaugeScaleText}>Medium</Text>
        <Text style={styles.gaugeScaleText}>High</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gaugeContainer: { marginTop: 10, marginBottom: 8 },
  gaugeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  gaugeLabel: { fontSize: 12, color: '#9CA3AF' },
  gaugeValue: { fontSize: 12, color: '#E5E7EB', fontWeight: '500' },
  gaugeBar: { height: 8, borderRadius: 999, backgroundColor: '#111827', overflow: 'hidden', width: '100%' },
  gaugeFill: { height: '100%', borderRadius: 999, backgroundColor: '#22C55E' },
  gaugeScaleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  gaugeScaleText: { fontSize: 10, color: '#6B7280' },
});
