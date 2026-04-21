export interface Word {
  arabic: string;
  transliteration: string;
  english: string;
  context: string;
  example?: string;
  exampleTranslation?: string;
  audio?: any;
}

export const BASIC_WORDS: Word[] = [
  { arabic: 'صَبَاح',       transliteration: 'sabaah',        english: 'Morning',           context: '☀️ Starting the day',       audio: require('../assets/audio/basic-words/1.mp3') },
  { arabic: 'قَهْوَة',      transliteration: 'qahwa',         english: 'Coffee',            context: '☕ Morning in Dubai',        example: 'أَبِي قَهْوَة',          exampleTranslation: 'I want coffee',              audio: require('../assets/audio/basic-words/2.mp3') },
  { arabic: 'بَيْت',        transliteration: 'bayt',          english: 'House / Home',      context: '🏠 Where you live',          example: 'هَذَا بَيْتِي',          exampleTranslation: 'This is my home',            audio: require('../assets/audio/basic-words/3.mp3') },
  { arabic: 'سَيَّارَة',    transliteration: 'sayyaara',      english: 'Car',               context: '🚗 Getting around',          example: 'سَيَّارَتِي هِنَا',      exampleTranslation: 'My car is here',             audio: require('../assets/audio/basic-words/4.mp3') },
  { arabic: 'تَاكْسِي',    transliteration: 'taxi',          english: 'Taxi',              context: '🚕 Getting around Dubai',    example: 'أَبِي تَاكْسِي',         exampleTranslation: 'I want a taxi',              audio: require('../assets/audio/basic-words/5.mp3') },
  { arabic: 'شَارِع',       transliteration: "shaari'",       english: 'Street / Road',     context: '🗺️ Finding your way',                                                                                          audio: require('../assets/audio/basic-words/6.mp3') },
  { arabic: 'أَنَا',        transliteration: 'ana',           english: 'I / Me',            context: '👤 Talking about yourself',  example: 'أَنَا مِن اَلْمَغْرِب', exampleTranslation: 'I am from Morocco',          audio: require('../assets/audio/basic-words/7.mp3') },
  { arabic: 'أَنْتَ',       transliteration: 'anta',          english: 'You',               context: '👥 Talking to someone',      example: 'أَنْتَ زَيْن',           exampleTranslation: 'You are good',               audio: require('../assets/audio/basic-words/8.mp3') },
  { arabic: 'صَدِيق',       transliteration: 'sadiiq',        english: 'Friend',            context: '🤝 People you know',         example: 'هُوَ صَدِيقِي',          exampleTranslation: 'He is my friend',            audio: require('../assets/audio/basic-words/9.mp3') },
  { arabic: 'نَعَم',        transliteration: "na'am",         english: 'Yes',               context: '✅ Agreeing',                example: 'نَعَم، صَحّ',            exampleTranslation: 'Yes, correct',               audio: require('../assets/audio/basic-words/10.mp3') },
  { arabic: 'لَا',          transliteration: 'la',            english: 'No',                context: '❌ Disagreeing',              example: 'لَا، شُكْراً',           exampleTranslation: 'No, thank you',              audio: require('../assets/audio/basic-words/11.mp3') },
  { arabic: 'شُكْراً',      transliteration: 'shukran',       english: 'Thank you',         context: '🙏 Being polite',            example: 'شُكْراً جَزِيلاً',       exampleTranslation: 'Thank you very much',        audio: require('../assets/audio/basic-words/12.mp3') },
  { arabic: 'مِن فَضْلَك',  transliteration: 'min fadlak',    english: 'Please',            context: '🙏 Being polite',            example: 'مَاء مِن فَضْلَك',       exampleTranslation: 'Water please',               audio: require('../assets/audio/basic-words/13.mp3') },
  { arabic: 'مَاء',         transliteration: "maa'",          english: 'Water',             context: '💧 Essential words',         example: 'أَبِي مَاء',             exampleTranslation: 'I want water',               audio: require('../assets/audio/basic-words/14.mp3') },
  { arabic: 'أَكْل',        transliteration: 'akl',           english: 'Food',              context: '🍽️ Eating in Dubai',        example: 'اَلْأَكْل زَيْن',        exampleTranslation: 'The food is good',           audio: require('../assets/audio/basic-words/15.mp3') },
  { arabic: 'مَطْعَم',      transliteration: "mat'am",        english: 'Restaurant',        context: '🍽️ Eating out',             example: 'وَيْن اَلْمَطْعَم؟',     exampleTranslation: 'Where is the restaurant?',   audio: require('../assets/audio/basic-words/16.mp3') },
  { arabic: 'وَاحِد',       transliteration: 'waahid',        english: 'One',               context: '🔢 Numbers',                 example: 'وَاحِد قَهْوَة',         exampleTranslation: 'One coffee',                 audio: require('../assets/audio/basic-words/17.mp3') },
  { arabic: 'اِثْنَيْن',    transliteration: 'ithnayn',       english: 'Two',               context: '🔢 Numbers',                 example: 'اِثْنَيْن دِرْهَم',      exampleTranslation: 'Two dirhams',                audio: require('../assets/audio/basic-words/18.mp3') },
  { arabic: 'زَيْن',        transliteration: 'zain',          english: 'Good / Fine',       context: '😊 Feelings (Gulf)',         example: 'كُلّ شَيْ زَيْن',        exampleTranslation: 'Everything is good',         audio: require('../assets/audio/basic-words/19.mp3') },
  { arabic: 'تَعْبَان',     transliteration: "ta'baan",       english: 'Tired',             context: '😴 How you feel',            example: 'أَنَا تَعْبَان اَلْيَوْم', exampleTranslation: 'I am tired today',           audio: require('../assets/audio/basic-words/20.mp3') },
];

export const GREETINGS_WORDS: Word[] = [
  { arabic: 'مَرْحَبَا',              transliteration: 'marhaba',                  english: 'Hello / Hi',              context: '👋 The basics',             example: 'مَرْحَبَا، كَيْفَ حَالَك؟',              exampleTranslation: 'Hello, how are you?',             audio: require('../assets/audio/greetings/1.mp3') },
  { arabic: 'أَهْلاً',               transliteration: 'ahlan',                    english: 'Welcome / Hi',            context: '👋 Warm greeting',          example: 'أَهْلاً وَسَهْلاً',                       exampleTranslation: 'Welcome!',                        audio: require('../assets/audio/greetings/2.mp3') },
  { arabic: 'اَلسَّلَامُ عَلَيْكُم', transliteration: "as-salaamu 'alaykum",      english: 'Peace be upon you',       context: '🕌 Islamic greeting',       example: 'اَلسَّلَامُ عَلَيْكُم يَا صَدِيقِي',     exampleTranslation: 'Peace be upon you my friend',     audio: require('../assets/audio/greetings/3.mp3') },
  { arabic: 'وَعَلَيْكُم اَلسَّلَام', transliteration: "wa 'alaykum as-salaam",   english: 'And upon you peace',      context: '🕌 Reply to salam',         example: 'وَعَلَيْكُم اَلسَّلَامُ وَرَحْمَةُ اَللَّهِ', exampleTranslation: 'And upon you peace and mercy',   audio: require('../assets/audio/greetings/4.mp3') },
  { arabic: 'كَيْفَ حَالَك؟',        transliteration: 'kayf haalak?',             english: 'How are you?',            context: '😊 Asking someone',         example: 'كَيْفَ حَالَك اَلْيَوْم؟',              exampleTranslation: 'How are you today?',              audio: require('../assets/audio/greetings/5.mp3') },
  { arabic: 'بِخَيْر',               transliteration: 'bikhair',                  english: 'Fine / Good',             context: '😊 Replying',               example: 'أَنَا بِخَيْر، شُكْراً',                  exampleTranslation: 'I am fine, thank you',            audio: require('../assets/audio/greetings/6.mp3') },
  { arabic: 'اَلْحَمْدُ لِلَّهِ',    transliteration: 'al-hamdu lillah',           english: 'Praise God / Thank God',  context: '🙏 Gulf reply',             example: 'اَلْحَمْدُ لِلَّهِ، زَيْن',              exampleTranslation: 'Thank God, good',                 audio: require('../assets/audio/greetings/7.mp3') },
  { arabic: 'صَبَاح اَلْخَيْر',      transliteration: 'sabaah al-khair',          english: 'Good morning',            context: '☀️ Morning greeting',       example: 'صَبَاح اَلْخَيْر يَا أُسْتَاذ',          exampleTranslation: 'Good morning teacher',            audio: require('../assets/audio/greetings/8.mp3') },
  { arabic: 'صَبَاح اَلنُّور',       transliteration: 'sabaah al-nuur',           english: 'Morning of light',        context: '☀️ Reply to good morning',  example: 'صَبَاح اَلنُّور وِيَّاكَ',               exampleTranslation: 'Morning of light to you too',    audio: require('../assets/audio/greetings/9.mp3') },
  { arabic: 'مَسَاء اَلْخَيْر',      transliteration: "masaa' al-khair",          english: 'Good evening',            context: '🌙 Evening greeting',       example: 'مَسَاء اَلْخَيْر يَا جَمَاعَة',         exampleTranslation: 'Good evening everyone',           audio: require('../assets/audio/greetings/10.mp3') },
  { arabic: 'تِشَرَّفْنَا',          transliteration: 'tisharrafna',              english: 'Honored to meet you',     context: '🤝 First meeting',          example: 'تِشَرَّفْنَا بِمَعْرِفَتَك',             exampleTranslation: 'Honored to know you',             audio: require('../assets/audio/greetings/11.mp3') },
  { arabic: 'مَعَ السَّلَامَة',       transliteration: "ma'a as-salaama",          english: 'Goodbye',                 context: '👋 Saying bye',             example: 'مَعَ السَّلَامَة، إِلَى اَللِّقَاء',     exampleTranslation: 'Goodbye, until we meet',          audio: require('../assets/audio/greetings/12.mp3') },
  { arabic: 'اَللَّهُ يُسَلِّمَكَ',  transliteration: 'allah yisallimak',          english: 'May God keep you safe',   context: '👋 Gulf goodbye',           example: 'اَللَّهُ يُسَلِّمَكَ يَا أَخِي',         exampleTranslation: 'May God keep you safe brother',   audio: require('../assets/audio/greetings/13.mp3') },
  { arabic: 'يَلَّا',                transliteration: 'yalla',                    english: "Let's go / Come on",      context: '🏃 Gulf expression',        example: 'يَلَّا نْرُوح',                           exampleTranslation: "Let's go",                        audio: require('../assets/audio/greetings/14.mp3') },
  { arabic: 'إِن شَاء اَللَّه',      transliteration: "in shaa' allah",           english: 'God willing',             context: '🙏 Most used phrase',       example: 'بُكْرَة إِن شَاء اَللَّه',               exampleTranslation: 'Tomorrow God willing',            audio: require('../assets/audio/greetings/15.mp3') },
];

export const INTRO_WORDS: Word[] = [
  { arabic: 'اِسْمِي',     transliteration: 'ismi',          english: 'My name is',        context: '👤 Introducing yourself', example: 'اِسْمِي مُحَمَّد',             exampleTranslation: 'My name is Mohammed',        audio: require('../assets/audio/intro/1.mp3') },
  { arabic: 'أَنَا مِن',   transliteration: 'ana min',       english: 'I am from',         context: '🌍 Your origin',          example: 'أَنَا مِن اَلْمَغْرِب',       exampleTranslation: 'I am from Morocco',          audio: require('../assets/audio/intro/2.mp3') },
  { arabic: 'عُمْرِي',     transliteration: 'umri',           english: 'My age is',         context: '🎂 Your age',             example: 'عُمْرِي ثَلَاثِين سَنَة',     exampleTranslation: 'My age is thirty years',     audio: require('../assets/audio/intro/3.mp3') },
  { arabic: 'أَسْكُن فِي', transliteration: 'askun fii',     english: 'I live in',         context: '🏠 Where you live',       example: 'أَسْكُن فِي دُبَي',            exampleTranslation: 'I live in Dubai',            audio: require('../assets/audio/intro/4.mp3') },
  { arabic: 'أَشْتَغِل',   transliteration: 'ashtaghil',     english: 'I work',            context: '💼 Your job',             example: 'أَشْتَغِل مُهَنْدِس',          exampleTranslation: 'I work as an engineer',      audio: require('../assets/audio/intro/5.mp3') },
  { arabic: 'أَتَكَلَّم',  transliteration: 'atakallam',     english: 'I speak',           context: '🗣️ Languages',           example: 'أَتَكَلَّم عَرَبِي شْوَيَّة', exampleTranslation: 'I speak a little Arabic',    audio: require('../assets/audio/intro/6.mp3') },
  { arabic: 'شْوَيَّة',    transliteration: 'shwayya',       english: 'A little',          context: '👌 Gulf word',            example: 'أَعْرِف عَرَبِي شْوَيَّة',    exampleTranslation: 'I know a little Arabic',     audio: require('../assets/audio/intro/7.mp3') },
  { arabic: 'أَعْرِف',     transliteration: "a'rif",         english: 'I know',            context: '🧠 Knowledge',            example: 'أَعْرِف كَيْفَ أَقُول',        exampleTranslation: 'I know how to say',          audio: require('../assets/audio/intro/8.mp3') },
  { arabic: 'أُحِبُّ',     transliteration: 'uhibb',         english: 'I love / I like',   context: '❤️ Likes',               example: 'أُحِبُّ دُبَي كَثِير',         exampleTranslation: 'I love Dubai a lot',         audio: require('../assets/audio/intro/9.mp3') },
  { arabic: 'كَثِير',      transliteration: 'kathiir',       english: 'A lot / Very much', context: '💯 Emphasis',             example: 'شُكْراً كَثِير',               exampleTranslation: 'Thank you very much',        audio: require('../assets/audio/intro/10.mp3') },
  { arabic: 'قَلِيل',      transliteration: 'qaliil',        english: 'A little / Few',    context: '🤏 Amount',               example: 'عِنْدِي وَقْت قَلِيل',         exampleTranslation: 'I have a little time',       audio: require('../assets/audio/intro/11.mp3') },
  { arabic: 'سَعِيد',      transliteration: "sa'iid",        english: 'Happy',             context: '😊 Feelings',             example: 'أَنَا سَعِيد هِنَا',           exampleTranslation: 'I am happy here',            audio: require('../assets/audio/intro/12.mp3') },
  { arabic: 'مِتْزَوِّج',  transliteration: 'mitzawwij',     english: 'Married',           context: '💍 Status',               example: 'أَنَا مِتْزَوِّج',             exampleTranslation: 'I am married',               audio: require('../assets/audio/intro/13.mp3') },
  { arabic: 'عِنْدِي',     transliteration: "'indii",        english: 'I have',            context: '✋ Possession',           example: 'عِنْدِي سُؤَال',               exampleTranslation: 'I have a question',          audio: require('../assets/audio/intro/14.mp3') },
  { arabic: 'مَا عِنْدِي', transliteration: "ma 'indii",     english: "I don't have",      context: '❌ No possession',        example: 'مَا عِنْدِي وَقْت',            exampleTranslation: "I don't have time",          audio: require('../assets/audio/intro/15.mp3') },
];

// ─── Unit 4: Numbers & Counting (Gulf Arabic) ───────────────────────────────

export const NUMBERS_1_5_WORDS: Word[] = [
  { arabic: 'وَاحِد',    transliteration: 'waahid',    english: 'One',   context: '🔢 The first number', example: 'وَاحِد قَهْوَة',        exampleTranslation: 'One coffee' },
  { arabic: 'اِثنَيْن',  transliteration: 'ithnayn',   english: 'Two',   context: '🔢 A pair',           example: 'اِثنَيْن دِرهَم',       exampleTranslation: 'Two dirhams' },
  { arabic: 'ثَلَاثَة',  transliteration: 'thalaatha', english: 'Three', context: '🔢 A trio',           example: 'ثَلَاثَة أَيَّام',      exampleTranslation: 'Three days' },
  { arabic: 'أَرْبَعَة', transliteration: "arba'a",    english: 'Four',  context: '🔢 A quartet',        example: 'أَرْبَعَة أَشخَاص',     exampleTranslation: 'Four people' },
  { arabic: 'خَمْسَة',   transliteration: 'khamsa',    english: 'Five',  context: '🔢 A handful',        example: 'خَمْسَة دَقَائِق',      exampleTranslation: 'Five minutes' },
];

export const NUMBERS_6_10_WORDS: Word[] = [
  { arabic: 'سِتَّة',    transliteration: 'sitta',      english: 'Six',   context: '🔢 After five',   example: 'سِتَّة أَشهُر',              exampleTranslation: 'Six months' },
  { arabic: 'سَبْعَة',   transliteration: "sab'a",      english: 'Seven', context: '🔢 Lucky number', example: 'سَبْعَة أَيَّام فِي الأُسبُوع', exampleTranslation: 'Seven days in a week' },
  { arabic: 'ثَمَانِيَة',transliteration: 'thamaaniya', english: 'Eight', context: '🔢 Double four',  example: 'ثَمَانِيَة سَاعَات',         exampleTranslation: 'Eight hours' },
  { arabic: 'تِسْعَة',   transliteration: "tis'a",      english: 'Nine',  context: '🔢 Almost ten',   example: 'تِسْعَة دَرَاهِم',           exampleTranslation: 'Nine dirhams' },
  { arabic: 'عَشَرَة',   transliteration: "'ashara",    english: 'Ten',   context: '🔢 All fingers',  example: 'عَشَرَة دَقَائِق',           exampleTranslation: 'Ten minutes' },
];

export const NUMBERS_11_20_WORDS: Word[] = [
  { arabic: 'أَحَد عَشَر',      transliteration: "ahad 'ashar",       english: 'Eleven',    context: '🔢 Teen numbers' },
  { arabic: 'اِثنَا عَشَر',     transliteration: "ithna 'ashar",      english: 'Twelve',    context: '🔢 A dozen' },
  { arabic: 'ثَلَاثَة عَشَر',   transliteration: "thalaathat 'ashar", english: 'Thirteen',  context: '🔢 Teen numbers' },
  { arabic: 'أَرْبَعَة عَشَر',  transliteration: "arba'at 'ashar",    english: 'Fourteen',  context: '🔢 Teen numbers' },
  { arabic: 'خَمْسَة عَشَر',    transliteration: "khamsat 'ashar",    english: 'Fifteen',   context: '🔢 Teen numbers' },
  { arabic: 'سِتَّة عَشَر',     transliteration: "sittat 'ashar",     english: 'Sixteen',   context: '🔢 Teen numbers' },
  { arabic: 'سَبْعَة عَشَر',    transliteration: "sab'at 'ashar",     english: 'Seventeen', context: '🔢 Teen numbers' },
  { arabic: 'ثَمَانِيَة عَشَر', transliteration: "thamaaniyat 'ashar",english: 'Eighteen',  context: '🔢 Teen numbers' },
  { arabic: 'تِسْعَة عَشَر',    transliteration: "tis'at 'ashar",     english: 'Nineteen',  context: '🔢 Teen numbers' },
  { arabic: 'عِشْرِين',         transliteration: "'ishriyn",           english: 'Twenty',    context: '🔢 Two tens',    example: 'عِشْرِين سَنَة', exampleTranslation: 'Twenty years' },
];

export const NUMBERS_TENS_WORDS: Word[] = [
  { arabic: 'عِشْرِين',  transliteration: "'ishriyn",    english: 'Twenty',   context: '🔢 2 × 10' },
  { arabic: 'ثَلَاثِين', transliteration: 'thalaathiyn', english: 'Thirty',   context: '🔢 3 × 10' },
  { arabic: 'أَرْبَعِين',transliteration: "arba'iyn",    english: 'Forty',    context: '🔢 4 × 10' },
  { arabic: 'خَمْسِين',  transliteration: 'khamsiyn',    english: 'Fifty',    context: '🔢 5 × 10' },
  { arabic: 'سِتِّين',   transliteration: 'sittiyn',     english: 'Sixty',    context: '🔢 6 × 10' },
  { arabic: 'سَبْعِين',  transliteration: "sab'iyn",     english: 'Seventy',  context: '🔢 7 × 10' },
  { arabic: 'ثَمَانِين', transliteration: 'thamaaniyn',  english: 'Eighty',   context: '🔢 8 × 10' },
  { arabic: 'تِسْعِين',  transliteration: "tis'iyn",     english: 'Ninety',   context: '🔢 9 × 10' },
  { arabic: 'مِيَة',     transliteration: 'miyya',        english: 'Hundred',  context: '🔢 100',     example: 'مِيَة دِرهَم', exampleTranslation: 'One hundred dirhams' },
];

export const NUMBERS_AGE_WORDS: Word[] = [
  { arabic: 'عُمُرَك كَم؟', transliteration: 'umrak kam?',  english: 'How old are you?',   context: '🎂 Asking age' },
  { arabic: 'عُمُرِي',      transliteration: 'umrii',        english: 'My age is',          context: '🎂 Saying your age',   example: 'عُمُرِي ثَلَاثِين سَنَة', exampleTranslation: 'My age is thirty years' },
  { arabic: 'سَنَة',        transliteration: 'sana',         english: 'Year',               context: '📅 Time unit',         example: 'كُلّ سَنَة وَأَنتَ بِخَيْر', exampleTranslation: 'Happy birthday (lit. every year may you be well)' },
  { arabic: 'سَنَوَات',     transliteration: 'sanawaat',     english: 'Years',              context: '📅 Multiple years' },
  { arabic: 'كَبِير',       transliteration: 'kabiir',       english: 'Old / Big',          context: '🧓 Age description',   example: 'هُوَ كَبِير فِي السِّن', exampleTranslation: 'He is old in age' },
  { arabic: 'صَغِير',       transliteration: 'saghiir',      english: 'Young / Small',      context: '👶 Age description' },
  { arabic: 'مِيلَاد',      transliteration: 'miilaad',      english: 'Birthday',           context: '🎂 Special day',       example: 'عِيد مِيلَاد سَعِيد', exampleTranslation: 'Happy birthday' },
  { arabic: 'عُمُر',        transliteration: "'umur",        english: 'Age / Life',         context: '🎂 Your age number' },
];

export const NUMBERS_PRICES_WORDS: Word[] = [
  { arabic: 'بِكَم؟',    transliteration: 'bikam?',   english: 'How much?',  context: '💰 Asking price',          example: 'هَذَا بِكَم؟',        exampleTranslation: 'How much is this?' },
  { arabic: 'دِرهَم',    transliteration: 'dirham',   english: 'Dirham',     context: '💵 UAE currency',          example: 'عَشَرَة دَرَاهِم',    exampleTranslation: 'Ten dirhams' },
  { arabic: 'دَرَاهِم',  transliteration: 'daraahim', english: 'Dirhams',    context: '💵 UAE currency (plural)' },
  { arabic: 'غَالِي',    transliteration: 'ghaalii',  english: 'Expensive',  context: '💸 Price talk',            example: 'هَذَا غَالِي شْوَيَّة', exampleTranslation: 'This is a bit expensive' },
  { arabic: 'رَخِيص',    transliteration: 'rakhiiS',  english: 'Cheap',      context: '💰 Price talk',            example: 'أَبِي شَي رَخِيص',    exampleTranslation: 'I want something cheap' },
  { arabic: 'فُلُوس',    transliteration: 'fuluus',   english: 'Money',      context: '💰 Gulf word for money',   example: 'مَا عِنْدِي فُلُوس', exampleTranslation: "I don't have money" },
  { arabic: 'كَاش',      transliteration: 'kaash',    english: 'Cash',       context: '💵 Payment method' },
  { arabic: 'خَصْم',     transliteration: 'khaSm',    english: 'Discount',   context: '🏷️ Shopping',            example: 'فِي خَصْم؟',          exampleTranslation: 'Is there a discount?' },
];

export const NUMBERS_PHONE_WORDS: Word[] = [
  { arabic: 'رَقَم',           transliteration: 'raqam',          english: 'Number',            context: '📱 Phone number',        example: 'إِيش رَقَمَك؟',         exampleTranslation: 'What is your number?' },
  { arabic: 'تَلَيْفُون',      transliteration: 'talayFuun',      english: 'Telephone',         context: '📞 Communication device' },
  { arabic: 'مُوبَايِل',       transliteration: 'moobaayil',      english: 'Mobile phone',      context: '📱 Gulf word',           example: 'رَقَم مُوبَايِلَك',     exampleTranslation: 'Your mobile number' },
  { arabic: 'اِتَّصِل',        transliteration: 'ittaSil',        english: 'Call me',           context: '📞 Gulf expression',     example: 'اِتَّصِل فِيَّ',        exampleTranslation: 'Call me' },
  { arabic: 'رِسَالَة',        transliteration: 'risaala',        english: 'Message',           context: '💬 Text message',        example: 'بَعَتّلِي رِسَالَة',    exampleTranslation: 'Send me a message' },
  { arabic: 'وَاتْسَاب',       transliteration: 'waatsaab',       english: 'WhatsApp',          context: '💬 Most used app in Gulf' },
  { arabic: 'أَعْطِنِي رَقْمَك',transliteration: "a'Tiinii raqmak",english: 'Give me your number', context: '📱 Social phrase' },
  { arabic: 'مِسّ كَال',        transliteration: 'mis kaal',       english: 'Missed call',       context: '📱 Phone term' },
];

export const NUMBERS_HOURS_WORDS: Word[] = [
  { arabic: 'اَلسَّاعَة كَم؟', transliteration: "as-saa'a kam?", english: 'What time is it?', context: '⏰ Asking the time' },
  { arabic: 'سَاعَة',          transliteration: "saa'a",          english: 'Hour / Clock',     context: '⏰ Time unit',        example: 'اَلسَّاعَة خَمْسَة', exampleTranslation: "It's five o'clock" },
  { arabic: 'اَلصُّبْح',       transliteration: 'aS-SubH',        english: 'The morning',      context: '☀️ Morning time',    example: 'اَلسَّاعَة ثَمَانِيَة اَلصُّبْح', exampleTranslation: 'Eight in the morning' },
  { arabic: 'اَلظُّهْر',       transliteration: 'aZ-Zuhr',        english: 'Noon / Midday',    context: '🌞 12 pm',           example: 'نِتْغَدَّى اَلظُّهْر', exampleTranslation: 'We have lunch at noon' },
  { arabic: 'اَلْعَصِر',       transliteration: "al-'aSir",       english: 'Afternoon',        context: '🌤️ 3–5 pm' },
  { arabic: 'اَلْمَسَاء',      transliteration: "al-masaa'",      english: 'Evening',          context: '🌙 Evening time' },
  { arabic: 'اَللَّيْل',       transliteration: 'al-layl',        english: 'Night',            context: '🌙 Night time',      example: 'تِصْبَح عَلَى خَيْر', exampleTranslation: 'Good night (lit. wake up to goodness)' },
  { arabic: 'بَكِّير',         transliteration: 'bakkiir',        english: 'Early',            context: '⏰ Gulf word',        example: 'جِيت بَكِّير', exampleTranslation: 'I came early' },
];

export const NUMBERS_MINUTES_WORDS: Word[] = [
  { arabic: 'دَقِيقَة',     transliteration: 'daqiiqa',    english: 'Minute',        context: '⏱️ Short unit of time', example: 'بَس دَقِيقَة',                exampleTranslation: 'Just a minute' },
  { arabic: 'دَقَائِق',    transliteration: 'daqaayiq',   english: 'Minutes',       context: '⏱️ Multiple minutes',   example: 'خَمْسَة دَقَائِق',            exampleTranslation: 'Five minutes' },
  { arabic: 'رُبُع سَاعَة',transliteration: "rub' saa'a", english: 'Quarter hour',  context: '⏰ 15 minutes',          example: 'اَلسَّاعَة وَرُبُع',          exampleTranslation: 'Quarter past the hour' },
  { arabic: 'نُصّ سَاعَة', transliteration: "nuSS saa'a", english: 'Half hour',     context: '⏰ 30 minutes',          example: 'اَلسَّاعَة وَنُصّ',           exampleTranslation: 'Half past the hour' },
  { arabic: 'إِلَّا رُبُع',transliteration: "illaa rub'", english: 'Quarter to',    context: '⏰ 15 before the hour',  example: 'اَلسَّاعَة سِتَّة إِلَّا رُبُع', exampleTranslation: 'Quarter to six' },
  { arabic: 'ثَانِيَة',    transliteration: 'thaaniya',   english: 'Second',        context: '⏱️ Very short time',    example: 'بَس ثَانِيَة وَاحِدَة',       exampleTranslation: 'Just one second' },
  { arabic: 'تَقْرِيبًا',  transliteration: 'taqriiban',  english: 'Approximately', context: '⏰ About that time',     example: 'تَقْرِيبًا سَاعَة',           exampleTranslation: 'About an hour' },
  { arabic: 'بِالضَّبْط',  transliteration: 'biD-DabT',   english: 'Exactly',       context: '⏰ On the dot',          example: 'اَلسَّاعَة ثَلَاثَة بِالضَّبْط', exampleTranslation: "Exactly three o'clock" },
];

export const NUMBERS_DAYS_WORDS: Word[] = [
  { arabic: 'اَلْأَحَد',     transliteration: 'al-aHad',       english: 'Sunday',    context: '📅 First day of Gulf week' },
  { arabic: 'اَلِاثنَيْن',   transliteration: 'al-ithnayn',    english: 'Monday',    context: '📅 Day 2' },
  { arabic: 'اَلثُّلَاثَاء', transliteration: "ath-thulaathaa'", english: 'Tuesday', context: '📅 Day 3' },
  { arabic: 'اَلأَرْبِعَاء', transliteration: "al-arbi'aa'",   english: 'Wednesday', context: '📅 Day 4' },
  { arabic: 'اَلْخَمِيس',    transliteration: 'al-khamiis',    english: 'Thursday',  context: '📅 Day 5' },
  { arabic: 'اَلْجُمُعَة',   transliteration: "al-jumu'a",     english: 'Friday',    context: '🕌 Holy day in Islam',    example: 'صَلَاة اَلْجُمُعَة', exampleTranslation: 'Friday prayer' },
  { arabic: 'اَلسَّبْت',     transliteration: 'as-sabt',       english: 'Saturday',  context: '📅 Day 7' },
];

export const NUMBERS_MONTHS_WORDS: Word[] = [
  { arabic: 'يَنَايِر',   transliteration: 'yanaayir',  english: 'January',   context: '📅 Month 1' },
  { arabic: 'فِبرَايِر',  transliteration: 'fibraayir', english: 'February',  context: '📅 Month 2' },
  { arabic: 'مَارِس',     transliteration: 'maaris',    english: 'March',     context: '📅 Month 3' },
  { arabic: 'أَبْرِيل',   transliteration: 'abriil',    english: 'April',     context: '📅 Month 4' },
  { arabic: 'مَايُو',     transliteration: 'maayuu',    english: 'May',       context: '📅 Month 5' },
  { arabic: 'يُونِيُو',   transliteration: 'yuuniyuu',  english: 'June',      context: '📅 Month 6' },
  { arabic: 'يُولِيُو',   transliteration: 'yuuliyuu',  english: 'July',      context: '📅 Month 7' },
  { arabic: 'أَغُسْطُس', transliteration: 'aghusTus',  english: 'August',    context: '📅 Month 8' },
  { arabic: 'سِبْتَمْبِر',transliteration: 'sibtambir', english: 'September', context: '📅 Month 9' },
  { arabic: 'أُكتُوبِر',  transliteration: 'uktuubir',  english: 'October',   context: '📅 Month 10' },
  { arabic: 'نُوفَمْبِر', transliteration: 'nuufambir', english: 'November',  context: '📅 Month 11' },
  { arabic: 'دِيسَمْبِر', transliteration: 'diisambir', english: 'December',  context: '📅 Month 12' },
];

export const NUMBERS_DATES_WORDS: Word[] = [
  { arabic: 'اَلتَّارِيخ',     transliteration: 'at-taarikh',   english: 'The date',   context: '📅 Calendar date', example: 'اَلتَّارِيخ كَم اَلْيَوْم؟', exampleTranslation: "What is today's date?" },
  { arabic: 'اَلْيَوْم',       transliteration: 'al-yawm',      english: 'Today',      context: '📅 Current day',   example: 'اَلْيَوْم جُمُعَة', exampleTranslation: 'Today is Friday' },
  { arabic: 'أَمْس',           transliteration: 'ams',           english: 'Yesterday',  context: '📅 The day before', example: 'أَمْس كَان زَيْن', exampleTranslation: 'Yesterday was good' },
  { arabic: 'بُكْرَة',         transliteration: 'bukra',         english: 'Tomorrow',   context: '📅 Next day (Gulf)', example: 'نِتْقَابَل بُكْرَة', exampleTranslation: "Let's meet tomorrow" },
  { arabic: 'اَلْأُسْبُوع',    transliteration: "al-usbuu'",    english: 'The week',   context: '📅 Seven days',    example: 'هَذَا اَلْأُسْبُوع', exampleTranslation: 'This week' },
  { arabic: 'شَهَر',           transliteration: 'shahar',        english: 'Month',      context: '📅 30 days',       example: 'اَلشَّهَر اَلْقَادِم', exampleTranslation: 'Next month' },
  { arabic: 'سَنَة',           transliteration: 'sana',          english: 'Year',       context: '📅 365 days',      example: 'هَذِي اَلسَّنَة', exampleTranslation: 'This year' },
  { arabic: 'قَادِم',          transliteration: 'qaadim',        english: 'Next / Coming', context: '📅 Future time', example: 'اَلْأُسْبُوع اَلْقَادِم', exampleTranslation: 'Next week' },
];

export const NUMBERS_ORDERING_WORDS: Word[] = [
  { arabic: 'أَوَّل', transliteration: 'awwal',    english: 'First',       context: '🥇 First place',  example: 'أَنَا أَوَّل', exampleTranslation: 'I am first' },
  { arabic: 'ثَانِي', transliteration: 'thaanii',  english: 'Second',      context: '🥈 Second place', example: 'اَلدَّوْر اَلثَّانِي', exampleTranslation: 'Second floor' },
  { arabic: 'ثَالِث', transliteration: 'thaalith', english: 'Third',       context: '🥉 Third place' },
  { arabic: 'رَابِع', transliteration: "raabi'",   english: 'Fourth',      context: '4️⃣ Order' },
  { arabic: 'خَامِس', transliteration: 'khaamis',  english: 'Fifth',       context: '5️⃣ Order' },
  { arabic: 'أَخِير', transliteration: 'akhiir',   english: 'Last',        context: '🔚 Final position', example: 'اَلدَّوْر اَلْأَخِير', exampleTranslation: 'The last floor' },
  { arabic: 'قَبْل',  transliteration: 'qabl',     english: 'Before',      context: '⬅️ Sequence',     example: 'قَبْل بُكْرَة', exampleTranslation: 'Before tomorrow' },
  { arabic: 'بَعْد',  transliteration: "ba'd",     english: 'After / Later', context: '➡️ Sequence',   example: 'بَعْد شْوَيَّة', exampleTranslation: 'A little later' },
];

export const NUMBERS_TOGETHER_WORDS: Word[] = [
  { arabic: 'مِيَة وَعَشَرَة', transliteration: "miyya wa'ashara", english: 'One hundred and ten', context: '🔢 Combined numbers',   example: 'مِيَة وَعَشَرَة دِرهَم', exampleTranslation: '110 dirhams' },
  { arabic: 'مِيَتَيْن',       transliteration: 'miitayn',         english: 'Two hundred',         context: '🔢 200',               example: 'مِيَتَيْن دِرهَم',        exampleTranslation: '200 dirhams' },
  { arabic: 'أَلْف',           transliteration: 'alf',              english: 'Thousand',            context: '🔢 1,000',             example: 'أَلْف دِرهَم',            exampleTranslation: '1,000 dirhams' },
  { arabic: 'أَلْفَيْن',       transliteration: 'alfayn',           english: 'Two thousand',        context: '🔢 2,000',             example: 'أَلْفَيْن دِرهَم',        exampleTranslation: '2,000 dirhams' },
  { arabic: 'نُصّ',            transliteration: 'nuSS',             english: 'Half',                context: '½ A half',             example: 'نُصّ كِيلُو',             exampleTranslation: 'Half a kilo' },
  { arabic: 'رُبُع',           transliteration: "rub'",             english: 'Quarter',             context: '¼ A quarter',          example: 'رُبُع سَاعَة',            exampleTranslation: 'Quarter of an hour' },
  { arabic: 'مِلْيُون',        transliteration: 'milyuun',          english: 'Million',             context: '🔢 1,000,000',         example: 'مِلْيُون دِرهَم',         exampleTranslation: '1,000,000 dirhams' },
  { arabic: 'وَ',              transliteration: 'wa',               english: 'And',                 context: '🔢 Connecting numbers', example: 'خَمْسَة وَعِشْرِين',     exampleTranslation: 'Twenty-five' },
];

// ─── Unit 5: Grammar Basics (Gulf Arabic) ────────────────────────────────────

export const GRAMMAR_PRONOUNS_WORDS: Word[] = [
  { arabic: 'أَنَا',   transliteration: 'ana',   english: 'I',          context: '👤 Subject pronoun', example: 'أَنَا أَشْتَغِل هِنَا',    exampleTranslation: 'I work here' },
  { arabic: 'أَنتَ',  transliteration: 'inta',  english: 'You (male)', context: '👤 Subject pronoun', example: 'أَنتَ مِن وَيْن؟',          exampleTranslation: 'Where are you from?' },
  { arabic: 'أَنتِ',  transliteration: 'inti',  english: 'You (female)', context: '👤 Subject pronoun' },
  { arabic: 'هُوَّ',  transliteration: 'huwwa', english: 'He',         context: '👤 Subject pronoun', example: 'هُوَّ صَدِيقِي',            exampleTranslation: 'He is my friend' },
  { arabic: 'هِيَّ',  transliteration: 'hiyya', english: 'She',        context: '👤 Subject pronoun', example: 'هِيَّ تَشْتَغِل هِنَا',     exampleTranslation: 'She works here' },
  { arabic: 'إِحْنَا', transliteration: 'ihna', english: 'We',         context: '👥 Subject pronoun', example: 'إِحْنَا نَبِي نَرُوح',      exampleTranslation: 'We want to go' },
  { arabic: 'أَنْتُم', transliteration: 'intum', english: 'You all',   context: '👥 Subject pronoun', example: 'أَنْتُم مِن دُبَيّ؟',       exampleTranslation: 'Are you all from Dubai?' },
  { arabic: 'هُمّ',   transliteration: 'humm',  english: 'They',       context: '👥 Subject pronoun', example: 'هُمّ فِي البَيْت',           exampleTranslation: 'They are at home' },
];

export const GRAMMAR_THIS_THAT_WORDS: Word[] = [
  { arabic: 'هَذَا',        transliteration: 'haadha',       english: 'This (male)',   context: '👆 Demonstrative', example: 'هَذَا حَلو',            exampleTranslation: 'This is nice' },
  { arabic: 'هَذِي',        transliteration: 'haadhi',       english: 'This (female)', context: '👆 Demonstrative', example: 'هَذِي سَيَّارَتِي',      exampleTranslation: 'This is my car' },
  { arabic: 'ذَاك',         transliteration: 'dhaak',        english: 'That (male)',   context: '👉 Demonstrative', example: 'ذَاك غَالِي',           exampleTranslation: 'That is expensive' },
  { arabic: 'ذِيك',         transliteration: 'dheek',        english: 'That (female)', context: '👉 Demonstrative' },
  { arabic: 'هَذَا حَلو',   transliteration: 'haadha hilow', english: 'This is nice',  context: '✨ Sentence pattern' },
  { arabic: 'ذَاك غَالِي',  transliteration: 'dhaak ghaali', english: 'That is expensive', context: '💰 Sentence pattern' },
  { arabic: 'شِنُو هَذَا؟', transliteration: 'shinu haadha?', english: 'What is this?', context: '❓ Common question' },
  { arabic: 'مِنُو ذَاك؟',  transliteration: 'minu dhaak?',  english: 'Who is that?',  context: '❓ Common question' },
];

export const GRAMMAR_POSSESSIVES_WORDS: Word[] = [
  { arabic: 'حَقِّي',       transliteration: 'haqqi',     english: 'Mine',           context: '✋ Gulf possessive' },
  { arabic: 'حَقَّك',       transliteration: 'haqqak',    english: 'Yours (male)',    context: '✋ Gulf possessive' },
  { arabic: 'حَقِّج',       transliteration: 'haqqich',   english: 'Yours (female)',  context: '✋ Gulf possessive' },
  { arabic: 'حَقَّه',       transliteration: 'haqqah',    english: 'His',            context: '✋ Gulf possessive' },
  { arabic: 'حَقَّها',      transliteration: 'haqqaha',   english: 'Hers',           context: '✋ Gulf possessive' },
  { arabic: 'كِتَابِي',     transliteration: 'kitaabi',   english: 'My book',        context: '📚 Possessive suffix', example: 'هَذَا كِتَابِي', exampleTranslation: 'This is my book' },
  { arabic: 'سَيَّارَتَك',  transliteration: 'sayyaartak', english: 'Your car',       context: '🚗 Possessive suffix' },
  { arabic: 'بَيْتَه',      transliteration: 'baitah',    english: 'His house',      context: '🏠 Possessive suffix' },
  { arabic: 'شَنْطِتْها',   transliteration: 'shantitiha', english: 'Her bag',        context: '👜 Possessive suffix' },
];

export const GRAMMAR_PRESENT_VERBS_WORDS: Word[] = [
  { arabic: 'أَرُوح',    transliteration: 'arooh',     english: 'I go',    context: '🚶 Present tense', example: 'أَرُوح الشُّغُل كُلّ يَوْم',   exampleTranslation: 'I go to work every day' },
  { arabic: 'آكِل',     transliteration: 'aakil',     english: 'I eat',   context: '🍽️ Present tense', example: 'آكِل وَايِد',                  exampleTranslation: 'I eat a lot' },
  { arabic: 'أَشْرَب',  transliteration: 'ashrab',    english: 'I drink', context: '☕ Present tense', example: 'أَشْرَب قَهْوَة الصُّبْح',     exampleTranslation: 'I drink coffee in the morning' },
  { arabic: 'أَشْتَغِل',transliteration: 'ashtaghil', english: 'I work',  context: '💼 Present tense', example: 'أَشْتَغِل فِي دُبَيّ',          exampleTranslation: 'I work in Dubai' },
  { arabic: 'أَدْرِس',  transliteration: 'adris',     english: 'I study', context: '📚 Present tense' },
  { arabic: 'أَتْكَلَّم',transliteration: 'atkallam',  english: 'I speak', context: '🗣️ Present tense', example: 'أَتْكَلَّم عَرَبِي شْوَيَّة', exampleTranslation: 'I speak a little Arabic' },
  { arabic: 'أَنَام',   transliteration: 'anaam',     english: 'I sleep', context: '😴 Present tense' },
  { arabic: 'أَقْرَا',  transliteration: 'aqra',      english: 'I read',  context: '📖 Present tense' },
];

export const GRAMMAR_PAST_VERBS_WORDS: Word[] = [
  { arabic: 'رُحْت',        transliteration: 'ruht',       english: 'I went',         context: '🚶 Past tense', example: 'رُحْت السّوق أَمْس', exampleTranslation: 'I went to the market yesterday' },
  { arabic: 'أَكَلْت',      transliteration: 'akalt',      english: 'I ate',          context: '🍽️ Past tense', example: 'أَكَلْت خُبْز',      exampleTranslation: 'I ate bread' },
  { arabic: 'شْرِبْت',      transliteration: 'shribt',     english: 'I drank',        context: '🥤 Past tense' },
  { arabic: 'اِشْتَغَلْت',  transliteration: 'ishtaghalt', english: 'I worked',       context: '💼 Past tense', example: 'اِشْتَغَلْت كَثِير', exampleTranslation: 'I worked a lot' },
  { arabic: 'دَرَسْت',      transliteration: 'darast',     english: 'I studied',      context: '📚 Past tense' },
  { arabic: 'تْكَلَّمْت',   transliteration: 'tkallamt',   english: 'I spoke',        context: '🗣️ Past tense' },
  { arabic: 'نِمْت',        transliteration: 'nimt',       english: 'I slept',        context: '😴 Past tense' },
  { arabic: 'قْرَيْت',      transliteration: 'qrait',      english: 'I read (past)',  context: '📖 Past tense' },
];

export const GRAMMAR_WANT_NEED_WORDS: Word[] = [
  { arabic: 'أَبِي',              transliteration: 'abi',            english: 'I want',               context: '💬 Gulf want expression',  example: 'أَبِي قَهْوَة',         exampleTranslation: 'I want coffee' },
  { arabic: 'أَبِيه',             transliteration: 'abih',           english: 'I want it',            context: '💬 Gulf want expression' },
  { arabic: 'مَا أَبِي',          transliteration: 'ma abi',         english: "I don't want",          context: '❌ Negated want',          example: 'مَا أَبِي هَذَا',       exampleTranslation: "I don't want this" },
  { arabic: 'أَحْتَاج',           transliteration: 'ahtaaj',         english: 'I need',               context: '💡 Expressing need',       example: 'أَحْتَاج مُسَاعَدَة',   exampleTranslation: 'I need help' },
  { arabic: 'أَبِي آكِل',         transliteration: 'abi aakil',      english: 'I want to eat',        context: '🍽️ Want + verb' },
  { arabic: 'أَبِي أَرُوح',       transliteration: 'abi arooh',      english: 'I want to go',         context: '🚶 Want + verb' },
  { arabic: 'تَبِي شَيّ؟',        transliteration: 'tabi shay?',     english: 'Do you want something?', context: '❓ Asking about wants' },
  { arabic: 'أَحْتَاج مُسَاعَدَة',transliteration: "ahtaaj musaa'ada", english: 'I need help',        context: '🆘 Urgent need' },
];

export const GRAMMAR_QUESTIONS_WORDS: Word[] = [
  { arabic: 'شِنُو؟',         transliteration: 'shinu?',    english: 'What?',           context: '❓ Gulf question word', example: 'شِنُو اِسْمَك؟',   exampleTranslation: 'What is your name?' },
  { arabic: 'مِنُو؟',         transliteration: 'minu?',     english: 'Who?',            context: '❓ Gulf question word', example: 'مِنُو هَذَا؟',      exampleTranslation: 'Who is this?' },
  { arabic: 'وَيْن؟',         transliteration: 'wain?',     english: 'Where?',          context: '❓ Gulf question word', example: 'وَيْن تَشْتَغِل؟', exampleTranslation: 'Where do you work?' },
  { arabic: 'مَتَى؟',         transliteration: 'mata?',     english: 'When?',           context: '❓ Question word',      example: 'مَتَى تِجِي؟',     exampleTranslation: 'When are you coming?' },
  { arabic: 'لَيْش؟',         transliteration: 'laish?',    english: 'Why?',            context: '❓ Gulf question word', example: 'لَيْش مَا جِيت؟', exampleTranslation: "Why didn't you come?" },
  { arabic: 'كَيْف؟',         transliteration: 'kaif?',     english: 'How?',            context: '❓ Gulf question word', example: 'كَيْف حَالَك؟',    exampleTranslation: 'How are you?' },
  { arabic: 'كَمْ؟',          transliteration: 'kam?',      english: 'How much / many?', context: '❓ Quantity question',  example: 'كَمْ سَاعَة؟',     exampleTranslation: 'How many hours?' },
  { arabic: 'وَيْن تَرُوح؟',  transliteration: 'wain tarooh?', english: 'Where are you going?', context: '❓ Common question' },
];

export const GRAMMAR_NEGATION_WORDS: Word[] = [
  { arabic: 'لَا',           transliteration: 'la',          english: 'No',                    context: '❌ Basic negation',       example: 'لَا، شُكْرًا',       exampleTranslation: 'No, thank you' },
  { arabic: 'مَا',           transliteration: 'ma',          english: 'Not (before verb)',      context: '❌ Verbal negation',      example: 'مَا أَعْرِف',        exampleTranslation: "I don't know" },
  { arabic: 'مُو',           transliteration: 'mu',          english: 'Not (before noun/adj)', context: '❌ Nominal negation',     example: 'مُو صَحِيح',         exampleTranslation: "That's not right" },
  { arabic: 'مَا أَعْرِف',   transliteration: "ma a'rif",    english: "I don't know",           context: '🤷 Very useful phrase',   example: 'مَا أَعْرِف وَيْن',  exampleTranslation: "I don't know where" },
  { arabic: 'مَا أَقْدِر',   transliteration: 'ma aqdir',    english: "I can't",               context: '❌ Expressing inability', example: 'مَا أَقْدِر أَجِي',  exampleTranslation: "I can't come" },
  { arabic: 'مُو زَيْن',     transliteration: 'mu zain',     english: 'Not good',              context: '😕 Negative state' },
  { arabic: 'مَا عِنْدِي',   transliteration: "ma 'indi",    english: "I don't have",           context: '❌ No possession',        example: 'مَا عِنْدِي فُلُوس', exampleTranslation: "I don't have money" },
  { arabic: 'لَا شُكْرًا',   transliteration: 'la shukran',  english: 'No thank you',          context: '🙏 Polite refusal' },
];

export const GRAMMAR_ADJECTIVES_WORDS: Word[] = [
  { arabic: 'كْبِير',  transliteration: 'kbeer',   english: 'Big',             context: '📐 Size adjective',     example: 'بَيْت كْبِير',         exampleTranslation: 'A big house' },
  { arabic: 'صْغِير',  transliteration: 'sagheer', english: 'Small',           context: '📐 Size adjective',     example: 'غُرْفَة صْغِيرَة',      exampleTranslation: 'A small room' },
  { arabic: 'حَلو',    transliteration: 'hilow',   english: 'Beautiful / Nice', context: '✨ Gulf adjective',    example: 'حَلو وَايِد',           exampleTranslation: 'Very nice' },
  { arabic: 'زَيْن',   transliteration: 'zain',    english: 'Good',            context: '👍 Gulf adjective',     example: 'كُلّ شَيّ زَيْن',       exampleTranslation: 'Everything is good' },
  { arabic: 'جَدِيد',  transliteration: 'jadeed',  english: 'New',             context: '✨ Describing things',  example: 'سَيَّارَة جَدِيدَة',     exampleTranslation: 'A new car' },
  { arabic: 'قَدِيم',  transliteration: 'qadeem',  english: 'Old (things)',    context: '🕰️ For objects',       example: 'بَيْت قَدِيم',          exampleTranslation: 'An old house' },
  { arabic: 'حَار',    transliteration: 'haar',    english: 'Hot',             context: '🌡️ Temperature',       example: 'اَلطَّقْس حَار',        exampleTranslation: 'The weather is hot' },
  { arabic: 'بَارِد',  transliteration: 'baarid',  english: 'Cold',            context: '❄️ Temperature',       example: 'مَاء بَارِد',           exampleTranslation: 'Cold water' },
  { arabic: 'سَهْل',   transliteration: 'sahl',    english: 'Easy',            context: '👌 Difficulty',         example: 'هَذَا سَهْل',           exampleTranslation: 'This is easy' },
  { arabic: 'صَعْب',   transliteration: "sa'b",    english: 'Difficult',       context: '😓 Difficulty',         example: 'العَرَبِي صَعْب شْوَيَّة', exampleTranslation: 'Arabic is a bit difficult' },
  { arabic: 'وَايِد',  transliteration: 'waayid',  english: 'A lot / Very (Gulf)', context: '💯 Gulf intensifier', example: 'حَلو وَايِد',         exampleTranslation: 'Very nice' },
];

export const GRAMMAR_SENTENCES_WORDS: Word[] = [
  { arabic: 'أَنَا أَشْتَغِل فِي دُبَيّ',         transliteration: 'ana ashtaghil fi dubayy',        english: 'I work in Dubai',                      context: '💼 Full sentence' },
  { arabic: 'هِيَّ تَدْرِس عَرَبِي',              transliteration: "hiyya tadris 'arabi",            english: 'She studies Arabic',                   context: '📚 Full sentence' },
  { arabic: 'إِحْنَا نَبِي نَرُوح السّوق',         transliteration: 'ihna nabi narooh is-sooq',       english: 'We want to go to the market',          context: '🛒 Full sentence' },
  { arabic: 'هَذَا الأَكِل حَلو وَايِد',           transliteration: 'haadha il-akil hilow waayid',    english: 'This food is very nice',               context: '🍽️ Full sentence' },
  { arabic: 'مَا أَعْرِف وَيْن الفُنْدُق',          transliteration: "ma a'rif wain il-funduq",        english: "I don't know where the hotel is",       context: '🏨 Full sentence' },
  { arabic: 'كَيْف أَرُوح المَطَار؟',             transliteration: 'kaif arooh il-mataar?',          english: 'How do I get to the airport?',         context: '✈️ Full sentence' },
];

// ── Unit 7: Work & Business ────────────────────────────────────────────────────

export const WORK_OFFICE_WORDS: Word[] = [
  { arabic: 'مَكتَب',    transliteration: 'maktab',       english: 'Office',      context: '🏢 The workplace' },
  { arabic: 'شَرِكَة',   transliteration: 'sharika',      english: 'Company',     context: '🏢 Organizations' },
  { arabic: 'مُدير',     transliteration: 'mudeer',       english: 'Manager',     context: '👔 Work roles' },
  { arabic: 'مُوَظَّف',  transliteration: 'muwadhdhaf',   english: 'Employee',    context: '👔 Work roles' },
  { arabic: 'كُمبيوتَر', transliteration: 'kumbyootar',   english: 'Computer',    context: '💻 Tech at work' },
  { arabic: 'اِجتِماع',  transliteration: "ijtimaa'",     english: 'Meeting',     context: '📅 Work events' },
  { arabic: 'مَشروع',    transliteration: "mashroo'",     english: 'Project',     context: '📋 Work tasks' },
  { arabic: 'قِسم',      transliteration: 'qism',         english: 'Department',  context: '🏢 Office structure' },
];

export const WORK_GREETINGS_WORDS: Word[] = [
  { arabic: 'صَباح الخَير يا جَماعَة', transliteration: "sabaah il-khair ya jamaa'a",   english: 'Good morning everyone',          context: '☀️ Morning at the office' },
  { arabic: 'شْلونكُم اليَوم',          transliteration: 'shloonkum il-yawm',            english: 'How are you all today',          context: '😊 Checking in' },
  { arabic: 'الله يِعطيكُم العافِيَة',   transliteration: "allah yi'teekum il-'aafya",    english: 'God give you all strength',      context: '🙏 Gulf work greeting' },
  { arabic: 'مَشكور على تَعبَك',         transliteration: "mashkoor 'ala ta'bak",         english: 'Thanks for your effort',         context: '🙏 Showing appreciation' },
  { arabic: 'يِعطيك العافِيَة',          transliteration: "yi'teek il-'aafya",            english: 'May God give you strength',      context: '🙏 Common work phrase' },
  { arabic: 'وِياكُم',                   transliteration: 'wiyaakum',                     english: 'And to you too',                 context: '↩️ Polite reply' },
];

export const WORK_MEETING_WORDS: Word[] = [
  { arabic: 'عِندَنا اِجتِماع',        transliteration: "indana ijtimaa'",          english: 'We have a meeting',          context: '📅 Meeting talk' },
  { arabic: 'السّاعَة كَم الاِجتِماع', transliteration: "is-saa'a kam il-ijtimaa'", english: 'What time is the meeting',   context: '⏰ Scheduling' },
  { arabic: 'خَلّونا نِبدا',           transliteration: 'khallona nibda',           english: "Let's start",                context: '▶️ Opening a meeting' },
  { arabic: 'شِنو رَأيكُم',            transliteration: "shinu ra'yukum",           english: 'What do you think',          context: '💬 Discussion' },
  { arabic: 'مُوافِق',                 transliteration: 'muwaafiq',                 english: 'I agree',                    context: '✅ Agreement' },
  { arabic: 'مو مُوافِق',              transliteration: 'mu muwaafiq',              english: 'I disagree',                 context: '❌ Disagreement' },
  { arabic: 'نِحتاج وَقت أَكثَر',      transliteration: 'nihtaaj waqt akthar',      english: 'We need more time',          context: '⏳ Requesting more time' },
  { arabic: 'خَلّونا نِكمِل باجِر',    transliteration: 'khallona nikmil baajir',   english: "Let's continue tomorrow",    context: '📅 Rescheduling' },
];

export const WORK_PHONE_WORDS: Word[] = [
  { arabic: 'آلو',                  transliteration: 'aalo',                english: 'Hello (phone)',        context: '📞 Answering calls' },
  { arabic: 'مِنو مَعي',            transliteration: "minu ma'i",           english: "Who's speaking",       context: '📞 Phone etiquette' },
  { arabic: 'أَبي أَتكَلَّم مَع',   transliteration: "abi atkallam ma'",    english: 'I want to speak with', context: '📞 Making calls' },
  { arabic: 'لَحظَة لَو سَمَحت',    transliteration: 'lahdha law samaht',   english: 'One moment please',    context: '📞 Holding the line' },
  { arabic: 'الخَطّ مَشغول',        transliteration: 'il-khat mashghool',   english: 'The line is busy',     context: '📞 Phone issues' },
  { arabic: 'أَرِدّ عَلَيك',        transliteration: "aridd 'alaik",        english: "I'll call you back",   context: '📞 Returning calls' },
  { arabic: 'رَسِّللي واتساب',       transliteration: 'rassilli waatsaab',   english: 'Send me a WhatsApp',   context: '💬 Messaging' },
  { arabic: 'مَشكور اتَّصَلت',       transliteration: 'mashkoor ittasalt',   english: 'Thanks for calling',   context: '📞 Ending calls' },
];

export const WORK_EMAIL_WORDS: Word[] = [
  { arabic: 'إيمَيل',   transliteration: 'eemeil',       english: 'Email',       context: '📧 Digital communication' },
  { arabic: 'رِسالَة',  transliteration: 'risaala',      english: 'Message',     context: '💬 Communication' },
  { arabic: 'أَرسِل',   transliteration: 'arsil',        english: 'Send',        context: '📤 Sending' },
  { arabic: 'رَدّ',     transliteration: 'radd',         english: 'Reply',       context: '↩️ Responding' },
  { arabic: 'مُرفَق',   transliteration: 'murfaq',       english: 'Attachment',  context: '📎 Files' },
  { arabic: 'مَوضوع',   transliteration: "mawdhoo'",     english: 'Subject',     context: '📧 Email parts' },
  { arabic: 'عاجِل',    transliteration: "'aajil",       english: 'Urgent',      context: '⚡ Priority' },
  { arabic: 'تِقرير',   transliteration: 'taqreer',      english: 'Report',      context: '📊 Documents' },
];

export const WORK_SCHEDULE_WORDS: Word[] = [
  { arabic: 'جَدوَل',          transliteration: 'jadwal',           english: 'Schedule',         context: '📅 Planning' },
  { arabic: 'مَوعِد',          transliteration: "maw'id",           english: 'Appointment',      context: '📅 Calendar' },
  { arabic: 'مَوعِد نِهائي',   transliteration: "maw'id nihaa'i",   english: 'Deadline',         context: '⏰ Deadlines' },
  { arabic: 'مُتأَخِّر',        transliteration: "mit'akhir",        english: 'Late / Delayed',   context: '⏳ Running late' },
  { arabic: 'بَدري',           transliteration: 'badri',            english: 'Early',            context: '⏰ Being early' },
  { arabic: 'خَلَّصت',         transliteration: 'khallast',         english: 'I finished',       context: '✅ Completion' },
  { arabic: 'ما خَلَّصت',      transliteration: 'ma khallast',      english: "I haven't finished", context: '❌ Not done yet' },
  { arabic: 'أَحتاج تَمديد',   transliteration: 'ahtaaj tamdeed',   english: 'I need an extension', context: '📅 Extensions' },
];

export const WORK_PROBLEMS_WORDS: Word[] = [
  { arabic: 'عِندي مُشكِلَة',         transliteration: 'indi mushkila',          english: 'I have a problem',             context: '⚠️ Problem reporting' },
  { arabic: 'الكُمبيوتَر خَرَب',       transliteration: 'il-kumbyootar kharab',   english: 'The computer broke',           context: '💻 Tech issues' },
  { arabic: 'النِّت ما يِشتَغِل',      transliteration: 'in-nit ma yishtaghil',   english: "The internet isn't working",   context: '🌐 Connectivity' },
  { arabic: 'أَحتاج مُساعَدَة',        transliteration: "ahtaaj musaa'ada",       english: 'I need help',                  context: '🆘 Getting help' },
  { arabic: 'مِنو أَكَلِّم',           transliteration: 'minu akallim',           english: 'Who should I call',            context: '📞 Escalating' },
  { arabic: 'تَقدِر تِساعِدني',        transliteration: "taqdir tisaa'idni",      english: 'Can you help me',              context: '🤝 Requesting help' },
  { arabic: 'الطّابِعَة خَربانَة',     transliteration: "it-taabi'a kharbaana",   english: 'The printer is broken',        context: '🖨️ Office equipment' },
  { arabic: 'ما أَقدِر أَفتَح المَلَفّ', transliteration: 'ma aqdir aftah il-malaff', english: "I can't open the file",    context: '📁 File issues' },
];

export const WORK_SMALLTALK_WORDS: Word[] = [
  { arabic: 'شِنو سَوَّيت بالويكَند',   transliteration: 'shinu sawwait bil-weekend',    english: 'What did you do on the weekend',       context: '💬 Casual office chat' },
  { arabic: 'وَين رُحت الإجازَة',        transliteration: 'wain ruht il-ijaaza',         english: 'Where did you go on vacation',         context: '✈️ Vacation talk' },
  { arabic: 'مَبروك على التَّرقِيَة',    transliteration: "mabrook 'ala it-tarqiya",     english: 'Congratulations on the promotion',     context: '🎉 Celebrating success' },
  { arabic: 'مَتى إجازَتَك',             transliteration: 'mata ijaazatak',              english: "When's your vacation",                 context: '📅 Vacation planning' },
  { arabic: 'تَعبان اليَوم',             transliteration: "ta'baan il-yawm",             english: 'Tired today',                          context: '😴 How you feel' },
  { arabic: 'الدَّوام طَويل',            transliteration: 'id-dawaam taweel',            english: 'The workday is long',                  context: '😮‍💨 Work life' },
  { arabic: 'الحَمد لله خَلَّصنا',       transliteration: 'il-hamdu lillah khallasna',   english: 'Thank God we finished',                context: '🙏 End of the day' },
  { arabic: 'ويكَند مُبارَك',            transliteration: 'weekend mubaarak',            english: 'Happy weekend',                        context: '🎉 Weekend wishes' },
];

export const WORK_SALARY_WORDS: Word[] = [
  { arabic: 'راتِب',      transliteration: 'raatib',      english: 'Salary',      context: '💰 Compensation' },
  { arabic: 'عِلاوَة',    transliteration: "'ilaawa",     english: 'Bonus / Raise', context: '💰 Extra pay' },
  { arabic: 'إجازَة',     transliteration: 'ijaaza',      english: 'Vacation / Leave', context: '🏖️ Time off' },
  { arabic: 'تَأمين',     transliteration: "ta'meen",     english: 'Insurance',   context: '🏥 Benefits' },
  { arabic: 'تَقاعُد',    transliteration: "taqaa'ud",    english: 'Retirement',  context: '👴 Future planning' },
  { arabic: 'عَقد',       transliteration: "'aqd",        english: 'Contract',    context: '📝 Legal documents' },
  { arabic: 'تَرقِيَة',   transliteration: 'tarqiya',     english: 'Promotion',   context: '📈 Career growth' },
  { arabic: 'اِستِقالَة', transliteration: 'istiqaala',   english: 'Resignation', context: '🚪 Leaving a job' },
];

export const WORK_LEAVING_WORDS: Word[] = [
  { arabic: 'خَلَّصت شُغلي',           transliteration: 'khallast shughli',         english: 'I finished my work',          context: '✅ Wrapping up' },
  { arabic: 'أَنا طالِع',              transliteration: "ana taali'",               english: "I'm leaving",                 context: '🚪 Leaving work' },
  { arabic: 'مَع السَّلامَة',           transliteration: "ma' is-salaama",           english: 'Goodbye',                     context: '👋 Farewells' },
  { arabic: 'الله يِعطيك العافِيَة',    transliteration: "allah yi'teek il-'aafya",  english: 'God give you strength',       context: '🙏 Gulf farewell' },
  { arabic: 'نِشوفكُم باجِر',           transliteration: 'nishoofkum baajir',        english: 'See you tomorrow',            context: '👋 See you later' },
  { arabic: 'وِياكُم',                  transliteration: 'wiyaakum',                 english: 'Same to you',                 context: '↩️ Polite reply' },
  { arabic: 'اِستَريح',                 transliteration: 'istarih',                  english: 'Rest well',                   context: '😴 Wishing rest' },
  { arabic: 'باجِر عِندَنا وايِد شُغل', transliteration: "baajir 'indana waayid shughl", english: 'Tomorrow we have a lot of work', context: '💼 Work tomorrow' },
];

// ── Unit 9: Social & Culture ────────────────────────────────────────────────────

export const SOCIAL_GREETINGS_WORDS: Word[] = [
  { arabic: 'السَّلام عَلَيكُم',    transliteration: "is-salaam 'alaikum",    english: 'Peace be upon you',          context: '🕌 Formal Islamic greeting' },
  { arabic: 'وَعَلَيكُم السَّلام',   transliteration: "wa 'alaikum is-salaam", english: 'And upon you peace',         context: '🕌 Response to salam' },
  { arabic: 'هَلا وَالله',           transliteration: 'hala wallah',           english: 'Hey! (casual greeting)',     context: '👋 Gulf casual greeting' },
  { arabic: 'شْلونَك',               transliteration: 'shloonak',              english: 'How are you (to male)',      context: '😊 Gulf greeting (male)' },
  { arabic: 'شْلونِج',               transliteration: 'shloonich',             english: 'How are you (to female)',    context: '😊 Gulf greeting (female)' },
  { arabic: 'الله يِسَلِّمَك',        transliteration: 'allah yisallimak',      english: 'God keep you safe',         context: '👋 Farewell response' },
  { arabic: 'في أَمان الله',          transliteration: 'fi amaan allah',        english: "In God's safety (farewell)", context: '👋 Formal farewell' },
  { arabic: 'مَع السَّلامَة',         transliteration: "ma' is-salaama",        english: 'Goodbye',                   context: '👋 Universal farewell' },
];

export const SOCIAL_FAMILY_WORDS: Word[] = [
  { arabic: 'أَب',      transliteration: 'ab',      english: 'Father',               context: '👨‍👩‍👧 Family' },
  { arabic: 'أُم',      transliteration: 'umm',     english: 'Mother',               context: '👨‍👩‍👧 Family' },
  { arabic: 'أَخ',      transliteration: 'akh',     english: 'Brother',              context: '👨‍👩‍👧 Family' },
  { arabic: 'أُخت',     transliteration: 'ukht',    english: 'Sister',               context: '👨‍👩‍👧 Family' },
  { arabic: 'يَدّ',      transliteration: 'yadd',    english: 'Grandfather (Gulf)',   context: '👴 Gulf family term' },
  { arabic: 'يَدَّة',    transliteration: 'yadda',   english: 'Grandmother (Gulf)',   context: '👵 Gulf family term' },
  { arabic: 'عَم',       transliteration: "'amm",    english: 'Uncle (paternal)',     context: '👨 Paternal side' },
  { arabic: 'خال',       transliteration: 'khaal',   english: 'Uncle (maternal)',     context: '👨 Maternal side' },
  { arabic: 'عَمَّة',    transliteration: "'amma",   english: 'Aunt (paternal)',      context: '👩 Paternal side' },
  { arabic: 'خالَة',     transliteration: 'khaala',  english: 'Aunt (maternal)',      context: '👩 Maternal side' },
  { arabic: 'وَلَد',     transliteration: 'walad',   english: 'Son / Boy',            context: '👦 Children' },
  { arabic: 'بِنت',      transliteration: 'bint',    english: 'Daughter / Girl',      context: '👧 Children' },
  { arabic: 'زَوج',      transliteration: 'zawj',    english: 'Husband',              context: '💍 Spouse' },
  { arabic: 'زَوجَة',    transliteration: 'zawja',   english: 'Wife',                 context: '💍 Spouse' },
  { arabic: 'عِيال',     transliteration: "'iyaal",  english: 'Kids / Children (Gulf)', context: '👶 Gulf term for kids' },
];

export const SOCIAL_INVITATIONS_WORDS: Word[] = [
  { arabic: 'تَفَضَّل',          transliteration: 'tafaddal',          english: 'Please come in / Help yourself', context: '🤝 Hospitality' },
  { arabic: 'حَيّاك الله',       transliteration: 'hayaak allah',      english: 'God welcome you',               context: '🤝 Welcoming guests' },
  { arabic: 'البَيت بَيتَك',     transliteration: 'il-bait baitak',    english: 'Make yourself at home',         context: '🏠 Gulf hospitality' },
  { arabic: 'تَشَرَّفنا',         transliteration: 'tasharrafna',       english: "We're honored",                 context: '🙏 Welcoming guests' },
  { arabic: 'ما تِقَصِّر',        transliteration: 'ma tiqassir',       english: "You're too kind",               context: '🙏 Thanking a host' },
  { arabic: 'عَزيمَة',           transliteration: "'azeema",           english: 'Invitation / Feast',            context: '🍽️ Social gathering' },
  { arabic: 'تَعال عِندَنا',      transliteration: "ta'aal 'indana",   english: 'Come to our place',             context: '🏠 Inviting someone' },
  { arabic: 'نَوَّرتونا',          transliteration: 'nawwartona',        english: "You've brightened our home",    context: '✨ Said to guests' },
];

export const SOCIAL_RAMADAN_WORDS: Word[] = [
  { arabic: 'رَمَضان كَريم',            transliteration: 'ramadhan kareem',           english: 'Generous Ramadan',              context: '🌙 Ramadan greeting' },
  { arabic: 'الله أَكرَم',              transliteration: 'allah akram',               english: 'God is more generous (response)', context: '🌙 Ramadan response' },
  { arabic: 'صِيام',                    transliteration: 'siyaam',                    english: 'Fasting',                       context: '🌙 Ramadan vocab' },
  { arabic: 'فُطور',                    transliteration: 'futoor',                    english: 'Breaking the fast meal',        context: '🍽️ Iftar meal' },
  { arabic: 'سُحور',                    transliteration: 'suhoor',                    english: 'Pre-dawn meal',                 context: '🌅 Suhoor meal' },
  { arabic: 'عيد مُبارَك',              transliteration: "'eid mubaarak",             english: 'Blessed Eid',                   context: '🎉 Eid greeting' },
  { arabic: 'عَساكُم مِن عُوّاده',       transliteration: "'asaakum min 'uwwaadah",   english: 'May you celebrate it again',    context: '🎉 Eid/Ramadan response' },
  { arabic: 'كُل عام وَأَنتُم بِخَير',   transliteration: "'kull 'aam wa intum bikhair", english: 'Every year may you be well', context: '🎉 Celebration wish' },
];

export const SOCIAL_COMPLIMENTS_WORDS: Word[] = [
  { arabic: 'ماشاء الله',          transliteration: 'mashaa allah',        english: 'God has willed it (admiration)', context: '✨ Expressing admiration' },
  { arabic: 'تَبارَك الله',         transliteration: 'tabaaarak allah',     english: 'Blessed be God',                context: '✨ Praising something' },
  { arabic: 'الله يِبارِك فيك',     transliteration: 'allah yibaarik feek', english: 'God bless you',                 context: '🙏 Blessing someone' },
  { arabic: 'الله يِحفَظَك',         transliteration: 'allah yihfadhak',    english: 'God protect you',               context: '🙏 Wishing protection' },
  { arabic: 'الله يِوَفِّقَك',        transliteration: 'allah yuwaffqak',   english: 'God grant you success',         context: '🙏 Wishing success' },
  { arabic: 'يِعطيك العافِيَة',      transliteration: "yi'teek il-'aafya",  english: 'May God give you strength',     context: '🙏 Common Gulf blessing' },
  { arabic: 'ما قَصَّرت',            transliteration: 'ma qassart',         english: 'You went above and beyond',     context: '👏 Praising effort' },
  { arabic: 'الله يِخَلّيك',          transliteration: 'allah yikhalleek',   english: 'May God keep you',              context: '🙏 Affectionate blessing' },
];

export const SOCIAL_EMOTIONS_WORDS: Word[] = [
  { arabic: 'فَرحان',     transliteration: 'farhaan',     english: 'Happy',           context: '😊 Emotions' },
  { arabic: 'زَعلان',     transliteration: "za'laan",     english: 'Upset / Angry',   context: '😠 Emotions' },
  { arabic: 'تَعبان',     transliteration: "ta'baan",     english: 'Tired',           context: '😴 Emotions' },
  { arabic: 'مَلّيت',     transliteration: 'mallait',     english: "I'm bored",       context: '😑 Emotions' },
  { arabic: 'مِشتاق',    transliteration: 'mishtaaq',    english: 'I miss (someone)', context: '🥺 Emotions' },
  { arabic: 'خايِف',      transliteration: 'khaayif',     english: 'Scared',          context: '😨 Emotions' },
  { arabic: 'مَبسوط',     transliteration: 'mabsoot',     english: 'Pleased / Content', context: '😌 Emotions' },
  { arabic: 'مِنزَعِج',   transliteration: "minza'ij",    english: 'Annoyed',         context: '😤 Emotions' },
  { arabic: 'حَزين',      transliteration: 'hazeen',      english: 'Sad',             context: '😢 Emotions' },
  { arabic: 'مُتَحَمِّس',  transliteration: 'mutahammis',  english: 'Excited',         context: '🤩 Emotions' },
];

export const SOCIAL_WEDDINGS_WORDS: Word[] = [
  { arabic: 'مَبروك',              transliteration: 'mabrook',               english: 'Congratulations',             context: '🎉 Celebrations' },
  { arabic: 'الله يِبارِك',         transliteration: 'allah yibaarik',        english: 'God bless (response)',        context: '🎉 Celebration response' },
  { arabic: 'عُرس',                 transliteration: "'urs",                  english: 'Wedding',                     context: '💒 Wedding vocab' },
  { arabic: 'عَريس',                transliteration: "'arees",                english: 'Groom',                       context: '💒 Wedding vocab' },
  { arabic: 'عَروسَة',              transliteration: "'aroosa",               english: 'Bride',                       context: '💒 Wedding vocab' },
  { arabic: 'زَفَّة',                transliteration: 'zaffa',                 english: 'Wedding procession',          context: '💒 Gulf wedding tradition' },
  { arabic: 'مِلجَة',                transliteration: 'milcha',                english: 'Engagement ceremony',         context: '💍 Gulf tradition' },
  { arabic: 'عَقد القِران',          transliteration: "'aqd il-qiraan",        english: 'Marriage contract',           context: '📜 Islamic marriage' },
  { arabic: 'الله يِتَمِّم بِالخَير', transliteration: 'allah yitammim bil-khair', english: 'May God complete it with good', context: '🙏 Wedding blessing' },
  { arabic: 'بِالرِّفاء وَالبَنين',   transliteration: "bir-rifaa' wal-baneen", english: 'With harmony and children',  context: '💒 Traditional wedding wish' },
];

export const SOCIAL_CONDOLENCES_WORDS: Word[] = [
  { arabic: 'الله يِرحَمَه',              transliteration: 'allah yirhamah',            english: 'God have mercy on him',          context: '🤲 Condolences (male)' },
  { arabic: 'الله يِرحَمها',              transliteration: 'allah yirhamha',            english: 'God have mercy on her',          context: '🤲 Condolences (female)' },
  { arabic: 'لا بَأس طَهور إن شاء الله', transliteration: "la ba's tahoor in shaa allah", english: 'No worry, may it be purifying', context: '🤲 To someone who is sick' },
  { arabic: 'الله يِشفيك',                transliteration: 'allah yishfeek',            english: 'God heal you',                   context: '🏥 Wishing recovery' },
  { arabic: 'البَقاء لله',                 transliteration: "il-baqaa' lillah",          english: 'Permanence belongs to God',      context: '🤲 Condolence phrase' },
  { arabic: 'عَظَّم الله أَجرَكُم',         transliteration: "'adh-dham allah ajrakum",  english: 'May God magnify your reward',    context: '🤲 Formal condolence' },
  { arabic: 'الله يِصَبِّرَكُم',            transliteration: 'allah yisabbirakum',        english: 'May God grant you patience',     context: '🤲 Offering patience' },
  { arabic: 'سَلامات',                     transliteration: 'salaamaat',                  english: 'Get well soon',                  context: '💚 Wishing recovery' },
];

export const SOCIAL_RELIGION_WORDS: Word[] = [
  { arabic: 'بِسم الله',           transliteration: 'bismillah',            english: 'In the name of God',            context: '🙏 Before starting anything' },
  { arabic: 'الحَمد لله',           transliteration: 'il-hamdu lillah',      english: 'Praise be to God',              context: '🙏 Most common phrase' },
  { arabic: 'إن شاء الله',          transliteration: "in shaa allah",        english: 'God willing',                   context: '🙏 Future plans' },
  { arabic: 'ماشاء الله',           transliteration: 'mashaa allah',         english: 'God has willed it',             context: '✨ Expressing admiration' },
  { arabic: 'سُبحان الله',           transliteration: 'subhaan allah',        english: 'Glory be to God',               context: '😲 Amazement / wonder' },
  { arabic: 'أَستَغفِر الله',         transliteration: 'astaghfir allah',      english: "I seek God's forgiveness",      context: '🙏 Repentance' },
  { arabic: 'الله أَكبَر',            transliteration: 'allahu akbar',         english: 'God is greatest',               context: '🕌 Islamic expression' },
  { arabic: 'لا إله إلّا الله',       transliteration: 'la ilaaha illa allah', english: 'There is no god but God',       context: '🕌 The shahada' },
  { arabic: 'جَزاك الله خَير',        transliteration: 'jazaak allah khair',   english: 'May God reward you with good',  context: '🙏 Thanking someone' },
  { arabic: 'بارَك الله فيك',          transliteration: 'baaarak allah feek',   english: 'God bless you',                 context: '🙏 Blessing someone' },
];

export const SOCIAL_MANNERS_WORDS: Word[] = [
  { arabic: 'لَو سَمَحت',             transliteration: 'law samaht',           english: 'Please / Excuse me',            context: '🙏 Polite requests' },
  { arabic: 'مَشكور',                  transliteration: 'mashkoor',             english: 'Thank you (Gulf style)',         context: '🙏 Gulf thanks' },
  { arabic: 'عَفواً',                   transliteration: "'afwan",              english: "You're welcome",                context: '🙏 Response to thanks' },
  { arabic: 'آسِف',                    transliteration: 'aasif',                english: 'Sorry',                         context: '😔 Apologizing' },
  { arabic: 'لا تِكَلِّف عَلى نَفسَك',  transliteration: "la tikallif 'ala nafsak", english: "Don't trouble yourself",     context: '🙏 Telling someone not to fuss' },
  { arabic: 'تَأمُر أَمر',             transliteration: "ta'mur amr",           english: 'At your service',               context: '🤝 Ready to help' },
  { arabic: 'حاضِر',                   transliteration: 'haadhir',              english: 'Right away / At your service',  context: '✅ Immediate response' },
  { arabic: 'عَلى راسي',               transliteration: "'ala raasi",           english: "On my head (I'll do it gladly)", context: '🤝 Gulf expression of willingness' },
  { arabic: 'ما عَلَيه',               transliteration: "ma 'alaih",            english: "No problem / It's nothing",     context: '😊 Dismissing thanks' },
  { arabic: 'يِعطيك العافِيَة',         transliteration: "yi'teek il-'aafya",   english: 'God give you strength',         context: '🙏 Thanking someone for work' },
];
