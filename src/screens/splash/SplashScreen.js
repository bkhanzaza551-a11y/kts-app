import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';

export const SplashScreen = () => (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>KTS</Text>
        </View>
        <Text style={styles.title}>KTS 10 Pips Bots</Text>
        <Text style={styles.subtitle}>Trade Smarter. Earn More.</Text>
      </View>
      <Text style={styles.loading}>Loading...</Text>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.black },
  logoContainer: { alignItems: 'center', marginBottom: SPACING.headerTop + 10 },
  logoCircle: {
    width: 120, height: 120, borderRadius: RADIUS.full,
    borderWidth: 3, borderColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.darkCard,
    marginBottom: SPACING.xl,
  },
  logoText: { ...TYPOGRAPHY.h1, color: COLORS.gold, letterSpacing: 2 },
  title: { ...TYPOGRAPHY.h3, color: COLORS.white, letterSpacing: 1 },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.silver, marginTop: SPACING.sm },
  loading: { position: 'absolute', bottom: SPACING.headerTop + 10, color: COLORS.gold, ...TYPOGRAPHY.caption },
});
