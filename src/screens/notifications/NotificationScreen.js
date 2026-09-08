import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchNotifications, fetchUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from '../../store/notificationSlice';
import { formatRelativeTime } from '../../utils/formatters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHaptic } from '../../utils/haptics';

export const NotificationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, isLoading, unreadCount } = useSelector((s) => s.notifications);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const hasUnread = items.some(i => !i.is_read) || unreadCount > 0;

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic('light');
    await Promise.all([
      dispatch(fetchNotifications()),
      dispatch(fetchUnreadCount()),
    ]);
    setRefreshing(false);
  };

  const handleMarkAllRead = () => {
    triggerHaptic('success');
    dispatch(markAllNotificationsAsRead());
  };

  const handlePressItem = (item) => {
    triggerHaptic('light');
    if (!item.is_read) {
      dispatch(markNotificationAsRead(item.id));
    }
    navigation.navigate('NewsDetail', { news: item });
  };

  const getIconAndColor = (type) => {
    switch (type) {
      case 'success': return { icon: 'check-circle', color: '#00C853' };
      case 'warning': return { icon: 'alert', color: '#FF9800' };
      case 'danger': return { icon: 'alert-circle', color: '#FF4444' };
      default: return { icon: 'information', color: '#2196F3' };
    }
  };

  const renderNewsItem = ({ item }) => {
    const theme = getIconAndColor(item.type);
    const isUnread = !item.is_read;

    return (
      <TouchableOpacity 
        style={[styles.newsCard, isUnread && styles.newsCardUnread]} 
        activeOpacity={0.7}
        onPress={() => handlePressItem(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Icon name={theme.icon} size={20} color={theme.color} />
            <Text style={[styles.newsTitle, isUnread && { color: COLORS.white, fontWeight: '800' }]} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          {isUnread && <View style={styles.unreadDot} />}
        </View>
        
        <Text style={[styles.newsBody, isUnread && { color: '#CCC' }]} numberOfLines={2}>
          {item.body}
        </Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.newsDate}>{formatRelativeTime(item.created_at)}</Text>
          <View style={styles.readMoreBtn}>
            <Text style={styles.readMoreText}>Read more</Text>
            <Icon name="chevron-right" size={16} color={COLORS.gold} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="chevron-left" size={28} color={COLORS.white} />
          </TouchableOpacity>
          {hasUnread && (
            <TouchableOpacity 
              style={styles.markAllBtn}
              onPress={handleMarkAllRead}
              activeOpacity={0.7}
            >
              <Icon name="check-all" size={18} color={COLORS.gold} style={{ marginRight: 4 }} />
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.headerTitle}>Daily Updates</Text>
        <Text style={styles.headerSub}>Latest news and announcements</Text>
      </View>

      {isLoading && !refreshing && items.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id || Math.random())}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderNewsItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Icon name="newspaper-variant-outline" size={64} color="#1E2329" />
              <Text style={styles.emptyTitle}>No Updates Yet</Text>
              <Text style={styles.emptyText}>You're all caught up! Check back later for news.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  
  header: { paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#12161A', borderBottomWidth: 1, borderBottomColor: '#1E2329' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E2329', alignItems: 'center', justifyContent: 'center' },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 215, 0, 0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)' },
  markAllText: { fontSize: 12, color: COLORS.gold, fontWeight: '700' },
  headerTitle: { fontSize: 24, color: COLORS.white, fontWeight: '800', letterSpacing: 0.5 },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },

  listContent: { padding: 16, paddingBottom: 40 },
  
  newsCard: { backgroundColor: '#12161A', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#1E2329' },
  newsCardUnread: { borderColor: 'rgba(255, 215, 0, 0.45)', backgroundColor: '#161B21' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  newsTitle: { fontSize: 15, color: '#E0E0E0', fontWeight: '700', marginLeft: 8, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold },
  
  newsBody: { fontSize: 13, color: '#888', lineHeight: 20, marginBottom: 12 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1E2329' },
  newsDate: { fontSize: 11, color: '#666', fontWeight: '500' },
  
  readMoreBtn: { flexDirection: 'row', alignItems: 'center' },
  readMoreText: { fontSize: 12, color: COLORS.gold, fontWeight: '700', marginRight: 2 },
  
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, color: COLORS.white, fontWeight: '700', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center' }
});
