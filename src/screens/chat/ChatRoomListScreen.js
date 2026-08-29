import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { fetchRooms } from '../../store/chatSlice';
import { formatRelativeTime } from '../../utils/formatters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHaptic } from '../../utils/haptics';
import { Skeleton } from '../../components/common/Skeleton';

export const ChatRoomListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { rooms, isLoadingRooms } = useSelector(s => s.chat);
  const [refreshing, setRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => { 
    dispatch(fetchRooms()); 
  }, [dispatch]);

  const onRefresh = async () => { 
    setRefreshing(true); 
    triggerHaptic('light');
    await dispatch(fetchRooms()); 
    setRefreshing(false); 
  };

  // Helper to dynamically assign colors and icons based on room name
  const getRoomStyle = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('vip')) return { icon: 'crown', color: COLORS.gold, bg: 'rgba(255, 215, 0, 0.15)' };
    if (lowerName.includes('analysis') || lowerName.includes('market')) return { icon: 'chart-box', color: '#2196F3', bg: 'rgba(33, 150, 243, 0.15)' };
    if (lowerName.includes('help') || lowerName.includes('beginner')) return { icon: 'lifebuoy', color: '#00C853', bg: 'rgba(0, 200, 83, 0.15)' };
    return { icon: 'forum', color: '#B388FF', bg: 'rgba(179, 136, 255, 0.15)' }; // Default
  };

  const renderRoom = ({ item }) => {
    const roomStyle = getRoomStyle(item.name);
    const hasUnread = item.unread_count > 0 || item.name.toLowerCase().includes('vip'); // Faking VIP unread for demo visual

    return (
      <TouchableOpacity 
        style={styles.roomCard} 
        activeOpacity={0.7}
        onPress={() => {
          triggerHaptic('light');
          navigation.navigate('ChatMessages', { roomSlug: item.slug, roomName: item.name });
        }}
      >
        <View style={[styles.avatarBox, { backgroundColor: roomStyle.bg }]}>
          <Icon name={roomStyle.icon} size={28} color={roomStyle.color} />
          {hasUnread && <View style={styles.onlineDot} />}
        </View>
        
        <View style={styles.roomInfo}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomName}>{item.name}</Text>
            {item.last_message && (
              <Text style={[styles.roomTime, hasUnread && { color: COLORS.gold, fontWeight: '700' }]}>
                {formatRelativeTime(item.last_message.created_at)}
              </Text>
            )}
          </View>
          
          <View style={styles.lastMessageRow}>
            <Text style={[styles.lastMessage, hasUnread && { color: COLORS.white, fontWeight: '600' }]} numberOfLines={1}>
              {item.last_message ? item.last_message.message || item.last_message.filtered_message : item.description || 'Join the discussion...'}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread_count || 1}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoadingRooms && !refreshing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Skeleton width={180} height={32} borderRadius={8} />
          <Skeleton width={240} height={16} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
        <View style={{ padding: 16, gap: 16 }}>
          {[1, 2, 3].map(i => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Skeleton width={56} height={56} borderRadius={28} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="50%" height={20} borderRadius={4} />
                <Skeleton width="90%" height={16} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E11" />
      
      {/* Sleek Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.title}>Community Chat</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Connect with experts and other traders</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => triggerHaptic('light')}>
          <Icon name="magnify" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRoom}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="forum-outline" size={64} color="#1E2329" />
            <Text style={styles.emptyTitle}>No Chat Rooms</Text>
            <Text style={styles.emptyText}>There are no community rooms available right now.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    paddingHorizontal: 20, 
    paddingBottom: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: '#1E2329',
    backgroundColor: '#0B0E11' 
  },
  title: { fontSize: 26, color: COLORS.white, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { fontSize: 13, color: '#A0A0A0', marginTop: 6 },
  
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 68, 68, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF4444' },
  liveText: { fontSize: 10, color: '#FF4444', fontWeight: '800' },

  searchBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#12161A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1E2329' },

  listContent: { padding: 16, paddingBottom: 40 },
  
  roomCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#12161A', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E2329',
  },
  avatarBox: { 
    width: 56, 
    height: 56, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16,
    position: 'relative'
  },
  onlineDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00C853',
    borderWidth: 2,
    borderColor: '#12161A'
  },
  
  roomInfo: { flex: 1 },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  roomName: { fontSize: 17, color: COLORS.white, fontWeight: '800' },
  roomTime: { fontSize: 12, color: '#888', fontWeight: '500' },
  
  lastMessageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { flex: 1, fontSize: 14, color: '#888', paddingRight: 10 },
  
  unreadBadge: { backgroundColor: COLORS.gold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontSize: 11, color: '#0B0E11', fontWeight: '800' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, color: COLORS.white, fontWeight: '700', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#888', marginTop: 8, textAlign: 'center' }
});
