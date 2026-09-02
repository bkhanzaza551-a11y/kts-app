import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatPrice, formatDate } from '../../utils/formatters';
import { fetchBotTrades } from '../../store/botSlice';
import { useCurrency } from '../../context/CurrencyContext';

export const BotTradesScreen = ({ route }) => {
  const { botId } = route.params || {};
  const dispatch = useDispatch();
  const { trades, isLoading } = useSelector(s => s.bots);
  const { formatAmount } = useCurrency();
  const tradeList = trades[botId] || [];

  useEffect(() => {
    dispatch(fetchBotTrades({ id: botId }));
  }, [dispatch, botId]);

  const renderTrade = ({ item }) => (
    <View style={styles.tradeCard}>
      <View style={styles.tradeRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.symbol}>{item.symbol || item.pair}</Text>
          <Text style={styles.type}>{item.type || item.direction}</Text>
        </View>
        <Badge text={item.result === 'win' ? 'WIN' : item.result === 'loss' ? 'LOSS' : item.status?.toUpperCase()} variant={item.result || item.status || 'pending'} />
      </View>
      <View style={styles.prices}>
        <View style={styles.priceCol}><Text style={styles.priceLabel}>Entry</Text><Text style={styles.priceVal}>{formatAmount(item.open_price || item.entry_price)}</Text></View>
        <View style={styles.priceCol}><Text style={styles.priceLabel}>Close</Text><Text style={styles.priceVal}>{formatAmount(item.close_price)}</Text></View>
        <View style={styles.priceCol}><Text style={styles.priceLabel}>P/L</Text><Text style={[styles.priceVal, { color: (item.profit || 0) >= 0 ? COLORS.green : COLORS.red }]}>{item.profit != null ? `${item.profit >= 0 ? '+' : ''}${formatAmount(item.profit)}` : '--'}</Text></View>
      </View>
      <Text style={styles.time}>{formatDate(item.created_at, 'datetime')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tradeList}
        keyExtractor={(item, i) => String(item.id || i)}
        renderItem={renderTrade}
        ListEmptyComponent={!isLoading ? <EmptyState icon="📈" title="No Trades" message="No trade history yet" /> : null}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  list: { padding: SPACING.screen, paddingBottom: 40 },
  tradeCard: { backgroundColor: COLORS.darkCard, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.darkBorder },
  tradeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  symbol: { ...TYPOGRAPHY.h4, color: COLORS.white },
  type: { ...TYPOGRAPHY.body3, color: COLORS.silver, marginTop: 2 },
  prices: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md, backgroundColor: COLORS.darkSurface, borderRadius: RADIUS.sm, padding: SPACING.md },
  priceCol: { flex: 1, alignItems: 'center' },
  priceLabel: { ...TYPOGRAPHY.caption, color: COLORS.grey },
  priceVal: { ...TYPOGRAPHY.body2, color: COLORS.white, fontWeight: '600', marginTop: 4 },
  time: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginTop: SPACING.sm, textAlign: 'right' },
});
