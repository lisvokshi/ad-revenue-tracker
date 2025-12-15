// app/screens/ProfileScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  userId?: string;
  email?: string | null;
};

export default function ProfileScreen({ userId, email }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="person-circle" size={80} color="#22C55E" />
      </View>
      <Text style={styles.title}>Welcome to the Profile tab!</Text>
      <Text style={styles.description}>
        View and manage your account information here.
      </Text>
      
      {userId && (
        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>User ID</Text>
            <Text style={styles.value}>{userId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{email ?? '—'}</Text>
          </View>
        </View>
      )}
      
      {!userId && (
        <Text style={styles.description}>
          Your user profile information will be displayed here once you&apos;re logged in.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E5E7EB',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  infoContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  row: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A5B4FC',
  },
});
