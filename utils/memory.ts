import { supabase } from './supabase';

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserMemory {
  personal_facts: string[];
  weak_words: string[];
  strong_words: string[];
  last_session_summary: string;
  total_sessions: number;
}

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  text?: string;       // user message
  arabic?: string;     // assistant reply
  english?: string;    // assistant reply translation
}

// ── UNIT_WORDS: starter map (expand later) ───────────────────────────────────
//
// Maps Arabic vocabulary tokens to the unit number where they're first taught.
// Source: constants/words.ts (Units 1, 4 fully covered) and the dialogue files
// (Units 2/6/8/10 — representative keywords, ~6 per scenario).

export const UNIT_WORDS: Record<string, number> = {
  // ─ Unit 1 — First Words (basic + greetings + intro) ─
  'صَبَاح': 1, 'قَهْوَة': 1, 'بَيْت': 1, 'سَيَّارَة': 1, 'تَاكْسِي': 1,
  'شَارِع': 1, 'أَنَا': 1, 'أَنْتَ': 1, 'صَدِيق': 1, 'نَعَم': 1,
  'لَا': 1, 'شُكْراً': 1, 'مِن فَضْلَك': 1, 'مَاء': 1, 'أَكْل': 1,
  'مَطْعَم': 1, 'وَاحِد': 1, 'اِثْنَيْن': 1, 'زَيْن': 1, 'تَعْبَان': 1,
  'مَرْحَبَا': 1, 'أَهْلاً': 1, 'اَلسَّلَامُ عَلَيْكُم': 1, 'وَعَلَيْكُم اَلسَّلَام': 1,
  'كَيْفَ حَالَك': 1, 'بِخَيْر': 1, 'اَلْحَمْدُ لِلَّهِ': 1, 'صَبَاح اَلْخَيْر': 1,
  'صَبَاح اَلنُّور': 1, 'مَسَاء اَلْخَيْر': 1, 'تِشَرَّفْنَا': 1, 'مَعَ السَّلَامَة': 1,
  'اَللَّهُ يُسَلِّمَكَ': 1, 'يَلَّا': 1, 'إِن شَاء اَللَّه': 1,
  'اِسْمِي': 1, 'أَنَا مِن': 1, 'عُمْرِي': 1, 'أَسْكُن فِي': 1, 'أَشْتَغِل': 1,
  'أَتَكَلَّم': 1, 'شْوَيَّة': 1, 'أَعْرِف': 1, 'أُحِبُّ': 1, 'كَثِير': 1,
  'قَلِيل': 1, 'سَعِيد': 1, 'مِتْزَوِّج': 1, 'عِنْدِي': 1, 'مَا عِنْدِي': 1,

  // ─ Unit 2 — Real Life Situations (~6 per scenario) ─
  // Cafe
  'شَاي': 2, 'طَلَب': 2, 'حِسَاب': 2,
  // Taxi
  'وَيْن': 2, 'دِرْهَم': 2, 'يَمِين': 2, 'يَسَار': 2,
  // Hotel
  'حَجْز': 2, 'غُرْفَة': 2, 'مِفْتَاح': 2, 'لَيْلَة': 2, 'جَوَاز': 2,
  // Restaurant
  'مِنُو': 2, 'لَحْم': 2, 'خُضَار': 2, 'سَلَطَة': 2,
  // Supermarket
  'كِيس': 2, 'خُبْز': 2, 'حَلِيب': 2,
  // Pharmacy
  'دَوَا': 2, 'صَيْدَلِيَّة': 2, 'وَجَع': 2, 'بَنَدُول': 2,
  // Barbershop
  'حَلَاقَة': 2, 'شَعْر': 2, 'لِحْيَة': 2, 'قَصِير': 2, 'طَوِيل': 2,
  // Airport
  'مَطَار': 2, 'تَذْكِرَة': 2, 'شَنْطَة': 2, 'بَوَّابَة': 2, 'تَأْخِير': 2,

  // ─ Unit 4 — Numbers ─
  'ثَلَاثَة': 4, 'أَرْبَعَة': 4, 'خَمْسَة': 4, 'سِتَّة': 4, 'سَبْعَة': 4,
  'ثَمَانِيَة': 4, 'تِسْعَة': 4, 'عَشَرَة': 4, 'عِشْرِين': 4, 'ثَلَاثِين': 4,
  'أَرْبَعِين': 4, 'خَمْسِين': 4, 'مِيَة': 4, 'سَنَة': 4,

  // ─ Unit 6 — Daily Life ─
  // Morning routine
  'فُطُور': 6, 'اِسْتَيْقَظت': 6, 'دَوَام': 6,
  // Gym
  'نَادِي': 6, 'تَمَارِين': 6, 'عَضَلَات': 6,
  // Cooking
  'طَبَخت': 6, 'بَصَل': 6, 'مِلح': 6, 'رِزّ': 6, 'دَجَاج': 6,
  // Weather
  'حَرّ': 6, 'بَرْد': 6, 'شَمْس': 6, 'مَطَر': 6, 'رِيح': 6,
  // Doctor
  'دُكْتُور': 6, 'مَرِيض': 6, 'فَحْص': 6,
  // Bank
  'بَنْك': 6, 'تَحْوِيل': 6, 'صَرَّاف': 6, 'فُلُوس': 6,
  // Friday
  'جُمْعَة': 6, 'مَسْجِد': 6, 'صَلَاة': 6, 'عَائِلَة': 6, 'غَدَا': 6,
  // Neighbor
  'جَار': 6, 'زِيَارَة': 6, 'دَعْوَة': 6,

  // ─ Unit 8 — Emergencies ─
  'ضَايِع': 8, 'خَرِيطَة': 8, 'مُسَاعَدَة': 8, 'إِشَارَة': 8,
  'خَرْبَانَة': 8, 'بَنْشَر': 8, 'بَطَّارِيَّة': 8, 'مِيكَانِيكِي': 8,
  'شُرْطَة': 8, 'بَلَاغ': 8, 'تَقْرِير': 8, 'مَفْقُود': 8, 'مَسْرُوق': 8,
  'مُسْتَشْفَى': 8, 'طَوَارِئ': 8, 'إِسْعَاف': 8, 'جَرِيح': 8,
  'مَحْفَظَة': 8, 'بِطَاقَة': 8, 'جَوَّال': 8, 'شَرِيحَة': 8,
  'طَيَّارَة': 8, 'إِلْغَاء': 8, 'تَعْوِيض': 8,
  'مُمْكِن': 8, 'لَوْ سَمَحْت': 8, 'دَلَّنِي': 8,

  // ─ Unit 10 — Friends ─
  'تَفَضَّل': 10, 'جَدِيد': 10,
  'مَاتْش': 10, 'فَرِيق': 10, 'لَاعِب': 10, 'جُول': 10, 'مُنْتَخَب': 10,
  'لُعْبَة': 10, 'بْلَايْ': 10, 'أُونْلَايْن': 10, 'فَوْز': 10, 'خَسَارَة': 10,
  'وِيكِنْد': 10, 'طَلْعَة': 10, 'شَاطِئ': 10, 'مُول': 10,
  'إِنْسْتَا': 10, 'تِكْتُوك': 10, 'بُوسْت': 10, 'لَايْك': 10, 'فُولُوَر': 10,
  'رِحْلَة': 10, 'بِنْزِين': 10, 'طَرِيق': 10,
  'عِيد مِيلَاد': 10, 'كَيْكَة': 10, 'هَدِيَّة': 10, 'مَبْرُوك': 10, 'شَمْعَة': 10,
  'وَدَاع': 10, 'سَفَر': 10, 'تَذْكُرنِي': 10, 'نِفْتَقِدَك': 10, 'اَللَّه مَعَك': 10,
};

// ── fetchMemory ──────────────────────────────────────────────────────────────

export async function fetchMemory(userId: string): Promise<UserMemory | null> {
  const { data, error } = await supabase
    .from('user_memory')
    .select('personal_facts, weak_words, strong_words, last_session_summary, total_sessions')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    personal_facts: Array.isArray(data.personal_facts) ? data.personal_facts : [],
    weak_words: Array.isArray(data.weak_words) ? data.weak_words : [],
    strong_words: Array.isArray(data.strong_words) ? data.strong_words : [],
    last_session_summary: data.last_session_summary ?? '',
    total_sessions: data.total_sessions ?? 0,
  };
}

// ── buildMemoryPrompt ────────────────────────────────────────────────────────

export function buildMemoryPrompt(memory: UserMemory | null): string {
  if (!memory) return '';

  const lines: string[] = ['User context:'];

  if (memory.personal_facts.length > 0) {
    lines.push(memory.personal_facts.join('. ').replace(/\.+$/, '') + '.');
  }

  if (memory.weak_words.length > 0) {
    lines.push(`Weak words: ${memory.weak_words.join(', ')}.`);
  }

  if (memory.strong_words.length > 0) {
    lines.push(`Strong words: ${memory.strong_words.join(', ')}.`);
  }

  if (memory.last_session_summary) {
    lines.push(`Last session: ${memory.last_session_summary}`);
  }

  lines.push(`This is session ${memory.total_sessions + 1}.`);

  // Weak word → unit hints (only emit for words we recognise in the curriculum)
  for (const w of memory.weak_words) {
    const unit = UNIT_WORDS[w];
    if (unit) lines.push(`${w} appears in Unit ${unit} — suggest revisiting if relevant.`);
  }

  return lines.join('\n');
}

// ── saveMemory ───────────────────────────────────────────────────────────────

const HAIKU_MEMORY_PROMPT = `You are a memory system for a Gulf Arabic learning app.
Read this conversation transcript and the existing user memory.
Return ONLY a JSON object, no other text:
{
  "personal_facts": string[],
  "weak_words": string[],
  "strong_words": string[],
  "last_session_summary": string
}

Rules:
- personal_facts: facts about the user (name, origin, job, interests). Max 5 items, dedupe with existing.
- weak_words: Arabic words the user got wrong, mispronounced, or confused. Max 10.
- strong_words: Arabic words the user used correctly and fluently. Max 10.
- last_session_summary: 2-3 sentences describing what happened this session.
- Be concise. Merge with existing memory — don't duplicate facts already known.`;

function formatTranscript(transcript: TranscriptMessage[]): string {
  return transcript
    .map(m => {
      if (m.role === 'user') return `User: ${m.text ?? ''}`;
      const ar = m.arabic ?? '';
      const en = m.english ? ` (${m.english})` : '';
      return `Yusuf: ${ar}${en}`;
    })
    .join('\n');
}

export async function saveMemory(
  userId: string,
  transcript: TranscriptMessage[],
  existingMemory: UserMemory | null,
): Promise<void> {
  if (transcript.length < 3) return;

  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) return;

  const existingJson = existingMemory
    ? JSON.stringify({
        personal_facts: existingMemory.personal_facts,
        weak_words: existingMemory.weak_words,
        strong_words: existingMemory.strong_words,
        last_session_summary: existingMemory.last_session_summary,
      })
    : '{}';

  const userMessage = `Existing memory:\n${existingJson}\n\nThis session's transcript:\n${formatTranscript(transcript)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: HAIKU_MEMORY_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`memory haiku ${response.status}`);
    const data = await response.json();
    const raw: string = data.content[0].text.trim();
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const newRow = {
      user_id: userId,
      personal_facts: (parsed.personal_facts ?? []).slice(0, 5),
      weak_words: (parsed.weak_words ?? []).slice(0, 10),
      strong_words: (parsed.strong_words ?? []).slice(0, 10),
      last_session_summary: parsed.last_session_summary ?? '',
      total_sessions: (existingMemory?.total_sessions ?? 0) + 1,
      updated_at: new Date().toISOString(),
    };

    const result = await supabase.from('user_memory').upsert(newRow, { onConflict: 'user_id' });
    if (result.error) throw result.error;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn('[memory] save timeout — skipping');
      return;
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
