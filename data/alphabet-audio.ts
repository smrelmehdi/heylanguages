export type AlphabetAudioItem = {
  id: string;
  index: number;
  displayArabic: string;
  audioText: string;
  evalTarget: string;
  transliteration: string;
  english: string;
  audioPath: string;
  audio?: any;
};

export const ALPHABET_AUDIO: AlphabetAudioItem[] = [
  { id: 'alif', index: 1, displayArabic: 'ألف', audioText: 'أَلِف', evalTarget: 'ألف', transliteration: 'Alif', english: 'Alif', audioPath: 'assets/audio/alphabet-v2/1.mp3', audio: require('../assets/audio/alphabet-v2/1.mp3') },
  { id: 'ba', index: 2, displayArabic: 'باء', audioText: 'بَاءْ', evalTarget: 'باء', transliteration: 'Ba', english: 'Ba', audioPath: 'assets/audio/alphabet-v2/2.mp3', audio: require('../assets/audio/alphabet-v2/2.mp3') },
  { id: 'ta', index: 3, displayArabic: 'تاء', audioText: 'تَاءْ', evalTarget: 'تاء', transliteration: 'Ta', english: 'Ta', audioPath: 'assets/audio/alphabet-v2/3.mp3', audio: require('../assets/audio/alphabet-v2/3.mp3') },
  { id: 'tha', index: 4, displayArabic: 'ثاء', audioText: 'ثَاءْ', evalTarget: 'ثاء', transliteration: 'Tha', english: 'Tha', audioPath: 'assets/audio/alphabet-v2/4.mp3', audio: require('../assets/audio/alphabet-v2/4.mp3') },
  { id: 'jim', index: 5, displayArabic: 'جيم', audioText: 'جِيمْ', evalTarget: 'جيم', transliteration: 'Jim', english: 'Jim', audioPath: 'assets/audio/alphabet-v2/5.mp3', audio: require('../assets/audio/alphabet-v2/5.mp3') },
  { id: 'ha', index: 6, displayArabic: 'حاء', audioText: 'حَاء', evalTarget: 'حاء', transliteration: 'Haa', english: 'Haa', audioPath: 'assets/audio/alphabet-v2/6.mp3', audio: require('../assets/audio/alphabet-v2/6.mp3') },
  { id: 'kha', index: 7, displayArabic: 'خاء', audioText: 'خَاءْ', evalTarget: 'خاء', transliteration: 'Kha', english: 'Kha', audioPath: 'assets/audio/alphabet-v2/7.mp3', audio: require('../assets/audio/alphabet-v2/7.mp3') },
  { id: 'dal', index: 8, displayArabic: 'دال', audioText: 'دَالْ', evalTarget: 'دال', transliteration: 'Dal', english: 'Dal', audioPath: 'assets/audio/alphabet-v2/8.mp3', audio: require('../assets/audio/alphabet-v2/8.mp3') },
  { id: 'dhal', index: 9, displayArabic: 'ذال', audioText: 'ذَالْ', evalTarget: 'ذال', transliteration: 'Dhal', english: 'Dhal', audioPath: 'assets/audio/alphabet-v2/9.mp3', audio: require('../assets/audio/alphabet-v2/9.mp3') },
  { id: 'ra', index: 10, displayArabic: 'راء', audioText: 'رَاءْ', evalTarget: 'راء', transliteration: 'Ra', english: 'Ra', audioPath: 'assets/audio/alphabet-v2/10.mp3', audio: require('../assets/audio/alphabet-v2/10.mp3') },
  { id: 'zay', index: 11, displayArabic: 'زاي', audioText: 'زَايْ', evalTarget: 'زاي', transliteration: 'Zay', english: 'Zay', audioPath: 'assets/audio/alphabet-v2/11.mp3', audio: require('../assets/audio/alphabet-v2/11.mp3') },
  { id: 'sin', index: 12, displayArabic: 'سين', audioText: 'سِينْ', evalTarget: 'سين', transliteration: 'Sin', english: 'Sin', audioPath: 'assets/audio/alphabet-v2/12.mp3', audio: require('../assets/audio/alphabet-v2/12.mp3') },
  { id: 'shin', index: 13, displayArabic: 'شين', audioText: 'شِينْ', evalTarget: 'شين', transliteration: 'Shin', english: 'Shin', audioPath: 'assets/audio/alphabet-v2/13.mp3', audio: require('../assets/audio/alphabet-v2/13.mp3') },
  { id: 'sad', index: 14, displayArabic: 'صاد', audioText: 'صَادْ', evalTarget: 'صاد', transliteration: 'Sad', english: 'Sad', audioPath: 'assets/audio/alphabet-v2/14.mp3', audio: require('../assets/audio/alphabet-v2/14.mp3') },
  { id: 'dad', index: 15, displayArabic: 'ضاد', audioText: 'ضَادْ', evalTarget: 'ضاد', transliteration: 'Dad', english: 'Dad', audioPath: 'assets/audio/alphabet-v2/15.mp3', audio: require('../assets/audio/alphabet-v2/15.mp3') },
  { id: 'tta', index: 16, displayArabic: 'طاء', audioText: 'طَاءْ', evalTarget: 'طاء', transliteration: 'Tta', english: 'Taa', audioPath: 'assets/audio/alphabet-v2/16.mp3', audio: require('../assets/audio/alphabet-v2/16.mp3') },
  { id: 'dha', index: 17, displayArabic: 'ظاء', audioText: 'ظَاءْ', evalTarget: 'ظاء', transliteration: 'Dha', english: 'Dhaa', audioPath: 'assets/audio/alphabet-v2/17.mp3', audio: require('../assets/audio/alphabet-v2/17.mp3') },
  { id: 'ain', index: 18, displayArabic: 'عين', audioText: 'عَيْنْ', evalTarget: 'عين', transliteration: 'Ain', english: 'Ayn', audioPath: 'assets/audio/alphabet-v2/18.mp3', audio: require('../assets/audio/alphabet-v2/18.mp3') },
  { id: 'ghain', index: 19, displayArabic: 'غين', audioText: 'غَيْنْ', evalTarget: 'غين', transliteration: 'Ghain', english: 'Ghayn', audioPath: 'assets/audio/alphabet-v2/19.mp3', audio: require('../assets/audio/alphabet-v2/19.mp3') },
  { id: 'fa', index: 20, displayArabic: 'فاء', audioText: 'فَاءْ', evalTarget: 'فاء', transliteration: 'Fa', english: 'Fa', audioPath: 'assets/audio/alphabet-v2/20.mp3', audio: require('../assets/audio/alphabet-v2/20.mp3') },
  { id: 'qaf', index: 21, displayArabic: 'قاف', audioText: 'قَافْ', evalTarget: 'قاف', transliteration: 'Qaf', english: 'Qaf', audioPath: 'assets/audio/alphabet-v2/21.mp3', audio: require('../assets/audio/alphabet-v2/21.mp3') },
  { id: 'kaf', index: 22, displayArabic: 'كاف', audioText: 'كَافْ', evalTarget: 'كاف', transliteration: 'Kaf', english: 'Kaf', audioPath: 'assets/audio/alphabet-v2/22.mp3', audio: require('../assets/audio/alphabet-v2/22.mp3') },
  { id: 'lam', index: 23, displayArabic: 'لام', audioText: 'لَامْ', evalTarget: 'لام', transliteration: 'Lam', english: 'Lam', audioPath: 'assets/audio/alphabet-v2/23.mp3', audio: require('../assets/audio/alphabet-v2/23.mp3') },
  { id: 'mim', index: 24, displayArabic: 'ميم', audioText: 'مِيمْ', evalTarget: 'ميم', transliteration: 'Mim', english: 'Meem', audioPath: 'assets/audio/alphabet-v2/24.mp3', audio: require('../assets/audio/alphabet-v2/24.mp3') },
  { id: 'nun', index: 25, displayArabic: 'نون', audioText: 'نُونْ', evalTarget: 'نون', transliteration: 'Nun', english: 'Nun', audioPath: 'assets/audio/alphabet-v2/25.mp3', audio: require('../assets/audio/alphabet-v2/25.mp3') },
  { id: 'ha2', index: 26, displayArabic: 'هاء', audioText: 'هَاءْ', evalTarget: 'هاء', transliteration: 'Ha', english: 'Ha', audioPath: 'assets/audio/alphabet-v2/26.mp3', audio: require('../assets/audio/alphabet-v2/26.mp3') },
  { id: 'waw', index: 27, displayArabic: 'واو', audioText: 'وَاوْ', evalTarget: 'واو', transliteration: 'Waw', english: 'Waw', audioPath: 'assets/audio/alphabet-v2/27.mp3', audio: require('../assets/audio/alphabet-v2/27.mp3') },
  { id: 'ya', index: 28, displayArabic: 'ياء', audioText: 'يا.', evalTarget: 'ياء', transliteration: 'Ya', english: 'Ya', audioPath: 'assets/audio/alphabet-v2/28.mp3', audio: require('../assets/audio/alphabet-v2/28.mp3') },
  { id: 'ta_marbuta', index: 29, displayArabic: 'تاء مربوطة', audioText: 'تاء مربوطة', evalTarget: 'تاء مربوطة', transliteration: 'Ta Marbuta', english: 'Ta Marbuta', audioPath: 'assets/audio/alphabet-v2/29.mp3', audio: require('../assets/audio/alphabet-v2/29.mp3') },
  { id: 'hamza', index: 30, displayArabic: 'همزة', audioText: 'هَمْزَه', evalTarget: 'همزة', transliteration: 'Hamza', english: 'Hamza', audioPath: 'assets/audio/alphabet-v2/30.mp3', audio: require('../assets/audio/alphabet-v2/30.mp3') },
  { id: 'alif_maqsura', index: 31, displayArabic: 'ألف مقصورة', audioText: 'أَلِف مَقْصُورَه', evalTarget: 'ألف مقصورة', transliteration: 'Alif Maqsura', english: 'Alif Maqsura', audioPath: 'assets/audio/alphabet-v2/31.mp3', audio: require('../assets/audio/alphabet-v2/31.mp3') },
];
