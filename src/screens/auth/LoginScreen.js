import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Animated, Easing, ImageBackground } from 'react-native';
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
  }, []);

  const handleLogin = () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr || passErr) { setErrors({ email: emailErr, password: passErr }); return; }
    setErrors({});
    dispatch(login({ email, password }));
  };

  return (
    <ImageBackground source={require('../../../assets/images/login_bg.png')} style={styles.background} resizeMode="stretch">
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.title}>Welcome <Text style={{ color: COLORS.primary }}>Back</Text></Text>
            <Text style={styles.subtitle}>Log in to access your trading dashboard</Text>
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
                label="Email Address" 
                value={email} 
                onChangeText={(v) => { setEmail(v); dispatch(clearError()); }}
                keyboardType="email-address" 
                error={errors.email} 
                icon="email-outline" 
              />
              <Input 
                label="Password" 
                value={password} 
                onChangeText={(v) => { setPassword(v); dispatch(clearError()); }}
                secureTextEntry 
                error={errors.password} 
                icon="lock-outline" 
              />
              
              <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button title="LOGIN" onPress={handleLogin} loading={isLoading} style={styles.submitBtn} rightIcon="arrow-right" />
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button 
              title="Continue with Google" 
              variant="social" 
              icon={<Icon name="google" size={20} color={COLORS.white} />} 
              onPress={() => {}} 
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: SPACING.screen, paddingBottom: 40, justifyContent: 'center', paddingTop: 100 },
  header: { marginBottom: 30, marginTop: 40 },
  title: { fontSize: 32, color: COLORS.white, fontWeight: '700', letterSpacing: 0.5 },
  subtitle: { ...TYPOGRAPHY.body2, color: "#CCCCCC", marginTop: 8 },
  form: { backgroundColor: 'transparent' },
  errorBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.sellMuted, 
    borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.lg, 
    borderWidth: 1, borderColor: COLORS.error + '40', gap: 8 
  },
  errorText: { ...TYPOGRAPHY.body3, color: COLORS.error, flex: 1 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.xl, marginTop: -4 },
  forgotText: { ...TYPOGRAPHY.body3, color: COLORS.primary, fontWeight: '500' },
  submitBtn: { marginBottom: SPACING.xl },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#333333' },
  dividerText: { color: COLORS.textMuted, paddingHorizontal: 12, fontSize: 12, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { ...TYPOGRAPHY.body2, color: "#CCCCCC" },
  link: { ...TYPOGRAPHY.body2, color: COLORS.primary, fontWeight: '700' },
});

