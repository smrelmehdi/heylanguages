import { makeMsaWords } from './msa-style';

export const GRAMMAR_PRONOUNS_WORDS_MSA = makeMsaWords(5, 'grammar-pronouns', [
  ['أنا طالب', 'anaa taalib', 'I am a student'], ['أنتَ مهندس', 'anta muhandis', 'You are an engineer (male)'],
  ['أنتِ معلمة', 'anti muallima', 'You are a teacher (female)'], ['نحن أصدقاء', 'nahnu asdiqaa', 'We are friends'], ['هم في البيت', 'hum fii al-bayt', 'They are at home'],
], 'Use independent pronouns to identify who performs an action or is being described.');
export const GRAMMAR_THIS_THAT_WORDS_MSA = makeMsaWords(5, 'grammar-this-that', [
  ['هذا كتاب', 'haadhaa kitaab', 'This is a book'], ['هذه سيارة', 'haadhihi sayyaara', 'This is a car'],
  ['هؤلاء طلاب', 'haaulaai tullaab', 'These are students'], ['ذلك مطعم', 'dhaalika matam', 'That is a restaurant'], ['تلك مدرسة', 'tilka madrasa', 'That is a school'],
], 'هذا and هذه point to nearby singular nouns; هؤلاء is used for nearby people in the plural.');
export const GRAMMAR_POSSESSIVES_WORDS_MSA = makeMsaWords(5, 'grammar-possessives', [
  ['هذا كتابي', 'haadhaa kitaabii', 'This is my book'], ['أين هاتفك؟', 'ayna haatifuka?', 'Where is your phone? (addressing a man)'],
  ['هذه سيارته', 'haadhihi sayyaaratuhu', 'This is his car'], ['هذا بيتها', 'haadhaa baytuhaa', 'This is her house'], ['مديرنا هنا', 'mudiirunaa hunaa', 'Our manager is here'],
], 'Possessive suffixes attach to nouns: ـي my, ـك your, ـه his, ـها her, and ـنا our.');
export const GRAMMAR_QUESTIONS_WORDS_MSA = makeMsaWords(5, 'grammar-questions', [
  ['من هذا؟', 'man haadhaa?', 'Who is this?'], ['ماذا تريد؟', 'maadhaa turiid?', 'What do you want?'], ['أين تعمل؟', "ayna ta'mal?", 'Where do you work?'],
  ['متى نلتقي؟', 'mataa naltaqii?', 'When shall we meet?'], ['لماذا تأخرت؟', 'limaadhaa taakhkharta?', 'Why are you late?'], ['كيف أذهب إلى هناك؟', 'kayfa adhhabu ilaa hunaak?', 'How do I get there?'],
], 'Begin questions with a question word such as من, ماذا, أين, متى, لماذا, or كيف.');
export const GRAMMAR_NEGATION_WORDS_MSA = makeMsaWords(5, 'grammar-negation', [
  ['لا أفهم', 'laa afham', 'I do not understand'], ['لست متعبا', "lastu mut'ab", 'I am not tired'],
  ['لم أذهب أمس', 'lam adhhab ams', 'I did not go yesterday'], ['لن أتأخر', 'lan ataakhkhar', 'I will not be late'], ['ليس هنا', 'laysa hunaa', 'It is not here'],
], 'Use لا for a general present negative, ليس for nominal sentences, لم for a past negative, and لن for a future negative.');
export const GRAMMAR_PRESENT_WORDS_MSA = makeMsaWords(5, 'grammar-present', [
  ['أعمل في مكتب', "a'malu fii maktab", 'I work in an office'], ['هي تدرس العربية', "hiya tadrusu al-'arabiyya", 'She studies Arabic.'],
  ['نذهب كل يوم', 'nadhhabu kulla yawm', 'We go every day'], ['يشرب القهوة', 'yashrabu al-qahwa', 'He drinks coffee'], ['يكتبون رسالة', 'yaktubuuna risaala', 'They write a message'],
], 'Present-tense verbs change with the subject; the subject pronoun may be stated when it adds clarity.');
export const GRAMMAR_PAST_WORDS_MSA = makeMsaWords(5, 'grammar-past', [
  ['ذهبت إلى العمل', 'dhahabtu ilaa al-amal', 'I went to work'], ['شربت القهوة', 'sharibtu al-qahwa', 'I drank coffee'],
  ['وصلت أمس', 'wasaltu ams', 'I arrived yesterday'], ['تحدثنا طويلاً', 'tahaddathnaa tawiilan', 'We spoke for a long time'], ['انتهى الاجتماع', 'intahaa al-ijtimaa', 'The meeting ended'],
], 'Past-tense endings show who completed the action, as in ذهبت and تحدثنا.');
export const GRAMMAR_FUTURE_WORDS_MSA = makeMsaWords(5, 'grammar-future', [
  ['سأذهب غداً', 'saadhhabu ghadan', 'I will go tomorrow'], ['سأتصل بك', 'saattasilu bik', 'I will call you'],
  ['سنلتقي لاحقاً', 'sanaltaqii laahiqan', 'We will meet later'], ['سيبدأ الاجتماع قريباً', "sayabda'u al-ijtimaa' qariiban", 'The meeting will start soon'], ['سأساعدك', "sa'usaa'iduk", 'I will help you'],
], 'Attach سـ to a present verb for the future; سوف is also valid but is not the main beginner form here.');
export const GRAMMAR_ADJECTIVES_WORDS_MSA = makeMsaWords(5, 'grammar-adjectives', [
  ['كتاب جديد', 'kitaab jadiid', 'a new book'], ['سيارة جديدة', 'sayyaara jadiida', 'a new car'], ['بيت كبير', 'bayt kabiir', 'a big house'],
  ['غرفة صغيرة', 'ghurfa saghiira', 'a small room'], ['الطلاب مجتهدون', 'at-tullaabu mujtahiduuna', 'The students are hardworking'],
], 'An adjective follows its noun and agrees with it in gender and number.');
export const GRAMMAR_PREPOSITIONS_WORDS_MSA = makeMsaWords(5, 'grammar-prepositions', [
  ['الكتاب على الطاولة', 'al-kitaabu alaa at-taawila', 'The book is on the table'], ['الهاتف في الحقيبة', 'al-haatifu fii al-haqiiba', 'The phone is in the bag'],
  ['المصرف بجانب الفندق', 'al-masrifu bijaanibi al-funduq', 'The bank is beside the hotel'], ['السيارة أمام البيت', 'as-sayyaaratu amaama al-bayt', 'The car is in front of the house'], ['المقهى خلف المحطة', 'al-maqhaa khalfa al-mahatta', 'The café is behind the station'],
], 'Prepositions such as في, على, بجانب, أمام, and خلف show location and relationships.');
export const GRAMMAR_SENTENCES_WORDS_MSA = makeMsaWords(5, 'grammar-sentences', [
  ['أنا أتعلم العربية', 'anaa ataallamu al-arabiyya', 'I am learning Arabic'], ['يعمل أخي في المستشفى', 'yamalu akhii fii al-mustashfaa', 'My brother works at the hospital'],
  ['نريد أن نذهب الآن', 'nuriidu an nadhhaba al-aan', 'We want to go now'], ['هل يمكنك أن تكرر؟', 'hal yumkinuka an tukarrir?', 'Can you repeat?'], ['سأزور صديقي غداً', 'saazuuru sadiiqii ghadan', 'I will visit my friend tomorrow'],
], 'Build clear sentences with a subject and predicate, or begin with a verb when the action is the focus.');

export const MSA_UNIT5_LESSONS = [
  ['grammar-pronouns', 'Pronouns', GRAMMAR_PRONOUNS_WORDS_MSA], ['grammar-this-that', 'This & That', GRAMMAR_THIS_THAT_WORDS_MSA],
  ['grammar-possessives', 'Possessives', GRAMMAR_POSSESSIVES_WORDS_MSA], ['grammar-questions', 'Asking Questions', GRAMMAR_QUESTIONS_WORDS_MSA],
  ['grammar-negation', 'Negation', GRAMMAR_NEGATION_WORDS_MSA], ['grammar-present', 'Present Tense', GRAMMAR_PRESENT_WORDS_MSA],
  ['grammar-past', 'Past Tense', GRAMMAR_PAST_WORDS_MSA], ['grammar-future', 'Future Tense', GRAMMAR_FUTURE_WORDS_MSA],
  ['grammar-adjectives', 'Adjectives', GRAMMAR_ADJECTIVES_WORDS_MSA], ['grammar-prepositions', 'Prepositions', GRAMMAR_PREPOSITIONS_WORDS_MSA],
  ['grammar-sentences', 'Building Sentences', GRAMMAR_SENTENCES_WORDS_MSA],
] as const;
