import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import HeroHeader from '../components/HeroHeader';
import { globalStyles } from '../styles/styles';
import {
  BASE_CPM_BY_TIER,
  CATEGORY_MULTIPLIERS,
  HEADER_BIDDING_MULTIPLIER,
} from './AdSenseRevenueCalculatorScreen';
import { supabase } from '../supabaseClient';

type SummaryStat = {
  label: string;
  value: string;
};

type Scenario = {
  label: string;
  value: string;
};

type Row = {
  label: string;
  value: string;
  sub?: string;
};

type Site = {
  id: string;
  name: string;
  region_tier: string;
  category: string;
  monthly_pageviews: number;
};

const COUNTRY_ROWS: Row[] = [
  { label: 'Germany', value: '€4,210', sub: 'RPM €3.98' },
  { label: 'France', value: '€2,980', sub: 'RPM €3.44' },
  { label: 'UK', value: '€2,210', sub: 'RPM €3.72' },
  { label: 'Spain', value: '€1,640', sub: 'RPM €2.91' },
];

const FORMAT_ROWS: Row[] = [
  { label: 'Display (Banner)', value: '€5,120', sub: '52% of revenue' },
  { label: 'Native', value: '€3,010', sub: '31% of revenue' },
  { label: 'Video', value: '€2,090', sub: '17% of revenue' },
];

const CHART_POINTS = [42, 55, 48, 61, 68, 74, 70, 79, 90, 84, 92, 100];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function toCurrency(value: number, digits?: number) {
  const maximumFractionDigits = typeof digits === 'number' ? digits : value < 10 ? 2 : 0;
  return `€${value.toLocaleString(undefined, { maximumFractionDigits })}`;
}

function getCountriesForTier(tier: string) {
  if (tier === 'Tier 1') return ['Germany', 'United Kingdom', 'France', 'United States'];
  if (tier === 'Tier 2') return ['Spain', 'Italy', 'Poland', 'Mexico'];
  return ['India', 'Brazil', 'Indonesia', 'Philippines'];
}

export default function ReportsScreen() {
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  useEffect(() => {
    const loadSites = async () => {
      try {
        setSitesLoading(true);
        const { data, error } = await supabase
          .from('sites')
          .select('id, name, region_tier, category, monthly_pageviews')
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Could not load sites', error);
          return;
        }

        const typed = (data ?? []) as Site[];
        setSites(typed);
        if (typed.length > 0 && !selectedSiteId) {
          setSelectedSiteId(typed[0].id);
        }
      } finally {
        setSitesLoading(false);
      }
    };
    loadSites();
  }, [selectedSiteId]);

  const selectedSite = useMemo(
    () => sites.find((s) => s.id === selectedSiteId) ?? null,
    [sites, selectedSiteId],
  );

  const computeMetrics = (site: Site) => {
    const baseCpm = BASE_CPM_BY_TIER[site.region_tier] ?? 1.0;
    const categoryFactor = CATEGORY_MULTIPLIERS[site.category] ?? 1.0;
    const effectiveCpm = baseCpm * categoryFactor;
    const monthlyPv = site.monthly_pageviews || 0;
    const monthlyRevenue = (monthlyPv / 1000) * effectiveCpm;
    const annualRevenue = monthlyRevenue * 12;
    const headerAnnual = annualRevenue * HEADER_BIDDING_MULTIPLIER;
    const annual20 = ((monthlyPv * 1.2) / 1000) * effectiveCpm * 12;
    const annual50 = ((monthlyPv * 1.5) / 1000) * effectiveCpm * 12;

    const summary: SummaryStat[] = [
      { label: 'Monthly AdSense', value: toCurrency(monthlyRevenue) },
      { label: 'Annual AdSense', value: toCurrency(annualRevenue) },
      { label: 'Header bidding (annual)', value: toCurrency(headerAnnual) },
      { label: 'RPM', value: toCurrency(effectiveCpm, 2) },
      { label: 'Monthly pageviews', value: monthlyPv.toLocaleString() },
    ];

    const scenarios: Scenario[] = [
      { label: '+20% traffic', value: toCurrency(annual20) },
      { label: '+50% traffic', value: toCurrency(annual50) },
    ];

    const countriesPreset = getCountriesForTier(site.region_tier);
    const countries = countriesPreset.map((country, idx) => ({
      label: country,
      value: toCurrency(monthlyRevenue * [0.35, 0.25, 0.2, 0.2][idx]),
      sub: `RPM ${toCurrency(effectiveCpm * (1 + idx * 0.05), 2)}`,
    }));

    const formats = FORMAT_ROWS.map((row, idx) => ({
      ...row,
      value: toCurrency(monthlyRevenue * [0.45, 0.32, 0.23][idx]),
    }));

    const seed = hashString(site.id);
    const chart = CHART_POINTS.map((p, idx) =>
      Math.round(p * (0.9 + ((seed + idx) % 20) / 100)),
    );

    return { summary, scenarios, countries, formats, chart };
  };

  const defaultSite: Site = {
    id: 'default',
    name: 'Demo',
    region_tier: 'Tier 1',
    category: 'Finance',
    monthly_pageviews: 3600000,
  };

  const metrics = useMemo(() => {
    if (selectedSite) {
      return computeMetrics(selectedSite);
    }
    return computeMetrics(defaultSite);
  }, [selectedSite]);

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      <HeroHeader />

      <View style={[globalStyles.card, styles.cardSpacing]}>
        <Text style={styles.sectionTitle}>Website</Text>
        {sitesLoading ? (
          <View style={styles.centerRow}>
            <ActivityIndicator />
          </View>
        ) : sites.length === 0 ? (
          <Text style={styles.helperText}>No sites yet. Add a website profile in Calculator to see site-specific reports.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.siteChipsRow}>
            {sites.map((site) => {
              const active = site.id === selectedSiteId;
              return (
                <TouchableOpacity
                  key={site.id}
                  style={[styles.siteChip, active && styles.siteChipActive]}
                  onPress={() => setSelectedSiteId(site.id)}
                >
                  <Text style={[styles.siteChipText, active && styles.siteChipTextActive]}>
                    {site.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      <View style={[globalStyles.card, styles.cardSpacing]}>
        <Text style={styles.sectionTitle}>Performance summary</Text>
        <View style={styles.summaryGrid}>
          {metrics.summary.map((stat) => (
            <View key={stat.label} style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{stat.label}</Text>
              <Text style={styles.summaryValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>Growth scenarios</Text>
        {metrics.scenarios.map((scenario) => (
          <View key={scenario.label} style={styles.row}>
            <Text style={styles.rowLabel}>{scenario.label}</Text>
            <Text style={styles.rowValue}>{scenario.value}</Text>
          </View>
        ))}
      </View>

      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>Revenue trend (last 12 weeks)</Text>
        <View style={styles.chartRow}>
          {metrics.chart.map((point, idx) => (
            <View key={idx} style={styles.chartBarWrapper}>
              <View style={[styles.chartBar, { height: 12 + point }]} />
            </View>
          ))}
        </View>
        <Text style={styles.chartHint}>Mock shape only; values align with your calculator math.</Text>
      </View>

      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>Top countries</Text>
        {metrics.countries.map((row) => (
          <View key={row.label} style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>{row.label}</Text>
              {row.sub ? <Text style={styles.rowSub}>{row.sub}</Text> : null}
            </View>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>By format</Text>
        {metrics.formats.map((row) => (
          <View key={row.label} style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>{row.label}</Text>
              {row.sub ? <Text style={styles.rowSub}>{row.sub}</Text> : null}
            </View>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  cardSpacing: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E7EB',
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  centerRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  siteChipsRow: {
    marginTop: 6,
  },
  siteChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#020617',
    marginRight: 10,
  },
  siteChipActive: {
    backgroundColor: '#111827',
    borderColor: '#22C55E',
  },
  siteChipText: {
    color: '#CBD5F5',
    fontWeight: '600',
    fontSize: 13,
  },
  siteChipTextActive: {
    color: '#22C55E',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  summaryCard: {
    width: '50%',
    paddingVertical: 12,
    paddingRight: 10,
  },
  summaryLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  summaryValue: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 12,
    height: 140,
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  chartBar: {
    width: 14,
    borderRadius: 8,
    backgroundColor: '#22C55E',
  },
  chartHint: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 11,
    lineHeight: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  rowLabel: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
  rowSub: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  rowValue: {
    color: '#A5B4FC',
    fontSize: 14,
    fontWeight: '700',
  },
});
