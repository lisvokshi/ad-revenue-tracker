// app/screens/AdSenseRevenueCalculatorScreen.tsx
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import EstimatedRevenue from '../components/EstimatedRevenue';
import { globalStyles } from '../styles/styles';
import { supabase } from '../supabaseClient';

// Modular components
import ActiveSiteCard from '../components/ActiveSiteCard';
import CategorySelector from '../components/CategorySelector';
import ExplanationCard from '../components/ExplanationCard';
import HeroHeader from '../components/HeroHeader';
import NewSiteForm from '../components/NewSiteForm';
import RegionTierSelector from '../components/RegionTierSelector';
import RevenueStats from '../components/RevenueStats';
import SiteList from '../components/SiteList';
import TrafficInput from '../components/TrafficInput';


export type RegionTier = 'Tier 1' | 'Tier 2' | 'Tier 3';
type CalculatorProps = { onLogout?: () => void };
type Site = {
  id: string;
  name: string;
  region_tier: RegionTier;
  category: string;
  monthly_pageviews: number;
};

export const REGION_TIERS: RegionTier[] = ['Tier 1', 'Tier 2', 'Tier 3'];

export const CATEGORIES: string[] = [
  'Arts & Entertainment',
  'Autos & Vehicles',
  'Beauty & Fitness',
  'Books & Literature',
  'Business & Industrial',
  'Computers & Electronics',
  'Finance',
  'Food & Drink',
  'Games',
  'Health',
  'Hobbies & Leisure',
  'Home & Garden',
  'Internet & Telecom',
  'Jobs & Education',
  'Law & Government',
  'News',
  'Online Communities',
  'People & Society',
  'Pets & Animals',
  'Real Estate',
  'Reference',
  'Science',
  'Shopping',
  'Sports',
  'Travel',
];

export const BASE_CPM_BY_TIER: Record<RegionTier, number> = {
  'Tier 1': 2.0,
  'Tier 2': 1.2,
  'Tier 3': 0.5,
};

export const CATEGORY_MULTIPLIERS: Record<string, number> = {
  'Arts & Entertainment': 1.0,
  'Autos & Vehicles': 1.1,
  'Beauty & Fitness': 1.0,
  'Books & Literature': 0.9,
  'Business & Industrial': 1.3,
  'Computers & Electronics': 1.2,
  Finance: 1.5,
  'Food & Drink': 1.0,
  Games: 1.0,
  Health: 1.2,
  'Hobbies & Leisure': 0.9,
  'Home & Garden': 1.0,
  'Internet & Telecom': 1.1,
  'Jobs & Education': 1.1,
  'Law & Government': 1.1,
  News: 0.9,
  'Online Communities': 0.9,
  'People & Society': 0.9,
  'Pets & Animals': 0.9,
  'Real Estate': 1.4,
  Reference: 1.0,
  Science: 1.0,
  Shopping: 1.2,
  Sports: 1.0,
  Travel: 1.1,
};

export const HEADER_BIDDING_MULTIPLIER = 1.5;

export default function AdSenseRevenueCalculatorScreen({ onLogout }: CalculatorProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [creatingSite, setCreatingSite] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  const [newSiteName, setNewSiteName] = useState('');
  const [regionTier, setRegionTier] = useState<RegionTier>('Tier 1');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [monthlyPageviews, setMonthlyPageviews] = useState('');

  const [adsenseMonthly, setAdsenseMonthly] = useState<number | null>(null);
  const [adsenseAnnual, setAdsenseAnnual] = useState<number | null>(null);
  const [headerAnnual, setHeaderAnnual] = useState<number | null>(null);
  const [adsenseAnnual20, setAdsenseAnnual20] = useState<number | null>(null);
  const [adsenseAnnual50, setAdsenseAnnual50] = useState<number | null>(null);

  const calculateScale = useRef(new Animated.Value(1)).current;
  const gaugeAnim = useRef(new Animated.Value(0)).current;

  // Load user from Supabase
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        Alert.alert('Auth error', 'User not found. Please log in again.');
        return;
      }
      setUserId(data.user.id);
    };
    loadUser();
  }, []);

  // Load sites from Supabase
  useEffect(() => {
    if (!userId) return;
    const loadSites = async () => {
      try {
        setSitesLoading(true);
        const { data, error } = await supabase
          .from('sites')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (error) {
          Alert.alert('Error', 'Could not load your sites.');
          return;
        }

        const typed = (data || []) as Site[];
        setSites(typed);
        if (typed.length > 0 && !selectedSiteId) {
          setSelectedSiteId(typed[0].id);
        }
      } finally {
        setSitesLoading(false);
      }
    };
    loadSites();
  }, [userId, selectedSiteId]);

  // Handle site creation
  const handleCreateSite = async () => {
    if (!userId) {
      Alert.alert('Auth error', 'User not found. Please log in again.');
      return;
    }
    if (!newSiteName || !monthlyPageviews) {
      Alert.alert('Missing fields', 'Please enter site name and monthly pageviews.');
      return;
    }

    const pv = Number(monthlyPageviews);
    if (Number.isNaN(pv) || pv <= 0) {
      Alert.alert('Invalid pageviews', 'Please enter a positive number.');
      return;
    }

    try {
      setCreatingSite(true);
      const { data, error } = await supabase
        .from('sites')
        .insert({
          user_id: userId,
          name: newSiteName,
          region_tier: regionTier,
          category,
          monthly_pageviews: pv,
        })
        .select()
        .single();

      if (error) {
        Alert.alert('Error', 'Could not save site profile.');
        return;
      }

      const newSite = data as Site;
      setSites((prev) => [...prev, newSite]);
      setSelectedSiteId(newSite.id);
      setNewSiteName('');
      setMonthlyPageviews(String(pv));
      Alert.alert('Success', 'Website profile saved. Calculation updated.');
    } finally {
      setCreatingSite(false);
    }
  };

  // Derived inputs
  const baseCpm = BASE_CPM_BY_TIER[regionTier];
  const categoryFactor = CATEGORY_MULTIPLIERS[category] ?? 1.0;
  const effectiveCpm = baseCpm * categoryFactor;
  const rpmScore = Math.min(effectiveCpm / 3, 1);

  // Selected site
  const selectedSite = selectedSiteId ? sites.find((s) => s.id === selectedSiteId) : null;

  // Sync inputs when switching sites
  useEffect(() => {
    if (!selectedSite) return;
    setRegionTier(selectedSite.region_tier);
    setCategory(selectedSite.category);
    setMonthlyPageviews(String(selectedSite.monthly_pageviews));
  }, [selectedSite]);

  // Auto-calc when a site is selected and inputs change
  useEffect(() => {
    if (!selectedSite) return;
    const pv = Number(monthlyPageviews);
    if (Number.isNaN(pv) || pv <= 0) return;

    const monthly = (pv / 1000) * effectiveCpm;
    const annual = monthly * 12;
    const header = annual * HEADER_BIDDING_MULTIPLIER;
    const annual20 = ((pv * 1.2) / 1000) * effectiveCpm * 12;
    const annual50 = ((pv * 1.5) / 1000) * effectiveCpm * 12;

    setAdsenseMonthly(monthly);
    setAdsenseAnnual(annual);
    setHeaderAnnual(header);
    setAdsenseAnnual20(annual20);
    setAdsenseAnnual50(annual50);
  }, [selectedSite, monthlyPageviews, effectiveCpm]);

  // Gauge animation on calculate
  useEffect(() => {
    if (adsenseMonthly === null) return;
    Animated.timing(gaugeAnim, {
      toValue: rpmScore,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [adsenseMonthly, rpmScore]);

  // Manual calculate (when typing traffic)
  const handleCalculate = () => {
    const pv = Number(monthlyPageviews);
    if (Number.isNaN(pv) || pv <= 0) {
      Alert.alert('Invalid input', 'Please enter a positive number for pageviews.');
      return;
    }

    const monthly = (pv / 1000) * effectiveCpm;
    const annual = monthly * 12;
    const header = annual * HEADER_BIDDING_MULTIPLIER;

    const annual20 = ((pv * 1.2) / 1000) * effectiveCpm * 12;
    const annual50 = ((pv * 1.5) / 1000) * effectiveCpm * 12;

    setAdsenseMonthly(monthly);
    setAdsenseAnnual(annual);
    setHeaderAnnual(header);
    setAdsenseAnnual20(annual20);
    setAdsenseAnnual50(annual50);
  };

  // Button press animation then calculate
  const handleCalculatePress = () => {
    Animated.sequence([
      Animated.timing(calculateScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(calculateScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(handleCalculate);
  };

  // Copy summary to clipboard
  const handleCopySummary = async () => {
    if (
      adsenseMonthly === null ||
      adsenseAnnual === null ||
      headerAnnual === null
    ) {
      Alert.alert('No calculation yet', 'Please run a calculation first.');
      return;
    }

    const summary = [
      'AdSense Revenue Calculator – Summary',
      `Region tier: ${regionTier}`,
      `Category: ${category}`,
      `Monthly pageviews: ${monthlyPageviews}`,
      `Estimated monthly AdSense revenue: €${adsenseMonthly.toFixed(2)}`,
      `Estimated annual AdSense revenue: €${adsenseAnnual.toFixed(2)}`,
      `Estimated annual header bidding revenue: €${headerAnnual.toFixed(2)}`,
      adsenseAnnual20 !== null
        ? `Scenario +20% traffic → €${adsenseAnnual20.toFixed(2)}`
        : '',
      adsenseAnnual50 !== null
        ? `Scenario +50% traffic → €${adsenseAnnual50.toFixed(2)}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    await Clipboard.setStringAsync(summary);
    Alert.alert('Copied', 'Summary copied to clipboard.');
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      <HeroHeader />

      {selectedSite ? (
        <ActiveSiteCard site={selectedSite} selected />
      ) : (
        <Text style={styles.headerHint}>
          Pick a saved site or create one below to calculate revenue.
        </Text>
      )}

      <SiteList
        sites={sites}
        sitesLoading={sitesLoading}
        selectedSiteId={selectedSiteId}
        onSelectSite={(id) => {
          setSelectedSiteId(id);
          const found = sites.find((s) => s.id === id);
          if (found) {
            setRegionTier(found.region_tier);
            setCategory(found.category);
            setMonthlyPageviews(String(found.monthly_pageviews));
          }
        }}
      />

      <RegionTierSelector
        regionTier={regionTier}
        onSelectTier={setRegionTier}
        tiers={REGION_TIERS}
      />

      <CategorySelector
        category={category}
        onSelectCategory={setCategory}
        categories={CATEGORIES}
      />

      <NewSiteForm
        newSiteName={newSiteName}
        monthlyPageviews={monthlyPageviews}
        creatingSite={creatingSite}
        onChangeName={setNewSiteName}
        onChangePageviews={setMonthlyPageviews}
        onCreateSite={handleCreateSite}
      />

      <TrafficInput
        monthlyPageviews={monthlyPageviews}
        onChangePageviews={setMonthlyPageviews}
        onCalculate={handleCalculatePress}
        selectedSite={selectedSite}
        calculateScale={calculateScale}
      />

      {selectedSite && adsenseMonthly !== null && adsenseAnnual !== null && headerAnnual !== null && (
        <RevenueStats
          adsenseMonthly={adsenseMonthly}
          adsenseAnnual={adsenseAnnual}
          headerAnnual={headerAnnual}
        />
      )}

      {selectedSite && adsenseMonthly !== null && adsenseAnnual !== null && headerAnnual !== null && (
        <EstimatedRevenue
          effectiveCpm={effectiveCpm}
          gaugeAnim={gaugeAnim}
          adsenseMonthly={adsenseMonthly}
          adsenseAnnual={adsenseAnnual}
          headerAnnual={headerAnnual}
          adsenseAnnual20={adsenseAnnual20}
          adsenseAnnual50={adsenseAnnual50}
          onCopySummary={handleCopySummary}
        />
      )}

      <ExplanationCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 32,
  },
  headerHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#6B7280',
  },
});
