import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { fetchNotifications } from '../../store/notificationSlice';
import { formatRelativeTime } from '../../utils/formatters';

export const NotificationScreen = () => {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector(s => s.notifications);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => { dispatch(fetchNotifications()); }, []);
  const onRefresh = async () => { setRefreshing(true); await dispatch(fetchNotifications()); setRefreshing(false); };

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

  return (
    <FlatList
      style={styles.container}
      data={items}
      keyExtractor={(item, i) => String(item.id || i)}
      renderItem={renderNotification}
      ListEmptyComponent={!isLoading ? <EmptyState icon="🔔" title="No Notifications" message="You're all caught up!" /> : null}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  list: { padding: SPACING.screen, paddingBottom: 40 },
  card: { marginBottom: SPACING.md },
  row: { flexDirection: 'row', gap: SPACING.md },
  icon: { fontSize: 20, marginTop: 2 },
  title: { ...TYPOGRAPHY.body1, color: COLORS.white, fontWeight: '600' },
  body: { ...TYPOGRAPHY.body3, color: COLORS.silver, marginTop: 4 },
  time: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginTop: 6 },
});
