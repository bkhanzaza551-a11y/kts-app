import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Animated, Easing } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { register, clearError } from '../../store/authSlice';
import { validateName, validateEmail, validatePassword, validateConfirmPassword } from '../../utils/validators';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { isLoading, error, isEmailVerificationPending, pendingEmail } = useSelector(s => s.auth);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
  }, []);

  useEffect(() => {
    if (isEmailVerificationPending && pendingEmail) {
      navigation.replace('OtpVerification', { emailVerification: true, email: pendingEmail });
    }
  }, [isEmailVerificationPending, pendingEmail]);

  const handleRegister = () => {
    const errs = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirmPassword(password, confirm),
    };
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }
    setErrors({});
    dispatch(register({ name, email, password, password_confirmation: confirm }));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join KTS 10 Pips Bots today</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {error && (
            <View style={styles.errorBox}>
              <Icon name="alert-circle-outline" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input 
              label="Full Name" 
              value={name} 
              onChangeText={setName} 
              error={errors.name} 
              icon="account-outline" 
            />
            <Input 
              label="Email Address" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              error={errors.email} 
              icon="email-outline" 
            />
            <Input 
              label="Password" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry 
              error={errors.password} 
              icon="lock-outline" 
            />
            <Input 
              label="Confirm Password" 
              value={confirm} 
              onChangeText={setConfirm} 
              secureTextEntry 
              error={errors.confirm} 
              icon="lock-check-outline" 
            />

            <Button title="Create Account" onPress={handleRegister} loading={isLoading} style={styles.submitBtn} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: SPACING.screen, paddingBottom: 40, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, fontWeight: '800' },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.textMuted, marginTop: 8 },
  form: { backgroundColor: 'transparent' },
  errorBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.sellMuted, 
    borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.lg, 
    borderWidth: 1, borderColor: COLORS.error + '40', gap: 8 
  },
  errorText: { ...TYPOGRAPHY.body3, color: COLORS.error, flex: 1 },
  submitBtn: { marginTop: SPACING.md },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { ...TYPOGRAPHY.body2, color: COLORS.textMuted },
  link: { ...TYPOGRAPHY.body2, color: COLORS.primary, fontWeight: '700' },
});
