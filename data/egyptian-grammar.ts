import type { Word } from '../constants/words';

// Egyptian spelling conventions for this module are documented in data/egyptian-style.ts.
const VOICE_ID = 'LXrTqFIgiubkrMkwvOUr';
const MODEL_ID = 'eleven_v3';

const AUDIO_BY_FOLDER: Record<string, any[]> = {
  'grammar-pronouns': [
    require('../assets/audio/egyptian/unit-5/grammar-pronouns/1.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-pronouns/2.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-pronouns/3.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-pronouns/4.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-pronouns/5.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-pronouns/6.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-pronouns/7.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-pronouns/8.mp3'),
  ],
  'grammar-this-that': [
    require('../assets/audio/egyptian/unit-5/grammar-this-that/1.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-this-that/2.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-this-that/3.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-this-that/4.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-this-that/5.mp3'),
  ],
  'grammar-possessives': [
    require('../assets/audio/egyptian/unit-5/grammar-possessives/1.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-possessives/2.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-possessives/3.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-possessives/4.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-possessives/5.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-possessives/6.mp3'),
  ],
  'grammar-questions': [
    require('../assets/audio/egyptian/unit-5/grammar-questions/1.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-questions/2.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-questions/3.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-questions/4.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-questions/5.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-questions/6.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-questions/7.mp3'),
  ],
  'grammar-negation': [
    require('../assets/audio/egyptian/unit-5/grammar-negation/1.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-negation/2.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-negation/3.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-negation/4.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-negation/5.mp3'),
  ],
  'grammar-present': [
    require('../assets/audio/egyptian/unit-5/grammar-present/1.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-present/2.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-present/3.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-present/4.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-present/5.mp3'),
  ],
  'grammar-past': [
    require('../assets/audio/egyptian/unit-5/grammar-past/1.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-past/2.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-past/3.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-past/4.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-past/5.mp3'),
  ],
  'grammar-future': [
    require('../assets/audio/egyptian/unit-5/grammar-future/1.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-future/2.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-future/3.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-future/4.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-future/5.mp3'),
  ],
  'grammar-adjectives': [
    require('../assets/audio/egyptian/unit-5/grammar-adjectives/1.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-adjectives/2.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-adjectives/3.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-adjectives/4.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-adjectives/5.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-adjectives/6.mp3'),
  ],
  'grammar-prepositions': [
    require('../assets/audio/egyptian/unit-5/grammar-prepositions/1.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-prepositions/2.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-prepositions/3.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-prepositions/4.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-prepositions/5.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-prepositions/6.mp3'),
  ],
  'grammar-sentences': [
    require('../assets/audio/egyptian/unit-5/grammar-sentences/1.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-sentences/2.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-sentences/3.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-sentences/4.mp3'),
    require('../assets/audio/egyptian/unit-5/grammar-sentences/5.mp3'),
  ],
};

type Entry = [
  displayArabic: string,
  transliteration: string,
  english: string,
  context: string,
  example?: string,
  exampleTranslation?: string,
  explanation?: string,
  contrastNote?: string,
  audioText?: string,
  acceptedTransliterations?: string[],
];

function lesson(folder: string, entries: Entry[]): Word[] {
  return entries.map(([displayArabic, transliteration, english, context, example, exampleTranslation, explanation, contrastNote, audioText, acceptedTransliterations], index) => ({
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
    explanation,
    contrastNote,
    audioPath: `assets/audio/egyptian/unit-5/${folder}/${index + 1}.mp3`,
    audio: AUDIO_BY_FOLDER[folder]?.[index],
    voiceId: VOICE_ID,
    modelId: MODEL_ID,
  }));
}

export const GRAMMAR_PRONOUNS_WORDS_EG = lesson('grammar-pronouns', [
  ['أنا', 'ana', 'I / me', '👤 Pronouns', 'أنا من مصر', 'I am from Egypt', 'Use أنا for yourself.', 'Same spelling as MSA, but normal Egyptian speech is lighter.', 'أنا.', ['ana']],
  ['إنت', 'inta', 'You masculine', '👥 Pronouns', 'إنت كويس؟', 'Are you okay?', 'Use إنت for one male listener.', 'Egyptian uses إنت instead of MSA أنتَ.', 'إنت.', ['inta', 'enta']],
  ['إنتي', 'inti', 'You feminine', '👥 Pronouns', 'إنتي كويسة؟', 'Are you okay? (to a woman)', 'Use إنتي for one female listener.', 'The final ي marks feminine address.', 'إنتي.', ['inti', 'enti']],
  ['هو', 'huwwa', 'He', '👤 Pronouns', 'هو شغال', 'He is working', 'Use هو for he.', undefined, 'هو.', ['huwwa', 'howwa']],
  ['هي', 'hiyya', 'She', '👤 Pronouns', 'هي ساكنة هنا', 'She lives here', 'Use هي for she.', undefined, 'هي.', ['hiyya', 'heyya']],
  ['إحنا', 'ihna', 'We', '👥 Pronouns', 'إحنا جاهزين', 'We are ready', 'Use إحنا for we.', 'Egyptian commonly says إحنا, not نحن.', 'إحنا.', ['ihna', 'eHna', 'ehna']],
  ['إنتوا', 'intu', 'You plural', '👥 Pronouns', 'إنتوا منين؟', 'Where are you all from?', 'Use إنتوا for more than one listener.', undefined, 'إنتوا.', ['intu', 'entoo']],
  ['هما', 'humma', 'They', '👥 Pronouns', 'هما في البيت', 'They are at home', 'Use هما for they in beginner Egyptian.', 'This keeps the written form close to everyday Egyptian pronunciation.', 'هما.', ['humma', 'homma']],
]);

export const GRAMMAR_THIS_THAT_WORDS_EG = lesson('grammar-this-that', [
  ['ده', 'da', 'This / that masculine', '👉 Demonstratives', 'ده كتاب', 'This is a book', 'Use ده for masculine nouns and many general things.', 'Egyptian uses ده instead of Gulf هذا or MSA هذا.', 'ده.', ['da', 'deh']],
  ['دي', 'di', 'This / that feminine', '👉 Demonstratives', 'دي عربية', 'This is a car', 'Use دي for feminine nouns.', 'Egyptian دي replaces MSA هذه in speech.', 'دي.', ['di', 'dee']],
  ['دول', 'dool', 'These / those', '👉 Demonstratives', 'دول صحابي', 'These are my friends', 'Use دول for plural nouns.', undefined, 'دول.', ['dool', 'dol']],
  ['ده كويس', 'da kwayyis', 'This is good', '✅ Useful sentence', 'ده كويس جداً', 'This is very good', 'A simple sentence with ده plus adjective.', undefined],
  ['دي غالية', 'di ghaalia', 'This is expensive', '💸 Useful sentence', 'دي غالية شوية', 'This is a bit expensive', 'Use feminine adjective with دي when natural.', undefined],
]);

export const GRAMMAR_POSSESSIVES_WORDS_EG = lesson('grammar-possessives', [
  ['كتابي', 'kitaabi', 'My book', '📚 Possessives', 'ده كتابي', 'This is my book', 'Add ـي for my.', 'Egyptian uses possessive endings instead of separate my/your words.', 'كتابي.', ['kitaabi']],
  ['كتابك', 'kitaabak', 'Your book', '📚 Possessives', 'فين كتابك؟', 'Where is your book?', 'ـك can mean your for a male listener.', undefined],
  ['كتابك', 'kitaabik', 'Your book feminine', '📚 Possessives', 'ده كتابك؟', 'Is this your book? (to a woman)', 'The vowel changes for feminine address.', undefined, 'كتابِك.'],
  ['كتابه', 'kitaabu', 'His book', '📚 Possessives', 'ده كتابه', 'This is his book', 'ـه is often pronounced u in Egyptian.', 'MSA reads it more formally as hu/hi depending context.'],
  ['كتابها', 'kitaabha', 'Her book', '📚 Possessives', 'كتابها هنا', 'Her book is here', 'Use ـها for her.', undefined],
  ['بيتنا', 'beitna', 'Our house', '🏠 Possessives', 'بيتنا قريب', 'Our house is close', 'Use ـنا for our.', undefined],
]);

export const GRAMMAR_QUESTIONS_WORDS_EG = lesson('grammar-questions', [
  ['إيه؟', 'eih?', 'What?', '❓ Questions', 'ده إيه؟', 'What is this?', 'Use إيه for what.', 'Egyptian uses إيه, not Gulf شو or MSA ماذا.', 'إيه؟', ['eih', 'eh']],
  ['مين؟', 'miin?', 'Who?', '❓ Questions', 'مين ده؟', 'Who is this?', 'Use مين for who.', undefined, 'مين؟', ['miin', 'meen']],
  ['فين؟', 'fein?', 'Where?', '❓ Questions', 'الحمام فين؟', 'Where is the bathroom?', 'Use فين for where.', undefined, 'فين؟', ['fein', 'fayn']],
  ['إمتى؟', 'imta?', 'When?', '❓ Questions', 'إمتى نروح؟', 'When do we go?', 'Use إمتى for when.', undefined, 'إمتى؟', ['imta', 'emta']],
  ['ليه؟', 'leih?', 'Why?', '❓ Questions', 'ليه كده؟', 'Why like that?', 'Use ليه for why.', undefined, 'ليه؟', ['leih', 'leh']],
  ['إزاي؟', 'izzay?', 'How?', '❓ Questions', 'أروح إزاي؟', 'How do I go?', 'Use إزاي for how.', 'Keep this Egyptian; do not pronounce it like MSA.', 'إزاي؟', ['izzay', 'ezzay', 'ezay']],
  ['كام؟', 'kam?', 'How many / how much?', '❓ Questions', 'بكام ده؟', 'How much is this?', 'Use كام for numbers and prices.', undefined, 'كام؟', ['kam']],
]);

export const GRAMMAR_NEGATION_WORDS_EG = lesson('grammar-negation', [
  ['مش', 'mish', 'Not', '🚫 Negation', 'أنا مش فاهم', "I don't understand", 'Use مش before adjectives, nouns, and many simple phrases.', 'Egyptian uses مش very often; Gulf/MSA patterns differ.', 'مش.', ['mish', 'mesh']],
  ['ما أعرفش', "ma a'rafsh", "I don't know", '🚫 Negation', 'ما أعرفش فين', "I don't know where", 'Many Egyptian verbs wrap with ما...ش.', 'This is the explicit beginner spelling for the Egyptian ما...ش pattern.', undefined, ["ma a'rafsh", 'ma arafsh', 'maarafsh']],
  ['مفيش', 'mafiish', 'There is no / none', '🚫 Negation', 'مفيش مشكلة', 'No problem', 'Use مفيش for there is not.', undefined, undefined, ['mafiish', 'mafesh']],
  ['ما ينفعش', "ma yinfa'sh", 'It is not possible', '🚫 Negation', 'ما ينفعش دلوقتي', 'It is not possible now', 'A common Egyptian fixed form with explicit beginner spacing.', undefined, undefined, ["ma yinfa'sh", 'ma yinfaash', 'mayinfaash', 'mayenfaash']],
  ['مش عايز', 'mish aayiz', "I don't want", '🚫 Negation', 'مش عايز شاي', "I don't want tea", 'Use مش before عايز.', undefined],
]);

export const GRAMMAR_PRESENT_WORDS_EG = lesson('grammar-present', [
  ['أنا بروح', 'ana baruuh', 'I go / I am going', '🏃 Present tense', 'أنا بروح الشغل', 'I go to work', 'Egyptian present commonly adds بـ before the verb.', 'This بـ is a key Egyptian marker.'],
  ['إنت بتروح', 'inta bitruuh', 'You go', '🏃 Present tense', 'إنت بتروح فين؟', 'Where are you going?', 'Use بتـ with you.', undefined, undefined, ['inta bitruuh', 'enta betrooh']],
  ['هو بيروح', 'huwwa biruuh', 'He goes', '🏃 Present tense', 'هو بيروح البيت', 'He goes home', 'Use بيـ with he.', undefined],
  ['هي بتروح', 'hiyya bitruuh', 'She goes', '🏃 Present tense', 'هي بتروح الجامعة', 'She goes to university', 'Use بتـ with she.', undefined],
  ['إحنا بنروح', 'ihna binruuh', 'We go', '🏃 Present tense', 'إحنا بنروح سوا', 'We go together', 'Use بنـ with we.', undefined],
]);

export const GRAMMAR_PAST_WORDS_EG = lesson('grammar-past', [
  ['أنا رحت', 'ana ruht', 'I went', '⏪ Past tense', 'أنا رحت البيت', 'I went home', 'Past verbs do not use بـ.', 'Egyptian past is direct and short.'],
  ['إنت رحت', 'inta ruht', 'You went', '⏪ Past tense', 'إنت رحت فين؟', 'Where did you go?', 'Same form often works for I/you in context.', undefined, undefined, ['inta ruht', 'enta roht']],
  ['هو راح', 'huwwa raah', 'He went', '⏪ Past tense', 'هو راح الشغل', 'He went to work', 'Use راح for he went.', undefined],
  ['هي راحت', 'hiyya raahit', 'She went', '⏪ Past tense', 'هي راحت البيت', 'She went home', 'Feminine often ends with ـت.', undefined],
  ['إحنا روحنا', 'ihna ruhna', 'We went', '⏪ Past tense', 'إحنا روحنا بدري', 'We went early', 'Use ـنا for we.', undefined],
]);

export const GRAMMAR_FUTURE_WORDS_EG = lesson('grammar-future', [
  ['هروح', 'haruuh', 'I will go', '⏩ Future', 'هروح البيت', 'I will go home', 'Use هـ before the verb for future.', 'The app uses هـ as the default Egyptian future marker.', undefined, ['haruuh', 'harooh']],
  ['هتروح', 'hatruuh', 'You will go', '⏩ Future', 'هتروح فين؟', 'Where will you go?', 'Use هتـ with you.', undefined],
  ['هيروح', 'hayruuh', 'He will go', '⏩ Future', 'هو هيروح بكرة', 'He will go tomorrow', 'Use هيـ with he.', undefined],
  ['هنروح', 'hanruuh', 'We will go', '⏩ Future', 'هنروح سوا', 'We will go together', 'Use هنـ with we.', undefined],
  ['هنتكلم', 'hantkallim', 'We will talk', '⏩ Future', 'هنتكلم بعدين', 'We will talk later', 'A useful future phrase.', undefined],
]);

export const GRAMMAR_ADJECTIVES_WORDS_EG = lesson('grammar-adjectives', [
  ['كويس', 'kwayyis', 'Good masculine', '😊 Adjectives', 'الأكل كويس', 'The food is good', 'Many masculine adjectives use the base form.', undefined],
  ['كويسة', 'kwayyisa', 'Good feminine', '😊 Adjectives', 'القهوة كويسة', 'The coffee is good', 'Feminine adjectives often add ـة.', undefined],
  ['كبير', 'kibiir', 'Big masculine', '📏 Adjectives', 'البيت كبير', 'The house is big', 'Masculine form.', undefined],
  ['كبيرة', 'kibiira', 'Big feminine', '📏 Adjectives', 'العربية كبيرة', 'The car is big', 'Feminine form.', undefined],
  ['تعبان', 'ta’baan', 'Tired masculine', '😴 Adjectives', 'أنا تعبان', 'I am tired', 'Common feeling adjective.', undefined, undefined, ['taabaan', 'ta’baan']],
  ['تعبانة', 'ta’baana', 'Tired feminine', '😴 Adjectives', 'أنا تعبانة', 'I am tired (female speaker)', 'Feminine form for female speaker.', undefined],
]);

export const GRAMMAR_PREPOSITIONS_WORDS_EG = lesson('grammar-prepositions', [
  ['في', 'fi', 'In / at', '📍 Prepositions', 'أنا في البيت', 'I am at home', 'Use في for in or at.', undefined, 'في.', ['fi', 'fee']],
  ['على', 'ala', 'On / on top of', '📍 Prepositions', 'الكتاب على الترابيزة', 'The book is on the table', 'Use على for on.', undefined, 'على.', ['ala']],
  ['من', 'min', 'From', '📍 Prepositions', 'أنا من مصر', 'I am from Egypt', 'Use من for from.', undefined, 'من.', ['min']],
  ['لـ', 'li', 'To / for', '📍 Prepositions', 'رايح للقاهرة', 'Going to Cairo', 'Often attached to the next word.', 'Egyptian often says لـ where English says to/for.', 'لِـ.', ['li', 'le']],
  ['مع', 'ma’a', 'With', '📍 Prepositions', 'أنا مع صاحبي', 'I am with my friend', 'Use مع for with.', undefined, 'مع.', ['maa', 'ma’a']],
  ['جنب', 'ganb', 'Next to', '📍 Prepositions', 'جنب البنك', 'Next to the bank', 'Very common location word.', undefined, 'جنب.', ['ganb', 'gamb']],
]);

export const GRAMMAR_SENTENCES_WORDS_EG = lesson('grammar-sentences', [
  ['أنا عايز قهوة', 'ana aayiz ahwa', 'I want coffee', '🧱 Sentences', 'أنا عايز قهوة لو سمحت', 'I want coffee please', 'Simple order: subject + want + noun.', 'Egyptian uses عايز for masculine/default speaker.', undefined, ['ana aayiz ahwa', 'ana ayiz ahwa']],
  ['أنا عايزة قهوة', 'ana aayza ahwa', 'I want coffee (female speaker)', '🧱 Sentences', 'أنا عايزة قهوة لو سمحت', 'I want coffee please', 'Use عايزة for female speaker.', undefined],
  ['هو في البيت', 'huwwa fi el-beit', 'He is at home', '🧱 Sentences', 'هو في البيت دلوقتي', 'He is at home now', 'No verb “to be” is needed in present simple sentences.', undefined],
  ['العربية دي كبيرة شوية', 'el-arabeyya di kibiira shwayya', 'This car is a bit big', '🧱 Sentences', 'العربية دي كبيرة شوية', 'This car is a bit big.', 'Noun + demonstrative + adjective sounds natural in Egyptian.', undefined],
  ['إحنا هنروح بكرة', 'ihna hanruuh bukra', 'We will go tomorrow', '🧱 Sentences', 'إحنا هنروح بكرة الصبح', 'We will go tomorrow morning', 'Future marker هـ/هنـ plus verb.', undefined],
]);

export const EGYPTIAN_UNIT5_AUDIO_TARGETS = [
  GRAMMAR_PRONOUNS_WORDS_EG,
  GRAMMAR_THIS_THAT_WORDS_EG,
  GRAMMAR_POSSESSIVES_WORDS_EG,
  GRAMMAR_QUESTIONS_WORDS_EG,
  GRAMMAR_NEGATION_WORDS_EG,
  GRAMMAR_PRESENT_WORDS_EG,
  GRAMMAR_PAST_WORDS_EG,
  GRAMMAR_FUTURE_WORDS_EG,
  GRAMMAR_ADJECTIVES_WORDS_EG,
  GRAMMAR_PREPOSITIONS_WORDS_EG,
  GRAMMAR_SENTENCES_WORDS_EG,
].flat().map(word => ({
  source: 'egyptian-unit-5',
  text: word.audioText ?? word.displayArabic ?? word.arabic,
  outputPath: word.audioPath,
  voiceId: VOICE_ID,
  modelId: MODEL_ID,
}));
