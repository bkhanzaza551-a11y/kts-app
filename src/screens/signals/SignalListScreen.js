import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { fetchSignals, fetchCategories, clearSignals } from '../../store/signalSlice';
import { formatPrice } from '../../utils/formatters';
import { useCurrency } from '../../context/CurrencyContext';

export const SignalListScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { items, categories, isLoading, page, lastPage } = useSelector(s => s.signals);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    dispatch(clearSignals());
    dispatch(fetchSignals({ page: 1 }));
    dispatch(fetchCategories());
  }, []);

  const loadMore = () => { if (page <= lastPage && !isLoading) dispatch(fetchSignals({ page })); };
  const onRefresh = async () => { setRefreshing(true); await dispatch(clearSignals()); dispatch(fetchSignals({ page: 1 })); setRefreshing(false); };

  const filteredItems = selectedCategory
    ? items.filter(s => s.categories?.some(c => c.id === selectedCategory))
    : items;

  const getStatusStyle = (status) => {
    switch(status) {
      case 'active': return { bg: COLORS.greenMuted, text: COLORS.green };
      case 'closed': return { bg: 'rgba(148, 163, 184, 0.15)', text: COLORS.silver };
      case 'draft': return { bg: 'rgba(255, 152, 0, 0.15)', text: COLORS.orange };
      default: return { bg: COLORS.darkSurface, text: COLORS.grey };
    }
  };

  const getResultStyle = (result) => {
    switch(result) {
      case 'win': return { bg: COLORS.greenMuted, text: COLORS.green, label: 'WIN' };
      case 'loss': return { bg: 'rgba(255, 23, 68, 0.15)', text: COLORS.red, label: 'LOSS' };
      case 'breakeven': return { bg: 'rgba(33, 150, 243, 0.15)', text: COLORS.blue, label: 'BE' };
      default: return { bg: COLORS.darkSurface, text: COLORS.grey, label: 'PENDING' };
    }
  };

  const renderSignal = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    const resultStyle = getResultStyle(item.result);

    return (
      <Card style={styles.card} onPress={() => navigation.navigate('SignalDetail', { signalId: item.id })}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.symbolBadge}>
              <Text style={styles.symbolText}>{item.symbol}</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardTime}>{item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</Text>
            </View>
          </View>
          <View style={styles.cardBadges}>
            <View style={[styles.directionBadge, { backgroundColor: item.direction === 'buy' ? COLORS.greenMuted : 'rgba(255, 23, 68, 0.15)' }]}>
              <Text style={[styles.directionText, { color: item.direction === 'buy' ? COLORS.green : COLORS.red }]}>
                {item.direction === 'buy' ? '▲ BUY' : '▼ SELL'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>ENTRY</Text>
            <Text style={styles.priceValue}>{formatPrice(item.entry_price)}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>TP</Text>
            <Text style={[styles.priceValue, { color: COLORS.green }]}>{formatPrice(item.take_profit)}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>SL</Text>
            <Text style={[styles.priceValue, { color: COLORS.red }]}>{formatPrice(item.stop_loss)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status?.toUpperCase()}</Text>
          {item.result && item.result !== 'pending' && (
            <View style={[styles.resultPill, { backgroundColor: resultStyle.bg }]}>
              <Text style={[styles.resultPillText, { color: resultStyle.text }]}>{resultStyle.label}</Text>
            </View>
          )}
          {item.pips_result != null && (
            <Text style={[styles.pipsText, { color: item.pips_result >= 0 ? COLORS.green : COLORS.red }]}>
              {item.pips_result >= 0 ? '+' : ''}{item.pips_result} pips
            </Text>
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Signals</Text>
        <Text style={styles.headerSub}>{filteredItems.length} signals</Text>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSignal}
        ListEmptyComponent={!isLoading ? (
          <EmptyState icon="📊" title="No Signals" message="No signals available right now" />
        ) : null}
        ListHeaderComponent={() => (
          <FlatList
            data={[{ id: null, name: 'All' }, ...categories]}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.catList}
            keyExtractor={(item) => String(item.id ?? 'all')}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.catChip, selectedCategory === item.id && styles.catChipActive]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Text style={[styles.catText, selectedCategory === item.id && styles.catTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  header: { paddingTop: 50, paddingBottom: 12, paddingHorizontal: SPACING.screen },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.white },
  headerSub: { ...TYPOGRAPHY.body3, color: COLORS.grey, marginTop: 2 },
  catList: { paddingHorizontal: SPACING.screen, marginBottom: SPACING.md },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.darkCard,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: COLORS.goldMuted, borderColor: COLORS.gold },
  catText: { ...TYPOGRAPHY.body3, color: COLORS.silver },
  catTextActive: { color: COLORS.gold, fontWeight: '600' },
  list: { paddingHorizontal: SPACING.screen, paddingBottom: 100 },

  card: { marginBottom: SPACING.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  symbolBadge: {
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
  },
  symbolText: { ...TYPOGRAPHY.caption, color: COLORS.gold, fontWeight: '700' },
  cardTitle: { ...TYPOGRAPHY.body1, color: COLORS.white, fontWeight: '600' },
  cardTime: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginTop: 2 },
  cardBadges: { alignItems: 'flex-end' },
  directionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  directionText: { ...TYPOGRAPHY.caption, fontWeight: '700', fontSize: 11 },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    backgroundColor: COLORS.darkSurface,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
  },
  priceCol: { flex: 1, alignItems: 'center' },
  priceDivider: { width: 1, height: 28, backgroundColor: COLORS.darkBorder },
  priceLabel: { ...TYPOGRAPHY.caption, color: COLORS.grey, fontSize: 10, letterSpacing: 0.5 },
  priceValue: { ...TYPOGRAPHY.body2, color: COLORS.white, fontWeight: '700', marginTop: 4 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...TYPOGRAPHY.caption, fontWeight: '600', fontSize: 11 },
  resultPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  resultPillText: { ...TYPOGRAPHY.caption, fontWeight: '700', fontSize: 10 },
  pipsText: { ...TYPOGRAPHY.caption, fontWeight: '700', fontSize: 11, marginLeft: 'auto' },
});
