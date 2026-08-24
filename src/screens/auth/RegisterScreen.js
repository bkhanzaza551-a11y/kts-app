import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { register, googleLogin, clearError } from '../../store/authSlice';
import { validateName, validateEmail, validatePassword, validateConfirmPassword } from '../../utils/validators';

GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});

export const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const dispatch = useDispatch();
  const { isLoading, error, isEmailVerificationPending, pendingEmail } = useSelector(s => s.auth);

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

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      dispatch(googleLogin({
        google_id: userInfo.user.id,
        email: userInfo.user.email,
        name: userInfo.user.name,
        avatar: userInfo.user.photo,
      }));
    } catch (e) {
      if (e.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Google Sign-In', 'Failed to sign in with Google. Please try again.');
      }
    }
    setGoogleLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join KTS 10 Pips Bots today</Text>
        </View>

        {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

        <Input label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" error={errors.name} icon="👤" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" error={errors.email} icon="📧" />
        <Input label="Password" value={password} onChangeText={setPassword} placeholder="Min 8 characters" secureTextEntry error={errors.password} icon="🔒" />
        <Input label="Confirm Password" value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" secureTextEntry error={errors.confirm} icon="🔒" />

        <Button title="Create Account" onPress={handleRegister} loading={isLoading} />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignup} disabled={googleLoading || isLoading}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>{googleLoading ? 'Signing up...' : 'Sign up with Google'}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  scroll: { flexGrow: 1, padding: SPACING.screen, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 36 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.white },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.silver, marginTop: 8 },
  errorBox: { backgroundColor: 'rgba(255,23,68,0.1)', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.red },
  errorText: { ...TYPOGRAPHY.body3, color: COLORS.red, textAlign: 'center' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.darkBorder },
  dividerText: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginHorizontal: SPACING.md },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    gap: 10,
  },
  googleIcon: { fontSize: 20, fontWeight: '800', color: '#4285F4' },
  googleText: { ...TYPOGRAPHY.button, color: '#333' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { ...TYPOGRAPHY.body2, color: COLORS.grey },
  link: { ...TYPOGRAPHY.body2, color: COLORS.gold, fontWeight: '600' },
});
