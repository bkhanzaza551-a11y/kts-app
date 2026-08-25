import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';
import { CurrencySwitcher } from '../../components/common/CurrencySwitcher';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MoreScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const sections = [
    { title: 'Trading', items: [
      { icon: '📊', label: 'Signals', screen: 'Signals', isTab: true },
      { icon: '🤖', label: 'My Bots', screen: 'Bots', isTab: true },
    ]},
    { title: 'Learning', items: [
      { icon: '🎓', label: 'Courses', screen: 'Education' },
      { icon: '📋', label: 'Demo Account', screen: 'Demo' },
    ]},
    { title: 'Finance', items: [
      { icon: '💳', label: 'Subscription Plans', screen: 'Payments' },
      { icon: '💰', label: 'Payment History', screen: 'PaymentHistory' },
    ]},
    { title: 'Account', items: [
      { icon: '👤', label: 'Profile', screen: 'Profile' },
      { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
    ]},
  ];

  const handleNav = (item) => {
    if (item.isTab) {
      navigation.navigate(item.screen);
    } else {
      navigation.navigate(item.screen);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      {/* Currency Switcher - Top of More */}
      <CurrencySwitcher />

      {sections.map((section, si) => (
        <View key={si} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, ii) => (
            <TouchableOpacity key={ii} style={styles.menuItem} onPress={() => handleNav(item)}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <Text style={styles.version}>KTS 10 Pips Bots v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  header: { paddingTop: 50, paddingBottom: 16 },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.white },
  section: { marginBottom: SPACING.xl },
  sectionTitle: { ...TYPOGRAPHY.caption, color: COLORS.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder, gap: 12 },
  menuIcon: { fontSize: 18, width: 24 },
  menuLabel: { ...TYPOGRAPHY.body1, color: COLORS.white, flex: 1 },
  arrow: { color: COLORS.grey, fontSize: 14 },
  version: { ...TYPOGRAPHY.body3, color: COLORS.greyDark, textAlign: 'center', marginTop: SPACING.xl },
});
