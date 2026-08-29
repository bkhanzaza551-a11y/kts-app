import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export const SplashScreen = () => {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const loaderAnim = useRef(new Animated.Value(-width * 0.4)).current;

  useEffect(() => {
    // Elegant entrance for Logo and Text
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();

    // Smooth, continuous indeterminate loader (Apple/Premium style sweep)
    Animated.loop(
      Animated.timing(loaderAnim, {
        toValue: width * 0.4,
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      
      {/* Centered Brand Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        
        {/* Minimal Typographic Logo */}
        <View style={styles.logoRow}>
          <Text style={styles.brandText}>KTS</Text>
          <Text style={styles.brandAccent}>MARKETS</Text>
        </View>
        
        <Text style={styles.subtitle}>INSTITUTIONAL TRADING</Text>
        
      </Animated.View>

      {/* Minimal Loader at bottom */}
      <Animated.View style={[styles.loaderContainer, { opacity: fadeAnim }]}>
        <View style={styles.loaderTrack}>
          <Animated.View style={[styles.loaderIndicator, { transform: [{ translateX: loaderAnim }] }]} />
        </View>
      </Animated.View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0B0E11', // Deep rich black
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  content: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  brandText: { 
    fontSize: 36, 
    fontWeight: '900', 
    color: '#FFFFFF', 
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif'
  },
  brandAccent: { 
    fontSize: 36, 
    fontWeight: '300', 
    color: '#FFD700', // Premium Gold
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-light'
  },
  subtitle: { 
    fontSize: 10, 
    color: '#666666', 
    letterSpacing: 4, 
    fontWeight: '600',
    marginTop: 4
  },
  
  loaderContainer: { 
    position: 'absolute', 
    bottom: 60, 
    width: width * 0.4, 
    alignItems: 'center' 
  },
  loaderTrack: { 
    width: '100%', 
    height: 2, // Extremely thin line
    backgroundColor: '#1E2329', 
    overflow: 'hidden',
    borderRadius: 1
  },
  loaderIndicator: { 
    width: '40%', 
    height: '100%', 
    backgroundColor: '#FFD700', 
    borderRadius: 1,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3
  },
});

