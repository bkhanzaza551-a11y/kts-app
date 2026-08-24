import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SPACING, RADIUS } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { fetchCourses } from '../../store/educationSlice';

const DIFFICULTY_COLORS = { beginner: COLORS.green, intermediate: COLORS.orange, advanced: COLORS.red };

export const CourseListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { courses, isLoading } = useSelector(s => s.education);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => { dispatch(fetchCourses()); }, []);
  const onRefresh = async () => { setRefreshing(true); await dispatch(fetchCourses()); setRefreshing(false); };

  const renderCourse = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: DIFFICULTY_COLORS[item.difficulty] || COLORS.gold }]}>
          <Text style={styles.iconText}>{item.difficulty?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.estimated_hours}h • {item.lessons_count || 0} lessons</Text>
        </View>
      </View>
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.footer}>
        <Badge text={item.difficulty?.toUpperCase()} variant={item.difficulty === 'beginner' ? 'win' : item.difficulty === 'advanced' ? 'sell' : 'active'} />
        <Text style={styles.price}>{item.is_free ? 'FREE' : `$${item.price}`}</Text>
      </View>
    </Card>
  );

  return (
    <FlatList
      style={styles.container}
      data={courses}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderCourse}
      ListEmptyComponent={!isLoading ? <EmptyState icon="🎓" title="No Courses" message="Courses coming soon" /> : null}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  list: { padding: SPACING.screen, paddingBottom: 40 },
  card: { marginBottom: SPACING.lg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  iconText: { ...TYPOGRAPHY.h4, color: COLORS.black },
  title: { ...TYPOGRAPHY.h4, color: COLORS.white },
  meta: { ...TYPOGRAPHY.body3, color: COLORS.grey, marginTop: 2 },
  desc: { ...TYPOGRAPHY.body2, color: COLORS.silver, marginBottom: SPACING.md },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { ...TYPOGRAPHY.h4, color: COLORS.gold },
});
