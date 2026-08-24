import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

const PAYMENT_METHODS = [
  { id: 'card', icon: '💳', name: 'Credit/Debit Card' },
  { id: 'crypto', icon: '₿', name: 'Cryptocurrency' },
  { id: 'bank', icon: '🏦', name: 'Bank Transfer' },
];

export const CheckoutScreen = ({ route, navigation }) => {
  const { plan, bot } = route.params || {};
  const [method, setMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [coupon, setCoupon] = useState('');

  const amount = bot?.price || (plan === 'vip' ? 99 : plan === 'pro' ? 49 : 29);
  const name = bot?.name || `${plan?.toUpperCase()} Plan`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Checkout</Text>

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{name}</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>${amount}.00</Text>
        </View>
        {plan && <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Billing</Text><Text style={styles.summaryValue}>Monthly</Text></View>}
      </Card>

      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.methods}>
        {PAYMENT_METHODS.map(m => (
          <TouchableOpacity key={m.id} style={[styles.methodBtn, method === m.id && styles.methodActive]} onPress={() => setMethod(m.id)}>
            <Text style={styles.methodIcon}>{m.icon}</Text>
            <Text style={[styles.methodName, method === m.id && styles.methodNameActive]}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {method === 'card' && (
        <Card>
          <Input label="Card Number" value={cardNumber} onChangeText={setCardNumber} placeholder="1234 5678 9012 3456" keyboardType="number-pad" maxLength={19} icon="💳" />
          <View style={styles.row}>
            <Input label="Expiry" value={expiry} onChangeText={setExpiry} placeholder="MM/YY" keyboardType="number-pad" maxLength={5} style={{ flex: 1 }} icon="📅" />
            <Input label="CVV" value={cvv} onChangeText={setCvv} placeholder="123" secureTextEntry keyboardType="number-pad" maxLength={4} style={{ flex: 1 }} icon="🔒" />
          </View>
        </Card>
      )}

      <Input label="Coupon Code" value={coupon} onChangeText={setCoupon} placeholder="Enter code (optional)" icon="🏷️" />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${amount}.00</Text>
      </View>

      <Button title={`Pay $${amount}.00`} onPress={() => navigation.navigate('PaymentSuccess', { amount, name })} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.white, marginBottom: SPACING.xl },
  summaryCard: { marginBottom: SPACING.xl },
  summaryTitle: { ...TYPOGRAPHY.h4, color: COLORS.gold, marginBottom: SPACING.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder },
  summaryLabel: { ...TYPOGRAPHY.body2, color: COLORS.silver },
  summaryValue: { ...TYPOGRAPHY.body2, color: COLORS.white, fontWeight: '600' },
  sectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.white, marginBottom: SPACING.md },
  methods: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  methodBtn: { flex: 1, alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.darkCard, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.darkBorder },
  methodActive: { borderColor: COLORS.gold, backgroundColor: COLORS.goldMuted },
  methodIcon: { fontSize: 24, marginBottom: 8 },
  methodName: { ...TYPOGRAPHY.caption, color: COLORS.silver },
  methodNameActive: { color: COLORS.gold, fontWeight: '600' },
  row: { flexDirection: 'row', gap: SPACING.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.darkCard, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.gold },
  totalLabel: { ...TYPOGRAPHY.h3, color: COLORS.white },
  totalValue: { ...TYPOGRAPHY.h2, color: COLORS.gold },
});
