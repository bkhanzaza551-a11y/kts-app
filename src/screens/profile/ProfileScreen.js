import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CurrencySwitcher } from '../../components/common/CurrencySwitcher';
import { logout } from '../../store/authSlice';

export const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  const menuItems = [
    { icon: '✏️', label: 'Edit Profile', screen: 'EditProfile' },
    { icon: '🔒', label: 'Change Password', screen: 'ChangePassword' },
    { icon: '🔑', label: 'Change Security Code', screen: 'ChangeSecurityCode' },
    { icon: '📜', label: 'Privacy Policy', screen: 'Legal', params: { slug: 'privacy-policy' } },
    { icon: '📜', label: 'Terms & Conditions', screen: 'Legal', params: { slug: 'terms-conditions' } },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Currency Switcher */}
      <CurrencySwitcher />

      {menuItems.map((item, i) => (
        <TouchableOpacity key={i} style={styles.menuItem} onPress={() => navigation.navigate(item.screen, item.params)}>
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <Text style={styles.menuLabel}>{item.label}</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      ))}

      <Button title="Sign Out" variant="outline" onPress={() => dispatch(logout())} style={styles.logoutBtn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: SPACING.xxl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  avatarText: { ...TYPOGRAPHY.h1, color: COLORS.black },
  name: { ...TYPOGRAPHY.h3, color: COLORS.white },
  email: { ...TYPOGRAPHY.body2, color: COLORS.silver, marginTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder, gap: 12 },
  menuIcon: { fontSize: 18, width: 24 },
  menuLabel: { ...TYPOGRAPHY.body1, color: COLORS.white, flex: 1 },
  menuArrow: { color: COLORS.gold, fontSize: 16 },
  logoutBtn: { marginTop: SPACING.xxl },
});
