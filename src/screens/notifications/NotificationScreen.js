import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { fetchNotifications } from '../../store/notificationSlice';
import {
  fetchNotificationSettings,
  toggleNotificationSetting,
  toggleAllCategory,
} from '../../store/notificationSettingsSlice';
import { formatRelativeTime } from '../../utils/formatters';

const CATEGORY_ICONS = {
  signals: '📊', bots: '🤖', payments: '💳', chat: '💬',
  education: '🎓', system: '⚙️', security: '🔒', demo: '📋',
};

const CATEGORY_NAMES = {
  signals: 'Signals', bots: 'MT5 Bots', payments: 'Payments', chat: 'Chat',
  education: 'Education', system: 'System', security: 'Security', demo: 'Demo Account',
};

const CATEGORY_COLORS = {
  signals: '#D4A843', bots: '#4CAF50', payments: '#2196F3', chat: '#FF9800',
  education: '#9C27B0', system: '#607D8B', security: '#f44336', demo: '#00BCD4',
};

export const NotificationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((s) => s.notifications);
  const { settings, grouped, isLoading: settingsLoading, isToggling } = useSelector((s) => s.notificationSettings);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('notifications');

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchNotificationSettings());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchNotifications()), dispatch(fetchNotificationSettings())]);
    setRefreshing(false);
  }, [dispatch]);

  const handleToggle = useCallback(
    (slug) => {
      dispatch(toggleNotificationSetting(slug));
    },
    [dispatch]
  );

  const handleToggleAll = useCallback(
    (category, isEnabled) => {
      dispatch(toggleAllCategory({ category, isEnabled }));
    },
    [dispatch]
  );

  const TYPE_ICONS = { info: 'ℹ️', warning: '⚠️', success: '✅', error: '❌', signal: '📊' };

  const renderNotification = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.icon}>{TYPE_ICONS[item.type] || '📌'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>{formatRelativeTime(item.created_at)}</Text>
        </View>
      </View>
    </Card>
  );

  const renderSettingCategory = ({ item: category }) => {
    const settingsList = grouped[category] || [];
    const enabledCount = settingsList.filter((s) => s.is_enabled).length;
    const totalCount = settingsList.length;
    const allEnabled = enabledCount === totalCount;
    const noneEnabled = enabledCount === 0;
    const categoryColor = CATEGORY_COLORS[category] || COLORS.gold;

    return (
      <View style={styles.settingCategory}>
        <View style={styles.settingCategoryHeader}>
          <View style={styles.settingCategoryLeft}>
            <View style={[styles.categoryIconWrap, { backgroundColor: categoryColor + '20' }]}>
              <Text style={styles.categoryIconText}>{CATEGORY_ICONS[category] || '📌'}</Text>
            </View>
            <View>
              <Text style={styles.settingCategoryName}>{CATEGORY_NAMES[category] || category}</Text>
              <Text style={styles.settingCategoryCount}>
                {enabledCount} of {totalCount} enabled
              </Text>
            </View>
          </View>
          <View style={styles.categoryActions}>
            {!allEnabled && (
              <TouchableOpacity style={styles.categoryBtn} onPress={() => handleToggleAll(category, true)}>
                <Text style={styles.categoryBtnText}>All</Text>
              </TouchableOpacity>
            )}
            {!noneEnabled && (
              <TouchableOpacity style={[styles.categoryBtn, styles.categoryBtnOff]} onPress={() => handleToggleAll(category, false)}>
                <Text style={[styles.categoryBtnText, styles.categoryBtnTextOff]}>None</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${totalCount > 0 ? (enabledCount / totalCount) * 100 : 0}%`, backgroundColor: categoryColor }]} />
        </View>

        {settingsList.map((setting) => (
          <View key={setting.slug} style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingName, !setting.is_enabled && styles.settingNameDisabled]}>
                {setting.name}
              </Text>
              <Text style={styles.settingDesc} numberOfLines={1}>{setting.description}</Text>
            </View>
            <Switch
              value={setting.is_enabled}
              onValueChange={() => handleToggle(setting.slug)}
              disabled={isToggling === setting.slug}
              trackColor={{ false: '#333', true: categoryColor + '60' }}
              thumbColor={setting.is_enabled ? categoryColor : '#666'}
            />
          </View>
        ))}
      </View>
    );
  };

  const categories = Object.keys(grouped);

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'notifications' && styles.tabActive]} onPress={() => setTab('notifications')}>
          <Text style={[styles.tabText, tab === 'notifications' && styles.tabTextActive]}>Notifications</Text>
          {items.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{items.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'settings' && styles.tabActive]} onPress={() => setTab('settings')}>
          <Text style={[styles.tabText, tab === 'settings' && styles.tabTextActive]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {tab === 'notifications' ? (
        <FlatList
          data={items}
          keyExtractor={(item, i) => String(item.id || i)}
          renderItem={renderNotification}
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState icon="🔔" title="No Notifications" message="You are all caught up!" />
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.gold} />
                <Text style={styles.loadingText}>Loading notifications...</Text>
              </View>
            )
          }
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item}
          renderItem={renderSettingCategory}
          ListEmptyComponent={
            !settingsLoading ? (
              <EmptyState icon="⚙️" title="No Settings" message="Notification settings will appear here" />
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.gold} />
                <Text style={styles.loadingText}>Loading settings...</Text>
              </View>
            )
          }
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.darkCard, borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.gold },
  tabText: { ...TYPOGRAPHY.body2, color: COLORS.grey },
  tabTextActive: { color: COLORS.gold, fontWeight: '600' },
  tabBadge: { backgroundColor: COLORS.gold, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, minWidth: 20, alignItems: 'center' },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.black },
  list: { padding: SPACING.screen, paddingBottom: 40 },
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { ...TYPOGRAPHY.body2, color: COLORS.grey, marginTop: SPACING.md },

  card: { marginBottom: SPACING.md },
  row: { flexDirection: 'row', gap: SPACING.md },
  icon: { fontSize: 20, marginTop: 2 },
  title: { ...TYPOGRAPHY.body1, color: COLORS.white, fontWeight: '600' },
  body: { ...TYPOGRAPHY.body3, color: COLORS.silver, marginTop: 4 },
  time: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginTop: 6 },

  settingCategory: { marginBottom: SPACING.xl },
  settingCategoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  settingCategoryLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  categoryIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  categoryIconText: { fontSize: 16 },
  settingCategoryName: { ...TYPOGRAPHY.h4, color: COLORS.white },
  settingCategoryCount: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginTop: 2 },
  categoryActions: { flexDirection: 'row', gap: 6 },
  categoryBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: COLORS.goldMuted, borderWidth: 1, borderColor: COLORS.gold + '40' },
  categoryBtnOff: { backgroundColor: 'rgba(148, 163, 184, 0.15)', borderColor: 'rgba(148, 163, 184, 0.3)' },
  categoryBtnText: { ...TYPOGRAPHY.caption, color: COLORS.gold, fontWeight: '600', fontSize: 11 },
  categoryBtnTextOff: { color: COLORS.silver },
  progressBarBg: { height: 3, backgroundColor: COLORS.darkBorder, borderRadius: 2, marginBottom: SPACING.md, overflow: 'hidden' },
  progressBarFill: { height: 3, borderRadius: 2 },

  settingItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, backgroundColor: COLORS.darkCard, borderRadius: RADIUS.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.darkBorder,
  },
  settingInfo: { flex: 1, marginRight: SPACING.md },
  settingName: { ...TYPOGRAPHY.body2, color: COLORS.white, fontWeight: '500' },
  settingNameDisabled: { color: COLORS.grey },
  settingDesc: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginTop: 2 },
});
