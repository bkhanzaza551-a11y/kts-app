import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { triggerHaptic } from '../../utils/haptics';
import { setUser } from '../../store/authSlice';
import { storage } from '../../utils/storage';
import client from '../../api/client';

const { width } = Dimensions.get('window');

const COUNTRIES = [
  'Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'United States',
  'United Kingdom', 'Canada', 'Australia', 'India', 'Germany', 'France',
  'Turkey', 'Malaysia', 'Singapore', 'Qatar', 'Oman', 'Bahrain', 'Kuwait',
  'Bangladesh', 'Sri Lanka', 'South Africa', 'Nigeria', 'Kenya', 'Egypt'
];

const CITIES = {
  'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain', 'Al Ain'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Tabuk', 'Abha', 'Taif'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Glasgow', 'Edinburgh', 'Bristol'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'],
};

const BROKERS = ['Exness', 'OctaFX', 'XM Global', 'IC Markets', 'FBS', 'FXTM', 'Deriv', 'HF Markets', 'Other Broker'];

const DEMO_SERVERS = {
  'Exness': ['Exness-MT5Trial', 'Exness-MT5Trial2', 'Exness-MT5Trial3'],
  'OctaFX': ['OctaFX-Demo', 'OctaFX-Real'],
  'XM Global': ['XMGlobal-MT5', 'XMGlobal-Demo'],
  'IC Markets': ['ICMarketsSC-Demo', 'ICMarkets-Demo01'],
  'Other Broker': ['Custom Server 1', 'Custom Server 2'],
};

export const ProfileOnboardingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  // Stepper State (1: Personal, 2: Demo Account, 3: Real Account)
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Step 1: Personal Details State
  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('male');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  // Step 2: Demo Account State
  const [brokerName, setBrokerName] = useState('Exness');
  const [demoAccountId, setDemoAccountId] = useState('');
  const [demoAccountServer, setDemoAccountServer] = useState('Exness-MT5Trial');
  const [demoAccountEmail, setDemoAccountEmail] = useState('');
  const [exnessLink, setExnessLink] = useState('https://www.exness.com/register/');

  // Step 3: Real Account State
  const [realAccountId, setRealAccountId] = useState('');
  const [realAccountServer, setRealAccountServer] = useState('Exness-MT5Real');
  const [realAccountEmail, setRealAccountEmail] = useState('');

  // Dropdown Picker Modal State
  const [pickerConfig, setPickerConfig] = useState({ visible: false, type: '', data: [] });
  const [searchQuery, setSearchQuery] = useState('');

  // Animation for progress bar
  const progressAnim = useRef(new Animated.Value(0.33)).current;

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setWhatsapp(user.whatsapp || user.phone || '');
      setGender(user.gender || 'male');
      setCountry(user.country || '');
      setCity(user.city || '');
      setBrokerName(user.broker_name || 'Exness');
      setDemoAccountId(user.demo_account_id || '');
      setDemoAccountServer(user.demo_account_server || 'Exness-MT5Trial');
      setRealAccountId(user.real_account_id || '');
      setRealAccountServer(user.real_account_server || 'Exness-MT5Real');
      if (user.avatar) {
        setAvatarUri(user.avatar);
      }
    }
    fetchInstructions();
  }, [user]);

  const fetchInstructions = async () => {
    try {
      const res = await client.get('/demo-account/instructions');
      if (res.data?.data?.referral_link) {
        setExnessLink(res.data.data.referral_link);
      }
    } catch (e) {}
  };

  const updateProgress = (step) => {
    Animated.timing(progressAnim, {
      toValue: step === 1 ? 0.33 : step === 2 ? 0.66 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Avatar Selection Handlers
  const handleLaunchCamera = async () => {
    setShowPhotoPicker(false);
    triggerHaptic('light');
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: true,
      });
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAvatarUri(asset.uri);
        setAvatarBase64(`data:${asset.type || 'image/jpeg'};base64,${asset.base64}`);
        triggerHaptic('success');
      }
    } catch (err) {
      Alert.alert('Camera Error', 'Could not access camera. Please check app permissions.');
    }
  };

  const handleLaunchGallery = async () => {
    setShowPhotoPicker(false);
    triggerHaptic('light');
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: true,
      });
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAvatarUri(asset.uri);
        setAvatarBase64(`data:${asset.type || 'image/jpeg'};base64,${asset.base64}`);
        triggerHaptic('success');
      }
    } catch (err) {
      Alert.alert('Gallery Error', 'Could not access gallery. Please check app permissions.');
    }
  };

  const handleRemovePhoto = () => {
    setShowPhotoPicker(false);
    setAvatarUri(null);
    setAvatarBase64(null);
    triggerHaptic('light');
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    triggerHaptic('light');
    if (currentStep === 1) {
      if (!name.trim()) {
        Alert.alert('Name Required', 'Please enter your full name to proceed.');
        return;
      }
      if (!phone.trim()) {
        Alert.alert('Phone Required', 'Please enter your phone number so we can verify your trading account.');
        return;
      }
      setCurrentStep(2);
      updateProgress(2);
    } else if (currentStep === 2) {
      if (!demoAccountId.trim()) {
        Alert.alert(
          'Demo Account Required',
          'Please enter your MT5 Demo Account Number to proceed. You can create a free account using the link above.',
          [
            { text: 'Enter Account', style: 'cancel' },
            { text: 'Skip Demo', onPress: () => { setCurrentStep(3); updateProgress(3); } }
          ]
        );
        return;
      }
      setCurrentStep(3);
      updateProgress(3);
    }
  };

  const handlePrevStep = () => {
    triggerHaptic('light');
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      updateProgress(newStep);
    }
  };

  // Submit Profile & Finalize Onboarding
  const handleCompleteProfile = async (skipReal = false) => {
    triggerHaptic('light');
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        gender: gender,
        country: country.trim(),
        city: city.trim(),
        broker_name: brokerName,
        demo_account_id: demoAccountId.trim(),
        demo_account_server: demoAccountServer.trim(),
        is_profile_completed: true,
      };

      if (!skipReal && realAccountId.trim()) {
        payload.real_account_id = realAccountId.trim();
        payload.real_account_server = realAccountServer.trim();
      }

      if (avatarBase64) {
        payload.avatar = avatarBase64;
      }

      const res = await client.put('/profile', payload);
      const updatedUser = res.data?.data?.user;

      if (updatedUser) {
        dispatch(setUser(updatedUser));
        await storage.setUser(updatedUser);
      }

      triggerHaptic('success');
      setShowSuccessModal(true);
    } catch (e) {
      triggerHaptic('heavy');
      Alert.alert('Submission Error', e.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinishOnboarding = () => {
    setShowSuccessModal(false);
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Dropdown Picker Handlers
  const openCountryPicker = () => {
    triggerHaptic('light');
    setSearchQuery('');
    setPickerConfig({ visible: true, type: 'country', data: COUNTRIES });
  };

  const openCityPicker = () => {
    if (!country) {
      Alert.alert('Select Country', 'Please select a country first to choose a city.');
      return;
    }
    triggerHaptic('light');
    setSearchQuery('');
    const cityList = CITIES[country] || ['Capital City', 'Other City'];
    setPickerConfig({ visible: true, type: 'city', data: cityList });
  };

  const openBrokerPicker = () => {
    triggerHaptic('light');
    setSearchQuery('');
    setPickerConfig({ visible: true, type: 'broker', data: BROKERS });
  };

  const handleSelectOption = (item) => {
    triggerHaptic('light');
    if (pickerConfig.type === 'country') {
      setCountry(item);
      setCity('');
    } else if (pickerConfig.type === 'city') {
      setCity(item);
    } else if (pickerConfig.type === 'broker') {
      setBrokerName(item);
      if (DEMO_SERVERS[item]) {
        setDemoAccountServer(DEMO_SERVERS[item][0]);
      }
    }
    setPickerConfig({ visible: false, type: '', data: [] });
  };

  const filteredDropdownData = useMemo(() => {
    if (!searchQuery.trim()) return pickerConfig.data;
    return pickerConfig.data.filter(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, pickerConfig.data]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* Header & Navigation Bar */}
        <View style={[styles.navbar, { paddingTop: insets.top + 10 }]}>
          {currentStep > 1 ? (
            <TouchableOpacity style={styles.navBtn} onPress={handlePrevStep}>
              <Icon name="arrow-left" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
              <Icon name="close" size={24} color={COLORS.grey} />
            </TouchableOpacity>
          )}

          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>Setup Account</Text>
            <Text style={styles.navStepText}>Step {currentStep} of 3</Text>
          </View>

          <View style={{ width: 36 }} />
        </View>

        {/* Stepper Progress Indicator */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepsRow}>
            {/* Step 1 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
                {currentStep > 1 ? (
                  <Icon name="check" size={16} color="#0B0E11" />
                ) : (
                  <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>Personal</Text>
            </View>

            <View style={[styles.stepDivider, currentStep >= 2 && styles.stepDividerActive]} />

            {/* Step 2 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
                {currentStep > 2 ? (
                  <Icon name="check" size={16} color="#0B0E11" />
                ) : (
                  <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>Demo MT5</Text>
            </View>

            <View style={[styles.stepDivider, currentStep >= 3 && styles.stepDividerActive]} />

            {/* Step 3 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>3</Text>
              </View>
              <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>Real MT5</Text>
            </View>
          </View>

          {/* Animated Progress Bar */}
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Form Body Content */}
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* STEP 1: PERSONAL DETAILS & AVATAR */}
          {currentStep === 1 && (
            <View style={styles.stepContent}>
              
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                <TouchableOpacity
                  style={styles.avatarContainer}
                  activeOpacity={0.8}
                  onPress={() => setShowPhotoPicker(true)}
                >
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarLetter}>
                        {name ? name.charAt(0).toUpperCase() : 'K'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.cameraBadge}>
                    <Icon name="camera" size={16} color="#0B0E11" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarHint}>Tap to upload Profile Picture</Text>
              </View>

              {/* Personal Details Card */}
              <View style={styles.card}>
                <Text style={styles.cardHeading}>Personal Information</Text>

                {/* Full Name */}
                <View style={styles.field}>
                  <Text style={styles.label}>Full Name *</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="account-outline" size={20} color={COLORS.grey} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. John Doe"
                      placeholderTextColor="#555"
                    />
                  </View>
                </View>

                {/* Email (Readonly / Pre-filled) */}
                <View style={styles.field}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={[styles.inputWrapper, styles.inputDisabled]}>
                    <Icon name="email-outline" size={20} color={COLORS.grey} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: '#888' }]}
                      value={email}
                      editable={false}
                      placeholder="user@example.com"
                      placeholderTextColor="#555"
                    />
                    <Icon name="lock" size={16} color="#555" />
                  </View>
                </View>

                {/* Gender Selector */}
                <View style={styles.field}>
                  <Text style={styles.label}>Gender</Text>
                  <View style={styles.genderRow}>
                    {[
                      { id: 'male', label: 'Male', icon: 'gender-male' },
                      { id: 'female', label: 'Female', icon: 'gender-female' },
                      { id: 'other', label: 'Other', icon: 'account-question-outline' },
                    ].map(g => (
                      <TouchableOpacity
                        key={g.id}
                        style={[styles.genderCard, gender === g.id && styles.genderCardActive]}
                        activeOpacity={0.7}
                        onPress={() => {
                          triggerHaptic('light');
                          setGender(g.id);
                        }}
                      >
                        <Icon
                          name={g.icon}
                          size={20}
                          color={gender === g.id ? '#0B0E11' : COLORS.grey}
                        />
                        <Text style={[styles.genderLabel, gender === g.id && styles.genderLabelActive]}>
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Phone Number */}
                <View style={styles.field}>
                  <Text style={styles.label}>Phone Number *</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="phone-outline" size={20} color={COLORS.grey} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={(val) => {
                        setPhone(val);
                        if (!whatsapp) setWhatsapp(val);
                      }}
                      placeholder="+92 300 1234567"
                      placeholderTextColor="#555"
                      keyboardType="phone-pad"
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
                    <Icon name="whatsapp" size={20} color="#25D366" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={whatsapp}
                      onChangeText={setWhatsapp}
                      placeholder="+92 300 1234567"
                      placeholderTextColor="#555"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Country & City Dropdowns */}
                <View style={styles.rowFields}>
                  <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Country</Text>
                    <TouchableOpacity style={styles.dropdownBtn} activeOpacity={0.7} onPress={openCountryPicker}>
                      <Icon name="earth" size={18} color={country ? COLORS.white : COLORS.grey} style={styles.inputIcon} />
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

              </View>

              {/* Continue to Step 2 Button */}
              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={handleNextStep}>
                <Text style={styles.primaryBtnText}>Continue to Step 2 (Demo Account)</Text>
                <Icon name="arrow-right" size={20} color="#0B0E11" />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: DEMO MT5 ACCOUNT & VISUAL GUIDE */}
          {currentStep === 2 && (
            <View style={styles.stepContent}>
              
              {/* Exness Banner & Partner Link */}
              <View style={styles.guideCard}>
                <View style={styles.guideHeader}>
                  <View style={styles.guideIconWrapper}>
                    <Icon name="robot" size={24} color={COLORS.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guideTitle}>Link MT5 Demo Account</Text>
                    <Text style={styles.guideSubtitle}>Strictly required to test our automated AI Bots in a virtual demo environment.</Text>
                  </View>
                </View>

                {/* Exness Partner CTA */}
                <TouchableOpacity
                  style={styles.exnessBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    triggerHaptic('light');
                    Linking.openURL(exnessLink);
                  }}
                >
                  <Icon name="open-in-new" size={18} color="#0B0E11" />
                  <Text style={styles.exnessBtnText}>Open Free Exness Demo Account</Text>
                </TouchableOpacity>

                {/* 3-Step Guide Timeline */}
                <View style={styles.timeline}>
                  {[
                    { step: '1', title: 'Register on Exness', desc: 'Click the button above to create a free broker account.' },
                    { step: '2', title: 'Create MT5 Demo Account', desc: 'In your broker dashboard, select Open Demo MT5 Account.' },
                    { step: '3', title: 'Copy MT5 Account Number', desc: 'Enter your Demo MT5 account number & server below.' },
                  ].map((item, idx) => (
                    <View key={idx} style={styles.timelineRow}>
                      <View style={styles.timelineIndicator}>
                        <View style={styles.timelineNumBg}>
                          <Text style={styles.timelineNumText}>{item.step}</Text>
                        </View>
                        {idx !== 2 && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>{item.title}</Text>
                        <Text style={styles.timelineDesc}>{item.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Demo Account Form */}
              <View style={styles.card}>
                <Text style={styles.cardHeading}>Demo Account Credentials</Text>

                {/* Broker Selection */}
                <View style={styles.field}>
                  <Text style={styles.label}>Broker Name</Text>
                  <TouchableOpacity style={styles.dropdownBtn} activeOpacity={0.7} onPress={openBrokerPicker}>
                    <Icon name="bank" size={18} color={COLORS.gold} style={styles.inputIcon} />
                    <Text style={styles.dropdownBtnText}>{brokerName}</Text>
                    <Icon name="chevron-down" size={18} color={COLORS.grey} />
                  </TouchableOpacity>
                </View>

                {/* Demo MT5 Account Number */}
                <View style={styles.field}>
                  <Text style={styles.label}>Demo MT5 Account Number *</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="pound" size={20} color={COLORS.grey} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={demoAccountId}
                      onChangeText={setDemoAccountId}
                      placeholder="e.g. 10293847"
                      placeholderTextColor="#555"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Demo MT5 Server */}
                <View style={styles.field}>
                  <Text style={styles.label}>Demo Server Name</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="server" size={20} color={COLORS.grey} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={demoAccountServer}
                      onChangeText={setDemoAccountServer}
                      placeholder="e.g. Exness-MT5Trial"
                      placeholderTextColor="#555"
                    />
                  </View>
                </View>

                {/* Demo Email (Optional) */}
                <View style={styles.field}>
                  <Text style={styles.label}>Broker Registered Email (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="email-outline" size={20} color={COLORS.grey} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={demoAccountEmail}
                      onChangeText={setDemoAccountEmail}
                      placeholder="Email registered with broker"
                      placeholderTextColor="#555"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

              </View>

              {/* Navigation Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8} onPress={handlePrevStep}>
                  <Icon name="arrow-left" size={18} color={COLORS.white} />
                  <Text style={styles.secondaryBtnText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.primaryBtn, { flex: 2 }]} activeOpacity={0.8} onPress={handleNextStep}>
                  <Text style={styles.primaryBtnText}>Next: Real Account</Text>
                  <Icon name="arrow-right" size={18} color="#0B0E11" />
                </TouchableOpacity>
              </View>

            </View>
          )}

          {/* STEP 3: REAL MT5 ACCOUNT SETUP (WITH SKIP OPTION) */}
          {currentStep === 3 && (
            <View style={styles.stepContent}>
              
              {/* Real Account Intro Banner */}
              <View style={[styles.guideCard, { borderColor: 'rgba(0, 200, 83, 0.3)' }]}>
                <View style={styles.guideHeader}>
                  <View style={[styles.guideIconWrapper, { backgroundColor: 'rgba(0, 200, 83, 0.15)', borderColor: '#00C853' }]}>
                    <Icon name="shield-check" size={24} color="#00C853" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.guideTitle, { color: '#00C853' }]}>Real MT5 Account (Optional)</Text>
                    <Text style={styles.guideSubtitle}>
                      Link your Real MT5 account when you are ready to copy live signals and run automated live bots.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Real Account Form */}
              <View style={styles.card}>
                <Text style={styles.cardHeading}>Real MT5 Credentials</Text>

                {/* Real MT5 Account Number */}
                <View style={styles.field}>
                  <Text style={styles.label}>Real Account Number (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="pound" size={20} color={COLORS.grey} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={realAccountId}
                      onChangeText={setRealAccountId}
                      placeholder="e.g. 50293847"
                      placeholderTextColor="#555"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Real MT5 Server */}
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

                {/* Real Email */}
                <View style={styles.field}>
                  <Text style={styles.label}>Real Account Email (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="email-outline" size={20} color={COLORS.grey} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={realAccountEmail}
                      onChangeText={setRealAccountEmail}
                      placeholder="Email registered with broker"
                      placeholderTextColor="#555"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

              </View>

              {/* Action Buttons: Skip vs Complete */}
              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.8}
                disabled={saving}
                onPress={() => handleCompleteProfile(false)}
              >
                {saving ? (
                  <ActivityIndicator color="#0B0E11" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Complete Profile & Finish</Text>
                    <Icon name="check-circle" size={20} color="#0B0E11" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipOutlineBtn}
                activeOpacity={0.8}
                disabled={saving}
                onPress={() => handleCompleteProfile(true)}
              >
                <Text style={styles.skipOutlineBtnText}>Skip Real Account for Now</Text>
              </TouchableOpacity>

            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* PHOTO PICKER BOTTOM SHEET MODAL */}
      <Modal visible={showPhotoPicker} transparent animationType="fade" onRequestClose={() => setShowPhotoPicker(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismissArea} activeOpacity={1} onPress={() => setShowPhotoPicker(false)} />
          <View style={[styles.photoSheet, { paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 25 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.photoSheetTitle}>Select Profile Picture</Text>
            
            <TouchableOpacity style={styles.photoSheetOption} onPress={handleLaunchCamera}>
              <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                <Icon name="camera" size={22} color={COLORS.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.photoOptionText}>Take Photo (Camera)</Text>
                <Text style={styles.photoOptionSub}>Capture a new photo with camera</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoSheetOption} onPress={handleLaunchGallery}>
              <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
                <Icon name="image-multiple" size={22} color="#2196F3" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.photoOptionText}>Choose from Gallery</Text>
                <Text style={styles.photoOptionSub}>Pick an existing photo from gallery</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoSheetOption} onPress={handleLaunchGallery}>
              <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(156, 39, 176, 0.15)' }]}>
                <Icon name="folder-image" size={22} color="#AB47BC" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.photoOptionText}>Browse Files</Text>
                <Text style={styles.photoOptionSub}>Upload from files & storage</Text>
              </View>
            </TouchableOpacity>

            {avatarUri && (
              <TouchableOpacity style={styles.photoSheetOption} onPress={handleRemovePhoto}>
                <View style={[styles.photoOptionIcon, { backgroundColor: 'rgba(255, 68, 68, 0.15)' }]}>
                  <Icon name="trash-can-outline" size={22} color="#FF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.photoOptionText, { color: '#FF4444' }]}>Remove Current Photo</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPhotoPicker(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SEARCHABLE COUNTRY / CITY / BROKER PICKER MODAL */}
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
              <Text style={styles.sheetTitle}>
                Select {pickerConfig.type === 'country' ? 'Country' : pickerConfig.type === 'city' ? 'City' : 'Broker'}
              </Text>
              <TouchableOpacity onPress={() => setPickerConfig({ visible: false, type: '', data: [] })}>
                <Icon name="close-circle" size={26} color={COLORS.grey} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchWrapper}>
              <Icon name="magnify" size={22} color={COLORS.grey} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${pickerConfig.type}...`}
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
              data={filteredDropdownData}
              keyExtractor={(item, idx) => item + idx}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const isSelected =
                  pickerConfig.type === 'country' ? country === item :
                  pickerConfig.type === 'city' ? city === item : brokerName === item;

                return (
                  <TouchableOpacity
                    style={styles.sheetItem}
                    activeOpacity={0.7}
                    onPress={() => handleSelectOption(item)}
                  >
                    <Text style={[styles.sheetItemText, isSelected && styles.sheetItemTextActive]}>
                      {item}
                    </Text>
                    {isSelected && <Icon name="check-circle" size={22} color={COLORS.gold} />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptySearch}>
                  <Icon name="text-search" size={36} color="#444" />
                  <Text style={styles.emptySearchText}>No matches found</Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* CELEBRATORY SUCCESS MODAL */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalCard}>
            <View style={styles.successBadge}>
              <Icon name="check-decagram" size={54} color={COLORS.gold} />
            </View>
            <Text style={styles.successTitle}>Profile Setup Completed! 🎉</Text>
            <Text style={styles.successMessage}>
              Your profile and MT5 trading accounts have been successfully saved. You now have full access to KTS AI Bots and automated signals!
            </Text>

            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={handleFinishOnboarding}>
              <Text style={styles.primaryBtnText}>Go to Dashboard</Text>
              <Icon name="rocket-launch" size={20} color="#0B0E11" />
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: SPACING.screen,
    paddingBottom: 14,
    backgroundColor: '#12161A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2329',
  },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  navCenter: { alignItems: 'center' },
  navTitle: { fontSize: 17, color: COLORS.white, fontWeight: '800' },
  navStepText: { fontSize: 12, color: COLORS.gold, fontWeight: '700', marginTop: 2 },

  /* Stepper Progress Indicator */
  stepperContainer: {
    backgroundColor: '#12161A',
    paddingHorizontal: SPACING.screen,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2329',
  },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  stepItem: { alignItems: 'center', minWidth: 60 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E2329',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#2A2E35',
    marginBottom: 4,
  },
  stepCircleActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  stepNumber: { fontSize: 13, color: '#888', fontWeight: '800' },
  stepNumberActive: { color: '#0B0E11' },
  stepLabel: { fontSize: 11, color: '#666', fontWeight: '600' },
  stepLabelActive: { color: COLORS.white, fontWeight: '700' },
  stepDivider: { flex: 1, height: 2, backgroundColor: '#1E2329', marginHorizontal: 8, marginBottom: 16 },
  stepDividerActive: { backgroundColor: COLORS.gold },

  progressBarTrack: { height: 4, backgroundColor: '#1E2329', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 2 },

  scrollContent: { padding: SPACING.screen },
  stepContent: {},

  /* Avatar Section */
  avatarSection: { alignItems: 'center', marginVertical: 16 },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: COLORS.gold,
    elevation: 6,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarImage: { width: 92, height: 92, borderRadius: 46 },
  avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 38, color: '#0B0E11', fontWeight: '900' },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B0E11',
  },
  avatarHint: { fontSize: 12, color: COLORS.grey, marginTop: 10, fontWeight: '600' },

  /* Form Card & Fields */
  card: {
    backgroundColor: '#12161A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E2329',
  },
  cardHeading: { fontSize: 16, color: COLORS.white, fontWeight: '800', marginBottom: 18, letterSpacing: 0.5 },
  field: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 12, color: COLORS.grey, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  sameAsPhone: { fontSize: 11, color: COLORS.gold, fontWeight: '700', marginBottom: 8 },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0E11',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2329',
    paddingHorizontal: 12,
  },
  inputDisabled: { opacity: 0.7, borderColor: '#1A1E24' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: COLORS.white, fontWeight: '500' },

  rowFields: { flexDirection: 'row', justifyContent: 'space-between' },

  /* Gender Cards */
  genderRow: { flexDirection: 'row', gap: 10 },
  genderCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0E11',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1E2329',
    gap: 6,
  },
  genderCardActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  genderLabel: { fontSize: 13, color: COLORS.grey, fontWeight: '700' },
  genderLabelActive: { color: '#0B0E11' },

  /* Dropdown Buttons */
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
  dropdownBtnText: { flex: 1, fontSize: 14, color: COLORS.white, fontWeight: '600' },

  /* Guide Card in Step 2 & 3 */
  guideCard: {
    backgroundColor: '#12161A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  guideHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  guideIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  guideTitle: { fontSize: 16, color: COLORS.gold, fontWeight: '800' },
  guideSubtitle: { fontSize: 12, color: COLORS.grey, marginTop: 4, lineHeight: 16 },

  exnessBtn: {
    backgroundColor: COLORS.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    marginBottom: 18,
    gap: 8,
  },
  exnessBtnText: { color: '#0B0E11', fontSize: 14, fontWeight: '800' },

  timeline: { paddingLeft: 4 },
  timelineRow: { flexDirection: 'row', minHeight: 48 },
  timelineIndicator: { alignItems: 'center', marginRight: 12 },
  timelineNumBg: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  timelineNumText: { color: '#0B0E11', fontSize: 11, fontWeight: '900' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#1E2329', marginVertical: -2 },
  timelineContent: { flex: 1, paddingBottom: 12 },
  timelineTitle: { fontSize: 13, color: COLORS.white, fontWeight: '700', marginBottom: 2 },
  timelineDesc: { fontSize: 11, color: '#888', lineHeight: 15 },

  /* Buttons */
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  primaryBtn: {
    backgroundColor: COLORS.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    elevation: 4,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryBtnText: { fontSize: 15, color: '#0B0E11', fontWeight: '800', letterSpacing: 0.5 },

  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E2329',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#2A2E35',
    gap: 6,
  },
  secondaryBtnText: { fontSize: 14, color: COLORS.white, fontWeight: '700' },

  skipOutlineBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#2A2E35',
    backgroundColor: '#12161A',
  },
  skipOutlineBtnText: { fontSize: 14, color: COLORS.grey, fontWeight: '700' },

  /* Photo Sheet Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalDismissArea: { flex: 1 },
  photoSheet: {
    backgroundColor: '#12161A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E2329',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#333', alignSelf: 'center', marginBottom: 16 },
  photoSheetTitle: { fontSize: 18, color: COLORS.white, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  photoSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1E24',
    gap: 14,
  },
  photoOptionIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  photoOptionText: { fontSize: 15, color: COLORS.white, fontWeight: '700' },
  photoOptionSub: { fontSize: 11, color: COLORS.grey, marginTop: 2 },
  cancelBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  cancelBtnText: { fontSize: 15, color: COLORS.grey, fontWeight: '700' },

  /* Dropdown Bottom Sheet */
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

  /* Success Modal */
  successModalCard: {
    backgroundColor: '#12161A',
    margin: 24,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignSelf: 'center',
    width: width - 48,
  },
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  successTitle: { fontSize: 20, color: COLORS.white, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  successMessage: { fontSize: 13, color: COLORS.grey, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
});
