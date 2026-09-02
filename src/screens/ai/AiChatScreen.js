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
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { sendMessage, clearChatMessages, loadChatHistory, reportMessage } from '../../store/aiChatSlice';
import { triggerHaptic } from '../../utils/haptics';

const COLORS = {
  bg: '#080A0C',
  card: '#101317',
  gold: '#FFD700',
  text: '#FFFFFF',
  muted: '#8A939E',
  border: '#1A1E24',
  userBg: '#FFD700',
  aiBg: '#13171B',
  glow: 'rgba(255, 215, 0, 0.12)',
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
    const loop = Animated.loop(
      Animated.parallel([pulse(anim1, 0), pulse(anim2, 200), pulse(anim3, 400)])
    );
    loop.start();
    return () => loop.stop();
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

  const { messages, loading, error } = useSelector((s) => s.aiChat);
  const { token, isLoggedIn } = useSelector((s) => s.auth);

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
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [messages.length, loading]);

  useEffect(() => {
    if (messages.length === 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.06,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1.0,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      Animated.stagger(120, [
        Animated.timing(chip1, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(chip2, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(chip3, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();

      return () => pulseLoop.stop();
    }
  }, [messages.length]);

  const handleSend = (textMsg) => {
    const messageText = typeof textMsg === 'string' ? textMsg : input;
    if (!messageText.trim()) return;

    triggerHaptic('light');
    dispatch(sendMessage({ message: messageText }));
    setInput('');
  };

  const handleReport = (message) => {
    Alert.alert(
      'Report Message',
      'Why are you reporting this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate Content', onPress: () => submitReport(message, 'inappropriate') },
        { text: 'Misleading Information', onPress: () => submitReport(message, 'misleading') },
        { text: 'Spam', onPress: () => submitReport(message, 'spam') },
        { text: 'Other', onPress: () => submitReport(message, 'other') },
      ]
    );
  };

  const submitReport = (message, reason) => {
    triggerHaptic('light');
    dispatch(reportMessage({ messageId: message.id, reason }));
    Alert.alert('Thank You', 'Your report has been submitted and will be reviewed.');
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user' || item.sender === 'user';
    const messageContent = item.content || item.text || item.message || '';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.msgRight : styles.msgLeft]}>
        {!isUser && (
          <View style={styles.avatarAI}>
            <Icon name="robot-outline" size={16} color="#FFD700" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>
            {messageContent}
          </Text>
          {!isUser && (
            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => handleReport(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="flag-outline" size={13} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const suggestions = [
    { text: 'Analyze XAUUSD market trend', anim: chip1, icon: 'chart-line' },
    { text: 'How do MT5 bots execute trades?', anim: chip2, icon: 'robot-outline' },
    { text: 'Explain Risk Management strategies', anim: chip3, icon: 'shield-check-outline' },
  ];

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Centered Glowing AI Avatar */}
      <View style={styles.orbWrapper}>
        <Animated.View style={[styles.orbGlow, { transform: [{ scale: pulseScale }] }]} />
        <View style={styles.orbCore}>
          <Icon name="robot-outline" size={36} color="#FFD700" />
        </View>
      </View>

      <Text style={styles.emptyTitle}>How can KTS Bot assist you?</Text>
      <Text style={styles.emptyText}>
        I'm equipped with deep market knowledge. Ask about live setups, bots, or trading strategies.
      </Text>

      {/* Suggestion Chips */}
      <View style={styles.chipsContainer}>
        {suggestions.map((item, i) => (
          <Animated.View
            key={i}
            style={{
              opacity: item.anim,
              transform: [
                {
                  translateY: item.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              style={styles.chip}
              onPress={() => handleSend(item.text)}
              activeOpacity={0.75}
            >
              <View style={styles.chipIconBox}>
                <Icon name={item.icon} size={16} color="#FFD700" />
              </View>
              <Text style={styles.chipText}>{item.text}</Text>
              <Icon name="chevron-right" size={16} color="#475569" />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.aiBadge}>
            <Icon name="robot-outline" size={18} color="#FFD700" />
          </View>
          <View>
            <Text style={styles.headerTitle}>KTS Bot</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>AI Trading Assistant</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic('light');
            dispatch(clearChatMessages());
          }}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="refresh" size={20} color="#A0A0A0" />
        </TouchableOpacity>
      </View>

      {/* Compliance Disclaimer Sub-bar */}
      <View style={styles.disclaimerBar}>
        <Icon name="shield-alert-outline" size={13} color="#FFD700" />
        <Text style={styles.disclaimerText}>
          AI insights are for education & analysis only. Not financial advice.
        </Text>
      </View>

      {/* Main Chat Area */}
      <View style={styles.chatArea}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={[
            styles.messageList,
            messages.length === 0 && { flexGrow: 1, justifyContent: 'center' },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />
      </View>

      {/* Input Area */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View
        style={[
          styles.inputContainer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 },
        ]}
      >
        <View style={[styles.inputWrapper, isFocused && styles.inputFocused]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask KTS Bot anything..."
            placeholderTextColor="#64748B"
            multiline
            maxLength={1000}
            editable={!loading}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() || loading) && styles.sendBtnDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={loading || !input.trim()}
            activeOpacity={0.8}
          >
            <Icon name="arrow-up" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#080A0C',
    borderBottomWidth: 1,
    borderColor: '#1E2329',
  },
  iconBtn: {
    padding: 6,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  aiBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C853',
    marginRight: 6,
  },
  statusText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },

  disclaimerBar: {
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1E24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#8A939E',
    fontWeight: '500',
  },

  chatArea: {
    flex: 1,
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },

  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  msgLeft: {
    justifyContent: 'flex-start',
  },
  msgRight: {
    justifyContent: 'flex-end',
  },

  avatarAI: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#13171B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2A2E35',
  },
  userBubble: {
    backgroundColor: '#FFD700',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#13171B',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#1E2329',
  },

  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  userText: {
    color: '#000000',
    fontWeight: '600',
  },
  aiText: {
    color: '#F1F5F9',
  },
  reportBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    padding: 2,
  },

  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#13171B',
    alignSelf: 'flex-start',
    borderRadius: 14,
    marginLeft: 36,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E2329',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
    marginRight: 5,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  orbWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  orbGlow: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  orbCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#13171B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#8A939E',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
    paddingHorizontal: 12,
  },

  chipsContainer: {
    width: '100%',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101418',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2329',
  },
  chipIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  chipText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '500',
  },

  inputContainer: {
    backgroundColor: '#080A0C',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1A1E24',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13171B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E2329',
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 4,
  },
  inputFocused: {
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backgroundColor: '#161A1F',
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    maxHeight: 100,
    minHeight: 36,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    opacity: 0.3,
    backgroundColor: '#475569',
  },

  errorText: {
    color: '#FF4444',
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 4,
    paddingHorizontal: 16,
  },
});

