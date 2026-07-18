import type { Word } from '../constants/words';
import type { DialogueTurn } from './gulf-dialogues';
import { getMsaAudio } from './msa-audio';

export const MSA_VOICE_ID = 'xvhpbk8otnNHtT3fjCpr';
export const MSA_MODEL_ID = 'eleven_v3';

/**
 * MSA content uses clear contemporary spoken MSA: no dialect vocabulary,
 * no unnecessary case endings, and only minimal audio-only vocalization.
 * Transliteration is lowercase and pronunciation-led (j, q, th, dh, sh,
 * kh, gh; apostrophes for ع/ء where useful; aa/ii/uu for long vowels).
 * Definite articles use assimilation such as ash-shams and ar-rajul.
 * Learner address defaults to masculine unless a form is explicitly labeled.
 */
export const MSA_STYLE_POLICY = {
  learnerAddress: 'masculine-default',
  futureMarker: 'sa-',
  articleStyle: 'pronunciation-assimilated',
  useCaseEndings: false,
} as const;

export type MsaWordEntry = [
  displayArabic: string,
  transliteration: string,
  english: string,
  example?: string,
  exampleTranslation?: string,
  audioText?: string,
  acceptedTransliterations?: string[],
];

export type MsaTurnEntry = [
  type: 'waiter' | 'user',
  speakerRole: string,
  displayArabic: string,
  transliteration: string,
  english: string,
  audioText?: string,
  acceptedTransliterations?: string[],
];

export interface MsaScenario {
  contentId: string;
  scenarioName: string;
  title: string;
  description: string;
  setting: string;
  objective: string;
  imageKey: string;
  dialogue: DialogueTurn[];
}

export function msaSpoken(text: string) {
  return /[.!؟]$/.test(text) ? text : `${text}.`;
}

function msaDisplay(text: string) {
  const lexicalTanween = new Set([
    'مرحباً', 'عفواً', 'شكراً', 'غداً', 'أيضاً', 'حسناً', 'قليلاً', 'قريباً',
    'كثيراً', 'جداً', 'معاً', 'تقريباً', 'عذراً', 'ظهراً', 'لاحقاً', 'حالاً',
  ]);
  return text.split(/(\s+)/).map(token => {
    const core = token.replace(/[،.!؟?]/g, '');
    return lexicalTanween.has(core) ? token : token.replace(/[ًٌٍ]/g, '');
  }).join('');
}

const PAUSAL_REPLACEMENTS: Record<string, string> = {
  naam: "na'am",
  maan: "ma'an",
  saiid: "sa'iid",
  raai: "raa'i'",
  rayuka: "ra'yuka",
  ijtimaa: "ijtimaa'",
  maaun: "maa'",
  hajzun: 'hajz',
  haqiibatan: 'haqiiba',
  haqiibatun: 'haqiiba',
  dirhaman: 'dirham',
  mustaiddun: "musta'idd",
  dajaajun: 'dajaaj',
  mashwiyyun: 'mashwii',
  tariiqun: 'tariiq',
  muzdahimun: 'muzdahim',
  haliibun: 'haliib',
  khaalin: 'khaali',
  haraaratun: 'haraara',
  habbatan: 'habba',
  habbatun: 'habba',
  waahidatun: 'waahida',
  sudaaun: "sudaa'",
  "maw'idun": "maw'id",
  mutafarrighun: 'mutafarrigh',
  ijtimaaun: "ijtimaa'",
  "sa'iidun": "sa'iid",
  mariidun: 'mariid',
  makaanin: 'makaan',
  "musaa'adatin": "musaa'ada",
  fikratun: 'fikra',
  mubaaratun: 'mubaara',
  fariiqin: 'fariiq',
  lutfun: 'lutf',
  jaaiun: "jaa'i'",
  tabaqin: 'tabaq',
  qahwatin: 'qahwa',
  jamiilun: 'jamiil',
  hadiyyatun: 'hadiyya',
  basiitatun: 'basiita',
  jamiilatun: 'jamiila',
  rihlatun: 'rihla',
  suuratan: 'suura',
  qitatan: "qit'a",
  qamiisan: 'qamiis',
  sirwaalan: 'sirwal',
  ghitaaun: "ghitaa'",
  saatin: "saa'a",
  "waa'in": "waa'i",
  "a'raadun": "a'raad",
  "sudaa'un": "sudaa'",
  "su'uubatun": "su'uuba",
  hikkatun: 'hikka',
  mutaakhkhirun: 'mutaakhkhir',
  baiidun: "ba'iid",
  saiidun: "sa'iid",
  qasiiran: 'qasiir',
  qasiiratan: 'qasiira',
  nawin: "naw'",
  siran: "si'r",
  kakin: "ka'k",
  asiiran: 'asiir',
  layaalin: 'layaal',
  ijtimaain: "ijtimaa'",
  mutaahan: 'mutaah',
  yawmin: 'yawm',
  mashghuulan: 'mashghuul',
  mawidin: "maw'id",
  hadafan: 'hadaf',
  shayan: "shay'an",
  miilaadin: 'miilaad',
  jamaaiyyatan: "jamaa'iyya",
  daruuriyyan: 'daruuri',
  ayyaaman: 'ayyaam',
};

export function normalizeMsaTransliteration(value: string) {
  let normalized = value.toLowerCase().trim();
  normalized = normalized.replace(/\bmin fadlik\b/g, 'min fadlak');
  normalized = normalized.replace(/\bbit-tab\b(?!')/g, "bit-tab'");
  normalized = normalized.replace(/(?<!')\balaa\b/g, "'alaa");
  normalized = normalized.replace(/[a-z']+/g, token => PAUSAL_REPLACEMENTS[token] ?? token);
  const sunLetters: Record<string, string> = {
    sh: 'ash', th: 'ath', dh: 'adh', t: 'at', d: 'ad', r: 'ar', z: 'az', s: 'as', n: 'an', l: 'al',
  };
  normalized = normalized.replace(/\bal-(sh|th|dh|t|d|r|z|s|n|l)(?=[a-z'])/g, (_match, onset: string) => `${sunLetters[onset]}-${onset}`);
  return normalized.replace(/\s+/g, ' ').trim();
}

export function msaAccepted(transliteration: string, extra: string[] = []) {
  const canonical = normalizeMsaTransliteration(transliteration);
  const plain = canonical.replace(/[?'.,-]/g, '').replace(/\s+/g, ' ').trim();
  const dialectVariant = /\b(?:wain|wein|fein|izzay|shlon|abghi|aayez|raagel|geneeh|ahwa)\b/;
  return [...new Set([canonical, plain, ...extra.map(normalizeMsaTransliteration)])]
    .filter(value => Boolean(value) && !dialectVariant.test(value));
}

export function makeMsaWords(
  unit: number,
  lessonId: string,
  entries: MsaWordEntry[],
  explanation = 'Use this expression in clear contemporary Modern Standard Arabic.',
): Word[] {
  return entries.map(([displayArabic, transliteration, english, example, exampleTranslation, audioText, accepted], index) => {
    const cleanDisplayArabic = msaDisplay(displayArabic);
    const audioPath = `assets/audio/msa/unit-${unit}/${lessonId}/${index + 1}.mp3`;
    return {
      arabic: cleanDisplayArabic,
      displayArabic: cleanDisplayArabic,
      audioText: audioText ?? msaSpoken(cleanDisplayArabic),
      evalTarget: cleanDisplayArabic,
      transliteration: normalizeMsaTransliteration(transliteration),
      acceptedTransliterations: msaAccepted(transliteration, accepted),
      english,
      context: `MSA Unit ${unit}`,
      example,
      exampleTranslation,
      explanation,
      audioPath,
      audio: getMsaAudio(audioPath),
      voiceId: MSA_VOICE_ID,
      modelId: MSA_MODEL_ID,
    };
  });
}

export function makeMsaScenario(
  unit: number,
  contentId: string,
  scenarioName: string,
  title: string,
  description: string,
  setting: string,
  objective: string,
  imageKey: string,
  entries: MsaTurnEntry[],
): MsaScenario {
  let staffIndex = 0;
  let userIndex = 0;
  const dialogue = entries.map(([type, speakerRole, displayArabic, transliteration, english, audioText, accepted]) => {
    const cleanDisplayArabic = msaDisplay(displayArabic);
    const index = type === 'waiter' ? ++staffIndex : ++userIndex;
    const prefix = type === 'waiter' ? 'w' : 'u';
    const audioPath = `assets/audio/msa/unit-${unit}/${contentId}/${prefix}${index}.mp3`;
    return {
      type,
      speakerRole,
      arabic: cleanDisplayArabic,
      displayArabic: cleanDisplayArabic,
      audioText: audioText ?? msaSpoken(cleanDisplayArabic),
      evalTarget: cleanDisplayArabic,
      transliteration: normalizeMsaTransliteration(transliteration),
      acceptedTransliterations: msaAccepted(transliteration, accepted),
      english,
      pronunciationStep: type === 'user',
      audioPath,
      audio: getMsaAudio(audioPath),
      voiceId: MSA_VOICE_ID,
      modelId: MSA_MODEL_ID,
    } satisfies DialogueTurn;
  });

  return { contentId, scenarioName, title, description, setting, objective, imageKey, dialogue };
}
