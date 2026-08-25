import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import client from '../../api/client';

export const ChangeSecurityCodeScreen = ({ navigation }) => {
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentCode || !newCode || !confirmCode) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (newCode !== confirmCode) {
      Alert.alert('Error', 'Security codes do not match');
      return;
    }
    if (newCode.length !== 6 || !/^\d{6}$/.test(newCode)) {
      Alert.alert('Error', 'Security code must be exactly 6 digits');
      return;
    }
    setLoading(true);
    try {
      await client.put('/profile', { current_security_code: currentCode, security_code: newCode });
      Alert.alert('Success', 'Security code changed successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to change security code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Change Security Code</Text>
      <Text style={styles.subtitle}>Enter your current security code and set a new 6-digit code.</Text>

      <Text style={styles.label}>Current Security Code</Text>
      <TextInput style={styles.input} value={currentCode} onChangeText={setCurrentCode} keyboardType="numeric" maxLength={6} secureTextEntry placeholder="Enter current code" placeholderTextColor={COLORS.grey} />

      <Text style={styles.label}>New Security Code</Text>
      <TextInput style={styles.input} value={newCode} onChangeText={setNewCode} keyboardType="numeric" maxLength={6} secureTextEntry placeholder="Enter new 6-digit code" placeholderTextColor={COLORS.grey} />

      <Text style={styles.label}>Confirm New Security Code</Text>
      <TextInput style={styles.input} value={confirmCode} onChangeText={setConfirmCode} keyboardType="numeric" maxLength={6} secureTextEntry placeholder="Confirm new code" placeholderTextColor={COLORS.grey} />

      <Button title={loading ? 'Changing...' : 'Change Security Code'} onPress={handleSubmit} disabled={loading} style={styles.btn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.gold, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.silver, marginBottom: SPACING.xl },
  label: { ...TYPOGRAPHY.caption, color: COLORS.silver, marginBottom: 6, marginTop: SPACING.md },
  input: { backgroundColor: COLORS.darkCard, borderRadius: 12, padding: 14, color: COLORS.white, ...TYPOGRAPHY.body1, borderWidth: 1, borderColor: COLORS.darkBorder },
  btn: { marginTop: SPACING.xxl },
});
