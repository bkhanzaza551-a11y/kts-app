import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { fetchBots } from '../../store/botSlice';
import { formatCurrency, formatWinRate } from '../../utils/formatters';

export const BotListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bots, isLoading } = useSelector(s => s.bots);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => { dispatch(fetchBots()); }, []);

  const onRefresh = async () => { setRefreshing(true); await dispatch(fetchBots()); setRefreshing(false); };

  const renderBot = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('BotDetail', { botId: item.id })}>
      <View style={styles.botHeader}>
        <View style={styles.botAvatar}>
          <Text style={styles.botEmoji}>🤖</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.botName}>{item.name}</Text>
          <Text style={styles.botDesc}>{item.description || item.mode?.toUpperCase()}</Text>
        </View>
        <Badge text={item.status?.toUpperCase()} variant={item.status} />
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.stat}><Text style={styles.statLabel}>Balance</Text><Text style={styles.statValue}>{formatCurrency(item.balance)}</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>Equity</Text><Text style={styles.statValue}>{formatCurrency(item.equity)}</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>Profit</Text><Text style={[styles.statValue, { color: (item.total_profit || 0) >= 0 ? COLORS.green : COLORS.red }]}>{formatCurrency(item.total_profit)}</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>Win Rate</Text><Text style={styles.statValue}>{formatWinRate(item.winning_trades, item.total_trades)}</Text></View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MT5 Bots</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('BotPurchase')}>
          <Text style={styles.addBtnText}>+ Get Bot</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={bots}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderBot}
        ListEmptyComponent={!isLoading ? <EmptyState icon="🤖" title="No Bots" message="Purchase a bot to get started" /> : null}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 16, paddingHorizontal: SPACING.screen },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.white },
  addBtn: { backgroundColor: COLORS.goldMuted, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.gold },
  addBtnText: { ...TYPOGRAPHY.buttonSmall, color: COLORS.gold },
  list: { paddingHorizontal: SPACING.screen, paddingBottom: 100 },
  card: { marginBottom: SPACING.lg },
  botHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  botAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.goldMuted, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  botEmoji: { fontSize: 22 },
  botName: { ...TYPOGRAPHY.h4, color: COLORS.white },
  botDesc: { ...TYPOGRAPHY.body3, color: COLORS.grey, marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: COLORS.darkSurface, borderRadius: RADIUS.sm, padding: SPACING.md },
  stat: { width: '50%', paddingVertical: 6 },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.grey },
  statValue: { ...TYPOGRAPHY.body2, color: COLORS.white, fontWeight: '600', marginTop: 4 },
});
