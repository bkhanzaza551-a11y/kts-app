import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';

export const Button = ({ title, onPress, variant = 'primary', loading, disabled, style, icon }) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
        <View style={[styles.primary, disabled && styles.disabled, style]}>
          {loading ? <ActivityIndicator color={COLORS.background} /> : (
            <>
              {icon}
              <Text style={styles.primaryText}>{title}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.outline, disabled && styles.disabledOutline, style]}
        activeOpacity={0.8}
      >
        {loading ? <ActivityIndicator color={COLORS.primary} /> : (
          <>
            {icon}
            <Text style={styles.outlineText}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[styles.ghost, style]} activeOpacity={0.7}>
        {loading ? <ActivityIndicator color={COLORS.primary} /> : <Text style={styles.ghostText}>{title}</Text>}
      </TouchableOpacity>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  primary: {
    height: 52,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
  },
  primaryText: { ...TYPOGRAPHY.button, color: COLORS.background, fontWeight: '700', fontSize: 16 },
  outline: {
    height: 52,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  outlineText: { ...TYPOGRAPHY.button, color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  ghost: { height: 44, alignItems: 'center', justifyContent: 'center' },
  ghostText: { ...TYPOGRAPHY.button, color: COLORS.primary, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  disabledOutline: { opacity: 0.4, borderColor: COLORS.border },
});
