// styles/styles.ts
import React from 'react';
import { StyleSheet } from 'react-native';

export const colors = {
  background: '#020617',
  textPrimary: '#E5E7EB',
  textSecondary: '#9CA3AF',
  accent: '#22C55E',
  border: '#111827',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    marginTop: 12,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: colors.accent,
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: colors.accent,
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
});

// Expo Router treats folders under `app/` as routes. This file exports
// styling constants, not a screen component; provide a harmless default
// export so the router doesn't warn about a missing default export.
export default function StylesRoute(): React.ReactElement | null {
  return null;
}
