import type { DialectMissionContent, MissionLessonRound, MissionLessonWord } from './curriculum/types';
import type { Unit1MissionDefinition } from './curriculum/unit1';
import type { DialogueTurn } from './gulf-dialogues';
import { GULF_BIG_REVIEW_QUESTIONS, GULF_FIRST_ARABIC_CHALLENGE_QUESTIONS } from './gulf-unit1-quizzes';

type Entry = readonly [arabic: string, transliteration: string, english: string];
type RoundSpec = readonly [roundId: string, title: string, entries: readonly Entry[]];

function makeRounds(missionId: string, specs: readonly RoundSpec[]): MissionLessonRound[] {
  return specs.map(([roundId, title, entries]) => ({ roundId, title, words: entries.map(([arabic, transliteration, english], index): MissionLessonWord => ({ conceptId: `${missionId}_${roundId}_${index + 1}`, arabic, displayArabic: arabic, evalTarget: arabic, transliteration, english, context: title })) }));
}
function lesson(missionId: string, title: string, completionMessage: string, specs: readonly RoundSpec[]) {
  const lessonRounds = makeRounds(missionId, specs);
  const definition: Unit1MissionDefinition = { missionId, missionKind: 'lesson', title, subtitle: `${lessonRounds.flatMap(round => round.words).length} Gulf Arabic essentials`, route: { screen: 'lesson', params: { type: missionId } }, homeHref: `/lesson?type=${missionId}` };
  const mission: DialectMissionContent = { missionId, missionKind: 'lesson', lessonRounds, lessonWords: lessonRounds.flatMap(round => round.words), completionMessage, audioMode: 'none', pronunciationEnabled: true, reviewable: false };
  return { definition, mission };
}

const first = lesson('first_arabic_words', 'Your First Gulf Arabic Words 👋', 'You already know 20 Gulf Arabic words.', [
  ['greetings_answers','Greetings and answers',[['سلام','salaam','Hello / peace'],['هلا','hala','Hi'],['هيه','heh','Yes'],['لا','laa','No'],['يلا','yalla','Let’s go'],['خلاص','khalaas','Done / enough'],['عادي','ʿaadi','It’s okay / normal'],['زين','zain','Good']]],
  ['amount_time','Amount and time',[['وايد','waayid','Very / a lot'],['شوي','shway','A little'],['الحين','ilhiin','Now'],['عقب','ʿugub','Later / after'],['هني','hni','Here']]],
  ['places_questions','Places, questions, and essentials',[['هناك','hnaak','There'],['وين','wein','Where'],['شو','shuu','What'],['ماي','maay','Water'],['قهوة','gahwa','Coffee'],['بيت','bait','House / home'],['سيارة','sayyaara','Car']]],
]);
const polite = lesson('polite_like_a_local','Be Polite Like a Local 😊','You can greet people politely in Gulf Arabic.',[
  ['greetings','Greetings',[['السلام عليكم','assalaamu ʿalaykum','Peace be upon you'],['وعليكم السلام','wa ʿalaykum assalaam','And upon you be peace'],['هلا والله','hala wallah','A warm hello'],['مرحبا الساع','marhaba assaaʿ','Welcome / hello'],['صباح الخير','sabaah ilkhair','Good morning'],['صباح النور','sabaah innuur','Morning response'],['مسا الخير','masa ilkhair','Good evening'],['مسا النور','masa innuur','Evening response']]],
  ['courtesy','Courtesy',[['لو سمحت','law samaht','Please / excuse me'],['مشكور','mashkuur','Thank you'],['العفو','ilʿafu','You’re welcome'],['تسلم','tislam','Thanks / bless you'],['الله يسلمك','allaah yisallmak','May God keep you safe'],['اسمح لي','ismah li','Excuse me'],['آسف','aasif','Sorry'],['ما عليه','maa ʿaleih','No worries']]],
  ['friendly_responses','Friendly responses',[['ما في مشكلة','maa fii mushkila','No problem'],['تفضل','tfaḍḍal','Please / here you go'],['حياك الله','hayyaak allaah','Welcome'],['الله يحييك','allaah yihayyiik','Welcome response'],['يعطيك العافية','yaʿtiik ilʿaafya','May God give you strength'],['الله يعافيك','allaah yʿaafiik','Response to the above'],['إن شاء الله','in shaa allaah','God willing'],['مع السلامة','maʿassalaama','Goodbye']]],
]);
const people = lesson('people_around_you','People Around You','You can identify the people around you.',[
  ['family_people','Family and people',[['ريال','rayyaal','Man'],['حرمة','harma','Woman'],['ولد','walad','Boy / son'],['بنت','bint','Girl / daughter'],['طفل','ṭifl','Child'],['يهال','yihaal','Children'],['أم','umm','Mother'],['أب','ab','Father']]],
  ['relationships','Relationships',[['أخ','akh','Brother'],['أخت','ukht','Sister'],['زوج','zoj','Husband'],['زوجة','zoja','Wife'],['أهل','ahal','Family'],['ربيع','rabiiʿ','Male friend'],['ربيعة','rabiiʿa','Female friend'],['جار','jaar','Neighbour']]],
  ['roles','Everyday roles',[['ضيف','dhaif','Guest'],['مدير','mudiir','Manager'],['موظف','muwaẓẓaf','Employee'],['دكتور','duktoor','Doctor'],['ممرض','mumarriḍ','Nurse'],['مدرس','mudarris','Teacher'],['سايق','saayig','Driver'],['شرطي','shurṭi','Police officer']]],
]);
const objects = lesson('everyday_objects','Everyday Objects','You can name everyday things around you.',[
  ['personal_items','Personal items',[['تلفون','tilifoon','Phone'],['مفتاح','miftaah','Key'],['شنطة','shanṭa','Bag'],['محفظة','mahfaẓa','Wallet'],['بطاقة','biṭaaga','Card'],['فلوس','fluus','Money'],['شاحن','shaahin','Charger'],['ساعة','saaʿa','Watch / clock']]],
  ['room_objects','Room objects',[['كتاب','kitaab','Book'],['قلم','galam','Pen'],['طاولة','ṭaawla','Table'],['كرسي','kursi','Chair'],['باب','baab','Door'],['دريشة','dariisha','Window'],['مكيف','mukayyif','Air conditioner'],['نظارة','naẓẓaara','Glasses']]],
  ['places_things','Places and things',[['سيارة','sayyaara','Car'],['تاكسي','taaksi','Taxi'],['بيت','bait','House / home'],['غرفة','ghurfa','Room'],['حمام','hammaam','Bathroom'],['مطبخ','maṭbakh','Kitchen'],['ملابس','malaabis','Clothes'],['جوتي','juuti','Shoes']]],
]);
const food = lesson('food_and_drinks','Food & Drinks','You can order basic food and drinks in Gulf Arabic.',[
  ['basics','Food and drink basics',[['ماي','maay','Water'],['قهوة','gahwa','Coffee'],['شاي','shaay','Tea'],['حليب','haliib','Milk'],['عصير','ʿasiir','Juice'],['خبز','khubuz','Bread'],['بيض','baidh','Eggs'],['جبن','jibin','Cheese']]],
  ['meals','Meals',[['ريوق','riyoog','Breakfast'],['غدا','ghada','Lunch'],['عشا','ʿasha','Dinner'],['عيش','ʿeish','Rice'],['لحم','laham','Meat'],['دياي','diyaay','Chicken'],['سمج','simach','Fish'],['سلطة','salaṭa','Salad']]],
  ['ordering','Ordering',[['أنا يوعان','ana yawʿaan','I am hungry'],['أنا عطشان','ana ʿaṭshaan','I am thirsty'],['أبغي ماي','abghi maay','I want water'],['أبغي قهوة','abghi gahwa','I want coffee'],['بدون سكر','bidoon sukkar','Without sugar'],['شوي حار','shway haar','A little hot'],['الأكل وايد حلو','il-akil waayid hilw','The food is very tasty'],['الحساب لو سمحت','il-hisaab law samaht','The bill, please']]],
]);
const describe = lesson('describe_the_world','Describe Things Around You','You can describe everyday things in Gulf Arabic.',[
  ['size_quality','Size and quality',[['كبير','kibiir','Big'],['صغير','sghiir','Small'],['طويل','ṭawiil','Long / tall'],['قصير','gasiir','Short'],['زين','zain','Good / nice'],['شين','shein','Bad / ugly'],['يديد','yidiid','New'],['قديم','gadiim','Old']]],
  ['condition','Condition',[['حار','haar','Hot'],['بارد','baarid','Cold'],['نظيف','nathiif','Clean'],['وصخ','wasikh','Dirty'],['مفتوح','maftuuh','Open'],['مسكر','msakkar','Closed'],['فاضي','faadhi','Empty / available'],['مليان','malyaan','Full']]],
  ['comparison','Comparison',[['غالي','ghaali','Expensive'],['رخيص','rkhiis','Cheap'],['قريب','gariib','Near'],['بعيد','baʿiid','Far'],['سريع','sariiʿ','Fast'],['بطيء','baṭii','Slow'],['سهل','sahal','Easy'],['صعب','saʿab','Difficult']]],
]);
const numbers = lesson('numbers_and_money','Numbers & Money','You can understand basic numbers and prices.',[
  ['one_eight','One to eight',[['واحد','waahid','One'],['اثنين','ithnain','Two'],['ثلاثة','thalaatha','Three'],['أربعة','arbaʿa','Four'],['خمسة','khamsa','Five'],['ستة','sitta','Six'],['سبعة','sabʿa','Seven'],['ثمانية','thamaanya','Eight']]],
  ['money','Numbers and money',[['تسعة','tisʿa','Nine'],['عشرة','ʿashara','Ten'],['عشرين','ʿishriin','Twenty'],['خمسين','khamsiin','Fifty'],['مية','miyya','One hundred'],['درهم','dirham','Dirham'],['فلوس','fluus','Money'],['كاش','kaash','Cash']]],
  ['prices','Prices',[['بكم هذا؟','bkam haadha?','How much is this?'],['كم الحساب؟','kam il-hisaab?','How much is the bill?'],['عشرة دراهم','ʿashara daraahim','Ten dirhams'],['خمسين درهم','khamsiin dirham','Fifty dirhams'],['عندك فكة؟','ʿindak fakka?','Do you have change?'],['بطاقة ولا كاش؟','biṭaaga walla kaash?','Card or cash?'],['غالي وايد','ghaali waayid','Very expensive'],['السعر زين','is-siʿr zain','The price is good']]],
]);
const where = lesson('where_here_there','Where, Here & There','You can understand simple Gulf Arabic directions.',[
  ['directions','Directions',[['يمين','yamiin','Right'],['يسار','yisaar','Left'],['سيده','seeda','Straight'],['داخل','daakhil','Inside'],['برع','barra','Outside'],['فوق','foog','Above / upstairs'],['تحت','taht','Below / downstairs'],['جدام','jidaam','In front']]],
  ['places','Position and roads',[['ورا','wara','Behind'],['قريب','gariib','Near'],['بعيد','baʿiid','Far'],['هني','hni','Here'],['هناك','hnaak','There'],['الطريق','iṭ-ṭariig','The road / way'],['إشارة','ishaara','Traffic light / sign'],['دوار','dawwaar','Roundabout']]],
  ['asking','Ask and follow directions',[['وين الحمام؟','wein il-hammaam?','Where is the bathroom?'],['وين الفندق؟','wein il-fundug?','Where is the hotel?'],['روح سيده','ruuh seeda','Go straight'],['لف يمين','lif yamiin','Turn right'],['لف يسار','lif yisaar','Turn left'],['وقف هني','waggif hni','Stop here'],['قريب من هني','gariib min hni','Near here'],['بعيد عن هني','baʿiid ʿan hni','Far from here']]],
]);
const introduce = lesson('introduce_yourself','Introduce Yourself','You can introduce yourself in Gulf Arabic.',[
  ['identity','Introduce yourself',[['أنا','ana','I / me'],['اسمي','ismii','My name is'],['اسمي يوسف','ismii Yuusuf','My name is Yusuf'],['شو اسمك؟','shuu ismak?','What is your name?'],['إنت من وين؟','inta min wein?','Where are you from?'],['أنا من...','ana min...','I am from...'],['ساكن في دبي','saakin fii Dubai','I live in Dubai'],['حياك الله','hayyaak allaah','Welcome']]],
  ['meeting','Meet people',[['أشتغل هني','ashtaghil hni','I work here'],['أنا يديد هني','ana yidiid hni','I am new here'],['هذا ربيعي','haadha rabiiʿi','This is my male friend'],['هذي ربيعتي','haadhi rabiiʿti','This is my female friend'],['نحن مع بعض','nihna maʿ baʿadh','We are together'],['تشرفنا','tsharrafna','Nice to meet you'],['وين ساكن؟','wein saakin?','Where do you live?'],['ساكن هني','saakin hni','I live here']]],
  ['language_help','Language help',[['أتكلم إنجليزي','atakallam ingliizi','I speak English'],['أتكلم عربي','atakallam ʿarabi','I speak Arabic'],['شوي بس','shway bas','Only a little'],['ما فهمت','maa fahamt','I did not understand'],['فهمت؟','fahamt?','Did you understand?'],['عيد، لو سمحت','ʿiid, law samaht','Repeat, please'],['تكلم شوي شوي','takallam shway shway','Speak slowly'],['وأنا بعد','wa ana baʿad','Me too']]],
]);
const feelings = lesson('how_are_you','How Are You?','You can describe how you feel in Gulf Arabic.',[
  ['check_in','Check in',[['شحالك؟','shhaalak?','How are you?'],['بخير الحمد لله','bikhair, alhamdulillaah','I am fine, thank God'],['زين','zain','Good'],['تمام','tamaam','Fine / great'],['وايد زين','waayid zain','Very good'],['مب بطال','mub baṭṭaal','Not bad'],['الحمد لله','alhamdulillaah','Thank God'],['وإنت؟','w inta?','And you?']]],
  ['feelings','Feelings',[['مستانس','mistaanis','Happy'],['زعلان','zaʿlaan','Upset / sad'],['تعبان','taʿbaan','Tired'],['مريض','mariiḍ','Sick'],['يوعان','yawʿaan','Hungry'],['عطشان','ʿaṭshaan','Thirsty'],['مشغول','mashghuul','Busy'],['جاهز','jaahiz','Ready']]],
  ['describe_feelings','Describe feelings',[['أنا تعبان','ana taʿbaan','I am tired'],['أنا يوعان','ana yawʿaan','I am hungry'],['إنت بخير؟','inta bikhair?','Are you okay?'],['مب بخير','mub bikhair','I am not okay'],['شو فيك؟','shuu fiik?','What is wrong?'],['ما فيني شي','maa fiini shay','Nothing is wrong with me'],['الحين أحسن','ilhiin ahsan','Better now'],['سلامتك','salaamtak','Get well / hope you are okay']]],
]);

export const GULF_FIRST_CAFE_DIALOGUE: DialogueTurn[] = [
  ['waiter','هلا، تفضل','hala, tfaḍḍal','Hello, please'],['user','هلا','hala','Hello'],['waiter','شو تبا؟','shuu tbaa?','What would you like?'],['user','أبغي قهوة، لو سمحت','abghi gahwa, law samaht','I want coffee, please'],['waiter','صغيرة ولا كبيرة؟','sghiira walla kabiira?','Small or large?'],['user','صغيرة، لو سمحت','sghiira, law samaht','Small, please'],['waiter','تبا ماي؟','tbaa maay?','Would you like water?'],['user','هيه، ماي بعد','heh, maay baʿad','Yes, water too'],['waiter','شي ثاني؟','shay thaani?','Anything else?'],['user','لا، مشكور','laa, mashkuur','No, thank you'],['waiter','الحساب عشرة دراهم','il-hisaab ʿashara daraahim','The bill is ten dirhams'],['user','تفضل','tfaḍḍal','Here you go'],['waiter','مشكور، مع السلامة','mashkuur, maʿassalaama','Thank you, goodbye'],['user','مع السلامة','maʿassalaama','Goodbye'],
].map(([type, arabic, transliteration, english]) => ({ type: type as 'waiter' | 'user', arabic, displayArabic: arabic, transliteration, english }));

export const GULF_UNIT1_DEFINITIONS: readonly Unit1MissionDefinition[] = [
  first.definition, polite.definition, people.definition, objects.definition, food.definition, describe.definition, numbers.definition, where.definition, introduce.definition, feelings.definition,
  { missionId:'big_review', missionKind:'review', title:'Big Review', subtitle:'24 questions', route:{ screen:'quiz-unit2', params:{ unit:'u1-review' } }, homeHref:'/quiz-unit2?unit=u1-review' },
  { missionId:'first_cafe_conversation', missionKind:'guided_dialogue', title:'Your First Gulf Café Conversation', subtitle:'14 turns', route:{ screen:'scenario', params:{ type:'first_cafe_conversation' } }, homeHref:'/scenario?type=first_cafe_conversation', sceneImageKey:'Cafe' },
  { missionId:'first_arabic_challenge', missionKind:'challenge', title:'Your First Gulf Arabic Challenge', subtitle:'Pass 16 of 20', route:{ screen:'quiz-unit2', params:{ unit:'u1-challenge' } }, homeHref:'/quiz-unit2?unit=u1-challenge' },
];
export const GULF_UNIT1_MISSIONS: readonly DialectMissionContent[] = [
  first.mission, polite.mission, people.mission, objects.mission, food.mission, describe.mission, numbers.mission, where.mission, introduce.mission, feelings.mission,
  { missionId:'big_review', missionKind:'review', quizQuestions:GULF_BIG_REVIEW_QUESTIONS, completionMessage:'You remembered the Gulf Arabic essentials.', audioMode:'none', reviewable:false },
  { missionId:'first_cafe_conversation', missionKind:'guided_dialogue', dialogue:GULF_FIRST_CAFE_DIALOGUE, completionMessage:'You completed your first Gulf Arabic conversation.', audioMode:'none', reviewable:false },
  { missionId:'first_arabic_challenge', missionKind:'challenge', quizQuestions:GULF_FIRST_ARABIC_CHALLENGE_QUESTIONS, passingScore:16, completionMessage:'Unit 1 complete. You are ready for your first Gulf Arabic conversations.', audioMode:'none', reviewable:false },
];
