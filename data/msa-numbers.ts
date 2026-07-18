import { makeMsaWords } from './msa-style';

export const NUMBERS_1_5_WORDS_MSA = makeMsaWords(4, 'numbers-1-5', [
  ['واحد', 'waahid', 'one'], ['اثنان', 'ithnaan', 'two'], ['ثلاثة', 'thalaatha', 'three'],
  ['أربعة', "arba'a", 'four'], ['خمسة', 'khamsa', 'five'],
]);
export const NUMBERS_6_10_WORDS_MSA = makeMsaWords(4, 'numbers-6-10', [
  ['ستة', 'sitta', 'six'], ['سبعة', "sab'a", 'seven'], ['ثمانية', 'thamaaniya', 'eight'],
  ['تسعة', "tis'a", 'nine'], ['عشرة', "'ashara", 'ten'],
]);
export const NUMBERS_11_20_WORDS_MSA = makeMsaWords(4, 'numbers-11-20', [
  ['أحد عشر', "ahada 'ashar", 'eleven'], ['اثنا عشر', "ithnaa 'ashar", 'twelve'],
  ['ثلاثة عشر', "thalaathata 'ashar", 'thirteen'], ['أربعة عشر', "arba'ata 'ashar", 'fourteen'],
  ['خمسة عشر', "khamsata 'ashar", 'fifteen'], ['ستة عشر', "sittata 'ashar", 'sixteen'],
  ['سبعة عشر', "sab'ata 'ashar", 'seventeen'], ['ثمانية عشر', "thamaaniyata 'ashar", 'eighteen'],
  ['تسعة عشر', "tis'ata 'ashar", 'nineteen'], ['عشرون', "'ishruun", 'twenty'],
]);
export const NUMBERS_TENS_WORDS_MSA = makeMsaWords(4, 'numbers-tens', [
  ['ثلاثون', 'thalaathuun', 'thirty'], ['أربعون', "arba'uun", 'forty'], ['خمسون', 'khamsuun', 'fifty'],
  ['ستون', 'sittuun', 'sixty'], ['مئة', "mi'a", 'one hundred'],
]);
export const NUMBERS_100_1000_WORDS_MSA = makeMsaWords(4, 'numbers-100-1000', [
  ['مئتان', "mi'ataan", 'two hundred'], ['ثلاثمئة', "thalaathumi'a", 'three hundred'],
  ['خمسمئة', "khamsumi'a", 'five hundred'], ['ألف', 'alf', 'one thousand'], ['ألفان', 'alfaan', 'two thousand'],
]);
export const NUMBERS_PHONE_WORDS_MSA = makeMsaWords(4, 'numbers-phone', [
  ['ما رقم هاتفك؟', 'maa raqam haatifika?', 'What is your phone number?'],
  ['رقمي هو صفر خمسة صفر، واحد اثنان ثلاثة، أربعة خمسة ستة سبعة', 'raqamii huwa sifr khamsa sifr, waahid ithnaan thalaatha, arba\'a khamsa sitta sab\'a', 'My number is zero five zero, one two three, four five six seven'], ['صفر', 'sifr', 'zero'],
  ['اتصل بهذا الرقم', 'ittasil bi-haadha ar-raqam', 'Call this number'], ['أعد الرقم، من فضلك', "a'id ar-raqam, min fadlak", 'Repeat the number, please'],
]);
export const NUMBERS_PRICES_WORDS_MSA = makeMsaWords(4, 'numbers-prices', [
  ['كم السعر؟', "kam as-si'r?", 'How much is it?'], ['السعر عشرة دولارات', "as-si'r 'ashara duulaaraat", 'The price is ten dollars'],
  ['هذا مكلف', 'haadhaa mukallaf', 'This is expensive.'], ['هذا رخيص', 'haadhaa rakhiis', 'This is cheap'], ['هل لديك نقود أصغر؟', 'hal ladayka nuquud asghar?', 'Do you have smaller change?'],
]);
export const NUMBERS_TIME_WORDS_MSA = makeMsaWords(4, 'numbers-time', [
  ['كم الساعة؟', "kam as-saa'a?", 'What time is it?'], ['الساعة الواحدة', "as-saa'a al-waahida", "It is one o'clock"], ['الساعة الثانية', "as-saa'a ath-thaaniya", "It is two o'clock"], ['الساعة الثالثة', "as-saa'a ath-thaalitha", "It is three o'clock"],
  ['الساعة الثالثة والنصف', "as-saa'a ath-thaalitha wan-nisf", 'It is half past three'],
  ['الساعة الرابعة والربع', "as-saa'a ar-raabi'a war-rub'", 'It is quarter past four'],
]);
export const NUMBERS_AGE_WORDS_MSA = makeMsaWords(4, 'numbers-age', [
  ['كم عمرك؟', "kam 'umruk?", 'How old are you?'], ['عمري عشرون سنة', "'umrii 'ishruun sana", 'I am twenty years old'],
  ['عمره خمس سنوات', "'umruhu khams sanawaat", 'He is five years old'], ['عمرها ست سنوات', "'umruhaa sitt sanawaat", 'She is six years old'], ['أنا أكبر منك', 'anaa akbar minka', 'I am older than you'],
]);
export const NUMBERS_TOGETHER_WORDS_MSA = makeMsaWords(4, 'numbers-together', [
  ['واحد وعشرون', "waahid wa 'ishruun", 'twenty-one'], ['خمسة وثلاثون', 'khamsa wa thalaathuun', 'thirty-five'],
  ['مئة وخمسون', "mi'a wa khamsuun", 'one hundred fifty'], ['ألف ومئتان', "alf wa mi'ataan", 'one thousand two hundred'],
  ['لدي ثلاثة كتب', 'ladayya thalaatha kutub', 'I have three books'], ['لدي ثلاث سيارات', 'ladayya thalaath sayyaaraat', 'I have three cars'],
]);

export const MSA_UNIT4_LESSONS = [
  ['numbers-1-5', 'Numbers 1-5', NUMBERS_1_5_WORDS_MSA], ['numbers-6-10', 'Numbers 6-10', NUMBERS_6_10_WORDS_MSA],
  ['numbers-11-20', 'Numbers 11-20', NUMBERS_11_20_WORDS_MSA], ['numbers-tens', 'Tens', NUMBERS_TENS_WORDS_MSA],
  ['numbers-100-1000', 'Hundreds & Thousands', NUMBERS_100_1000_WORDS_MSA], ['numbers-phone', 'Phone Numbers', NUMBERS_PHONE_WORDS_MSA],
  ['numbers-prices', 'Prices & Money', NUMBERS_PRICES_WORDS_MSA], ['numbers-time', 'Telling the Time', NUMBERS_TIME_WORDS_MSA],
  ['numbers-age', 'Talking About Age', NUMBERS_AGE_WORDS_MSA], ['numbers-together', 'Putting Numbers Together', NUMBERS_TOGETHER_WORDS_MSA],
] as const;
