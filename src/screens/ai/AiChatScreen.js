import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { sendMessage, clearMessages, loadChatHistory } from '../../store/aiChatSlice';

const COLORS = { 
  bg: '#0B0E11', 
  card: '#12161A', 
  gold: '#FFD700', 
  text: '#FFFFFF', 
  muted: '#A0A0A0', 
  border: '#1E2329', 
  userBg: '#FFD700', 
  aiBg: '#1E2329' 
};

const TypingIndicator = () => {
  const anim1 = useRef(new Animated.Value(0.3)).current;
  const anim2 = useRef(new Animated.Value(0.3)).current;
  const anim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (anim, delay) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ]);
    };
    Animated.loop(Animated.parallel([pulse(anim1, 0), pulse(anim2, 200), pulse(anim3, 400)])).start();
  }, []);

  return (
    <View style={styles.typingContainer}>
       <Animated.View style={[styles.dot, { opacity: anim1 }]} />
       <Animated.View style={[styles.dot, { opacity: anim2 }]} />
       <Animated.View style={[styles.dot, { opacity: anim3 }]} />
    </View>
  );
};

export default function AiChatScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);
  const dispatch = useDispatch();
  
  const { messages, loading, error } = useSelector(s => s.aiChat);
  const { token, isLoggedIn } = useSelector(s => s.auth);

  useEffect(() => {
    if (isLoggedIn && token) {
      dispatch(loadChatHistory());
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (messages.length > 0 || loading) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages, loading]);

  const handleSend = (textOverride = null) => {
    const msg = typeof textOverride === 'string' ? textOverride.trim() : input.trim();
    if (!msg || loading) return;
    
    if (!isLoggedIn || !token) {
      alert("Please login first to use AI");
      return;
    }
    
    setInput('');
    dispatch(sendMessage({ message: msg }));
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.msgRight : styles.msgLeft]}>
        {!isUser && (
          <View style={styles.avatarAI}>
            <Icon name="robot-outline" size={16} color="#FFD700" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>{item.content}</Text>
        </View>
        {isUser && (
          <View style={styles.avatarUser}>
            <Icon name="account" size={16} color="#0B0E11" />
          </View>
        )}
      </View>
    );
  };

  if (!isLoggedIn || !token) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <View style={styles.iconBtn} />
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="lock-outline" size={64} color="#FFD700" style={{ marginBottom: 20 }} />
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptyText}>Please login to access the KTS Intelligence Bot</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('More', { screen: 'MoreHome' })}>
            <Text style={styles.loginBtnText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.aiBadge}>
             <Icon name="robot-excited" size={18} color="#FFD700" />
          </View>
          <View>
            <Text style={styles.headerTitle}>KTS Intelligence</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online - Powered by AI</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => dispatch(clearMessages())} style={styles.iconBtn}>
          <Icon name="trash-can-outline" size={22} color="#FF4444" />
        </TouchableOpacity>
      </View>

      {/* Main Chat Area */}
      <View style={styles.chatArea}>
        {messages.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <View style={styles.welcomeRobot}>
               <Icon name="robot-outline" size={50} color="#FFD700" />
            </View>
            <Text style={styles.emptyTitle}>How can I help you?</Text>
            <Text style={styles.emptyText}>I am your personal AI trading assistant. Ask me anything about the markets, our bots, or VIP signals!</Text>
            
            <View style={styles.chipsContainer}>
              {['What signals are active?', 'How do MT5 bots work?', 'Explain risk management'].map((q, i) => (
                <TouchableOpacity key={i} style={styles.chip} onPress={() => handleSend(q)}>
                  <Icon name="lightning-bolt" size={14} color="#FFD700" />
                  <Text style={styles.chipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />
      </View>

      {/* Input Area */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 15 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#888"
            multiline
            maxLength={1000}
            editable={!loading}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]} 
            onPress={() => handleSend()} 
            disabled={loading || !input.trim()}
          >
            <Icon name="send" size={18} color="#0B0E11" />
          </TouchableOpacity>
        </View>
      </View>
      
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 12, backgroundColor: '#12161A', borderBottomWidth: 1, borderColor: COLORS.border },
  iconBtn: { padding: 10 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 5 },
  aiBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,215,0,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00C853', marginRight: 4 },
  statusText: { color: COLORS.muted, fontSize: 11, fontWeight: '500' },

  chatArea: { flex: 1 },
  messageList: { padding: 16, paddingBottom: 10 },
  
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  msgLeft: { justifyContent: 'flex-start' },
  msgRight: { justifyContent: 'flex-end' },
  
  avatarAI: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1E2329', alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: '#2A2E35' },
  avatarUser: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  
  bubble: { maxWidth: '75%', paddingHorizontal: 16, paddingVertical: 12 },
  userBubble: { backgroundColor: COLORS.gold, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#1E2329', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomRightRadius: 16, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#2A2E35' },
  
  bubbleText: { fontSize: 14, lineHeight: 22 },
  userText: { color: '#0B0E11', fontWeight: '500' },
  aiText: { color: '#EAEAEA' },
  
  typingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#1E2329', alignSelf: 'flex-start', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomRightRadius: 16, borderBottomLeftRadius: 4, marginLeft: 36, marginBottom: 16, borderWidth: 1, borderColor: '#2A2E35' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A0A0A0', marginRight: 4 },
  
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, marginTop: 40 },
  welcomeRobot: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,215,0,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.1)' },
  emptyTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 10 },
  emptyText: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginBottom: 30, lineHeight: 20, paddingHorizontal: 10 },
  
  chipsContainer: { width: '100%', alignItems: 'stretch', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12161A', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  chipText: { color: '#EAEAEA', fontSize: 13, fontWeight: '500' },
  
  inputContainer: { backgroundColor: '#12161A', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderColor: COLORS.border },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#0B0E11', borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, paddingLeft: 16, paddingRight: 6, paddingVertical: 6 },
  input: { flex: 1, color: '#FFF', fontSize: 14, maxHeight: 100, minHeight: 36, paddingTop: Platform.OS === 'ios' ? 10 : 6, paddingBottom: Platform.OS === 'ios' ? 10 : 6 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', marginLeft: 10, marginBottom: 2 },
  sendBtnDisabled: { opacity: 0.3, backgroundColor: '#A0A0A0' },
  
  errorText: { color: '#FF4444', textAlign: 'center', fontSize: 12, marginVertical: 8, paddingHorizontal: 16 },
  
  loginBtn: { backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 24, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#0B0E11', fontSize: 15, fontWeight: '800' }
});
