import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  userId?: string | null;
  email?: string | null;
};

export default function ProfileWindow({ userId, email }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {userId ? (
        <>
          <Text style={styles.meta}>Signed in as {userId}</Text>
          {email ? (
            <Text style={styles.meta}>Email: {email}</Text>
          ) : null}
        </>
      ) : (
        <Text style={styles.meta}>Not signed in</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#071124',
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: '#9CA3AF',
  },
});
