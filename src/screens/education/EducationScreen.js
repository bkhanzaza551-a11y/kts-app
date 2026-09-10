import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchCourses, fetchCategories } from '../../store/educationSlice';
import { useCurrency } from '../../context/CurrencyContext';
import { Skeleton } from '../../components/common/Skeleton';

const THEME = {
  bg: '#0B0E11',
  card: '#181A20',
  cardHover: '#20242D',
  border: '#262D35',
  borderLight: '#333D47',
  gold: '#FCD535',
  goldMuted: 'rgba(252, 213, 53, 0.12)',
  goldGlow: 'rgba(252, 213, 53, 0.25)',
  white: '#EAECEF',
  silver: '#B7BDC6',
  grey: '#848E9C',
  green: '#0ECB81',
  greenMuted: 'rgba(14, 203, 129, 0.12)',
  orange: '#F6A609',
  orangeMuted: 'rgba(246, 166, 9, 0.12)',
  red: '#F6465D',
  redMuted: 'rgba(246, 70, 93, 0.12)',
  primaryBlue: '#3875F6'
};

const DIFFICULTY_CONFIG = {
  beginner: { label: 'BEGINNER', color: THEME.green, bg: THEME.greenMuted, icon: 'shield-star-outline' },
  intermediate: { label: 'INTERMEDIATE', color: THEME.orange, bg: THEME.orangeMuted, icon: 'trending-up' },
  advanced: { label: 'ADVANCED', color: THEME.red, bg: THEME.redMuted, icon: 'lightning-bolt' },
  default: { label: 'ALL LEVELS', color: THEME.gold, bg: THEME.goldMuted, icon: 'school-outline' }
};

export const EducationScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { courses, categories, isLoading } = useSelector(s => s.education);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { formatAmount } = useCurrency();

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchCategories());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchCourses()),
      dispatch(fetchCategories())
    ]);
    setRefreshing(false);
  };

  // Client-side filtering for ultra fast, responsive UI
  const filteredCourses = useMemo(() => {
    if (!courses || !Array.isArray(courses)) return [];
    
    return courses.filter(course => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (course.category_id !== selectedCategory && course.category?.id !== selectedCategory) {
          return false;
        }
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all') {
        if (course.difficulty?.toLowerCase() !== selectedDifficulty.toLowerCase()) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = course.title?.toLowerCase().includes(q);
        const descMatch = course.description?.toLowerCase().includes(q);
        const catMatch = course.category?.name?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !catMatch) return false;
      }

      return true;
    });
  }, [courses, selectedCategory, selectedDifficulty, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSearchQuery('');
  };

  const renderEmptyState = () => {
    const isFiltered = selectedCategory !== 'all' || selectedDifficulty !== 'all' || searchQuery.trim().length > 0;

    if (isLoading && courses.length === 0) {
      return (
        <View style={{ gap: 14, marginTop: 10 }}>
          {[1, 2, 3].map((_, idx) => (
            <View key={idx} style={styles.courseCard}>
              <View style={styles.cardHeaderRow}>
                <Skeleton width={44} height={44} borderRadius={12} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Skeleton width={160} height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                  <Skeleton width={110} height={12} borderRadius={4} />
                </View>
                <Skeleton width={55} height={24} borderRadius={8} />
              </View>
              <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 6, marginTop: 8 }} />
              <Skeleton width="60%" height={14} borderRadius={4} />
            </View>
          ))}
        </View>
      );
    }

    if (isFiltered) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Icon name="filter-remove-outline" size={42} color={THEME.gold} />
          </View>
          <Text style={styles.emptyTitle}>No Matching Courses</Text>
          <Text style={styles.emptyDesc}>
            No courses found for the selected category or search filter.
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetFilters} activeOpacity={0.8}>
            <Icon name="refresh" size={16} color={THEME.bg} style={{ marginRight: 6 }} />
            <Text style={styles.resetButtonText}>Reset All Filters</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBg}>
          <Icon name="school-outline" size={48} color={THEME.gold} />
          <View style={styles.floatingBadge}>
            <Icon name="sparkles" size={16} color={THEME.gold} />
          </View>
        </View>
        <Text style={styles.emptyTitle}>Academy Launching Soon</Text>
        <Text style={styles.emptyDesc}>
          Our market analysts and pro traders are preparing institutional-grade trading masterclasses for you.
        </Text>
        <TouchableOpacity style={styles.reloadButton} onPress={onRefresh} activeOpacity={0.8}>
          <Icon name="refresh" size={16} color={THEME.white} style={{ marginRight: 6 }} />
          <Text style={styles.reloadButtonText}>Refresh Academy</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[
          styles.content, 
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.gold} />}
      >
        {/* Header Title Section */}
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <Icon name="school-outline" size={14} color={THEME.gold} style={{ marginRight: 5 }} />
            <Text style={styles.headerBadgeText}>KTS TRADING ACADEMY</Text>
          </View>
          <Text style={styles.headerTitle}>Master The Markets</Text>
          <Text style={styles.headerSubtitle}>
            Accelerate your trading with professional courses, strategies & video lessons.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color={THEME.grey} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses, topics, strategies..."
              placeholderTextColor={THEME.grey}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="close-circle" size={18} color={THEME.grey} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Selector Chips */}
        <View style={styles.categorySection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.catScrollContent}
          >
            {/* 'All Courses' chip */}
            <TouchableOpacity 
              style={[
                styles.catChip,
                selectedCategory === 'all' && styles.catChipActive
              ]}
              onPress={() => setSelectedCategory('all')}
              activeOpacity={0.7}
            >
              <Icon 
                name="fire" 
                size={16} 
                color={selectedCategory === 'all' ? THEME.gold : THEME.grey} 
                style={{ marginRight: 6 }} 
              />
              <Text style={[
                styles.catText,
                selectedCategory === 'all' && styles.catTextActive
              ]}>
                All Courses
              </Text>
            </TouchableOpacity>

            {/* Dynamic Categories */}
            {categories.map(c => {
              const isSelected = selectedCategory === c.id;
              const catColor = c.color || THEME.gold;
              
              return (
                <TouchableOpacity 
                  key={c.id} 
                  style={[
                    styles.catChip,
                    isSelected && { borderColor: catColor, backgroundColor: catColor + '18' }
                  ]}
                  onPress={() => setSelectedCategory(isSelected ? 'all' : c.id)}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name={c.icon ? (c.icon.includes('-') ? c.icon : 'folder-outline') : 'folder-outline'} 
                    size={16} 
                    color={isSelected ? catColor : THEME.grey} 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={[
                    styles.catText,
                    isSelected && { color: catColor, fontWeight: '700' }
                  ]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Difficulty Filter Chips */}
        <View style={styles.difficultySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.diffScrollContent}>
            {[
              { id: 'all', label: 'All Levels' },
              { id: 'beginner', label: 'Beginner', color: THEME.green },
              { id: 'intermediate', label: 'Intermediate', color: THEME.orange },
              { id: 'advanced', label: 'Advanced', color: THEME.red }
            ].map(d => {
              const isDiffActive = selectedDifficulty === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[
                    styles.diffChip,
                    isDiffActive && styles.diffChipActive,
                    isDiffActive && d.color && { borderColor: d.color, backgroundColor: d.color + '15' }
                  ]}
                  onPress={() => setSelectedDifficulty(d.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.diffText,
                    isDiffActive && { color: d.color || THEME.gold, fontWeight: '700' }
                  ]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'all' ? 'Featured Masterclasses' : 'Category Courses'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} available
              </Text>
            </View>
            {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || searchQuery) && (
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.clearFiltersText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Course Cards List */}
          {filteredCourses.map(course => {
            const diff = DIFFICULTY_CONFIG[course.difficulty?.toLowerCase()] || DIFFICULTY_CONFIG.default;
            const lessonsCount = course.lessons_count || (course.lessons ? course.lessons.length : 0);

            return (
              <TouchableOpacity 
                key={course.id} 
                style={styles.courseCard} 
                activeOpacity={0.82}
                onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
              >
                {/* Card Top Row: Difficulty + Category Pill + Free/Price Tag */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.diffBadge, { backgroundColor: diff.bg, borderColor: diff.color + '40' }]}>
                      <Icon name={diff.icon} size={12} color={diff.color} style={{ marginRight: 4 }} />
                      <Text style={[styles.diffBadgeText, { color: diff.color }]}>{diff.label}</Text>
                    </View>
                    {course.category?.name && (
                      <View style={styles.catBadge}>
                        <Text style={styles.catBadgeText} numberOfLines={1}>
                          {course.category.name}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>
                      {course.is_free ? 'FREE' : formatAmount(course.price)}
                    </Text>
                  </View>
                </View>

                {/* Course Title */}
                <Text style={styles.courseTitle} numberOfLines={2}>
                  {course.title}
                </Text>

                {/* Course Description */}
                {course.description ? (
                  <Text style={styles.courseDesc} numberOfLines={2}>
                    {course.description}
                  </Text>
                ) : null}

                {/* Card Bottom Meta Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.metaItems}>
                    <View style={styles.metaItem}>
                      <Icon name="clock-outline" size={14} color={THEME.grey} style={{ marginRight: 4 }} />
                      <Text style={styles.metaText}>{course.estimated_hours || 1}h total</Text>
                    </View>

                    <Text style={styles.metaDot}>•</Text>

                    <View style={styles.metaItem}>
                      <Icon name="play-circle-outline" size={14} color={THEME.gold} style={{ marginRight: 4 }} />
                      <Text style={[styles.metaText, { color: THEME.white }]}>
                        {lessonsCount} {lessonsCount === 1 ? 'lesson' : 'lessons'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.startBtn}>
                    <Text style={styles.startBtnText}>Start</Text>
                    <Icon name="arrow-right" size={14} color={THEME.gold} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredCourses.length === 0 && renderEmptyState()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: THEME.bg 
  },
  content: { 
    flexGrow: 1 
  },
  
  // Header Section
  header: { 
    paddingHorizontal: 20, 
    marginBottom: 16 
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: THEME.goldMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.goldGlow
  },
  headerBadgeText: {
    color: THEME.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  headerTitle: { 
    fontSize: 26, 
    color: THEME.white, 
    fontWeight: '800', 
    marginBottom: 6,
    letterSpacing: -0.3
  },
  headerSubtitle: { 
    fontSize: 13, 
    color: THEME.silver, 
    lineHeight: 19 
  },

  // Search Bar
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 14,
    height: 46
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    color: THEME.white,
    fontSize: 14,
    paddingVertical: 0
  },
  
  // Category Scroll
  categorySection: {
    marginBottom: 12
  },
  catScrollContent: { 
    paddingHorizontal: 20, 
    gap: 8,
    alignItems: 'center',
    height: 42
  },
  catChip: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14, 
    height: 36,
    borderRadius: 18, 
    borderWidth: 1, 
    borderColor: THEME.border, 
    backgroundColor: THEME.card, 
    justifyContent: 'center' 
  },
  catChipActive: {
    borderColor: THEME.gold,
    backgroundColor: THEME.goldMuted
  },
  catText: { 
    fontSize: 13, 
    fontWeight: '600',
    color: THEME.silver
  },
  catTextActive: {
    color: THEME.gold,
    fontWeight: '700'
  },

  // Difficulty Filter
  difficultySection: {
    marginBottom: 20
  },
  diffScrollContent: {
    paddingHorizontal: 20,
    gap: 6,
    alignItems: 'center',
    height: 32
  },
  diffChip: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  diffChipActive: {
    borderColor: THEME.gold,
    backgroundColor: THEME.goldMuted
  },
  diffText: {
    fontSize: 11,
    color: THEME.grey,
    fontWeight: '600'
  },
  
  // Courses Section
  coursesSection: { 
    paddingHorizontal: 20 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 14 
  },
  sectionTitle: { 
    fontSize: 17, 
    color: THEME.white, 
    fontWeight: '700' 
  },
  sectionSubtitle: {
    fontSize: 12,
    color: THEME.grey,
    marginTop: 2
  },
  clearFiltersText: {
    fontSize: 12,
    color: THEME.gold,
    fontWeight: '600'
  },
  
  // Course Card
  courseCard: { 
    backgroundColor: THEME.card, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 14, 
    borderWidth: 1, 
    borderColor: THEME.border, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 4 
  },
  cardHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 10 
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8
  },
  diffBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  diffBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  catBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 120
  },
  catBadgeText: {
    color: THEME.silver,
    fontSize: 10,
    fontWeight: '600'
  },
  priceTag: { 
    backgroundColor: THEME.goldMuted, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6, 
    borderWidth: 1, 
    borderColor: 'rgba(252, 213, 53, 0.3)' 
  },
  priceText: { 
    fontSize: 11, 
    color: THEME.gold, 
    fontWeight: '800' 
  },
  
  courseTitle: { 
    fontSize: 16, 
    color: THEME.white, 
    fontWeight: '700', 
    marginBottom: 6, 
    lineHeight: 22 
  },
  courseDesc: { 
    fontSize: 13, 
    color: THEME.silver, 
    lineHeight: 19,
    marginBottom: 12 
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)'
  },
  metaItems: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  metaText: {
    fontSize: 12,
    color: THEME.grey,
    fontWeight: '500'
  },
  metaDot: {
    color: THEME.border,
    marginHorizontal: 8,
    fontSize: 12
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  startBtnText: {
    fontSize: 12,
    color: THEME.gold,
    fontWeight: '700'
  },

  // Empty State
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 50, 
    paddingHorizontal: 20 
  },
  emptyIconBg: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: THEME.goldMuted, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 20, 
    position: 'relative', 
    borderWidth: 1, 
    borderColor: 'rgba(252, 213, 53, 0.25)' 
  },
  floatingBadge: { 
    position: 'absolute', 
    top: 2, 
    right: 2 
  },
  emptyTitle: { 
    fontSize: 20, 
    color: THEME.white, 
    fontWeight: '800', 
    marginBottom: 8 
  },
  emptyDesc: { 
    fontSize: 13, 
    color: THEME.grey, 
    textAlign: 'center', 
    lineHeight: 20, 
    paddingHorizontal: 15,
    marginBottom: 20
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.gold,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: THEME.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3
  },
  resetButtonText: {
    color: THEME.bg,
    fontSize: 13,
    fontWeight: '700'
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20
  },
  reloadButtonText: {
    color: THEME.white,
    fontSize: 13,
    fontWeight: '600'
  }
});


