import { makeMsaScenario } from './msa-style';

export const MSA_CAFE_SCENARIO = makeMsaScenario(2, 'cafe', 'Cafe', 'Café', 'Order a drink and ask for the price.', 'A café', 'Order politely and pay.', 'Cafe', [
  ['waiter','server','مرحباً، ماذا تريد؟','marhaban, maadhaa turiid?','Hello, what would you like?'],
  ['user','customer','أريد قهوة، من فضلك','uriidu qahwa, min fadlik','I would like coffee, please'],
  ['waiter','server','هل تريدها مع الحليب؟','hal turiiduhaa ma\'a al-haliib?','Would you like it with milk?'],
  ['user','customer','لا، من دون حليب','laa, min duuni haliib','No, without milk'],
  ['waiter','server','هل تريد شيئاً آخر؟','hal turiidu shay\'an aakhar?','Would you like anything else?'],
  ['user','customer','لا، شكراً. كم السعر؟','laa, shukran. kam as-si\'r?','No, thank you. How much is it?'],
  ['waiter','server','السعر خمسة دراهم','as-si\'ru khamsatu daraahim','The price is five dirhams'],
  ['user','customer','تفضل، شكراً','tafaddal, shukran','Here you go, thank you'],
]);

export const MSA_RESTAURANT_SCENARIO = makeMsaScenario(2, 'restaurant', 'Restaurant', 'Restaurant', 'Order a simple meal.', 'A restaurant', 'Ask for food and the bill.', 'Restaurant', [
  ['waiter','server','مرحباً، هل أنت مستعد للطلب؟','marhaban, hal anta musta\'idd lil-talab?','Hello, are you ready to order?'],
  ['user','guest','نعم، أريد الدجاج مع الأرز','na\'am, uriidu ad-dajaaja ma\'a al-aruzz','Yes, I want chicken with rice'],
  ['waiter','server','وماذا تريد أن تشرب؟','wa maadhaa turiidu an tashrab?','What would you like to drink?'],
  ['user','guest','ماء، من فضلك','maa\', min fadlik','Water, please'],
  ['waiter','server','هل تريد سلطة أيضاً؟','hal turiidu salata aydaan?','Would you like a salad too?'],
  ['user','guest','لا، هذا يكفي','laa, haadhaa yakfii','No, that is enough'],
  ['user','guest','الحساب، من فضلك','al-hisaab, min fadlak','The bill, please.'],
  ['waiter','server','تفضل، هذا هو الحساب','tafaddal, haadhaa huwa al-hisaab','Here you go, this is the bill.'],
]);

export const MSA_SUPERMARKET_SCENARIO = makeMsaScenario(2, 'supermarket', 'Supermarket', 'Supermarket', 'Find groceries and ask a price.', 'A supermarket', 'Locate products and pay.', 'Supermarket', [
  ['waiter','staff','مرحباً، هل تحتاج إلى مساعدة؟','marhaban, hal tahtaaju ilaa musaa\'ada?','Hello, do you need help?'],
  ['user','shopper','نعم، أين الأرز؟','na\'am, ayna al-aruzz?','Yes, where is the rice?'],
  ['waiter','staff','الأرز في الممر الثالث','al-aruzzu fii al-mamarri ath-thaalith','The rice is in aisle three'],
  ['user','shopper','وهل لديكم حليب؟','wa hal ladaykum haliib?','Do you have milk?'],
  ['waiter','staff','نعم، الحليب في الثلاجة','na\'am, al-haliibu fii ath-thallaaja','Yes, the milk is in the refrigerator'],
  ['user','shopper','كم سعره؟','kam si\'ruhu?','How much is it?'],
  ['waiter','staff','سعره أربعة دراهم','si\'ruhu arba\'atu daraahim','It costs four dirhams'],
  ['user','shopper','حسناً، شكراً','hasanan, shukran','Okay, thank you'],
]);

export const MSA_TAXI_SCENARIO = makeMsaScenario(2, 'taxi', 'Taxi', 'Taxi', 'Take a taxi to a destination.', 'A taxi', 'Give a destination and ask the fare.', 'Taxi', [
  ['waiter','driver','مرحباً، إلى أين تريد الذهاب؟','marhaban, ilaa ayna turiidu adh-dhahaab?','Hello, where would you like to go?'],
  ['user','passenger','إلى المطار، من فضلك','ilaa al-mataar, min fadlik','To the airport, please'],
  ['waiter','driver','هل تريد الطريق السريع؟','hal turiidu at-tariiq as-sarii\'?','Would you like the highway?'],
  ['user','passenger','نعم، إذا كان أسرع','na\'am, idhaa kaana asra\'','Yes, if it is faster'],
  ['waiter','driver','سنصل خلال عشرين دقيقة',"sanasilu khilaala 'ishriina daqiiqa",'We will arrive in twenty minutes'],
  ['user','passenger','جيد. كم الأجرة؟','jayyid. kam al-ujra?','Good. How much is the fare?'],
  ['waiter','driver','الأجرة ثلاثون درهماً','al-ujratu thalaathuuna dirhaman','The fare is thirty dirhams'],
  ['user','passenger','تفضل، شكراً','tafaddal, shukran','Here you go, thank you'],
]);

export const MSA_DIRECTIONS_SCENARIO = makeMsaScenario(2, 'directions', 'Directions', 'Directions', 'Ask how to reach a place.', 'A city street', 'Understand simple directions.', 'Taxi', [
  ['user','traveller','عفواً، أين محطة القطار؟','afwan, ayna mahattatu al-qitaar?','Excuse me, where is the train station?'],
  ['waiter','local','اذهب إلى الأمام','idhhab ilaa al-amaam','Go straight ahead'],
  ['user','traveller','ثم إلى اليمين؟','thumma ilaa al-yamiin?','Then to the right?'],
  ['waiter','local','لا، انعطف إلى اليسار','laa, in\'atif ilaa al-yasaar','No, turn left'],
  ['user','traveller','هل هي بعيدة؟','hal hiya ba\'iida?','Is it far?'],
  ['waiter','local','لا، تبعد خمس دقائق','laa, tab\'udu khamsa daqaa\'iq','No, it is five minutes away'],
  ['user','traveller','شكراً على المساعدة',"shukran 'alaa al-musaa'ada",'Thank you for the help'],
  ['waiter','local','عفواً','afwan','You are welcome'],
]);

export const MSA_PHARMACY_SCENARIO = makeMsaScenario(2, 'pharmacy', 'Pharmacy', 'Pharmacy', 'Ask for simple pharmacy help.', 'A pharmacy', 'Describe a basic symptom.', 'Pharmacy', [
  ['waiter','pharmacist','مرحباً، كيف أساعدك؟','marhaban, kayfa usaa\'iduk?','Hello, how can I help you?'],
  ['user','customer','لدي صداع','ladayya sudaa\'','I have a headache'],
  ['waiter','pharmacist','منذ متى؟','mundhu mataa?','Since when?'],
  ['user','customer','منذ هذا الصباح','mundhu haadhaa as-sabaah','Since this morning'],
  ['waiter','pharmacist','هل لديك حرارة؟','hal ladayka haraara?','Do you have a fever?'],
  ['user','customer','لا، ليس لدي حرارة','laa, laysa ladayya haraara','No, I do not have a fever'],
  ['waiter','pharmacist','تفضل، هذا الدواء. خذه بعد الطعام.',"tafaddal, haadha ad-dawaa'. khudhhu ba'd at-ta'aam.",'Here is the medicine. Take it after food.'],
  ['user','customer','شكراً لك','shukran lak','Thank you'],
]);

export const MSA_BARBERSHOP_SCENARIO = makeMsaScenario(2, 'barbershop', 'Barbershop', 'Barbershop', 'Ask for a simple haircut.', 'A barbershop', 'Explain haircut preferences.', 'Barbershop', [
  ['waiter','barber','مرحباً، تفضل بالجلوس','marhaban, tafaddal bil-juluus','Hello, please sit down'],
  ['user','customer','أريد أن أقص شعري، من فضلك',"uriidu an aqussa sha'rii, min fadlak",'I would like to have my hair cut, please.'],
  ['waiter','barber','هل تريده قصيراً؟','hal turiiduhu qasiiran?','Would you like it short?'],
  ['user','customer','قصيراً من الجانبين فقط','qasiiran mina al-jaanibayni faqat','Short on the sides only'],
  ['waiter','barber','وماذا عن الأعلى؟',"wa maadhaa 'ani al-a'laa?",'What about the top?'],
  ['user','customer','خفف قليلاً من الأعلى','khaffif qaliilan mina al-a\'laa','Trim a little from the top'],
  ['waiter','barber','حسناً، سأبدأ الآن','hasanan, sa\'abda\'u al-aan','Okay, I will start now'],
  ['user','customer','ممتاز، شكراً لك','mumtaaz, shukran lak','Excellent, thank you.'],
]);

export const MSA_HOTEL_SCENARIO = makeMsaScenario(2, 'hotel', 'Hotel', 'Hotel', 'Check in at a hotel.', 'A hotel reception', 'Give a name and receive room details.', 'Hotel', [
  ['waiter','receptionist','مرحباً، هل لديك حجز؟','marhaban, hal ladayka hajz?','Hello, do you have a reservation?'],
  ['user','guest','نعم، لدي حجز باسم يوسف','na\'am, ladayya hajzun bismi yuusuf','Yes, I have a reservation under Yusuf'],
  ['waiter','receptionist','هل يمكنني رؤية جواز سفرك؟','hal yumkinunii ru\'yatu jawaazi safarik?','May I see your passport?'],
  ['user','guest','تفضل','tafaddal','Here you go'],
  ['waiter','receptionist','غرفتك في الطابق الخامس','ghurfatuka fii at-taabiqi al-khaamis','Your room is on the fifth floor'],
  ['user','guest','أين المصعد؟','ayna al-mis\'ad?','Where is the elevator?'],
  ['waiter','receptionist','المصعد على اليمين',"al-mis'adu 'alaa al-yamiin",'The elevator is on the right'],
  ['user','guest','شكراً جزيلاً','shukran jaziilan','Thank you very much'],
]);

export const MSA_AIRPORT_SCENARIO = makeMsaScenario(2, 'airport', 'Airport', 'Airport', 'Check in for a flight.', 'An airport desk', 'Show documents and find the gate.', 'Airport', [
  ['waiter','agent','جواز السفر، من فضلك','jawaazu as-safar, min fadlik','Your passport, please'],
  ['user','traveller','تفضل','tafaddal','Here you go'],
  ['waiter','agent','كم حقيبة معك؟','kam haqiibatan ma\'ak?','How many bags do you have?'],
  ['user','traveller','حقيبة واحدة','haqiibatun waahida','One bag'],
  ['waiter','agent','هذه بطاقة صعودك','haadhihi bitaaqat su\'uudik','This is your boarding pass.'],
  ['user','traveller','أين البوابة؟','ayna al-bawwaaba?','Where is the gate?'],
  ['waiter','agent','البوابة رقم اثني عشر',"al-bawwaaba raqm ithnay 'ashar",'Gate number twelve'],
  ['user','traveller','شكراً، إلى اللقاء','shukran, ilaa al-liqaa\'','Thank you, goodbye'],
]);

export const MSA_PHONE_CALL_SCENARIO = makeMsaScenario(2, 'phone-call', 'PhoneCall', 'Phone Conversation', 'Make a basic phone call.', 'A phone call', 'Identify the caller and leave a message.', 'Hotel', [
  ['waiter','receiver','مرحباً، من معي؟','marhaban, man ma\'ii?','Hello, who is speaking?'],
  ['user','caller','مرحباً، أنا يوسف','marhaban, anaa yuusuf','Hello, this is Yusuf'],
  ['waiter','receiver','أهلاً يوسف، كيف حالك؟','ahlan yuusuf, kayfa haaluk?','Hello Yusuf, how are you?'],
  ['user','caller','أنا بخير. هل خالد موجود؟','anaa bikhayr. hal khaalid mawjuud?','I am fine. Is Khalid there?'],
  ['waiter','receiver','لا، هو خارج المنزل','laa, huwa khaariju al-manzil','No, he is out'],
  ['user','caller','هل يمكن أن تترك له رسالة؟','hal yumkinu an tatruka lahu risaala?','Can you leave him a message?'],
  ['waiter','receiver','نعم، سأبلغه رسالتك',"na'am, sa-uballighuhu risaalataka",'Yes, I’ll give him your message.'],
  ['user','caller','شكراً، مع السلامة','shukran, ma\'a as-salaama','Thank you, goodbye'],
]);

export const CAFE_DIALOGUE_MSA = MSA_CAFE_SCENARIO.dialogue;
export const RESTAURANT_DIALOGUE_MSA = MSA_RESTAURANT_SCENARIO.dialogue;
export const SUPERMARKET_DIALOGUE_MSA = MSA_SUPERMARKET_SCENARIO.dialogue;
export const TAXI_DIALOGUE_MSA = MSA_TAXI_SCENARIO.dialogue;
export const DIRECTIONS_DIALOGUE_MSA = MSA_DIRECTIONS_SCENARIO.dialogue;
export const PHARMACY_DIALOGUE_MSA = MSA_PHARMACY_SCENARIO.dialogue;
export const BARBERSHOP_DIALOGUE_MSA = MSA_BARBERSHOP_SCENARIO.dialogue;
export const HOTEL_DIALOGUE_MSA = MSA_HOTEL_SCENARIO.dialogue;
export const AIRPORT_DIALOGUE_MSA = MSA_AIRPORT_SCENARIO.dialogue;
export const PHONE_CALL_DIALOGUE_MSA = MSA_PHONE_CALL_SCENARIO.dialogue;

export const MSA_UNIT2_SCENARIOS = [MSA_CAFE_SCENARIO, MSA_RESTAURANT_SCENARIO, MSA_SUPERMARKET_SCENARIO, MSA_TAXI_SCENARIO, MSA_DIRECTIONS_SCENARIO, MSA_PHARMACY_SCENARIO, MSA_BARBERSHOP_SCENARIO, MSA_HOTEL_SCENARIO, MSA_AIRPORT_SCENARIO, MSA_PHONE_CALL_SCENARIO];
