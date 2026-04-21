import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle,
  Lightbulb, Mic, StopCircle, Volume2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
} from 'expo-audio';
import LottieView from 'lottie-react-native';
import CafeScene from '../components/CafeScene';
import { playLocalAudio, stopAudio } from '../utils/tts';
import { stripTashkeel } from '../utils/arabic';
import { supabase } from '../utils/supabase';
import { getLevelFromXP } from '../constants/levels';
import { useDialect } from '../contexts/DialectContext';
import type { DialogueTurn } from '../data/content-registry';
import { DIALECT_LABELS } from '../data/content-registry';
import { recordActivity } from '../utils/streak';

type RecordingState = 'idle' | 'recording' | 'playing' | 'feedback';

const ENCOURAGEMENTS = ['ممتاز', 'أحسنت', 'رائع', 'بالضبط', 'جيد جداً'];

function getPartLabel(index: number, type: string | undefined): string {
  if (type === 'Taxi') {
    if (index < 6) return '🚕 Greetings';
    if (index < 12) return '🗺️ During Ride';
    return '💳 Paying';
  }
  if (type === 'Hotel') {
    if (index < 6) return '🛎️ Check-in';
    if (index < 11) return '🗺️ Directions';
    return '🍳 Breakfast';
  }
  if (type === 'Restaurant') {
    if (index < 4) return '🍽️ Greetings';
    if (index < 12) return '🥘 Ordering';
    return '💳 Paying';
  }
  if (type === 'Supermarket') {
    if (index < 2) return '🛒 Greetings';
    if (index < 8) return '🔍 Shopping';
    return '💳 Checkout';
  }
  if (type === 'Pharmacy') {
    if (index < 2) return '💊 Greetings';
    if (index < 8) return '🤒 Symptoms';
    return '💊 Medicine';
  }
  if (type === 'Barbershop') {
    if (index < 2) return '✂️ Greetings';
    if (index < 10) return '✂️ Haircut';
    return '💳 Paying';
  }
  if (type === 'Airport') {
    if (index < 2) return '✈️ Greetings';
    if (index < 10) return '🎫 Check-in';
    return '🚪 Boarding';
  }
  if (type === 'MorningRoutine') {
    if (index < 4) return '🌅 Waking Up';
    return '☕ Breakfast';
  }
  if (type === 'AtGym') {
    if (index < 4) return '👋 Greetings';
    return '💪 Working Out';
  }
  if (type === 'CookingHome') {
    if (index < 4) return '🍳 Planning';
    return '🍚 Cooking';
  }
  if (type === 'WeatherChat') {
    if (index < 4) return '☀️ The Heat';
    return '🌪️ Forecast';
  }
  if (type === 'DoctorVisit') {
    if (index < 4) return '🏥 Symptoms';
    return '💊 Treatment';
  }
  if (type === 'AtBank') {
    if (index < 4) return '🏦 Greetings';
    return '📋 Account';
  }
  if (type === 'FridayGathering') {
    if (index < 4) return '🕌 Welcome';
    return '🍖 The Feast';
  }
  if (type === 'NeighborVisit') {
    if (index < 4) return '🏠 Welcome';
    return '☕ Coffee';
  }
  if (type === 'LostInCity') {
    if (index < 4) return '🗺️ Getting Lost';
    return '🚶 Finding the Way';
  }
  if (type === 'CarBreakdown') {
    if (index < 4) return '🚗 Breakdown';
    return '🔧 Getting Help';
  }
  if (type === 'PoliceStation') {
    if (index < 4) return '👮 Reporting';
    return '📝 Details';
  }
  if (type === 'HospitalEmergency') {
    if (index < 4) return '🏥 Emergency';
    return '⚕️ Treatment';
  }
  if (type === 'LostWallet') {
    if (index < 4) return '👛 Lost Item';
    return '🔍 Finding It';
  }
  if (type === 'PhoneStolen') {
    if (index < 4) return '📱 Stolen';
    return '📋 Report';
  }
  if (type === 'FlightProblem') {
    if (index < 4) return '✈️ Delay';
    return '🎫 Rebooking';
  }
  if (type === 'AskingForHelp') {
    if (index < 4) return '🙏 Asking';
    return '🤝 Helped';
  }
  if (type === 'FriendsNewNeighbor') {
    if (index < 4) return '🏠 Meeting';
    return '🤝 Bonding';
  }
  if (type === 'FriendsFootball') {
    if (index < 4) return '⚽ Pre-Match';
    return '📺 Game Night';
  }
  if (type === 'FriendsGaming') {
    if (index < 4) return '🎮 Planning';
    return '🕹️ Game On';
  }
  if (type === 'FriendsWeekend') {
    if (index < 4) return '📅 Planning';
    return '🏖️ The Trip';
  }
  if (type === 'FriendsSocialMedia') {
    if (index < 4) return '📸 The Post';
    return '📱 Following';
  }
  if (type === 'FriendsRoadTrip') {
    if (index < 4) return '🗺️ Planning';
    return '🚗 Road Trip';
  }
  if (type === 'FriendsBirthday') {
    if (index < 4) return '🎂 Greetings';
    return '🎉 Celebrate';
  }
  if (type === 'FriendsFarewell') {
    if (index < 5) return '😔 The News';
    return '👋 Goodbye';
  }
  if (index < 8) return '☕ Greetings';
  if (index < 18) return '🫖 Ordering';
  return '💳 Paying';
}

export default function ScenarioScreen() {
  const router = useRouter();
  const { type: typeParam } = useLocalSearchParams();
  const typeStr = Array.isArray(typeParam) ? typeParam[0] : typeParam;
  const isTaxi = typeStr === 'Taxi';
  const isHotel = typeStr === 'Hotel';

  const { content, dialect, speakInDialect } = useDialect();

  console.log('scenario type:', typeStr);

  const DIALOGUE = content.scenarios[typeStr ?? 'Cafe'] ?? [];

  const sceneImage = content.sceneImages[typeStr ?? 'Cafe'] ?? content.sceneImages['Cafe'];

  const getSceneBadge = () => {
    const dialectLabel = DIALECT_LABELS[dialect] ?? 'Arabic';
    switch (typeStr) {
      case 'Taxi':        return `🚕 Taxi · ${dialectLabel}`;
      case 'Hotel':       return `🏨 Hotel · ${dialectLabel}`;
      case 'Restaurant':  return `🍽️ Restaurant · ${dialectLabel}`;
      case 'Supermarket': return `🛒 Supermarket · ${dialectLabel}`;
      case 'Pharmacy':    return `💊 Pharmacy · ${dialectLabel}`;
      case 'Barbershop':     return `✂️ Barbershop · ${dialectLabel}`;
      case 'Airport':        return `✈️ Airport · ${dialectLabel}`;
      case 'MorningRoutine': return `🌅 Morning Routine · ${dialectLabel}`;
      case 'AtGym':          return `💪 At the Gym · ${dialectLabel}`;
      case 'CookingHome':    return `🍳 Cooking at Home · ${dialectLabel}`;
      case 'WeatherChat':    return `☀️ Weather Chat · ${dialectLabel}`;
      case 'DoctorVisit':    return `🏥 Doctor Visit · ${dialectLabel}`;
      case 'AtBank':         return `🏦 At the Bank · ${dialectLabel}`;
      case 'FridayGathering': return `🕌 Friday Gathering · ${dialectLabel}`;
      case 'NeighborVisit':      return `🏠 Neighbour Visit · ${dialectLabel}`;
      case 'LostInCity':         return `🗺️ Lost in the City · ${dialectLabel}`;
      case 'CarBreakdown':       return `🚗 Car Breakdown · ${dialectLabel}`;
      case 'PoliceStation':      return `👮 Police Station · ${dialectLabel}`;
      case 'HospitalEmergency':  return `🏥 Hospital Emergency · ${dialectLabel}`;
      case 'LostWallet':         return `👛 Lost Wallet · ${dialectLabel}`;
      case 'PhoneStolen':        return `📱 Phone Stolen · ${dialectLabel}`;
      case 'FlightProblem':      return `✈️ Flight Problem · ${dialectLabel}`;
      case 'AskingForHelp':      return `🙏 Asking for Help · ${dialectLabel}`;
      case 'FriendsNewNeighbor': return `🏠 New Neighbor · ${dialectLabel}`;
      case 'FriendsFootball':    return `⚽ Watching Football · ${dialectLabel}`;
      case 'FriendsGaming':      return `🎮 Gaming Night · ${dialectLabel}`;
      case 'FriendsWeekend':     return `🏖️ Weekend Plans · ${dialectLabel}`;
      case 'FriendsSocialMedia': return `📱 Social Media · ${dialectLabel}`;
      case 'FriendsRoadTrip':    return `🚗 Road Trip · ${dialectLabel}`;
      case 'FriendsBirthday':    return `🎂 Birthday Party · ${dialectLabel}`;
      case 'FriendsFarewell':    return `👋 Saying Goodbye · ${dialectLabel}`;
      default:                   return `☕ Café · ${dialectLabel}`;
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [showNext, setShowNext] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: string; icon: string; color: string } | null>(null);

  const isComingSoon = DIALOGUE.length === 0;

  const currentTurn = isComingSoon ? { type: 'waiter' as const, arabic: '', transliteration: '', english: '' } : DIALOGUE[currentIndex];
  const isUserTurn = currentTurn.type === 'user';
  const isWaiterTurn = currentTurn.type === 'waiter';
  const total = DIALOGUE.length;
  const progressWidth = `${((currentIndex + 1) / total) * 100}%` as any;

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Reset per-turn state when index changes
  useEffect(() => {
    setRecordingState('idle');
    setShowNext(false);
    handleAutoPlay();
  }, [currentIndex]);

  useEffect(() => () => { stopAudio(); }, []);

  // Android hardware back button confirmation
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Leave Scenario?',
        'Your conversation progress will be lost.',
        [
          { text: 'Keep Going', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)') },
        ]
      );
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Pulse animation when recording
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (recordingState === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [recordingState]);

  const handleAutoPlay = async () => {
    setIsSpeaking(true);
    if (currentTurn.audio) {
      await playLocalAudio(currentTurn.audio);
    } else {
      await speakInDialect(currentTurn.arabic);
    }
    setIsSpeaking(false);
  };

  const handleSpeak = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    await speakInDialect(currentTurn.arabic);
    setIsSpeaking(false);
  };

  const handleMicPressIn = async () => {
    setRecordingState('recording');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await requestRecordingPermissionsAsync();
    audioRecorder.record();
  };

  const handleMicPressOut = async () => {
    if (recordingState !== 'recording') return;
    setRecordingState('playing');

    await audioRecorder.stop();
    const uri = audioRecorder.uri;

    if (uri) {
      try {
        playLocalAudio({ uri }, {
          onComplete: async () => {
            setRecordingState('feedback');
            const random = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
            await speakInDialect(random);
            setTimeout(() => {
              setRecordingState('idle');
              setShowNext(true);
            }, 2000);
          },
        });
      } catch (err) {
        console.warn('Playback error:', err);
        setRecordingState('idle');
        setShowNext(true);
      }
    } else {
      setRecordingState('idle');
      setShowNext(true);
    }
  };

  const saveCompletion = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;
      const xpEarned = 120;

      const { data: xpData } = await supabase
        .from('users')
        .select('xp')
        .eq('id', userId)
        .maybeSingle();
      const previousXP = xpData?.xp ?? 0;
      const oldLevel = getLevelFromXP(previousXP);
      const newLevel = getLevelFromXP(previousXP + xpEarned);
      if (oldLevel.name !== newLevel.name) {
        setLevelUpData({ newLevel: newLevel.name, icon: newLevel.icon, color: newLevel.color });
        setShowLevelUp(true);
      }

      const scenarioKey = typeStr?.toLowerCase() ?? 'cafe';

      await supabase.from('conversations').insert({
        user_id: userId,
        scenario: scenarioKey,
        dialect: dialect,
        level: 'beginner',
        status: 'completed',
        score: 100,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
        phrases_completed: DIALOGUE.filter(t => t.type === 'user').length,
        phrases_total: DIALOGUE.filter(t => t.type === 'user').length,
      });

      const { data: existing } = await supabase
        .from('scenario_progress')
        .select('id, attempts, best_score')
        .eq('user_id', userId)
        .eq('scenario', scenarioKey)
        .maybeSingle();

      if (existing) {
        await supabase.from('scenario_progress').update({
          completed: true,
          best_score: Math.max(existing.best_score ?? 0, 100),
          attempts: (existing.attempts ?? 0) + 1,
        }).eq('id', existing.id);
      } else {
        await supabase.from('scenario_progress').insert({
          user_id: userId,
          scenario: scenarioKey,
          dialect: dialect,
          completed: true,
          best_score: 100,
          attempts: 1,
        });
      }

      const { data: userData } = await supabase
        .from('users')
        .select('xp')
        .eq('id', userId)
        .maybeSingle();

      await supabase.from('users').update({
        xp: (userData?.xp ?? 0) + xpEarned,
      }).eq('id', userId);

      // Delegate streak tracking to recordActivity()
      await recordActivity();
    } catch (err) {
      console.warn('Save completion error:', err);
    }
  };

  const handleAdvance = () => {
    if (currentIndex === total - 1) {
      setCompleted(true);
      saveCompletion();
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (isComingSoon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔜</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8, textAlign: 'center' }}>Coming Soon</Text>
          <Text style={{ fontSize: 15, color: '#555', textAlign: 'center', marginBottom: 32 }}>
            This scenario is not available for your selected dialect yet. We're working on it!
          </Text>
          <Pressable style={styles.completionButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}>
            <Text style={styles.completionButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => {
          Alert.alert(
            'Leave Scenario?',
            'Your conversation progress will be lost.',
            [
              { text: 'Keep Going', style: 'cancel' },
              { text: 'Leave', style: 'destructive', onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)') },
            ]
          );
        }} style={styles.backButton}>
          <ArrowLeft color="#FFF" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>{getSceneBadge()}</Text>
        <View style={styles.headerRight}>
          <LottieView
            key={isSpeaking ? 'talking' : 'idle'}
            source={isSpeaking
              ? require('../assets/images/animations/yusuf-talking.json')
              : require('../assets/images/animations/yusuf-waving.json')
            }
            autoPlay={isSpeaking}
            loop={isSpeaking}
            style={styles.headerLottie}
          />
          <View style={styles.partPill}>
            <Text style={styles.partPillText}>{getPartLabel(currentIndex, typeStr)}</Text>
          </View>
        </View>
      </View>

      {/* Scene area */}
      <View style={styles.sceneArea}>
        <CafeScene
          arabic={stripTashkeel(currentTurn.arabic)}
          transliteration={currentTurn.transliteration}
          isWaiterSpeaking={isWaiterTurn}
          isUserTurn={isUserTurn}
          backgroundImage={sceneImage}
        />
      </View>

      {/* Completion overlay */}
      <Modal visible={completed} transparent animationType="fade">
        <View style={styles.completionOverlay}>
          <View style={styles.completionCard}>

            <LottieView
              source={require('../assets/images/animations/yusuf-celebrating.json')}
              autoPlay
              loop={false}
              style={styles.completionLottie}
            />
            <Text style={styles.completionTitle}>انتهى!</Text>
            <Text style={styles.completionSubtitle}>{
              typeStr === 'Taxi'        ? 'Taxi scenario complete' :
              typeStr === 'Hotel'       ? 'Hotel scenario complete' :
              typeStr === 'Restaurant'  ? 'Restaurant scenario complete' :
              typeStr === 'Supermarket' ? 'Supermarket scenario complete' :
              typeStr === 'Pharmacy'    ? 'Pharmacy scenario complete' :
              typeStr === 'Barbershop'  ? 'Barbershop scenario complete' :
              typeStr === 'Airport'     ? 'Airport scenario complete' :
              'Café scenario complete'
            }</Text>

            <View style={styles.completionStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Phrases spoken</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>+120</Text>
                <Text style={styles.statLabel}>XP earned</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
            </View>

            <Pressable
              style={styles.completionButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.completionButtonText}>Back to Home</Text>
            </Pressable>

            <Pressable
              style={styles.tryAgainButton}
              onPress={() => {
                setCompleted(false);
                setCurrentIndex(0);
                setRecordingState('idle');
              }}
            >
              <Text style={styles.tryAgainText}>Try Again</Text>
            </Pressable>

          </View>
        </View>
      </Modal>

      {/* Level Up Modal */}
      <Modal visible={showLevelUp} transparent animationType="fade">
        <View style={styles.levelUpOverlay}>
          <View style={styles.levelUpCard}>
            <Text style={styles.levelUpEmoji}>{levelUpData?.icon}</Text>
            <Text style={styles.levelUpTitle}>Level Up!</Text>
            <Text style={[styles.levelUpLevel, { color: levelUpData?.color ?? '#00897B' }]}>{levelUpData?.newLevel}</Text>
            <Text style={styles.levelUpSub}>You reached a new level. Keep going!</Text>
            <Pressable style={styles.levelUpButton} onPress={() => setShowLevelUp(false)}>
              <Text style={styles.levelUpButtonText}>Continue 🎉</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>

        <>
            {/* Progress row */}
            <View style={styles.progressRow}>
              <View style={styles.progressMeta}>
                <Text style={styles.partLabel}>{getPartLabel(currentIndex, typeStr).replace(/^[^ ]+ /, '')}</Text>
                <Text style={styles.progressLabel}>{currentIndex + 1} / {total}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: progressWidth }]} />
              </View>
            </View>

            {/* Phrase card */}
            <View style={[styles.phraseCard, isWaiterTurn ? styles.waiterCard : styles.userCard]}>
              <Text style={isWaiterTurn ? styles.turnLabelWaiter : styles.turnLabelUser}>
                {isWaiterTurn ? '🧑‍🍳 Waiter says' : '🎙 Your turn — say it'}
              </Text>
              {currentTurn.context ? (
                <Text style={styles.contextText}>{currentTurn.context}</Text>
              ) : null}
              <Text style={[styles.arabicText, { fontSize: currentTurn.arabic.length <= 10 ? 32 : 22 }]}>
                {stripTashkeel(currentTurn.arabic)}
              </Text>
              <Text style={styles.transliterationText}>{currentTurn.transliteration}</Text>
              <Text style={styles.englishText}>{currentTurn.english}</Text>
            </View>

            {isWaiterTurn ? (
              /* Waiter turn controls */
              <View style={styles.waiterControls}>
                <Pressable
                  style={[styles.iconButton, isSpeaking && { opacity: 0.6 }]}
                  onPress={handleSpeak}
                >
                  {isSpeaking
                    ? <ActivityIndicator size="small" color="#888" />
                    : <Volume2 color="#888" size={20} />
                  }
                </Pressable>
                <Pressable style={styles.gotItButton} onPress={handleAdvance}>
                  <Text style={styles.gotItText}>Got it  →</Text>
                </Pressable>
              </View>
            ) : (
              /* User turn controls */
              <>
                <View style={styles.controlsRow}>
                  <Pressable
                    style={[styles.iconButton, isSpeaking && { opacity: 0.6 }]}
                    onPress={handleSpeak}
                  >
                    {isSpeaking
                      ? <ActivityIndicator size="small" color="#888" />
                      : <Volume2 color="#888" size={20} />
                    }
                  </Pressable>

                  <Pressable style={styles.iconButton}>
                    <Lightbulb color="#888" size={20} />
                  </Pressable>

                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Pressable
                      onPressIn={handleMicPressIn}
                      onPressOut={handleMicPressOut}
                      disabled={recordingState === 'playing'}
                      style={[
                        styles.micButton,
                        recordingState === 'recording' && { backgroundColor: '#FF4444' },
                        recordingState === 'playing'   && { backgroundColor: '#555' },
                        recordingState === 'feedback'  && { backgroundColor: '#00732F' },
                      ]}
                    >
                      {recordingState === 'idle'      && <Mic color="#FFF" size={26} />}
                      {recordingState === 'recording' && <StopCircle color="#FFF" size={26} />}
                      {recordingState === 'playing'   && <ActivityIndicator color="#FFF" />}
                      {recordingState === 'feedback'  && <CheckCircle color="#FFF" size={26} />}
                    </Pressable>
                  </Animated.View>

                  <Pressable style={styles.iconButton}>
                    <BookOpen color="#888" size={20} />
                  </Pressable>

                  <Pressable
                    style={[
                      styles.iconButton,
                      !showNext && { opacity: 0.3 },
                      showNext && { borderColor: '#00897B' },
                    ]}
                    onPress={showNext ? handleAdvance : undefined}
                    disabled={!showNext}
                  >
                    <ArrowRight color="#FFF" size={20} />
                  </Pressable>
                </View>

                {showNext && (
                  <View style={styles.hintsRow}>
                    <Pressable style={styles.nextButton} onPress={handleAdvance}>
                      <Text style={styles.nextButtonText}>Next  →</Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}
          </>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLottie: { width: 36, height: 36 },
  partPill: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#1A1A1A',
  },
  partPillText: {
    color: '#888',
    fontSize: 11,
  },
  sceneArea: {
    flex: 0.52,
  },
  bottomPanel: {
    flex: 0.48,
    backgroundColor: '#111',
    paddingBottom: 24,
  },
  progressRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  partLabel: {
    fontSize: 11,
    color: '#00897B',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#222',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00897B',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 11,
    color: '#555',
  },
  phraseCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    minHeight: 90,
  },
  waiterCard: {
    backgroundColor: '#1A1A1A',
    borderColor: '#2A2A2A',
    borderLeftWidth: 3,
    borderLeftColor: '#FAC775',
  },
  userCard: {
    backgroundColor: 'rgba(0, 137, 123, 0.08)',
    borderColor: '#1A3330',
    borderLeftWidth: 3,
    borderLeftColor: '#00897B',
  },
  turnLabelWaiter: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  turnLabelUser: {
    fontSize: 12,
    color: '#00897B',
    marginBottom: 6,
  },
  contextText: {
    fontSize: 11,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  arabicText: {
    textAlign: 'right',
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  transliterationText: {
    fontSize: 14,
    color: '#00897B',
    marginBottom: 2,
  },
  englishText: {
    fontSize: 13,
    color: '#555',
  },
  // Waiter turn controls
  waiterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  gotItButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // User turn controls
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00897B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintsRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  nextButton: {
    height: 44,
    backgroundColor: '#00897B',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Completion overlay
  completionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completionCard: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  completionLottie: { width: 120, height: 120, marginBottom: 8 },
  completionTitle: { fontSize: 36, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  completionSubtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  completionStats: {
    flexDirection: 'row',
    marginBottom: 32,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#00897B' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#333' },
  completionButton: {
    backgroundColor: '#00897B',
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  tryAgainButton: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tryAgainText: { color: '#555', fontSize: 15 },
  levelUpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  levelUpCard: { backgroundColor: '#111', borderRadius: 24, padding: 32, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  levelUpEmoji: { fontSize: 64, marginBottom: 8 },
  levelUpTitle: { fontSize: 18, color: '#888', marginBottom: 4 },
  levelUpLevel: { fontSize: 36, fontWeight: '800', marginBottom: 8 },
  levelUpSub: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 24 },
  levelUpButton: { backgroundColor: '#00897B', width: '100%', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  levelUpButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
