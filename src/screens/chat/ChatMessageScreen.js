import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { fetchMessages, sendMessage, fetchStickers } from '../../store/chatSlice';
import { formatRelativeTime } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';

export const ChatMessageScreen = ({ route }) => {
  const { roomSlug, roomName } = route.params;
  const dispatch = useDispatch();
  const { messages, stickers } = useSelector(s => s.chat);
  const { user } = useSelector(s => s.auth);
  const [text, setText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const flatListRef = useRef();
  const roomMessages = messages[roomSlug] || [];

  useEffect(() => { 
    dispatch(fetchMessages({ roomSlug, page: 1 })); 
    dispatch(fetchStickers());
  }, [dispatch, roomSlug]);

  const handleSendText = () => {
    if (!text.trim()) return;
    triggerHaptic('light');
    dispatch(sendMessage({ roomSlug, data: { message: text.trim(), type: 'text' } }));
    setText('');
  };

  const handleSendSticker = (sticker) => {
    triggerHaptic('light');
    dispatch(sendMessage({ 
      roomSlug, 
      data: { type: 'sticker', sticker_id: sticker.id, sticker_emoji: sticker.emoji } 
    }));
    setShowStickers(false);
  };

  const toggleStickers = () => {
    triggerHaptic('light');
    if (!showStickers) {
      Keyboard.dismiss();
    }
    setShowStickers(!showStickers);
  };

  const renderMessage = ({ item }) => {
    const isMe = String(item.user_id) === String(user?.id) || String(item.user?.id) === String(user?.id);
    
    return (
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        {!isMe && <Text style={styles.senderName}>{item.user?.name || 'User'}</Text>}
        {item.type === 'sticker' ? (
          <Text style={styles.stickerEmoji}>{item.sticker_emoji || '🔥'}</Text>
        ) : (
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.message || item.filtered_message}</Text>
        )}
        <Text style={[styles.time, isMe && styles.timeMe]}>{formatRelativeTime(item.created_at)}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={[...roomMessages].reverse()}
        keyExtractor={(item) => String(item.id || Math.random())}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        inverted
      />
      
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.stickerBtn} onPress={toggleStickers}>
          <Icon name={showStickers ? "keyboard-outline" : "sticker-emoji"} size={24} color={COLORS.gold} />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          onFocus={() => setShowStickers(false)}
          placeholder="Type your message..."
          placeholderTextColor="#666"
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} 
          onPress={handleSendText} 
          disabled={!text.trim()}
        >
          <Icon name="send" size={20} color={!text.trim() ? '#666' : '#0B0E11'} />
        </TouchableOpacity>
      </View>

      {/* Sticker Tray */}
      {showStickers && (
        <View style={styles.stickerTray}>
          {stickers && stickers.length > 0 ? (
            <FlatList
              data={stickers}
              keyExtractor={(s) => String(s.id)}
              numColumns={4}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.stickerItem} onPress={() => handleSendSticker(item)}>
                  <Text style={styles.stickerItemEmoji}>{item.emoji || '😎'}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.noStickers}>No stickers available</Text>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  list: { padding: 16, paddingBottom: 10 },
  
  bubble: { maxWidth: '80%', marginBottom: 12, padding: 12, borderRadius: 16 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: COLORS.gold, borderBottomRightRadius: 4 },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: '#12161A', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#1E2329' },
  
  senderName: { fontSize: 12, color: COLORS.gold, fontWeight: '700', marginBottom: 4 },
  messageText: { fontSize: 15, color: COLORS.white, lineHeight: 22 },
  messageTextMe: { color: '#0B0E11', fontWeight: '500' },
  stickerEmoji: { fontSize: 44 },
  
  time: { fontSize: 11, color: COLORS.grey, marginTop: 4, alignSelf: 'flex-end' },
  timeMe: { color: 'rgba(0,0,0,0.6)' },
  
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#12161A', borderTopWidth: 1, borderTopColor: '#1E2329', gap: 10 },
  stickerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0B0E11', alignItems: 'center', justifyContent: 'center' },
  
  textInput: { flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: '#0B0E11', borderRadius: 22, borderWidth: 1, borderColor: '#1E2329', paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: COLORS.white },
  
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#1E2329' },

  stickerTray: {
    height: 250,
    backgroundColor: '#12161A',
    borderTopWidth: 1,
    borderTopColor: '#1E2329',
    padding: 10,
  },
  stickerItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    aspectRatio: 1,
  },
  stickerItemEmoji: {
    fontSize: 40,
  },
  noStickers: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  }
});
