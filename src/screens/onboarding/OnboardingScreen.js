import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Button } from '../../components/common/Button';

const { width } = Dimensions.get('window');
const VIEWABILITY_CONFIG = { viewAreaCoveragePercentThreshold: 50 };

const SLIDES = [
  {
    id: '1',
    emoji: '📈',
    title: 'Trade Smarter',
    subtitle: 'AI-powered trading signals with 85%+ win rate. Let our bots handle the market while you relax.',
    bg: ['#1A1510', '#0D0D0D'],
  },
  {
    id: '2',
    emoji: '🔔',
    title: 'Real-Time Alerts',
    subtitle: 'Get instant notifications for every signal. Never miss a profitable trade opportunity again.',
    bg: ['#0D1520', '#0D0D0D'],
  },
  {
    id: '3',
    emoji: '👥',
    title: 'Join 50K+ Traders',
    subtitle: 'Connect with our global community. Share strategies, learn from experts, and grow together.',
    bg: ['#151020', '#0D0D0D'],
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
      flatListRef.current?.scrollToIndex({ index: current + 1 });
    } else {
      onFinish();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LinearGradient colors={item.bg} style={styles.slide}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </LinearGradient>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, current === i && styles.dotActive]}
            />
          ))}
        </View>

        <Button
          title={current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
        />

        {current < SLIDES.length - 1 && (
          <Button title="Skip" onPress={onFinish} variant="ghost" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emojiContainer: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: COLORS.darkCard, borderWidth: 2, borderColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center', marginBottom: 40,
  },
  emoji: { fontSize: 64 },
  title: { ...TYPOGRAPHY.h1, color: COLORS.white, textAlign: 'center', marginBottom: 16 },
  subtitle: { ...TYPOGRAPHY.body1, color: COLORS.silver, textAlign: 'center', lineHeight: 24 },
  footer: { paddingHorizontal: 40, paddingBottom: 60 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.darkBorder },
  dotActive: { width: 24, backgroundColor: COLORS.gold },
});
