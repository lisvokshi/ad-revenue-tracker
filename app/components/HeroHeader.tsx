// components/HeroHeader.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HeroHeader() {
  return (
    <>
      {/* HERO HEADER */}
      <View style={styles.heroTopRow}>
        <View style={styles.heroBrand}>
          <Text style={styles.heroLogo}>▶︎</Text>
          <View>
            <Text style={styles.heroTitle}>Ad Revenue Studio</Text>
            <Text style={styles.heroSubtitle}>
              Model AdSense & header bidding revenue.
            </Text>
          </View>
        </View>
      </View>

      {/* BADGES */}
      <View style={styles.heroBadgesRow}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Ad Tools</Text>
        </View>
        <Text style={styles.heroBeta}>Beta</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  heroLogo: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#22C55E',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#022C22',
    fontWeight: '800',
    marginRight: 10,
    fontSize: 18,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F9FAFB',
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    lineHeight: 18,
  },
  heroBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.8)',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  heroBadgeText: {
    color: '#9CA3AF',
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroBeta: {
    marginLeft: 8,
    fontSize: 11,
    color: '#22C55E',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
