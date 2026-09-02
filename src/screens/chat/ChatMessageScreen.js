import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Image, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { fetchMessages, sendMessage, fetchStickers } from '../../store/chatSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHaptic } from '../../utils/haptics';
import { chatApi } from '../../api/chat';

const EMOJI_GRID = [
  ['😀','😂','😍','🥰','😎','🤔','😭','🔥','❤️','👍','🙌','💪','🎉','✅','⭐','💀'],
  ['🙏','👏','🤝','💯','🤣','😊','😘','🥳','😏','😢','😤','👀','💔','🎶','💰','🏆'],
  ['⚡','🚀','💎','📈','📉','💡','🔒','📢','🚨','⏰','📱','💻','🌍','🕌','📌','🎯'],
];

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

const getDateHeader = (dateString) => {
  if (!dateString) return 'Today';
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const ChatMessageScreen = ({ route, navigation }) => {
  const { roomSlug, roomName } = route.params;
  const dispatch = useDispatch();
  const { messages, stickers } = useSelector(s => s.chat);
  const { user } = useSelector(s => s.auth);
  const insets = useSafeAreaInsets();

  const [text, setText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const flatListRef = useRef();
  const textInputRef = useRef();

  const roomMessages = (messages[roomSlug] || []).filter(
    m => !blockedUserIds.includes(String(m.user_id || m.user?.id))
  );
  const displayMessages = [...roomMessages].reverse();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    dispatch(fetchMessages({ roomSlug, page: 1 }));
    dispatch(fetchStickers());
  }, [dispatch, roomSlug, navigation]);

  const handleMessageLongPress = (item, isMe) => {
    triggerHaptic('medium');
    const senderName = item.user?.name || 'User';

    if (isMe) {
      return;
    }

    Alert.alert(
      `Message from ${senderName}`,
      "Community moderation options:",
      [
        {
          text: "🚩 Report Message",
          onPress: () => promptReportReason(item),
        },
        {
          text: "🚫 Block User",
          style: "destructive",
          onPress: () => confirmBlockUser(item),
        },
        {
          text: "Cancel",
          style: "cancel",
        }
      ]
    );
  };

  const promptReportReason = (item) => {
    Alert.alert(
      "Report Message",
      "Please select a reason for reporting:",
      [
        { text: "Spam / Promotion", onPress: () => submitReport(item.id, "Spam / Promotion") },
        { text: "Abuse / Harassment", onPress: () => submitReport(item.id, "Abuse / Harassment") },
        { text: "Financial Scam / Fraud", onPress: () => submitReport(item.id, "Financial Scam") },
        { text: "Inappropriate Content", onPress: () => submitReport(item.id, "Inappropriate Content") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const submitReport = async (messageId, reason) => {
    try {
      await chatApi.reportMessage(messageId, reason);
      Alert.alert("Report Submitted", "Thank you. Our moderation team will review this message.");
    } catch (e) {
      Alert.alert("Report Submitted", "Thank you. Your report has been recorded.");
    }
  };

  const confirmBlockUser = (item) => {
    const targetUserId = item.user_id || item.user?.id;
    const targetName = item.user?.name || 'User';

    Alert.alert(
      `Block ${targetName}?`,
      `You will no longer see any messages from ${targetName}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Block User",
          style: "destructive",
          onPress: async () => {
            if (targetUserId) {
              setBlockedUserIds(prev => [...prev, String(targetUserId)]);
              try {
                await chatApi.blockUser(targetUserId);
              } catch (e) {}
              Alert.alert("User Blocked", `${targetName} has been blocked.`);
            }
          }
        }
      ]
    );
  };

  const showCommunityGuidelines = () => {
    Alert.alert(
      "Community Guidelines",
      "1. Respect all traders and community members.\n2. No unauthorized links, advertising, or financial scams.\n3. Abusive or harassing content is strictly prohibited.\n4. Long-press any message to Report or Block users.",
      [{ text: "Got it", style: "default" }]
    );
  };

  const handleSendText = () => {
    if (!text.trim()) return;
    triggerHaptic('light');
    dispatch(sendMessage({ roomSlug, data: { message: text.trim(), type: 'text' } }));
    setText('');
  };

  const handleSendSticker = (sticker) => {
    triggerHaptic('light');
    dispatch(sendMessage({ roomSlug, data: { type: 'sticker', sticker_id: sticker.id } }));
    setShowStickers(false);
  };

  const toggleStickers = () => {
    triggerHaptic('light');
    if (!showStickers) Keyboard.dismiss();
    setShowStickers(!showStickers);
    setShowEmojis(false);
  };

  const toggleEmojis = () => {
    triggerHaptic('light');
    if (!showEmojis) Keyboard.dismiss();
    setShowEmojis(!showEmojis);
    setShowStickers(false);
  };

  const insertEmoji = (emoji) => {
    setText(prev => prev + emoji);
  };

  const renderMessage = ({ item, index }) => {
    const isMe = String(item.user_id) === String(user?.id) || String(item.user?.id) === String(user?.id);

    const olderMessage = displayMessages[index + 1];
    const showDateHeader = !olderMessage || !isSameDay(item.created_at, olderMessage.created_at);

    const newerMessage = displayMessages[index - 1];
    const isLastInGroup = !newerMessage || String(newerMessage.user_id) !== String(item.user_id) || !isSameDay(item.created_at, newerMessage.created_at);

    return (
      <View>
        {showDateHeader && (
          <View style={styles.dateHeaderContainer}>
            <Text style={styles.dateHeaderText}>{getDateHeader(item.created_at)}</Text>
          </View>
        )}

        <View style={[styles.bubbleWrapper, isMe ? styles.wrapperMe : styles.wrapperThem]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onLongPress={() => handleMessageLongPress(item, isMe)}
            delayLongPress={350}
            style={[
              styles.bubble,
              isMe ? styles.bubbleMe : styles.bubbleThem,
              isLastInGroup && isMe && styles.bubbleMeTail,
              isLastInGroup && !isMe && styles.bubbleThemTail,
            ]}
          >
            {!isMe && <Text style={styles.senderName}>{item.user?.name || 'User'}</Text>}

            {item.type === 'sticker' ? (
              item.sticker?.image_url ? (
                <Image source={{ uri: item.sticker.image_url }} style={styles.stickerImage} resizeMode="contain" />
              ) : (
                <Text style={styles.stickerEmoji}>{item.sticker_emoji || '🔥'}</Text>
              )
            ) : (
              <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.message || item.filtered_message}</Text>
            )}

            <View style={styles.timeWrapper}>
              <Text style={[styles.time, isMe && styles.timeMe]}>{formatTime(item.created_at)}</Text>
              {isMe && <Icon name="check-all" size={14} color="#0B0E11" style={{ opacity: 0.6, marginLeft: 2 }} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.navbar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          activeOpacity={0.8}
          onPress={showCommunityGuidelines}
        >
          <View style={styles.navAvatar}>
            <Icon name={roomName.toLowerCase().includes('vip') ? 'crown' : 'forum'} size={20} color={COLORS.white} />
          </View>

          <View style={styles.navTitleContainer}>
            <Text style={styles.navTitle}>{roomName}</Text>
            <Text style={styles.navSubtitle}>tap for community rules</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navIcon} onPress={showCommunityGuidelines}>
          <Icon name="shield-check-outline" size={22} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.chatArea}>
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            keyExtractor={(item) => String(item.id || Math.random())}
            renderItem={renderMessage}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            inverted
          />
        </View>

        {/* Emoji Tray */}
        {showEmojis && (
          <View style={styles.emojiTray}>
            {EMOJI_GRID.map((row, ri) => (
              <View key={ri} style={styles.emojiRow}>
                {row.map((emoji, ei) => (
                  <TouchableOpacity key={ei} style={styles.emojiBtn} onPress={() => insertEmoji(emoji)}>
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}

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
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} style={styles.stickerThumb} resizeMode="contain" />
                    ) : (
                      <Text style={styles.stickerItemEmoji}>🔥</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={styles.noStickers}>No stickers available</Text>
            )}
          </View>
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {/* Emoji button */}
          <TouchableOpacity style={styles.iconBtn} onPress={toggleEmojis}>
            <Icon name={showEmojis ? "keyboard" : "emoticon-outline"} size={26} color={showEmojis ? COLORS.gold : COLORS.grey} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              value={text}
              onChangeText={setText}
              onFocus={() => { setShowEmojis(false); setShowStickers(false); }}
              placeholder="Message..."
              placeholderTextColor="#666"
              multiline
              maxLength={1000}
            />
          </View>

          {/* Sticker button */}
          <TouchableOpacity style={styles.iconBtn} onPress={toggleStickers}>
            <Icon name={showStickers ? "keyboard" : "sticker-emoji"} size={26} color={showStickers ? COLORS.gold : COLORS.grey} />
          </TouchableOpacity>

          {/* Send button */}
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendText}>
            <Icon name="send" size={20} color="#0B0E11" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  keyboardView: { flex: 1 },

  navbar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12161A', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1E2329', zIndex: 10 },
  backBtn: { padding: 12 },
  navAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 215, 0, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  navTitleContainer: { flex: 1 },
  navTitle: { fontSize: 17, color: COLORS.white, fontWeight: '700' },
  navSubtitle: { fontSize: 12, color: '#00C853' },
  navIcon: { padding: 12 },

  chatArea: { flex: 1, backgroundColor: '#06080A' },
  list: { padding: 16, paddingBottom: 8 },

  dateHeaderContainer: { alignItems: 'center', marginVertical: 16 },
  dateHeaderText: { backgroundColor: '#1E2329', color: '#A0A0A0', fontSize: 12, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },

  bubbleWrapper: { flexDirection: 'row', marginBottom: 4 },
  wrapperMe: { justifyContent: 'flex-end' },
  wrapperThem: { justifyContent: 'flex-start' },

  bubble: { maxWidth: '80%', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 16 },
  bubbleMe: { backgroundColor: COLORS.gold, borderTopRightRadius: 16, borderBottomRightRadius: 16 },
  bubbleThem: { backgroundColor: '#1A2026', borderTopLeftRadius: 16, borderBottomLeftRadius: 16, borderWidth: 1, borderColor: '#252B33' },

  bubbleMeTail: { borderBottomRightRadius: 4 },
  bubbleThemTail: { borderBottomLeftRadius: 4 },

  senderName: { fontSize: 13, color: '#2196F3', fontWeight: '800', marginBottom: 2 },
  messageText: { fontSize: 15, color: COLORS.white, lineHeight: 22 },
  messageTextMe: { color: '#0B0E11', fontWeight: '500' },
  stickerEmoji: { fontSize: 48 },
  stickerImage: { width: 120, height: 120 },
  stickerThumb: { width: 60, height: 60 },

  timeWrapper: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 2 },
  time: { fontSize: 10, color: '#888' },
  timeMe: { color: 'rgba(0,0,0,0.5)' },

  // Input Bar
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 8, backgroundColor: '#0B0E11', gap: 6 },
  iconBtn: { padding: 10, paddingBottom: 12 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2026', borderRadius: 24, paddingLeft: 16, paddingRight: 12, minHeight: 48 },
  textInput: { flex: 1, minHeight: 48, maxHeight: 120, color: COLORS.white, fontSize: 16, paddingVertical: 12 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },

  // Emoji Tray
  emojiTray: { backgroundColor: '#12161A', borderTopWidth: 1, borderTopColor: '#1E2329', paddingVertical: 8, paddingHorizontal: 4 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  emojiBtn: { padding: 8, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 28 },

  // Sticker Tray
  stickerTray: { height: 260, backgroundColor: '#12161A', borderTopWidth: 1, borderTopColor: '#1E2329', padding: 10 },
  stickerItem: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10, aspectRatio: 1 },
  stickerItemEmoji: { fontSize: 40 },
  noStickers: { color: '#666', textAlign: 'center', marginTop: 40 },
});
