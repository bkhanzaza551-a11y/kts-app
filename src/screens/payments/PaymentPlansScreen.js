import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { fetchPlans } from '../../store/paymentSlice';
import { useCurrency } from '../../context/CurrencyContext';

const PLANS = [
  { id: 'basic', name: 'Basic', price: 29, period: 'month', features: ['1 Bot', 'Basic Signals', 'Email Support', 'Community Access'], color: COLORS.silver },
  { id: 'pro', name: 'Pro', price: 49, period: 'month', features: ['3 Bots', 'All Signals', 'Priority Support', 'VIP Chat', 'Advanced Analytics'], color: COLORS.gold, popular: true },
  { id: 'vip', name: 'VIP', price: 99, period: 'month', features: ['Unlimited Bots', 'All Signals', '1-on-1 Mentorship', 'Custom Strategies', 'API Access', 'White Glove Support'], color: COLORS.goldLight },
];

export const PaymentPlansScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { plans } = useSelector(s => s.payments);
  const [selected, setSelected] = React.useState('pro');
  const { formatAmount } = useCurrency();

  useEffect(() => { dispatch(fetchPlans()); }, [dispatch]);

  useEffect(() => { if (plans.length && !plans.find(p => p.id === selected)) setSelected(plans[0]?.id); }, [plans]);

  const displayPlans = plans.length ? plans : PLANS;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Unlock the full power of KTS Markets</Text>
      </View>

      {displayPlans.map(plan => (
        <Card key={plan.id} style={[styles.planCard, selected === plan.id && styles.planCardActive]}
          onPress={() => setSelected(plan.id)}>
          {plan.popular && <View style={styles.popularBadge}><Text style={styles.popularText}>MOST POPULAR</Text></View>}
          <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatAmount(plan.price)}</Text>
            <Text style={styles.period}>/{plan.period}</Text>
          </View>
          <View style={styles.features}>
            {plan.features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.check}>✓</Text>
                <Text style={styles.feature}>{f}</Text>
              </View>
            ))}
          </View>
          {selected === plan.id && <View style={[styles.selectedIndicator, { backgroundColor: plan.color }]} />}
        </Card>
      ))}

      <Button title={`Subscribe to ${displayPlans.find(p => p.id === selected)?.name || 'Plan'}`} onPress={() => navigation.navigate('Checkout', { plan: selected })} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.white },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.silver, marginTop: 8 },
  planCard: { marginBottom: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.darkBorder, overflow: 'hidden' },
  planCardActive: { borderColor: COLORS.gold },
  popularBadge: { backgroundColor: COLORS.gold, paddingVertical: 4, alignItems: 'center' },
  popularText: { ...TYPOGRAPHY.caption, color: COLORS.black, fontWeight: '700' },
  planName: { ...TYPOGRAPHY.h3, marginTop: SPACING.md },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: SPACING.sm },
  price: { ...TYPOGRAPHY.h1, color: COLORS.white },
  period: { ...TYPOGRAPHY.body2, color: COLORS.grey },
  features: { marginTop: SPACING.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  check: { color: COLORS.gold, fontWeight: '700' },
  feature: { ...TYPOGRAPHY.body2, color: COLORS.silver },
  selectedIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },
});
