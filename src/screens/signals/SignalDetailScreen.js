import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS, SHADOW } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LiveMarketBadge } from '../../components/signals/LiveMarketBadge';
import { TradingViewChart } from '../../components/signals/TradingViewChart';
import { useCurrency } from '../../context/CurrencyContext';
import { formatPrice, formatPips, formatDate } from '../../utils/formatters';
import client from '../../api/client';

export const SignalDetailScreen = ({ route }) => {
  const { signalId } = route.params;
  const [signal, setSignal] = useState(null);
  const [error, setError] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    client.get(`/signals/${signalId}`)
      .then(r => setSignal(r.data.data))
      .catch(() => setError(true));
  }, [signalId]);

  if (error) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Failed to load signal</Text>
    </View>
  );

  if (!signal) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.gold} />
      <Text style={styles.loadingText}>Loading signal...</Text>
    </View>
  );

  const isWin = signal.result === 'win';
  const isLoss = signal.result === 'loss';
  const resultColor = isWin ? COLORS.green : isLoss ? COLORS.red : COLORS.grey;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.symbolRow}>
            <Text style={styles.symbol}>{signal.symbol}</Text>
            <Badge text={signal.direction?.toUpperCase()} variant={signal.direction} size="large" />
          </View>
          <Text style={styles.title}>{signal.title}</Text>
        </View>
      </View>

      {/* Live Market Data */}
      {signal.status === 'active' && (
        <View style={styles.section}>
          <LiveMarketBadge symbol={signal.symbol} />
        </View>
      )}

      {/* Chart Button */}
      <TouchableOpacity style={styles.chartBtn} onPress={() => setChartVisible(true)}>
        <View style={styles.chartBtnIcon}>
          <Text style={styles.chartBtnEmoji}>📈</Text>
        </View>
        <View style={styles.chartBtnContent}>
          <Text style={styles.chartBtnTitle}>View Live Chart</Text>
          <Text style={styles.chartBtnSub}>TradingView interactive chart</Text>
        </View>
        <Text style={styles.chartBtnArrow}>→</Text>
      </TouchableOpacity>

      {/* Price Levels */}
      <Card style={styles.priceCard}>
        <Text style={styles.cardTitle}>Price Levels</Text>
        <View style={styles.priceGrid}>
          <View style={styles.priceItem}>
            <View style={[styles.priceDot, { backgroundColor: COLORS.gold }]} />
            <Text style={styles.priceLabel}>Entry</Text>
            <Text style={styles.priceValue}>{formatAmount(signal.entry_price)}</Text>
          </View>
          <View style={styles.priceItem}>
            <View style={[styles.priceDot, { backgroundColor: COLORS.green }]} />
            <Text style={styles.priceLabel}>Take Profit</Text>
            <Text style={[styles.priceValue, { color: COLORS.green }]}>{formatAmount(signal.take_profit)}</Text>
          </View>
          <View style={styles.priceItem}>
            <View style={[styles.priceDot, { backgroundColor: COLORS.red }]} />
            <Text style={styles.priceLabel}>Stop Loss</Text>
            <Text style={[styles.priceValue, { color: COLORS.red }]}>{formatAmount(signal.stop_loss)}</Text>
          </View>
        </View>

        {/* Risk/Reward */}
        {signal.entry_price && signal.take_profit && signal.stop_loss && (() => {
          const entry = parseFloat(signal.entry_price);
          const tp = parseFloat(signal.take_profit);
          const sl = parseFloat(signal.stop_loss);
          const reward = Math.abs(tp - entry);
          const risk = Math.abs(entry - sl);
          const rr = risk > 0 ? (reward / risk).toFixed(1) : '--';
          return (
            <View style={styles.rrRow}>
              <Text style={styles.rrLabel}>Risk:Reward</Text>
              <Text style={styles.rrValue}>1:{rr}</Text>
            </View>
          );
        })()}
      </Card>

      {/* Result Card */}
      <Card style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.cardTitle}>Signal Result</Text>
          <View style={[styles.resultBadge, { backgroundColor: resultColor + '20' }]}>
            <Text style={[styles.resultBadgeText, { color: resultColor }]}>
              {signal.result?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
        </View>

        <View style={styles.resultGrid}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Status</Text>
            <Badge text={signal.status?.toUpperCase()} variant={signal.status} />
          </View>
          {signal.pips_result != null && (
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Pips</Text>
              <Text style={[styles.resultPips, { color: signal.pips_result >= 0 ? COLORS.green : COLORS.red }]}>
                {signal.pips_result >= 0 ? '+' : ''}{signal.pips_result}
              </Text>
            </View>
          )}
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Created</Text>
            <Text style={styles.resultValue}>{formatDate(signal.created_at, 'datetime')}</Text>
          </View>
          {signal.closed_at && (
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Closed</Text>
              <Text style={styles.resultValue}>{formatDate(signal.closed_at, 'datetime')}</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Description */}
      {signal.description && (
        <Card style={styles.descCard}>
          <Text style={styles.cardTitle}>Analysis</Text>
          <Text style={styles.descText}>{signal.description}</Text>
        </Card>
      )}

      {/* Categories */}
      {signal.categories?.length > 0 && (
        <View style={styles.catRow}>
          {signal.categories.map(c => (
            <Badge key={c.id} text={c.name} variant="default" />
          ))}
        </View>
      )}

      {/* TradingView Chart Modal */}
      <TradingViewChart
        symbol={signal.symbol}
        visible={chartVisible}
        onClose={() => setChartVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...TYPOGRAPHY.body2, color: COLORS.grey, marginTop: SPACING.md },

  headerRow: { marginBottom: SPACING.xl },
  symbolRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  symbol: { ...TYPOGRAPHY.h1, color: COLORS.gold },
  title: { ...TYPOGRAPHY.body2, color: COLORS.silver },

  section: { marginBottom: SPACING.md },

  chartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    marginBottom: SPACING.md,
  },
  chartBtnIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  chartBtnEmoji: { fontSize: 22 },
  chartBtnContent: { flex: 1 },
  chartBtnTitle: { ...TYPOGRAPHY.body1, color: COLORS.white, fontWeight: '600' },
  chartBtnSub: { ...TYPOGRAPHY.body3, color: COLORS.grey, marginTop: 2 },
  chartBtnArrow: { color: COLORS.grey, fontSize: 16 },

  priceCard: { marginBottom: SPACING.md },
  cardTitle: { ...TYPOGRAPHY.h4, color: COLORS.white, marginBottom: SPACING.md },
  priceGrid: { gap: SPACING.md },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkSurface,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    gap: 10,
  },
  priceDot: { width: 8, height: 8, borderRadius: 4 },
  priceLabel: { ...TYPOGRAPHY.body3, color: COLORS.grey, flex: 1 },
  priceValue: { ...TYPOGRAPHY.h4, color: COLORS.white, fontWeight: '700' },

  rrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkBorder,
  },
  rrLabel: { ...TYPOGRAPHY.body2, color: COLORS.grey },
  rrValue: { ...TYPOGRAPHY.h4, color: COLORS.gold, fontWeight: '700' },

  resultCard: { marginBottom: SPACING.md },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  resultBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full },
  resultBadgeText: { ...TYPOGRAPHY.caption, fontWeight: '700' },
  resultGrid: { gap: 0 },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBorder,
  },
  resultLabel: { ...TYPOGRAPHY.body2, color: COLORS.silver },
  resultValue: { ...TYPOGRAPHY.body2, color: COLORS.white, fontWeight: '600' },
  resultPips: { ...TYPOGRAPHY.h4, fontWeight: '700' },

  descCard: { marginBottom: SPACING.md },
  descText: { ...TYPOGRAPHY.body2, color: COLORS.silver, lineHeight: 22 },

  catRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
