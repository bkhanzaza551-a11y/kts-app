import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Animated, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Button } from '../../components/common/Button';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'chart-box-outline',
    title: 'Trade Smarter',
    subtitle: 'AI-powered trading signals with 85%+ win rate. Let our bots handle the market while you relax.',
  },
  {
    id: '2',
    icon: 'bell-ring-outline',
    title: 'Real-Time Alerts',
    subtitle: 'Get instant notifications for every signal. Never miss a profitable trade opportunity again.',
  },
  {
    id: '3',
    icon: 'account-group-outline',
    title: 'Join 50K+ Traders',
    subtitle: 'Connect with our global community. Share strategies, learn from experts, and grow together.',
  },
];

export const OnboardingScreen = ({ onFinish }) => {
  const [current, setCurrent] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrent(viewableItems[0].index);
  }).current;

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: current + 1, animated: true });
    } else {
      onFinish();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Floating Skip Button */}
      <View style={styles.header}>
        {current < SLIDES.length - 1 ? (
          <TouchableOpacity onPress={onFinish} style={styles.skipBtn} hitSlop={{top:10, bottom:10, left:10, right:10}}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : <View />}
      </View>

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
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            
            {/* --- VISUAL/LOTTIE AREA --- */}
            <View style={styles.visualArea}>
              {/* NOTE: Replace this View with your <LottieView /> component here! */}
              <View style={styles.iconGlow}>
                <Icon name={item.icon} size={80} color={COLORS.primary} />
              </View>
            </View>

            {/* --- TEXT AREA --- */}
            <View style={styles.textArea}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

          </View>
        )}
      />

      <View style={styles.bottomSheet}>
        {/* Buttery Smooth Indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 32, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            const bgColor = scrollX.interpolate({
              inputRange,
              outputRange: [COLORS.textMuted, COLORS.primary, COLORS.textMuted],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i.toString()}
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: bgColor }]}
              />
            );
          })}
        </View>

        <Button
          title={current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          icon={current === SLIDES.length - 1 ? <Icon name="rocket-launch-outline" size={20} color={COLORS.background} /> : null}
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    height: 60, 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    alignItems: 'center', 
    paddingHorizontal: SPACING.lg,
    zIndex: 10
  },
  skipBtn: { padding: SPACING.sm },
  skipText: { ...TYPOGRAPHY.body2, color: COLORS.textMuted, fontWeight: '600' },
  
  slide: { width, flex: 1 },
  visualArea: {
    flex: 0.6, // Takes top 60% of screen
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.primary + '40',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15
  },
  
  textArea: {
    flex: 0.4,
    paddingHorizontal: SPACING.screen * 2,
    alignItems: 'center',
  },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text, textAlign: 'center', fontWeight: '900', marginBottom: SPACING.md },
  subtitle: { ...TYPOGRAPHY.body1, color: COLORS.textMuted, textAlign: 'center', lineHeight: 24 },
  
  bottomSheet: { 
    paddingHorizontal: SPACING.screen, 
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xxl,
    paddingTop: SPACING.md,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.xl, gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  actionBtn: { width: '100%', elevation: 4, shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: {width: 0, height: 4} },
});
