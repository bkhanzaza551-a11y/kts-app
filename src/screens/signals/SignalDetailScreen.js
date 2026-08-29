import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { useCurrency } from '../../context/CurrencyContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../components/common/Skeleton';
import client from '../../api/client';

const { width } = Dimensions.get('window');

export const SignalDetailScreen = ({ route, navigation }) => {
  const { signalId } = route.params;
  const [signal, setSignal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const { formatAmount } = useCurrency();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    fetchSignalDetail();
  }, [signalId]);

  const fetchSignalDetail = async () => {
    setIsLoading(true);
    try {
      const response = await client.get(`/signals/${signalId}`);
      setSignal(response.data.data);
    } catch (e) {
      console.log('Error fetching signal:', e);
    }
    setIsLoading(false);
  };

  if (isLoading || !signal) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={{ padding: 16, gap: 16 }}>
          <Skeleton width="60%" height={24} borderRadius={8} />
          <Skeleton width="80%" height={32} borderRadius={8} />
          <Skeleton width="100%" height={320} borderRadius={16} />
          <Skeleton width="100%" height={150} borderRadius={16} />
        </View>
      </View>
    );
  }

  const isBuy = signal.direction?.toLowerCase() === 'buy';
  const isWin = signal.result?.toLowerCase() === 'win';
  const isLoss = signal.result?.toLowerCase() === 'loss';
  const isActive = signal.status?.toLowerCase() === 'active';
  const isClosed = signal.status?.toLowerCase() === 'closed';

  const tvSymbol = signal.symbol?.includes('USDT') || signal.symbol?.includes('BTC') || signal.symbol?.includes('ETH') 
    ? `BINANCE:${signal.symbol}` 
    : `OANDA:${signal.symbol}`;

  const tradingViewHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
      <style>
        body,html{margin:0;padding:0;height:100%;background-color:#0B0E11;}
        .tradingview-widget-container{height:100%;width:100%;}
      </style>
    </head>
    <body>
      <div class="tradingview-widget-container">
        <div id="tradingview_chart" style="height:100%;width:100%"></div>
        <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <script type="text/javascript">
          new TradingView.widget({
            "autosize": true,
            "symbol": "${tvSymbol}",
            "interval": "15",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "backgroundColor": "#12161A",
            "gridColor": "#1E2329",
            "hide_top_toolbar": true,
            "hide_legend": false,
            "save_image": false,
            "container_id": "tradingview_chart",
            "toolbar_bg": "#12161A"
          });
        </script>
      </div>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* Sleek Custom Navbar */}
      <View style={[styles.navbar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{signal.symbol}</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Icon name="bookmark-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Signal Hero Header */}
        <View style={styles.heroSection}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{signal.title || `${signal.direction?.toUpperCase()} ${signal.symbol}`}</Text>
          </View>

          <View style={styles.badgesRow}>
            <View style={[styles.dirBadge, { backgroundColor: isBuy ? 'rgba(0,200,83,0.15)' : 'rgba(255,68,68,0.15)' }]}>
              <Icon name={isBuy ? 'trending-up' : 'trending-down'} size={18} color={isBuy ? COLORS.green : COLORS.red} />
              <Text style={[styles.dirText, { color: isBuy ? COLORS.green : COLORS.red }]}>
                {signal.direction?.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isActive ? 'rgba(255,215,0,0.15)' : isClosed ? 'rgba(33,150,243,0.15)' : 'rgba(160,160,160,0.15)' }]}>
              <Text style={[styles.statusText, { color: isActive ? COLORS.gold : isClosed ? '#2196F3' : COLORS.grey }]}>
                {signal.status?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.viewBadge}>
              <Icon name="eye-outline" size={14} color={COLORS.grey} />
              <Text style={styles.viewText}>{signal.views_count || 0}</Text>
            </View>
          </View>
          
          <View style={styles.dateRow}>
            <Icon name="clock-outline" size={14} color={COLORS.grey} />
            <Text style={styles.timeText}>
              Published: {signal.published_at ? new Date(signal.published_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently'}
            </Text>
          </View>
        </View>

        {/* Dynamic TradingView Chart */}
        <View style={styles.chartWrapper}>
          {chartLoading && (
            <View style={styles.chartLoader}>
              <ActivityIndicator size="large" color={COLORS.gold} />
            </View>
          )}
          <WebView 
            source={{ html: tradingViewHtml }} 
            style={styles.webView}
            scrollEnabled={false}
            bounces={false}
            onLoadEnd={() => setChartLoading(false)}
          />
        </View>

        {/* Expert Analysis / Description (Highly Prominent) */}
        {signal.description ? (
          <View style={styles.descCard}>
            <View style={styles.descHeader}>
              <Icon name="text-box-search-outline" size={22} color={COLORS.gold} />
              <Text style={styles.descTitle}>Expert Analysis</Text>
            </View>
            <Text style={styles.descText}>{signal.description}</Text>
          </View>
        ) : null}

        {/* Pips Result Card (If trade is closed or has result) */}
        {(signal.result && signal.result !== 'pending') || (signal.pips_result != null) ? (
          <View style={[styles.resultCard, { borderColor: isWin ? 'rgba(0,200,83,0.5)' : isLoss ? 'rgba(255,68,68,0.5)' : '#1E2329' }]}>
            <View style={styles.resultHeader}>
              <Icon name={isWin ? 'trophy' : isLoss ? 'alert-circle' : 'minus-circle'} size={28} color={isWin ? COLORS.green : isLoss ? COLORS.red : COLORS.grey} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.resultLabel}>Trade Result</Text>
                <Text style={[styles.resultValue, { color: isWin ? COLORS.green : isLoss ? COLORS.red : COLORS.white }]}>
                  {signal.result?.toUpperCase()}
                </Text>
              </View>
              {signal.pips_result != null && (
                <View style={styles.pipsBox}>
                  <Text style={[styles.pipsValue, { color: signal.pips_result > 0 ? COLORS.green : signal.pips_result < 0 ? COLORS.red : COLORS.white }]}>
                    {signal.pips_result > 0 ? '+' : ''}{signal.pips_result}
                  </Text>
                  <Text style={styles.pipsLabel}>PIPS</Text>
                </View>
              )}
            </View>
          </View>
        ) : null}

        {/* Premium Execution Levels Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Execution Levels</Text>
          
          <View style={styles.levelRow}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
              <Icon name="ray-start-arrow" size={22} color={COLORS.gold} />
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Entry Price</Text>
              <Text style={[styles.levelValue, { color: COLORS.white }]}>{formatAmount(signal.entry_price)}</Text>
            </View>
          </View>

          <View style={styles.levelDivider} />

          <View style={styles.levelRow}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 200, 83, 0.1)' }]}>
              <Icon name="flag-checkered" size={22} color={COLORS.green} />
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Take Profit</Text>
              <Text style={[styles.levelValue, { color: COLORS.green }]}>{formatAmount(signal.take_profit)}</Text>
            </View>
          </View>

          <View style={styles.levelDivider} />

          <View style={styles.levelRow}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 68, 68, 0.1)' }]}>
              <Icon name="shield-remove-outline" size={22} color={COLORS.red} />
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Stop Loss</Text>
              <Text style={[styles.levelValue, { color: COLORS.red }]}>{formatAmount(signal.stop_loss)}</Text>
            </View>
          </View>

          {/* If Closed Price exists */}
          {signal.close_price && (
            <>
              <View style={styles.levelDivider} />
              <View style={styles.levelRow}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                  <Icon name="lock-check" size={22} color="#2196F3" />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelLabel}>Close Price</Text>
                  <Text style={[styles.levelValue, { color: '#2196F3' }]}>{formatAmount(signal.close_price)}</Text>
                </View>
              </View>
            </>
          )}

        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#12161A', zIndex: 10 },
  backBtn: { padding: 4 },
  navTitle: { fontSize: 18, color: COLORS.white, fontWeight: '800', letterSpacing: 1 },
  
  content: { padding: 16 },

  heroSection: { marginBottom: 24 },
  titleRow: { marginBottom: 12 },
  titleText: { fontSize: 24, color: COLORS.white, fontWeight: '800', lineHeight: 32 },
  
  badgesRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  dirBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 6 },
  dirText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  viewBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  viewText: { fontSize: 13, color: COLORS.grey, fontWeight: '600' },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 13, color: COLORS.grey, fontWeight: '500' },

  chartWrapper: { height: 350, backgroundColor: '#12161A', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#1E2329', marginBottom: 24, position: 'relative' },
  webView: { flex: 1, backgroundColor: '#12161A' },
  chartLoader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#12161A', zIndex: 10 },

  descCard: { backgroundColor: '#12161A', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#1E2329' },
  descHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  descTitle: { fontSize: 16, color: COLORS.gold, fontWeight: '700' },
  descText: { fontSize: 14, color: '#D0D0D0', lineHeight: 24 },

  resultCard: { backgroundColor: '#12161A', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1 },
  resultHeader: { flexDirection: 'row', alignItems: 'center' },
  resultLabel: { fontSize: 13, color: COLORS.grey, fontWeight: '600', marginBottom: 4 },
  resultValue: { fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  pipsBox: { alignItems: 'flex-end' },
  pipsValue: { fontSize: 26, fontWeight: '900' },
  pipsLabel: { fontSize: 11, color: COLORS.grey, fontWeight: '700', letterSpacing: 1 },

  card: { backgroundColor: '#12161A', borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#1E2329' },
  cardTitle: { fontSize: 18, color: COLORS.white, fontWeight: '800', marginBottom: 24 },

  levelRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  levelInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelLabel: { fontSize: 14, color: COLORS.grey, fontWeight: '600' },
  levelValue: { fontSize: 18, fontWeight: '800' },
  levelDivider: { height: 1, backgroundColor: '#1E2329', marginVertical: 16, marginLeft: 64 },
});
