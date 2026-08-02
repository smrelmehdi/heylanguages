import type { QuizQuestion } from './quiz-types';
import { createSeededQuizRandomizer, shuffleMultipleChoiceOptions, shuffled } from './msa-unit1-quizzes';

type Target = { id: string; arabic: string; transliteration: string; english: string };
const targetRows: readonly (readonly [string, string, string, string])[] = [
  ['bedroom','غرفة النوم','ghurfat an-nawm','Bedroom'], ['kitchen','المطبخ','al-matbakh','Kitchen'], ['wardrobe','الخزانة','al-khizaana','Wardrobe'],
  ['my_phone','هاتفي','haatifii','My phone'], ['my_bag','حقيبتي','haqiibatii','My bag'], ['phone_table','الهاتف على الطاولة','al-haatif ʿalaa at-taawila','The phone is on the table'],
  ['keys_bag','المفاتيح داخل الحقيبة','al-mafaatiih daakhil al-haqiiba','The keys are inside the bag'], ['shoes_chair','الحذاء تحت الكرسي','al-hidhaaʾ tahta al-kursii','The shoes are under the chair'],
  ['open_door','افتح الباب','iftah al-baab','Open the door'], ['put_key','ضع المفتاح هنا','daʿ al-miftaah hunaa','Put the key here'], ['help_please','ساعدني من فضلك','saaʿidnii min fadlik','Help me, please'],
  ['all_ready','كل شيء جاهز','kullu shayʾ jaahiz','Everything is ready'], ['one_missing','شيء واحد ناقص','shayʾ waahid naaqis','One thing is missing'], ['wallet_missing','لا أجد محفظتي','laa ajidu mahfazatii','I cannot find my wallet'],
  ['found_key','وجدت المفتاح','wajadtu al-miftaah','I found the key'], ['wait_here','انتظرني هنا','intazirnii hunaa','Wait for me here'], ['white_shirt','أريد القميص الأبيض','uriidu al-qamiis al-abyad','I want the white shirt'],
  ['dislike_jacket','لا أحب هذه السترة','laa uhibbu haadhihi as-sitra','I do not like this jacket'], ['better','هذا أفضل','haadhaa afdal','This is better'], ['are_ready','هل أنت جاهز؟','hal anta jaahiz?','Are you ready?'],
  ['return_evening','سأعود في المساء','saʾaʿuudu fii al-masaaʾ','I will return in the evening'], ['leave_now','سأخرج الآن','saʾakhruju al-aan','I will leave now'], ['then_shirt','ثم أرتدي قميصي','thumma artadii qamiisii','Then I put on my shirt'],
  ['finally_leave','أخيراً أخرج من البيت','akhiiran akhruju min al-bayt','Finally, I leave the house'], ['where_phone','أين هاتفي؟','ayna haatifii?','Where is my phone?'],
  ['not_ready','لست جاهزاً بعد','lastu jaahizan baʿd','I am not ready yet'], ['yes_ready','نعم، أنا جاهز','naʿam, ana jaahiz','Yes, I am ready'], ['inside_bag','داخل الحقيبة','daakhil al-haqiiba','Inside the bag'],
  ['which_shirt','أي قميص تريد؟','ayyu qamiis turiid?','Which shirt do you want?'], ['when_return','متى ستعود؟','mataa sataʿuud?','When will you return?'], ['heavy_jacket','هذه السترة ثقيلة','haadhihi as-sitra thaqiila','This jacket is heavy'],
  ['dislike_shirt','لا أحب هذا القميص','laa uhibbu haadhaa al-qamiis','I do not like this shirt'], ['wear_it','سأرتديه','saʾartadiihi','I will wear it'],
];
const targets = targetRows.map(([id, arabic, transliteration, english]) => ({ id, arabic, transliteration, english }));
const byId = new Map(targets.map(value => [value.id, value]));
const get = (id: string) => { const value = byId.get(id); if (!value) throw new Error(`Missing MSA Unit 2 target: ${id}`); return value; };
const choiceOptions = (correctId: string) => {
  const correct = get(correctId);
  const wrong = targets.filter(value => value.id !== correctId && value.arabic !== correct.arabic).slice(0, 3);
  return [correct, ...wrong].map(value => ({ arabic: value.arabic, transliteration: value.transliteration, isCorrect: value.id === correctId }));
};
const question = (mission: string, category: NonNullable<QuizQuestion['category']>, id: string, prompt: string, correctId: string, hide = false): QuizQuestion => {
  const correct = get(correctId);
  return { id: `mission:en-ar:msa:unit-2:${mission}:${category}:${id}`, category, hideTransliterationBeforeAnswer: hide, format: 'fill_conversation', scenarioSource: mission, xpValue: 10, dialogue: [{ speaker: 'npc', arabic: prompt, transliteration: '', isBlank: false }, { speaker: 'yusuf', arabic: correct.arabic, transliteration: correct.transliteration, isBlank: true }], options: choiceOptions(correctId) };
};
const meaningQuestion = (id: string, correctId: string, meanings: [string, string, string]): QuizQuestion => {
  const correct = get(correctId);
  return { id: `mission:en-ar:msa:unit-2:first_short_sentence_challenge:translation:${id}`, category: 'translation', hideTransliterationBeforeAnswer: true, format: 'meaning_select', scenarioSource: 'first_short_sentence_challenge', xpValue: 10, arabic: correct.arabic, transliteration: correct.transliteration, options: [correct.english, ...meanings].map(meaning => ({ meaning, isCorrect: meaning === correct.english })) };
};
const reviewIds = ['bedroom','kitchen','wardrobe','my_phone','my_bag','phone_table','keys_bag','shoes_chair','open_door','put_key','help_please','all_ready','one_missing','wallet_missing','found_key','wait_here','white_shirt','dislike_jacket','better','are_ready','return_evening','leave_now','then_shirt','finally_leave'];
const reviewBase = reviewIds.map(id => question('big_review', 'translation', id, get(id).english, id));

const challengeBase: QuizQuestion[] = [
  question('first_short_sentence_challenge','mini_situation','where_phone','You ask where your phone is.','where_phone',true),
  question('first_short_sentence_challenge','mini_situation','keys_inside','You say the keys are inside the bag.','keys_bag',true),
  question('first_short_sentence_challenge','mini_situation','not_ready','You are not ready yet.','not_ready',true),
  question('first_short_sentence_challenge','mini_situation','wait','You ask someone to wait for you.','wait_here',true),
  question('first_short_sentence_challenge','best_reply','ready_reply','هل أنت جاهز؟','yes_ready',true),
  question('first_short_sentence_challenge','best_reply','keys_reply','أين مفاتيحك؟','inside_bag',true),
  question('first_short_sentence_challenge','best_reply','shirt_reply','أي قميص تريد؟','white_shirt',true),
  question('first_short_sentence_challenge','best_reply','return_reply','متى ستعود؟','return_evening',true),
  { id:'mission:en-ar:msa:unit-2:first_short_sentence_challenge:phrase_arrangement:phone_table', category:'phrase_arrangement', hideTransliterationBeforeAnswer:true, format:'phrase_arrangement', scenarioSource:'first_short_sentence_challenge', xpValue:10, prompt:'Arrange: The phone is on the table', correctTokens:['الهاتف','على','الطاولة'], tokens:['على','الطاولة','الهاتف'], transliteration:'al-haatif ʿalaa at-taawila' },
  { id:'mission:en-ar:msa:unit-2:first_short_sentence_challenge:phrase_arrangement:white_shirt', category:'phrase_arrangement', hideTransliterationBeforeAnswer:true, format:'phrase_arrangement', scenarioSource:'first_short_sentence_challenge', xpValue:10, prompt:'Arrange: I want the white shirt', correctTokens:['أريد','القميص','الأبيض'], tokens:['الأبيض','أريد','القميص'], transliteration:'uriidu al-qamiis al-abyad' },
  { id:'mission:en-ar:msa:unit-2:first_short_sentence_challenge:phrase_arrangement:all_ready', category:'phrase_arrangement', hideTransliterationBeforeAnswer:true, format:'phrase_arrangement', scenarioSource:'first_short_sentence_challenge', xpValue:10, prompt:'Arrange: Everything is ready', correctTokens:['كل','شيء','جاهز'], tokens:['جاهز','كل','شيء'], transliteration:'kullu shayʾ jaahiz' },
  { id:'mission:en-ar:msa:unit-2:first_short_sentence_challenge:phrase_arrangement:return_evening', category:'phrase_arrangement', hideTransliterationBeforeAnswer:true, format:'phrase_arrangement', scenarioSource:'first_short_sentence_challenge', xpValue:10, prompt:'Arrange: I will return in the evening', correctTokens:['سأعود','في','المساء'], tokens:['المساء','سأعود','في'], transliteration:'saʾaʿuudu fii al-masaaʾ' },
  question('first_short_sentence_challenge','translation','put_key','Put the key here.','put_key',true),
  meaningQuestion('heavy_jacket','heavy_jacket',['This jacket is light','This shirt is heavy','This jacket is clean']),
  question('first_short_sentence_challenge','translation','one_missing','One thing is missing.','one_missing',true),
  meaningQuestion('dislike_shirt','dislike_shirt',['I like this shirt','I do not like this jacket','I want this shirt']),
  question('first_short_sentence_challenge','mixed_situation','wallet','You cannot find your wallet.','wallet_missing',true),
  question('first_short_sentence_challenge','mixed_situation','help','You ask someone to help you.','help_please',true),
  question('first_short_sentence_challenge','mixed_situation','wear','You decide to wear it.','wear_it',true),
  question('first_short_sentence_challenge','mixed_situation','leave','You say you are leaving now.','leave_now',true),
];
export function buildMsaUnit2BigReviewQuestions(seed = 'msa-unit2-review-default') { const random = createSeededQuizRandomizer(seed); return shuffleMultipleChoiceOptions(shuffled(reviewBase, random), random); }
export function buildMsaUnit2ChallengeQuestions(seed = 'msa-unit2-challenge-default') { const random = createSeededQuizRandomizer(seed); return shuffleMultipleChoiceOptions(shuffled(challengeBase, random), random); }
export const MSA_UNIT2_BIG_REVIEW_QUESTIONS = buildMsaUnit2BigReviewQuestions();
export const MSA_UNIT2_CHALLENGE_QUESTIONS = buildMsaUnit2ChallengeQuestions();
