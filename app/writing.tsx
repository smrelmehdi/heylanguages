import { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions,
  PanResponder, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import { speakArabic, stopAudio } from '../utils/tts';
import { supabase } from '../utils/supabase';
import { useDialect } from '../contexts/DialectContext';
import { recordActivity } from '../utils/streak';
import { stripTashkeel } from '../utils/arabic';

const { width } = Dimensions.get('window');
const CANVAS_W = width - 48;
const CANVAS_H = 200;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Point { x: number; y: number; }

interface LetterForms {
  alone: string; start: string; middle: string; end: string;
}

interface ArabicLetter {
  id: string;
  arabic: string;
  name: string;
  nameAudio: string;   // English letter name sent to TTS (e.g. "seen", "jeem")
  transliteration: string;
  soundLike: string;
  forms: LetterForms;
  word: { arabic: string; transliteration: string; meaning: string };
}

interface QuizQuestion {
  type: 'letter_to_name' | 'sound_to_letter';
  questionText: string;
  content: string;
  options: string[];
  correctAnswer: string;
}

// ─── Letter data ──────────────────────────────────────────────────────────────

const ALIF_FAMILY: ArabicLetter[] = [
  {
    id: 'alif', arabic: 'ا', name: 'Alif', nameAudio: 'alif',
    transliteration: 'a', soundLike: 'Like "a" in "father"',
    forms: { alone: 'ا', start: 'ا', middle: 'ـا', end: 'ـا' },
    word: { arabic: 'أَهْلاً', transliteration: 'ahlan', meaning: 'welcome' },
  },
];

const BA_FAMILY: ArabicLetter[] = [
  {
    id: 'ba', arabic: 'ب', name: 'Ba', nameAudio: 'ba',
    transliteration: 'b', soundLike: 'Like "b" in "boy"',
    forms: { alone: 'ب', start: 'بـ', middle: 'ـبـ', end: 'ـب' },
    word: { arabic: 'بَيْت', transliteration: 'bayt', meaning: 'house' },
  },
  {
    id: 'ta', arabic: 'ت', name: 'Ta', nameAudio: 'ta',
    transliteration: 't', soundLike: 'Like "t" in "table"',
    forms: { alone: 'ت', start: 'تـ', middle: 'ـتـ', end: 'ـت' },
    word: { arabic: 'تَمْر', transliteration: 'tamr', meaning: 'dates (fruit)' },
  },
  {
    id: 'tha', arabic: 'ث', name: 'Tha', nameAudio: 'tha',
    transliteration: 'th', soundLike: 'Like "th" in "think"',
    forms: { alone: 'ث', start: 'ثـ', middle: 'ـثـ', end: 'ـث' },
    word: { arabic: 'ثَعْلَب', transliteration: "tha'lab", meaning: 'fox' },
  },
];

const JEEM_FAMILY: ArabicLetter[] = [
  {
    id: 'jeem', arabic: 'ج', name: 'Jeem', nameAudio: 'jeem',
    transliteration: 'j', soundLike: 'Like "j" in "jump"',
    forms: { alone: 'ج', start: 'جـ', middle: 'ـجـ', end: 'ـج' },
    word: { arabic: 'جَمِيل', transliteration: 'jameel', meaning: 'beautiful' },
  },
  {
    id: 'ha_j', arabic: 'ح', name: 'Ha', nameAudio: 'ha',
    transliteration: 'h', soundLike: 'A breathy "h" from the throat',
    forms: { alone: 'ح', start: 'حـ', middle: 'ـحـ', end: 'ـح' },
    word: { arabic: 'حَياة', transliteration: 'hayah', meaning: 'life' },
  },
  {
    id: 'kha', arabic: 'خ', name: 'Kha', nameAudio: 'kha',
    transliteration: 'kh', soundLike: 'Like "ch" in Scottish "loch"',
    forms: { alone: 'خ', start: 'خـ', middle: 'ـخـ', end: 'ـخ' },
    word: { arabic: 'خَيْر', transliteration: 'khayr', meaning: 'good' },
  },
];

const DAL_FAMILY: ArabicLetter[] = [
  {
    id: 'dal', arabic: 'د', name: 'Dal', nameAudio: 'dal',
    transliteration: 'd', soundLike: 'Like "d" in "door"',
    forms: { alone: 'د', start: 'د', middle: 'ـد', end: 'ـد' },
    word: { arabic: 'دَرْهَم', transliteration: 'dirham', meaning: 'dirham' },
  },
  {
    id: 'thal', arabic: 'ذ', name: 'Thal', nameAudio: 'thal',
    transliteration: 'dh', soundLike: 'Like "th" in "this"',
    forms: { alone: 'ذ', start: 'ذ', middle: 'ـذ', end: 'ـذ' },
    word: { arabic: 'ذَهَب', transliteration: 'dhahab', meaning: 'gold' },
  },
];

const RA_FAMILY: ArabicLetter[] = [
  {
    id: 'ra', arabic: 'ر', name: 'Ra', nameAudio: 'ra',
    transliteration: 'r', soundLike: 'A rolled "r" like in Spanish',
    forms: { alone: 'ر', start: 'ر', middle: 'ـر', end: 'ـر' },
    word: { arabic: 'رَجُل', transliteration: 'rajul', meaning: 'man' },
  },
  {
    id: 'zay', arabic: 'ز', name: 'Zay', nameAudio: 'zay',
    transliteration: 'z', soundLike: 'Like "z" in "zoo"',
    forms: { alone: 'ز', start: 'ز', middle: 'ـز', end: 'ـز' },
    word: { arabic: 'زَيْت', transliteration: 'zayt', meaning: 'oil' },
  },
];

const SEEN_FAMILY: ArabicLetter[] = [
  {
    id: 'seen', arabic: 'س', name: 'Seen', nameAudio: 'seen',
    transliteration: 's', soundLike: 'Like "s" in "sun"',
    forms: { alone: 'س', start: 'سـ', middle: 'ـسـ', end: 'ـس' },
    word: { arabic: 'سَيَّارة', transliteration: 'sayyara', meaning: 'car' },
  },
  {
    id: 'sheen', arabic: 'ش', name: 'Sheen', nameAudio: 'sheen',
    transliteration: 'sh', soundLike: 'Like "sh" in "ship"',
    forms: { alone: 'ش', start: 'شـ', middle: 'ـشـ', end: 'ـش' },
    word: { arabic: 'شُكْراً', transliteration: 'shukran', meaning: 'thank you' },
  },
];

const SAD_FAMILY: ArabicLetter[] = [
  {
    id: 'sad', arabic: 'ص', name: 'Sad', nameAudio: 'sad',
    transliteration: 's', soundLike: 'An emphatic "s" said with tongue back',
    forms: { alone: 'ص', start: 'صـ', middle: 'ـصـ', end: 'ـص' },
    word: { arabic: 'صَبَاح', transliteration: 'sabah', meaning: 'morning' },
  },
  {
    id: 'dad', arabic: 'ض', name: 'Dad', nameAudio: 'dad',
    transliteration: 'd', soundLike: 'An emphatic "d" unique to Arabic',
    forms: { alone: 'ض', start: 'ضـ', middle: 'ـضـ', end: 'ـض' },
    word: { arabic: 'ضَيْف', transliteration: 'dayf', meaning: 'guest' },
  },
];

const TAA_FAMILY: ArabicLetter[] = [
  {
    id: 'taa', arabic: 'ط', name: 'Taa', nameAudio: 'ta',
    transliteration: 't', soundLike: 'An emphatic "t" said with tongue back',
    forms: { alone: 'ط', start: 'طـ', middle: 'ـطـ', end: 'ـط' },
    word: { arabic: 'طَعَام', transliteration: "ta'am", meaning: 'food' },
  },
  {
    id: 'dhaa', arabic: 'ظ', name: 'Dhaa', nameAudio: 'tha',
    transliteration: 'dh', soundLike: 'An emphatic "th" said with tongue back',
    forms: { alone: 'ظ', start: 'ظـ', middle: 'ـظـ', end: 'ـظ' },
    word: { arabic: 'ظَرِيف', transliteration: 'dhareef', meaning: 'kind / witty' },
  },
];

const AYN_FAMILY: ArabicLetter[] = [
  {
    id: 'ayn', arabic: 'ع', name: 'Ayn', nameAudio: 'ayn',
    transliteration: "'", soundLike: 'A deep throat constriction — unique to Arabic',
    forms: { alone: 'ع', start: 'عـ', middle: 'ـعـ', end: 'ـع' },
    word: { arabic: 'عَيْن', transliteration: "'ayn", meaning: 'eye' },
  },
  {
    id: 'ghayn', arabic: 'غ', name: 'Ghayn', nameAudio: 'ghayn',
    transliteration: 'gh', soundLike: 'Like a French "r" or gargling sound',
    forms: { alone: 'غ', start: 'غـ', middle: 'ـغـ', end: 'ـغ' },
    word: { arabic: 'غَالي', transliteration: 'ghali', meaning: 'expensive' },
  },
];

const FA_FAMILY: ArabicLetter[] = [
  {
    id: 'fa', arabic: 'ف', name: 'Fa', nameAudio: 'fa',
    transliteration: 'f', soundLike: 'Like "f" in "fun"',
    forms: { alone: 'ف', start: 'فـ', middle: 'ـفـ', end: 'ـف' },
    word: { arabic: 'فُنْدُق', transliteration: 'funduq', meaning: 'hotel' },
  },
  {
    id: 'qaf', arabic: 'ق', name: 'Qaf', nameAudio: 'qaf',
    transliteration: 'q', soundLike: 'A deep "k" from back of throat',
    forms: { alone: 'ق', start: 'قـ', middle: 'ـقـ', end: 'ـق' },
    word: { arabic: 'قَهْوَة', transliteration: 'qahwa', meaning: 'coffee' },
  },
];

const KAF_FAMILY: ArabicLetter[] = [
  {
    id: 'kaf', arabic: 'ك', name: 'Kaf', nameAudio: 'kaf',
    transliteration: 'k', soundLike: 'Like "k" in "kite"',
    forms: { alone: 'ك', start: 'كـ', middle: 'ـكـ', end: 'ـك' },
    word: { arabic: 'كَلِمَة', transliteration: 'kalima', meaning: 'word' },
  },
  {
    id: 'lam', arabic: 'ل', name: 'Lam', nameAudio: 'lam',
    transliteration: 'l', soundLike: 'Like "l" in "light"',
    forms: { alone: 'ل', start: 'لـ', middle: 'ـلـ', end: 'ـل' },
    word: { arabic: 'لَيْلَة', transliteration: 'layla', meaning: 'night' },
  },
];

const MEEM_FAMILY: ArabicLetter[] = [
  {
    id: 'meem', arabic: 'م', name: 'Meem', nameAudio: 'meem',
    transliteration: 'm', soundLike: 'Like "m" in "moon"',
    forms: { alone: 'م', start: 'مـ', middle: 'ـمـ', end: 'ـم' },
    word: { arabic: 'مَاء', transliteration: 'maa', meaning: 'water' },
  },
  {
    id: 'nun', arabic: 'ن', name: 'Nun', nameAudio: 'noon',
    transliteration: 'n', soundLike: 'Like "n" in "noon"',
    forms: { alone: 'ن', start: 'نـ', middle: 'ـنـ', end: 'ـن' },
    word: { arabic: 'نَعَم', transliteration: "na'am", meaning: 'yes' },
  },
];

const HAWAW_FAMILY: ArabicLetter[] = [
  {
    id: 'ha_waw', arabic: 'ه', name: 'Ha', nameAudio: 'ha',
    transliteration: 'h', soundLike: 'Like "h" in "house"',
    forms: { alone: 'ه', start: 'هـ', middle: 'ـهـ', end: 'ـه' },
    word: { arabic: 'هُنَا', transliteration: 'huna', meaning: 'here' },
  },
  {
    id: 'waw', arabic: 'و', name: 'Waw', nameAudio: 'waw',
    transliteration: 'w', soundLike: 'Like "w" in "water"',
    forms: { alone: 'و', start: 'و', middle: 'ـو', end: 'ـو' },
    word: { arabic: 'وَقْت', transliteration: 'waqt', meaning: 'time' },
  },
];

const YA_FAMILY: ArabicLetter[] = [
  {
    id: 'ya', arabic: 'ي', name: 'Ya', nameAudio: 'ya',
    transliteration: 'y', soundLike: 'Like "y" in "yes"',
    forms: { alone: 'ي', start: 'يـ', middle: 'ـيـ', end: 'ـي' },
    word: { arabic: 'يَوْم', transliteration: 'yawm', meaning: 'day' },
  },
  {
    id: 'ta_marbuta', arabic: 'ة', name: 'Ta Marbuta', nameAudio: 'ta marbuta',
    transliteration: 'a/t', soundLike: 'A soft "h" or "t" at end of words',
    forms: { alone: 'ة', start: 'ة', middle: 'ـة', end: 'ـة' },
    word: { arabic: 'مَدِينَة', transliteration: 'madina', meaning: 'city' },
  },
  {
    id: 'hamza', arabic: 'ء', name: 'Hamza', nameAudio: 'hamza',
    transliteration: "'", soundLike: 'A glottal stop — like the pause in "uh-oh"',
    forms: { alone: 'ء', start: 'ء', middle: 'ء', end: 'ء' },
    word: { arabic: 'مَاء', transliteration: 'maa', meaning: 'water' },
  },
  {
    id: 'alif_maqsura', arabic: 'ى', name: 'Alif Maqsura', nameAudio: 'alif maqsura',
    transliteration: 'a', soundLike: 'Like "a" in "father" — appears at word end',
    forms: { alone: 'ى', start: 'ى', middle: 'ـى', end: 'ـى' },
    word: { arabic: 'عَلى', transliteration: "'ala", meaning: 'on / upon' },
  },
];

// Pool of all letters used to generate wrong quiz options
const ALL_LETTERS: ArabicLetter[] = [
  ...ALIF_FAMILY, ...BA_FAMILY, ...JEEM_FAMILY, ...DAL_FAMILY,
  ...RA_FAMILY, ...SEEN_FAMILY, ...SAD_FAMILY, ...TAA_FAMILY,
  ...AYN_FAMILY, ...FA_FAMILY, ...KAF_FAMILY, ...MEEM_FAMILY,
  ...HAWAW_FAMILY, ...YA_FAMILY,
];

// ─── Quiz helpers ─────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWrong(correct: string, pool: string[], count: number): string[] {
  return shuffle(pool.filter(x => x !== correct)).slice(0, count);
}

function generateQuiz(family: ArabicLetter[]): QuizQuestion[] {
  const others = ALL_LETTERS.filter(l => !family.find(f => f.id === l.id));
  const namePool = [...family.map(l => l.name), ...others.slice(0, 8).map(l => l.name)];
  const arabicPool = [...family.map(l => l.arabic), ...others.slice(0, 8).map(l => l.arabic)];

  const qs: QuizQuestion[] = [];
  for (const letter of family) {
    qs.push({
      type: 'letter_to_name',
      questionText: 'What is this letter called?',
      content: letter.arabic,
      options: shuffle([letter.name, ...pickWrong(letter.name, namePool, 3)]),
      correctAnswer: letter.name,
    });
    qs.push({
      type: 'sound_to_letter',
      questionText: `Which letter makes the /${letter.transliteration}/ sound?`,
      content: `/${letter.transliteration}/`,
      options: shuffle([letter.arabic, ...pickWrong(letter.arabic, arabicPool, 3)]),
      correctAnswer: letter.arabic,
    });
  }

  // Fill or trim to 8
  const base = [...qs];
  while (qs.length < 8) {
    const src = base[qs.length % base.length];
    qs.push({ ...src, options: shuffle([...src.options]) });
  }
  return shuffle(qs).slice(0, 8);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WritingScreen() {
  const router    = useRouter();
  const { family } = useLocalSearchParams<{ family?: string }>();
  const { dialect } = useDialect();

  const familyStr = Array.isArray(family) ? family[0] : (family ?? 'ba');

  const CURRENT_FAMILY: ArabicLetter[] =
    familyStr === 'alif' ? ALIF_FAMILY  :
    familyStr === 'jeem' ? JEEM_FAMILY  :
    familyStr === 'dal'  ? DAL_FAMILY   :
    familyStr === 'ra'   ? RA_FAMILY    :
    familyStr === 'seen' ? SEEN_FAMILY  :
    familyStr === 'sad'  ? SAD_FAMILY   :
    familyStr === 'taa'  ? TAA_FAMILY   :
    familyStr === 'ayn'  ? AYN_FAMILY   :
    familyStr === 'fa'   ? FA_FAMILY    :
    familyStr === 'kaf'  ? KAF_FAMILY   :
    familyStr === 'meem' ? MEEM_FAMILY  :
    familyStr === 'ha'   ? HAWAW_FAMILY :
    familyStr === 'ya'   ? YA_FAMILY    :
    BA_FAMILY;

  const familyRef  = useRef(CURRENT_FAMILY);
  const dialectRef = useRef(dialect);

  const scenarioKey =
    familyStr === 'alif' ? 'alif_family' :
    familyStr === 'jeem' ? 'jeem_family' :
    familyStr === 'dal'  ? 'dal_family'  :
    familyStr === 'ra'   ? 'ra_family'   :
    familyStr === 'seen' ? 'seen_family' :
    familyStr === 'sad'  ? 'sad_family'  :
    familyStr === 'taa'  ? 'taa_family'  :
    familyStr === 'ayn'  ? 'ayn_family'  :
    familyStr === 'fa'   ? 'fa_family'   :
    familyStr === 'kaf'  ? 'kaf_family'  :
    familyStr === 'meem' ? 'meem_family' :
    familyStr === 'ha'   ? 'ha_family'   :
    familyStr === 'ya'   ? 'ya_family'   :
    'ba_family';

  const getFamilyTitle = () => {
    switch (familyStr) {
      case 'alif': return 'The ا Family';
      case 'jeem': return 'The ج Family';
      case 'dal':  return 'The د Family';
      case 'ra':   return 'The ر Family';
      case 'seen': return 'The س Family';
      case 'sad':  return 'The ص Family';
      case 'taa':  return 'The ط Family';
      case 'ayn':  return 'The ع Family';
      case 'fa':   return 'The ف Family';
      case 'kaf':  return 'The ك Family';
      case 'meem': return 'The م Family';
      case 'ha':   return 'The ه Family';
      case 'ya':   return 'The ي Family';
      default:     return 'The ب Family';
    }
  };

  const saveCompletion = async () => {
    const xpEarned = 40;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: existing } = await supabase
        .from('scenario_progress')
        .select('id, attempts')
        .eq('user_id', session.user.id)
        .eq('scenario', scenarioKey)
        .maybeSingle();
      if (existing) {
        await supabase.from('scenario_progress').update({
          completed: true, best_score: 100,
          attempts: (existing.attempts ?? 0) + 1,
        }).eq('id', existing.id);
      } else {
        await supabase.from('scenario_progress').insert({
          user_id: session.user.id, scenario: scenarioKey,
          dialect: dialectRef.current, completed: true, best_score: 100, attempts: 1,
        });
        const { data: userData } = await supabase
          .from('users').select('xp').eq('id', session.user.id).maybeSingle();
        await supabase.from('users').update({
          xp: (userData?.xp ?? 0) + xpEarned,
        }).eq('id', session.user.id);
      }
    } else {
      const raw = await AsyncStorage.getItem('guest_progress');
      const progress = raw ? JSON.parse(raw) : {};
      progress[scenarioKey] = true;
      await AsyncStorage.setItem('guest_progress', JSON.stringify(progress));
    }
    await recordActivity();
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [letterIdx,    setLetterIdx]    = useState(0);
  const [doneLetters,  setDoneLetters]  = useState<string[]>([]);
  const [phase,        setPhase]        = useState<'learn' | 'practice' | 'quiz'>('learn');
  const [drawnStrokes, setDrawnStrokes] = useState<Point[][]>([]);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIdx,       setQuizIdx]       = useState(0);
  const [quizScore,     setQuizScore]     = useState(0);
  const [selectedAns,   setSelectedAns]   = useState<string | null>(null);
  const [quizDone,      setQuizDone]      = useState(false);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const liRef         = useRef(0);
  const dlRef         = useRef<string[]>([]);
  const phaseRef      = useRef<'learn' | 'practice' | 'quiz'>('learn');
  const activeDrawRef = useRef<Point[]>([]);
  const quizScoreRef  = useRef(0);
  const quizIdxRef    = useRef(0);
  const quizQsRef     = useRef<QuizQuestion[]>([]);

  const letter = familyRef.current[letterIdx];

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => () => { stopAudio(); }, []);

  useEffect(() => {
    phaseRef.current = 'learn';
    setPhase('learn');
    setDrawnStrokes([]);
    activeDrawRef.current = [];
  }, [letterIdx]);

  // ── PanResponder (practice only) ───────────────────────────────────────────
  const drawPanResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => phaseRef.current === 'practice',
    onMoveShouldSetPanResponder:  () => phaseRef.current === 'practice',
    onPanResponderGrant: (e) => {
      const pt = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
      activeDrawRef.current = [pt];
      setDrawnStrokes(prev => [...prev, [pt]]);
    },
    onPanResponderMove: (e) => {
      const pt = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
      activeDrawRef.current.push(pt);
      const snap = [...activeDrawRef.current];
      setDrawnStrokes(prev => { const u = [...prev]; u[u.length - 1] = snap; return u; });
    },
    onPanResponderRelease: () => { activeDrawRef.current = []; },
  })).current;

  // ── Letter advance → next letter or quiz ──────────────────────────────────
  const advanceLetter = () => {
    speakArabic(letter.nameAudio);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newDL = [...dlRef.current, letter.id];
    dlRef.current = newDL;
    setDoneLetters(newDL);

    const nextLI = liRef.current + 1;
    if (nextLI < familyRef.current.length) {
      liRef.current = nextLI;
      setLetterIdx(nextLI);
    } else {
      // All letters done — start quiz
      const qs = generateQuiz(familyRef.current);
      quizQsRef.current = qs;
      quizScoreRef.current = 0;
      quizIdxRef.current = 0;
      setQuizQuestions(qs);
      setQuizIdx(0);
      setQuizScore(0);
      setSelectedAns(null);
      setQuizDone(false);
      phaseRef.current = 'quiz';
      setPhase('quiz');
    }
  };

  // ── Quiz answer ───────────────────────────────────────────────────────────
  const handleAnswer = (option: string) => {
    if (selectedAns) return;
    setSelectedAns(option);
    const q = quizQsRef.current[quizIdxRef.current];
    const correct = option === q.correctAnswer;
    if (correct) {
      quizScoreRef.current += 1;
      setQuizScore(quizScoreRef.current);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setTimeout(() => {
      const nextQIdx = quizIdxRef.current + 1;
      if (nextQIdx >= quizQsRef.current.length) {
        setQuizDone(true);
        if (quizScoreRef.current >= 6) {
          saveCompletion();
          setTimeout(() => router.replace('/(tabs)'), 3000);
        }
      } else {
        quizIdxRef.current = nextQIdx;
        setQuizIdx(nextQIdx);
        setSelectedAns(null);
      }
    }, 1200);
  };

  const restartQuiz = () => {
    const qs = generateQuiz(familyRef.current);
    quizQsRef.current = qs;
    quizScoreRef.current = 0;
    quizIdxRef.current = 0;
    setQuizQuestions(qs);
    setQuizIdx(0);
    setQuizScore(0);
    setSelectedAns(null);
    setQuizDone(false);
  };

  // ── Sound description renderer ────────────────────────────────────────────
  const renderSoundDesc = (text: string) => {
    const parts = text.split('"');
    return (
      <Text style={styles.soundDesc}>
        {parts.map((part, i) =>
          i % 2 === 1
            ? <Text key={i} style={styles.soundTeal}>"{part}"</Text>
            : <Text key={i}>{part}</Text>
        )}
      </Text>
    );
  };

  // ── PHASE 1: LEARN ────────────────────────────────────────────────────────
  const renderLearn = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.learnContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Big letter */}
      <Text style={styles.bigLetter}>{stripTashkeel(letter.arabic)}</Text>

      {/* Name + audio */}
      <View style={styles.nameRow}>
        <Text style={styles.nameTrans}>{letter.name} · /{letter.transliteration}/</Text>
        <Pressable style={styles.audioCircle} onPress={() => speakArabic(letter.nameAudio)}>
          <Ionicons name="volume-high" size={14} color="#FFF" />
        </Pressable>
      </View>

      {/* How it sounds */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>HOW IT SOUNDS</Text>
        {renderSoundDesc(letter.soundLike)}
      </View>

      {/* Letter forms */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>LETTER FORMS</Text>
        <View style={styles.formsRow}>
          {(['alone', 'start', 'middle', 'end'] as const).map(pos => (
            <View key={pos} style={styles.formCol}>
              <Text style={[styles.formGlyph, pos === 'alone' && styles.formGlyphActive]}>
                {letter.forms[pos]}
              </Text>
              <Text style={styles.formLabel}>
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Example word */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>EXAMPLE WORD</Text>
        <View style={styles.wordRow}>
          <Text style={styles.wordArabic}>{stripTashkeel(letter.word.arabic)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.wordTranslit}>{letter.word.transliteration}</Text>
            <Text style={styles.wordMeaning}>{letter.word.meaning}</Text>
          </View>
          <Pressable style={styles.audioBtn} onPress={() => speakArabic(letter.word.arabic)}>
            <Ionicons name="volume-high" size={18} color="#FFF" />
          </Pressable>
        </View>
      </View>

      {/* Practice button */}
      <Pressable
        style={styles.btnPrimary}
        onPress={() => { phaseRef.current = 'practice'; setPhase('practice'); }}
      >
        <Text style={styles.btnPrimaryText}>Practice →</Text>
      </Pressable>
    </ScrollView>
  );

  // ── PHASE 2: PRACTICE ─────────────────────────────────────────────────────
  const renderPractice = () => (
    <View style={styles.practiceWrap}>
      <Text style={styles.practiceHint}>Trace the letter with your finger</Text>

      <View style={styles.canvas} {...drawPanResponder.panHandlers}>
        <Text style={styles.ghostLetter}>{stripTashkeel(letter.arabic)}</Text>
        <Svg width={CANVAS_W} height={CANVAS_H} style={StyleSheet.absoluteFill}>
          {drawnStrokes.map((pts, i) => {
            if (pts.length < 2) return null;
            const d = pts.map((p, j) =>
              `${j === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
            ).join(' ');
            return (
              <Path key={`s${i}`} d={d} stroke="#00732F" strokeWidth={3}
                fill="none" strokeLinecap="round" strokeLinejoin="round" />
            );
          })}
        </Svg>
      </View>

      <View style={styles.practiceButtons}>
        <Pressable
          style={styles.btnSecondary}
          onPress={() => { setDrawnStrokes([]); activeDrawRef.current = []; }}
        >
          <Text style={styles.btnSecondaryText}>Clear</Text>
        </Pressable>
        <Pressable style={styles.btnPrimary} onPress={advanceLetter}>
          <Text style={styles.btnPrimaryText}>Done ✓</Text>
        </Pressable>
      </View>
    </View>
  );

  // ── PHASE 3: QUIZ ─────────────────────────────────────────────────────────
  const renderQuiz = () => {
    if (quizDone) {
      const passed = quizScore >= 6;
      return (
        <View style={styles.quizDoneWrap}>
          <LottieView
            source={require('../assets/images/animations/yusuf-celebrating.json')}
            autoPlay loop={false}
            style={{ width: 150, height: 150 }}
          />
          <Text style={styles.quizScoreText}>{quizScore}/{quizQuestions.length} correct!</Text>
          {passed ? (
            <>
              <Text style={styles.quizPassText}>Family Complete! 🎉</Text>
              <View style={styles.xpBadge}>
                <Text style={styles.xpBadgeText}>+40 XP</Text>
              </View>
              <Text style={styles.quizReturnText}>Returning to home…</Text>
            </>
          ) : (
            <>
              <Text style={styles.quizFailText}>Keep practicing!</Text>
              <Pressable style={[styles.btnPrimary, { marginTop: 24, paddingHorizontal: 32 }]} onPress={restartQuiz}>
                <Text style={styles.btnPrimaryText}>Try Again</Text>
              </Pressable>
            </>
          )}
        </View>
      );
    }

    if (quizQuestions.length === 0) return null;
    const q = quizQuestions[quizIdx];

    return (
      <View style={styles.quizWrap}>
        {/* Progress segments */}
        <View style={styles.quizProgress}>
          {quizQuestions.map((_, i) => (
            <View key={i} style={[
              styles.quizSeg,
              i < quizIdx  && styles.quizSegDone,
              i === quizIdx && styles.quizSegCur,
            ]} />
          ))}
        </View>

        <Text style={styles.quizQuestion}>{q.questionText}</Text>

        <Text style={styles.quizContent}>
          {q.type === 'letter_to_name' ? stripTashkeel(q.content) : q.content}
        </Text>

        <View style={styles.quizOptions}>
          {q.options.map((option, i) => {
            let bg = '#1A1A1A', border = '#333', textColor = '#FFF', icon = '';
            if (selectedAns) {
              if (option === q.correctAnswer) {
                bg = 'rgba(0,115,47,0.15)'; border = '#00732F'; textColor = '#00732F'; icon = '✓';
              } else if (option === selectedAns) {
                bg = 'rgba(198,40,40,0.15)'; border = '#C62828'; textColor = '#C62828'; icon = '✗';
              }
            }
            return (
              <Pressable
                key={i}
                style={[styles.quizOption, { backgroundColor: bg, borderColor: border }]}
                onPress={() => handleAnswer(option)}
                disabled={!!selectedAns}
              >
                <View style={[
                  styles.optBadge,
                  selectedAns && option === q.correctAnswer && styles.optBadgeCorrect,
                  selectedAns && option === selectedAns && option !== q.correctAnswer && styles.optBadgeWrong,
                ]}>
                  <Text style={styles.optBadgeText}>{['A','B','C','D'][i]}</Text>
                </View>
                <Text style={[styles.optText, { color: textColor }]}>
                  {q.type === 'sound_to_letter' ? stripTashkeel(option) : option}
                </Text>
                {icon ? <Text style={{ color: textColor, fontSize: 16, fontWeight: '700' }}>{icon}</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.quizCounter}>{quizIdx + 1} / {quizQuestions.length}</Text>
      </View>
    );
  };

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{getFamilyTitle()}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Letter tabs */}
      <View style={styles.familyStrip}>
        {familyRef.current.map((l, i) => {
          const done = doneLetters.includes(l.id);
          const cur  = i === letterIdx && phase !== 'quiz';
          return (
            <View key={l.id} style={[
              styles.familyCard,
              done && styles.familyCardDone,
              cur  && styles.familyCardActive,
            ]}>
              {done && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
              <Text style={[styles.familyGlyph, cur && styles.familyGlyphActive]}>
                {stripTashkeel(l.arabic)}
              </Text>
              <Text style={[
                styles.familyLabel,
                cur  && { color: '#00897B' },
                done && { color: '#00732F' },
              ]}>
                {l.name}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Phase indicator */}
      {phase !== 'quiz' && (
        <View style={styles.phaseRow}>
          <Text style={[styles.phaseStep, phase === 'learn' && styles.phaseStepActive]}>Learn</Text>
          <View style={styles.phaseLine} />
          <Text style={[styles.phaseStep, phase === 'practice' && styles.phaseStepActive]}>Practice</Text>
          <View style={styles.phaseLine} />
          <Text style={styles.phaseStep}>Quiz</Text>
        </View>
      )}

      {/* Content */}
      {phase === 'learn'    && renderLearn()}
      {phase === 'practice' && renderPractice()}
      {phase === 'quiz'     && renderQuiz()}

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#1e1e1e',
  },
  backBtn:     { width: 60 },
  backText:    { color: '#00897B', fontSize: 17, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },

  // Family strip
  familyStrip: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#1e1e1e',
  },
  familyCard: {
    flex: 1, alignItems: 'center', backgroundColor: '#111',
    borderRadius: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#1e1e1e',
  },
  familyCardActive:  { backgroundColor: '#0d1a19', borderColor: '#00897B' },
  familyCardDone:    { backgroundColor: '#0a1a10', borderColor: '#00732F' },
  checkmark: {
    position: 'absolute', top: 3, right: 3,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#00732F', alignItems: 'center', justifyContent: 'center',
  },
  checkmarkText:     { fontSize: 8, color: '#FFF', fontWeight: '800', lineHeight: 10 },
  familyGlyph:       { fontSize: 26, color: '#444' },
  familyGlyphActive: { color: '#FFF' },
  familyLabel:       { fontSize: 11, color: '#333', marginTop: 4, fontWeight: '600' },

  // Phase indicator
  phaseRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, gap: 6,
  },
  phaseStep:       { fontSize: 12, color: '#333', fontWeight: '600' },
  phaseStepActive: { color: '#00897B' },
  phaseLine:       { width: 20, height: 1, backgroundColor: '#222' },

  // Learn
  learnContent: { paddingHorizontal: 20, paddingBottom: 32 },

  bigLetter: {
    fontSize: 80, color: '#FFF', textAlign: 'center',
    paddingTop: 20, paddingBottom: 4,
  },
  nameRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginBottom: 16,
  },
  nameTrans: { fontSize: 15, color: '#AAA', fontWeight: '600' },
  audioCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#00897B', alignItems: 'center', justifyContent: 'center',
  },

  card: {
    backgroundColor: '#111', borderRadius: 12, padding: 14, marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10, color: '#555', fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
  },
  soundDesc: { fontSize: 15, color: '#CCC', lineHeight: 22 },
  soundTeal: { color: '#00897B', fontWeight: '700' },

  formsRow:        { flexDirection: 'row', justifyContent: 'space-around' },
  formCol:         { alignItems: 'center', flex: 1 },
  formGlyph:       { fontSize: 28, color: '#FFF', marginBottom: 4 },
  formGlyphActive: { color: '#00897B' },
  formLabel:       { fontSize: 10, color: '#555' },

  wordRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wordArabic:  { fontSize: 30, color: '#FFF', fontWeight: '300' },
  wordTranslit:{ fontSize: 15, fontWeight: '700', color: '#00897B' },
  wordMeaning: { fontSize: 12, color: '#555', marginTop: 2 },
  audioBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#00897B', alignItems: 'center', justifyContent: 'center',
  },

  btnPrimary: {
    height: 48, borderRadius: 24, backgroundColor: '#00897B',
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  btnPrimaryText:  { color: '#FFF', fontSize: 15, fontWeight: '700' },
  btnSecondary: {
    flex: 1, height: 48, borderRadius: 24,
    backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333',
    alignItems: 'center', justifyContent: 'center',
  },
  btnSecondaryText: { color: '#00897B', fontSize: 15, fontWeight: '600' },

  // Practice
  practiceWrap: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  practiceHint: { fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 12 },
  canvas: {
    alignSelf: 'center', width: CANVAS_W, height: CANVAS_H,
    backgroundColor: '#111', borderRadius: 16,
    borderWidth: 1, borderColor: '#1e1e1e', overflow: 'hidden',
    marginBottom: 16,
  },
  ghostLetter: {
    fontSize: 140, color: '#FFF', opacity: 0.15,
    textAlign: 'center', width: CANVAS_W, height: CANVAS_H,
    lineHeight: CANVAS_H, includeFontPadding: false,
  },
  practiceButtons: { flexDirection: 'row', gap: 12 },

  // Quiz
  quizWrap: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  quizProgress: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  quizSeg:     { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#222' },
  quizSegDone: { backgroundColor: '#00732F' },
  quizSegCur:  { backgroundColor: '#00897B' },

  quizQuestion: {
    fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 8,
  },
  quizContent: {
    fontSize: 80, color: '#FFF', textAlign: 'center',
    marginBottom: 20, lineHeight: 100, includeFontPadding: false,
  },
  quizOptions: { gap: 10 },
  quizOption: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 12, borderWidth: 1.5,
  },
  optBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#333',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  optBadgeCorrect: { backgroundColor: '#00732F' },
  optBadgeWrong:   { backgroundColor: '#C62828' },
  optBadgeText: { fontSize: 12, color: '#FFF', fontWeight: '700' },
  optText:      { flex: 1, fontSize: 15, fontWeight: '600' },
  quizCounter:  { textAlign: 'center', fontSize: 12, color: '#444', marginTop: 10 },

  // Quiz done
  quizDoneWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  quizScoreText: { fontSize: 32, fontWeight: '800', color: '#FFF', marginTop: 8 },
  quizPassText:  { fontSize: 18, color: '#00897B', fontWeight: '700', marginTop: 4 },
  quizFailText:  { fontSize: 16, color: '#888', marginTop: 4 },
  xpBadge: {
    backgroundColor: 'rgba(0,137,123,0.15)', borderWidth: 0.5,
    borderColor: '#00897B', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 8, marginVertical: 12,
  },
  xpBadgeText:    { fontSize: 18, color: '#00897B', fontWeight: '800' },
  quizReturnText: { fontSize: 13, color: '#444', marginTop: 6 },
});
