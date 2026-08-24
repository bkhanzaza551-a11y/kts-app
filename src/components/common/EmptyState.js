import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';

export const EmptyState = ({ icon = '📭', title, message }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    {message && <Text style={styles.message}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 60 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { ...TYPOGRAPHY.h4, color: COLORS.white, textAlign: 'center', marginBottom: 8 },
  message: { ...TYPOGRAPHY.body2, color: COLORS.grey, textAlign: 'center', lineHeight: 20 },
});
