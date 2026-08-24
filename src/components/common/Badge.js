import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { RADIUS, SPACING } from '../../theme/spacing';

export const Badge = ({ text, variant = 'default', size = 'small' }) => {
  const bg = {
    buy: COLORS.green,
    sell: COLORS.red,
    win: COLORS.green,
    loss: COLORS.red,
    pending: COLORS.orange,
    active: COLORS.gold,
    closed: COLORS.grey,
    default: COLORS.darkSurface,
    vip: COLORS.gold,
    premium: COLORS.goldLight,
    admin: COLORS.red,
  }[variant] || COLORS.darkSurface;

  const textColor = ['default', 'closed'].includes(variant) ? COLORS.silver : COLORS.black;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === 'large' && styles.large]}>
      <Text style={[styles.text, { color: textColor }, size === 'large' && styles.textLarge]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  large: { paddingHorizontal: 14, paddingVertical: 6 },
  text: { ...TYPOGRAPHY.caption, fontWeight: '600', textTransform: 'uppercase' },
  textLarge: { ...TYPOGRAPHY.buttonSmall },
});
