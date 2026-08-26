import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';

const { width } = Dimensions.get('window');

export const SplashScreen = () => {
  // Entrance Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  
  // Continuous Animations
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.4)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance Sequence
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(textTranslateY, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 1, duration: 600, useNativeDriver: true })
      ])
    ]).start();

    // 2. Continuous Radar/Pulse Ring
    Animated.loop(
      Animated.parallel([
        Animated.timing(ringScale, {
          toValue: 1.6,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ])
    ).start();

    // 3. Loading Bar Progress
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingProgress, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(loadingProgress, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        })
      ])
    ).start();

  }, []);

  const barWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      
      {/* Animated Logo Area */}
      <View style={styles.logoWrapper}>
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: Animated.multiply(ringScale, 0.8) }], opacity: ringOpacity }]} />
        
        <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>KTS</Text>
          </View>
        </Animated.View>
      </View>
      
      {/* Animated Text Area */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacity, transform: [{ translateY: textTranslateY }] }]}>
        <Text style={styles.title}>KTS Markets</Text>
        <Text style={styles.subtitle}>Trade Smarter. Earn More.</Text>
      </Animated.View>

      {/* Modern Loading Bar */}
      <View style={styles.loaderContainer}>
        <View style={styles.loaderTrack}>
          <Animated.View style={[styles.loaderFill, { width: barWidth }]} />
        </View>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  logoWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  pulseRing: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  logoContainer: { alignItems: 'center' },
  logoCircle: {
    width: 120, height: 120, borderRadius: RADIUS.full,
    borderWidth: 4, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.card,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15
  },
  logoText: { fontSize: 40, fontWeight: '900', color: COLORS.primary, letterSpacing: 2 },
  
  textContainer: { alignItems: 'center' },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, letterSpacing: 1.5, fontWeight: '800' },
  subtitle: { ...TYPOGRAPHY.body1, color: COLORS.textMuted, marginTop: SPACING.sm },
  
  loaderContainer: { position: 'absolute', bottom: 60, width: width * 0.5, alignItems: 'center' },
  loaderTrack: { width: '100%', height: 4, backgroundColor: COLORS.surface, borderRadius: 2, overflow: 'hidden' },
  loaderFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
});
