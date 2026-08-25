import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { fetchCourses, fetchCategories } from '../../store/educationSlice';
import { useCurrency } from '../../context/CurrencyContext';

export const EducationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { courses, categories, isLoading } = useSelector(s => s.education);
  const [refreshing, setRefreshing] = React.useState(false);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchCategories());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchCourses()), dispatch(fetchCategories())]);
    setRefreshing(false);
  };

  const DIFFICULTY_COLORS = { beginner: COLORS.green, intermediate: COLORS.orange, advanced: COLORS.red };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}>
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
            <Text style={styles.price}>{course.is_free ? 'FREE' : formatAmount(course.price)}</Text>
          </View>
          <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>
        </Card>
      ))}
      {!isLoading && courses.length === 0 && <EmptyState icon="🎓" title="No Courses" message="No courses available yet" />}
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
});
