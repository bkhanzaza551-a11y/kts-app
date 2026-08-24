import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS, SHADOW } from '../../theme/spacing';
import { useCurrency } from '../../context/CurrencyContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INTERVALS = [
  { label: '15M', value: '15', limit: 48 },
  { label: '1H', value: '60', limit: 48 },
  { label: '4H', value: '240', limit: 48 },
  { label: '1D', value: 'D', limit: 30 },
  { label: '1W', value: 'W', limit: 20 },
];

export const TradingViewChart = ({ symbol, visible, onClose, onUsePrice }) => {
  const [interval, setInterval] = useState('15');
  const [loading, setLoading] = useState(true);
  const { formatAmount } = useCurrency();

  const binanceSymbol = `BINANCE:${symbol?.toUpperCase()}`;

  const getHtml = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1A1A1A; overflow: hidden; }
    #chart { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"></script>
  <script>
    new TradingView.widget({
      "container_id": "chart",
      "autosize": true,
      "symbol": "${binanceSymbol}",
      "interval": "${interval}",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "backgroundColor": "#1A1A1A",
      "gridColor": "#252525",
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "hide_volume": false,
      "support_host": "https://www.tradingview.com"
    });
  </script>
</body>
</html>`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.symbolBadge}>
                <Text style={styles.symbolText}>{symbol}</Text>
              </View>
              <Text style={styles.chartLabel}>Live Chart</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.intervalBar}>
            {INTERVALS.map((iv) => (
              <TouchableOpacity
                key={iv.value}
                style={[styles.intervalBtn, interval === iv.value && styles.intervalBtnActive]}
                onPress={() => setInterval(iv.value)}
              >
                <Text style={[styles.intervalText, interval === iv.value && styles.intervalTextActive]}>
                  {iv.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.chartContainer}>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.gold} />
                <Text style={styles.loadingText}>Loading chart...</Text>
              </View>
            )}
            <WebView
              source={{ html: getHtml() }}
              style={styles.webview}
              onLoadEnd={() => setLoading(false)}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
            />
          </View>

          {onUsePrice && (
            <TouchableOpacity style={styles.usePriceBtn} onPress={onUsePrice}>
              <Text style={styles.usePriceIcon}>⚡</Text>
              <Text style={styles.usePriceText}>Use Current Price as Entry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    backgroundColor: COLORS.darkCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    ...SHADOW.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBorder,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  symbolBadge: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  symbolText: { ...TYPOGRAPHY.body3, color: COLORS.black, fontWeight: '700' },
  chartLabel: { ...TYPOGRAPHY.body2, color: COLORS.grey },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.darkSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: COLORS.grey, fontSize: 14 },

  intervalBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: 8,
  },
  intervalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.darkSurface,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  intervalBtnActive: {
    backgroundColor: COLORS.goldMuted,
    borderColor: COLORS.gold,
  },
  intervalText: { ...TYPOGRAPHY.caption, color: COLORS.grey },
  intervalTextActive: { color: COLORS.gold, fontWeight: '700' },

  chartContainer: {
    flex: 1,
    margin: SPACING.md,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: { ...TYPOGRAPHY.body3, color: COLORS.grey, marginTop: SPACING.sm },
  webview: { flex: 1 },

  usePriceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    marginTop: SPACING.sm,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gold,
    gap: 8,
  },
  usePriceIcon: { fontSize: 16 },
  usePriceText: { ...TYPOGRAPHY.button, color: COLORS.black },
});
