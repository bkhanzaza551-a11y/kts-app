import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { fetchBotDetail, toggleAutoTrade, clearCurrentBot } from '../../store/botSlice';
import { formatWinRate } from '../../utils/formatters';
import { useCurrency } from '../../context/CurrencyContext';

export const BotDetailScreen = ({ route, navigation }) => {
  const { botId } = route.params;
  const dispatch = useDispatch();
  const { currentBot } = useSelector(s => s.bots);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    dispatch(fetchBotDetail(botId));
    return () => dispatch(clearCurrentBot());
  }, [dispatch, botId]);

  if (!currentBot) return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;

  const profitPct = currentBot.balance ? ((currentBot.total_profit / currentBot.balance) * 100).toFixed(1) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{currentBot.name}</Text>
          <Text style={styles.mode}>{currentBot.mode?.toUpperCase()} MODE</Text>
        </View>
        <Badge text={currentBot.status?.toUpperCase()} variant={currentBot.status} size="large" />
      </View>

      <Card style={styles.profitCard}>
        <Text style={styles.profitLabel}>Total Profit</Text>
        <Text style={[styles.profitValue, { color: (currentBot.total_profit || 0) >= 0 ? COLORS.green : COLORS.red }]}>
          {formatAmount(currentBot.total_profit)} ({profitPct}%)
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Account Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.stat}><Text style={styles.statLabel}>Balance</Text><Text style={styles.statValue}>{formatAmount(currentBot.balance)}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Equity</Text><Text style={styles.statValue}>{formatAmount(currentBot.equity)}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Total Trades</Text><Text style={styles.statValue}>{currentBot.total_trades || 0}</Text></View>
          <View style={styles.stat}><Text style={styles.statLabel}>Win Rate</Text><Text style={styles.statValue}>{formatWinRate(currentBot.winning_trades, currentBot.total_trades)}</Text></View>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Configuration</Text>
        <View style={styles.configRow}><Text style={styles.configLabel}>Lot Size</Text><Text style={styles.configValue}>{currentBot.lot_size}</Text></View>
        <View style={styles.configRow}><Text style={styles.configLabel}>Take Profit</Text><Text style={styles.configValue}>{currentBot.take_profit_pips} pips</Text></View>
        <View style={styles.configRow}><Text style={styles.configLabel}>Stop Loss</Text><Text style={styles.configValue}>{currentBot.stop_loss_pips} pips</Text></View>
        <View style={styles.configRow}><Text style={styles.configLabel}>Max Daily Trades</Text><Text style={styles.configValue}>{currentBot.max_daily_trades}</Text></View>
        <View style={styles.configRow}><Text style={styles.configLabel}>Auto Trade</Text><Badge text={currentBot.auto_trade ? 'ON' : 'OFF'} variant={currentBot.auto_trade ? 'active' : 'closed'} /></View>
      </Card>

      <View style={styles.actions}>
        <Button title="Trade History" variant="outline" onPress={() => navigation.navigate('BotTrades', { botId })} />
        <Button title={currentBot.auto_trade ? 'Disable Auto Trade' : 'Enable Auto Trade'}
          variant={currentBot.auto_trade ? 'outline' : 'primary'}
          onPress={() => dispatch(toggleAutoTrade(botId))} />
      </View>
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
