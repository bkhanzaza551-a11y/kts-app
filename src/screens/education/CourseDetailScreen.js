import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import client from '../../api/client';

export const CourseDetailScreen = ({ route, navigation }) => {
  const { courseId } = route.params;
  const [course, setCourse] = React.useState(null);

  useEffect(() => {
    client.get(`/courses/${courseId}`).then(r => setCourse(r.data.data)).catch(() => {});
  }, [courseId]);

  if (!course) return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{course.title}</Text>
      <View style={styles.metaRow}>
        <Badge text={course.difficulty?.toUpperCase()} variant={course.difficulty === 'beginner' ? 'win' : 'active'} />
        <Text style={styles.meta}>{course.estimated_hours}h • {course.lessons?.length || 0} lessons</Text>
      </View>
      <Text style={styles.desc}>{course.description}</Text>

      <Text style={styles.sectionTitle}>Lessons</Text>
      {course.lessons?.map((lesson, i) => (
        <Card key={lesson.id} style={styles.lessonCard}>
          <View style={styles.lessonRow}>
            <View style={styles.lessonNum}><Text style={styles.lessonNumText}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonMeta}>{lesson.duration_minutes || '--'} min</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </View>
        </Card>
      ))}
      {(!course.lessons || course.lessons.length === 0) && <Text style={styles.noLessons}>No lessons yet</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  loading: { color: COLORS.white, textAlign: 'center', marginTop: 100 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.white },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: SPACING.md, marginBottom: SPACING.lg },
  meta: { ...TYPOGRAPHY.body3, color: COLORS.grey },
  desc: { ...TYPOGRAPHY.body1, color: COLORS.silver, lineHeight: 24, marginBottom: SPACING.xl },
  sectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.white, marginBottom: SPACING.md },
  lessonCard: { marginBottom: SPACING.md },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  lessonNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.goldMuted, alignItems: 'center', justifyContent: 'center' },
  lessonNumText: { ...TYPOGRAPHY.body3, color: COLORS.gold, fontWeight: '700' },
  lessonTitle: { ...TYPOGRAPHY.body1, color: COLORS.white },
  lessonMeta: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginTop: 2 },
  arrow: { color: COLORS.gold, fontSize: 18 },
  noLessons: { ...TYPOGRAPHY.body2, color: COLORS.grey, textAlign: 'center', marginTop: 20 },
});
