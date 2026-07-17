import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    RecordingPresets,
    requestRecordingPermissionsAsync,
    useAudioRecorder,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft, ArrowRight, BookOpen, CheckCircle,
    Lightbulb, Mic, StopCircle, Volume2,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    BackHandler,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CafeScene from '../components/CafeScene';
import PremiumRouteGate from '../components/PremiumRouteGate';
import ScenarioCompletionCelebration from '../components/ScenarioCompletionCelebration';
import { theme } from '../constants/theme';
import { useDialect } from '../contexts/DialectContext';
import { useXP } from '../contexts/XPContext';
import { DIALECT_LABELS } from '../data/content-registry';
import { stripTashkeel } from '../utils/arabic';
import { getScenarioContentId } from '../utils/access';
import { resolveContent } from '../utils/content-resolver';
import { feedbackLevelUp } from '../utils/feedback';
import { evaluatePronunciation } from '../utils/pronunciation';
import { buildCompletionKey, getCompletionKeyCandidates } from '../utils/progression';
import { recordActivity } from '../utils/streak';
import { supabase } from '../utils/supabase';
import { playLocalAudio, prepareRecordingAudioMode, restorePlaybackAudioMode, stopAudio } from '../utils/tts';

type RecordingState = 'idle' | 'recording' | 'playing' | 'feedback';
type ScenarioEvalStatus = 'passed' | 'close' | 'failed' | 'unavailable';
type ScenarioEvalResult = {
  status: ScenarioEvalStatus;
  score?: number;
  feedback: string;
  transcript?: string;
};

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

function getSpeakerRoleLabel(type: string | undefined): string {
  switch (type) {
    case 'Taxi': return 'Driver says';
    case 'Hotel': return 'Receptionist says';
    case 'Supermarket': return 'Staff says';
    case 'Pharmacy': return 'Pharmacist says';
    case 'Barbershop': return 'Barber says';
    case 'Airport': return 'Airport staff says';
    case 'Restaurant': return 'Waiter says';
    case 'Cafe':
    default: return 'Waiter says';
  }
}

function getScenarioCompletionCopy(type: string | undefined) {
  switch (type) {
    case 'Taxi':
      return {
        headline: 'You handled a taxi ride in Arabic.',
        subtitle: 'Directions, destination, and the ride itself are now part of your active vocabulary.',
      };
    case 'Hotel':
      return {
        headline: 'You checked into a hotel in Arabic.',
        subtitle: 'That is practical travel Arabic, not isolated flashcard knowledge.',
      };
    case 'Restaurant':
      return {
        headline: 'You got through a full restaurant exchange.',
        subtitle: 'Ordering, clarifying, and paying all stayed inside one real conversation.',
      };
    case 'Supermarket':
      return {
        headline: 'You navigated a supermarket in Arabic.',
        subtitle: 'Small everyday shopping language is exactly what builds confidence fast.',
      };
    case 'Pharmacy':
      return {
        headline: 'You handled a pharmacy visit in Arabic.',
        subtitle: 'That kind of useful pressure practice is what turns memorized words into usable speech.',
      };
    case 'Barbershop':
      return {
        headline: 'You made it through a barbershop conversation.',
        subtitle: 'Specific requests and follow-up answers are getting easier to say out loud.',
      };
    case 'Airport':
      return {
        headline: 'You completed an airport conversation in Arabic.',
        subtitle: 'Check-in and travel phrases are now tied to a real situation, not just a list.',
      };
    case 'MorningRoutine':
      return {
        headline: 'You talked through a morning routine in Arabic.',
        subtitle: 'That kind of familiar daily language is what makes practice stick between sessions.',
      };
    case 'AtGym':
      return {
        headline: 'You got through a gym conversation in Arabic.',
        subtitle: 'Casual real-world dialogue is becoming something you can actually respond to.',
      };
    case 'CookingHome':
      return {
        headline: 'You carried a cooking conversation in Arabic.',
        subtitle: 'Home vocabulary lands better when it lives inside actions and decisions.',
      };
    case 'WeatherChat':
      return {
        headline: 'You kept a weather chat going in Arabic.',
        subtitle: 'Small talk matters because it is often the doorway into every other conversation.',
      };
    case 'DoctorVisit':
      return {
        headline: 'You made it through a doctor visit in Arabic.',
        subtitle: 'High-utility phrases get more valuable the moment you can say them under pressure.',
      };
    case 'AtBank':
      return {
        headline: 'You handled a bank conversation in Arabic.',
        subtitle: 'Formal requests and practical questions are now part of your usable toolkit.',
      };
    case 'FridayGathering':
      return {
        headline: 'You joined a Friday gathering in Arabic.',
        subtitle: 'Social language is where fluency starts to feel human instead of academic.',
      };
    case 'NeighborVisit':
      return {
        headline: 'You visited a neighbor in Arabic.',
        subtitle: 'Warm everyday phrases are what make the dialect feel lived-in and natural.',
      };
    case 'LostInCity':
      return {
        headline: 'You found your way through the city in Arabic.',
        subtitle: 'Asking for directions is one of the clearest signs that the language is becoming useful.',
      };
    case 'CarBreakdown':
      return {
        headline: 'You dealt with a car breakdown in Arabic.',
        subtitle: 'Stress-test scenarios like this are where real retention gets built.',
      };
    case 'PoliceStation':
      return {
        headline: 'You reported the situation in Arabic.',
        subtitle: 'Explaining details under structure is a strong step beyond beginner practice.',
      };
    case 'HospitalEmergency':
      return {
        headline: 'You handled an emergency conversation in Arabic.',
        subtitle: 'The more serious the situation, the more valuable this kind of scenario training becomes.',
      };
    case 'LostWallet':
      return {
        headline: 'You reported a lost wallet in Arabic.',
        subtitle: 'Useful phrases stick better when they solve an actual problem.',
      };
    case 'FlightProblem':
      return {
        headline: 'You worked through a flight problem in Arabic.',
        subtitle: 'Travel disruption language is hard to fake, which makes it powerful practice.',
      };
    case 'AskingForHelp':
      return {
        headline: 'You asked for help in Arabic.',
        subtitle: 'That is one of the most important thresholds in real communication.',
      };
    case 'FriendsNewNeighbor':
      return {
        headline: 'You met a new neighbor in Arabic.',
        subtitle: 'Friendly, low-pressure dialogue is how speaking starts to feel natural.',
      };
    case 'FriendsFootball':
      return {
        headline: 'You talked football in Arabic.',
        subtitle: 'Interest-based conversations are where retention gets much stronger.',
      };
    case 'FriendsGaming':
      return {
        headline: 'You got through a gaming chat in Arabic.',
        subtitle: 'Personal topics make repeated practice much easier to come back to.',
      };
    case 'FriendsWeekend':
      return {
        headline: 'You planned a weekend in Arabic.',
        subtitle: 'Planning language is a strong sign you are moving from response mode into expression.',
      };
    case 'FriendsSocialMedia':
      return {
        headline: 'You talked social media in Arabic.',
        subtitle: 'Modern casual topics help the language feel current and alive.',
      };
    case 'FriendsRoadTrip':
      return {
        headline: 'You planned a road trip in Arabic.',
        subtitle: 'Longer playful exchanges are exactly what build conversational stamina.',
      };
    case 'FriendsBirthday':
      return {
        headline: 'You made it through a birthday conversation in Arabic.',
        subtitle: 'Celebration language is social glue, and now it is part of your active speech.',
      };
    case 'FriendsFarewell':
      return {
        headline: 'You said goodbye in Arabic with confidence.',
        subtitle: 'Emotional conversations are where spoken language starts to feel real.',
      };
    case 'Cafe':
    default:
      return {
        headline: 'You ordered at a cafe in Arabic.',
        subtitle: 'That is real-world speaking practice, not just recognition. Keep stacking situations like this.',
      };
  }
}

function getEvalTitle(status: ScenarioEvalStatus): string {
  switch (status) {
    case 'passed': return 'Nice!';
    case 'close': return 'Almost';
    case 'failed': return 'Try again';
    case 'unavailable': return 'Not checked';
  }
}

function getEvalSubtitle(result: ScenarioEvalResult): string {
  if (result.status === 'passed') return 'Good pronunciation';
  return result.feedback;
}

const SCENARIO_ACCEPTED_ALTERNATIVES_BY_DIALECT: Record<string, Array<{ target: string; accepts: string[] }>> = {
  gulf: [
  // Greetings
  { target: 'السلام عليكم', accepts: ['السلام عليكم', 'سلام عليكم', 'السلام', 'سلام'] },
  { target: 'وعليكم السلام', accepts: ['وعليكم السلام', 'وعليكم', 'السلام', 'سلام'] },
  { target: 'هلا', accepts: ['هلا', 'هلا والله', 'مرحبا', 'اهلا'] },
  { target: 'هلا والله', accepts: ['هلا والله', 'هلا', 'اهلا', 'مرحبا'] },
  { target: 'مرحبا', accepts: ['مرحبا', 'هلا', 'اهلا', 'يا هلا'] },
  // Yes / No
  { target: 'إي', accepts: ['اي', 'ايوه', 'نعم', 'اه', 'صح', 'زين'] },
  { target: 'اي', accepts: ['اي', 'ايوه', 'نعم', 'اه', 'إي'] },
  { target: 'نعم', accepts: ['نعم', 'ايوه', 'اي', 'إي', 'اه'] },
  { target: 'لا', accepts: ['لا', 'لأ'] },
  // Thank you variants
  { target: 'شكراً', accepts: ['شكرا', 'مشكور', 'تسلم', 'يسلمو', 'ماشكور'] },
  { target: 'شكرا', accepts: ['شكرا', 'شكراً', 'مشكور', 'تسلم', 'يسلمو'] },
  { target: 'مشكور', accepts: ['مشكور', 'شكرا', 'شكراً', 'تسلم'] },
  // Please / here you go
  { target: 'تفضل', accepts: ['تفضل', 'تفضلي', 'تفضلوا', 'فضلا'] },
  { target: 'لو سمحت', accepts: ['لو سمحت', 'لو سمحتي', 'من فضلك', 'ارجوك'] },
  // Goodbye
  { target: 'مع السلامة', accepts: ['مع السلامة', 'مع السلامه', 'يسلمك', 'الله يسلمك', 'باي'] },
  { target: 'الله يسلمك', accepts: ['الله يسلمك', 'يسلمك', 'مع السلامة', 'سلامات'] },
  // Good
  { target: 'زين', accepts: ['زين', 'زيين', 'تمام', 'حلو', 'ماشي', 'اوكيه'] },
  { target: 'تمام', accepts: ['تمام', 'زين', 'حلو', 'ماشي'] },
  // Common filler / responses
  { target: 'ماشي', accepts: ['ماشي', 'تمام', 'اوكيه', 'زين'] },
  { target: 'إن شاء الله', accepts: ['إن شاء الله', 'ان شاء الله', 'انشالله', 'إنشالله'] },
  { target: 'الحمد لله', accepts: ['الحمد لله', 'الحمدلله', 'بخير'] },
  { target: 'آمين', accepts: ['آمين', 'امين'] },
  ],
  egyptian: [
    { target: 'أيوه', accepts: ['ايوه', 'اه', 'نعم'] },
    { target: 'لا', accepts: ['لا', 'لأ'] },
    { target: 'شكراً', accepts: ['شكرا', 'متشكر', 'تسلم'] },
    { target: 'لو سمحت', accepts: ['لو سمحت', 'من فضلك'] },
    { target: 'مع السلامة', accepts: ['مع السلامة', 'سلام', 'باي'] },
    { target: 'تمام', accepts: ['تمام', 'ماشي', 'اوكي'] },
    { target: 'ماشي', accepts: ['ماشي', 'تمام', 'اوكي'] },
  ],
  msa: [
    { target: 'نعم', accepts: ['نعم'] },
    { target: 'لا', accepts: ['لا'] },
    { target: 'شكراً', accepts: ['شكرا', 'شكراً'] },
    { target: 'من فضلك', accepts: ['من فضلك', 'لو سمحت'] },
    { target: 'مع السلامة', accepts: ['مع السلامة'] },
    { target: 'حسناً', accepts: ['حسنا', 'حسناً'] },
  ],
};

function normalizeScenarioArabic(value: string): string {
  return stripTashkeel(value)
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ـ/g, '')
    .replace(/[.,!?؟،؛:"'()[\]{}…\-_/\\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isAcceptedScenarioAlternative(targetText: string, transcript: string | undefined, dialect: string): boolean {
  if (!transcript) return false;

  const normalizedTarget = normalizeScenarioArabic(targetText);
  const normalizedTranscript = normalizeScenarioArabic(transcript);
  if (!normalizedTarget || !normalizedTranscript) return false;

  const alternatives = SCENARIO_ACCEPTED_ALTERNATIVES_BY_DIALECT[dialect] ?? [];
  return alternatives.some(({ target, accepts }) => {
    const normalizedAcceptedTarget = normalizeScenarioArabic(target);
    if (normalizedAcceptedTarget !== normalizedTarget) return false;

    return accepts
      .map(normalizeScenarioArabic)
      .some(accepted => accepted === normalizedTranscript);
  });
}

export default function ScenarioScreen() {
  const router = useRouter();
  const { type: typeParam } = useLocalSearchParams();
  const typeStr = Array.isArray(typeParam) ? typeParam[0] : typeParam;
  const routeContentId = getScenarioContentId(typeStr);
  const isTaxi = typeStr === 'Taxi';
  const isHotel = typeStr === 'Hotel';

  const { content, dialect, speakInDialect } = useDialect();

  console.log('scenario type:', typeStr);

  const resolvedContent = resolveContent({
    dialect,
    contentId: routeContentId,
    contentType: 'scenario',
  });
  const DIALOGUE = resolvedContent?.dialogue ?? [];
  const sceneImage = resolvedContent?.sceneImage ?? null;

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
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [scenarioEvalResult, setScenarioEvalResult] = useState<ScenarioEvalResult | null>(null);
  const [scenarioScores, setScenarioScores] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const [isSavingCompletion, setIsSavingCompletion] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: string; icon: string; color: string } | null>(null);

  const { addXP } = useXP();
  const isComingSoon = DIALOGUE.length === 0;

  const currentTurn = isComingSoon ? { type: 'waiter' as const, arabic: '', transliteration: '', english: '' } : DIALOGUE[currentIndex];
  const currentTurnDisplayArabic = currentTurn.displayArabic ?? currentTurn.arabic;
  const currentTurnAudioText = currentTurn.audioText ?? currentTurn.displayArabic ?? currentTurn.arabic;
  const scenarioEvalTarget = currentTurn.evalTarget ?? currentTurn.audioText ?? currentTurn.displayArabic ?? currentTurn.arabic;
  const speakerRoleLabel = getSpeakerRoleLabel(typeStr);
  const completionCopy = getScenarioCompletionCopy(typeStr);
  const isUserTurn = currentTurn.type === 'user';
  const isWaiterTurn = currentTurn.type === 'waiter';
  const total = DIALOGUE.length;
  const userTurnCount = DIALOGUE.filter(t => t.type === 'user').length;
  const evaluatedScores = Object.values(scenarioScores).filter(score => Number.isFinite(score));
  const scenarioScore =
    evaluatedScores.length > 0
      ? Math.round(evaluatedScores.reduce((sum, score) => sum + score, 0) / evaluatedScores.length)
      : 0;
  const progressWidth = `${((currentIndex + 1) / total) * 100}%` as any;
  const publicScenarioId = resolvedContent?.item.contentId ?? typeStr?.toLowerCase() ?? 'cafe';
  const unitId = resolvedContent?.item.unitId ?? 'scenario';
  const scenarioKey = buildCompletionKey(dialect, unitId, publicScenarioId);
  const scenarioProgressStorageKey = `scenario_progress_local:${scenarioKey}`;

  const goHomeAfterCompletion = () => {
    const navigationAction = router.canDismiss() || router.canGoBack() ? 'back' : 'replace';
    if (__DEV__) {
      console.log('[completion navigation]', {
        completionType: 'scenario',
        unitId,
        scenarioKey,
        completionKey: scenarioKey,
        navigationAction,
      });
    }

    if (router.canDismiss()) {
      router.dismissTo('/(tabs)' as any);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recordingStartPromiseRef = useRef<Promise<boolean> | null>(null);
  const hasRestoredScenarioProgressRef = useRef(false);

  const clearSavedScenarioProgress = async () => {
    await AsyncStorage.removeItem(scenarioProgressStorageKey);
  };

  const leaveScenario = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const waitForRecordingFile = async (): Promise<{ uri: string; info: FileSystem.FileInfo } | null> => {
    const startedAt = Date.now();
    while (Date.now() - startedAt < 3000) {
      const candidateUri = audioRecorder.uri;
      if (candidateUri) {
        const info = await FileSystem.getInfoAsync(candidateUri);
        if (info.exists) return { uri: candidateUri, info };
      }

      await new Promise(resolve => setTimeout(resolve, 150));
    }

    return null;
  };

  // Reset per-turn state when index changes
  useEffect(() => {
    setRecordingState('idle');
    setShowNext(false);
    setScenarioEvalResult(null);
    handleAutoPlay();
  }, [currentIndex]);

  // Restore saved progress for this dialect + scenario.
  useEffect(() => {
    let isCancelled = false;

    const restoreScenarioProgress = async () => {
      hasRestoredScenarioProgressRef.current = false;

      if (isComingSoon || total === 0) {
        hasRestoredScenarioProgressRef.current = true;
        return;
      }

      const raw = await AsyncStorage.getItem(scenarioProgressStorageKey);
      if (!raw) {
        hasRestoredScenarioProgressRef.current = true;
        return;
      }

      try {
        const parsed = JSON.parse(raw) as { currentIndex?: number };
        const savedIndex = typeof parsed.currentIndex === 'number' ? parsed.currentIndex : 0;
        const boundedIndex = Math.max(0, Math.min(savedIndex, total - 1));
        if (!isCancelled && boundedIndex > 0) {
          setCurrentIndex(boundedIndex);
        }
      } catch (error) {
        console.warn('Scenario progress restore error:', error);
      } finally {
        hasRestoredScenarioProgressRef.current = true;
      }
    };

    restoreScenarioProgress();

    return () => {
      isCancelled = true;
    };
  }, [scenarioProgressStorageKey, total, isComingSoon]);

  // Save current turn so the user can resume later.
  useEffect(() => {
    if (!hasRestoredScenarioProgressRef.current || isComingSoon || completed) return;

    const persistScenarioProgress = async () => {
      if (currentIndex <= 0) {
        await AsyncStorage.removeItem(scenarioProgressStorageKey);
        return;
      }

      await AsyncStorage.setItem(
        scenarioProgressStorageKey,
        JSON.stringify({
          currentIndex,
          savedAt: new Date().toISOString(),
        })
      );
    };

    persistScenarioProgress().catch(error => {
      console.warn('Scenario progress save error:', error);
    });
  }, [completed, currentIndex, isComingSoon, scenarioProgressStorageKey]);

  // Finished scenarios should not restore into the middle again.
  useEffect(() => {
    if (!completed) return;
    clearSavedScenarioProgress().catch(error => {
      console.warn('Scenario progress clear error:', error);
    });
  }, [completed, scenarioProgressStorageKey]);

  useEffect(() => () => {
    stopAudio();
    restorePlaybackAudioMode('scenario-unmount').catch(() => {});
  }, []);

  useEffect(() => {
    if (!completed) return;
    feedbackLevelUp().catch(() => {});
  }, [completed]);

  // Android hardware back button confirmation
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Leave Scenario?',
        'Your progress is saved. You can continue this scenario later.',
        [
          { text: 'Keep Going', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: leaveScenario },
        ]
      );
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [router]);

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
    try {
      if (currentTurn.audio) {
        await playLocalAudio(currentTurn.audio);
      } else {
        await speakInDialect(currentTurnAudioText);
      }
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSpeak = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      if (currentTurn.audio) {
        await playLocalAudio(currentTurn.audio);
      } else {
        await speakInDialect(currentTurnAudioText);
      }
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleMicPressIn = async () => {
    setShowNext(false);
    setScenarioEvalResult(null);
    setRecordingState('recording');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    recordingStartPromiseRef.current = (async () => {
      try {
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          setRecordingState('idle');
          setMicPermissionDenied(true);
          Alert.alert(
            'Microphone Access Required',
            'To practice speaking, please enable microphone access for HeyYusuf in your device Settings.',
            [{ text: 'OK' }]
          );
          return false;
        }

        await prepareRecordingAudioMode('scenario');
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        return true;
      } catch (err) {
        console.warn('Scenario recording start error:', err);
        await restorePlaybackAudioMode('scenario-record-start-error');
        setRecordingState('idle');
        return false;
      }
    })();
  };

  const handleMicPressOut = async () => {
    if (recordingState !== 'recording') return;
    setRecordingState('playing');
    setScenarioEvalResult(null);

    let uri: string | null = null;
    let stableUri: string | null = null;

    const finishTurn = (result: ScenarioEvalResult) => {
      setScenarioEvalResult(result);
      setRecordingState('feedback');
      setShowNext(true);
      if (__DEV__) {
        console.log('[scenario recording]', {
          loadingStateCleared: true,
          evalStatus: result.status,
          score: result.score,
          index: currentIndex,
          type: currentTurn.type,
        });
      }
    };

    try {
      const didStartRecording = await recordingStartPromiseRef.current;
      recordingStartPromiseRef.current = null;
      if (!didStartRecording) {
        if (__DEV__) {
          console.log('[scenario recording]', {
            evaluationSkipped: true,
            reason: 'recording-did-not-start',
            index: currentIndex,
            type: currentTurn.type,
          });
        }
        finishTurn({
          status: 'unavailable',
          feedback: 'Could not check pronunciation. You can continue.',
        });
        return;
      }

	      await audioRecorder.stop();
	      await restorePlaybackAudioMode('scenario-stop');
	      const recordingFile = await waitForRecordingFile();
      uri = recordingFile?.uri ?? audioRecorder.uri ?? null;

      if (__DEV__) {
        console.log('[scenario eval:start]', {
          targetText: scenarioEvalTarget,
          dialect,
          context: 'scenario',
          index: currentIndex,
          type: currentTurn.type,
        });
      }

      if (recordingFile) {
        const originalUri = recordingFile.uri;
        const recordingInfo = recordingFile.info;

        if (!recordingInfo.exists) {
          if (__DEV__) {
            console.log('[scenario recording]', {
              evaluationSkipped: true,
              reason: 'recording-file-missing',
              uri,
              index: currentIndex,
              type: currentTurn.type,
            });
          }
          finishTurn({
            status: 'unavailable',
            feedback: 'Could not check pronunciation. You can continue.',
          });
          return;
        }

        const stableDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
        if (!stableDirectory) {
          if (__DEV__) {
            console.log('[scenario recording]', {
              evaluationSkipped: true,
              reason: 'missing-stable-directory',
              index: currentIndex,
              type: currentTurn.type,
            });
          }
          finishTurn({
            status: 'unavailable',
            feedback: 'Could not check pronunciation. You can continue.',
          });
          return;
        }

        stableUri = `${stableDirectory}scenario-eval-${Date.now()}-${currentIndex}.m4a`;
        await FileSystem.copyAsync({ from: originalUri, to: stableUri });
        const stableInfo = await FileSystem.getInfoAsync(stableUri);

        if (!stableInfo.exists) {
          if (__DEV__) {
            console.log('[scenario recording]', {
              evaluationSkipped: true,
              reason: 'stable-recording-file-missing',
              stableUri,
              index: currentIndex,
              type: currentTurn.type,
            });
          }
          finishTurn({
            status: 'unavailable',
            feedback: 'Could not check pronunciation. You can continue.',
          });
          return;
        }

        const evaluation = await evaluatePronunciation(stableUri, scenarioEvalTarget, dialect, 'scenario', currentTurn.english);
        const acceptedAlternative = isAcceptedScenarioAlternative(scenarioEvalTarget, evaluation.transcript, dialect);
        const adjustedScore =
          acceptedAlternative && (evaluation.score ?? 0) < 60
            ? 70
            : evaluation.score;
        const adjustedFeedback =
          acceptedAlternative && (evaluation.score ?? 0) < 60
            ? 'Good. That works too.'
            : evaluation.feedback;

        if (__DEV__) {
          console.log('[scenario eval:result]', {
            result: evaluation.result,
            score: adjustedScore,
            feedback: adjustedFeedback,
            transcript: evaluation.transcript,
            acceptedAlternative,
            targetText: scenarioEvalTarget,
            dialect,
            context: 'scenario',
            index: currentIndex,
            type: currentTurn.type,
          });
        }

        const score = adjustedScore;
        const status: ScenarioEvalStatus =
          typeof score === 'number'
            ? score >= 80
              ? 'passed'
              : score >= 60
                ? 'close'
                : 'failed'
            : evaluation.result === 'pass'
              ? 'passed'
              : evaluation.result === 'close'
                ? 'close'
                : evaluation.result === 'unavailable'
                  ? 'unavailable'
                : 'failed';

        if (typeof score === 'number') {
          setScenarioScores(prev => ({ ...prev, [currentIndex]: score }));
        }

        if (status === 'passed') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (status === 'close') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } else if (status === 'failed') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        finishTurn({
          status,
          score,
          feedback: adjustedFeedback,
          transcript: evaluation.transcript,
        });
      } else {
        if (__DEV__) {
          console.log('[scenario recording]', {
            evaluationSkipped: true,
            reason: uri ? 'recording-file-missing' : 'missing-uri',
            uri,
            index: currentIndex,
            type: currentTurn.type,
          });
        }
        finishTurn({
          status: 'unavailable',
          feedback: 'Could not check pronunciation. You can continue.',
        });
      }
	    } catch (err) {
	      console.warn('Recording evaluation error:', err);
	      if (__DEV__) {
        const error = err as any;
        console.warn('[scenario eval:error]', {
          message: error?.message,
          name: error?.name,
          stack: error?.stack,
          targetText: scenarioEvalTarget,
          dialect,
          context: 'scenario',
          index: currentIndex,
          type: currentTurn.type,
          error,
        });
      }
      finishTurn({
        status: 'unavailable',
        feedback: 'Could not check pronunciation. You can continue.',
      });
    } finally {
      await restorePlaybackAudioMode('scenario-finally');
      if (stableUri) {
        FileSystem.deleteAsync(stableUri, { idempotent: true }).catch(() => {});
      }
    }
  };

  const saveCompletion = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const xpEarned = 120;

      if (__DEV__) {
        console.log('[completion write:start]', {
          completionType: 'scenario',
          unitId,
          scenarioKey,
          completionKey: scenarioKey,
        });
      }

      if (!session) {
      const legacyCandidates = getCompletionKeyCandidates(dialect, publicScenarioId);
      const raw = await AsyncStorage.getItem('guest_progress');
      const progress = raw ? JSON.parse(raw) : {};
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
            completionType: 'scenario',
            unitId,
            scenarioKey,
            completionKey: scenarioKey,
            totalCompleted: Object.values(progress).filter(Boolean).length,
          });
        }
        await recordActivity();
        return;
      }

      const userId = session.user.id;

      await supabase.from('conversations').insert({
        user_id: userId,
        scenario: scenarioKey,
        dialect: dialect,
        level: 'beginner',
        status: 'completed',
        score: scenarioScore,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
        phrases_completed: userTurnCount,
        phrases_total: userTurnCount,
      });

      const { data: existing } = await supabase
        .from('scenario_progress')
        .select('id, attempts, best_score')
        .eq('user_id', userId)
        .in('scenario', getCompletionKeyCandidates(dialect, publicScenarioId))
        .maybeSingle();

      if (existing) {
        await supabase.from('scenario_progress').update({
          completed: true,
          best_score: Math.max(existing.best_score ?? 0, scenarioScore),
          attempts: (existing.attempts ?? 0) + 1,
        }).eq('id', existing.id);
      } else {
        await supabase.from('scenario_progress').insert({
          user_id: userId,
          scenario: scenarioKey,
          dialect: dialect,
          completed: true,
          best_score: scenarioScore,
          attempts: 1,
        });
      }

      if (!existing) {
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
          .eq('user_id', userId)
          .eq('completed', true);
        console.log('[completion write:done]', {
          completionType: 'scenario',
          unitId,
          scenarioKey,
          completionKey: scenarioKey,
          totalCompleted: count ?? undefined,
        });
      }

      // Delegate streak tracking to recordActivity()
      await recordActivity();
    } catch (err) {
      console.warn('Save completion error:', err);
    }
  };

  const handleAdvance = async () => {
    if (currentIndex === total - 1) {
      if (isSavingCompletion) return;
      setIsSavingCompletion(true);
      try {
        await saveCompletion();
        setCompleted(true);
      } finally {
        setIsSavingCompletion(false);
      }
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (isComingSoon) {
    return (
      <PremiumRouteGate contentId={routeContentId} contentType="scenario" contentLabel={getSceneBadge()}>
        <SafeAreaView style={styles.container}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔜</Text>
            <Text style={{ fontSize: 22, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>Coming Soon</Text>
            <Text style={{ fontSize: 15, color: theme.colors.textTertiary, textAlign: 'center', marginBottom: 32 }}>
              This scenario is not available for your selected dialect yet. We're working on it!
            </Text>
            <Pressable style={[styles.gotItButton, { maxWidth: 220, width: '100%' }]} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}>
              <Text style={styles.gotItText}>Go Back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </PremiumRouteGate>
    );
  }

  return (
    <PremiumRouteGate contentId={routeContentId} contentType="scenario" contentLabel={getSceneBadge()}>
      <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => {
          Alert.alert(
            'Leave Scenario?',
            'Your progress is saved. You can continue this scenario later.',
            [
              { text: 'Keep Going', style: 'cancel' },
              { text: 'Leave', style: 'destructive', onPress: leaveScenario },
            ]
          );
        }} style={styles.backButton}>
          <ArrowLeft color={theme.colors.textPrimary} size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>{getSceneBadge()}</Text>
        <View style={styles.headerRight}>
          <View style={styles.partPill}>
            <Text style={styles.partPillText}>{getPartLabel(currentIndex, typeStr)}</Text>
          </View>
        </View>
      </View>

      {/* Scene area */}
      <View style={styles.sceneArea}>
        <CafeScene
          arabic={stripTashkeel(currentTurnDisplayArabic)}
          transliteration={currentTurn.transliteration}
          isWaiterSpeaking={isWaiterTurn}
          isUserTurn={isUserTurn}
          backgroundImage={sceneImage}
        />
      </View>

      {/* Completion overlay */}
      <Modal visible={completed} transparent animationType="fade">
        <ScenarioCompletionCelebration
          headline={completionCopy.headline}
          subtitle={completionCopy.subtitle}
          phrasesSpoken={userTurnCount}
          xpEarned={120}
          score={scenarioScore}
          onBackHome={() => {
            clearSavedScenarioProgress().then(goHomeAfterCompletion).catch(goHomeAfterCompletion);
          }}
          onTryAgain={() => {
            clearSavedScenarioProgress().catch(() => {});
            setCompleted(false);
            setCurrentIndex(0);
            setRecordingState('idle');
            setShowNext(false);
            setScenarioEvalResult(null);
            setScenarioScores({});
          }}
        />
      </Modal>

      {/* Level Up Modal */}
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
                {isWaiterTurn ? `🧑‍🍳 ${speakerRoleLabel}` : '🎙 Your turn — say it'}
              </Text>
              {currentTurn.context ? (
                <Text style={styles.contextText}>{currentTurn.context}</Text>
              ) : null}
              <Text style={[styles.arabicText, { fontSize: currentTurnDisplayArabic.length <= 10 ? 32 : 22 }]}>
                {stripTashkeel(currentTurnDisplayArabic)}
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
                    ? <ActivityIndicator size="small" color={theme.colors.textSecondary} />
                    : <Volume2 color={theme.colors.textSecondary} size={20} />
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
                      ? <ActivityIndicator size="small" color={theme.colors.textSecondary} />
                      : <Volume2 color={theme.colors.textSecondary} size={20} />
                    }
                  </Pressable>

                  <Pressable style={styles.iconButton}>
                    <Lightbulb color={theme.colors.textSecondary} size={20} />
                  </Pressable>

                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Pressable
                      onPressIn={micPermissionDenied ? () => Alert.alert('Microphone Access Required', 'To practice speaking, please enable microphone access for HeyYusuf in your device Settings.', [{ text: 'OK' }]) : handleMicPressIn}
                      onPressOut={micPermissionDenied ? undefined : handleMicPressOut}
                      disabled={recordingState === 'playing'}
                      style={[
                        styles.micButton,
                        micPermissionDenied                                    && { backgroundColor: theme.colors.bgElevated, borderWidth: 1, borderColor: theme.colors.borderDefault },
                        !micPermissionDenied && recordingState === 'recording' && { backgroundColor: theme.colors.accentDanger },
                        !micPermissionDenied && recordingState === 'playing'   && { backgroundColor: theme.colors.textTertiary },
                        !micPermissionDenied && recordingState === 'feedback'  && { backgroundColor: theme.colors.accentSuccess },
                      ]}
                    >
                      {micPermissionDenied                      && <Mic color={theme.colors.textTertiary} size={26} />}
                      {!micPermissionDenied && recordingState === 'idle'      && <Mic color={theme.colors.bgBase} size={26} />}
                      {!micPermissionDenied && recordingState === 'recording' && <StopCircle color={theme.colors.textPrimary} size={26} />}
                      {!micPermissionDenied && recordingState === 'playing'   && <ActivityIndicator color={theme.colors.textPrimary} />}
                      {!micPermissionDenied && recordingState === 'feedback'  && <CheckCircle color={theme.colors.textPrimary} size={26} />}
                    </Pressable>
                  </Animated.View>

                  <Pressable style={styles.iconButton}>
                    <BookOpen color={theme.colors.textSecondary} size={20} />
                  </Pressable>

                  <Pressable
                    style={[
                      styles.iconButton,
                      !showNext && { opacity: 0.3 },
                      showNext && { borderColor: theme.colors.borderAccent },
                    ]}
                    onPress={showNext ? handleAdvance : undefined}
                    disabled={!showNext}
                  >
                    <ArrowRight color={theme.colors.textPrimary} size={20} />
                  </Pressable>
                </View>

                {recordingState === 'playing' && !scenarioEvalResult && (
                  <View style={styles.evalPanelChecking}>
                    <ActivityIndicator size="small" color={theme.colors.textSecondary} />
                    <Text style={styles.evalCheckingText}>Checking pronunciation…</Text>
                  </View>
                )}

                {scenarioEvalResult && (
                  <View style={[
                    styles.evalPanel,
                    scenarioEvalResult.status === 'passed' && styles.evalPanelPassed,
                    scenarioEvalResult.status === 'close' && styles.evalPanelClose,
                    scenarioEvalResult.status === 'failed' && styles.evalPanelFailed,
                  ]}>
                    <View>
                      <Text style={styles.evalTitle}>{getEvalTitle(scenarioEvalResult.status)}</Text>
                      <Text style={styles.evalFeedback}>{getEvalSubtitle(scenarioEvalResult)}</Text>
                      {scenarioEvalResult.transcript ? (
                        <Text style={styles.evalTranscript} numberOfLines={1}>
                          {`Heard: "${scenarioEvalResult.transcript}"`}
                        </Text>
                      ) : null}
                    </View>
                    {typeof scenarioEvalResult.score === 'number' ? (
                      <Text style={styles.evalScore}>{scenarioEvalResult.score}%</Text>
                    ) : null}
                  </View>
                )}

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
    </PremiumRouteGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
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
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: theme.fontWeight.medium,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partPill: {
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.bgSurface,
  },
  partPillText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.label,
  },
  sceneArea: {
    flex: 0.52,
  },
  bottomPanel: {
    flex: 0.48,
    backgroundColor: theme.colors.bgSurface,
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
    fontSize: theme.fontSize.label,
    color: theme.colors.textAccent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: theme.colors.bgBase,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accentPrimary,
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: theme.fontSize.label,
    color: theme.colors.textTertiary,
  },
  phraseCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: theme.radii.md,
    padding: 14,
    borderWidth: 1,
    minHeight: 90,
  },
  waiterCard: {
    backgroundColor: theme.colors.bgSurface,
    borderColor: theme.colors.borderDefault,
  },
  userCard: {
    backgroundColor: theme.colors.bgElevated,
    borderColor: theme.colors.borderAccent,
  },
  turnLabelWaiter: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  turnLabelUser: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textAccent,
    marginBottom: 6,
  },
  contextText: {
    fontSize: theme.fontSize.label,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  arabicText: {
    textAlign: 'right',
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
    marginBottom: 4,
  },
  transliterationText: {
    fontSize: 14,
    color: theme.colors.textAccent,
    marginBottom: 2,
  },
  englishText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textTertiary,
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
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: theme.fontWeight.medium,
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
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evalPanelChecking: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    backgroundColor: theme.colors.bgElevated,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  evalCheckingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.body,
  },
  evalPanel: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    backgroundColor: theme.colors.bgElevated,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  evalPanelPassed: {
    borderColor: theme.colors.accentSuccess,
    backgroundColor: 'rgba(127, 217, 154, 0.12)',
  },
  evalPanelClose: {
    borderColor: theme.colors.accentWarm,
    backgroundColor: 'rgba(245, 165, 36, 0.12)',
  },
  evalPanelFailed: {
    borderColor: theme.colors.accentDanger,
    backgroundColor: 'rgba(229, 107, 111, 0.12)',
  },
  evalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: theme.fontWeight.medium,
    marginBottom: 2,
  },
  evalFeedback: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.body,
  },
  evalTranscript: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.caption,
    fontStyle: 'italic',
    marginTop: 2,
  },
  evalScore: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: theme.fontWeight.medium,
  },
  hintsRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  nextButton: {
    height: 44,
    backgroundColor: theme.colors.accentPrimary,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: theme.colors.bgBase,
    fontSize: 16,
    fontWeight: theme.fontWeight.medium,
  },
  levelUpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  levelUpCard: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: 32, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderDefault },
  levelUpEmoji: { fontSize: 64, marginBottom: 8 },
  levelUpTitle: { fontSize: 18, color: theme.colors.textTertiary, marginBottom: 4 },
  levelUpLevel: { fontSize: 36, fontWeight: theme.fontWeight.medium, marginBottom: 8 },
  levelUpSub: { fontSize: 14, color: theme.colors.textTertiary, textAlign: 'center', marginBottom: 24 },
  levelUpButton: { backgroundColor: theme.colors.accentPrimary, width: '100%', height: 52, borderRadius: theme.radii.md, alignItems: 'center', justifyContent: 'center' },
  levelUpButtonText: { color: theme.colors.bgBase, fontSize: 16, fontWeight: theme.fontWeight.medium },
});
