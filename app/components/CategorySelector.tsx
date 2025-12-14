import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  category: string;
  onSelectCategory: (value: string) => void;
  categories: string[];
};

export default function CategorySelector({
  category,
  onSelectCategory,
  categories,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Content category</Text>
      <Text style={styles.helperText}>
        Different verticals attract different advertiser bids. Finance and Real Estate usually have stronger RPMs than generic News, for example.
      </Text>

      <View style={styles.chipContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipSelected]}
            onPress={() => onSelectCategory(cat)}
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
  cardTitle: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 4,
    fontWeight: '600',
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
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
});
