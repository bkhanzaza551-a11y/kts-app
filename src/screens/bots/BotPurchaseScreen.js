import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useCurrency } from '../../context/CurrencyContext';

const AVAILABLE_BOTS = [
  { id: 1, name: 'KTS Scalper Pro', description: 'Automated scalping on EURUSD, GBPUSD', price: 99, monthly: 29, features: ['Auto Trade', '85% Win Rate', '24/7 Trading', 'Risk Management'] },
  { id: 2, name: 'KTS Swing Master', description: 'Swing trading on Gold & Indices', price: 149, monthly: 49, features: ['Swing Strategy', 'Multi-Asset', 'Drawdown Protection', 'Weekly Reports'] },
  { id: 3, name: 'KTS Crypto Hunter', description: 'Crypto trading bot for BTC, ETH', price: 199, monthly: 59, features: ['24/7 Crypto', 'Martingale Off', 'DCA Mode', 'Portfolio Track'] },
];

export const BotPurchaseScreen = ({ navigation }) => {
  const { formatAmount } = useCurrency();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Available Bots</Text>
      <Text style={styles.subtitle}>Choose a bot that fits your trading style</Text>

      {AVAILABLE_BOTS.map(bot => (
        <Card key={bot.id} style={styles.botCard}>
          <View style={styles.botHeader}>
            <View style={styles.botIcon}><Text style={styles.botEmoji}>🤖</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.botName}>{bot.name}</Text>
              <Text style={styles.botDesc}>{bot.description}</Text>
            </View>
          </View>

          <View style={styles.features}>
            {bot.features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>One-time</Text>
              <Text style={styles.price}>{formatAmount(bot.price)}</Text>
            </View>
            <View style={styles.divider} />
            <View>
              <Text style={styles.priceLabel}>Monthly</Text>
              <Text style={styles.priceGold}>{formatAmount(bot.monthly)}/mo</Text>
            </View>
          </View>

          <Button title={`Get ${bot.name}`} onPress={() => navigation.navigate('BotDetail', { botId: bot.id })} />
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.white, marginBottom: 8 },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.silver, marginBottom: SPACING.xl },
  botCard: { marginBottom: SPACING.xl },
  botHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  botIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.goldMuted, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  botEmoji: { fontSize: 26 },
  botName: { ...TYPOGRAPHY.h3, color: COLORS.gold },
  botDesc: { ...TYPOGRAPHY.body3, color: COLORS.silver, marginTop: 4 },
  features: { marginBottom: SPACING.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 8 },
  checkmark: { color: COLORS.gold, fontWeight: '700', fontSize: 16 },
  featureText: { ...TYPOGRAPHY.body2, color: COLORS.silver },
  priceRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: COLORS.darkSurface, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.lg },
  divider: { width: 1, height: 40, backgroundColor: COLORS.darkBorder },
  priceLabel: { ...TYPOGRAPHY.caption, color: COLORS.grey, textAlign: 'center' },
  price: { ...TYPOGRAPHY.h3, color: COLORS.white, textAlign: 'center', marginTop: 4 },
  priceGold: { ...TYPOGRAPHY.h3, color: COLORS.gold, textAlign: 'center', marginTop: 4 },
});
