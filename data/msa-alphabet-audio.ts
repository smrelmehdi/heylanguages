import type { AlphabetAudioItem } from './alphabet-audio';
import type { Word } from '../constants/words';
import { MSA_MODEL_ID, MSA_VOICE_ID, msaAccepted } from './msa-style';
import { makeMsaWords } from './msa-style';
import { getMsaAudio } from './msa-audio';

const LETTERS = [
  ['alif', 'ألف', 'أَلِف', 'alif'], ['ba', 'باء', 'بَاء', 'baa'], ['ta', 'تاء', 'تَاء', 'taa'],
  ['tha', 'ثاء', 'ثَاء', 'thaa'], ['jim', 'جيم', 'جِيم', 'jiim'], ['ha', 'حاء', 'حَاء', 'haa'],
  ['kha', 'خاء', 'خَاء', 'khaa'], ['dal', 'دال', 'دَال', 'daal'], ['dhal', 'ذال', 'ذَال', 'dhaal'],
  ['ra', 'راء', 'رَاء', 'raa'], ['zay', 'زاي', 'زَاي', 'zaay'], ['sin', 'سين', 'سِين', 'siin'],
  ['shin', 'شين', 'شِين', 'shiin'], ['sad', 'صاد', 'صَاد', 'saad'], ['dad', 'ضاد', 'ضَاد', 'daad'],
  ['tta', 'طاء', 'طَاء', 'taa'], ['dha', 'ظاء', 'ظَاء', 'dhaa'], ['ain', 'عين', 'عَيْن', "'ayn"],
  ['ghain', 'غين', 'غَيْن', 'ghayn'], ['fa', 'فاء', 'فَاء', 'faa'], ['qaf', 'قاف', 'قَاف', 'qaaf'],
  ['kaf', 'كاف', 'كَاف', 'kaaf'], ['lam', 'لام', 'لَام', 'laam'], ['mim', 'ميم', 'مِيم', 'miim'],
  ['nun', 'نون', 'نُون', 'nuun'], ['ha2', 'هاء', 'هَاء', 'haa'], ['waw', 'واو', 'وَاو', 'waaw'],
  ['ya', 'ياء', 'يَاء', 'yaa'], ['ta_marbuta', 'تاء مربوطة', 'تَاء مَرْبُوطَة', 'taa marbuuta'],
  ['hamza', 'همزة', 'هَمْزَة', 'hamza'], ['alif_maqsura', 'ألف مقصورة', 'أَلِف مَقْصُورَة', 'alif maqsura'],
] as const;

export const ALPHABET_AUDIO_MSA: AlphabetAudioItem[] = LETTERS.map(([id, displayArabic, audioText, transliteration], index) => {
  const audioPath = `assets/audio/msa/unit-3/alphabet/${index + 1}.mp3`;
  return {
    id,
    index: index + 1,
    displayArabic,
    audioText,
    evalTarget: displayArabic,
    transliteration,
    english: transliteration,
    audioPath,
    audio: getMsaAudio(audioPath),
    voiceId: MSA_VOICE_ID,
    modelId: MSA_MODEL_ID,
  };
});

const MSA_LETTER_NAME_WORDS: Word[] = LETTERS.map(([id, displayArabic, audioText, transliteration], index) => {
  const audioPath = `assets/audio/msa/unit-3/alphabet/${index + 1}.mp3`;
  return {
    arabic: displayArabic,
    displayArabic,
    audioText,
    evalTarget: displayArabic,
    transliteration,
    acceptedTransliterations: msaAccepted(transliteration),
    english: `Arabic letter ${transliteration}`,
    context: 'MSA Unit 3 alphabet',
    audioPath,
    audio: getMsaAudio(audioPath),
    voiceId: MSA_VOICE_ID,
    modelId: MSA_MODEL_ID,
  };
});

export const MSA_WRITING_EXAMPLE_WORDS = makeMsaWords(3, 'writing-examples', [
  ['أهلاً', 'ahlan', 'welcome'], ['بيت', 'bayt', 'house'], ['تمر', 'tamr', 'dates (fruit)'], ['ثعلب', "tha'lab", 'fox'],
  ['جميل', 'jamiil', 'beautiful'], ['حياة', 'hayaah', 'life'], ['خير', 'khayr', 'good'], ['درهم', 'dirham', 'dirham'],
  ['ذهب', 'dhahab', 'gold'], ['رجل', 'rajul', 'man'], ['زيت', 'zayt', 'oil'], ['سيارة', 'sayyaara', 'car'],
  ['شكراً', 'shukran', 'thank you'], ['صباح', 'sabaah', 'morning'], ['ضيف', 'dayf', 'guest'], ['طعام', "ta'aam", 'food'],
  ['ظريف', 'dhariif', 'charming'], ['عين', "'ayn", 'eye'], ['غالي', 'ghaalii', 'expensive'], ['فندق', 'funduq', 'hotel'],
  ['قهوة', 'qahwa', 'coffee'], ['كلمة', 'kalima', 'word'], ['ليلة', 'layla', 'night'], ['ماء', "maa'", 'water'],
  ['نعم', "na'am", 'yes'], ['هنا', 'hunaa', 'here'], ['وقت', 'waqt', 'time'], ['يوم', 'yawm', 'day'],
  ['مدينة', 'madiina', 'city'], ['أمل', 'amal', 'hope'], ['على', "'alaa", 'on', undefined, undefined, 'عَلَىٰ.'],
]);

export const MSA_UNIT3_QUIZ_WORDS: Word[] = [...MSA_LETTER_NAME_WORDS, ...MSA_WRITING_EXAMPLE_WORDS];
