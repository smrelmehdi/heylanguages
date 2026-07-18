import { makeMsaWords } from './msa-style';

const lesson = (id: string, entries: Parameters<typeof makeMsaWords>[2]) => makeMsaWords(7, id, entries);

export const MSA_UNIT7_LESSONS = [
  { contentId: 'work-introduction', title: 'Introducing Your Work', words: lesson('work-introduction', [
    ['أعمل في شركة تقنية', "a'malu fii sharika taqaniyya", 'I work at a technology company'], ['أعمل من المنزل', "a'malu mina al-manzil", 'I work from home'],
    ['هذا أول يوم لي', 'haadhaa awwalu yawmin lii', 'This is my first day'], ['أنا في قسم المبيعات', "anaa fii qismi al-mabii'aat", 'I am in the sales department'], ['سعيد بالعمل معكم', "sa'iidun bil-amali ma'akum", 'I am happy to work with you'],
  ]) },
  { contentId: 'job-titles', title: 'Job Titles', words: lesson('job-titles', [
    ['أنا مهندس', 'anaa muhandis', 'I am an engineer'], ['هي مهندسة', 'hiya muhandisa', 'She is an engineer'], ['زميلي محاسب', 'zamiilii muhaasib', 'My male colleague is an accountant'],
    ['زميلتي محاسبة', 'zamiilatii muhaasiba', 'My female colleague is an accountant'], ['المدير جديد والمديرة جديدة', 'al-mudiir jadiid wal-mudiira jadiida', 'The male manager is new, and the female manager is new'],
  ]) },
  { contentId: 'workplace-places', title: 'Workplace Places', words: lesson('workplace-places', [
    ['المكتب في الطابق الثاني', 'al-maktabu fii at-taabiqi ath-thaanii', 'The office is on the second floor'], ['قاعة الاجتماعات هناك', "qaa'atu al-ijtima'aat hunaak", 'The meeting room is there'],
    ['المطبخ بجانب المصعد', "al-matbakhu bijaanibi al-mis'ad", 'The kitchen is beside the elevator'], ['الاستقبال في الأسفل', 'al-istiqbaalu fii al-asfal', 'Reception is downstairs'], ['هذه غرفة الاستراحة', 'haadhihi ghurfatu al-istiraaha', 'This is the break room'],
  ]) },
  { contentId: 'office-objects', title: 'Office Objects', words: lesson('office-objects', [
    ['هذا حاسوبي', 'haadhaa haasuubii', 'This is my computer'], ['أين الطابعة؟', "ayna at-taabi'a?", 'Where is the printer?'], ['أحتاج إلى قلم', 'ahtaaju ilaa qalam', 'I need a pen'],
    ['أرسل الملف بالبريد الإلكتروني', 'arsil al-milaff bil-bariid al-iliktruunii', 'Send the file by email.', undefined, undefined, 'أَرْسِلِ المِلَفَّ بِالبَرِيدِ الإِلِكْتُرُونِي.'], ['نسيت كلمة المرور', 'nasiitu kalimat al-muruur', 'I forgot the password'],
  ]) },
  { contentId: 'daily-routine', title: 'Daily Routine', words: lesson('daily-routine', [
    ['أبدأ العمل في الثامنة', "abda'u al-amala fii ath-thaamina", 'I start work at eight'], ['أقرأ بريدي الإلكتروني', "aqra'u bariidii al-iliktruunii", 'I read my email'], ['أتناول الغداء ظهراً', 'atanaawalu al-ghadaa zuhran', 'I have lunch at noon'],
    ['أنتهي في الخامسة', 'antahii fii al-khaamisa', 'I finish at five'], ['أعود إلى البيت', "a'uudu ilaa al-bayt", 'I return home'],
  ]) },
  { contentId: 'schedules', title: 'Schedules', words: lesson('schedules', [
    ['ما جدولك اليوم؟', 'maa jadwaluka al-yawm?', 'What is your schedule today?'], ['لدي موعد في العاشرة', "ladayya maw'idun fii al-aashira", 'I have an appointment at ten'], ['أنا متفرغ بعد الظهر', 'anaa mutafarrighun bada az-zuhr', 'I am free in the afternoon'],
    ['سأنتهي قبل السادسة', 'saantahii qabla as-saadisa', 'I will finish before six'], ['هل يناسبك يوم الاثنين؟', 'hal yunaasibuka yawmu al-ithnayn?', 'Does Monday suit you?'],
  ]) },
  { contentId: 'meetings', title: 'Meetings', words: lesson('meetings', [
    ['لدي اجتماع اليوم', 'ladayya ijtimaaun al-yawm', 'I have a meeting today'], ['متى يبدأ الاجتماع؟', 'mataa yabda al-ijtimaa?', 'When does the meeting start?'], ['الاجتماع في القاعة الكبيرة', 'al-ijtimaau fii al-qaati al-kabiira', 'The meeting is in the large room'],
    ['لنبدأ الآن', "linabda' al-aan", "Let's begin now"], ['سأرسل ملخص الاجتماع', "sa'ursilu mulakhkhasa al-ijtimaa'", 'I will send the meeting summary'],
  ]) },
  { contentId: 'requests-at-work', title: 'Requests at Work', words: lesson('requests-at-work', [
    ['هل يمكنك مساعدتي؟', "hal yumkinuka musaa'adatii?", 'Can you help me?'], ['أرسل لي الملف، من فضلك', 'arsil lii al-milaff, min fadlak', 'Send me the file, please'], ['هل يمكنك طباعة هذا؟', "hal yumkinuka tibaa'at haadhaa?", 'Can you print this?'],
    ['أعطني دقيقة، من فضلك', "a'tinii daqiiqa, min fadlak", 'Give me a minute, please'], ['سأتولى هذا الأمر', 'sa-atawallaa haadhaa al-amr', 'I will handle this'],
  ]) },
  { contentId: 'problems-at-work', title: 'Problems at Work', words: lesson('problems-at-work', [
    ['الحاسوب لا يعمل', "al-haasuub laa ya'mal", 'The computer is not working.', undefined, undefined, 'الحَاسُوبُ لا يَعْمَل.'], ['لا أستطيع فتح الملف', "laa astatii'u fath al-milaff", 'I cannot open the file'], ['الاتصال بالإنترنت بطيء', "al-ittisaal bil-internet batii'", 'The internet connection is slow'],
    ['أنا متأخر قليلاً', 'anaa mutaakhkhirun qaliilan', 'I am a little late'], ['سنحل المشكلة', 'sanahullu al-mushkila', 'We will solve the problem'],
  ]) },
  { contentId: 'workplace-conversation', title: 'Workplace Conversation', words: lesson('workplace-conversation', [
    ['كيف كان يومك؟', 'kayfa kaana yawmuk?', 'How was your day?'], ['كان مشغولاً', 'kaana mashghuulan', 'It was busy'], ['هل نأخذ استراحة؟', 'hal naakhudhu istiraaha?', 'Shall we take a break?'],
    ['لنتحدث لاحقاً', 'linatahaddath laahiqan', "Let's talk later"], ['أراك غداً في المكتب', 'araaka ghadan fii al-maktab', 'See you tomorrow at the office'],
  ]) },
] as const;
