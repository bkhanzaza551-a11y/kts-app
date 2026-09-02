import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurrency } from '../../context/CurrencyContext';
import { RiskDisclaimer } from '../../components/common/RiskDisclaimer';

const COLORS = {
  bg: '#0B0E11',
  card: '#12161A',
  border: '#1E2329',
  gold: '#FFD700',
  goldMuted: 'rgba(255, 215, 0, 0.1)',
  white: '#FFFFFF',
  grey: '#A0A0A0',
  green: '#00C853',
};

const AVAILABLE_BOTS = [
  { 
    id: 1, 
    name: 'KTS Scalper Pro', 
    description: 'High-frequency scalping on EURUSD, GBPUSD', 
    price: 99, 
    monthly: 29, 
    features: ['Auto Trade Execution', '85% Historical Win Rate', '24/5 Forex Trading', 'Dynamic Risk Management'],
    popular: true
  },
  { 
    id: 2, 
    name: 'KTS Swing Master', 
    description: 'Long-term swing trading on Gold & Indices', 
    price: 149, 
    monthly: 49, 
    features: ['Swing Trend Strategy', 'Multi-Asset Support', 'Drawdown Protection', 'Weekly Performance Reports'] 
  },
  { 
    id: 3, 
    name: 'KTS Crypto Hunter', 
    description: '24/7 Crypto trading bot for BTC, ETH', 
    price: 199, 
    monthly: 59, 
    features: ['24/7 Crypto Market', 'Martingale Safety Off', 'DCA Mode Available', 'Real-time Portfolio Track'] 
  },
];

export const BotPurchaseScreen = ({ navigation }) => {
  const { formatAmount } = useCurrency();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Bot Store</Text>
          <Text style={styles.subtitle}>Supercharge your trading with our battle-tested AI bots</Text>
        </View>

        {AVAILABLE_BOTS.map(bot => (
          <View key={bot.id} style={[styles.botCard, bot.popular && styles.botCardPopular]}>
            
            {bot.popular && (
              <View style={styles.popularBadge}>
                <Icon name="fire" size={14} color="#0B0E11" />
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}

            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Icon name="robot-outline" size={32} color={COLORS.gold} />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.botName}>{bot.name}</Text>
                <Text style={styles.botDesc}>{bot.description}</Text>
              </View>
            </View>

            <View style={styles.featuresBox}>
              {bot.features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Icon name="check-decagram" size={16} color={COLORS.green} style={styles.checkIcon} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            <View style={styles.pricingRow}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Lifetime License</Text>
                <Text style={styles.priceAmount}>{formatAmount(bot.price)}</Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Monthly Rent</Text>
                <Text style={styles.priceAmountGold}>{formatAmount(bot.monthly)}<Text style={styles.perMo}>/mo</Text></Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.buyBtn} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('BotDetail', { botId: bot.id })}
            >
              <Text style={styles.buyBtnText}>View Details & Subscribe</Text>
              <Icon name="arrow-right" size={18} color="#0B0E11" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Financial Risk Warning */}
        <RiskDisclaimer style={{ marginTop: 8, marginBottom: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16 },
  
  header: { paddingHorizontal: 4, marginBottom: 24 },
  title: { fontSize: 28, color: COLORS.white, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.grey, lineHeight: 22 },

  botCard: { backgroundColor: '#12161A', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#1E2329', position: 'relative' },
  botCardPopular: { borderColor: 'rgba(255, 215, 0, 0.4)' },
  
  popularBadge: { position: 'absolute', top: -12, right: 20, backgroundColor: COLORS.gold, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, gap: 4, zIndex: 10 },
  popularText: { fontSize: 10, fontWeight: '800', color: '#0B0E11', letterSpacing: 0.5 },

  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.goldMuted, alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  titleContainer: { flex: 1 },
  botName: { fontSize: 20, color: COLORS.white, fontWeight: '800', marginBottom: 4 },
  botDesc: { fontSize: 13, color: COLORS.grey, lineHeight: 18 },

  featuresBox: { marginBottom: 20, paddingHorizontal: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkIcon: { marginRight: 10 },
  featureText: { fontSize: 14, color: '#EAEAEA', fontWeight: '500' },

  pricingRow: { flexDirection: 'row', backgroundColor: '#0B0E11', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  priceBox: { flex: 1, alignItems: 'center' },
  priceDivider: { width: 1, height: '100%', backgroundColor: COLORS.border, marginHorizontal: 10 },
  priceLabel: { fontSize: 11, color: COLORS.grey, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  priceAmount: { fontSize: 20, color: COLORS.white, fontWeight: '800' },
  priceAmountGold: { fontSize: 20, color: COLORS.gold, fontWeight: '800' },
  perMo: { fontSize: 14, color: COLORS.grey, fontWeight: '600' },

  buyBtn: { backgroundColor: COLORS.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  buyBtnText: { color: '#0B0E11', fontSize: 16, fontWeight: '800' },
});
