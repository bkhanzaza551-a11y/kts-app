import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { useCurrency } from '../../context/CurrencyContext';
import client from '../../api/client';

export const PaymentHistoryScreen = () => {
  const [transactions, setTransactions] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const { formatAmount } = useCurrency();

  const load = () => client.get('/payments/history').then(r => setTransactions(r.data.data?.data || r.data.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.description || item.type || 'Payment'}</Text>
          <Text style={styles.date}>{formatDate(item.created_at, 'datetime')}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? COLORS.greenMuted : COLORS.goldMuted }]}>
            <Text style={[styles.statusText, { color: item.status === 'completed' ? COLORS.green : COLORS.gold }]}>{item.status?.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <FlatList
      style={styles.container}
      data={transactions}
      keyExtractor={(item, i) => String(item.id || i)}
      renderItem={renderItem}
      ListEmptyComponent={<EmptyState icon="💳" title="No Payments" message="Your payment history will appear here" />}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={COLORS.gold} />}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  list: { padding: SPACING.screen, paddingBottom: 40 },
  card: { marginBottom: SPACING.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...TYPOGRAPHY.body1, color: COLORS.white, fontWeight: '600' },
  date: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginTop: 4 },
  right: { alignItems: 'flex-end' },
  amount: { ...TYPOGRAPHY.h4, color: COLORS.white },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full, marginTop: 4 },
  statusText: { ...TYPOGRAPHY.caption, fontWeight: '600' },
});
