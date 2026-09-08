import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logout } from '../../store/authSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '../../api/auth';
import { RiskDisclaimer } from '../../components/common/RiskDisclaimer';
import { CurrencySwitcher } from '../../components/common/CurrencySwitcher';
import { triggerHaptic } from '../../utils/haptics';

const COLORS = {
  bg: '#080A0C',
  card: '#101418',
  cardSecondary: '#14181E',
  border: '#1E242C',
  gold: '#FFD700',
  goldMuted: 'rgba(255, 215, 0, 0.1)',
  white: '#FFFFFF',
  grey: '#94A3B8',
  greyDark: '#64748B',
  red: '#EF4444',
  green: '#10B981',
};

export const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const insets = useSafeAreaInsets();
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = user?.name?.trim() 
    ? user.name 
    : (user?.email ? user.email.split('@')[0] : 'KTS Trader');

  const initials = (displayName.charAt(0) || 'K').toUpperCase();

  const handleLogout = () => {
    triggerHaptic('light');
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: () => {
            triggerHaptic('light');
            dispatch(logout());
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    triggerHaptic('light');
    Alert.alert(
      "Delete Account Permanently",
      "Are you sure you want to permanently delete your account? All your personal data, bot configs, and app history will be permanently erased. This action CANNOT be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Delete Account", 
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

  const sections = [
    {
      title: 'Account & Security',
      items: [
        { 
          icon: 'account-circle', 
          label: 'Edit Profile Details', 
          subtitle: 'Name, phone & location settings',
          screen: 'EditProfile', 
          color: '#FFD700' 
        },
        { 
          icon: 'lock-reset', 
          label: 'Change Password', 
          subtitle: 'Update your account login password',
          screen: 'ChangePassword', 
          color: '#38BDF8' 
        },
        { 
          icon: 'badge-account-horizontal-outline', 
          label: 'Complete Profile Setup', 
          subtitle: '3-step trader onboarding',
          screen: 'ProfileOnboarding', 
          color: '#F59E0B' 
        },
      ]
    },
    {
      title: 'App Preferences',
      items: [
        { 
          icon: 'bell-ring-outline', 
          label: 'Notification Alerts', 
          subtitle: 'Push signals & market updates',
          screen: 'NotificationSettings', 
          color: '#A78BFA' 
        },
      ]
    },
    {
      title: 'Support & Legal',
      items: [
        { 
          icon: 'headset', 
          label: 'Help & Trader Support', 
          subtitle: '24/7 Live assistance & FAQs',
          screen: 'Support', 
          color: '#FB923C' 
        },
        { 
          icon: 'shield-check-outline', 
          label: 'Privacy Policy', 
          subtitle: 'Data protection & compliance',
          screen: 'Legal', 
          params: { slug: 'privacy-policy' }, 
          color: '#94A3B8' 
        },
        { 
          icon: 'file-document-outline', 
          label: 'Terms & Conditions', 
          subtitle: 'User agreement & trading risk rules',
          screen: 'Legal', 
          params: { slug: 'terms-conditions' }, 
          color: '#94A3B8' 
        },
      ]
    }
  ];

  const handleNav = (item) => {
    triggerHaptic('light');
    if (item.screen) {
      navigation.navigate(item.screen, item.params);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={[styles.navHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Profile</Text>
        <View style={styles.headerRight}>
          <CurrencySwitcher compact={true} />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Hero Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarGlow} />
            <View style={styles.avatar}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View style={styles.verifiedBadge}>
              <Icon name="check-decagram" size={18} color="#00C853" />
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
            <View style={styles.emailRow}>
              <Icon name="email-outline" size={13} color={COLORS.greyDark} />
              <Text style={styles.userEmail} numberOfLines={1}>{user?.email || 'user@ktsmarkets.com'}</Text>
            </View>

            <View style={styles.tagsRow}>
              <View style={styles.tierBadge}>
                <Icon name="crown" size={12} color="#FFD700" />
                <Text style={styles.tierText}>KTS TRADER</Text>
              </View>
              {user?.city && (
                <View style={styles.locationBadge}>
                  <Icon name="map-marker-outline" size={12} color={COLORS.grey} />
                  <Text style={styles.locationText}>{user.city}{user.country ? `, ${user.country}` : ''}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {sections.map((section, sIndex) => (
          <View key={sIndex} style={styles.sectionWrapper}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            <View style={styles.cardGroup}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={itemIndex} 
                  style={[
                    styles.menuRow, 
                    itemIndex !== section.items.length - 1 && styles.borderBottom
                  ]} 
                  activeOpacity={0.7}
                  onPress={() => handleNav(item)}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: item.color + '15', borderColor: item.color + '30' }]}>
                    <Icon name={item.icon} size={20} color={item.color} />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {item.subtitle ? (
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    ) : null}
                  </View>
                  <Icon name="chevron-right" size={20} color="#475569" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
          <Icon name="logout-variant" size={20} color={COLORS.red} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Delete Account (Google Play Required) */}
        <TouchableOpacity 
          style={styles.deleteBtn} 
          activeOpacity={0.8} 
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Icon name="delete-outline" size={16} color="#EF4444" />
              <Text style={styles.deleteText}>Delete Account & Data</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Version Footer */}
        <Text style={styles.versionText}>KTS Markets • Version 1.0.0</Text>

        {/* Risk Disclaimer */}
        <RiskDisclaimer compact style={{ marginTop: 16 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.bg 
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#0A0D10',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#12161A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  headerRight: {
    minWidth: 36,
    alignItems: 'flex-end',
  },

  content: { 
    padding: 16 
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  avatar: { 
    width: 66, 
    height: 66, 
    borderRadius: 33, 
    backgroundColor: '#1C222B', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  avatarImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  avatarText: { 
    fontSize: 26, 
    color: COLORS.gold, 
    fontWeight: '800' 
  },
  verifiedBadge: { 
    position: 'absolute', 
    bottom: -2, 
    right: -2, 
    backgroundColor: '#080A0C', 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E242C',
  },
  userInfo: {
    flex: 1,
  },
  userName: { 
    fontSize: 18, 
    color: COLORS.white, 
    fontWeight: '700', 
    marginBottom: 3,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  userEmail: { 
    fontSize: 12, 
    color: COLORS.greyDark, 
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: 4,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 0.5,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  locationText: {
    fontSize: 10,
    color: COLORS.grey,
    fontWeight: '500',
  },

  sectionWrapper: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.greyDark,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  cardGroup: { 
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    overflow: 'hidden' 
  },
  menuRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 13, 
    paddingHorizontal: 14, 
    backgroundColor: COLORS.card 
  },
  borderBottom: { 
    borderBottomWidth: 1, 
    borderBottomColor: '#181E26' 
  },
  iconWrapper: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12, 
    borderWidth: 1 
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: { 
    fontSize: 14, 
    color: COLORS.white, 
    fontWeight: '600',
    marginBottom: 1,
  },
  menuSubtitle: {
    fontSize: 11,
    color: COLORS.greyDark,
    fontWeight: '400',
  },

  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(239, 68, 68, 0.08)', 
    paddingVertical: 14, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: 'rgba(239, 68, 68, 0.25)', 
    gap: 8, 
    marginTop: 8,
    marginBottom: 14,
  },
  logoutText: { 
    fontSize: 14, 
    color: COLORS.red, 
    fontWeight: '700' 
  },

  deleteBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 8, 
    gap: 6,
    alignSelf: 'center',
    marginBottom: 8,
  },
  deleteText: { 
    fontSize: 12, 
    color: '#EF4444', 
    fontWeight: '600' 
  },

  versionText: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 4,
  },
});
