export interface DialogueTurn {
  type: 'waiter' | 'user';
  arabic: string;
  displayArabic?: string;
  audioText?: string;
  evalTarget?: string;
  transliteration: string;
  english: string;
  context?: string;
  audio?: any;
}

export const CAFE_DIALOGUE: DialogueTurn[] = [
  // Part 1 — Greetings (index 0-7)
  { type: 'waiter', arabic: 'اَلسَّلَامُ عَلَيْكُم',          displayArabic: 'السلام عليكم',       audioText: 'السلام عليكم',       transliteration: "as-salaamu 'alaykum",        english: 'Peace be upon you',       context: 'Waiter approaches smiling', audio: require('../assets/audio/cafe/w1.mp3') },
  { type: 'user',   arabic: 'وَعَلَيْكُم اَلسَّلَام',         displayArabic: 'وعليكم السلام',      audioText: 'وعليكم السلام',      transliteration: "wa 'alaykum as-salaam",      english: 'And upon you peace',                                                audio: require('../assets/audio/cafe/u1.mp3') },
  { type: 'waiter', arabic: 'كَيْفَ حَالَك؟',                 displayArabic: 'شلونك؟',             audioText: 'شلونك؟',             transliteration: 'kayf haalak?',               english: 'How are you?',                                                      audio: require('../assets/audio/cafe/w2.mp3') },
  { type: 'user',   arabic: 'بِخَيْر، اَللَّهُ يُسَلِّمَكَ', displayArabic: 'بخير، الله يسلمك',    audioText: 'بخير، الله يسلّمك',   transliteration: 'bikhair, allah yisallimak',  english: 'Fine, God keep you safe',                                           audio: require('../assets/audio/cafe/u2.mp3') },
  { type: 'waiter', arabic: 'أَهْلاً وَسَهْلاً',              displayArabic: 'أهلاً وسهلاً',       audioText: 'أهلاً وسهلاً',       transliteration: 'ahlan wa sahlan',            english: 'Welcome',                                                           audio: require('../assets/audio/cafe/w3.mp3') },
  { type: 'user',   arabic: 'أَهْلاً بِيكَ',                  displayArabic: 'الله يحييك',         audioText: 'الله يحييك',         transliteration: 'ahlan biik',                 english: "You're welcome",                                                   audio: require('../assets/audio/cafe/u3.mp3') },
  { type: 'waiter', arabic: 'تَفَضَّلْ اِجْلِسْ',             displayArabic: 'تفضل اقعد',          audioText: 'تفضل اقعد',          transliteration: 'tafaddal ijlis',             english: 'Please have a seat',                                                audio: require('../assets/audio/cafe/w4.mp3') },
  { type: 'user',   arabic: 'مَشْكُور',                        displayArabic: 'مشكور',              audioText: 'مشكور',              transliteration: 'mashkoor',                   english: 'Thank you',                                                         audio: require('../assets/audio/cafe/u4.mp3') },
  // Part 2 — Ordering (index 8-17)
  { type: 'waiter', arabic: 'وِشْ تَبِي؟',                    displayArabic: 'وش تحب تطلب؟',     audioText: 'وش تحب تطلب؟',     transliteration: 'wish tabi?',                 english: 'What do you want?',       context: 'Gulf dialect: wish tabi',   audio: require('../assets/audio/cafe/w5.mp3') },
  { type: 'user',   arabic: 'أَبِي قَهْوَة',                  displayArabic: 'أبي قهوة',          audioText: 'أبي قهوة',          transliteration: 'abi qahwa',                  english: 'I want a coffee',         context: 'Gulf: abi not areed',       audio: require('../assets/audio/cafe/u5.mp3') },
  { type: 'waiter', arabic: 'عَرَبِي وِلَّا أَمْرِيكِي؟',    displayArabic: 'عربي ولا أمريكي؟',  audioText: 'عربي ولا أمريكي؟',  transliteration: "'arabi willa amriiki?",       english: 'Arabic or Americano?',                                              audio: require('../assets/audio/cafe/w6.mp3') },
  { type: 'user',   arabic: 'عَرَبِي مِن فَضْلَك',            displayArabic: 'عربي لو سمحت',      audioText: 'عربي لو سمحت',      transliteration: "'arabi min fadlak",           english: 'Arabic please',                                                     audio: require('../assets/audio/cafe/u6.mp3') },
  { type: 'waiter', arabic: 'بِسُكَّر؟',                      displayArabic: 'بسكر؟',             audioText: 'بسكر؟',             transliteration: 'bi-sukkar?',                 english: 'With sugar?',                                                       audio: require('../assets/audio/cafe/w7.mp3') },
  { type: 'user',   arabic: 'لَا، بِدُونْ سُكَّر',            displayArabic: 'لا، بدون سكر',      audioText: 'لا، بدون سكر',      transliteration: 'la, bidoon sukkar',          english: 'No, without sugar',                                                 audio: require('../assets/audio/cafe/u7.mp3') },
  { type: 'waiter', arabic: 'فِي شَيْ ثَانِي؟',               displayArabic: 'في شي ثاني؟',       audioText: 'في شي ثاني؟',       transliteration: 'fi shay thaani?',            english: 'Anything else?',                                                    audio: require('../assets/audio/cafe/w8.mp3') },
  { type: 'user',   arabic: 'لَا، يِكْفِي',                   displayArabic: 'لا، يكفي',          audioText: 'لا، يكفي',          transliteration: 'la, yikfi',                  english: 'No, that is enough',                                                audio: require('../assets/audio/cafe/u8.mp3') },
  { type: 'waiter', arabic: 'حَاضِر، لَحْظَة',                displayArabic: 'حاضر، لحظة',        audioText: 'حاضر، لحظة',        transliteration: 'haadir, lahza',              english: 'Sure, one moment',                                                  audio: require('../assets/audio/cafe/w9.mp3') },
  { type: 'user',   arabic: 'تِسْلَم',                         displayArabic: 'مشكور',              audioText: 'مشكور',              transliteration: 'mashkoor',                   english: 'Thank you',                                                         audio: require('../assets/audio/cafe/u9.mp3') },
  // Part 3 — Paying (index 18-23)
  { type: 'waiter', arabic: 'تَبِي اَلْحِسَاب؟',              displayArabic: 'تبي الحساب؟',       audioText: 'تبي الحساب؟',       transliteration: 'tabi al-hisaab?',            english: 'Do you want the bill?',                                             audio: require('../assets/audio/cafe/w10.mp3') },
  { type: 'user',   arabic: 'إِيه، بِكَم؟',                   displayArabic: 'إي نعم، بكم؟',      audioText: 'إي نعم، بكم؟',      transliteration: "ee na'am, bikam?",           english: 'Yes, how much?',                                                    audio: require('../assets/audio/cafe/u10.mp3') },
  { type: 'waiter', arabic: 'عَشَرَة دَرَاهِم',               displayArabic: 'عشرة دراهم',        audioText: 'عشرة دراهم',        transliteration: "'ashara darahim",             english: 'Ten dirhams',                                                       audio: require('../assets/audio/cafe/w11.mp3') },
  { type: 'user',   arabic: 'تَفَضَّل، شُكْراً',              displayArabic: 'تفضل، شكراً',       audioText: 'تفضل، شكراً',       transliteration: 'tafaddal, shukran',          english: 'Here you go, thanks',                                               audio: require('../assets/audio/cafe/u11.mp3') },
  { type: 'waiter', arabic: 'مَعَ السَّلَامَة',                displayArabic: 'مع السلامة',        audioText: 'مع السلامة',        transliteration: "ma'a as-salaama",            english: 'Goodbye',                                                           audio: require('../assets/audio/cafe/w12.mp3') },
  { type: 'user',   arabic: 'اَللَّهُ يُسَلِّمَكَ',           displayArabic: 'الله يسلمك',        audioText: 'الله يسلمك',        transliteration: 'allah yisallimak',           english: 'May God keep you safe',                                             audio: require('../assets/audio/cafe/u12.mp3') },
];

export const TAXI_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'اَلسَّلَامُ عَلَيْكُم',               transliteration: "as-salaamu 'alaykum",          english: 'Peace be upon you',             context: 'Driver greets you', audio: require('../assets/audio/taxi/w1.mp3') },
  { type: 'user',   arabic: 'وَعَلَيْكُم اَلسَّلَام',              transliteration: "wa 'alaykum as-salaam",         english: 'And upon you peace',                                          audio: require('../assets/audio/taxi/u1.mp3') },
  { type: 'waiter', arabic: 'وَيْن تَرُوح؟',                        transliteration: 'wain tarooh?',                  english: 'Where are you going?',                                        audio: require('../assets/audio/taxi/w2.mp3') },
  { type: 'user',   arabic: 'بُرْج خَلِيفَة مِن فَضْلَك',          transliteration: 'burj khaliifa min fadlak',      english: 'Burj Khalifa please',                                         audio: require('../assets/audio/taxi/u2.mp3') },
  { type: 'waiter', arabic: 'حَاضِر، تَفَضَّل',                    transliteration: 'haadir, tafaddal',              english: 'Sure, go ahead',                                              audio: require('../assets/audio/taxi/w3.mp3') },
  { type: 'user',   arabic: 'شُكْراً',                               transliteration: 'shukran',                       english: 'Thank you',                                                   audio: require('../assets/audio/taxi/u3.mp3') },
  { type: 'waiter', arabic: 'مِن وَيْن أَنْتَ؟',                   transliteration: 'min wain anta?',                english: 'Where are you from?',                                         audio: require('../assets/audio/taxi/w4.mp3') },
  { type: 'user',   arabic: 'أَنَا مِن اَلْمَغْرِب',               transliteration: 'ana min al-maghrib',            english: 'I am from Morocco',                                           audio: require('../assets/audio/taxi/u4.mp3') },
  { type: 'waiter', arabic: 'مَرْحَبَا! تُحِبُّ دُبَي؟',           transliteration: 'marhaba! tuhibb dubai?',        english: 'Welcome! Do you like Dubai?',                                  audio: require('../assets/audio/taxi/w5.mp3') },
  { type: 'user',   arabic: 'إِيه، دُبَي حِلْوَة',                 transliteration: 'ih, dubai hilwa',               english: 'Yes, Dubai is beautiful',                                     audio: require('../assets/audio/taxi/u5.mp3') },
  { type: 'waiter', arabic: 'اَلْحِينَ وَصَلْنَا',                  transliteration: 'al-hin wasalna',                english: 'We have arrived now',                                         audio: require('../assets/audio/taxi/w6.mp3') },
  { type: 'user',   arabic: 'كَم اَلْحِسَاب؟',                     transliteration: 'kam al-hisaab?',                english: 'How much is it?',                                             audio: require('../assets/audio/taxi/u6.mp3') },
  { type: 'waiter', arabic: 'خَمْسَة وَعِشْرِين دِرْهَم',          transliteration: "khamsa wa 'ishrin dirham",      english: 'Twenty five dirhams',                                         audio: require('../assets/audio/taxi/w7.mp3') },
  { type: 'user',   arabic: 'تَفَضَّل، هَذَا لَكَ',                transliteration: 'tafaddal, haadha lak',          english: 'Here you go, this is for you',                                audio: require('../assets/audio/taxi/u7.mp3') },
  { type: 'waiter', arabic: 'شُكْراً، فِي أَمَان اَللَّه',         transliteration: 'shukran, fi amaan allah',       english: 'Thank you, go in safety',                                     audio: require('../assets/audio/taxi/w8.mp3') },
  { type: 'user',   arabic: 'اَللَّهُ يُسَلِّمَكَ',                transliteration: 'allah yisallimak',              english: 'May God keep you safe',                                       audio: require('../assets/audio/taxi/u8.mp3') },
];

export const HOTEL_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'اَلسَّلَامُ عَلَيْكُم، أَهْلاً وَسَهْلاً', transliteration: "as-salaamu 'alaykum, ahlan wa sahlan",   english: 'Peace be upon you, welcome',      context: 'Receptionist greets you', audio: require('../assets/audio/hotel/w1.mp3') },
  { type: 'user',   arabic: 'وَعَلَيْكُم اَلسَّلَام، شُكْراً',          transliteration: "wa 'alaykum as-salaam, shukran",         english: 'And upon you peace, thank you',                              audio: require('../assets/audio/hotel/u1.mp3') },
  { type: 'waiter', arabic: 'عِنْدَكَ حَجْز؟',                           transliteration: "'indak hajz?",                           english: 'Do you have a reservation?',                                 audio: require('../assets/audio/hotel/w2.mp3') },
  { type: 'user',   arabic: 'إِيه، عِنْدِي حَجْز',                      transliteration: "ih, 'indi hajz",                         english: 'Yes, I have a reservation',                                  audio: require('../assets/audio/hotel/u2.mp3') },
  { type: 'waiter', arabic: 'وِشْ اِسْمَكَ؟',                           transliteration: 'wish ismak?',                            english: 'What is your name?',                                         audio: require('../assets/audio/hotel/w3.mp3') },
  { type: 'user',   arabic: 'اِسْمِي يُوسُف',                            transliteration: 'ismi yuusuf',                            english: 'My name is Yusuf',                                           audio: require('../assets/audio/hotel/u3.mp3') },
  { type: 'waiter', arabic: 'تَفَضَّل، هَذَا مِفْتَاح غُرْفَتَكَ',      transliteration: 'tafaddal, haadha miftaah ghurfatak',      english: 'Here you go, this is your room key', context: 'Hands over key card', audio: require('../assets/audio/hotel/w4.mp3') },
  { type: 'user',   arabic: 'شُكْراً، اَلْغُرْفَة فِي أَيّ طَابِق؟',   transliteration: 'shukran, al-ghurfa fi ayy taabiq?',       english: 'Thanks, which floor is the room?',                           audio: require('../assets/audio/hotel/u4.mp3') },
  { type: 'waiter', arabic: 'فِي اَلطَّابِق اَلْعَاشِر',                transliteration: "fi al-taabiq al-'aashir",                 english: 'On the tenth floor',                                         audio: require('../assets/audio/hotel/w5.mp3') },
  { type: 'user',   arabic: "زَيْن، وَالمِصْعَد وَيْن؟",               transliteration: "zain, wal-mis'ad wain?",                  english: 'Good, and where is the elevator?',                           audio: require('../assets/audio/hotel/u5.mp3') },
  { type: 'waiter', arabic: 'اَلْمِصْعَد عَلَى اَلْيَمِين',             transliteration: "al-mis'ad 'ala al-yamiin",                english: 'The elevator is on the right',                               audio: require('../assets/audio/hotel/w6.mp3') },
  { type: 'user',   arabic: 'وَاَلإِفْطَار مِن وَقْتٍ لِوَقْت؟',       transliteration: 'wal-iftaar min waqt li-waqt?',            english: 'And what are the breakfast hours?',                          audio: require('../assets/audio/hotel/u6.mp3') },
  { type: 'waiter', arabic: "اَلإِفْطَار مِن سَبْعَة إِلَى عَشَرَة",    transliteration: "al-iftaar min sab'a ila 'ashara",          english: 'Breakfast is from 7 to 10',                                  audio: require('../assets/audio/hotel/w7.mp3') },
  { type: 'user',   arabic: 'مُمْتَاز، شُكْراً جَزِيلاً',               transliteration: 'mumtaaz, shukran jaziilan',               english: 'Excellent, thank you very much',                             audio: require('../assets/audio/hotel/u7.mp3') },
  { type: 'waiter', arabic: 'اَلْعَفْو، أَيّ خِدْمَة',                  transliteration: "al-'afw, ayy khidma",                     english: "You're welcome, any service",                                audio: require('../assets/audio/hotel/w8.mp3') },
  { type: 'user',   arabic: 'مَعَ السَّلَامَة',                          transliteration: "ma'a as-salaama",                         english: 'Goodbye',                                                    audio: require('../assets/audio/hotel/u8.mp3') },
];

export const RESTAURANT_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'اَلسَّلَامُ عَلَيْكُم، أَهْلاً بِكُم',     transliteration: "as-salaamu 'alaykum, ahlan bikum",       english: 'Peace be upon you, welcome',          context: 'Waiter greets you at the door' },
  { type: 'user',   arabic: 'وَعَلَيْكُم اَلسَّلَام، شُكْراً',          transliteration: "wa 'alaykum as-salaam, shukran",         english: 'And upon you peace, thank you' },
  { type: 'waiter', arabic: 'كَم شَخْص؟',                               transliteration: 'kam shakhs?',                            english: 'How many people?' },
  { type: 'user',   arabic: 'شَخْصَيْن مِن فَضْلَك',                    transliteration: 'shakhsain min fadlak',                   english: 'Two people please' },
  { type: 'waiter', arabic: 'تَفَضَّلُوا، هَذِي الْقَائِمَة',           transliteration: "tafaddaluu, haadhii al-qaa'ima",         english: 'Here you go, this is the menu' },
  { type: 'user',   arabic: 'شُكْراً، وِشْ فِي الْيَوْم؟',             transliteration: 'shukran, wish fi al-yoom?',              english: "Thank you, what is today's special?", context: 'Gulf: wish = what' },
  { type: 'waiter', arabic: 'عِنْدَنَا كَبْسَة دَجَاج وَسَلَاطَة',      transliteration: "'indana kabsa dajaj wa salaata",          english: 'We have chicken kabsa and salad' },
  { type: 'user',   arabic: 'أَبِي كَبْسَة دَجَاج مِن فَضْلَك',         transliteration: 'abi kabsa dajaj min fadlak',             english: 'I want chicken kabsa please',          context: 'Gulf: abi = I want' },
  { type: 'waiter', arabic: 'بِسَلَاطَة؟',                              transliteration: 'bi-salaata?',                            english: 'With salad?' },
  { type: 'user',   arabic: 'إِيه، بِسَلَاطَة وَعَصِير',               transliteration: "ih, bi-salaata wa 'asiir",               english: 'Yes, with salad and juice' },
  { type: 'waiter', arabic: 'حَاضِر، لَحْظَة',                          transliteration: 'haadir, lahza',                          english: 'Sure, one moment' },
  { type: 'user',   arabic: 'تِسْلَم',                                   transliteration: 'tislam',                                 english: 'Bless you' },
  { type: 'waiter', arabic: 'تَبِي اَلْحِسَاب؟',                        transliteration: 'tabi al-hisaab?',                        english: 'Do you want the bill?' },
  { type: 'user',   arabic: 'إِيه، بِكَم؟',                             transliteration: 'ih, bikam?',                             english: 'Yes, how much?' },
  { type: 'waiter', arabic: 'خَمْسَة وَثَلَاثِين دِرْهَم',              transliteration: 'khamsa wa thalaathiin dirham',            english: 'Thirty-five dirhams' },
  { type: 'user',   arabic: 'تَفَضَّل، شُكْراً جَزِيلاً',              transliteration: 'tafaddal, shukran jaziilan',             english: 'Here you go, thank you very much' },
];

export const SUPERMARKET_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'اَلسَّلَامُ عَلَيْكُم، كَيْفَ أُسَاعِدُكَ؟', transliteration: "as-salaamu 'alaykum, kayf usaa'idak?",   english: 'Peace be upon you, how can I help you?', context: 'Staff member approaches' },
  { type: 'user',   arabic: 'وَعَلَيْكُم اَلسَّلَام، وَيْن اَلْأَرُزّ؟',  transliteration: "wa 'alaykum as-salaam, wain al-aruzz?",  english: 'And upon you peace, where is the rice?', context: 'Gulf: wain = where' },
  { type: 'waiter', arabic: 'اَلْأَرُزّ فِي اَلْمَمَرّ اَلثَّالِث',        transliteration: 'al-aruzz fi al-mamarr al-thaalith',     english: 'Rice is in aisle three' },
  { type: 'user',   arabic: 'وَيْن اَلْخُبْز؟',                            transliteration: 'wain al-khubz?',                        english: 'Where is the bread?' },
  { type: 'waiter', arabic: 'اَلْخُبْز عَلَى اَلْيَسَار',                  transliteration: "al-khubz 'ala al-yasaar",               english: 'The bread is on the left' },
  { type: 'user',   arabic: 'شُكْراً، وَبِكَم اَلْحَلِيب؟',               transliteration: 'shukran, wa bikam al-haliib?',           english: 'Thank you, and how much is the milk?' },
  { type: 'waiter', arabic: 'اَلْحَلِيب بِأَرْبَعَة دَرَاهِم',             transliteration: "al-haliib bi-arba'a darahim",            english: 'The milk is four dirhams' },
  { type: 'user',   arabic: 'زَيْن، أَبِي هَذَا كُلُّه',                  transliteration: 'zain, abi haadha kulluh',                english: 'Good, I want all of this',              context: 'Gulf: zain = good, abi = I want' },
  { type: 'waiter', arabic: 'تَفَضَّل، اَلْكَاشِير هِنَا',                 transliteration: 'tafaddal, al-kaashiir hina',             english: 'Come this way, the cashier is here' },
  { type: 'user',   arabic: 'اَلْمَجْمُوع كَم؟',                          transliteration: "al-majmuu' kam?",                       english: 'How much is the total?' },
  { type: 'waiter', arabic: 'اَلْمَجْمُوع اِثْنَيْن وَعِشْرِين دِرْهَم',  transliteration: "al-majmuu' ithnayn wa 'ishrin dirham",   english: 'The total is twenty-two dirhams' },
  { type: 'user',   arabic: 'تَفَضَّل، وَاللَّهُ يُعْطِيكَ الْعَافِيَة',  transliteration: "tafaddal, wallah yu'tiik al-'aafiya",    english: 'Here you go, God give you health' },
];

export const PHARMACY_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'اَلسَّلَامُ عَلَيْكُم، كَيْفَ أُسَاعِدُكَ؟', transliteration: "as-salaamu 'alaykum, kayf usaa'idak?",  english: 'Peace be upon you, how can I help you?', context: 'Pharmacist greets you' },
  { type: 'user',   arabic: 'وَعَلَيْكُم اَلسَّلَام، عِنْدِي صُدَاع',     transliteration: "wa 'alaykum as-salaam, 'indi sudaa'",   english: 'And upon you peace, I have a headache' },
  { type: 'waiter', arabic: 'مِن مَتَى؟',                                   transliteration: 'min mata?',                             english: 'Since when?' },
  { type: 'user',   arabic: 'مِن اَلصَّبَاح',                               transliteration: 'min al-sabaah',                         english: 'Since this morning' },
  { type: 'waiter', arabic: 'عِنْدَكَ حَرَارَة؟',                          transliteration: "'indak haraara?",                       english: 'Do you have a fever?' },
  { type: 'user',   arabic: "مَا أَعْرِف، بَسْ أَحِسّ تَعْبَان",          transliteration: "ma a'rif, bas ahiss ta'baan",           english: "I don't know, but I feel unwell",      context: 'Gulf: bas = just/but' },
  { type: 'waiter', arabic: "تَفَضَّل هَذَا الدَّوَاء",                    transliteration: "tafaddal haadha al-dawaa'",              english: 'Here is this medicine' },
  { type: 'user',   arabic: 'كَيْفَ آخُذُه؟',                              transliteration: 'kayf aakhudhuhu?',                       english: 'How do I take it?' },
  { type: 'waiter', arabic: "حَبَّة كُلّ سِتّ سَاعَات بَعْد اَلْأَكْل",   transliteration: "habba kull sitt saa'aat ba'd al-akl",    english: 'One pill every six hours after eating' },
  { type: 'user',   arabic: 'زَيْن، وَبِكَم؟',                             transliteration: 'zain, wa bikam?',                       english: 'Good, and how much?' },
  { type: 'waiter', arabic: 'اِثْنَا عَشَر دِرْهَم',                       transliteration: "ithna 'ashar dirham",                   english: 'Twelve dirhams' },
  { type: 'user',   arabic: 'تَفَضَّل',                                     transliteration: 'tafaddal',                               english: 'Here you go' },
  { type: 'waiter', arabic: 'اَللَّهُ يِشْفِيك',                           transliteration: 'allah yishfiik',                        english: 'God heal you' },
  { type: 'user',   arabic: 'آمِين، مَعَ السَّلَامَة',                      transliteration: "aamiin, ma'a as-salaama",                english: 'Amen, goodbye' },
];

export const BARBERSHOP_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'اَلسَّلَامُ عَلَيْكُم، تَفَضَّلْ اِجْلِسْ', transliteration: "as-salaamu 'alaykum, tafaddal ijlis",    english: 'Peace be upon you, please have a seat', context: 'Barber welcomes you' },
  { type: 'user',   arabic: 'وَعَلَيْكُم اَلسَّلَام، شُكْراً',           transliteration: "wa 'alaykum as-salaam, shukran",         english: 'And upon you peace, thank you' },
  { type: 'waiter', arabic: 'وِشْ تَبِي؟',                               transliteration: 'wish tabi?',                             english: 'What do you want?',                     context: 'Gulf: wish = what, tabi = you want' },
  { type: 'user',   arabic: 'قَصَّة خَفِيفَة مِن فَضْلَك',              transliteration: 'qassa khafiifa min fadlak',              english: 'A light haircut please' },
  { type: 'waiter', arabic: 'مِن اَلْجَانِبَيْن؟',                       transliteration: 'min al-jaanibain?',                      english: 'On the sides?' },
  { type: 'user',   arabic: 'إِيه، وَقَصِير مِن فَوْق',                  transliteration: 'ih, wa qasiir min foog',                 english: 'Yes, and short on top' },
  { type: 'waiter', arabic: 'حَاضِر، أَيّ نُمْرَة لِلْجَانِبَيْن؟',     transliteration: 'haadir, ayy numra lil-jaanibain?',       english: 'Sure, which number for the sides?' },
  { type: 'user',   arabic: 'نُمْرَة اِثْنَيْن',                         transliteration: 'numra ithnayn',                          english: 'Number two' },
  { type: 'waiter', arabic: "زَيْن، اِبْدَأِ الْحِين",                   transliteration: "zain, ibda' al-hin",                     english: 'Good, starting now',                    context: 'Gulf: al-hin = now' },
  { type: 'user',   arabic: 'مُمْتَاز، بَسْ لَا تُكْثِر مِن فَوْق',    transliteration: 'mumtaaz, bas la tukhthir min foog',      english: "Excellent, just don't take too much off the top" },
  { type: 'waiter', arabic: "وِشْ رَأْيَك؟",                             transliteration: "wish ra'yek?",                           english: 'What do you think?' },
  { type: 'user',   arabic: "زَيْن جِدّاً، يُعْطِيكَ الْعَافِيَة",      transliteration: "zain jiddan, yu'tiik al-'aafiya",        english: 'Very good, God give you health' },
  { type: 'waiter', arabic: 'عِشْرِين دِرْهَم',                          transliteration: "'ishrin dirham",                         english: 'Twenty dirhams' },
  { type: 'user',   arabic: 'تَفَضَّل، مَشْكُور',                        transliteration: 'tafaddal, mashkoor',                     english: 'Here you go, thank you' },
];

export const AIRPORT_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'اَلسَّلَامُ عَلَيْكُم، تَذْكِرَتَكَ مِن فَضْلَك', transliteration: "as-salaamu 'alaykum, tadhkirtak min fadlak", english: 'Peace be upon you, your ticket please', context: 'Check-in agent greets you' },
  { type: 'user',   arabic: 'وَعَلَيْكُم اَلسَّلَام، تَفَضَّل',                transliteration: "wa 'alaykum as-salaam, tafaddal",           english: 'And upon you peace, here you go' },
  { type: 'waiter', arabic: 'وَيْن تُسَافِر؟',                                  transliteration: 'wain tusaafir?',                            english: 'Where are you traveling?',              context: 'Gulf: wain = where' },
  { type: 'user',   arabic: 'إِلَى دُبَي',                                      transliteration: 'ila dubai',                                 english: 'To Dubai' },
  { type: 'waiter', arabic: 'كَم شَنْطَة عِنْدَك؟',                            transliteration: 'kam shanta indak?',                         english: 'How many bags do you have?' },
  { type: 'user',   arabic: 'شَنْطَة وَحْدَة كَبِيرَة',                         transliteration: 'shanta wahda kabiira',                      english: 'One big bag' },
  { type: 'waiter', arabic: "اَلشَّنْطَة ثَقِيلَة، خَمْسَة وَعِشْرِين كِيلُو", transliteration: "al-shanta thaqiila, khamsa wa 'ishrin kiilo", english: 'The bag is heavy, twenty-five kilos' },
  { type: 'user',   arabic: 'زَيْن، كَم رُسُوم اَلزِّيَادَة؟',                transliteration: 'zain, kam rusuum al-ziyaada?',               english: 'Good, how much is the excess fee?' },
  { type: 'waiter', arabic: "مِئَة دِرْهَم",                                    transliteration: "mi'at dirham",                               english: 'One hundred dirhams' },
  { type: 'user',   arabic: 'تَفَضَّل',                                         transliteration: 'tafaddal',                                   english: 'Here you go' },
  { type: 'waiter', arabic: "شُكْراً، اَلْبَوَّابَة رَقْم سَبْعَة",            transliteration: "shukran, al-bawwaaba raqam sab'a",           english: 'Thank you, gate number seven' },
  { type: 'user',   arabic: 'وَالطَّيَرَان فِي أَيّ وَقْت؟',                  transliteration: 'wal-tayaraan fi ayy waqt?',                  english: 'And when is the flight?' },
  { type: 'waiter', arabic: "اَلسَّاعَة اَلثَّانِيَة عَشَرَة",                 transliteration: "al-saa'a al-thaaniya 'ashara",               english: "At twelve o'clock" },
  { type: 'user',   arabic: 'شُكْراً جَزِيلاً، مَعَ السَّلَامَة',             transliteration: "shukran jaziilan, ma'a as-salaama",          english: 'Thank you very much, goodbye' },
];

// ── Unit 6: Daily Life Scenarios ─────────────────────────────────────────────

export const MORNING_ROUTINE_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'صَبَاحُ اَلْخَيْر يَا يُوسُف',             transliteration: 'sabah al-khair ya yuusuf',        english: 'Good morning, Yusuf',              context: 'Umm Yusuf calls from the kitchen' },
  { type: 'user',   arabic: 'صَبَاحُ اَلنُّور يَا أُمِّي',              transliteration: 'sabah an-nuur ya ummi',           english: 'Good morning, Mum' },
  { type: 'waiter', arabic: 'تُرِيدُ فُطُور؟',                          transliteration: 'turiid futuur?',                  english: 'Do you want breakfast?' },
  { type: 'user',   arabic: 'إِيه، أَنَا جُوعَان',                      transliteration: "ih, ana joo'aan",                 english: 'Yes, I am hungry' },
  { type: 'waiter', arabic: 'عِنْدَنَا بَيْض وَخُبْز',                  transliteration: "'indana bayd wa khubz",           english: 'We have eggs and bread' },
  { type: 'user',   arabic: 'تَمَام، شُكْراً يَا أُمِّي',               transliteration: 'tamaam, shukran ya ummi',         english: 'Perfect, thank you Mum' },
  { type: 'waiter', arabic: 'شُو تِشْرَب؟ شَاي وِلَّا قَهْوَة؟',       transliteration: 'shu tishrab? shaay willa qahwa?', english: 'What will you drink? Tea or coffee?' },
  { type: 'user',   arabic: 'قَهْوَة عَرَبِي مِن فَضْلَك',             transliteration: "'arabi min fadlak",               english: 'Arabic coffee please' },
];

export const GYM_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'أَهْلاً! جَاهِز تِتْمَرَّن؟',             transliteration: 'ahlan! jaahiz titmarra?',         english: 'Welcome! Ready to train?',         context: 'Personal trainer greets Yusuf' },
  { type: 'user',   arabic: 'إِيه، جَاهِز وَإِن شَاء اَللَّه',         transliteration: 'ih, jaahiz wa inshallah',         english: 'Yes, ready, God willing' },
  { type: 'waiter', arabic: 'نِبْدَأ بِالإِحْمَاء',                    transliteration: "nibda' bil-ihma'",                english: "Let's start with the warm-up" },
  { type: 'user',   arabic: 'حَاضِر',                                   transliteration: 'haadir',                          english: 'Sure' },
  { type: 'waiter', arabic: 'عَشَر دَقَايِق عَلَى التِّرِيدْمِل',      transliteration: "'ashar daqaayiq 'ala at-treadmill", english: 'Ten minutes on the treadmill',   context: 'Gulf: daqaayiq = minutes' },
  { type: 'user',   arabic: 'لَا مُشْكِلَة',                            transliteration: 'la mushkila',                     english: 'No problem' },
  { type: 'waiter', arabic: 'أَحْسَنْت! تَعِبْت؟',                     transliteration: "ahsant! ti'ibt?",                 english: 'Well done! Are you tired?' },
  { type: 'user',   arabic: 'شْوَي بَسْ أَكْمِل',                      transliteration: 'shway bas akmal',                 english: "A little but I'll continue" },
];

export const COOKING_HOME_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'تَقْدَر تِسَاعِدْنِي فِي الطَّبْخ؟',      transliteration: "taqdar tisaa'idni fi al-tabkh?",  english: 'Can you help me with cooking?',     context: 'Zawja (wife) asks for help' },
  { type: 'user',   arabic: 'أَكِيد! نِطْبُخ إِيش؟',                   transliteration: 'akiid! nitbukh aysh?',            english: "Of course! What are we cooking?" },
  { type: 'waiter', arabic: 'مَجْبُوس دَجَاج',                          transliteration: 'majbuus dajaaj',                  english: 'Chicken majboos',                   context: 'Majboos is a traditional Gulf rice dish' },
  { type: 'user',   arabic: 'يُمِّي! أَحِبّ اَلْمَجْبُوس',             transliteration: 'yammi! ahibb al-majbuus',         english: 'Yummy! I love majboos' },
  { type: 'waiter', arabic: 'جِيب اَلأَرُزّ مِن اَلرَّف',              transliteration: 'jiib al-aruzz min ar-raff',        english: 'Get the rice from the shelf' },
  { type: 'user',   arabic: 'تَفَضَّلِي',                               transliteration: 'tafaddali',                       english: 'Here you go' },
  { type: 'waiter', arabic: 'شُكْراً! جَاهِز بَعَد سَاعَة',            transliteration: "shukran! jaahiz ba'ad saa'a",     english: 'Thank you! Ready in one hour' },
  { type: 'user',   arabic: 'بِتَشَوَّق',                               transliteration: 'bitashawwaq',                     english: "Can't wait" },
];

export const WEATHER_CHAT_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'وَاللَّه حَرّ اَلْيَوْم!',                 transliteration: 'wallah harr al-yoom!',             english: "By God it's hot today!",           context: 'Sadeeq (friend) complains about the heat' },
  { type: 'user',   arabic: 'إِيه! وَاجِد حَرّ',                        transliteration: 'ih! waajid harr',                 english: 'Yes! Very hot',                    context: 'Gulf: waajid = very' },
  { type: 'waiter', arabic: 'اَلْحَرَارَة خَمْسَة وَأَرْبَعِين دَرَجَة', transliteration: "al-haraara khamsa wa arba'iin darja", english: 'The temperature is 45 degrees' },
  { type: 'user',   arabic: 'مُوي! هَذَا حَرّ زِيَادَة',               transliteration: 'mowi! haadha harr ziyaada',       english: 'Wow! This is too hot',             context: 'Gulf: mowi = wow' },
  { type: 'waiter', arabic: 'أَنَا مَا أَقْدِر أَطْلَع بَرَّه',        transliteration: "ana ma aqdar atla' barra",        english: "I can't go outside" },
  { type: 'user',   arabic: 'أَنَا كَذَلِك، نِقْعُد بِالْبَيْت',       transliteration: "ana kathalik, niq'ud bil-bait",   english: "Me too, let's stay home" },
  { type: 'waiter', arabic: 'بُكْرَه يِقُولُون فِيه غُبَار',            transliteration: 'bukra yaquuloon fiihi ghubbaar',  english: "Tomorrow they say there'll be a sandstorm" },
  { type: 'user',   arabic: 'يَا رَبّ يِبْرَد اَلْجَوّ',               transliteration: 'ya rabb yibrad al-jaww',          english: 'God willing the weather cools down' },
];

export const DOCTOR_VISIT_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'أَهْلاً! إِيش فِيكَ؟',                    transliteration: 'ahlan! aysh fiik?',               english: "Welcome! What's the matter?",      context: 'Doctor greets Yusuf' },
  { type: 'user',   arabic: 'عِنْدِي صُدَاع وَحُمَّى',                 transliteration: "'indi sudaa' wa humma",           english: 'I have a headache and fever' },
  { type: 'waiter', arabic: 'مِن مَتَى؟',                               transliteration: 'min mata?',                       english: 'Since when?' },
  { type: 'user',   arabic: 'مِن أَمْسِ',                               transliteration: 'min ams',                         english: 'Since yesterday' },
  { type: 'waiter', arabic: 'اِفْتَح فَمَّك مِن فَضْلَك',              transliteration: 'iftah fammak min fadlak',         english: 'Open your mouth please' },
  { type: 'user',   arabic: 'حَاضِر دُكْتُور',                          transliteration: 'haadir duktuur',                  english: 'Sure, doctor' },
  { type: 'waiter', arabic: 'عِنْدَك زُكَام بَسِيط، هَذَا اَلدَّوَاء', transliteration: "'indak zukkaam basiit, haadha ad-dawaa'", english: 'You have a light cold, here is the medicine' },
  { type: 'user',   arabic: 'شُكْراً يَا دُكْتُور، اَللَّه يُعَافِيكَ', transliteration: "shukran ya duktuur, allah yu'aafiik", english: 'Thank you doctor, God give you good health' },
];

export const BANK_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'مَرْحَبَاً، كَيْف أَقْدَر أُسَاعِدَك؟',   transliteration: "marhaban, kayf aqdar usaa'idak?", english: 'Hello, how can I help you?',       context: 'Bank employee greets Yusuf' },
  { type: 'user',   arabic: 'أَبِي أَفْتَح حِسَاب',                     transliteration: 'abi aftah hisaab',                english: 'I want to open an account' },
  { type: 'waiter', arabic: 'تَفَضَّل، مَعَكَ جَوَازُ اَلسَّفَر؟',      transliteration: "tafaddal, ma'ak jawaaz as-safar?", english: 'Please, do you have your passport?' },
  { type: 'user',   arabic: 'إِيه، تَفَضَّل',                            transliteration: 'ih, tafaddal',                    english: 'Yes, here you go' },
  { type: 'waiter', arabic: 'وَعُنْوَانَكَ فِي اَلإِمَارَات؟',          transliteration: "w-'unwaanak fi al-imaaraat?",     english: 'And your address in the UAE?' },
  { type: 'user',   arabic: 'أَسْكُن فِي دُبَي',                         transliteration: 'askun fi dubai',                  english: 'I live in Dubai' },
  { type: 'waiter', arabic: 'تَمَام، اَلْحِسَاب يِكُون جَاهِز خِلَال أُسْبُوع', transliteration: "tamaam, al-hisaab yakuun jaahiz khilaal usbuu'", english: 'Great, the account will be ready within a week' },
  { type: 'user',   arabic: 'شُكْراً، إِلَى اَللِّقَاء',                transliteration: "shukran, ila al-liqaa'",          english: 'Thank you, goodbye' },
];

export const FRIDAY_GATHERING_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'تَعَال يَا يُوسُف! أَهْلاً وَسَهْلاً',    transliteration: "ta'aal ya yuusuf! ahlan wa sahlan", english: 'Come Yusuf! Welcome',             context: 'Uncle (amm) welcomes Yusuf to Friday family gathering' },
  { type: 'user',   arabic: 'أَهْلاً عَمِّي، كَيْف اَلْحَال؟',         transliteration: "'ahlan 'ammi, kayf al-haal?",     english: 'Hello uncle, how are you?' },
  { type: 'waiter', arabic: 'بِخَيْر وَالْحَمْدُ لِلَّه، اَلْكُلّ مُجْتَمِع اَلْيَوْم', transliteration: "bikhair wal-hamdulillah, al-kull mujtami' al-yoom", english: 'Fine, praise God, everyone is gathered today' },
  { type: 'user',   arabic: 'زَيْن! وَيْن اَلأَكْل؟',                   transliteration: 'zain! wain al-akil?',             english: "Great! Where's the food?" },
  { type: 'waiter', arabic: 'هُنَاكَ مَنْدِي وَكَبْسَة',                transliteration: 'hunaak mandi wa kabsa',           english: "There's mandi and kabsa",          context: 'Traditional Gulf celebration dishes' },
  { type: 'user',   arabic: 'اَللَّه! أَنَا جُوعَان كَثِير',            transliteration: "allah! ana joo'aan kathiir",      english: "Wow! I'm very hungry" },
  { type: 'waiter', arabic: 'تَعَال نِجْلِس مَعَ اَلْكِبَار',           transliteration: "ta'aal nijlis ma'a al-kibbaar",   english: 'Come sit with the elders' },
  { type: 'user',   arabic: 'حَاضِر عَمِّي، شُكْراً',                   transliteration: "'haadir 'ammi, shukran",          english: 'Sure uncle, thank you' },
];

export const NEIGHBOR_VISIT_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'أَهْلاً يُوسُف! تَفَضَّل اِدْخُل',        transliteration: 'ahlan yuusuf! tafaddal udkhul',   english: 'Hello Yusuf! Please come in',      context: 'Neighbor (yaar = friend) welcomes Yusuf for coffee' },
  { type: 'user',   arabic: 'شُكْراً يَا صَاحِب',                       transliteration: 'shukran ya saahib',               english: 'Thank you my friend' },
  { type: 'waiter', arabic: 'قَهْوَة وِلَّا شَاي؟',                     transliteration: 'qahwa willa shaay?',              english: 'Coffee or tea?' },
  { type: 'user',   arabic: 'قَهْوَة عَرَبِي لَو تَكَرَّمْت',           transliteration: 'qahwa arabi law takarramT',       english: 'Arabic coffee if you would be so kind' },
  { type: 'waiter', arabic: 'بِالْهَيْل؟',                              transliteration: 'bil-hail?',                       english: 'With cardamom?',                   context: 'Gulf: hail = cardamom, added to Arabic coffee' },
  { type: 'user',   arabic: 'إِيه، أَحِبّ هَيْل',                       transliteration: 'ih, ahibb hail',                  english: 'Yes, I love cardamom' },
  { type: 'waiter', arabic: 'تَفَضَّل',                                  transliteration: 'tafaddal',                        english: 'Here you go' },
  { type: 'user',   arabic: 'اَللَّه يِعْطِيكَ اَلصِّحَّة',             transliteration: "allah ya'Tiik as-siHHa",          english: 'God give you good health' },
];

// ── Unit 8: Emergencies & Help ────────────────────────────────────────────────

export const LOST_IN_CITY_DIALOGUE: DialogueTurn[] = [
  { type: 'user',   arabic: 'لَو سَمَحت أَخوي أَنا ضايِع',                          transliteration: "law samaht akhooy ana dhaay'",                     english: "Excuse me brother, I'm lost" },
  { type: 'waiter', arabic: 'هَلا أَخوي وَين تَبي تَروح',                            transliteration: 'hala akhooy wain tabi tarooh',                     english: 'Hey brother, where do you want to go?',         context: 'Aabir — a passerby in the city' },
  { type: 'user',   arabic: 'أَدَوِّر على دُبَي مول بَس ما أَدري وَين',              transliteration: 'adawwir ala dubai mool bass ma adri wain',          english: "I'm looking for Dubai Mall but I don't know where" },
  { type: 'waiter', arabic: 'أوه قَريب مِنَّك رُوح سيدا وبَعدَين يَمين',            transliteration: "ooh qareeb minnak rooh seedaa wa ba'dain yameen",   english: "Oh it's close, go straight then turn right" },
  { type: 'user',   arabic: 'كَم دَقيقَة مَشي مِن هِني',                             transliteration: 'kam daqeeqa mashi min hini',                       english: 'How many minutes walking from here?' },
  { type: 'waiter', arabic: 'تَقريبًا عَشَر دَقايِق بَس',                            transliteration: "taqreeban 'ashr daqaayiq bass",                    english: 'About ten minutes only' },
  { type: 'user',   arabic: 'مُمكِن تَوَرِّيني على الخَريطَة',                       transliteration: "mumkin twareeni 'ala il-khareeta",                 english: 'Can you show me on the map?' },
  { type: 'waiter', arabic: 'اي طَبعًا تَعال شُوف هِني أَنت وهِني المول',            transliteration: "ee tab'an ta'aal shoof hini int wa hini il-mool",  english: "Yes of course, you're here and the mall is here" },
];

export const CAR_BREAKDOWN_DIALOGUE: DialogueTurn[] = [
  { type: 'user',   arabic: 'السَّلام عَلَيكُم سَيَّارَتي خَرَّبَت بِنَص الطَّريق',   transliteration: "is-salaam 'alaikum sayyaarti kharabat bi-nuss it-tareeq",  english: 'Hello, my car broke down in the middle of the road' },
  { type: 'waiter', arabic: 'وعَلَيكُم السَّلام وَين أَنت بالضَّبط',                   transliteration: "wa 'alaikum is-salaam wain int bid-dhabt",               english: 'Hello, where exactly are you?',                   context: 'Mekaaneeki — the mechanic on the phone' },
  { type: 'user',   arabic: 'على شارِع الشَّيخ زايِد قَرب بُرج خَليفَة',              transliteration: "ala shaari' ish-shaikh zaayid garib burj khaleefa",     english: 'On Sheikh Zayed Road near Burj Khalifa' },
  { type: 'waiter', arabic: 'شِنو صار بالسَّيَّارَة',                                  transliteration: 'shinu saar bis-sayyaara',                              english: 'What happened to the car?' },
  { type: 'user',   arabic: 'ما تِشتَغِل أَبَد حاوَلت أَشغِّلها بَس ما اشتَغَلَت',    transliteration: 'ma tishtaghil abad haawalt ashghilha bass ma ishtaghlat', english: "It won't start at all, I tried but it didn't work" },
  { type: 'waiter', arabic: 'أوكي مُمكِن البَطَّاريَة خِلَصَت أَبعَثلَك وَنش',        transliteration: "okey mumkin il-battaarya khalsat ab'athlik winsh",        english: "Okay the battery might be dead, I'll send a tow truck" },
  { type: 'user',   arabic: 'كَم يَاخِذ وَقت يُوصَّل',                                transliteration: 'kam yaaakhidh waqt yoossal',                           english: 'How long will it take to arrive?' },
  { type: 'waiter', arabic: 'تَقريبًا نَص ساعَة إِن شاء الله',                        transliteration: "taqreeban nuss saa'a in shaa allah",                   english: 'About half an hour, God willing' },
];

export const POLICE_STATION_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'تَفَضَّل كَيف أَقدَر أُساعِدَك',                          transliteration: "tafaddal kaif aqdar asaa'dak",                       english: 'Please, how can I help you?',           context: 'Shurti — the police officer' },
  { type: 'user',   arabic: 'أَبي أَبلَّغ عَن حادِث',                                  transliteration: "abi aballigh 'an haadith",                           english: 'I want to report an accident' },
  { type: 'waiter', arabic: 'شِنو صار بالضَّبط',                                       transliteration: 'shinu saar bid-dhabt',                                english: 'What happened exactly?' },
  { type: 'user',   arabic: 'سَيَّارَة صَدَمَتني مِن وَرا عِند الإِشارَة',             transliteration: "sayyaara sadamatni min wara 'ind il-ishaara",          english: 'A car hit me from behind at the traffic light' },
  { type: 'waiter', arabic: 'أَي أَحَد اِنصاب هَل أَنت بِخَير',                        transliteration: 'ay ahad insaab hal int bikhair',                      english: 'Was anyone hurt? Are you okay?' },
  { type: 'user',   arabic: 'أَنا بِخَير الحَمد لله بَس السَّيَّارَة فيها ضَرَر',      transliteration: "ana bikhair il-hamdu lillah bass is-sayyaara feeha dharar", english: "I'm fine, but the car has damage" },
  { type: 'waiter', arabic: 'عِندَك رَقم لُوحَة السَّيَّارَة الثَّانِيَة',             transliteration: "indak raqam loohat is-sayyaara ith-thaanya",           english: "Do you have the other car's plate number?" },
  { type: 'user',   arabic: 'اي صَوَّرته بالتَّلِفون',                                transliteration: 'ee sawwartah bit-tilifoon',                            english: 'Yes I took a photo with my phone' },
];

export const HOSPITAL_EMERGENCY_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'هَلا شِنو عِندَك شْلون أَقدَر أُساعِدَك',                  transliteration: "hala shinu 'indak shloon aqdar asaa'dak",             english: "Hello, what's wrong? How can I help?",  context: 'Mumarridha — the nurse in the ER' },
  { type: 'user',   arabic: 'صاحِبي طاح وما يِقدَر يِمشي',                              transliteration: 'saahbi taah wa ma yiqdar yimshi',                     english: "My friend fell and can't walk" },
  { type: 'waiter', arabic: 'وَين الأَلَم بالضَّبط',                                    transliteration: 'wain il-alam bid-dhabt',                               english: 'Where is the pain exactly?' },
  { type: 'user',   arabic: 'رِيلَه اليَمين مِتوَرِّمَة وايِد',                         transliteration: 'riylah il-yameen mitwarmah waayid',                   english: 'His right leg is very swollen' },
  { type: 'waiter', arabic: 'أوكي بِنسَوِّيلَه أَشعَّة حالًا تَفَضَّلوا مِن هِني',     transliteration: "okey binsawweelah ash'a haalan tafaddaloo min hini",   english: "Okay we'll do an X-ray right away, come this way" },
  { type: 'user',   arabic: 'يِحتاج عَملِيَّة',                                         transliteration: "yahtaaj 'amaliyya",                                   english: 'Does he need surgery?' },
  { type: 'waiter', arabic: 'الدُّكتور بَيشوف الأَشعَّة ويِقَرِّر لا تَخاف',           transliteration: "id-duktoor bayshoof il-ash'a wa yiqarrir la tikhaaf",  english: "The doctor will see the X-ray and decide, don't worry" },
  { type: 'user',   arabic: 'كَم بِتاخِذ وَقت الاِنتِظار',                              transliteration: 'kam bitaakhidh waqt il-intithaar',                    english: 'How long will the wait be?' },
  { type: 'waiter', arabic: 'تَقريبًا رُبع ساعَة اِجلِسوا هِني',                       transliteration: "taqreeban rub' saa'a ijlisoo hini",                   english: 'About fifteen minutes, sit here' },
];

export const LOST_WALLET_DIALOGUE: DialogueTurn[] = [
  { type: 'user',   arabic: 'لَو سَمَحت ضَيَّعت مَحفَظَتي',                            transliteration: "law samaht dhayya't mahfadhti",                      english: 'Excuse me, I lost my wallet' },
  { type: 'waiter', arabic: 'وَين آخِر مَكان كانَت عِندَك',                             transliteration: "wain aakhir makaan kaanat 'indak",                   english: 'Where was the last place you had it?',  context: 'Muwadhdhaf Amn — the security guard' },
  { type: 'user',   arabic: 'أَعتَقِد بالمَطعَم اللي فوق',                              transliteration: "a'taqid bil-mat'am illi fooq",                       english: 'I think at the restaurant upstairs' },
  { type: 'waiter', arabic: 'شِنو لَون المَحفَظَة',                                    transliteration: 'shinu loon il-mahfadha',                               english: 'What color is the wallet?' },
  { type: 'user',   arabic: 'سودا مِن الجِلد فيها بِطاقات وفُلوس',                      transliteration: 'sooda min il-jild feeha bitaaqaat wa floos',           english: 'Black leather, it has cards and money' },
  { type: 'waiter', arabic: 'خَلَّني أَتَّصِل بالمَفقودات يِمكِن أَحَد سَلَّمها',     transliteration: 'khalni attasil bil-mafqoodaat yimkin ahad sallamha',   english: "Let me call lost and found, maybe someone turned it in" },
  { type: 'user',   arabic: 'إِن شاء الله فيها هُوِيَّتي وبِطاقَة البَنك',             transliteration: 'in shaa allah feeha hawiyyati wa bitaaqat il-bank',   english: 'I hope so, it has my ID and bank card' },
  { type: 'waiter', arabic: 'لَقوها مَحَد أَخَذ مِنها شَي تَعال مَعي',                transliteration: "lagooha mahad akhadh minha shay ta'aal ma'i",          english: 'They found it, nothing was taken, come with me' },
];

export const FLIGHT_PROBLEM_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'هَلا تَفَضَّل كَيف أَقدَر أُساعِدَك',                      transliteration: "hala tafaddal kaif aqdar asaa'dak",                  english: 'Hello, how can I help you?',            context: 'Muwadhdhafat Tayaraan — airline employee' },
  { type: 'user',   arabic: 'رِحلَتي تَأَخَّرَت وأَنا عِندي تِرانزيت',                  transliteration: "rihlati ta'akharat wa ana 'indi traanzeet",           english: 'My flight is delayed and I have a connection' },
  { type: 'waiter', arabic: 'شِنو رَقم الرِّحلَة',                                       transliteration: 'shinu raqam ir-rihla',                                english: "What's the flight number?" },
  { type: 'user',   arabic: 'إِي كَي خَمسِميَّة وَاحِد وعِشرين',                        transliteration: "ay kay khamsimiyya waahid wa 'ishreen",               english: 'EK five twenty-one' },
  { type: 'waiter', arabic: 'اي الرِّحلَة مِتأَخِّرَة ساعَتَين',                         transliteration: "ee ir-rihla mit'akhra saa'atain",                    english: 'Yes the flight is delayed two hours' },
  { type: 'user',   arabic: 'بِلحَق الرِّحلَة الثَّانِيَة وِلَّا لا',                   transliteration: 'bilhaq ir-rihla ith-thaanya willa la',                english: 'Will I make the connecting flight or not?' },
  { type: 'waiter', arabic: 'بِنحِجزلَك على رِحلَة ثانِيَة لا تِشيل هَمّ',              transliteration: 'binhaijzlak ala rihla thaanya la tsheel hamm',        english: "We'll book you on another flight, don't worry" },
  { type: 'user',   arabic: 'أَبي أَجلِس بِصالَة الاِنتِظار وَين هِي',                  transliteration: 'abi ajlis bi-saalat il-intithaar wain hee',            english: 'I want to sit in the lounge, where is it?' },
  { type: 'waiter', arabic: 'الدَّور الثَّاني على يَمينَك تَفَضَّل هَذي البوردِنق باس الجَديدَة', transliteration: "id-door ith-thaani 'ala yameenik tafaddal haadhi il-boarding pass ij-jadeeda", english: "Second floor on your right, here's your new boarding pass" },
];

export const ASKING_FOR_HELP_DIALOGUE: DialogueTurn[] = [
  { type: 'user',   arabic: 'لَو سَمَحت أَخوي مُمكِن تِساعِدني',                        transliteration: "law samaht akhooy mumkin tisaa'idni",                 english: 'Excuse me brother, can you help me?' },
  { type: 'waiter', arabic: 'اي طَبعًا شِنو تَبي',                                      transliteration: "ee tab'an shinu tabi",                               english: 'Yes of course, what do you need?',     context: 'Shakhs — a stranger on the street' },
  { type: 'user',   arabic: 'تِلِفوني خِلصَت بَطَّارِيَته أَبي أَتَّصِل ضَروري',        transliteration: 'tilifooni khalsat battaareetah abi attasil dharoori',  english: 'My phone battery died, I need to make an urgent call' },
  { type: 'waiter', arabic: 'تَفَضَّل اِستَخدِم تِلِفوني',                               transliteration: 'tafaddal istakhdim tilifooni',                        english: 'Here, use my phone' },
  { type: 'user',   arabic: 'مَشكور وايِد الله يِعطيك العافِيَة',                        transliteration: "mashkoor waayid allah yi'teek il-'aafya",             english: 'Thank you so much, God bless you' },
  { type: 'waiter', arabic: 'عادي أَخوي وَلا يِهِمَّك',                                  transliteration: "aadi akhooy wala yhimmak",                            english: "No problem brother, don't mention it" },
  { type: 'user',   arabic: 'خَلَّصت شُكراً مَرَّة ثانِيَة',                             transliteration: 'khallast shukran marra thaanya',                      english: "I'm done, thanks again" },
  { type: 'waiter', arabic: 'الله يُوَفِّقَك أَخوي مَع السَّلامَة',                      transliteration: "allah yuwaffqak akhooy ma' is-salaama",              english: 'God bless you brother, goodbye' },
];

// ─── Unit 10 — Making Friends & Hobbies ──────────────────────────────────────

export const FRIENDS_NEW_NEIGHBOR_DIALOGUE: DialogueTurn[] = [
  { type: 'user',   arabic: 'هَلا والله أَنت الجار الجَديد',                          transliteration: 'hala wallah int ij-jaar ij-jadeed',                   english: "Hey! You're the new neighbor?" },
  { type: 'waiter', arabic: 'اي هَلا والله تَوني ناقِل شلونَك',                       transliteration: 'ee hala wallah tawni naaqil shloonak',                english: 'Yes hey, I just moved in. How are you?',  context: 'Khaalid — new neighbor' },
  { type: 'user',   arabic: 'الحَمد لله حَيَّاك الله بِالحَي أَنا يوسُف',             transliteration: 'il-hamdu lillah hayaak allah bil-hay ana yusuf',      english: "Good, welcome to the neighborhood. I'm Yusuf" },
  { type: 'waiter', arabic: 'أَنا خالِد تَشَرَّفنا يا يوسُف',                          transliteration: 'ana khaalid tasharrafna ya yusuf',                    english: "I'm Khalid, nice to meet you Yusuf" },
  { type: 'user',   arabic: 'مِن وين أَصلَك يا خالِد',                                 transliteration: 'min wain aslak ya khaalid',                           english: 'Where are you originally from Khalid?' },
  { type: 'waiter', arabic: 'مِن أَبوظَبي بَس أَشتَغِل هِني بِدُبي',                  transliteration: 'min abudhabi bass ashtaghil hini bi-dubai',           english: 'From Abu Dhabi but I work here in Dubai' },
  { type: 'user',   arabic: 'حَيَّاك إِذا تِحتاج أَي شَي أَنا جَنبَك',                transliteration: 'hayaak idha tihtaaj ay shay ana janbak',              english: "Welcome, if you need anything I'm right next to you" },
  { type: 'waiter', arabic: 'مَشكور وايِد الله يِخَلِّيك يا الغالي',                  transliteration: 'mashkoor waayid allah yikhalleek ya il-ghaali',        english: 'Thank you so much, God bless you dear' },
];

export const FRIENDS_FOOTBALL_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'يالله المُباراة بِتِبدا عِندَك خَبَر',                   transliteration: "yallah il-mubaara bitibda 'indak khabar",             english: 'The match is about to start, did you know?',  context: 'Saahib — friend' },
  { type: 'user',   arabic: 'اي والله مِنو يِلعَب اليَوم',                             transliteration: "ee wallah minu yil'ab il-yawm",                      english: "Yeah! Who's playing today?" },
  { type: 'waiter', arabic: 'الهِلال ضِد النَّصر الكلاسيكو',                           transliteration: 'il-hilaal dhidd in-nasr il-klassiko',                 english: 'Al Hilal vs Al Nasr, the classico' },
  { type: 'user',   arabic: 'واو لازِم نِشوفها وين نِتجَمَّع',                         transliteration: "waaw laazim nshoofha wain nitjamma'",                 english: 'Wow we have to watch it, where should we meet?' },
  { type: 'waiter', arabic: 'تَعال عِندي عِندَنا شاشَة كَبيرَة',                       transliteration: "ta'aal 'indi 'indana shaasha kabeera",                english: 'Come to my place, we have a big screen' },
  { type: 'user',   arabic: 'أوكي أَبيِب مَعاي شيبس ومَشروبات',                        transliteration: "okey abyib ma'aay sheeps wa mashroobaat",             english: "Okay I'll bring chips and drinks" },
  { type: 'waiter', arabic: 'حَيَّاك بَس تَعال بَدري عَشان نِلحَق البِدايَة',          transliteration: "hayaak bass ta'aal badri 'ashaan nilhaq il-bidaaya",   english: 'Welcome, but come early so we catch the start' },
  { type: 'user',   arabic: 'إِن شاء الله بَكون عِندَك الساعَة ثَمانِيَة',             transliteration: "in shaa allah bakoon 'indak is-saa'a thamaanya",     english: "God willing I'll be at yours at eight" },
];

export const FRIENDS_GAMING_DIALOGUE: DialogueTurn[] = [
  { type: 'user',   arabic: 'يالشَّباب مِنو يِبي يِلعَب اللَّيلَة',                   transliteration: "ya ish-shabaab minu yabi yil'ab il-laila",            english: 'Hey guys, who wants to play tonight?' },
  { type: 'waiter', arabic: 'أَنا جاهِز شِنو نِلعَب',                                  transliteration: "ana jaahiz shinu nil'ab",                             english: "I'm ready, what are we playing?",  context: 'Saahib — friend' },
  { type: 'user',   arabic: 'شرايَك فيفا وِلَّا واربزون',                              transliteration: 'shraayak feefa willa waarzoon',                       english: 'What do you think, FIFA or Warzone?' },
  { type: 'waiter', arabic: 'يالله واربزون مِن زَمان ما لِعبناها',                      transliteration: "yallah waarzoon min zamaan ma li'ibnaaha",             english: "Let's do Warzone, we haven't played it in a long time" },
  { type: 'user',   arabic: 'أوكي خَل نِسَوِّي سكواد كامِل مِنو مَعانا',               transliteration: "okey khal nsawwi skwaad kaamil minu ma'aana",         english: "Okay let's make a full squad, who's with us?" },
  { type: 'waiter', arabic: 'سالِم ومُحَمَّد بَعد يَبون يِلعَبون',                      transliteration: "saalim wa muhammad ba'd yaboon yil'aboon",             english: 'Salem and Muhammad also want to play' },
  { type: 'user',   arabic: 'تَمام الساعَة عَشر بِاللَّيل كُلَّنا نَكون أونلاين',       transliteration: "tamaam is-saa'a 'ashr bil-lail killina nkoon online",  english: 'Perfect, ten at night we all be online' },
  { type: 'waiter', arabic: 'دون ما تِنسى تَحَدِّث اللَّعبَة',                          transliteration: "doon ma tinsa thadith il-li'ba",                      english: "Done, don't forget to update the game" },
];

export const FRIENDS_WEEKEND_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'شِنو مِسَوِّي الويكند هالمَرَّة',                         transliteration: 'shinu msawwi il-weekend hal-marra',                   english: 'What are you doing this weekend?',  context: 'Saahib — friend' },
  { type: 'user',   arabic: 'والله ما عِندي خُطَّة لِين الحِين وأَنت',                 transliteration: "wallah ma 'indi khutta lin il-heen wa int",           english: "Honestly I don't have a plan yet, and you?" },
  { type: 'waiter', arabic: 'شرايَك نَروح البَحر السَّبت',                              transliteration: 'shraayak narooh il-bahar is-sabt',                    english: 'What do you think about going to the beach on Saturday?' },
  { type: 'user',   arabic: 'فِكرَة حِلوَة بَس الجَو مو حار',                           transliteration: 'fikra hilwa bass ij-jaw mu haar',                     english: "Nice idea, but the weather isn't too hot?" },
  { type: 'waiter', arabic: 'لا الحين بَدا يِبرِد شوَي مو مِثل الصَّيف',               transliteration: 'la il-heen bida yibrid shway mu mithil is-saif',      english: "No it's starting to cool down a bit, not like summer" },
  { type: 'user',   arabic: 'أوكي يالله ونَروح بَربيكيو بَعد',                          transliteration: "okey yallah wa narooh barbikyu ba'd",                 english: "Okay let's go, and we'll do a barbecue too" },
  { type: 'waiter', arabic: 'تَمام أَنا أَيِب اللَّحم وأَنت يِب الفَحم والباقي',        transliteration: "tamaam ana aayib il-laham wa int yib il-fahm wil-baaqi", english: "Perfect, I'll bring the meat and you bring the charcoal and the rest" },
  { type: 'user',   arabic: 'دون يالله باجِر السَّبت الساعَة أَربَع العَصر',             transliteration: "doon yallah baajir is-sabt is-saa'a arba' il-'asr",   english: 'Done, tomorrow Saturday at four in the afternoon' },
];

export const FRIENDS_SOCIAL_MEDIA_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'شِفت البوست حَقِّي بِالأِنستا',                           transliteration: 'shift il-boost haqqi bil-insta',                      english: 'Did you see my post on Insta?',  context: 'Saahib — friend' },
  { type: 'user',   arabic: 'اي والله شِنو المُناسَبَة',                                 transliteration: 'ee wallah shinu il-munaasaba',                        english: "Yeah! What's the occasion?" },
  { type: 'waiter', arabic: 'رُحت تَزَلَّج بِجورجيا صُور مَرَّة حِلوَة',               transliteration: 'ruht tazallaj bi-jorjya suwar marra hilwa',           english: 'I went skiing in Georgia, really nice photos' },
  { type: 'user',   arabic: 'ماشاء الله حِلوَة وايِد لايَكتها',                         transliteration: 'mashaa allah hilwa waayid laykatha',                  english: 'Mashallah very nice, I liked it' },
  { type: 'waiter', arabic: 'فولوني بِالتيكتوك بَعد أَبدا أَنزِل فيديوهات',            transliteration: "followni bit-tiktok ba'd abda anzil vidyohaat",        english: "Follow me on TikTok too, I'm starting to post videos" },
  { type: 'user',   arabic: 'أوكي شِنو يوزَرَك',                                         transliteration: 'okey shinu yoozarak',                                 english: "Okay what's your username?" },
  { type: 'waiter', arabic: 'نَفس الأِنستا خالِد بوينت أو',                             transliteration: 'nafs il-insta khaalid point ow',                      english: 'Same as Insta, khalid.o' },
  { type: 'user',   arabic: 'تَمام فولويتَك الحِين ما تِنسى فولوني باك',                transliteration: 'tamaam followaitak il-heen ma tinsa followni back',    english: "Done, I followed you now, don't forget to follow me back" },
];

export const FRIENDS_ROAD_TRIP_DIALOGUE: DialogueTurn[] = [
  { type: 'user',   arabic: 'يالشَّباب شرايكم نَروح رِحلَة بَرِّيَّة',                 transliteration: 'ya ish-shabaab shraayikum narooh rihla barriyya',     english: 'Hey guys, what do you think about a road trip?' },
  { type: 'waiter', arabic: 'فِكرَة مَرَّة حِلوَة وين نَروح',                           transliteration: 'fikra marra hilwa wain narooh',                       english: 'Great idea, where should we go?',  context: 'Saahib — friend' },
  { type: 'user',   arabic: 'شرايكم العَين وِلَّا حَتَّا',                              transliteration: "shraayikum il-'ain willa hatta",                     english: 'What about Al Ain or Hatta?' },
  { type: 'waiter', arabic: 'يالله حَتَّا فيها جِبال ومَيَّة حِلوَة',                  transliteration: 'yallah hatta feeha jibaal wa mayya hilwa',            english: "Let's do Hatta, it has mountains and nice water" },
  { type: 'user',   arabic: 'تَمام مِنو يَسوق',                                          transliteration: 'tamaam minu yasooog',                                 english: "Perfect, who's driving?" },
  { type: 'waiter', arabic: 'أَنا أَسوق سَيَّارَتي فورويل',                              transliteration: 'ana asooog sayyaarti forward',                        english: "I'll drive, my car is 4-wheel drive" },
  { type: 'user',   arabic: 'حِلو نِحتاج نِياب أَكل وماي وايِد',                        transliteration: 'hilow nihtaaj nyaab akil wa maay waayid',             english: 'Nice, we need to bring food and lots of water' },
  { type: 'waiter', arabic: 'أوكي نَطلَع الصُّبح بَدري الساعَة سِتَّة',                 transliteration: "okey nitla' is-subh badri is-saa'a sitta",            english: 'Okay we leave early morning at six' },
];

export const FRIENDS_BIRTHDAY_DIALOGUE: DialogueTurn[] = [
  { type: 'user',   arabic: 'كُل عام وأَنت بِخَير يا بو مُحَمَّد',                      transliteration: "kull 'aam wa int bikhair ya bu muhammad",             english: 'Happy birthday Abu Muhammad!' },
  { type: 'waiter', arabic: 'الله يَسَلِّمَك يا الغالي تَشَرَّفنا',                      transliteration: 'allah yisallimak ya il-ghaali tasharrafna',            english: "God bless you dear, we're honored",  context: 'Saahib — friend (birthday person)' },
  { type: 'user',   arabic: 'هَذي هَدِيَّتَك إِن شاء الله تِعجِبَك',                    transliteration: "haadhi hadiyyatak in shaa allah ti'jibak",             english: "Here's your gift, I hope you like it" },
  { type: 'waiter', arabic: 'واو مَشكور ما كان لازِم تِتَكَلَّف',                        transliteration: 'waaw mashkoor ma kaan laazim titkallaf',              english: "Wow thanks, you didn't have to" },
  { type: 'user',   arabic: 'عادي يا الغالي تِستاهَل',                                   transliteration: 'aadi ya il-ghaali tistaahil',                         english: 'No problem dear, you deserve it' },
  { type: 'waiter', arabic: 'يالله تَعال الكيكَة جاهِزَة',                               transliteration: "yallah ta'aal il-kaika jaahza",                       english: 'Come on, the cake is ready' },
  { type: 'user',   arabic: 'كَم صِرت الحِين',                                            transliteration: 'kam sirt il-heen',                                    english: 'How old are you now?' },
  { type: 'waiter', arabic: 'ثَلاثين والله الواحِد كِبَر',                                transliteration: 'thalaatheen wallah il-waahid kibar',                  english: "Thirty, man I'm getting old" },
];

export const FRIENDS_FAREWELL_DIALOGUE: DialogueTurn[] = [
  { type: 'waiter', arabic: 'يا يوسُف أَبي أَقولَك شَي',                                transliteration: 'ya yusuf abi agoolak shay',                           english: 'Yusuf, I want to tell you something',  context: 'Saahib — friend (moving away)' },
  { type: 'user',   arabic: 'شِنو خَير إِن شاء الله',                                    transliteration: 'shinu khair in shaa allah',                           english: 'What is it, hopefully good news?' },
  { type: 'waiter', arabic: 'الشَّرِكَة نَقَلَتني على السَّعوديَّة الشَّهر الياي',        transliteration: "ish-sharika naqalatni 'ala is-sa'oodiyya ish-shahar il-yaay", english: 'The company is transferring me to Saudi next month' },
  { type: 'user',   arabic: 'يا الله صِدَق والله بِنِشتاقلَك وايِد',                      transliteration: 'ya allah sidiq wallah binishtaglak waayid',            english: "Seriously? We'll miss you so much" },
  { type: 'waiter', arabic: 'وأَنا بَعد بَس فُرصَة مو تِتعَوَّض',                         transliteration: "wa ana ba'd bass fursa mu tit'awwadh",                 english: "Me too, but it's an opportunity I can't pass up" },
  { type: 'user',   arabic: 'الله يُوَفِّقَك يا الغالي تِستاهَل كُل خَير',                transliteration: 'allah yuwaffqak ya il-ghaali tistaahil kill khair',    english: 'God grant you success, you deserve all the best' },
  { type: 'waiter', arabic: 'إِن شاء الله نِتواصَل على طول',                              transliteration: "in shaa allah nitwaasal 'ala tool",                   english: "God willing we'll stay in touch" },
  { type: 'user',   arabic: 'أَكيد أَخوي وبَزورَك هِناك إِن شاء الله',                    transliteration: 'akeed akhooy wa bazoorak hinaak in shaa allah',        english: "Of course brother, and I'll visit you there God willing" },
  { type: 'waiter', arabic: 'حَيَّاك أَي وَقت البَيت بَيتَك',                              transliteration: 'hayaak ay waqt il-bait baitak',                       english: 'Welcome anytime, my home is your home' },
  { type: 'user',   arabic: 'الله يِحفَظَك يا خالِد مَع السَّلامَة',                       transliteration: "allah yihfadhak ya khaalid ma' is-salaama",           english: 'God protect you Khalid, goodbye' },
];
