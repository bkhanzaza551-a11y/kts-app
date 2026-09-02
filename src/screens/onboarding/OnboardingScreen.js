import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
  Easing,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';
import { Button } from '../../components/common/Button';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    image: require('../../../assets/images/onboarding_1.jpg'),
    badge: 'SMART TRADING',
    titleMain: 'Trade',
    titleAccent: 'Smarter',
    subtitle: 'Empower your trading journey with advanced algorithmic tools, deep technical insights, and real-time market data.',
  },
  {
    id: '2',
    image: require('../../../assets/images/onboarding_2.png'),
    badge: 'AI ASSISTANT',
    titleMain: 'Learn & Trade',
    titleAccent: 'with KTS Bot',
    subtitle: 'Your intelligent AI companion that guides, teaches, and helps you master the markets with clarity.',
  },
  {
    id: '3',
    image: require('../../../assets/images/onboarding_3.png'),
    badge: 'LIVE ALERTS',
    titleMain: 'Real-Time',
    titleAccent: 'Market Signals',
    subtitle: 'Receive instant notifications for high-probability setups, real-time price action, and market momentum.',
  },
];

const SlideItem = ({ item, index, scrollX }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  // Pure Native Driver Interpolations
  const imageScale = scrollX.interpolate({
    inputRange,
    outputRange: [1.15, 1.0, 1.15],
    extrapolate: 'clamp',
  });

  const imageTranslateX = scrollX.interpolate({
    inputRange,
    outputRange: [width * 0.2, 0, -width * 0.2],
    extrapolate: 'clamp',
  });

  const textOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollX.interpolate({
    inputRange,
    outputRange: [30, 0, -30],
    extrapolate: 'clamp',
  });

  const subTranslateY = scrollX.interpolate({
    inputRange,
    outputRange: [45, 0, -45],
    extrapolate: 'clamp',
  });

  const badgeScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.slide}>
      {/* Top Visual Area */}
      <View style={styles.visualArea}>
        <View style={styles.imageContainer}>
          <Animated.Image
            source={item.image}
            style={[
              styles.image,
              {
                transform: [
                  { scale: imageScale },
                  { translateX: imageTranslateX },
                ],
              },
            ]}
            resizeMode="cover"
          />
        </View>

        {/* Gradient shadow overlay for seamless blend */}
        <View style={styles.gradientOverlay} />
      </View>

      {/* Bottom Text Area with Staggered Fade & Slide */}
      <View style={styles.textArea}>
        {/* Category Pill Badge */}
        <Animated.View
          style={[
            styles.badgePill,
            {
              opacity: textOpacity,
              transform: [{ scale: badgeScale }],
            },
          ]}
        >
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{item.badge}</Text>
        </Animated.View>

        {/* Animated Title */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: titleTranslateY }],
          }}
        >
          <Text style={styles.title}>
            {item.titleMain}{' '}
            <Text style={styles.titleGold}>{item.titleAccent}</Text>
          </Text>
        </Animated.View>

        {/* Animated Subtitle */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: subTranslateY }],
          }}
        >
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </Animated.View>
      </View>
    </View>
  );
};

export const OnboardingScreen = ({ onFinish }) => {
  const [current, setCurrent] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // Entrance animations (slow-mo fade in on screen start)
  const screenFadeAnim = useRef(new Animated.Value(0)).current;
  const bottomSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // 100% Native Driver Cinematic Entrance
    Animated.parallel([
      Animated.timing(screenFadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bottomSlideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrent(viewableItems[0].index ?? 0);
    }
  }).current;

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: current + 1, animated: true });
    } else {
      onFinish();
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: screenFadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      {/* Floating Header with Glassmorphism Skip Button */}
      <View style={styles.header}>
        {current < SLIDES.length - 1 ? (
          <TouchableOpacity
            onPress={onFinish}
            style={styles.skipBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
            <Icon name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Carousel FlatList using 100% useNativeDriver: true */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <SlideItem
            item={item}
            index={index}
            scrollX={scrollX}
          />
        )}
      />

      {/* Bottom Controls Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          { transform: [{ translateY: bottomSlideAnim }] },
        ]}
      >
        {/* Modern Dot Indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i.toString()}
              style={[
                styles.dot,
                i === current ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <Button
          title={current === SLIDES.length - 1 ? 'GET STARTED' : 'Next'}
          onPress={handleNext}
          variant="primary"
          rightIcon="arrow-right"
          style={styles.actionBtn}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 42,
    right: 20,
    zIndex: 10,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  skipText: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '600',
    letterSpacing: 0.3,
    marginRight: 2,
  },

  slide: {
    width,
    flex: 1,
  },
  visualArea: {
    height: height * 0.58,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#000000',
    opacity: 0.6,
  },

  textArea: {
    height: height * 0.22,
    paddingHorizontal: SPACING.screen * 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
    zIndex: 2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    marginBottom: 10,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 30,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.4,
    lineHeight: 38,
  },
  titleGold: {
    color: '#FFD700',
  },
  subtitle: {
    ...TYPOGRAPHY.body1,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
    paddingHorizontal: 10,
  },

  bottomSheet: {
    height: height * 0.20,
    paddingHorizontal: SPACING.screen,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    justifyContent: 'flex-end',
    zIndex: 3,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 26,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 26,
    backgroundColor: '#FFD700',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#334155',
  },
  actionBtn: {
    width: '100%',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});
