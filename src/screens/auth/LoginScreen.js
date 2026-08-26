import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { login, clearError } from '../../store/authSlice';
import { validateEmail, validatePassword } from '../../utils/validators';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>KTS</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your trading dashboard</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Icon name="alert-circle-outline" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Input 
            label="Email Address" 
            value={email} 
            onChangeText={(v) => { setEmail(v); dispatch(clearError()); }}
            placeholder="admin@kts10pipsbots.com" 
            keyboardType="email-address" 
            error={errors.email} 
            icon="email-outline" 
          />
          <Input 
            label="Password" 
            value={password} 
            onChangeText={(v) => { setPassword(v); dispatch(clearError()); }}
            placeholder="••••••••" 
            secureTextEntry 
            error={errors.password} 
            icon="lock-outline" 
          />
          
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button title="Sign In" onPress={handleLogin} loading={isLoading} style={styles.submitBtn} />
        </View>

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
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: SPACING.screen, paddingBottom: 40, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  logoContainer: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.card,
    marginBottom: 24, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10
  },
  logoText: { fontSize: 32, fontWeight: '900', color: COLORS.primary, letterSpacing: 2 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, textAlign: 'center', fontWeight: '800' },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' },
  form: { backgroundColor: 'transparent' },
  errorBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.sellMuted, 
    borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.lg, 
    borderWidth: 1, borderColor: COLORS.error + '40', gap: 8 
  },
  errorText: { ...TYPOGRAPHY.body3, color: COLORS.error, flex: 1 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.xl },
  forgotText: { ...TYPOGRAPHY.body3, color: COLORS.primary, fontWeight: '600' },
  submitBtn: { marginTop: SPACING.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { ...TYPOGRAPHY.body2, color: COLORS.textMuted },
  link: { ...TYPOGRAPHY.body2, color: COLORS.primary, fontWeight: '700' },
});
