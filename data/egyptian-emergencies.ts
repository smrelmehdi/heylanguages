import type { DialogueTurn } from './gulf-dialogues';
import { EGYPTIAN_UNIT810_AUDIO_BY_PATH } from './egyptian-unit810-audio';
import { EGYPTIAN_MODEL_ID, EGYPTIAN_VOICE_ID } from './egyptian-unit6';

type EmergencyTurn = [
  type: 'waiter' | 'user',
  speakerRole: string,
  displayArabic: string,
  transliteration: string,
  english: string,
  audioText?: string,
];

export interface EgyptianEmergencyScenario {
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
  entries: EmergencyTurn[],
  useEntranceImage = false,
): EgyptianEmergencyScenario {
  let staffIndex = 0;
  let userIndex = 0;
  const dialogue = entries.map(([type, speakerRole, displayArabic, transliteration, english, audioText]) => {
    const index = type === 'waiter' ? ++staffIndex : ++userIndex;
    const prefix = type === 'waiter' ? 'w' : 'u';
    const audioPath = `assets/audio/egyptian/unit-8/${contentId}/${prefix}${index}.mp3`;
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

export const EGYPTIAN_DOCTOR_APPOINTMENT_SCENARIO = scenario(
  'doctor-appointment', 'EgyptianDoctorAppointment', 'Doctor Appointment',
  'Book a same-day appointment and describe a simple symptom.', 'A clinic reception in Cairo',
  'Ask to see a doctor and answer basic reception questions.', 'cairo-doctor-clinic', [
    ['waiter', 'receptionist', 'أهلاً، عندك معاد؟', "ahlan, andak ma'aad?", 'Hi, do you have an appointment?'],
    ['user', 'patient', 'لأ، محتاج أكشف النهارده', 'la, mihtaag akshif ennaharda', 'No, I need to see a doctor today'],
    ['waiter', 'receptionist', 'تعبان من إيه؟', 'tabaan min eih?', 'What is bothering you?'],
    ['user', 'patient', 'عندي صداع وتعبان أوي', "andi sodaa' w tabaan awi", 'I have a headache and feel very tired'],
    ['waiter', 'receptionist', 'من إمتى؟', 'min imta?', 'Since when?'],
    ['user', 'patient', 'من امبارح بالليل', 'min imbaarih billeil', 'Since last night'],
    ['waiter', 'receptionist', 'معاك بطاقة؟', "maak bitaa'a?", 'Do you have an ID card?'],
    ['user', 'patient', 'أيوه، اتفضل', 'aywa, etfaddal', 'Yes, here you go'],
    ['waiter', 'receptionist', 'استنى هنا، الدكتور هيناديك', 'istanna hina, ed-doktoor haynaadiik', 'Wait here; the doctor will call you'],
    ['user', 'patient', 'تمام، شكراً', 'tamaam, shokran', 'Okay, thank you'],
  ], true,
);

export const EGYPTIAN_HOSPITAL_RECEPTION_SCENARIO = scenario(
  'hospital-reception', 'EgyptianHospitalReception', 'Hospital Reception',
  'Ask for urgent medical help for a family member.', 'A Cairo hospital reception desk',
  'Explain who needs help and follow directions to emergency reception.', 'cairo-hospital-reception', [
    ['waiter', 'receptionist', 'مساء الخير، أقدر أساعدك إزاي؟', "masa el-kheir, a'dar asaa'dak izzay?", 'Good evening, how can I help you?'],
    ['user', 'relative', 'أختي تعبانة ومحتاجة دكتور', 'okhti tabaana w mihtaaga doktoor', 'My sister is unwell and needs a doctor'],
    ['waiter', 'receptionist', 'عندها إيه؟', 'andaha eih?', 'What is wrong with her?'],
    ['user', 'relative', 'بطنها بتوجعها', "batnaha bitwaga'ha", 'Her stomach hurts'],
    ['waiter', 'receptionist', 'عندها حرارة؟', 'andaha haraara?', 'Does she have a fever?'],
    ['user', 'relative', 'أيوه، شوية', 'aywa, shwayya', 'Yes, a little'],
    ['waiter', 'receptionist', 'من إمتى؟', 'min imta?', 'Since when?'],
    ['user', 'relative', 'من الصبح', 'min es-sobh', 'Since the morning'],
    ['waiter', 'receptionist', 'اتفضلوا، الطوارئ من هنا', 'etfaddalu, et-tawaari min hina', 'Please come this way; emergency reception is here'],
    ['user', 'relative', 'شكراً لحضرتك', 'shokran lihadritak', 'Thank you'],
  ], true,
);

export const EGYPTIAN_DESCRIBING_PAIN_SCENARIO = scenario(
  'describing-pain', 'EgyptianDescribingPain', 'Describing Pain',
  'Tell a doctor where and how long something hurts.', 'A consultation room in Cairo',
  'Describe simple pain and answer short medical questions.', 'cairo-consultation-room', [
    ['waiter', 'doctor', 'فين الوجع؟', "fein el-waga'?", 'Where does it hurt?'],
    ['user', 'patient', 'بطني بتوجعني', "batni bitwaga'ni", 'My stomach hurts', 'بطني بتوگعني.'],
    ['waiter', 'doctor', 'الوجع شديد؟', "el-waga' shadeed?", 'Is the pain severe?'],
    ['user', 'patient', 'شوية، مش أوي', 'shwayya, mish awi', 'A little, not very'],
    ['waiter', 'doctor', 'من إمتى؟', 'min imta?', 'Since when?'],
    ['user', 'patient', 'من يومين', 'min yoomein', 'For two days'],
    ['waiter', 'doctor', 'أكلت حاجة مختلفة؟', 'akalt haaga mokhtalifa?', 'Did you eat anything different?'],
    ['user', 'patient', 'مش فاكر', 'mish faakir', 'I do not remember'],
    ['waiter', 'doctor', 'هكشف عليك دلوقتي', "hakshif aleik dilwa'ti", 'I will examine you now'],
    ['user', 'patient', 'حاضر', 'haadir', 'Okay'],
  ],
);

export const EGYPTIAN_PHARMACY_EMERGENCY_SCENARIO = scenario(
  'pharmacy-emergency', 'EgyptianPharmacyEmergency', 'Urgent Pharmacy Help',
  'Ask a pharmacist for urgent advice and find a nearby clinic.', 'A late-night pharmacy in Cairo',
  'Explain an urgent need and understand when to see a doctor.', 'cairo-emergency-pharmacy', [
    ['waiter', 'pharmacist', 'مساء الخير، محتاج إيه؟', 'masa el-kheir, mihtaag eih?', 'Good evening, what do you need?'],
    ['user', 'customer', 'محتاج حاجة للحرارة بسرعة', 'mihtaag haaga lil-haraara bisora', 'I need something for a fever quickly'],
    ['waiter', 'pharmacist', 'الحرارة عالية؟', 'el-haraara aalya?', 'Is the fever high?'],
    ['user', 'customer', 'أيوه، وأخويا تعبان', 'aywa, w akhuuya tabaan', 'Yes, and my brother is unwell'],
    ['waiter', 'pharmacist', 'عنده حساسية من دوا؟', 'ando hasaaseyya min dawa?', 'Is he allergic to any medicine?'],
    ['user', 'customer', 'ما أعرفش', "ma a'rafsh", 'I do not know'],
    ['waiter', 'pharmacist', 'لازم تشوفوا دكتور الأول', 'laazim tshuufu doktoor el-awwal', 'You need to see a doctor first'],
    ['user', 'customer', 'أقرب دكتور فين؟', "a'rab doktoor fein?", 'Where is the nearest doctor?'],
    ['waiter', 'pharmacist', 'العيادة جنب الصيدلية', 'el-eyaada gamb es-seidaleyya', 'The clinic is next to the pharmacy'],
    ['user', 'customer', 'تمام، شكراً', 'tamaam, shokran', 'Okay, thank you'],
  ], true,
);

export const EGYPTIAN_CALLING_AMBULANCE_SCENARIO = scenario(
  'calling-ambulance', 'EgyptianCallingAmbulance', 'Calling an Ambulance',
  'Call an ambulance and give calm, useful information.', 'An emergency phone call in Cairo',
  'Describe the situation, give a location, and follow instructions.', 'cairo-ambulance-call', [
    ['waiter', 'dispatcher', 'الإسعاف، إيه الحالة؟', 'el-esaaf, eih el-haala?', 'Ambulance service, what is the situation?'],
    ['user', 'caller', 'في واحد تعبان ومش قادر يقف', "fi waahid tabaan w mish a'dir yi'af", 'Someone is unwell and cannot stand'],
    ['waiter', 'dispatcher', 'هو واعي؟', 'howwa waai?', 'Is he conscious?'],
    ['user', 'caller', 'أيوه، بس تعبان أوي', 'aywa, bas tabaan awi', 'Yes, but he is very unwell'],
    ['waiter', 'dispatcher', 'العنوان فين؟', 'el-onwaan fein?', 'What is the address?'],
    ['user', 'caller', 'شارع النيل، جنب البنك', 'shaare en-niil, gamb el-bank', 'Nile Street, next to the bank'],
    ['waiter', 'dispatcher', 'اسمك إيه؟', 'ismak eih?', 'What is your name?'],
    ['user', 'caller', 'اسمي يوسف', 'ismi yuusuf', 'My name is Yusuf'],
    ['waiter', 'dispatcher', 'عربية الإسعاف جاية، خليك معاه', "arabeyyet el-esaaf gayya, khalliik ma'aah", 'The ambulance is coming; stay with him'],
    ['user', 'caller', 'حاضر، بسرعة لو سمحت', 'haadir, bisora law samaht', 'Okay, quickly please'],
  ],
);

export const EGYPTIAN_POLICE_HELP_SCENARIO = scenario(
  'police-help', 'EgyptianPoliceHelp', 'Police Help',
  'Report a stolen bag and give simple identifying details.', 'A call to the police in Cairo',
  'Ask for police help, explain where you are, and describe an item.', 'cairo-police-help', [
    ['waiter', 'dispatcher', 'النجدة، إيه البلاغ؟', "en-nagda, eih el-balaagh?", 'Police emergency, what is the report?'],
    ['user', 'caller', 'محتاج مساعدة، شنطتي اتسرقت', "mihtaag mosaa'ada, shantiti etsara'et", 'I need help; my bag was stolen'],
    ['waiter', 'dispatcher', 'إنت فين دلوقتي؟', "enta fein dilwa'ti?", 'Where are you now?'],
    ['user', 'caller', 'قدام محطة المترو', 'oddaam mahattet el-metro', 'In front of the metro station'],
    ['waiter', 'dispatcher', 'شفت اللي خدها؟', 'shoft elli khadaha?', 'Did you see who took it?'],
    ['user', 'caller', 'لأ، ما شفتوش', 'la, ma shoftuush', 'No, I did not see him'],
    ['waiter', 'dispatcher', 'لون الشنطة إيه؟', 'loon esh-shanta eih?', 'What color is the bag?'],
    ['user', 'caller', 'سودا وصغيرة', 'sooda w soghayyara', 'Black and small'],
    ['waiter', 'dispatcher', 'خليك مكانك، هنبعت لك حد', "khalliik makaanak, hanib'at lak hadd", 'Stay where you are; we will send someone to you'],
    ['user', 'caller', 'تمام، شكراً', 'tamaam, shokran', 'Okay, thank you'],
  ],
);

export const EGYPTIAN_LOST_PHONE_SCENARIO = scenario(
  'lost-phone', 'EgyptianLostPhone', 'Lost Phone',
  'Ask for help finding a missing phone.', 'A café in Cairo',
  'Explain where a phone may be and try practical next steps.', 'cairo-lost-phone', [
    ['user', 'customer', 'ممكن تساعدني؟ موبايلي ضاع', "momken tesaa'idni? mobaayli daa'", 'Can you help me? My phone is lost'],
    ['waiter', 'friend', 'ضاع فين تقريباً؟', "daa' fein ta'riiban?", 'About where did you lose it?'],
    ['user', 'customer', 'يمكن في الكافيه', 'yimkin fil-kafeih', 'Maybe in the café'],
    ['waiter', 'friend', 'فاكر كان على الترابيزة؟', 'faakir kaan ala et-taraabeeza?', 'Do you remember if it was on the table?'],
    ['user', 'customer', 'أيوه، غالباً', 'aywa, ghaaliban', 'Yes, probably'],
    ['waiter', 'friend', 'جربت تكلمه؟', 'garrabt tikallimu?', 'Did you try calling it?'],
    ['user', 'customer', 'أيوه، بس مقفول', "aywa, bas ma'fuul", 'Yes, but it is switched off'],
    ['waiter', 'friend', 'تعال نسأل العامل', 'taala nisal el-aamil', 'Come on, let us ask the worker'],
    ['user', 'customer', 'ماشي، شكراً', 'maashi, shokran', 'Okay, thank you'],
    ['waiter', 'friend', 'العفو', 'el-afw', 'You are welcome'],
  ], true,
);

export const EGYPTIAN_LOST_CHILD_SCENARIO = scenario(
  'lost-child', 'EgyptianLostChild', 'Lost Child',
  'Ask staff for calm, immediate help finding a child.', 'A shopping centre help desk in Cairo',
  'Describe a child and say where you last saw him.', 'cairo-lost-child-help-desk', [
    ['user', 'parent', 'لو سمحت، ابني ضاع مني', "law samaht, ibni daa' minni", 'Excuse me, my son is missing'],
    ['waiter', 'staff', 'حاضر، اسمه إيه؟', 'haadir, ismo eih?', 'Okay, what is his name?'],
    ['user', 'parent', 'اسمه آدم', 'ismo aadam', 'His name is Adam'],
    ['waiter', 'staff', 'عنده كام سنة؟', 'ando kam sana?', 'How old is he?'],
    ['user', 'parent', 'خمس سنين', 'khams sineen', 'Five years old'],
    ['waiter', 'staff', 'لابس إيه؟', 'laabis eih?', 'What is he wearing?'],
    ['user', 'parent', 'تيشيرت أزرق وبنطلون أسود', 'tiishirt azra w bantaluun iswid', 'A blue T-shirt and black trousers'],
    ['waiter', 'staff', 'شفته آخر مرة فين؟', 'shofto aakhir marra fein?', 'Where did you last see him?'],
    ['user', 'parent', 'جنب المدخل', 'gamb el-madkhal', 'Next to the entrance'],
    ['waiter', 'staff', 'هننادي عليه حالاً', 'hannadi aleih haalan', 'We will call for him right away'],
  ],
);

export const EGYPTIAN_CAR_PROBLEM_SCENARIO = scenario(
  'car-problem', 'EgyptianCarProblem', 'Car Problem',
  'Call roadside help when a car stops working.', 'The Cairo ring road',
  'Explain what happened, give your location, and ask when help will arrive.', 'cairo-roadside-help', [
    ['user', 'driver', 'لو سمحت، العربية عطلت', 'law samaht, el-arabeyya atalet', 'Excuse me, the car broke down'],
    ['waiter', 'roadside_agent', 'إيه اللي حصل؟', 'eih elli hasal?', 'What happened?'],
    ['user', 'driver', 'بطلت فجأة ومش راضية تدور', 'batalet faga w mish raadya tiduur', 'It stopped suddenly and will not start'],
    ['waiter', 'roadside_agent', 'إنت واقف فين؟', "enta waa'if fein?", 'Where are you stopped?'],
    ['user', 'driver', 'على الطريق الدائري', "ala et-tarii' ed-daa'iri", 'On the ring road'],
    ['waiter', 'roadside_agent', 'إنت في مكان آمن؟', 'enta fi makaan aamin?', 'Are you in a safe place?'],
    ['user', 'driver', 'أيوه، على جنب الطريق', "aywa, ala gamb et-tarii'", 'Yes, at the side of the road'],
    ['waiter', 'roadside_agent', 'هبعت لك ميكانيكي', "hab'at lak mikaaniiki", 'I will send you a mechanic'],
    ['user', 'driver', 'هيوصل إمتى؟', 'hayuusal imta?', 'When will he arrive?'],
    ['waiter', 'roadside_agent', 'خلال نص ساعة', "khilaal nos saa'a", 'Within half an hour'],
  ],
);

export const EGYPTIAN_URGENT_HELP_SCENARIO = scenario(
  'urgent-help', 'EgyptianUrgentHelp', 'Urgent Help',
  'Ask a nearby person for urgent help without panic.', 'A public place in Cairo',
  'Explain that help is urgent and call the right service.', 'cairo-urgent-help', [
    ['user', 'caller', 'ممكن تساعدني؟', "momken tesaa'idni?", 'Can you help me?'],
    ['waiter', 'bystander', 'طبعاً، في إيه؟', "tab'an, fi eih?", 'Of course, what is it?'],
    ['user', 'caller', 'الموضوع ضروري', "el-mawduu' daruuri", 'It is urgent'],
    ['waiter', 'bystander', 'محتاج إيه؟', 'mihtaag eih?', 'What do you need?'],
    ['user', 'caller', 'صاحبي تعبان ومحتاج دكتور', 'saahbi tabaan w mihtaag doktoor', 'My friend is unwell and needs a doctor'],
    ['waiter', 'bystander', 'هو فين؟', 'howwa fein?', 'Where is he?'],
    ['user', 'caller', 'جوه العربية', 'gowwa el-arabeyya', 'Inside the car'],
    ['waiter', 'bystander', 'كلمت الإسعاف؟', 'kallimt el-esaaf?', 'Did you call an ambulance?'],
    ['user', 'caller', 'لسه، هكلمهم دلوقتي', "lissa, hakallimhom dilwa'ti", 'Not yet; I will call them now'],
    ['waiter', 'bystander', 'تمام، كلمهم بسرعة', "tamaam, kallimhom bisor'a", 'Okay, call them quickly'],
  ],
);

export const EGYPTIAN_LOST_CHILD_FEMININE_EXAMPLE = {
  displayArabic: 'بنتي ضاعت مني',
  audioText: 'بنتي ضاعت مني.',
  evalTarget: 'بنتي ضاعت مني',
  transliteration: "binti daa'et minni",
  acceptedTransliterations: ["binti daa'et minni", 'binti daaet minni'],
  english: 'My daughter is missing.',
};

export const EGYPTIAN_UNIT8_SCENARIOS: EgyptianEmergencyScenario[] = [
  EGYPTIAN_DOCTOR_APPOINTMENT_SCENARIO,
  EGYPTIAN_HOSPITAL_RECEPTION_SCENARIO,
  EGYPTIAN_DESCRIBING_PAIN_SCENARIO,
  EGYPTIAN_PHARMACY_EMERGENCY_SCENARIO,
  EGYPTIAN_CALLING_AMBULANCE_SCENARIO,
  EGYPTIAN_POLICE_HELP_SCENARIO,
  EGYPTIAN_LOST_PHONE_SCENARIO,
  EGYPTIAN_LOST_CHILD_SCENARIO,
  EGYPTIAN_CAR_PROBLEM_SCENARIO,
  EGYPTIAN_URGENT_HELP_SCENARIO,
];

export const EGYPTIAN_UNIT8_SCENARIOS_BY_NAME = Object.fromEntries(
  EGYPTIAN_UNIT8_SCENARIOS.map(item => [item.scenarioName, item.dialogue]),
);

export const EGYPTIAN_UNIT8_AUDIO_TARGETS = EGYPTIAN_UNIT8_SCENARIOS.flatMap(item =>
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
