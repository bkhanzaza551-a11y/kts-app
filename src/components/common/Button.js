import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const Button = ({ title, onPress, variant = 'primary', loading, disabled, style, icon, rightIcon }) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8} style={[styles.primary, disabled && styles.disabled, style]}>
        {loading ? <ActivityIndicator color={COLORS.black} /> : (
          <>
            {icon}
            <Text style={styles.primaryText}>{title}</Text>
            {rightIcon && (
              <View style={styles.rightIconCircle}>
                <Icon name={rightIcon} size={18} color={COLORS.primary} style={{marginLeft: 2}} />
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'social') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8} style={[styles.social, disabled && styles.disabled, style]}>
        {loading ? <ActivityIndicator color={COLORS.white} /> : (
          <>
            {icon}
            <Text style={styles.socialText}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  primary: {
    height: 56,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700', // Exact bright gold from mockup
    paddingHorizontal: SPACING.md,
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6
  },
  primaryText: { ...TYPOGRAPHY.button, color: '#000000', fontWeight: '900', fontSize: 16, flex: 1, textAlign: 'center', letterSpacing: 1 },
  rightIconCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#000000',
    alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 12
  },
  social: {
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333333',
    gap: 12,
  },
  socialText: { ...TYPOGRAPHY.button, color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  disabled: { opacity: 0.5 },
});
