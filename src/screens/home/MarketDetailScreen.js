import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export const MarketDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { symbol, pair, price, change, isUp } = route.params || {};
  
  const [marketData, setMarketData] = useState(null);
  const [tf, setTf] = useState('15'); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol || 'BTCUSDT'}`)
      .then(res => res.json())
      .then(data => setMarketData(data))
      .catch(e => console.log(e));
  }, [symbol]);

  const timeframes = [
    { label: '15m', value: '15' },
    { label: '1H', value: '60' },
    { label: '4H', value: '240' },
    { label: '1D', value: 'D' },
    { label: '1W', value: 'W' },
  ];

  const currentPrice = marketData ? Number(marketData.lastPrice) : Number(price);
  const formattedPrice = currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const currentChange = marketData ? Number(marketData.priceChangePercent).toFixed(2) : Number(change).toFixed(2);
  const isPositive = Number(currentChange) >= 0;
  const color = isPositive ? '#00C853' : '#FF4444';

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
            "symbol": "BINANCE:${symbol || 'BTCUSDT'}",
            "interval": "${tf}",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "backgroundColor": "#0B0E11",
            "gridColor": "#161A1F",
            "hide_top_toolbar": true,
            "hide_legend": true,
            "save_image": false,
            "container_id": "tradingview_chart"
          });
        </script>
      </div>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Icon name="menu-swap" size={22} color="#FFF" style={{ marginLeft: 15 }} />
          <Text style={styles.headerTitle}>{pair || 'BTC/USDT'}</Text>
          <View style={styles.tagBadge}><Text style={styles.tagText}>Perp</Text></View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}><Icon name="star-outline" size={22} color="#888" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Icon name="share-variant-outline" size={20} color="#888" /></TouchableOpacity>
        </View>
      </View>

      {/* Ticker Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.priceLeft}>
          <Text style={[styles.mainPrice, { color }]}>{formattedPrice}</Text>
          <View style={styles.fiatRow}>
            <Text style={styles.fiatPrice}>≈ ${formattedPrice}</Text>
            <Text style={[styles.changePercent, { color }]}>{isPositive ? '+' : ''}{currentChange}%</Text>
          </View>
        </View>
        
        <View style={styles.statsRight}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>24h High</Text>
            <Text style={styles.statValue}>{marketData ? Number(marketData.highPrice).toLocaleString(undefined, {minimumFractionDigits:2}) : '--'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>24h Low</Text>
            <Text style={styles.statValue}>{marketData ? Number(marketData.lowPrice).toLocaleString(undefined, {minimumFractionDigits:2}) : '--'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>24h Vol</Text>
            <Text style={styles.statValue}>{marketData ? (Number(marketData.volume) / 1000).toFixed(2) + 'K' : '--'}</Text>
          </View>
        </View>
      </View>

      {/* Timeframes */}
      <View style={styles.timeframeRow}>
        {timeframes.map((t) => (
          <TouchableOpacity 
            key={t.value} 
            style={[styles.tfBtn, tf === t.value && styles.tfBtnActive]} 
            onPress={() => { setIsLoading(true); setTf(t.value); }}
          >
            <Text style={[styles.tfText, tf === t.value && styles.tfTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.tfBtn}>
          <Text style={styles.tfText}>Depth</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.tfBtnIcon}>
          <Icon name="tune" size={18} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Chart Section */}
      <View style={styles.chartWrapper}>
        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        )}
        <WebView 
          key={tf} // Force remount on TF change to update HTML
          source={{ html: tradingViewHtml }} 
          style={styles.webView}
          scrollEnabled={false}
          bounces={false}
          onLoadEnd={() => setIsLoading(false)}
        />
      </View>

      {/* Bottom Features (Optional for Signals App) */}
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
        <TouchableOpacity style={styles.actionBtn}>
           <Icon name="bell-ring-outline" size={20} color="#FFD700" />
           <Text style={styles.actionText}>Set Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
           <Icon name="robot-outline" size={20} color="#00C853" />
           <Text style={styles.actionText}>Auto Bot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
           <Icon name="chart-line" size={20} color="#FFF" />
           <Text style={styles.actionText}>Signals</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, height: 50 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 8 },
  headerTitle: { fontSize: 18, color: '#FFF', fontWeight: 'bold', marginLeft: 10 },
  tagBadge: { backgroundColor: '#1E2329', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  tagText: { color: '#A0A0A0', fontSize: 10, fontWeight: '600' },
  
  // Ticker Stats
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  priceLeft: { justifyContent: 'center' },
  mainPrice: { fontSize: 34, fontWeight: '800' },
  fiatRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  fiatPrice: { fontSize: 13, color: '#888', fontWeight: '500' },
  changePercent: { fontSize: 13, fontWeight: '700' },
  
  statsRight: { justifyContent: 'space-between', paddingVertical: 4 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#888', fontWeight: '500' },
  statValue: { fontSize: 11, color: '#FFF', fontWeight: '600' },

  // Timeframes
  timeframeRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#161A1F', paddingHorizontal: 10, height: 40 },
  tfBtn: { paddingHorizontal: 12, height: '100%', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tfBtnActive: { borderBottomColor: '#FFD700' },
  tfText: { color: '#888', fontSize: 13, fontWeight: '600' },
  tfTextActive: { color: '#FFF' },
  tfBtnIcon: { paddingHorizontal: 10, height: '100%', justifyContent: 'center' },

  // Chart
  chartWrapper: { flex: 1, backgroundColor: '#0B0E11', position: 'relative' },
  webView: { flex: 1, backgroundColor: '#0B0E11' },
  loader: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0E11', zIndex: 10 },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 15, borderTopWidth: 1, borderColor: '#161A1F', backgroundColor: '#0B0E11' },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionText: { color: '#A0A0A0', fontSize: 11, fontWeight: '600' }
});
