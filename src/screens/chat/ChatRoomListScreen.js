import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { fetchRooms } from '../../store/chatSlice';
import { formatRelativeTime } from '../../utils/formatters';

export const ChatRoomListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { rooms, isLoadingRooms } = useSelector(s => s.chat);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => { dispatch(fetchRooms()); }, []);

  const onRefresh = async () => { setRefreshing(true); await dispatch(fetchRooms()); setRefreshing(false); };

  const renderRoom = ({ item }) => (
    <TouchableOpacity style={styles.roomCard} onPress={() => navigation.navigate('ChatMessages', { roomSlug: item.slug, roomName: item.name })}>
      <View style={styles.roomAvatar}><Text style={styles.roomEmoji}>💬</Text></View>
      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomName}>{item.name}</Text>
          {item.last_message && <Text style={styles.roomTime}>{formatRelativeTime(item.last_message.created_at)}</Text>}
        </View>
        <Text style={styles.roomDesc} numberOfLines={1}>{item.last_message?.message || item.description || 'No messages yet'}</Text>
      </View>
      {item.unread_count > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread_count}</Text></View>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Rooms</Text>
        <Text style={styles.headerSub}>Global community chat</Text>
      </View>
      <FlatList
        data={rooms}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRoom}
        ListEmptyComponent={!isLoadingRooms ? <EmptyState icon="💬" title="No Rooms" message="No chat rooms available" /> : null}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: SPACING.screen },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.white },
  headerSub: { ...TYPOGRAPHY.body3, color: COLORS.silver, marginTop: 4 },
  list: { paddingHorizontal: SPACING.screen, paddingBottom: 100 },
  roomCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.darkCard, borderRadius: RADIUS.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.darkBorder },
  roomAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.goldMuted, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  roomEmoji: { fontSize: 22 },
  roomInfo: { flex: 1 },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  roomName: { ...TYPOGRAPHY.h4, color: COLORS.white },
  roomTime: { ...TYPOGRAPHY.caption, color: COLORS.grey },
  roomDesc: { ...TYPOGRAPHY.body3, color: COLORS.silver, marginTop: 4 },
  unreadBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontSize: 11, fontWeight: '700', color: COLORS.black },
});
