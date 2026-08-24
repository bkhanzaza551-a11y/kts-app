import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';
import client from '../../api/client';

export const LegalScreen = ({ route }) => {
  const { slug } = route.params || {};
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const res = await client.get(`/legal/${slug}`);
      setContent(res.data.data);
    } catch (e) {
      setContent({ title: 'Page Not Found', content: 'This page could not be loaded.' });
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{content?.title || 'Legal'}</Text>
      <Text style={styles.body}>{content?.content || 'No content available.'}</Text>
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
