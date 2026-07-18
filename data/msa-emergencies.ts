import { makeMsaScenario } from './msa-style';

export const MSA_UNIT8_SCENARIOS = [
  makeMsaScenario(8, 'doctor-appointment', 'MsaDoctorAppointment', 'Doctor Appointment', 'Arrange a medical appointment.', 'A clinic phone desk', 'Book an appointment and state the reason.', 'DoctorVisit', [
    ['waiter','receptionist','مرحباً، كيف أساعدك؟','marhaban, kayfa usaaiduk?','Hello, how can I help you?'], ['user','patient','أريد حجز موعد مع الطبيب','uriidu hajza mawidin maa at-tabiib','I want to book an appointment with the doctor'],
    ['waiter','receptionist','هل يناسبك صباح الثلاثاء؟','hal yunaasibuka sabaahu ath-thulaathaa?', 'Does Tuesday morning suit you?'], ['user','patient','هل يوجد موعد بعد الظهر؟',"hal yuujadu maw'idun ba'da az-zuhr?",'Is there an appointment in the afternoon?'],
    ['waiter','receptionist','نعم، في الساعة الرابعة','naam, fii as-saaati ar-raabia','Yes, at four o’clock'], ['user','patient','ممتاز، اسمي يوسف أحمد','mumtaaz, ismii yuusuf ahmad','Excellent, my name is Yusuf Ahmad'],
    ['waiter','receptionist','ما سبب الزيارة؟','maa sababu az-ziyaara?','What is the reason for the visit?'], ['user','patient','لدي صداع مستمر','ladayya sudaaun mustamirr','I have a persistent headache'],
  ]),
  makeMsaScenario(8, 'hospital-reception', 'MsaHospitalReception', 'Hospital Reception', 'Register calmly at a hospital.', 'A hospital reception', 'Give basic details and find the clinic.', 'HospitalEmergency', [
    ['waiter','receptionist','مرحباً، هل لديك موعد؟',"marhaban, hal ladayka maw'id?",'Hello, do you have an appointment?'], ['user','patient','نعم، لدي موعد في قسم العيون',"naam, ladayya maw'idun fii qismi al-'uyuun",'Yes, I have an appointment in ophthalmology'],
    ['waiter','receptionist','أحتاج إلى بطاقة الهوية','ahtaaju ilaa bitaaqati al-huwiyya','I need your ID card'], ['user','patient','تفضل، هذه بطاقتي','tafaddal, haadhihi bitaaqatii','Here you go, this is my card'],
    ['waiter','receptionist','انتظر في القاعة رقم ثلاثة',"intazir fii al-qaa'ati raqmi thalaatha",'Wait in room number three'], ['user','patient','أين القاعة؟',"ayna al-qaa'a?",'Where is the room?'],
    ['waiter','receptionist','في الممر الثاني على اليمين',"fii al-mamarri ath-thaanii 'alaa al-yamiin",'In the second corridor on the right'], ['user','patient','شكراً على المساعدة',"shukran 'alaa al-musaa'ada",'Thank you for the help'],
  ]),
  makeMsaScenario(8, 'describing-pain', 'MsaDescribingPain', 'Describing Pain', 'Describe pain clearly.', 'A consultation room', 'Explain where and how long it hurts.', 'DoctorVisit', [
    ['waiter','doctor','أين تشعر بالألم؟',"ayna tash'uru bil-alam?",'Where do you feel pain?'], ['user','patient','لدي ألم في بطني','ladayya alam fii batnii','I have pain in my stomach.','لَدَيَّ أَلَمٌ فِي بَطْنِي.'],
    ['waiter','doctor','منذ متى؟','mundhu mataa?','Since when?'], ['user','patient','منذ الليلة الماضية','mundhu al-laylati al-maadiya','Since last night'],
    ['waiter','doctor','هل الألم شديد؟','hal al-alamu shadiid?','Is the pain severe?'], ['user','patient','إنه متوسط، لكنه مستمر','innahu mutawassit, lakinnahu mustamirr','It is moderate, but continuous'],
    ['waiter','doctor','هل لديك أعراض أخرى؟',"hal ladayka a'raadun ukhraa?",'Do you have other symptoms?'], ['user','patient','أشعر بالغثيان قليلاً',"ash'uru bil-ghathayaani qaliilan",'I feel a little nauseous'],
  ]),
  makeMsaScenario(8, 'pharmacy-emergency', 'MsaPharmacyEmergency', 'Urgent Pharmacy Visit', 'Ask a pharmacist for urgent help.', 'A pharmacy', 'Explain an urgent but non-life-threatening need.', 'Pharmacy', [
    ['waiter','pharmacist','ما المشكلة؟','maa al-mushkila?','What is the problem?'], ['user','customer','لدي حساسية ونسيت دوائي',"ladayya hasaasiya wa nasiitu dawaa'ii",'I have an allergy and forgot my medicine'],
    ['waiter','pharmacist','هل تعرف اسم الدواء؟','hal tarifu isma ad-dawaa?','Do you know the name of the medicine?'], ['user','customer','نعم، هذه صورة العلبة','naam, haadhihi suuratu al-ulba','Yes, this is a photo of the box'],
    ['waiter','pharmacist','هل لديك صعوبة في التنفس؟',"hal ladayka su'uubatun fii at-tanaffus?",'Do you have difficulty breathing?'], ['user','customer','لا، لدي حكة فقط','laa, ladayya hikkatun faqat','No, I only have itching'],
    ['waiter','pharmacist','سأعطيك الدواء، وإذا ساءت الحالة فاتصل بالطوارئ',"sa'u'tiika ad-dawaa', wa idhaa saa'at al-haalatu fattasil bit-tawaari'",'I will give you the medicine; if it gets worse, call emergency services'], ['user','customer','فهمت، شكراً لك','fahimtu, shukran lak','I understand, thank you'],
  ]),
  makeMsaScenario(8, 'calling-ambulance', 'MsaCallingAmbulance', 'Calling an Ambulance', 'Give essential emergency information.', 'An emergency phone call', 'Request an ambulance and give a location.', 'HospitalEmergency', [
    ['waiter','dispatcher','الطوارئ، ما الحالة؟',"at-tawaari', maa al-haala?",'Emergency services, what is the situation?'], ['user','caller','نحتاج إلى سيارة إسعاف',"nahtaaju ilaa sayyaarati is'aaf",'We need an ambulance'],
    ['waiter','dispatcher','هل المصاب واعٍ؟',"hal al-musaabu waa'in?",'Is the injured person conscious?'], ['user','caller','نعم، لكنه لا يستطيع الوقوف',"naam, lakinnahu laa yastatii'u al-wuquuf",'Yes, but he cannot stand'],
    ['waiter','dispatcher','ما عنوانكم؟',"maa 'unwaanukum?",'What is your address?'], ['user','caller','نحن أمام محطة القطار','nahnu amaama mahattati al-qitaar','We are in front of the train station'],
    ['waiter','dispatcher','سيصل الإسعاف قريباً',"sayasilu al-is'aafu qariiban",'The ambulance will arrive soon'], ['user','caller','شكراً، سننتظر هنا','shukran, sanantaziru hunaa','Thank you, we will wait here'],
  ]),
  makeMsaScenario(8, 'police-help', 'MsaPoliceHelp', 'Asking Police for Help', 'Report a simple incident.', 'A police help desk', 'Ask for police help and provide facts.', 'PoliceStation', [
    ['waiter','officer','كيف يمكنني مساعدتك؟',"kayfa yumkinunii musaa'adatuk?",'How can I help you?'], ['user','visitor','فقدت حقيبتي في الحافلة','faqadtu haqiibatii fii al-haafila','I lost my bag on the bus'],
    ['waiter','officer','متى حدث ذلك؟','mataa hadatha dhaalik?','When did that happen?'], ['user','visitor','منذ ساعة تقريباً','mundhu saatin taqriiban','About an hour ago'],
    ['waiter','officer','ما لون الحقيبة؟','maa lawnu al-haqiiba?','What colour is the bag?'], ['user','visitor','سوداء وصغيرة','sawdaa wa saghiira','Black and small'],
    ['waiter','officer','هل كانت فيها وثائق مهمة؟','hal kaanat fiihaa wathaaiqu muhimma?','Were there important documents in it?'], ['user','visitor','نعم، كانت فيها بطاقة هويتي','naam, kaanat fiihaa bitaaqatu huwiyyatii','Yes, my ID card was in it'],
  ]),
  makeMsaScenario(8, 'lost-phone', 'MsaLostPhone', 'Lost Phone', 'Ask for help finding a phone.', 'A public place', 'Describe a lost phone and contact it.', 'LostWallet', [
    ['user','owner','عذراً، فقدت هاتفي','udhran, faqadtu haatifii','Excuse me, I lost my phone'], ['waiter','helper','أين رأيته آخر مرة؟','ayna raaytahu aakhira marra?','Where did you see it last?'],
    ['user','owner','كان على هذه الطاولة','kaana alaa haadhihi at-taawila','It was on this table'], ['waiter','helper','ما لونه؟','maa lawnuh?','What colour is it?'],
    ['user','owner','أسود، وله غطاء أزرق','aswad, wa lahu ghitaaun azraq','Black, with a blue case'], ['waiter','helper','سأتصل برقمك','saattasilu biraqmik','I will call your number'],
    ['user','owner','شكراً، أسمع صوته هناك',"shukran, asma'u sawtahu hunaak",'Thank you, I hear it over there'], ['waiter','helper','إنه تحت المقعد',"innahu tahta al-maq'ad",'It is under the seat'],
  ]),
  makeMsaScenario(8, 'lost-child', 'MsaLostChild', 'Lost Child', 'Request immediate public help.', 'A shopping centre', 'Describe a missing child calmly.', 'AskingForHelp', [
    ['user','parent','ساعدني، ابني مفقود','saaidnii, ibnii mafquud','Help me, my son is missing'], ['waiter','security','اهدأ، ما اسمه؟','ihda, maa ismuh?','Stay calm, what is his name?'],
    ['user','parent','اسمه عمر وعمره ست سنوات','ismuhu umar wa umruhu sittu sanawaat','His name is Omar and he is six years old'], ['waiter','security','ماذا يرتدي؟','maadhaa yartadii?','What is he wearing?'],
    ['user','parent','قميصاً أزرق وسروالاً أسود','qamiisan azraq wa sirwaalan aswad','A blue shirt and black trousers'], ['waiter','security','أين رأيته آخر مرة؟','ayna raaytahu aakhira marra?','Where did you see him last?'],
    ['user','parent','قرب متجر الألعاب',"qurba matjar al-al'aab",'Near the toy shop'], ['waiter','security','سأبلغ فريق الأمن الآن','sa-uballighu fariiq al-amn al-aan','I will alert the security team now.'],
  ]),
  makeMsaScenario(8, 'car-problem', 'MsaCarProblem', 'Car Problem', 'Explain a breakdown safely.', 'Beside a stopped car', 'Ask for roadside assistance.', 'CarBreakdown', [
    ['user','driver','تعطلت سيارتي','taattalat sayyaaratii','My car broke down'], ['waiter','helper','هل أنت في مكان آمن؟','hal anta fii makaanin aamin?','Are you in a safe place?'],
    ['user','driver','نعم، أنا بجانب الطريق','naam, anaa bijaanibi at-tariiq','Yes, I am beside the road'], ['waiter','helper','هل يعمل المحرك؟','hal yamalu al-muharrik?','Does the engine run?'],
    ['user','driver','لا، ولا أعرف السبب',"laa, wa laa a'rifu as-sabab",'No, and I do not know why'], ['waiter','helper','سأرسل سيارة مساعدة',"sa'ursilu sayyaarata musaa'ada",'I will send an assistance vehicle'],
    ['user','driver','كم ستستغرق؟','kam satastaghriq?','How long will it take?'], ['waiter','helper','نحو ثلاثين دقيقة','nahwa thalaathiina daqiiqa','About thirty minutes'],
  ]),
  makeMsaScenario(8, 'urgent-help', 'MsaUrgentHelp', 'Urgent Help', 'Ask clearly for urgent assistance.', 'A station concourse', 'State an urgent need and follow directions.', 'AskingForHelp', [
    ['user','traveller','أحتاج إلى مساعدة بسرعة',"ahtaaju ilaa musaa'adatin bisur'a",'I need help quickly'], ['waiter','staff','ما الأمر؟','maa al-amr?','What is the matter?'],
    ['user','traveller','صديقي مريض ولا يستطيع المشي',"sadiiqii mariidun wa laa yastatii'u al-mashy",'My friend is ill and cannot walk'], ['waiter','staff','هل يحتاج إلى طبيب؟','hal yahtaaju ilaa tabiib?','Does he need a doctor?'],
    ['user','traveller','نعم، من فضلك','naam, min fadlik','Yes, please'], ['waiter','staff','اجلسا هنا وسأتصل بالطوارئ','ijlisaa hunaa wa saattasilu bit-tawaari','Sit here and I will call emergency services'],
    ['user','traveller','هل ستصل قريباً؟','hal satasilu qariiban?','Will they arrive soon?'], ['waiter','staff','نعم، ابق معه ولا تحركه','naam, ibqa maahu wa laa tuharrikhu','Yes, stay with him and do not move him'],
  ]),
] as const;

export const MSA_UNIT8_SCENARIOS_BY_NAME = Object.fromEntries(MSA_UNIT8_SCENARIOS.map(item => [item.scenarioName, item.dialogue]));
