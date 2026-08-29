import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../components/common/Skeleton';
import { AnimatedScreen } from '../../components/common/AnimatedScreen';
import { fetchSignals, fetchCategories, clearSignals } from '../../store/signalSlice';
import { useCurrency } from '../../context/CurrencyContext';

const COLORS = {
  bg: '#0B0E11',
  card: '#12161A',
  border: '#1E2329',
  gold: '#FFD700',
  goldMuted: 'rgba(255, 215, 0, 0.1)',
  white: '#FFFFFF',
  grey: '#A0A0A0',
  green: '#00C853',
  red: '#FF4444',
  blue: '#2196F3',
  orange: '#FF9800'
};

export const SignalListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, categories, isLoading, page, lastPage } = useSelector(s => s.signals);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { formatAmount } = useCurrency();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    dispatch(clearSignals());
    dispatch(fetchSignals({ page: 1 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const loadMore = () => { 
    // Fix: Prevent endless loop on empty list by checking items.length > 0
    if (!isLoading && page < lastPage && items.length > 0) {
      dispatch(fetchSignals({ page: page })); 
    }
  };
  
  const onRefresh = async () => { 
    setRefreshing(true); 
    await dispatch(clearSignals()); 
    dispatch(fetchSignals({ page: 1 })); 
    setRefreshing(false); 
  };

  const filteredItems = selectedCategory
    ? items.filter(s => s.categories?.some(c => c.id === selectedCategory))
    : items;

  const renderSignal = ({ item }) => {
    const isBuy = item.direction?.toLowerCase() === 'buy';
    const isWin = item.result?.toLowerCase() === 'win';
    const isLoss = item.result?.toLowerCase() === 'loss';

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('SignalDetail', { signalId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.symbolBadge}>
              <Text style={styles.symbolText}>{formatSymbol(item.symbol)}</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardTime}>
                {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
              </Text>
            </View>
          </View>
          <View style={[styles.directionBadge, { backgroundColor: isBuy ? 'rgba(0,200,83,0.1)' : 'rgba(255,68,68,0.1)' }]}>
            <Text style={[styles.directionText, { color: isBuy ? COLORS.green : COLORS.red }]}>
              {isBuy ? '▲ BUY' : '▼ SELL'}
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>ENTRY</Text>
            <Text style={styles.priceValue}>{formatAmount(item.entry_price)}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>TAKE PROFIT</Text>
            <Text style={[styles.priceValue, { color: COLORS.green }]}>{formatAmount(item.take_profit)}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>STOP LOSS</Text>
            <Text style={[styles.priceValue, { color: COLORS.red }]}>{formatAmount(item.stop_loss)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.statusGroup}>
            <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? COLORS.green : COLORS.grey }]} />
            <Text style={[styles.statusText, { color: item.status === 'active' ? COLORS.green : COLORS.grey }]}>
              {item.status?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
          
          {item.result && item.result !== 'pending' && (
            <View style={[styles.resultPill, { backgroundColor: isWin ? 'rgba(0,200,83,0.1)' : isLoss ? 'rgba(255,68,68,0.1)' : 'rgba(33,150,243,0.1)' }]}>
              <Text style={[styles.resultPillText, { color: isWin ? COLORS.green : isLoss ? COLORS.red : COLORS.blue }]}>
                {item.result.toUpperCase()}
              </Text>
            </View>
          )}
          
          {item.pips_result != null && (
            <Text style={[styles.pipsText, { color: item.pips_result >= 0 ? COLORS.green : COLORS.red }]}>
              {item.pips_result >= 0 ? '+' : ''}{item.pips_result} pips
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

    const formatSymbol = (sym) => {
    if (!sym) return '';
    if (sym.length === 6) return sym.substring(0, 3) + '/' + sym.substring(3);
    if (sym.includes('USDT')) return sym.replace('USDT', '/USDT');
    return sym;
  };

  const renderHeader = () => (
    <View style={styles.catContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
        <TouchableOpacity 
          style={[styles.catChip, !selectedCategory && styles.catChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.catText, !selectedCategory && styles.catTextActive]}>All Markets</Text>
        </TouchableOpacity>
        {categories?.map(c => (
          <TouchableOpacity 
            key={c.id} 
            style={[styles.catChip, selectedCategory === c.id && styles.catChipActive]}
            onPress={() => setSelectedCategory(c.id)}
          >
            <Text style={[styles.catText, selectedCategory === c.id && styles.catTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading && items.length === 0) {
      return (
        <View style={{ gap: 16, marginTop: 10 }}>
          {[1, 2, 3].map((_, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <Skeleton width={48} height={28} borderRadius={8} />
                  <View>
                    <Skeleton width={100} height={16} borderRadius={4} style={{ marginBottom: 6 }} />
                    <Skeleton width={60} height={12} borderRadius={4} />
                  </View>
                </View>
                <Skeleton width={60} height={24} borderRadius={12} />
              </View>
              <View style={styles.priceRow}>
                 <Skeleton width={50} height={30} borderRadius={6} />
                 <View style={styles.priceDivider} />
                 <Skeleton width={50} height={30} borderRadius={6} />
                 <View style={styles.priceDivider} />
                 <Skeleton width={50} height={30} borderRadius={6} />
              </View>
            </View>
          ))}
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBg}>
          <Icon name="chart-timeline-variant" size={60} color={COLORS.gold} />
          <View style={styles.floatingStar}>
            <Icon name="bell-alert" size={20} color={COLORS.gold} />
          </View>
        </View>
        <Text style={styles.emptyTitle}>No Active Signals</Text>
        <Text style={styles.emptyDesc}>
          There are no trading signals matching your criteria right now. Check back later for new setups!
        </Text>
      </View>
    );
  };

  return (
    <AnimatedScreen style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon name="chart-line-variant" size={24} color={COLORS.gold} /><Text style={styles.headerTitle}>Market Signals</Text></View>
        <Text style={styles.headerSub}>{filteredItems.length} active setups</Text>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSignal}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
      />
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  
  header: { paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#12161A', borderBottomWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 26, color: COLORS.white, fontWeight: '800' },
  headerSub: { fontSize: 13, color: COLORS.grey, marginTop: 2, fontWeight: '500' },
  
  catContainer: { paddingVertical: 16 },
  catList: { paddingHorizontal: 16, gap: 10 },
  catChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.goldMuted, borderColor: COLORS.gold },
  catText: { fontSize: 13, color: COLORS.grey, fontWeight: '600' },
  catTextActive: { color: COLORS.gold, fontWeight: '700' },
  
  list: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 100 },

  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  symbolBadge: { backgroundColor: COLORS.goldMuted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  symbolText: { fontSize: 13, color: COLORS.gold, fontWeight: '800' },
  cardTitle: { fontSize: 15, color: COLORS.white, fontWeight: '700' },
  cardTime: { fontSize: 11, color: COLORS.grey, marginTop: 4 },
  
  directionBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  directionText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.bg, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  priceCol: { flex: 1, alignItems: 'center' },
  priceDivider: { width: 1, height: '80%', backgroundColor: COLORS.border },
  priceLabel: { fontSize: 10, color: COLORS.grey, fontWeight: '600', marginBottom: 4, letterSpacing: 0.5 },
  priceValue: { fontSize: 14, color: COLORS.white, fontWeight: '800' },

  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 10 },
  statusGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  resultPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  resultPillText: { fontSize: 11, fontWeight: '800' },
  pipsText: { fontSize: 13, fontWeight: '800', marginLeft: 'auto' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 20 },
  emptyIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.goldMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative', borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  floatingStar: { position: 'absolute', top: 5, right: 5 },
  emptyTitle: { fontSize: 22, color: COLORS.white, fontWeight: '800', marginBottom: 12 },
  emptyDesc: { fontSize: 14, color: COLORS.grey, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
});




