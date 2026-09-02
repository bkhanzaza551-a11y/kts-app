import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';
import { RiskDisclaimer } from '../../components/common/RiskDisclaimer';
import client from '../../api/client';

export const LegalScreen = ({ route }) => {
  const { slug } = route.params || {};
  const targetSlug = slug || 'privacy-policy';
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [targetSlug]);

  const stripHtml = (html) => {
    if (!html) return '';
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  };

  const fetchPage = async () => {
    try {
      const res = await client.get(`/legal/${targetSlug}`);
      setContent(res.data.data);
    } catch (e) {
      setContent({ 
        title: targetSlug === 'terms-conditions' ? 'Terms & Conditions' : 'Privacy Policy', 
        content: 'Official legal documentation for KTS 10 Pips Bots. For complete details, visit our website or contact support.' 
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  const cleanBody = content?.content ? stripHtml(content.content) : 'No content available.';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{content?.title || 'Legal Document'}</Text>
      <Text style={styles.body}>{cleanBody}</Text>
      <RiskDisclaimer style={{ marginTop: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center' },
  title: { ...TYPOGRAPHY.h2, color: COLORS.gold, marginBottom: SPACING.xl },
  body: { ...TYPOGRAPHY.body1, color: COLORS.silver, lineHeight: 24 },
});
