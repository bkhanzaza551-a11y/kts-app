import React, { useEffect, useState, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../../api/client';
import { triggerHaptic } from '../../utils/haptics';
import { setUser } from '../../store/authSlice';
import { storage } from '../../utils/storage';

const COUNTRY_DATA = {
  'Pakistan': { code: '+92', flag: '🇵🇰' },
  'United Arab Emirates': { code: '+971', flag: '🇦🇪' },
  'Saudi Arabia': { code: '+966', flag: '🇸🇦' },
  'United States': { code: '+1', flag: '🇺🇸' },
  'United Kingdom': { code: '+44', flag: '🇬🇧' },
  'India': { code: '+91', flag: '🇮🇳' },
  'Canada': { code: '+1', flag: '🇨🇦' },
  'Australia': { code: '+61', flag: '🇦🇺' },
  'Germany': { code: '+49', flag: '🇩🇪' },
  'France': { code: '+33', flag: '🇫🇷' },
  'Turkey': { code: '+90', flag: '🇹🇷' },
  'Malaysia': { code: '+60', flag: '🇲🇾' },
  'Singapore': { code: '+65', flag: '🇸🇬' },
  'Qatar': { code: '+974', flag: '🇶🇦' },
  'Oman': { code: '+968', flag: '🇴🇲' },
  'Bahrain': { code: '+973', flag: '🇧🇭' },
  'Kuwait': { code: '+965', flag: '🇰🇼' },
  'Bangladesh': { code: '+880', flag: '🇧🇩' },
  'Sri Lanka': { code: '+94', flag: '🇱🇰' },
  'South Africa': { code: '+27', flag: '🇿🇦' },
  'Nigeria': { code: '+234', flag: '🇳🇬' },
  'Kenya': { code: '+254', flag: '🇰🇪' },
  'Egypt': { code: '+20', flag: '🇪🇬' },
};

const COUNTRIES = Object.keys(COUNTRY_DATA);

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
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [countryCode, setCountryCode] = useState('+92');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [demoAccountId, setDemoAccountId] = useState('');
  const [demoAccountServer, setDemoAccountServer] = useState('Exness-MT5Trial');
  const [realAccountId, setRealAccountId] = useState('');
  const [realAccountServer, setRealAccountServer] = useState('Exness-MT5Real');

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
      const userCountry = u.country || 'Pakistan';
      setCountry(userCountry);
      setCountryCode(COUNTRY_DATA[userCountry]?.code || '+92');
      setCity(u.city || '');

      let rawPhone = u.phone || '';
      let rawWhatsapp = u.whatsapp || '';
      Object.values(COUNTRY_DATA).forEach(({ code }) => {
        rawPhone = rawPhone.replace(code, '').trim();
        rawWhatsapp = rawWhatsapp.replace(code, '').trim();
      });
      setPhone(rawPhone.replace(/[^0-9]/g, ''));
      setWhatsapp(rawWhatsapp.replace(/[^0-9]/g, '') || rawPhone.replace(/[^0-9]/g, ''));

      setDemoAccountId((u.demo_account_id || '').replace(/[^0-9]/g, ''));
      setDemoAccountServer(u.demo_account_server || 'Exness-MT5Trial');
      setRealAccountId((u.real_account_id || '').replace(/[^0-9]/g, ''));
      setRealAccountServer(u.real_account_server || 'Exness-MT5Real');
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
      const cleanPhone = phone.trim() ? `${countryCode} ${phone.trim()}` : '';
      const cleanWhatsapp = whatsapp.trim() ? `${countryCode} ${whatsapp.trim()}` : cleanPhone;

      const res = await client.put('/profile', {
        name: name.trim(),
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        country: country.trim(),
        city: city.trim(),
        demo_account_id: demoAccountId.trim(),
        demo_account_server: demoAccountServer.trim(),
        real_account_id: realAccountId.trim(),
        real_account_server: realAccountServer.trim(),
      });

      const updatedUser = res.data?.data?.user;
      if (updatedUser) {
        dispatch(setUser(updatedUser));
        await storage.setUser(updatedUser);
      }

      triggerHaptic('success');
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      triggerHaptic('heavy');
      Alert.alert('Error', e.response?.data?.message || e.message || 'Failed to update profile');
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
    const cityData = CITIES[country] || ['Capital City', 'Other City'];
    setPickerConfig({ visible: true, type: 'city', data: cityData });
  };

  const handleSelectOption = (item) => {
    triggerHaptic('light');
    if (pickerConfig.type === 'country') {
      setCountry(item);
      const code = COUNTRY_DATA[item]?.code || '+92';
      setCountryCode(code);
      setCity('');
    } else {
      setCity(item);
    }
    setPickerConfig({ visible: false, type: '', data: [] });
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return pickerConfig.data;
    return pickerConfig.data.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase()));
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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Personal Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Details</Text>

          {/* Full Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <Icon name="account-outline" size={20} color={COLORS.grey} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                placeholderTextColor="#555"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Country & City Dropdowns */}
          <View style={styles.rowFields}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Country *</Text>
              <TouchableOpacity style={styles.dropdownBtn} activeOpacity={0.7} onPress={openCountryPicker}>
                <Icon name="earth" size={18} color={country ? COLORS.gold : COLORS.grey} style={styles.inputIcon} />
                <Text style={[styles.dropdownBtnText, !country && { color: '#555' }]} numberOfLines={1}>
                  {country || 'Select'}
                </Text>
                <Icon name="chevron-down" size={18} color={COLORS.grey} />
              </TouchableOpacity>
            </View>

            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>City</Text>
              <TouchableOpacity style={styles.dropdownBtn} activeOpacity={0.7} onPress={openCityPicker}>
                <Icon name="city-variant-outline" size={18} color={city ? COLORS.white : COLORS.grey} style={styles.inputIcon} />
                <Text style={[styles.dropdownBtnText, !city && { color: '#555' }]} numberOfLines={1}>
                  {city || 'Select'}
                </Text>
                <Icon name="chevron-down" size={18} color={COLORS.grey} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.field}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.countryCodeBadge}>
                <Text style={styles.countryCodeText}>{countryCode}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={(val) => {
                  const num = val.replace(/[^0-9]/g, '');
                  setPhone(num);
                  if (!whatsapp) setWhatsapp(num);
                }}
                placeholder="3001234567"
                placeholderTextColor="#555"
                keyboardType="numeric"
                maxLength={15}
              />
            </View>
          </View>

          {/* WhatsApp Number */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>WhatsApp Number</Text>
              {phone && whatsapp !== phone && (
                <TouchableOpacity onPress={() => setWhatsapp(phone)}>
                  <Text style={styles.sameAsPhone}>Same as Phone</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputWrapper}>
              <View style={[styles.countryCodeBadge, { borderColor: 'rgba(37, 211, 102, 0.3)' }]}>
                <Text style={[styles.countryCodeText, { color: '#25D366' }]}>{countryCode}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={whatsapp}
                onChangeText={(val) => setWhatsapp(val.replace(/[^0-9]/g, ''))}
                placeholder="3001234567"
                placeholderTextColor="#555"
                keyboardType="numeric"
                maxLength={15}
              />
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
              <TextInput
                style={styles.input}
                value={demoAccountId}
                onChangeText={(val) => setDemoAccountId(val.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 50293847"
                placeholderTextColor="#555"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Demo Server Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="server-network" size={20} color={COLORS.grey} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={demoAccountServer}
                onChangeText={setDemoAccountServer}
                placeholder="e.g. Exness-MT5Trial"
                placeholderTextColor="#555"
              />
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
              <TextInput
                style={styles.input}
                value={realAccountId}
                onChangeText={(val) => setRealAccountId(val.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 313133131"
                placeholderTextColor="#555"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Real Server Name</Text>
            <View style={styles.inputWrapper}>
              <Icon name="server-network" size={20} color={COLORS.grey} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={realAccountServer}
                onChangeText={setRealAccountServer}
                placeholder="e.g. Exness-MT5Real"
                placeholderTextColor="#555"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
          {saving ? <ActivityIndicator color="#0B0E11" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Sheet Dropdown Modal */}
      <Modal
        visible={pickerConfig.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerConfig({ visible: false, type: '', data: [] })}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setPickerConfig({ visible: false, type: '', data: [] })}
          />
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
            </View>

            <FlatList
              data={filteredData}
              keyExtractor={(item, idx) => item + idx}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const isSelected = (pickerConfig.type === 'country' ? country : city) === item;
                const flag = pickerConfig.type === 'country' ? COUNTRY_DATA[item]?.flag : null;

                return (
                  <TouchableOpacity
                    style={styles.sheetItem}
                    activeOpacity={0.7}
                    onPress={() => handleSelectOption(item)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {flag && <Text style={{ fontSize: 20, marginRight: 10 }}>{flag}</Text>}
                      <Text style={[styles.sheetItemText, isSelected && styles.sheetItemTextActive]}>
                        {item}
                      </Text>
                    </View>
                    {isSelected && <Icon name="check-circle" size={22} color={COLORS.gold} />}
                  </TouchableOpacity>
                );
              }}
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
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#12161A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2329',
    zIndex: 10,
  },
  backBtn: { padding: 4 },
  navTitle: { fontSize: 18, color: COLORS.white, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#12161A',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E2329',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  cardTitle: { fontSize: 16, color: COLORS.white, fontWeight: '800', marginBottom: 16, letterSpacing: 0.5 },
  cardTitleLine: { fontSize: 15, color: COLORS.white, fontWeight: '700' },

  field: { marginBottom: 16 },
  rowFields: { flexDirection: 'row' },
  label: { fontSize: 12, color: COLORS.grey, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sameAsPhone: { fontSize: 11, color: COLORS.gold, fontWeight: '700' },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0E11',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2329',
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: COLORS.white, fontWeight: '500' },

  countryCodeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 6,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  countryCodeText: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '700',
  },

  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0E11',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2329',
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  dropdownBtnText: { flex: 1, fontSize: 14, color: COLORS.white, fontWeight: '500' },

  exnessBtn: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  exnessBtnText: { color: '#0B0E11', fontSize: 13, fontWeight: '800' },

  saveBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { fontSize: 15, color: '#0B0E11', fontWeight: '800', letterSpacing: 0.5 },

  /* Bottom Sheet Styles */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalDismissArea: { flex: 1 },
  bottomSheet: {
    backgroundColor: '#12161A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
    padding: 20,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, color: COLORS.white, fontWeight: '800' },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0E11',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2329',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: COLORS.white, fontWeight: '500' },

  sheetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1E24',
  },
  sheetItemText: { fontSize: 15, color: COLORS.grey, fontWeight: '500' },
  sheetItemTextActive: { color: COLORS.gold, fontWeight: '800' },

  emptySearch: { alignItems: 'center', paddingVertical: 30 },
  emptySearchText: { color: '#666', fontSize: 14, marginTop: 8 },
});


