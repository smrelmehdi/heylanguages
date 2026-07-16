#!/usr/bin/env python3
"""Expand lesson word arrays in constants/words.ts to 12+ words each."""

import re

WORDS_FILE = '/Users/mehdi/Desktop/HeyYusuf/constants/words.ts'

# Each entry: (anchor_string, new_words_to_append_before_closing_bracket)
EXPANSIONS = [
    # ── GRAMMAR_PRONOUNS: add 4 words (8 → 12) ─────────────────────────────
    (
        "audio: require('../assets/audio/unit-5/grammar-pronouns/8.mp3') },\n];",
        """  { arabic: 'كُلُّنَا',     displayArabic: 'كلنا',        audioText: 'كلنا',        transliteration: 'kullna',       english: 'All of us',         context: '👥 Inclusive group',  example: 'إحنا كلنا بخير',      exampleTranslation: "We're all fine" },
  { arabic: 'وَاحِد مِنَّا', displayArabic: 'واحد منا',    audioText: 'واحد منا',    transliteration: 'waahid minna', english: 'One of us',          context: '👤 Part of a group' },
  { arabic: 'نَفسِي',        displayArabic: 'نفسي',        audioText: 'نفسي',        transliteration: 'nafsi',        english: 'Myself / by myself', context: '💪 Emphasis',          example: 'أنا بنفسي',           exampleTranslation: 'I by myself' },
  { arabic: 'مِنُو أَنتَ؟',  displayArabic: 'منو أنت؟',    audioText: 'منو أنت؟',    transliteration: 'minu inta?',   english: 'Who are you?',       context: '❓ Gulf question' },""",
    ),
    # ── GRAMMAR_THIS_THAT: add 4 words (8 → 12) ─────────────────────────────
    (
        "audio: require('../assets/audio/unit-5/grammar-this-that/8.mp3') },\n];",
        """  { arabic: 'هَذَا مَالِي',     displayArabic: 'هذا مالي',      audioText: 'هذا مالي',      transliteration: 'haadha maalii',   english: 'This is mine',          context: '✋ Possession sentence' },
  { arabic: 'ذَاك مَالَه',     displayArabic: 'ذاك ماله',      audioText: 'ذاك ماله',      transliteration: 'dhaak maalah',    english: 'That is his',           context: '👤 Possession sentence' },
  { arabic: 'أَعطِيني هَذَا', displayArabic: 'أعطيني هذا',    audioText: 'أعطيني هذا',    transliteration: "a'Tiini haadha",  english: 'Give me this',          context: '👆 Pointing request' },
  { arabic: 'هَذَا أَو ذَاك؟', displayArabic: 'هذا أو ذاك؟',  audioText: 'هذا أو ذاك؟',  transliteration: 'haadha aw dhaak?', english: 'This one or that one?', context: '❓ Choosing between two' },""",
    ),
    # ── GRAMMAR_POSSESSIVES: add 3 words (9 → 12) ───────────────────────────
    (
        "audio: require('../assets/audio/unit-5/grammar-possessives/9.mp3') },\n];",
        """  { arabic: 'حَقَّهُم',            displayArabic: 'حقهم',           audioText: 'حگهم',           transliteration: 'haggahum',          english: 'Theirs',              context: '👥 For a group' },
  { arabic: 'مَالَكُم',          displayArabic: 'مالكم',          audioText: 'مالكم',          transliteration: 'maalakum',          english: "Y'all's / Yours (pl)", context: '👥 Talking to a group' },
  { arabic: 'مَالِي وَمَالَك',   displayArabic: 'مالي ومالك',    audioText: 'مالي ومالك',    transliteration: 'maalii wa maalak',  english: 'Mine and yours',       context: '🤝 Sharing ownership' },""",
    ),
    # ── GRAMMAR_PRESENT_VERBS: add 4 words (8 → 12) ─────────────────────────
    (
        "audio: require('../assets/audio/unit-5/grammar-present-verbs/8.mp3') },\n];",
        """  { arabic: 'أَلْعَب',   displayArabic: 'ألعب',    audioText: 'ألعب',    transliteration: "al'ab",  english: 'I play',    context: '⚽ Present tense', example: 'ألعب كرة',           exampleTranslation: 'I play football' },
  { arabic: 'أَشُوف',   displayArabic: 'أشوف',    audioText: 'أشوف',    transliteration: 'ashouf',  english: 'I see / watch', context: '👁️ Present tense', example: 'أشوف تلفزيون',     exampleTranslation: 'I watch TV' },
  { arabic: 'أَكتُب',   displayArabic: 'أكتب',    audioText: 'أكتب',    transliteration: 'aktub',   english: 'I write',   context: '✍️ Present tense' },
  { arabic: 'أَسمَع',   displayArabic: 'أسمع',    audioText: 'أسمع',    transliteration: "asma'",   english: 'I listen',  context: '🎧 Present tense', example: 'أسمع موسيقى',       exampleTranslation: 'I listen to music' },""",
    ),
    # ── GRAMMAR_PAST_VERBS: add 4 words (8 → 12) ────────────────────────────
    (
        "audio: require('../assets/audio/unit-5/grammar-past-verbs/8.mp3') },\n];",
        """  { arabic: 'لَعَبت',  displayArabic: 'لعبت',   audioText: 'لعبت',   transliteration: "la'abt",  english: 'I played',        context: '⚽ Past tense', example: 'لعبت كرة',     exampleTranslation: 'I played football' },
  { arabic: 'شُفت',   displayArabic: 'شفت',    audioText: 'شفت',    transliteration: 'shuft',   english: 'I saw / watched', context: '👁️ Past tense', example: 'شفت الفيلم',   exampleTranslation: 'I watched the film' },
  { arabic: 'كَتَبت', displayArabic: 'كتبت',   audioText: 'كتبت',   transliteration: 'katabt',  english: 'I wrote',         context: '✍️ Past tense' },
  { arabic: 'سَمَعت', displayArabic: 'سمعت',   audioText: 'سمعت',   transliteration: "sama't",  english: 'I heard',         context: '👂 Past tense' },""",
    ),
    # ── GRAMMAR_WANT_NEED: add 4 words (8 → 12) ─────────────────────────────
    (
        "audio: require('../assets/audio/unit-5/grammar-want-need/8.mp3') },\n];",
        """  { arabic: 'نَبِي',                displayArabic: 'نبي',              audioText: 'نبي',              transliteration: 'nabi',            english: 'We want (Gulf)',         context: '👥 Gulf plural want', example: 'نبي نروح',           exampleTranslation: 'We want to go' },
  { arabic: 'وَيش تَبِي؟',          displayArabic: 'ويش تبي؟',         audioText: 'ويش تبي؟',         transliteration: 'waish tabi?',     english: 'What do you want?',      context: '❓ Gulf question' },
  { arabic: 'مَا أَحتَاج',          displayArabic: 'ما أحتاج',         audioText: 'ما أحتاج',         transliteration: 'ma ahtaaj',       english: "I don't need",           context: '❌ Negated need' },
  { arabic: 'أَبِي أَشرَب مَاء',    displayArabic: 'أبي أشرب ماء',    audioText: 'أبي أشرب ماء',    transliteration: "abi ashrab maa'", english: 'I want to drink water',  context: '💧 Want + verb' },""",
    ),
    # ── GRAMMAR_QUESTIONS: add 4 words (8 → 12) ─────────────────────────────
    (
        "audio: require('../assets/audio/unit-5/grammar-questions/8.mp3') },\n];",
        """  { arabic: 'مِن وَيْن؟',        displayArabic: 'من وين؟',       audioText: 'من وين؟',       transliteration: 'min wain?',     english: 'From where?',          context: '❓ Gulf question', example: 'من وين أنت؟',        exampleTranslation: 'Where are you from?' },
  { arabic: 'بِكَم هَذَا؟',     displayArabic: 'بكم هذا؟',      audioText: 'بكم هذا؟',      transliteration: 'bikam haadha?', english: 'How much is this?',    context: '💰 Shopping question' },
  { arabic: 'إِيش سَوَّيت؟',    displayArabic: 'إيش سويت؟',     audioText: 'إيش سويت؟',     transliteration: 'eish sawwait?', english: 'What did you do?',     context: '❓ Gulf casual' },
  { arabic: 'لَيش مَا جِيت؟',   displayArabic: 'ليش ما جيت؟',   audioText: 'ليش ما جيت؟',   transliteration: 'laish ma jiit?', english: "Why didn't you come?", context: '❓ Why question' },""",
    ),
    # ── GRAMMAR_NEGATION: add 4 words (8 → 12) ──────────────────────────────
    (
        "audio: require('../assets/audio/unit-5/grammar-negation/8.mp3') },\n];",
        """  { arabic: 'مُو هَذَا',   displayArabic: 'مو هذا',    audioText: 'مو هذا',    transliteration: 'mu haadha',   english: 'Not this one',            context: '❌ Pointing away' },
  { arabic: 'مَا رُحت',   displayArabic: 'ما رحت',    audioText: 'ما رحت',    transliteration: 'ma ruht',     english: "I didn't go",             context: '❌ Past negation' },
  { arabic: 'بَعَد لَا',  displayArabic: 'بعد لا',    audioText: 'بعد لا',    transliteration: "ba'ad la",    english: 'Not yet',                 context: '⏳ Things not done yet', example: 'بعد لا خلصت',  exampleTranslation: "I haven't finished yet" },
  { arabic: 'مُو صَحِيح', displayArabic: 'مو صحيح',   audioText: 'مو صحيح',   transliteration: 'mu sahiih',   english: "That's not right",        context: '❌ Correcting someone' },""",
    ),
    # ── GRAMMAR_ADJECTIVES: add 4 words (11 → 15) ───────────────────────────
    (
        "audio: require('../assets/audio/unit-5/grammar-adjectives/11.mp3') },\n];",
        """  { arabic: 'جَمِيل', displayArabic: 'جميل', audioText: 'جميل', transliteration: 'jamiil',  english: 'Beautiful (formal)', context: '✨ More formal than حلو',  example: 'منظر جميل',      exampleTranslation: 'A beautiful view' },
  { arabic: 'نَظِيف', displayArabic: 'نظيف', audioText: 'نظيف', transliteration: 'nadhiif', english: 'Clean',              context: '🧹 Cleanliness',           example: 'الغرفة نظيفة',   exampleTranslation: 'The room is clean' },
  { arabic: 'وَسِخ',  displayArabic: 'وسخ',  audioText: 'وسخ',  transliteration: 'wasikh',  english: 'Dirty',              context: '🚫 Negative quality' },
  { arabic: 'لَذِيذ', displayArabic: 'لذيذ', audioText: 'لذيذ', transliteration: 'ladhiidh', english: 'Delicious',          context: '🍽️ Food description',     example: 'الأكل لذيذ',    exampleTranslation: 'The food is delicious' },""",
    ),
    # ── GRAMMAR_SENTENCES: add 6 words (6 → 12) ─────────────────────────────
    (
        "audio: require('../assets/audio/unit-5/grammar-sentences/6.mp3') },\n];",
        """  { arabic: 'وَيْن المَطعَم؟',                           displayArabic: 'وين المطعم؟',                         audioText: 'وين المطعم؟',                         transliteration: "wain il-mat'am?",               english: 'Where is the restaurant?',     context: '🍴 Full sentence' },
  { arabic: 'أَبِي أَتكَلَّم عَرَبِي زَيْن',              displayArabic: 'أبي أتكلم عربي زين',                 audioText: 'أبي أتكلم عربي زين',                 transliteration: "abi atkallam 'arabi zain",       english: 'I want to speak Arabic well',  context: '💬 Full sentence' },
  { arabic: 'كَم الحِسَاب لَو سَمَحت؟',                  displayArabic: 'كم الحساب لو سمحت؟',                  audioText: 'كم الحساب لو سمحت؟',                  transliteration: 'kam il-hisaab law samaht?',      english: 'How much is the bill please?', context: '🧾 Full sentence' },
  { arabic: 'مِن وَيْن أَنتَ؟',                           displayArabic: 'من وين أنت؟',                         audioText: 'من وين أنت؟',                         transliteration: 'min wain inta?',                 english: 'Where are you from?',          context: '🌍 Full sentence' },
  { arabic: 'لَازِم أَرُوح الحَيْن',                      displayArabic: 'لازم أروح الحين',                     audioText: 'لازم أروح الحين',                     transliteration: 'laazim arooh il-heen',            english: 'I have to go now',             context: '⏰ Full sentence' },
  { arabic: 'الجَو حَار وَايِد اليَوم',                   displayArabic: 'الجو حار وايد اليوم',                 audioText: 'الجو حار وايد اليوم',                 transliteration: 'il-jaww haar waayid il-yawm',    english: 'The weather is very hot today', context: '☀️ Full sentence' },""",
    ),
]

# ── Work & Social expansions ─────────────────────────────────────────────────
WORK_SOCIAL_EXPANSIONS = [
    # WORK_OFFICE: anchor on last word in its array
    (
        "{ arabic: 'قِسم',        displayArabic: 'قسم',        audioText: 'قسم',        transliteration: 'qism',         english: 'Department',     context: '🏢 Company structure' },\n];",
        """  { arabic: 'زَمِيل',      displayArabic: 'زميل',       audioText: 'زميل',       transliteration: 'zameel',       english: 'Colleague',      context: '🤝 Workmate',     example: 'زميلي في العمل',  exampleTranslation: 'My colleague at work' },
  { arabic: 'مُدِير عَام', displayArabic: 'مدير عام',   audioText: 'مدير عام',   transliteration: "mudeer 'aam",  english: 'General Manager', context: '👔 Top boss' },
  { arabic: 'طَابِع',      displayArabic: 'طابع',        audioText: 'طابع',        transliteration: 'taabi\'',       english: 'Printer',        context: '🖨️ Office equipment' },
  { arabic: 'اِجتِمَاع',   displayArabic: 'اجتماع',      audioText: 'اجتماع',      transliteration: 'ijtimaa\'',     english: 'Meeting',        context: '📅 Work event' },""",
    ),
    # WORK_GREETINGS: anchor last word
    (
        "{ arabic: 'وَإِيَّاكُم',      displayArabic: 'وإياكم',     audioText: 'وإياكم',     transliteration: 'wa iyyaakum',   english: 'Same to you all', context: '🔄 Response to group', example: 'وإياكم الله يعطيكم العافية', exampleTranslation: 'And same to you all' },\n];",
        """  { arabic: 'خَيْر إن شَاء الله',        displayArabic: 'خير إن شاء الله',       audioText: 'خير إن شاء الله',       transliteration: 'khair in shaa allah',        english: "Hope everything's good",   context: '🙏 Reassuring response' },
  { arabic: 'وَيش أَخبَارَك؟',           displayArabic: 'ويش أخبارك؟',           audioText: 'ويش أخبارك؟',           transliteration: 'waish akhbaarak?',           english: "What's your news?",        context: '💬 Casual check-in' },
  { arabic: 'كُل شَيء تَمَام',           displayArabic: 'كل شيء تمام',           audioText: 'كل شيء تمام',           transliteration: 'kull shay tamaam',           english: "Everything's fine",        context: '✅ Positive reply' },
  { arabic: 'الحَمد لله مَا نِشكِي',     displayArabic: 'الحمد لله ما نشكي',     audioText: 'الحمد لله ما نشكي',     transliteration: 'il-hamdu lillah ma nishki',  english: "Praise God, can't complain", context: '🙏 Gulf saying' },
  { arabic: 'شلونَك اليَوم؟',            displayArabic: 'شلونك اليوم؟',          audioText: 'شلونك اليوم؟',          transliteration: 'shloonak il-yawm?',          english: 'How are you today?',       context: '👋 Gulf greeting' },
  { arabic: 'الشُّغُل كَيفه؟',           displayArabic: 'الشغل كيفه؟',           audioText: 'الشغل كيفه؟',           transliteration: 'ish-shughul kaifah?',        english: "How's work going?",        context: '💼 Work small talk' },""",
    ),
    # WORK_MEETING: anchor last word
    (
        "{ arabic: 'مَا فِيه وَقت',    displayArabic: 'ما فيه وقت',   audioText: 'ما فيه وقت',   transliteration: 'ma feeh waqt',  english: 'No time',       context: '⏰ Common work complaint' },\n];",
        """  { arabic: 'مِن رَأيَك؟',    displayArabic: 'من رأيك؟',     audioText: 'من رأيك؟',     transliteration: "min ra'yak?",   english: "What's your opinion?",   context: '💭 Asking for input' },
  { arabic: 'وَاضِح',        displayArabic: 'واضح',          audioText: 'واضح',          transliteration: 'waadhih',        english: 'Clear / understood',     context: '✅ Confirming understanding' },
  { arabic: 'لَازِم نِفكِّر', displayArabic: 'لازم نفكر',     audioText: 'لازم نفكر',     transliteration: 'laazim nifakkir', english: 'We need to think',       context: '🤔 Deliberation' },
  { arabic: 'قَرَّرنا',       displayArabic: 'قررنا',          audioText: 'قررنا',          transliteration: 'qarrarna',        english: 'We decided',             context: '✅ Decision made' },""",
    ),
    # WORK_PHONE_CALLS: anchor last word
    (
        "{ arabic: 'رَقمك وَيش هُو؟', displayArabic: 'رقمك ويش هو؟', audioText: 'رقمك ويش هو؟', transliteration: 'raqmak waish hu?', english: \"What's your number?\", context: '📱 Asking for contact' },\n];",
        """  { arabic: 'الخَط مَقطُوع',     displayArabic: 'الخط مقطوع',     audioText: 'الخط مقطوع',     transliteration: 'il-khat maqtoo\'',  english: 'The call dropped',        context: '📵 Call problem' },
  { arabic: 'أَرسِل لِي واتساب',  displayArabic: 'أرسل لي واتساب',  audioText: 'أرسل لي واتساب',  transliteration: 'arsil li waatsaab', english: 'Send me a WhatsApp',      context: '💬 Gulf communication' },
  { arabic: 'الرَّقم غَلَط',       displayArabic: 'الرقم غلط',       audioText: 'الرقم غلط',       transliteration: 'ir-raqam ghalat',   english: 'Wrong number',            context: '❌ Dialing mistake' },
  { arabic: 'مَشغُول',             displayArabic: 'مشغول',            audioText: 'مشغول',            transliteration: 'mashghool',         english: 'Busy',                    context: '📵 Line busy' },""",
    ),
    # WORK_EMAIL: anchor last word
    (
        "{ arabic: 'تَأكِيد',     displayArabic: 'تأكيد',    audioText: 'تأكيد',    transliteration: 'ta\'kiid',    english: 'Confirmation',   context: '✅ Email action' },\n];",
        """  { arabic: 'مَرفَق',      displayArabic: 'مرفق',      audioText: 'مرفق',      transliteration: 'marfaq',       english: 'Attachment',     context: '📎 Email attachment' },
  { arabic: 'بِالتَّفصِيل', displayArabic: 'بالتفصيل',  audioText: 'بالتفصيل',  transliteration: 'bit-tafsiil',  english: 'In detail',      context: '📝 Detailed email' },
  { arabic: 'مِلَفّ',       displayArabic: 'ملف',         audioText: 'ملف',         transliteration: 'malaff',        english: 'File',           context: '📁 Document' },
  { arabic: 'اِطَّلَع عَلَيه', displayArabic: 'اطلع عليه', audioText: 'اطلع عليه', transliteration: 'ittala\' alaih', english: 'Review it / Check it', context: '👁️ Review request' },""",
    ),
    # WORK_SCHEDULE: anchor last word
    (
        "{ arabic: 'أَجَّل',   displayArabic: 'أجّل',   audioText: 'أجّل',   transliteration: 'ajjal',     english: 'Postpone',    context: '🔄 Rescheduling' },\n];",
        """  { arabic: 'اِجتِمَاع طَارِئ', displayArabic: 'اجتماع طارئ', audioText: 'اجتماع طارئ', transliteration: "ijtimaa' taari'",  english: 'Emergency meeting',  context: '🚨 Urgent call' },
  { arabic: 'كَنسَل',           displayArabic: 'كنسل',         audioText: 'كنسل',         transliteration: 'kansal',           english: 'Cancel (Gulf loanword)', context: '❌ Cancel' },
  { arabic: 'غَيَّر المَوعِد',   displayArabic: 'غير الموعد',   audioText: 'غير الموعد',   transliteration: 'ghayyar il-maw\'id', english: 'Reschedule',         context: '🔄 Change time' },
  { arabic: 'مُلتَزِم',          displayArabic: 'ملتزم',         audioText: 'ملتزم',         transliteration: 'multazim',         english: 'Committed / on time', context: '✅ Reliability' },""",
    ),
    # WORK_PROBLEMS: anchor last word
    (
        "{ arabic: 'وَيش المُشكِلَة؟', displayArabic: 'ويش المشكلة؟', audioText: 'ويش المشكلة؟', transliteration: 'waish il-mushkila?', english: \"What's the problem?\", context: '❓ Asking for issue details' },\n];",
        """  { arabic: 'عَاجِل',              displayArabic: 'عاجل',              audioText: 'عاجل',              transliteration: 'aajil',             english: 'Urgent',                  context: '🚨 Time-sensitive' },
  { arabic: 'مَا فِيه حَل',       displayArabic: 'ما فيه حل',         audioText: 'ما فيه حل',         transliteration: 'ma feeh hal',        english: 'No solution',             context: '😰 Stuck situation' },
  { arabic: 'تَقدَر تِجِي هِنَا؟', displayArabic: 'تقدر تجي هنا؟',     audioText: 'تقدر تجي هنا؟',     transliteration: 'taqdar tijii hina?', english: 'Can you come here?',      context: '📍 Calling for help' },
  { arabic: 'الأَمر خَطِير',       displayArabic: 'الأمر خطير',         audioText: 'الأمر خطير',         transliteration: 'il-amr khateer',    english: 'The matter is serious',   context: '⚠️ Severity warning' },""",
    ),
    # WORK_SMALLTALK: anchor last word
    (
        "{ arabic: 'اَلنَّهَارده لَطِيف', displayArabic: 'النهارده لطيف', audioText: 'النهارده لطيف', transliteration: 'in-naharda latiif', english: \"Today's nice\", context: '☀️ Office small talk' },\n];",
        """  { arabic: 'وَيش اِكَلتَ اليَوم؟', displayArabic: 'ويش أكلت اليوم؟', audioText: 'ويش أكلت اليوم؟', transliteration: 'waish akalt il-yawm?', english: 'What did you eat today?',   context: '🍽️ Lunch chat' },
  { arabic: 'شُفت المُبَاراة؟',     displayArabic: 'شفت المباراة؟',     audioText: 'شفت المباراة؟',     transliteration: 'shuft il-mubaaraah?', english: 'Did you watch the match?', context: '⚽ Sports chat' },
  { arabic: 'الجَو حَار اليَوم',    displayArabic: 'الجو حار اليوم',    audioText: 'الجو حار اليوم',    transliteration: 'il-jaww haar il-yawm', english: "Today's hot",              context: '🌡️ Weather chat' },
  { arabic: 'أَشوفَك بَاجِر',       displayArabic: 'أشوفك باجر',        audioText: 'أشوفك باجر',        transliteration: 'ashooufak baajir',    english: 'See you tomorrow',         context: '👋 Sign-off' },""",
    ),
    # WORK_SALARY: anchor last word
    (
        "{ arabic: 'مَكَافَأَة',   displayArabic: 'مكافأة',   audioText: 'مكافأة',   transliteration: 'makaafa\'a',  english: 'Bonus',         context: '💰 Extra pay' },\n];",
        """  { arabic: 'بَدَل',              displayArabic: 'بدل',             audioText: 'بدل',             transliteration: 'badal',            english: 'Allowance',             context: '💵 Extra allowance (housing, transport)' },
  { arabic: 'نِهَايَة الخِدمَة',  displayArabic: 'نهاية الخدمة',   audioText: 'نهاية الخدمة',   transliteration: 'nihaayat il-khidma', english: 'End-of-service gratuity', context: '📋 Gulf labor term' },
  { arabic: 'زِيَادَة',           displayArabic: 'زيادة',           audioText: 'زيادة',           transliteration: 'ziyaada',          english: 'Raise / Increase',      context: '📈 Salary increase' },
  { arabic: 'مَطلُوبَات',          displayArabic: 'مطلوبات',         audioText: 'مطلوبات',         transliteration: 'matloobaat',        english: 'Benefits / Requirements', context: '📋 Job benefits' },""",
    ),
    # WORK_LEAVING: anchor last word
    (
        "{ arabic: 'مَع السَّلامَة',   displayArabic: 'مع السلامة',   audioText: 'مع السلامة',   transliteration: 'ma\\'as-salaama',   english: 'Goodbye (safe travels)', context: '👋 Farewell' },\n];",
        """  { arabic: 'بَاجِر نِكمِل',       displayArabic: 'باجر نكمل',        audioText: 'باجر نكمل',        transliteration: 'baajir nikmil',        english: "Tomorrow we'll continue", context: '📅 End of day' },
  { arabic: 'أَشوفَك قَرِيب',       displayArabic: 'أشوفك قريب',       audioText: 'أشوفك قريب',       transliteration: 'ashooufak qariib',     english: 'See you soon',            context: '👋 Casual farewell' },
  { arabic: 'الله مَعَك',           displayArabic: 'الله معك',          audioText: 'الله معك',          transliteration: 'allah ma\'ak',         english: 'God be with you',         context: '🙏 Warm farewell' },
  { arabic: 'مَا نِشوف إلا الخَيْر', displayArabic: 'ما نشوف إلا الخير', audioText: 'ما نشوف إلا الخير', transliteration: 'ma nishouf illa il-khair', english: 'May we see only good',    context: '🙏 Gulf blessing' },""",
    ),
    # SOCIAL_GREETINGS: anchor last word
    (
        "{ arabic: 'تِشَرَّفنَا',      displayArabic: 'تشرفنا',       audioText: 'تشرفنا',       transliteration: 'tisharrafna',     english: 'Honored to meet you', context: '🤝 Formal meeting' },\n];",
        """  { arabic: 'أَهلاً وَسَهلاً',  displayArabic: 'أهلاً وسهلاً',  audioText: 'أهلاً وسهلاً',  transliteration: 'ahlan wa sahlan',   english: 'Welcome (formal)',          context: '🏠 Welcoming guests' },
  { arabic: 'زُورُونَا',         displayArabic: 'زورونا',         audioText: 'زورونا',         transliteration: 'zooroona',          english: 'Visit us (invitation)',     context: '🏠 Gulf hospitality' },
  { arabic: 'شَرَّفتُونَا',       displayArabic: 'شرفتونا',        audioText: 'شرفتونا',        transliteration: 'sharrftoona',       english: 'You honored us with your visit', context: '🙏 When guests arrive' },
  { arabic: 'حَيَّاك الله',       displayArabic: 'حياك الله',      audioText: 'حياك الله',      transliteration: 'hayyaak allah',     english: 'God bless you (welcome)',  context: '🙏 Gulf greeting' },""",
    ),
    # SOCIAL_INVITATIONS: anchor last word
    (
        "{ arabic: 'تَعَال مَعَنَا',  displayArabic: 'تعال معنا',   audioText: 'تعال معنا',   transliteration: 'ta\'aal ma\'ana',   english: 'Come with us',      context: '👥 Group invitation' },\n];",
        """  { arabic: 'أَبِي أَدعُوك',     displayArabic: 'أبي أدعوك',     audioText: 'أبي أدعوك',     transliteration: "abi ad'ouk",     english: 'I want to invite you', context: '📩 Personal invitation' },
  { arabic: 'تَعَشَّى عِندَنا',   displayArabic: 'تعشى عندنا',    audioText: 'تعشى عندنا',    transliteration: "ta'ashsha 'indana", english: 'Have dinner with us',  context: '🍽️ Dinner invitation' },
  { arabic: 'دَعوَة',            displayArabic: 'دعوة',           audioText: 'دعوة',           transliteration: "da'wa",          english: 'Invitation',           context: '📩 Formal invite' },
  { arabic: 'اِنبَسَط',          displayArabic: 'انبسط',          audioText: 'انبسط',          transliteration: 'inbasat',         english: 'Enjoy yourself!',      context: '🎉 Wishing fun' },""",
    ),
    # SOCIAL_RAMADAN: anchor last word
    (
        "{ arabic: 'إِفطَار',           displayArabic: 'إفطار',          audioText: 'إفطار',          transliteration: 'iftaar',        english: 'Iftar (breaking fast)',  context: '🌙 Breaking the fast meal' },\n];",
        """  { arabic: 'تَراوِيح',          displayArabic: 'تراويح',         audioText: 'تراويح',         transliteration: 'taraawiyh',      english: 'Taraweh prayers',       context: '🕌 Ramadan night prayers' },
  { arabic: 'زَكاة',             displayArabic: 'زكاة',            audioText: 'زكاة',            transliteration: 'zakaah',         english: 'Zakat (charity)',       context: '💚 Islamic pillar' },
  { arabic: 'لَيلَة القَدر',     displayArabic: 'ليلة القدر',      audioText: 'ليلة القدر',      transliteration: 'lailat il-qadr', english: 'The Night of Power',    context: '✨ Most blessed night' },
  { arabic: 'الهِلَال',          displayArabic: 'الهلال',          audioText: 'الهلال',          transliteration: 'il-hilaal',      english: 'The crescent moon',     context: '🌙 Start of Ramadan' },""",
    ),
    # SOCIAL_COMPLIMENTS: anchor last word
    (
        "{ arabic: 'مَا شَاء اللَّه',   displayArabic: 'ما شاء الله',  audioText: 'ما شاء الله',  transliteration: 'ma shaa allah',  english: 'Mashallah!',            context: '🙏 Admiring without evil eye' },\n];",
        """  { arabic: 'أَبشِر',             displayArabic: 'أبشر',           audioText: 'أبشر',           transliteration: 'abshir',          english: 'Great news! / Sure!',  context: '🎉 Gulf positive response' },
  { arabic: 'عَلَى خَير دَايِمًا', displayArabic: 'على خير دايماً', audioText: 'على خير دايما', transliteration: 'ala khair daayiman', english: 'Always well',          context: '🙏 Blessing someone' },
  { arabic: 'حَبِيبِي',           displayArabic: 'حبيبي',           audioText: 'حبيبي',           transliteration: 'habiibi',          english: 'My dear (to a man)',   context: '💛 Affectionate address' },
  { arabic: 'يَسعِدَك',           displayArabic: 'يسعدك',           audioText: 'يسعدك',           transliteration: "yis'idak",         english: 'May you be happy',     context: '🙏 Response to compliment' },""",
    ),
    # SOCIAL_CONDOLENCES: anchor last word
    (
        "{ arabic: 'خَسَارَة كَبِيرَة',  displayArabic: 'خسارة كبيرة',  audioText: 'خسارة كبيرة',  transliteration: 'khasaara kabiira',  english: 'A great loss',          context: '💔 Expressing loss' },\n];",
        """  { arabic: 'الصَّبر والسَّلامَة', displayArabic: 'الصبر والسلامة', audioText: 'الصبر والسلامة', transliteration: 'is-sabr was-salaama', english: 'Patience and safety',   context: '🙏 Comfort phrase' },
  { arabic: 'إِنَّا لِلَّهِ',       displayArabic: 'إنا لله',         audioText: 'إنا لله',         transliteration: 'inna lillaah',       english: 'We belong to God',      context: '🕊️ Said at time of loss' },
  { arabic: 'رَبُّنا يَرحَمه',      displayArabic: 'ربنا يرحمه',      audioText: 'ربنا يرحمه',      transliteration: 'rabbuna yarhamah',   english: 'May God have mercy on him', context: '🙏 For the deceased' },
  { arabic: 'الله يُقَوِّيَك',       displayArabic: 'الله يقويك',      audioText: 'الله يقويك',      transliteration: 'allah yuqawwiik',    english: 'May God give you strength', context: '💪 Support phrase' },""",
    ),
]

def main():
    with open(WORDS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    errors = []
    
    all_expansions = EXPANSIONS + WORK_SOCIAL_EXPANSIONS
    
    for i, (anchor, new_words) in enumerate(all_expansions):
        if anchor not in content:
            errors.append(f"[{i}] Anchor NOT FOUND:\n  {anchor[:80]}...")
            continue
        # Insert new_words before the closing "];"
        # The anchor ends with "\n];" — insert new_words before the "];"
        insert_point = anchor.rfind('\n];')
        before = anchor[:insert_point]
        after = anchor[insert_point:]
        replacement = before + '\n' + new_words + after
        content = content.replace(anchor, replacement, 1)
        print(f"[{i}] ✅ Expanded")
    
    if errors:
        print("\n⚠️  ERRORS:")
        for e in errors:
            print(e)
    
    if content != original:
        with open(WORDS_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\n✅ File saved. {len(all_expansions) - len(errors)}/{len(all_expansions)} expansions applied.")
    else:
        print("\n⚠️  No changes made.")

if __name__ == '__main__':
    main()
