import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { fetchRooms } from '../../store/chatSlice';
import { formatRelativeTime } from '../../utils/formatters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHaptic } from '../../utils/haptics';
import { AnimatedScreen } from '../../components/common/AnimatedScreen';

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

  const getRoomStyle = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('vip')) return { icon: 'crown', color: COLORS.gold, bg: 'rgba(255, 215, 0, 0.1)' };
    if (lowerName.includes('analysis') || lowerName.includes('market')) return { icon: 'chart-box', color: '#2196F3', bg: 'rgba(33, 150, 243, 0.1)' };
    if (lowerName.includes('help') || lowerName.includes('beginner')) return { icon: 'lifebuoy', color: '#00C853', bg: 'rgba(0, 200, 83, 0.1)' };
    return { icon: 'forum', color: '#B388FF', bg: 'rgba(179, 136, 255, 0.1)' };
  };

  const renderRoom = ({ item }) => {
    const roomStyle = getRoomStyle(item.name);
    const hasUnread = item.unread_count > 0 || item.name.toLowerCase().includes('vip'); 

    return (
      <TouchableOpacity 
        style={styles.roomRow} 
        activeOpacity={0.7}
        onPress={() => {
          triggerHaptic('light');
          navigation.navigate('ChatMessages', { roomSlug: item.slug, roomName: item.name });
        }}
      >
        <View style={[styles.avatarCircle, { backgroundColor: roomStyle.bg }]}>
          <Icon name={roomStyle.icon} size={24} color={roomStyle.color} />
        </View>
        
        <View style={styles.roomContent}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomName}>{item.name}</Text>
            {item.last_message && (
              <Text style={[styles.timeText, hasUnread && { color: COLORS.gold, fontWeight: '700' }]}>
                {formatRelativeTime(item.last_message.created_at)}
              </Text>
            )}
          </View>
          
          <View style={styles.messagePreviewRow}>
            <Text style={[styles.messagePreview, hasUnread && { color: '#FFF' }]} numberOfLines={1}>
              {item.last_message ? item.last_message.message : item.description}
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

  return (
    <AnimatedScreen style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080A0C" />
      
      {/* Premium Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.headerTitle}>Chats</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Community & Expert Rooms</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={() => triggerHaptic('light')}>
          <Icon name="magnify" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRoom}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="forum-outline" size={64} color="#1E2329" />
            <Text style={styles.emptyTitle}>No Chats Available</Text>
            <Text style={styles.emptyText}>Community rooms will appear here.</Text>
          </View>
        }
      />
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080A0C' },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#12161A',
    backgroundColor: '#080A0C' 
  },
  headerTitle: { fontSize: 28, color: COLORS.white, fontWeight: '800', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 13, color: '#8A939E', marginTop: 4 },
  
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 68, 68, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4, borderWidth: 1, borderColor: 'rgba(255,68,68,0.2)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF4444' },
  liveText: { fontSize: 9, color: '#FF4444', fontWeight: '800', letterSpacing: 1 },

  searchBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#13171B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1E2329' },

  listContainer: { paddingVertical: 8, paddingBottom: 40 },
  
  roomRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 20, 
    backgroundColor: '#080A0C'
  },
  avatarCircle: { 
    width: 54, 
    height: 54, 
    borderRadius: 27, // Perfect circle
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#1A1E24'
  },
  
  roomContent: { 
    flex: 1, 
    borderBottomWidth: 1, 
    borderBottomColor: '#12161A', 
    paddingBottom: 16, 
    justifyContent: 'center' 
  },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  roomName: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
  timeText: { fontSize: 12, color: '#8A939E', fontWeight: '500' },
  
  messagePreviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messagePreview: { flex: 1, fontSize: 14, color: '#8A939E', paddingRight: 12 },
  
  unreadBadge: { backgroundColor: COLORS.gold, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { fontSize: 11, color: '#0B0E11', fontWeight: '800' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 18, color: COLORS.white, fontWeight: '700', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#8A939E', marginTop: 8, textAlign: 'center' }
});

