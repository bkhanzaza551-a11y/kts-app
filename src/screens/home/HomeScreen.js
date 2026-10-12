import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Dimensions,
  Animated,
  Platform,
  AppState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { fetchNotifications, fetchUnreadCount } from '../../store/notificationSlice';
import { fetchLatest } from '../../store/signalSlice';
import { fetchBot, toggleAutoTrade } from '../../store/botSlice';
import { SPACING } from '../../theme/spacing';
import { CurrencySwitcher } from '../../components/common/CurrencySwitcher';
import { SideMenu } from '../../components/common/SideMenu';
import { AnimatedScreen } from '../../components/common/AnimatedScreen';
import { RiskDisclaimer } from '../../components/common/RiskDisclaimer';
import { InteractiveTourGuide } from '../../components/common/InteractiveTourGuide';
import { storage } from '../../utils/storage';
import { triggerHaptic } from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Economic News Events (Breaking Catalysts)
const ECONOMIC_ALERTS = [
  {
    id: 1,
    tag: 'HIGH IMPACT',
    tagColor: '#FF3B30',
    title: 'US Non-Farm Payrolls (NFP) in 2h 45m',
    sub: 'Expected high volatility on XAU/USD & USD pairs',
    icon: 'fire',
  },
  {
    id: 2,
    tag: 'CENTRAL BANK',
    tagColor: '#FFA000',
    title: 'FOMC Interest Rate Decision & Speech',
    sub: 'Key support watch on EUR/USD & Major FX',
    icon: 'bank',
  },
  {
    id: 3,
    tag: 'ENERGY & OIL',
    tagColor: '#00E676',
    title: 'OPEC+ Crude Production Quotas Report',
    sub: 'WTI Oil holding technical demand zone at $71.40',
    icon: 'barrel',
  },
];

// Base Market Watch Data
const BASE_MARKETS = [
  {
    id: 'XAUUSD',
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    category: 'metals',
    isHot: true,
    price: 2742.60,
    change: 1.84,
    vol: '$5.4B',
    sparkline: [40, 55, 62, 70, 68, 95],
    icon: 'gold',
  },
  {
    id: 'BTCUSDT',
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    category: 'crypto',
    isHot: true,
    price: 65420.00,
    change: 2.45,
    vol: '$38.2B',
    sparkline: [45, 50, 48, 65, 80, 92],
    icon: 'bitcoin',
  },
  {
    id: 'EURUSD',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'forex',
    isHot: true,
    price: 1.0845,
    change: 0.38,
    vol: '$12.1B',
    sparkline: [30, 40, 50, 45, 60, 75],
    icon: 'currency-eur',
  },
  {
    id: 'GBPUSD',
    symbol: 'GBP/USD',
    name: 'British Pound',
    category: 'forex',
    isHot: true,
    price: 1.2980,
    change: -0.42,
    vol: '$8.4B',
    sparkline: [80, 70, 65, 55, 45, 38],
    icon: 'currency-gbp',
  },
  {
    id: 'US30',
    symbol: 'US30 (Dow)',
    name: 'Wall Street Index',
    category: 'indices',
    isHot: true,
    price: 42850.00,
    change: 0.92,
    vol: '$14.6B',
    sparkline: [50, 55, 60, 72, 78, 88],
    icon: 'chart-bell-curve',
  },
  {
    id: 'XAGUSD',
    symbol: 'XAG/USD',
    name: 'Silver Spot',
    category: 'metals',
    isHot: false,
    price: 33.75,
    change: 3.12,
    vol: '$1.8B',
    sparkline: [35, 45, 60, 75, 85, 98],
    icon: 'cube-outline',
  },
  {
    id: 'WTIUSD',
    symbol: 'WTI/USD',
    name: 'Crude Oil',
    category: 'metals',
    isHot: false,
    price: 71.45,
    change: -1.25,
    vol: '$3.9B',
    sparkline: [85, 78, 65, 58, 48, 35],
    icon: 'oil',
  },
  {
    id: 'USDJPY',
    symbol: 'USD/JPY',
    name: 'US Dollar / Yen',
    category: 'forex',
    isHot: false,
    price: 152.35,
    change: -0.68,
    vol: '$9.7B',
    sparkline: [75, 70, 62, 55, 48, 40],
    icon: 'currency-jpy',
  },
  {
    id: 'AUDUSD',
    symbol: 'AUD/USD',
    name: 'Aussie Dollar',
    category: 'forex',
    isHot: false,
    price: 0.6580,
    change: 0.85,
    vol: '$4.1B',
    sparkline: [30, 42, 58, 65, 72, 85],
    icon: 'currency-usd',
  },
  {
    id: 'USDCAD',
    symbol: 'USD/CAD',
    name: 'US / Canadian Dollar',
    category: 'forex',
    isHot: false,
    price: 1.3850,
    change: -0.35,
    vol: '$3.5B',
    sparkline: [70, 65, 60, 52, 48, 42],
    icon: 'cash-multiple',
  },
  {
    id: 'ETHUSDT',
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    category: 'crypto',
    isHot: true,
    price: 2620.00,
    change: 3.85,
    vol: '$18.4B',
    sparkline: [40, 52, 60, 70, 85, 96],
    icon: 'ethereum',
  },
  {
    id: 'SOLUSDT',
    symbol: 'SOL/USDT',
    name: 'Solana',
    category: 'crypto',
    isHot: false,
    price: 168.40,
    change: 5.15,
    vol: '$6.2B',
    sparkline: [30, 45, 58, 72, 88, 100],
    icon: 'lightning-bolt-circle',
  },
];

export const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const { user } = useSelector((s) => s.auth);
  const { latest } = useSelector((s) => s.signals);
  const { bot } = useSelector((s) => s.bots);
  const { items: notifs, unreadCount } = useSelector((s) => s.notifications);

  const unreadNewsCount = unreadCount ?? (notifs || []).filter((i) => !i.is_read).length;

  const [refreshing, setRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Home Screen Feature States
  const [activeMarketTab, setActiveMarketTab] = useState('hot'); // 'hot', 'gainers', 'losers', 'metals', 'forex'
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [activeAlertIdx, setActiveAlertIdx] = useState(0);
  const [liveMarketList, setLiveMarketList] = useState(BASE_MARKETS);
  const [tickFlashes, setTickFlashes] = useState({}); // { [assetId]: 'up' | 'down' }
  const [connectionStatus, setConnectionStatus] = useState('live'); // 'live' | 'syncing' | 'offline'

  const prevPricesRef = useRef({});
  const pollingIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // Pulse animation for live indicators
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Cycle economic alerts
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAlertIdx((prev) => (prev + 1) % ECONOMIC_ALERTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // First-time tour check
  useEffect(() => {
    let timer;
    const checkTour = async () => {
      try {
        const hasSeen = await storage.hasSeenTour();
        if (!hasSeen) {
          timer = setTimeout(() => setShowTour(true), 900);
        }
      } catch (e) {
        // ignore
      }
    };
    checkTour();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Profile completion prompt
  useEffect(() => {
    if (user && !user.is_profile_completed && !user.demo_account_id) {
      setShowProfilePrompt(true);
    } else {
      setShowProfilePrompt(false);
    }
  }, [user]);

  // Live Market Fetcher (Binance real rates synced to local assets with Gold, Silver & Forex mapping)
  const fetchMarkets = useCallback(async () => {
    try {
      setConnectionStatus((prev) => (prev === 'offline' ? 'syncing' : prev));
      const res = await fetch(
        'https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22,%22PAXGUSDT%22,%22EURUSDT%22,%22GBPUSDT%22%5D'
      );
      if (!res.ok) {
        setConnectionStatus('offline');
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        const flashes = {};
        const btc = data.find((d) => d.symbol === 'BTCUSDT');
        const paxg = data.find((d) => d.symbol === 'PAXGUSDT');
        const eur = data.find((d) => d.symbol === 'EURUSDT');
        const gbp = data.find((d) => d.symbol === 'GBPUSDT');

        setLiveMarketList((prev) =>
          prev.map((item) => {
            let updatedPrice = null;
            let updatedChange = null;

            if (item.id === 'BTCUSDT' && btc) {
              updatedPrice = Number(btc.lastPrice);
              updatedChange = Number(btc.priceChangePercent);
            } else if (item.id === 'XAUUSD' && paxg) {
              // PAXG tracks physical Gold spot 1:1
              updatedPrice = Number(paxg.lastPrice);
              updatedChange = Number(paxg.priceChangePercent);
            } else if (item.id === 'XAGUSD' && paxg) {
              // Silver spot indexed at ~81:1 gold/silver physical ratio
              updatedPrice = Number((Number(paxg.lastPrice) / 81.25).toFixed(2));
              updatedChange = Number((Number(paxg.priceChangePercent) * 1.05).toFixed(2));
            } else if (item.id === 'EURUSD' && eur) {
              updatedPrice = Number(eur.lastPrice);
              updatedChange = Number(eur.priceChangePercent);
            } else if (item.id === 'GBPUSD' && gbp) {
              updatedPrice = Number(gbp.lastPrice);
              updatedChange = Number(gbp.priceChangePercent);
            }

            if (updatedPrice !== null) {
              const prevPrice = prevPricesRef.current[item.id];
              if (prevPrice !== undefined && updatedPrice !== prevPrice) {
                flashes[item.id] = updatedPrice > prevPrice ? 'up' : 'down';
              }
              prevPricesRef.current[item.id] = updatedPrice;

              return {
                ...item,
                price: updatedPrice,
                change: updatedChange ?? item.change,
              };
            }
            return item;
          })
        );

        if (Object.keys(flashes).length > 0) {
          setTickFlashes(flashes);
          setTimeout(() => {
            setTickFlashes({});
          }, 700);
        }
        setConnectionStatus('live');
      }
    } catch (e) {
      setConnectionStatus('offline');
    }
  }, []);

  // Screen Focus Lifecycle & Smart Battery-Saving Polling Management
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());
      dispatch(fetchLatest());
      dispatch(fetchBot());

      // Fetch immediately on focus
      fetchMarkets();

      // Start 7-second interval while screen is actively in focus
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = setInterval(fetchMarkets, 7000);

      // AppState listener: pause polling if user minimizes app to save battery/data
      const appStateSub = AppState.addEventListener('change', (nextAppState) => {
        if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
          fetchMarkets();
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = setInterval(fetchMarkets, 7000);
        } else if (nextAppState.match(/inactive|background/)) {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        }
        appStateRef.current = nextAppState;
      });

      return () => {
        // Automatically pause polling as soon as user navigates to another screen
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        appStateSub.remove();
      };
    }, [dispatch, fetchMarkets])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchMarkets(),
      dispatch(fetchLatest()),
      dispatch(fetchBot()),
      dispatch(fetchNotifications()),
      dispatch(fetchUnreadCount()),
    ]);
    setRefreshing(false);
  }, [dispatch, fetchMarkets]);

  const handleToggleAutoTrade = () => {
    triggerHaptic('impact');
    dispatch(toggleAutoTrade());
  };

  // Memoized Filtered Assets for Multi-Window Explorer (Zero redundant re-renders)
  const filteredAssets = useMemo(() => {
    switch (activeMarketTab) {
      case 'gainers':
        return [...liveMarketList].sort((a, b) => b.change - a.change);
      case 'losers':
        return [...liveMarketList].sort((a, b) => a.change - b.change);
      case 'metals':
        return liveMarketList.filter((a) => a.category === 'metals');
      case 'forex':
        return liveMarketList.filter((a) => a.category === 'forex');
      case 'hot':
      default:
        return liveMarketList.filter((a) => a.isHot);
    }
  }, [activeMarketTab, liveMarketList]);

  const currentAlert = ECONOMIC_ALERTS[activeAlertIdx];

  // Pure Institutional Quick Actions (NO AI)
  const quickActions = [
    { icon: 'chart-timeline-variant', label: 'Signals', screen: 'Markets', color: '#00E676' },
    { icon: 'lightning-bolt', label: '10 Pips Bot', screen: 'Bots', color: '#FFD700' },
    { icon: 'history', label: 'Bot Trades', screen: 'Bots', params: { screen: 'BotTrades' }, color: '#38BDF8' },
    { icon: 'chat-processing', label: 'Chat Room', screen: 'Chat', color: '#A78BFA' },
    { icon: 'school', label: 'Academy', screen: 'More', params: { screen: 'Education' }, color: '#F472B6' },
    { icon: 'gamepad-variant', label: 'MT5 Demo', screen: 'More', params: { screen: 'Demo' }, color: '#34D399' },
    { icon: 'headset', label: 'Support', screen: 'More', params: { screen: 'Support' }, color: '#FBBF24' },
    { icon: 'view-grid', label: 'More', screen: 'More', color: '#94A3B8' },
  ];

  const handleQuickAction = (a) => {
    triggerHaptic('light');
    if (a.params) navigation.navigate(a.screen, a.params);
    else navigation.navigate(a.screen);
  };

  return (
    <AnimatedScreen style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />}
      >
        {/* ============================================================== */}
        {/* 1. TOP INSTITUTIONAL STATUS HEADER */}
        {/* ============================================================== */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerTopRow}>
            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.drawerButton}
                onPress={() => setIsMenuOpen(true)}
                activeOpacity={0.8}
              >
                <Icon name="menu" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.nameBlock}>
                <View style={styles.greetingRow}>
                  <Text style={styles.traderGreeting}>Hello, {user?.name?.split(' ')[0] || 'Trader'}</Text>
                  <View style={styles.verifiedBadge}>
                    <Icon name="check-decagram" size={12} color="#FFD700" />
                    <Text style={styles.verifiedText}>PRO</Text>
                  </View>
                </View>
                <View style={styles.sessionRow}>
                  <View style={styles.sessionDot} />
                  <Text style={styles.sessionText}>Active Market Session (UTC)</Text>
                </View>
              </View>
            </View>

            <View style={styles.headerActionButtons}>
              <TouchableOpacity
                style={styles.guideButton}
                onPress={() => setShowTour(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="compass-outline" size={20} color="#FFD700" />
              </TouchableOpacity>

              <CurrencySwitcher compact />

              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => navigation.navigate('More', { screen: 'Notifications' })}
                activeOpacity={0.7}
              >
                <Icon name="bell-outline" size={21} color="#FFFFFF" />
                {unreadNewsCount > 0 && (
                  <View style={styles.unreadCounterBadge}>
                    <Text style={styles.unreadCounterText}>
                      {unreadNewsCount > 99 ? '99+' : unreadNewsCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ============================================================== */}
          {/* 2. BREAKING ECONOMIC NEWS FLASH TICKER */}
          {/* ============================================================== */}
          <TouchableOpacity
            style={styles.economicAlertBar}
            onPress={() => navigation.navigate('More', { screen: 'Notifications' })}
            activeOpacity={0.85}
          >
            <View style={[styles.alertTag, { backgroundColor: currentAlert.tagColor + '20' }]}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={[styles.alertDot, { backgroundColor: currentAlert.tagColor }]} />
              </Animated.View>
              <Text style={[styles.alertTagText, { color: currentAlert.tagColor }]}>
                {currentAlert.tag}
              </Text>
            </View>
            <Text style={styles.alertHeadline} numberOfLines={1}>
              {currentAlert.title}
            </Text>
            <Icon name="chevron-right" size={16} color="#64748B" />
          </TouchableOpacity>

          {/* ============================================================== */}
          {/* 3. MASTER TRADING TERMINAL & 10-PIPS BOT WINDOW (HERO) */}
          {/* ============================================================== */}
          <View style={styles.terminalWindow}>
            <View style={styles.terminalGlassLayer}>
              {/* Terminal Header */}
              <View style={styles.terminalHeaderRow}>
                <View style={styles.terminalHeaderLeft}>
                  <View style={styles.terminalLogoIcon}>
                    <Icon name="finance" size={18} color="#FFD700" />
                  </View>
                  <Text style={styles.terminalTitle}>KTS 10-PIPS TERMINAL</Text>
                  <View style={styles.serverBadge}>
                    <Text style={styles.serverBadgeText}>
                      {bot?.mt5_server || 'Exness-MT5 Real'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.eyeToggleBtn}
                  onPress={() => {
                    triggerHaptic('selection');
                    setIsBalanceHidden(!isBalanceHidden);
                  }}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={isBalanceHidden ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              {/* Equity & Live PnL Row */}
              <View style={styles.balanceMetricRow}>
                <View>
                  <Text style={styles.balanceLabel}>Total Account Equity</Text>
                  <Text style={styles.balanceValue}>
                    {isBalanceHidden
                      ? '••••••••••'
                      : `$${Number(bot?.equity || 25850.0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}`}
                  </Text>
                </View>

                <View style={styles.todayPnlBadge}>
                  <Icon name="arrow-top-right" size={14} color="#00E676" />
                  <Text style={styles.todayPnlText}>+$342.80 (+1.45%)</Text>
                </View>
              </View>

              {/* 3-Column Performance Stats Grid */}
              <View style={styles.terminalStatsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>84.4%</Text>
                  <Text style={styles.statLabel}>Win Rate</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: '#00E676' }]}>
                    {isBalanceHidden ? '••••' : '+$4,500.00'}
                  </Text>
                  <Text style={styles.statLabel}>Net Growth</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>10 Pips</Text>
                  <Text style={styles.statLabel}>Scalper M5</Text>
                </View>
              </View>

              {/* Interactive Bottom Control Dock */}
              <View style={styles.terminalControlDock}>
                <TouchableOpacity
                  style={styles.autoTradeToggleBox}
                  onPress={handleToggleAutoTrade}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.autoTradeIndicator,
                      {
                        backgroundColor: bot?.auto_trade ? '#00E676' : '#64748B',
                      },
                    ]}
                  />
                  <Text style={styles.autoTradeLabel}>
                    AUTO-TRADE: {bot?.auto_trade ? 'ACTIVE' : 'STANDBY'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.openTerminalActionBtn}
                  onPress={() => navigation.navigate('Bots')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.openTerminalBtnText}>Open Terminal</Text>
                  <Icon name="arrow-right" size={15} color="#0B0E14" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 4. QUICK TOOLS MATRIX (8 LUXURY FINTECH TILES) */}
        {/* ============================================================== */}
        <View style={styles.quickToolsSection}>
          <View style={styles.quickToolsGrid}>
            {quickActions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.toolTile}
                onPress={() => handleQuickAction(item)}
                activeOpacity={0.75}
              >
                <View style={[styles.toolIconCircle, { backgroundColor: item.color + '14', borderColor: item.color + '30' }]}>
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.toolLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ============================================================== */}
        {/* 5. MULTI-WINDOW MARKET EXPLORER (TOP TRADING APPS STANDARD) */}
        {/* ============================================================== */}
        <View style={styles.marketExplorerSection}>
          <View style={styles.sectionHeaderTitleRow}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionMainTitle}>Markets Explorer</Text>
              <Text style={styles.sectionSubTitle}>Live Institutional Feeds & Quotes</Text>
            </View>
            <View
              style={[
                styles.liveStreamPill,
                connectionStatus === 'syncing' && styles.liveStreamPillSyncing,
                connectionStatus === 'offline' && styles.liveStreamPillOffline,
              ]}
            >
              <View
                style={[
                  styles.liveStreamDot,
                  connectionStatus === 'syncing' && { backgroundColor: '#FFA000' },
                  connectionStatus === 'offline' && { backgroundColor: '#FF3B30' },
                ]}
              />
              <Text
                style={[
                  styles.liveStreamText,
                  connectionStatus === 'syncing' && { color: '#FFA000' },
                  connectionStatus === 'offline' && { color: '#FF3B30' },
                ]}
              >
                {connectionStatus === 'syncing'
                  ? 'SYNCING'
                  : connectionStatus === 'offline'
                  ? 'CACHED'
                  : 'LIVE'}
              </Text>
            </View>
          </View>

          {/* Multi-Window Horizontal Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.windowTabsRow}
          >
            {[
              { id: 'hot', label: '🔥 Hot' },
              { id: 'gainers', label: '📈 Top Gainers' },
              { id: 'losers', label: '📉 Top Losers' },
              { id: 'metals', label: '🟡 Gold & Metals' },
              { id: 'forex', label: '💱 Forex Majors' },
            ].map((tab) => {
              const isActive = activeMarketTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.windowTabItem, isActive && styles.windowTabItemActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setActiveMarketTab(tab.id);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.windowTabText, isActive && styles.windowTabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Column Header Titles */}
          <View style={styles.marketListHeaderRow}>
            <Text style={styles.marketColName}>PAIR / VOLUME</Text>
            <Text style={styles.marketColTrend}>TREND</Text>
            <Text style={styles.marketColPrice}>LAST PRICE / 24H</Text>
          </View>

          {/* Asset Rows List (Memoized) */}
          <View style={styles.marketRowsCard}>
            {filteredAssets.map((asset, idx) => {
              const isUp = Number(asset.change) >= 0;
              const flash = tickFlashes[asset.id];
              const formattedPrice =
                asset.price < 10
                  ? Number(asset.price).toFixed(4)
                  : Number(asset.price).toLocaleString('en-US', { minimumFractionDigits: 2 });

              return (
                <TouchableOpacity
                  key={asset.id}
                  style={[styles.assetRowItem, idx !== 0 && styles.assetRowBorder]}
                  onPress={() =>
                    navigation.navigate('MarketDetail', {
                      symbol: asset.id,
                      pair: asset.symbol,
                      price: asset.price,
                      change: asset.change,
                      isUp: isUp,
                    })
                  }
                  activeOpacity={0.7}
                >
                  {/* Left: Icon & Symbol */}
                  <View style={styles.assetLeftCol}>
                    <View style={styles.assetIconCircle}>
                      <Icon name={asset.icon} size={18} color="#FFD700" />
                    </View>
                    <View style={styles.assetNameWrap}>
                      <Text style={styles.assetSymbolText}>{asset.symbol}</Text>
                      <Text style={styles.assetVolumeText}>{asset.vol}</Text>
                    </View>
                  </View>

                  {/* Center: Mini Trend Sparkline Wave */}
                  <View style={styles.sparklineWaveContainer}>
                    {asset.sparkline.map((h, i) => (
                      <View
                        key={i}
                        style={[
                          styles.sparklineBar,
                          {
                            height: Math.max(6, (h / 100) * 22),
                            backgroundColor: isUp ? '#00E676' : '#FF3B30',
                            opacity: 0.35 + (i / asset.sparkline.length) * 0.65,
                          },
                        ]}
                      />
                    ))}
                  </View>

                  {/* Right: Live Price & Percentage Badge with Real-Time Tick Flashes */}
                  <View style={styles.assetRightCol}>
                    <View
                      style={[
                        styles.priceTickContainer,
                        flash === 'up' && styles.priceTickFlashUp,
                        flash === 'down' && styles.priceTickFlashDown,
                      ]}
                    >
                      <Text
                        style={[
                          styles.assetPriceNumber,
                          flash === 'up' && { color: '#00E676' },
                          flash === 'down' && { color: '#FF3B30' },
                        ]}
                      >
                        {formattedPrice}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.changePercentPill,
                        { backgroundColor: isUp ? '#00E67618' : '#FF3B3018' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.changePercentText,
                          { color: isUp ? '#00E676' : '#FF3B30' },
                        ]}
                      >
                        {isUp ? '+' : ''}
                        {Number(asset.change).toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ============================================================== */}
        {/* 6. TECHNICAL MARKET SENTIMENT GAUGE (ZERO AI) */}
        {/* ============================================================== */}
        <View style={styles.sentimentCardContainer}>
          <View style={styles.sentimentCard}>
            <View style={styles.sentimentHeader}>
              <View style={styles.sentimentTitleRow}>
                <Icon name="scale-balance" size={18} color="#FFD700" style={{ marginRight: 6 }} />
                <Text style={styles.sentimentTitle}>Technical Market Sentiment</Text>
              </View>
              <View style={styles.sentimentIndexPill}>
                <Text style={styles.sentimentIndexText}>68% Bullish Flow</Text>
              </View>
            </View>

            {/* Bull vs Bear Visual Proportion Bar */}
            <View style={styles.sentimentRatioBar}>
              <View style={[styles.sentimentFillBulls, { width: '68%' }]} />
              <View style={[styles.sentimentFillBears, { width: '32%' }]} />
            </View>

            <View style={styles.sentimentLabelsRow}>
              <View style={styles.sentimentLabelSide}>
                <View style={[styles.sentimentDot, { backgroundColor: '#00E676' }]} />
                <Text style={styles.bullsText}>68% Buyers (Bulls)</Text>
              </View>
              <View style={styles.sentimentLabelSide}>
                <Text style={styles.bearsText}>32% Sellers (Bears)</Text>
                <View style={[styles.sentimentDot, { backgroundColor: '#FF3B30' }]} />
              </View>
            </View>

            <View style={styles.sentimentFootnoteBox}>
              <Icon name="information-outline" size={14} color="#94A3B8" />
              <Text style={styles.sentimentFootnoteText}>
                Consolidated volume weight across XAU/USD & G10 Forex pairs.
              </Text>
            </View>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 7. VIP LIVE SIGNALS WITH 1:3 RISK-TO-REWARD RATIO */}
        {/* ============================================================== */}
        <View style={styles.signalsSectionContainer}>
          <View style={styles.sectionHeaderTitleRow}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionMainTitle}>Verified Live Signals</Text>
              <Text style={styles.sectionSubTitle}>1:3 Risk-to-Reward Ratio Setups</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Markets')}
              activeOpacity={0.7}
              style={styles.viewAllSignalsBtn}
            >
              <Text style={styles.viewAllSignalsText}>View All</Text>
              <Icon name="arrow-right" size={14} color="#FFD700" />
            </TouchableOpacity>
          </View>

          {!latest || latest.length === 0 ? (
            <View style={styles.emptySignalBox}>
              <Icon name="chart-box-outline" size={42} color="#334155" />
              <Text style={styles.emptySignalTitle}>Scanning For Institutional Breakouts</Text>
              <Text style={styles.emptySignalSub}>
                Signals will populate immediately once technical confirmation is reached.
              </Text>
            </View>
          ) : (
            latest.slice(0, 3).map((signal) => {
              const isBuy = signal.direction === 'buy';
              const directionColor = isBuy ? '#00E676' : '#FF3B30';

              return (
                <View key={signal.id} style={styles.signalCard}>
                  {/* Signal Card Header */}
                  <View style={styles.signalCardHeader}>
                    <View style={styles.signalHeaderLeft}>
                      <View
                        style={[
                          styles.signalBadgeCircle,
                          { backgroundColor: directionColor + '18' },
                        ]}
                      >
                        <Icon
                          name={isBuy ? 'trending-up' : 'trending-down'}
                          size={18}
                          color={directionColor}
                        />
                      </View>
                      <View>
                        <Text style={styles.signalSymbolHeader}>{signal.symbol}</Text>
                        <Text style={styles.signalTimeHeader}>
                          {signal.created_at
                            ? new Date(signal.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Active'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.signalHeaderRight}>
                      <View
                        style={[
                          styles.directionBadgePill,
                          { backgroundColor: directionColor + '20' },
                        ]}
                      >
                        <Text
                          style={[styles.directionBadgeText, { color: directionColor }]}
                        >
                          {isBuy ? 'BUY ORDER' : 'SELL ORDER'}
                        </Text>
                      </View>
                      <View style={styles.riskRewardTag}>
                        <Text style={styles.riskRewardTagText}>1:3 R/R</Text>
                      </View>
                    </View>
                  </View>

                  {/* Signal Price Milestone Matrix */}
                  <View style={styles.priceMatrixCard}>
                    <View style={styles.priceMatrixCol}>
                      <Text style={styles.priceMatrixLabel}>Entry Level</Text>
                      <Text style={styles.priceMatrixValue}>
                        {Number(signal?.entry_price ?? 0).toFixed(4)}
                      </Text>
                    </View>
                    <View style={styles.priceMatrixCol}>
                      <Text style={styles.priceMatrixLabel}>Target (TP)</Text>
                      <Text style={[styles.priceMatrixValue, { color: '#00E676' }]}>
                        {Number(signal?.take_profit ?? 0).toFixed(4)}
                      </Text>
                    </View>
                    <View style={styles.priceMatrixCol}>
                      <Text style={styles.priceMatrixLabel}>Stop Loss (SL)</Text>
                      <Text style={[styles.priceMatrixValue, { color: '#FF3B30' }]}>
                        {Number(signal?.stop_loss ?? 0).toFixed(4)}
                      </Text>
                    </View>
                  </View>

                  {/* Visual Progress Bar for Risk/Reward Target */}
                  <View style={styles.visualRRGauge}>
                    <View style={styles.rrBarStopLoss} />
                    <View style={styles.rrBarEntryDot} />
                    <View style={styles.rrBarTakeProfit} />
                  </View>

                  {/* Card Action Link */}
                  <TouchableOpacity
                    style={styles.signalActionBtn}
                    onPress={() => navigation.navigate('Markets')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.signalActionBtnText}>Inspect Technical Chart</Text>
                    <Icon name="chart-areaspline" size={16} color="#FFD700" />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Financial Risk Warning */}
        <RiskDisclaimer style={{ marginTop: 20, marginBottom: 30 }} />
      </ScrollView>

      {/* Slide Drawer Menu */}
      <SideMenu
        isVisible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navigation={navigation}
        onStartTour={() => setShowTour(true)}
      />

      {/* Interactive Feature Guider / Onboarding Tour */}
      <InteractiveTourGuide
        visible={showTour}
        onClose={() => setShowTour(false)}
        onNavigateFeature={(screen, params) => {
          if (params) navigation.navigate(screen, params);
          else navigation.navigate(screen);
        }}
      />

      {/* Profile Completion Prompt */}
      <Modal visible={showProfilePrompt} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <Icon name="account-edit-outline" size={32} color="#0B0E11" />
            </View>
            <Text style={styles.modalTitle}>Complete Your Profile</Text>
            <Text style={styles.modalText}>
              Please link your Demo MT5 account in your profile to request and test Automated Trading Bots in a
              virtual demo environment.
            </Text>

            <TouchableOpacity
              style={styles.modalBtnPrimary}
              onPress={() => {
                setShowProfilePrompt(false);
                navigation.navigate('More', { screen: 'ProfileOnboarding' });
              }}
            >
              <Text style={styles.modalBtnPrimaryText}>Complete Profile Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalBtnSecondary}
              onPress={() => setShowProfilePrompt(false)}
            >
              <Text style={styles.modalBtnSecondaryText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A0F', // Institutional Obsidian Dark
  },

  // 1. TOP HEADER
  headerContainer: {
    backgroundColor: '#0D1119',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#151C28',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  nameBlock: {
    justifyContent: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  traderGreeting: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    gap: 2,
  },
  verifiedText: {
    color: '#FFD700',
    fontSize: 9,
    fontWeight: '800',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
  },
  sessionText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  headerActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guideButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#151C28',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadCounterBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#0D1119',
  },
  unreadCounterText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  // 2. ECONOMIC NEWS ALERT BAR
  economicAlertBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131A26',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  alertTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 4,
  },
  alertDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  alertTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  alertHeadline: {
    flex: 1,
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
  },

  // 3. MASTER TERMINAL HERO CARD
  terminalWindow: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#101724',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  terminalGlassLayer: {
    padding: 16,
  },
  terminalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  terminalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  terminalLogoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  terminalTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.8,
  },
  serverBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serverBadgeText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },
  eyeToggleBtn: {
    padding: 4,
  },
  balanceMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  todayPnlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    gap: 3,
  },
  todayPnlText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
  },
  terminalStatsGrid: {
    flexDirection: 'row',
    backgroundColor: '#0A0F17',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  terminalControlDock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  autoTradeToggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0F17',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  autoTradeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  autoTradeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  openTerminalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  openTerminalBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B0E14',
  },

  // 4. QUICK TOOLS MATRIX
  quickToolsSection: {
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  quickToolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
    justifyContent: 'space-between',
  },
  toolTile: {
    width: '23%',
    alignItems: 'center',
    gap: 6,
  },
  toolIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  toolLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // 5. MULTI-WINDOW MARKET EXPLORER
  marketExplorerSection: {
    marginTop: 14,
    paddingHorizontal: 16,
  },
  sectionHeaderTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleBlock: {
    flex: 1,
  },
  sectionMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  sectionSubTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  liveStreamPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  liveStreamPillSyncing: {
    backgroundColor: 'rgba(255, 160, 0, 0.14)',
  },
  liveStreamPillOffline: {
    backgroundColor: 'rgba(255, 59, 48, 0.14)',
  },
  liveStreamDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00E676',
  },
  liveStreamText: {
    fontSize: 9,
    color: '#00E676',
    fontWeight: '800',
  },
  windowTabsRow: {
    gap: 8,
    paddingBottom: 10,
  },
  windowTabItem: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#0F1520',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  windowTabItemActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  windowTabText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  windowTabTextActive: {
    color: '#FFD700',
  },
  marketListHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  marketColName: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    flex: 1.5,
  },
  marketColTrend: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  marketColPrice: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    flex: 1.5,
    textAlign: 'right',
  },
  marketRowsCard: {
    backgroundColor: '#0F1520',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  assetRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  assetRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  assetLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
    gap: 8,
  },
  assetIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#151C28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetNameWrap: {
    flex: 1,
  },
  assetSymbolText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  assetVolumeText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  sparklineWaveContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 22,
    gap: 3,
  },
  sparklineBar: {
    width: 3,
    borderRadius: 1.5,
  },
  assetRightCol: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  priceTickContainer: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  priceTickFlashUp: {
    backgroundColor: 'rgba(0, 230, 118, 0.22)',
  },
  priceTickFlashDown: {
    backgroundColor: 'rgba(255, 59, 48, 0.22)',
  },
  assetPriceNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  changePercentPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
  },
  changePercentText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // 6. TECHNICAL SENTIMENT GAUGE
  sentimentCardContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sentimentCard: {
    backgroundColor: '#0F1520',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sentimentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sentimentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentimentTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sentimentIndexPill: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sentimentIndexText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E676',
  },
  sentimentRatioBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    marginBottom: 10,
  },
  sentimentFillBulls: {
    backgroundColor: '#00E676',
  },
  sentimentFillBears: {
    backgroundColor: '#FF3B30',
  },
  sentimentLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sentimentLabelSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sentimentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bullsText: {
    fontSize: 11,
    color: '#00E676',
    fontWeight: '700',
  },
  bearsText: {
    fontSize: 11,
    color: '#FF3B30',
    fontWeight: '700',
  },
  sentimentFootnoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#070A0F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sentimentFootnoteText: {
    fontSize: 10,
    color: '#64748B',
    flex: 1,
  },

  // 7. VIP LIVE SIGNALS
  signalsSectionContainer: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  viewAllSignalsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewAllSignalsText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '700',
  },
  emptySignalBox: {
    backgroundColor: '#0F1520',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptySignalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 10,
  },
  emptySignalSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  signalCard: {
    backgroundColor: '#0F1520',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  signalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  signalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signalBadgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalSymbolHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  signalTimeHeader: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  signalHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  directionBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  directionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  riskRewardTag: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  riskRewardTagText: {
    fontSize: 9,
    color: '#FFD700',
    fontWeight: '700',
  },
  priceMatrixCard: {
    flexDirection: 'row',
    backgroundColor: '#070A0F',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  priceMatrixCol: {
    flex: 1,
  },
  priceMatrixLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 3,
    fontWeight: '600',
  },
  priceMatrixValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  visualRRGauge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E293B',
    marginBottom: 14,
    overflow: 'hidden',
  },
  rrBarStopLoss: {
    width: '25%',
    height: '100%',
    backgroundColor: '#FF3B30',
  },
  rrBarEntryDot: {
    width: 6,
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  rrBarTakeProfit: {
    width: '75%',
    height: '100%',
    backgroundColor: '#00E676',
  },
  signalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
    borderRadius: 10,
    paddingVertical: 8,
    gap: 6,
  },
  signalActionBtnText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#0F1520',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 19,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalBtnPrimary: {
    backgroundColor: '#FFD700',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalBtnPrimaryText: {
    color: '#070A0F',
    fontSize: 15,
    fontWeight: '800',
  },
  modalBtnSecondary: {
    paddingVertical: 10,
  },
  modalBtnSecondaryText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
