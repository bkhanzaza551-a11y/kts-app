import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '../../components/common/Button';
import { logout } from '../../store/authSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const menuItems = [
    { icon: 'account-edit-outline', label: 'Edit Profile', screen: 'EditProfile', color: '#2196F3' },
    { icon: 'lock-outline', label: 'Change Password', screen: 'ChangePassword', color: '#9C27B0' },
    { icon: 'shield-lock-outline', label: 'Change Security Code', screen: 'ChangeSecurityCode', color: '#00BCD4' },
    { icon: 'file-document-outline', label: 'Privacy Policy', screen: 'Legal', params: { slug: 'privacy-policy' }, color: '#9E9E9E' },
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
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'K'}</Text>
            <View style={styles.verifiedBadge}>
              <Icon name="check-decagram" size={16} color="#0B0E11" />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || 'KTS Trader'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@ktsmarkets.com'}</Text>
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
  
  cardGroup: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginBottom: 24 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: COLORS.card },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  
  iconWrapper: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1 },
  menuLabel: { flex: 1, fontSize: 16, color: COLORS.white, fontWeight: '600' },
  
  logoutCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 68, 68, 0.1)', paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 68, 68, 0.3)', gap: 8 },
  logoutText: { fontSize: 16, color: COLORS.red, fontWeight: '800' }
});
