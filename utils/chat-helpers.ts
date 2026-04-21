import { BASIC_WORDS, GREETINGS_WORDS, INTRO_WORDS } from '../constants/words';
import { stripTashkeel } from './arabic';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ClaudeResponse {
  arabic: string;
  arabicTashkeel: string;
  transliteration: string;
  english: string;
  correction: { wrong: string; correct: string; explanation: string } | null;
  suggestedReplies: Array<{ arabic: string; transliteration: string; english: string }>;
  wordBank: string[];
  conversationEnd: boolean;
}

// ── Local word dictionary (tap-to-translate) ──────────────────────────────────

function buildWordDict() {
  const dict = new Map<string, { transliteration: string; english: string }>();
  for (const w of [...BASIC_WORDS, ...GREETINGS_WORDS, ...INTRO_WORDS]) {
    const key = stripTashkeel(w.arabic).trim();
    if (key) dict.set(key, { transliteration: w.transliteration, english: w.english });
  }
  return dict;
}

export const WORD_DICT = buildWordDict();

// ── System prompt ─────────────────────────────────────────────────────────────

export function buildSystemPrompt(
  mode: 'guided' | 'free',
  scenarioLabel: string | null,
  difficulty: Difficulty,
  dialect: string
): string {
  const dialectName =
    dialect === 'egyptian' ? 'Egyptian Arabic' :
    dialect === 'msa' ? 'Modern Standard Arabic' : 'Gulf Arabic';

  const context = mode === 'guided' && scenarioLabel
    ? `You are Yusuf, playing the NPC in a "${scenarioLabel}" scenario in Dubai.`
    : 'You are Yusuf, a friendly Gulf Arabic conversation partner. Talk about anything naturally.';

  const diffNote =
    difficulty === 'beginner'
      ? 'Use simple, common words. Always include English translations. Always provide 3 suggestedReplies.'
      : difficulty === 'intermediate'
      ? 'Use natural speech patterns. Provide transliteration. Fewer English hints. Provide 3 suggestedReplies.'
      : 'Arabic only — no translations. Corrections only. Still provide 3 suggestedReplies.';

  return `${context}

Rules:
- Respond in ${dialectName} ONLY (no mixing)
- Keep responses SHORT — 1 to 2 sentences maximum
- Difficulty level: ${difficulty}. ${diffNote}
- If the user writes in English, respond in Arabic but acknowledge what they said
- If the user makes a grammar or vocabulary mistake, fill in the "correction" field

Respond ONLY with valid JSON — no markdown, no extra text:
{
  "arabic": "response without tashkeel",
  "arabicTashkeel": "same response with full tashkeel for TTS",
  "transliteration": "romanized pronunciation",
  "english": "English translation",
  "correction": null,
  "suggestedReplies": [
    { "arabic": "reply option 1", "transliteration": "...", "english": "..." },
    { "arabic": "reply option 2", "transliteration": "...", "english": "..." },
    { "arabic": "reply option 3", "transliteration": "...", "english": "..." }
  ],
  "wordBank": ["word1", "word2", "word3", "word4", "word5"],
  "conversationEnd": false
}`;
}

// ── Claude API ────────────────────────────────────────────────────────────────

export async function callClaude(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: systemPrompt,
        messages,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.content?.[0]?.text ?? '';
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('timeout');
    throw err;
  }
}

// ── JSON parser with fallback ─────────────────────────────────────────────────

export function parseClaudeResponse(raw: string): ClaudeResponse | null {
  const tryParse = (str: string): ClaudeResponse | null => {
    try {
      const p = JSON.parse(str);
      return {
        arabic:          p.arabic          ?? '',
        arabicTashkeel:  p.arabicTashkeel  ?? p.arabic ?? '',
        transliteration: p.transliteration ?? '',
        english:         p.english         ?? '',
        correction:      p.correction      ?? null,
        suggestedReplies: Array.isArray(p.suggestedReplies) ? p.suggestedReplies.slice(0, 3) : [],
        wordBank:        Array.isArray(p.wordBank) ? p.wordBank.slice(0, 8) : [],
        conversationEnd: p.conversationEnd ?? false,
      };
    } catch { return null; }
  };

  // Try direct parse after stripping markdown fences
  const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
  const direct = tryParse(clean);
  if (direct) return direct;

  // Try extracting first JSON object
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) return tryParse(match[0]);

  return null;
}

