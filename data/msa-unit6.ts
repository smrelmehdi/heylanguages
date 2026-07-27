import { makeMsaScenario } from './msa-style';

export const MSA_UNIT6_SCENARIOS = [
  makeMsaScenario(6, 'advanced-cafe-order', 'MsaAdvancedCafe', 'Café Order', 'Customize an order and ask about options.', 'A café counter', 'Order a drink and confirm the total.', 'Cafe', [
    ['waiter','server','مرحباً، ماذا ترغب؟','marhaban, maadhaa targhab?','Hello, what would you like?'], ['user','customer','أريد قهوة بالحليب، من فضلك','uriidu qahwa bil-haliib, min fadlak','I would like coffee with milk, please'],
    ['waiter','server','هل تريدها ساخنة أم باردة؟','hal turiiduhaa saakhina am baarida?','Would you like it hot or cold?'], ['user','customer','ساخنة، ومن دون سكر','saakhina, wa min duuni sukkar','Hot, and without sugar'],
    ['waiter','server','هل ترغب في شيء آخر؟','hal targhabu fii shayin aakhar?','Would you like anything else?'], ['user','customer','نعم، قطعة كعك صغيرة','naam, qitatu kakin saghiira','Yes, a small piece of cake'],
    ['waiter','server','المجموع ثمانية دولارات',"al-majmuu' thamaaniya duulaaraat",'The total is eight dollars'], ['user','customer','تفضل، شكراً لك','tafaddal, shukran lak','Here you go, thank you'],
  ]),
  makeMsaScenario(6, 'advanced-restaurant-order', 'MsaAdvancedRestaurant', 'Restaurant Order', 'Ask about a dish and make a request.', 'A restaurant', 'Order a meal with a preference.', 'Restaurant', [
    ['waiter','server','هل أنت مستعد للطلب؟','hal anta mustaiddun lit-talab?','Are you ready to order?'], ['user','guest','ما طبق اليوم؟','maa tabaqu al-yawm?','What is today’s special?'],
    ['waiter','server','دجاج مشوي مع الأرز','dajaajun mashwiyyun maa al-aruzz','Grilled chicken with rice'], ['user','guest','هل الطبق حار؟','hal at-tabaqu haar?','Is the dish spicy?'],
    ['waiter','server','قليلاً، ويمكننا إعداده من دون فلفل',"qaliilan, wa yumkinunaa i'daaduhu min duuni filfil",'A little; we can prepare it without pepper'], ['user','guest','ممتاز، أريده من دون فلفل','mumtaaz, uriiduhu min duuni filfil','Excellent, I want it without pepper'],
    ['waiter','server','هل تفضل ماء أم عصيراً؟','hal tufaddilu maa\' am asiiran?','Would you prefer water or juice?'], ['user','guest','ماء فقط، شكراً',"maa' faqat, shukran",'Water only, thank you'],
  ]),
  makeMsaScenario(6, 'advanced-supermarket', 'MsaAdvancedSupermarket', 'At the Supermarket', 'Compare products and ask about availability.', 'A supermarket', 'Find products and compare prices.', 'Supermarket', [
    ['user','customer','عذراً، أين قسم الخضروات؟','udhran, ayna qismu al-khudrawaat?','Excuse me, where is the vegetable section?'], ['waiter','employee','في آخر الممر على اليسار','fii aakhiri al-mamarri alaa al-yasaar','At the end of the aisle on the left'],
    ['user','customer','هل لديكم حليب خالٍ من اللاكتوز؟','hal ladaykum haliibun khaalin mina al-laaktuuz?','Do you have lactose-free milk?'], ['waiter','employee','نعم، ستجده في الثلاجة الثانية','naam, satajiduhu fii ath-thallaaja ath-thaaniya','Yes, you will find it in the second fridge'],
    ['user','customer','أي نوع أقل سعراً؟','ayyu nawin aqallu siran?','Which type is less expensive?'], ['waiter','employee','هذه العلامة أرخص اليوم','haadhihi al-alaamatu arkhasu al-yawm','This brand is cheaper today'],
    ['user','customer','هل أستطيع الدفع بالبطاقة؟',"hal astatii'u ad-daf'a bil-bitaaqa?",'Can I pay by card?'], ['waiter','employee','نعم، عند جميع صناديق الدفع',"naam, 'inda jamii'i sanaadiiqi ad-daf'",'Yes, at all checkout counters'],
  ]),
  makeMsaScenario(6, 'advanced-taxi', 'MsaAdvancedTaxi', 'Taxi Ride', 'Explain a route and confirm arrival time.', 'Inside a taxi', 'Give route preferences and ask about timing.', 'Taxi', [
    ['waiter','driver','إلى أين تريد الذهاب؟','ilaa ayna turiidu adh-dhahaab?','Where would you like to go?'], ['user','passenger','إلى محطة القطار، من فضلك','ilaa mahattati al-qitaar, min fadlik','To the train station, please'],
    ['waiter','driver','الطريق الرئيسي مزدحم الآن','at-tariiqu ar-raisi muzdahimun al-aan','The main road is busy now'], ['user','passenger','هل يوجد طريق أسرع؟','hal yuujadu tariiqun asra?','Is there a faster route?'],
    ['waiter','driver','نعم، لكن الرسوم أعلى قليلاً',"na'am, laakinna ar-rusuum a'laa qaliilan",'Yes, but the toll is a little higher'], ['user','passenger','لا بأس، لدي قطار بعد نصف ساعة',"laa ba's, ladayya qitaar ba'd nisf saa'a",'That is fine; I have a train in half an hour'],
    ['waiter','driver','رغم الازدحام، سنصل خلال عشرين دقيقة','raghma al-izdihaam, sanasilu khilaala ishriin daqiiqa','Despite the traffic, we will arrive in twenty minutes'], ['user','passenger','جيد، أخبرني عندما نصل','jayyid, akhbirnii indamaa nasil','Good, tell me when we arrive'],
  ]),
  makeMsaScenario(6, 'advanced-directions', 'MsaAdvancedDirections', 'Asking for Directions', 'Follow multi-step directions.', 'A city street', 'Ask for and confirm detailed directions.', 'AskingForHelp', [
    ['user','traveller','هل يمكنك أن تدلني على المتحف؟','hal yumkinuka an tadullanii alaa al-mathaf?','Can you direct me to the museum?'], ['waiter','local','سر مستقيمًا حتى الإشارة','sir mustaqiiman hattaa al-ishaara','Go straight to the traffic light'],
    ['user','traveller','ثم أتجه يميناً؟','thumma attajihu yamiinan?','Then do I turn right?'], ['waiter','local','لا، انعطف يساراً بعد المصرف','laa, inatif yasaaran bada al-masrif','No, turn left after the bank'],
    ['user','traveller','هل المتحف بعيد من هناك؟','hal al-mathafu baiidun min hunaak?','Is the museum far from there?'], ['waiter','local','لا، ستراه أمام الحديقة','laa, sataraahu amaama al-hadiiqa','No, you will see it opposite the park'],
    ['user','traveller','هل أحتاج إلى عبور الشارع؟','hal ahtaaju ilaa ubuuri ash-shaari?','Do I need to cross the street?'], ['waiter','local','نعم، استخدم ممر المشاة','naam, istakhdim mamara al-mushaat','Yes, use the pedestrian crossing'],
  ]),
  makeMsaScenario(6, 'advanced-pharmacy', 'MsaAdvancedPharmacy', 'At the Pharmacy', 'Describe symptoms and understand dosage.', 'A pharmacy', 'Ask for medicine and confirm instructions.', 'Pharmacy', [
    ['waiter','pharmacist','كيف يمكنني مساعدتك؟',"kayfa yumkinunii musaa'adatuk?",'How can I help you?'], ['user','customer','لدي صداع منذ هذا الصباح',"ladayya sudaa'un mundhu haadhaa as-sabaah",'I have had a headache since this morning'],
    ['waiter','pharmacist','هل لديك حرارة أو أعراض أخرى؟',"hal ladayka haraaratun aw a'raadun ukhraa?",'Do you have a fever or other symptoms?'], ['user','customer','لا، لكنني أشعر بالتعب',"laa, lakinnanii ash'uru bit-ta'ab",'No, but I feel tired'],
    ['waiter','pharmacist','يمكنك تناول هذه الحبوب بعد الطعام','yumkinuka tanaawulu haadhihi al-hubuubi bada at-taam','You can take these pills after food'], ['user','customer','كم حبة آخذ؟','kam habbatan aakhudh?','How many pills should I take?'],
    ['waiter','pharmacist','حبة واحدة كل ثماني ساعات','habbatun waahidatun kulla thamaanii saaat','One pill every eight hours'], ['user','customer','شكراً، سأقرأ التعليمات أيضاً','shukran, saaqrau at-taliimaati aydan','Thank you, I will read the instructions too'],
  ]),
  makeMsaScenario(6, 'phone-repair', 'MsaPhoneRepair', 'Phone Repair Shop', 'Explain phone damage and arrange a repair.', 'A phone repair shop', 'Describe phone problems, confirm the cost and timing, protect personal data, and collect the repaired phone.', 'phone-repair-interior', [
    ['waiter','technician','مرحباً، كيف يمكنني مساعدتك؟','marhaban, kayfa yumkinunii musaa\'adatuk?','Hello, how can I help you?'],
    ['user','customer','سقط هاتفي، فانكسرت الشاشة وأصبحت البطارية ضعيفة','saqata haatifii, fa-inkasarat ash-shaasha wa asbahat al-battaariya da\'iifa','I dropped my phone, so the screen cracked and the battery became weak'],
    ['waiter','technician','دعني أفحصه أولاً','da\'nii afhassuhu awwalan','Let me inspect it first'],
    ['user','customer','هل يمكن إصلاحه؟','hal yumkinu islaahuhu?','Can it be repaired?'],
    ['waiter','technician','نعم، يمكن تغيير الشاشة والبطارية','na\'am, yumkinu taghyiiru ash-shaasha wal-battaariya','Yes, the screen and battery can be replaced'],
    ['user','customer','كم ستكلف عملية الإصلاح؟','kam satukallifu amaliyyatu al-islaah?','How much will the repair cost?'],
    ['waiter','technician','ستكلف مئتي درهم','satukallifu mi\'atay dirham','It will cost two hundred dirhams'],
    ['user','customer','وكم سيستغرق الإصلاح؟','wa kam sayastaghriqu al-islaah?','And how long will the repair take?'],
    ['waiter','technician','سيستغرق يومين','sayastaghriqu yawmayn','It will take two days'],
    ['user','customer','هل ستبقى صوري وبياناتي محفوظة؟','hal satabqaa suwarii wa bayaanaatii mahfuudha?','Will my photos and data remain preserved?'],
    ['waiter','technician','نعم، لن نحذف شيئاً. هل تريد أن نبدأ الإصلاح؟','na\'am, lan nahdhifa shay\'an. hal turiidu an nabda\'a al-islaah?','Yes, we will not delete anything. Would you like us to start the repair?'],
    ['user','customer','نعم، أصلحه من فضلك','na\'am, aslihhu min fadlak','Yes, repair it please','نعم، أَصْلِحْهُ من فضلك.', undefined, ['نعم، أصلحه من فضلك', 'لا، التكلفة مرتفعة. لن أصلحه الآن']],
    ['user','customer','عدت لاستلام هاتفي','udtu listilaami haatifii','I came back to collect my phone'],
    ['waiter','technician','تفضل، اختبره وتأكد من أن كل شيء يعمل','tafaddal, ikhtabirhu wa ta\'akkad min anna kulla shay\'in ya\'mal','Here you go. Test it and make sure everything works'],
  ], {
    entranceImageKey: 'phone-repair-entrance',
    vocabulary: [
      { displayArabic: 'الشاشة مكسورة', audioText: 'الشاشة مكسورة.', evalTarget: 'الشاشة مكسورة', transliteration: 'ash-shaasha maksuura', english: 'The screen is cracked' },
      { displayArabic: 'البطارية ضعيفة', audioText: 'البطارية ضعيفة.', evalTarget: 'البطارية ضعيفة', transliteration: 'al-battaariya da\'iifa', english: 'The battery is weak' },
      { displayArabic: 'إصلاح الهاتف', audioText: 'إصلاح الهاتف.', evalTarget: 'إصلاح الهاتف', transliteration: 'islaah al-haatif', english: 'Phone repair' },
      { displayArabic: 'هل يمكن إصلاحه؟', audioText: 'هل يمكن إصلاحه؟', evalTarget: 'هل يمكن إصلاحه؟', transliteration: 'hal yumkinu islaahuhu?', english: 'Can it be repaired?' },
      { displayArabic: 'كم ستكلف عملية الإصلاح؟', audioText: 'كم ستكلف عملية الإصلاح؟', evalTarget: 'كم ستكلف عملية الإصلاح؟', transliteration: 'kam satukallifu amaliyyatu al-islaah?', english: 'How much will the repair cost?' },
      { displayArabic: 'كم سيستغرق الإصلاح؟', audioText: 'كم سيستغرق الإصلاح؟', evalTarget: 'كم سيستغرق الإصلاح؟', transliteration: 'kam sayastaghriqu al-islaah?', english: 'How long will the repair take?' },
      { displayArabic: 'الصور والبيانات', audioText: 'الصور والبيانات.', evalTarget: 'الصور والبيانات', transliteration: 'as-suwar wal-bayaanaat', english: 'Photos and data' },
      { displayArabic: 'نعم، أصلحه من فضلك', audioText: 'نعم، أصلحه من فضلك.', evalTarget: 'نعم، أصلحه من فضلك', transliteration: 'na\'am, aslihhu min fadlak', english: 'Yes, repair it please' },
      { displayArabic: 'لا، التكلفة مرتفعة', audioText: 'لا، التكلفة مرتفعة.', evalTarget: 'لا، التكلفة مرتفعة', transliteration: 'laa, at-taklifa murtafi\'a', english: 'No, the cost is too high' },
      { displayArabic: 'استلام الهاتف', audioText: 'استلام الهاتف.', evalTarget: 'استلام الهاتف', transliteration: 'istilaam al-haatif', english: 'Collecting the phone' },
      { displayArabic: 'اختبر الهاتف', audioText: 'اختبر الهاتف.', evalTarget: 'اختبر الهاتف', transliteration: 'ikhtabir al-haatif', english: 'Test the phone' },
    ],
  }),
  makeMsaScenario(6, 'advanced-hotel', 'MsaAdvancedHotel', 'Hotel Check-in', 'Confirm a booking and request services.', 'A hotel reception', 'Check in and ask about facilities.', 'Hotel', [
    ['waiter','receptionist','مرحباً، هل لديك حجز؟','marhaban, hal ladayka hajz?','Hello, do you have a reservation?'], ['user','guest','نعم، الحجز باسم يوسف علي','naam, al-hajzu bismi yuusuf alii','Yes, the reservation is under Yusuf Ali'],
    ['waiter','receptionist','حجزك لثلاث ليالٍ مع الإفطار','hajzuka lithalaathi layaalin maa al-iftaar','Your booking is for three nights with breakfast'], ['user','guest','صحيح، هل الغرفة هادئة؟','sahiih, hal al-ghurfatu haadia?','Correct. Is the room quiet?'],
    ['waiter','receptionist','نعم، وهي في الطابق السادس',"na'am, wa hiya fii at-taabiq as-saadis",'Yes, and it is on the sixth floor'], ['user','guest','هل الإنترنت مجاني، وأين المصعد؟',"hal al-internet majjaanii, wa ayna al-mis'ad?",'Is the internet free, and where is the elevator?'],
    ['waiter','receptionist','نعم. كلمة المرور على البطاقة، والمصعد على اليمين',"na'am. kalimat al-muruur 'alaa al-bitaaqa, wal-mis'ad 'alaa al-yamiin",'Yes. The password is on the card, and the elevator is on the right'], ['user','guest','شكراً لك','shukran lak','Thank you'],
  ]),
  makeMsaScenario(6, 'advanced-airport', 'MsaAdvancedAirport', 'At the Airport', 'Handle check-in and baggage questions.', 'An airport check-in desk', 'Check in and find the gate.', 'Airport', [
    ['waiter','agent','إلى أين تسافر اليوم؟','ilaa ayna tusaafiru al-yawm?','Where are you travelling today?'], ['user','traveller','أسافر إلى عمّان','usaafiru ilaa ammaan','I am travelling to Amman'],
    ['waiter','agent','هل لديك حقيبة للشحن؟','hal ladayka haqiibatun lish-shahn?','Do you have a bag to check?'], ['user','traveller','نعم، وهذه حقيبة يد','naam, wa haadhihi haqiibatu yad','Yes, and this is hand luggage'],
    ['waiter','agent','الحقيبة أثقل من الوزن المسموح','al-haqiiba athqal min al-wazn al-masmuh','The bag is heavier than the allowed weight'], ['user','traveller','كم يجب أن أدفع، ومتى يبدأ الصعود؟',"kam yajibu an adfa', wa mataa yabda' as-su'uud?",'How much must I pay, and when does boarding begin?'],
    ['waiter','agent','عشرون دولاراً. يبدأ الصعود في التاسعة عند البوابة رقم تسعة',"'ishruun duulaar. yabda' as-su'uud fii at-taasi'a 'inda al-bawwaaba raqam tis'a",'Twenty dollars. Boarding begins at nine at gate number nine'], ['user','traveller','شكراً، سأذهب إلى البوابة الآن','shukran, sa-adhhabu ilaa al-bawwaaba al-aan','Thank you, I will go to the gate now'],
  ]),
  makeMsaScenario(6, 'advanced-phone-call', 'MsaAdvancedPhone', 'Phone Conversation', 'Ask for someone and leave a message.', 'A phone call', 'Handle a short professional call.', 'PhoneCall', [
    ['waiter','receiver','مرحباً، شركة النور','marhaban, sharikat an-nuur','Hello, Al Noor Company'], ['user','caller','مرحباً، هل يمكنني التحدث مع السيد سامر؟','marhaban, hal yumkinunii at-tahadduth ma\'a as-sayyid saamir?','Hello, may I speak with Mr Samer?'],
    ['waiter','receiver','إنه في اجتماع الآن','innahu fii ijtimaain al-aan','He is in a meeting now'], ['user','caller','متى سيكون متاحاً؟','mataa sayakuunu mutaahan?','When will he be available?'],
    ['waiter','receiver','بعد الساعة الثانية','bada as-saaati ath-thaaniya','After two o’clock'], ['user','caller','هل يمكنك أن تترك له رسالة؟','hal yumkinuka an tatruka lahu risaala?','Can you leave him a message?'],
    ['waiter','receiver','بالطبع، ما الرسالة؟',"bit-tab', maa ar-risaala?",'Of course, what is the message?'], ['user','caller','اطلب منه أن يتصل بي، من فضلك','utlub minhu an yattasila bii, min fadlak','Ask him to call me, please'],
  ]),
] as const;

export const MSA_UNIT6_SCENARIOS_BY_NAME = Object.fromEntries(MSA_UNIT6_SCENARIOS.map(item => [item.scenarioName, item.dialogue]));
