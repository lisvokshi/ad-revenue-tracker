import React from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
  monthlyPageviews: string;
  onChangePageviews: (value: string) => void;
  onCalculate: () => void;
  selectedSite?: {
    name: string;
    monthly_pageviews: number;
  } | null;
  calculateScale: Animated.Value;
};

export default function TrafficInput({
  monthlyPageviews,
  onChangePageviews,
  onCalculate,
  selectedSite,
  calculateScale,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Monthly traffic</Text>
      <Text style={styles.helperText}>
        Enter your monthly pageviews. If you selected a site profile above, its traffic is pre‑filled.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. 100000"
        placeholderTextColor="#6B7280"
        keyboardType="numeric"
        value={monthlyPageviews}
        onChangeText={onChangePageviews}
      />

      {selectedSite && (
        <Text style={styles.prefillNote}>
          Using traffic from <Text style={styles.prefillSite}>{selectedSite.name}</Text> (
          {selectedSite.monthly_pageviews.toLocaleString()} pv/month)
        </Text>
      )}

      <Animated.View style={{ transform: [{ scale: calculateScale }] }}>
        <TouchableOpacity style={styles.button} onPress={onCalculate}>
          <Text style={styles.buttonText}>Calculate</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
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
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F9FAFB',
    fontSize: 14,
    backgroundColor: '#0F172A',
  },
  prefillNote: {
    marginTop: 6,
    fontSize: 12,
    color: '#9CA3AF',
  },
  prefillSite: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  buttonText: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
