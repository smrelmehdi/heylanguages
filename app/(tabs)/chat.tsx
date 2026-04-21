import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, KeyboardAvoidingView, Modal, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Volume2, X } from 'lucide-react-native';

import { useDialect } from '../../contexts/DialectContext';
import { stripTashkeel } from '../../utils/arabic';
import { speakArabic } from '../../utils/tts';
import {
  buildSystemPrompt, callClaude, parseClaudeResponse, WORD_DICT,
} from '../../utils/chat-helpers';
import {
  SCENARIO_CONFIG, SCENARIO_KEYS, SCENARIO_OPENERS, FREE_CHAT_OPENER,
} from '../../data/chat-scenarios';
import type { ScenarioKey, SuggestedReply } from '../../data/chat-scenarios';

// ── Types ─────────────────────────────────────────────────────────────────────

type ChatDialect = 'gulf' | 'egyptian' | 'msa';

interface YusufMsg {
  id: string; type: 'yusuf';
  arabic: string; arabicTashkeel: string;
  transliteration: string; english: string;
}
interface UserMsg {
  id: string; type: 'user';
  text: string;
  displayArabic?: string; displayTranslit?: string;
}
interface CorrectionMsg {
  id: string; type: 'correction';
  wrong: string; correct: string; explanation: string;
}
type ChatMsg = YusufMsg | UserMsg | CorrectionMsg;

type ClaudeHistoryItem = { role: 'user' | 'assistant'; content: string };

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    dots.forEach((dot, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(dot, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.2, duration: 280, useNativeDriver: true }),
          Animated.delay(540 - i * 180),
        ])
      ).start();
    });
  }, []);
  return (
    <View style={styles.msgRow}>
      <View style={styles.avatarSmall}><Text style={styles.avatarChar}>ي</Text></View>
      <View style={styles.typingBubble}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
        ))}
      </View>
    </View>
  );
}

// ── Word tooltip modal ────────────────────────────────────────────────────────

interface TooltipState { word: string; transliteration: string; english: string; loading: boolean }

function WordTooltipModal({ tooltip, voiceId, onClose }: {
  tooltip: TooltipState; voiceId: string; onClose: () => void;
}) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.tooltipOverlay} onPress={onClose}>
        <View style={styles.tooltipCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.tooltipArabic}>{tooltip.word}</Text>
            <TouchableOpacity
              style={styles.miniAudioBtn}
              onPress={() => speakArabic(tooltip.word, voiceId)}
            >
              <Text style={{ fontSize: 14 }}>🔊</Text>
            </TouchableOpacity>
          </View>
          {tooltip.loading ? (
            <Text style={styles.tooltipSub}>Translating...</Text>
          ) : (
            <Text style={styles.tooltipSub}>{tooltip.transliteration} — {tooltip.english}</Text>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

// ── Tappable Arabic text ──────────────────────────────────────────────────────

function TappableArabicText({ text, fontSize, onWordTap }: {
  text: string; fontSize: number; onWordTap: (w: string) => void;
}) {
  const words = stripTashkeel(text).split(/\s+/).filter(Boolean);
  return (
    <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
      {words.map((word, i) => (
        <TouchableOpacity
          key={`${word}-${i}`}
          onPress={() => onWordTap(word)}
          activeOpacity={0.55}
          style={{ paddingHorizontal: 1, paddingVertical: 2 }}
        >
          <Text style={{ color: '#fff', fontSize, writingDirection: 'rtl' }}>{word}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Yusuf bubble ─────────────────────────────────────────────────────────────

function YusufBubble({ msg, voiceId, onWordTap }: {
  msg: YusufMsg; voiceId: string;
  onWordTap: (w: string) => void;
}) {
  return (
    <View style={styles.msgRow}>
      <View style={styles.avatarSmall}><Text style={styles.avatarChar}>ي</Text></View>
      <View style={styles.yusufBubble}>
        <TappableArabicText
          text={msg.arabic}
          fontSize={msg.arabic.length < 20 ? 20 : 17}
          onWordTap={onWordTap}
        />
        {msg.transliteration ? (
          <Text style={styles.translit}>{msg.transliteration}</Text>
        ) : null}
        {msg.english ? (
          <Text style={styles.englishSub}>{msg.english}</Text>
        ) : null}
        <TouchableOpacity
          style={styles.speakerBtn}
          onPress={() => speakArabic(msg.arabicTashkeel || msg.arabic, voiceId)}
        >
          <Volume2 color="#00897B" size={13} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── User bubble ───────────────────────────────────────────────────────────────

function UserBubble({ msg }: { msg: UserMsg }) {
  const arabic = msg.displayArabic ?? msg.text;
  const isArabic = /[\u0600-\u06FF]/.test(arabic);
  return (
    <View style={styles.userMsgRow}>
      <View style={styles.userBubble}>
        {isArabic ? (
          <Text style={[styles.userArabic, { fontSize: arabic.length < 20 ? 20 : 17 }]}>{arabic}</Text>
        ) : (
          <Text style={styles.userLatin}>{arabic}</Text>
        )}
        {msg.displayTranslit ? <Text style={styles.userTranslit}>{msg.displayTranslit}</Text> : null}
      </View>
    </View>
  );
}

// ── Correction card ───────────────────────────────────────────────────────────

function CorrectionCard({ msg }: { msg: CorrectionMsg }) {
  return (
    <View style={styles.correctionCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <View style={styles.errorCircle}><Text style={styles.errorCircleText}>!</Text></View>
        <Text style={styles.correctionLabel}>Small correction</Text>
      </View>
      <Text style={styles.correctionWrong}>
        You said: <Text style={styles.strikethrough}>{msg.wrong}</Text>
      </Text>
      <Text style={styles.correctionRight}>
        Better: <Text style={styles.correctText}>{msg.correct}</Text>
        {msg.explanation ? <Text style={styles.correctionExplain}> ({msg.explanation})</Text> : null}
      </Text>
    </View>
  );
}

// ── Completion card ───────────────────────────────────────────────────────────

function CompletionCard({ learnedWords, onChatAgain, onBack }: {
  learnedWords: string[]; onChatAgain: () => void; onBack: () => void;
}) {
  return (
    <View style={styles.completionCard}>
      <Text style={{ fontSize: 40, marginBottom: 8 }}>🎉</Text>
      <Text style={styles.completionTitle}>Conversation complete!</Text>
      <View style={styles.xpBadge}><Text style={styles.xpText}>+50 XP</Text></View>
      {learnedWords.length > 0 && (
        <View style={styles.learnedSection}>
          <Text style={styles.learnedLabel}>Words from today</Text>
          <View style={styles.learnedPills}>
            {learnedWords.slice(0, 5).map((w, i) => (
              <View key={i} style={styles.learnedPill}>
                <Text style={styles.learnedPillText}>{w}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      <View style={{ width: '100%', gap: 10, marginTop: 20 }}>
        <Pressable style={styles.chatAgainBtn} onPress={onChatAgain}>
          <Text style={styles.chatAgainText}>Chat again</Text>
        </Pressable>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Back to topics</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChatTab() {
  const { content } = useDialect();
  const voiceId = content.voiceId;

  // ── Navigation state ────────────────────────────────────────────────────────
  const [screen,   setScreen]   = useState<'home' | 'conversation'>('home');
  const [mode,     setMode]     = useState<'guided' | 'free'>('guided');
  const [scenario, setScenario] = useState<ScenarioKey | null>(null);

  // ── Settings ────────────────────────────────────────────────────────────────
  const [chatDialect,  setChatDialect]  = useState<ChatDialect>('gulf');

  // ── Conversation state ──────────────────────────────────────────────────────
  const [messages,          setMessages]          = useState<ChatMsg[]>([]);
  const [claudeHistory,     setClaudeHistory]     = useState<ClaudeHistoryItem[]>([]);
  const [inputText,         setInputText]         = useState('');
  const [isLoading,         setIsLoading]         = useState(false);
  const [currentSuggestions,setCurrentSuggestions]= useState<SuggestedReply[]>([]);
  const [wordBank,          setWordBank]          = useState<string[]>([]);
  const [isComplete,        setIsComplete]        = useState(false);
  const [learnedWords,      setLearnedWords]      = useState<string[]>([]);
  const [apiError,          setApiError]          = useState<string | null>(null);
  const [retryFn,           setRetryFn]           = useState<(() => void) | null>(null);

  // ── Tap-to-translate ────────────────────────────────────────────────────────
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const scrollRef          = useRef<ScrollView>(null);
  const exchangeCountRef   = useRef(0);
  const currentModeRef     = useRef<'guided' | 'free'>('guided');
  const currentScenarioRef = useRef<ScenarioKey | null>(null);
  const chatDialectRef     = useRef<ChatDialect>('gulf');

  // Keep refs in sync
  useEffect(() => { chatDialectRef.current = chatDialect; }, [chatDialect]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  // ── Start conversation ──────────────────────────────────────────────────────
  const startConversation = useCallback((newMode: 'guided' | 'free', newScenario: ScenarioKey | null) => {
    currentModeRef.current     = newMode;
    currentScenarioRef.current = newScenario;
    exchangeCountRef.current   = 0;

    setMode(newMode);
    setScenario(newScenario);
    setMessages([]);
    setClaudeHistory([]);
    setInputText('');
    setCurrentSuggestions([]);
    setWordBank([]);
    setIsComplete(false);
    setLearnedWords([]);
    setApiError(null);
    setRetryFn(null);

    const opener = newMode === 'free' ? FREE_CHAT_OPENER : SCENARIO_OPENERS[newScenario!];
    const openerMsg: YusufMsg = {
      id: 'opener',
      type: 'yusuf',
      arabic: opener.arabic,
      arabicTashkeel: opener.arabic,
      transliteration: opener.transliteration,
      english: opener.english,
    };
    setMessages([openerMsg]);
    setCurrentSuggestions(opener.suggestedReplies);
    setWordBank(opener.wordBank ?? []);
    setScreen('conversation');

    // Auto-play opener
    setTimeout(() => speakArabic(opener.arabic, voiceId), 600);
  }, [voiceId]);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (
    userText: string,
    displayArabic?: string,
    displayTranslit?: string
  ) => {
    if (!userText.trim() || isLoading) return;
    setApiError(null);
    setRetryFn(null);

    const userMsg: UserMsg = {
      id: `u-${Date.now()}`,
      type: 'user',
      text: userText,
      displayArabic,
      displayTranslit,
    };

    const newHistory: ClaudeHistoryItem[] = [
      ...claudeHistory,
      { role: 'user', content: userText },
    ];

    setMessages(prev => [...prev, userMsg]);
    setClaudeHistory(newHistory);
    setInputText('');
    setCurrentSuggestions([]);
    setIsLoading(true);

    const sysPrompt = buildSystemPrompt(
      currentModeRef.current,
      currentScenarioRef.current ? SCENARIO_CONFIG[currentScenarioRef.current].label : null,
      'beginner',
      chatDialectRef.current
    );

    const doCall = async (history: ClaudeHistoryItem[], attempt = 1) => {
      try {
        const raw = await callClaude(history, sysPrompt);
        let parsed = parseClaudeResponse(raw);

        // Auto-retry once on parse failure
        if (!parsed && attempt === 1) {
          const raw2 = await callClaude(history, sysPrompt);
          parsed = parseClaudeResponse(raw2);
        }

        if (!parsed) {
          setApiError('Could not understand response. Tap retry.');
          setRetryFn(() => () => doCall(history, attempt + 1));
          setIsLoading(false);
          return;
        }

        const newMsgs: ChatMsg[] = [];
        if (parsed.correction) {
          newMsgs.push({
            id: `c-${Date.now()}`,
            type: 'correction',
            wrong: parsed.correction.wrong,
            correct: parsed.correction.correct,
            explanation: parsed.correction.explanation,
          });
        }
        newMsgs.push({
          id: `y-${Date.now()}`,
          type: 'yusuf',
          arabic: parsed.arabic,
          arabicTashkeel: parsed.arabicTashkeel,
          transliteration: parsed.transliteration,
          english: parsed.english,
        });

        setMessages(prev => [...prev, ...newMsgs]);
        setClaudeHistory([...history, { role: 'assistant', content: JSON.stringify(parsed) }]);
        setCurrentSuggestions(parsed.suggestedReplies ?? []);

        if (parsed.wordBank?.length) {
          setWordBank(parsed.wordBank);
          setLearnedWords(prev => {
            const s = new Set(prev);
            parsed!.wordBank.forEach(w => s.add(w));
            return Array.from(s).slice(0, 10);
          });
        }

        const newCount = exchangeCountRef.current + 1;
        exchangeCountRef.current = newCount;

        const guided = currentModeRef.current === 'guided';
        if (guided && (parsed.conversationEnd || newCount >= 8)) {
          setIsComplete(true);
          setCurrentSuggestions([]);
        }

        // Auto-play response
        setTimeout(() => speakArabic(parsed!.arabicTashkeel || parsed!.arabic, voiceId), 300);
      } catch (err: any) {
        const msg = err.message === 'timeout'
          ? 'Yusuf is thinking... try again?'
          : 'Connection issue — check your internet';
        setApiError(msg);
        setRetryFn(() => () => doCall(history, attempt + 1));
      } finally {
        setIsLoading(false);
      }
    };

    doCall(newHistory);
  }, [claudeHistory, isLoading, voiceId]);

  // ── Word tap ────────────────────────────────────────────────────────────────
  const handleWordTap = useCallback((word: string) => {
    const key = word.trim();
    const local = WORD_DICT.get(key);
    setTooltip(local
      ? { word, transliteration: local.transliteration, english: local.english, loading: false }
      : { word, transliteration: '?', english: '?', loading: false }
    );
  }, []);

  // ── Dialect select ──────────────────────────────────────────────────────────
  const handleDialectSelect = (d: string) => {
    if (d === 'gulf') { setChatDialect('gulf'); return; }
    Alert.alert('Coming Soon', 'Egyptian and MSA dialects will be available soon. Gulf Arabic is ready now!');
  };

  // ── HOME SCREEN ─────────────────────────────────────────────────────────────
  const renderHome = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.homeScroll}
    >
      {/* Header */}
      <View style={styles.homeHeader}>
        <View style={styles.yusufCircle}>
          <Text style={styles.yusufCircleChar}>ي</Text>
        </View>
        <Text style={styles.homeTitle}>Chat with Yusuf</Text>
        <Text style={styles.homeSubtitle}>Practice Arabic in real conversations</Text>
      </View>

      {/* Dialect toggle */}
      <View style={styles.dialectRow}>
        {(['gulf', 'egyptian', 'msa'] as const).map(d => (
          <Pressable
            key={d}
            style={[styles.dialectPill, chatDialect === d && styles.dialectPillActive]}
            onPress={() => handleDialectSelect(d)}
          >
            <Text style={[styles.dialectPillText, chatDialect === d && styles.dialectPillTextActive]}>
              {d === 'gulf' ? 'Gulf' : d === 'egyptian' ? 'Egyptian' : 'MSA'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Situation label */}
      <Text style={styles.sectionLabel}>Pick a situation</Text>

      {/* Scenario grid */}
      <View style={styles.scenarioGrid}>
        {SCENARIO_KEYS.map(key => (
          <Pressable
            key={key}
            style={({ pressed }) => [styles.scenarioCard, pressed && { opacity: 0.75 }]}
            onPress={() => startConversation('guided', key)}
          >
            <Text style={styles.scenarioEmoji}>{SCENARIO_CONFIG[key].emoji}</Text>
            <Text style={styles.scenarioCardLabel}>{SCENARIO_CONFIG[key].label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Free chat button */}
      <Pressable
        style={({ pressed }) => [styles.freeChatBtn, pressed && { opacity: 0.8 }]}
        onPress={() => startConversation('free', null)}
      >
        <Text style={styles.freeChatBtnText}>💬  Free chat — talk about anything</Text>
      </Pressable>

    </ScrollView>
  );

  // ── CONVERSATION SCREEN ──────────────────────────────────────────────────────
  const renderConversation = () => {
    const scenarioTitle = mode === 'free'
      ? 'Free Chat'
      : scenario ? SCENARIO_CONFIG[scenario].label : 'Conversation';
    const scenarioEmoji = mode === 'free' ? '💬' : scenario ? SCENARIO_CONFIG[scenario].emoji : '💬';

    return (
      <View style={{ flex: 1 }}>
        {/* Top bar */}
        <View style={styles.convTopBar}>
          <Pressable onPress={() => setScreen('home')} style={styles.convBackBtn} hitSlop={12}>
            <ArrowLeft color="#fff" size={22} />
          </Pressable>
          <View style={styles.convTitleArea}>
            <View style={styles.avatarSmall}><Text style={styles.avatarChar}>ي</Text></View>
            <View>
              <Text style={styles.convTitle}>{scenarioEmoji} {scenarioTitle}</Text>
              <Text style={styles.convWith}>with Yusuf</Text>
            </View>
          </View>
          <Pressable onPress={() => setScreen('home')} style={styles.convBackBtn} hitSlop={12}>
            <X color="#555" size={20} />
          </Pressable>
        </View>

        {/* Body */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(msg => {
              if (msg.type === 'yusuf')      return <YusufBubble key={msg.id} msg={msg} voiceId={voiceId} onWordTap={handleWordTap} />;
              if (msg.type === 'user')       return <UserBubble key={msg.id} msg={msg} />;
              if (msg.type === 'correction') return <CorrectionCard key={msg.id} msg={msg} />;
              return null;
            })}
            {isLoading && <TypingIndicator />}
            {isComplete && (
              <CompletionCard
                learnedWords={learnedWords}
                onChatAgain={() => startConversation(mode, scenario)}
                onBack={() => setScreen('home')}
              />
            )}
          </ScrollView>

          {/* API error */}
          {apiError && (
            <View style={styles.errorBar}>
              <Text style={styles.errorBarText}>{apiError}</Text>
              {retryFn && (
                <Pressable onPress={() => { retryFn(); setApiError(null); }} style={styles.retryBtn}>
                  <Text style={styles.retryBtnText}>Retry</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Suggested replies */}
          {!isLoading && !isComplete && currentSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsLabel}>Choose your reply:</Text>
              {currentSuggestions.map((s, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [styles.suggestionCard, pressed && { opacity: 0.75 }]}
                  onPress={() => handleSend(s.arabic, s.arabic, s.transliteration)}
                >
                  <Text style={styles.suggestionArabic}>{s.arabic}</Text>
                  <Text style={styles.suggestionEnglish}>{s.english}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Word bank */}
          {!isComplete && !isLoading && wordBank.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.wordBankContent}
              style={styles.wordBankRow}
            >
              {wordBank.map((w, i) => (
                <Pressable
                  key={i}
                  style={styles.wordBankPill}
                  onPress={() => setInputText(t => t ? `${t} ${w}` : w)}
                >
                  <Text style={styles.wordBankPillText}>{w}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Input row */}
          {!isComplete && (
            <View style={styles.inputRow}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Or type your own..."
                placeholderTextColor="#444"
                style={styles.textInput}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={() => handleSend(inputText)}
              />
              <Pressable
                style={[styles.sendBtn, (!inputText.trim() || isLoading) && { opacity: 0.4 }]}
                onPress={() => handleSend(inputText)}
                disabled={!inputText.trim() || isLoading}
              >
                <Send color="#fff" size={16} />
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {screen === 'home' ? renderHome() : renderConversation()}
      {tooltip && (
        <WordTooltipModal tooltip={tooltip} voiceId={voiceId} onClose={() => setTooltip(null)} />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },

  // ── Home ──────────────────────────────────────────────────────────────────
  homeScroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 60 },

  homeHeader: { alignItems: 'center', marginBottom: 24, gap: 6 },
  yusufCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#111', borderWidth: 2, borderColor: '#00897B',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  yusufCircleChar: { color: '#00897B', fontSize: 24, fontWeight: '700' },
  homeTitle:    { color: '#fff', fontSize: 16, fontWeight: '500' },
  homeSubtitle: { color: '#666', fontSize: 12 },

  dialectRow: { flexDirection: 'row', gap: 8, marginBottom: 24, justifyContent: 'center' },
  dialectPill: {
    flex: 1, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333',
    alignItems: 'center',
  },
  dialectPillActive: { backgroundColor: '#0d3b34', borderColor: '#00897B' },
  dialectPillText: { color: '#666', fontSize: 13, fontWeight: '600' },
  dialectPillTextActive: { color: '#00897B' },

  sectionLabel: {
    color: '#888', fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },

  scenarioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  scenarioCard: {
    width: '47%', backgroundColor: '#111', borderWidth: 1, borderColor: '#222',
    borderRadius: 12, padding: 14, alignItems: 'center', gap: 6,
  },
  scenarioEmoji: { fontSize: 26 },
  scenarioCardLabel: { color: '#ddd', fontSize: 12, fontWeight: '600', textAlign: 'center' },

  freeChatBtn: {
    backgroundColor: '#0d3b34', borderWidth: 1, borderColor: '#00897B',
    borderRadius: 24, paddingVertical: 14, alignItems: 'center', marginBottom: 24,
  },
  freeChatBtnText: { color: '#00897B', fontSize: 15, fontWeight: '600' },

  difficultyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  difficultyRowLabel: { color: '#666', fontSize: 12 },
  difficultyStops: { flex: 1, flexDirection: 'row', gap: 6 },
  difficultyStop: {
    flex: 1, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333',
    alignItems: 'center',
  },
  difficultyStopActive: { backgroundColor: '#0d3b34', borderColor: '#00897B' },
  difficultyStopText: { color: '#555', fontSize: 11, fontWeight: '600' },
  difficultyStopTextActive: { color: '#00897B' },

  // ── Conversation ──────────────────────────────────────────────────────────
  convTopBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
    backgroundColor: '#0A0A0A',
  },
  convBackBtn: { padding: 4 },
  convTitleArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 8 },
  convTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  convWith:  { color: '#555', fontSize: 11 },

  messagesContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  // Bubbles
  msgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  avatarSmall: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#0d3b34', borderWidth: 1.5, borderColor: '#00897B',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
  },
  avatarChar: { color: '#00897B', fontSize: 12, fontWeight: '700' },

  yusufBubble: {
    maxWidth: '80%', backgroundColor: '#111', borderRadius: 4,
    borderTopLeftRadius: 0, borderTopRightRadius: 12, borderBottomRightRadius: 12, borderBottomLeftRadius: 12,
    padding: 12, gap: 4,
  },
  translit:   { color: '#00897B', fontSize: 12, marginTop: 2 },
  englishSub: { color: '#666',    fontSize: 12 },
  speakerBtn: { alignSelf: 'flex-end', marginTop: 4, padding: 2 },

  userMsgRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
  userBubble: {
    maxWidth: '80%', backgroundColor: '#0d3b34',
    borderWidth: 1, borderColor: 'rgba(0,137,123,0.25)',
    borderRadius: 12, borderTopRightRadius: 0,
    padding: 12, gap: 3,
  },
  userArabic:  { color: '#fff', textAlign: 'right', writingDirection: 'rtl' },
  userLatin:   { color: '#fff', fontSize: 14 },
  userTranslit:{ color: '#00897B', fontSize: 11 },

  // Correction
  correctionCard: {
    marginLeft: 36, marginBottom: 10, marginRight: 8,
    backgroundColor: '#1e1010', borderWidth: 1, borderColor: '#5a2a2a',
    borderRadius: 10, padding: 10,
  },
  errorCircle: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#5a2a2a', alignItems: 'center', justifyContent: 'center',
  },
  errorCircleText: { color: '#E24B4A', fontSize: 11, fontWeight: '700' },
  correctionLabel:  { color: '#E24B4A', fontSize: 11, fontWeight: '600' },
  correctionWrong:  { color: '#888', fontSize: 12 },
  strikethrough:    { color: '#E24B4A', textDecorationLine: 'line-through' },
  correctionRight:  { color: '#ccc', fontSize: 12 },
  correctText:      { color: '#00897B', fontWeight: '600' },
  correctionExplain:{ color: '#666' },

  // Typing indicator
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#111', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
  },
  typingDot: {
    width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#00897B',
  },

  // Suggestions
  suggestionsContainer: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4, gap: 6 },
  suggestionsLabel: {
    color: '#888', fontSize: 10, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2,
  },
  suggestionCard: {
    backgroundColor: '#111', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 10, padding: 10,
  },
  suggestionArabic:  { color: '#fff', fontSize: 14, textAlign: 'right', writingDirection: 'rtl' },
  suggestionEnglish: { color: '#666', fontSize: 11, marginTop: 2 },

  // Word bank
  wordBankRow: { maxHeight: 40, borderTopWidth: 1, borderTopColor: '#181818' },
  wordBankContent: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, gap: 8, alignItems: 'center' },
  wordBankPill: {
    backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 4,
  },
  wordBankPillText: { color: '#ccc', fontSize: 12 },

  // Input row
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#181818',
    backgroundColor: '#0A0A0A',
  },
  textInput: {
    flex: 1, backgroundColor: '#111', borderWidth: 1, borderColor: '#333',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    color: '#fff', fontSize: 15,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#00897B', alignItems: 'center', justifyContent: 'center',
  },

  // Error bar
  errorBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1e1010', borderTopWidth: 1, borderTopColor: '#5a2a2a',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  errorBarText: { color: '#E24B4A', fontSize: 13, flex: 1 },
  retryBtn: {
    backgroundColor: '#5a2a2a', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 4, marginLeft: 10,
  },
  retryBtnText: { color: '#E24B4A', fontSize: 12, fontWeight: '600' },

  // Completion card
  completionCard: {
    margin: 16, backgroundColor: '#111', borderWidth: 1, borderColor: '#222',
    borderRadius: 20, padding: 24, alignItems: 'center',
  },
  completionTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 10 },
  xpBadge: {
    backgroundColor: '#0d3b34', borderWidth: 1, borderColor: '#00897B',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16,
  },
  xpText: { color: '#00897B', fontSize: 14, fontWeight: '700' },
  learnedSection: { width: '100%', gap: 8 },
  learnedLabel: { color: '#888', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  learnedPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  learnedPill: {
    backgroundColor: '#1A1A1A', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#333',
  },
  learnedPillText: { color: '#ccc', fontSize: 12 },
  chatAgainBtn: {
    backgroundColor: '#00897B', borderRadius: 24,
    paddingVertical: 13, alignItems: 'center',
  },
  chatAgainText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  backBtn: { paddingVertical: 10, alignItems: 'center' },
  backBtnText: { color: '#555', fontSize: 14 },

  // Word tooltip modal
  tooltipOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  tooltipCard: {
    backgroundColor: '#111', borderWidth: 1.5, borderColor: '#00897B',
    borderRadius: 14, padding: 16, minWidth: 200, gap: 6,
  },
  tooltipArabic: { color: '#00897B', fontSize: 22, fontWeight: '700' },
  tooltipSub:    { color: '#ccc', fontSize: 14 },
  miniAudioBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#0d3b34', alignItems: 'center', justifyContent: 'center',
  },
});
