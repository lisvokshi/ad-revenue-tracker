import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import HeroHeader from '../components/HeroHeader';
import { globalStyles } from '../styles/styles';

type AdFormatKey =
  | 'display'
  | 'native'
  | 'video'
  | 'interscroller'
  | 'sticky'
  | 'incontent';

type AdFormat = {
  key: AdFormatKey;
  label: string;
  description: string;
  icon: string;
};

const AD_FORMATS: AdFormat[] = [
  { key: 'display', label: 'Display (Banner) ads', description: 'Traditional display units that sit between content blocks.', icon: '🧱' },
  { key: 'native', label: 'Native ads', description: 'Blend with article style and typography.', icon: '🎨' },
  { key: 'video', label: 'Video ads', description: 'Short autoplay placements with sound off by default.', icon: '🎬' },
  { key: 'interscroller', label: 'Interscroller', description: 'Full-width unit revealed as users scroll between sections.', icon: '🌀' },
  { key: 'sticky', label: 'Sticky / Anchor ads', description: 'Fixed to bottom of the screen for persistent visibility.', icon: '📌' },
  { key: 'incontent', label: 'In-content ads', description: 'Inline units dropped within paragraphs.', icon: '🧩' },
];

const AD_COUNT_OPTIONS = ['1', '2', '3', '4', '5', '6', '7'];

type PreviewSlot = {
  id: string;
  format: AdFormatKey;
};

export default function AdsSetupScreen() {
  const [selectedFormats, setSelectedFormats] = useState<AdFormatKey[]>(['display', 'incontent', 'sticky']);
  const [adCount, setAdCount] = useState<string>('4');
  const [countPickerOpen, setCountPickerOpen] = useState(false);

  const previewSlots = useMemo<PreviewSlot[]>(() => {
    const count = Number(adCount) || 1;
    if (selectedFormats.length === 0) {
      return Array.from({ length: count }).map((_, idx) => ({
        id: `slot-${idx}`,
        format: 'display' as AdFormatKey,
      }));
    }
    return Array.from({ length: count }).map((_, idx) => ({
      id: `slot-${idx}`,
      format: selectedFormats[idx % selectedFormats.length],
    }));
  }, [adCount, selectedFormats]);

  const handleToggleFormat = (format: AdFormatKey) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format],
    );
  };

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
      <HeroHeader />

      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>Ad formats</Text>
        <Text style={styles.helperText}>
          Choose which formats to show in your mobile layout preview. You can mix formats to see how they stack inside the article.
        </Text>
        <View style={styles.chipContainer}>
          {AD_FORMATS.map((format) => {
            const active = selectedFormats.includes(format.key);
            return (
              <TouchableOpacity
                key={format.key}
                style={[styles.chip, active && styles.chipSelected]}
                onPress={() => handleToggleFormat(format.key)}
              >
                <View style={styles.chipIcon}>
                  <Text style={styles.chipIconText}>{format.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chipText, active && styles.chipTextSelected]}>
                    {format.label}
                  </Text>
                  <Text style={styles.chipDescription}>{format.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>Ad density</Text>
        <Text style={styles.helperText}>Select how many ads to render in the mock article (1-7).</Text>

        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setCountPickerOpen((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Text style={styles.selectValue}>{adCount} ads</Text>
          <Text style={styles.selectCaret}>{countPickerOpen ? '^' : 'v'}</Text>
        </TouchableOpacity>
        {countPickerOpen ? (
          <View style={styles.dropdown}>
            {AD_COUNT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownItem,
                  adCount === option && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  setAdCount(option);
                  setCountPickerOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    adCount === option && styles.dropdownTextSelected,
                  ]}
                >
                  {option} ads
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>Mobile article preview</Text>
        <Text style={styles.helperText}>
          Light theme mock article showing how your selected ad formats and counts will slot into content.
        </Text>
        <MobilePreview previewSlots={previewSlots} />
      </View>
    </ScrollView>
  );
}

function MobilePreview({ previewSlots }: { previewSlots: PreviewSlot[] }) {
  const slotsByOrder = useMemo(() => {
    const positions = ['hero', 'afterIntro', 'mid', 'gallery', 'deep', 'nearComments', 'sticky'];
    return previewSlots.slice(0, positions.length).map((slot, idx) => ({
      ...slot,
      position: positions[idx] ?? `slot-${idx}`,
    }));
  }, [previewSlots]);

  const findSlot = (position: string) => slotsByOrder.find((slot) => slot.position === position);

  return (
    <View style={styles.phoneShell}>
      <View style={styles.statusBar} />
      <View style={styles.phoneScreen}>
        <Text style={styles.articleEyebrow}>Tech / Monetization</Text>
        <Text style={styles.articleTitle}>Building a clean mobile experience while monetizing responsibly</Text>
        <View style={styles.articleMetaRow}>
          <Text style={styles.articleMeta}>By Revenue Studio</Text>
          <Text style={styles.articleMeta}>8 min read</Text>
        </View>

        <PlaceholderImage />
        {findSlot('hero') ? <AdBlock slot={findSlot('hero')!} /> : null}

        <Text style={styles.paragraph}>
          A well-placed ad strategy respects the reader while driving meaningful revenue. Below is a sample layout showing how banners, native and video units can sit between paragraphs without overwhelming the flow.
        </Text>

        {findSlot('afterIntro') ? <AdBlock slot={findSlot('afterIntro')!} /> : null}

        <Text style={styles.paragraph}>
          For long-form articles, interscrollers and in-content placements keep visibility high. We recommend pairing sticky anchor ads with lighter inline units to balance viewability and UX.
        </Text>

        <Text style={styles.subheading}>Sample content block</Text>
        <Text style={styles.paragraph}>
          Consider pacing: insert a unit every few scrolls, and use native ads near image galleries where user attention spikes. Video should be short and muted by default to avoid bounce.
        </Text>

        <PlaceholderImage tall />
        {findSlot('mid') ? <AdBlock slot={findSlot('mid')!} /> : null}

        <Text style={styles.paragraph}>
          Anchor ads can live at the bottom edge while users scroll. Interscrollers reveal gently between sections and should be capped for frequency. Test density from 1-7 placements per page depending on session length.
        </Text>

        {findSlot('gallery') ? <AdBlock slot={findSlot('gallery')!} /> : null}
        <Text style={styles.subheading}>Reader-first checklist</Text>
        <Text style={styles.paragraph}>
          - Keep CLS stable with reserved space.{'\n'}
          - Use lazy loading for below-the-fold units.{'\n'}
          - Limit video and interscrollers to avoid ad fatigue.
        </Text>

        {findSlot('deep') ? <AdBlock slot={findSlot('deep')!} /> : null}

        <View style={styles.commentBox}>
          <Text style={styles.commentTitle}>Comments (42)</Text>
          <Text style={styles.commentBody}>“This layout feels clean while still monetizing efficiently.”</Text>
        </View>

        {findSlot('nearComments') ? <AdBlock slot={findSlot('nearComments')!} /> : null}
      </View>

      {findSlot('sticky') ? (
        <View style={styles.stickyBar}>
          <AdBlock slot={findSlot('sticky')!} compact />
        </View>
      ) : null}
    </View>
  );
}

function PlaceholderImage({ tall }: { tall?: boolean }) {
  return (
    <View style={[styles.imagePlaceholder, tall && styles.imagePlaceholderTall]}>
      <View style={styles.imageOverlay}>
        <Text style={styles.imageText}>{tall ? 'Feature Photo' : 'Article Photo'}</Text>
      </View>
    </View>
  );
}

function AdBlock({ slot, compact }: { slot: PreviewSlot; compact?: boolean }) {
  const label = AD_FORMATS.find((f) => f.key === slot.format)?.label ?? 'Ad placement';
  const icon = AD_FORMATS.find((f) => f.key === slot.format)?.icon ?? '⬛';
  const tone = getAdTone(slot.format);
  return (
    <View style={[styles.adBlock, compact && styles.adBlockCompact, tone.wrapper]}>
      <View style={styles.adLabelRow}>
        <Text style={[styles.adIcon, tone.text]}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.adLabel, tone.text]}>{label}</Text>
          <Text style={[styles.adMeta, tone.text]}>{compact ? 'Sticky preview' : 'Preview placement'}</Text>
        </View>
      </View>
    </View>
  );
}

function getAdTone(format: AdFormatKey) {
  switch (format) {
    case 'display':
      return { wrapper: styles.adToneBlue, text: styles.adToneText };
    case 'native':
      return { wrapper: styles.adToneGreen, text: styles.adToneTextDark };
    case 'video':
      return { wrapper: styles.adTonePurple, text: styles.adToneText };
    case 'interscroller':
      return { wrapper: styles.adToneOrange, text: styles.adToneTextDark };
    case 'sticky':
      return { wrapper: styles.adToneTeal, text: styles.adToneTextDark };
    case 'incontent':
    default:
      return { wrapper: styles.adToneSlate, text: styles.adToneText };
  }
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
    marginBottom: 10,
    lineHeight: 18,
  },
  chipContainer: {
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#020617',
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
  chipDescription: {
    marginTop: 2,
    fontSize: 11,
    color: '#9CA3AF',
  },
  chipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  chipIconText: {
    fontSize: 18,
    color: '#E5E7EB',
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
    marginTop: 6,
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
  phoneShell: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#111827',
    backgroundColor: '#0F172A',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  statusBar: {
    height: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
    marginHorizontal: 40,
    marginBottom: 10,
  },
  phoneScreen: {
    backgroundColor: '#F7F9FC',
    borderRadius: 14,
    padding: 14,
  },
  articleEyebrow: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  articleTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  articleMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },
  articleMeta: {
    color: '#6B7280',
    fontSize: 12,
  },
  paragraph: {
    color: '#1F2937',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  subheading: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
  },
  imagePlaceholder: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    height: 140,
    marginTop: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  imagePlaceholderTall: {
    height: 190,
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    color: '#374151',
    fontWeight: '700',
  },
  adBlock: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  adBlockCompact: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  adLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  adMeta: {
    fontSize: 11,
    marginTop: 4,
  },
  adLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  adToneBlue: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
  },
  adToneGreen: {
    backgroundColor: 'rgba(34,197,94,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.35)',
  },
  adTonePurple: {
    backgroundColor: 'rgba(139,92,246,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
  },
  adToneOrange: {
    backgroundColor: 'rgba(249,115,22,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.35)',
  },
  adToneTeal: {
    backgroundColor: 'rgba(45,212,191,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.35)',
  },
  adToneSlate: {
    backgroundColor: 'rgba(148,163,184,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  adToneText: {
    color: '#0F172A',
  },
  adToneTextDark: {
    color: '#0B1120',
  },
  commentBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  commentTitle: {
    color: '#4338CA',
    fontWeight: '700',
    marginBottom: 4,
  },
  commentBody: {
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 18,
  },
  stickyBar: {
    marginTop: 10,
    borderRadius: 12,
    padding: 8,
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#111827',
  },
});
