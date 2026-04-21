export type ScenarioKey =
  | 'cafe' | 'meeting' | 'shopping' | 'hotel'
  | 'taxi' | 'directions' | 'doctor' | 'restaurant';

export interface SuggestedReply {
  arabic: string;
  transliteration: string;
  english: string;
}

export interface ScenarioOpener {
  arabic: string;
  transliteration: string;
  english: string;
  suggestedReplies: SuggestedReply[];
  wordBank: string[];
}

export const SCENARIO_CONFIG: Record<ScenarioKey, { label: string; emoji: string }> = {
  cafe:       { label: 'At a cafe',         emoji: '☕' },
  meeting:    { label: 'Meeting someone',   emoji: '🤝' },
  shopping:   { label: 'Shopping',          emoji: '🛒' },
  hotel:      { label: 'At the hotel',      emoji: '🏨' },
  taxi:       { label: 'Taking a taxi',     emoji: '🚕' },
  directions: { label: 'Asking directions', emoji: '🧭' },
  doctor:     { label: 'At the doctor',     emoji: '🏥' },
  restaurant: { label: 'At a restaurant',   emoji: '🍽️' },
};

export const SCENARIO_KEYS: ScenarioKey[] = [
  'cafe', 'meeting', 'shopping', 'hotel',
  'taxi', 'directions', 'doctor', 'restaurant',
];

export const SCENARIO_OPENERS: Record<ScenarioKey, ScenarioOpener> = {
  cafe: {
    arabic: 'هلا وغلا تفضل شنو تبي تشرب',
    transliteration: 'hala wa ghala tafaddal shinu tabi tishrab',
    english: 'Welcome! What would you like to drink?',
    suggestedReplies: [
      { arabic: 'ابي قهوة عربية', transliteration: 'abi qahwa arabiyya', english: 'I want Arabic coffee' },
      { arabic: 'شاي لو سمحت', transliteration: 'chaay law samaht', english: 'Tea please' },
      { arabic: 'شنو عندكم', transliteration: 'shinu indikum', english: 'What do you have?' },
    ],
    wordBank: ['قهوة', 'شاي', 'ابي', 'لو سمحت', 'كم'],
  },
  meeting: {
    arabic: 'هلا والله شلونك شخبارك',
    transliteration: 'hala wallah shloonak shakhbaarak',
    english: "Hey! How are you? What's new?",
    suggestedReplies: [
      { arabic: 'الحمد لله بخير وانت', transliteration: 'il-hamdu lillah bikhair wa int', english: 'Fine thanks, and you?' },
      { arabic: 'تمام الحمد لله شلونك انت', transliteration: 'tamaam il-hamdu lillah shloonak int', english: 'Good, how are you?' },
      { arabic: 'مشتاقين والله', transliteration: 'mishtaaqeen wallah', english: 'We missed you!' },
    ],
    wordBank: ['شلونك', 'الحمد لله', 'بخير', 'شخبارك', 'تمام'],
  },
  shopping: {
    arabic: 'هلا وغلا تفضل شنو تبي',
    transliteration: 'hala wa ghala tafaddal shinu tabi',
    english: 'Welcome! What are you looking for?',
    suggestedReplies: [
      { arabic: 'ادور على هدية', transliteration: 'adawwir ala hadiyya', english: "I'm looking for a gift" },
      { arabic: 'ابي اشوف الاسعار', transliteration: "abi ashouf il-as'aar", english: 'I want to see prices' },
      { arabic: 'عندكم تخفيضات', transliteration: 'indikum takhfeedhaat', english: 'Do you have sales?' },
    ],
    wordBank: ['كم السعر', 'غالي', 'رخيص', 'ابي', 'هدية'],
  },
  hotel: {
    arabic: 'هلا فيك تفضل كيف اقدر اساعدك',
    transliteration: "hala feek tafaddal kaif aqdar asaa'dak",
    english: 'Welcome! How can I help you?',
    suggestedReplies: [
      { arabic: 'عندي حجز باسم يوسف', transliteration: "'indi hajz bi-ism yusuf", english: 'I have a reservation under Yusuf' },
      { arabic: 'ابي غرفة لليلتين', transliteration: 'abi ghurfa li-lailaitain', english: 'I want a room for two nights' },
      { arabic: 'كم سعر الغرفة', transliteration: "kam si'r il-ghurfa", english: 'How much is the room?' },
    ],
    wordBank: ['غرفة', 'حجز', 'ليلة', 'فطور', 'مفتاح'],
  },
  taxi: {
    arabic: 'هلا يالغالي وين توصل',
    transliteration: 'hala yaal-ghaali wain tawassal',
    english: 'Hey! Where are you heading?',
    suggestedReplies: [
      { arabic: 'المطار لو سمحت', transliteration: 'il-mataar law samaht', english: 'The airport please' },
      { arabic: 'دبي مول لو سمحت', transliteration: 'dubai mool law samaht', english: 'Dubai Mall please' },
      { arabic: 'وين اقرب مطعم', transliteration: "wain aqrab mat'am", english: 'Where is the nearest restaurant?' },
    ],
    wordBank: ['وين', 'روح', 'يمين', 'يسار', 'سيدا'],
  },
  directions: {
    arabic: 'هلا اخوي تبي مساعدة',
    transliteration: "hala akhooy tabi musaa'ada",
    english: 'Hey brother, need help?',
    suggestedReplies: [
      { arabic: 'وين اقرب مسجد', transliteration: 'wain aqrab masjid', english: 'Where is the nearest mosque?' },
      { arabic: 'كيف اروح المترو', transliteration: 'kaif arooh il-metro', english: 'How do I get to the metro?' },
      { arabic: 'تعرف وين هالمكان', transliteration: "ta'rif wain hal-makaan", english: 'Do you know where this place is?' },
    ],
    wordBank: ['وين', 'كيف', 'قريب', 'بعيد', 'على طول'],
  },
  doctor: {
    arabic: 'هلا تفضل اجلس شنو المشكلة',
    transliteration: 'hala tafaddal ijlis shinu il-mushkila',
    english: "Hello, please sit. What's the problem?",
    suggestedReplies: [
      { arabic: 'عندي صداع من امس', transliteration: "'indi sudaa' min ams", english: "I've had a headache since yesterday" },
      { arabic: 'احس بتعب وايد', transliteration: "ahis bi-ta'ab waayid", english: 'I feel very tired' },
      { arabic: 'ابي فحص عام', transliteration: "abi fahs 'aam", english: 'I want a general checkup' },
    ],
    wordBank: ['عندي', 'الم', 'دوا', 'صيدلية', 'موعد'],
  },
  restaurant: {
    arabic: 'هلا وغلا تفضلوا هذي المنيو',
    transliteration: 'hala wa ghala tafaddaloo haadhi il-minyu',
    english: "Welcome! Here's the menu.",
    suggestedReplies: [
      { arabic: 'شنو تنصحني', transliteration: 'shinu tansahni', english: 'What do you recommend?' },
      { arabic: 'عندكم اكل حلال', transliteration: "'indikum akil halaal", english: 'Do you have halal food?' },
      { arabic: 'ابي مجبوس دياي', transliteration: 'abi majboos diyaay', english: 'I want chicken majboos' },
    ],
    wordBank: ['ابي', 'الحساب', 'ماي', 'حلو', 'حار'],
  },
};

export const FREE_CHAT_OPENER: ScenarioOpener = {
  arabic: 'هلا والله شلونك شخبارك شنو مسوي اليوم',
  transliteration: 'hala wallah shloonak shakhbaarak shinu msawwi il-yawm',
  english: "Hey! How are you? What are you up to today?",
  suggestedReplies: [
    { arabic: 'الحمد لله قاعد بالبيت', transliteration: "il-hamdu lillah gaa'id bil-bait", english: "Fine, I'm at home" },
    { arabic: 'رايح الدوام', transliteration: 'raayih id-dawaam', english: 'Going to work' },
    { arabic: 'ما سويت شي لين الحين', transliteration: 'ma sawwait shay lin il-heen', english: "Haven't done anything yet" },
  ],
  wordBank: ['شلونك', 'اليوم', 'رايح', 'ابي', 'وين'],
};
