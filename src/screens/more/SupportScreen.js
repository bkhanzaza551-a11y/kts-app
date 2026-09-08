import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHaptic } from '../../utils/haptics';
import { createSupportTicket } from '../../store/supportChatSlice';

const FAQ_ITEMS = [
  { q: "How do I connect my MT5 account?", a: "Go to the Bots menu, select MT5 Bots, and submit your broker account ID to receive your account-compiled bot file." },
  { q: "What is the recommended balance for the KTS10 Bot?", a: "The minimum recommended balance to run the KTS10 Bot safely is $500, with optimal performance seen above $1000." },
  { q: "How are the Market Signals delivered?", a: "Market Signals are delivered in real-time via instant push notifications and also available in the 'Markets' tab." },
  { q: "How do I reset or change my account password?", a: "You can change your password directly from the Profile section or use 'Forgot Password' on the login screen to receive an email OTP." }
];

export const SupportScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleContact = (type) => {
    triggerHaptic('light');
    if (type === 'whatsapp') Linking.openURL('https://wa.me/447441444444');
    if (type === 'email') Linking.openURL('mailto:support@ktsmarkets.com');
  };

  const handleCreateTicket = async () => {
    triggerHaptic('light');
    setIsCreatingTicket(true);
    try {
      const result = await dispatch(createSupportTicket());
      if (result.meta.requestStatus === 'fulfilled') {
        navigation.navigate('SupportChat', { ticketId: result.payload.id });
      } else {
        Alert.alert('Support Ticket', 'Starting live support chat...');
        navigation.navigate('SupportChat');
      }
    } catch (e) {
      navigation.navigate('SupportChat');
    } finally {
      setIsCreatingTicket(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Contact Methods */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <Text style={styles.sectionSub}>Our support team is available 24/7 to assist you.</Text>
          
          <View style={styles.contactCards}>
            <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('whatsapp')}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
                <Icon name="whatsapp" size={28} color="#25D366" />
              </View>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>Live Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={() => handleContact('email')}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
                <Icon name="email-outline" size={28} color="#2196F3" />
              </View>
              <Text style={styles.contactLabel}>Email Us</Text>
              <Text style={styles.contactValue}>24h Response</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {FAQ_ITEMS.map((item, index) => (
            <View key={index} style={styles.faqCard}>
              <View style={styles.faqQ}>
                <Icon name="help-circle-outline" size={20} color={COLORS.gold} />
                <Text style={styles.faqQText}>{item.q}</Text>
              </View>
              <Text style={styles.faqAText}>{item.a}</Text>
            </View>
          ))}
        </View>

        {/* Submit Ticket */}
        <TouchableOpacity 
          style={styles.ticketBtn} 
          onPress={handleCreateTicket}
          disabled={isCreatingTicket}
        >
          {isCreatingTicket ? (
            <ActivityIndicator size="small" color="#0B0E11" />
          ) : (
            <>
              <Icon name="ticket-confirmation-outline" size={20} color="#0B0E11" />
              <Text style={styles.ticketBtnText}>Open Support Chat</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, backgroundColor: '#12161A', borderBottomWidth: 1, borderBottomColor: '#1E2329' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, color: COLORS.white, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  
  sectionTitle: { fontSize: 18, color: COLORS.white, fontWeight: '800', marginBottom: 6 },
  sectionSub: { fontSize: 13, color: '#A0A0A0', marginBottom: 20 },
  
  contactSection: { marginBottom: 32 },
  contactCards: { flexDirection: 'row', gap: 12 },
  contactCard: { flex: 1, backgroundColor: '#12161A', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1E2329' },
  iconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  contactLabel: { fontSize: 15, color: COLORS.white, fontWeight: '700', marginBottom: 4 },
  contactValue: { fontSize: 12, color: '#888' },

  faqSection: { marginBottom: 32 },
  faqCard: { backgroundColor: '#12161A', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1E2329' },
  faqQ: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  faqQText: { flex: 1, fontSize: 14, color: COLORS.white, fontWeight: '700', lineHeight: 20 },
  faqAText: { fontSize: 13, color: '#888', lineHeight: 20, paddingLeft: 30 },

  ticketBtn: { backgroundColor: COLORS.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, gap: 10 },
  ticketBtnText: { fontSize: 16, color: '#0B0E11', fontWeight: '800' }
});
