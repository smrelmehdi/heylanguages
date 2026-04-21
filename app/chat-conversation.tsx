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

import LottieView from 'lottie-react-native';
import { DIALECT_LABELS } from '../data/content-registry';
import { useDialect } from '../contexts/DialectContext';
import { playLocalAudio, stopAudio } from '../utils/tts';
import { supabase } from '../utils/supabase';
import SignUpPrompt from '../components/SignUpPrompt';

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

  // Refs
  const scrollRef      = useRef<ScrollView>(null);
  const historyRef     = useRef<ClaudeHistoryItem[]>([]);
  const userLevelRef   = useRef('beginner');
  const userNameRef    = useRef('');

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

    return `You are Yusuf, a warm and funny ${dialectName} tutor — the user's Arabic-speaking friend, not a formal teacher.
Address the user as: ${name || 'friend'}

ALWAYS reply with ONLY this JSON, no extra text:
{
  "arabic": "the Arabic phrase in ${dialectName}",
  "transliteration": "pronunciation in English letters",
  "english": "English meaning",
  "note": "short tip, correction, or encouragement — max 2 sentences (or empty string)",
  "suggestions": ["short Arabic phrase user might say 1", "phrase 2", "phrase 3"]
}

Rules:
- Keep Arabic SHORT — max 5 words for beginners${gulfRules}
- suggestions = 3 things the user might want to say next
- If user writes English, respond in Arabic but explain in note
- One idea at a time — never overwhelm
- User level: ${level}
- Personality: warm, encouraging, light humour, celebrate small wins
- No markdown or text outside the JSON
- When triggered with BEGIN_FREE_CHAT, introduce yourself warmly`;
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

      // New conversation — get opening message from Claude
      await fetchInitialMessage(name, userLevelRef.current);
    })();
  }, []);

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
    } catch {
      const fallback: ChatMessage = {
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        system: systemPrompt,
        messages,
      }),
    });
    if (!response.ok) throw new Error(`Claude error ${response.status}`);
    const data = await response.json();
    return data.content[0].text.trim();
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (isGuest && guestMsgCount >= GUEST_MSG_LIMIT) {
      setShowSignUp(true);
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
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        arabic: 'عذراً',
        transliteration: "'uthuran",
        english: 'Sorry',
        note: 'Something went wrong. Please try again.',
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
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/chat' as any)}
          >
            <ArrowLeft color="#fff" size={18} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{screenTitle}</Text>
          <LottieView
            key={isInitializing ? 'thinking' : isLoading ? 'talking' : 'idle'}
            source={
              isInitializing
                ? require('../assets/images/animations/yusuf-thinking.json')
                : isLoading
                ? require('../assets/images/animations/yusuf-talking.json')
                : require('../assets/images/animations/yusuf-waving.json')
            }
            autoPlay={isInitializing || isLoading}
            loop={isInitializing || isLoading}
            style={styles.headerLottie}
          />
          <Pressable style={styles.iconBtn} onPress={handleNewConversation}>
            <Plus color="#00897B" size={18} />
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
                      <Volume2 color="#444" size={10} />
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
                    <Volume2 color="#fff" size={16} />
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
              <Mic color={isRecording ? '#fff' : '#666'} size={18} />
            </Pressable>

            <View style={styles.textWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="Type in Arabic or English…"
                placeholderTextColor="#3a3a3a"
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
              <Send color={inputText.trim() && !isLoading ? '#fff' : '#333'} size={18} />
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
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  flex:      { flex: 1 },

  // header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a',
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: '#2a2a2a',
  },
  headerTitle:  { flex: 1, fontSize: 15, fontWeight: '700', color: '#fff' },
  headerLottie: { width: 36, height: 36 },

  // message list
  messageList:        { flex: 1 },
  messageListContent: { padding: 16, paddingBottom: 8, gap: 12 },

  rowAssistant: { flexDirection: 'row', justifyContent: 'flex-start' },
  rowUser:      { flexDirection: 'row', justifyContent: 'flex-end' },

  // Yusuf bubble
  yusufBubble: {
    maxWidth: '84%',
    backgroundColor: '#1A1A1A', borderRadius: 20, borderBottomLeftRadius: 4,
    padding: 14, gap: 3,
    borderWidth: 0.5, borderColor: '#2a2a2a',
  },
  tapHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  tapHintText: { fontSize: 10, color: '#3a3a3a' },
  arabicText:    { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'right', lineHeight: 30 },
  translitText:  { fontSize: 13, color: '#888', fontStyle: 'italic', lineHeight: 20 },
  englishText:   { fontSize: 13, color: '#555', lineHeight: 20 },
  noteSep:       { borderTopWidth: 0.5, borderTopColor: '#2a2a2a', paddingTop: 8, marginTop: 4 },
  noteText:      { fontSize: 12, color: '#666', lineHeight: 18 },
  loadingText:   { fontSize: 13, color: '#444', fontStyle: 'italic' },

  // user bubble
  userBubble: {
    maxWidth: '84%',
    backgroundColor: '#00897B', borderRadius: 20, borderBottomRightRadius: 4,
    padding: 14,
  },
  userText: { fontSize: 15, color: '#fff', fontWeight: '500', lineHeight: 22 },

  // voice bubble
  voiceBubble: {
    maxWidth: '84%',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#00897B', borderRadius: 20, borderBottomRightRadius: 4,
    padding: 14,
  },
  voiceText: { fontSize: 13, color: '#fff', fontWeight: '500' },

  // suggestion chips
  chipsBar:    { borderTopWidth: 0.5, borderTopColor: '#1a1a1a', paddingVertical: 10 },
  chipsScroll: { paddingHorizontal: 14, gap: 8 },
  chip: {
    backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  chipText: { color: '#fff', fontSize: 14, fontWeight: '500' },

  // guest counter
  guestCounter: {
    textAlign: 'center', fontSize: 11, color: '#383838',
    paddingBottom: 4, backgroundColor: '#0A0A0A',
  },

  // input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    backgroundColor: '#111',
    borderTopWidth: 0.5, borderTopColor: '#1a1a1a',
  },
  micBtn:      { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  micBtnActive:{ backgroundColor: '#00897B', borderColor: '#00897B' },
  textWrap:    { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 20, borderWidth: 0.5, borderColor: '#2a2a2a', paddingHorizontal: 14, paddingVertical: 10, minHeight: 42, justifyContent: 'center' },
  textInput:   { color: '#fff', fontSize: 15, maxHeight: 90, lineHeight: 22 },
  sendBtn:     { width: 42, height: 42, borderRadius: 21, backgroundColor: '#00897B', alignItems: 'center', justifyContent: 'center' },
  sendBtnOff:  { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a' },
});
