import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type RegionTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

type Props = {
  regionTier: RegionTier;
  onSelectTier: (tier: RegionTier) => void;
  tiers: RegionTier[];
};

export default function RegionTierSelector({ regionTier, onSelectTier, tiers }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Region tier</Text>
      <Text style={styles.helperText}>
        Advertisers bid differently depending on traffic geography. Tier 1 countries (US, UK, CA, AU) usually have the highest RPMs.
      </Text>

      <View style={styles.buttonRow}>
        {tiers.map((tier) => (
          <TouchableOpacity
            key={tier}
            style={[styles.button, regionTier === tier && styles.buttonSelected]}
            onPress={() => onSelectTier(tier)}
          >
            <Text
              style={[
                styles.buttonText,
                regionTier === tier && styles.buttonTextSelected,
              ]}
            >
              {tier}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  buttonRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  button: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  buttonText: {
    fontSize: 13,
    color: '#CBD5F5',
  },
  buttonTextSelected: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
});
