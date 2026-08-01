import type {
  DialectMissionContent,
  MissionLessonRound,
  MissionLessonWord,
} from './curriculum/types';
import type { Unit1MissionDefinition } from './curriculum/unit1';
import type { DialogueTurn } from './gulf-dialogues';
import { MSA_BIG_REVIEW_QUESTIONS, MSA_FIRST_ARABIC_CHALLENGE_QUESTIONS } from './msa-unit1-quizzes';

const GREETINGS_AND_ANSWERS = 'Greetings and answers';
const PEOPLE = 'People';
const PLACE_AND_TIME = 'Place and time';
const COURTESY = 'Courtesy';
const FRIENDLY_RESPONSES = 'Friendly responses';
const WHEN_YOU_NEED_HELP = 'When you need help';

export const MSA_FIRST_ARABIC_WORDS_ROUNDS: MissionLessonRound[] = [
  {
    roundId: 'greetings_and_answers',
    title: GREETINGS_AND_ANSWERS,
    words: [
      { conceptId: 'greeting_salaam', arabic: 'سلام', displayArabic: 'سلام', evalTarget: 'سلام', transliteration: 'salaam', english: 'Hello', context: GREETINGS_AND_ANSWERS },
      { conceptId: 'greeting_marhaban', arabic: 'مرحباً', displayArabic: 'مرحباً', evalTarget: 'مرحباً', transliteration: 'marhaban', english: 'Hello', context: GREETINGS_AND_ANSWERS },
      { conceptId: 'greeting_ahlan', arabic: 'أهلاً', displayArabic: 'أهلاً', evalTarget: 'أهلاً', transliteration: 'ahlan', english: 'Hi / Welcome', context: GREETINGS_AND_ANSWERS },
      { conceptId: 'answer_yes', arabic: 'نعم', displayArabic: 'نعم', evalTarget: 'نعم', transliteration: 'naʿam', english: 'Yes', context: GREETINGS_AND_ANSWERS },
      { conceptId: 'answer_no', arabic: 'لا', displayArabic: 'لا', evalTarget: 'لا', transliteration: 'laa', english: 'No', context: GREETINGS_AND_ANSWERS },
      { conceptId: 'answer_maybe', arabic: 'ربما', displayArabic: 'ربما', evalTarget: 'ربما', transliteration: 'rubbamaa', english: 'Maybe', context: GREETINGS_AND_ANSWERS },
      { conceptId: 'answer_okay', arabic: 'حسناً', displayArabic: 'حسناً', evalTarget: 'حسناً', transliteration: 'hasanan', english: 'Okay', context: GREETINGS_AND_ANSWERS },
      { conceptId: 'answer_of_course', arabic: 'طبعاً', displayArabic: 'طبعاً', evalTarget: 'طبعاً', transliteration: 'tabʿan', english: 'Of course', context: GREETINGS_AND_ANSWERS },
    ],
  },
  {
    roundId: 'people',
    title: PEOPLE,
    words: [
      { conceptId: 'pronoun_i', arabic: 'أنا', displayArabic: 'أنا', evalTarget: 'أنا', transliteration: 'anaa', english: 'I', context: PEOPLE },
      { conceptId: 'pronoun_you_masculine', arabic: 'أنتَ', displayArabic: 'أنتَ', evalTarget: 'أنتَ', transliteration: 'anta', english: 'You (male)', context: PEOPLE },
      { conceptId: 'pronoun_you_feminine', arabic: 'أنتِ', displayArabic: 'أنتِ', evalTarget: 'أنتِ', transliteration: 'anti', english: 'You (female)', context: PEOPLE },
      { conceptId: 'pronoun_he', arabic: 'هو', displayArabic: 'هو', evalTarget: 'هو', transliteration: 'huwa', english: 'He', context: PEOPLE },
      { conceptId: 'pronoun_she', arabic: 'هي', displayArabic: 'هي', evalTarget: 'هي', transliteration: 'hiya', english: 'She', context: PEOPLE },
    ],
  },
  {
    roundId: 'place_and_time',
    title: PLACE_AND_TIME,
    words: [
      { conceptId: 'place_here', arabic: 'هنا', displayArabic: 'هنا', evalTarget: 'هنا', transliteration: 'hunaa', english: 'Here', context: PLACE_AND_TIME },
      { conceptId: 'place_there', arabic: 'هناك', displayArabic: 'هناك', evalTarget: 'هناك', transliteration: 'hunaaka', english: 'There', context: PLACE_AND_TIME },
      { conceptId: 'time_now', arabic: 'الآن', displayArabic: 'الآن', evalTarget: 'الآن', transliteration: 'al-aan', english: 'Now', context: PLACE_AND_TIME },
      { conceptId: 'time_today', arabic: 'اليوم', displayArabic: 'اليوم', evalTarget: 'اليوم', transliteration: 'al-yawm', english: 'Today', context: PLACE_AND_TIME },
      { conceptId: 'time_tomorrow', arabic: 'غداً', displayArabic: 'غداً', evalTarget: 'غداً', transliteration: 'ghadan', english: 'Tomorrow', context: PLACE_AND_TIME },
      { conceptId: 'question_who', arabic: 'مَن', displayArabic: 'مَن', evalTarget: 'مَن', transliteration: 'man', english: 'Who', context: PLACE_AND_TIME },
      { conceptId: 'question_where', arabic: 'أين', displayArabic: 'أين', evalTarget: 'أين', transliteration: 'ayna', english: 'Where', context: PLACE_AND_TIME },
    ],
  },
];

export const MSA_FIRST_ARABIC_WORDS = MSA_FIRST_ARABIC_WORDS_ROUNDS.flatMap(round => round.words);

export const MSA_FIRST_ARABIC_WORDS_DEFINITION: Unit1MissionDefinition = {
  missionId: 'first_arabic_words',
  missionKind: 'lesson',
  title: 'Your First Arabic Words 👋',
  subtitle: '20 beginner words',
  route: { screen: 'lesson', params: { type: 'first_arabic_words' } },
  homeHref: '/lesson?type=first_arabic_words',
};

export const MSA_FIRST_ARABIC_WORDS_MISSION: DialectMissionContent = {
  missionId: 'first_arabic_words',
  missionKind: 'lesson',
  lessonWords: MSA_FIRST_ARABIC_WORDS,
  lessonRounds: MSA_FIRST_ARABIC_WORDS_ROUNDS,
  objective: 'Introduce 20 standalone beginner words.',
  completionMessage: 'You already know 20 Arabic words.',
  audioMode: 'none',
  reviewable: false,
};

export const MSA_POLITE_LIKE_A_LOCAL_ROUNDS: MissionLessonRound[] = [
  {
    roundId: 'courtesy',
    title: COURTESY,
    words: [
      { conceptId: 'courtesy_thank_you', arabic: 'شكراً', displayArabic: 'شكراً', evalTarget: 'شكراً', transliteration: 'shukran', english: 'Thank you', context: COURTESY },
      { conceptId: 'courtesy_thank_you_very_much', arabic: 'شكراً جزيلاً', displayArabic: 'شكراً جزيلاً', evalTarget: 'شكراً جزيلاً', transliteration: 'shukran jaziilan', english: 'Thank you very much', context: COURTESY },
      { conceptId: 'courtesy_afwan', arabic: 'عفواً', displayArabic: 'عفواً', evalTarget: 'عفواً', transliteration: 'ʿafwan', english: 'You’re welcome / Excuse me', context: COURTESY },
      { conceptId: 'courtesy_excuse_me', arabic: 'عذراً', displayArabic: 'عذراً', evalTarget: 'عذراً', transliteration: 'ʿudhran', english: 'Excuse me', context: COURTESY },
      { conceptId: 'courtesy_please', arabic: 'من فضلك', displayArabic: 'من فضلك', evalTarget: 'من فضلك', transliteration: 'min fadlik', english: 'Please', context: COURTESY },
      { conceptId: 'courtesy_sorry_male', arabic: 'آسف', displayArabic: 'آسف', evalTarget: 'آسف', transliteration: 'aasif', english: 'Sorry (male)', context: COURTESY },
      { conceptId: 'courtesy_sorry_female', arabic: 'آسفة', displayArabic: 'آسفة', evalTarget: 'آسفة', transliteration: 'aasifa', english: 'Sorry (female)', context: COURTESY },
      { conceptId: 'courtesy_no_problem', arabic: 'لا بأس', displayArabic: 'لا بأس', evalTarget: 'لا بأس', transliteration: 'laa ba’s', english: 'No problem', context: COURTESY },
    ],
  },
  {
    roundId: 'friendly_responses',
    title: FRIENDLY_RESPONSES,
    words: [
      { conceptId: 'response_here_you_go_male', arabic: 'تفضل', displayArabic: 'تفضل', evalTarget: 'تفضل', transliteration: 'tafaddal', english: 'Here you go (to a male)', context: FRIENDLY_RESPONSES },
      { conceptId: 'response_here_you_go_female', arabic: 'تفضلي', displayArabic: 'تفضلي', evalTarget: 'تفضلي', transliteration: 'tafaddali', english: 'Here you go (to a female)', context: FRIENDLY_RESPONSES },
      { conceptId: 'response_with_pleasure', arabic: 'بكل سرور', displayArabic: 'بكل سرور', evalTarget: 'بكل سرور', transliteration: 'bikulli suruur', english: 'With pleasure', context: FRIENDLY_RESPONSES },
      { conceptId: 'response_yes_thank_you', arabic: 'نعم، شكراً', displayArabic: 'نعم، شكراً', evalTarget: 'نعم، شكراً', transliteration: 'naʿam, shukran', english: 'Yes, thank you', context: FRIENDLY_RESPONSES },
      { conceptId: 'response_no_thank_you', arabic: 'لا، شكراً', displayArabic: 'لا، شكراً', evalTarget: 'لا، شكراً', transliteration: 'laa, shukran', english: 'No, thank you', context: FRIENDLY_RESPONSES },
      { conceptId: 'response_okay_thank_you', arabic: 'حسناً، شكراً', displayArabic: 'حسناً، شكراً', evalTarget: 'حسناً، شكراً', transliteration: 'hasanan, shukran', english: 'Okay, thank you', context: FRIENDLY_RESPONSES },
      { conceptId: 'response_excellent', arabic: 'ممتاز', displayArabic: 'ممتاز', evalTarget: 'ممتاز', transliteration: 'mumtaaz', english: 'Excellent', context: FRIENDLY_RESPONSES },
      { conceptId: 'response_very_good', arabic: 'جيد جداً', displayArabic: 'جيد جداً', evalTarget: 'جيد جداً', transliteration: 'jayyid jiddan', english: 'Very good', context: FRIENDLY_RESPONSES },
    ],
  },
  {
    roundId: 'when_you_need_help',
    title: WHEN_YOU_NEED_HELP,
    words: [
      { conceptId: 'help_help_me', arabic: 'ساعدني', displayArabic: 'ساعدني', evalTarget: 'ساعدني', transliteration: 'saaʿidnii', english: 'Help me', context: WHEN_YOU_NEED_HELP },
      { conceptId: 'help_wait_a_little', arabic: 'انتظر قليلاً', displayArabic: 'انتظر قليلاً', evalTarget: 'انتظر قليلاً', transliteration: 'intazir qaliilan', english: 'Wait a little', context: WHEN_YOU_NEED_HELP },
      { conceptId: 'help_speak_slowly', arabic: 'تكلم ببطء', displayArabic: 'تكلم ببطء', evalTarget: 'تكلم ببطء', transliteration: 'takallam bibut’', english: 'Speak slowly', context: WHEN_YOU_NEED_HELP },
      { conceptId: 'help_do_not_understand', arabic: 'لا أفهم', displayArabic: 'لا أفهم', evalTarget: 'لا أفهم', transliteration: 'laa afham', english: 'I don’t understand', context: WHEN_YOU_NEED_HELP },
      { conceptId: 'help_understand_a_little', arabic: 'أفهم قليلاً', displayArabic: 'أفهم قليلاً', evalTarget: 'أفهم قليلاً', transliteration: 'afham qaliilan', english: 'I understand a little', context: WHEN_YOU_NEED_HELP },
      { conceptId: 'help_again', arabic: 'مرة أخرى', displayArabic: 'مرة أخرى', evalTarget: 'مرة أخرى', transliteration: 'marratan ukhraa', english: 'Again', context: WHEN_YOU_NEED_HELP },
      { conceptId: 'help_with_your_permission', arabic: 'بعد إذنك', displayArabic: 'بعد إذنك', evalTarget: 'بعد إذنك', transliteration: 'baʿda idhnik', english: 'Excuse me / With your permission', context: WHEN_YOU_NEED_HELP },
      { conceptId: 'help_welcome', arabic: 'أهلاً وسهلاً', displayArabic: 'أهلاً وسهلاً', evalTarget: 'أهلاً وسهلاً', transliteration: 'ahlan wa sahlan', english: 'Welcome', context: WHEN_YOU_NEED_HELP },
    ],
  },
];

export const MSA_POLITE_LIKE_A_LOCAL = MSA_POLITE_LIKE_A_LOCAL_ROUNDS.flatMap(round => round.words);

export const MSA_POLITE_LIKE_A_LOCAL_DEFINITION: Unit1MissionDefinition = {
  missionId: 'polite_like_a_local',
  missionKind: 'lesson',
  title: 'Be Polite Like a Local 😊',
  subtitle: '24 useful phrases',
  route: { screen: 'lesson', params: { type: 'polite_like_a_local' } },
  homeHref: '/lesson?type=polite_like_a_local',
};

export const MSA_POLITE_LIKE_A_LOCAL_MISSION: DialectMissionContent = {
  missionId: 'polite_like_a_local',
  missionKind: 'lesson',
  lessonWords: MSA_POLITE_LIKE_A_LOCAL,
  lessonRounds: MSA_POLITE_LIKE_A_LOCAL_ROUNDS,
  objective: 'Practice courtesy and asking for help.',
  completionMessage: 'You can now be polite and ask for help in Arabic.',
  audioMode: 'none',
  reviewable: false,
};

function missionWord(
  conceptId: string,
  arabic: string,
  transliteration: string,
  english: string,
  context: string,
): MissionLessonWord {
  return {
    conceptId,
    arabic,
    displayArabic: arabic,
    evalTarget: arabic,
    transliteration,
    english,
    context,
  };
}

const PEOPLE_ROUND = 'People';
const FAMILY_ROUND = 'Family';
const PEOPLE_YOU_MEET = 'People you meet';

export const MSA_PEOPLE_AROUND_YOU_ROUNDS: MissionLessonRound[] = [
  {
    roundId: 'people',
    title: PEOPLE_ROUND,
    words: [
      missionWord('person_man', 'رجل', 'rajul', 'Man', PEOPLE_ROUND),
      missionWord('person_woman', 'امرأة', 'imra’a', 'Woman', PEOPLE_ROUND),
      missionWord('person_child', 'طفل', 'tifl', 'Child', PEOPLE_ROUND),
      missionWord('person_boy', 'ولد', 'walad', 'Boy', PEOPLE_ROUND),
      missionWord('person_girl', 'بنت', 'bint', 'Girl', PEOPLE_ROUND),
      missionWord('person_general', 'شخص', 'shakhs', 'Person', PEOPLE_ROUND),
      missionWord('friend_male', 'صديق', 'sadiiq', 'Friend (male)', PEOPLE_ROUND),
      missionWord('friend_female', 'صديقة', 'sadiiqa', 'Friend (female)', PEOPLE_ROUND),
    ],
  },
  {
    roundId: 'family',
    title: FAMILY_ROUND,
    words: [
      missionWord('family_father', 'أب', 'ab', 'Father', FAMILY_ROUND),
      missionWord('family_mother', 'أم', 'umm', 'Mother', FAMILY_ROUND),
      missionWord('family_brother', 'أخ', 'akh', 'Brother', FAMILY_ROUND),
      missionWord('family_sister', 'أخت', 'ukht', 'Sister', FAMILY_ROUND),
      missionWord('family_husband', 'زوج', 'zawj', 'Husband', FAMILY_ROUND),
      missionWord('family_wife', 'زوجة', 'zawja', 'Wife', FAMILY_ROUND),
      missionWord('family_group', 'عائلة', '‘aa’ila', 'Family', FAMILY_ROUND),
      missionWord('community_neighbor', 'جار', 'jaar', 'Neighbor', FAMILY_ROUND),
    ],
  },
  {
    roundId: 'people_you_meet',
    title: PEOPLE_YOU_MEET,
    words: [
      missionWord('role_teacher_male', 'معلم', 'mu’allim', 'Teacher (male)', PEOPLE_YOU_MEET),
      missionWord('role_teacher_female', 'معلمة', 'mu’allima', 'Teacher (female)', PEOPLE_YOU_MEET),
      missionWord('role_doctor_male', 'طبيب', 'tabiib', 'Doctor (male)', PEOPLE_YOU_MEET),
      missionWord('role_doctor_female', 'طبيبة', 'tabiiba', 'Doctor (female)', PEOPLE_YOU_MEET),
      missionWord('role_employee_male', 'موظف', 'muwazzaf', 'Employee (male)', PEOPLE_YOU_MEET),
      missionWord('role_employee_female', 'موظفة', 'muwazzafa', 'Employee (female)', PEOPLE_YOU_MEET),
      missionWord('role_customer', 'زبون', 'zabuun', 'Customer', PEOPLE_YOU_MEET),
      missionWord('role_manager', 'مدير', 'mudiir', 'Manager', PEOPLE_YOU_MEET),
    ],
  },
];

export const MSA_PEOPLE_AROUND_YOU = MSA_PEOPLE_AROUND_YOU_ROUNDS.flatMap(round => round.words);

export const MSA_PEOPLE_AROUND_YOU_DEFINITION: Unit1MissionDefinition = {
  missionId: 'people_around_you',
  missionKind: 'lesson',
  title: 'People Around You 👨‍👩‍👧',
  subtitle: '24 people and roles',
  route: { screen: 'lesson', params: { type: 'people_around_you' } },
  homeHref: '/lesson?type=people_around_you',
};

export const MSA_PEOPLE_AROUND_YOU_MISSION: DialectMissionContent = {
  missionId: 'people_around_you',
  missionKind: 'lesson',
  lessonWords: MSA_PEOPLE_AROUND_YOU,
  lessonRounds: MSA_PEOPLE_AROUND_YOU_ROUNDS,
  objective: 'Recognize people, family, and common roles.',
  completionMessage: 'You can now recognize the people around you in Arabic.',
  audioMode: 'none',
  reviewable: false,
};

const THINGS_YOU_CARRY = 'Things you carry';
const AROUND_THE_HOUSE = 'Around the house';
const USEFUL_OBJECTS = 'Useful objects';

export const MSA_EVERYDAY_OBJECTS_ROUNDS: MissionLessonRound[] = [
  {
    roundId: 'things_you_carry',
    title: THINGS_YOU_CARRY,
    words: [
      missionWord('carry_phone', 'هاتف', 'haatif', 'Phone', THINGS_YOU_CARRY),
      missionWord('carry_key', 'مفتاح', 'miftaah', 'Key', THINGS_YOU_CARRY),
      missionWord('carry_book', 'كتاب', 'kitaab', 'Book', THINGS_YOU_CARRY),
      missionWord('carry_pen', 'قلم', 'qalam', 'Pen', THINGS_YOU_CARRY),
      missionWord('carry_bag', 'حقيبة', 'haqiiba', 'Bag', THINGS_YOU_CARRY),
      missionWord('carry_watch_clock', 'ساعة', 'saa’a', 'Watch / Clock', THINGS_YOU_CARRY),
      missionWord('carry_glasses', 'نظارة', 'nazzaara', 'Glasses', THINGS_YOU_CARRY),
      missionWord('carry_shoe', 'حذاء', 'hidhaa’', 'Shoe', THINGS_YOU_CARRY),
    ],
  },
  {
    roundId: 'around_the_house',
    title: AROUND_THE_HOUSE,
    words: [
      missionWord('home_house', 'بيت', 'bayt', 'House', AROUND_THE_HOUSE),
      missionWord('home_room', 'غرفة', 'ghurfa', 'Room', AROUND_THE_HOUSE),
      missionWord('home_door', 'باب', 'baab', 'Door', AROUND_THE_HOUSE),
      missionWord('home_window', 'نافذة', 'naafidha', 'Window', AROUND_THE_HOUSE),
      missionWord('home_chair', 'كرسي', 'kursii', 'Chair', AROUND_THE_HOUSE),
      missionWord('home_table', 'طاولة', 'taawila', 'Table', AROUND_THE_HOUSE),
      missionWord('home_bed', 'سرير', 'sariir', 'Bed', AROUND_THE_HOUSE),
      missionWord('home_kitchen', 'مطبخ', 'matbakh', 'Kitchen', AROUND_THE_HOUSE),
    ],
  },
  {
    roundId: 'useful_objects',
    title: USEFUL_OBJECTS,
    words: [
      missionWord('place_bathroom', 'حمام', 'hammaam', 'Bathroom', USEFUL_OBJECTS),
      missionWord('transport_car', 'سيارة', 'sayyaara', 'Car', USEFUL_OBJECTS),
      missionWord('object_cup', 'كوب', 'kuub', 'Cup', USEFUL_OBJECTS),
      missionWord('object_plate', 'طبق', 'tabaq', 'Plate', USEFUL_OBJECTS),
      missionWord('object_spoon', 'ملعقة', 'mil‘aqa', 'Spoon', USEFUL_OBJECTS),
      missionWord('object_bottle', 'زجاجة', 'zujaaja', 'Bottle', USEFUL_OBJECTS),
      missionWord('clothing_shirt', 'قميص', 'qamiis', 'Shirt', USEFUL_OBJECTS),
      missionWord('object_picture', 'صورة', 'suura', 'Picture', USEFUL_OBJECTS),
    ],
  },
];

export const MSA_EVERYDAY_OBJECTS = MSA_EVERYDAY_OBJECTS_ROUNDS.flatMap(round => round.words);

export const MSA_EVERYDAY_OBJECTS_DEFINITION: Unit1MissionDefinition = {
  missionId: 'everyday_objects',
  missionKind: 'lesson',
  title: 'Everyday Objects 🏠',
  subtitle: '24 everyday things',
  route: { screen: 'lesson', params: { type: 'everyday_objects' } },
  homeHref: '/lesson?type=everyday_objects',
};

export const MSA_EVERYDAY_OBJECTS_MISSION: DialectMissionContent = {
  missionId: 'everyday_objects',
  missionKind: 'lesson',
  lessonWords: MSA_EVERYDAY_OBJECTS,
  lessonRounds: MSA_EVERYDAY_OBJECTS_ROUNDS,
  objective: 'Name common objects at home and on the go.',
  completionMessage: 'You can now name 24 everyday things in Arabic.',
  audioMode: 'none',
  reviewable: false,
};

const DRINKS_AND_BASICS = 'Drinks and basics';
const FOOD_AND_DESCRIPTIONS = 'Food and descriptions';
const SHORT_USEFUL_PHRASES = 'Short useful phrases';

export const MSA_FOOD_AND_DRINKS_ROUNDS: MissionLessonRound[] = [
  {
    roundId: 'drinks_and_basics',
    title: DRINKS_AND_BASICS,
    words: [
      missionWord('drink_water', 'ماء', 'maa’', 'Water', DRINKS_AND_BASICS),
      missionWord('drink_coffee', 'قهوة', 'qahwa', 'Coffee', DRINKS_AND_BASICS),
      missionWord('drink_tea', 'شاي', 'shaay', 'Tea', DRINKS_AND_BASICS),
      missionWord('drink_juice', 'عصير', '‘asiir', 'Juice', DRINKS_AND_BASICS),
      missionWord('drink_milk', 'حليب', 'haliib', 'Milk', DRINKS_AND_BASICS),
      missionWord('food_bread', 'خبز', 'khubz', 'Bread', DRINKS_AND_BASICS),
      missionWord('food_rice', 'أرز', 'aruzz', 'Rice', DRINKS_AND_BASICS),
      missionWord('food_sugar', 'سكر', 'sukkar', 'Sugar', DRINKS_AND_BASICS),
    ],
  },
  {
    roundId: 'food_and_descriptions',
    title: FOOD_AND_DESCRIPTIONS,
    words: [
      missionWord('food_salt', 'ملح', 'milh', 'Salt', FOOD_AND_DESCRIPTIONS),
      missionWord('food_meat', 'لحم', 'lahm', 'Meat', FOOD_AND_DESCRIPTIONS),
      missionWord('food_chicken', 'دجاج', 'dajaaj', 'Chicken', FOOD_AND_DESCRIPTIONS),
      missionWord('food_fish', 'سمك', 'samak', 'Fish', FOOD_AND_DESCRIPTIONS),
      missionWord('food_fruit', 'فاكهة', 'faakiha', 'Fruit', FOOD_AND_DESCRIPTIONS),
      missionWord('food_vegetables', 'خضروات', 'khudrawaat', 'Vegetables', FOOD_AND_DESCRIPTIONS),
      missionWord('temperature_hot', 'ساخن', 'saakhin', 'Hot', FOOD_AND_DESCRIPTIONS),
      missionWord('temperature_cold', 'بارد', 'baarid', 'Cold', FOOD_AND_DESCRIPTIONS),
    ],
  },
  {
    roundId: 'short_useful_phrases',
    title: SHORT_USEFUL_PHRASES,
    words: [
      missionWord('request_want_water', 'أريد ماء', 'uriidu maa’', 'I want water', SHORT_USEFUL_PHRASES),
      missionWord('request_want_coffee', 'أريد قهوة', 'uriidu qahwa', 'I want coffee', SHORT_USEFUL_PHRASES),
      missionWord('drink_cold_water', 'ماء بارد', 'maa’ baarid', 'Cold water', SHORT_USEFUL_PHRASES),
      missionWord('drink_hot_coffee', 'قهوة ساخنة', 'qahwa saakhina', 'Hot coffee', SHORT_USEFUL_PHRASES),
      missionWord('request_without_sugar', 'بدون سكر', 'biduun sukkar', 'Without sugar', SHORT_USEFUL_PHRASES),
      missionWord('request_with_milk', 'مع حليب', 'ma‘a haliib', 'With milk', SHORT_USEFUL_PHRASES),
      missionWord('reaction_delicious', 'هذا لذيذ', 'haadhaa ladhiidh', 'This is delicious', SHORT_USEFUL_PHRASES),
      missionWord('request_do_not_want', 'لا أريد', 'laa uriid', 'I don’t want', SHORT_USEFUL_PHRASES),
    ],
  },
];

export const MSA_FOOD_AND_DRINKS = MSA_FOOD_AND_DRINKS_ROUNDS.flatMap(round => round.words);

export const MSA_FOOD_AND_DRINKS_DEFINITION: Unit1MissionDefinition = {
  missionId: 'food_and_drinks',
  missionKind: 'lesson',
  title: 'Food & Drinks ☕',
  subtitle: '24 food and drink essentials',
  route: { screen: 'lesson', params: { type: 'food_and_drinks' } },
  homeHref: '/lesson?type=food_and_drinks',
};

export const MSA_FOOD_AND_DRINKS_MISSION: DialectMissionContent = {
  missionId: 'food_and_drinks',
  missionKind: 'lesson',
  lessonWords: MSA_FOOD_AND_DRINKS,
  lessonRounds: MSA_FOOD_AND_DRINKS_ROUNDS,
  objective: 'Recognize food, drinks, and simple requests.',
  completionMessage: 'You can now ask for simple food and drinks in Arabic.',
  audioMode: 'none',
  reviewable: false,
};

const COLORS = 'Colors';
const SIMPLE_DESCRIPTIONS = 'Simple descriptions';
const SHORT_DESCRIPTIONS = 'Short descriptions';

export const MSA_DESCRIBE_THE_WORLD_ROUNDS: MissionLessonRound[] = [
  {
    roundId: 'colors',
    title: COLORS,
    words: [
      missionWord('color_red', 'أحمر', 'ahmar', 'Red', COLORS),
      missionWord('color_blue', 'أزرق', 'azraq', 'Blue', COLORS),
      missionWord('color_green', 'أخضر', 'akhdar', 'Green', COLORS),
      missionWord('color_yellow', 'أصفر', 'asfar', 'Yellow', COLORS),
      missionWord('color_white', 'أبيض', 'abyad', 'White', COLORS),
      missionWord('color_black', 'أسود', 'aswad', 'Black', COLORS),
      missionWord('color_brown', 'بني', 'bunnii', 'Brown', COLORS),
      missionWord('color_orange', 'برتقالي', 'burtuqaalii', 'Orange', COLORS),
    ],
  },
  {
    roundId: 'simple_descriptions',
    title: SIMPLE_DESCRIPTIONS,
    words: [
      missionWord('description_big', 'كبير', 'kabiir', 'Big', SIMPLE_DESCRIPTIONS),
      missionWord('description_small', 'صغير', 'saghiir', 'Small', SIMPLE_DESCRIPTIONS),
      missionWord('description_new', 'جديد', 'jadiid', 'New', SIMPLE_DESCRIPTIONS),
      missionWord('description_old', 'قديم', 'qadiim', 'Old', SIMPLE_DESCRIPTIONS),
      missionWord('description_beautiful', 'جميل', 'jamiil', 'Beautiful', SIMPLE_DESCRIPTIONS),
      missionWord('description_fast', 'سريع', 'sarii‘', 'Fast', SIMPLE_DESCRIPTIONS),
      missionWord('description_slow', 'بطيء', 'batii’', 'Slow', SIMPLE_DESCRIPTIONS),
      missionWord('description_easy', 'سهل', 'sahl', 'Easy', SIMPLE_DESCRIPTIONS),
    ],
  },
  {
    roundId: 'short_descriptions',
    title: SHORT_DESCRIPTIONS,
    words: [
      missionWord('description_big_house', 'بيت كبير', 'bayt kabiir', 'A big house', SHORT_DESCRIPTIONS),
      missionWord('description_new_car', 'سيارة جديدة', 'sayyaara jadiida', 'A new car', SHORT_DESCRIPTIONS),
      missionWord('description_old_book', 'كتاب قديم', 'kitaab qadiim', 'An old book', SHORT_DESCRIPTIONS),
      missionWord('description_small_door', 'باب صغير', 'baab saghiir', 'A small door', SHORT_DESCRIPTIONS),
      missionWord('description_hot_coffee', 'قهوة ساخنة', 'qahwa saakhina', 'Hot coffee', SHORT_DESCRIPTIONS),
      missionWord('description_cold_water', 'ماء بارد', 'maa’ baarid', 'Cold water', SHORT_DESCRIPTIONS),
      missionWord('description_beautiful_thing', 'شيء جميل', 'shay’ jamiil', 'A beautiful thing', SHORT_DESCRIPTIONS),
      missionWord('description_very_good', 'جيد جداً', 'jayyid jiddan', 'Very good', SHORT_DESCRIPTIONS),
    ],
  },
];

export const MSA_DESCRIBE_THE_WORLD = MSA_DESCRIBE_THE_WORLD_ROUNDS.flatMap(round => round.words);

export const MSA_DESCRIBE_THE_WORLD_DEFINITION: Unit1MissionDefinition = {
  missionId: 'describe_the_world',
  missionKind: 'lesson',
  title: 'Describe the World 🎨',
  subtitle: '24 colors and descriptions',
  route: { screen: 'lesson', params: { type: 'describe_the_world' } },
  homeHref: '/lesson?type=describe_the_world',
};

export const MSA_DESCRIBE_THE_WORLD_MISSION: DialectMissionContent = {
  missionId: 'describe_the_world',
  missionKind: 'lesson',
  lessonWords: MSA_DESCRIBE_THE_WORLD,
  lessonRounds: MSA_DESCRIBE_THE_WORLD_ROUNDS,
  objective: 'Use colors and simple descriptions.',
  completionMessage: 'You can now describe simple things in Arabic.',
  audioMode: 'none',
  reviewable: false,
};

const NUMBERS_ZERO_TO_SEVEN = 'Numbers 0–7';
const MORE_NUMBERS_AND_MONEY = 'More numbers and money';
const BUYING_SOMETHING = 'Buying something';

export const MSA_NUMBERS_AND_MONEY_ROUNDS: MissionLessonRound[] = [
  {
    roundId: 'numbers_zero_to_seven',
    title: NUMBERS_ZERO_TO_SEVEN,
    words: [
      missionWord('number_zero', 'صفر', 'sifr', 'Zero', NUMBERS_ZERO_TO_SEVEN),
      missionWord('number_one', 'واحد', 'waahid', 'One', NUMBERS_ZERO_TO_SEVEN),
      missionWord('number_two', 'اثنان', 'ithnaan', 'Two', NUMBERS_ZERO_TO_SEVEN),
      missionWord('number_three', 'ثلاثة', 'thalaatha', 'Three', NUMBERS_ZERO_TO_SEVEN),
      missionWord('number_four', 'أربعة', 'arba‘a', 'Four', NUMBERS_ZERO_TO_SEVEN),
      missionWord('number_five', 'خمسة', 'khamsa', 'Five', NUMBERS_ZERO_TO_SEVEN),
      missionWord('number_six', 'ستة', 'sitta', 'Six', NUMBERS_ZERO_TO_SEVEN),
      missionWord('number_seven', 'سبعة', 'sab‘a', 'Seven', NUMBERS_ZERO_TO_SEVEN),
    ],
  },
  {
    roundId: 'more_numbers_and_money',
    title: MORE_NUMBERS_AND_MONEY,
    words: [
      missionWord('number_eight', 'ثمانية', 'thamaaniya', 'Eight', MORE_NUMBERS_AND_MONEY),
      missionWord('number_nine', 'تسعة', 'tis‘a', 'Nine', MORE_NUMBERS_AND_MONEY),
      missionWord('number_ten', 'عشرة', '‘ashara', 'Ten', MORE_NUMBERS_AND_MONEY),
      missionWord('money_dirham', 'درهم', 'dirham', 'Dirham', MORE_NUMBERS_AND_MONEY),
      missionWord('money_dirhams', 'دراهم', 'daraahim', 'Dirhams', MORE_NUMBERS_AND_MONEY),
      missionWord('money_general', 'مال', 'maal', 'Money', MORE_NUMBERS_AND_MONEY),
      missionWord('money_price', 'سعر', 'si‘r', 'Price', MORE_NUMBERS_AND_MONEY),
      missionWord('question_how_much', 'كم؟', 'kam?', 'How much?', MORE_NUMBERS_AND_MONEY),
    ],
  },
  {
    roundId: 'buying_something',
    title: BUYING_SOMETHING,
    words: [
      missionWord('purchase_how_much', 'كم السعر؟', 'kam as-si‘r?', 'How much is it?', BUYING_SOMETHING),
      missionWord('purchase_five_dirhams', 'خمسة دراهم', 'khamsa daraahim', 'Five dirhams', BUYING_SOMETHING),
      missionWord('purchase_ten_dirhams', 'عشرة دراهم', '‘ashara daraahim', 'Ten dirhams', BUYING_SOMETHING),
      missionWord('purchase_expensive', 'هذا غالي', 'haadhaa ghaalii', 'This is expensive', BUYING_SOMETHING),
      missionWord('purchase_cheap', 'هذا رخيص', 'haadhaa rakhiis', 'This is cheap', BUYING_SOMETHING),
      missionWord('purchase_have_money', 'عندي مال', '‘indii maal', 'I have money', BUYING_SOMETHING),
      missionWord('purchase_good_price', 'سعر جيد', 'si‘r jayyid', 'Good price', BUYING_SOMETHING),
      missionWord('purchase_yes_one', 'نعم، واحد', 'na‘am, waahid', 'Yes, one', BUYING_SOMETHING),
    ],
  },
];

export const MSA_NUMBERS_AND_MONEY = MSA_NUMBERS_AND_MONEY_ROUNDS.flatMap(round => round.words);

export const MSA_NUMBERS_AND_MONEY_DEFINITION: Unit1MissionDefinition = {
  missionId: 'numbers_and_money',
  missionKind: 'lesson',
  title: 'Numbers & Money 🔢',
  subtitle: '24 numbers and price basics',
  route: { screen: 'lesson', params: { type: 'numbers_and_money' } },
  homeHref: '/lesson?type=numbers_and_money',
};

export const MSA_NUMBERS_AND_MONEY_MISSION: DialectMissionContent = {
  missionId: 'numbers_and_money',
  missionKind: 'lesson',
  lessonWords: MSA_NUMBERS_AND_MONEY,
  lessonRounds: MSA_NUMBERS_AND_MONEY_ROUNDS,
  objective: 'Count and understand simple prices.',
  completionMessage: 'You can now count and understand simple prices in Arabic.',
  audioMode: 'none',
  reviewable: false,
};

const DIRECTION_WORDS = 'Direction words';
const POSITION_WORDS = 'Position words';
const ASK_AND_FOLLOW_DIRECTIONS = 'Ask and follow directions';

export const MSA_WHERE_HERE_THERE_ROUNDS: MissionLessonRound[] = [
  {
    roundId: 'direction_words',
    title: DIRECTION_WORDS,
    words: [
      missionWord('direction_where', 'أين', 'ayna', 'Where', DIRECTION_WORDS),
      missionWord('direction_here', 'هنا', 'hunaa', 'Here', DIRECTION_WORDS),
      missionWord('direction_there', 'هناك', 'hunaaka', 'There', DIRECTION_WORDS),
      missionWord('direction_right', 'يمين', 'yamiin', 'Right', DIRECTION_WORDS),
      missionWord('direction_left', 'يسار', 'yasaar', 'Left', DIRECTION_WORDS),
      missionWord('direction_in_front', 'أمام', 'amaam', 'In front', DIRECTION_WORDS),
      missionWord('direction_behind', 'خلف', 'khalf', 'Behind', DIRECTION_WORDS),
      missionWord('direction_straight', 'مستقيم', 'mustaqiim', 'Straight', DIRECTION_WORDS),
    ],
  },
  {
    roundId: 'position_words',
    title: POSITION_WORDS,
    words: [
      missionWord('position_above', 'فوق', 'fawq', 'Above', POSITION_WORDS),
      missionWord('position_below', 'تحت', 'taht', 'Below', POSITION_WORDS),
      missionWord('position_inside', 'داخل', 'daakhil', 'Inside', POSITION_WORDS),
      missionWord('position_outside', 'خارج', 'khaarij', 'Outside', POSITION_WORDS),
      missionWord('position_near', 'قريب', 'qariib', 'Near', POSITION_WORDS),
      missionWord('position_far', 'بعيد', 'ba‘iid', 'Far', POSITION_WORDS),
      missionWord('position_next_to', 'بجانب', 'bijaanib', 'Next to', POSITION_WORDS),
      missionWord('position_between', 'بين', 'bayna', 'Between', POSITION_WORDS),
    ],
  },
  {
    roundId: 'ask_and_follow_directions',
    title: ASK_AND_FOLLOW_DIRECTIONS,
    words: [
      missionWord('directions_where_hotel', 'أين الفندق؟', 'ayna al-funduq?', 'Where is the hotel?', ASK_AND_FOLLOW_DIRECTIONS),
      missionWord('directions_where_restaurant', 'أين المطعم؟', 'ayna al-mat‘am?', 'Where is the restaurant?', ASK_AND_FOLLOW_DIRECTIONS),
      missionWord('directions_to_the_right', 'إلى اليمين', 'ilaa al-yamiin', 'To the right', ASK_AND_FOLLOW_DIRECTIONS),
      missionWord('directions_to_the_left', 'إلى اليسار', 'ilaa al-yasaar', 'To the left', ASK_AND_FOLLOW_DIRECTIONS),
      missionWord('directions_forward', 'إلى الأمام', 'ilaa al-amaam', 'Forward', ASK_AND_FOLLOW_DIRECTIONS),
      missionWord('directions_near_here', 'قريب من هنا', 'qariib min hunaa', 'Near here', ASK_AND_FOLLOW_DIRECTIONS),
      missionWord('directions_far_there', 'بعيد من هنا', 'baʿiid min hunaa', 'Far from here', ASK_AND_FOLLOW_DIRECTIONS),
      missionWord('directions_go_straight', 'اذهب مستقيماً', 'idhhab mustaqiiman', 'Go straight', ASK_AND_FOLLOW_DIRECTIONS),
    ],
  },
];

export const MSA_WHERE_HERE_THERE = MSA_WHERE_HERE_THERE_ROUNDS.flatMap(round => round.words);

export const MSA_WHERE_HERE_THERE_DEFINITION: Unit1MissionDefinition = {
  missionId: 'where_here_there',
  missionKind: 'lesson',
  title: 'Where? Here! There! 📍',
  subtitle: '24 place and direction essentials',
  route: { screen: 'lesson', params: { type: 'where_here_there' } },
  homeHref: '/lesson?type=where_here_there',
};

export const MSA_WHERE_HERE_THERE_MISSION: DialectMissionContent = {
  missionId: 'where_here_there',
  missionKind: 'lesson',
  lessonWords: MSA_WHERE_HERE_THERE,
  lessonRounds: MSA_WHERE_HERE_THERE_ROUNDS,
  objective: 'Ask where things are and follow directions.',
  completionMessage: 'You can now ask where something is and follow simple directions.',
  audioMode: 'none',
  reviewable: false,
};

const INTRODUCE_YOURSELF = 'Introduce yourself';
const MEET_PEOPLE = 'Meet people';
const COMMUNICATION_HELP = 'Communication help';

export const MSA_INTRODUCE_YOURSELF_ROUNDS: MissionLessonRound[] = [
  { roundId: 'introduce_yourself', title: INTRODUCE_YOURSELF, words: [
    missionWord('self_i', 'أنا', 'anaa', 'I / me', INTRODUCE_YOURSELF),
    missionWord('self_my_name_is', 'اسمي', 'ismii', 'My name is', INTRODUCE_YOURSELF),
    missionWord('self_my_name_is_yusuf', 'اسمي يوسف', 'ismii Yuusuf', 'My name is Yusuf', INTRODUCE_YOURSELF),
    missionWord('self_what_is_your_name', 'ما اسمك؟', 'maa ismuk?', 'What is your name?', INTRODUCE_YOURSELF),
    missionWord('self_where_are_you_from', 'من أين أنت؟', 'min ayna anta?', 'Where are you from?', INTRODUCE_YOURSELF),
    missionWord('self_i_am_from', 'أنا من...', 'anaa min...', 'I am from...', INTRODUCE_YOURSELF),
    missionWord('self_live_in_dubai', 'أعيش في دبي', 'aʿiishu fii Dubai', 'I live in Dubai', INTRODUCE_YOURSELF),
    missionWord('self_welcome', 'أهلاً بك', 'ahlan bik', 'Welcome', INTRODUCE_YOURSELF),
  ] },
  { roundId: 'meet_people', title: MEET_PEOPLE, words: [
    missionWord('self_work_here', 'أعمل هنا', 'aʿmalu hunaa', 'I work here', MEET_PEOPLE),
    missionWord('self_new_here', 'أنا جديد هنا', 'anaa jadiid hunaa', 'I am new here', MEET_PEOPLE),
    missionWord('self_male_friend', 'هذا صديقي', 'haadhaa sadiiqii', 'This is my friend', MEET_PEOPLE),
    missionWord('self_female_friend', 'هذه صديقتي', 'haadhihi sadiiqatii', 'This is my female friend', MEET_PEOPLE),
    missionWord('self_together', 'نحن معاً', 'nahnu maʿan', 'We are together', MEET_PEOPLE),
    missionWord('self_nice_to_meet_you', 'تشرفت بلقائك', 'tasharraftu biliqaaʾik', 'Nice to meet you', MEET_PEOPLE),
    missionWord('self_where_live', 'أين تعيش؟', 'ayna taʿiish?', 'Where do you live?', MEET_PEOPLE),
    missionWord('self_live_here', 'أعيش هنا', 'aʿiishu hunaa', 'I live here', MEET_PEOPLE),
  ] },
  { roundId: 'communication_help', title: COMMUNICATION_HELP, words: [
    missionWord('self_speak_english', 'أتكلم الإنجليزية', 'atakallamu al-ingliiziyya', 'I speak English', COMMUNICATION_HELP),
    missionWord('self_speak_arabic', 'أتكلم العربية', 'atakallamu al-ʿarabiyya', 'I speak Arabic', COMMUNICATION_HELP),
    missionWord('self_only_a_little', 'قليلاً فقط', 'qaliilan faqaṭ', 'Only a little', COMMUNICATION_HELP),
    missionWord('self_do_not_understand', 'لا أفهم', 'laa afham', 'I do not understand', COMMUNICATION_HELP),
    missionWord('self_do_you_understand', 'هل تفهم؟', 'hal tafham?', 'Do you understand?', COMMUNICATION_HELP),
    missionWord('self_repeat_please', 'أعد، من فضلك', 'aʿid, min faḍlik', 'Repeat, please', COMMUNICATION_HELP),
    missionWord('self_slowly_please', 'ببطء، من فضلك', 'bibuṭʾ, min faḍlik', 'Slowly, please', COMMUNICATION_HELP),
    missionWord('self_me_too', 'وأنا أيضاً', 'wa anaa ayḍan', 'Me too', COMMUNICATION_HELP),
  ] },
];
export const MSA_INTRODUCE_YOURSELF = MSA_INTRODUCE_YOURSELF_ROUNDS.flatMap(round => round.words);
export const MSA_INTRODUCE_YOURSELF_DEFINITION: Unit1MissionDefinition = { missionId: 'introduce_yourself', missionKind: 'lesson', title: 'Introduce Yourself', subtitle: '3 rounds', route: { screen: 'lesson', params: { type: 'introduce_yourself' } }, homeHref: '/lesson?type=introduce_yourself' };
export const MSA_INTRODUCE_YOURSELF_MISSION: DialectMissionContent = { missionId: 'introduce_yourself', missionKind: 'lesson', lessonWords: MSA_INTRODUCE_YOURSELF, lessonRounds: MSA_INTRODUCE_YOURSELF_ROUNDS, completionMessage: 'You can introduce yourself in Arabic.', audioMode: 'none', reviewable: false };

const CHECK_IN = 'Check in';
const FEELINGS = 'Feelings';
const DESCRIBE_FEELINGS = 'Describe feelings';
export const MSA_HOW_ARE_YOU_ROUNDS: MissionLessonRound[] = [
  { roundId: 'check_in', title: CHECK_IN, words: [
    missionWord('feeling_how_are_you', 'كيف الحال؟', 'kayfa al-haal?', 'How are you?', CHECK_IN), missionWord('feeling_i_am_fine', 'أنا بخير', 'anaa bikhayr', 'I am fine', CHECK_IN), missionWord('feeling_fine_thanks', 'بخير، شكراً', 'bikhayr, shukran', 'Fine, thank you', CHECK_IN), missionWord('feeling_thank_god', 'الحمد لله', 'alhamdu lillaah', 'Thank God', CHECK_IN), missionWord('feeling_excellent', 'ممتاز', 'mumtaaz', 'Excellent', CHECK_IN), missionWord('feeling_good', 'جيد', 'jayyid', 'Good', CHECK_IN), missionWord('feeling_not_bad', 'لا بأس', 'laa baʾs', 'Not bad', CHECK_IN), missionWord('feeling_and_you', 'وأنت؟', 'wa anta?', 'And you?', CHECK_IN),
  ] },
  { roundId: 'feelings', title: FEELINGS, words: [
    missionWord('feeling_happy', 'سعيد', 'saʿiid', 'Happy', FEELINGS), missionWord('feeling_sad', 'حزين', 'haziin', 'Sad', FEELINGS), missionWord('feeling_tired', 'متعب', 'mutʿab', 'Tired', FEELINGS), missionWord('feeling_sick', 'مريض', 'mariiḍ', 'Sick', FEELINGS), missionWord('feeling_hungry', 'جائع', 'jaaʾiʿ', 'Hungry', FEELINGS), missionWord('feeling_thirsty', 'عطشان', 'ʿaṭshaan', 'Thirsty', FEELINGS), missionWord('feeling_busy', 'مشغول', 'mashghuul', 'Busy', FEELINGS), missionWord('feeling_ready', 'جاهز', 'jaahiz', 'Ready', FEELINGS),
  ] },
  { roundId: 'describe_feelings', title: DESCRIBE_FEELINGS, words: [
    missionWord('feeling_i_am_tired', 'أنا متعب', 'anaa mutʿab', 'I am tired', DESCRIBE_FEELINGS), missionWord('feeling_i_am_hungry', 'أنا جائع', 'anaa jaaʾiʿ', 'I am hungry', DESCRIBE_FEELINGS), missionWord('feeling_are_you_okay', 'هل أنت بخير؟', 'hal anta bikhayr?', 'Are you okay?', DESCRIBE_FEELINGS), missionWord('feeling_not_okay', 'لست بخير', 'lastu bikhayr', 'I am not okay', DESCRIBE_FEELINGS), missionWord('feeling_what_problem', 'ما المشكلة؟', 'maa al-mushkila?', 'What is the problem?', DESCRIBE_FEELINGS), missionWord('feeling_no_problem', 'لا مشكلة', 'laa mushkila', 'No problem', DESCRIBE_FEELINGS), missionWord('feeling_better_now', 'الآن أفضل', 'al-aan afḍal', 'Better now', DESCRIBE_FEELINGS), missionWord('feeling_nice_day', 'يوم سعيد', 'yawm saʿiid', 'Have a nice day', DESCRIBE_FEELINGS),
  ] },
];
export const MSA_HOW_ARE_YOU = MSA_HOW_ARE_YOU_ROUNDS.flatMap(round => round.words);
export const MSA_HOW_ARE_YOU_DEFINITION: Unit1MissionDefinition = { missionId: 'how_are_you', missionKind: 'lesson', title: 'How Are You?', subtitle: '3 rounds', route: { screen: 'lesson', params: { type: 'how_are_you' } }, homeHref: '/lesson?type=how_are_you' };
export const MSA_HOW_ARE_YOU_MISSION: DialectMissionContent = { missionId: 'how_are_you', missionKind: 'lesson', lessonWords: MSA_HOW_ARE_YOU, lessonRounds: MSA_HOW_ARE_YOU_ROUNDS, completionMessage: 'You can describe how you feel.', audioMode: 'none', reviewable: false };

export const MSA_FIRST_CAFE_DIALOGUE: DialogueTurn[] = [
  ['waiter','مرحباً، تفضل','marhaban, tafaḍḍal','Hello, please'], ['user','مرحباً','marhaban','Hello'], ['waiter','ماذا تريد؟','maadhaa turiid?','What would you like?'], ['user','أريد قهوة، من فضلك','uriidu qahwa, min faḍlik','I want coffee, please'], ['waiter','صغيرة أم كبيرة؟','saghiira am kabiira?','Small or large?'], ['user','صغيرة، من فضلك','saghiira, min faḍlik','Small, please'], ['waiter','هل تريد ماء؟','hal turiidu maaʾ?','Would you like water?'], ['user','نعم، ماء أيضاً','naʿam, maaʾ ayḍan','Yes, water too'], ['waiter','شيء آخر؟','shayʾ aakhar?','Anything else?'], ['user','لا، شكراً','laa, shukran','No, thank you'], ['waiter','المجموع عشرة دراهم','al-majmuuʿ ʿashara daraahim','The total is ten dirhams'], ['user','تفضل','tafaḍḍal','Here you go'], ['waiter','شكراً، إلى اللقاء','shukran, ilaa al-liqaaʾ','Thank you, goodbye'], ['user','إلى اللقاء','ilaa al-liqaaʾ','Goodbye'],
].map(([type, arabic, transliteration, english], index) => ({ type: type as 'waiter' | 'user', arabic, displayArabic: arabic, transliteration, english, speakerRole: index % 2 === 0 ? 'Server' : 'Learner' }));
export const MSA_FIRST_CAFE_CONVERSATION_DEFINITION: Unit1MissionDefinition = { missionId: 'first_cafe_conversation', missionKind: 'guided_dialogue', title: 'Your First Café Conversation', subtitle: '14 turns', route: { screen: 'scenario', params: { type: 'first_cafe_conversation' } }, homeHref: '/scenario?type=first_cafe_conversation', sceneImageKey: 'Cafe' };
export const MSA_FIRST_CAFE_CONVERSATION_MISSION: DialectMissionContent = { missionId: 'first_cafe_conversation', missionKind: 'guided_dialogue', dialogue: MSA_FIRST_CAFE_DIALOGUE, completionMessage: 'You completed your first Arabic conversation.', audioMode: 'none', reviewable: false };

export const MSA_BIG_REVIEW_DEFINITION: Unit1MissionDefinition = { missionId: 'big_review', missionKind: 'review', title: 'Big Review', subtitle: '24 questions', route: { screen: 'quiz-unit2', params: { unit: 'u1-review' } }, homeHref: '/quiz-unit2?unit=u1-review' };
export const MSA_BIG_REVIEW_MISSION: DialectMissionContent = { missionId: 'big_review', missionKind: 'review', quizQuestions: MSA_BIG_REVIEW_QUESTIONS, completionMessage: 'You remembered the essentials.', audioMode: 'none', reviewable: false };
export const MSA_FIRST_ARABIC_CHALLENGE_DEFINITION: Unit1MissionDefinition = { missionId: 'first_arabic_challenge', missionKind: 'challenge', title: 'Your First Arabic Challenge', subtitle: 'Pass 16 of 20', route: { screen: 'quiz-unit2', params: { unit: 'u1-challenge' } }, homeHref: '/quiz-unit2?unit=u1-challenge' };
export const MSA_FIRST_ARABIC_CHALLENGE_MISSION: DialectMissionContent = { missionId: 'first_arabic_challenge', missionKind: 'challenge', quizQuestions: MSA_FIRST_ARABIC_CHALLENGE_QUESTIONS, passingScore: 16, completionMessage: 'Unit 1 complete. You are ready for your first Arabic conversations.', audioMode: 'none', reviewable: false };
