import { makeMsaWords } from './msa-style';

export const BASIC_WORDS_MSA = makeMsaWords(1, 'basic-words', [
  ['نعم', "na'am", 'Yes'], ['لا', 'laa', 'No'], ['شكراً', 'shukran', 'Thank you'],
  ['من فضلك', 'min fadlak', 'Please.', undefined, undefined, 'مِن فَضْلَكَ.'],
  ['من فضلكِ', 'min fadliki', 'Please (addressing a woman).', undefined, undefined, 'مِن فَضْلِكِ.'],
  ['عفواً', 'afwan', 'Excuse me / You are welcome'],
  ['ماء', "maa'", 'Water'], ['قهوة', 'qahwa', 'Coffee'], ['طعام', "ta'aam", 'Food'],
  ['بيت', 'bayt', 'House'], ['سيارة', 'sayyaara', 'Car'], ['شارع', "shaari'", 'Street'],
  ['أين؟', 'ayna?', 'Where?'], ['كم؟', 'kam?', 'How much / how many?'], ['الآن', 'al-aan', 'Now'],
  ['اليوم', 'al-yawm', 'Today'], ['غداً', 'ghadan', 'Tomorrow'], ['جيد', 'jayyid', 'Good'],
  ['متعب', "mut'ab", 'Tired'],
]);

export const GREETINGS_WORDS_MSA = makeMsaWords(1, 'greetings', [
  ['مرحباً', 'marhaban', 'Hello'], ['أهلاً وسهلاً', 'ahlan wa sahlan', 'Welcome'],
  ['السلام عليكم', "as-salaamu 'alaykum", 'Peace be upon you'],
  ['وعليكم السلام', "wa 'alaykum as-salaam", 'And peace be upon you'],
  ['صباح الخير', 'sabaah al-khayr', 'Good morning'], ['مساء الخير', "masaa' al-khayr", 'Good evening'],
  ['كيف حالك؟', 'kayfa haaluk?', 'How are you?'], ['أنا بخير', 'anaa bikhayr', 'I am fine'],
  ['الحمد لله', 'al-hamdu lillaah', 'Thank God'], ['سعيد بلقائك', "sa'iid biliqaa'ik", 'Nice to meet you'],
  ['إلى اللقاء', "ilaa al-liqaa'", 'See you later'], ['مع السلامة', "ma'a as-salaama", 'Goodbye'],
  ['أراك لاحقاً', 'araaka laahiqan', 'See you later'], ['أتمنى لك يوماً جميلاً', "atamannaa laka yawman jamiilan", 'Have a nice day'],
  ['تفضل', 'tafaddal', 'Here you go / Please'], ['لا بأس', "laa ba's", 'No problem'],
]);

export const INTRO_WORDS_MSA = makeMsaWords(1, 'intro', [
  ['ما اسمك؟', 'maa ismuk?', 'What is your name?'], ['اسمي يوسف', 'ismii yuusuf', 'My name is Yusuf'],
  ['من أين أنت؟', 'min ayna anta?', 'Where are you from?'], ['أنا من المغرب', 'anaa min al-maghrib', 'I am from Morocco'],
  ['أين تسكن؟', 'ayna taskun?', 'Where do you live?'], ['أسكن في دبي', 'askunu fii dubay', 'I live in Dubai'],
  ['ماذا تعمل؟', "maadhaa ta'mal?", 'What do you do?'], ['أنا طالب', 'anaa taalib', 'I am a student'],
  ['أتحدث العربية', "atahaddathu al-'arabiyya", 'I speak Arabic'], ['أتحدث قليلاً', 'atahaddathu qaliilan', 'I speak a little'],
  ['لا أفهم', 'laa afham', 'I do not understand'], ['أعد، من فضلك', "a'id, min fadlak", 'Please repeat.', undefined, undefined, 'أَعِدْ، مِن فَضْلَكَ.'],
  ['تكلم ببطء، من فضلك', "takallam bi-but', min fadlak", 'Speak slowly, please.', undefined, undefined, 'تَكَلَّمْ بِبُطْء، مِن فَضْلَكَ.'], ['كيف تقول هذا بالعربية؟', "kayfa taquulu haadhaa bil-'arabiyya?", 'How do you say this in Arabic?'],
  ['أنا أتعلم العربية', "anaa ata'allamu al-'arabiyya", 'I am learning Arabic'], ['تشرفت بمعرفتك', "tasharraftu bima'rifatik", 'Nice to meet you'],
]);
