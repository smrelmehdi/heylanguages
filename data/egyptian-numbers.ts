import type { Word } from '../constants/words';

// Egyptian spelling conventions for this module are documented in data/egyptian-style.ts.
const VOICE_ID = 'LXrTqFIgiubkrMkwvOUr';
const MODEL_ID = 'eleven_v3';

const AUDIO_BY_FOLDER: Record<string, any[]> = {
  'numbers-1-5': [
    require('../assets/audio/egyptian/unit-4/numbers-1-5/1.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-1-5/2.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-1-5/3.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-1-5/4.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-1-5/5.mp3'),
  ],
  'numbers-6-10': [
    require('../assets/audio/egyptian/unit-4/numbers-6-10/1.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-6-10/2.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-6-10/3.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-6-10/4.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-6-10/5.mp3'),
  ],
  'numbers-11-20': [
    require('../assets/audio/egyptian/unit-4/numbers-11-20/1.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-11-20/2.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-11-20/3.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-11-20/4.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-11-20/5.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-11-20/6.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-11-20/7.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-11-20/8.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-11-20/9.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-11-20/10.mp3'),
  ],
  'numbers-tens': [
    require('../assets/audio/egyptian/unit-4/numbers-tens/1.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-tens/2.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-tens/3.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-tens/4.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-tens/5.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-tens/6.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-tens/7.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-tens/8.mp3'),
  ],
  'numbers-100-1000': [
    require('../assets/audio/egyptian/unit-4/numbers-100-1000/1.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-100-1000/2.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-100-1000/3.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-100-1000/4.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-100-1000/5.mp3'),
  ],
  'numbers-phone': [
    require('../assets/audio/egyptian/unit-4/numbers-phone/1.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-phone/2.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-phone/3.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-phone/4.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-phone/5.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-phone/6.mp3'),
  ],
  'numbers-prices': [
    require('../assets/audio/egyptian/unit-4/numbers-prices/1.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-prices/2.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-prices/3.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-prices/4.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-prices/5.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-prices/6.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-prices/7.mp3'),
  ],
  'numbers-time': [
    require('../assets/audio/egyptian/unit-4/numbers-time/1.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-time/2.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-time/3.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-time/4.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-time/5.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-time/6.mp3'),
  ],
  'numbers-age': [
    require('../assets/audio/egyptian/unit-4/numbers-age/1.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-age/2.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-age/3.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-age/4.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-age/5.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-age/6.mp3'),
  ],
  'numbers-together': [
    require('../assets/audio/egyptian/unit-4/numbers-together/1.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-together/2.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-together/3.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-together/4.mp3'),
    require('../assets/audio/egyptian/unit-4/numbers-together/5.mp3'),
  ],
};

type Entry = [
  displayArabic: string,
  transliteration: string,
  english: string,
  context: string,
  example?: string,
  exampleTranslation?: string,
  audioText?: string,
  acceptedTransliterations?: string[],
];

function lesson(folder: string, entries: Entry[]): Word[] {
  return entries.map(([displayArabic, transliteration, english, context, example, exampleTranslation, audioText, acceptedTransliterations], index) => ({
    arabic: displayArabic,
    displayArabic,
    audioText: audioText ?? displayArabic,
    evalTarget: displayArabic,
    transliteration,
    acceptedTransliterations: acceptedTransliterations ?? [transliteration],
    english,
    context,
    example,
    exampleTranslation,
    audioPath: `assets/audio/egyptian/unit-4/${folder}/${index + 1}.mp3`,
    audio: AUDIO_BY_FOLDER[folder]?.[index],
    voiceId: VOICE_ID,
    modelId: MODEL_ID,
  }));
}

export const NUMBERS_1_5_WORDS_EG = lesson('numbers-1-5', [
  ['واحد', 'waahid', 'One', '🔢 Numbers', 'شاي واحد لو سمحت', 'One tea please', 'واحد.', ['waahid', 'wahid']],
  ['اتنين', 'itnein', 'Two', '🔢 Numbers', 'اتنين جنيه', 'Two pounds', 'اتنين.', ['itnein', 'itnain']],
  ['تلاتة', 'talaata', 'Three', '🔢 Numbers', 'تلاتة أيام', 'Three days', 'تلاتة.', ['talaata', 'talata']],
  ['أربعة', 'arba’a', 'Four', '🔢 Numbers', 'أربعة أشخاص', 'Four people', 'أربعة.', ['arbaa', 'arba’a']],
  ['خمسة', 'khamsa', 'Five', '🔢 Numbers', 'خمسة دقايق', 'Five minutes', 'خمسة.', ['khamsa']],
]);

export const NUMBERS_6_10_WORDS_EG = lesson('numbers-6-10', [
  ['ستة', 'sitta', 'Six', '🔢 Numbers', 'ستة شهور', 'Six months', 'ستة.', ['sitta']],
  ['سبعة', 'saba’a', 'Seven', '🔢 Numbers', 'سبعة أيام', 'Seven days', 'سبعة.', ['sabaa', 'saba’a']],
  ['تمانية', 'tamaanya', 'Eight', '🔢 Numbers', 'تمانية ساعات', 'Eight hours', 'تمانية.', ['tamaanya', 'tamanya']],
  ['تسعة', 'tis’a', 'Nine', '🔢 Numbers', 'تسعة جنيه', 'Nine pounds', 'تسعة.', ['tisa', 'tis’a']],
  ['عشرة', 'ashara', 'Ten', '🔢 Numbers', 'عشرة دقايق', 'Ten minutes', 'عشرة.', ['ashara', 'ashra']],
]);

export const NUMBERS_11_20_WORDS_EG = lesson('numbers-11-20', [
  ['حداشر', 'hidaashar', 'Eleven', '🔢 Teen numbers', 'حداشر جنيه', 'Eleven pounds', 'حداشر.', ['hidaashar', 'hidashar']],
  ['اتناشر', 'itnaashar', 'Twelve', '🔢 Teen numbers', 'اتناشر شهر', 'Twelve months', 'اتناشر.', ['itnaashar', 'itnashar']],
  ['تلتاشر', 'teltaashar', 'Thirteen', '🔢 Teen numbers', 'تلتاشر يوم', 'Thirteen days', 'تلتاشر.', ['teltaashar', 'tletashar']],
  ['أربعتاشر', "arba'taashar", 'Fourteen', '🔢 Teen numbers', 'أربعتاشر سنة', 'Fourteen years', 'أربعتاشر.', ["arba'taashar", 'arbaataashar', 'arbataashar']],
  ['خمستاشر', 'khamastaashar', 'Fifteen', '🔢 Teen numbers', 'خمستاشر دقيقة', 'Fifteen minutes', 'خمستاشر.', ['khamastaashar', 'khomstaashar']],
  ['ستاشر', 'sittaashar', 'Sixteen', '🔢 Teen numbers', 'ستاشر رقم', 'Sixteen digits', 'ستاشر.', ['sittaashar', 'sittashar']],
  ['سبعتاشر', "saba'taashar", 'Seventeen', '🔢 Teen numbers', 'سبعتاشر جنيه', 'Seventeen pounds', 'سبعتاشر.', ["saba'taashar", 'sabaataashar', 'sabataashar']],
  ['تمنتاشر', 'tamantaashar', 'Eighteen', '🔢 Teen numbers', 'تمنتاشر سنة', 'Eighteen years', 'تمنتاشر.', ['tamantaashar', 'temnetaashar']],
  ['تسعتاشر', "tesa'taashar", 'Nineteen', '🔢 Teen numbers', 'تسعتاشر يوم', 'Nineteen days', 'تسعتاشر.', ["tesa'taashar", "tisa'taashar", 'tesataashar']],
  ['عشرين', 'ishreen', 'Twenty', '🔢 Two tens', 'عشرين جنيه', 'Twenty pounds', 'عشرين.', ['ishreen', 'eishreen']],
]);

export const NUMBERS_TENS_WORDS_EG = lesson('numbers-tens', [
  ['عشرين', 'ishreen', 'Twenty', '🔢 Tens', 'عشرين جنيه', 'Twenty pounds', 'عشرين.', ['ishreen']],
  ['تلاتين', 'talateen', 'Thirty', '🔢 Tens', 'تلاتين سنة', 'Thirty years', 'تلاتين.', ['talateen', 'tlateen']],
  ['أربعين', 'arbaeen', 'Forty', '🔢 Tens', 'أربعين دقيقة', 'Forty minutes', 'أربعين.', ['arbaeen']],
  ['خمسين', 'khamseen', 'Fifty', '🔢 Tens', 'خمسين جنيه', 'Fifty pounds', 'خمسين.', ['khamseen']],
  ['ستين', 'sitteen', 'Sixty', '🔢 Tens', 'ستين ثانية', 'Sixty seconds', 'ستين.', ['sitteen']],
  ['سبعين', 'sabeen', 'Seventy', '🔢 Tens', 'سبعين جنيه', 'Seventy pounds', 'سبعين.', ['sabeen']],
  ['تمانين', 'tamaneen', 'Eighty', '🔢 Tens', 'تمانين كيلو', 'Eighty kilos', 'تمانين.', ['tamaneen', 'temaneen']],
  ['تسعين', 'tiseen', 'Ninety', '🔢 Tens', 'تسعين يوم', 'Ninety days', 'تسعين.', ['tiseen']],
]);

export const NUMBERS_100_1000_WORDS_EG = lesson('numbers-100-1000', [
  ['مية', 'miyya', 'One hundred', '🔢 Big numbers', 'مية جنيه', 'One hundred pounds', 'مية.', ['miyya', 'miya']],
  ['ميتين', 'miteen', 'Two hundred', '🔢 Big numbers', 'ميتين جنيه', 'Two hundred pounds', 'ميتين.', ['miteen', 'miiteen']],
  ['تلتمية', 'tultumiyya', 'Three hundred', '🔢 Big numbers', 'تلتمية جنيه', 'Three hundred pounds', 'تلتمية.', ['tultumiyya', 'tultumiya']],
  ['خمسمية', 'khumsumiyya', 'Five hundred', '🔢 Big numbers', 'خمسمية جنيه', 'Five hundred pounds', 'خمسمية.', ['khumsumiyya', 'khomsomiya']],
  ['ألف', 'alf', 'One thousand', '🔢 Big numbers', 'ألف جنيه', 'One thousand pounds', 'ألف.', ['alf']],
]);

export const NUMBERS_PHONE_WORDS_EG = lesson('numbers-phone', [
  ['رقمك كام؟', "ra'mak kam?", 'What is your number?', '📱 Phone numbers', 'رقمك كام لو سمحت؟', 'What is your number please?', undefined, ["ra'mak kam", 'raamak kam']],
  ['رقمي', "ra'ami", 'My number', '📱 Phone numbers', 'رقمي صفر واحد صفر', 'My number is zero one zero'],
  ['موبايل', 'mobaayil', 'Mobile phone', '📱 Phone numbers', 'رقم الموبايل', 'Mobile number', 'موبايل.', ['mobaayil', 'mobayl', 'mobile']],
  ['اتصل بيا', 'ittisil biya', 'Call me', '📞 Calling', 'اتصل بيا بعدين', 'Call me later'],
  ['ابعتلي رسالة', 'ib’atli risaala', 'Send me a message', '💬 Messaging', 'ابعتلي رسالة لو سمحت', 'Send me a message please', undefined, ['ibatli risaala', 'ibaatli risaala']],
  ['صفر واحد صفر', 'sifr waahid sifr', 'Zero one zero', '📱 Egyptian mobile prefix', 'رقمي صفر واحد صفر', 'My number starts with zero one zero'],
]);

export const NUMBERS_PRICES_WORDS_EG = lesson('numbers-prices', [
  ['بكام؟', 'bikam?', 'How much?', '💰 Prices', 'ده بكام؟', 'How much is this?', 'بكام؟', ['bikam']],
  ['جنيه', 'geneeh', 'Egyptian pound', '💵 Currency', 'عشرة جنيه', 'Ten pounds', 'جنيه.', ['geneeh', 'gineeh']],
  ['فلوس', 'filuus', 'Money', '💵 Money', 'معايا فلوس', 'I have money'],
  ['غالي', 'ghaali', 'Expensive', '💸 Price talk', 'ده غالي شوية', 'This is a bit expensive'],
  ['رخيص', 'rikhiis', 'Cheap', '💰 Price talk', 'ده رخيص', 'This is cheap'],
  ['الحساب كام؟', 'el-hisaab kam?', 'How much is the bill?', '🧾 Paying', 'الحساب كام لو سمحت؟', 'How much is the bill please?', undefined, ['el hisaab kam', 'el-hisaab kam']],
  ['عايز أدفع كاش', 'aayiz adfa’ kaash', 'I want to pay cash', '💵 Payment', 'عايز أدفع كاش', 'I want to pay cash', undefined, ['aayiz adfa kaash', 'ayiz adfa kaash']],
]);

export const NUMBERS_TIME_WORDS_EG = lesson('numbers-time', [
  ['الساعة كام؟', "es-saa'a kam?", 'What time is it?', '⏰ Time', 'الساعة كام دلوقتي؟', 'What time is it now?', undefined, ["es-saa'a kam", 'el saa kam']],
  ['الساعة واحدة', "es-saa'a waHda", "It's one o'clock", '⏰ Time', 'الساعة واحدة دلوقتي', "It's one now"],
  ['الساعة اتنين', "es-saa'a itnein", "It's two o'clock", '⏰ Time', 'الساعة اتنين', "It's two"],
  ['ونص', 'w nuSS', 'And a half', '⏰ Time', 'الساعة تلاتة ونص', "It's three thirty", 'ونص.'],
  ['وربع', 'w rub’', 'And a quarter', '⏰ Time', 'الساعة خمسة وربع', "It's five fifteen", 'وربع.'],
  ['إلا ربع', 'illa rub’', 'Quarter to', '⏰ Time', 'الساعة ستة إلا ربع', "It's quarter to six", 'إلا ربع.'],
]);

export const NUMBERS_AGE_WORDS_EG = lesson('numbers-age', [
  ['عندك كام سنة؟', 'andak kam sana?', 'How old are you?', '🎂 Age', 'عندك كام سنة؟', 'How old are you?'],
  ['عندي عشرين سنة', 'andi ishreen sana', 'I am twenty years old', '🎂 Age', 'عندي عشرين سنة', 'I am twenty years old'],
  ['سنة', 'sana', 'Year', '📅 Time unit', 'سنة واحدة', 'One year', 'سنة.', ['sana']],
  ['سنين', 'siniin', 'Years', '📅 Time unit', 'تلات سنين', 'Three years', 'سنين.', ['siniin']],
  ['أكبر مني', 'akbar minni', 'Older than me', '🎂 Comparing age', 'هو أكبر مني', 'He is older than me'],
  ['أصغر مني', 'asghar minni', 'Younger than me', '🎂 Comparing age', 'هي أصغر مني', 'She is younger than me'],
]);

export const NUMBERS_TOGETHER_WORDS_EG = lesson('numbers-together', [
  ['واحد وعشرين', 'waahid w ishreen', 'Twenty-one', '🔢 Putting numbers together', 'واحد وعشرين جنيه', 'Twenty-one pounds'],
  ['اتنين وتلاتين', 'itnein w talateen', 'Thirty-two', '🔢 Putting numbers together', 'اتنين وتلاتين سنة', 'Thirty-two years'],
  ['خمسة وأربعين', 'khamsa w arbaeen', 'Forty-five', '🔢 Putting numbers together', 'خمسة وأربعين دقيقة', 'Forty-five minutes'],
  ['مية وخمسين', 'miyya w khamseen', 'One hundred fifty', '🔢 Putting numbers together', 'مية وخمسين جنيه', 'One hundred fifty pounds'],
  ['ألف ومية', 'alf w miyya', 'One thousand one hundred', '🔢 Putting numbers together', 'ألف ومية جنيه', 'One thousand one hundred pounds'],
]);

export const EGYPTIAN_UNIT4_AUDIO_TARGETS = [
  NUMBERS_1_5_WORDS_EG,
  NUMBERS_6_10_WORDS_EG,
  NUMBERS_11_20_WORDS_EG,
  NUMBERS_TENS_WORDS_EG,
  NUMBERS_100_1000_WORDS_EG,
  NUMBERS_PHONE_WORDS_EG,
  NUMBERS_PRICES_WORDS_EG,
  NUMBERS_TIME_WORDS_EG,
  NUMBERS_AGE_WORDS_EG,
  NUMBERS_TOGETHER_WORDS_EG,
].flat().map(word => ({
  source: 'egyptian-unit-4',
  text: word.audioText ?? word.displayArabic ?? word.arabic,
  outputPath: word.audioPath,
  voiceId: VOICE_ID,
  modelId: MODEL_ID,
}));
