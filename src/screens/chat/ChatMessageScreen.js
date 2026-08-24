import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { fetchMessages, sendMessage } from '../../store/chatSlice';
import { formatRelativeTime } from '../../utils/formatters';

export const ChatMessageScreen = ({ route }) => {
  const { roomSlug, roomName } = route.params;
  const dispatch = useDispatch();
  const { messages, isLoadingMessages } = useSelector(s => s.chat);
  const { user } = useSelector(s => s.auth);
  const [text, setText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const flatListRef = useRef();
  const roomMessages = messages[roomSlug] || [];

  useEffect(() => { dispatch(fetchMessages({ roomSlug, page: 1 })); }, [roomSlug]);

  const handleSend = () => {
    if (!text.trim()) return;
    dispatch(sendMessage({ roomSlug, data: { message: text.trim(), type: 'text' } }));
    setText('');
  };

  const renderMessage = ({ item }) => {
    const isMe = item.user_id === user?.id;
    return (
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        {!isMe && <Text style={styles.senderName}>{item.user?.name || 'Unknown'}</Text>}
        {item.type === 'sticker' ? (
          <Text style={styles.stickerEmoji}>{item.sticker_emoji || '🎨'}</Text>
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
        data={roomMessages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        inverted={false}
      />
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.stickerBtn} onPress={() => setShowStickers(!showStickers)}>
          <Text style={styles.stickerBtnText}>{showStickers ? '⌨️' : '😊'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.greyDark}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} onPress={handleSend} disabled={!text.trim()}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  list: { padding: SPACING.screen, paddingBottom: 10 },
  bubble: { maxWidth: '78%', marginBottom: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.lg },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: COLORS.gold, borderBottomRightRadius: 4 },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: COLORS.darkCard, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.darkBorder },
  senderName: { ...TYPOGRAPHY.caption, color: COLORS.gold, marginBottom: 4 },
  messageText: { ...TYPOGRAPHY.body2, color: COLORS.white },
  messageTextMe: { color: COLORS.black },
  stickerEmoji: { fontSize: 40 },
  time: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginTop: 4, alignSelf: 'flex-end' },
  timeMe: { color: COLORS.greyDark },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.md, backgroundColor: COLORS.darkCard, borderTopWidth: 1, borderTopColor: COLORS.darkBorder, gap: SPACING.sm },
  stickerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.darkSurface, alignItems: 'center', justifyContent: 'center' },
  stickerBtnText: { fontSize: 20 },
  textInput: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: COLORS.darkInput, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.darkBorder, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, ...TYPOGRAPHY.body2, color: COLORS.white },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { fontSize: 18, color: COLORS.black },
});
