import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Animated, Easing, ImageBackground } from 'react-native';
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
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { isLoading, error, isEmailVerificationPending, pendingEmail } = useSelector(s => s.auth);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
    if (!agree) {
      setErrors({ agree: 'You must agree to the Terms & Conditions' });
      return;
    }
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
    <ImageBackground source={require('../../../assets/images/signup_bg.png')} style={styles.background} resizeMode="cover">
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* Custom Header with Back Button and Logo */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.logoCenter}>
            <Text style={styles.logoTitle}>KTS</Text>
            <Text style={styles.logoSub}>10 PIPS BOTS</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.title}>Create <Text style={{ color: COLORS.primary }}>Account</Text></Text>
            <Text style={styles.subtitle}>Join KTS Markets and start trading smarter</Text>
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
                icon="lock-outline" 
              />

              <TouchableOpacity style={styles.checkboxContainer} onPress={() => {setAgree(!agree); setErrors({})}} activeOpacity={0.8}>
                <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                  {agree && <Icon name="check" size={14} color={COLORS.black} />}
                </View>
                <Text style={styles.checkboxText}>
                  I agree to the <Text style={styles.highlight}>Terms & Conditions</Text> and <Text style={styles.highlight}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {errors.agree && <Text style={styles.errorTextSmall}>{errors.agree}</Text>}

              <Button title="CREATE ACCOUNT" onPress={handleRegister} loading={isLoading} style={styles.submitBtn} rightIcon="arrow-right" />
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button 
              title="Continue with Google" 
              variant="social" 
              icon={<Icon name="google" size={20} color={COLORS.white} />} 
              onPress={() => {}} 
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>Sign In</Text>
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
  topNav: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: SPACING.screen, zIndex: 10 },
  backBtn: { padding: 4, position: 'absolute', left: SPACING.screen, top: 50, zIndex: 20 },
  logoCenter: { flex: 1, alignItems: 'center' },
  logoTitle: { fontSize: 24, fontWeight: '900', color: COLORS.primary, fontStyle: 'italic', letterSpacing: 1 },
  logoSub: { fontSize: 10, color: COLORS.white, fontWeight: '600', letterSpacing: 1 },
  
  scroll: { flexGrow: 1, padding: SPACING.screen, paddingBottom: 40, paddingTop: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, color: COLORS.white, fontWeight: '700', letterSpacing: 0.5 },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.silver, marginTop: 8 },
  form: { backgroundColor: 'transparent' },
  errorBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.sellMuted, 
    borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.lg, 
    borderWidth: 1, borderColor: COLORS.error + '40', gap: 8 
  },
  errorText: { ...TYPOGRAPHY.body3, color: COLORS.error, flex: 1 },
  errorTextSmall: { ...TYPOGRAPHY.caption, color: COLORS.error, marginTop: -10, marginBottom: 10, marginLeft: 4 },
  
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, marginTop: -8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#555', alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: 'rgba(20,20,20,0.8)' },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxText: { flex: 1, fontSize: 13, color: COLORS.silver },
  highlight: { color: COLORS.primary, fontWeight: '500' },
  
  submitBtn: { marginBottom: SPACING.xl },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#333333' },
  dividerText: { color: COLORS.textMuted, paddingHorizontal: 12, fontSize: 12, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { ...TYPOGRAPHY.body2, color: COLORS.silver },
  link: { ...TYPOGRAPHY.body2, color: COLORS.primary, fontWeight: '700' },
});
