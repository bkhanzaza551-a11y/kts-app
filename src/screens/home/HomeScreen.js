import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS, SHADOW } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { CurrencySwitcher } from '../../components/common/CurrencySwitcher';
import { loadProfile } from '../../store/authSlice';
import { fetchLatest } from '../../store/signalSlice';
import { fetchUnreadCount } from '../../store/notificationSlice';
import { fetchNotificationSettings } from '../../store/notificationSettingsSlice';
import { useCurrency } from '../../context/CurrencyContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { latest } = useSelector(s => s.signals);
  const { unreadCount } = useSelector(s => s.notifications);
  const [refreshing, setRefreshing] = React.useState(false);
  const { formatAmount } = useCurrency();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    dispatch(loadProfile());
    dispatch(fetchLatest());
    dispatch(fetchUnreadCount());
    dispatch(fetchNotificationSettings());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchLatest()), dispatch(fetchUnreadCount())]);
    setRefreshing(false);
  };

  const quickActions = [
    { icon: '📊', label: 'Signals', screen: 'Signals' },
    { icon: '🤖', label: 'My Bots', screen: 'Bots' },
    { icon: '💬', label: 'Chat', screen: 'Chat' },
    { icon: '🎓', label: 'Learn', screen: 'More', params: { screen: 'Education' } },
    { icon: '💳', label: 'Plans', screen: 'More', params: { screen: 'Payments' } },
    { icon: '📋', label: 'Demo', screen: 'More', params: { screen: 'Demo' } },
  ];

  const handleQuickAction = (a) => {
    if (a.params) {
      navigation.navigate(a.screen, a.params);
    } else {
      navigation.navigate(a.screen);
    }
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Trader'} 👋</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.headerRight}>
            <CurrencySwitcher compact />
            <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('More', { screen: 'Notifications' })}>
              <Text style={styles.notifIcon}>🔔</Text>
              {unreadCount > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount}</Text></View>}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((a, i) => (
            <TouchableOpacity key={i} style={styles.quickItem} onPress={() => handleQuickAction(a)}>
              <View style={styles.quickIcon}><Text style={styles.quickEmoji}>{a.icon}</Text></View>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Signals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signals')}>
            <Text style={styles.seeAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {latest.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active signals right now</Text>
          </Card>
        ) : latest.slice(0, 4).map((signal) => (
          <Card key={signal.id} style={styles.signalCard} onPress={() => navigation.navigate('Signals', { screen: 'SignalDetail', params: { signalId: signal.id } })}>
            <View style={styles.signalRow}>
              <View style={styles.signalLeft}>
                <View style={styles.signalSymbolBadge}>
                  <Text style={styles.signalSymbolText}>{signal.symbol}</Text>
                </View>
                <View>
                  <Text style={styles.signalTitle}>{signal.title}</Text>
                  <Text style={styles.signalTime}>
                    {signal.created_at ? new Date(signal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                  </Text>
                </View>
              </View>
              <View style={[styles.signalDirBadge, { backgroundColor: signal.direction === 'buy' ? COLORS.greenMuted : 'rgba(255, 23, 68, 0.15)' }]}>
                <Text style={[styles.signalDirText, { color: signal.direction === 'buy' ? COLORS.green : COLORS.red }]}>
                  {signal.direction === 'buy' ? '▲ BUY' : '▼ SELL'}
                </Text>
              </View>
            </View>
            <View style={styles.signalPrices}>
              <View style={styles.signalPriceCol}>
                <Text style={styles.signalPriceLabel}>ENTRY</Text>
                <Text style={styles.signalPriceValue}>{formatAmount(signal.entry_price)}</Text>
              </View>
              <View style={styles.signalPriceDivider} />
              <View style={styles.signalPriceCol}>
                <Text style={styles.signalPriceLabel}>TP</Text>
                <Text style={[styles.signalPriceValue, { color: COLORS.green }]}>{formatAmount(signal.take_profit)}</Text>
              </View>
              <View style={styles.signalPriceDivider} />
              <View style={styles.signalPriceCol}>
                <Text style={styles.signalPriceLabel}>SL</Text>
                <Text style={[styles.signalPriceValue, { color: COLORS.red }]}>{formatAmount(signal.stop_loss)}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: SPACING.screen, backgroundColor: '#1A1510' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { ...TYPOGRAPHY.h2, color: COLORS.white },
  date: { ...TYPOGRAPHY.body3, color: COLORS.silver, marginTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.darkCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.darkBorder },
  notifIcon: { fontSize: 20 },
  notifBadge: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { fontSize: 10, color: COLORS.white, fontWeight: '700' },
  body: { padding: SPACING.screen },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.md },
  sectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.white },
  seeAll: { ...TYPOGRAPHY.body3, color: COLORS.gold },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginTop: SPACING.md },
  quickItem: { width: '30%', alignItems: 'center', gap: 6 },
  quickIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.darkCard, borderWidth: 1, borderColor: COLORS.darkBorder, alignItems: 'center', justifyContent: 'center' },
  quickEmoji: { fontSize: 24 },
  quickLabel: { ...TYPOGRAPHY.caption, color: COLORS.silver },

  signalCard: { marginBottom: SPACING.md },
  signalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  signalLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  signalSymbolBadge: { backgroundColor: COLORS.goldMuted, borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.gold + '40' },
  signalSymbolText: { ...TYPOGRAPHY.caption, color: COLORS.gold, fontWeight: '700' },
  signalTitle: { ...TYPOGRAPHY.body1, color: COLORS.white, fontWeight: '600' },
  signalTime: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginTop: 2 },
  signalDirBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  signalDirText: { ...TYPOGRAPHY.caption, fontWeight: '700', fontSize: 11 },
  signalPrices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    backgroundColor: COLORS.darkSurface,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
  },
  signalPriceCol: { flex: 1, alignItems: 'center' },
  signalPriceDivider: { width: 1, height: 28, backgroundColor: COLORS.darkBorder },
  signalPriceLabel: { ...TYPOGRAPHY.caption, color: COLORS.grey, fontSize: 10, letterSpacing: 0.5 },
  signalPriceValue: { ...TYPOGRAPHY.body2, color: COLORS.white, fontWeight: '700', marginTop: 4 },
  emptyCard: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { ...TYPOGRAPHY.body2, color: COLORS.grey },
});
