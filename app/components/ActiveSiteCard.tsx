// app/components/ActiveSiteCard.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  site: {
    name: string;
    region_tier: string;
    category: string;
    monthly_pageviews: number;
  };
  selected?: boolean;
};

export default function ActiveSiteCard({ site, selected }: Props) {
  return (
    <View
      style={[
        styles.cardBase,
        selected ? styles.cardSelected : styles.cardDefault,
      ]}
    >
      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Active site</Text>
          <Text style={styles.name}>{site.name}</Text>
          <Text style={styles.meta}>
            {site.region_tier} · {site.category}
          </Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Traffic</Text>
          <Text style={styles.statValue}>
            {site.monthly_pageviews.toLocaleString()}
          </Text>
          <Text style={styles.statMeta}>pv / month</Text>
        </View>
      </View>
    </View>
  );
}

export { ActiveSiteCard };

const styles = StyleSheet.create({
  cardBase: {
    marginVertical: 10,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardDefault: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1D4ED8',
  },
  cardSelected: {
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statBlock: {
    marginLeft: 16,
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A5B4FC',
  },
  statMeta: {
    fontSize: 11,
    color: '#6B7280',
  },
});
