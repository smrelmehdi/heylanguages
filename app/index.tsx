import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import { playLocalAudio, stopAudio } from '../utils/tts';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { ArrowLeft, Mic } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, PanResponder, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeIn, FadeInRight, FadeOut, FadeOutLeft,
  interpolateColor, LinearTransition,
  useAnimatedStyle, useSharedValue,
  withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

function useTypewriter(text: string, speed = 30) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsDone(false);
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
        setIsDone(true);
      }
    }, speed);
    return () => clearInterval(intervalId);
  }, [text, speed]);

  return { displayedText, isDone };
}

// Single bouncing dot for the step-7 celebration
function BounceDot({ color, delay }: { color: string; delay: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-14, { duration: 380 }),
          withTiming(0, { duration: 380 }),
        ),
        -1,
        false,
      ),
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[styles.bounceDot, { backgroundColor: color }, style]} />;
}

function BouncingDots() {
  const DOTS = [
    { color: theme.colors.accentPrimary, delay: 0 },
    { color: theme.colors.accentWarm,    delay: 110 },
    { color: theme.colors.accentDanger,  delay: 220 },
    { color: theme.colors.accentPrimary, delay: 330 },
    { color: theme.colors.accentWarm,    delay: 440 },
  ];
  return (
    <View style={styles.bouncingDotsRow}>
      {DOTS.map((d, i) => <BounceDot key={i} color={d.color} delay={d.delay} />)}
    </View>
  );
}

const DIALECTS = [
  { label: 'Gulf Arabic', sublabel: 'UAE · Saudi · Kuwait', value: 'gulf', flag: '🇦🇪' },
  { label: 'Egyptian Arabic', sublabel: 'Most widely understood', value: 'egyptian', flag: '🇪🇬' },
  { label: 'Modern Standard', sublabel: 'Formal · News · Books', value: 'msa', flag: '🌍' },
  { label: 'Levantine', sublabel: '🔜 Coming Soon', value: 'levantine', flag: '🇱🇧', disabled: true },
  { label: 'Maghrebi', sublabel: '🔜 Coming Soon', value: 'maghrebi', flag: '🇲🇦', disabled: true },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const { setDialect: setContextDialect } = useDialect();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [dialect, setDialect] = useState('');
  const [reason, setReason] = useState('');

  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [pronScore, setPronScore] = useState<number | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSelfAssess, setShowSelfAssess] = useState(false);

  const hasNavigatedRef = useRef(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const glow = useSharedValue(0);

  useEffect(() => {
    (async () => {
      await requestRecordingPermissionsAsync();
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    })();
    return () => { stopAudio(); };
  }, []);

  useEffect(() => {
    glow.value = isListening
      ? withRepeat(withTiming(1, { duration: 800 }), -1, true)
      : withTiming(0, { duration: 300 });
  }, [isListening]);

  // Auto-navigate to guest home after 4 s on step 7 if user hasn't tapped
  useEffect(() => {
    if (step !== 7) return;
    const timer = setTimeout(async () => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      await saveWizardData();
      await AsyncStorage.setItem('wizard_complete_date', new Date().toISOString());
      router.replace('/(tabs)');
    }, 4000);
    return () => clearTimeout(timer);
  }, [step]);

  const bubbleAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(glow.value, [0, 1], [theme.colors.borderDefault, theme.colors.borderAccent]),
    borderWidth: 2,
  }));

  // Swipe left = next step, swipe right = previous step
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 15,
      onPanResponderRelease: (_, { dx }) => {
        if (dx < -60 && step < 7) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setStep(s => s + 1);
        } else if (dx > 60 && step > 1) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setStep(s => s - 1);
        }
      },
    })
  ).current;

  const getStepText = () => {
    switch (step) {
      case 1: return "Assalamu alaykum, I'm Yusuf, your personal Arabic tutor.";
      case 2: return "What should I call you?";
      case 3: return `Nice to meet you, ${name || 'friend'}. What is your current level?`;
      case 4: return dialect
        ? `Great choice! ${DIALECTS.find(d => d.value === dialect)?.label ?? dialect} Arabic.`
        : `Great choice, ${name}! Which dialect do you want to learn?`;
      case 5: return "Why are you learning Arabic?";
      case 6: return showSelfAssess ? "How did that sound?" : "Hold the mic and say 'سلام'";
      case 7: return feedback || "Incredible first step!";
      default: return "";
    }
  };

  const { displayedText: typedText, isDone: typewriterDone } = useTypewriter(getStepText(), 35);

  const nextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => s + 1);
  };

  const handleLevelSelect = (lvl: string) => {
    setLevel(lvl);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(nextStep, 350);
  };

  const handleDialectSelect = (d: typeof DIALECTS[0]) => {
    if (d.disabled) return;
    setDialect(d.value);
    setContextDialect(d.value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => nextStep(), 400);
  };

  const handleReasonSelect = (r: string) => {
    setReason(r);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(nextStep, 350);
  };

  const playRecording = async () => {
    if (!recordingUri || isPlaying) return;
    setIsPlaying(true);
    try {
      playLocalAudio({ uri: recordingUri }, {
        onComplete: () => setIsPlaying(false),
      });
    } catch (e) {
      console.warn('Playback error:', e);
      setIsPlaying(false);
    }
  };

  const handlePressIn = () => {
    setIsListening(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try { audioRecorder.record(); } catch (err) { console.error('Failed to start recording', err); }
  };

  const handlePressOut = async () => {
    setIsListening(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await audioRecorder.stop();
      await new Promise(resolve => setTimeout(resolve, 300));
      const uri = audioRecorder.uri;
      if (uri) setRecordingUri(uri);
    } catch (e) { console.warn('Stop error:', e); }
    setShowSelfAssess(true);
  };

  const saveWizardData = async () => {
    await AsyncStorage.setItem('wizard_complete', 'true');
    await AsyncStorage.setItem('wizard_name', name);
    await AsyncStorage.setItem('wizard_dialect', dialect);
    await AsyncStorage.setItem('wizard_level', level.toLowerCase());
  };

  const renderBottomControls = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.controlsWrapper}>
            {typewriterDone && (
              <Animated.View entering={FadeIn.duration(400)} style={{ width: '100%' }}>
                <Pressable style={styles.primaryButton} onPress={nextStep}>
                  <Text style={styles.primaryButtonText}>Start Journey</Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        );
      case 2:
        return (
          <View style={styles.controlsWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Your name..."
              placeholderTextColor={theme.colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoCorrect={false}
              autoCapitalize="words"
              spellCheck={false}
              keyboardType="default"
            />
            <Pressable
              style={[styles.primaryButton, !name.trim() && { opacity: 0.5 }]}
              onPress={nextStep}
              disabled={!name.trim()}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
            </Pressable>
          </View>
        );
      case 3:
        return (
          <View style={styles.controlsWrapper}>
            <View style={styles.optionsList}>
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <Pressable
                  key={lvl}
                  style={[styles.outlineButton, level === lvl && styles.outlineButtonActive]}
                  onPress={() => handleLevelSelect(lvl)}
                >
                  <Text style={[styles.outlineButtonText, level === lvl && styles.outlineButtonTextActive]}>{lvl}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.controlsWrapper}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' }}>
              {DIALECTS.map((d) => (
                <Pressable
                  key={d.value}
                  onPress={() => handleDialectSelect(d)}
                  style={({ pressed }) => ({
                    width: '47%',
                    backgroundColor: theme.colors.bgSurface,
                    borderWidth: 1,
                    borderColor: dialect === d.value ? theme.colors.borderAccent : theme.colors.borderDefault,
                    borderRadius: theme.radii.md,
                    padding: 14,
                    alignItems: 'center' as const,
                    opacity: d.disabled ? 0.4 : 1,
                    transform: [{ scale: pressed && !d.disabled ? 0.97 : 1 }],
                  })}
                >
                  {d.disabled && (
                    <View style={styles.soonBadge}>
                      <Text style={styles.soonText}>Soon</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{d.flag}</Text>
                  <Text style={{ fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary }}>{d.label}</Text>
                  <Text style={{ fontSize: theme.fontSize.caption, color: theme.colors.textTertiary, textAlign: 'center', marginTop: 2 }}>{d.sublabel}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.controlsWrapper}>
            <View style={styles.optionsList}>
              {['Travel', 'Family', 'Career'].map((r) => (
                <Pressable
                  key={r}
                  style={[styles.outlineButton, reason === r && styles.outlineButtonActive]}
                  onPress={() => handleReasonSelect(r)}
                >
                  <Text style={[styles.outlineButtonText, reason === r && styles.outlineButtonTextActive]}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      case 6:
        return showSelfAssess ? (
          <View style={styles.controlsWrapper}>
            <Pressable style={styles.replayBtn} onPress={playRecording}>
              <Text style={styles.replayBtnText}>
                {isPlaying ? '▶ Playing...' : '🔊 Play my recording'}
              </Text>
            </Pressable>
            <View style={styles.finalActions}>
              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  setPronScore(98);
                  setFeedback("Excellent! That was a perfect 'Salam'. 🌟");
                  setShowSelfAssess(false);
                  setStep(7);
                }}
              >
                <Text style={styles.primaryButtonText}>Got it!</Text>
              </Pressable>
              <Pressable
                style={styles.ghostButton}
                onPress={() => { setShowSelfAssess(false); setRecordingUri(null); }}
              >
                <Text style={styles.ghostButtonText}>↩ Try again</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.controlsWrapper}>
            <View style={styles.micContainer}>
              <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={({ pressed }) => [styles.micButton, pressed && { transform: [{ scale: 0.95 }] }]}
              >
                <Mic size={36} color={theme.colors.bgBase} />
              </Pressable>
            </View>
          </View>
        );
      case 7: {
        const score = pronScore ?? 0;
        const scoreColor = score >= 85 ? theme.colors.accentPrimary : score >= 65 ? theme.colors.accentWarm : theme.colors.textPrimary;
        const praiseArabic = score >= 85 ? 'ممتاز!' : score >= 65 ? 'زين!' : 'حاول مرة ثانية';
        return (
          <View style={styles.controlsWrapper}>
            <BouncingDots />
            {pronScore !== null && (
              <View style={styles.scoreCard}>
                <Text style={[styles.scoreNumber, { color: scoreColor }]}>{score}</Text>
                <Text style={[styles.scoreLabel, { color: scoreColor }]}>{praiseArabic}</Text>
              </View>
            )}
            <View style={styles.finalActions}>
              <Pressable
                style={styles.primaryButton}
                onPress={async () => {
                  hasNavigatedRef.current = true;
                  await saveWizardData();
                  router.replace('/login' as any);
                }}
              >
                <Text style={styles.primaryButtonText}>Create Account</Text>
              </Pressable>
              <Pressable
                style={styles.ghostButton}
                onPress={async () => {
                  hasNavigatedRef.current = true;
                  await saveWizardData();
                  await AsyncStorage.setItem('wizard_complete_date', new Date().toISOString());
                  router.replace('/(tabs)');
                }}
              >
                <Text style={styles.ghostButtonText}>Continue as Guest</Text>
              </Pressable>
            </View>
          </View>
        );
      }
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header: back button + progress dots */}
      <View style={styles.wizardHeader}>
        {step > 1 ? (
          <Pressable
            style={styles.backBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setStep(s => s - 1);
            }}
          >
            <ArrowLeft color={theme.colors.textPrimary} size={18} />
          </Pressable>
        ) : (
          <View style={styles.backBtnPlaceholder} />
        )}

        <View style={styles.progressDots}>
          {Array.from({ length: 7 }, (_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.progressDot,
                step > i + 1 && styles.progressDotDone,
                step === i + 1 && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.backBtnPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        {...panResponder.panHandlers}
      >
        <View style={styles.topSection}>
          <Animated.View layout={LinearTransition.springify()} style={styles.bubbleWrapper}>
            <Animated.View style={[styles.blurContainer, bubbleAnimatedStyle]}>
              <View style={[styles.blurBubble, { backgroundColor: 'rgba(42, 39, 52, 0.98)' }]}>
                <Text style={styles.bubbleText}>{typedText}</Text>
              </View>
            </Animated.View>
            <View style={styles.bubbleTriangle} />
          </Animated.View>
        </View>

        <View style={styles.middleSection}>
          <LottieView
            key={step === 7 ? 'celebrating' : 'waving'}
            source={
              step === 7
                ? require('../assets/images/animations/yusuf-celebrating.json')
                : require('../assets/images/animations/yusuf-waving.json')
            }
            autoPlay
            loop={step !== 7}
            style={styles.characterImage}
          />
        </View>

        <View style={styles.bottomSection}>
          <Animated.View
            key={`step-controls-${step}`}
            entering={FadeInRight.duration(260)}
            exiting={FadeOutLeft.duration(200)}
            style={styles.stepControlsWrapper}
          >
            {renderBottomControls()}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
  },

  // ── Wizard header ──────────────────────────────────────────────────────────
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  backBtnPlaceholder: {
    width: 36,
    height: 36,
  },
  progressDots: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.bgElevated,
  },
  progressDotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accentPrimary,
  },
  progressDotDone: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accentPrimary,
    opacity: 0.5,
  },

  // ── Main layout ────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },
  middleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  bottomSection: {
    flex: 1.2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 24,
    overflow: 'hidden',
  },
  stepControlsWrapper: {
    width: '100%',
    alignItems: 'center',
  },

  // ── Speech bubble ──────────────────────────────────────────────────────────
  bubbleWrapper: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    overflow: 'visible',
  },
  blurContainer: {
    width: '100%',
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  blurBubble: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
    lineHeight: 32,
  },
  bubbleTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.borderDefault,
    alignSelf: 'center',
  },

  // ── Lottie ─────────────────────────────────────────────────────────────────
  characterImage: {
    height: 220,
    width: 220,
  },

  // ── Controls ───────────────────────────────────────────────────────────────
  controlsWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.accentPrimary,
    width: '100%',
    height: 60,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.bgBase,
    fontSize: 18,
    fontWeight: theme.fontWeight.medium,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    width: '100%',
    height: 60,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: theme.fontWeight.medium,
  },
  textInput: {
    width: '100%',
    height: 60,
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radii.md,
    paddingHorizontal: 20,
    color: theme.colors.textPrimary,
    fontSize: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    marginBottom: 24,
  },
  optionsList: {
    width: '100%',
    gap: 12,
  },
  outlineButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    backgroundColor: theme.colors.bgSurface,
    alignItems: 'center',
  },
  outlineButtonActive: {
    borderColor: theme.colors.borderAccent,
  },
  outlineButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: theme.fontWeight.medium,
  },
  outlineButtonTextActive: {
    color: theme.colors.textAccent,
  },
  micContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.accentPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  finalActions: {
    width: '100%',
    gap: 16,
  },
  scoreCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: theme.fontWeight.medium,
    lineHeight: 80,
  },
  scoreLabel: {
    fontSize: 24,
    fontWeight: theme.fontWeight.medium,
    marginTop: 4,
  },
  replayBtn: {
    width: '100%',
    height: 52,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  replayBtnText: {
    color: theme.colors.bgBase,
    fontSize: 16,
    fontWeight: theme.fontWeight.medium,
  },

  // ── Soon badge ─────────────────────────────────────────────────────────────
  soonBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radii.xs, paddingHorizontal: 6, paddingVertical: 2,
  },
  soonText: { fontSize: 9, color: theme.colors.textTertiary, fontWeight: theme.fontWeight.medium, textTransform: 'uppercase', letterSpacing: 1 },

  // ── Bouncing dots ──────────────────────────────────────────────────────────
  bouncingDotsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  bounceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
