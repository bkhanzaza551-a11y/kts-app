import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
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
                <Icon name={rightIcon} size={16} color={COLORS.primary} />
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
    height: 54,
    borderRadius: 8,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16, // Simulating slight chamfer effect via assymetric radius
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
  },
  primaryText: { ...TYPOGRAPHY.button, color: COLORS.black, fontWeight: '800', fontSize: 16, flex: 1, textAlign: 'center' },
  rightIconCircle: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.black,
    alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 16
  },
  social: {
    height: 54,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    gap: 12,
  },
  socialText: { ...TYPOGRAPHY.button, color: COLORS.white, fontWeight: '600', fontSize: 15 },
  disabled: { opacity: 0.5 },
});
