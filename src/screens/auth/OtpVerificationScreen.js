import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import { verifyOtp, verifyEmailOtp, resendEmailOtp, clearError, clearPendingOtp } from '../../store/authSlice';

export const OtpVerificationScreen = ({ navigation, route }) => {
  const isEmailVerification = route?.params?.emailVerification || false;
  const verificationEmail = route?.params?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);
  const dispatch = useDispatch();
  const { isLoading, error, isSecurityCodePending, isEmailVerificationPending, pendingEmail, pendingOtp } = useSelector(s => s.auth);

  const userEmail = verificationEmail || pendingEmail || '';

  useEffect(() => {
    if (!isEmailVerification && isSecurityCodePending) navigation.replace('SecurityCode');
  }, [isSecurityCodePending, isEmailVerification]);

  useEffect(() => {
    if (pendingOtp && pendingOtp.length === 6) {
      const digits = pendingOtp.split('');
      setOtp(digits);
      dispatch(clearPendingOtp());
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>📧</Text>
          <Text style={styles.title}>{isEmailVerification ? 'Email Verification' : 'Verification Code'}</Text>
          <Text style={styles.subtitle}>
            {isEmailVerification
              ? `Enter the 6-digit code sent to\n${userEmail}`
              : 'Enter the 6-digit code sent to your email'
            }
          </Text>
        </View>

        {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

        {pendingOtp && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Email could not be delivered. Use the code shown below.</Text>
            <Text style={styles.otpDisplay}>{pendingOtp}</Text>
          </View>
        )}

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputs.current[i] = ref; }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Button
          title={isEmailVerification ? 'Verify Email' : 'Verify Code'}
          onPress={handleVerify}
          loading={isLoading}
        />

        {isEmailVerification && (
          <TouchableOpacity style={styles.resend} onPress={handleResend}>
            <Text style={styles.resendText}>Didn't receive code? Resend</Text>
          </TouchableOpacity>
        )}

        {!isEmailVerification && (
          <TouchableOpacity style={styles.resend}>
            <Text style={styles.resendText}>Didn't receive code? Resend</Text>
          </TouchableOpacity>
        )}
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
  errorBox: { backgroundColor: 'rgba(255,23,68,0.1)', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.red },
  errorText: { ...TYPOGRAPHY.body3, color: COLORS.red, textAlign: 'center' },
  infoBox: { backgroundColor: COLORS.goldMuted, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.gold + '40', alignItems: 'center' },
  infoText: { ...TYPOGRAPHY.body3, color: COLORS.gold, textAlign: 'center', marginBottom: 8 },
  otpDisplay: { ...TYPOGRAPHY.h2, color: COLORS.gold, letterSpacing: 4, fontWeight: '800' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 32 },
  otpInput: {
    width: 50, height: 60, borderRadius: RADIUS.md, borderWidth: 2, borderColor: COLORS.darkBorder,
    backgroundColor: COLORS.darkInput, textAlign: 'center', ...TYPOGRAPHY.h2, color: COLORS.white,
  },
  otpInputFilled: { borderColor: COLORS.gold, backgroundColor: COLORS.goldMuted },
  resend: { alignItems: 'center', marginTop: SPACING.xl },
  resendText: { ...TYPOGRAPHY.body2, color: COLORS.gold },
});
