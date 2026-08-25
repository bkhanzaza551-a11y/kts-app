import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { login, googleLogin, clearError } from '../../store/authSlice';
import { validateEmail, validatePassword } from '../../utils/validators';

const GOOGLE_WEB_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(s => s.auth);

  useEffect(() => {
    if (GOOGLE_WEB_CLIENT_ID && !GOOGLE_WEB_CLIENT_ID.includes('YOUR_GOOGLE')) {
      GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: true });
    }
  }, []);

  const handleLogin = () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr || passErr) { setErrors({ email: emailErr, password: passErr }); return; }
    setErrors({});
    dispatch(login({ email, password }));
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

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

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={googleLoading || isLoading}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>{googleLoading ? 'Signing in...' : 'Continue with Google'}</Text>
        </TouchableOpacity>

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
