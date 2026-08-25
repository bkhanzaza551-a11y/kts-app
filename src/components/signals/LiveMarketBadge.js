import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import client from '../../api/client';
import { useCurrency } from '../../context/CurrencyContext';

export const LiveMarketBadge = ({ symbol, onPriceUpdate }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    if (!symbol) return;
    fetchPrice();
    const interval = setInterval(fetchPrice, 15000);
    return () => clearInterval(interval);
  }, [symbol]);

  const fetchPrice = async () => {
    try {
      const res = await client.get('/market/ticker', { params: { symbol } });
      if (res.data?.data) {
        setData(res.data.data);
        setError(false);
        if (onPriceUpdate) onPriceUpdate(res.data.data);
      }
    } catch (e) {
      setError(true);
    }
  };

  if (error && !data) return null;

  const changePct = data?.change_pct_24h || 0;
  const price = data?.price || 0;
  const isUp = changePct >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatAmount(price)}</Text>
        <View style={[styles.changeBadge, isUp ? styles.changeUp : styles.changeDown]}>
          <Text style={styles.changeIcon}>{isUp ? '▲' : '▼'}</Text>
          <Text style={[styles.changeText, isUp ? styles.changeTextUp : styles.changeTextDown]}>
            {isUp ? '+' : ''}{changePct.toFixed(2)}%
          </Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>24h High</Text>
          <Text style={styles.statValue}>{formatAmount(data?.high_24h || 0)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>24h Low</Text>
          <Text style={styles.statValue}>{formatAmount(data?.low_24h || 0)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Volume</Text>
          <Text style={styles.statValue}>{formatVol(data?.volume_24h || 0)}</Text>
        </View>
      </View>
      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </View>
  );
};

const formatVol = (vol) => {
  const num = parseFloat(vol) || 0;
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(0);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.darkSurface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  price: { ...TYPOGRAPHY.price, color: COLORS.white },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  changeUp: { backgroundColor: COLORS.greenMuted },
  changeDown: { backgroundColor: 'rgba(255, 23, 68, 0.15)' },
  changeIcon: { fontSize: 10 },
  changeText: { ...TYPOGRAPHY.caption, fontWeight: '700' },
  changeTextUp: { color: COLORS.green },
  changeTextDown: { color: COLORS.red },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  stat: { alignItems: 'center', flex: 1 },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.grey, fontSize: 10 },
  statValue: { ...TYPOGRAPHY.body3, color: COLORS.white, fontWeight: '600', marginTop: 2 },

  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  liveText: { ...TYPOGRAPHY.caption, color: COLORS.green, fontSize: 10, fontWeight: '700' },
});
