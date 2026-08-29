import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { fetchNotificationSettings, toggleNotificationSetting, toggleAllCategory } from '../../store/notificationSettingsSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { triggerHaptic } from '../../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native-gesture-handler';

const CATEGORY_NAMES = {
  signals: 'Signals', bots: 'MT5 Bots', payments: 'Payments', chat: 'Chat',
  education: 'Education', system: 'System', security: 'Security', demo: 'Demo Account',
};

const CATEGORY_ICONS = {
  signals: 'chart-line', bots: 'robot', payments: 'credit-card', chat: 'chat',
  education: 'school', system: 'cog', security: 'shield', demo: 'clipboard-text',
};

export const NotificationSettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { settings, grouped, isLoading } = useSelector((s) => s.notificationSettings);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    dispatch(fetchNotificationSettings());
  }, [dispatch]);

  const handleToggle = (slug) => {
    triggerHaptic('light');
    dispatch(toggleNotificationSetting(slug));
  };

  const handleToggleCategory = (category, value) => {
    triggerHaptic('light');
    dispatch(toggleAllCategory({ category, value }));
  };

  if (isLoading && !settings.length) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={COLORS.gold} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {Object.keys(grouped).filter(cat => cat !== 'bots').map((category) => {
          const categorySettings = grouped[category];
          const enabledCount = categorySettings.filter(s => s.is_enabled).length;
          const allEnabled = enabledCount === categorySettings.length;

          return (
            <View key={category} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryTitleRow}>
                  <Icon name={CATEGORY_ICONS[category] || 'bell'} size={24} color={COLORS.gold} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.categoryName}>{CATEGORY_NAMES[category] || category}</Text>
                    <Text style={styles.categorySub}>{enabledCount} of {categorySettings.length} enabled</Text>
                  </View>
                </View>
                <Switch
                  value={allEnabled}
                  onValueChange={(val) => handleToggleCategory(category, val)}
                  trackColor={{ false: '#333', true: 'rgba(255, 215, 0, 0.5)' }}
                  thumbColor={allEnabled ? COLORS.gold : '#888'}
                />
              </View>

              <View style={styles.settingItems}>
                {categorySettings.map(setting => (
                  <View key={setting.id} style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingName}>{setting.name}</Text>
                      {setting.description ? <Text style={styles.settingDesc}>{setting.description}</Text> : null}
                    </View>
                    <Switch
                      value={setting.is_enabled}
                      onValueChange={() => handleToggle(setting.slug)}
                      trackColor={{ false: '#333', true: 'rgba(0, 200, 83, 0.5)' }}
                      thumbColor={setting.is_enabled ? '#00C853' : '#888'}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, backgroundColor: '#12161A', borderBottomWidth: 1, borderBottomColor: '#1E2329' },
  headerTitle: { fontSize: 18, color: COLORS.white, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  
  categoryCard: { backgroundColor: '#12161A', borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1E2329', overflow: 'hidden' },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A2026', borderBottomWidth: 1, borderBottomColor: '#1E2329' },
  categoryTitleRow: { flexDirection: 'row', alignItems: 'center' },
  categoryName: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
  categorySub: { fontSize: 12, color: '#888', marginTop: 2 },
  
  settingItems: { padding: 16 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  settingInfo: { flex: 1, paddingRight: 16 },
  settingName: { fontSize: 15, color: COLORS.white, fontWeight: '600' },
  settingDesc: { fontSize: 12, color: '#888', marginTop: 4 },
});

