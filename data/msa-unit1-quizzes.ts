import type { QuizQuestion } from './quiz-types';

type Choice = { arabic: string; transliteration: string; isCorrect: boolean };
type Target = { id: string; arabic: string; transliteration: string; english: string };
type Randomizer = () => number;

const targets: Target[] = [
  ['hello','مرحباً','marhaban','Hello'], ['please','من فضلك','min faḍlik','Please'], ['thanks','شكراً','shukran','Thank you'], ['water','ماء','maaʾ','Water'], ['coffee','قهوة','qahwa','Coffee'], ['book','كتاب','kitaab','Book'], ['large','كبير','kabiir','Large'], ['five','خمسة','khamsa','Five'], ['here','هنا','hunaa','Here'], ['ten_dirhams','عشرة دراهم','ʿashara daraahim','Ten dirhams'], ['total_ten','المجموع عشرة دراهم','al-majmuuʿ ʿashara daraahim','The total is ten dirhams'], ['want_water','أريد ماء','uriidu maaʾ','I want water'], ['want_coffee_please','أريد قهوة، من فضلك','uriidu qahwa, min faḍlik','I want coffee, please'], ['how_much','كم السعر؟','kam al-siʿr?','How much is it?'], ['where_hotel','أين الفندق؟','ayna al-funduq?','Where is the hotel?'], ['your_name','ما اسمك؟','maa ismuk?','What is your name?'], ['my_name_yusuf','اسمي يوسف','ismii Yuusuf','My name is Yusuf'], ['from','أنا من...','anaa min...','I am from...'], ['live_dubai','أعيش في دبي','aʿiishu fii Dubai','I live in Dubai'], ['dont_understand','لا أفهم','laa afham','I do not understand'], ['fine','أنا بخير','anaa bikhayr','I am fine'], ['tired','أنا متعب','anaa mutʿab','I am tired'], ['hungry','أنا جائع','anaa jaaʾiʿ','I am hungry'], ['small_coffee','قهوة صغيرة','qahwa saghiira','Small coffee'], ['yes_water_too','نعم، ماء أيضاً','naʿam, maaʾ ayḍan','Yes, water too'], ['goodbye','إلى اللقاء','ilaa al-liqaaʾ','Goodbye'], ['nice_day','يوم سعيد','yawm saʿiid','Have a nice day'], ['live_here','أعيش هنا','aʿiishu hunaa','I live here'], ['far_here','بعيد من هنا','baʿiid min hunaa','Far from here'], ['repeat_please','أعد، من فضلك','aʿid, min faḍlik','Repeat, please'],
].map(([id, arabic, transliteration, english]) => ({ id, arabic, transliteration, english }));

const byId = new Map(targets.map(target => [target.id, target]));
const byArabic = new Map(targets.map(target => [target.arabic, target]));
const target = (id: string) => {
  const value = byId.get(id);
  if (!value) throw new Error(`Missing MSA Unit 1 target: ${id}`);
  return value;
};

export function createSeededQuizRandomizer(seed: string): Randomizer {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(values: readonly T[], random: Randomizer) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function choices(correctId: string, distractorIds: [string, string, string]): Choice[] {
  return [correctId, ...distractorIds].map(id => {
    const value = target(id);
    return { arabic: value.arabic, transliteration: value.transliteration, isCorrect: id === correctId };
  });
}

export function shuffleMultipleChoiceOptions(questions: readonly QuizQuestion[], random: Randomizer): QuizQuestion[] {
  let previousPosition = -1;
  let streak = 0;
  return questions.map(question => {
    if (!('options' in question)) return question;
    const unique = new Map(question.options.map(option => ['arabic' in option ? option.arabic : JSON.stringify(option), option]));
    if (unique.size !== question.options.length || question.options.filter(option => option.isCorrect).length !== 1) {
      throw new Error(`Invalid choices for ${question.id}`);
    }
    const correct = question.options.find(option => option.isCorrect)!;
    const wrong = shuffled(question.options.filter(option => !option.isCorrect), random);
    let correctPosition = Math.floor(random() * question.options.length);
    if (correctPosition === previousPosition && streak >= 2) {
      correctPosition = (correctPosition + 1 + Math.floor(random() * (question.options.length - 1))) % question.options.length;
    }
    streak = correctPosition === previousPosition ? streak + 1 : 1;
    previousPosition = correctPosition;
    const options = [...wrong];
    options.splice(correctPosition, 0, correct);
    return { ...question, options } as QuizQuestion;
  });
}

function reviewQuestion(value: Target, index: number): QuizQuestion {
  const pool = targets.filter(candidate => candidate.id !== value.id && candidate.arabic !== value.arabic);
  const distractors = [pool[(index + 5) % pool.length], pool[(index + 11) % pool.length], pool[(index + 17) % pool.length]] as const;
  const options = choices(value.id, [distractors[0].id, distractors[1].id, distractors[2].id]);
  if (index % 3 === 0) return { id: `mission:en-ar:msa:unit-1:big_review:recall:${value.id}`, format: 'arabic_select', scenarioSource: 'big_review', xpValue: 10, english: value.english, options: options.map(({ arabic, isCorrect }) => ({ arabic, isCorrect })) };
  return { id: `mission:en-ar:msa:unit-1:big_review:usage:${value.id}`, format: 'fill_conversation', scenarioSource: 'big_review', xpValue: 10, dialogue: [{ speaker: 'npc', arabic: value.english, transliteration: '', isBlank: false }, { speaker: 'yusuf', arabic: value.arabic, transliteration: value.transliteration, isBlank: true }], options };
}

export const MSA_BIG_REVIEW_TARGETS = ['مرحباً','شكراً','ماء','قهوة','كتاب','كبير','خمسة','هنا','من فضلك','لا أفهم','أريد ماء','كم السعر؟','أين الفندق؟','أنا من...','أنا بخير','يوم سعيد','أنا جائع','أنا متعب','ما اسمك؟','أعيش هنا','قهوة صغيرة','عشرة دراهم','بعيد من هنا','إلى اللقاء'] as const;

const reviewBase = MSA_BIG_REVIEW_TARGETS.map((arabic, index) => {
  const value = byArabic.get(arabic);
  if (!value) throw new Error(`Missing review target: ${arabic}`);
  return reviewQuestion(value, index);
});

type ChallengeCategory = NonNullable<QuizQuestion['category']>;
function situation(id: string, category: ChallengeCategory, prompt: string, correctId: string, distractors: [string,string,string]): QuizQuestion {
  const correct = target(correctId);
  return { id: `mission:en-ar:msa:unit-1:first_arabic_challenge:${category}:${id}`, category, hideTransliterationBeforeAnswer: true, format: 'fill_conversation', scenarioSource: 'first_arabic_challenge', xpValue: 10, dialogue: [{ speaker: 'npc', arabic: prompt, transliteration: '', isBlank: false }, { speaker: 'yusuf', arabic: correct.arabic, transliteration: correct.transliteration, isBlank: true }], options: choices(correctId, distractors) };
}
function translation(id: string, english: string, correctId: string, distractors: [string,string,string]): QuizQuestion {
  return { id: `mission:en-ar:msa:unit-1:first_arabic_challenge:translation:${id}`, category: 'translation', hideTransliterationBeforeAnswer: true, format: 'arabic_select', scenarioSource: 'first_arabic_challenge', xpValue: 10, english, options: choices(correctId, distractors).map(({ arabic, isCorrect }) => ({ arabic, isCorrect })) };
}
function arrangement(id: string, prompt: string, correctTokens: string[], tokens: string[], transliteration: string): QuizQuestion {
  return { id: `mission:en-ar:msa:unit-1:first_arabic_challenge:phrase_arrangement:${id}`, category: 'phrase_arrangement', hideTransliterationBeforeAnswer: true, format: 'phrase_arrangement', scenarioSource: 'first_arabic_challenge', xpValue: 10, prompt, correctTokens, tokens, transliteration };
}

const challengeBase: QuizQuestion[] = [
  situation('order_coffee','mini_situation','A server asks: ماذا تريد؟','want_coffee_please',['want_water','small_coffee','thanks']),
  situation('give_name','mini_situation','Someone asks: ما اسمك؟','my_name_yusuf',['from','live_here','fine']),
  situation('do_not_understand','mini_situation','You do not understand what was said.','dont_understand',['repeat_please','fine','goodbye']),
  situation('ask_hotel','mini_situation','You need to find the hotel.','where_hotel',['how_much','live_here','far_here']),
  situation('reply_how','best_reply','كيف الحال؟','fine',['tired','hungry','goodbye']),
  situation('reply_water','best_reply','هل تريد ماء؟','yes_water_too',['want_water','thanks','small_coffee']),
  situation('reply_name','best_reply','ما اسمك؟','my_name_yusuf',['from','live_dubai','hello']),
  situation('reply_goodbye','best_reply','إلى اللقاء','goodbye',['nice_day','thanks','hello']),
  arrangement('fine','Arrange: I am fine',['أنا','بخير'],['بخير','أنا'],'anaa bikhayr'),
  arrangement('live_here','Arrange: I live here',['أعيش','هنا'],['هنا','أعيش'],'aʿiishu hunaa'),
  arrangement('want_water','Arrange: I want water',['أريد','ماء'],['ماء','أريد'],'uriidu maaʾ'),
  arrangement('small_coffee','Arrange: small coffee',['قهوة','صغيرة'],['صغيرة','قهوة'],'qahwa saghiira'),
  translation('total_ten','The total is ten dirhams','total_ten',['ten_dirhams','how_much','five']),
  translation('from','I am from...','from',['live_here','my_name_yusuf','fine']),
  translation('tired','I am tired','tired',['hungry','fine','live_here']),
  translation('repeat','Repeat, please','repeat_please',['please','dont_understand','thanks']),
  situation('cafe_size','mixed_situation','At a café, you want a small coffee.','small_coffee',['want_water','large','coffee']),
  situation('price','mixed_situation','You want to ask the price.','how_much',['ten_dirhams','where_hotel','five']),
  situation('introduction','mixed_situation','You begin saying where you come from.','from',['my_name_yusuf','live_here','hello']),
  situation('feeling','mixed_situation','You want to say that you are tired.','tired',['fine','hungry','nice_day']),
];

export function buildMsaBigReviewQuestions(seed = 'big-review-default') {
  const random = createSeededQuizRandomizer(seed);
  return shuffleMultipleChoiceOptions(shuffled(reviewBase, random), random);
}
export function buildMsaFirstArabicChallengeQuestions(seed = 'first-arabic-challenge-default') {
  const random = createSeededQuizRandomizer(seed);
  return shuffleMultipleChoiceOptions(shuffled(challengeBase, random), random);
}

export const MSA_BIG_REVIEW_QUESTIONS = buildMsaBigReviewQuestions();
export const MSA_FIRST_ARABIC_CHALLENGE_QUESTIONS = buildMsaFirstArabicChallengeQuestions();
