import type { Word } from '../constants/words';
import { EGYPTIAN_UNIT67_AUDIO_BY_PATH } from './egyptian-unit67-audio';
import { EGYPTIAN_MODEL_ID, EGYPTIAN_VOICE_ID } from './egyptian-unit6';

type WorkEntry = [
  displayArabic: string,
  transliteration: string,
  english: string,
  context: string,
  example: string,
  exampleTranslation: string,
  explanation: string,
  acceptedTransliterations?: string[],
  audioText?: string,
];

function audioReadyText(displayArabic: string) {
  return /[.!؟]$/.test(displayArabic) ? displayArabic : `${displayArabic}.`;
}

function lesson(folder: string, entries: WorkEntry[]): Word[] {
  return entries.map(([
    displayArabic,
    transliteration,
    english,
    context,
    example,
    exampleTranslation,
    explanation,
    acceptedTransliterations,
    audioText,
  ], index) => {
    const audioPath = `assets/audio/egyptian/unit-7/${folder}/${index + 1}.mp3`;
    return {
      arabic: displayArabic,
      displayArabic,
      audioText: audioText ?? audioReadyText(displayArabic),
      evalTarget: displayArabic,
      transliteration,
      acceptedTransliterations: acceptedTransliterations ?? [transliteration],
      english,
      context,
      example,
      exampleTranslation,
      explanation,
      audioPath,
      audio: EGYPTIAN_UNIT67_AUDIO_BY_PATH[audioPath],
      voiceId: EGYPTIAN_VOICE_ID,
      modelId: EGYPTIAN_MODEL_ID,
    };
  });
}

export const WORK_INTRODUCTION_WORDS_EG = lesson('work-introduction', [
  ['أنا شغال في شركة', 'ana shaghghaal fi sharika', 'I work at a company (male)', '💼 Introducing your work', 'أنا شغال في شركة سياحة', 'I work at a travel company', 'Use شغال for a male speaker.', ['ana shaghal fi sharika']],
  ['أنا شغالة في شركة', 'ana shaghghaala fi sharika', 'I work at a company (female)', '💼 Introducing your work', 'أنا شغالة في شركة سياحة', 'I work at a travel company', 'Use شغالة for a female speaker.', ['ana shaghala fi sharika']],
  ['بشتغل في القاهرة', 'bashtaghal fi el-qaahira', 'I work in Cairo', '📍 Workplace location', 'بشتغل في القاهرة من سنتين', 'I have worked in Cairo for two years', 'بشتغل is the common Egyptian present-tense form of “I work.”'],
  ['أنا جديد هنا', 'ana gedeed hina', 'I am new here (male)', '👋 First day', 'أنا جديد هنا ولسه بتعلم', 'I am new here and still learning', 'Use جديد for a male speaker.'],
  ['أنا جديدة هنا', 'ana gedeeda hina', 'I am new here (female)', '👋 First day', 'أنا جديدة هنا ولسه بتعلم', 'I am new here and still learning', 'Use جديدة for a female speaker.'],
  ['فرصة سعيدة', "forsa sa'iida", 'Nice to meet you', '🤝 Meeting a colleague', 'أنا يوسف، فرصة سعيدة', 'I am Yusuf, nice to meet you', 'A natural friendly phrase when meeting a colleague.'],
]);

export const JOB_TITLES_WORDS_EG = lesson('job-titles', [
  ['مهندس', 'mohandes', 'Engineer (male)', '🧑‍💻 Jobs', 'هو مهندس كمبيوتر', 'He is a computer engineer', 'The feminine form is مهندسة.'],
  ['مهندسة', 'mohandesa', 'Engineer (female)', '🧑‍💻 Jobs', 'هي مهندسة معمارية', 'She is an architect', 'Use مهندسة for a female engineer.'],
  ['مدرس', 'mudarres', 'Teacher (male)', '🧑‍🏫 Jobs', 'هو مدرس عربي', 'He is an Arabic teacher', 'The feminine form is مدرسة.'],
  ['دكتور', 'doktoor', 'Doctor (male)', '🩺 Jobs', 'هو دكتور في المستشفى', 'He is a doctor at the hospital', 'دكتور is common in Egyptian daily speech.'],
  ['محاسب', 'mohaaseb', 'Accountant (male)', '🧾 Jobs', 'أنا محاسب في بنك', 'I am an accountant at a bank', 'The feminine form is محاسبة.'],
  ['مدير', 'mudiir', 'Manager (male)', '👔 Jobs', 'مديري في اجتماع', 'My manager is in a meeting', 'مديري means “my manager” when ي is added.'],
  ['زميلي', 'zimiili', 'My male colleague', '🤝 Colleagues', 'زميلي اسمه أحمد', 'My colleague is called Ahmed', 'Use زميلي for a male colleague.'],
  ['زميلتي', 'zimiilti', 'My female colleague', '🤝 Colleagues', 'زميلتي اسمها منى', 'My colleague is called Mona', 'Use زميلتي for a female colleague.'],
]);

export const WORKPLACE_PLACES_WORDS_EG = lesson('workplace-places', [
  ['المكتب', 'el-maktab', 'The office', '🏢 Places at work', 'أنا في المكتب دلوقتي', 'I am at the office now', 'Use في with places.'],
  ['أوضة الاجتماعات', "oodit el-egtima'aat", 'Meeting room', '🗣️ Places at work', 'الاجتماع في أوضة الاجتماعات', 'The meeting is in the meeting room', 'أوضة الاجتماعات is natural everyday Egyptian workplace speech.'],
  ['الاستقبال', "el-isti'baal", 'Reception', '🛎️ Places at work', 'اسأل في الاستقبال', 'Ask at reception', 'A common office and hotel location.'],
  ['المخزن', 'el-makhzan', 'The storeroom', '📦 Places at work', 'الورق موجود في المخزن', 'The paper is in the storeroom', 'مخزن is used for a storage room or warehouse.'],
  ['المطبخ', 'el-matbakh', 'The kitchen', '☕ Places at work', 'القهوة في المطبخ', 'The coffee is in the kitchen', 'Many offices use مطبخ for the staff kitchen.'],
  ['الحمام', 'el-hammaam', 'The bathroom', '🚻 Places at work', 'الحمام آخر الطرقة', 'The bathroom is at the end of the corridor', 'A practical workplace location phrase.'],
]);

export const OFFICE_OBJECTS_WORDS_EG = lesson('office-objects', [
  ['الكمبيوتر', 'el-kombyuutar', 'The computer', '💻 Office objects', 'الكمبيوتر مش شغال', 'The computer is not working', 'كمبيوتر is the usual Egyptian loanword.'],
  ['الطابعة', 'et-taaba', 'The printer', '🖨️ Office objects', 'الطابعة مفيهاش ورق', 'The printer has no paper', 'طابعة is widely used in offices.'],
  ['الموبايل', 'el-mobaayil', 'The mobile phone', '📱 Office objects', 'الموبايل على المكتب', 'The mobile phone is on the desk', 'موبايل is more natural in Egypt than هاتف محمول.'],
  ['الملف', 'el-malaf', 'The file / folder', '📁 Office objects', 'الملف ده مهم', 'This file is important', 'ملف can mean a paper folder or a digital file.'],
  ['الورق', "el-wara'", 'The paper', '📄 Office objects', 'محتاج ورق للطابعة', 'I need paper for the printer', 'Egyptian speech normally replaces the final ق with a glottal stop.'],
  ['القلم', 'el-alam', 'The pen', '🖊️ Office objects', 'ممكن قلم لو سمحت؟', 'Can I have a pen please?', 'A short useful request at work.'],
]);

export const DAILY_ROUTINE_WORDS_EG = lesson('daily-routine', [
  ['بصحى الساعة سبعة', 'bas-ha es-saa saba', 'I wake up at seven', '🌅 Daily routine', 'كل يوم بصحى الساعة سبعة', 'Every day I wake up at seven', 'The present marker بـ appears in بصحى.'],
  ['بروح الشغل بالمترو', 'baruuh esh-shoghl bil-metro', 'I go to work by metro', '🚇 Daily routine', 'عادةً بروح الشغل بالمترو', 'I usually go to work by metro', 'بروح is everyday Egyptian for “I go.”'],
  ['ببدأ الشغل الساعة تسعة', 'babda esh-shoghl es-saa tisa', 'I start work at nine', '🕘 Daily routine', 'ببدأ الشغل الساعة تسعة الصبح', 'I start work at nine in the morning', 'The future form would be هبدأ.'],
  ['باخد بريك الساعة واحدة', 'baakhod break es-saa waahda', 'I take a break at one', '☕ Daily routine', 'باخد بريك نص ساعة', 'I take a half-hour break', 'بريك is common informal workplace vocabulary.'],
  ['بخلص الشغل الساعة خمسة', 'bakhallas esh-shoghl es-saa khamsa', 'I finish work at five', '🏁 Daily routine', 'غالباً بخلص الشغل الساعة خمسة', 'I usually finish work at five', 'بخلص means “I finish.”'],
  ['برجع البيت', 'barga el-beit', 'I return home', '🏠 Daily routine', 'بعد الشغل برجع البيت', 'After work I return home', 'رجع is pronounced with a hard Egyptian g sound.'],
]);

export const SCHEDULES_WORDS_EG = lesson('schedules', [
  ['الساعة كام؟', 'es-saa kam?', 'What time is it?', '🕒 Schedules', 'الاجتماع الساعة كام؟', 'What time is the meeting?', 'Use كام to ask about time in Egyptian.'],
  ['عندي اجتماع الساعة عشرة', "andi egtimaa' es-saa ashara", 'I have a meeting at ten', '📅 Schedules', 'بكرة عندي اجتماع الساعة عشرة', 'Tomorrow I have a meeting at ten', 'عندي introduces something on your schedule.'],
  ['المعاد اتغير', "el-mi'aad itghayyar", 'The appointment time changed', '🔄 Schedules', 'معلش، المعاد اتغير', 'Sorry, the appointment time changed', 'The app consistently uses معاد in casual Egyptian speech.'],
  ['أنا متأخر شوية', 'ana mitaakhkhar shwayya', 'I am a little late (male)', '⏰ Schedules', 'أنا متأخر شوية، معلش', 'I am a little late, sorry', 'Use متأخرة for a female speaker.'],
  ['هخلص إمتى؟', 'hakhallas imta?', 'When will I finish?', '🏁 Schedules', 'الشغل ده هخلصه إمتى؟', 'When will I finish this work?', 'هـ marks the future, following the app’s Egyptian convention.'],
  ['المعاد مناسب', "el-mi'aad munaasib", 'The time works', '✅ Schedules', 'أيوه، المعاد مناسب ليا', 'Yes, the time works for me', 'A natural phrase for confirming a schedule.'],
]);

export const MEETINGS_WORDS_EG = lesson('meetings', [
  ['الاجتماع بدأ', "el-egtimaa' bada", 'The meeting started', '🗣️ Meetings', 'الاجتماع بدأ من خمس دقايق', 'The meeting started five minutes ago', 'بدأ is a useful past-tense workplace verb.'],
  ['مين هيحضر؟', 'meen hayihdar?', 'Who will attend?', '👥 Meetings', 'مين هيحضر الاجتماع؟', 'Who will attend the meeting?', 'هيحضر uses the هـ future marker.'],
  ['عندي سؤال', 'andi suaal', 'I have a question', '🙋 Meetings', 'لو سمحت، عندي سؤال', 'Excuse me, I have a question', 'A polite way to enter a discussion.'],
  ['ممكن توضح أكتر؟', 'momken tawaddah aktar?', 'Can you explain more?', '💡 Meetings', 'ممكن توضح النقطة دي أكتر؟', 'Can you explain this point more?', 'وضح is common for asking someone to clarify.'],
  ['أنا موافق', "ana muwaafi'", 'I agree (male)', '✅ Meetings', 'أنا موافق على الفكرة', 'I agree with the idea', 'Use موافقة for a female speaker.'],
  ['خلينا نكمل بكرة', 'khalliina nikammil bukra', 'Let us continue tomorrow', '📅 Meetings', 'الوقت خلص، خلينا نكمل بكرة', 'Time is up, let us continue tomorrow', 'خلينا is natural Egyptian for “let us.”'],
]);

export const REQUESTS_AT_WORK_WORDS_EG = lesson('requests-at-work', [
  ['ممكن تساعدني؟', "momken tsaa'idni?", 'Can you help me?', '🤝 Work requests', 'ممكن تساعدني في الملف ده؟', 'Can you help me with this file?', 'A polite, direct request.'],
  ['ابعتلي الملف لو سمحت', "ib'atli el-malaf law samaht", 'Send me the file please', '📎 Work requests', 'ابعتلي الملف على الإيميل لو سمحت', 'Send me the file by email please', 'ابعتلي means “send to me” in Egyptian.'],
  ['ممكن تستنى دقيقة؟', "momken tistanna di'ii'a?", 'Can you wait a minute?', '⏳ Work requests', 'ممكن تستنى دقيقة لو سمحت؟', 'Can you wait a minute please?', 'Use this to ask for a short pause.'],
  ['كلمني لما تخلص', 'kallimni lamma tikhlas', 'Call me when you finish', '📞 Work requests', 'كلمني لما تخلص الاجتماع', 'Call me when you finish the meeting', 'كلمني is an everyday imperative.'],
  ['اكتب اسمك هنا', 'iktib ismak hina', 'Write your name here', '✍️ Work requests', 'اكتب اسمك هنا لو سمحت', 'Write your name here please', 'A common instruction on forms.'],
  ['خلينا نتكلم بعدين', 'khalliina nitkallim badein', 'Let us talk later', '💬 Work requests', 'أنا مشغول دلوقتي، خلينا نتكلم بعدين', 'I am busy now, let us talk later', 'Natural for postponing a conversation politely.'],
]);

export const PROBLEMS_AT_WORK_WORDS_EG = lesson('problems-at-work', [
  ['الكمبيوتر مش شغال', 'el-kombyuutar mish shaghghaal', 'The computer is not working', '⚠️ Work problems', 'ممكن تساعدني؟ الكمبيوتر مش شغال', 'Can you help me? The computer is not working', 'مش + adjective describes a current problem.'],
  ['النت فاصل', 'en-net faasil', 'The internet is down', '📶 Work problems', 'النت فاصل من الصبح', 'The internet has been down since morning', 'فاصل is a natural Egyptian way to say a service is down.'],
  ['الطابعة مفيهاش ورق', "et-taaba mafihaash wara'", 'The printer has no paper', '🖨️ Work problems', 'الطابعة مفيهاش ورق دلوقتي', 'The printer has no paper now', 'مفيهاش means “there is none in it.”'],
  ['الملف مش موجود', 'el-malaf mish mawguud', 'The file is missing', '📁 Work problems', 'دورت، بس الملف مش موجود', 'I looked, but the file is missing', 'مش موجود is a general phrase for something unavailable.'],
  ['نسيت الباسورد', 'nisiit el-password', 'I forgot the password', '🔐 Work problems', 'نسيت الباسورد ومش عارف أدخل', 'I forgot the password and cannot log in', 'نسيت is the common past form “I forgot.”'],
  ['محتاج أكلم الدعم', "mihtaag akallim ed-da'm", 'I need to call support', '🛠️ Work problems', 'المشكلة لسه موجودة، محتاج أكلم الدعم', 'The problem remains; I need to call support', 'محتاج expresses a practical need.'],
]);

export const WORKPLACE_CONVERSATION_WORDS_EG = lesson('workplace-conversation', [
  ['صباح الخير، أخبارك إيه؟', 'sabaah el-kheir, akhbaarak eih?', 'Good morning, how are things?', '👋 Workplace conversation', 'صباح الخير، أخبارك إيه النهارده؟', 'Good morning, how are things today?', 'Friendly and suitable for colleagues.'],
  ['الحمد لله، كله تمام', 'el-hamdu lillah, kollo tamaam', 'Thank God, everything is fine', '😊 Workplace conversation', 'الحمد لله، الشغل كله تمام', 'Thank God, work is all fine', 'A natural reply without excessive slang.'],
  ['كنت فين امبارح؟', 'kunt fein imbaarih?', 'Where were you yesterday?', '📅 Workplace conversation', 'كنت فين امبارح وقت الاجتماع؟', 'Where were you yesterday during the meeting?', 'كنت is the past form used with إنت.'],
  ['كنت تعبان شوية', 'kunt tabaan shwayya', 'I was a little tired (male)', '🤒 Workplace conversation', 'معلش، كنت تعبان شوية امبارح', 'Sorry, I was a little tired yesterday', 'Use تعبانة for a female speaker.'],
  ['هتعمل إيه بعد الشغل؟', "hata'mil eih bad esh-shoghl?", 'What will you do after work?', '🌆 Workplace conversation', 'هتعمل إيه بعد الشغل النهارده؟', 'What will you do after work today?', 'هـ marks the future.'],
  ['هروح البيت وأرتاح', 'haruuh el-beit w artaah', 'I will go home and rest', '🏠 Workplace conversation', 'بعد الشغل هروح البيت وأرتاح', 'After work I will go home and rest', 'Two natural future actions joined with و.'],
]);

export const EGYPTIAN_UNIT7_LESSONS = [
  { contentId: 'work-introduction', title: 'Introducing Your Work', words: WORK_INTRODUCTION_WORDS_EG },
  { contentId: 'job-titles', title: 'Job Titles', words: JOB_TITLES_WORDS_EG },
  { contentId: 'workplace-places', title: 'Workplace Places', words: WORKPLACE_PLACES_WORDS_EG },
  { contentId: 'office-objects', title: 'Office Objects', words: OFFICE_OBJECTS_WORDS_EG },
  { contentId: 'daily-routine', title: 'Daily Routine', words: DAILY_ROUTINE_WORDS_EG },
  { contentId: 'schedules', title: 'Schedules', words: SCHEDULES_WORDS_EG },
  { contentId: 'meetings', title: 'Meetings', words: MEETINGS_WORDS_EG },
  { contentId: 'requests-at-work', title: 'Requests at Work', words: REQUESTS_AT_WORK_WORDS_EG },
  { contentId: 'problems-at-work', title: 'Problems at Work', words: PROBLEMS_AT_WORK_WORDS_EG },
  { contentId: 'workplace-conversation', title: 'Workplace Conversation', words: WORKPLACE_CONVERSATION_WORDS_EG },
] as const;

export const EGYPTIAN_UNIT7_AUDIO_TARGETS = EGYPTIAN_UNIT7_LESSONS.flatMap(lessonItem =>
  lessonItem.words.map((word, index) => ({
    source: `egyptian-unit-7:${lessonItem.contentId}`,
    line: index + 1,
    text: word.audioText ?? word.displayArabic ?? word.arabic,
    outputPath: word.audioPath,
    voiceId: EGYPTIAN_VOICE_ID,
    modelId: EGYPTIAN_MODEL_ID,
  })),
);
