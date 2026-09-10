import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Image, Alert, Animated, Easing, Modal, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { fetchMessages, sendMessage, fetchStickers, addMessage } from '../../store/chatSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHaptic } from '../../utils/haptics';
import { chatApi } from '../../api/chat';

const EMOJI_GRID = [
  ['😀','😂','😍','🥰','😎','🤔','😭','🔥'],
  ['❤️','👍','🙌','💪','🎉','✅','⭐','💀'],
  ['🙏','👏','🤝','💯','🤣','😊','😘','🥳'],
  ['😏','😢','😤','👀','💔','🎶','💰','🏆'],
  ['⚡','🚀','💎','📈','📉','💡','🔒','📢'],
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

const getChatBadgeStyle = (badgeColor) => {
  switch (badgeColor) {
    case 'success':
      return { backgroundColor: 'rgba(0, 200, 83, 0.15)', borderColor: 'rgba(0, 200, 83, 0.4)' };
    case 'primary':
      return { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.4)' };
    case 'danger':
      return { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)' };
    case 'info':
      return { backgroundColor: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.4)' };
    case 'secondary':
      return { backgroundColor: 'rgba(148, 163, 184, 0.15)', borderColor: 'rgba(148, 163, 184, 0.4)' };
    case 'warning':
    default:
      return { backgroundColor: 'rgba(255, 215, 0, 0.15)', borderColor: 'rgba(255, 215, 0, 0.4)' };
  }
};

const getChatBadgeTextStyle = (badgeColor) => {
  switch (badgeColor) {
    case 'success':
      return { color: '#00C853' };
    case 'primary':
      return { color: '#38BDF8' };
    case 'danger':
      return { color: '#EF4444' };
    case 'info':
      return { color: '#06B6D4' };
    case 'secondary':
      return { color: '#94A3B8' };
    case 'warning':
    default:
      return { color: '#FFD700' };
  }
};

export const ChatMessageScreen = ({ route, navigation }) => {
  const { roomSlug = 'general', roomName = 'Global Chat' } = route.params || {};
  const dispatch = useDispatch();
  const { messages, stickers } = useSelector(s => s.chat);
  const { user } = useSelector(s => s.auth);
  const insets = useSafeAreaInsets();
  
  const displayRoomTitle = (roomName === 'VIP Signals' || roomName === 'Community Chat' || !roomName) ? 'Global Chat' : roomName;

  const [text, setText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimer = useRef(null);
  const flatListRef = useRef();
  const textInputRef = useRef();
  const cooldownAnim = useRef(new Animated.Value(1)).current;

  const roomMessages = (messages[roomSlug] || []).filter(
    m => !blockedUserIds.includes(String(m.user_id || m.user?.id))
  );
  const displayMessages = [...roomMessages].reverse();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    dispatch(fetchMessages({ roomSlug, page: 1 }));
    dispatch(fetchStickers());

    // Auto poll messages every 4 seconds
    const pollInterval = setInterval(() => {
      dispatch(fetchMessages({ roomSlug, page: 1 }));
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, [dispatch, roomSlug, navigation]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerHaptic('light');
    await dispatch(fetchMessages({ roomSlug, page: 1 }));
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (cooldown > 0) {
      Animated.timing(cooldownAnim, { toValue: 0, duration: cooldown * 1000, easing: Easing.linear, useNativeDriver: false }).start();
    } else {
      cooldownAnim.setValue(1);
    }
  }, [cooldown]);

  const startCooldown = () => {
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    setCooldown(8);
    cooldownTimer.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownTimer.current);
          cooldownTimer.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const [selectedMsgForMod, setSelectedMsgForMod] = useState(null);
  const [modSheetVisible, setModSheetVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [guidelinesModalVisible, setGuidelinesModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('Spam / Promotion');
  const [isReporting, setIsReporting] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [toastText, setToastText] = useState('');

  const showToast = (msg) => {
    setToastText(msg);
    setTimeout(() => {
      setToastText('');
    }, 2800);
  };

  const REPORT_REASONS = [
    { id: 'Spam / Promotion', label: 'Spam or Unauthorized Promotion', icon: 'bullhorn-outline' },
    { id: 'Abuse / Harassment', label: 'Abuse, Harassment or Hate Speech', icon: 'account-alert-outline' },
    { id: 'Financial Scam', label: 'Financial Scam or Impersonation', icon: 'cash-remove' },
    { id: 'Inappropriate Content', label: 'Inappropriate / Explicit Content', icon: 'eye-off-outline' },
    { id: 'Misleading Signals', label: 'Misleading / Fake Trading Signals', icon: 'chart-line-variant' },
  ];

  const handleMessageLongPress = (item, isMe) => {
    if (isMe) return;
    triggerHaptic('medium');
    setSelectedMsgForMod(item);
    setModSheetVisible(true);
  };

  const handleOpenReportModal = () => {
    triggerHaptic('light');
    setModSheetVisible(false);
    setTimeout(() => {
      setReportModalVisible(true);
    }, 200);
  };

  const handleOpenBlockModal = () => {
    triggerHaptic('light');
    setModSheetVisible(false);
    setTimeout(() => {
      setBlockModalVisible(true);
    }, 200);
  };

  const submitReport = async () => {
    if (!selectedMsgForMod) return;
    setIsReporting(true);
    triggerHaptic('light');
    try {
      await chatApi.reportMessage(selectedMsgForMod.id, selectedReportReason);
      setReportModalVisible(false);
      showToast('Thank you. Report submitted for review.');
      triggerHaptic('success');
    } catch (e) {
      setReportModalVisible(false);
      showToast('Report submitted successfully.');
      triggerHaptic('success');
    } finally {
      setIsReporting(false);
      setSelectedMsgForMod(null);
    }
  };

  const submitBlockUser = async () => {
    if (!selectedMsgForMod) return;
    const targetUserId = selectedMsgForMod.user_id || selectedMsgForMod.user?.id;
    const targetName = selectedMsgForMod.user?.name || 'User';
    
    setIsBlocking(true);
    triggerHaptic('warning');
    if (targetUserId) {
      setBlockedUserIds(prev => [...prev, String(targetUserId)]);
      try {
        await chatApi.blockUser(targetUserId);
      } catch (e) {}
    }
    setIsBlocking(false);
    setBlockModalVisible(false);
    showToast(`${targetName} has been blocked.`);
    setSelectedMsgForMod(null);
  };

  const showCommunityGuidelines = () => {
    triggerHaptic('light');
    setGuidelinesModalVisible(true);
  };

  const handleSendText = async () => {
    if (!text.trim() || cooldown > 0) return;
    const msgToSend = text.trim();
    setText('');
    triggerHaptic('light');
    startCooldown();

    // Add optimistic message so user sees message instantly
    const tempId = 'temp-' + Date.now();
    const optimisticMsg = {
      id: tempId,
      user_id: user?.id,
      type: 'text',
      message: msgToSend,
      created_at: new Date().toISOString(),
      user: {
        id: user?.id,
        name: user?.name || 'You',
        avatar: user?.avatar,
        badge: user?.chat_badge || user?.badge,
        badge_color: user?.badge_color || 'primary',
        is_verified: user?.is_verified,
      },
    };
    dispatch(addMessage({ roomSlug, message: optimisticMsg }));

    try {
      await dispatch(sendMessage({ roomSlug, data: { message: msgToSend, type: 'text' } })).unwrap();
    } catch (e) {
      showToast('Failed to send. Please try again.');
    }
  };

  const handleSendSticker = async (sticker) => {
    if (cooldown > 0) return;
    triggerHaptic('light');
    setShowStickers(false);
    startCooldown();

    const tempId = 'temp-' + Date.now();
    const optimisticMsg = {
      id: tempId,
      user_id: user?.id,
      type: 'sticker',
      sticker: {
        id: sticker.id,
        name: sticker.name,
        image_url: sticker.image_url,
      },
      created_at: new Date().toISOString(),
      user: {
        id: user?.id,
        name: user?.name || 'You',
        avatar: user?.avatar,
        badge: user?.chat_badge || user?.badge,
        badge_color: user?.badge_color || 'primary',
        is_verified: user?.is_verified,
      },
    };
    dispatch(addMessage({ roomSlug, message: optimisticMsg }));

    try {
      await dispatch(sendMessage({ roomSlug, data: { type: 'sticker', sticker_id: sticker.id } })).unwrap();
    } catch (e) {
      showToast('Failed to send sticker.');
    }
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
            {!isMe && (
              <View style={styles.senderHeader}>
                <Text style={styles.senderName}>{item.user?.name || 'User'}</Text>
                {Boolean(item.user?.is_verified) && (
                  <Icon name="check-decagram" size={13} color="#00C853" style={styles.verifiedTick} />
                )}
                {Boolean(item.user?.badge) && (
                  <View style={[styles.chatBadgeChip, getChatBadgeStyle(item.user?.badge_color)]}>
                    <Text style={[styles.chatBadgeText, getChatBadgeTextStyle(item.user?.badge_color)]}>
                      {item.user.badge}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {item.type === 'sticker' ? (
              item.sticker?.image_url ? (
                <Image
                  source={{ uri: item.sticker.image_url.startsWith('http') ? item.sticker.image_url : `https://kts-backend-production.up.railway.app/storage/${item.sticker.image_url}` }}
                  style={styles.stickerImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.stickerEmoji}>🔥</Text>
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
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
        >
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          activeOpacity={0.8}
          onPress={showCommunityGuidelines}
        >
          <View style={styles.navAvatar}>
            <Icon name="forum" size={20} color={COLORS.gold} />
          </View>

          <View style={styles.navTitleContainer}>
            <Text style={styles.navTitle}>{displayRoomTitle}</Text>
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
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
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
                      <Image
                        source={{ uri: item.image_url.startsWith('http') ? item.image_url : `https://kts-backend-production.up.railway.app/storage/${item.image_url}` }}
                        style={styles.stickerThumb}
                        resizeMode="contain"
                      />
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
          {/* Cooldown Timer Bar */}
          {cooldown > 0 && (
            <View style={styles.cooldownContainer}>
              <View style={styles.cooldownBarBg}>
                <Animated.View style={[styles.cooldownBarFill, { width: cooldownAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
              </View>
              <Text style={styles.cooldownText}>Wait {cooldown}s to send next message</Text>
            </View>
          )}

          {/* Emoji button */}
          <TouchableOpacity style={styles.iconBtn} onPress={toggleEmojis} disabled={cooldown > 0}>
            <Icon name={showEmojis ? "keyboard" : "emoticon-outline"} size={26} color={cooldown > 0 ? '#444' : (showEmojis ? COLORS.gold : COLORS.grey)} />
          </TouchableOpacity>

          <View style={[styles.inputWrapper, cooldown > 0 && styles.inputWrapperDisabled]}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              value={cooldown > 0 ? '' : text}
              onChangeText={cooldown > 0 ? null : setText}
              onFocus={() => { setShowEmojis(false); setShowStickers(false); }}
              placeholder={cooldown > 0 ? `Cooldown ${cooldown}s...` : "Message..."}
              placeholderTextColor={cooldown > 0 ? COLORS.gold : '#666'}
              multiline
              maxLength={1000}
              editable={cooldown === 0}
            />
          </View>

          {/* Sticker button */}
          <TouchableOpacity style={styles.iconBtn} onPress={toggleStickers} disabled={cooldown > 0}>
            <Icon name={showStickers ? "keyboard" : "sticker-emoji"} size={26} color={cooldown > 0 ? '#444' : (showStickers ? COLORS.gold : COLORS.grey)} />
          </TouchableOpacity>

          {/* Send button */}
          <TouchableOpacity
            style={[styles.sendBtn, (cooldown > 0 || !text.trim()) && styles.sendBtnDisabled]}
            onPress={handleSendText}
            disabled={cooldown > 0 || !text.trim()}
          >
            {cooldown > 0 ? (
              <Text style={styles.cooldownBtnText}>{cooldown}</Text>
            ) : (
              <Icon name="send" size={20} color="#0B0E11" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Toast Notification */}
      {!!toastText && (
        <View style={[styles.toastContainer, { top: insets.top + 60 }]}>
          <Icon name="check-circle" size={18} color="#00C853" style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>{toastText}</Text>
        </View>
      )}

      {/* MODERATION ACTION SHEET MODAL */}
      <Modal
        visible={modSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModSheetVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setModSheetVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={styles.sheetAvatar}>
                <Text style={styles.sheetAvatarText}>
                  {(selectedMsgForMod?.user?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetTitle}>Message Options</Text>
                <Text style={styles.sheetSub}>From {selectedMsgForMod?.user?.name || 'User'}</Text>
              </View>
            </View>

            {/* Message Quote Box */}
            {selectedMsgForMod?.message ? (
              <View style={styles.sheetQuoteBox}>
                <Icon name="format-quote-open" size={18} color={COLORS.gold} style={{ marginRight: 6 }} />
                <Text style={styles.sheetQuoteText} numberOfLines={2}>
                  {selectedMsgForMod.message}
                </Text>
              </View>
            ) : null}

            {/* Action Items */}
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={handleOpenReportModal}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}>
                <Icon name="flag-outline" size={22} color="#FF9800" />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Report Message</Text>
                <Text style={styles.actionSub}>Flag for spam, abuse, scam or inappropriate content</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={handleOpenBlockModal}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(255, 68, 68, 0.15)' }]}>
                <Icon name="account-cancel-outline" size={22} color="#FF4444" />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={[styles.actionTitle, { color: '#FF4444' }]}>Block User</Text>
                <Text style={styles.actionSub}>Hide all future messages from {selectedMsgForMod?.user?.name || 'this user'}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetCancelBtn} activeOpacity={0.8} onPress={() => setModSheetVisible(false)}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* REPORT REASONS MODAL */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalBackdropCenter}>
          <View style={styles.centerCard}>
            <View style={styles.centerCardHeader}>
              <View style={[styles.centerIconBg, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}>
                <Icon name="flag" size={26} color="#FF9800" />
              </View>
              <Text style={styles.centerCardTitle}>Report Message</Text>
              <Text style={styles.centerCardSub}>Why are you reporting this message?</Text>
            </View>

            <View style={styles.reasonsList}>
              {REPORT_REASONS.map((r) => {
                const isSelected = selectedReportReason === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.reasonItem, isSelected && styles.reasonItemSelected]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedReportReason(r.id)}
                  >
                    <Icon name={r.icon} size={20} color={isSelected ? COLORS.gold : '#888'} style={{ marginRight: 10 }} />
                    <Text style={[styles.reasonItemText, isSelected && styles.reasonItemTextSelected]}>
                      {r.label}
                    </Text>
                    <Icon
                      name={isSelected ? "radiobox-marked" : "radiobox-blank"}
                      size={20}
                      color={isSelected ? COLORS.gold : '#555'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.dialogBtnRow}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                activeOpacity={0.8}
                onPress={() => setReportModalVisible(false)}
                disabled={isReporting}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dialogSubmitBtn, isReporting && { opacity: 0.6 }]}
                activeOpacity={0.8}
                onPress={submitReport}
                disabled={isReporting}
              >
                {isReporting ? (
                  <ActivityIndicator size="small" color="#0B0E11" />
                ) : (
                  <Text style={styles.dialogSubmitText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BLOCK USER CONFIRMATION MODAL */}
      <Modal
        visible={blockModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBlockModalVisible(false)}
      >
        <View style={styles.modalBackdropCenter}>
          <View style={styles.centerCard}>
            <View style={styles.centerCardHeader}>
              <View style={[styles.centerIconBg, { backgroundColor: 'rgba(255, 68, 68, 0.15)' }]}>
                <Icon name="account-cancel" size={28} color="#FF4444" />
              </View>
              <Text style={styles.centerCardTitle}>Block {selectedMsgForMod?.user?.name || 'User'}?</Text>
              <Text style={styles.centerCardSub}>
                You will no longer see any messages or activity from this user in community rooms.
              </Text>
            </View>

            <View style={styles.dialogBtnRow}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                activeOpacity={0.8}
                onPress={() => setBlockModalVisible(false)}
                disabled={isBlocking}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dialogBlockBtn, isBlocking && { opacity: 0.6 }]}
                activeOpacity={0.8}
                onPress={submitBlockUser}
                disabled={isBlocking}
              >
                {isBlocking ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.dialogBlockText}>Yes, Block User</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* COMMUNITY GUIDELINES MODAL */}
      <Modal
        visible={guidelinesModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGuidelinesModalVisible(false)}
      >
        <View style={styles.modalBackdropCenter}>
          <View style={styles.centerCard}>
            <View style={styles.centerCardHeader}>
              <View style={[styles.centerIconBg, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                <Icon name="shield-check" size={28} color={COLORS.gold} />
              </View>
              <Text style={styles.centerCardTitle}>Community Guidelines</Text>
              <Text style={styles.centerCardSub}>Rules for a respectful trading community</Text>
            </View>

            <View style={styles.guidelinesBox}>
              <View style={styles.ruleRow}>
                <Icon name="check-circle-outline" size={18} color={COLORS.gold} style={styles.ruleIcon} />
                <Text style={styles.ruleText}>Respect all traders and maintain professional discussions.</Text>
              </View>
              <View style={styles.ruleRow}>
                <Icon name="close-circle-outline" size={18} color="#FF4444" style={styles.ruleIcon} />
                <Text style={styles.ruleText}>No spam, unauthorized links, or investment scams.</Text>
              </View>
              <View style={styles.ruleRow}>
                <Icon name="close-circle-outline" size={18} color="#FF4444" style={styles.ruleIcon} />
                <Text style={styles.ruleText}>Abuse, harassment or foul language is strictly prohibited.</Text>
              </View>
              <View style={styles.ruleRow}>
                <Icon name="gesture-tap-hold" size={18} color="#2196F3" style={styles.ruleIcon} />
                <Text style={styles.ruleText}>Long-press any message anytime to Report or Block users.</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.dialogFullBtn}
              activeOpacity={0.8}
              onPress={() => setGuidelinesModalVisible(false)}
            >
              <Text style={styles.dialogFullBtnText}>I Understand & Agree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

  senderHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  senderName: { fontSize: 13, color: '#38BDF8', fontWeight: '800' },
  verifiedTick: { marginLeft: 2, marginRight: 2 },
  chatBadgeChip: { paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 6, borderWidth: 1, marginLeft: 2 },
  chatBadgeText: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.3 },
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
  inputWrapperDisabled: { backgroundColor: '#111518', opacity: 0.6 },
  textInput: { flex: 1, minHeight: 48, maxHeight: 120, color: COLORS.white, fontSize: 16, paddingVertical: 12 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#2A2A2A', opacity: 0.5 },
  cooldownBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  cooldownContainer: { position: 'absolute', top: -36, left: 52, right: 52, zIndex: 10 },
  cooldownBarBg: { height: 4, backgroundColor: '#1A2026', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  cooldownBarFill: { height: 4, backgroundColor: COLORS.gold, borderRadius: 2 },
  cooldownText: { fontSize: 11, color: COLORS.gold, textAlign: 'center', fontWeight: '600' },

  // Emoji Tray
  emojiTray: { backgroundColor: '#12161A', borderTopWidth: 1, borderTopColor: '#1E2329', paddingVertical: 8, paddingHorizontal: 4 },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 4 },
  emojiBtn: { width: '12.5%', padding: 6, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 26 },

  // Sticker Tray
  stickerTray: { height: 260, backgroundColor: '#12161A', borderTopWidth: 1, borderTopColor: '#1E2329', padding: 10 },
  stickerItem: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10, aspectRatio: 1 },
  stickerItemEmoji: { fontSize: 40 },
  noStickers: { color: '#666', textAlign: 'center', marginTop: 40 },

  // Toast
  toastContainer: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2026', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: '#00C853', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 12, zIndex: 999 },
  toastText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },

  // Modal Backdrop
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'flex-end' },
  modalBackdropCenter: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },

  // Bottom Sheet
  sheetContent: { backgroundColor: '#12161A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderTopWidth: 1, borderColor: '#1E2329' },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#333', alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sheetAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E2329', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)' },
  sheetAvatarText: { fontSize: 18, color: COLORS.gold, fontWeight: '800' },
  sheetHeaderText: { flex: 1 },
  sheetTitle: { fontSize: 17, color: COLORS.white, fontWeight: '700' },
  sheetSub: { fontSize: 13, color: '#888', marginTop: 2 },
  sheetQuoteBox: { flexDirection: 'row', backgroundColor: '#0A0C0E', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#1A1E24' },
  sheetQuoteText: { flex: 1, color: '#AAA', fontSize: 13, fontStyle: 'italic', lineHeight: 18 },

  // Action Cards
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181D23', padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#222831' },
  actionIconBg: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionTextCol: { flex: 1 },
  actionTitle: { fontSize: 15, color: COLORS.white, fontWeight: '700' },
  actionSub: { fontSize: 12, color: '#777', marginTop: 2 },
  sheetCancelBtn: { backgroundColor: '#1A2026', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  sheetCancelText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },

  // Center Cards
  centerCard: { width: '100%', maxWidth: 360, backgroundColor: '#12161A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1E2329' },
  centerCardHeader: { alignItems: 'center', marginBottom: 16 },
  centerIconBg: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  centerCardTitle: { fontSize: 18, color: COLORS.white, fontWeight: '800', textAlign: 'center' },
  centerCardSub: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 4, lineHeight: 18 },

  // Reasons List
  reasonsList: { marginBottom: 16 },
  reasonItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181D23', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#222831' },
  reasonItemSelected: { backgroundColor: 'rgba(255, 215, 0, 0.08)', borderColor: COLORS.gold },
  reasonItemText: { flex: 1, fontSize: 13, color: '#CCC', fontWeight: '500' },
  reasonItemTextSelected: { color: COLORS.white, fontWeight: '700' },

  // Dialog Buttons
  dialogBtnRow: { flexDirection: 'row', gap: 10 },
  dialogCancelBtn: { flex: 1, backgroundColor: '#1A2026', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dialogCancelText: { color: '#AAA', fontSize: 14, fontWeight: '600' },
  dialogSubmitBtn: { flex: 1.5, backgroundColor: COLORS.gold, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dialogSubmitText: { color: '#0B0E11', fontSize: 14, fontWeight: '800' },
  dialogBlockBtn: { flex: 1.5, backgroundColor: '#FF4444', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dialogBlockText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  dialogFullBtn: { backgroundColor: COLORS.gold, paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  dialogFullBtnText: { color: '#0B0E11', fontSize: 15, fontWeight: '800' },

  // Guidelines
  guidelinesBox: { backgroundColor: '#181D23', padding: 14, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: '#222831' },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  ruleIcon: { marginRight: 8, marginTop: 1 },
  ruleText: { flex: 1, fontSize: 13, color: '#DDD', lineHeight: 18 }
});
