import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Platform,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storage } from '../../utils/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TOUR_STEPS = [
  {
    id: 'signals',
    title: '📊 Real-Time Signals',
    subtitle: 'High Probability Setups',
    targetLabel: 'Signals Section',
    icon: 'chart-line',
    screen: 'Markets',
    whatIsIt: 'KTS Markets ka automated technical engine jo Gold (XAUUSD) aur Forex pairs par real-time verified trading signals deta hai.',
    howToUse: 'Signals tab kholen, entry point, Stop Loss (SL) aur Target Take-Profit (TP1, TP2) check karke direct trade lagayein.',
    benefit: 'Bina ghanton chart dekhay accurate aur profitable market setups par trade karne ki sahoolat.',
    highlightCoords: { top: 0.58, left: 0.12 }, // Proportional anchor
  },
  {
    id: 'bots',
    title: '⚡ Automated MT5 Bot',
    subtitle: 'Hands-Free Algorithmic Trading',
    targetLabel: 'KTS 10 Pips Bot',
    icon: 'lightning-bolt',
    screen: 'Bots',
    whatIsIt: 'KTS 10 Pips Automated Bot jo MetaTrader 5 (MT5) se direct link ho kar high-precision scalping aur day trading karta hai.',
    howToUse: 'Apna Exness/MT5 account bind karein, daily risk parameter aur lot size set karein aur Bot ko active karein.',
    benefit: 'Jazbaat (Emotions) se paak, 24/7 automated trades aur strict risk management ke sath continuous pips.',
    highlightCoords: { top: 0.32, left: 0.5 },
  },
  {
    id: 'ai',
    title: '🤖 AI Trading Assistant',
    subtitle: 'Your 24/7 Smart Co-Pilot',
    targetLabel: 'AI Chat Assistant',
    icon: 'robot-excited',
    screen: 'AI',
    whatIsIt: 'Advanced Groq AI powered trading coach jo market news, support/resistance aur chart patterns ko instantly analyse karta hai.',
    howToUse: 'Kisi bhi pair (jaise XAUUSD ya BTC) ke baray mein sawal poochhein, ya risk/reward calculate karwayein.',
    benefit: 'Har trade se pehle expert second opinion aur 24 ghante trading guidance bilkul muft.',
    highlightCoords: { top: 0.58, left: 0.62 },
  },
  {
    id: 'chat',
    title: '💬 Community Trader Room',
    subtitle: 'Connect With Verified Traders',
    targetLabel: 'Live Chat Room',
    icon: 'chat-processing',
    screen: 'Chat',
    whatIsIt: 'Verified forex aur crypto traders ka live community room jahan members market discussions aur analysis share karte hain.',
    howToUse: 'Chat room open karein, doosre traders ke charts dekhein, discussions mein hissa lein aur exclusive trading stickers use karein.',
    benefit: 'Market sentiment ka fori andaza aur professional traders ke group se seekhne ka behtareen moka.',
    highlightCoords: { top: 0.58, left: 0.88 },
  },
  {
    id: 'academy',
    title: '🎓 Academy & Demo Account',
    subtitle: 'Learn & Practice Zero-Risk',
    targetLabel: 'Education & Demo Center',
    icon: 'school',
    screen: 'More',
    params: { screen: 'Education' },
    whatIsIt: 'Step-by-step trading courses, video lessons aur free MetaTrader 5 demo account setup facilities.',
    howToUse: 'Lessons complete karein aur demo balance par apni strategy test karein jab tak aap fully confident na ho jayein.',
    benefit: 'Bina real paisa zaya kiye professional trading skill seekhne aur strategy test karne ka safe rasta.',
    highlightCoords: { top: 0.70, left: 0.25 },
  },
];

export const InteractiveTourGuide = ({ visible, onClose, onNavigateFeature }) => {
  const insets = useSafeAreaInsets();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const badgeScale = useRef(new Animated.Value(0.8)).current;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (visible) {
      setCurrentStepIndex(0);
      animateIn();
      startPulse();
    }
  }, [visible]);

  useEffect(() => {
    // Re-animate card on step change
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    badgeScale.setValue(0.8);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStepIndex]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    await storage.setTourCompleted();
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleExploreNow = () => {
    handleComplete();
    if (onNavigateFeature) {
      onNavigateFeature(currentStep.screen, currentStep.params);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleComplete}
    >
      <View style={styles.overlay}>
        {/* Top Header Controls */}
        <View style={[styles.topControls, { paddingTop: insets.top + 10 }]}>
          <View style={styles.stepBadge}>
            <Icon name="compass" size={14} color="#FFD700" style={{ marginRight: 6 }} />
            <Text style={styles.stepBadgeText}>
              Step {currentStepIndex + 1} of {TOUR_STEPS.length}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleComplete}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip Tour</Text>
            <Icon name="close" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar Indicators */}
        <View style={styles.progressBarRow}>
          {TOUR_STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <View
                key={step.id}
                style={[
                  styles.progressSegment,
                  isCompleted && styles.progressSegmentCompleted,
                  isActive && styles.progressSegmentActive,
                ]}
              />
            );
          })}
        </View>

        {/* Visual Target Pointer / Halo Spotlight */}
        <View
          style={[
            styles.spotlightContainer,
            {
              top: SCREEN_HEIGHT * currentStep.highlightCoords.top,
              left: SCREEN_WIDTH * currentStep.highlightCoords.left - 35,
            },
          ]}
          pointerEvents="none"
        >
          <Animated.View
            style={[
              styles.spotlightHalo,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <View style={styles.spotlightCore}>
            <Icon name={currentStep.icon} size={22} color="#0B0E11" />
          </View>
          <View style={styles.spotlightArrowDown}>
            <Icon name="arrow-up-bold" size={20} color="#FFD700" />
          </View>
        </View>

        {/* Bottom Educational Card */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              paddingBottom: insets.bottom + 20,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.guideCard}>
            {/* Glow Header */}
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Icon name={currentStep.icon} size={26} color="#FFD700" />
              </View>
              <View style={styles.headerTitles}>
                <Text style={styles.cardTitle}>{currentStep.title}</Text>
                <Text style={styles.cardSubtitle}>{currentStep.subtitle}</Text>
              </View>
              <Animated.View
                style={[
                  styles.targetTag,
                  { transform: [{ scale: badgeScale }] },
                ]}
              >
                <Text style={styles.targetTagText}>{currentStep.targetLabel}</Text>
              </Animated.View>
            </View>

            {/* Structured Explanation Blocks */}
            <View style={styles.infoBlock}>
              <View style={styles.infoRow}>
                <View style={styles.infoBullet}>
                  <Icon name="information-outline" size={15} color="#FFD700" />
                </View>
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Yeh Kya Hai?</Text>
                  <Text style={styles.infoDesc}>{currentStep.whatIsIt}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoBullet}>
                  <Icon name="gesture-tap" size={15} color="#38BDF8" />
                </View>
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Kaise Use Karein?</Text>
                  <Text style={styles.infoDesc}>{currentStep.howToUse}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoBullet}>
                  <Icon name="check-decagram" size={15} color="#10B981" />
                </View>
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Faida (Benefit):</Text>
                  <Text style={styles.infoDesc}>{currentStep.benefit}</Text>
                </View>
              </View>
            </View>

            {/* Quick Explore Button */}
            <TouchableOpacity
              style={styles.exploreActionBtn}
              onPress={handleExploreNow}
              activeOpacity={0.8}
            >
              <Icon name="arrow-right-circle" size={18} color="#FFD700" style={{ marginRight: 6 }} />
              <Text style={styles.exploreActionText}>
                Open {currentStep.title.replace(/[^a-zA-Z ]/g, '').trim()} Screen
              </Text>
            </TouchableOpacity>

            {/* Navigation Button Footer */}
            <View style={styles.cardFooter}>
              {currentStepIndex > 0 ? (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                  activeOpacity={0.7}
                >
                  <Icon name="arrow-left" size={18} color="#94A3B8" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 80 }} />
              )}

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextButtonText}>
                  {isLastStep ? 'Got It! Start Trading 🚀' : 'Next Step 👉'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 10, 0.88)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  stepBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  skipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 6,
    zIndex: 10,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressSegmentCompleted: {
    backgroundColor: '#FFD700',
  },
  progressSegmentActive: {
    backgroundColor: '#FFD700',
    height: 4,
  },
  spotlightContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    zIndex: 5,
  },
  spotlightHalo: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
  },
  spotlightCore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  spotlightArrowDown: {
    position: 'absolute',
    bottom: -24,
  },
  cardContainer: {
    paddingHorizontal: 16,
    zIndex: 10,
  },
  guideCard: {
    backgroundColor: '#111722',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  headerTitles: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  targetTag: {
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  targetTagText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
  },
  infoBlock: {
    backgroundColor: '#0B0F17',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBullet: {
    width: 22,
    alignItems: 'center',
    marginTop: 2,
  },
  infoTextCol: {
    flex: 1,
    marginLeft: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: '#94A3B8',
  },
  exploreActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 14,
  },
  exploreActionText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 4,
  },
  backButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#0B0E11',
    fontSize: 14,
    fontWeight: '800',
  },
});
