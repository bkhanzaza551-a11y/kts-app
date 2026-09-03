import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchBot, toggleAutoTrade } from '../../store/botSlice';
import { formatWinRate } from '../../utils/formatters';
import { useCurrency } from '../../context/CurrencyContext';
import { Skeleton } from '../../components/common/Skeleton';
import { RiskDisclaimer } from '../../components/common/RiskDisclaimer';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';

export const BotListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bot, isLoading } = useSelector(s => s.bots);
  const [refreshing, setRefreshing] = useState(false);
  const { formatAmount } = useCurrency();
  const insets = useSafeAreaInsets();

  useEffect(() => { dispatch(fetchBot()); }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchBot());
    setRefreshing(false);
  };

  const handleToggle = () => {
    dispatch(toggleAutoTrade());
  };

  if (isLoading && !bot) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <View>
            <Text style={styles.headerTitle}>KTS Trading Bot</Text>
            <Text style={styles.headerSub}>Automated Trading</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.loadingContainer}>
          <View style={styles.botCard}>
            <View style={styles.cardHeader}>
              <Skeleton width={56} height={56} borderRadius={16} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Skeleton width={140} height={20} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width={90} height={14} borderRadius={4} />
              </View>
              <Skeleton width={80} height={28} borderRadius={14} />
            </View>
            <View style={styles.statsGrid}>
              {[1,2,3,4].map(s => (
                <View key={s} style={styles.statBox}>
                  <Skeleton width={55} height={12} borderRadius={4} style={{ marginBottom: 8 }} />
                  <Skeleton width={75} height={18} borderRadius={4} />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!bot) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <View>
            <Text style={styles.headerTitle}>KTS Trading Bot</Text>
            <Text style={styles.headerSub}>Automated Trading</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Icon name="robot-outline" size={60} color={COLORS.gold} />
            <View style={styles.floatingStar}><Icon name="creation" size={20} color={COLORS.gold} /></View>
          </View>
          <Text style={styles.emptyTitle}>Bot Not Configured</Text>
          <Text style={styles.emptyDesc}>
            The KTS Trading Bot is being set up. Contact admin for more details.
          </Text>
        </View>
      </View>
    );
  }

  const profit = bot.total_profit || 0;
  const isProfit = profit >= 0;
  const isActive = bot.status?.toLowerCase() === 'active';
  const profitPct = bot.balance ? ((profit / bot.balance) * 100).toFixed(1) : '0';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <View>
          <Text style={styles.headerTitle}>KTS Trading Bot</Text>
          <Text style={styles.headerSub}>Automated Trading</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Icon name="refresh" size={20} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Bot Header Card */}
        <View style={styles.botCard}>
          <View style={styles.cardHeader}>
            <View style={styles.botIconWrapper}>
              <Icon name="robot-outline" size={28} color={COLORS.gold} />
            </View>
            <View style={styles.botInfo}>
              <Text style={styles.botName}>{bot.name}</Text>
              <Text style={styles.botDesc}>{bot.description || 'KTS10 Pips Bot - Gold/XAUUSD'}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isActive ? 'rgba(0,200,83,0.1)' : 'rgba(160,160,160,0.1)' }]}>
              <View style={[styles.statusDot, { backgroundColor: isActive ? COLORS.green : COLORS.grey }]} />
              <Text style={[styles.statusText, { color: isActive ? COLORS.green : COLORS.grey }]}>
                {bot.status?.toUpperCase() || 'INACTIVE'}
              </Text>
            </View>
          </View>

          {/* Mode */}
          <View style={styles.modeRow}>
            <Text style={styles.modeLabel}>Mode</Text>
            <Text style={styles.modeValue}>{bot.mode?.toUpperCase() || 'DEMO'}</Text>
          </View>
        </View>

        {/* Profit Card */}
        <View style={styles.profitCard}>
          <Text style={styles.profitLabel}>Total Profit</Text>
          <Text style={[styles.profitValue, { color: isProfit ? COLORS.green : COLORS.red }]}>
            {isProfit ? '+' : ''}{formatAmount(profit)} ({profitPct}%)
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Balance</Text>
              <Text style={styles.statValue}>{formatAmount(bot.balance || 0)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Equity</Text>
              <Text style={styles.statValue}>{formatAmount(bot.equity || 0)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Trades</Text>
              <Text style={styles.statValue}>{bot.total_trades || 0}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Win Rate</Text>
              <Text style={styles.statValue}>{formatWinRate(bot.winning_trades, bot.total_trades)}</Text>
            </View>
          </View>
        </View>

        {/* Configuration Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configuration</Text>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Lot Size</Text>
            <Text style={styles.configValue}>{bot.lot_size || '0.01'}</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Take Profit</Text>
            <Text style={styles.configValue}>{bot.take_profit_pips || '10'} pips</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Stop Loss</Text>
            <Text style={styles.configValue}>{bot.stop_loss_pips || '5'} pips</Text>
          </View>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Max Daily Trades</Text>
            <Text style={styles.configValue}>{bot.max_daily_trades || '10'}</Text>
          </View>
          <View style={[styles.configRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.configLabel}>Auto Trade</Text>
            <TouchableOpacity onPress={handleToggle}>
              <View style={[styles.autoTradeBadge, { backgroundColor: bot.auto_trade ? 'rgba(0,200,83,0.15)' : 'rgba(255,68,68,0.15)' }]}>
                <Text style={[styles.autoTradeText, { color: bot.auto_trade ? COLORS.green : COLORS.red }]}>
                  {bot.auto_trade ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Message */}
        {bot.error_message ? (
          <View style={styles.errorCard}>
            <Icon name="alert-circle-outline" size={20} color={COLORS.red} />
            <Text style={styles.errorText}>{bot.error_message}</Text>
          </View>
        ) : null}

        {/* Trade History Button */}
        <TouchableOpacity style={styles.tradeHistoryBtn} onPress={() => navigation.navigate('BotTrades')}>
          <Icon name="history" size={20} color={COLORS.gold} />
          <Text style={styles.tradeHistoryText}>View Trade History</Text>
          <Icon name="chevron-right" size={20} color={COLORS.grey} />
        </TouchableOpacity>

        <RiskDisclaimer style={{ marginTop: 16 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1,
    borderBottomColor: '#1E2329', backgroundColor: '#12161A',
  },
  headerTitle: { fontSize: 22, color: COLORS.white, fontWeight: '800' },
  headerSub: { fontSize: 13, color: COLORS.grey, marginTop: 2, fontWeight: '500' },
  refreshBtn: { padding: 10, backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },

  content: { padding: 16, paddingBottom: 100 },

  loadingContainer: { padding: 16 },

  // Bot Card
  botCard: {
    backgroundColor: '#12161A', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#1E2329',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  botIconWrapper: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)',
  },
  botInfo: { flex: 1 },
  botName: { fontSize: 18, color: COLORS.white, fontWeight: '700' },
  botDesc: { fontSize: 12, color: COLORS.grey, marginTop: 4, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  modeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1E2329' },
  modeLabel: { fontSize: 13, color: COLORS.grey },
  modeValue: { fontSize: 13, color: COLORS.gold, fontWeight: '700' },

  // Profit Card
  profitCard: {
    backgroundColor: '#12161A', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#1E2329',
  },
  profitLabel: { fontSize: 13, color: COLORS.grey },
  profitValue: { fontSize: 24, fontWeight: '800', marginTop: 8 },

  // Stats Card
  card: {
    backgroundColor: '#12161A', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#1E2329',
  },
  cardTitle: { fontSize: 16, color: COLORS.white, fontWeight: '700', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statBox: { width: '50%', paddingVertical: 8, paddingHorizontal: 4 },
  statLabel: { fontSize: 11, color: COLORS.grey, marginBottom: 4, fontWeight: '500' },
  statValue: { fontSize: 15, color: COLORS.white, fontWeight: '700' },

  configRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E2329',
  },
  configLabel: { fontSize: 14, color: COLORS.grey },
  configValue: { fontSize: 14, color: COLORS.white, fontWeight: '600' },

  autoTradeBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  autoTradeText: { fontSize: 12, fontWeight: '700' },

  // Error
  errorCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,68,68,0.1)',
    borderRadius: 12, padding: 12, marginBottom: 16, gap: 8, borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.2)',
  },
  errorText: { flex: 1, fontSize: 13, color: COLORS.red, lineHeight: 18 },

  // Trade History
  tradeHistoryBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#12161A',
    borderRadius: 12, padding: 16, marginBottom: 16, gap: 12,
    borderWidth: 1, borderColor: '#1E2329',
  },
  tradeHistoryText: { flex: 1, fontSize: 15, color: COLORS.white, fontWeight: '600' },

  // Empty
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,215,0,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative', borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  floatingStar: { position: 'absolute', top: 5, right: 5 },
  emptyTitle: { fontSize: 24, color: COLORS.white, fontWeight: '800', marginBottom: 12 },
  emptyDesc: { fontSize: 14, color: COLORS.grey, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
});
