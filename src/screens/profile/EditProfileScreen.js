import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../../api/client';
import { triggerHaptic } from '../../utils/haptics';

export const EditProfileScreen = ({ navigation }) => {
  const { user } = useSelector(s => s.auth);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [demoAccountId, setDemoAccountId] = useState('');
  const [demoAccountEmail, setDemoAccountEmail] = useState('');
  const [realAccountId, setRealAccountId] = useState('');
  const [realAccountEmail, setRealAccountEmail] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await client.get('/profile');
      const u = res.data.data.user;
      setName(u.name || '');
      setPhone(u.phone || '');
      setDemoAccountId(u.demo_account_id || '');
      setDemoAccountEmail(u.demo_account_email || '');
      setRealAccountId(u.real_account_id || '');
      setRealAccountEmail(u.real_account_email || '');
    } catch (e) {
      console.log('Error loading profile');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setSaving(true);
    triggerHaptic('light');
    try {
      await client.put('/profile', {
        name: name.trim(),
        phone: phone.trim(),
        demo_account_id: demoAccountId.trim(),
        demo_account_email: demoAccountEmail.trim(),
        real_account_id: realAccountId.trim(),
        real_account_email: realAccountEmail.trim(),
      });

      triggerHaptic('success');
      Alert.alert('Success', 'Profile completed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      triggerHaptic('heavy');
      Alert.alert('Error', e.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.navbar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Complete Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Info Banner for Demo Accounts */}
        <View style={styles.infoBanner}>
          <Icon name="information" size={24} color="#2196F3" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.bannerTitle}>Why add a Demo Account?</Text>
            <Text style={styles.bannerText}>Linking a Demo Account is strictly required to test our MT5 AI Bots risk-free. Your bot demo requests will be securely routed to this MT5 demo account.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Details</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" placeholderTextColor="#666" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+1 234 567 890" placeholderTextColor="#666" keyboardType="phone-pad" />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="robot-outline" size={22} color={COLORS.gold} />
            <Text style={styles.cardTitleLine}>Demo MT5 Account (For Bot Testing)</Text>
          </View>
          
          <View style={styles.field}>
            <Text style={styles.label}>Demo Account Number</Text>
            <TextInput style={styles.input} value={demoAccountId} onChangeText={setDemoAccountId} placeholder="e.g. 10023456" placeholderTextColor="#666" keyboardType="numeric" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Demo Account Email</Text>
            <TextInput style={styles.input} value={demoAccountEmail} onChangeText={setDemoAccountEmail} placeholder="Email linked to broker" placeholderTextColor="#666" keyboardType="email-address" autoCapitalize="none" />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="shield-check" size={22} color="#00C853" />
            <Text style={styles.cardTitleLine}>Real MT5 Account (For Live Trading)</Text>
          </View>
          
          <View style={styles.field}>
            <Text style={styles.label}>Real Account Number</Text>
            <TextInput style={styles.input} value={realAccountId} onChangeText={setRealAccountId} placeholder="e.g. 50023456" placeholderTextColor="#666" keyboardType="numeric" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Real Account Email</Text>
            <TextInput style={styles.input} value={realAccountEmail} onChangeText={setRealAccountEmail} placeholder="Email linked to broker" placeholderTextColor="#666" keyboardType="email-address" autoCapitalize="none" />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color="#0B0E11" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#12161A', borderBottomWidth: 1, borderBottomColor: '#1E2329' },
  navTitle: { fontSize: 18, color: COLORS.white, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  
  infoBanner: { flexDirection: 'row', backgroundColor: 'rgba(33, 150, 243, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(33, 150, 243, 0.3)', marginBottom: 20 },
  bannerTitle: { fontSize: 15, color: '#2196F3', fontWeight: '700', marginBottom: 4 },
  bannerText: { fontSize: 13, color: '#A0A0A0', lineHeight: 20 },

  card: { backgroundColor: '#12161A', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1E2329' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  cardTitle: { fontSize: 16, color: COLORS.white, fontWeight: '700', marginBottom: 16 },
  cardTitleLine: { fontSize: 16, color: COLORS.white, fontWeight: '700' },

  field: { marginBottom: 16 },
  label: { fontSize: 12, color: COLORS.grey, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: '#0B0E11', borderRadius: 12, borderWidth: 1, borderColor: '#1E2329', paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.white },

  saveBtn: { backgroundColor: COLORS.gold, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveBtnText: { fontSize: 16, color: '#0B0E11', fontWeight: '800' }
});
