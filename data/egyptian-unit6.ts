import type { DialogueTurn } from './gulf-dialogues';
import { EGYPTIAN_UNIT67_AUDIO_BY_PATH } from './egyptian-unit67-audio';

export const EGYPTIAN_VOICE_ID = 'LXrTqFIgiubkrMkwvOUr';
export const EGYPTIAN_MODEL_ID = 'eleven_v3';

type ScenarioTurnEntry = [
  type: 'waiter' | 'user',
  speakerRole: string,
  displayArabic: string,
  transliteration: string,
  english: string,
  acceptedTransliterations?: string[],
  responseOptions?: string[],
  audioText?: string,
  audio?: any,
];

export interface EgyptianUnit6Scenario {
  contentId: string;
  scenarioName: string;
  title: string;
  description: string;
  setting: string;
  objective: string;
  imageId: string;
  entranceImageId: string;
  audioFolder: string;
  dialogue: DialogueTurn[];
}

function audioReadyText(displayArabic: string) {
  return /[.!؟]$/.test(displayArabic) ? displayArabic : `${displayArabic}.`;
}

function buildDialogue(folder: string, entries: ScenarioTurnEntry[]): DialogueTurn[] {
  let staffIndex = 0;
  let userIndex = 0;

  return entries.map(([type, speakerRole, displayArabic, transliteration, english, accepted, responseOptions, audioText, audio]) => {
    const fileIndex = type === 'waiter' ? ++staffIndex : ++userIndex;
    const filePrefix = type === 'waiter' ? 'w' : 'u';
    const audioPath = `assets/audio/egyptian/unit-6/${folder}/${filePrefix}${fileIndex}.mp3`;
    return {
      type,
      speakerRole,
      arabic: displayArabic,
      displayArabic,
      audioText: audioText ?? audioReadyText(displayArabic),
      evalTarget: displayArabic,
      transliteration,
      acceptedTransliterations: accepted ?? [transliteration],
      english,
      responseOptions,
      pronunciationStep: type === 'user',
      audioPath,
      audio: audio ?? EGYPTIAN_UNIT67_AUDIO_BY_PATH[audioPath],
      voiceId: EGYPTIAN_VOICE_ID,
      modelId: EGYPTIAN_MODEL_ID,
    };
  });
}

function scenario(
  contentId: string,
  scenarioName: string,
  title: string,
  description: string,
  setting: string,
  objective: string,
  imageId: string,
  entries: ScenarioTurnEntry[],
): EgyptianUnit6Scenario {
  return {
    contentId,
    scenarioName,
    title,
    description,
    setting,
    objective,
    imageId,
    entranceImageId: `${imageId}-entrance`,
    audioFolder: `assets/audio/egyptian/unit-6/${contentId}`,
    dialogue: buildDialogue(contentId, entries),
  };
}

export const EGYPTIAN_CAFE_ORDER_SCENARIO = scenario(
  'cafe-order', 'EgyptianCafeOrder', 'Ordering at a Café',
  'Order a drink, choose how it is prepared, and pay.', 'A neighbourhood café in Cairo',
  'Order a drink politely and understand simple follow-up questions.', 'cairo-cafe', [
    ['waiter', 'barista', 'أهلاً، تحب تشرب إيه؟', 'ahlan, tihibb tishrab eih?', 'Hi, what would you like to drink?'],
    ['user', 'customer', 'عايز قهوة لو سمحت', 'aayiz ahwa law samaht', 'I would like a coffee please'],
    ['waiter', 'barista', 'تحب تركي ولا إسبريسو؟', 'tihibb turki walla espresso?', 'Would you like Turkish coffee or espresso?'],
    ['user', 'customer', 'تركي لو سمحت', 'turki law samaht', 'Turkish coffee please'],
    ['waiter', 'barista', 'تحبها سادة ولا مظبوط؟', 'tihibbha saada walla mazbuut?', 'Would you like it plain or medium-sweet?'],
    ['user', 'customer', 'مظبوط لو سمحت', 'mazbuut law samaht', 'Medium-sweet please'],
    ['waiter', 'barista', 'تشربها هنا ولا تاخدها معاك؟', 'tishrabha hina walla takhodha maak?', 'Will you drink it here or take it with you?'],
    ['user', 'customer', 'هشربها هنا', 'hashrabha hina', 'I will drink it here'],
    ['waiter', 'barista', 'تمام، الحساب خمسة وأربعين جنيه', 'tamaam, el-hisaab khamsa w arbaeen geneeh', 'Okay, the total is forty-five pounds'],
    ['user', 'customer', 'اتفضل، شكراً', 'itfaddal, shukran', 'Here you go, thank you'],
  ],
);

export const EGYPTIAN_RESTAURANT_ORDER_SCENARIO = scenario(
  'restaurant-order', 'EgyptianRestaurantOrder', 'Ordering at a Restaurant',
  'Ask about dishes, order a meal, and request the bill.', 'A casual restaurant in Cairo',
  'Order a complete meal and handle a simple dietary question.', 'cairo-restaurant', [
    ['waiter', 'waiter', 'أهلاً وسهلاً، اتفضل المنيو', 'ahlan wa sahlan, itfaddal el-menu', 'Welcome, here is the menu'],
    ['user', 'customer', 'شكراً، عندكم فراخ مشوية؟', 'shukran, andakum faraakh mashwiyya?', 'Thank you, do you have grilled chicken?'],
    ['waiter', 'waiter', 'أيوه، ومعاها رز وسلطة', 'aywa, w maaha rozz w salata', 'Yes, and it comes with rice and salad'],
    ['user', 'customer', 'تمام، عايز طبق فراخ مشوية', "tamaam, aayiz taba' faraakh mashwiyya", 'Okay, I would like a plate of grilled chicken'],
    ['waiter', 'waiter', 'تحب الرز أبيض ولا بسمتي؟', 'tihibb er-rozz abyad walla basmati?', 'Would you like white rice or basmati?'],
    ['user', 'customer', 'بسمتي لو سمحت', 'basmati law samaht', 'Basmati please'],
    ['waiter', 'waiter', 'وتشرب إيه؟', 'w tishrab eih?', 'And what would you like to drink?'],
    ['user', 'customer', 'عصير مانجا من غير سكر', 'asiir manga min gheer sokkar', 'Mango juice without sugar'],
    ['waiter', 'waiter', 'حاضر، الأكل هييجي كمان عشر دقايق', "haadir, el-akl hayiigi kamaan ashar da'aaye'", 'Sure, the food will come in ten minutes'],
    ['user', 'customer', 'الحساب لو سمحت', 'el-hisaab law samaht', 'The bill please'],
    ['waiter', 'waiter', 'اتفضل، الحساب مية وتمانين جنيه', 'itfaddal, el-hisaab miyya w tamaneen geneeh', 'Here you go, the total is one hundred and eighty pounds'],
    ['user', 'customer', 'اتفضل، شكراً', 'itfaddal, shukran', 'Here you go, thank you'],
  ],
);

export const EGYPTIAN_SUPERMARKET_SCENARIO = scenario(
  'everyday-supermarket', 'EgyptianEverydaySupermarket', 'At the Supermarket',
  'Find groceries, ask about availability, and pay.', 'A supermarket in Cairo',
  'Ask where products are and understand a checkout exchange.', 'cairo-supermarket', [
    ['user', 'customer', 'لو سمحت، اللبن فين؟', 'law samaht, el-laban fein?', 'Excuse me, where is the milk?'],
    ['waiter', 'staff', 'في التلاجات، آخر الممر', 'fi et-tallagaat, aakhir el-mamarr', 'In the fridges, at the end of the aisle'],
    ['user', 'customer', 'وعندكم عيش بلدي؟', 'w andakum eish baladi?', 'And do you have baladi bread?'],
    ['waiter', 'staff', 'أيوه، لسه طازة', 'aywa, lissa taaza', 'Yes, it is still fresh'],
    ['user', 'customer', 'بكام الرغيف؟', 'bikam er-raghiif?', 'How much is one loaf?'],
    ['waiter', 'staff', 'بخمسة جنيه', 'bi-khamsa geneeh', 'Five pounds'],
    ['user', 'customer', 'تمام، هاخد اتنين', 'tamaam, haakhod itneen', 'Okay, I will take two'],
    ['waiter', 'cashier', 'تحب كيس؟', 'tihibb kiis?', 'Would you like a bag?'],
    ['user', 'customer', 'أيوه، كيس واحد لو سمحت', 'aywa, kiis waahid law samaht', 'Yes, one bag please'],
    ['waiter', 'cashier', 'الحساب مية وعشرين جنيه', 'el-hisaab miyya w ishreen geneeh', 'The total is one hundred and twenty pounds'],
    ['user', 'customer', 'اتفضل، شكراً', 'itfaddal, shukran', 'Here you go, thank you'],
  ],
);

export const EGYPTIAN_TAXI_SCENARIO = scenario(
  'everyday-taxi', 'EgyptianEverydayTaxi', 'Taking a Taxi',
  'Give a destination, clarify the route, and pay the driver.', 'Inside a Cairo taxi',
  'State a destination and use simple route language.', 'cairo-taxi', [
    ['waiter', 'driver', 'مساء الخير، رايح فين؟', 'masa el-kheir, raayih fein?', 'Good evening, where are you going?'],
    ['user', 'passenger', 'خدني محطة رمسيس لو سمحت', 'khodni mahattit ramsiis law samaht', 'Take me to Ramses Station please'],
    ['waiter', 'driver', 'من الكورنيش ولا من وسط البلد؟', 'min el-korniish walla min wist el-balad?', 'Via the Corniche or downtown?'],
    ['user', 'passenger', 'من وسط البلد أسرع', 'min wist el-balad asra', 'Downtown is faster'],
    ['waiter', 'driver', 'تمام، بس الطريق زحمة شوية', "tamaam, bas et-tarii' zihma shwayya", 'Okay, but the road is a little busy'],
    ['user', 'passenger', 'مفيش مشكلة', 'mafiish mushkila', 'No problem'],
    ['user', 'passenger', 'ممكن تقف هنا على اليمين؟', "momken ti'af hina ala el-yimeen?", 'Can you stop here on the right?'],
    ['waiter', 'driver', 'حاضر، وصلنا', 'haadir, wisilna', 'Sure, we have arrived'],
    ['user', 'passenger', 'الحساب كام؟', 'el-hisaab kam?', 'How much is the fare?'],
    ['waiter', 'driver', 'خمسة وسبعين جنيه', 'khamsa w sabeen geneeh', 'Seventy-five pounds'],
  ],
);

export const EGYPTIAN_DIRECTIONS_SCENARIO = scenario(
  'directions', 'EgyptianDirections', 'Asking for Directions',
  'Ask how to reach a nearby place and follow directions.', 'A street in central Cairo',
  'Ask where a place is and understand left, right, and straight ahead.', 'cairo-street-directions', [
    ['user', 'visitor', 'لو سمحت، المترو فين؟', 'law samaht, el-metro fein?', 'Excuse me, where is the metro?'],
    ['waiter', 'local', 'امشي على طول لحد الإشارة', 'imshi ala tuul lihadd el-ishaara', 'Walk straight until the traffic light'],
    ['user', 'visitor', 'وبعدين أروح يمين؟', 'w badein aruuh yimeen?', 'Then do I go right?'],
    ['waiter', 'local', 'لأ، لف شمال', 'la, liff shimaal', 'No, turn left', undefined, undefined, 'لأ، لِفّ شمال.'],
    ['user', 'visitor', 'بعيد من هنا؟', 'baeed min hina?', 'Is it far from here?'],
    ['waiter', 'local', 'لأ، خمس دقايق مشي', "la, khamas da'aaye' mashi", 'No, it is a five-minute walk'],
    ['user', 'visitor', 'المحطة قبل البنك ولا بعده؟', 'el-mahatta abl el-bank walla badoh?', 'Is the station before the bank or after it?'],
    ['waiter', 'local', 'بعد البنك على طول', 'bad el-bank ala tuul', 'Right after the bank'],
    ['user', 'visitor', 'تمام، شكراً جداً', 'tamaam, shukran geddan', 'Okay, thank you very much'],
    ['waiter', 'local', 'العفو، مع السلامة', 'el-afw, maa es-salaama', 'You are welcome, goodbye'],
  ],
);

export const EGYPTIAN_PHARMACY_SCENARIO = scenario(
  'everyday-pharmacy', 'EgyptianEverydayPharmacy', 'At the Pharmacy',
  'Describe a simple symptom and understand medicine instructions.', 'A pharmacy in Cairo',
  'Ask for medicine and understand a basic dosage instruction.', 'cairo-pharmacy', [
    ['waiter', 'pharmacist', 'أهلاً، محتاج إيه؟', 'ahlan, mihtaag eih?', 'Hi, what do you need?'],
    ['user', 'customer', 'عندي برد وكحة', 'andi bard w kohha', 'I have a cold and a cough'],
    ['waiter', 'pharmacist', 'عندك حرارة؟', 'andak haraara?', 'Do you have a fever?'],
    ['user', 'customer', 'لأ، مفيش حرارة', 'la, mafiish haraara', 'No, I do not have a fever'],
    ['waiter', 'pharmacist', 'الكحة بقالها كام يوم؟', 'el-kohha baalha kam yoom?', 'How many days have you had the cough?'],
    ['user', 'customer', 'بقالها يومين', 'baalha yoomeen', 'For two days'],
    ['waiter', 'pharmacist', 'خد الدوا ده بعد الأكل', 'khod ed-dawa da bad el-akl', 'Take this medicine after food'],
    ['user', 'customer', 'كام مرة في اليوم؟', 'kam marra fi el-yoom?', 'How many times a day?'],
    ['waiter', 'pharmacist', 'تلات مرات، كل تمن ساعات', 'talaat marraat, koll taman saaat', 'Three times, every eight hours'],
    ['user', 'customer', 'تمام، شكراً', 'tamaam, shukran', 'Okay, thank you'],
  ],
);

export const EGYPTIAN_BARBER_SCENARIO = scenario(
  'everyday-barber', 'EgyptianEverydayBarber', 'At the Barber',
  'Explain the haircut you want and check the result.', 'A barbershop in Cairo',
  'Request a haircut and describe length using simple phrases.', 'cairo-barbershop', [
    ['waiter', 'barber', 'أهلاً، تحب تعمل إيه؟', 'ahlan, tihibb taamil eih?', 'Hi, what would you like?'],
    ['user', 'customer', 'عايز أقصره شوية', "aayiz a'assaroh shwayya", 'I want to shorten it a little'],
    [
      'waiter',
      'barber',
      'والجناب، عايزها قصيرة؟',
      "wel-geenab, 'aayezha 'aseera?",
      'And the sides, do you want them short?',
      [
        "wel-geenab, 'aayezha 'aseera?",
        'wel-geenab aayezha aseera',
        'wel geenab aayezha aseera',
        'wel-ginaab aayezha aseera',
      ],
      undefined,
      'والگيناب، عايزها قصيرة؟',
      require('../assets/audio/egyptian/unit-6/everyday-barber/w2.mp3'),
    ],
    ['user', 'customer', 'الجناب قصيرة، ومن فوق أطول شوية', "el-ginaab asiira, w min foo' atwal shwayya", 'Short on the sides and a little longer on top'],
    ['waiter', 'barber', 'تحب أظبط الدقن؟', "tihibb azabbat ed-da'n?", 'Would you like me to trim the beard?'],
    ['user', 'customer', 'أيوه، بس خفيف', 'aywa, bas khafiif', 'Yes, but lightly'],
    ['waiter', 'barber', 'كده الطول كويس؟', 'kida et-tuul kwayyis?', 'Is this length good?'],
    ['user', 'customer', 'أيوه، كده تمام', 'aywa, kida tamaam', 'Yes, that is perfect'],
    ['waiter', 'barber', 'خلاص، اتفضل بص في المراية', 'khalaas, itfaddal boss fi el-miraaya', 'All done, have a look in the mirror'],
    ['user', 'customer', 'حلو أوي، تسلم إيدك', 'helw awi, tislam iidak', 'Very nice, thank you for your work'],
  ],
);

export const EGYPTIAN_HOTEL_SCENARIO = scenario(
  'everyday-hotel', 'EgyptianEverydayHotel', 'At a Hotel',
  'Check in and ask about breakfast and hotel information.', 'A hotel reception in Cairo',
  'Confirm a booking and ask for practical hotel information.', 'cairo-hotel', [
    ['waiter', 'receptionist', 'مساء الخير، أقدر أساعدك؟', "masa el-kheir, a'dar asaa'dak?", 'Good evening, can I help you?'],
    ['user', 'guest', 'مساء النور، أنا حاجز أوضة', 'masa en-nuur, ana haagiz ooda', 'Good evening, I have booked a room'],
    ['waiter', 'receptionist', 'الحجز باسم مين؟', 'el-hagz bism meen?', 'What name is the booking under?'],
    ['user', 'guest', 'باسم يوسف علي', 'bism yusuf ali', 'Under Yusuf Ali'],
    ['waiter', 'receptionist', 'تمام، أوضتك في الدور التالت', 'tamaam, oodtak fi ed-door et-taalit', 'Okay, your room is on the third floor'],
    ['user', 'guest', 'الفطار الساعة كام؟', 'el-fotaar es-saa kam?', 'What time is breakfast?'],
    ['waiter', 'receptionist', 'من سبعة لعشرة الصبح', 'min saba li-ashara es-subh', 'From seven to ten in the morning'],
    ['user', 'guest', 'ممكن باسورد الواي فاي؟', 'momken password el-wifi?', 'Can I have the Wi-Fi password?'],
    ['waiter', 'receptionist', 'مكتوب على الكارت', 'maktuub ala el-kart', 'It is written on the card'],
    ['user', 'guest', 'تمام، شكراً ليك', 'tamaam, shukran liik', 'Okay, thank you'],
  ],
);

export const EGYPTIAN_AIRPORT_SCENARIO = scenario(
  'everyday-airport', 'EgyptianEverydayAirport', 'At the Airport',
  'Find your gate, ask about departure time, and confirm boarding.', 'Cairo International Airport',
  'Ask for flight times, boarding information, and directions to the gate.', 'cairo-airport', [
    ['user', 'traveller', 'لو سمحت، رحلة أسوان من أنهي بوابة؟', 'law samaht, rihlit aswaan min anhi bawwaaba?', 'Excuse me, which gate is the Aswan flight from?'],
    ['waiter', 'airport staff', 'من بوابة اتناشر', 'min bawwaabit itnaashar', 'From gate twelve'],
    ['user', 'traveller', 'الطيارة هتقوم إمتى؟', "et-tayyaara hat'uum imta?", 'When will the plane depart?'],
    ['waiter', 'airport staff', 'الساعة ستة إلا ربع', 'es-saa sitta illa rob', 'At a quarter to six'],
    ['user', 'traveller', 'هو في تأخير؟', 'howwa fi taakhiir?', 'Is there a delay?'],
    ['waiter', 'airport staff', 'لأ، الرحلة في معادها', 'la, er-rihla fi miaadha', 'No, the flight is on time'],
    ['user', 'traveller', 'البوردينج هيبدأ إمتى؟', 'el-boarding hayibda imta?', 'When will boarding start?'],
    ['waiter', 'airport staff', 'كمان نص ساعة', 'kamaan noss saa', 'In half an hour'],
    ['user', 'traveller', 'البوابة بعيدة؟', 'el-bawwaaba baeeda?', 'Is the gate far?'],
    ['waiter', 'airport staff', 'لأ، امشي على طول وهتلاقيها', "la, imshi ala tuul w hatla'iha", 'No, walk straight and you will find it'],
  ],
);

export const EGYPTIAN_PHONE_CALL_SCENARIO = scenario(
  'phone-call', 'EgyptianPhoneCall', 'Making a Phone Call',
  'Answer the phone, identify the caller, and arrange a time.', 'A short everyday phone call',
  'Open a phone call naturally and make a simple plan.', 'cairo-phone-call', [
    ['waiter', 'receiver', 'ألو، مين معايا؟', 'aloo, meen maaya?', 'Hello, who is speaking?'],
    ['user', 'caller', 'ألو، أنا يوسف', 'aloo, ana yusuf', 'Hello, this is Yusuf'],
    ['waiter', 'receiver', 'أهلاً يا يوسف، عامل إيه؟', 'ahlan ya yusuf, aamil eih?', 'Hi Yusuf, how are you?'],
    ['user', 'caller', 'كويس، إنت فاضي النهارده؟', 'kwayyis, inta faadi en-naharda?', 'Good, are you free today?'],
    ['waiter', 'friend', 'أيوه، بعد الشغل', 'aywa, bad esh-shoghl', 'Yes, after work'],
    ['user', 'caller', 'نتقابل الساعة سبعة؟', 'nit-aabil es-saa saba?', 'Shall we meet at seven?'],
    ['waiter', 'friend', 'تمام، نتقابل فين؟', 'tamaam, nit-aabil fein?', 'Okay, where shall we meet?'],
    ['user', 'caller', 'قدام المترو', 'oddaam el-metro', 'In front of the metro'],
    ['waiter', 'friend', 'اتفقنا، أشوفك الساعة سبعة', "ittafa'na, ashuufak es-saa saba", 'Agreed, I will see you at seven'],
    ['user', 'caller', 'تمام، مع السلامة', 'tamaam, maa es-salaama', 'Okay, goodbye'],
  ],
);

export const EGYPTIAN_UNIT6_SCENARIOS: EgyptianUnit6Scenario[] = [
  EGYPTIAN_CAFE_ORDER_SCENARIO,
  EGYPTIAN_RESTAURANT_ORDER_SCENARIO,
  EGYPTIAN_SUPERMARKET_SCENARIO,
  EGYPTIAN_TAXI_SCENARIO,
  EGYPTIAN_DIRECTIONS_SCENARIO,
  EGYPTIAN_PHARMACY_SCENARIO,
  EGYPTIAN_BARBER_SCENARIO,
  EGYPTIAN_HOTEL_SCENARIO,
  EGYPTIAN_AIRPORT_SCENARIO,
  EGYPTIAN_PHONE_CALL_SCENARIO,
];

export const EGYPTIAN_UNIT6_SCENARIOS_BY_NAME = Object.fromEntries(
  EGYPTIAN_UNIT6_SCENARIOS.map(item => [item.scenarioName, item.dialogue]),
) as Record<string, DialogueTurn[]>;

export const EGYPTIAN_UNIT6_AUDIO_TARGETS = EGYPTIAN_UNIT6_SCENARIOS.flatMap(item =>
  item.dialogue.map((turn, index) => ({
    source: `egyptian-unit-6:${item.contentId}`,
    line: index + 1,
    text: turn.audioText ?? turn.displayArabic ?? turn.arabic,
    outputPath: turn.audioPath,
    voiceId: EGYPTIAN_VOICE_ID,
    modelId: EGYPTIAN_MODEL_ID,
  })),
);
