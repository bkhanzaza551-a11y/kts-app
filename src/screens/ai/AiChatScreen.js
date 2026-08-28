import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, clearMessages } from '../../store/aiChatSlice';

const COLORS = { bg: '#0D0D0D', card: '#1A1A1A', gold: '#D4A843', text: '#FFFFFF', muted: '#888', border: '#2A2A2A', userBg: '#D4A843', aiBg: '#1E1E1E' };

export default function AiChatScreen({ navigation }) {
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector(s => s.aiChat);
  const { token, isLoggedIn } = useSelector(s => s.auth);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || loading) return;
    if (!isLoggedIn || !token) {
      return;
    }
    setInput('');
    dispatch(sendMessage({ message: msg }));
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && <Text style={styles.avatarIcon}>🤖</Text>}
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>{item.content}</Text>
        {isUser && <Text style={styles.avatarIcon}>👤</Text>}
      </View>
    );
  };

  if (!isLoggedIn || !token) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBack}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>KTS AI Assistant</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptyText}>Please login to use KTS AI Assistant</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KTS AI Assistant</Text>
        <TouchableOpacity onPress={() => dispatch(clearMessages())}>
          <Text style={styles.headerAction}>🗑</Text>
        </TouchableOpacity>
      </View>

      {messages.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🤖</Text>
          <Text style={styles.emptyTitle}>KTS AI Assistant</Text>
          <Text style={styles.emptyText}>Ask me about trading signals, MT5 bots, subscriptions, or any trading question!</Text>
          {['What signals are active?', 'Check my subscription status', 'How do MT5 bots work?', 'Explain risk management'].map((q, i) => (
            <TouchableOpacity key={i} style={styles.suggestionBtn} onPress={() => setInput(q)}>
              <Text style={styles.suggestionText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask KTS AI..."
          placeholderTextColor={COLORS.muted}
          multiline
          maxLength={2000}
          editable={!loading}
        />
        <TouchableOpacity style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]} onPress={handleSend} disabled={loading || !input.trim()}>
          {loading ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.sendBtnText}>▶</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerBack: { color: COLORS.gold, fontSize: 16, fontWeight: '600' },
  headerTitle: { color: COLORS.gold, fontSize: 18, fontWeight: '700' },
  headerAction: { fontSize: 20 },
  messageList: { padding: 16, paddingBottom: 8 },
  bubble: { flexDirection: 'row', maxWidth: '82%', marginBottom: 12, borderRadius: 16, padding: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.userBg, borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.aiBg, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  avatarIcon: { fontSize: 16, marginHorizontal: 4, marginTop: 2 },
  bubbleText: { fontSize: 15, lineHeight: 21, flex: 1 },
  userText: { color: '#000' },
  aiText: { color: COLORS.text },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: COLORS.text, fontSize: 15, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { fontSize: 18, color: '#000' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { color: COLORS.gold, fontSize: 22, fontWeight: '700', marginTop: 16 },
  emptyText: { color: COLORS.muted, fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  loginBtn: { backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, marginTop: 16 },
  loginBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  suggestionBtn: { backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, width: '100%' },
  suggestionText: { color: COLORS.gold, fontSize: 14 },
  errorText: { color: '#FF4444', textAlign: 'center', fontSize: 13, marginBottom: 4 },
});
