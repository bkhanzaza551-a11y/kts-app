import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import client from '../../api/client';
import { storage } from '../../utils/storage';

export const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [demoAccountId, setDemoAccountId] = useState('');
  const [demoAccountServer, setDemoAccountServer] = useState('');
  const [realAccountId, setRealAccountId] = useState('');
  const [realAccountServer, setRealAccountServer] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarUri, setAvatarUri] = useState(null);

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
      setDemoAccountServer(u.demo_account_server || '');
      setRealAccountId(u.real_account_id || '');
      setRealAccountServer(u.real_account_server || '');
      setBrokerName(u.broker_name || '');
      if (u.avatar) setAvatarUri(u.avatar);
    } catch (e) {
      Alert.alert('Error', 'Failed to load profile');
    }
    setLoading(false);
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', maxWidth: 512, maxHeight: 512, quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to pick image');
        return;
      }
      if (response.assets && response.assets[0]) {
        setAvatar(response.assets[0]);
        setAvatarUri(response.assets[0].uri);
      }
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      formData.append('demo_account_id', demoAccountId.trim());
      formData.append('demo_account_server', demoAccountServer.trim());
      formData.append('real_account_id', realAccountId.trim());
      formData.append('real_account_server', realAccountServer.trim());
      formData.append('broker_name', brokerName.trim());

      if (avatar) {
        formData.append('avatar', {
          uri: avatar.uri,
          type: avatar.type || 'image/jpeg',
          name: avatar.fileName || 'avatar.jpg',
        });
      }

      await client.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar Section */}
      <TouchableOpacity style={styles.avatarSection} onPress={pickImage}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{name.charAt(0) || 'U'}</Text>
          </View>
        )}
        <View style={styles.cameraIcon}>
          <Text style={styles.cameraIconText}>📷</Text>
        </View>
        <Text style={styles.avatarHint}>Tap to change photo</Text>
      </TouchableOpacity>

      {/* Personal Info */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.grey}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+92 300 1234567"
            placeholderTextColor={COLORS.grey}
            keyboardType="phone-pad"
          />
        </View>
      </Card>

      {/* Trading Account */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Trading Account</Text>
          <Badge text="Optional" variant="default" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Broker Name</Text>
          <TextInput
            style={styles.input}
            value={brokerName}
            onChangeText={setBrokerName}
            placeholder="e.g. Exness, XM, IC Markets"
            placeholderTextColor={COLORS.grey}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>DEMO ACCOUNT</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Demo Account ID</Text>
          <TextInput
            style={styles.input}
            value={demoAccountId}
            onChangeText={setDemoAccountId}
            placeholder="e.g. 12345678"
            placeholderTextColor={COLORS.grey}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Demo Server</Text>
          <TextInput
            style={styles.input}
            value={demoAccountServer}
            onChangeText={setDemoAccountServer}
            placeholder="e.g. Exness-MT5Trial"
            placeholderTextColor={COLORS.grey}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>REAL ACCOUNT</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Real Account ID</Text>
          <TextInput
            style={styles.input}
            value={realAccountId}
            onChangeText={setRealAccountId}
            placeholder="e.g. 87654321"
            placeholderTextColor={COLORS.grey}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Real Server</Text>
          <TextInput
            style={styles.input}
            value={realAccountServer}
            onChangeText={setRealAccountServer}
            placeholder="e.g. Exness-MT5Real"
            placeholderTextColor={COLORS.grey}
          />
        </View>
      </Card>

      <Button
        title={saving ? 'Saving...' : 'Save Profile'}
        onPress={handleSave}
        disabled={saving}
        style={styles.saveBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...TYPOGRAPHY.body2, color: COLORS.grey, marginTop: SPACING.md },

  avatarSection: { alignItems: 'center', paddingVertical: SPACING.xl, marginBottom: SPACING.md },
  avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.gold },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...TYPOGRAPHY.h1, color: COLORS.black, fontSize: 36 },
  cameraIcon: { position: 'absolute', bottom: 20, right: '30%', width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.darkCard, borderWidth: 2, borderColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
  cameraIconText: { fontSize: 14 },
  avatarHint: { ...TYPOGRAPHY.body3, color: COLORS.grey, marginTop: SPACING.sm },

  card: { marginBottom: SPACING.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardTitle: { ...TYPOGRAPHY.h4, color: COLORS.white, marginBottom: SPACING.md },
  field: { marginBottom: SPACING.md },
  label: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.darkSurface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    color: COLORS.white,
    ...TYPOGRAPHY.body1,
  },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.darkBorder },
  dividerText: { ...TYPOGRAPHY.caption, color: COLORS.gold, marginHorizontal: SPACING.md, letterSpacing: 1 },

  saveBtn: { marginTop: SPACING.md, marginBottom: SPACING.xxl },
});
