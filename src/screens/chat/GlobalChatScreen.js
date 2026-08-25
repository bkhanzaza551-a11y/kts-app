import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { formatRelativeTime } from '../../utils/formatters';
import client from '../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const GlobalChatScreen = ({ navigation }) => {
  const { user } = useSelector(s => s.auth);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    client.get('/chat/rooms').then(r => {
      const rooms = r.data.data || [];
      const global = rooms.find(r => r.slug === 'general') || rooms[0];
      if (global) {
        client.get(`/chat/rooms/${global.slug}/messages`).then(res => {
          setMessages(res.data.data?.data || res.data.data || []);
          setLoading(false);
        }).catch(() => setLoading(false));
      } else { setLoading(false); }
    }).catch(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;
    const rooms = await client.get('/chat/rooms').then(r => r.data.data || []);
    const global = rooms.find(r => r.slug === 'general') || rooms[0];
    if (global) {
      const res = await client.post(`/chat/rooms/${global.slug}/messages`, { message: text.trim(), type: 'text' });
      setMessages([...messages, res.data.data || res.data]);
      setText('');
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.user_id === user?.id;
    return (
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        {!isMe && <Text style={styles.sender}>{item.user?.name || 'Unknown'}</Text>}
        <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.message || item.filtered_message}</Text>
        <Text style={[styles.time, isMe && styles.timeMe]}>{formatRelativeTime(item.created_at)}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>💬 Global Chat</Text>
        <Text style={styles.headerSub}>Community conversation</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={loading ? null : <View style={styles.empty}><Text style={styles.emptyText}>No messages yet. Start the conversation!</Text></View>}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.greyDark}
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]} onPress={handleSend} disabled={!text.trim()}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  header: { paddingTop: 50, paddingBottom: 12, paddingHorizontal: SPACING.screen, backgroundColor: COLORS.darkCard, borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.white },
  headerSub: { ...TYPOGRAPHY.body3, color: COLORS.grey, marginTop: 2 },
  list: { padding: SPACING.screen, paddingBottom: 10, flexGrow: 1, justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', marginBottom: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.lg },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: COLORS.gold, borderBottomRightRadius: 4 },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: COLORS.darkCard, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.darkBorder },
  sender: { ...TYPOGRAPHY.caption, color: COLORS.gold, marginBottom: 4 },
  msgText: { ...TYPOGRAPHY.body2, color: COLORS.white },
  msgTextMe: { color: COLORS.black },
  time: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginTop: 4, alignSelf: 'flex-end' },
  timeMe: { color: COLORS.greyDark },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { ...TYPOGRAPHY.body2, color: COLORS.grey },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.md, backgroundColor: COLORS.darkCard, borderTopWidth: 1, borderTopColor: COLORS.darkBorder, gap: SPACING.sm },
  textInput: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: COLORS.darkInput, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.darkBorder, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, ...TYPOGRAPHY.body2, color: COLORS.white },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  sendText: { fontSize: 18, color: COLORS.black },
});
