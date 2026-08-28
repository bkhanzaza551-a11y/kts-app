import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchCourses, fetchCategories } from '../../store/educationSlice';
import { useCurrency } from '../../context/CurrencyContext';
import { Skeleton } from '../../components/common/Skeleton';

const COLORS = {
  bg: '#0B0E11',
  card: '#12161A',
  border: '#1E2329',
  gold: '#FFD700',
  goldMuted: 'rgba(255, 215, 0, 0.1)',
  white: '#FFFFFF',
  grey: '#A0A0A0',
  green: '#00C853',
  orange: '#FF9800',
  red: '#FF4444'
};

const DIFFICULTY_COLORS = { 
  beginner: COLORS.green, 
  intermediate: COLORS.orange, 
  advanced: COLORS.red 
};

export const EducationScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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

  const renderEmpty = () => {
    if (isLoading && courses.length === 0) {
      return (
        <View style={{ gap: 16 }}>
          {[1, 2, 3].map((_, idx) => (
            <View key={idx} style={styles.courseCard}>
              <View style={styles.cardHeader}>
                <Skeleton width={44} height={44} borderRadius={12} style={{ marginRight: 12 }} />
                <View style={styles.courseInfo}>
                  <Skeleton width={140} height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                  <Skeleton width={100} height={12} borderRadius={4} />
                </View>
                <Skeleton width={60} height={24} borderRadius={8} />
              </View>
              <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
              <Skeleton width="70%" height={14} borderRadius={4} />
            </View>
          ))}
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBg}>
          <Icon name="school-outline" size={60} color={COLORS.gold} />
          <View style={styles.floatingStar}>
            <Icon name="star-four-points" size={20} color={COLORS.gold} />
          </View>
        </View>
        <Text style={styles.emptyTitle}>Academy Coming Soon</Text>
        <Text style={styles.emptyDesc}>
          Our experts are crafting premium trading courses and masterclasses for you. Stay tuned!
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trading Academy</Text>
          <Text style={styles.headerSubtitle}>Master the markets with experts</Text>
        </View>

        {/* Categories Bar (Horizontal) */}
        {categories.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.catRow}
          >
            {categories.map(c => (
              <TouchableOpacity key={c.id} style={[styles.catChip, { borderColor: c.color || COLORS.border }]}>
                <Text style={[styles.catText, { color: c.color || COLORS.white }]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Courses</Text>
            {courses.length > 0 && <Text style={styles.courseCount}>{courses.length} available</Text>}
          </View>

          {courses.map(course => {
            const diffColor = DIFFICULTY_COLORS[course.difficulty?.toLowerCase()] || COLORS.gold;
            
            return (
              <TouchableOpacity 
                key={course.id} 
                style={styles.courseCard} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.diffBadge, { backgroundColor: diffColor + '20', borderColor: diffColor }]}>
                    <Icon name="school" size={20} color={diffColor} />
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <View style={styles.metaRow}>
                      <Icon name="clock-outline" size={12} color={COLORS.grey} />
                      <Text style={styles.courseMeta}>{course.estimated_hours}h</Text>
                      <Text style={styles.dot}>•</Text>
                      <Icon name="play-circle-outline" size={12} color={COLORS.grey} />
                      <Text style={styles.courseMeta}>{course.lessons_count || 0} lessons</Text>
                      <Text style={styles.dot}>•</Text>
                      <Text style={[styles.diffText, { color: diffColor }]}>{course.difficulty?.toUpperCase() || 'ALL'}</Text>
                    </View>
                  </View>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>
                      {course.is_free ? 'FREE' : formatAmount(course.price)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>
              </TouchableOpacity>
            );
          })}

          {courses.length === 0 && renderEmpty()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { flexGrow: 1 },
  
  header: { paddingHorizontal: 20, marginBottom: 24 },
  headerTitle: { fontSize: 26, color: COLORS.white, fontWeight: '800', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: COLORS.grey, fontWeight: '500' },
  
  catRow: { paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, backgroundColor: COLORS.card, justifyContent: 'center' },
  catText: { fontSize: 13, fontWeight: '600' },
  
  coursesSection: { paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, color: COLORS.white, fontWeight: '700' },
  courseCount: { fontSize: 12, color: COLORS.grey, fontWeight: '600' },
  
  courseCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  
  diffBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1 },
  courseInfo: { flex: 1, paddingRight: 10 },
  courseTitle: { fontSize: 16, color: COLORS.white, fontWeight: '700', marginBottom: 6, lineHeight: 22 },
  
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  courseMeta: { fontSize: 12, color: COLORS.grey, marginLeft: 4, fontWeight: '500' },
  dot: { fontSize: 12, color: COLORS.border, marginHorizontal: 6, fontWeight: 'bold' },
  diffText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  
  priceTag: { backgroundColor: COLORS.goldMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  priceText: { fontSize: 13, color: COLORS.gold, fontWeight: '800' },
  
  courseDesc: { fontSize: 13, color: COLORS.grey, lineHeight: 20 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.goldMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative', borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  floatingStar: { position: 'absolute', top: 5, right: 5 },
  emptyTitle: { fontSize: 22, color: COLORS.white, fontWeight: '800', marginBottom: 12 },
  emptyDesc: { fontSize: 14, color: COLORS.grey, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
});

