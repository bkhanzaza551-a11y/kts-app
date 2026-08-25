import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { login, clearError } from '../../store/authSlice';
import { validateEmail, validatePassword } from '../../utils/validators';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(s => s.auth);

  const handleLogin = () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr || passErr) { setErrors({ email: emailErr, password: passErr }); return; }
    setErrors({});
    dispatch(login({ email, password }));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>KTS</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue trading</Text>
        </View>

        {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

        <Input label="Email" value={email} onChangeText={(v) => { setEmail(v); dispatch(clearError()); }}
          placeholder="admin@kts10pipsbots.com" keyboardType="email-address" error={errors.email} icon="📧" />
        <Input label="Password" value={password} onChangeText={(v) => { setPassword(v); dispatch(clearError()); }}
          placeholder="Enter your password" secureTextEntry error={errors.password} icon="🔒" />

        <Button title="Sign In" onPress={handleLogin} loading={isLoading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  scroll: { flexGrow: 1, padding: SPACING.screen, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.darkCard, marginBottom: 24,
  },
  logoText: { fontSize: 28, fontWeight: '800', color: COLORS.gold },
  title: { ...TYPOGRAPHY.h2, color: COLORS.white, textAlign: 'center' },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.silver, marginTop: 8 },
  errorBox: { backgroundColor: 'rgba(255,23,68,0.1)', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.red },
  errorText: { ...TYPOGRAPHY.body3, color: COLORS.red, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { ...TYPOGRAPHY.body2, color: COLORS.grey },
  link: { ...TYPOGRAPHY.body2, color: COLORS.gold, fontWeight: '600' },
});
