import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '../../components/common/Button';
import { logout } from '../../store/authSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '../../api/auth';
import { RiskDisclaimer } from '../../components/common/RiskDisclaimer';

const COLORS = {
  bg: '#0B0E11',
  card: '#12161A',
  border: '#1E2329',
  gold: '#FFD700',
  white: '#FFFFFF',
  grey: '#A0A0A0',
  red: '#FF4444'
};

export const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const insets = useSafeAreaInsets();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Log Out", 
          style: "destructive",
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account Permanently",
      "Are you sure you want to permanently delete your account? All your personal data, linked accounts, and app history will be permanently erased. This action CANNOT be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Delete My Account", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await authApi.deleteAccount();
              Alert.alert("Account Deleted", "Your account and associated data have been permanently removed.");
              dispatch(logout());
            } catch (err) {
              setIsDeleting(false);
              Alert.alert("Deletion Failed", err.response?.data?.message || "Failed to delete account. Please try again or contact support.");
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    { icon: 'account-cog-outline', label: 'Setup / Complete Profile (3 Steps)', screen: 'ProfileOnboarding', color: '#FFD700' },
    { icon: 'account-edit-outline', label: 'Edit Profile Details', screen: 'EditProfile', color: '#2196F3' },
    { icon: 'lock-outline', label: 'Change Password', screen: 'ChangePassword', color: '#9C27B0' },
    { icon: 'shield-lock-outline', label: 'Change Security Code', screen: 'ChangeSecurityCode', color: '#00BCD4' },
    { icon: 'file-document-outline', label: 'Privacy Policy', screen: 'Legal', params: { slug: 'privacy-policy' }, color: '#9E9E9E' },
    { icon: 'file-certificate-outline', label: 'Terms & Conditions', screen: 'Legal', params: { slug: 'terms-conditions' }, color: '#607D8B' },
    { icon: 'help-circle-outline', label: 'Help & Support', screen: null, color: '#FF9800' },
  ];

  const handleNav = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen, item.params);
    } else {
      Alert.alert('Coming Soon', 'Support portal will be available soon!');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={{ width: 88, height: 88, borderRadius: 44 }} />
            ) : (
              <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'K'}</Text>
            )}
            <View style={styles.verifiedBadge}>
              <Icon name="check-decagram" size={16} color="#0B0E11" />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || 'KTS Trader'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@ktsmarkets.com'}</Text>
          {user?.city && user?.country && (
            <Text style={styles.userLocation}>
              <Icon name="map-marker" size={14} color={COLORS.gold} /> {user.city}, {user.country}
            </Text>
          )}
        </View>

        <View style={styles.cardGroup}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.menuRow, index !== menuItems.length - 1 && styles.borderBottom]} 
              activeOpacity={0.7}
              onPress={() => handleNav(item)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: item.color + '15', borderColor: item.color + '30' }]}>
                <Icon name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Icon name="chevron-right" size={22} color="#333333" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutCard} activeOpacity={0.8} onPress={handleLogout}>
          <Icon name="logout" size={22} color={COLORS.red} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Delete Account (Mandatory for Google Play Policy) */}
        <TouchableOpacity 
          style={styles.deleteCard} 
          activeOpacity={0.8} 
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <>
              <Icon name="account-remove-outline" size={20} color="#FF6B6B" />
              <Text style={styles.deleteText}>Delete Account</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Financial Risk Warning */}
        <RiskDisclaimer compact style={{ marginTop: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16 },
  
  avatarSection: { alignItems: 'center', paddingVertical: 32 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  avatarText: { fontSize: 36, color: '#0B0E11', fontWeight: '800' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#00C853', width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.bg },
  userName: { fontSize: 24, color: COLORS.white, fontWeight: '800', marginBottom: 4 },
  userEmail: { fontSize: 14, color: COLORS.grey, fontWeight: '500' },
  userLocation: { fontSize: 13, color: COLORS.gold, fontWeight: '600', marginTop: 4 },
  
  cardGroup: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: 24 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: COLORS.card },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  
  iconWrapper: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1 },
  menuLabel: { flex: 1, fontSize: 16, color: COLORS.white, fontWeight: '600' },
  
  logoutCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 68, 68, 0.1)', paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 68, 68, 0.3)', gap: 8, marginBottom: 12 },
  logoutText: { fontSize: 16, color: COLORS.red, fontWeight: '800' },
  deleteCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 6 },
  deleteText: { fontSize: 14, color: '#FF6B6B', fontWeight: '600' }
});
