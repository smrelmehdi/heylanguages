import type { QuizQuestion } from './quiz-types';
import { createSeededQuizRandomizer, shuffleMultipleChoiceOptions, shuffled } from './msa-unit1-quizzes';

const rows = [
  ['bedroom','غرفة النوم','ghurfat in-noom','Bedroom'], ['kitchen','المطبخ','il-matbakh','Kitchen'], ['wardrobe','الكبت','il-kabat','Wardrobe'],
  ['my_phone','تلفوني','tilifooni','My phone'], ['my_bag','شنطتي','shanṭati','My bag'], ['phone_table','التلفون على الطاولة','it-tilifoon ʿala it-taawla','The phone is on the table'],
  ['keys_bag','المفاتيح داخل الشنطة','il-mafaatiiḥ daakhil ish-shanṭa','The keys are inside the bag'], ['shoes_chair','جزمتك تحت الكرسي','jizmatak taḥt il-kursi','Your shoes are under the chair'],
  ['open_door','افتح الباب','iftaḥ il-baab','Open the door'], ['put_key','حط المفتاح هني','ḥuṭṭ il-miftaah hini','Put the key here'], ['help_please','ساعدني لو سمحت','saaʿidni law samaḥt','Help me, please'],
  ['all_ready','كل شي جاهز','kil shay jaahiz','Everything is ready'], ['one_missing','شي واحد ناقص','shay waahid naagis','One thing is missing'], ['wallet_missing','مب لاقي محفظتي','mub laagi maḥfadhati','I cannot find my wallet'],
  ['found_key','لقيت المفتاح','lageit il-miftaah','I found the key'], ['wait_here','انطرني هني','intirni hini','Wait for me here'], ['white_shirt','أبغي القميص الأبيض','abghi il-gamiis il-abyadh','I want the white shirt'],
  ['dislike_jacket','ما أحب هالجاكيت','ma ahibb hal-jaakit','I do not like this jacket'], ['better','هذا أحسن','haadha ahsan','This is better'], ['are_ready','جاهز؟','jaahiz?','Are you ready?'],
  ['return_evening','برد المغرب','baridd il-maghrib','I will return in the evening'], ['leave_now','بطلع الحين','batlaʿ il-hiin','I am leaving now'], ['then_shirt','بعدين ألبس قميصي','baʿdein albas gamiisi','Then I put on my shirt'],
  ['finally_leave','آخر شي أطلع من البيت','aakhir shay atlaʿ min il-beit','Finally, I leave the house'], ['where_phone','وين تلفوني؟','wein tilifooni?','Where is my phone?'],
  ['not_ready','مب جاهز للحين','mub jaahiz lil-hiin','I am not ready yet'], ['yes_ready','هيه، جاهز','heih, jaahiz','Yes, I am ready'], ['inside_bag','داخل الشنطة','daakhil ish-shanta','Inside the bag'],
  ['heavy_jacket','هالجاكيت ثقيل','hal-jaakit thagiil','This jacket is heavy'], ['dislike_shirt','ما أحب هالقميص','ma ahibb hal-gamiis','I do not like this shirt'], ['wear_it','بلبسه','balbasa','I will wear it'], ['leave_house','أطلع من البيت','atlaʿ min il-beit','I leave the house'],
] as const;
type Target = { id: string; arabic: string; transliteration: string; english: string };
const targets: Target[] = rows.map(([id, arabic, transliteration, english]) => ({ id, arabic, transliteration, english }));
const byId = new Map(targets.map(value => [value.id, value]));
const get = (id: string) => { const value = byId.get(id); if (!value) throw new Error(`Missing Gulf Unit 2 target: ${id}`); return value; };
const options = (correctId: string) => { const correct = get(correctId); const wrong = targets.filter(value => value.id !== correctId && value.arabic !== correct.arabic).slice(0,3); return [correct,...wrong].map(value => ({ arabic:value.arabic, transliteration:value.transliteration, isCorrect:value.id === correctId })); };
const question = (mission:string, category:NonNullable<QuizQuestion['category']>, id:string, prompt:string, correctId:string, hide=false):QuizQuestion => { const correct=get(correctId); return { id:`mission:en-ar:gulf:unit-2:${mission}:${category}:${id}`, category, hideTransliterationBeforeAnswer:hide, format:'fill_conversation', scenarioSource:mission, xpValue:10, dialogue:[{speaker:'npc',arabic:prompt,transliteration:'',isBlank:false},{speaker:'yusuf',arabic:correct.arabic,transliteration:correct.transliteration,isBlank:true}], options:options(correctId) }; };
const meaningQuestion = (id:string, correctId:string, wrong:[string,string,string]):QuizQuestion => { const correct=get(correctId); return { id:`mission:en-ar:gulf:unit-2:first_short_sentence_challenge:translation:${id}`, category:'translation', hideTransliterationBeforeAnswer:true, format:'meaning_select', scenarioSource:'first_short_sentence_challenge', xpValue:10, arabic:correct.arabic, transliteration:correct.transliteration, options:[correct.english,...wrong].map(meaning=>({meaning,isCorrect:meaning===correct.english})) }; };
const reviewIds=['bedroom','kitchen','wardrobe','my_phone','my_bag','phone_table','keys_bag','shoes_chair','open_door','put_key','help_please','all_ready','one_missing','wallet_missing','found_key','wait_here','white_shirt','dislike_jacket','better','are_ready','return_evening','leave_now','then_shirt','finally_leave'];
const reviewBase=reviewIds.map(id=>question('big_review','translation',id,get(id).english,id));
const challengeBase:QuizQuestion[]=[
  question('first_short_sentence_challenge','mini_situation','where_phone','You ask where your phone is.','where_phone',true),
  question('first_short_sentence_challenge','mini_situation','keys_inside','You say the keys are inside the bag.','keys_bag',true),
  question('first_short_sentence_challenge','mini_situation','not_ready','You are not ready yet.','not_ready',true),
  question('first_short_sentence_challenge','mini_situation','wait','You ask someone to wait for you.','wait_here',true),
  question('first_short_sentence_challenge','best_reply','ready','جاهز؟','yes_ready',true),
  question('first_short_sentence_challenge','best_reply','keys','وين مفاتيحك؟','inside_bag',true),
  question('first_short_sentence_challenge','best_reply','shirt','أي قميص تبغي؟','white_shirt',true),
  question('first_short_sentence_challenge','best_reply','return','متى بترد؟','return_evening',true),
  {id:'mission:en-ar:gulf:unit-2:first_short_sentence_challenge:phrase_arrangement:phone_table',category:'phrase_arrangement',hideTransliterationBeforeAnswer:true,format:'phrase_arrangement',scenarioSource:'first_short_sentence_challenge',xpValue:10,prompt:'Arrange: The phone is on the table',correctTokens:['التلفون','على','الطاولة'],tokens:['على','الطاولة','التلفون'],transliteration:'it-tilifoon ʿala it-taawla'},
  {id:'mission:en-ar:gulf:unit-2:first_short_sentence_challenge:phrase_arrangement:white_shirt',category:'phrase_arrangement',hideTransliterationBeforeAnswer:true,format:'phrase_arrangement',scenarioSource:'first_short_sentence_challenge',xpValue:10,prompt:'Arrange: I want the white shirt',correctTokens:['أبغي','القميص','الأبيض'],tokens:['الأبيض','أبغي','القميص'],transliteration:'abghi il-gamiis il-abyadh'},
  {id:'mission:en-ar:gulf:unit-2:first_short_sentence_challenge:phrase_arrangement:all_ready',category:'phrase_arrangement',hideTransliterationBeforeAnswer:true,format:'phrase_arrangement',scenarioSource:'first_short_sentence_challenge',xpValue:10,prompt:'Arrange: Everything is ready',correctTokens:['كل','شي','جاهز'],tokens:['جاهز','كل','شي'],transliteration:'kil shay jaahiz'},
  {id:'mission:en-ar:gulf:unit-2:first_short_sentence_challenge:phrase_arrangement:leave_house',category:'phrase_arrangement',hideTransliterationBeforeAnswer:true,format:'phrase_arrangement',scenarioSource:'first_short_sentence_challenge',xpValue:10,prompt:'Arrange: I leave the house',correctTokens:['أطلع','من','البيت'],tokens:['البيت','أطلع','من'],transliteration:'atlaʿ min il-beit'},
  question('first_short_sentence_challenge','translation','put_key','Put the key here.','put_key',true),
  meaningQuestion('heavy_jacket','heavy_jacket',['This jacket is light','This shirt is heavy','This jacket is clean']),
  question('first_short_sentence_challenge','translation','one_missing','One thing is missing.','one_missing',true),
  meaningQuestion('dislike_shirt','dislike_shirt',['I like this shirt','I do not like this jacket','I want this shirt']),
  question('first_short_sentence_challenge','mixed_situation','wallet','You cannot find your wallet.','wallet_missing',true),
  question('first_short_sentence_challenge','mixed_situation','help','You ask someone to help you.','help_please',true),
  question('first_short_sentence_challenge','mixed_situation','wear','You decide to wear it.','wear_it',true),
  question('first_short_sentence_challenge','mixed_situation','leave','You say you are leaving now.','leave_now',true),
];
export function buildGulfUnit2BigReviewQuestions(seed='gulf-unit2-review-default'){const random=createSeededQuizRandomizer(seed);return shuffleMultipleChoiceOptions(shuffled(reviewBase,random),random);}
export function buildGulfUnit2ChallengeQuestions(seed='gulf-unit2-challenge-default'){const random=createSeededQuizRandomizer(seed);return shuffleMultipleChoiceOptions(shuffled(challengeBase,random),random);}
export const GULF_UNIT2_BIG_REVIEW_QUESTIONS=buildGulfUnit2BigReviewQuestions();
export const GULF_UNIT2_CHALLENGE_QUESTIONS=buildGulfUnit2ChallengeQuestions();
