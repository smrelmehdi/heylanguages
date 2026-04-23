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
import { theme } from '../../constants/theme';

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
          <Text style={{ color: theme.colors.textPrimary, fontSize, writingDirection: 'rtl' }}>{word}</Text>
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
          <Volume2 color={theme.colors.accentPrimary} size={13} />
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
            <ArrowLeft color={theme.colors.textPrimary} size={22} />
          </Pressable>
          <View style={styles.convTitleArea}>
            <View style={styles.avatarSmall}><Text style={styles.avatarChar}>ي</Text></View>
            <View>
              <Text style={styles.convTitle}>{scenarioEmoji} {scenarioTitle}</Text>
              <Text style={styles.convWith}>with Yusuf</Text>
            </View>
          </View>
          <Pressable onPress={() => setScreen('home')} style={styles.convBackBtn} hitSlop={12}>
            <X color={theme.colors.textTertiary} size={20} />
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
                placeholderTextColor={theme.colors.textTertiary}
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
                <Send color={theme.colors.bgBase} size={16} />
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
  container: { flex: 1, backgroundColor: theme.colors.bgBase },

  // ── Home ──────────────────────────────────────────────────────────────────
  homeScroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 },

  homeHeader: { alignItems: 'center', marginBottom: 24, gap: 6 },
  yusufCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: theme.colors.bgElevated, borderWidth: 1, borderColor: theme.colors.borderAccent,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  yusufCircleChar: { color: theme.colors.textAccent, fontSize: 24, fontWeight: theme.fontWeight.medium },
  homeTitle:    { color: theme.colors.textPrimary, fontSize: 16, fontWeight: theme.fontWeight.medium },
  homeSubtitle: { color: theme.colors.textTertiary, fontSize: theme.fontSize.caption },

  dialectRow: { flexDirection: 'row', gap: 8, marginBottom: 24, justifyContent: 'center' },
  dialectPill: {
    flex: 1, paddingVertical: 8, borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderDefault,
    alignItems: 'center',
  },
  dialectPillActive: { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.borderAccent },
  dialectPillText: { color: theme.colors.textTertiary, fontSize: theme.fontSize.body, fontWeight: theme.fontWeight.medium },
  dialectPillTextActive: { color: theme.colors.textAccent },

  sectionLabel: {
    color: theme.colors.textSecondary, fontSize: theme.fontSize.label, fontWeight: theme.fontWeight.medium,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12,
  },

  scenarioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  scenarioCard: {
    width: '47%', backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.md, padding: 14, alignItems: 'center', gap: 6,
  },
  scenarioEmoji: { fontSize: 26 },
  scenarioCardLabel: { color: theme.colors.textPrimary, fontSize: theme.fontSize.caption, fontWeight: theme.fontWeight.medium, textAlign: 'center' },

  freeChatBtn: {
    backgroundColor: theme.colors.accentPrimary,
    borderRadius: theme.radii.md, paddingVertical: 14, alignItems: 'center', marginBottom: 24,
  },
  freeChatBtnText: { color: theme.colors.bgBase, fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium },

  difficultyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  difficultyRowLabel: { color: theme.colors.textTertiary, fontSize: theme.fontSize.caption },
  difficultyStops: { flex: 1, flexDirection: 'row', gap: 6 },
  difficultyStop: {
    flex: 1, paddingVertical: 7, borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderDefault,
    alignItems: 'center',
  },
  difficultyStopActive: { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.borderAccent },
  difficultyStopText: { color: theme.colors.textTertiary, fontSize: theme.fontSize.label, fontWeight: theme.fontWeight.medium },
  difficultyStopTextActive: { color: theme.colors.textAccent },

  // ── Conversation ──────────────────────────────────────────────────────────
  convTopBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: theme.colors.borderDefault,
    backgroundColor: theme.colors.bgBase,
  },
  convBackBtn: { padding: 4 },
  convTitleArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 8 },
  convTitle: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: theme.fontWeight.medium },
  convWith:  { color: theme.colors.textTertiary, fontSize: theme.fontSize.label },

  messagesContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  // Bubbles
  msgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  avatarSmall: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: theme.colors.bgElevated, borderWidth: 1, borderColor: theme.colors.borderAccent,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
  },
  avatarChar: { color: theme.colors.textAccent, fontSize: theme.fontSize.caption, fontWeight: theme.fontWeight.medium },

  yusufBubble: {
    maxWidth: '80%', backgroundColor: theme.colors.bgSurface,
    borderWidth: 1, borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.md, borderTopLeftRadius: 4,
    padding: 12, gap: 4,
  },
  translit:   { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption, marginTop: 2 },
  englishSub: { color: theme.colors.textTertiary, fontSize: theme.fontSize.caption },
  speakerBtn: { alignSelf: 'flex-end', marginTop: 4, padding: 2 },

  userMsgRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
  userBubble: {
    maxWidth: '80%', backgroundColor: theme.colors.bgElevated,
    borderWidth: 1, borderColor: theme.colors.borderAccent,
    borderRadius: theme.radii.md, borderTopRightRadius: 4,
    padding: 12, gap: 3,
  },
  userArabic:  { color: theme.colors.textPrimary, textAlign: 'right', writingDirection: 'rtl' },
  userLatin:   { color: theme.colors.textPrimary, fontSize: 14 },
  userTranslit:{ color: theme.colors.textSecondary, fontSize: theme.fontSize.label },

  // Correction
  correctionCard: {
    marginLeft: 36, marginBottom: 10, marginRight: 8,
    backgroundColor: 'rgba(229, 107, 111, 0.15)', borderWidth: 1, borderColor: theme.colors.accentDanger,
    borderRadius: theme.radii.sm, padding: 10,
  },
  errorCircle: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: theme.colors.accentDanger, alignItems: 'center', justifyContent: 'center',
  },
  errorCircleText: { color: theme.colors.bgBase, fontSize: theme.fontSize.label, fontWeight: theme.fontWeight.medium },
  correctionLabel:  { color: theme.colors.accentDanger, fontSize: theme.fontSize.label, fontWeight: theme.fontWeight.medium },
  correctionWrong:  { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
  strikethrough:    { color: theme.colors.accentDanger, textDecorationLine: 'line-through' },
  correctionRight:  { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
  correctText:      { color: theme.colors.accentSuccess, fontWeight: theme.fontWeight.medium },
  correctionExplain:{ color: theme.colors.textTertiary },

  // Typing indicator
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.md, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: theme.colors.borderDefault,
  },
  typingDot: {
    width: 7, height: 7, borderRadius: 3.5, backgroundColor: theme.colors.accentPrimary,
  },

  // Suggestions
  suggestionsContainer: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4, gap: 6 },
  suggestionsLabel: {
    color: theme.colors.textSecondary, fontSize: theme.fontSize.label, fontWeight: theme.fontWeight.medium,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2,
  },
  suggestionCard: {
    backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.sm, padding: 10,
  },
  suggestionArabic:  { color: theme.colors.textPrimary, fontSize: 14, textAlign: 'right', writingDirection: 'rtl' },
  suggestionEnglish: { color: theme.colors.textTertiary, fontSize: theme.fontSize.label, marginTop: 2 },

  // Word bank
  wordBankRow: { maxHeight: 40, borderTopWidth: 1, borderTopColor: theme.colors.borderDefault },
  wordBankContent: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, gap: 8, alignItems: 'center' },
  wordBankPill: {
    backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.md, paddingHorizontal: 12, paddingVertical: 4,
  },
  wordBankPillText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },

  // Input row
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: theme.colors.borderDefault,
    backgroundColor: theme.colors.bgBase,
  },
  textInput: {
    flex: 1, backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.pill, paddingHorizontal: 14, paddingVertical: 8,
    color: theme.colors.textPrimary, fontSize: 15,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.accentPrimary, alignItems: 'center', justifyContent: 'center',
  },

  // Error bar
  errorBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(229, 107, 111, 0.12)', borderTopWidth: 1, borderTopColor: theme.colors.accentDanger,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  errorBarText: { color: theme.colors.accentDanger, fontSize: theme.fontSize.body, flex: 1 },
  retryBtn: {
    backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.accentDanger, borderRadius: theme.radii.xs,
    paddingHorizontal: 12, paddingVertical: 4, marginLeft: 10,
  },
  retryBtnText: { color: theme.colors.accentDanger, fontSize: theme.fontSize.caption, fontWeight: theme.fontWeight.medium },

  // Completion card
  completionCard: {
    margin: 16, backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.lg, padding: 24, alignItems: 'center',
  },
  completionTitle: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: theme.fontWeight.medium, marginBottom: 10 },
  xpBadge: {
    backgroundColor: 'rgba(61, 212, 192, 0.12)', borderWidth: 1, borderColor: theme.colors.borderAccent,
    borderRadius: theme.radii.md, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 16,
  },
  xpText: { color: theme.colors.textAccent, fontSize: 14, fontWeight: theme.fontWeight.medium },
  learnedSection: { width: '100%', gap: 8 },
  learnedLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.label, fontWeight: theme.fontWeight.medium, textTransform: 'uppercase', letterSpacing: 1.5 },
  learnedPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  learnedPill: {
    backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.sm,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: theme.colors.borderDefault,
  },
  learnedPillText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
  chatAgainBtn: {
    backgroundColor: theme.colors.accentPrimary, borderRadius: theme.radii.md,
    paddingVertical: 13, alignItems: 'center',
  },
  chatAgainText: { color: theme.colors.bgBase, fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium },
  backBtn: { paddingVertical: 10, alignItems: 'center' },
  backBtnText: { color: theme.colors.textTertiary, fontSize: 14 },

  // Word tooltip modal
  tooltipOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  tooltipCard: {
    backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderAccent,
    borderRadius: theme.radii.md, padding: 16, minWidth: 200, gap: 6,
  },
  tooltipArabic: { color: theme.colors.textAccent, fontSize: 22, fontWeight: theme.fontWeight.medium },
  tooltipSub:    { color: theme.colors.textSecondary, fontSize: 14 },
  miniAudioBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: theme.colors.bgElevated, alignItems: 'center', justifyContent: 'center',
  },
});
