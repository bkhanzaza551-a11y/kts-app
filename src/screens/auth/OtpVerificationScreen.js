import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '../../components/common/Button';
import { verifyOtp, verifyEmailOtp, resendEmailOtp, clearError } from '../../store/authSlice';

export const OtpVerificationScreen = ({ navigation, route }) => {
  const isEmailVerification = route?.params?.emailVerification || false;
  const verificationEmail = route?.params?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputs = useRef([]);
  const dispatch = useDispatch();
  const { isLoading, error, isSecurityCodePending, isEmailVerificationPending, pendingEmail, pendingOtp } = useSelector(s => s.auth);

  const userEmail = verificationEmail || pendingEmail || '';

  useEffect(() => {
    if (!isEmailVerification && isSecurityCodePending) navigation.replace('SecurityCode');
  }, [isSecurityCodePending, isEmailVerification, navigation]);

  useEffect(() => {
    if (pendingOtp && pendingOtp.length === 6) {
      const digits = pendingOtp.split('');
      setOtp(digits);
    }
  }, [pendingOtp]);

  const handleChange = (text, index) => {
    if (text.length > 1) text = text.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (isEmailVerification) {
      dispatch(verifyEmailOtp({ email: userEmail, otp: code }));
    } else {
      dispatch(verifyOtp({ otp: code }));
    }
  };

  const handleResend = () => {
    if (isEmailVerification && userEmail) {
      dispatch(resendEmailOtp({ email: userEmail }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{top:15, bottom:15, left:15, right:15}}>
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Minimal Icon */}
          <View style={styles.iconContainer}>
            <Icon name={isEmailVerification ? "email-fast-outline" : "shield-check-outline"} size={36} color="#FFD700" />
          </View>

          <Text style={styles.title}>{isEmailVerification ? 'Verify your email' : 'Verification Code'}</Text>
          
          <Text style={styles.subtitle}>
            Enter the 6-digit code we sent to{'\n'}
            <Text style={styles.highlight}>{userEmail || 'your email'}</Text>
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Icon name="alert-circle-outline" size={18} color="#FF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputs.current[i] = ref; }}
                style={[
                  styles.otpInput,
                  focusedIndex === i && styles.otpInputFocused,
                  digit && styles.otpInputFilled
                ]}
                value={digit}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                onFocus={() => setFocusedIndex(i)}
                onBlur={() => setFocusedIndex(-1)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                placeholder="-"
                placeholderTextColor="#555555"
              />
            ))}
          </View>

          <Button
            title="VERIFY CODE"
            onPress={handleVerify}
            loading={isLoading}
            rightIcon="arrow-right"
            style={styles.verifyBtn}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend} hitSlop={{top:10, bottom:10, left:10, right:10}}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  keyboardView: { flex: 1 },
  topNav: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  iconContainer: { 
    width: 64, height: 64, borderRadius: 32, 
    backgroundColor: 'rgba(255, 215, 0, 0.1)', 
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)'
  },
  title: { fontSize: 28, color: '#FFFFFF', fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: '#A0A0A0', lineHeight: 22, marginBottom: 32 },
  highlight: { color: '#FFFFFF', fontWeight: '600' },
  
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 68, 68, 0.1)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 68, 68, 0.3)', marginBottom: 24, gap: 8 },
  errorText: { fontSize: 13, color: '#FF4444', flex: 1 },
  
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  otpInput: {
    width: 48, height: 56, borderRadius: 12, borderWidth: 1, borderColor: '#333333',
    backgroundColor: '#121212', textAlign: 'center', fontSize: 24, fontWeight: '700', color: '#FFFFFF',
  },
  otpInputFocused: { borderColor: '#FFD700', backgroundColor: '#1A1A1A' },
  otpInputFilled: { borderColor: '#FFD700', backgroundColor: '#1A1A1A' },
  
  verifyBtn: { marginBottom: 24 },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resendText: { fontSize: 14, color: '#A0A0A0' },
  resendLink: { fontSize: 14, color: '#FFD700', fontWeight: '700' },
});
