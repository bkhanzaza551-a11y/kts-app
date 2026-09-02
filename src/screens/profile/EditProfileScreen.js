import React, { useEffect, useState, useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, FlatList, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../../api/client';
import { triggerHaptic } from '../../utils/haptics';

const COUNTRIES = ['United States', 'United Kingdom', 'United Arab Emirates', 'Saudi Arabia', 'Pakistan', 'India', 'Canada', 'Australia', 'Germany', 'France', 'Malaysia', 'Singapore', 'Turkey', 'Qatar', 'Oman', 'Bahrain', 'Kuwait', 'Bangladesh', 'Sri Lanka'];
const CITIES = {
  'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Glasgow', 'Edinburgh', 'Bristol'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Tabuk', 'Abha'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'],
};

export const EditProfileScreen = ({ navigation }) => {
  const { user } = useSelector(s => s.auth);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [demoAccountId, setDemoAccountId] = useState('');
  const [demoAccountEmail, setDemoAccountEmail] = useState('');
  const [realAccountId, setRealAccountId] = useState('');
  const [realAccountEmail, setRealAccountEmail] = useState('');

  const [pickerConfig, setPickerConfig] = useState({ visible: false, type: '', data: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [exnessLink, setExnessLink] = useState('https://www.exness.com/register/');

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    loadProfile();
  }, []);

      const loadProfile = async () => {
      try {
        const insRes = await client.get('/demo-account/instructions');
        if (insRes.data?.data?.referral_link) {
          setExnessLink(insRes.data.data.referral_link);
        }
      } catch (e) {}
    setLoading(true);
    try {
      const res = await client.get('/profile');
      const u = res.data.data.user;
      setName(u.name || '');
      setPhone(u.phone || '');
      setCountry(u.country || '');
      setCity(u.city || '');
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
      Alert.alert('Required', 'Name is required to save your profile.');
      return;
    }

    setSaving(true);
    triggerHaptic('light');
    try {
      await client.put('/profile', {
        name: name.trim(),
        phone: phone.trim(),
        country: country.trim(),
        city: city.trim(),
        demo_account_id: demoAccountId.trim(),
        demo_account_email: demoAccountEmail.trim(),
        real_account_id: realAccountId.trim(),
        real_account_email: realAccountEmail.trim(),
      });

      triggerHaptic('success');
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      triggerHaptic('heavy');
      Alert.alert('Error', e.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const openCountryPicker = () => {
    triggerHaptic('light');
    setSearchQuery('');
    setPickerConfig({ visible: true, type: 'country', data: COUNTRIES });
  };

  const openCityPicker = () => {
    if (!country) {
      Alert.alert('Select Country', 'Please select a country first to view its cities.');
      return;
    }
    triggerHaptic('light');
    setSearchQuery('');
    const cityData = CITIES[country] || ['Capital City', 'Other City 1', 'Other City 2'];
    setPickerConfig({ visible: true, type: 'city', data: cityData });
  };

  const handleSelectOption = (item) => {
    triggerHaptic('light');
    if (pickerConfig.type === 'country') {
      setCountry(item);
      setCity(''); // Reset city when country changes
    } else {
      setCity(item);
    }
    setPickerConfig({ visible: false, type: '', data: [] });
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return pickerConfig.data;
    return pickerConfig.data.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, pickerConfig.data]);

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
        <Text style={styles.navTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Icon name="information" size={24} color="#2196F3" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.bannerTitle}>Why add a Demo Account?</Text>
            <Text style={styles.bannerText}>Linking a Demo Account is strictly required to test our MT5 AI Bots in a virtual demo environment. Your bot demo requests will be securely routed to this MT5 demo account.</Text>
          </View>
        </View>

        {/* Personal Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Details</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="account-outline" size={20} color={COLORS.grey} style={styles.inputIcon} />
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" placeholderTextColor="#555" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="phone-outline" size={20} color={COLORS.grey} style={styles.inputIcon} />
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+1 234 567 890" placeholderTextColor="#555" keyboardType="phone-pad" />
            </View>
          </View>

          <View style={styles.rowFields}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Country</Text>
              <TouchableOpacity style={styles.dropdownBtn} activeOpacity={0.7} onPress={openCountryPicker}>
                <Icon name="map-marker-outline" size={18} color={country ? COLORS.white : COLORS.grey} style={styles.inputIcon} />
                <Text style={[styles.dropdownBtnText, !country && { color: '#555' }]} numberOfLines={1}>
                  {country || 'Select'}
                </Text>
                <Icon name="chevron-down" size={20} color={COLORS.grey} />
              </TouchableOpacity>
            </View>

            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>City</Text>
              <TouchableOpacity style={styles.dropdownBtn} activeOpacity={0.7} onPress={openCityPicker}>
                <Icon name="city-variant-outline" size={18} color={city ? COLORS.white : COLORS.grey} style={styles.inputIcon} />
                <Text style={[styles.dropdownBtnText, !city && { color: '#555' }]} numberOfLines={1}>
                  {city || 'Select'}
                </Text>
                <Icon name="chevron-down" size={20} color={COLORS.grey} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

                  {/* Exness Link CTA */}
          <TouchableOpacity 
            style={styles.exnessBtn} 
            onPress={() => {
              triggerHaptic('light');
              Linking.openURL(exnessLink);
            }}
          >
            <Icon name="link-variant" size={20} color="#0B0E11" />
            <Text style={styles.exnessBtnText}>Create Exness Account (Partner Link)</Text>
          </TouchableOpacity>

          {/* Demo Account */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="robot-outline" size={22} color={COLORS.gold} />
            <Text style={styles.cardTitleLine}>Demo MT5 Account (For Bot Testing)</Text>
          </View>
          
          <View style={styles.field}>
            <Text style={styles.label}>Demo Account Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="pound" size={20} color={COLORS.grey} style={styles.inputIcon} />
              <TextInput style={styles.input} value={demoAccountId} onChangeText={setDemoAccountId} placeholder="e.g. 10023456" placeholderTextColor="#555" keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Demo Account Email</Text>
            <View style={styles.inputWrapper}>
              <Icon name="email-outline" size={20} color={COLORS.grey} style={styles.inputIcon} />
              <TextInput style={styles.input} value={demoAccountEmail} onChangeText={setDemoAccountEmail} placeholder="Email linked to broker" placeholderTextColor="#555" keyboardType="email-address" autoCapitalize="none" />
            </View>
          </View>
        </View>

        {/* Real Account */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="shield-check" size={22} color="#00C853" />
            <Text style={styles.cardTitleLine}>Real MT5 Account (For Live Trading)</Text>
          </View>
          
          <View style={styles.field}>
            <Text style={styles.label}>Real Account Number</Text>
            <View style={styles.inputWrapper}>
              <Icon name="pound" size={20} color={COLORS.grey} style={styles.inputIcon} />
              <TextInput style={styles.input} value={realAccountId} onChangeText={setRealAccountId} placeholder="e.g. 50023456" placeholderTextColor="#555" keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Real Account Email</Text>
            <View style={styles.inputWrapper}>
              <Icon name="email-outline" size={20} color={COLORS.grey} style={styles.inputIcon} />
              <TextInput style={styles.input} value={realAccountEmail} onChangeText={setRealAccountEmail} placeholder="Email linked to broker" placeholderTextColor="#555" keyboardType="email-address" autoCapitalize="none" />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color="#0B0E11" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Sheet Dropdown Modal with Keyboard Support */}
      <Modal visible={pickerConfig.visible} transparent animationType="slide" onRequestClose={() => setPickerConfig({ visible: false, type: '', data: [] })}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalDismissArea} activeOpacity={1} onPress={() => setPickerConfig({ visible: false, type: '', data: [] })} />
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
            
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select {pickerConfig.type === 'country' ? 'Country' : 'City'}</Text>
              <TouchableOpacity onPress={() => setPickerConfig({ visible: false, type: '', data: [] })}>
                <Icon name="close-circle" size={26} color={COLORS.grey} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
              <Icon name="magnify" size={22} color={COLORS.grey} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${pickerConfig.type === 'country' ? 'Country' : 'City'}...`}
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close" size={20} color={COLORS.grey} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredData}
              keyExtractor={(item, idx) => item + idx}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.sheetItem} 
                  activeOpacity={0.7}
                  onPress={() => handleSelectOption(item)}
                >
                  <Text style={[styles.sheetItemText, (pickerConfig.type === 'country' ? country : city) === item && styles.sheetItemTextActive]}>
                    {item}
                  </Text>
                  {(pickerConfig.type === 'country' ? country : city) === item && (
                    <Icon name="check-circle" size={22} color={COLORS.gold} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptySearch}>
                  <Icon name="text-search" size={40} color="#333" />
                  <Text style={styles.emptySearchText}>No results found</Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#12161A', borderBottomWidth: 1, borderBottomColor: '#1E2329', zIndex: 10 },
  backBtn: { padding: 4 },
  navTitle: { fontSize: 18, color: COLORS.white, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  
  infoBanner: { flexDirection: 'row', backgroundColor: 'rgba(33, 150, 243, 0.08)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(33, 150, 243, 0.2)', marginBottom: 20 },
  bannerTitle: { fontSize: 15, color: '#2196F3', fontWeight: '800', marginBottom: 6 },
    bannerText: { fontSize: 13, color: '#FFFFFF', lineHeight: 18, marginTop: 4 },
  
  exnessBtn: { backgroundColor: '#FFD700', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginBottom: 20, gap: 8, elevation: 4, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  exnessBtnText: { color: '#0B0E11', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },

  card: { backgroundColor: '#12161A', padding: 20, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#1E2329' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  cardTitle: { fontSize: 18, color: COLORS.white, fontWeight: '800', marginBottom: 20, letterSpacing: 0.5 },
  cardTitleLine: { fontSize: 16, color: COLORS.white, fontWeight: '700' },

  field: { marginBottom: 18 },
  rowFields: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 12, color: COLORS.grey, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B0E11', borderRadius: 12, borderWidth: 1, borderColor: '#1E2329', paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: COLORS.white, fontWeight: '500' },
  
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B0E11', borderRadius: 12, borderWidth: 1, borderColor: '#1E2329', paddingHorizontal: 12, paddingVertical: 14 },
  dropdownBtnText: { flex: 1, fontSize: 15, color: COLORS.white, fontWeight: '500' },

  saveBtn: { backgroundColor: COLORS.gold, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  saveBtnText: { fontSize: 16, color: '#0B0E11', fontWeight: '800', letterSpacing: 0.5 },

  /* Bottom Sheet Styles */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalDismissArea: { flex: 1 },
  bottomSheet: { backgroundColor: '#12161A', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85%', minHeight: '50%', padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, color: COLORS.white, fontWeight: '800' },
  
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B0E11', borderRadius: 12, borderWidth: 1, borderColor: '#1E2329', paddingHorizontal: 12, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: COLORS.white, fontWeight: '500' },
  
  sheetItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1E2329' },
  sheetItemText: { fontSize: 16, color: COLORS.grey, fontWeight: '500' },
  sheetItemTextActive: { color: COLORS.gold, fontWeight: '800' },

  emptySearch: { alignItems: 'center', paddingVertical: 40 },
  emptySearchText: { color: '#666', fontSize: 15, marginTop: 10, fontWeight: '600' }
});

