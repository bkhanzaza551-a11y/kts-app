import React, { useEffect, useState } from 'react';
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
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </View>
        <View style={{ padding: 16, gap: 16 }}>
          <Skeleton width={150} height={32} borderRadius={8} />
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

  // Smart symbol resolver for TradingView
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
      <View style={[styles.navbar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Trade Setup</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Signal Header */}
        <View style={styles.signalHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.symbol}>{signal.symbol}</Text>
            <View style={[styles.dirBadge, { backgroundColor: isBuy ? 'rgba(0,200,83,0.15)' : 'rgba(255,68,68,0.15)' }]}>
              <Icon name={isBuy ? 'trending-up' : 'trending-down'} size={18} color={isBuy ? COLORS.green : COLORS.red} />
              <Text style={[styles.dirText, { color: isBuy ? COLORS.green : COLORS.red }]}>
                {signal.direction?.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isActive ? 'rgba(255,215,0,0.15)' : 'rgba(160,160,160,0.15)' }]}>
              <Text style={[styles.statusText, { color: isActive ? COLORS.gold : COLORS.grey }]}>
                {signal.status?.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.timeText}>
            {signal.created_at ? new Date(signal.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently Added'}
          </Text>
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

        {/* Price Levels Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Execution Levels</Text>
          
          <View style={styles.levelRow}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
              <Icon name="ray-start-arrow" size={20} color={COLORS.gold} />
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Entry Price</Text>
              <Text style={[styles.levelValue, { color: COLORS.white }]}>{formatAmount(signal.entry_price)}</Text>
            </View>
          </View>

          <View style={styles.levelDivider} />

          <View style={styles.levelRow}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 200, 83, 0.1)' }]}>
              <Icon name="flag-checkered" size={20} color={COLORS.green} />
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Take Profit</Text>
              <Text style={[styles.levelValue, { color: COLORS.green }]}>{formatAmount(signal.take_profit)}</Text>
            </View>
          </View>

          <View style={styles.levelDivider} />

          <View style={styles.levelRow}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 68, 68, 0.1)' }]}>
              <Icon name="shield-remove-outline" size={20} color={COLORS.red} />
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Stop Loss</Text>
              <Text style={[styles.levelValue, { color: COLORS.red }]}>{formatAmount(signal.stop_loss)}</Text>
            </View>
          </View>
        </View>

        {/* Result & Analysis */}
        {(signal.result && signal.result !== 'pending') || signal.description ? (
          <View style={styles.card}>
            {signal.result && signal.result !== 'pending' && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Trade Result</Text>
                <View style={[styles.resultPill, { backgroundColor: isWin ? 'rgba(0,200,83,0.1)' : isLoss ? 'rgba(255,68,68,0.1)' : 'rgba(33,150,243,0.1)' }]}>
                  <Text style={[styles.resultText, { color: isWin ? COLORS.green : isLoss ? COLORS.red : '#2196F3' }]}>
                    {signal.result?.toUpperCase()} {signal.pips_result != null ? `(${signal.pips_result > 0 ? '+' : ''}${signal.pips_result} pips)` : ''}
                  </Text>
                </View>
              </View>
            )}

            {signal.description && (
              <View style={[styles.analysisBox, signal.result && signal.result !== 'pending' ? { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16 } : {}]}>
                <Text style={styles.cardTitle}>Expert Analysis</Text>
                <Text style={styles.descText}>{signal.description}</Text>
              </View>
            )}
          </View>
        ) : null}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1E2329', backgroundColor: '#12161A' },
  backBtn: { padding: 4 },
  navTitle: { fontSize: 18, color: COLORS.white, fontWeight: '700' },
  
  content: { padding: 16 },

  signalHeader: { marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  symbol: { fontSize: 28, color: COLORS.white, fontWeight: '800' },
  dirBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
  dirText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '800' },
  timeText: { fontSize: 13, color: COLORS.grey, fontWeight: '500' },

  chartWrapper: { height: 350, backgroundColor: '#12161A', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1E2329', marginBottom: 20, position: 'relative' },
  webView: { flex: 1, backgroundColor: '#12161A' },
  chartLoader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#12161A', zIndex: 10 },

  card: { backgroundColor: '#12161A', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#1E2329' },
  cardTitle: { fontSize: 16, color: COLORS.white, fontWeight: '700', marginBottom: 16 },

  levelRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  levelInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelLabel: { fontSize: 14, color: COLORS.grey, fontWeight: '600' },
  levelValue: { fontSize: 18, fontWeight: '800' },
  levelDivider: { height: 1, backgroundColor: '#1E2329', marginVertical: 16, marginLeft: 60 },

  resultBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16 },
  resultLabel: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
  resultPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  resultText: { fontSize: 14, fontWeight: '800' },
  
  analysisBox: {},
  descText: { fontSize: 14, color: COLORS.grey, lineHeight: 22 }
});
