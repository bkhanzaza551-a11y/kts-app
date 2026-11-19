import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
  fetchNotifications, 
  fetchUnreadCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../../store/notificationSlice';
import { formatRelativeTime } from '../../utils/formatters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHaptic } from '../../utils/haptics';

const TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'SIGNALS', label: 'Signals' },
  { id: 'BOTS', label: 'MT5 Bots' },
  { id: 'SYSTEM', label: 'System' },
];

export const NotificationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items = [], isLoading, unreadCount } = useSelector((s) => s.notifications);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
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

  // Helper to categorize and format notification display
  const parseNotificationMeta = (item) => {
    const rawTitle = item.title || 'Notification';
    const rawBody = item.body || '';
    const combined = `${rawTitle} ${rawBody}`.toLowerCase();

    // Clean duplicate leading emojis from title
    const cleanTitle = rawTitle.replace(/^[\s\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}❌✅‼️⚠️🔔]+/gu, '').trim() || rawTitle;

    let category = 'SYSTEM';
    let icon = 'bell-outline';
    let iconColor = '#848E9C';
    let badgeText = 'SYSTEM';
    let badgeColor = '#848E9C';
    let badgeBg = 'rgba(132, 142, 156, 0.12)';

    if (combined.includes('win') || combined.includes('tp hit') || combined.includes('take profit')) {
      category = 'SIGNALS';
      icon = 'trending-up';
      iconColor = '#0ECB81';
      badgeText = 'WIN';
      badgeColor = '#0ECB81';
      badgeBg = 'rgba(14, 203, 129, 0.15)';
    } else if (combined.includes('loss') || combined.includes('sl hit') || combined.includes('stop loss')) {
      category = 'SIGNALS';
      icon = 'trending-down';
      iconColor = '#F6465D';
      badgeText = 'LOSS';
      badgeColor = '#F6465D';
      badgeBg = 'rgba(246, 70, 93, 0.15)';
    } else if (combined.includes('signal') || combined.includes('buy') || combined.includes('sell')) {
      category = 'SIGNALS';
      icon = 'chart-timeline-variant';
      iconColor = '#F0B90B';
      badgeText = 'SIGNAL';
      badgeColor = '#F0B90B';
      badgeBg = 'rgba(240, 185, 11, 0.15)';
    } else if (combined.includes('bot') || combined.includes('ea') || combined.includes('mt5')) {
      category = 'BOTS';
      icon = 'robot';
      iconColor = '#3B82F6';
      badgeText = 'MT5 BOT';
      badgeColor = '#3B82F6';
      badgeBg = 'rgba(59, 130, 246, 0.15)';
    } else if (item.type === 'warning' || combined.includes('alert') || combined.includes('warning')) {
      category = 'SYSTEM';
      icon = 'alert-circle-outline';
      iconColor = '#FF9800';
      badgeText = 'ALERT';
      badgeColor = '#FF9800';
      badgeBg = 'rgba(255, 152, 0, 0.15)';
    }

    return { cleanTitle, category, icon, iconColor, badgeText, badgeColor, badgeBg };
  };

  const filteredItems = useMemo(() => {
    if (activeTab === 'ALL') return items;
    return items.filter(item => {
      const { category } = parseNotificationMeta(item);
      return category === activeTab;
    });
  }, [items, activeTab]);

  const renderItem = ({ item }) => {
    const isUnread = !item.is_read;
    const { cleanTitle, icon, iconColor, badgeText, badgeColor, badgeBg } = parseNotificationMeta(item);

    return (
      <TouchableOpacity 
        style={[styles.card, isUnread && styles.cardUnread]} 
        activeOpacity={0.72}
        onPress={() => handlePressItem(item)}
      >
        {isUnread && <View style={styles.unreadAccentBar} />}

        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
              <Icon name={icon} size={13} color={badgeColor} style={{ marginRight: 4 }} />
              <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
            </View>
            <Text style={styles.cardTime}>
              {formatRelativeTime(item.created_at)}
            </Text>
          </View>

          {isUnread && (
            <View style={styles.unreadIndicator}>
              <View style={styles.unreadDot} />
              <Text style={styles.unreadLabel}>NEW</Text>
            </View>
          )}
        </View>

        <Text 
          style={[styles.cardTitle, isUnread && styles.cardTitleUnread]} 
          numberOfLines={1}
        >
          {cleanTitle}
        </Text>
        
        <Text style={styles.cardBody} numberOfLines={2}>
          {item.body}
        </Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.footerActionText}>View details</Text>
          <Icon name="arrow-right" size={14} color="#848E9C" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E11" />
      
      {/* Sleek Top Navigation Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBarRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="chevron-left" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.topBarTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          {hasUnread ? (
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={handleMarkAllRead}
              activeOpacity={0.7}
            >
              <Icon name="check-all" size={16} color="#F0B90B" style={{ marginRight: 3 }} />
              <Text style={styles.markAllText}>Mark read</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyHeaderSpacer} />
          )}
        </View>

        {/* Filter Category Tabs */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveTab(tab.id);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content Area */}
      {isLoading && !refreshing && items.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F0B90B" />
          <Text style={styles.loadingText}>Fetching updates...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id || Math.random())}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor="#F0B90B" 
              colors={['#F0B90B']}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon name="bell-sleep-outline" size={38} color="#474D57" />
              </View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'ALL' 
                  ? "You're all caught up! New trade signals and updates will appear here." 
                  : `No ${TABS.find(t => t.id === activeTab)?.label} notifications yet.`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E11',
  },

  // Top Bar & Header
  topBar: {
    backgroundColor: '#12161A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2329',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    marginBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E2329',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EAECEF',
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: '#F0B90B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B0E11',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 185, 11, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(240, 185, 11, 0.25)',
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F0B90B',
  },
  emptyHeaderSpacer: {
    width: 36,
  },

  // Category Tabs
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#181A20',
    borderWidth: 1,
    borderColor: '#262930',
  },
  tabButtonActive: {
    backgroundColor: '#262930',
    borderColor: '#F0B90B',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#848E9C',
  },
  tabLabelActive: {
    color: '#F0B90B',
    fontWeight: '700',
  },

  // List & Cards
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#12161A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E2329',
    position: 'relative',
    overflow: 'hidden',
  },
  cardUnread: {
    backgroundColor: '#151A21',
    borderColor: '#2B313A',
  },
  unreadAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#F0B90B',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingLeft: 4,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTime: {
    fontSize: 11,
    color: '#5E6673',
    fontWeight: '500',
  },
  unreadIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 185, 11, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0B90B',
    marginRight: 4,
  },
  unreadLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F0B90B',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B7BDC6',
    marginBottom: 4,
    paddingLeft: 4,
  },
  cardTitleUnread: {
    color: '#EAECEF',
    fontWeight: '700',
  },
  cardBody: {
    fontSize: 13,
    color: '#717A87',
    lineHeight: 18,
    marginBottom: 10,
    paddingLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#181C22',
  },
  footerActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#848E9C',
    marginRight: 4,
  },

  // Empty & Loading States
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 13,
    color: '#848E9C',
    marginTop: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#14181F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E2329',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EAECEF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#848E9C',
    textAlign: 'center',
    lineHeight: 19,
  },
});
