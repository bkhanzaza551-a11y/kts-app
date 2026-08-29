import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatRelativeTime } from '../../utils/formatters';

export const NewsDetailScreen = ({ route, navigation }) => {
  const { news } = route.params;
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const getIconAndColor = (type) => {
    switch (type) {
      case 'success': return { icon: 'check-circle', color: '#00C853' };
      case 'warning': return { icon: 'alert', color: '#FF9800' };
      case 'danger': return { icon: 'alert-circle', color: '#FF4444' };
      default: return { icon: 'information', color: '#2196F3' };
    }
  };

  const theme = getIconAndColor(news.type);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.heroCard}>
          <View style={[styles.iconBox, { backgroundColor: `${theme.color}20` }]}>
            <Icon name={theme.icon} size={36} color={theme.color} />
          </View>
          <Text style={styles.title}>{news.title}</Text>
          <View style={styles.metaRow}>
            <Icon name="clock-outline" size={14} color="#888" />
            <Text style={styles.date}>{new Date(news.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(news.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>

        <View style={styles.bodyCard}>
          <Text style={styles.bodyText}>{news.body}</Text>
        </View>
        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E11' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, backgroundColor: '#12161A', borderBottomWidth: 1, borderBottomColor: '#1E2329' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, color: COLORS.white, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  
  heroCard: { alignItems: 'center', marginBottom: 24 },
  iconBox: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 24, color: COLORS.white, fontWeight: '800', textAlign: 'center', marginBottom: 12, lineHeight: 32 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  date: { fontSize: 13, color: '#888', fontWeight: '500' },

  bodyCard: { backgroundColor: '#12161A', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#1E2329' },
  bodyText: { fontSize: 16, color: '#D0D0D0', lineHeight: 26, letterSpacing: 0.3 }
});
