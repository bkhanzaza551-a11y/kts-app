import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Animated, TouchableOpacity, Image, Platform } from 'react-native';
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
    title: (styles) => <Text style={styles.title}>Trade <Text style={{ color: '#FFD700' }}>Smarter</Text></Text>,
    subtitle: 'Empower your trading journey with advanced tools, deep insights, and real-time market data.',
  },
  {
    id: '2',
    image: require('../../../assets/images/onboarding_2.png'),
    title: (styles) => <Text style={styles.title}>Learn & Trade{'\n'}<Text style={{ color: '#FFD700' }}>with KTS Bot</Text></Text>,
    subtitle: 'Your AI trading guide that teaches, guides, and helps you grow from beginner to pro.',
  },
  {
    id: '3',
    image: require('../../../assets/images/onboarding_3.png'),
    title: (styles) => <Text style={styles.title}>Real-Time <Text style={{ color: '#FFD700' }}>Alerts</Text></Text>,
    subtitle: 'Get instant notifications for every signal. Never miss a profitable trade opportunity again.',
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
    <View style={styles.container}>
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
            
            <View style={styles.visualArea}>
              <Image source={item.image} style={styles.image} resizeMode="cover" />
            </View>

            <View style={styles.textArea}>
              {item.title(styles)}
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

          </View>
        )}
      />

      <View style={styles.bottomSheet}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            const bgColor = scrollX.interpolate({
              inputRange,
              outputRange: ['#888888', '#FFD700', '#888888'],
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
          title={current === SLIDES.length - 1 ? 'GET STARTED' : 'Next'}
          onPress={handleNext}
          variant="primary"
          rightIcon="arrow-right"
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { 
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10
  },
  skipBtn: { padding: SPACING.sm },
  skipText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  
  slide: { width, flex: 1 },
  visualArea: {
    height: height * 0.60,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  
  textArea: {
    height: height * 0.20,
    paddingHorizontal: SPACING.screen * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  title: { fontSize: 32, color: '#FFFFFF', textAlign: 'center', fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  subtitle: { ...TYPOGRAPHY.body1, color: '#CCCCCC', textAlign: 'center', lineHeight: 24, fontSize: 15 },
  
  bottomSheet: { 
    height: height * 0.20,
    paddingHorizontal: SPACING.screen, 
    paddingBottom: 40,
    justifyContent: 'flex-end'
  },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30, gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  actionBtn: { width: '100%' },
});
