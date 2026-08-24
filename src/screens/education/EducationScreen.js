import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import client from '../../api/client';

export const EducationScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    client.get('/courses').then(r => setCourses(r.data.data?.data || r.data.data || [])).catch(() => {});
    client.get('/education/categories').then(r => setCategories(r.data.data || [])).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const DIFFICULTY_COLORS = { beginner: COLORS.green, intermediate: COLORS.orange, advanced: COLORS.red };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); load(); setRefreshing(false); }} tintColor={COLORS.gold} />}>
      <Text style={styles.headerTitle}>Education</Text>

      {categories.length > 0 && (
        <View style={styles.catRow}>
          {categories.map(c => (
            <View key={c.id} style={[styles.catChip, { borderColor: c.color || COLORS.gold }]}>
              <Text style={[styles.catText, { color: c.color || COLORS.gold }]}>{c.name}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Courses</Text>
      {courses.map(course => (
        <Card key={course.id} style={styles.card} onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}>
          <View style={styles.courseHeader}>
            <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[course.difficulty] || COLORS.gold }]}>
              <Text style={styles.diffText}>{course.difficulty?.charAt(0)?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseMeta}>{course.estimated_hours}h • {course.lessons_count || 0} lessons</Text>
            </View>
            <Text style={styles.price}>{course.is_free ? 'FREE' : `$${course.price}`}</Text>
          </View>
          <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>
        </Card>
      ))}
      {courses.length === 0 && <Text style={styles.empty}>No courses available yet</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  content: { padding: SPACING.screen, paddingBottom: 40 },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.white, marginBottom: SPACING.lg },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, backgroundColor: COLORS.darkCard },
  catText: { ...TYPOGRAPHY.body3, fontWeight: '600' },
  sectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.white, marginBottom: SPACING.md },
  card: { marginBottom: SPACING.md },
  courseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  diffBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  diffText: { ...TYPOGRAPHY.h4, color: COLORS.black },
  courseTitle: { ...TYPOGRAPHY.body1, color: COLORS.white, fontWeight: '600' },
  courseMeta: { ...TYPOGRAPHY.caption, color: COLORS.grey, marginTop: 2 },
  price: { ...TYPOGRAPHY.body1, color: COLORS.gold, fontWeight: '700' },
  courseDesc: { ...TYPOGRAPHY.body3, color: COLORS.silver, lineHeight: 18 },
  empty: { ...TYPOGRAPHY.body2, color: COLORS.grey, textAlign: 'center', marginTop: 40 },
});
