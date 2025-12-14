// components/EstimatedRevenue.tsx
import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { globalStyles } from '../styles/styles';

type Props = {
  effectiveCpm: number;
  gaugeAnim: Animated.Value;
  adsenseMonthly: number;
  adsenseAnnual: number;
  headerAnnual: number;
  adsenseAnnual20: number | null;
  adsenseAnnual50: number | null;
  onCopySummary: () => void;
};

export default function EstimatedRevenue({
  effectiveCpm,
  gaugeAnim,
  adsenseMonthly,
  adsenseAnnual,
  headerAnnual,
  adsenseAnnual20,
  adsenseAnnual50,
  onCopySummary,
}: Props) {
  return (
    <View style={styles.cardEmphasis}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>Estimated revenue</Text>
        <Text style={styles.cardTagGreen}>Model output</Text>
      </View>

      {/* RPM / ROI GAUGE */}
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

      <Text style={globalStyles.label}>Monthly AdSense revenue (estimate)</Text>
      <Text style={styles.cardValue}>€{adsenseMonthly.toFixed(2)}</Text>

      <Text style={globalStyles.label}>Annual AdSense revenue (estimate)</Text>
      <Text style={styles.cardValue}>€{adsenseAnnual.toFixed(2)}</Text>

      <Text style={globalStyles.label}>Annual header bidding revenue (estimate)</Text>
      <Text style={styles.cardValue}>€{headerAnnual.toFixed(2)}</Text>

      {adsenseAnnual20 !== null && adsenseAnnual50 !== null && (
        <>
          <View style={styles.scenarioRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scenarioLabel}>+20% traffic</Text>
              <Text style={styles.scenarioMeta}>Same RPM</Text>
            </View>
            <Text style={styles.scenarioValue}>
              €{adsenseAnnual20.toFixed(2)} / year
            </Text>
          </View>

          <View style={styles.scenarioRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scenarioLabel}>+50% traffic</Text>
              <Text style={styles.scenarioMeta}>Same RPM</Text>
            </View>
            <Text style={styles.scenarioValue}>
              €{adsenseAnnual50.toFixed(2)} / year
            </Text>
          </View>
        </>
      )}

      <Text style={styles.helperText}>
        These values are estimates only. Real revenue depends on device mix,
        layout, viewability, seasonality, and advertiser demand.
      </Text>

      <TouchableOpacity
        style={globalStyles.primaryButton}
        onPress={onCopySummary}
      >
        <Text style={globalStyles.primaryButtonText}>Copy summary</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardEmphasis: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#111827',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  cardTagGreen: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
  },
  gaugeContainer: {
    marginBottom: 16,
  },
  gaugeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gaugeLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  gaugeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  gaugeBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  gaugeFill: {
    height: 8,
    backgroundColor: '#22C55E',
  },
  gaugeScaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  gaugeScaleText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  scenarioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scenarioLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  scenarioMeta: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  scenarioValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
  },
  helperText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 12,
  },
});
