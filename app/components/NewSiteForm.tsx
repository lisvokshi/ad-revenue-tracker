import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { globalStyles } from '../styles/styles';

type Props = {
  newSiteName: string;
  monthlyPageviews: string;
  creatingSite: boolean;
  onChangeName: (text: string) => void;
  onChangePageviews: (text: string) => void;
  onCreateSite: () => void;
};

export default function NewSiteForm({
  newSiteName,
  monthlyPageviews,
  creatingSite,
  onChangeName,
  onChangePageviews,
  onCreateSite,
}: Props) {
  return (
    <View style={styles.newSiteContainer}>
      <Text style={styles.subSectionTitle}>New profile</Text>

      <Text style={globalStyles.label}>Site name</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g. DailyMail – English"
        placeholderTextColor="#64748b"
        value={newSiteName}
        onChangeText={onChangeName}
      />

      <Text style={globalStyles.label}>Monthly pageviews</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g. 1 200 000"
        placeholderTextColor="#64748b"
        keyboardType="numeric"
        value={monthlyPageviews}
        onChangeText={onChangePageviews}
      />

      <TouchableOpacity
        style={[globalStyles.primaryButton, creatingSite && styles.buttonDisabled]}
        onPress={onCreateSite}
        disabled={creatingSite}
      >
        {creatingSite ? (
          <ActivityIndicator color="#E5E7EB" />
        ) : (
          <Text style={globalStyles.primaryButtonText}>Save website profile</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  newSiteContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#111827',
    paddingTop: 12,
  },
  subSectionTitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
