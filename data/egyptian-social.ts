import type { Word } from '../constants/words';
import { EGYPTIAN_UNIT810_AUDIO_BY_PATH } from './egyptian-unit810-audio';
import { EGYPTIAN_MODEL_ID, EGYPTIAN_VOICE_ID } from './egyptian-unit6';

type SocialEntry = [
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

function spoken(displayArabic: string) {
  return /[.!؟]$/.test(displayArabic) ? displayArabic : `${displayArabic}.`;
}

function accepted(transliteration: string, extra: string[] = []) {
  const plain = transliteration.replace(/[?'.,-]/g, '').replace(/\s+/g, ' ').trim();
  return [...new Set([transliteration, plain, ...extra])];
}

function lesson(folder: string, entries: SocialEntry[]): Word[] {
  return entries.map(([
    displayArabic,
    transliteration,
    english,
    context,
    example,
    exampleTranslation,
    explanation,
    variants,
    audioText,
  ], index) => {
    const audioPath = `assets/audio/egyptian/unit-9/${folder}/${index + 1}.mp3`;
    return {
      arabic: displayArabic,
      displayArabic,
      audioText: audioText ?? spoken(displayArabic),
      evalTarget: displayArabic,
      transliteration,
      acceptedTransliterations: accepted(transliteration, variants),
      english,
      context,
      example,
      exampleTranslation,
      explanation,
      audioPath,
      audio: EGYPTIAN_UNIT810_AUDIO_BY_PATH[audioPath],
      voiceId: EGYPTIAN_VOICE_ID,
      modelId: EGYPTIAN_MODEL_ID,
    };
  });
}

export const INVITATIONS_WORDS_EG = lesson('invitations', [
  ['تيجي معانا؟', 'tiigi maana?', 'Would you like to come with us?', 'Inviting a friend', 'إحنا رايحين الكافيه، تيجي معانا؟', 'We are going to the café; would you like to come?', 'Use تيجي معانا؟ for a relaxed invitation.'],
  ['تحب تيجي؟', 'tihibb tiigi?', 'Would you like to come?', 'A polite invitation', 'عندنا عشا بكرة، تحب تيجي؟', 'We are having dinner tomorrow; would you like to come?', 'A friendly invitation to one male person.'],
  ['تعالى معانا', 'taala maana', 'Come with us', 'Encouraging a friend', 'تعالى معانا، هنتبسط', 'Come with us; we will have fun', 'تعالى is addressed to one male person.'],
  ['عندك وقت النهارده؟', "andak wa't ennaharda?", 'Do you have time today?', 'Checking availability', 'عندك وقت النهارده نخرج؟', 'Do you have time to go out today?', 'A natural way to check before suggesting a plan.'],
  ['إحنا عاملين عزومة', 'ihna aamliin azuuma', 'We are hosting a gathering', 'Inviting someone home', 'إحنا عاملين عزومة يوم الجمعة', 'We are hosting a gathering on Friday', 'عزومة is a meal or gathering hosted for guests.'],
  ['مستنيينك', 'mistanniyiinak', 'We are expecting you', 'Warm invitation', 'تعالى بدري، مستنيينك', 'Come early; we are expecting you', 'A warm way to show that the invitation is genuine.'],
]);

export const ACCEPTING_REFUSING_WORDS_EG = lesson('accepting-and-refusing', [
  ['ماشي', 'maashi', 'Okay', 'Accepting casually', 'ماشي، هاجي معاكم', 'Okay, I will come with you', 'A very common casual acceptance.'],
  ['تمام، موافق', "tamaam, muwaafi'", 'Great, I agree', 'Accepting a plan', 'تمام، موافق على الخطة', 'Great, I agree with the plan', 'موافق is useful when agreeing to a suggestion.'],
  ['أكيد، هاجي', 'akiid, haagi', 'Of course, I will come', 'Accepting warmly', 'أكيد، هاجي الساعة سبعة', 'Of course, I will come at seven', 'The future marker هـ appears in هاجي.', undefined, 'أكيد، هَاجي...'],
  ['للأسف مش هقدر', "lil-asaf mish ha'dar", 'Unfortunately, I cannot', 'Refusing politely', 'للأسف مش هقدر أجي بكرة', 'Unfortunately, I cannot come tomorrow', 'A polite refusal without sounding abrupt.'],
  ['معلش، مرة تانية', 'maalish, marra tanya', 'Sorry, another time', 'Postponing an invitation', 'معلش، مرة تانية عشان أنا مشغول', 'Sorry, another time because I am busy', 'A natural soft refusal.'],
  ['ينفع يوم تاني؟', "yinfa' yoom taani?", 'Would another day work?', 'Suggesting an alternative', 'مش فاضي الخميس، ينفع يوم تاني؟', 'I am not free Thursday; would another day work?', 'Use this to keep the invitation open.'],
]);

export const VISITING_FRIENDS_WORDS_EG = lesson('visiting-friends', [
  ['أنا جاي لك', 'ana gayy lak', 'I am coming to your place', 'Confirming a visit', 'أنا جاي لك بعد الشغل', 'I am coming to your place after work', 'جاي expresses movement toward the listener.'],
  ['أجيب حاجة معايا؟', 'agiib haaga maaya?', 'Should I bring anything?', 'Being a considerate guest', 'أجيب حاجة معايا للعشا؟', 'Should I bring anything for dinner?', 'A useful question before visiting.'],
  ['البيت منور', 'el-beit mnawwar', 'It is lovely to have you here', 'Welcoming a guest', 'أهلاً بيك، البيت منور', 'Welcome; it is lovely to have you here', 'A warm Egyptian welcome.'],
  ['اتفضل اقعد', "etfaddal o'od", 'Please sit down', 'Welcoming a guest', 'اتفضل اقعد هنا', 'Please sit here', 'A polite instruction to one male guest.'],
  ['تحب تشرب إيه؟', 'tihibb tishrab eih?', 'What would you like to drink?', 'Offering hospitality', 'تحب تشرب شاي ولا قهوة؟', 'Would you like tea or coffee?', 'A standard host question.'],
  ['تعبناك معانا', 'taabnaak maana', 'We have troubled you', 'Thanking a host', 'شكراً على العشا، تعبناك معانا', 'Thank you for dinner; we have troubled you', 'A polite Egyptian expression of appreciation.'],
]);

export const FAMILY_VISIT_WORDS_EG = lesson('family-visit', [
  ['سلم لي على العيلة', 'sallim li ala el-eila', 'Say hello to the family for me', 'Sending greetings', 'سلم لي على العيلة كلها', 'Say hello to the whole family for me', 'A common closing after a family visit.'],
  ['ماما مستنياكم', 'mama mistannyaakum', 'Mum is expecting you', 'Planning a family visit', 'تعالوا بدري، ماما مستنياكم', 'Come early; Mum is expecting you', 'مستنياكم addresses more than one person.'],
  ['الأولاد عاملين إيه؟', 'el-wilaad aamliin eih?', 'How are the children?', 'Asking after family', 'الأولاد عاملين إيه في المدرسة؟', 'How are the children doing at school?', 'A friendly family question.'],
  ['وحشتونا', 'wahashtuuna', 'We missed you', 'Greeting relatives', 'بقالنا كتير ما شفناكمش، وحشتونا', 'We have not seen you for a long time; we missed you', 'Addressed to a group.'],
  ['هنزوركم الجمعة', "hanzuurkum el-gom'a", 'We will visit you on Friday', 'Arranging a family visit', 'إن شاء الله هنزوركم الجمعة', 'God willing, we will visit you on Friday', 'The future marker هـ appears in هنزوركم.'],
  ['خليكم على العشا', 'khalliikum ala el-asha', 'Stay for dinner', 'Extending a visit', 'لسه بدري، خليكم على العشا', 'It is still early; stay for dinner', 'A warm invitation to several guests.'],
]);

export const CAFE_WITH_FRIENDS_WORDS_EG = lesson('cafe-with-friends', [
  ['نقعد فين؟', "no'od fein?", 'Where should we sit?', 'At a café', 'نقعد جوه ولا بره؟', 'Should we sit inside or outside?', 'A practical group question.'],
  ['أنا هطلب قهوة', 'ana hatlob ahwa', 'I will order coffee', 'Ordering with friends', 'أنا هطلب قهوة مظبوط', 'I will order medium-sweet coffee', 'The future marker هـ appears in هطلب.'],
  ['إنت هتشرب إيه؟', 'enta hatishrab eih?', 'What will you drink?', 'Ordering with a friend', 'إنت هتشرب إيه النهارده؟', 'What will you drink today?', 'A natural question to one male friend.'],
  ['الحساب علينا', 'el-hisaab aleina', 'The bill is on us', 'Offering to pay', 'النهارده الحساب علينا', 'Today the bill is on us', 'A friendly offer to pay for the group.'],
  ['نطلب حاجة ناكلها؟', 'notlob haaga naakulha?', 'Should we order something to eat?', 'Sharing food', 'نطلب حاجة ناكلها مع القهوة؟', 'Should we order something to eat with the coffee?', 'A natural group suggestion.'],
  ['القعدة حلوة هنا', "el-'a'da helwa hina", 'It is nice sitting here', 'Enjoying the café', 'القعدة حلوة هنا والجو هادي', 'It is nice sitting here and the atmosphere is calm', 'قعدة describes spending time sitting together.'],
]);

export const FOOTBALL_WORDS_EG = lesson('football', [
  ['هنشوف الماتش', 'hanshuuf el-maatsh', 'We will watch the match', 'Making a football plan', 'هنشوف الماتش عندي', 'We will watch the match at my place', 'ماتش is the natural Egyptian loanword.'],
  ['بتشجع مين؟', "bitshagga' meen?", 'Which team do you support?', 'Talking about football', 'إنت بتشجع مين؟', 'Which team do you support?', 'شجع has Egyptian hard-g pronunciation.'],
  ['الماتش الساعة كام؟', 'el-maatsh es-saa kam?', 'What time is the match?', 'Checking match time', 'الماتش الساعة كام النهارده؟', 'What time is the match today?', 'A practical time question.'],
  ['بلعب كورة', "bal'ab koora", 'I play football', 'Talking about hobbies', 'بلعب كورة كل أسبوع', 'I play football every week', 'كورة is the everyday Egyptian word for football.', undefined, 'بلعب كورة.'],
  ['الجون كان حلو', 'el-goon kaan helw', 'The goal was good', 'Reacting to a match', 'الجون الأخير كان حلو أوي', 'The last goal was very good', 'جون is a common football loanword and uses hard g.'],
  ['كسبنا الماتش', 'kisibna el-maatsh', 'We won the match', 'After a match', 'كسبنا الماتش اتنين صفر', 'We won the match two-nil', 'كسبنا means “we won.”'],
]);

export const GAMING_WORDS_EG = lesson('gaming', [
  ['نلعب أونلاين', 'nilaab online', 'Let us play online', 'Inviting a friend to play', 'نلعب أونلاين بالليل؟', 'Shall we play online tonight?', 'أونلاين is natural in Egyptian gaming speech.'],
  ['ابعتلي دعوة', "ib'atli da'wa", 'Send me an invitation', 'Joining a game', 'ابعتلي دعوة على اللعبة', 'Send me an invitation in the game', 'دعوة here means a game invite.'],
  ['اللعبة دي حلوة', "el-lo'ba di helwa", 'This game is good', 'Recommending a game', 'اللعبة دي حلوة أوي', 'This game is very good', 'دي agrees with the feminine noun لعبة.'],
  ['استنى، النت بطيء', 'istanna, en-net batii', 'Wait, the internet is slow', 'Connection problem', 'استنى شوية، النت بطيء', 'Wait a little; the internet is slow', 'A practical gaming problem.'],
  ['أنا دخلت اللعبة', "ana dakhalt el-lo'ba", 'I joined the game', 'Starting a session', 'أنا دخلت اللعبة، إنت فين؟', 'I joined the game; where are you?', 'اللعبة avoids confusion with الجيم, which can also mean the gym.'],
  ['نكمل بكرة', 'nikammil bukra', 'Let us continue tomorrow', 'Ending a session', 'خلاص، نكمل بكرة', 'Okay, let us continue tomorrow', 'A natural way to stop for the day.'],
]);

export const SOCIAL_MEDIA_WORDS_EG = lesson('social-media', [
  ['ابعتلي على واتساب', 'ibatli ala whatsapp', 'Send it to me on WhatsApp', 'Sharing something', 'ابعتلي الصورة على واتساب', 'Send me the picture on WhatsApp', 'واتساب is widely used as a verb context in Egypt.'],
  ['شوفت البوست؟', 'shoft el-post?', 'Did you see the post?', 'Talking about social media', 'شوفت البوست الجديد؟', 'Did you see the new post?', 'بوست is a natural social-media loanword.'],
  ['عملت لك فولو', 'amalt lak follow', 'I followed you', 'Following an account', 'عملت لك فولو على إنستجرام', 'I followed you on Instagram', 'فولو is common informal online speech.'],
  ['نزلت صورة جديدة', 'nazzalt soora gedeeda', 'I posted a new photo', 'Posting online', 'نزلت صورة جديدة امبارح', 'I posted a new photo yesterday', 'نزلت is commonly used for posting content.'],
  ['ابعتلي اللينك', 'ibatli el-link', 'Send me the link', 'Sharing a link', 'ابعتلي اللينك لما تفضى', 'Send me the link when you are free', 'لينك is the common loanword.'],
  ['هرد عليك بعدين', 'harodd aleik badein', 'I will reply to you later', 'Delayed reply', 'أنا مشغول، هرد عليك بعدين', 'I am busy; I will reply later', 'The future marker هـ appears in هرد.'],
]);

export const WEEKEND_PLANS_WORDS_EG = lesson('weekend-plans', [
  ['هنخرج في الويك إند', 'hankhrog fil-weekend', 'We will go out this weekend', 'Weekend plan', 'هنخرج في الويك إند مع أصحابنا', 'We will go out this weekend with our friends', 'ويك إند is common urban Egyptian speech.'],
  ['فاضي بكرة؟', 'faadi bukra?', 'Are you free tomorrow?', 'Checking availability', 'فاضي بكرة بعد الضهر؟', 'Are you free tomorrow afternoon?', 'Addressed to one male friend.'],
  ['نروح فين؟', 'nruuh fein?', 'Where should we go?', 'Choosing a place', 'نروح فين يوم الجمعة؟', 'Where should we go on Friday?', 'A simple group-planning question.'],
  ['ممكن نروح السينما', 'momken nruuh es-siineema', 'We could go to the cinema', 'Suggesting an activity', 'ممكن نروح السينما بالليل', 'We could go to the cinema tonight', 'ممكن softens the suggestion.'],
  ['الجو هيبقى حلو', "el-gaww hayib'a helw", 'The weather will be nice', 'Planning outdoors', 'الجو هيبقى حلو الويك إند', 'The weather will be nice this weekend', 'هيبقى is the Egyptian future of “will be.”'],
  ['أنا عندي وقت', "ana andi wa't", 'I have time', 'Confirming availability', 'أنا عندي وقت بعد العصر', 'I have time after the afternoon', 'A direct availability statement.'],
]);

export const MAKING_PLANS_WORDS_EG = lesson('making-plans', [
  ['خلينا نتقابل', "khalliina nit'aabil", 'Let us meet', 'Starting a plan', 'خلينا نتقابل بكرة', 'Let us meet tomorrow', 'خلينا is a natural Egyptian suggestion form.'],
  ['نتقابل إمتى؟', "nit'aabil imta?", 'When should we meet?', 'Choosing a time', 'نتقابل إمتى يوم الجمعة؟', 'When should we meet on Friday?', 'A direct planning question.'],
  ['نتقابل فين؟', "nit'aabil fein?", 'Where should we meet?', 'Choosing a place', 'نتقابل فين بالظبط؟', 'Where exactly should we meet?', 'فين asks about place.'],
  ['الساعة سبعة مناسبة؟', "es-saa'a sab'a monaasba?", 'Is seven o’clock suitable?', 'Suggesting a time', 'الساعة سبعة مناسبة ليك؟', 'Is seven o’clock suitable for you?', 'مناسبة agrees with الساعة.'],
  ['هأكد عليك بكرة', "ha'akkid aleik bukra", 'I will confirm with you tomorrow', 'Confirming later', 'هأكد عليك بكرة الصبح', 'I will confirm with you tomorrow morning', 'The future marker هـ appears in هأكد.'],
  ['أشوفك بكرة', 'ashuufak bukra', 'See you tomorrow', 'Closing a plan', 'تمام، أشوفك بكرة', 'Great, see you tomorrow', 'A natural ending after arranging a meeting.'],
]);

export const EGYPTIAN_UNIT9_LESSONS = [
  { contentId: 'invitations', title: 'Invitations', words: INVITATIONS_WORDS_EG },
  { contentId: 'accepting-and-refusing', title: 'Accepting & Refusing', words: ACCEPTING_REFUSING_WORDS_EG },
  { contentId: 'visiting-friends', title: 'Visiting Friends', words: VISITING_FRIENDS_WORDS_EG },
  { contentId: 'family-visit', title: 'Family Visit', words: FAMILY_VISIT_WORDS_EG },
  { contentId: 'cafe-with-friends', title: 'Café with Friends', words: CAFE_WITH_FRIENDS_WORDS_EG },
  { contentId: 'football', title: 'Football', words: FOOTBALL_WORDS_EG },
  { contentId: 'gaming', title: 'Gaming', words: GAMING_WORDS_EG },
  { contentId: 'social-media', title: 'Social Media', words: SOCIAL_MEDIA_WORDS_EG },
  { contentId: 'weekend-plans', title: 'Weekend Plans', words: WEEKEND_PLANS_WORDS_EG },
  { contentId: 'making-plans', title: 'Making Plans', words: MAKING_PLANS_WORDS_EG },
] as const;

export const EGYPTIAN_UNIT9_AUDIO_TARGETS = EGYPTIAN_UNIT9_LESSONS.flatMap(lessonItem =>
  lessonItem.words.map((word, index) => ({
    id: `${lessonItem.contentId}:${index + 1}`,
    contentId: lessonItem.contentId,
    line: index + 1,
    displayArabic: word.displayArabic,
    audioText: word.audioText,
    evalTarget: word.evalTarget,
    audioPath: word.audioPath,
  })),
);
