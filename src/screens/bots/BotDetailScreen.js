import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { fetchBot, toggleAutoTrade, clearBot } from '../../store/botSlice';
import { formatWinRate } from '../../utils/formatters';
import { useCurrency } from '../../context/CurrencyContext';
import { RiskDisclaimer } from '../../components/common/RiskDisclaimer';

export const BotDetailScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bot, isLoading, error } = useSelector(s => s.bots);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    dispatch(fetchBot());
    return () => dispatch(clearBot());
  }, [dispatch]);

  if (isLoading) return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;
  if (error) return <View style={styles.container}><Text style={[styles.loading, { color: COLORS.red }]}>{error}</Text></View>;
  if (!bot) return <View style={styles.container}><Text style={styles.loading}>Bot not found</Text></View>;

  const profitPct = bot.balance ? ((bot.total_profit / bot.balance) * 100).toFixed(1) : '0';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{bot.name}</Text>
          <Text style={styles.mode}>{bot.mode?.toUpperCase()} MODE</Text>
        </View>
        <Badge text={bot.status?.toUpperCase()} variant={bot.status} size="large" />
      </View>

      <Card style={styles.profitCard}>
        <Text style={styles.profitLabel}>Total Profit</Text>
        <Text style={[styles.profitValue, { color: (bot.total_profit || 0) >= 0 ? COLORS.green : COLORS.red }]}>
          {formatAmount(bot.total_profit)} ({profitPct}%)
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Account Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.stat}><Text style={styles.statLabel}>Balance</Text><Text style={styles.statValue}>{formatAmount(bot.balance)}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Equity</Text><Text style={styles.statValue}>{formatAmount(bot.equity)}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Total Trades</Text><Text style={styles.statValue}>{bot.total_trades || 0}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Win Rate</Text><Text style={styles.statValue}>{formatWinRate(bot.winning_trades, bot.total_trades)}</Text></View>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Configuration</Text>
        <View style={styles.configRow}><Text style={styles.configLabel}>Lot Size</Text><Text style={styles.configValue}>{bot.lot_size || '0.01'}</Text></View>
        <View style={styles.configRow}><Text style={styles.configLabel}>Take Profit</Text><Text style={styles.configValue}>{bot.take_profit_pips || '10'} pips</Text></View>
        <View style={styles.configRow}><Text style={styles.configLabel}>Stop Loss</Text><Text style={styles.configValue}>{bot.stop_loss_pips || '5'} pips</Text></View>
        <View style={styles.configRow}><Text style={styles.configLabel}>Max Daily Trades</Text><Text style={styles.configValue}>{bot.max_daily_trades || '10'}</Text></View>
        <View style={styles.configRow}><Text style={styles.configLabel}>Auto Trade</Text><Badge text={bot.auto_trade ? 'ON' : 'OFF'} variant={bot.auto_trade ? 'active' : 'closed'} /></View>
      </Card>

      <View style={styles.actions}>
        <Button title="Trade History" variant="outline" onPress={() => navigation.navigate('BotTrades')} />
        <Button title={bot.auto_trade ? 'Disable Auto Trade' : 'Enable Auto Trade'}
          variant={bot.auto_trade ? 'outline' : 'primary'}
          onPress={() => dispatch(toggleAutoTrade())} />
      </View>

      <RiskDisclaimer style={{ marginTop: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  loading: { color: COLORS.white, textAlign: 'center', marginTop: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xl },
  name: { ...TYPOGRAPHY.h1, color: COLORS.white },
  mode: { ...TYPOGRAPHY.body3, color: COLORS.gold, marginTop: 4 },
  profitCard: { marginBottom: SPACING.lg, backgroundColor: COLORS.darkSurface },
  profitLabel: { ...TYPOGRAPHY.body3, color: COLORS.silver },
  profitValue: { ...TYPOGRAPHY.price, marginTop: 8 },
  card: { marginBottom: SPACING.lg },
  cardTitle: { ...TYPOGRAPHY.h4, color: COLORS.white, marginBottom: SPACING.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  stat: { width: '50%', paddingVertical: 8 },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.grey },
  statValue: { ...TYPOGRAPHY.body1, color: COLORS.white, fontWeight: '600', marginTop: 4 },
  configRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder },
  configLabel: { ...TYPOGRAPHY.body2, color: COLORS.silver },
  configValue: { ...TYPOGRAPHY.body2, color: COLORS.white, fontWeight: '600' },
  actions: { gap: SPACING.md, marginTop: SPACING.lg },
});
