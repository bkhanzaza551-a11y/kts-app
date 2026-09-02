import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchBots } from '../../store/botSlice';
import { formatWinRate } from '../../utils/formatters';
import { useCurrency } from '../../context/CurrencyContext';
import { Skeleton } from '../../components/common/Skeleton';
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
  red: '#FF4444'
};

export const BotListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bots, isLoading } = useSelector(s => s.bots);
  const [refreshing, setRefreshing] = React.useState(false);
  const { formatAmount } = useCurrency();
  const insets = useSafeAreaInsets();

  useEffect(() => { dispatch(fetchBots()); }, [dispatch]);

  const onRefresh = async () => { 
    setRefreshing(true); 
    await dispatch(fetchBots()); 
    setRefreshing(false); 
  };

  const renderBot = ({ item }) => {
    const profit = item.total_profit || 0;
    const isProfit = profit >= 0;
    const isActive = item.status?.toLowerCase() === 'active';

    return (
      <TouchableOpacity 
        style={styles.botCard} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('BotDetail', { botId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.botIconWrapper}>
            <Icon name="robot-outline" size={24} color={COLORS.gold} />
          </View>
          <View style={styles.botInfo}>
            <Text style={styles.botName}>{item.name}</Text>
            <Text style={styles.botType}>{item.description || item.mode?.toUpperCase() || 'Automated Strategy'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isActive ? 'rgba(0,200,83,0.1)' : 'rgba(160,160,160,0.1)' }]}>
            <View style={[styles.statusDot, { backgroundColor: isActive ? COLORS.green : COLORS.grey }]} />
            <Text style={[styles.statusText, { color: isActive ? COLORS.green : COLORS.grey }]}>
              {item.status?.toUpperCase() || 'INACTIVE'}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Balance</Text>
            <Text style={styles.statValue}>{formatAmount(item.balance || 0)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Equity</Text>
            <Text style={styles.statValue}>{formatAmount(item.equity || 0)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Profit</Text>
            <Text style={[styles.statValue, { color: isProfit ? COLORS.green : COLORS.red }]}>
              {isProfit ? '+' : ''}{formatAmount(profit)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Win Rate</Text>
            <Text style={styles.statValue}>{formatWinRate(item.winning_trades, item.total_trades)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (isLoading && bots.length === 0) {
      return (
        <View style={{ gap: 16 }}>
          {[1, 2, 3].map((_, idx) => (
            <View key={idx} style={styles.botCard}>
              <View style={styles.cardHeader}>
                <Skeleton width={48} height={48} borderRadius={16} style={{ marginRight: 12 }} />
                <View style={styles.botInfo}>
                  <Skeleton width={120} height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                  <Skeleton width={80} height={12} borderRadius={4} />
                </View>
                <Skeleton width={70} height={24} borderRadius={12} />
              </View>
              <View style={styles.statsGrid}>
                {[1,2,3,4].map(s => (
                  <View key={s} style={styles.statBox}>
                    <Skeleton width={50} height={12} borderRadius={4} style={{ marginBottom: 8 }} />
                    <Skeleton width={70} height={16} borderRadius={4} />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBg}>
          <Icon name="robot-outline" size={60} color={COLORS.gold} />
          <View style={styles.floatingStar}><Icon name="creation" size={20} color={COLORS.gold} /></View>
        </View>
        <Text style={styles.emptyTitle}>No Active Bots</Text>
        <Text style={styles.emptyDesc}>
          Automate your trading with our AI-driven MT5 Bots. Purchase a bot to let the AI trade for you 24/7.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('BotPurchase')}>
          <Icon name="lightning-bolt" size={20} color="#0B0E11" />
          <Text style={styles.primaryBtnText}>Explore AI Bots</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        <View>
          <Text style={styles.headerTitle}>MT5 AI Bots</Text>
          <Text style={styles.headerSub}>Automated Trading</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('BotPurchase')}>
          <Icon name="plus" size={16} color={COLORS.gold} />
          <Text style={styles.addBtnText}>Get Bot</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bots}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderBot}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={bots.length > 0 ? <RiskDisclaimer style={{ marginTop: 16 }} /> : null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#12161A' },
  headerTitle: { fontSize: 22, color: COLORS.white, fontWeight: '800' },
  headerSub: { fontSize: 13, color: COLORS.grey, marginTop: 2, fontWeight: '500' },
  
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.goldMuted, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: COLORS.gold, gap: 4 },
  addBtnText: { color: COLORS.gold, fontSize: 13, fontWeight: '700' },
  
  listContent: { flexGrow: 1, padding: 16, paddingBottom: 100 },
  
  // Bot Card
  botCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  botIconWrapper: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.goldMuted, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  botInfo: { flex: 1 },
  botName: { fontSize: 18, color: COLORS.white, fontWeight: '700' },
  botType: { fontSize: 12, color: COLORS.grey, marginTop: 4, fontWeight: '500' },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: COLORS.bg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  statBox: { width: '50%', paddingVertical: 8, paddingHorizontal: 4 },
  statLabel: { fontSize: 11, color: COLORS.grey, marginBottom: 4, fontWeight: '500' },
  statValue: { fontSize: 15, color: COLORS.white, fontWeight: '700' },

  // Empty State
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.goldMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative', borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  floatingStar: { position: 'absolute', top: 5, right: 5 },
  emptyTitle: { fontSize: 24, color: COLORS.white, fontWeight: '800', marginBottom: 12 },
  emptyDesc: { fontSize: 14, color: COLORS.grey, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 10 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gold, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, gap: 8, width: '100%', justifyContent: 'center' },
  primaryBtnText: { color: '#0B0E11', fontSize: 16, fontWeight: '800' }
});

