import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { sendSupportMessage, loadSupportMessages } from '../../store/supportChatSlice';

const COLORS = {
  bg: '#080A0C',
  card: '#101317',
  gold: '#D4A843',
  text: '#FFFFFF',
  muted: '#8A939E',
  border: '#1A1E24',
  userBg: '#D4A843',
  supportBg: '#1A2332',
  autoBg: '#1A2332',
};

export default function SupportChatScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);
  const dispatch = useDispatch();

  const { messages, loading, sending, ticketId } = useSelector((s) => s.supportChat);
  const { ticketId: routeTicketId } = route.params || {};

  const currentTicketId = ticketId || routeTicketId;

  useEffect(() => {
    if (currentTicketId) {
      dispatch(loadSupportMessages(currentTicketId));
    }
  }, [currentTicketId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() || !currentTicketId) return;
    dispatch(sendSupportMessage({ ticketId: currentTicketId, message: input.trim() }));
    setInput('');
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user' || item.user_id;
    const isAuto = item.id === 'auto-msg';

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.supportRow]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.supportBubble,
          isAuto && styles.autoBubble,
        ]}>
          {isAuto && (
            <View style={styles.autoBadge}>
              <Icon name="robot-outline" size={12} color={COLORS.gold} />
              <Text style={styles.autoBadgeText}>KTS Bot</Text>
            </View>
          )}
          <Text style={[styles.messageText, isUser ? styles.userText : styles.supportText]}>
            {item.message}
          </Text>
          <Text style={[styles.timeText, isUser ? styles.userTime : styles.supportTime]}>
            {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Support Team</Text>
          <Text style={styles.headerSubtitle}>
            {sending ? 'Sending...' : 'Online'}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => String(item.id || index)}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor={COLORS.muted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Icon name="send" size={20} color="#000" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerInfo: { flex: 1 },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  headerSubtitle: { color: COLORS.muted, fontSize: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: COLORS.muted, marginTop: 10 },
  messagesList: { padding: 12, paddingBottom: 8 },
  messageRow: { marginBottom: 12 },
  userRow: { alignItems: 'flex-end' },
  supportRow: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  userBubble: { backgroundColor: COLORS.userBg, borderBottomRightRadius: 4 },
  supportBubble: { backgroundColor: COLORS.supportBg, borderBottomLeftRadius: 4 },
  autoBubble: { backgroundColor: COLORS.autoBg, borderWidth: 1, borderColor: COLORS.gold + '40' },
  autoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  autoBadgeText: { color: COLORS.gold, fontSize: 10, fontWeight: '600' },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#000' },
  supportText: { color: COLORS.text },
  timeText: { fontSize: 10, marginTop: 4 },
  userTime: { color: '#0008', textAlign: 'right' },
  supportTime: { color: COLORS.muted },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: { opacity: 0.5 },
});
