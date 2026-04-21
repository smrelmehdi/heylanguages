import type { QuizQuestion } from './quiz-types';

export const QUIZ_PART1_QUESTIONS: QuizQuestion[] = [

  // ── Scene Replay × 4 ──────────────────────────────────────────────────────

  {
    id: 'p1_sr1',
    format: 'scene_replay',
    scenarioSource: 'cafe',
    xpValue: 10,
    sceneImage: require('../assets/images/cafe-bg.png'),
    // Café waiter ordering prompt: "وش تبي؟" (w5)
    audioFile: require('../assets/audio/cafe/w5.mp3'),
    audioText: 'وش تبي؟',
    prompt: 'What is the correct response?',
    options: [
      { arabic: 'أبي قهوة عربية',  transliteration: 'abi gahwa arabiya',    isCorrect: true  },
      { arabic: 'وين الحمام؟',     transliteration: 'wain al-hammam?',      isCorrect: false },
      { arabic: 'كم الحساب؟',     transliteration: 'kam al-hisab?',        isCorrect: false },
      { arabic: 'أبي غرفة',        transliteration: 'abi ghurfa',           isCorrect: false },
    ],
  },

  {
    id: 'p1_sr2',
    format: 'scene_replay',
    scenarioSource: 'taxi',
    xpValue: 10,
    sceneImage: require('../assets/images/dubai-taxi-interior.png'),
    // Taxi driver asking destination: "وين تروح؟" (w2)
    audioFile: require('../assets/audio/taxi/w2.mp3'),
    audioText: 'وين تروح؟',
    prompt: 'What is the correct response?',
    options: [
      { arabic: 'دبي مول لو سمحت', transliteration: 'dubai mall law samaht', isCorrect: true  },
      { arabic: 'أبي قهوة',         transliteration: 'abi gahwa',             isCorrect: false },
      { arabic: 'كم الليلة؟',       transliteration: 'kam al-layla?',          isCorrect: false },
      { arabic: 'شكراً حبيبي',      transliteration: 'shukran habibi',         isCorrect: false },
    ],
  },

  {
    id: 'p1_sr3',
    format: 'scene_replay',
    scenarioSource: 'hotel',
    xpValue: 10,
    sceneImage: require('../assets/images/dubai-hotel-reception.png'),
    // Hotel receptionist turn 2: "عندك حجز؟"
    audioFile: require('../assets/audio/hotel/w2.mp3'),
    audioText: 'عندك حجز؟',
    prompt: 'What is the correct response?',
    options: [
      { arabic: 'إي عندي حجز',  transliteration: 'ee indi hajiz',     isCorrect: true  },
      { arabic: 'أبي شاي',      transliteration: 'abi chai',          isCorrect: false },
      { arabic: 'لا شكراً',     transliteration: 'la shukran',        isCorrect: false },
      { arabic: 'كم الأجرة؟',  transliteration: 'kam al-ujra?',      isCorrect: false },
    ],
  },

  {
    id: 'p1_sr4',
    format: 'scene_replay',
    scenarioSource: 'cafe',
    xpValue: 10,
    sceneImage: require('../assets/images/arabic-cafe-entrance.png'),
    // Café waiter sugar question: "بسكر؟" (w7)
    audioFile: require('../assets/audio/cafe/w7.mp3'),
    audioText: 'بسكر؟',
    prompt: 'What is the correct response?',
    options: [
      { arabic: 'شوية سكر',       transliteration: 'shwayya sukkar',       isCorrect: true  },
      { arabic: 'غرفة لشخصين',   transliteration: 'ghurfa li-shakhsain',  isCorrect: false },
      { arabic: 'وين المطار؟',   transliteration: 'wain al-matar?',       isCorrect: false },
      { arabic: 'بكم هذا؟',      transliteration: 'bikam hatha?',         isCorrect: false },
    ],
  },

  // ── Fill the Conversation × 5 ─────────────────────────────────────────────

  {
    id: 'p1_fc1',
    format: 'fill_conversation',
    scenarioSource: 'cafe',
    xpValue: 10,
    dialogue: [
      { speaker: 'yusuf', arabic: 'السلام عليكم',             transliteration: 'as-salamu alaykum',              isBlank: false },
      { speaker: 'npc',   arabic: 'وعليكم السلام! شو تبي؟',   transliteration: 'wa alaykum as-salam! shu tabi?',  isBlank: false },
      { speaker: 'yusuf', arabic: '',                           transliteration: '',                               isBlank: true  },
    ],
    options: [
      { arabic: 'أبي كرك لو سمحت', transliteration: 'abi karak law samaht', isCorrect: true  },
      { arabic: 'وين دبي مول؟',    transliteration: 'wain dubai mall?',      isCorrect: false },
      { arabic: 'عندي حجز',        transliteration: 'indi hajiz',            isCorrect: false },
    ],
  },

  {
    id: 'p1_fc2',
    format: 'fill_conversation',
    scenarioSource: 'taxi',
    xpValue: 10,
    dialogue: [
      { speaker: 'yusuf', arabic: 'السلام عليكم، أبي أروح المارينا',  transliteration: 'salaam, abi arooh al-marina',     isBlank: false },
      { speaker: 'npc',   arabic: 'إن شاء الله. بس فيه زحمة هالحين', transliteration: 'inshallah. bas fi zahma hal-hin', isBlank: false },
      { speaker: 'yusuf', arabic: '',                                   transliteration: '',                               isBlank: true  },
    ],
    options: [
      { arabic: 'مافي مشكلة',  transliteration: 'mafi mushkila',  isCorrect: true  },
      { arabic: 'أبي قهوة',   transliteration: 'abi gahwa',       isCorrect: false },
      { arabic: 'كم الليلة؟', transliteration: 'kam al-layla?',   isCorrect: false },
    ],
  },

  {
    id: 'p1_fc3',
    format: 'fill_conversation',
    scenarioSource: 'hotel',
    xpValue: 10,
    dialogue: [
      { speaker: 'npc',   arabic: 'أهلاً وسهلاً! كيف أقدر أساعدك؟', transliteration: "ahlan wa sahlan! kayf agdar usa'idak?", isBlank: false },
      { speaker: 'yusuf', arabic: '',                                   transliteration: '',                                     isBlank: true  },
    ],
    options: [
      { arabic: 'أبي أسوي تشيك إن', transliteration: 'abi asawi check-in', isCorrect: true  },
      { arabic: 'كم الأجرة؟',       transliteration: 'kam al-ujra?',       isCorrect: false },
      { arabic: 'أبي كرك',          transliteration: 'abi karak',          isCorrect: false },
    ],
  },

  {
    id: 'p1_fc4',
    format: 'fill_conversation',
    scenarioSource: 'cafe',
    xpValue: 10,
    dialogue: [
      { speaker: 'yusuf', arabic: 'كم الحساب؟',    transliteration: 'kam al-hisab?',         isBlank: false },
      { speaker: 'npc',   arabic: 'خمسة عشر درهم', transliteration: "khamsa 'ashar dirham",  isBlank: false },
      { speaker: 'yusuf', arabic: '',               transliteration: '',                      isBlank: true  },
    ],
    options: [
      { arabic: 'تفضل، شكراً',    transliteration: 'tafaddal, shukran', isCorrect: true  },
      { arabic: 'وين الغرفة؟',  transliteration: 'wain al-ghurfa?',   isCorrect: false },
      { arabic: 'أبي أنزل هني', transliteration: 'abi anzil hini',    isCorrect: false },
    ],
  },

  {
    id: 'p1_fc5',
    format: 'fill_conversation',
    scenarioSource: 'taxi',
    xpValue: 10,
    dialogue: [
      { speaker: 'npc',   arabic: 'وصلنا',      transliteration: 'wasalna',        isBlank: false },
      { speaker: 'yusuf', arabic: '',            transliteration: '',               isBlank: true  },
      { speaker: 'npc',   arabic: 'الله يسلمك', transliteration: 'allah yisalmak', isBlank: false },
    ],
    options: [
      { arabic: 'شكراً حبيبي، مع السلامة', transliteration: "shukran habibi, ma'a as-salama", isCorrect: true  },
      { arabic: 'أبي قهوة عربية',           transliteration: 'abi gahwa arabiya',               isCorrect: false },
      { arabic: 'عندك حجز؟',               transliteration: 'indak hajiz?',                    isCorrect: false },
    ],
  },

  // ── Listening Challenge × 5 ───────────────────────────────────────────────

  {
    id: 'p1_ls1',
    format: 'listening',
    scenarioSource: 'cafe',
    xpValue: 10,
    // "لو سمحت" not in dialogue audio — TTS fallback
    audioFile: null,
    audioText: 'لو سمحت',
    options: [
      { arabic: 'لو سمحت',     transliteration: 'law samaht',    isCorrect: true  },
      { arabic: 'إن شاء الله', transliteration: 'inshallah',     isCorrect: false },
      { arabic: 'ما شاء الله', transliteration: 'mashallah',     isCorrect: false },
      { arabic: 'الحمد لله',   transliteration: 'alhamdulillah', isCorrect: false },
    ],
  },

  {
    id: 'p1_ls2',
    format: 'listening',
    scenarioSource: 'taxi',
    xpValue: 10,
    // Taxi user asking fare — fall back to TTS since specific file unknown
    audioFile: null,
    audioText: 'كم الأجرة؟',
    options: [
      { arabic: 'وين الفندق؟', transliteration: 'wain al-funduq?', isCorrect: false },
      { arabic: 'كم الأجرة؟', transliteration: 'kam al-ujra?',    isCorrect: true  },
      { arabic: 'شو تبي؟',    transliteration: 'shu tabi?',       isCorrect: false },
      { arabic: 'كيف حالك؟',  transliteration: 'kaif halak?',     isCorrect: false },
    ],
  },

  {
    id: 'p1_ls3',
    format: 'listening',
    scenarioSource: 'hotel',
    xpValue: 10,
    audioFile: null,
    audioText: 'غرفة لشخصين',
    options: [
      { arabic: 'قهوة بدون سكر',  transliteration: 'gahwa bidoon sukkar',  isCorrect: false },
      { arabic: 'تاكسي للمطار',   transliteration: 'taxi lil-matar',        isCorrect: false },
      { arabic: 'غرفة لشخصين',    transliteration: 'ghurfa li-shakhsain',   isCorrect: true  },
      { arabic: 'الحساب لو سمحت', transliteration: 'al-hisab law samaht',   isCorrect: false },
    ],
  },

  {
    id: 'p1_ls4',
    format: 'listening',
    scenarioSource: 'cafe',
    xpValue: 10,
    audioFile: null,
    audioText: 'إن شاء الله',
    options: [
      { arabic: 'مع السلامة',  transliteration: "ma'a as-salama", isCorrect: false },
      { arabic: 'الحمد لله',  transliteration: 'alhamdulillah',  isCorrect: false },
      { arabic: 'إن شاء الله', transliteration: 'inshallah',      isCorrect: true  },
      { arabic: 'لو سمحت',    transliteration: 'law samaht',      isCorrect: false },
    ],
  },

  {
    id: 'p1_ls5',
    format: 'listening',
    scenarioSource: 'cafe',
    xpValue: 10,
    audioFile: null,
    audioText: 'أبي كرك بهارات',
    options: [
      { arabic: 'أبي قهوة عربية',  transliteration: 'abi gahwa arabiya', isCorrect: false },
      { arabic: 'أبي كرك بهارات',  transliteration: 'abi karak baharat', isCorrect: true  },
      { arabic: 'أبي شاي أخضر',   transliteration: 'abi chai akhdar',   isCorrect: false },
      { arabic: 'أبي ماي',         transliteration: 'abi mai',           isCorrect: false },
    ],
  },

  // ── Emoji Match × 4 ───────────────────────────────────────────────────────

  {
    id: 'p1_em1',
    format: 'emoji_match',
    scenarioSource: 'cafe',
    xpValue: 10,
    pairs: [
      { arabic: 'قهوة',    transliteration: 'gahwa',    emoji: '☕' },
      { arabic: 'كرك',     transliteration: 'karak',    emoji: '🫖' },
      { arabic: 'كيكة',    transliteration: 'kaika',    emoji: '🧁' },
      { arabic: 'الحساب',  transliteration: 'al-hisab', emoji: '💰' },
    ],
  },

  {
    id: 'p1_em2',
    format: 'emoji_match',
    scenarioSource: 'taxi',
    xpValue: 10,
    pairs: [
      { arabic: 'تاكسي',      transliteration: 'taxi',            emoji: '🚕' },
      { arabic: 'وين',        transliteration: 'wain',            emoji: '📍' },
      { arabic: 'زحمة',       transliteration: 'zahma',           emoji: '🚦' },
      { arabic: 'مع السلامة', transliteration: "ma'a as-salama",  emoji: '👋' },
    ],
  },

  {
    id: 'p1_em3',
    format: 'emoji_match',
    scenarioSource: 'hotel',
    xpValue: 10,
    pairs: [
      { arabic: 'فندق',  transliteration: 'funduq', emoji: '🏨' },
      { arabic: 'غرفة',  transliteration: 'ghurfa', emoji: '🛏️' },
      { arabic: 'مفتاح', transliteration: 'miftah', emoji: '🔑' },
      { arabic: 'حجز',   transliteration: 'hajiz',  emoji: '📋' },
    ],
  },

  {
    id: 'p1_em4',
    format: 'emoji_match',
    scenarioSource: 'cafe',
    xpValue: 10,
    pairs: [
      { arabic: 'إي',      transliteration: 'ee',         emoji: '✅' },
      { arabic: 'لا',      transliteration: 'la',         emoji: '❌' },
      { arabic: 'شكراً',   transliteration: 'shukran',    emoji: '🙏' },
      { arabic: 'لو سمحت', transliteration: 'law samaht', emoji: '🤲' },
    ],
  },
];
