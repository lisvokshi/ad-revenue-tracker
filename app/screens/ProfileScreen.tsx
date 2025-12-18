import type { User } from '@supabase/supabase-js';
import * as Clipboard from 'expo-clipboard';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import HeroHeader from '../components/HeroHeader';
import LogoutButton from '../components/LogoutButton';
import { globalStyles } from '../styles/styles';
import { supabase } from '../supabaseClient';

type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
};

type Site = {
  id: string;
  name: string;
  region_tier: string;
  category: string;
  monthly_pageviews: number;
};

type Props = {
  user: User;
  onLogout?: () => void;
};

const TIMEZONE_LABEL = 'Central European Time (CET)';

const EUROPEAN_COUNTRIES: CountryOption[] = [
  { code: 'AL', name: 'Albania', dialCode: '+355' },
  { code: 'AD', name: 'Andorra', dialCode: '+376' },
  { code: 'AM', name: 'Armenia', dialCode: '+374' },
  { code: 'AT', name: 'Austria', dialCode: '+43' },
  { code: 'AZ', name: 'Azerbaijan', dialCode: '+994' },
  { code: 'BY', name: 'Belarus', dialCode: '+375' },
  { code: 'BE', name: 'Belgium', dialCode: '+32' },
  { code: 'BA', name: 'Bosnia and Herzegovina', dialCode: '+387' },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359' },
  { code: 'HR', name: 'Croatia', dialCode: '+385' },
  { code: 'CY', name: 'Cyprus', dialCode: '+357' },
  { code: 'CZ', name: 'Czechia', dialCode: '+420' },
  { code: 'DK', name: 'Denmark', dialCode: '+45' },
  { code: 'EE', name: 'Estonia', dialCode: '+372' },
  { code: 'FI', name: 'Finland', dialCode: '+358' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'GE', name: 'Georgia', dialCode: '+995' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'GR', name: 'Greece', dialCode: '+30' },
  { code: 'HU', name: 'Hungary', dialCode: '+36' },
  { code: 'IS', name: 'Iceland', dialCode: '+354' },
  { code: 'IE', name: 'Ireland', dialCode: '+353' },
  { code: 'IT', name: 'Italy', dialCode: '+39' },
  { code: 'XK', name: 'Kosovo', dialCode: '+383' },
  { code: 'LV', name: 'Latvia', dialCode: '+371' },
  { code: 'LI', name: 'Liechtenstein', dialCode: '+423' },
  { code: 'LT', name: 'Lithuania', dialCode: '+370' },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352' },
  { code: 'MT', name: 'Malta', dialCode: '+356' },
  { code: 'MD', name: 'Moldova', dialCode: '+373' },
  { code: 'MC', name: 'Monaco', dialCode: '+377' },
  { code: 'ME', name: 'Montenegro', dialCode: '+382' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31' },
  { code: 'MK', name: 'North Macedonia', dialCode: '+389' },
  { code: 'NO', name: 'Norway', dialCode: '+47' },
  { code: 'PL', name: 'Poland', dialCode: '+48' },
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'RO', name: 'Romania', dialCode: '+40' },
  { code: 'SM', name: 'San Marino', dialCode: '+378' },
  { code: 'RS', name: 'Serbia', dialCode: '+381' },
  { code: 'SK', name: 'Slovakia', dialCode: '+421' },
  { code: 'SI', name: 'Slovenia', dialCode: '+386' },
  { code: 'ES', name: 'Spain', dialCode: '+34' },
  { code: 'SE', name: 'Sweden', dialCode: '+46' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41' },
  { code: 'TR', name: 'Turkey', dialCode: '+90' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'VA', name: 'Vatican City', dialCode: '+39' },
];

const DEFAULT_COUNTRY =
  EUROPEAN_COUNTRIES.find((country) => country.code === 'DE') ?? EUROPEAN_COUNTRIES[0];

function derivePublisherId(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  const code = hash.toString(36).toUpperCase().padStart(8, '0').slice(-8);
  return `PUB-${code}`;
}

function findCountry(value?: string | null) {
  if (!value) return undefined;
  const lowered = value.toLowerCase();
  return EUROPEAN_COUNTRIES.find(
    (country) =>
      country.code.toLowerCase() === lowered ||
      country.name.toLowerCase() === lowered,
  );
}

function parsePhone(metadata: Record<string, any>) {
  const rawPhone = String(metadata.phone ?? metadata.phone_number ?? '').trim();
  if (!rawPhone) return { dialCode: undefined as string | undefined, phone: '' };
  const country = EUROPEAN_COUNTRIES.find((option) =>
    rawPhone.startsWith(option.dialCode),
  );
  if (country) {
    const rest = rawPhone.slice(country.dialCode.length).trim();
    return { dialCode: country.dialCode, phone: rest };
  }
  return { dialCode: undefined as string | undefined, phone: rawPhone };
}

export default function ProfileScreen({ user, onLogout }: Props) {
  const metadata = user.user_metadata ?? {};
  const [firstName, setFirstName] = useState<string>(
    metadata.first_name ??
      metadata.given_name ??
      (metadata.name ? String(metadata.name).split(' ')[0] : ''),
  );
  const [lastName, setLastName] = useState<string>(
    metadata.last_name ??
      metadata.family_name ??
      (metadata.name ? String(metadata.name).split(' ').slice(1).join(' ') : ''),
  );

  const initialCountry =
    findCountry(metadata.region) ??
    findCountry(metadata.country) ??
    findCountry(metadata.country_code) ??
    DEFAULT_COUNTRY;
  const [country, setCountry] = useState<CountryOption>(initialCountry);

  const parsedPhone = parsePhone(metadata);
  const [selectedDialCode, setSelectedDialCode] = useState<string>(
    parsedPhone.dialCode ?? country.dialCode,
  );
  const [phoneNumber, setPhoneNumber] = useState<string>(parsedPhone.phone);
  const [saving, setSaving] = useState(false);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const [dialPickerOpen, setDialPickerOpen] = useState(false);
  const [editing, setEditing] = useState(true);
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);

  const publisherId = useMemo(() => derivePublisherId(user.id), [user.id]);

  const dialCodeOptions = useMemo(() => {
    const unique = new Map<string, CountryOption>();
    EUROPEAN_COUNTRIES.forEach((option) => {
      if (!unique.has(option.dialCode)) {
        unique.set(option.dialCode, option);
      }
    });
    return Array.from(unique.values());
  }, []);

  const handleSelectCountry = (option: CountryOption) => {
    setCountry(option);
    setSelectedDialCode(option.dialCode);
  };

  const handleCopyPublisherId = async () => {
    await Clipboard.setStringAsync(publisherId);
    Alert.alert('Copied', 'Publisher ID copied to clipboard.');
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const contactNumber = `${selectedDialCode} ${phoneNumber}`.trim();
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          region: country.name,
          country_code: country.code,
          dial_code: selectedDialCode,
          phone_number: contactNumber,
          timezone: TIMEZONE_LABEL,
          access_level: 'admin',
          publisher_id: publisherId,
        },
      });
      if (error) {
        Alert.alert('Save failed', 'Could not update your profile. Please try again.');
        return;
      }
      Alert.alert('Profile updated', 'We saved your profile details.');
      setEditing(false);
      setRegionPickerOpen(false);
      setDialPickerOpen(false);
    } catch (err) {
      Alert.alert('Unexpected error', 'Could not save your profile right now.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = () => {
    setEditing(true);
    setRegionPickerOpen(false);
    setDialPickerOpen(false);
  };

  React.useEffect(() => {
    const loadSites = async () => {
      try {
        setSitesLoading(true);
        const { data, error } = await supabase
          .from('sites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        if (error) {
          console.warn('Sites load error', error);
          return;
        }
        setSites((data ?? []) as Site[]);
      } finally {
        setSitesLoading(false);
      }
    };
    loadSites();
  }, [user.id]);

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Add your name';

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <HeroHeader />

      <View style={[globalStyles.card, styles.overviewCard]}>
        <View style={styles.overviewRow}>
          <Text style={styles.sectionTitle}>Profile overview</Text>
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>Admin</Text>
          </View>
        </View>
        <Text style={styles.primaryText}>{fullName}</Text>
        <Text style={styles.subtleText}>{user.email ?? 'No email on file'}</Text>

        <View style={styles.badgeRow}>
          <TouchableOpacity
            style={[styles.badge, styles.badgeSpacer]}
            onPress={handleCopyPublisherId}
          >
            <Text style={styles.badgeLabel}>Publisher ID</Text>
            <Text style={styles.badgeValue}>{publisherId}</Text>
            <Text style={styles.badgeHint}>Tap to copy</Text>
            <Text style={styles.badgeNote}>
              Static ID used for your Google AdSense setup.
            </Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Time zone</Text>
            <Text style={styles.badgeValue}>{TIMEZONE_LABEL}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Region</Text>
            <Text style={styles.summaryValue}>{country.name}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Contact</Text>
            <Text style={styles.summaryValue}>
              {selectedDialCode} {phoneNumber || 'Add number'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Access</Text>
            <Text style={styles.summaryValue}>Admin</Text>
          </View>
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>Saved website profiles</Text>
        {sitesLoading ? (
          <View style={styles.centerRow}>
            <ActivityIndicator />
          </View>
        ) : sites.length === 0 ? (
          <Text style={styles.helperText}>
            No saved website profiles yet. Add them from the Calculator tab.
          </Text>
        ) : (
          <View style={styles.siteList}>
            {sites.map((site) => (
              <View key={site.id} style={styles.siteRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.siteName}>{site.name}</Text>
                  <Text style={styles.siteMeta}>
                    {site.region_tier} • {site.category}
                  </Text>
                </View>
                <View style={styles.siteStat}>
                  <Text style={styles.siteTraffic}>{site.monthly_pageviews.toLocaleString()}</Text>
                  <Text style={styles.siteMetaSmall}>pv / month</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {editing ? (
        <>
          <View style={globalStyles.card}>
            <Text style={styles.sectionTitle}>Identity</Text>
            <Text style={globalStyles.label}>First name</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="First name"
              placeholderTextColor="#64748b"
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={globalStyles.label}>Last name</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Last name"
              placeholderTextColor="#64748b"
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={globalStyles.label}>Email</Text>
            <View style={styles.readonlyField}>
              <Text style={styles.readonlyText}>{user.email ?? 'No email on file'}</Text>
            </View>
          </View>

          <View style={globalStyles.card}>
            <Text style={styles.sectionTitle}>Region and time</Text>
            <Text style={styles.helperText}>
              Select your home region. Only European countries are available, including Kosovo.
            </Text>
            <Text style={globalStyles.label}>Region</Text>
            <Pressable
              style={styles.selectBox}
              onPress={() => setRegionPickerOpen((prev) => !prev)}
            >
              <Text style={styles.selectValue}>{country.name}</Text>
              <Text style={styles.selectCaret}>{regionPickerOpen ? '^' : 'v'}</Text>
            </Pressable>
            {regionPickerOpen ? (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll}>
                  {EUROPEAN_COUNTRIES.map((option) => (
                    <Pressable
                      key={option.code}
                      style={[
                        styles.dropdownItem,
                        country.code === option.code && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        handleSelectCountry(option);
                        setRegionPickerOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          country.code === option.code && styles.dropdownTextSelected,
                        ]}
                      >
                        {option.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <Text style={globalStyles.label}>Time zone</Text>
            <View style={styles.readonlyField}>
              <Text style={styles.readonlyText}>{TIMEZONE_LABEL}</Text>
            </View>
          </View>

          <View style={globalStyles.card}>
            <Text style={styles.sectionTitle}>Contact and access</Text>

            <Text style={globalStyles.label}>Country code</Text>
            <Pressable
              style={styles.selectBox}
              onPress={() => setDialPickerOpen((prev) => !prev)}
            >
              <Text style={styles.selectValue}>{selectedDialCode}</Text>
              <Text style={styles.selectCaret}>{dialPickerOpen ? '^' : 'v'}</Text>
            </Pressable>
            {dialPickerOpen ? (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll}>
                  {dialCodeOptions.map((option) => (
                    <Pressable
                      key={option.dialCode}
                      style={[
                        styles.dropdownItem,
                        selectedDialCode === option.dialCode && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedDialCode(option.dialCode);
                        setDialPickerOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          selectedDialCode === option.dialCode && styles.dropdownTextSelected,
                        ]}
                      >
                        {option.dialCode} - {option.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <Text style={globalStyles.label}>Contact number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.dialDisplay}>
                <Text style={styles.dialDisplayText}>{selectedDialCode}</Text>
              </View>
              <TextInput
                style={[globalStyles.input, styles.phoneInput]}
                placeholder="123 456 789"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            <Text style={globalStyles.label}>User access level</Text>
            <View style={styles.accessRow}>
              <View style={styles.accessBadge}>
                <Text style={styles.accessBadgeText}>Admin</Text>
              </View>
              <Text style={styles.accessCaption}>
                Full access to manage calculator settings, payouts, and integrations.
              </Text>
            </View>

            <TouchableOpacity
              style={[globalStyles.primaryButton, saving && styles.buttonDisabled]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#E5E7EB" />
              ) : (
                <Text style={globalStyles.primaryButtonText}>Save profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={globalStyles.card}>
          <Text style={styles.sectionTitle}>Profile saved</Text>
          <Text style={styles.helperText}>
            Your details are locked. Tap edit to make changes.
          </Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleStartEdit}>
            <Text style={styles.secondaryButtonText}>Edit profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <LogoutButton onLogout={onLogout} style={styles.logoutSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  overviewCard: {
    marginBottom: 12,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  adminBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  adminText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  primaryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
    marginTop: 4,
  },
  subtleText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  badge: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
  },
  badgeSpacer: {
    marginRight: 10,
  },
  badgeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  badgeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  badgeHint: {
    marginTop: 4,
    fontSize: 11,
    color: '#60A5FA',
  },
  badgeNote: {
    marginTop: 4,
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#111827',
    paddingTop: 12,
  },
  summaryItem: {
    width: '33%',
    paddingRight: 10,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryValue: {
    marginTop: 4,
    color: '#E5E7EB',
    fontWeight: '700',
    fontSize: 13,
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
    marginBottom: 8,
    lineHeight: 18,
  },
  centerRow: {
    marginTop: 10,
    alignItems: 'center',
  },
  siteList: {
    marginTop: 10,
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
  },
  siteName: {
    color: '#E5E7EB',
    fontWeight: '700',
    fontSize: 14,
  },
  siteMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  siteStat: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  siteTraffic: {
    color: '#A5B4FC',
    fontWeight: '700',
    fontSize: 14,
  },
  siteMetaSmall: {
    color: '#6B7280',
    fontSize: 11,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#020617',
    marginRight: 8,
    marginBottom: 8,
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
  readonlyField: {
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#0B1220',
    marginTop: 4,
  },
  readonlyText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
  dialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginBottom: 12,
  },
  dialChip: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#020617',
    marginBottom: 10,
    marginRight: 8,
  },
  dialChipSelected: {
    backgroundColor: '#111827',
    borderColor: '#22C55E',
  },
  dialCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CBD5F5',
  },
  dialCodeTextSelected: {
    color: '#22C55E',
  },
  dialCountryText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#020617',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  selectValue: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
  selectCaret: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    backgroundColor: '#0B1220',
    marginBottom: 12,
  },
  dropdownScroll: {
    maxHeight: 220,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
  },
  dropdownItemSelected: {
    backgroundColor: '#111827',
  },
  dropdownText: {
    color: '#CBD5F5',
    fontSize: 13,
  },
  dropdownTextSelected: {
    color: '#22C55E',
    fontWeight: '700',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  dialDisplay: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0B1220',
    marginRight: 10,
  },
  dialDisplayText: {
    color: '#E5E7EB',
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  accessBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: '#22C55E',
    marginRight: 10,
  },
  accessBadgeText: {
    color: '#22C55E',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  accessCaption: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  logoutSpacing: {
    marginTop: 14,
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#0B1220',
  },
  secondaryButtonText: {
    color: '#E5E7EB',
    fontWeight: '700',
    fontSize: 14,
  },
});
