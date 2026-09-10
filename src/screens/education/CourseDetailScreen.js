import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchCourseDetail } from '../../store/educationSlice';
import { useCurrency } from '../../context/CurrencyContext';

const { width } = Dimensions.get('window');

const THEME = {
  bg: '#0B0E11',
  card: '#181A20',
  border: '#262D35',
  gold: '#FCD535',
  goldMuted: 'rgba(252, 213, 53, 0.12)',
  white: '#EAECEF',
  silver: '#B7BDC6',
  grey: '#848E9C',
  green: '#0ECB81',
  greenMuted: 'rgba(14, 203, 129, 0.12)',
  orange: '#F6A609',
  orangeMuted: 'rgba(246, 166, 9, 0.12)',
  red: '#F6465D',
  redMuted: 'rgba(246, 70, 93, 0.12)'
};

const DIFFICULTY_CONFIG = {
  beginner: { label: 'BEGINNER', color: THEME.green, bg: THEME.greenMuted },
  intermediate: { label: 'INTERMEDIATE', color: THEME.orange, bg: THEME.orangeMuted },
  advanced: { label: 'ADVANCED', color: THEME.red, bg: THEME.redMuted },
  default: { label: 'ALL LEVELS', color: THEME.gold, bg: THEME.goldMuted }
};

export const CourseDetailScreen = ({ route, navigation }) => {
  const { courseId } = route.params || {};
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { currentCourse: course, isLoading } = useSelector(s => s.education);
  const { formatAmount } = useCurrency();

  const [activeLesson, setActiveLesson] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseDetail(courseId));
    }
  }, [dispatch, courseId]);

  const openLessonPlayer = (lesson) => {
    setActiveLesson(lesson);
    setVideoLoading(true);
    setModalVisible(true);
  };

  const getNextLesson = () => {
    if (!course || !course.lessons || !activeLesson) return null;
    const currentIndex = course.lessons.findIndex(l => l.id === activeLesson.id);
    if (currentIndex >= 0 && currentIndex < course.lessons.length - 1) {
      return course.lessons[currentIndex + 1];
    }
    return null;
  };

  const getPrevLesson = () => {
    if (!course || !course.lessons || !activeLesson) return null;
    const currentIndex = course.lessons.findIndex(l => l.id === activeLesson.id);
    if (currentIndex > 0) {
      return course.lessons[currentIndex - 1];
    }
    return null;
  };

  const playNext = () => {
    const next = getNextLesson();
    if (next) {
      setActiveLesson(next);
      setVideoLoading(true);
    }
  };

  const playPrev = () => {
    const prev = getPrevLesson();
    if (prev) {
      setActiveLesson(prev);
      setVideoLoading(true);
    }
  };

  const generateVideoHtml = (url) => {
    if (!url) return '';
    const isDirectMp4 = url.match(/\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i) || url.includes('/storage/education/videos/');
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');

    let videoContent = '';
    if (isYoutube) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      }
      videoContent = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border:0;width:100%;height:100vh;"></iframe>`;
    } else {
      videoContent = `
        <video controls autoplay playsinline style="width:100%;height:100vh;object-fit:contain;background:#000;">
          <source src="${url}" type="video/mp4">
          Your browser does not support video playback.
        </video>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; background: #000000; }
            body, html { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #000; }
          </style>
        </head>
        <body>
          ${videoContent}
        </body>
      </html>
    `;
  };

  if (isLoading && !course) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={THEME.gold} />
        <Text style={styles.loadingText}>Loading masterclass...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, styles.center]}>
        <Icon name="alert-circle-outline" size={48} color={THEME.grey} style={{ marginBottom: 12 }} />
        <Text style={styles.errorTitle}>Course Not Found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to Academy</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const diff = DIFFICULTY_CONFIG[course.difficulty?.toLowerCase()] || DIFFICULTY_CONFIG.default;
  const lessons = course.lessons || [];

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Course Header Banner */}
        <View style={styles.courseHeader}>
          <View style={styles.metaRow}>
            <View style={[styles.diffBadge, { backgroundColor: diff.bg, borderColor: diff.color + '40' }]}>
              <Text style={[styles.diffBadgeText, { color: diff.color }]}>{diff.label}</Text>
            </View>
            {course.category?.name && (
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{course.category.name}</Text>
              </View>
            )}
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>
                {course.is_free ? 'FREE' : formatAmount(course.price)}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{course.title}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="clock-outline" size={15} color={THEME.gold} style={{ marginRight: 5 }} />
              <Text style={styles.statText}>{course.estimated_hours || 1} Hours</Text>
            </View>
            <Text style={styles.statDot}>•</Text>
            <View style={styles.statItem}>
              <Icon name="play-circle-outline" size={15} color={THEME.gold} style={{ marginRight: 5 }} />
              <Text style={styles.statText}>{lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}</Text>
            </View>
          </View>
        </View>

        {/* Overview Description */}
        {course.description ? (
          <View style={styles.descCard}>
            <Text style={styles.sectionHeading}>About This Masterclass</Text>
            <Text style={styles.descText}>{course.description}</Text>
          </View>
        ) : null}

        {/* Curriculum Lessons Section */}
        <View style={styles.curriculumSection}>
          <View style={styles.curriculumHeader}>
            <Text style={styles.sectionHeading}>Curriculum & Lessons</Text>
            <Text style={styles.curriculumSub}>{lessons.length} video modules</Text>
          </View>

          {lessons.map((lesson, idx) => (
            <TouchableOpacity 
              key={lesson.id} 
              style={styles.lessonCard}
              activeOpacity={0.78}
              onPress={() => openLessonPlayer(lesson)}
            >
              <View style={styles.lessonIndexBadge}>
                <Text style={styles.lessonIndexText}>
                  {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                </Text>
              </View>

              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
                <View style={styles.lessonMetaRow}>
                  <Icon name="clock-time-three-outline" size={12} color={THEME.grey} style={{ marginRight: 4 }} />
                  <Text style={styles.lessonDuration}>
                    {lesson.duration_minutes ? `${lesson.duration_minutes} min` : 'Video Lesson'}
                  </Text>
                  {lesson.content && (
                    <>
                      <Text style={styles.statDot}>•</Text>
                      <Icon name="text-box-check-outline" size={12} color={THEME.green} style={{ marginRight: 4 }} />
                      <Text style={[styles.lessonDuration, { color: THEME.green }]}>Study Notes</Text>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.playIconContainer}>
                <Icon name="play" size={18} color={THEME.gold} />
              </View>
            </TouchableOpacity>
          ))}

          {lessons.length === 0 && (
            <View style={styles.noLessonsCard}>
              <Icon name="book-open-page-variant-outline" size={36} color={THEME.grey} style={{ marginBottom: 8 }} />
              <Text style={styles.noLessonsTitle}>Lessons Coming Soon</Text>
              <Text style={styles.noLessonsSubtitle}>The instructor is uploading video content for this masterclass.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Embedded Video Player & Lesson Notes Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseBtn} 
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={22} color={THEME.white} />
            </TouchableOpacity>
            <View style={{ flex: 1, paddingHorizontal: 10 }}>
              <Text style={styles.modalCourseName} numberOfLines={1}>{course.title}</Text>
              <Text style={styles.modalLessonName} numberOfLines={1}>{activeLesson?.title}</Text>
            </View>
          </View>

          {/* Video Player Container */}
          <View style={styles.videoPlayerBox}>
            {activeLesson?.video_url ? (
              <>
                <WebView
                  key={activeLesson.id}
                  originWhitelist={['*']}
                  source={{ html: generateVideoHtml(activeLesson.video_url) }}
                  style={styles.webView}
                  allowsFullscreenVideo={true}
                  allowsInlineMediaPlayback={true}
                  mediaPlaybackRequiresUserAction={false}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  onLoadEnd={() => setVideoLoading(false)}
                />
                {videoLoading && (
                  <View style={styles.videoLoaderOverlay}>
                    <ActivityIndicator size="large" color={THEME.gold} />
                    <Text style={styles.videoLoaderText}>Loading video stream...</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noVideoPlaceholder}>
                <Icon name="video-off-outline" size={40} color={THEME.grey} style={{ marginBottom: 6 }} />
                <Text style={styles.noVideoText}>No Video URL provided for this lesson</Text>
              </View>
            )}
          </View>

          {/* Lesson Details & Navigation */}
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {/* Quick Navigation Controls */}
            <View style={styles.navButtonsRow}>
              <TouchableOpacity 
                style={[styles.navBtn, !getPrevLesson() && styles.navBtnDisabled]} 
                onPress={playPrev}
                disabled={!getPrevLesson()}
              >
                <Icon name="chevron-left" size={18} color={getPrevLesson() ? THEME.gold : THEME.grey} />
                <Text style={[styles.navBtnText, !getPrevLesson() && styles.navBtnTextDisabled]}>Previous</Text>
              </TouchableOpacity>

              <View style={styles.durationPill}>
                <Icon name="clock-outline" size={13} color={THEME.gold} style={{ marginRight: 4 }} />
                <Text style={styles.durationPillText}>
                  {activeLesson?.duration_minutes ? `${activeLesson.duration_minutes} min` : 'Module'}
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.navBtn, !getNextLesson() && styles.navBtnDisabled]} 
                onPress={playNext}
                disabled={!getNextLesson()}
              >
                <Text style={[styles.navBtnText, !getNextLesson() && styles.navBtnTextDisabled]}>Next</Text>
                <Icon name="chevron-right" size={18} color={getNextLesson() ? THEME.gold : THEME.grey} />
              </TouchableOpacity>
            </View>

            {/* Lesson Title & Description */}
            <Text style={styles.modalDetailTitle}>{activeLesson?.title}</Text>
            {activeLesson?.description ? (
              <Text style={styles.modalDetailDesc}>{activeLesson.description}</Text>
            ) : null}

            {/* Markdown Study Notes */}
            {activeLesson?.content ? (
              <View style={styles.notesCard}>
                <View style={styles.notesHeader}>
                  <Icon name="book-open-outline" size={16} color={THEME.gold} style={{ marginRight: 6 }} />
                  <Text style={styles.notesHeading}>Study Notes & Strategy</Text>
                </View>
                <Text style={styles.notesContent}>{activeLesson.content}</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  center: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  content: { padding: 20 },
  loadingText: { color: THEME.silver, fontSize: 14, marginTop: 12 },
  errorTitle: { color: THEME.white, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  backButton: { backgroundColor: THEME.gold, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  backButtonText: { color: THEME.bg, fontWeight: '700', fontSize: 14 },

  // Course Header
  courseHeader: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  diffBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  diffBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  catBadge: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
  catBadgeText: { color: THEME.silver, fontSize: 11, fontWeight: '600' },
  priceTag: { backgroundColor: THEME.goldMuted, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(252,213,53,0.3)' },
  priceText: { color: THEME.gold, fontSize: 11, fontWeight: '800' },

  title: { fontSize: 22, color: THEME.white, fontWeight: '800', lineHeight: 28, marginBottom: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statText: { color: THEME.silver, fontSize: 13, fontWeight: '600' },
  statDot: { color: THEME.border, marginHorizontal: 8, fontSize: 12 },

  // Description Card
  descCard: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border
  },
  sectionHeading: { fontSize: 16, color: THEME.white, fontWeight: '700', marginBottom: 8 },
  descText: { color: THEME.silver, fontSize: 13, lineHeight: 21 },

  // Curriculum
  curriculumSection: { marginBottom: 20 },
  curriculumHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  curriculumSub: { color: THEME.grey, fontSize: 12 },
  
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.border
  },
  lessonIndexBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: THEME.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  lessonIndexText: { color: THEME.gold, fontSize: 12, fontWeight: '800' },
  lessonInfo: { flex: 1, marginRight: 10 },
  lessonTitle: { color: THEME.white, fontSize: 14, fontWeight: '600', marginBottom: 4, lineHeight: 19 },
  lessonMetaRow: { flexDirection: 'row', alignItems: 'center' },
  lessonDuration: { color: THEME.grey, fontSize: 11 },
  playIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(252,213,53,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },

  noLessonsCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: THEME.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border
  },
  noLessonsTitle: { color: THEME.white, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  noLessonsSubtitle: { color: THEME.grey, fontSize: 12, textAlign: 'center' },

  // Modal
  modalContainer: { flex: 1, backgroundColor: THEME.bg },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCourseName: { color: THEME.grey, fontSize: 11, fontWeight: '500' },
  modalLessonName: { color: THEME.white, fontSize: 14, fontWeight: '700' },
  videoPlayerBox: {
    width: '100%',
    height: width * (9 / 16),
    backgroundColor: '#000000',
    position: 'relative'
  },
  webView: { flex: 1, backgroundColor: '#000000' },
  videoLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoLoaderText: { color: THEME.silver, fontSize: 12, marginTop: 10 },
  noVideoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noVideoText: { color: THEME.grey, fontSize: 13 },

  modalScroll: { flex: 1 },
  modalScrollContent: { padding: 18 },
  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: THEME.card },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { color: THEME.gold, fontSize: 12, fontWeight: '700' },
  navBtnTextDisabled: { color: THEME.grey },
  durationPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: THEME.goldMuted },
  durationPillText: { color: THEME.gold, fontSize: 11, fontWeight: '700' },

  modalDetailTitle: { color: THEME.white, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  modalDetailDesc: { color: THEME.silver, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  notesCard: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border
  },
  notesHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  notesHeading: { color: THEME.gold, fontSize: 14, fontWeight: '700' },
  notesContent: { color: THEME.silver, fontSize: 13, lineHeight: 21 }
});

