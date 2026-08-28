import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const { width, height } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

export const SideMenu = ({ isVisible, onClose, navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -MENU_WIDTH, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true })
      ]).start();
    }
  }, [isVisible]);

  if (!isVisible && slideAnim._value === -MENU_WIDTH) return null;

  const menuItems = [
    { icon: 'account-circle-outline', title: 'My Profile', screen: 'Profile' },
    { icon: 'crown-outline', title: 'VIP Plans', screen: 'Payments' },
    { icon: 'shield-check-outline', title: 'Security', screen: 'ChangePassword' },
    { icon: 'bell-outline', title: 'Notifications', screen: 'Notifications' },
    { icon: 'cog-outline', title: 'Settings', screen: 'MoreHome' },
    { icon: 'help-circle-outline', title: 'Support & Help', screen: null },
  ];

  const handlePress = (item) => {
    onClose();
    if (item.screen) {
      navigation.navigate('More', { screen: item.screen });
    } else {
      alert("Support portal will be available soon!");
    }
  };

  const handleLogout = () => {
    onClose();
    dispatch(logout());
  };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents={isVisible ? 'auto' : 'none'}>
      {/* Dark Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sliding Menu */}
      <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }], paddingTop: insets.top + 20 }]}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Icon name="account" size={36} color="#0B0E11" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'KTS Trader'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@ktsmarkets.com'}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Icon name="check-decagram" size={14} color="#00C853" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Menu Items */}
        <View style={styles.menuItemsList}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handlePress(item)}>
              <Icon name={item.icon} size={22} color="#A0A0A0" style={styles.menuIcon} />
              <Text style={styles.menuText}>{item.title}</Text>
              <Icon name="chevron-right" size={20} color="#333" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Actions */}
        <View style={[styles.bottomActions, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 30 }]}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Icon name="logout" size={22} color="#FF4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <Text style={styles.appVersion}>KTS Markets v1.0.0</Text>
        </View>

      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  menuContainer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: MENU_WIDTH, backgroundColor: '#12161A', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, elevation: 20 },
  
  profileHeader: { paddingHorizontal: 20, marginBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  profileInfo: { marginBottom: 10 },
  profileName: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  profileEmail: { fontSize: 13, color: '#A0A0A0', marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,200,83,0.1)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  verifiedText: { color: '#00C853', fontSize: 11, fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#1E2329', marginHorizontal: 20, marginBottom: 15 },
  
  menuItemsList: { flex: 1, paddingHorizontal: 15 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 5 },
  menuIcon: { marginRight: 15 },
  menuText: { flex: 1, fontSize: 15, color: '#EAEAEA', fontWeight: '500' },
  
  bottomActions: { paddingHorizontal: 20, borderTopWidth: 1, borderColor: '#1E2329', paddingTop: 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  logoutText: { fontSize: 15, color: '#FF4444', fontWeight: '700' },
  appVersion: { fontSize: 11, color: '#666', marginTop: 15 }
});
