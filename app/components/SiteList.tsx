// app/components/SiteList.tsx
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Site = {
  id: string;
  name: string;
  region_tier: string;
  category: string;
  monthly_pageviews: number;
};

type Props = {
  sites: Site[];
  sitesLoading: boolean;
  selectedSiteId: string | null;
  onSelectSite: (id: string) => void;
};

export default function SiteList({
  sites,
  sitesLoading,
  selectedSiteId,
  onSelectSite,
}: Props) {
  if (sitesLoading) {
    return (
      <View style={styles.centerRow}>
        <ActivityIndicator />
      </View>
    );
  }

  if (sites.length === 0) {
    return (
      <Text style={styles.helperTextMuted}>
        No sites yet. Create your first profile below.
      </Text>
    );
  }

  return (
    <View style={styles.sitesList}>
      {sites.map((site) => (
        <TouchableOpacity
          key={site.id}
          onPress={() => onSelectSite(site.id)}
          activeOpacity={0.9}
        >
          <View
            style={[
              styles.siteCard,
              selectedSiteId === site.id && styles.siteCardSelected,
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.siteName,
                  selectedSiteId === site.id && styles.siteNameSelected,
                ]}
              >
                {site.name}
              </Text>
              <Text style={styles.siteMeta}>
                {site.region_tier} · {site.category}
              </Text>
            </View>
            <View style={styles.siteStat}>
              <Text style={styles.siteTraffic}>
                {site.monthly_pageviews.toLocaleString()}
              </Text>
              <Text style={styles.siteMetaSmall}>pv / month</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  centerRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  helperTextMuted: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  sitesList: {
    marginTop: 10,
    width: '100%',
    alignSelf: 'stretch',
  },
  siteCard: {
    marginVertical: 6,
    padding: 12,                // smaller padding than ActiveSiteCard
    borderRadius: 14,           // slightly smaller radius
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  siteCardSelected: {
    borderColor: '#1D4ED8',
    borderWidth: 2,
    backgroundColor: '#0F172A',
  },
  siteName: {
    fontSize: 13,               // slightly smaller text
    fontWeight: '600',
    color: '#E5E7EB',
  },
  siteNameSelected: {
    color: '#22C55E',
  },
  siteMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  siteStat: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  siteTraffic: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A5B4FC',
  },
  siteMetaSmall: {
    fontSize: 10,
    color: '#6B7280',
  },
});
