import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Linking, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { fetchBot, toggleAutoTrade, clearBot } from '../../store/botSlice';
import { formatWinRate } from '../../utils/formatters';
import { useCurrency } from '../../context/CurrencyContext';
import { RiskDisclaimer } from '../../components/common/RiskDisclaimer';

export const BotDetailScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bot, isLoading, error } = useSelector(s => s.bots);
  const { formatAmount } = useCurrency();
  const [budget, setBudget] = useState('');

  useEffect(() => {
    dispatch(fetchBot());
    return () => dispatch(clearBot());
  }, [dispatch]);

  const calculatedLotSize = useMemo(() => {
    if (!bot) return 0;
    const baseBalance = parseFloat(bot.base_balance) || 100;
    const baseLotSize = parseFloat(bot.base_lot_size) || 0.1;
    const userBudget = parseFloat(budget) || 0;
    if (userBudget <= 0) return 0;
    return ((userBudget / baseBalance) * baseLotSize).toFixed(2);
  }, [budget, bot]);

  const handleBuyWhatsApp = () => {
    const number = bot?.whatsapp_number || '+923371244640';
    const clean = number.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi! I want to buy the KTS Trading Bot (${bot?.name || 'KTS10 Pips Bot'}). Please share the pricing and payment details. Thank you.`
    );
    Linking.openURL(`https://wa.me/${clean}?text=${message}`).catch(() =>
      Alert.alert('Error', 'Unable to open WhatsApp. Make sure WhatsApp is installed.')
    );
  };

  const handleDemoRequest = () => {
    navigation.navigate('Demo');
  };

  if (isLoading) return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;
  if (error) return <View style={styles.container}><Text style={[styles.loading, { color: COLORS.red }]}>{error}</Text></View>;
  if (!bot) return <View style={styles.container}><Text style={styles.loading}>Bot not found</Text></View>;

  const isActive = bot.status?.toLowerCase() === 'active';
  const baseBalance = parseFloat(bot.base_balance) || 100;
  const baseLotSize = parseFloat(bot.base_lot_size) || 0.1;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{bot.name}</Text>
            <Text style={styles.mode}>{bot.mode?.toUpperCase()} MODE</Text>
          </View>
          <Badge text={bot.status?.toUpperCase()} variant={bot.status} size="large" />
        </View>

        <Card style={styles.estCard}>
          <Text style={styles.estTitle}>Profit Estimation</Text>
          <View style={styles.estRow}><Text style={styles.estLabel}>On {formatAmount(baseBalance)} balance</Text><Text style={styles.estValue}>Lot Size: {baseLotSize}</Text></View>
          <View style={styles.estRow}><Text style={styles.estLabel}>Take Profit</Text><Text style={styles.estValue}>{bot.take_profit_pips || 10} pips</Text></View>
          <View style={[styles.estRow, { borderBottomWidth: 0 }]}><Text style={styles.estLabel}>Stop Loss</Text><Text style={styles.estValue}>{bot.stop_loss_pips || 5} pips</Text></View>
        </Card>

        <Card style={styles.budgetCard}>
          <Text style={styles.budgetTitle}>Your Budget</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={budget} onChangeText={setBudget} placeholder="0.00" placeholderTextColor="#666" keyboardType="numeric" maxLength={10} />
            <Text style={styles.inputSuffix}>USDT</Text>
          </View>
          {parseFloat(budget) > 0 && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Your Lot Size</Text>
              <Text style={styles.resultValue}>{calculatedLotSize}</Text>
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Account Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.stat}><Text style={styles.statLabel}>Total Trades</Text><Text style={styles.statValue}>{bot.total_trades || 0}</Text></View>
            <View style={styles.stat}><Text style={styles.statLabel}>Win Rate</Text><Text style={styles.statValue}>{formatWinRate(bot.winning_trades, bot.total_trades)}</Text></View>
          </View>
        </Card>

        {bot.error_message ? (
          <View style={styles.errorCard}>
            <Icon name="alert-circle-outline" size={20} color={COLORS.red} />
            <Text style={styles.errorText}>{bot.error_message}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button title="Trade History" variant="outline" onPress={() => navigation.navigate('BotTrades')} />
          <Button title={bot.auto_trade ? 'Disable Auto Trade' : 'Enable Auto Trade'}
            variant={bot.auto_trade ? 'outline' : 'primary'}
            onPress={() => dispatch(toggleAutoTrade())} />
        </View>

        <TouchableOpacity style={styles.buyBtn} onPress={handleBuyWhatsApp}>
          <Icon name="whatsapp" size={22} color="#0B0E11" />
          <Text style={styles.buyBtnText}>Buy This Bot</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoBtn} onPress={handleDemoRequest}>
          <Icon name="monitor-dashboard" size={20} color={COLORS.gold} />
          <Text style={styles.demoBtnText}>Try Demo Account</Text>
        </TouchableOpacity>

        <RiskDisclaimer style={{ marginTop: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  loading: { color: COLORS.white, textAlign: 'center', marginTop: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xl },
  name: { ...TYPOGRAPHY.h1, color: COLORS.white },
  mode: { ...TYPOGRAPHY.body3, color: COLORS.gold, marginTop: 4 },
  estCard: { marginBottom: SPACING.lg },
  estTitle: { fontSize: 16, color: COLORS.white, fontWeight: '700', marginBottom: 12 },
  estRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder },
  estLabel: { fontSize: 14, color: COLORS.grey },
  estValue: { fontSize: 14, color: COLORS.gold, fontWeight: '600' },
  budgetCard: { marginBottom: SPACING.lg },
  budgetTitle: { fontSize: 16, color: COLORS.white, fontWeight: '700', marginBottom: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2026', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A', paddingHorizontal: 14 },
  input: { flex: 1, height: 48, color: COLORS.white, fontSize: 18, fontWeight: '700' },
  inputSuffix: { fontSize: 14, color: COLORS.grey, fontWeight: '600' },
  resultBox: { marginTop: 12, backgroundColor: 'rgba(255,215,0,0.05)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 14, color: COLORS.grey },
  resultValue: { fontSize: 20, color: COLORS.gold, fontWeight: '800' },
  card: { marginBottom: SPACING.lg },
  cardTitle: { ...TYPOGRAPHY.h4, color: COLORS.white, marginBottom: SPACING.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  stat: { width: '50%', paddingVertical: 8 },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.grey },
  statValue: { ...TYPOGRAPHY.body1, color: COLORS.white, fontWeight: '600', marginTop: 4 },
  actions: { gap: SPACING.md, marginTop: SPACING.lg },
  errorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,68,68,0.1)', borderRadius: 12, padding: 12, marginTop: SPACING.lg, gap: 8, borderWidth: 1, borderColor: 'rgba(255,68,68,0.2)' },
  errorText: { flex: 1, fontSize: 13, color: COLORS.red, lineHeight: 18 },
  buyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 16, marginTop: SPACING.lg, gap: 10, elevation: 4, shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  buyBtnText: { fontSize: 16, color: '#0B0E11', fontWeight: '800', letterSpacing: 0.5 },
  demoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#12161A', borderRadius: 12, paddingVertical: 15, marginTop: 12, gap: 10, borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)' },
  demoBtnText: { fontSize: 15, color: COLORS.gold, fontWeight: '700' },
});
