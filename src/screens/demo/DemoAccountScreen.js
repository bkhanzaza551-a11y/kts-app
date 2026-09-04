import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Linking } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { triggerHaptic } from '../../utils/haptics';
import client from '../../api/client';

export const DemoAccountScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useSelector(s => s.auth);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [depositAmount, setDepositAmount] = useState('10000');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [instructions, setInstructions] = useState(null);

useEffect(() => {
    // Simulated or fetched instructions
    client.get('/demo-account/instructions')
      .then(r => setInstructions(r.data.data))
      .catch(() => {
        // Fallback for demo purposes if backend fails
        setInstructions({
          title: "How to Create Demo Account",
          steps: [
            { title: "Register on Exness", description: "Go to exness.com/register and create a free account." },
            { title: "Verify Your Account", description: "Verify your email address and phone number for full access." },
            { title: "Open Demo Account", description: "Go to Accounts → Open Account → Select Demo Account." },
            { title: "Choose Account Type", description: "Select Standard or Pro account. Set leverage to 1:2000." },
            { title: "Copy Account Number", description: "Your account number is shown in the Exness dashboard." }
          ]
        });
      });

    // Auto-fill demo account details from bot config
    client.get('/bot')
      .then(r => {
        const data = r.data?.data;
        if (data) {
          setAccountNumber(prev => prev || (data.demo_account || ''));
          setEmail(prev => prev || (data.demo_email || ''));
          setPhone(prev => prev || (data.demo_phone || ''));
          setDepositAmount(prev => prev || String(data.demo_deposit ?? '10000'));
        }
      })
      .catch(() => {});
  }, []);

    const handleSubmit = async () => {
    // Validations
    let newErrors = {};
    triggerHaptic('light');

    if (!accountNumber) {
      newErrors.accountNumber = 'Account Number is required';
    } else if (!/^\d{5,15}$/.test(accountNumber)) {
      newErrors.accountNumber = 'Must be 5 to 15 digits';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (phone && !/^\+?[0-9]{8,15}$/.test(phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (depositAmount && (isNaN(depositAmount) || Number(depositAmount) < 100)) {
      newErrors.depositAmount = 'Minimum deposit is 100';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerHaptic('error');
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await client.post('/demo-account/request', {
        exness_account_number: accountNumber,
        account_type: 'standard',
        deposit_amount: depositAmount,
        demo_email: email,
        demo_phone: phone,
        user_notes: notes,
      });
      triggerHaptic('success');
      Alert.alert('Success', 'Your demo account request has been submitted!', [
        { text: 'Awesome', onPress: () => navigation.goBack() }
      ]);
    } catch (e) { 
      Alert.alert('Submission Error', e.message || "Failed to submit request."); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Icon name="monitor-dashboard" size={32} color="#FFD700" />
          </View>
          <Text style={styles.title}>Demo Account</Text>
          <Text style={styles.subtitle}>Practice trading securely by linking your Exness demo account</Text>
        </View>

        {/* Instructions Block */}
        {instructions && (
          <View style={styles.card}>
                        <View style={styles.cardHeader}>
              <Icon name="information-outline" size={20} color="#FFD700" />
              <Text style={styles.cardTitle}>{instructions.title}</Text>
            </View>

            <TouchableOpacity 
              style={styles.exnessBtn} 
              onPress={() => {
                const link = instructions.referral_link || 'https://www.exness.com';
                Linking.openURL(link);
              }}
            >
              <Icon name="link-variant" size={20} color="#0B0E11" />
              <Text style={styles.exnessBtnText}>Open Exness Account</Text>
            </TouchableOpacity>
            
            <View style={styles.timeline}>
              {instructions.steps?.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepIndicator}>
                    <View style={styles.stepNumBg}>
                      <Text style={styles.stepNumText}>{i + 1}</Text>
                    </View>
                    {i !== instructions.steps.length - 1 && <View style={styles.stepLine} />}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Form Block */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Submit Details</Text>
          <View style={styles.card}>
            <Input 
                label="Exness Account Number *" 
              value={accountNumber} 
              onChangeText={(t) => setAccountNumber(t.replace(/[^0-9]/g, ''))} 
              placeholder="e.g. 12345678" 
              keyboardType="number-pad"
              icon="card-account-details-outline" 
            
                error={errors.accountNumber}
                maxLength={15}
              />
            <Input 
                label="Demo Email (Optional)" 
              value={email} 
              onChangeText={setEmail} 
              placeholder="Email used on Exness" 
              keyboardType="email-address" 
              icon="email-outline" 
            
                error={errors.email}
                autoCapitalize="none"
              />
            <Input 
                label="Phone Number (Optional)" 
              value={phone} 
              onChangeText={(t) => setPhone(t.replace(/[^0-9+ ]/g, ''))} 
              placeholder="Your phone number" 
              keyboardType="phone-pad" 
              icon="phone-outline" 
            
                error={errors.phone}
                maxLength={15}
              />
            <Input 
                label="Deposit Amount" 
              value={depositAmount} 
              onChangeText={(t) => setDepositAmount(t.replace(/[^0-9]/g, ''))} 
              placeholder="e.g. 10000" 
              keyboardType="number-pad" 
              icon="cash-multiple" 
            
                error={errors.depositAmount}
                maxLength={9}
              />
            <Input 
              label="Additional Notes (Optional)" 
              value={notes} 
              onChangeText={setNotes} 
              placeholder="Any requirements..." 
              icon="note-text-outline" 
            />
            
            <View style={styles.btnWrapper}>
              <Button title="Submit Request" onPress={handleSubmit} loading={loading} />
            </View>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  content: { padding: 16 },
  
  header: { alignItems: 'center', marginVertical: 24, paddingHorizontal: 20 },
  iconWrapper: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255, 215, 0, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.2)' },
  title: { fontSize: 26, color: '#FFF', fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#A0A0A0', textAlign: 'center', lineHeight: 22 },

  card: { backgroundColor: '#12161A', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#1E2329' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
    cardTitle: { fontSize: 15, color: '#FFD700', fontWeight: '700', marginLeft: 8 },
  exnessBtn: { backgroundColor: '#FFD700', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginHorizontal: 16, marginBottom: 16, gap: 8, elevation: 4, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  exnessBtnText: { color: '#0B0E11', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  timeline: { paddingHorizontal: 16 },
  
  timeline: { paddingLeft: 4 },
  stepRow: { flexDirection: 'row', minHeight: 60 },
  stepIndicator: { alignItems: 'center', marginRight: 16 },
  stepNumBg: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  stepNumText: { color: '#0B0E11', fontSize: 12, fontWeight: '800' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#1E2329', marginVertical: -4, zIndex: 1 },
  
  stepContent: { flex: 1, paddingBottom: 20, paddingTop: 2 },
  stepTitle: { fontSize: 15, color: '#FFF', fontWeight: '600', marginBottom: 4 },
  stepDesc: { fontSize: 13, color: '#A0A0A0', lineHeight: 20 },
  
  formSection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, color: '#FFF', fontWeight: '700', marginBottom: 16, paddingLeft: 4 },
  btnWrapper: { marginTop: 16 }
});




