import type { DialogueTurn } from './gulf-dialogues';
import { EGYPTIAN_UNIT810_AUDIO_BY_PATH } from './egyptian-unit810-audio';
import { EGYPTIAN_MODEL_ID, EGYPTIAN_VOICE_ID } from './egyptian-unit6';

type FriendTurn = [
  type: 'waiter' | 'user',
  speakerRole: string,
  displayArabic: string,
  transliteration: string,
  english: string,
  audioText?: string,
];

export interface EgyptianFriendScenario {
  contentId: string;
  scenarioName: string;
  title: string;
  description: string;
  setting: string;
  objective: string;
  imageId: string;
  entranceImageId?: string;
  dialogue: DialogueTurn[];
}

function spoken(displayArabic: string) {
  return /[.!؟]$/.test(displayArabic) ? displayArabic : `${displayArabic}.`;
}

function accepted(transliteration: string) {
  const plain = transliteration.replace(/[?'.,-]/g, '').replace(/\s+/g, ' ').trim();
  return plain === transliteration ? [transliteration] : [transliteration, plain];
}

function scenario(
  contentId: string,
  scenarioName: string,
  title: string,
  description: string,
  setting: string,
  objective: string,
  imageId: string,
  entries: FriendTurn[],
  useEntranceImage = false,
): EgyptianFriendScenario {
  let staffIndex = 0;
  let userIndex = 0;
  const dialogue = entries.map(([type, speakerRole, displayArabic, transliteration, english, audioText]) => {
    const index = type === 'waiter' ? ++staffIndex : ++userIndex;
    const prefix = type === 'waiter' ? 'w' : 'u';
    const audioPath = `assets/audio/egyptian/unit-10/${contentId}/${prefix}${index}.mp3`;
    return {
      type,
      speakerRole,
      arabic: displayArabic,
      displayArabic,
      audioText: audioText ?? spoken(displayArabic),
      evalTarget: displayArabic,
      transliteration,
      acceptedTransliterations: accepted(transliteration),
      english,
      pronunciationStep: type === 'user',
      audioPath,
      audio: EGYPTIAN_UNIT810_AUDIO_BY_PATH[audioPath],
      voiceId: EGYPTIAN_VOICE_ID,
      modelId: EGYPTIAN_MODEL_ID,
    } satisfies DialogueTurn;
  });

  return {
    contentId,
    scenarioName,
    title,
    description,
    setting,
    objective,
    imageId,
    entranceImageId: useEntranceImage ? `${imageId}-entrance` : undefined,
    dialogue,
  };
}

export const EGYPTIAN_NEIGHBOR_VISIT_SCENARIO = scenario(
  'neighbor-visit', 'EgyptianNeighborVisit', 'Visiting a Neighbor',
  'Welcome a new neighbor and share a short friendly visit.', 'An apartment in Cairo',
  'Use polite visiting language and make a neighbor feel welcome.', 'cairo-neighbor-visit', [
    ['waiter', 'neighbor', 'أهلاً، اتفضل ادخل', 'ahlan, etfaddal odkhul', 'Hi, please come in'],
    ['user', 'visitor', 'شكراً، أنا ساكن جنبك', 'shokran, ana saakin gambak', 'Thank you, I live next door'],
    ['waiter', 'neighbor', 'أهلاً وسهلاً، نورتنا', 'ahlan w sahlan, nawwartina', 'Welcome; it is lovely to have you'],
    ['user', 'visitor', 'ده من ذوقك', "da min zoo'ak", 'That is kind of you'],
    ['waiter', 'neighbor', 'تحب تشرب إيه؟', 'tihibb tishrab eih?', 'What would you like to drink?'],
    ['user', 'visitor', 'شاي لو سمحت', 'shaay law samaht', 'Tea please'],
    ['waiter', 'neighbor', 'إنت ساكن هنا من إمتى؟', 'enta saakin hina min imta?', 'How long have you lived here?'],
    ['user', 'visitor', 'من أسبوع بس', "min osbuu' bas", 'Only for a week'],
    ['waiter', 'neighbor', 'لو احتجت حاجة كلمني', 'law ihtagt haaga kallimni', 'Call me if you need anything'],
    ['user', 'visitor', 'متشكر جداً', 'mitshakkir geddan', 'Thank you very much'],
  ], true,
);

export const EGYPTIAN_BRUNCH_SCENARIO = scenario(
  'brunch', 'EgyptianBrunch', 'Brunch with Friends',
  'Choose food and drinks at a relaxed brunch.', 'A Cairo brunch café',
  'Discuss menu choices, share food, and handle the bill naturally.', 'cairo-brunch-cafe', [
    ['waiter', 'friend', 'صباح الخير، جعان؟', 'sabaah el-kheir, gaan?', 'Good morning, are you hungry?'],
    ['user', 'friend', 'أيوه، جعان أوي', 'aywa, gaan awi', 'Yes, I am very hungry'],
    ['waiter', 'friend', 'نطلب فطار ولا غدا؟', 'notlob fetaar walla ghada?', 'Should we order breakfast or lunch?'],
    ['user', 'friend', 'خلينا نطلب فطار', 'khalliina notlob fetaar', 'Let us order breakfast'],
    ['waiter', 'friend', 'تحب تشرب إيه؟', 'tihibb tishrab eih?', 'What would you like to drink?'],
    ['user', 'friend', 'قهوة مظبوط لو سمحت', 'ahwa mazbuut law samaht', 'Medium-sweet coffee please'],
    ['waiter', 'friend', 'نطلب طبق في النص؟', "notlob taba' fi en-nos?", 'Should we order a dish to share?'],
    ['user', 'friend', 'فكرة حلوة', 'fikra helwa', 'Good idea'],
    ['waiter', 'friend', 'الحساب علينا النهارده', 'el-hisaab aleina ennaharda', 'The bill is on us today'],
    ['user', 'friend', 'المرة الجاية عليا', 'el-marra el-gayya alayya', 'Next time it is on me'],
  ], true,
);

export const EGYPTIAN_ROAD_TRIP_SCENARIO = scenario(
  'road-trip', 'EgyptianRoadTrip', 'Road Trip',
  'Prepare for a road trip and discuss time, route, and stops.', 'Leaving Cairo by car',
  'Coordinate a trip using practical future expressions.', 'cairo-road-trip', [
    ['waiter', 'friend', 'جاهز؟ يلا نتحرك', 'gaahiz? yalla nitharrak', 'Ready? Let us get moving'],
    ['user', 'traveller', 'جاهز، حطيت الشنط في العربية', 'gaahiz, hatteit esh-shonat fil-arabeyya', 'Ready; I put the bags in the car'],
    ['waiter', 'friend', 'الطريق هياخد قد إيه؟', "et-tarii' hayakhod add eih?", 'How long will the road take?'],
    ['user', 'traveller', 'حوالي تلات ساعات', 'hawaali talaat saaat', 'About three hours'],
    ['waiter', 'friend', 'هنقف في الطريق؟', "hanwa'af fit-tarii'?", 'Will we stop on the way?'],
    ['user', 'traveller', 'أيوه، هناخد بريك', 'aywa, hanakhod breik', 'Yes, we will take a break'],
    ['waiter', 'friend', 'معاك مية؟', 'maak mayya?', 'Do you have water?'],
    ['user', 'traveller', 'أيوه، ومعايا أكل كمان', 'aywa, w maaya akl kamaan', 'Yes, and I have food too'],
    ['waiter', 'friend', 'تمام، الرحلة هتبقى حلوة', "tamaam, er-rihla hatib'a helwa", 'Great; the trip will be nice'],
    ['user', 'traveller', 'إن شاء الله', 'inshallah', 'God willing'],
  ], true,
);

export const EGYPTIAN_BIRTHDAY_INVITATION_SCENARIO = scenario(
  'birthday-invitation', 'EgyptianBirthdayInvitation', 'Birthday Invitation',
  'Invite a friend to a birthday and confirm the details.', 'A phone call in Cairo',
  'Give an invitation, time, place, and a natural response.', 'cairo-birthday-invitation', [
    ['waiter', 'host', 'عيد ميلادي يوم الجمعة', 'eid milaadi yoom el-gomaa', 'My birthday is on Friday'],
    ['user', 'friend', 'كل سنة وإنت طيب مقدماً', "koll sana w enta tayyib mo'addaman", 'Happy birthday in advance'],
    ['waiter', 'host', 'وإنت طيب، تحب تيجي الحفلة؟', 'w enta tayyib, tihibb tiigi el-hafla?', 'Thank you; would you like to come to the party?'],
    ['user', 'friend', 'أكيد، الحفلة فين؟', 'akiid, el-hafla fein?', 'Of course; where is the party?'],
    ['waiter', 'host', 'في البيت عندي', 'fil-beit andi', 'At my house'],
    ['user', 'friend', 'الساعة كام؟', 'es-saa kam?', 'What time?'],
    ['waiter', 'host', 'الساعة تمانية بالليل', 'es-saa tamanya billeil', 'At eight in the evening'],
    ['user', 'friend', 'أجيب حاجة معايا؟', 'agiib haaga maaya?', 'Should I bring anything?'],
    ['waiter', 'host', 'لأ، إنت بس تعالى', 'la, enta bas taala', 'No, just come'],
    ['user', 'friend', 'تمام، أشوفك الجمعة', 'tamaam, ashuufak el-gomaa', 'Great; see you Friday'],
  ],
);

export const EGYPTIAN_BIRTHDAY_PARTY_SCENARIO = scenario(
  'birthday-party', 'EgyptianBirthdayParty', 'Birthday Party',
  'Join a birthday party and exchange friendly wishes.', 'A birthday party in a Cairo home',
  'Greet the host, compliment the party, and make simple plans.', 'cairo-birthday-party', [
    ['waiter', 'host', 'أهلاً، نورتنا', 'ahlan, nawwartina', 'Welcome; it is great to have you here'],
    ['user', 'guest', 'كل سنة وإنت طيب', 'koll sana w enta tayyib', 'Happy birthday'],
    ['waiter', 'host', 'شكراً، مبسوط إنك جيت', 'shokran, mabsuut innak geet', 'Thank you; I am happy you came'],
    ['user', 'guest', 'الحفلة حلوة أوي', 'el-hafla helwa awi', 'The party is very nice'],
    ['waiter', 'host', 'تحب تاكل تورتة؟', 'tihibb taakul torta?', 'Would you like some cake?'],
    ['user', 'guest', 'أيوه، حتة صغيرة', 'aywa, hetta soghayyara', 'Yes, a small piece'],
    ['waiter', 'host', 'هنتصور كمان شوية', 'hunitsawwar kamaan shwayya', 'We will take photos in a little while'],
    ['user', 'guest', 'تمام، ناديني', 'tamaam, naadiini', 'Great; call me over'],
    ['waiter', 'host', 'بعدها هنفتح الهدايا', 'badaha haniftah el-hadaaya', 'After that we will open the gifts'],
    ['user', 'guest', 'يلا، أنا جاهز', 'yalla, ana gaahiz', 'Great, I am ready'],
  ], true,
);

export const EGYPTIAN_GIVING_GIFT_SCENARIO = scenario(
  'giving-a-gift', 'EgyptianGivingGift', 'Giving a Gift',
  'Give and receive a birthday gift politely.', 'A birthday gathering in Cairo',
  'Use modest gift language and respond with appreciation.', 'cairo-giving-gift', [
    ['user', 'guest', 'دي هدية بسيطة', 'di hediyya basiita', 'This is a small gift'],
    ['waiter', 'host', 'ليه كده؟ تعبت نفسك', 'leih kida? taabt nafsak', 'You should not have; you went to trouble'],
    ['user', 'guest', 'ولا تعب ولا حاجة', 'wala taab wala haaga', 'It was no trouble at all'],
    ['waiter', 'host', 'متشكر جداً', 'mitshakkir geddan', 'Thank you very much'],
    ['user', 'guest', 'يا رب تعجبك', "ya rab te'gabak", 'I hope you like it'],
    ['waiter', 'host', 'أكيد هتعجبني', "akiid hate'gabni", 'I am sure I will like it'],
    ['user', 'guest', 'افتحها دلوقتي', "iftahha dilwa'ti", 'Open it now'],
    ['waiter', 'host', 'الله، دي جميلة أوي', 'allah, di gameela awi', 'Wow, this is very beautiful'],
    ['user', 'guest', 'مبسوط إنها عجبتك', "mabsuut innaha 'agabitak", 'I am happy you liked it'],
    ['waiter', 'host', 'شكراً بجد', 'shokran bigadd', 'Thank you, truly'],
  ],
);

export const EGYPTIAN_TAKING_PHOTOS_SCENARIO = scenario(
  'taking-photos', 'EgyptianTakingPhotos', 'Taking Photos',
  'Arrange a group photo and ask someone to take it.', 'A celebration in Cairo',
  'Use simple photo directions and check the result.', 'cairo-taking-photos', [
    ['waiter', 'friend', 'تعالوا نتصور', 'taalu nitsawwar', 'Come on, let us take a photo'],
    ['user', 'friend', 'فكرة حلوة', 'fikra helwa', 'Good idea'],
    ['waiter', 'friend', 'قفوا جنب بعض', "o'fu gamb ba'd", 'Stand next to each other'],
    ['user', 'friend', 'كده كويس؟', 'kida kwayyis?', 'Is this good?'],
    ['waiter', 'friend', 'أيوه، ابتسموا', 'aywa, ibtismu', 'Yes, smile'],
    ['user', 'friend', 'استنى، عايز صورة كمان', 'istanna, aayiz soora kamaan', 'Wait, I want another photo'],
    ['waiter', 'friend', 'طب نقف عند الشباك', "tab no'af and esh-shobbaak", 'Then let us stand by the window'],
    ['user', 'friend', 'تمام، النور أحسن هنا', 'tamaam, en-nuur ahsan hina', 'Great; the light is better here'],
    ['waiter', 'friend', 'بصوا هنا، واحد اتنين تلاتة', 'bossu hina, waahid itnein talaata', 'Look here; one, two, three'],
    ['user', 'friend', 'وريني الصورة', 'warriini es-soora', 'Show me the photo'],
  ],
);

export const EGYPTIAN_REMEMBERING_TRIP_SCENARIO = scenario(
  'remembering-the-trip', 'EgyptianRememberingTrip', 'Remembering the Trip',
  'Talk with a friend about favorite moments from a trip.', 'A Cairo café after a trip',
  'Recall places, photos, and enjoyable moments in the past.', 'cairo-trip-memories', [
    ['waiter', 'friend', 'الرحلة كانت حلوة أوي', 'er-rihla kaanit helwa awi', 'The trip was very nice'],
    ['user', 'friend', 'أيوه، اتبسطت جداً', 'aywa, itbasatt geddan', 'Yes, I really enjoyed it'],
    ['waiter', 'friend', 'أكتر حاجة عجبتك إيه؟', "aktar haaga 'agabitak eih?", 'What did you like most?'],
    ['user', 'friend', 'الطريق والمناظر', "et-tarii' wil-manaazir", 'The road and the views'],
    ['waiter', 'friend', 'والأكل كان حلو كمان', 'wil-akl kaan helw kamaan', 'The food was good too'],
    ['user', 'friend', 'خصوصاً الفطار', 'khosuusan el-fetaar', 'Especially breakfast'],
    ['waiter', 'friend', 'بعت لك الصور', "ba'at lak es-sowar", 'I sent you the photos'],
    ['user', 'friend', 'شوفتها، جميلة أوي', 'shoftha, gameela awi', 'I saw them; they are beautiful'],
    ['waiter', 'friend', 'لازم نكرر الرحلة', 'laazim nikarrar er-rihla', 'We must take the trip again'],
    ['user', 'friend', 'أكيد، قريب إن شاء الله', 'akiid, orayyib inshallah', 'Definitely, soon, God willing'],
  ],
);

export const EGYPTIAN_SAYING_GOODBYE_SCENARIO = scenario(
  'saying-goodbye', 'EgyptianSayingGoodbye', 'Saying Goodbye',
  'Say goodbye warmly at the end of a visit.', 'Outside a Cairo home',
  'Thank a host, express affection, and leave naturally.', 'cairo-saying-goodbye', [
    ['user', 'guest', 'لازم أمشي دلوقتي', "laazim amshi dilwa'ti", 'I have to leave now'],
    ['waiter', 'host', 'لسه بدري', 'lissa badri', 'It is still early'],
    ['user', 'guest', 'عندي شغل بكرة بدري', 'andi shoghl bukra badri', 'I have work early tomorrow'],
    ['waiter', 'host', 'ماشي، نورتنا', 'maashi, nawwartina', 'Okay; it was lovely to have you'],
    ['user', 'guest', 'شكراً على اليوم الحلو', 'shokran ala el-yoom el-helw', 'Thank you for the lovely day'],
    ['waiter', 'host', 'هتوحشني', 'hatwahashni', 'I will miss you'],
    ['user', 'guest', 'وإنت كمان', 'w enta kamaan', 'You too'],
    ['waiter', 'host', 'أشوفك على خير', 'ashuufak ala kheir', 'Take care, see you soon'],
    ['user', 'guest', 'إن شاء الله نتقابل تاني', "inshallah nit'aabil taani", 'God willing, we will meet again'],
    ['waiter', 'host', 'مع السلامة', 'maa es-salaama', 'Goodbye'],
  ],
);

export const EGYPTIAN_STAYING_IN_TOUCH_SCENARIO = scenario(
  'staying-in-touch', 'EgyptianStayingInTouch', 'Staying in Touch',
  'Make simple plans to stay connected after saying goodbye.', 'A train station in Cairo',
  'Exchange contact plans and wish someone a safe trip.', 'cairo-staying-in-touch', [
    ['waiter', 'friend', 'خليك على تواصل', 'khalliik ala tawaasol', 'Stay in touch'],
    ['user', 'traveller', 'أكيد، هكلمك كل أسبوع', "akiid, hakallimak koll osbuu'", 'Of course, I will call you every week'],
    ['waiter', 'friend', 'ابعتلي لما توصل', 'ibatli lamma tuusal', 'Message me when you arrive'],
    ['user', 'traveller', 'حاضر، أول ما أوصل', 'haadir, awwil ma awsal', 'Okay, as soon as I arrive'],
    ['waiter', 'friend', 'ابعتلي صور المكان', "ib'atli sowar el-makaan", 'Send me photos of the place'],
    ['user', 'traveller', 'هبعتهالك على واتساب', "hab'athaalak ala whatsapp", 'I will send them to you on WhatsApp'],
    ['waiter', 'friend', 'رحلة سعيدة', "rihla sa'iida", 'Have a safe trip'],
    ['user', 'traveller', 'الله يسلمك', 'allah yisallimak', 'Thank you'],
    ['waiter', 'friend', 'إن شاء الله نتقابل قريب', "inshallah nit'aabil orayyib", 'God willing, we will meet soon'],
    ['user', 'traveller', 'أكيد، سلام بقى', "akiid, salaam ba'a", 'Definitely; goodbye for now'],
  ],
);

export const EGYPTIAN_UNIT10_SCENARIOS: EgyptianFriendScenario[] = [
  EGYPTIAN_NEIGHBOR_VISIT_SCENARIO,
  EGYPTIAN_BRUNCH_SCENARIO,
  EGYPTIAN_ROAD_TRIP_SCENARIO,
  EGYPTIAN_BIRTHDAY_INVITATION_SCENARIO,
  EGYPTIAN_BIRTHDAY_PARTY_SCENARIO,
  EGYPTIAN_GIVING_GIFT_SCENARIO,
  EGYPTIAN_TAKING_PHOTOS_SCENARIO,
  EGYPTIAN_REMEMBERING_TRIP_SCENARIO,
  EGYPTIAN_SAYING_GOODBYE_SCENARIO,
  EGYPTIAN_STAYING_IN_TOUCH_SCENARIO,
];

export const EGYPTIAN_UNIT10_SCENARIOS_BY_NAME = Object.fromEntries(
  EGYPTIAN_UNIT10_SCENARIOS.map(item => [item.scenarioName, item.dialogue]),
);

export const EGYPTIAN_UNIT10_AUDIO_TARGETS = EGYPTIAN_UNIT10_SCENARIOS.flatMap(item =>
  item.dialogue.map((turn, index) => ({
    id: `${item.contentId}:${index + 1}`,
    contentId: item.contentId,
    line: index + 1,
    displayArabic: turn.displayArabic,
    audioText: turn.audioText,
    evalTarget: turn.evalTarget,
    audioPath: turn.audioPath,
  })),
);
