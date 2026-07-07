import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Mic, Plus, Send, Volume2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DIALECT_LABELS } from '../data/content-registry';
import { useDialect } from '../contexts/DialectContext';
import { playLocalAudio, stopAudio } from '../utils/tts';
import { supabase } from '../utils/supabase';
import { buildMemoryPrompt, fetchMemory, saveMemory, type UserMemory } from '../utils/memory';
import SignUpPrompt from '../components/SignUpPrompt';
import { theme } from '../constants/theme';

// ── Constants ─────────────────────────────────────────────────────────────────

const GUEST_MSG_LIMIT = 3;

const SCENARIO_CONFIG: Record<string, {
  label: string; emoji: string; npcRole: string; dbKey: string;
}> = {
  cafe:        { label: 'Café',        emoji: '☕', npcRole: 'waiter',          dbKey: 'cafe' },
  taxi:        { label: 'Taxi',        emoji: '🚕', npcRole: 'taxi driver',     dbKey: 'taxi' },
  hotel:       { label: 'Hotel',       emoji: '🏨', npcRole: 'receptionist',    dbKey: 'hotel' },
  restaurant:  { label: 'Restaurant',  emoji: '🍽️', npcRole: 'waiter',          dbKey: 'restaurant' },
  supermarket: { label: 'Supermarket', emoji: '🛒', npcRole: 'cashier',         dbKey: 'supermarket' },
  pharmacy:    { label: 'Pharmacy',    emoji: '💊', npcRole: 'pharmacist',      dbKey: 'pharmacy' },
  barbershop:  { label: 'Barbershop',  emoji: '💈', npcRole: 'barber',          dbKey: 'barbershop' },
  airport:     { label: 'Airport',     emoji: '✈️', npcRole: 'check-in agent',  dbKey: 'airport' },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  // assistant fields
  arabic?: string;
  transliteration?: string;
  english?: string;
  note?: string;
  // user fields
  text?: string;
  isVoice?: boolean;
  voiceUri?: string;
}

type ClaudeHistoryItem = { role: 'user' | 'assistant'; content: string };

// ── Response parser ───────────────────────────────────────────────────────────

function parseChatResponse(raw: string): {
  arabic: string; transliteration: string; english: string;
  note: string; suggestions: string[];
} {
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return {
      arabic:          parsed.arabic          ?? '',
      transliteration: parsed.transliteration ?? '',
      english:         parsed.english         ?? '',
      note:            parsed.note            ?? '',
      suggestions:     Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [],
    };
  } catch {
    // Fallback for non-JSON: parse [suggestions]…[/suggestions] + text structure
    const sugMatch = raw.match(/\[suggestions\](.*?)\[\/suggestions\]/s);
    const suggestions = sugMatch
      ? sugMatch[1].split('|').map(s => s.trim()).filter(Boolean)
      : [];
    const body = raw.replace(/\[suggestions\].*?\[\/suggestions\]/s, '').trim();
    const lines = body.split('\n').map(l => l.trim()).filter(Boolean);
    let arabic = '', transliteration = '', english = '', note = '';
    for (const line of lines) {
      if (!arabic && /[\u0600-\u06FF]/.test(line)) { arabic = line; }
      else if (!transliteration && /^\(.*\)$/.test(line)) { transliteration = line.slice(1, -1); }
      else if (arabic && !english && !/[\u0600-\u06FF]/.test(line)) { english = line; }
      else if (arabic && english && !note) { note = line; }
    }
    return { arabic, transliteration, english, note, suggestions };
  }
}

// ── Name validation ───────────────────────────────────────────────────────────
// Catches keyboard-mash names ("Hhh", "asdf", "k") so Yusuf can tease back
// instead of silently accepting them. Arabic-script input skips the no-vowel
// check since Latin vowels don't apply.
function isGibberishName(raw: string): boolean {
  const s = raw.trim().toLowerCase();
  if (s.length < 2) return true;
  if (/^(.)\1+$/.test(s)) return true; // entire string is one char repeated
  const hasLatin = /[a-z]/.test(s);
  if (hasLatin && s.length < 6 && !/[aeiou]/.test(s)) return true;
  return false;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatConversationScreen() {
  const router = useRouter();
  const { mode, type } = useLocalSearchParams<{ mode: string; type?: string }>();
  const { dialect, speakInDialect } = useDialect();

  const isScenario = mode === 'scenario';
  const scenarioConfig = type ? SCENARIO_CONFIG[type] : null;

  // ── State ──────────────────────────────────────────────────────────────────
  const [messages,      setMessages]      = useState<ChatMessage[]>([]);
  const [suggestions,   setSuggestions]   = useState<string[]>([]);
  const [inputText,     setInputText]     = useState('');
  const [isLoading,       setIsLoading]       = useState(false);
  const [isInitializing,  setIsInitializing]  = useState(true);
  const [isRecording,     setIsRecording]     = useState(false);

  const [userName,      setUserName]      = useState('');
  const [userLevel,     setUserLevel]     = useState('beginner');
  const [isGuest,       setIsGuest]       = useState(false);
  const [guestMsgCount, setGuestMsgCount] = useState(0);
  const [showSignUp,    setShowSignUp]    = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // First-session hardcoded flow: 0 = waiting for user's name, null = handed
  // off to Claude (or returning user / scenario mode — never set).
  const [firstSessionStep, setFirstSessionStep] = useState<0 | null>(null);

  // Refs
  const scrollRef      = useRef<ScrollView>(null);
  const historyRef     = useRef<ClaudeHistoryItem[]>([]);
  const userLevelRef   = useRef('beginner');
  const userNameRef    = useRef('');
  const userIdRef      = useRef<string | null>(null);
  const memoryRef      = useRef<UserMemory | null>(null);
  const messagesRef    = useRef<ChatMessage[]>([]);

  const audioRecorder  = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const screenTitle = isScenario && scenarioConfig
    ? `${scenarioConfig.emoji} ${scenarioConfig.label} Practice`
    : 'Free Chat';

  // ── System prompt builder ──────────────────────────────────────────────────
  const buildSystemPrompt = (name: string, level: string) => {
    const dialectName = DIALECT_LABELS[dialect] ?? 'Gulf Arabic';
    const location = dialect === 'egyptian' ? 'Cairo' : 'Dubai';
    const gulfRules = dialect === 'gulf'
      ? '\n- Gulf dialect: أبي not أريد, وش not ماذا, زين not جيد, إيه not نعم'
      : '';

    if (isScenario && scenarioConfig) {
      return `You are Yusuf, roleplaying as the ${scenarioConfig.npcRole} in a ${scenarioConfig.label} in ${location}. The user practices ${dialectName} Arabic (level: ${level}).

Stay in character as the ${scenarioConfig.npcRole}. Guide through a realistic interaction: greet the user → ask what they need → respond to requests → handle payment/farewell.

ALWAYS reply with ONLY this JSON, no extra text:
{
  "arabic": "your line in ${dialectName}",
  "transliteration": "pronunciation in English letters",
  "english": "English translation",
  "note": "one short hint for the user (or empty string)",
  "suggestions": ["Arabic phrase user might say 1", "phrase 2", "phrase 3"]
}

Rules:
- Max 6 Arabic words per response${gulfRules}
- suggestions = things the USER would say next, not you
- If user writes English, put hint in note field
- Correct mistakes by using the right form naturally
- No markdown or text outside the JSON
- When triggered with BEGIN_SCENARIO, open the scene naturally as ${scenarioConfig.npcRole}`;
    }

    const memoryPrefix = buildMemoryPrompt(memoryRef.current);
    const basePrompt = `You are Yusuf, a Gulf Arab friend helping the user with ${dialectName} — not a tutor, not a teacher. You tease warmly, you're direct, you don't sugarcoat. Think less Duolingo, more a friend who happens to speak Arabic.
Address the user as: ${name || 'friend'}

ALWAYS reply with ONLY this JSON, no extra text:
{
  "arabic": "the Arabic phrase in ${dialectName}",
  "transliteration": "pronunciation in English letters",
  "english": "English meaning",
  "note": "short tease, correction, or tip — max 2 sentences (or empty string)",
  "suggestions": ["short Arabic phrase user might say 1", "phrase 2", "phrase 3"]
}

Rules:
- Keep Arabic SHORT — max 5 words for beginners${gulfRules}
- Keep the WHOLE response tight — 2-3 sentences max across all fields. No essays.
- suggestions = 3 things the user might want to say next
- If user writes English, respond in Arabic but explain in note
- One idea at a time — never overwhelm
- Reject gibberish: if user input is random letters, keyboard mashing, or a single character (e.g. "Hhh", "asdf", "k"), don't accept it. Tease them and ask again. Example: user sends "Hhh" as their name → respond "هههه — هذا اسمك الحقيقي؟ 😄 قولي اسمك مرة ثانية"
- Praise ONLY when earned — when the user writes correct Arabic unprompted, on their own. NEVER auto-compliment every message. No reflexive "great!" / "well done!" / "excellent!" / "perfect!".
- User level: ${level}
- No markdown or text outside the JSON
- When triggered with BEGIN_FREE_CHAT, introduce yourself warmly. If the User context above mentions a previous session, reference it naturally in your opener (e.g., "last time we worked on X — continue or try something else?")`;

    return memoryPrefix ? `${memoryPrefix}\n\n${basePrompt}` : basePrompt;
  };

  // ── Initialization ─────────────────────────────────────────────────────────
  useEffect(() => { return () => { stopAudio(); }; }, []);

  useEffect(() => {
    (async () => {
      await requestRecordingPermissionsAsync();
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

      // Load user data
      const name = (await AsyncStorage.getItem('wizard_name')) ?? '';
      setUserName(name);
      userNameRef.current = name;

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        userIdRef.current = session.user.id;
        memoryRef.current = await fetchMemory(session.user.id);

        const { data: user } = await supabase
          .from('users')
          .select('level')
          .eq('id', session.user.id)
          .maybeSingle();
        const level = user?.level ?? 'beginner';
        setUserLevel(level);
        userLevelRef.current = level;

        // Load or create conversation in Supabase
        const scenarioKey = isScenario && scenarioConfig ? scenarioConfig.dbKey : 'free';
        let convId: string | null = null;

        const { data: existing } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('scenario', scenarioKey)
          .eq('status', 'active')
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing) {
          convId = existing.id;
          // Load saved messages
          const { data: dbMsgs } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', existing.id)
            .order('created_at', { ascending: true });

          if (dbMsgs && dbMsgs.length > 0) {
            const loaded: ChatMessage[] = dbMsgs.map(m => ({
              id: m.id,
              role: m.role as 'assistant' | 'user',
              ...(m.role === 'assistant'
                ? { arabic: m.arabic_text ?? '', transliteration: m.transliteration ?? '', english: m.translation ?? '' }
                : { text: m.arabic_text ?? '' }
              ),
            }));
            setMessages(loaded);
            // Rebuild history for Claude
            historyRef.current = dbMsgs.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.role === 'assistant'
                ? JSON.stringify({ arabic: m.arabic_text, transliteration: m.transliteration, english: m.translation })
                : (m.arabic_text ?? ''),
            }));
            setConversationId(convId);
            setIsInitializing(false);
            return; // Skip initial greeting — history already loaded
          }
        }

        if (!convId) {
          const { data: newConv } = await supabase
            .from('conversations')
            .insert({
              user_id: session.user.id,
              scenario: scenarioKey,
              dialect,
              level: userLevelRef.current,
              status: 'active',
              started_at: new Date().toISOString(),
            })
            .select('id')
            .single();
          convId = newConv?.id ?? null;
        }
        setConversationId(convId);
      } else {
        setIsGuest(true);
        const stored = await AsyncStorage.getItem('guest_chat_count');
        setGuestMsgCount(stored ? parseInt(stored, 10) : 0);
      }

      // First-ever free-chat session (no memory record yet, signed-in or guest):
      // hardcode the opener instead of calling Claude. Returning users + all
      // scenario sessions go through the normal Claude path with memory injected.
      const isFreshFirstFreeChat = !isScenario && memoryRef.current === null;
      if (isFreshFirstFreeChat) {
        showFirstSessionOpener();
        setIsInitializing(false);
        return;
      }

      await fetchInitialMessage(name, userLevelRef.current);
    })();
  }, []);

  // Keep messagesRef in sync so the unmount cleanup sees the final transcript.
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Save memory in the background when the screen unmounts (fire-and-forget,
  // silent fail). Only for signed-in users with a meaningful transcript.
  useEffect(() => {
    return () => {
      const userId = userIdRef.current;
      const msgs = messagesRef.current;
      if (!userId || msgs.length < 3) return;
      saveMemory(userId, msgs, memoryRef.current).catch(() => {});
    };
  }, []);

  // ── First-session hardcoded opener ─────────────────────────────────────────
  const HARDCODED_MSG_1 = {
    arabic: 'مرحبا! أنا يوسف — شو اسمك؟',
    transliteration: 'marhaba! ana Yusuf — shu ismak?',
    english: "Hi! I'm Yusuf — what's your name?",
    note: 'Tell him your name 👋',
  };
  const HARDCODED_MSG_2 = {
    arabic: 'ليش تتعلم عربي؟',
    transliteration: "leesh tit'allam 'arabi?",
    english: 'Why are you learning Arabic?',
    note: '',
  };
  const HARDCODED_MSG_GIBBERISH = {
    arabic: 'هههه — هذا اسمك الحقيقي؟ 😄 قولي اسمك مرة ثانية',
    transliteration: 'hahaha — hatha ismak il-haqiqi? gul-li ismak marra thaniya',
    english: "haha — that's your real name? Tell me your name again",
    note: '',
  };

  const showFirstSessionOpener = () => {
    const msg: ChatMessage = { id: 'init-1', role: 'assistant', ...HARDCODED_MSG_1 };
    historyRef.current = [
      { role: 'user', content: 'BEGIN_FREE_CHAT' },
      { role: 'assistant', content: JSON.stringify({ ...HARDCODED_MSG_1, suggestions: [] }) },
    ];
    setMessages([msg]);
    setFirstSessionStep(0);
    setTimeout(() => speakInDialect(HARDCODED_MSG_1.arabic), 700);
  };

  const handleNameStep = async (name: string) => {
    // Reject keyboard-mash names — tease and let them try again. Step stays at 0.
    if (isGibberishName(name)) {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: name };
      const aiMsg: ChatMessage = { id: `gib-${Date.now()}`, role: 'assistant', ...HARDCODED_MSG_GIBBERISH };

      historyRef.current.push({ role: 'user', content: name });
      historyRef.current.push({
        role: 'assistant',
        content: JSON.stringify({ ...HARDCODED_MSG_GIBBERISH, suggestions: [] }),
      });

      setMessages(prev => [...prev, userMsg, aiMsg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      setTimeout(() => speakInDialect(HARDCODED_MSG_GIBBERISH.arabic), 700);

      if (conversationId) {
        supabase.from('messages').insert([
          { conversation_id: conversationId, role: 'user',      arabic_text: name },
          { conversation_id: conversationId, role: 'assistant', arabic_text: HARDCODED_MSG_GIBBERISH.arabic, transliteration: HARDCODED_MSG_GIBBERISH.transliteration, translation: HARDCODED_MSG_GIBBERISH.english },
        ]).then(() => {}).catch(() => {});
      }
      return;
    }

    setUserName(name);
    userNameRef.current = name;
    AsyncStorage.setItem('wizard_name', name).catch(() => {});

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: name };
    const aiMsg: ChatMessage = { id: 'init-2', role: 'assistant', ...HARDCODED_MSG_2 };

    historyRef.current.push({ role: 'user', content: name });
    historyRef.current.push({
      role: 'assistant',
      content: JSON.stringify({ ...HARDCODED_MSG_2, suggestions: [] }),
    });

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setFirstSessionStep(null);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    setTimeout(() => speakInDialect(HARDCODED_MSG_2.arabic), 700);

    if (conversationId) {
      supabase.from('messages').insert([
        { conversation_id: conversationId, role: 'user',      arabic_text: name },
        { conversation_id: conversationId, role: 'assistant', arabic_text: HARDCODED_MSG_2.arabic, transliteration: HARDCODED_MSG_2.transliteration, translation: HARDCODED_MSG_2.english },
      ]).then(() => {}).catch(() => {});
    }
  };

  // ── Fetch initial Yusuf message ────────────────────────────────────────────
  const fetchInitialMessage = async (name: string, level: string) => {
    setIsLoading(true);
    const trigger = isScenario ? 'BEGIN_SCENARIO' : 'BEGIN_FREE_CHAT';
    try {
      const res = await callClaude(
        buildSystemPrompt(name, level),
        [{ role: 'user', content: trigger }]
      );
      const parsed = parseChatResponse(res);
      const msg: ChatMessage = {
        id: 'init-' + Date.now(),
        role: 'assistant',
        arabic: parsed.arabic,
        transliteration: parsed.transliteration,
        english: parsed.english,
        note: parsed.note,
      };
      historyRef.current = [
        { role: 'user',      content: trigger },
        { role: 'assistant', content: JSON.stringify(parsed) },
      ];
      setMessages([msg]);
      if (parsed.suggestions.length > 0) setSuggestions(parsed.suggestions);
      setTimeout(() => speakInDialect(parsed.arabic), 700);
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError';
      const fallback: ChatMessage = isTimeout
        ? {
            id: 'init-timeout',
            role: 'assistant',
            arabic: 'يوسف ما رد... حاول مرة ثانية',
            english: "Yusuf didn't respond... try again",
          }
        : {
            id: 'init-fallback',
            role: 'assistant',
            arabic: 'أهلاً! أنا يوسف 👋',
            transliteration: 'ahlan! ana Yusuf',
            english: "Hello! I'm Yusuf",
            note: isScenario
              ? `You're practising in a ${scenarioConfig?.label ?? 'scenario'}. Try speaking Arabic!`
              : 'Your personal Arabic tutor. What would you like to learn today?',
          };
      setMessages([fallback]);
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  };

  // ── Claude API helper ──────────────────────────────────────────────────────
  const callClaude = async (
    systemPrompt: string,
    messages: ClaudeHistoryItem[]
  ): Promise<string> => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        const error = new Error('timeout');
        error.name = 'AbortError';
        reject(error);
      }, 10000);
    });

    try {
      const { data, error } = await Promise.race([
        supabase.functions.invoke<{ text?: string; error?: unknown }>('chat-completion', {
          body: {
            system: systemPrompt,
            messages,
            maxTokens: 200,
          },
        }),
        timeoutPromise,
      ]);

      if (error) throw error;
      if (data?.error) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'chat-completion returned an error',
        );
      }

      return typeof data?.text === 'string' ? data.text.trim() : '';
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (isGuest && guestMsgCount >= GUEST_MSG_LIMIT) {
      setShowSignUp(true);
      return;
    }

    // First-session step 0: user just gave their name — handle locally, no Claude.
    if (firstSessionStep === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setInputText('');
      await handleNameStep(text.trim());
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSuggestions([]);
    setIsLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

    // Add to history
    historyRef.current.push({ role: 'user', content: text.trim() });

    try {
      const raw = await callClaude(
        buildSystemPrompt(userNameRef.current, userLevelRef.current),
        historyRef.current
      );
      const parsed = parseChatResponse(raw);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        arabic:          parsed.arabic,
        transliteration: parsed.transliteration,
        english:         parsed.english,
        note:            parsed.note,
      };

      historyRef.current.push({ role: 'assistant', content: JSON.stringify(parsed) });
      setMessages(prev => [...prev, aiMsg]);
      if (parsed.suggestions.length > 0) setSuggestions(parsed.suggestions);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

      if (isGuest) {
        const n = guestMsgCount + 1;
        setGuestMsgCount(n);
        await AsyncStorage.setItem('guest_chat_count', String(n));
      }

      if (parsed.arabic) setTimeout(() => speakInDialect(parsed.arabic), 700);

      // Persist to Supabase (fire and forget)
      if (conversationId) {
        supabase.from('messages').insert([
          { conversation_id: conversationId, role: 'user',      arabic_text: text.trim() },
          { conversation_id: conversationId, role: 'assistant', arabic_text: parsed.arabic, transliteration: parsed.transliteration, translation: parsed.english },
        ]).then(() => {}).catch(() => {});
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const isTimeout = err?.name === 'AbortError';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        arabic: isTimeout ? 'يوسف ما رد... حاول مرة ثانية' : 'عذراً',
        transliteration: isTimeout ? '' : "'uthuran",
        english: isTimeout ? "Yusuf didn't respond... try again" : 'Sorry',
        note: isTimeout ? undefined : 'Something went wrong. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Voice recording ────────────────────────────────────────────────────────
  const handleMicPressIn = async () => {
    setIsRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try { audioRecorder.record(); } catch (e) { console.warn('Record start error:', e); }
  };

  const handleMicPressOut = async () => {
    setIsRecording(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await audioRecorder.stop();
      await new Promise(r => setTimeout(r, 200));
      const uri = audioRecorder.uri;
      if (!uri) return;
      // TODO: send to Whisper API for transcription
      const voiceMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        isVoice: true,
        voiceUri: uri,
        text: 'Voice message',
      };
      setMessages(prev => [...prev, voiceMsg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    } catch (e) { console.warn('Record stop error:', e); }
  };

  const playVoice = async (uri: string) => {
    try {
      playLocalAudio({ uri });
    } catch (e) { console.warn('Playback error:', e); }
  };

  // ── New conversation ───────────────────────────────────────────────────────
  const handleNewConversation = () => {
    Alert.alert(
      'New Conversation',
      'Start fresh? Your current chat will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Fresh',
          onPress: async () => {
            if (conversationId) {
              supabase.from('conversations')
                .update({ status: 'completed', completed_at: new Date().toISOString() })
                .eq('id', conversationId)
                .then(() => {}).catch(() => {});
            }
            setConversationId(null);
            setMessages([]);
            setSuggestions([]);
            historyRef.current = [];

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const scenarioKey = isScenario && scenarioConfig ? scenarioConfig.dbKey : 'free';
              const { data: newConv } = await supabase
                .from('conversations')
                .insert({ user_id: session.user.id, scenario: scenarioKey, dialect, level: userLevelRef.current, status: 'active', started_at: new Date().toISOString() })
                .select('id').single();
              setConversationId(newConv?.id ?? null);
            }

            await fetchInitialMessage(userNameRef.current, userLevelRef.current);
          },
        },
      ]
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => {
              // Free chat enters via a tab redirect — going `back` would land on
              // (tabs)/chat which redirects right back here. Always pop home in
              // free mode. Scenario mode came from a scenario-intro screen, so
              // a normal back works.
              if (mode === 'free' || !router.canGoBack()) {
                router.replace('/(tabs)' as any);
              } else {
                router.back();
              }
            }}
          >
            <ArrowLeft color={theme.colors.textPrimary} size={18} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{screenTitle}</Text>
          <Pressable style={styles.iconBtn} onPress={handleNewConversation}>
            <Plus color={theme.colors.accentPrimary} size={18} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

          {/* ── Messages ── */}
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={msg.role === 'user' ? styles.rowUser : styles.rowAssistant}
              >
                {msg.role === 'assistant' && (
                  <Pressable
                    style={styles.yusufBubble}
                    onPress={() => msg.arabic && speakInDialect(msg.arabic)}
                  >
                    <View style={styles.tapHint}>
                      <Volume2 color={theme.colors.textTertiary} size={10} />
                      <Text style={styles.tapHintText}>Tap to hear</Text>
                    </View>
                    {msg.arabic ? (
                      <Text style={styles.arabicText}>{msg.arabic}</Text>
                    ) : null}
                    {msg.transliteration ? (
                      <Text style={styles.translitText}>({msg.transliteration})</Text>
                    ) : null}
                    {msg.english ? (
                      <Text style={styles.englishText}>{msg.english}</Text>
                    ) : null}
                    {msg.note ? (
                      <View style={styles.noteSep}>
                        <Text style={styles.noteText}>💡 {msg.note}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                )}

                {msg.role === 'user' && !msg.isVoice && (
                  <View style={styles.userBubble}>
                    <Text style={styles.userText}>{msg.text}</Text>
                  </View>
                )}

                {msg.role === 'user' && msg.isVoice && (
                  <Pressable
                    style={styles.voiceBubble}
                    onPress={() => msg.voiceUri && playVoice(msg.voiceUri)}
                  >
                    <Volume2 color={theme.colors.textPrimary} size={16} />
                    <Text style={styles.voiceText}>Voice message · tap to play</Text>
                  </Pressable>
                )}
              </View>
            ))}

            {isLoading && (
              <View style={styles.rowAssistant}>
                <View style={[styles.yusufBubble, { opacity: 0.6 }]}>
                  <Text style={styles.loadingText}>Yusuf is typing…</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* ── Suggestion chips ── */}
          {suggestions.length > 0 && (
            <View style={styles.chipsBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                {suggestions.map((s, i) => (
                  <Pressable key={i} style={styles.chip} onPress={() => sendMessage(s)}>
                    <Text style={styles.chipText}>{s}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Guest counter */}
          {isGuest && guestMsgCount > 0 && (
            <Text style={styles.guestCounter}>
              {Math.max(0, GUEST_MSG_LIMIT - guestMsgCount)} free message
              {GUEST_MSG_LIMIT - guestMsgCount !== 1 ? 's' : ''} remaining
            </Text>
          )}

          {/* ── Input bar ── */}
          <View style={styles.inputBar}>
            <Pressable
              style={[styles.micBtn, isRecording && styles.micBtnActive]}
              onPressIn={handleMicPressIn}
              onPressOut={handleMicPressOut}
            >
              <Mic color={isRecording ? theme.colors.textPrimary : theme.colors.textTertiary} size={18} />
            </Pressable>

            <View style={styles.textWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="Type in Arabic or English…"
                placeholderTextColor={theme.colors.textTertiary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
            </View>

            <Pressable
              style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnOff]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
            >
              <Send color={inputText.trim() && !isLoading ? theme.colors.bgBase : theme.colors.textTertiary} size={18} />
            </Pressable>
          </View>

        </KeyboardAvoidingView>

        <SignUpPrompt
          visible={showSignUp}
          onClose={() => setShowSignUp(false)}
          reason="unlock unlimited chat"
        />
      </SafeAreaView>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },
  flex:      { flex: 1 },

  // header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: theme.colors.borderDefault,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.bgSurface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.colors.borderDefault,
  },
  headerTitle:  { flex: 1, fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary },

  // message list
  messageList:        { flex: 1 },
  messageListContent: { padding: 16, paddingBottom: 8, gap: 12 },

  rowAssistant: { flexDirection: 'row', justifyContent: 'flex-start' },
  rowUser:      { flexDirection: 'row', justifyContent: 'flex-end' },

  // Yusuf bubble
  yusufBubble: {
    maxWidth: '84%',
    backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, borderBottomLeftRadius: 4,
    padding: 14, gap: 3,
    borderWidth: 1, borderColor: theme.colors.borderDefault,
  },
  tapHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  tapHintText: { fontSize: theme.fontSize.caption, color: theme.colors.textTertiary },
  arabicText:    { fontSize: 20, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'right', lineHeight: 30 },
  translitText:  { fontSize: theme.fontSize.body, color: theme.colors.textSecondary, fontStyle: 'italic', lineHeight: 20 },
  englishText:   { fontSize: theme.fontSize.body, color: theme.colors.textTertiary, lineHeight: 20 },
  noteSep:       { borderTopWidth: 1, borderTopColor: theme.colors.borderDefault, paddingTop: 8, marginTop: 4 },
  noteText:      { fontSize: theme.fontSize.caption, color: theme.colors.textSecondary, lineHeight: 18 },
  loadingText:   { fontSize: theme.fontSize.body, color: theme.colors.textTertiary, fontStyle: 'italic' },

  // user bubble
  userBubble: {
    maxWidth: '84%',
    backgroundColor: theme.colors.bgElevated, borderRadius: theme.radii.lg, borderBottomRightRadius: 4,
    padding: 14,
    borderWidth: 1, borderColor: theme.colors.borderAccent,
  },
  userText: { fontSize: 15, color: theme.colors.textPrimary, fontWeight: theme.fontWeight.regular, lineHeight: 22 },

  // voice bubble
  voiceBubble: {
    maxWidth: '84%',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.colors.bgElevated, borderRadius: theme.radii.lg, borderBottomRightRadius: 4,
    padding: 14,
    borderWidth: 1, borderColor: theme.colors.borderAccent,
  },
  voiceText: { fontSize: theme.fontSize.body, color: theme.colors.textPrimary, fontWeight: theme.fontWeight.regular },

  // suggestion chips
  chipsBar:    { borderTopWidth: 1, borderTopColor: theme.colors.borderDefault, paddingVertical: 10 },
  chipsScroll: { paddingHorizontal: 14, gap: 8 },
  chip: {
    backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.pill, paddingHorizontal: 14, paddingVertical: 8,
  },
  chipText: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: theme.fontWeight.regular },

  // guest counter
  guestCounter: {
    textAlign: 'center', fontSize: theme.fontSize.label, color: theme.colors.textTertiary,
    paddingBottom: 4, backgroundColor: theme.colors.bgBase,
  },

  // input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    backgroundColor: theme.colors.bgSurface,
    borderTopWidth: 1, borderTopColor: theme.colors.borderDefault,
  },
  micBtn:      { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.borderDefault },
  micBtnActive:{ backgroundColor: theme.colors.accentDanger, borderColor: theme.colors.accentDanger },
  textWrap:    { flex: 1, backgroundColor: theme.colors.bgElevated, borderRadius: theme.radii.pill, borderWidth: 1, borderColor: theme.colors.borderDefault, paddingHorizontal: 14, paddingVertical: 10, minHeight: 42, justifyContent: 'center' },
  textInput:   { color: theme.colors.textPrimary, fontSize: 15, maxHeight: 90, lineHeight: 22 },
  sendBtn:     { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.accentPrimary, alignItems: 'center', justifyContent: 'center' },
  sendBtnOff:  { backgroundColor: theme.colors.bgElevated, borderWidth: 1, borderColor: theme.colors.borderDefault },
});
