import type { QuizQuestion } from './quiz-types';

export const QUIZ_UNIT6_QUESTIONS: QuizQuestion[] = [

  // ── Scene Replay × 4 ──────────────────────────────────────────────────────

  {
    id: 'u6_sr1',
    format: 'scene_replay',
    scenarioSource: 'morningroutine',
    xpValue: 10,
    sceneImage: require('../assets/images/cafe-bg.png'),
    audioFile: null,
    audioText: 'تُرِيدُ فُطُور؟',
    prompt: 'Umm Yusuf asks if you want breakfast. What is the correct response?',
    options: [
      { arabic: 'إِيه، أَنَا جُوعَان',    transliteration: "ih, ana joo'aan",        isCorrect: true  },
      { arabic: 'أَبِي أَفْتَح حِسَاب',   transliteration: 'abi aftah hisaab',       isCorrect: false },
      { arabic: 'لَا مُشْكِلَة',           transliteration: 'la mushkila',            isCorrect: false },
      { arabic: 'مِن أَمْسِ',              transliteration: 'min ams',                isCorrect: false },
    ],
  },

  {
    id: 'u6_sr2',
    format: 'scene_replay',
    scenarioSource: 'doctorvisit',
    xpValue: 10,
    sceneImage: require('../assets/images/dubai-pharmacy-interior.png'),
    audioFile: null,
    audioText: 'إِيش فِيكَ؟',
    prompt: "The doctor asks what's wrong. What do you say?",
    options: [
      { arabic: 'عِنْدِي صُدَاع وَحُمَّى', transliteration: "'indi sudaa' wa humma",  isCorrect: true  },
      { arabic: 'أَنَا كَذَلِك',            transliteration: 'ana kathalik',           isCorrect: false },
      { arabic: 'بِتَشَوَّق',               transliteration: 'bitashawwaq',            isCorrect: false },
      { arabic: 'قَهْوَة عَرَبِي',          transliteration: "qahwa 'arabi",           isCorrect: false },
    ],
  },

  {
    id: 'u6_sr3',
    format: 'scene_replay',
    scenarioSource: 'atbank',
    xpValue: 10,
    sceneImage: require('../assets/images/dubai-hotel-reception.png'),
    audioFile: null,
    audioText: 'كَيْف أَقْدَر أُسَاعِدَك؟',
    prompt: 'The bank employee asks how he can help. What do you say?',
    options: [
      { arabic: 'أَبِي أَفْتَح حِسَاب',   transliteration: 'abi aftah hisaab',       isCorrect: true  },
      { arabic: 'وَاجِد حَرّ اَلْيَوْم',  transliteration: 'waajid harr al-yoom',    isCorrect: false },
      { arabic: 'مَجْبُوس دَجَاج',         transliteration: 'majbuus dajaaj',         isCorrect: false },
      { arabic: 'أَهْلاً عَمِّي',          transliteration: "'ahlan 'ammi",           isCorrect: false },
    ],
  },

  {
    id: 'u6_sr4',
    format: 'scene_replay',
    scenarioSource: 'neighborvisit',
    xpValue: 10,
    sceneImage: require('../assets/images/cafe-bg.png'),
    audioFile: null,
    audioText: 'بِالْهَيْل؟',
    prompt: 'Your neighbour asks if you want cardamom in your coffee. What do you say?',
    options: [
      { arabic: 'إِيه، أَحِبّ هَيْل',     transliteration: 'ih, ahibb hail',         isCorrect: true  },
      { arabic: 'مِن أَمْسِ',              transliteration: 'min ams',                isCorrect: false },
      { arabic: 'شْوَي بَسْ أَكْمِل',     transliteration: 'shway bas akmal',        isCorrect: false },
      { arabic: 'تَفَضَّلِي',              transliteration: 'tafaddali',              isCorrect: false },
    ],
  },

  // ── Fill the Conversation × 4 ─────────────────────────────────────────────

  {
    id: 'u6_fc1',
    format: 'fill_conversation',
    scenarioSource: 'gymvisit',
    xpValue: 10,
    dialogue: [
      { speaker: 'npc',   arabic: 'جَاهِز تِتْمَرَّن؟',     transliteration: 'jaahiz titmarra?',       isBlank: false },
      { speaker: 'yusuf', arabic: '___',                      transliteration: '???',                    isBlank: true  },
      { speaker: 'npc',   arabic: 'نِبْدَأ بِالإِحْمَاء',    transliteration: "nibda' bil-ihma'",        isBlank: false },
    ],
    options: [
      { arabic: 'إِيه، جَاهِز',          transliteration: 'ih, jaahiz',              isCorrect: true  },
      { arabic: 'مِن مَتَى؟',             transliteration: 'min mata?',               isCorrect: false },
      { arabic: 'بُكْرَه غُبَار',         transliteration: 'bukra ghubbaar',          isCorrect: false },
      { arabic: 'أَسْكُن فِي دُبَي',     transliteration: 'askun fi dubai',          isCorrect: false },
    ],
  },

  {
    id: 'u6_fc2',
    format: 'fill_conversation',
    scenarioSource: 'morningroutine',
    xpValue: 10,
    dialogue: [
      { speaker: 'npc',   arabic: 'شُو تِشْرَب؟ شَاي وِلَّا قَهْوَة؟', transliteration: 'shu tishrab? shaay willa qahwa?', isBlank: false },
      { speaker: 'yusuf', arabic: '___',                                  transliteration: '???',                             isBlank: true  },
    ],
    options: [
      { arabic: 'قَهْوَة عَرَبِي مِن فَضْلَك', transliteration: "'arabi min fadlak",     isCorrect: true  },
      { arabic: 'عِنْدِي صُدَاع',               transliteration: "'indi sudaa'",          isCorrect: false },
      { arabic: 'هُنَاكَ مَنْدِي',              transliteration: 'hunaak mandi',          isCorrect: false },
      { arabic: 'تَمَام شُكْراً',               transliteration: 'tamaam shukran',        isCorrect: false },
    ],
  },

  {
    id: 'u6_fc3',
    format: 'fill_conversation',
    scenarioSource: 'weatherchat',
    xpValue: 10,
    dialogue: [
      { speaker: 'npc',   arabic: 'وَاللَّه حَرّ اَلْيَوْم!', transliteration: 'wallah harr al-yoom!', isBlank: false },
      { speaker: 'yusuf', arabic: '___',                        transliteration: '???',                  isBlank: true  },
      { speaker: 'npc',   arabic: 'اَلْحَرَارَة خَمْسَة وَأَرْبَعِين', transliteration: "al-haraara khamsa wa arba'iin", isBlank: false },
    ],
    options: [
      { arabic: 'إِيه! وَاجِد حَرّ',     transliteration: 'ih! waajid harr',         isCorrect: true  },
      { arabic: 'جِيب اَلأَرُزّ',         transliteration: 'jiib al-aruzz',           isCorrect: false },
      { arabic: 'أَهْلاً وَسَهْلاً',      transliteration: 'ahlan wa sahlan',         isCorrect: false },
      { arabic: 'إِيه، تَفَضَّل',         transliteration: 'ih, tafaddal',           isCorrect: false },
    ],
  },

  {
    id: 'u6_fc4',
    format: 'fill_conversation',
    scenarioSource: 'doctorvisit',
    xpValue: 10,
    dialogue: [
      { speaker: 'npc',   arabic: 'مِن مَتَى؟',    transliteration: 'min mata?', isBlank: false },
      { speaker: 'yusuf', arabic: '___',             transliteration: '???',       isBlank: true  },
    ],
    options: [
      { arabic: 'مِن أَمْسِ',              transliteration: 'min ams',                isCorrect: true  },
      { arabic: 'لَا مُشْكِلَة',           transliteration: 'la mushkila',            isCorrect: false },
      { arabic: 'إِلَى اَللِّقَاء',        transliteration: "ila al-liqaa'",          isCorrect: false },
      { arabic: 'بِالْهَيْل',              transliteration: 'bil-hail',               isCorrect: false },
    ],
  },

  // ── Listening Challenge × 4 ───────────────────────────────────────────────

  {
    id: 'u6_lc1',
    format: 'listening',
    scenarioSource: 'fridaygathering',
    xpValue: 15,
    audioFile: null,
    audioText: 'هُنَاكَ مَنْدِي وَكَبْسَة',
    options: [
      { arabic: 'هُنَاكَ مَنْدِي وَكَبْسَة', transliteration: 'hunaak mandi wa kabsa', isCorrect: true  },
      { arabic: 'عِنْدَنَا بَيْض وَخُبْز',   transliteration: "'indana bayd wa khubz",  isCorrect: false },
      { arabic: 'جِيب اَلأَرُزّ مِن اَلرَّف', transliteration: 'jiib al-aruzz min ar-raff', isCorrect: false },
      { arabic: 'عِنْدِي صُدَاع وَحُمَّى',   transliteration: "'indi sudaa' wa humma",  isCorrect: false },
    ],
  },

  {
    id: 'u6_lc2',
    format: 'listening',
    scenarioSource: 'atbank',
    xpValue: 15,
    audioFile: null,
    audioText: 'اَلْحِسَاب يِكُون جَاهِز خِلَال أُسْبُوع',
    options: [
      { arabic: 'اَلْحِسَاب يِكُون جَاهِز خِلَال أُسْبُوع', transliteration: "al-hisaab yakuun jaahiz khilaal usbuu'", isCorrect: true  },
      { arabic: 'اَلْحَرَارَة خَمْسَة وَأَرْبَعِين',         transliteration: "al-haraara khamsa wa arba'iin",          isCorrect: false },
      { arabic: 'اَلإِفْطَار مِن سَبْعَة إِلَى عَشَرَة',    transliteration: "al-iftaar min sab'a ila 'ashara",        isCorrect: false },
      { arabic: 'عَشَر دَقَايِق عَلَى التِّرِيدْمِل',       transliteration: "'ashar daqaayiq 'ala at-treadmill",      isCorrect: false },
    ],
  },

  {
    id: 'u6_lc3',
    format: 'listening',
    scenarioSource: 'morningroutine',
    xpValue: 15,
    audioFile: null,
    audioText: 'صَبَاحُ اَلْخَيْر يَا يُوسُف',
    options: [
      { arabic: 'صَبَاحُ اَلْخَيْر يَا يُوسُف', transliteration: 'sabah al-khair ya yuusuf', isCorrect: true  },
      { arabic: 'أَهْلاً يُوسُف! تَفَضَّل',     transliteration: 'ahlan yuusuf! tafaddal',  isCorrect: false },
      { arabic: 'تَعَال يَا يُوسُف! أَهْلاً',   transliteration: "ta'aal ya yuusuf! ahlan", isCorrect: false },
      { arabic: 'اَلسَّلَامُ عَلَيْكُم يُوسُف', transliteration: "as-salaamu 'alaykum yuusuf", isCorrect: false },
    ],
  },

  {
    id: 'u6_lc4',
    format: 'listening',
    scenarioSource: 'weatherchat',
    xpValue: 15,
    audioFile: null,
    audioText: 'بُكْرَه يِقُولُون فِيه غُبَار',
    options: [
      { arabic: 'بُكْرَه يِقُولُون فِيه غُبَار', transliteration: 'bukra yaquuloon fiihi ghubbaar', isCorrect: true  },
      { arabic: 'بُكْرَه يِكُون حَرّ زِيَادَة',  transliteration: 'bukra yakuun harr ziyaada',     isCorrect: false },
      { arabic: 'بُكْرَه نِقْعُد بِالْبَيْت',    transliteration: "bukra niq'ud bil-bait",         isCorrect: false },
      { arabic: 'بُكْرَه يِبْرَد اَلْجَوّ',      transliteration: 'bukra yibrad al-jaww',          isCorrect: false },
    ],
  },

  // ── Emoji Match × 2 ──────────────────────────────────────────────────────

  {
    id: 'u6_em1',
    format: 'emoji_match',
    scenarioSource: 'unit6',
    xpValue: 10,
    pairs: [
      { arabic: 'فُطُور',     transliteration: 'futuur',     emoji: '🍳' },
      { arabic: 'حُمَّى',     transliteration: 'humma',      emoji: '🤒' },
      { arabic: 'غُبَار',     transliteration: 'ghubbaar',   emoji: '🌪️' },
      { arabic: 'قَهْوَة',    transliteration: 'qahwa',      emoji: '☕' },
    ],
  },

  {
    id: 'u6_em2',
    format: 'emoji_match',
    scenarioSource: 'unit6',
    xpValue: 10,
    pairs: [
      { arabic: 'مَجْبُوس',   transliteration: 'majbuus',    emoji: '🍚' },
      { arabic: 'حِسَاب',     transliteration: 'hisaab',     emoji: '🏦' },
      { arabic: 'هَيْل',      transliteration: 'hail',       emoji: '🌿' },
      { arabic: 'جَوَاز',     transliteration: 'jawaaz',     emoji: '🛂' },
    ],
  },

];
