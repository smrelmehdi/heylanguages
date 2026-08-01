import type { DialectMissionContent, MissionLessonRound, MissionLessonWord } from './curriculum/types';
import type { Unit1MissionDefinition } from './curriculum/unit1';
import type { DialogueTurn } from './gulf-dialogues';
import { EGYPTIAN_BIG_REVIEW_QUESTIONS, EGYPTIAN_FIRST_ARABIC_CHALLENGE_QUESTIONS } from './egyptian-unit1-quizzes';

type Entry = readonly [arabic: string, transliteration: string, english: string];
type RoundSpec = readonly [roundId: string, title: string, entries: readonly Entry[]];

function makeRounds(missionId: string, specs: readonly RoundSpec[]): MissionLessonRound[] {
  return specs.map(([roundId, title, entries]) => ({ roundId, title, words: entries.map(([arabic, transliteration, english], index): MissionLessonWord => ({ conceptId: `${missionId}_${roundId}_${index + 1}`, arabic, displayArabic: arabic, evalTarget: arabic, transliteration, english, context: title })) }));
}
function lesson(missionId: string, title: string, completionMessage: string, specs: readonly RoundSpec[]) {
  const lessonRounds = makeRounds(missionId, specs);
  const definition: Unit1MissionDefinition = { missionId, missionKind: 'lesson', title, subtitle: `${lessonRounds.flatMap(round => round.words).length} Egyptian Arabic essentials`, route: { screen: 'lesson', params: { type: missionId } }, homeHref: `/lesson?type=${missionId}` };
  const mission: DialectMissionContent = { missionId, missionKind: 'lesson', lessonRounds, lessonWords: lessonRounds.flatMap(round => round.words), completionMessage, audioMode: 'none', pronunciationEnabled: true, reviewable: false };
  return { definition, mission };
}

const first = lesson('first_arabic_words', 'Your First Egyptian Arabic Words 👋', 'You already know 20 Egyptian Arabic words.', [
  ['first_words', 'First words', [['سلام','salaam','Hello / peace'],['أهلاً','ahlan','Hello'],['أيوه','aywa','Yes'],['لأ','laʾ','No'],['يلا','yalla','Let’s go'],['خلاص','khalaas','Done / enough'],['عادي','ʿaadi','It’s okay / normal'],['كويس','kwayyis','Good']]],
  ['amount_time', 'Amount and time', [['قوي','ʾawi','Very'],['شوية','shwayya','A little'],['دلوقتي','dilwaʾti','Now'],['بعدين','baʿdein','Later'],['هنا','hina','Here']]],
  ['essentials', 'Questions and essentials', [['هناك','hinaak','There'],['فين','fein','Where'],['إيه','eih','What'],['مية','mayya','Water'],['قهوة','ahwa','Coffee'],['بيت','beit','House / home'],['عربية','ʿarabiyya','Car']]],
]);
const polite = lesson('polite_like_a_local', 'Be Polite Like a Local 😊', 'You can greet people politely in Egyptian Arabic.', [
  ['greetings','Greetings',[['السلام عليكم','issalaamu ʿaleikum','Peace be upon you'],['وعليكم السلام','wa ʿaleikum issalaam','And upon you be peace'],['أهلاً','ahlan','Hello'],['أهلاً وسهلاً','ahlan wa sahlan','Welcome'],['صباح الخير','sabaah il-kheir','Good morning'],['صباح النور','sabaah in-nuur','Morning response'],['مساء الخير','masa il-kheir','Good evening'],['مساء النور','masa in-nuur','Evening response']]],
  ['courtesy','Courtesy',[['لو سمحت','law samaht','Please / excuse me'],['بعد إذنك','baʿd iznak','Excuse me'],['شكراً','shukran','Thank you'],['متشكر','mitshakkir','Thank you'],['العفو','il-ʿafw','You’re welcome'],['آسف','aasif','Sorry'],['معلش','maʿleish','Sorry / never mind'],['ولا يهمك','wala yihimmak','No worries']]],
  ['friendly','Friendly responses',[['مفيش مشكلة','mafiish mushkila','No problem'],['اتفضل','itfaḍḍal','Please / here you go'],['نورت','nawwart','Welcome'],['ربنا يخليك','rabbina yikhalliik','Thank you / may God keep you'],['تسلم','tislam','Thanks'],['إن شاء الله','in shaa allaah','God willing'],['سلامتك','salaamtak','Hope you are okay'],['مع السلامة','maʿ issalaama','Goodbye']]],
]);
const people = lesson('people_around_you', 'People Around You', 'You can identify the people around you.', [
  ['family','Family and people',[['راجل','raagil','Man'],['ست','sitt','Woman'],['ولد','walad','Boy / son'],['بنت','bint','Girl / daughter'],['طفل','tifl','Child'],['أطفال','atfaal','Children'],['أم','umm','Mother'],['أب','ab','Father']]],
  ['relationships','Relationships',[['أخ','akh','Brother'],['أخت','ukht','Sister'],['جوز','gooz','Husband'],['مرات','maraat','Wife'],['أهل','ahl','Family'],['صاحبي','saahbi','My male friend'],['صاحبتي','saahbiti','My female friend'],['جار','gaar','Neighbour']]],
  ['roles','Everyday roles',[['ضيف','deif','Guest'],['مدير','mudiir','Manager'],['موظف','muwazzaf','Employee'],['دكتور','duktoor','Doctor'],['ممرض','mumarrid','Nurse'],['مدرس','mudarris','Teacher'],['سواق','sawwaaʾ','Driver'],['ظابط','zaabit','Police officer']]],
]);
const objects = lesson('everyday_objects', 'Everyday Objects', 'You can name everyday things around you.', [
  ['personal','Personal items',[['موبايل','mobaayl','Phone'],['مفتاح','miftaah','Key'],['شنطة','shanta','Bag'],['محفظة','mahfaza','Wallet'],['كارت','kaart','Card'],['فلوس','fluus','Money'],['شاحن','shaahin','Charger'],['ساعة','saaʿa','Watch / clock']]],
  ['room','Room objects',[['كتاب','kitaab','Book'],['قلم','ʾalam','Pen'],['ترابيزة','taraabeeza','Table'],['كرسي','kursi','Chair'],['باب','baab','Door'],['شباك','shibbaak','Window'],['تكييف','takyiif','Air conditioner'],['نضارة','nadḍaara','Glasses']]],
  ['places','Places and things',[['عربية','ʿarabiyya','Car'],['تاكسي','taaksi','Taxi'],['بيت','beit','House / home'],['أوضة','ooḍa','Room'],['حمام','hammaam','Bathroom'],['مطبخ','matbakh','Kitchen'],['هدوم','hduum','Clothes'],['جزمة','gizma','Shoes']]],
]);
const food = lesson('food_and_drinks', 'Food & Drinks', 'You can order basic food and drinks in Egyptian Arabic.', [
  ['basics','Food and drink basics',[['مية','mayya','Water'],['قهوة','ahwa','Coffee'],['شاي','shaay','Tea'],['لبن','laban','Milk'],['عصير','ʿasiir','Juice'],['عيش','ʿeish','Bread'],['بيض','beed','Eggs'],['جبنة','gibna','Cheese']]],
  ['meals','Meals',[['فطار','fiṭaar','Breakfast'],['غدا','ghada','Lunch'],['عشا','ʿasha','Dinner'],['رز','rozz','Rice'],['لحمة','lahma','Meat'],['فراخ','faraakh','Chicken'],['سمك','samak','Fish'],['سلطة','salaṭa','Salad']]],
  ['ordering','Ordering',[['أنا جعان','ana gaʿaan','I am hungry'],['أنا عطشان','ana ʿaṭshaan','I am thirsty'],['عايز مية','ʿaayiz mayya','I want water'],['عايز قهوة','ʿaayiz ahwa','I want coffee'],['من غير سكر','min gheir sukkar','Without sugar'],['سخنة شوية','sokhna shwayya','A little hot'],['الأكل حلو قوي','il-akl hilw ʾawi','The food is very tasty'],['الحساب لو سمحت','il-hisaab law samaht','The bill, please']]],
]);
const describe = lesson('describe_the_world', 'Describe Things Around You', 'You can describe everyday things in Egyptian Arabic.', [
  ['size','Size and quality',[['كبير','kibiir','Big'],['صغير','soghayyar','Small'],['طويل','ṭawiil','Long / tall'],['قصير','ʾusayyar','Short'],['كويس','kwayyis','Good / nice'],['وحش','wihish','Bad / ugly'],['جديد','gidiid','New'],['قديم','ʾadiim','Old']]],
  ['condition','Condition',[['سخن','sokhn','Hot'],['ساقع','saaʾiʿ','Cold'],['نضيف','naḍiif','Clean'],['وسخ','wisikh','Dirty'],['مفتوح','maftuuh','Open'],['مقفول','maʾfuul','Closed'],['فاضي','faaḍi','Empty / available'],['مليان','malyaan','Full']]],
  ['comparison','Comparison',[['غالي','ghaali','Expensive'],['رخيص','rikhiis','Cheap'],['قريب','ʾariib','Near'],['بعيد','baʿiid','Far'],['سريع','sariiʿ','Fast'],['بطيء','baṭiiʾ','Slow'],['سهل','sahl','Easy'],['صعب','saʿb','Difficult']]],
]);
const numbers = lesson('numbers_and_money', 'Numbers & Money', 'You can understand basic Egyptian numbers and prices.', [
  ['one_eight','One to eight',[['واحد','waahid','One'],['اتنين','itnein','Two'],['تلاتة','talaata','Three'],['أربعة','arbaʿa','Four'],['خمسة','khamsa','Five'],['ستة','sitta','Six'],['سبعة','sabʿa','Seven'],['تمانية','tamaanya','Eight']]],
  ['money','Numbers and money',[['تسعة','tisʿa','Nine'],['عشرة','ʿashara','Ten'],['عشرين','ʿishriin','Twenty'],['خمسين','khamsiin','Fifty'],['مية','miyya','One hundred'],['جنيه','gineih','Egyptian pound'],['فلوس','fluus','Money'],['كاش','kaash','Cash']]],
  ['prices','Prices',[['بكام ده؟','bikam da?','How much is this?'],['الحساب كام؟','il-hisaab kaam?','How much is the bill?'],['عشرة جنيه','ʿashara gineih','Ten pounds'],['خمسين جنيه','khamsiin gineih','Fifty pounds'],['معاك فكة؟','maʿaak fakka?','Do you have change?'],['كارت ولا كاش؟','kaart walla kaash?','Card or cash?'],['غالي قوي','ghaali ʾawi','Very expensive'],['السعر كويس','is-siʿr kwayyis','The price is good']]],
]);
const where = lesson('where_here_there', 'Where, Here & There', 'You can understand simple Egyptian directions.', [
  ['directions','Directions',[['يمين','yimiin','Right'],['شمال','shimaal','Left'],['على طول','ʿala ṭuul','Straight ahead'],['جوه','gowwa','Inside'],['بره','barra','Outside'],['فوق','fooʾ','Above / upstairs'],['تحت','taht','Below / downstairs'],['قدام','ʾuddaam','In front']]],
  ['position','Position and roads',[['ورا','wara','Behind'],['قريب','ʾariib','Near'],['بعيد','baʿiid','Far'],['هنا','hina','Here'],['هناك','hinaak','There'],['جنب','gamb','Beside / next to'],['شارع','shaariʿ','Street'],['إشارة','ishaara','Traffic light / sign']]],
  ['asking','Ask and follow directions',[['فين الحمام؟','fein il-hammaam?','Where is the bathroom?'],['فين الفندق؟','fein il-funduʾ?','Where is the hotel?'],['امشي على طول','imshi ʿala ṭuul','Go straight'],['لف يمين','lif yimiin','Turn right'],['لف شمال','lif shimaal','Turn left'],['وقف هنا','waʾʾaf hina','Stop here'],['قريب من هنا','ʾariib min hina','Near here'],['بعيد من هنا','baʿiid min hina','Far from here']]],
]);
const introduce = lesson('introduce_yourself', 'Introduce Yourself', 'You can introduce yourself in Egyptian Arabic.', [
  ['identity','Introduce yourself',[['أنا','ana','I / me'],['اسمي','ismii','My name is'],['اسمي يوسف','ismii Yuusuf','My name is Yusuf'],['اسمك إيه؟','ismak eih?','What is your name?'],['إنت منين؟','inta minein?','Where are you from?'],['أنا من...','ana min...','I am from...'],['أنا ساكن في دبي','ana saakin fi Dubai','I live in Dubai'],['أهلاً بيك','ahlan biik','Welcome']]],
  ['meeting','Meet people',[['بشتغل هنا','bashtaghal hina','I work here'],['أنا جديد هنا','ana gidiid hina','I am new here'],['ده صاحبي','da saahbi','This is my male friend'],['دي صاحبتي','di saahbiti','This is my female friend'],['إحنا مع بعض','ihna maʿ baʿd','We are together'],['اتشرفت بيك','itsharraft biik','Nice to meet you'],['إنت ساكن فين؟','inta saakin fein?','Where do you live?'],['أنا ساكن هنا','ana saakin hina','I live here']]],
  ['language','Language help',[['بتكلم إنجليزي','batkallim ingliizi','I speak English'],['بتكلم عربي','batkallim ʿarabi','I speak Arabic'],['شوية بس','shwayya bas','Only a little'],['مش فاهم','mish faahim','I do not understand'],['فاهم؟','faahim?','Do you understand?'],['قول تاني، لو سمحت','ʾuul taani, law samaht','Say it again, please'],['اتكلم براحة، لو سمحت','itkallim biraaha, law samaht','Speak slowly, please'],['وأنا كمان','w ana kamaan','Me too']]],
]);
const feelings = lesson('how_are_you', 'How Are You?', 'You can describe how you feel in Egyptian Arabic.', [
  ['check_in','Check in',[['إزيك؟','izzayyak?','How are you?'],['أنا كويس الحمد لله','ana kwayyis, ilhamdulillaah','I am fine, thank God'],['كويس','kwayyis','Good'],['تمام','tamaam','Fine / great'],['كويس قوي','kwayyis ʾawi','Very good'],['مش بطال','mish baṭṭaal','Not bad'],['الحمد لله','ilhamdulillaah','Thank God'],['وإنت؟','w inta?','And you?']]],
  ['feelings','Feelings',[['مبسوط','mabsuuṭ','Happy'],['زعلان','zaʿlaan','Upset / sad'],['تعبان','taʿbaan','Tired'],['عيان','ʿayyaan','Sick'],['جعان','gaʿaan','Hungry'],['عطشان','ʿaṭshaan','Thirsty'],['مشغول','mashghuul','Busy'],['جاهز','gaahiz','Ready']]],
  ['describe','Describe feelings',[['أنا تعبان','ana taʿbaan','I am tired'],['أنا جعان','ana gaʿaan','I am hungry'],['إنت كويس؟','inta kwayyis?','Are you okay?'],['مش كويس','mish kwayyis','I am not okay'],['مالك؟','maalak?','What is wrong?'],['مفيش حاجة','mafiish haaga','Nothing is wrong'],['دلوقتي أحسن','dilwaʾti ahsan','Better now'],['سلامتك','salaamtak','Hope you are okay']]],
]);

export const EGYPTIAN_FIRST_CAFE_DIALOGUE: DialogueTurn[] = [
  ['waiter','أهلاً، اتفضل','ahlan, itfaḍḍal','Hello, please'],['user','أهلاً','ahlan','Hello'],['waiter','تحب تشرب إيه؟','tihibb tishrab eih?','What would you like to drink?'],['user','عايز قهوة، لو سمحت','ʿaayiz ahwa, law samaht','I want coffee, please'],['waiter','صغيرة ولا كبيرة؟','soghayyara walla kabiira?','Small or large?'],['user','صغيرة، لو سمحت','soghayyara, law samaht','Small, please'],['waiter','تحب مية كمان؟','tihibb mayya kamaan?','Would you like water too?'],['user','أيوه، مية كمان','aywa, mayya kamaan','Yes, water too'],['waiter','حاجة تانية؟','haaga taanya?','Anything else?'],['user','لأ، شكراً','laʾ, shukran','No, thank you'],['waiter','الحساب عشرة جنيه','il-hisaab ʿashara gineih','The bill is ten pounds'],['user','اتفضل','itfaḍḍal','Here you go'],['waiter','شكراً، مع السلامة','shukran, maʿ issalaama','Thank you, goodbye'],['user','مع السلامة','maʿ issalaama','Goodbye'],
].map(([type, arabic, transliteration, english]) => ({ type: type as 'waiter' | 'user', arabic, displayArabic: arabic, transliteration, english }));

export const EGYPTIAN_UNIT1_DEFINITIONS: readonly Unit1MissionDefinition[] = [
  first.definition, polite.definition, people.definition, objects.definition, food.definition, describe.definition, numbers.definition, where.definition, introduce.definition, feelings.definition,
  { missionId:'big_review', missionKind:'review', title:'Big Review', subtitle:'24 questions', route:{ screen:'quiz-unit2', params:{ unit:'u1-review' } }, homeHref:'/quiz-unit2?unit=u1-review' },
  { missionId:'first_cafe_conversation', missionKind:'guided_dialogue', title:'Your First Egyptian Café Conversation', subtitle:'14 turns', route:{ screen:'scenario', params:{ type:'first_cafe_conversation' } }, homeHref:'/scenario?type=first_cafe_conversation', sceneImageKey:'Cafe' },
  { missionId:'first_arabic_challenge', missionKind:'challenge', title:'Your First Egyptian Arabic Challenge', subtitle:'Pass 16 of 20', route:{ screen:'quiz-unit2', params:{ unit:'u1-challenge' } }, homeHref:'/quiz-unit2?unit=u1-challenge' },
];
export const EGYPTIAN_UNIT1_MISSIONS: readonly DialectMissionContent[] = [
  first.mission, polite.mission, people.mission, objects.mission, food.mission, describe.mission, numbers.mission, where.mission, introduce.mission, feelings.mission,
  { missionId:'big_review', missionKind:'review', quizQuestions:EGYPTIAN_BIG_REVIEW_QUESTIONS, completionMessage:'You remembered the Egyptian Arabic essentials.', audioMode:'none', reviewable:false },
  { missionId:'first_cafe_conversation', missionKind:'guided_dialogue', dialogue:EGYPTIAN_FIRST_CAFE_DIALOGUE, completionMessage:'You completed your first Egyptian Arabic conversation.', audioMode:'none', reviewable:false },
  { missionId:'first_arabic_challenge', missionKind:'challenge', quizQuestions:EGYPTIAN_FIRST_ARABIC_CHALLENGE_QUESTIONS, passingScore:16, completionMessage:'Unit 1 complete. You are ready for your first Egyptian Arabic conversations.', audioMode:'none', reviewable:false },
];
