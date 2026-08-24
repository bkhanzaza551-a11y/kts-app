import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import LinearGradient from 'react-native-linear-gradient';

export const PaymentSuccessScreen = ({ route, navigation }) => {
  const { amount, name } = route.params || {};

  return (
    <LinearGradient colors={[COLORS.black, '#1A1510']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>Thank you for your purchase</Text>

        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Plan</Text><Text style={styles.receiptValue}>{name}</Text></View>
          <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Amount</Text><Text style={styles.receiptValue}>${amount}.00</Text></View>
          <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Date</Text><Text style={styles.receiptValue}>{new Date().toLocaleDateString()}</Text></View>
          <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Status</Text><Text style={[styles.receiptValue, { color: COLORS.green }]}>COMPLETED</Text></View>
        </View>

        <Button title="Go to Dashboard" onPress={() => navigation.popToTop()} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: SPACING.screen, justifyContent: 'center', alignItems: 'center' },
  checkCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xxl },
  checkmark: { fontSize: 48, color: COLORS.white, fontWeight: '700' },
  title: { ...TYPOGRAPHY.h2, color: COLORS.white, marginBottom: 8 },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.silver, marginBottom: SPACING.xxxl },
  receiptCard: { width: '100%', backgroundColor: COLORS.darkCard, borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.xxl, borderWidth: 1, borderColor: COLORS.darkBorder },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder },
  receiptLabel: { ...TYPOGRAPHY.body2, color: COLORS.silver },
  receiptValue: { ...TYPOGRAPHY.body2, color: COLORS.white, fontWeight: '600' },
});
