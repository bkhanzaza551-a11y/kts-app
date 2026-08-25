import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import client from '../../api/client';

export const DemoAccountScreen = () => {
  const { user } = useSelector(s => s.auth);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('standard');
  const [depositAmount, setDepositAmount] = useState('10000');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = React.useState(null);

  React.useEffect(() => {
    client.get('/demo-account/instructions').then(r => setInstructions(r.data.data)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!accountNumber) { Alert.alert('Error', 'Account number is required'); return; }
    setLoading(true);
    try {
      await client.post('/demo-account/request', {
        exness_account_number: accountNumber,
        account_type: accountType,
        deposit_amount: depositAmount,
        demo_email: email,
        demo_phone: phone,
        user_notes: notes,
      });
      Alert.alert('Success', 'Your demo account request has been submitted!', [{ text: 'OK' }]);
    } catch (e) { Alert.alert('Error', e.message); }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Demo Account</Text>
      <Text style={styles.subtitle}>Request a demo account or link your Exness account</Text>

      {instructions && (
        <Card style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>{instructions.title || 'How to Create'}</Text>
          {instructions.steps?.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>{step.step || i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.description}</Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      <Text style={styles.formTitle}>Submit Request</Text>
      <Card>
        <Input label="Exness Account Number" value={accountNumber} onChangeText={setAccountNumber} placeholder="Your account number" icon="🏦" />
        <Input label="Demo Email (optional)" value={email} onChangeText={setEmail} placeholder="Email used on Exness" keyboardType="email-address" icon="📧" />
        <Input label="Phone (optional)" value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" icon="📱" />
        <Input label="Deposit Amount" value={depositAmount} onChangeText={setDepositAmount} placeholder="e.g. 10000" keyboardType="number-pad" icon="💵" />
        <Input label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Any additional notes" icon="📝" />
        <Button title="Submit Request" onPress={handleSubmit} loading={loading} />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.white },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.silver, marginTop: 8, marginBottom: SPACING.xl },
  instructionCard: { marginBottom: SPACING.xl },
  instructionTitle: { ...TYPOGRAPHY.h4, color: COLORS.gold, marginBottom: SPACING.md },
  stepRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.goldMuted, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { ...TYPOGRAPHY.caption, color: COLORS.gold, fontWeight: '700' },
  stepTitle: { ...TYPOGRAPHY.body2, color: COLORS.white, fontWeight: '600' },
  stepDesc: { ...TYPOGRAPHY.body3, color: COLORS.silver, marginTop: 2 },
  formTitle: { ...TYPOGRAPHY.h4, color: COLORS.white, marginBottom: SPACING.md },
});
