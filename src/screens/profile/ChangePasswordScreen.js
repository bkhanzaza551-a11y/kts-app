import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import client from '../../api/client';

export const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await client.put('/profile', { current_password: currentPassword, password: newPassword, password_confirmation: confirmPassword });
      Alert.alert('Success', 'Password changed successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Change Password</Text>
      <Text style={styles.subtitle}>Enter your current password and choose a new one.</Text>

      <Text style={styles.label}>Current Password</Text>
      <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="Enter current password" placeholderTextColor={COLORS.grey} />

      <Text style={styles.label}>New Password</Text>
      <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Enter new password" placeholderTextColor={COLORS.grey} />

      <Text style={styles.label}>Confirm New Password</Text>
      <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Confirm new password" placeholderTextColor={COLORS.grey} />

      <Button title={loading ? 'Changing...' : 'Change Password'} onPress={handleSubmit} disabled={loading} style={styles.btn} />
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
