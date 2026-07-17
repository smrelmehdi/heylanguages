import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecordingPresets, requestRecordingPermissionsAsync, useAudioRecorder } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Volume2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumRouteGate from '../components/PremiumRouteGate';
import { theme } from '../constants/theme';
import type { Word } from '../constants/words';
import { useDialect } from '../contexts/DialectContext';
import { useXP } from '../contexts/XPContext';
import { getUnit4Audio, isUnit4AudioLesson } from '../data/unit4-audio';
import { stripTashkeel } from '../utils/arabic';
import { evaluatePronunciation, type PronunciationResult } from '../utils/pronunciation';
import { getLessonContentId } from '../utils/access';
import { resolveContent } from '../utils/content-resolver';
import { buildCompletionKey, getCompletionKeyCandidates } from '../utils/progression';
import { recordActivity } from '../utils/streak';
import { supabase } from '../utils/supabase';
import { playLocalAudio, prepareRecordingAudioMode, restorePlaybackAudioMode, speakArabic, stopAudio } from '../utils/tts';

export default function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isSavingCompletion, setIsSavingCompletion] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [evalResult, setEvalResult] = useState<PronunciationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: string; icon: string; color: string } | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { content, dialect, speakInDialect } = useDialect();
  const { addXP } = useXP();

  // All hooks above — derived values below
  const type = params.type;
  const typeStr = Array.isArray(type) ? type[0] : (type ?? '');
  const routeContentId = getLessonContentId(typeStr);

  const LESSON_TITLES: Record<string, string> = {
    // Unit 4
    'numbers-1-5':       'Numbers 1–5',
    'numbers-6-10':      'Numbers 6–10',
    'numbers-11-20':     'Numbers 11–20',
    'numbers-tens':      'Tens & Hundreds',
    'numbers-age':       'Talking About Age',
    'numbers-prices':    'Prices & Money',
    'numbers-phone':     'Phone Numbers',
    'numbers-hours':     'Telling the Time',
    'numbers-minutes':   'Minutes & Fractions',
    'numbers-days':      'Days of the Week',
    'numbers-months':    'Months of the Year',
    'numbers-dates':     'Dates & Calendar',
    'numbers-ordering':  'Ordinal Numbers',
    'numbers-together':  'Big Numbers',
    // Unit 5
    'grammar-pronouns':      'Pronouns',
    'grammar-this-that':     'This & That',
    'grammar-possessives':   'My, Your, His, Her',
    'grammar-present-verbs': 'Common Verbs (Present)',
    'grammar-past-verbs':    'Common Verbs (Past)',
    'grammar-want-need':     'Wanting & Needing',
    'grammar-questions':     'Asking Questions',
    'grammar-negation':      'Saying No & Not',
    'grammar-adjectives':    'Describing Things',
    'grammar-sentences':     'Building Sentences',
    // Unit 7
    'work-office':     'At the Office',
    'work-greetings':  'Work Greetings',
    'work-meeting':    'In a Meeting',
    'work-phone':      'Phone Calls',
    'work-email':      'Email & Messages',
    'work-schedule':   'Schedule & Deadlines',
    'work-problems':   'Reporting Problems',
    'work-smalltalk':  'Office Small Talk',
    'work-salary':     'Salary & Benefits',
    'work-leaving':    'End of Day',
    // Unit 9
    'social-greetings':   'Greetings & Farewells',
    'social-family':      'Family & Relationships',
    'social-invitations': 'Invitations & Plans',
    'social-ramadan':     'Ramadan & Eid',
    'social-compliments': 'Compliments & Praise',
    'social-emotions':    'Feelings & Emotions',
    'social-weddings':    'Weddings & Celebrations',
    'social-condolences': 'Condolences & Sympathy',
    'social-religion':    'Religion & Daily Phrases',
    'social-manners':     'Manners & Etiquette',
  };

  const LESSON_SUBTITLES: Record<string, string> = {
    // Unit 4
    'numbers-1-5':       'One through Five',
    'numbers-6-10':      'Six through Ten',
    'numbers-11-20':     'Eleven through Twenty',
    'numbers-tens':      '20, 30, 40 and beyond',
    'numbers-age':       'How old are you?',
    'numbers-prices':    'Shopping in the Gulf',
    'numbers-phone':     'Sharing Contact Info',
    'numbers-hours':     'What time is it?',
    'numbers-minutes':   'Quarter & Half Hours',
    'numbers-days':      'Weekly Calendar',
    'numbers-months':    'Monthly Calendar',
    'numbers-dates':     "What's today's date?",
    'numbers-ordering':  'First, Second, Third...',
    'numbers-together':  'Hundreds & Thousands',
    // Unit 5
    'grammar-pronouns':      'Ana, Inta, Huwwa...',
    'grammar-this-that':     'Haadha vs. Dhaak',
    'grammar-possessives':   'Haqqi, Haqqak...',
    'grammar-present-verbs': 'Arooh, Aakil, Ashrab...',
    'grammar-past-verbs':    'Ruht, Akalt, Shribt...',
    'grammar-want-need':     'Abi, Ahtaaj...',
    'grammar-questions':     'Shinu, Wain, Laish...',
    'grammar-negation':      'La, Ma, Mu...',
    'grammar-adjectives':    'Kbeer, Sgheer, Hilow...',
    'grammar-sentences':     'Putting It All Together',
    // Unit 7
    'work-office':     'Maktab, Sharika...',
    'work-greetings':  'Ya Jamaa\'a, Yit\'eek...',
    'work-meeting':    'Nibda, Muwaafiq...',
    'work-phone':      'Aalo, Minu Ma\'i...',
    'work-email':      'Eemeil, Murfaq...',
    'work-schedule':   'Jadwal, Deadline...',
    'work-problems':   'Indi Mushkila...',
    'work-smalltalk':  'Weekend, Tarqiya...',
    'work-salary':     'Raatib, Ijaaza...',
    'work-leaving':    'Khallast, Istarih...',
    // Unit 9
    'social-greetings':   'Ahlan, Marhaba...',
    'social-family':      'Ummi, Abooy, Akhoy...',
    'social-invitations': "Taa'al, Yallah...",
    'social-ramadan':     'Ramadan Kareem!',
    'social-compliments': 'Mashallah, Hilow...',
    'social-emotions':    'Farhan, Hazeen...',
    'social-weddings':    'Mabrook, Alf Mabrook...',
    'social-condolences': 'Allah Yirhamu...',
    'social-religion':    'Bismillah, Alhamdulillah...',
    'social-manners':     'Tafaddal, Afwan...',
  };

  const resolvedContent = resolveContent({
    dialect,
    contentId: routeContentId,
    contentType: 'lesson',
  });
  const WORDS: Word[] = resolvedContent?.lessonWords ?? [];
  const isComingSoon = WORDS.length === 0;

  const lessonTitle = resolvedContent?.item.title ?? (
    typeStr === 'intro'     ? 'Introduce Yourself'      :
    typeStr === 'greetings' ? 'Common Greetings'        :
    LESSON_TITLES[typeStr] ?? 'Basic Words'
  );

  const lessonSubtitle =
    typeStr === 'intro'     ? 'Talk About Yourself'     :
    typeStr === 'greetings' ? 'Meeting People in Dubai' :
    LESSON_SUBTITLES[typeStr] ?? 'A Day in Dubai';

  const currentWord = WORDS[currentIndex] ?? { arabic: '', transliteration: '', english: '', context: '', audio: undefined };
  const displayedArabic = currentWord.displayArabic ?? currentWord.arabic;
  const currentAudioText = currentWord.audioText ?? currentWord.displayArabic ?? currentWord.arabic;
  const displayLength = stripTashkeel(displayedArabic).length;
  const targetSize =
    displayLength <= 8 ? 'short' :
    displayLength <= 18 ? 'medium' :
    'long';
  const targetLineLimit = targetSize === 'short' ? 1 : targetSize === 'medium' ? 2 : 3;
  const progress = WORDS.length > 0 ? currentIndex / WORDS.length : 0;
  const publicCompletionId = resolvedContent?.item.contentId ?? (typeStr && typeStr !== 'basic' ? typeStr : 'basic_words');
  const unitId = resolvedContent?.item.unitId ?? 'unit-1';
  const completionKey = buildCompletionKey(dialect, unitId, publicCompletionId);

  const goHomeAfterCompletion = () => {
    const canGoBack = router.canGoBack();
    if (__DEV__) {
      console.log('[completion navigation]', {
        completionType: 'lesson',
        unitId,
        lessonKey: publicCompletionId,
        completionKey,
        navigationAction: canGoBack ? 'back' : 'replace',
      });
    }

    if (canGoBack) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  useEffect(() => {
    requestRecordingPermissionsAsync().then(({ granted }) => {
      if (!granted) setMicPermissionDenied(true);
    });
    return () => {
      stopAudio();
      restorePlaybackAudioMode('lesson-unmount').catch(() => {});
    };
  }, []);

  const playWordAudio = async () => {
    const unit4Audio = getUnit4Audio(typeStr, currentIndex);
    const source = unit4Audio ? 'unit-4-local' : currentWord.audio ? 'existing-local' : 'fallback';
    const localAudioPath = unit4Audio?.path;

    if (__DEV__) {
      console.log('[lesson audio]', {
        unit: isUnit4AudioLesson(typeStr) ? 4 : undefined,
        lessonKey: typeStr,
        itemIndex: currentIndex + 1,
        displayArabic: displayedArabic,
        audioText: currentAudioText,
        source,
        localAudioPath,
      });
    }

    if (unit4Audio) {
      await playLocalAudio(unit4Audio.audio);
      return;
    }

    if (currentWord.audio) {
      await playLocalAudio(currentWord.audio);
    } else {
      // Use audioText (tashkeel-stripped) for TTS when available; fall back to raw arabic
      const ttsText = (isUnit4AudioLesson(typeStr) || currentWord.audioText) ? currentAudioText : currentWord.arabic;
      await speakArabic(ttsText, content.voiceId);
    }
  };

  useEffect(() => {
    setEvalResult(null);
    if (isComingSoon) return;
    const timer = setTimeout(() => { playWordAudio().catch(console.warn); }, 300);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleSpeak = () => {
    playWordAudio().catch(console.warn);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleMicPress = async () => {
    setEvalResult(null);
    setIsRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setIsRecording(false);
        setMicPermissionDenied(true);
        return;
      }
      await prepareRecordingAudioMode('lesson');
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (e) {
      console.warn('Lesson recording start error:', e);
      await restorePlaybackAudioMode('lesson-record-start-error');
      setIsRecording(false);
    }
  };

  const handleMicRelease = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    setHasAttempted(true);
    setIsEvaluating(true);
	    let stableUri: string | null = null;
	    try {
	      await audioRecorder.stop();
	      await restorePlaybackAudioMode('lesson-stop');
	      // Poll until the recording file is ready
      const startedAt = Date.now();
      let uri: string | null = null;
      while (Date.now() - startedAt < 3000) {
        const candidate = audioRecorder.uri;
        if (candidate) {
          const info = await FileSystem.getInfoAsync(candidate);
          if (info.exists) { uri = candidate; break; }
        }
        await new Promise(r => setTimeout(r, 150));
      }
      if (!uri) { setIsEvaluating(false); return; }
      stableUri = `${FileSystem.cacheDirectory}lesson-eval-${Date.now()}.m4a`;
      await FileSystem.copyAsync({ from: uri, to: stableUri });
      const evalTarget = currentWord.evalTarget ?? currentWord.audioText ?? currentWord.arabic;
      const result = await evaluatePronunciation(stableUri, evalTarget, dialect, 'lesson');
      setEvalResult(result);
      if (result.result === 'pass') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (result.result === 'close') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (result.result === 'fail') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
	    } catch (err) {
	      console.warn('Lesson eval error:', err);
	    } finally {
      await restorePlaybackAudioMode('lesson-finally');
      setIsEvaluating(false);
      if (stableUri) FileSystem.deleteAsync(stableUri, { idempotent: true }).catch(() => {});
    }
  };

  const saveCompletion = async () => {
    const scenarioKey = completionKey;
    const legacyCandidates = getCompletionKeyCandidates(dialect, publicCompletionId);
    if (__DEV__) {
      console.log('[completion write:start]', {
        completionType: 'lesson',
        unitId,
        lessonKey: typeStr,
        completionKey: scenarioKey,
      });
    }
    const xpEarned = 60;
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { data: existing } = await supabase
        .from('scenario_progress')
        .select('id, attempts')
        .eq('user_id', session.user.id)
        .in('scenario', legacyCandidates.length > 0 ? legacyCandidates : [scenarioKey])
        .maybeSingle();

      if (existing) {
        await supabase.from('scenario_progress').update({
          completed: true,
          best_score: 100,
          attempts: (existing.attempts ?? 0) + 1,
        }).eq('id', existing.id);
      } else {
        await supabase.from('scenario_progress').insert({
          user_id: session.user.id,
          scenario: scenarioKey,
          dialect: dialect,
          completed: true,
          best_score: 100,
          attempts: 1,
        });
        // Only award XP the first time a lesson is completed
        const levelUp = await addXP(xpEarned);
        if (levelUp) {
          setLevelUpData(levelUp);
          setShowLevelUp(true);
        }
      }

      if (__DEV__) {
        const { count } = await supabase
          .from('scenario_progress')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('completed', true);
        console.log('[completion write:done]', {
          completionType: 'lesson',
          unitId,
          lessonKey: publicCompletionId,
          completionKey: scenarioKey,
          totalCompleted: count ?? undefined,
        });
      }
    } else {
      const guestProgress = await AsyncStorage.getItem('guest_progress');
      const progress = guestProgress ? JSON.parse(guestProgress) : {};
      const alreadyCompleted = legacyCandidates.some(key => progress[key] === true);
      progress[scenarioKey] = true;
      await AsyncStorage.setItem('guest_progress', JSON.stringify(progress));
      if (!alreadyCompleted) {
        const levelUp = await addXP(xpEarned);
        if (levelUp) {
          setLevelUpData(levelUp);
          setShowLevelUp(true);
        }
      }
      if (__DEV__) {
        console.log('[completion write:done]', {
          completionType: 'lesson',
          unitId,
          lessonKey: publicCompletionId,
          completionKey: scenarioKey,
          totalCompleted: Object.values(progress).filter(Boolean).length,
        });
      }
    }

    // Record activity for streak (works for both guests and signed-in users)
    await recordActivity();
  };

  const handleNext = async () => {
    if (currentIndex < WORDS.length - 1) {
      setCurrentIndex(i => i + 1);
      setHasAttempted(false);
      setEvalResult(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      if (isSavingCompletion) return;
      setIsSavingCompletion(true);
      try {
        await saveCompletion();
        setCompleted(true);
      } finally {
        setIsSavingCompletion(false);
      }
    }
  };

  if (isComingSoon) {
    return (
      <PremiumRouteGate contentId={routeContentId} contentType="lesson" contentLabel={lessonTitle}>
        <SafeAreaView style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔜</Text>
            <Text style={{ fontSize: 22, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>Coming Soon</Text>
            <Text style={{ fontSize: 15, color: theme.colors.textTertiary, textAlign: 'center', marginBottom: 32 }}>
              This lesson is not available for your selected dialect yet. We're working on it!
            </Text>
            <Pressable style={[styles.doneButton]} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}>
              <Text style={styles.doneButtonText}>Go Back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </PremiumRouteGate>
    );
  }

  if (completed) {
    return (
      <PremiumRouteGate contentId={routeContentId} contentType="lesson" contentLabel={lessonTitle}>
        <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.completionContainer}>
          <Text style={styles.completionEmoji}>🎉</Text>
          <Text style={styles.completionTitle}>ممتاز!</Text>
          <Text style={styles.completionSub}>You learned {WORDS.length} new words</Text>
          <View style={styles.completionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>20</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>+60</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
          </View>
          <Pressable style={styles.doneButton} onPress={goHomeAfterCompletion}>
            <Text style={styles.doneButtonText}>Back to Home</Text>
          </Pressable>
        </View>

        <Modal visible={showLevelUp} transparent animationType="fade">
          <View style={styles.levelUpOverlay}>
            <View style={styles.levelUpCard}>
              <Text style={styles.levelUpEmoji}>{levelUpData?.icon}</Text>
              <Text style={styles.levelUpTitle}>Level Up!</Text>
              <Text style={[styles.levelUpLevel, { color: levelUpData?.color ?? theme.colors.accentPrimary }]}>{levelUpData?.newLevel}</Text>
              <Text style={styles.levelUpSub}>You reached a new level. Keep going!</Text>
              <Pressable style={styles.levelUpButton} onPress={() => setShowLevelUp(false)}>
                <Text style={styles.levelUpButtonText}>Continue 🎉</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        </SafeAreaView>
      </PremiumRouteGate>
    );
  }

  return (
    <PremiumRouteGate contentId={routeContentId} contentType="lesson" contentLabel={lessonTitle}>
      <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => {
          const goBack = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');
          if (currentIndex === 0) { goBack(); return; }
          Alert.alert(
            'Leave Lesson?',
            'Your progress in this lesson will be lost.',
            [
              { text: 'Keep Learning', style: 'cancel' },
              { text: 'Leave', style: 'destructive', onPress: goBack },
            ]
          );
        }}>
          <ArrowLeft color={theme.colors.textPrimary} size={18} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.lessonName}>{lessonTitle}</Text>
          <Text style={styles.lessonSub}>{lessonSubtitle}</Text>
        </View>
        <View style={styles.xpPill}>
          <Text style={styles.xpText}>+60 XP</Text>
        </View>
      </View>

      <View style={styles.practiceArea}>
        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{currentIndex + 1} / {WORDS.length}</Text>
        </View>

        {/* Word card */}
        <View style={styles.wordCard}>
          <Text style={styles.contextLabel}>{currentWord.context}</Text>
          <Text
            style={[
              styles.arabicBig,
              targetSize === 'medium' && styles.arabicMedium,
              targetSize === 'long' && styles.arabicLong,
            ]}
            adjustsFontSizeToFit
            numberOfLines={targetLineLimit}
            minimumFontScale={0.65}
          >
            {stripTashkeel(displayedArabic)}
          </Text>
          <Text style={styles.roman}>{currentWord.transliteration}</Text>
          <Text style={styles.english}>{currentWord.english}</Text>
          {currentWord.example && (
            <View style={styles.exampleWrap}>
              <Text style={styles.exampleLabel}>EXAMPLE</Text>
              <Text style={styles.exampleAr}>{stripTashkeel(currentWord.example ?? '')}</Text>
              <Text style={styles.exampleEn}>{currentWord.exampleTranslation}</Text>
            </View>
          )}
        </View>

        <Text style={styles.hint}>
          {isEvaluating ? 'Checking...' : isRecording ? 'Recording...' : micPermissionDenied ? 'Microphone access needed' : 'Listen first, then hold to repeat'}
        </Text>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.actionItem}>
            <Pressable style={styles.ctrlBtn} onPress={handleSpeak}>
              <Volume2 color={theme.colors.accentPrimary} size={22} />
            </Pressable>
            <Text style={styles.actionLabel}>Listen</Text>
          </View>

          <View style={styles.primaryActionItem}>
            {micPermissionDenied ? (
              <Pressable
                style={[styles.micBtn, { backgroundColor: theme.colors.bgElevated, borderWidth: 1, borderColor: theme.colors.borderDefault }]}
                onPress={() => Alert.alert(
                  'Microphone Access Required',
                  'To practice speaking, please enable microphone access for HeyYusuf in your device Settings.',
                  [{ text: 'OK' }]
                )}
              >
                <Text style={{ fontSize: 22 }}>🎙</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.micBtn, isRecording && styles.micBtnRecording, isEvaluating && styles.micBtnEvaluating]}
                onPressIn={isEvaluating ? undefined : handleMicPress}
                onPressOut={isEvaluating ? undefined : handleMicRelease}
                disabled={isEvaluating}
              >
                {isEvaluating
                  ? <ActivityIndicator color={theme.colors.bgBase} />
                  : <Text style={styles.micIcon}>🎙</Text>
                }
              </Pressable>
            )}
            <Text style={styles.primaryActionLabel}>{micPermissionDenied ? 'Tap for info' : 'Hold to speak'}</Text>
          </View>

          <View style={styles.actionItem}>
            <Pressable
              style={[styles.ctrlBtn, hasAttempted && styles.nextBtnActive]}
              onPress={handleNext}
            >
              <ChevronRight color={hasAttempted ? theme.colors.accentPrimary : theme.colors.textTertiary} size={22} />
            </Pressable>
            <Text style={[styles.actionLabel, hasAttempted && styles.actionLabelActive]}>Next</Text>
          </View>
        </View>

        {evalResult && !isEvaluating && (
          <View style={[
            styles.evalStrip,
            evalResult.result === 'pass' && styles.evalStripPass,
            evalResult.result === 'close' && styles.evalStripClose,
            evalResult.result === 'fail' && styles.evalStripFail,
          ]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.evalStripTitle}>
                {evalResult.result === 'pass' ? '✓ Great!' :
                 evalResult.result === 'close' ? '≈ Almost there' :
                 evalResult.result === 'fail' ? 'Try again' : 'Not checked'}
              </Text>
              {evalResult.transcript ? (
                <Text style={styles.evalStripHeard} numberOfLines={1}>
                  {`Heard: "${evalResult.transcript}"`}
                </Text>
              ) : null}
            </View>
            {typeof evalResult.score === 'number' && (
              <Text style={styles.evalStripScore}>{evalResult.score}%</Text>
            )}
          </View>
        )}
      </View>

      </SafeAreaView>
    </PremiumRouteGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.bgSurface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.borderDefault },
  headerCenter: { alignItems: 'center' },
  lessonName: { fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },
  lessonSub: { fontSize: theme.fontSize.label, color: theme.colors.textTertiary, marginTop: 1 },
  xpPill: { backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderAccent, borderRadius: theme.radii.pill, paddingHorizontal: 12, paddingVertical: 5 },
  xpText: { fontSize: theme.fontSize.label, color: theme.colors.textAccent, fontWeight: theme.fontWeight.medium, letterSpacing: 1.5 },
  practiceArea: { flex: 1, paddingTop: 8, paddingBottom: 28 },
  progressWrap: { paddingHorizontal: 20, marginBottom: 14 },
  progressBg: { height: 4, backgroundColor: theme.colors.bgBase, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.colors.accentPrimary, borderRadius: 2 },
  progressLabel: { fontSize: theme.fontSize.caption, color: theme.colors.textTertiary, textAlign: 'right', marginTop: 4 },
  wordCard: { marginHorizontal: 20, backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 20, borderWidth: 1, borderColor: theme.colors.borderDefault, marginBottom: 18, minHeight: 220 },
  contextLabel: { fontSize: theme.fontSize.label, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
  arabicBig: { fontSize: 56, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'right', lineHeight: 66, marginBottom: 8, paddingHorizontal: 4, writingDirection: 'rtl' },
  arabicMedium: { fontSize: 42, lineHeight: 52 },
  arabicLong: { fontSize: 32, lineHeight: 42 },
  roman: { fontSize: 18, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.regular, marginBottom: 6, lineHeight: 24 },
  english: { fontSize: 18, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium, lineHeight: 24 },
  exampleWrap: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.borderDefault, gap: 3 },
  exampleLabel: { fontSize: 10, color: theme.colors.textTertiary, fontWeight: theme.fontWeight.medium, letterSpacing: 1.4 },
  exampleAr: { fontSize: 14, color: theme.colors.textAccent, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl' },
  exampleEn: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18, fontStyle: 'italic' },
  controls: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 22, paddingHorizontal: 20 },
  actionItem: { alignItems: 'center', width: 70, gap: 8 },
  primaryActionItem: { alignItems: 'center', width: 108, gap: 8 },
  ctrlBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.bgSurface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.borderDefault },
  nextBtnActive: { borderColor: theme.colors.borderAccent, backgroundColor: 'rgba(61, 212, 192, 0.1)' },
  micBtn: { width: 78, height: 78, borderRadius: 39, backgroundColor: theme.colors.accentPrimary, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.accentPrimary, shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  micBtnRecording: { backgroundColor: theme.colors.accentDanger },
  micBtnEvaluating: { backgroundColor: theme.colors.bgElevated },
  micIcon: { fontSize: 30 },
  evalStrip: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.borderDefault, backgroundColor: theme.colors.bgSurface },
  evalStripPass: { borderColor: theme.colors.accentSuccess, backgroundColor: 'rgba(127, 217, 154, 0.1)' },
  evalStripClose: { borderColor: theme.colors.accentWarm, backgroundColor: 'rgba(245, 165, 36, 0.1)' },
  evalStripFail: { borderColor: theme.colors.accentDanger, backgroundColor: 'rgba(229, 107, 111, 0.1)' },
  evalStripTitle: { fontSize: 14, fontWeight: theme.fontWeight.medium as any, color: theme.colors.textPrimary, marginBottom: 2 },
  evalStripHeard: { fontSize: 12, color: theme.colors.textTertiary, fontStyle: 'italic' },
  evalStripScore: { fontSize: 20, fontWeight: theme.fontWeight.medium as any, color: theme.colors.textPrimary, marginLeft: 12 },
  hint: { textAlign: 'center', fontSize: theme.fontSize.body, color: theme.colors.textSecondary, marginBottom: 14 },
  actionLabel: { fontSize: theme.fontSize.caption, color: theme.colors.textTertiary, fontWeight: theme.fontWeight.medium },
  actionLabelActive: { color: theme.colors.textAccent },
  primaryActionLabel: { fontSize: theme.fontSize.caption, color: theme.colors.textAccent, fontWeight: theme.fontWeight.medium },
  completionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  completionEmoji: { fontSize: 56, marginBottom: 8 },
  completionTitle: { fontSize: 36, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 4 },
  completionSub: { fontSize: 16, color: theme.colors.textTertiary, marginBottom: 32 },
  completionStats: { flexDirection: 'row', backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 20, marginBottom: 32, gap: 32, borderWidth: 1, borderColor: theme.colors.borderDefault },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 28, fontWeight: theme.fontWeight.medium, color: theme.colors.textAccent },
  statLabel: { fontSize: theme.fontSize.label, color: theme.colors.textTertiary, textTransform: 'uppercase', marginTop: 2, letterSpacing: 1.5 },
  statDivider: { width: 0.5, backgroundColor: theme.colors.borderDefault },
  doneButton: { width: '100%', height: 56, backgroundColor: theme.colors.accentPrimary, borderRadius: theme.radii.lg, alignItems: 'center', justifyContent: 'center' },
  doneButtonText: { color: theme.colors.bgBase, fontSize: 17, fontWeight: theme.fontWeight.medium },
  levelUpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  levelUpCard: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 32, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderDefault },
  levelUpEmoji: { fontSize: 64, marginBottom: 8 },
  levelUpTitle: { fontSize: 18, color: theme.colors.textTertiary, marginBottom: 4 },
  levelUpLevel: { fontSize: 36, fontWeight: theme.fontWeight.medium, marginBottom: 8 },
  levelUpSub: { fontSize: 14, color: theme.colors.textTertiary, textAlign: 'center', marginBottom: 24 },
  levelUpButton: { backgroundColor: theme.colors.accentPrimary, width: '100%', height: 52, borderRadius: theme.radii.md, alignItems: 'center', justifyContent: 'center' },
  levelUpButtonText: { color: theme.colors.bgBase, fontSize: 16, fontWeight: theme.fontWeight.medium },
});
