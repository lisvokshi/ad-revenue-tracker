import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  onLogout: () => void;
};

export default function LogoutButton({ onLogout }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onLogout}>
      <Text style={styles.text}>Log out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  text: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
