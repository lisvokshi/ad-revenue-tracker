import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../supabaseClient';

type Mode = 'login' | 'register';
type RegionTier = 'Tier 1' | 'Tier 2' | 'Tier 3';
type Theme = 'dark' | 'light';

type CalculatorProps = {
  onLogout: () => void;
  theme: Theme;
  onToggleTheme: () => void;
};

type Site = {
  id: string;
  name: string;
  region_tier: RegionTier;
  category: string;
  monthly_pageviews: number;
};

// Region tiers like the online calculator
const REGION_TIERS: RegionTier[] = ['Tier 1', 'Tier 2', 'Tier 3'];

// Categories – aligned with typical AdSense / content taxonomies
const CATEGORIES: string[] = [
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

// Baseline CPM (per 1000 pageviews) per tier – rough assumptions
const BASE_CPM_BY_TIER: Record<RegionTier, number> = {
  'Tier 1': 2.0,
  'Tier 2': 1.2,
  'Tier 3': 0.5,
};

// Category multipliers – show that niche changes RPM
const CATEGORY_MULTIPLIERS: Record<string, number> = {
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

// Header bidding uplift – central value ~+50%
const HEADER_BIDDING_MULTIPLIER = 1.5;

// -------------------- MAIN CALCULATOR SCREEN --------------------

function AdSenseRevenueCalculatorScreen({
  onLogout,
  theme,
  onToggleTheme,
}: CalculatorProps) {
  const [userId, setUserId] = useState<string | null>(null);

  // Website profiles from Supabase
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [creatingSite, setCreatingSite] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // New site form
  const [newSiteName, setNewSiteName] = useState('');
  const [newSitePageviews, setNewSitePageviews] = useState('');

  // Calculator state
  const [regionTier, setRegionTier] = useState<RegionTier>('Tier 1');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [monthlyPageviews, setMonthlyPageviews] = useState('');

  const [adsenseMonthly, setAdsenseMonthly] = useState<number | null>(null);
  const [adsenseAnnual, setAdsenseAnnual] = useState<number | null>(null);
  const [headerAnnual, setHeaderAnnual] = useState<number | null>(null);

  const [adsenseMonthly20, setAdsenseMonthly20] = useState<number | null>(null);
  const [adsenseAnnual20, setAdsenseAnnual20] = useState<number | null>(null);
  const [adsenseAnnual50, setAdsenseAnnual50] = useState<number | null>(null);

  // Animation values
  const [calculateScale] = useState(new Animated.Value(1));
  const [gaugeAnim] = useState(new Animated.Value(0));

  // Effective CPM (RPM) for gauge
  const baseCpm = BASE_CPM_BY_TIER[regionTier];
  const categoryFactor = CATEGORY_MULTIPLIERS[category] ?? 1.0;
  const effectiveCpm = baseCpm * categoryFactor;
  // Map RPM into 0–1 range, assuming ~3€ = "high"
  const rpmScore = Math.min(effectiveCpm / 3, 1);

  // Gauge animation when results change
  useEffect(() => {
    if (adsenseMonthly === null) return;
    Animated.timing(gaugeAnim, {
      toValue: rpmScore,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [adsenseMonthly, rpmScore, gaugeAnim]);

  // Load authenticated user id
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.error(error);
        Alert.alert('Auth error', 'User not found. Please log in again.');
        return;
      }
      setUserId(data.user.id);
    };
    loadUser();
  }, []);

  // Load sites for this user
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
          console.error(error);
          Alert.alert('Error', 'Could not load your sites.');
          return;
        }

        const typed = (data || []) as Site[];
        setSites(typed);
        if (typed.length > 0 && !selectedSiteId) {
          setSelectedSiteId(typed[0].id);
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Unexpected error loading sites.');
      } finally {
        setSitesLoading(false);
      }
    };

    loadSites();
  }, [userId, selectedSiteId]);

  // When site changes, prefill calculator with its settings
  useEffect(() => {
    if (!selectedSiteId) return;
    const site = sites.find((s) => s.id === selectedSiteId);
    if (!site) return;

    setRegionTier(site.region_tier);
    setCategory(site.category);
    setMonthlyPageviews(String(site.monthly_pageviews));
  }, [selectedSiteId, sites]);

  const selectedSite = selectedSiteId
    ? sites.find((s) => s.id === selectedSiteId)
    : null;

  const handleCreateSite = async () => {
    if (!userId) {
      Alert.alert('Auth error', 'User not found. Please log in again.');
      return;
    }

    if (!newSiteName || !newSitePageviews) {
      Alert.alert('Missing fields', 'Please enter site name and pageviews.');
      return;
    }

    const pv = Number(newSitePageviews);
    if (Number.isNaN(pv) || pv <= 0) {
      Alert.alert(
        'Invalid pageviews',
        'Please enter a positive number for pageviews.',
      );
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
        console.error(error);
        Alert.alert('Error', 'Could not save site profile.');
        return;
      }

      const newSite = data as Site;
      setSites((prev) => [...prev, newSite]);
      setSelectedSiteId(newSite.id);
      setNewSiteName('');
      setNewSitePageviews('');
      Alert.alert('Success', 'Website profile saved.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unexpected error saving site profile.');
    } finally {
      setCreatingSite(false);
    }
  };

  const handleCalculate = () => {
    const pv = Number(monthlyPageviews);

    if (Number.isNaN(pv) || pv <= 0) {
      Alert.alert(
        'Invalid input',
        'Please enter a positive number for pageviews per month.',
      );
      return;
    }

    const base = BASE_CPM_BY_TIER[regionTier];
    const factor = CATEGORY_MULTIPLIERS[category] ?? 1.0;
    const effective = base * factor;

    // Monthly AdSense revenue = (pageviews / 1000) × CPM
    const monthly = (pv / 1000) * effective;
    const annual = monthly * 12;
    const header = annual * HEADER_BIDDING_MULTIPLIER;

    // Scenario: +20% traffic
    const monthly20 = ((pv * 1.2) / 1000) * effective;
    const annual20 = monthly20 * 12;

    // Scenario: +50% traffic
    const monthly50 = ((pv * 1.5) / 1000) * effective;
    const annual50 = monthly50 * 12;

    setAdsenseMonthly(monthly);
    setAdsenseAnnual(annual);
    setHeaderAnnual(header);
    setAdsenseMonthly20(monthly20);
    setAdsenseAnnual20(annual20);
    setAdsenseAnnual50(annual50);
  };

  const handleCalculatePress = () => {
    Animated.sequence([
      Animated.timing(calculateScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(calculateScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(handleCalculate);
  };

  const handleCopySummary = async () => {
    if (
      adsenseMonthly === null ||
      adsenseAnnual === null ||
      headerAnnual === null
    ) {
      Alert.alert(
        'No calculation yet',
        'Please run a calculation before copying the summary.',
      );
      return;
    }

    const pv = monthlyPageviews || (selectedSite?.monthly_pageviews ?? '');

    const summary = [
      'AdSense Revenue Calculator – Summary',
      `Region tier: ${regionTier}`,
      `Category: ${category}`,
      `Monthly pageviews: ${pv}`,
      '',
      `Estimated monthly AdSense revenue: €${adsenseMonthly.toFixed(2)}`,
      `Estimated annual AdSense revenue: €${adsenseAnnual.toFixed(2)}`,
      `Estimated annual header bidding revenue: €${headerAnnual.toFixed(2)}`,
      '',
      adsenseAnnual20 !== null
        ? `Scenario +20% traffic → annual AdSense ≈ €${adsenseAnnual20.toFixed(
            2,
          )}`
        : '',
      adsenseAnnual50 !== null
        ? `Scenario +50% traffic → annual AdSense ≈ €${adsenseAnnual50.toFixed(
            2,
          )}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    await Clipboard.setStringAsync(summary);
    Alert.alert('Copied', 'Summary copied to clipboard.');
  };

  return (
    <ScrollView
      style={[styles.container, theme === 'light' && stylesLight.container]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO HEADER */}
      <View style={styles.heroTopRow}>
        <View style={styles.heroBrand}>
          <Text style={styles.heroLogo}>▶︎</Text>
          <View>
            <Text
              style={[
                styles.heroTitle,
                theme === 'light' && stylesLight.heroTitle,
              ]}
            >
              Ad Revenue Studio
            </Text>
            <Text
              style={[
                styles.heroSubtitle,
                theme === 'light' && stylesLight.heroSubtitle,
              ]}
            >
              Model AdSense & header bidding revenue with live site profiles and
              what-if scenarios.
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.themeToggle} onPress={onToggleTheme}>
          <Text style={styles.themeToggleIcon}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </Text>
          <Text style={styles.themeToggleText}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroBadgesRow}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Ad Tools</Text>
        </View>
        <Text style={styles.heroBeta}>Beta</Text>
      </View>

      {selectedSite ? (
        <View style={styles.activeSiteCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.activeSiteLabel}>Active site</Text>
            <Text style={styles.activeSiteName}>{selectedSite.name}</Text>
            <Text style={styles.activeSiteMeta}>
              {selectedSite.region_tier} · {selectedSite.category}
            </Text>
          </View>
          <View style={styles.activeSiteStat}>
            <Text style={styles.activeSiteStatLabel}>Traffic</Text>
            <Text style={styles.activeSiteStatValue}>
              {selectedSite.monthly_pageviews.toLocaleString()}
            </Text>
            <Text style={styles.activeSiteStatMeta}>pv / month</Text>
          </View>
        </View>
      ) : (
        <Text
          style={[
            styles.headerHint,
            theme === 'light' && stylesLight.headerHint,
          ]}
        >
          Create a website profile or type values manually below.
        </Text>
      )}

      {/* QUICK STATS */}
      {adsenseMonthly !== null &&
        adsenseAnnual !== null &&
        headerAnnual !== null && (
          <View style={styles.statRow}>
            <View
              style={[
                styles.statCard,
                theme === 'light' && stylesLight.statCard,
              ]}
            >
              <Text style={styles.statLabel}>Monthly AdSense</Text>
              <Text style={styles.statValue}>
                €{adsenseMonthly.toFixed(0)}
              </Text>
              <Text style={styles.statMeta}>Baseline estimate</Text>
            </View>
            <View
              style={[
                styles.statCard,
                theme === 'light' && stylesLight.statCard,
              ]}
            >
              <Text style={styles.statLabel}>Annual AdSense</Text>
              <Text style={styles.statValue}>
                €{adsenseAnnual.toFixed(0)}
              </Text>
              <Text style={styles.statMeta}>Current traffic</Text>
            </View>
            <View
              style={[
                styles.statCard,
                styles.statCardAccent,
                theme === 'light' && stylesLight.statCardAccent,
              ]}
            >
              <Text style={styles.statLabel}>Header bidding</Text>
              <Text style={styles.statValue}>
                €{headerAnnual.toFixed(0)}
              </Text>
              <Text style={styles.statMeta}>AdSense × 1.5 uplift</Text>
            </View>
          </View>
        )}

      {/* WEBSITE PROFILES */}
      <View
        style={[styles.card, theme === 'light' && stylesLight.card]}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Website profiles</Text>
          <Text style={styles.cardTag}>Saved in your account</Text>
        </View>

        <Text style={styles.helperText}>
          Store each site or language edition with its typical traffic. Profiles
          are synced with Supabase so you can reuse them later.
        </Text>

        {sitesLoading ? (
          <View style={styles.centerRow}>
            <ActivityIndicator />
          </View>
        ) : sites.length === 0 ? (
          <Text style={styles.helperTextMuted}>
            No sites yet. Create your first profile below.
          </Text>
        ) : (
          <View style={{ marginTop: 10 }}>
            {sites.map((site) => (
              <TouchableOpacity
                key={site.id}
                style={[
                  styles.siteRow,
                  selectedSiteId === site.id && styles.siteRowSelected,
                ]}
                onPress={() => setSelectedSiteId(site.id)}
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
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.siteTraffic}>
                    {site.monthly_pageviews.toLocaleString()}
                  </Text>
                  <Text style={styles.siteMetaSmall}>pv / month</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.newSiteContainer}>
          <Text style={styles.subSectionTitle}>New profile</Text>

          <Text style={styles.label}>Site name</Text>
          <TextInput
            style={[
              styles.input,
              theme === 'light' && stylesLight.input,
            ]}
            placeholder="e.g. DailyMail – English"
            placeholderTextColor="#64748b"
            value={newSiteName}
            onChangeText={setNewSiteName}
          />

          <Text style={styles.label}>Monthly pageviews</Text>
          <TextInput
            style={[
              styles.input,
              theme === 'light' && stylesLight.input,
            ]}
            placeholder="e.g. 1 200 000"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            value={newSitePageviews}
            onChangeText={setNewSitePageviews}
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              creatingSite && styles.buttonDisabled,
            ]}
            onPress={handleCreateSite}
            disabled={creatingSite}
          >
            {creatingSite ? (
              <ActivityIndicator color="#E5E7EB" />
            ) : (
              <Text style={styles.primaryButtonText}>Save website profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* REGION TIER */}
      <View
        style={[styles.card, theme === 'light' && stylesLight.card]}
      >
        <Text style={styles.cardTitle}>Region tier</Text>
        <Text style={styles.helperText}>
          Tier 1 – highest-value countries (US, UK, DE, etc.){'\n'}
          Tier 2 – mid-value markets{'\n'}
          Tier 3 – emerging markets and long-tail traffic.
        </Text>

        <View style={styles.tierRow}>
          {REGION_TIERS.map((tier) => (
            <TouchableOpacity
              key={tier}
              style={[
                styles.tierButton,
                regionTier === tier && styles.tierButtonSelected,
              ]}
              onPress={() => setRegionTier(tier)}
            >
              <Text
                style={[
                  styles.tierButtonText,
                  regionTier === tier && styles.tierButtonTextSelected,
                ]}
              >
                {tier}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CATEGORY */}
      <View
        style={[styles.card, theme === 'light' && stylesLight.card]}
      >
        <Text style={styles.cardTitle}>Content category</Text>
        <Text style={styles.helperText}>
          Different verticals attract different advertiser bids. Finance and
          Real Estate usually have stronger RPMs than generic News, for example.
        </Text>

        <View style={styles.chipContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                category === cat && styles.chipSelected,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  category === cat && styles.chipTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TRAFFIC + CALCULATE */}
      <View
        style={[styles.card, theme === 'light' && stylesLight.card]}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Traffic assumptions</Text>
          {selectedSite && (
            <TouchableOpacity
              onPress={() =>
                setMonthlyPageviews(String(selectedSite.monthly_pageviews))
              }
            >
              <Text style={styles.inlineAction}>
                Use “{selectedSite.name}”
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Pageviews per month</Text>
        <TextInput
          style={[
            styles.input,
            theme === 'light' && stylesLight.input,
          ]}
          placeholder="e.g. 1 500 000"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={monthlyPageviews}
          onChangeText={setMonthlyPageviews}
        />

        <Animated.View style={{ transform: [{ scale: calculateScale }] }}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCalculatePress}
          >
            <Text style={styles.primaryButtonText}>Calculate revenue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* RESULTS & SCENARIOS */}
      {adsenseMonthly !== null &&
        adsenseAnnual !== null &&
        headerAnnual !== null && (
          <View
            style={[
              styles.cardEmphasis,
              theme === 'light' && stylesLight.cardEmphasis,
            ]}
          >
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
              <View
                style={[
                  styles.gaugeBar,
                  theme === 'light' && stylesLight.gaugeBar,
                ]}
              >
                <Animated.View
                  style={[
                    styles.gaugeFill,
                    {
                      width: gaugeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['8%', '100%'],
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

            <Text style={styles.resultLabel}>
              Monthly AdSense revenue (estimate)
            </Text>
            <Text style={styles.cardValue}>€{adsenseMonthly.toFixed(2)}</Text>

            <Text style={styles.resultLabel}>
              Annual AdSense revenue (estimate)
            </Text>
            <Text style={styles.cardValue}>€{adsenseAnnual.toFixed(2)}</Text>

            <Text style={styles.resultLabel}>
              Annual header bidding revenue (estimate)
            </Text>
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
              These values are estimates only. Real revenue depends on device
              mix, layout, viewability, seasonality, and advertiser demand.
            </Text>

            <TouchableOpacity
              style={styles.smallButtonOutline}
              onPress={handleCopySummary}
            >
              <Text style={styles.smallButtonOutlineText}>Copy summary</Text>
            </TouchableOpacity>
          </View>
        )}

      {/* EXPLANATION CARD */}
      <View
        style={[styles.card, theme === 'light' && stylesLight.card]}
      >
        <Text style={styles.cardTitle}>How this calculator works</Text>
        <Text style={styles.helperText}>
          • We estimate CPM (revenue per 1000 pageviews) based on your region
          tier and content category.{'\n'}
          • Monthly AdSense revenue ≈ (pageviews ÷ 1000) × CPM.{'\n'}
          • Annual AdSense revenue = monthly × 12.{'\n'}
          • Header bidding is modelled as +50% uplift over AdSense baseline.{'\n'}
          • Scenario analysis shows how annual revenue changes if traffic grows
          by +20% or +50% at the same RPM.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={onLogout}
      >
        <Text
          style={[
            styles.buttonSecondaryText,
            theme === 'light' && stylesLight.buttonSecondaryText,
          ]}
        >
          Log out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// -------------------- AUTH SCREEN --------------------

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [authScale] = useState(new Animated.Value(1));

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);

      let result;
      if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      }

      if (result.error) {
        console.error(result.error);
        Alert.alert('Auth error', result.error.message);
        return;
      }

      if (mode === 'login') {
        Alert.alert('Success', 'Logged in successfully.');
        setLoggedIn(true);
      } else {
        Alert.alert(
          'Success',
          'Registered successfully. Please check your email if confirmation is required.',
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Unexpected error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthPress = () => {
    Animated.sequence([
      Animated.timing(authScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(authScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(handleAuth);
  };

  if (loggedIn) {
    return (
      <AdSenseRevenueCalculatorScreen
        onLogout={() => setLoggedIn(false)}
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
        }
      />
    );
  }

  return (
    <View
      style={[styles.authRoot, theme === 'light' && stylesLight.authRoot]}
    >
      <View style={styles.authBrandRow}>
        <View style={styles.authBrand}>
          <Text style={styles.authLogo}>▶︎</Text>
          <View>
            <Text
              style={[
                styles.authTitle,
                theme === 'light' && stylesLight.authTitle,
              ]}
            >
              Ad Revenue Studio
            </Text>
            <Text
              style={[
                styles.authSubtitle,
                theme === 'light' && stylesLight.authSubtitle,
              ]}
            >
              Forecast your AdSense & header bidding income.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.themeToggle}
          onPress={() =>
            setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
          }
        >
          <Text style={styles.themeToggleIcon}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </Text>
          <Text style={styles.themeToggleText}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.authCard, theme === 'light' && stylesLight.authCard]}
      >
        <View style={styles.authModeRow}>
          <TouchableOpacity
            style={[
              styles.authModeButton,
              mode === 'login' && styles.authModeButtonActive,
            ]}
            onPress={() => setMode('login')}
            disabled={loading}
          >
            <Text
              style={[
                styles.authModeText,
                mode === 'login' && styles.authModeTextActive,
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.authModeButton,
              mode === 'register' && styles.authModeButtonActive,
            ]}
            onPress={() => setMode('register')}
            disabled={loading}
          >
            <Text
              style={[
                styles.authModeText,
                mode === 'register' && styles.authModeTextActive,
              ]}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            theme === 'light' && stylesLight.input,
          ]}
          placeholder="you@example.com"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[
            styles.input,
            theme === 'light' && stylesLight.input,
          ]}
          placeholder="********"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Animated.View style={{ transform: [{ scale: authScale }] }}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleAuthPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#E5E7EB" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Login' : 'Create account'}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.authHintText}>
          You can switch between login and register above. Accounts are managed
          via Supabase auth.
        </Text>
      </View>

      <Text style={styles.authFooterText}>
        By signing in you agree to the demo terms – this tool is for estimation
        only.
      </Text>
    </View>
  );
}

// -------------------- STYLES --------------------

const styles = StyleSheet.create({
  // SHARED ROOTS
  container: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
  },

  // HERO
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
  headerHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#6B7280',
  },

  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#020617',
  },
  themeToggleIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  themeToggleText: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  activeSiteCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1D4ED8',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 14,
  },
  activeSiteLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  activeSiteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginTop: 4,
  },
  activeSiteMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activeSiteStat: {
    marginLeft: 16,
    alignItems: 'flex-end',
  },
  activeSiteStatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  activeSiteStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A5B4FC',
  },
  activeSiteStatMeta: {
    fontSize: 11,
    color: '#6B7280',
  },

  // QUICK STATS
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
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
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

  // GENERIC TEXT
  label: {
    fontSize: 13,
    marginBottom: 4,
    marginTop: 12,
    color: '#E5E7EB',
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  helperTextMuted: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },

  // INPUTS
  input: {
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#020617',
    color: '#E5E7EB',
    fontSize: 14,
  },

  // BUTTONS
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#22C55E',
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#022C22',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonSecondary: {
    marginTop: 24,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#E5E7EB',
    fontWeight: '500',
    fontSize: 14,
  },
  smallButtonOutline: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#22C55E',
    alignItems: 'center',
  },
  smallButtonOutlineText: {
    color: '#BBF7D0',
    fontSize: 12,
    fontWeight: '500',
  },
  inlineAction: {
    fontSize: 12,
    color: '#60A5FA',
  },

  // CARDS
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
  cardEmphasis: {
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 4,
    fontWeight: '600',
  },
  cardTag: {
    fontSize: 11,
    color: '#6B7280',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardTagGreen: {
    fontSize: 11,
    color: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
    color: '#F9FAFB',
  },

  subSectionTitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },

  // WEBSITE LIST
  centerRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#020617',
  },
  siteRowSelected: {
    backgroundColor: '#020617',
    borderColor: '#1D4ED8',
    borderWidth: 1,
  },
  siteName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  siteNameSelected: {
    color: '#22C55E',
  },
  siteMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  siteTraffic: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  siteMetaSmall: {
    fontSize: 11,
    color: '#6B7280',
  },
  newSiteContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#111827',
    paddingTop: 12,
  },

  // REGION TIER
  tierRow: {
    flexDirection: 'row',
    marginTop: 12,
  } as any,
  tierButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    backgroundColor: '#020617',
    marginRight: 8,
  },
  tierButtonSelected: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  tierButtonText: {
    color: '#E5E7EB',
    fontWeight: '500',
    fontSize: 13,
  },
  tierButtonTextSelected: {
    color: '#F9FAFB',
    fontWeight: '600',
  },

  // CATEGORY CHIPS
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  } as any,
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 8,
    marginTop: 8,
    backgroundColor: '#020617',
  },
  chipSelected: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  chipText: {
    fontSize: 12,
    color: '#CBD5F5',
  },
  chipTextSelected: {
    color: '#F9FAFB',
    fontWeight: '600',
  },

  // RESULT TEXT
  resultLabel: {
    marginTop: 12,
    fontSize: 13,
    color: '#9CA3AF',
  },
  scenarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  scenarioLabel: {
    fontSize: 13,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  scenarioMeta: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  scenarioValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
  },

  // GAUGE
  gaugeContainer: {
    marginTop: 10,
    marginBottom: 8,
  },
  gaugeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gaugeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  gaugeValue: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  gaugeBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#111827',
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#22C55E',
  },
  gaugeScaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  gaugeScaleText: {
    fontSize: 10,
    color: '#6B7280',
  },

  // AUTH SCREEN
  authRoot: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  authBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
    justifyContent: 'space-between',
  },
  authBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authLogo: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#22C55E',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#022C22',
    fontWeight: '800',
    marginRight: 12,
    fontSize: 20,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  authSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  authCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
    elevation: 12,
  },
  authModeRow: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#111827',
    padding: 3,
    marginBottom: 14,
  },
  authModeButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 7,
    alignItems: 'center',
  },
  authModeButtonActive: {
    backgroundColor: '#111827',
  },
  authModeText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  authModeTextActive: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  authHintText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 10,
    lineHeight: 16,
  },
  authFooterText: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 16,
  },
});

// LIGHT THEME OVERRIDES
const stylesLight = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
  },
  authRoot: {
    backgroundColor: '#F9FAFB',
  },
  heroTitle: {
    color: '#020617',
  },
  heroSubtitle: {
    color: '#4B5563',
  },
  headerHint: {
    color: '#6B7280',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  cardEmphasis: {
    backgroundColor: '#ECFDF3',
    borderColor: '#22C55E',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  statCardAccent: {
    borderColor: '#22C55E',
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  authTitle: {
    color: '#111827',
  },
  authSubtitle: {
    color: '#4B5563',
  },
  buttonSecondaryText: {
    color: '#111827',
  },
  gaugeBar: {
    backgroundColor: '#E5E7EB',
  },
});
