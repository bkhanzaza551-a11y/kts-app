import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { CurrencySwitcher } from '../../components/common/CurrencySwitcher';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHaptic } from '../../utils/haptics';
import { toggleHaptic } from '../../store/appSettingsSlice';

const COLORS = {
  bg: '#0B0E11',
  card: '#12161A',
  border: '#1E2329',
  gold: '#FFD700',
  white: '#FFFFFF',
  grey: '#A0A0A0',
  greyDark: '#444444'
};

export const MoreScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const hapticEnabled = useSelector(state => state.appSettings?.hapticEnabled ?? true);
  
  const sections = [
    { 
      title: 'Trading & Automation', 
      items: [
        { icon: 'chart-timeline-variant', iconColor: '#00C853', label: 'Market Signals', screen: 'Markets', isTab: true },
        { icon: 'robot-outline', iconColor: '#FFD700', label: 'AI Trading Bots', screen: 'Bots', isTab: true },
      ]
    },
    { 
      title: 'Learning & Practice', 
      items: [
        { icon: 'school-outline', iconColor: '#2196F3', label: 'Trading Academy', screen: 'Education' },
        { icon: 'monitor-dashboard', iconColor: '#00BCD4', label: 'Demo Account', screen: 'Demo' },
      ]
    },
    { 
      title: 'Finance & Billing', 
      items: [
        { icon: 'crown-outline', iconColor: '#FFD700', label: 'VIP Subscriptions', screen: 'Payments' },
        { icon: 'history', iconColor: '#9E9E9E', label: 'Payment History', screen: 'PaymentHistory' },
      ]
    },
    { 
      title: 'Account & Settings', 
      items: [
        { icon: 'account-circle-outline', iconColor: '#9C27B0', label: 'My Profile', screen: 'Profile' },
        { icon: 'bell-outline', iconColor: '#FF9800', label: 'Notification Settings', screen: 'NotificationSettings' },
        { icon: 'vibrate', iconColor: '#E91E63', label: 'Haptic Feedback', isToggle: true },
      ]
        },
    { 
      title: 'Support & Legal', 
      items: [
        { icon: 'help-circle-outline', iconColor: '#4CAF50', label: 'Help Center', screen: 'Support' },
        { icon: 'shield-check-outline', iconColor: '#607D8B', label: 'Privacy Policy', screen: 'Legal' },
      ]
    }
  ];

  const handleNav = (item) => {
    triggerHaptic('light');
    if (item.isToggle) {
      dispatch(toggleHaptic());
      return;
    }
    
    if (item.isTab) {
      navigation.navigate(item.screen);
    } else {
      navigation.navigate(item.screen);
    }
  };

  return (
    <AnimatedScreen style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Menu</Text>
        </View>

        <View style={styles.topWidget}>
          <CurrencySwitcher />
        </View>

        {sections.map((section, si) => (
          <View key={si} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.cardGroup}>
              {section.items.map((item, ii) => (
                <TouchableOpacity 
                  key={ii} 
                  style={[styles.menuRow, ii !== section.items.length - 1 && styles.borderBottom]} 
                  activeOpacity={item.isToggle ? 1 : 0.7}
                  onPress={() => handleNav(item)}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: item.iconColor + '15', borderColor: item.iconColor + '30' }]}>
                    <Icon name={item.icon} size={20} color={item.iconColor} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  
                  {item.isToggle ? (
                    <Switch
                      trackColor={{ false: '#1E2329', true: 'rgba(255, 215, 0, 0.5)' }}
                      thumbColor={hapticEnabled ? COLORS.gold : '#A0A0A0'}
                      ios_backgroundColor="#1E2329"
                      onValueChange={() => {
                        triggerHaptic('light');
                        dispatch(toggleHaptic());
                      }}
                      value={hapticEnabled}
                    />
                  ) : (
                    <Icon name="chevron-right" size={22} color="#333333" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.version}>KTS Markets v1.0.0</Text>
      </ScrollView>
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 16 },
  header: { marginBottom: 16, paddingHorizontal: 4 },
  headerTitle: { fontSize: 32, color: COLORS.white, fontWeight: '800' },
  topWidget: { marginBottom: 24 },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, color: COLORS.grey, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4 },
  cardGroup: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: COLORS.card },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1 },
  menuLabel: { flex: 1, fontSize: 16, color: COLORS.white, fontWeight: '600' },
  version: { fontSize: 13, color: COLORS.greyDark, textAlign: 'center', marginTop: 10, fontWeight: '500' }
});




