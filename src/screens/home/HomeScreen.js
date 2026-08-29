import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, fetchUnreadCount } from '../../store/notificationSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SPACING } from '../../theme/spacing';
import { CurrencySwitcher } from '../../components/common/CurrencySwitcher';
import { SideMenu } from '../../components/common/SideMenu';

export const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const { latest } = useSelector(s => s.signals);
  const { items: notifs } = useSelector(s => s.notifications);
  const unreadNewsCount = (notifs || []).filter(i => !i.is_read).length;
  
  const [refreshing, setRefreshing] = useState(false);
  const [liveMarkets, setLiveMarkets] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    if (user && !user.demo_account_id) {
      setShowProfilePrompt(true);
    }
  }, [user]);

  const fetchMarkets = async () => {
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22,%22ETHUSDT%22,%22BNBUSDT%22,%22SOLUSDT%22,%22XRPUSDT%22%5D');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLiveMarkets(data);
      }
    } catch (e) {
      console.log('Market fetch error', e);
    }
  };

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 10000); 
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMarkets();
    setRefreshing(false);
  }, []);

  const quickActions = [
    { icon: 'chart-line', label: 'Signals', screen: 'Markets' },
    { icon: 'lightning-bolt', label: 'My Bots', screen: 'Bots' },
    { icon: 'robot-excited', label: 'AI Chat', screen: 'AI' },
    { icon: 'school', label: 'Learn', screen: 'More', params: { screen: 'Education' } },
    { icon: 'credit-card', label: 'Plans', screen: 'More', params: { screen: 'Payments' } },
    { icon: 'gamepad-variant', label: 'Demo', screen: 'More', params: { screen: 'Demo' } },
    { icon: 'history', label: 'History', screen: 'More' },
    { icon: 'dots-horizontal', label: 'More', screen: 'More' },
  ];

  const handleQuickAction = (a) => {
    if (a.params) navigation.navigate(a.screen, a.params);
    else navigation.navigate(a.screen);
  };

  return (
    <AnimatedScreen style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />}>
        
        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <View style={styles.headerRow}>
            <View style={styles.profileArea}>
              <TouchableOpacity style={styles.menuBtn} onPress={() => setIsMenuOpen(true)}>
                <Icon name="sort-variant" size={24} color="#FFF" />
              </TouchableOpacity>
              <View>
                <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Trader'}</Text>
                <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <CurrencySwitcher compact />
              <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('More', { screen: 'Notifications' })}>
                <Icon name="bell-outline" size={22} color="#FFFFFF" />
                {unreadNewsCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{unreadNewsCount > 99 ? '99+' : unreadNewsCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroTopRow}>
                 <Icon name="robot" size={20} color="#FFD700" />
                 <Text style={styles.heroBadgeText}>KTS Intelligence</Text>
              </View>
              <Text style={styles.heroTitle}>Automated Trading Active</Text>
              <Text style={styles.heroSub}>
                {latest?.length > 0 
                  ? 'We have ' + latest.length + ' active high-probability signals in the market today.'
                  : 'AI bots are currently scanning the markets for high-probability setups.'}
              </Text>
              
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>94%</Text>
                  <Text style={styles.heroStatLabel}>Win Rate</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>24/7</Text>
                  <Text style={styles.heroStatLabel}>AI Scan</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>{latest?.length || 0}</Text>
                  <Text style={styles.heroStatLabel}>Signals</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.heroMainBtn} onPress={() => navigation.navigate('Bots')}>
                <Text style={styles.heroMainBtnText}>Access AI Bots</Text>
                <Icon name="arrow-right" size={16} color="#0B0E11" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.sectionHeaderMini}>
            <Text style={styles.sectionTitleMini}>Live Markets</Text>
            <View style={styles.liveIndicator}>
               <View style={styles.liveDot} />
               <Text style={styles.liveText}>Real-time</Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tickerScroll} contentContainerStyle={{ gap: 12, paddingHorizontal: SPACING.screen }}>
            {liveMarkets.length === 0 ? (
              <Text style={{ color: '#888', padding: 20 }}>Loading live markets...</Text>
            ) : liveMarkets.map((pair, idx) => {
              const isUp = Number(pair.priceChangePercent) >= 0;
              return (
                <TouchableOpacity key={idx} style={styles.tickerCard} onPress={() => navigation.navigate('MarketDetail', { symbol: pair.symbol, pair: pair.symbol.replace('USDT', '/USDT'), price: pair.lastPrice, change: pair.priceChangePercent, isUp: isUp })}>
                  <Text style={styles.tickerPair}>{pair.symbol.replace('USDT', '/USDT')}</Text>
                  <Text style={[styles.tickerPrice, { color: isUp ? '#00C853' : '#FF4444' }]}>
                    {Number(pair.lastPrice) < 10 ? Number(pair.lastPrice).toFixed(4) : Number(pair.lastPrice).toFixed(2)}
                  </Text>
                  <View style={[styles.tickerBadge, { backgroundColor: isUp ? 'rgba(0,200,83,0.1)' : 'rgba(255,68,68,0.1)' }]}>
                    <Text style={[styles.tickerChange, { color: isUp ? '#00C853' : '#FF4444' }]}>
                      {isUp ? '+' : ''}{Number(pair.priceChangePercent).toFixed(2)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.quickGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity key={i} style={styles.quickItem} onPress={() => handleQuickAction(a)}>
                <View style={styles.quickIcon}>
                  <Icon name={a.icon} size={24} color="#FFD700" />
                </View>
                <Text style={styles.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Signals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Markets')}>
              <Text style={styles.seeAll}>View More <Icon name="arrow-right" size={12} /></Text>
            </TouchableOpacity>
          </View>

          {!latest || latest.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="text-box-search-outline" size={40} color="#333" />
              <Text style={styles.emptyText}>No active signals right now</Text>
            </View>
          ) : latest.slice(0, 3).map((signal) => (
            <View key={signal.id} style={styles.signalCard}>
              <View style={styles.signalRow}>
                <View style={styles.signalLeft}>
                  <Text style={styles.signalSymbolText}>{signal.symbol}</Text>
                  <Text style={styles.signalTime}>
                    {signal.created_at ? new Date(signal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                  </Text>
                </View>
                <View style={[styles.signalDirBadge, { backgroundColor: signal.direction === 'buy' ? 'rgba(0,200,83,0.1)' : 'rgba(255,68,68,0.1)' }]}>
                  <Text style={[styles.signalDirText, { color: signal.direction === 'buy' ? '#00C853' : '#FF4444' }]}>
                    {signal.direction === 'buy' ? 'BUY' : 'SELL'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.signalTitleRow}>
                 <Text style={styles.signalTitle}>{signal.title}</Text>
              </View>

              <View style={styles.signalPrices}>
                <View style={styles.signalPriceCol}>
                  <Text style={styles.signalPriceLabel}>Entry</Text>
                  <Text style={styles.signalPriceValue}>{Number(signal.entry_price).toFixed(4)}</Text>
                </View>
                <View style={styles.signalPriceCol}>
                  <Text style={styles.signalPriceLabel}>Take Profit</Text>
                  <Text style={[styles.signalPriceValue, { color: '#00C853' }]}>{Number(signal.take_profit).toFixed(4)}</Text>
                </View>
                <View style={styles.signalPriceCol}>
                  <Text style={styles.signalPriceLabel}>Stop Loss</Text>
                  <Text style={[styles.signalPriceValue, { color: '#FF4444' }]}>{Number(signal.stop_loss).toFixed(4)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

            {/* RENDER CUSTOM SLIDING DRAWER AT ROOT */}
      <SideMenu isVisible={isMenuOpen} onClose={() => setIsMenuOpen(false)} navigation={navigation} />

      {/* Profile Completion Prompt */}
      <Modal visible={showProfilePrompt} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <Icon name="account-edit-outline" size={32} color="#0B0E11" />
            </View>
            <Text style={styles.modalTitle}>Complete Your Profile</Text>
            <Text style={styles.modalText}>Please link your Demo MT5 account in your profile to request and test AI Bots risk-free.</Text>
            
            <TouchableOpacity 
              style={styles.modalBtnPrimary}
              onPress={() => {
                setShowProfilePrompt(false);
                navigation.navigate('More', { screen: 'Profile' });
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
  container: { flex: 1, backgroundColor: '#0B0E11' }, 
  
  header: { backgroundColor: '#12161A', paddingHorizontal: SPACING.screen, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  profileArea: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#1A1E24', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A2E35' },
  greeting: { fontSize: 16, color: '#FFFFFF', fontWeight: '700' },
  date: { fontSize: 12, color: '#A0A0A0', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1E24', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifBadge: { position: 'absolute', top: -2, right: -4, backgroundColor: '#FF4444', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#0B0E11', paddingHorizontal: 3 },
  notifBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
  
  heroCard: { backgroundColor: '#1E2329', borderRadius: 16, elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2E35' },
  heroContent: { padding: 20 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  heroBadgeText: { fontSize: 12, color: '#FFD700', fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  heroTitle: { fontSize: 22, color: '#FFFFFF', fontWeight: '800' },
  heroSub: { fontSize: 13, color: '#A0A0A0', marginTop: 6, lineHeight: 18 },
  heroStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 20, backgroundColor: '#12161A', padding: 12, borderRadius: 12 },
  heroStatItem: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: 16, color: '#FFFFFF', fontWeight: '700' },
  heroStatLabel: { fontSize: 11, color: '#888', marginTop: 4 },
  heroStatDivider: { width: 1, height: '100%', backgroundColor: '#2A2E35' },
  heroMainBtn: { backgroundColor: '#FFD700', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, gap: 8 },
  heroMainBtnText: { fontSize: 14, color: '#0B0E11', fontWeight: '700' },

  body: { paddingTop: 20, paddingBottom: 40 },
  
  sectionHeaderMini: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: SPACING.screen, marginBottom: 15 },
  sectionTitleMini: { fontSize: 16, color: '#FFFFFF', fontWeight: '700' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,200,83,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00C853' },
  liveText: { fontSize: 10, color: '#00C853', fontWeight: '700', textTransform: 'uppercase' },

  tickerScroll: { marginBottom: 25 },
  tickerCard: { backgroundColor: '#12161A', padding: 14, borderRadius: 12, width: 130, borderWidth: 1, borderColor: '#1E2329' },
  tickerPair: { fontSize: 13, color: '#A0A0A0', fontWeight: '700' },
  tickerPrice: { fontSize: 17, fontWeight: '800', marginTop: 8 },
  tickerBadge: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tickerChange: { fontSize: 11, fontWeight: '700' },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.screen, rowGap: 24, marginTop: 10 },
  quickItem: { width: '25%', alignItems: 'center', gap: 8 },
  quickIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#12161A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1E2329' },
  quickLabel: { fontSize: 11, color: '#A0A0A0', fontWeight: '500' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: SPACING.screen, marginTop: 35, marginBottom: 15 },
  sectionTitle: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },
  seeAll: { fontSize: 13, color: '#FFD700', fontWeight: '600' },

  signalCard: { backgroundColor: '#12161A', borderRadius: 12, padding: 16, marginHorizontal: SPACING.screen, marginBottom: 12, borderWidth: 1, borderColor: '#1E2329' },
  signalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  signalLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  signalSymbolText: { fontSize: 16, color: '#FFFFFF', fontWeight: '800' },
  signalTime: { fontSize: 12, color: '#888' },
  signalDirBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  signalDirText: { fontSize: 12, fontWeight: '800' },
  signalTitleRow: { marginTop: 10, marginBottom: 15 },
  signalTitle: { fontSize: 13, color: '#A0A0A0' },
  
  signalPrices: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0B0E11', padding: 12, borderRadius: 8 },
  signalPriceCol: { flex: 1 },
  signalPriceLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  signalPriceValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
  
  emptyCard: { alignItems: 'center', padding: 40, marginHorizontal: SPACING.screen, backgroundColor: '#12161A', borderRadius: 12 },
    emptyText: { fontSize: 14, color: '#888', marginTop: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#12161A', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#1E2329' },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, color: '#FFFFFF', fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  modalText: { fontSize: 14, color: '#A0A0A0', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalBtnPrimary: { backgroundColor: '#FFD700', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  modalBtnPrimaryText: { color: '#0B0E11', fontSize: 16, fontWeight: '800' },
  modalBtnSecondary: { paddingVertical: 12 },
  modalBtnSecondaryText: { color: '#888', fontSize: 14, fontWeight: '600' }
});




