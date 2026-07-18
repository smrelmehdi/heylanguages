import { makeMsaScenario } from './msa-style';

export const MSA_UNIT10_SCENARIOS = [
  makeMsaScenario(10, 'neighbor-visit', 'MsaNeighborVisit', 'Visiting a Neighbor', 'Welcome a neighbor and chat briefly.', 'A neighbor’s home', 'Exchange a warm welcome.', 'FriendsNewNeighbor', [
    ['waiter','host','أهلاً وسهلاً، تفضل بالدخول','ahlan wa sahlan, tafaddal bid-dukhuul','Welcome, please come in'], ['user','guest','شكراً، سعيد بزيارتكم',"shukran, sa'iid bi-ziyaaratikum",'Thank you, I am happy to visit you.'],
    ['waiter','host','ماذا تحب أن تشرب؟','maadhaa tuhibbu an tashrab?','What would you like to drink?'], ['user','guest','شاي، من فضلك','shaay, min fadlik','Tea, please'],
    ['waiter','host','ما رأيك في الحي الجديد؟',"maa ra'yuka fii al-hayy al-jadiid?",'What do you think of the new neighborhood?'], ['user','guest','إنه هادئ والناس لطفاء','innahu haadi wa an-naas lutafaa','It is quiet and the people are kind'],
    ['waiter','host','نحن هنا إذا احتجت إلى شيء','nahnu hunaa idhaa ihtajta ilaa shay','We are here if you need anything'], ['user','guest','هذا لطف منك، شكراً','haadhaa lutfun minka, shukran','That is kind of you, thank you'],
  ]),
  makeMsaScenario(10, 'brunch', 'MsaBrunch', 'Brunch with Friends', 'Plan and enjoy a late breakfast.', 'A café terrace', 'Order and share food with friends.', 'Cafe', [
    ['waiter','friend','هل نطلب الإفطار الآن؟','hal natlubu al-iftaara al-aan?','Shall we order breakfast now?'], ['user','friend','نعم، أنا جائع جداً','naam, anaa jaaiun jiddan','Yes, I am very hungry'],
    ['waiter','friend','ما رأيك في طبق مشترك؟','maa rayuka fii tabaqin mushtarak?','What do you think of a shared dish?'], ['user','friend','فكرة جيدة، ولنطلب بعض العصير','fikratun jayyida, wa linatlub bada al-asiir','Good idea, and let us order some juice'],
    ['waiter','friend','هل تفضل عصير البرتقال؟','hal tufaddilu asiira al-burtuqaal?','Do you prefer orange juice?'], ['user','friend','نعم، وكوب قهوة أيضاً','naam, wa kuubu qahwatin aydan','Yes, and a cup of coffee too'],
    ['waiter','friend','الجو جميل هنا','al-jawwu jamiilun hunaa','The weather is lovely here'], ['user','friend','صحيح، لنكرر هذا قريباً','sahiih, linukarrir haadhaa qariiban','True, let us do this again soon'],
  ]),
  makeMsaScenario(10, 'road-trip', 'MsaRoadTrip', 'Road Trip', 'Prepare for a trip with friends.', 'Inside a car', 'Discuss timing, stops, and the route.', 'FriendsRoadTrip', [
    ['waiter','friend','هل الجميع مستعد؟',"hal al-jamii'u musta'idd?",'Is everyone ready?'], ['user','friend','نعم، هيا ننطلق','naam, hayyaa nantaliq','Yes, let us go'],
    ['waiter','friend','كم سيستغرق الطريق؟','kam sayastaghriqu at-tariiq?','How long will the journey take?'], ['user','friend','نحو ثلاث ساعات','nahwa thalaathi saaat','About three hours'],
    ['waiter','friend','هل سنتوقف في الطريق؟','hal sanatawaqqafu fii at-tariiq?','Will we stop on the way?'], ['user','friend','نعم، سنتوقف للراحة بعد ساعة',"naam, sanatawaqqafu lir-raahati ba'da saa'a",'Yes, we will stop for a break after an hour'],
    ['waiter','friend','سأشغل بعض الموسيقى',"sa'ushaghghilu ba'da al-muusiiqaa",'I will play some music'], ['user','friend','ممتاز، هذه الرحلة ستكون ممتعة',"mumtaaz, haadhihi ar-rihlatu satakuunu mumti'a",'Excellent, this trip will be fun'],
  ]),
  makeMsaScenario(10, 'birthday-invitation', 'MsaBirthdayInvitation', 'Birthday Invitation', 'Invite a friend to a birthday.', 'A phone conversation', 'Give invitation details and receive a reply.', 'FriendsBirthday', [
    ['waiter','host','دعوتك إلى حفلة عيد ميلادي',"da'awtuka ilaa haflat 'iid miilaadii",'I invited you to my birthday party.'], ['user','friend','شكراً، متى سيكون؟','shukran, mataa sayakuun?','Thank you, when will it be?'],
    ['waiter','host','مساء الجمعة في منزلي',"masaa' al-jum'a fii manzilii",'Friday evening at my home'], ['user','friend','في أي ساعة؟',"fii ayyi saa'a?",'At what time?'],
    ['waiter','host','في السابعة، وسنقدم العشاء',"fii as-saabi'a, wa sanuqaddimu al-'ashaa'",'At seven, and we will serve dinner'], ['user','friend','رائع، سآتي بالتأكيد',"raa'i', sa-aatii bit-ta'kiid",'Great, I will definitely come.'],
    ['waiter','host','لا تحضر شيئاً، حضورك يكفي','laa tuhdhir shayan, huduuruka yakfii','Do not bring anything; your presence is enough'], ['user','friend','أراك يوم الجمعة','araaka yawma al-jumua','See you on Friday'],
  ]),
  makeMsaScenario(10, 'birthday-party', 'MsaBirthdayParty', 'Birthday Party', 'Congratulate a friend at a party.', 'A birthday party', 'Offer wishes and enjoy the celebration.', 'FriendsBirthday', [
    ['user','guest','عيد ميلاد سعيد!','iidu miilaadin saiid!','Happy birthday!'], ['waiter','host','شكراً جزيلاً، سعيد بحضورك','shukran jaziilan, saiidun bihuduurik','Thank you very much, I am happy you came'],
    ['user','guest','الحفل جميل والطعام لذيذ','al-haflu jamiilun wat-taamu ladhiidh','The party is lovely and the food is delicious'], ['waiter','host','تفضل، جرب الكعكة','tafaddal, jarrib al-kaka','Please, try the cake'],
    ['user','guest','سأتناول قطعة صغيرة','satanaawalu qitatan saghiira','I will have a small piece'], ['waiter','host','سنلتقط صورة جماعية بعد قليل','sanaltaqitu suuratan jamaaiyyatan bada qaliil','We will take a group photo shortly'],
    ['user','guest','فكرة رائعة',"fikratun raai'a",'A great idea'], ['waiter','host','أتمنى أن تستمتع بالحفل',"atamannaa an tastamti'a bil-hafl",'I hope you enjoy the party'],
  ]),
  makeMsaScenario(10, 'giving-a-gift', 'MsaGivingGift', 'Giving a Gift', 'Give and receive a simple gift.', 'A friend’s celebration', 'Use warm, modest gift language.', 'FriendsBirthday', [
    ['user','giver','هذه هدية بسيطة لك','haadhihi hadiyyatun basiitatun lak','This is a simple gift for you'], ['waiter','receiver','شكراً، لم يكن ذلك ضرورياً','shukran, lam yakun dhaalika daruuriyyan','Thank you, that was not necessary'],
    ['user','giver','أتمنى أن تعجبك','atamannaa an tujibak','I hope you like it'], ['waiter','receiver','هل أفتحها الآن؟','hal aftahuhaa al-aan?','Shall I open it now?'],
    ['user','giver','بالطبع، تفضل','bit-tab, tafaddal','Of course, go ahead'], ['waiter','receiver','إنها جميلة جداً','innahaa jamiilatun jiddan','It is very beautiful'],
    ['user','giver','اخترتها لأنك تحب القراءة',"ikhtartuhaa li'annaka tuhibbu al-qiraa'a",'I chose it because you like reading'], ['waiter','receiver','سأستفيد منها كثيراً',"sa'astafiidu minhaa kathiiran",'I will get a lot of use from it'],
  ]),
  makeMsaScenario(10, 'taking-photos', 'MsaTakingPhotos', 'Taking Photos', 'Ask friends to take and share photos.', 'A scenic viewpoint', 'Coordinate a group photo.', 'FriendsSocialMedia', [
    ['waiter','friend','لنلتقط صورة معاً',"linaltaqit suura ma'an",'Let us take a photo together.'], ['user','friend','فكرة جميلة، قفوا هنا','fikra jamiila, qifuu hunaa','Lovely idea, stand here'],
    ['waiter','friend','هل الخلفية واضحة؟','hal al-khalfiyyatu waadiha?','Is the background clear?'], ['user','friend','نعم، لكن اقتربوا قليلاً','naam, laakin iqtaribuu qaliilan','Yes, but come a little closer'],
    ['waiter','friend','هل نبتسم الآن؟','hal nabtasimu al-aan?','Shall we smile now?'], ['user','friend','نعم، واحد، اثنان، ثلاثة','naam, waahid, ithnaan, thalaatha','Yes, one, two, three'],
    ['waiter','friend','أرسل الصورة إلى المجموعة',"arsili as-suurata ilaa al-majmuu'a",'Send the photo to the group'], ['user','friend','سأرسلها حالاً',"sa'ursiluhaa haalan",'I will send it right away'],
  ]),
  makeMsaScenario(10, 'remembering-the-trip', 'MsaRememberingTrip', 'Remembering the Trip', 'Recall favourite moments together.', 'A quiet café', 'Talk about shared memories.', 'FriendsRoadTrip', [
    ['waiter','friend','هل تتذكر رحلتنا الماضية؟','hal tatadhakkaru rihlatanaa al-maadiya?','Do you remember our last trip?'], ['user','friend','بالطبع، كانت رائعة',"bit-tab', kaanat raai'a",'Of course, it was wonderful'],
    ['waiter','friend','أحببت الجبال كثيراً','ahbabtu al-jibaala kathiiran','I loved the mountains very much'], ['user','friend','وأنا أحببت القرية الصغيرة','wa anaa ahbabtu al-qaryata as-saghiira','And I loved the small village'],
    ['waiter','friend','ضحكنا كثيراً في الطريق','dahiknaa kathiiran fii at-tariiq','We laughed a lot on the way'], ['user','friend','كانت أياماً جميلة','kaanat ayyaaman jamiila','Those were beautiful days'],
    ['waiter','friend','علينا أن نسافر معاً مرة أخرى','alaynaa an nusaafira maan marratan ukhraa','We should travel together again'], ['user','friend','بالتأكيد، سأخطط للرحلة القادمة','bit-taakiid, saukhattitu lir-rihlati al-qaadima','Definitely, I will plan the next trip'],
  ]),
  makeMsaScenario(10, 'saying-goodbye', 'MsaSayingGoodbye', 'Saying Goodbye', 'Say a warm farewell.', 'A train station', 'Say goodbye without overly formal language.', 'FriendsFarewell', [
    ['waiter','friend','لا أصدق أنك ستغادر غداً','laa usaddiqu annaka satughaadiru ghadan','I cannot believe you are leaving tomorrow'], ['user','traveller','وأنا سأشتاق إليك كثيراً','wa anaa saashtaaqu ilayka kathiiran','I will miss you a lot too'],
    ['waiter','friend','استمتعت بالوقت معك',"istamta'tu bil-waqt ma'aka",'I enjoyed the time with you.'], ['user','traveller','شكراً على كل شيء',"shukran 'alaa kull shay'",'Thank you for everything'],
    ['waiter','friend','أرسل لي رسالة عندما تصل','arsil lii risaala indamaa tasil','Send me a message when you arrive'], ['user','traveller','بالتأكيد، وسنبقى على تواصل',"bit-ta'kiid, wa-sanabqaa 'alaa tawaasul",'Definitely, and we will stay in touch.'],
    ['waiter','friend','رحلة سعيدة، وأراك على خير','rihlatun saiida, wa araaka alaa khayr','Have a good trip, and goodbye'], ['user','traveller','مع السلامة، يا صديقي','maa as-salaama, yaa sadiiqii','Goodbye, my friend'],
  ]),
  makeMsaScenario(10, 'staying-in-touch', 'MsaStayingInTouch', 'Staying in Touch', 'Plan how to keep in contact.', 'A final phone call', 'Agree on future contact and a reunion.', 'FriendsSocialMedia', [
    ['waiter','friend','هل وصلت بسلام؟','hal wasalta bisalaam?','Did you arrive safely?'], ['user','traveller','نعم، وصلت قبل قليل','naam, wasaltu qabla qaliil','Yes, I arrived a short while ago'],
    ['waiter','friend','ابق على اتصال بنا',"ibqa 'alaa ittisaal binaa",'Keep in touch with us.'], ['user','traveller','بالتأكيد، سأتصل كل أسبوع',"bit-ta'kiid, sa-attasilu kulla usbuu'",'Definitely, I will call every week'],
    ['waiter','friend','وسنرسل لك صورنا','wa-sanursilu laka suwaranaa','And we will send you our photos'], ['user','traveller','سأنتظرها، وسأرسل لكم صوري أيضاً','sa-antaziruhaa, wa-sa-ursilu lakum suwarii aydan','I will wait for them and send you my photos too.'],
    ['waiter','friend','إن شاء الله نلتقي مرة أخرى','in shaa allaahu naltaqii marratan ukhraa','God willing, we will meet again'], ['user','traveller','إن شاء الله، إلى اللقاء','in shaa allaah, ilaa al-liqaa','God willing, see you'],
  ]),
] as const;

export const MSA_UNIT10_SCENARIOS_BY_NAME = Object.fromEntries(MSA_UNIT10_SCENARIOS.map(item => [item.scenarioName, item.dialogue]));
