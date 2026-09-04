import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, KeyboardAvoidingView, Platform, Linking, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchBot, toggleAutoTrade } from '../../store/botSlice';
import { formatWinRate } from '../../utils/formatters';
import { useCurrency } from '../../context/CurrencyContext';
import { Skeleton } from '../../components/common/Skeleton';
import { RiskDisclaimer } from '../../components/common/RiskDisclaimer';
import { COLORS } from '../../theme/colors';

export const BotListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bot, isLoading } = useSelector(s => s.bots);
  const [refreshing, setRefreshing] = useState(false);
  const [budget, setBudget] = useState('');
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

  const handleBuyWhatsApp = () => {
    const number = bot?.whatsapp_number || '+923371244640';
    const clean = number.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi! I want to buy the KTS Trading Bot (${bot?.name || 'KTS10 Pips Bot'}). Please share the pricing and payment details. Thank you.`
    );
    Linking.openURL(`https://wa.me/${clean}?text=${message}`).catch(() =>
      Alert.alert('Error', 'Unable to open WhatsApp. Make sure WhatsApp is installed.')
    );
  };

  const handleDemoRequest = () => {
    navigation.navigate('Demo');
  };

  const calculatedLotSize = useMemo(() => {
    if (!bot) return 0;
    const baseBalance = parseFloat(bot.base_balance) || 100;
    const baseLotSize = parseFloat(bot.base_lot_size) || 0.1;
    const userBudget = parseFloat(budget) || 0;
    if (userBudget <= 0) return 0;
    return ((userBudget / baseBalance) * baseLotSize).toFixed(2);
  }, [budget, bot]);

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
          </View>
          <Text style={styles.emptyTitle}>Bot Not Configured</Text>
          <Text style={styles.emptyDesc}>The KTS Trading Bot is being set up.</Text>
        </View>
      </View>
    );
  }

  const isActive = bot.status?.toLowerCase() === 'active';
  const baseBalance = parseFloat(bot.base_balance) || 100;
  const baseLotSize = parseFloat(bot.base_lot_size) || 0.1;
  const tp = bot.take_profit_pips || 10;
  const sl = bot.stop_loss_pips || 5;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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

            <View style={styles.modeRow}>
              <Text style={styles.modeLabel}>Mode</Text>
              <Text style={styles.modeValue}>{bot.mode?.toUpperCase() || 'DEMO'}</Text>
            </View>
          </View>

          {/* Profit Estimation Card */}
          <View style={styles.estCard}>
            <Text style={styles.estTitle}>Profit Estimation</Text>
            <View style={styles.estRow}>
              <Text style={styles.estLabel}>On {formatAmount(baseBalance)} balance</Text>
              <Text style={styles.estValue}>Lot Size: {baseLotSize}</Text>
            </View>
            <View style={styles.estRow}>
              <Text style={styles.estLabel}>Take Profit</Text>
              <Text style={styles.estValue}>{tp} pips</Text>
            </View>
            <View style={styles.estRow}>
              <Text style={styles.estLabel}>Stop Loss</Text>
              <Text style={styles.estValue}>{sl} pips</Text>
            </View>
          </View>

          {/* Budget Input Card */}
          <View style={styles.budgetCard}>
            <Text style={styles.budgetTitle}>Your Budget</Text>
            <Text style={styles.budgetSubtitle}>Enter your budget in USDT to calculate lot size</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={budget}
                  onChangeText={setBudget}
                  placeholder="0.00"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={10}
                />
                <Text style={styles.inputSuffix}>USDT</Text>
              </View>
            </View>

            {parseFloat(budget) > 0 && (
              <View style={styles.resultBox}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Your Lot Size</Text>
                  <Text style={styles.resultValue}>{calculatedLotSize}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Ratio</Text>
                  <Text style={styles.resultRatio}>
                    {(parseFloat(budget) / baseBalance).toFixed(2)}x
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Account Stats */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Trades</Text>
                <Text style={styles.statValue}>{bot.total_trades || 0}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Win Rate</Text>
                <Text style={styles.statValue}>{formatWinRate(bot.winning_trades, bot.total_trades)}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Max Daily Trades</Text>
                <Text style={styles.statValue}>{bot.max_daily_trades || 10}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Auto Trade</Text>
                <TouchableOpacity onPress={handleToggle}>
                  <View style={[styles.autoTradeBadge, { backgroundColor: bot.auto_trade ? 'rgba(0,200,83,0.15)' : 'rgba(255,68,68,0.15)' }]}>
                    <Text style={[styles.autoTradeText, { color: bot.auto_trade ? COLORS.green : COLORS.red }]}>
                      {bot.auto_trade ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
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

          {/* Buy / Demo CTA */}
          <TouchableOpacity style={styles.buyBtn} onPress={handleBuyWhatsApp}>
            <Icon name="whatsapp" size={22} color="#0B0E11" />
            <Text style={styles.buyBtnText}>Buy This Bot</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.demoBtn} onPress={handleDemoRequest}>
            <Icon name="monitor-dashboard" size={20} color={COLORS.gold} />
            <Text style={styles.demoBtnText}>Try Demo Account</Text>
          </TouchableOpacity>

          <RiskDisclaimer style={{ marginTop: 16 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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

  // Estimation Card
  estCard: {
    backgroundColor: '#12161A', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#1E2329',
  },
  estTitle: { fontSize: 16, color: COLORS.white, fontWeight: '700', marginBottom: 12 },
  estRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E2329' },
  estLabel: { fontSize: 14, color: COLORS.grey },
  estValue: { fontSize: 14, color: COLORS.gold, fontWeight: '600' },

  // Budget Card
  budgetCard: {
    backgroundColor: '#12161A', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  budgetTitle: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
  budgetSubtitle: { fontSize: 12, color: COLORS.grey, marginTop: 4, marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 8 },
  inputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2026',
    borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A', paddingHorizontal: 14,
  },
  input: { flex: 1, height: 48, color: COLORS.white, fontSize: 18, fontWeight: '700' },
  inputSuffix: { fontSize: 14, color: COLORS.grey, fontWeight: '600' },

  resultBox: {
    marginTop: 12, backgroundColor: 'rgba(255,215,0,0.05)', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)',
  },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  resultLabel: { fontSize: 14, color: COLORS.grey },
  resultValue: { fontSize: 18, color: COLORS.gold, fontWeight: '800' },
  resultRatio: { fontSize: 14, color: COLORS.gold, fontWeight: '600' },

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

  // Buy / Demo CTA
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 16,
    marginBottom: 12, gap: 10, elevation: 4,
    shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4,
  },
  buyBtnText: { fontSize: 16, color: '#0B0E11', fontWeight: '800', letterSpacing: 0.5 },
  demoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#12161A', borderRadius: 12, paddingVertical: 15,
    marginBottom: 4, gap: 10, borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)',
  },
  demoBtnText: { fontSize: 15, color: COLORS.gold, fontWeight: '700' },

  // Empty
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,215,0,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  emptyTitle: { fontSize: 24, color: COLORS.white, fontWeight: '800', marginBottom: 12 },
  emptyDesc: { fontSize: 14, color: COLORS.grey, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
});
