import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Animated, Easing, ImageBackground } from 'react-native';
import { COLORS } from '../../theme/colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { validateEmail } from '../../utils/validators';
import { triggerHaptic } from '../../utils/haptics';
import client from '../../api/client';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
  }, []);

  const handleReset = async () => {
    triggerHaptic('light');
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await client.post('/auth/forgot-password', { email });
      setIsSuccess(true);
      triggerHaptic('success');
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../../../assets/images/login_bg.png')} style={styles.background} resizeMode="stretch">
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.title}>Reset <Text style={{ color: COLORS.primary }}>Password</Text></Text>
            <Text style={styles.subtitle}>Enter your registered email address and we'll send you instructions to reset your password.</Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {error ? (
              <View style={styles.errorBox}>
                <Icon name="alert-circle-outline" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {isSuccess ? (
              <View style={styles.successBox}>
                <Icon name="check-circle" size={48} color="#00C853" style={{ marginBottom: 16 }} />
                <Text style={styles.successTitle}>Check your email</Text>
                <Text style={styles.successText}>We have sent password reset instructions to {email}</Text>
                <Button title="Back to Login" onPress={() => navigation.navigate('Login')} style={{ marginTop: 24, width: '100%' }} />
              </View>
            ) : (
              <View style={styles.form}>
                <Input 
                  label="Email Address" 
                  value={email} 
                  onChangeText={(val) => { setEmail(val); setError(''); }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="email-outline"
                />

                <Button 
                  title="SEND RESET LINK" 
                  onPress={handleReset} 
                  loading={isLoading} 
                  style={styles.submitBtn} 
                  rightIcon="arrow-right" 
                />
              </View>
            )}
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#0B0E11' },
  container: { flex: 1 },
  topNav: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 50 },
  
  header: { marginBottom: 40 },
  title: { fontSize: 32, color: COLORS.white, fontWeight: '800', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#A0A0A0', lineHeight: 22 },

  form: { gap: 20 },
  submitBtn: { marginTop: 10 },

  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(244, 67, 54, 0.1)', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(244, 67, 54, 0.3)' },
  errorText: { color: COLORS.error, fontSize: 13, marginLeft: 8, flex: 1 },

  successBox: { alignItems: 'center', backgroundColor: '#12161A', padding: 30, borderRadius: 20, borderWidth: 1, borderColor: '#1E2329' },
  successTitle: { fontSize: 22, color: COLORS.white, fontWeight: '800', marginBottom: 12 },
  successText: { fontSize: 15, color: '#A0A0A0', textAlign: 'center', lineHeight: 22 },
});

