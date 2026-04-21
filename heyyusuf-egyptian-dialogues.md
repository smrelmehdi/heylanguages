# HeyYusuf — Egyptian Dialect Dialogues (عامية مصرية)

> Drop these into `data/content-registry.ts` under the `egyptian` dialect key.
> Voice: Fathy Hammad (VMy40598IGgDeaOE8phq)
> Currency: جنيه (EGP) instead of درهم (AED)
> Cultural swaps: كرك → شاي, قهوة عربية → قهوة مصري/تركي, حبيبي → يا باشا/يا معلم

---

## Key Gulf → Egyptian Vocabulary Map

| Gulf | Egyptian | Meaning |
|------|----------|---------|
| شو / شنو | إيه | What |
| أبي / أبغى | عايز / عاوز | I want |
| وين | فين | Where |
| تبي | عايز | You want |
| هالحين | دلوقتي | Now |
| مافي | مفيش | There isn't |
| زين | كويس / تمام | Good / OK |
| إي | أيوه | Yes |
| حبيبي | يا باشا / يا معلم | Bro / buddy |
| كم | بكام | How much |
| كرك | شاي | Tea (karak doesn't exist in Egypt) |
| قهوة عربية | قهوة تركي | Turkish coffee (Egyptian default) |
| درهم | جنيه | Currency |
| يا اخوي | يا باشا | Buddy |
| شوية | شوية | A little (same) |
| لو سمحت | لو سمحت / من فضلك | Please (same or من فضلك) |
| زحمة | زحمة | Traffic (same) |
| إن شاء الله | إن شاء الله | God willing (same) |
| الحمد لله | الحمد لله | Praise God (same) |

---

## Scenario 1: Café (قهوة)

### Scene: Traditional Egyptian ahwa in Cairo

```typescript
export const cafeDialogueEgyptian: DialogueTurn[] = [
  // Entering the café
  {
    speaker: 'yusuf',
    arabic: 'السلام عليكم',
    transliteration: 'As-salamu alaykum',
    english: 'Peace be upon you',
  },
  {
    speaker: 'npc',
    arabic: 'وعليكم السلام! أهلاً وسهلاً، اتفضل',
    transliteration: 'Wa alaykum as-salam! Ahlan wa sahlan, itfaddal',
    english: 'Peace be upon you too! Welcome, please sit down',
  },
  {
    speaker: 'npc',
    arabic: 'عايز تشرب إيه؟',
    transliteration: 'Ayez tishrab eih?',
    english: 'What do you want to drink?',
  },
  {
    speaker: 'yusuf',
    arabic: 'عايز قهوة تركي لو سمحت',
    transliteration: 'Ayez ahwa turki law samaht',
    english: 'I want Turkish coffee please',
  },
  {
    speaker: 'npc',
    arabic: 'سادة ولا مظبوط؟',
    transliteration: 'Sada walla mazboot?',
    english: 'Plain or medium sweet?',
  },
  {
    speaker: 'yusuf',
    arabic: 'مظبوط لو سمحت',
    transliteration: 'Mazboot law samaht',
    english: 'Medium sweet please',
  },
  {
    speaker: 'npc',
    arabic: 'تمام، حاجة تاني؟',
    transliteration: 'Tamam, haga tani?',
    english: 'OK, anything else?',
  },
  {
    speaker: 'yusuf',
    arabic: 'لا شكراً، بس كده',
    transliteration: 'La shukran, bass keda',
    english: 'No thanks, that\'s it',
  },
  {
    speaker: 'npc',
    arabic: 'حاضر، دقيقة واحدة',
    transliteration: 'Hader, da\'ii\'a wahda',
    english: 'Right away, one minute',
  },
  // Paying
  {
    speaker: 'yusuf',
    arabic: 'الحساب بكام؟',
    transliteration: 'El-hisab bikam?',
    english: 'How much is the bill?',
  },
  {
    speaker: 'npc',
    arabic: 'خمسة وعشرين جنيه',
    transliteration: 'Khamsa wi ishreen gineih',
    english: 'Twenty-five pounds',
  },
  {
    speaker: 'yusuf',
    arabic: 'اتفضل، شكراً يا معلم',
    transliteration: 'Itfaddal, shukran ya moallem',
    english: 'Here you go, thanks boss',
  },
  {
    speaker: 'npc',
    arabic: 'شكراً يا باشا، نورتنا',
    transliteration: 'Shukran ya basha, nawwartina',
    english: 'Thanks boss, you honored us',
  },
];
```

---

## Scenario 2: Taxi (تاكسي)

### Scene: Cairo yellow taxi

```typescript
export const taxiDialogueEgyptian: DialogueTurn[] = [
  {
    speaker: 'yusuf',
    arabic: 'السلام عليكم، فاضي يا أسطى؟',
    transliteration: 'As-salamu alaykum, fadi ya osta?',
    english: 'Peace be upon you, are you free driver?',
  },
  {
    speaker: 'npc',
    arabic: 'أيوه اتفضل، رايح فين؟',
    transliteration: 'Aywa itfaddal, rayeh fein?',
    english: 'Yes, get in. Where are you going?',
  },
  {
    speaker: 'yusuf',
    arabic: 'عايز أروح وسط البلد لو سمحت',
    transliteration: 'Ayez arooh wist el-balad law samaht',
    english: 'I want to go downtown please',
  },
  {
    speaker: 'npc',
    arabic: 'إن شاء الله، بس فيه زحمة شوية دلوقتي',
    transliteration: 'Inshallah, bass fee zahma shwayya dilwa\'ti',
    english: 'God willing, but there\'s some traffic now',
  },
  {
    speaker: 'yusuf',
    arabic: 'مفيش مشكلة',
    transliteration: 'Mafish mushkila',
    english: 'No problem',
  },
  {
    speaker: 'npc',
    arabic: 'هناخد طريق الكورنيش أحسن',
    transliteration: 'Hanakhod taree\' el-kornish ahsan',
    english: 'We\'ll take the Corniche road, it\'s better',
  },
  {
    speaker: 'yusuf',
    arabic: 'تمام يا أسطى',
    transliteration: 'Tamam ya osta',
    english: 'OK driver',
  },
  // Arriving
  {
    speaker: 'npc',
    arabic: 'وصلنا يا باشا',
    transliteration: 'Wissilna ya basha',
    english: 'We arrived boss',
  },
  {
    speaker: 'yusuf',
    arabic: 'الحساب بكام؟',
    transliteration: 'El-hisab bikam?',
    english: 'How much is it?',
  },
  {
    speaker: 'npc',
    arabic: 'خمسة وتلاتين جنيه',
    transliteration: 'Khamsa wi talateen gineih',
    english: 'Thirty-five pounds',
  },
  {
    speaker: 'yusuf',
    arabic: 'اتفضل، شكراً يا أسطى',
    transliteration: 'Itfaddal, shukran ya osta',
    english: 'Here you go, thanks driver',
  },
  {
    speaker: 'npc',
    arabic: 'الله يسلمك يا باشا، مع السلامة',
    transliteration: 'Allah yisalmak ya basha, ma\'a as-salama',
    english: 'God keep you safe boss, goodbye',
  },
];
```

---

## Scenario 3: Hotel (فندق)

### Scene: Cairo hotel reception

```typescript
export const hotelDialogueEgyptian: DialogueTurn[] = [
  {
    speaker: 'yusuf',
    arabic: 'السلام عليكم، عايز أعمل تشيك إن',
    transliteration: 'As-salamu alaykum, ayez a\'mel check-in',
    english: 'Peace be upon you, I want to check in',
  },
  {
    speaker: 'npc',
    arabic: 'أهلاً وسهلاً! عندك حجز؟',
    transliteration: 'Ahlan wa sahlan! Andak hagz?',
    english: 'Welcome! Do you have a reservation?',
  },
  {
    speaker: 'yusuf',
    arabic: 'أيوه عندي حجز باسم يوسف',
    transliteration: 'Aywa andi hagz bi-ism Yusuf',
    english: 'Yes I have a reservation under Yusuf',
  },
  {
    speaker: 'npc',
    arabic: 'تمام، لقيته. أوضة لشخصين لمدة تلات ليالي',
    transliteration: 'Tamam, la\'eito. Oda li-shakhsein li-muddit talat layali',
    english: 'OK, found it. Room for two for three nights',
  },
  {
    speaker: 'yusuf',
    arabic: 'أيوه مظبوط',
    transliteration: 'Aywa mazboot',
    english: 'Yes that\'s correct',
  },
  {
    speaker: 'npc',
    arabic: 'محتاج الباسبور لو سمحت',
    transliteration: 'Mehtag el-passport law samaht',
    english: 'I need the passport please',
  },
  {
    speaker: 'yusuf',
    arabic: 'اتفضل',
    transliteration: 'Itfaddal',
    english: 'Here you go',
  },
  {
    speaker: 'npc',
    arabic: 'شكراً. الأوضة رقم تلتمية واتناشر، الدور التالت',
    transliteration: 'Shukran. El-oda ra\'m toltomeyya w-itnashar, ed-dor et-talit',
    english: 'Thanks. Room 312, third floor',
  },
  {
    speaker: 'yusuf',
    arabic: 'الفطار بيكون الساعة كام؟',
    transliteration: 'El-fitar biyikon es-sa\'a kam?',
    english: 'What time is breakfast?',
  },
  {
    speaker: 'npc',
    arabic: 'من سبعة لعشرة الصبح في الدور الأول',
    transliteration: 'Min sab\'a li-ashara es-sobh fil-dor el-awwil',
    english: 'From 7 to 10 AM on the first floor',
  },
  {
    speaker: 'yusuf',
    arabic: 'تمام، شكراً',
    transliteration: 'Tamam, shukran',
    english: 'OK, thanks',
  },
  {
    speaker: 'npc',
    arabic: 'العفو، لو محتاج أي حاجة كلمنا',
    transliteration: 'El-afw, law mehtag ay haga kalimna',
    english: 'You\'re welcome, if you need anything call us',
  },
];
```

---

## Scenario 4: Restaurant (مطعم)

### Scene: Egyptian restaurant in Cairo

```typescript
export const restaurantDialogueEgyptian: DialogueTurn[] = [
  {
    speaker: 'yusuf',
    arabic: 'السلام عليكم، فيه ترابيزة فاضية؟',
    transliteration: 'As-salamu alaykum, fee tarabeza fadya?',
    english: 'Peace be upon you, is there an empty table?',
  },
  {
    speaker: 'npc',
    arabic: 'أهلاً وسهلاً! أيوه اتفضل، لكام واحد؟',
    transliteration: 'Ahlan wa sahlan! Aywa itfaddal, li-kam wahid?',
    english: 'Welcome! Yes please, for how many?',
  },
  {
    speaker: 'yusuf',
    arabic: 'لاتنين لو سمحت',
    transliteration: 'Li-itnein law samaht',
    english: 'For two please',
  },
  {
    speaker: 'npc',
    arabic: 'اتفضلوا هنا. دي المنيو',
    transliteration: 'Itfaddalu hina. Di el-menu',
    english: 'Please sit here. Here\'s the menu',
  },
  {
    speaker: 'yusuf',
    arabic: 'شكراً. إيه أحسن حاجة عندكم؟',
    transliteration: 'Shukran. Eih ahsan haga andokom?',
    english: 'Thanks. What\'s the best thing you have?',
  },
  {
    speaker: 'npc',
    arabic: 'الكشري بتاعنا مشهور، وكمان الملوخية',
    transliteration: 'El-koshari beta\'na mashhoor, wa kaman el-molokheyya',
    english: 'Our koshari is famous, and also the molokhia',
  },
  {
    speaker: 'yusuf',
    arabic: 'عايز كشري وسلطة لو سمحت',
    transliteration: 'Ayez koshari wi salata law samaht',
    english: 'I want koshari and salad please',
  },
  {
    speaker: 'npc',
    arabic: 'حاضر. عايز تشرب إيه؟',
    transliteration: 'Hader. Ayez tishrab eih?',
    english: 'Right away. What do you want to drink?',
  },
  {
    speaker: 'yusuf',
    arabic: 'ماية معدنية لو سمحت',
    transliteration: 'Mayya ma\'daneyya law samaht',
    english: 'Mineral water please',
  },
  {
    speaker: 'npc',
    arabic: 'حاضر، حاجة تاني؟',
    transliteration: 'Hader, haga tani?',
    english: 'Sure, anything else?',
  },
  {
    speaker: 'yusuf',
    arabic: 'لا بس كده، شكراً',
    transliteration: 'La bass keda, shukran',
    english: 'No that\'s it, thanks',
  },
  // Paying
  {
    speaker: 'yusuf',
    arabic: 'الحساب لو سمحت',
    transliteration: 'El-hisab law samaht',
    english: 'The bill please',
  },
  {
    speaker: 'npc',
    arabic: 'تمانين جنيه',
    transliteration: 'Tamaneen gineih',
    english: 'Eighty pounds',
  },
  {
    speaker: 'yusuf',
    arabic: 'اتفضل. الأكل كان جميل',
    transliteration: 'Itfaddal. El-akl kan gameel',
    english: 'Here you go. The food was great',
  },
  {
    speaker: 'npc',
    arabic: 'تسلم يا باشا، نورتنا',
    transliteration: 'Tislam ya basha, nawwartina',
    english: 'Bless you boss, you honored us',
  },
];
```

---

## Scenario 5: Supermarket (سوبر ماركت)

### Scene: Egyptian supermarket in Cairo

```typescript
export const supermarketDialogueEgyptian: DialogueTurn[] = [
  {
    speaker: 'yusuf',
    arabic: 'لو سمحت، اللبن فين؟',
    transliteration: 'Law samaht, el-laban fein?',
    english: 'Excuse me, where is the milk?',
  },
  {
    speaker: 'npc',
    arabic: 'آخر ممر على الشمال',
    transliteration: 'Akher mamarr ala esh-shimal',
    english: 'Last aisle on the left',
  },
  {
    speaker: 'yusuf',
    arabic: 'شكراً. وفين العيش؟',
    transliteration: 'Shukran. Wi fein el-eish?',
    english: 'Thanks. And where is the bread?',
  },
  {
    speaker: 'npc',
    arabic: 'العيش في أول ممر على اليمين',
    transliteration: 'El-eish fi awwil mamarr ala el-yimeen',
    english: 'The bread is in the first aisle on the right',
  },
  {
    speaker: 'yusuf',
    arabic: 'ده بكام؟',
    transliteration: 'Da bikam?',
    english: 'How much is this?',
  },
  {
    speaker: 'npc',
    arabic: 'اتناشر جنيه',
    transliteration: 'Itnashar gineih',
    english: 'Twelve pounds',
  },
  {
    speaker: 'yusuf',
    arabic: 'وفيه عرض على المياه؟',
    transliteration: 'Wi fee ard ala el-mayya?',
    english: 'And is there a deal on water?',
  },
  {
    speaker: 'npc',
    arabic: 'أيوه، اتنين بعشرة جنيه',
    transliteration: 'Aywa, itnein bi-ashara gineih',
    english: 'Yes, two for ten pounds',
  },
  {
    speaker: 'yusuf',
    arabic: 'تمام، هاخد اتنين',
    transliteration: 'Tamam, hakhod itnein',
    english: 'OK, I\'ll take two',
  },
  // Checkout
  {
    speaker: 'npc',
    arabic: 'عايز كيس؟',
    transliteration: 'Ayez kis?',
    english: 'Do you want a bag?',
  },
  {
    speaker: 'yusuf',
    arabic: 'أيوه لو سمحت. المجموع بكام؟',
    transliteration: 'Aywa law samaht. El-magmoo\' bikam?',
    english: 'Yes please. What\'s the total?',
  },
  {
    speaker: 'npc',
    arabic: 'خمسة وستين جنيه',
    transliteration: 'Khamsa wi sitteen gineih',
    english: 'Sixty-five pounds',
  },
  {
    speaker: 'yusuf',
    arabic: 'اتفضل، شكراً',
    transliteration: 'Itfaddal, shukran',
    english: 'Here you go, thanks',
  },
  {
    speaker: 'npc',
    arabic: 'شكراً، مع السلامة',
    transliteration: 'Shukran, ma\'a as-salama',
    english: 'Thanks, goodbye',
  },
];
```

---

## Scenario 6: Pharmacy (صيدلية)

### Scene: Egyptian pharmacy in Cairo

```typescript
export const pharmacyDialogueEgyptian: DialogueTurn[] = [
  {
    speaker: 'yusuf',
    arabic: 'السلام عليكم، عندكم حاجة للصداع؟',
    transliteration: 'As-salamu alaykum, andokom haga lil-soda\'?',
    english: 'Peace be upon you, do you have something for headache?',
  },
  {
    speaker: 'npc',
    arabic: 'أيوه طبعاً. عايز بنادول ولا بروفين؟',
    transliteration: 'Aywa tab\'an. Ayez Panadol walla Brufen?',
    english: 'Yes of course. Do you want Panadol or Brufen?',
  },
  {
    speaker: 'yusuf',
    arabic: 'بنادول لو سمحت. بكام العلبة؟',
    transliteration: 'Panadol law samaht. Bikam el-elba?',
    english: 'Panadol please. How much is the box?',
  },
  {
    speaker: 'npc',
    arabic: 'خمسة وعشرين جنيه',
    transliteration: 'Khamsa wi ishreen gineih',
    english: 'Twenty-five pounds',
  },
  {
    speaker: 'yusuf',
    arabic: 'تمام. وعندكم كريم للشمس؟',
    transliteration: 'Tamam. Wi andokom cream lil-shams?',
    english: 'OK. And do you have sunscreen?',
  },
  {
    speaker: 'npc',
    arabic: 'أيوه، فيه نوعين. المستورد بميت جنيه والمصري بخمسين',
    transliteration: 'Aywa, fee no\'ein. El-mustawrad bi-meet gineih wil-masri bi-khamseen',
    english: 'Yes, there are two types. Imported for 100 and Egyptian for 50',
  },
  {
    speaker: 'yusuf',
    arabic: 'هاخد المصري',
    transliteration: 'Hakhod el-masri',
    english: 'I\'ll take the Egyptian one',
  },
  {
    speaker: 'npc',
    arabic: 'حاجة تاني؟',
    transliteration: 'Haga tani?',
    english: 'Anything else?',
  },
  {
    speaker: 'yusuf',
    arabic: 'لا شكراً، بس كده',
    transliteration: 'La shukran, bass keda',
    english: 'No thanks, that\'s all',
  },
  {
    speaker: 'npc',
    arabic: 'المجموع خمسة وسبعين جنيه',
    transliteration: 'El-magmoo\' khamsa wi sab\'een gineih',
    english: 'The total is seventy-five pounds',
  },
  {
    speaker: 'yusuf',
    arabic: 'اتفضل، شكراً',
    transliteration: 'Itfaddal, shukran',
    english: 'Here you go, thanks',
  },
  {
    speaker: 'npc',
    arabic: 'سلامتك يا باشا',
    transliteration: 'Salamtak ya basha',
    english: 'Get well soon boss',
  },
];
```

---

## Scenario 7: Barbershop (صالون حلاقة)

### Scene: Egyptian barbershop in Cairo

```typescript
export const barbershopDialogueEgyptian: DialogueTurn[] = [
  {
    speaker: 'yusuf',
    arabic: 'السلام عليكم، فيه دور كبير؟',
    transliteration: 'As-salamu alaykum, fee dor kebeer?',
    english: 'Peace be upon you, is there a long wait?',
  },
  {
    speaker: 'npc',
    arabic: 'لا يا باشا، اتفضل على طول',
    transliteration: 'La ya basha, itfaddal ala tool',
    english: 'No boss, come right in',
  },
  {
    speaker: 'yusuf',
    arabic: 'عايز أحلق شعري',
    transliteration: 'Ayez ahla\' sha\'ri',
    english: 'I want to cut my hair',
  },
  {
    speaker: 'npc',
    arabic: 'عايزه إزاي؟ قصير ولا مدرج؟',
    transliteration: 'Ayzu izzay? Osayar walla mudarrag?',
    english: 'How do you want it? Short or layered?',
  },
  {
    speaker: 'yusuf',
    arabic: 'قصير من الجناب وسيبه طويل من فوق',
    transliteration: 'Osayar min el-ganab wi seebu taweel min fo\'',
    english: 'Short on the sides and leave it long on top',
  },
  {
    speaker: 'npc',
    arabic: 'تمام. عايز تظبط الدقن كمان؟',
    transliteration: 'Tamam. Ayez tizabbit ed-da\'n kaman?',
    english: 'OK. Do you want to trim the beard too?',
  },
  {
    speaker: 'yusuf',
    arabic: 'أيوه، ظبطها شوية بس',
    transliteration: 'Aywa, zabbitha shwayya bass',
    english: 'Yes, just trim it a little',
  },
  {
    speaker: 'npc',
    arabic: 'حاضر. عايز جِل ولا سبراي بعد كده؟',
    transliteration: 'Hader. Ayez gel walla spray ba\'d keda?',
    english: 'Sure. Do you want gel or spray after?',
  },
  {
    speaker: 'yusuf',
    arabic: 'لا شكراً، من غير حاجة',
    transliteration: 'La shukran, min gheir haga',
    english: 'No thanks, without anything',
  },
  {
    speaker: 'npc',
    arabic: 'خلاص كده. عجبك؟',
    transliteration: 'Khalas keda. Agabak?',
    english: 'All done. Do you like it?',
  },
  {
    speaker: 'yusuf',
    arabic: 'حلو أوي، شكراً. بكام؟',
    transliteration: 'Helw awi, shukran. Bikam?',
    english: 'Very nice, thanks. How much?',
  },
  {
    speaker: 'npc',
    arabic: 'ستين جنيه',
    transliteration: 'Sitteen gineih',
    english: 'Sixty pounds',
  },
  {
    speaker: 'yusuf',
    arabic: 'اتفضل، تسلم إيدك يا معلم',
    transliteration: 'Itfaddal, tislam eedak ya moallem',
    english: 'Here you go, bless your hands boss',
  },
  {
    speaker: 'npc',
    arabic: 'الله يسلمك، نورتنا',
    transliteration: 'Allah yisalmak, nawwartina',
    english: 'God bless you, you honored us',
  },
];
```

---

## Scenario 8: Airport (مطار)

### Scene: Cairo International Airport

```typescript
export const airportDialogueEgyptian: DialogueTurn[] = [
  {
    speaker: 'yusuf',
    arabic: 'لو سمحت، كاونتر مصر للطيران فين؟',
    transliteration: 'Law samaht, counter Masr lil-tayaran fein?',
    english: 'Excuse me, where is the EgyptAir counter?',
  },
  {
    speaker: 'npc',
    arabic: 'على طول وبعدين يمين، هتلاقيه قدامك',
    transliteration: 'Ala tool wi ba\'dein yimeen, hatla\'eeh oddamak',
    english: 'Straight ahead then right, you\'ll find it in front of you',
  },
  {
    speaker: 'yusuf',
    arabic: 'شكراً',
    transliteration: 'Shukran',
    english: 'Thanks',
  },
  // At check-in
  {
    speaker: 'npc',
    arabic: 'صباح الخير، الباسبور وتذكرة الطيران لو سمحت',
    transliteration: 'Sabah el-kheir, el-passport wi tazkara et-tayaran law samaht',
    english: 'Good morning, passport and boarding pass please',
  },
  {
    speaker: 'yusuf',
    arabic: 'اتفضلي',
    transliteration: 'Itfaddali',
    english: 'Here you go (to female)',
  },
  {
    speaker: 'npc',
    arabic: 'عايز مكان شباك ولا ممر؟',
    transliteration: 'Ayez makan shibak walla mamarr?',
    english: 'Do you want window or aisle seat?',
  },
  {
    speaker: 'yusuf',
    arabic: 'شباك لو سمحتي',
    transliteration: 'Shibak law samahti',
    english: 'Window please (to female)',
  },
  {
    speaker: 'npc',
    arabic: 'عندك شنط هتشحنها؟',
    transliteration: 'Andak shonat hatshahnha?',
    english: 'Do you have bags to check in?',
  },
  {
    speaker: 'yusuf',
    arabic: 'أيوه، شنطة واحدة بس',
    transliteration: 'Aywa, shanta wahda bass',
    english: 'Yes, just one bag',
  },
  {
    speaker: 'npc',
    arabic: 'حطها على الميزان لو سمحت',
    transliteration: 'Hottha ala el-mizan law samaht',
    english: 'Put it on the scale please',
  },
  {
    speaker: 'npc',
    arabic: 'تمام، عشرين كيلو. البوردينج باس بتاعك، البوابة رقم تمنية',
    transliteration: 'Tamam, ishreen kilo. El-boarding pass beta\'ak, el-bawwaba ra\'m tamanya',
    english: 'OK, twenty kilos. Here\'s your boarding pass, gate number eight',
  },
  {
    speaker: 'yusuf',
    arabic: 'الطيارة هتقلع الساعة كام؟',
    transliteration: 'Et-tayyara hat\'alla\' es-sa\'a kam?',
    english: 'What time does the plane take off?',
  },
  {
    speaker: 'npc',
    arabic: 'الساعة تلاتة ونص، يعني عندك ساعة',
    transliteration: 'Es-sa\'a talata wi noss, ya\'ni andak sa\'a',
    english: 'At 3:30, so you have an hour',
  },
  {
    speaker: 'yusuf',
    arabic: 'تمام، شكراً جزيلاً',
    transliteration: 'Tamam, shukran gazeelan',
    english: 'OK, thank you very much',
  },
  {
    speaker: 'npc',
    arabic: 'العفو، رحلة سعيدة',
    transliteration: 'El-afw, rehla sa\'eeda',
    english: 'You\'re welcome, have a nice trip',
  },
];
```

---

## Unit 1 Word Lists (Egyptian)

> These need to be adapted from the Gulf word lists. Key swaps below — full lists to be generated once you confirm the Gulf originals.

### Quick reference — common word swaps:

| English | Gulf | Egyptian |
|---------|------|----------|
| I want | أبي (abi) | عايز (ayez) |
| What | شو (shu) | إيه (eih) |
| Where | وين (wein) | فين (fein) |
| Now | هالحين (halhin) | دلوقتي (dilwa'ti) |
| Good | زين (zein) | كويس (kwayyes) |
| Yes | إي (ee) | أيوه (aywa) |
| There isn't | مافي (mafi) | مفيش (mafish) |
| How much | كم (kam) | بكام (bikam) |
| Like this | جذي (chithi) | كده (keda) |
| Why | ليش (leish) | ليه (leih) |
| A lot | واجد (wajid) | كتير (kteer) |
| Nothing | لاشي (lashi) | ولا حاجة (wala haga) |
| Give me | عطني (atni) | هاتلي (hatli) |
| Man/bro | يا اخوي (ya akhooy) | يا باشا (ya basha) |
| OK | زين (zein) | تمام (tamam) |
| Hurry | يالله (yallah) | يالله (yallah) — same! |

---

## Notes for Claude Code Integration

When adding to `data/content-registry.ts`:
1. Import all Egyptian dialogue arrays
2. Set `voiceId: 'VMy40598IGgDeaOE8phq'` (Fathy Hammad)
3. Set `audioBasePath: 'assets/audio/egyptian/'`
4. Scene images use `cairo-*` prefix instead of `dubai-*`
5. Currency display: جنيه (EGP) wherever درهم (AED) appears
