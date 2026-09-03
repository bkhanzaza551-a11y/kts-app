import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { sendSupportMessage, loadSupportMessages } from '../../store/supportChatSlice';
import client from '../../api/client';

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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const flatListRef = useRef(null);
  const pollRef = useRef(null);
  const dispatch = useDispatch();

  const { messages, loading, sending, ticketId } = useSelector((s) => s.supportChat);
  const { ticketId: routeTicketId } = route.params || {};

  const currentTicketId = ticketId || routeTicketId;

  useEffect(() => {
    if (currentTicketId) {
      dispatch(loadSupportMessages(currentTicketId));
    }
  }, [currentTicketId]);

  // Real-time polling - every 10 seconds
  useEffect(() => {
    if (currentTicketId) {
      pollRef.current = setInterval(() => {
        dispatch(loadSupportMessages(currentTicketId));
      }, 10000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [currentTicketId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [messages.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (currentTicketId) {
      await dispatch(loadSupportMessages(currentTicketId));
    }
    setRefreshing(false);
  }, [currentTicketId]);

  const handlePickFile = () => {
    launchImageLibrary({ mediaType: 'mixed', quality: 0.8, maxWidth: 1200, maxHeight: 1200 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to pick file');
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedFile(response.assets[0]);
      }
    });
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || !currentTicketId) return;

    const formData = new FormData();
    formData.append('message', input.trim() || (selectedFile ? 'Sent an attachment' : ''));

    if (selectedFile) {
      const file = {
        uri: selectedFile.uri,
        type: selectedFile.type || 'image/jpeg',
        name: selectedFile.fileName || 'attachment.jpg',
      };
      formData.append('attachment', file);
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append('message', input.trim() || (selectedFile ? 'Sent an attachment' : ''));
      if (selectedFile) {
        formDataObj.append('attachment', {
          uri: selectedFile.uri,
          type: selectedFile.type || 'image/jpeg',
          name: selectedFile.fileName || 'attachment.jpg',
        });
      }
      await client.post(`/support/tickets/${currentTicketId}/reply`, formDataObj);
      setSelectedFile(null);
      setInput('');
      dispatch(loadSupportMessages(currentTicketId));
    } catch (err) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user' || item.user_id;
    const isSystem = item.is_system;
    const hasAttachment = item.attachment;

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.supportRow]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.supportBubble,
          isSystem && styles.autoBubble,
        ]}>
          {isSystem && (
            <View style={styles.autoBadge}>
              <Icon name="robot-outline" size={12} color={COLORS.gold} />
              <Text style={styles.autoBadgeText}>KTS Bot</Text>
            </View>
          )}
          <Text style={[styles.messageText, isUser ? styles.userText : styles.supportText]}>
            {item.message}
          </Text>
          {hasAttachment && (
            <View style={styles.attachmentContainer}>
              {(typeof hasAttachment === 'string' ? hasAttachment : hasAttachment?.url || '').match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <Image
                  source={{ uri: `https://kts-backend-production.up.railway.app/storage/${typeof hasAttachment === 'string' ? hasAttachment : hasAttachment?.url || ''}` }}
                  style={styles.attachmentImage}
                  resizeMode="cover"
                />
              ) : (
                <TouchableOpacity
                  style={styles.fileAttachment}
                  onPress={() => {/* open file */}}
                >
                  <Icon name="file-document-outline" size={20} color={COLORS.gold} />
                  <Text style={styles.fileName}>{(typeof hasAttachment === 'string' ? hasAttachment : hasAttachment?.url || '').split('/').pop()}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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

      {/* Selected File Preview */}
      {selectedFile && (
        <View style={styles.filePreview}>
          <View style={styles.filePreviewContent}>
            <Icon name="image-outline" size={20} color={COLORS.gold} />
            <Text style={styles.filePreviewText} numberOfLines={1}>
              {selectedFile.fileName || 'Attachment'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedFile(null)}>
            <Icon name="close-circle" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => String(item.id || `msg-${index}`)}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
        />
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.attachBtn} onPress={handlePickFile}>
          <Icon name="paperclip" size={22} color={COLORS.muted} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor={COLORS.muted}
          multiline
          maxLength={5000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, ((!input.trim() && !selectedFile) || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={(!input.trim() && !selectedFile) || sending}
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
  attachmentContainer: { marginTop: 8 },
  attachmentImage: { width: 200, height: 150, borderRadius: 8 },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  fileName: { color: COLORS.text, fontSize: 12 },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filePreviewContent: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  filePreviewText: { color: COLORS.text, fontSize: 13, flex: 1 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  attachBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
