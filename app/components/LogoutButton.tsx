import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

import { supabase } from '../supabaseClient';

type Props = {
  onLogout?: () => void;
  style?: ViewStyle;
};

export default function LogoutButton({ onLogout, style }: Props) {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout?.();
    } catch (error) {
      Alert.alert('Logout error', 'Could not log out. Please try again.');
    }
  };

  return (
    <TouchableOpacity style={[styles.logoutButton, style]} onPress={handleLogout}>
      <Text style={styles.logoutText}>Log out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  logoutText: {
    color: '#F9FAFB',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
