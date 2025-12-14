// app/screens/ProfileScreen.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  userId?: string;
  email?: string | null;
};

export default function ProfileScreen({ userId, email }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.row}>
        <Text style={styles.label}>User ID</Text>
        <Text style={styles.value}>{userId}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email ?? '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E5E7EB',
    marginBottom: 16,
  },
  row: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A5B4FC',
    marginTop: 2,
  },
});
