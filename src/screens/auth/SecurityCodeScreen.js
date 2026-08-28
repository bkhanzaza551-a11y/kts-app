import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { verifySecurityCode } from '../../store/authSlice';

export const SecurityCodeScreen = () => {
  const [code, setCode] = useState('');
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(s => s.auth);

  const handleVerify = () => {
    if (code.length >= 4) dispatch(verifySecurityCode({ security_code: code }));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>Security Code</Text>
          <Text style={styles.subtitle}>Enter your security code to continue</Text>
        </View>

        {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

        <Input label="Security Code" value={code} onChangeText={setCode}
          placeholder="Enter security code" secureTextEntry icon="lock-outline" />

        <Button title="Verify" onPress={handleVerify} loading={isLoading} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { flex: 1, padding: SPACING.screen, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.white },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.silver, marginTop: 8, textAlign: 'center' },
  errorBox: { backgroundColor: 'rgba(255,23,68,0.1)', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.red },
  errorText: { ...TYPOGRAPHY.body3, color: COLORS.red, textAlign: 'center' },
});
