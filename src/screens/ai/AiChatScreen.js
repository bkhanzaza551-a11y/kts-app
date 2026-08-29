import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { sendMessage, clearChatMessages, loadChatHistory } from '../../store/aiChatSlice';
import { triggerHaptic } from '../../utils/haptics';

const COLORS = { 
  bg: '#080A0C', // Deeper premium black
  card: '#101317', 
  gold: '#FFD700', 
  text: '#FFFFFF', 
  muted: '#8A939E', 
  border: '#1A1E24', 
  userBg: '#FFD700', 
  aiBg: '#13171B',
  glow: 'rgba(255, 215, 0, 0.15)'
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
  const [isFocused, setIsFocused] = useState(false);
  const flatListRef = useRef(null);
  const dispatch = useDispatch();
  
  const { messages, loading, error } = useSelector(s => s.aiChat);
  const { token, isLoggedIn } = useSelector(s => s.auth);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  
  // Chips Stagger Animations
  const chip1 = useRef(new Animated.Value(0)).current;
  const chip2 = useRef(new Animated.Value(0)).current;
  const chip3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoggedIn && token) {
      dispatch(loadChatHistory());
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (messages.length > 0 || loading) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length === 0) {
      // Entrance Animation
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      ]).start();

      // Breathing Orb Animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.08, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();

      // Chips Staggered Entrance
      Animated.stagger(150, [
        Animated.timing(chip1, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(chip2, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(chip3, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  }, [messages.length]);

  const handleSend = (textMsg) => {
    const messageText = typeof textMsg === 'string' ? textMsg : input;
    if (!messageText.trim()) return;
    
    triggerHaptic('light');
    dispatch(sendMessage({ message: messageText }));
    setInput('');
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.msgRight : styles.msgLeft]}>
        {!isUser && (
          <View style={styles.avatarAI}>
            <Icon name="creation" size={14} color="#FFD700" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const suggestions = [
    { text: 'Analyze XAUUSD market trend', anim: chip1, icon: 'chart-line' },
    { text: 'How do MT5 bots execute trades?', anim: chip2, icon: 'robot-outline' },
    { text: 'Explain Risk Management strategies', anim: chip3, icon: 'shield-check-outline' }
  ];

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.aiBadge}>
             <Icon name="creation" size={18} color="#FFD700" />
          </View>
          <View>
            <Text style={styles.headerTitle}>KTS Intelligence</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Advanced Trading Assistant</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => { triggerHaptic('light'); dispatch(clearChatMessages()); }} style={styles.iconBtn}>
          <Icon name="refresh" size={22} color="#A0A0A0" />
        </TouchableOpacity>
      </View>

      {/* Main Chat Area */}
      <View style={styles.chatArea}>
        {messages.length === 0 && !loading && (
          <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            
            {/* Pulsing AI Core */}
            <View style={styles.orbWrapper}>
              <Animated.View style={[styles.orbGlow, { transform: [{ scale: pulseScale }] }]} />
              <View style={styles.orbCore}>
                <Icon name="creation" size={38} color="#FFD700" />
              </View>
            </View>
            
            <Text style={styles.emptyTitle}>How can I assist you?</Text>
            <Text style={styles.emptyText}>I'm equipped with deep market knowledge. Ask about signals, bots, or trading psychology.</Text>
            
            {/* Animated Suggestion Chips */}
            <View style={styles.chipsContainer}>
              {suggestions.map((item, i) => (
                <Animated.View key={i} style={{ opacity: item.anim, transform: [{ translateY: item.anim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }] }}>
                  <TouchableOpacity style={styles.chip} onPress={() => handleSend(item.text)}>
                    <View style={styles.chipIconBox}>
                      <Icon name={item.icon} size={16} color="#FFD700" />
                    </View>
                    <Text style={styles.chipText}>{item.text}</Text>
                    <Icon name="chevron-right" size={16} color="#555" />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
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

      {/* Premium Input Area */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 15 }]}>
        <View style={[styles.inputWrapper, isFocused && styles.inputFocused]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Message KTS Intelligence..."
            placeholderTextColor="#666"
            multiline
            maxLength={1000}
            editable={!loading}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]} 
            onPress={() => handleSend()} 
            disabled={loading || !input.trim()}
          >
            <Icon name="arrow-up" size={18} color="#0B0E11" />
          </TouchableOpacity>
        </View>
      </View>
      
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 14, backgroundColor: '#0B0E11', borderBottomWidth: 1, borderColor: COLORS.border },
  iconBtn: { padding: 8 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 5 },
  aiBadge: { width: 34, height: 34, borderRadius: 12, backgroundColor: 'rgba(255,215,0,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD700', marginRight: 6 },
  statusText: { color: COLORS.muted, fontSize: 11, fontWeight: '600' },

  chatArea: { flex: 1 },
  messageList: { padding: 20, paddingBottom: 10 },
  
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
  msgLeft: { justifyContent: 'flex-start' },
  msgRight: { justifyContent: 'flex-end' },
  
  avatarAI: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#13171B', alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: '#2A2E35' },
  userBubble: { backgroundColor: COLORS.gold, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#13171B', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#1E2329' },
  
  bubble: { maxWidth: '75%', paddingHorizontal: 18, paddingVertical: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  bubbleText: { fontSize: 14, lineHeight: 22 },
  userText: { color: '#0B0E11', fontWeight: '600' },
  aiText: { color: '#EAEAEA' },
  
  typingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#13171B', alignSelf: 'flex-start', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 4, marginLeft: 40, marginBottom: 16, borderWidth: 1, borderColor: '#1E2329' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.gold, marginRight: 5 },
  
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, marginTop: 20 },
  
  orbWrapper: { position: 'relative', width: 100, height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  orbGlow: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.glow },
  orbCore: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#13171B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)', shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
  
  emptyTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 12, letterSpacing: 0.5 },
  emptyText: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginBottom: 36, lineHeight: 22, paddingHorizontal: 16 },
  
  chipsContainer: { width: '100%', gap: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13171B', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E2329' },
  chipIconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,215,0,0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  chipText: { flex: 1, color: '#EAEAEA', fontSize: 14, fontWeight: '500' },
  
  inputContainer: { backgroundColor: '#0B0E11', paddingHorizontal: 16, paddingTop: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#13171B', borderRadius: 24, borderWidth: 1, borderColor: '#1E2329', paddingLeft: 20, paddingRight: 6, paddingVertical: 6 },
  inputFocused: { borderColor: 'rgba(255,215,0,0.4)', backgroundColor: '#161A1F' },
  input: { flex: 1, color: '#FFF', fontSize: 15, maxHeight: 120, minHeight: 38, paddingTop: Platform.OS === 'ios' ? 12 : 8, paddingBottom: Platform.OS === 'ios' ? 12 : 8 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', marginLeft: 10, marginBottom: 2 },
  sendBtnDisabled: { opacity: 0.2, backgroundColor: '#A0A0A0' },
  
  errorText: { color: '#FF4444', textAlign: 'center', fontSize: 12, marginVertical: 8, paddingHorizontal: 16 },
});
