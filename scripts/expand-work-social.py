#!/usr/bin/env python3
"""Expand Work & Social lesson word arrays."""

WORDS_FILE = '/Users/mehdi/Desktop/HeyYusuf/constants/words.ts'

# (unique_last_line_substring, new_words_to_add)
EXPANSIONS = [
    # WORK_OFFICE (8 → 12)
    (
        "english: 'Department',  context: '🏢 Office structure' },\n];",
        """  { arabic: 'زَمِيل',       transliteration: 'zameel',       english: 'Colleague',       context: '🤝 Workmate',            example: 'زميلي في العمل',  exampleTranslation: 'My work colleague' },
  { arabic: 'مُدِير عَام',  transliteration: "mudeer 'aam",  english: 'General Manager', context: '👔 Top boss' },
  { arabic: 'طَابِعَة',     transliteration: "taabi'a",      english: 'Printer',         context: '🖨️ Office equipment' },
  { arabic: 'مَدِير تَنفِيذِي', transliteration: 'mudeer tanfeedhi', english: 'Executive Manager', context: '👔 Senior role' },""",
    ),
    # WORK_GREETINGS (6 → 12)
    (
        "english: 'And to you too',                 context: '↩️ Polite reply' },\n];",
        """  { arabic: 'خَيْر إن شَاء الله',        transliteration: 'khair in shaa allah',        english: "Hope it's all good",          context: '🙏 Reassuring response' },
  { arabic: 'وَيش أَخبَارَك؟',           transliteration: 'waish akhbaarak?',           english: "What's your news?",           context: '💬 Casual check-in' },
  { arabic: 'كُل شَيء تَمَام',           transliteration: 'kull shay tamaam',           english: "Everything's fine",           context: '✅ Positive reply' },
  { arabic: 'الحَمد لله مَا نِشكِي',     transliteration: 'il-hamdu lillah ma nishki',  english: "Praise God, can't complain",  context: '🙏 Gulf saying' },
  { arabic: 'شلونَك اليَوم؟',            transliteration: 'shloonak il-yawm?',          english: 'How are you today?',          context: '👋 Gulf greeting' },
  { arabic: 'الشُّغُل كَيفه؟',           transliteration: 'ish-shughul kaifah?',        english: "How's work going?",           context: '💼 Work small talk' },""",
    ),
    # WORK_MEETING (8 → 12)
    (
        "english: \"Let's continue tomorrow\",    context: '📅 Rescheduling' },\n];",
        """  { arabic: 'مِن رَأيَك؟',     transliteration: "min ra'yak?",     english: "What's your opinion?",  context: '💭 Asking for input' },
  { arabic: 'وَاضِح',         transliteration: 'waadhih',         english: 'Clear / Understood',    context: '✅ Confirming understanding' },
  { arabic: 'لَازِم نِفكِّر',  transliteration: 'laazim nifakkir', english: 'We need to think',      context: '🤔 Deliberation' },
  { arabic: 'قَرَّرنا',        transliteration: 'qarrarna',         english: 'We decided',            context: '✅ Decision made' },""",
    ),
    # WORK_PHONE_WORDS (8 → 12)
    (
        "english: 'Thanks for calling',   context: '📞 Ending calls' },\n];",
        """  { arabic: 'الخَط انقَطَع',        transliteration: 'il-khat inqata\'',   english: 'The call dropped',        context: '📵 Call problem' },
  { arabic: 'الرَّقم غَلَط',         transliteration: 'ir-raqam ghalat',    english: 'Wrong number',            context: '❌ Dialing mistake' },
  { arabic: 'مَا سَمِعتَك',           transliteration: 'ma sami\'tak',        english: "I can't hear you",        context: '🔇 Bad connection' },
  { arabic: 'أَعِيد المُكالَمَة',     transliteration: 'a\'eed il-mukaalaama', english: "I'll call again",         context: '🔄 Retry call' },""",
    ),
    # WORK_EMAIL_WORDS (8 → 12)
    (
        "english: 'Report',      context: '📊 Documents' },\n];",
        """  { arabic: 'مَلَفّ',       transliteration: 'malaff',       english: 'File / Document',  context: '📁 File reference' },
  { arabic: 'بِالتَّفصِيل', transliteration: 'bit-tafsiil',  english: 'In detail',        context: '📝 Detailed request' },
  { arabic: 'رَاجِع',       transliteration: 'raaji\'',      english: 'Review / Check',   context: '👁️ Review request' },
  { arabic: 'خَلَص',        transliteration: 'khalas',       english: 'Done / Finished',  context: '✅ Completion signal' },""",
    ),
    # WORK_SCHEDULE_WORDS (8 → 12)
    (
        "english: 'I need an extension', context: '📅 Extensions' },\n];",
        """  { arabic: 'اِجتِمَاع طَارِئ', transliteration: "ijtimaa' taari'",   english: 'Emergency meeting',   context: '🚨 Urgent call' },
  { arabic: 'كَنسِل',            transliteration: 'kansil',            english: 'Cancel (loanword)',    context: '❌ Cancellation' },
  { arabic: 'غَيِّر المَوعِد',    transliteration: "ghayyir il-maw'id", english: 'Reschedule',          context: '🔄 Change time' },
  { arabic: 'مُلتَزِم',           transliteration: 'multazim',          english: 'Committed / On time', context: '✅ Reliability' },""",
    ),
    # WORK_PROBLEMS_WORDS (8 → 12)
    (
        "english: \"I can't open the file\",    context: '📁 File issues' },\n];",
        """  { arabic: 'عَاجِل',               transliteration: "'aajil",              english: 'Urgent',                  context: '🚨 Time-sensitive' },
  { arabic: 'مَا فِيه حَل',         transliteration: 'ma feeh hal',         english: 'No solution',             context: '😰 Stuck situation' },
  { arabic: 'تَقدَر تِجِي هِنَا؟',   transliteration: 'taqdar tijii hina?',   english: 'Can you come here?',      context: '📍 Calling for help' },
  { arabic: 'الأَمر خَطِير',         transliteration: 'il-amr khateer',       english: 'The matter is serious',   context: '⚠️ Severity' },""",
    ),
    # WORK_SMALLTALK_WORDS (8 → 12)
    (
        "english: 'Happy weekend',                        context: '🎉 Weekend wishes' },\n];",
        """  { arabic: 'وَيش اِكَلتَ اليَوم؟', transliteration: 'waish akalt il-yawm?',  english: 'What did you eat today?',  context: '🍽️ Lunch chat' },
  { arabic: 'شُفت المُبَاراة؟',     transliteration: 'shuft il-mubaaraah?', english: 'Did you watch the match?', context: '⚽ Sports chat' },
  { arabic: 'الجَو حَار اليَوم',    transliteration: 'il-jaww haar il-yawm', english: "Today's hot",              context: '🌡️ Weather chat' },
  { arabic: 'أَشوفَك بَاجِر',       transliteration: 'ashooufak baajir',    english: 'See you tomorrow',         context: '👋 Sign-off' },""",
    ),
    # WORK_SALARY_WORDS (8 → 12)
    (
        "english: 'Resignation', context: '🚪 Leaving a job' },\n];",
        """  { arabic: 'بَدَل',             transliteration: 'badal',            english: 'Allowance',             context: '💵 Housing or transport allowance' },
  { arabic: 'نِهَايَة الخِدمَة', transliteration: 'nihaayat il-khidma', english: 'End-of-service gratuity', context: '📋 Gulf labor term' },
  { arabic: 'زِيَادَة',          transliteration: 'ziyaada',           english: 'Raise / Increase',      context: '📈 Salary increase' },
  { arabic: 'مَزَايا',           transliteration: 'mazaaya',           english: 'Benefits',              context: '📋 Job perks' },""",
    ),
    # WORK_LEAVING_WORDS (8 → 12)
    (
        "english: 'Tomorrow we have a lot of work', context: '💼 Work tomorrow' },\n];",
        """  { arabic: 'بَاجِر نِكمِل',         transliteration: 'baajir nikmil',        english: "Tomorrow we'll continue", context: '📅 End of day' },
  { arabic: 'أَشوفَك قَرِيب',        transliteration: 'ashooufak qariib',     english: 'See you soon',            context: '👋 Casual farewell' },
  { arabic: 'الله مَعَك',            transliteration: "allah ma'ak",          english: 'God be with you',         context: '🙏 Warm farewell' },
  { arabic: 'مَا نِشوف إلا الخَيْر',  transliteration: 'ma nishouf illa il-khair', english: 'May we see only good', context: '🙏 Gulf blessing' },""",
    ),
    # SOCIAL_GREETINGS_WORDS (8 → 12)
    (
        "english: 'Goodbye',                   context: '👋 Universal farewell' },\n];",
        """  { arabic: 'أَهلاً وَسَهلاً',    transliteration: 'ahlan wa sahlan',    english: 'Welcome (formal)',               context: '🏠 Welcoming guests' },
  { arabic: 'زُورُونَا',          transliteration: 'zooroona',            english: 'Visit us',                       context: '🏠 Gulf hospitality invite' },
  { arabic: 'شَرَّفتُونَا',        transliteration: 'sharrftoona',         english: 'You honored us with your visit', context: '🙏 When guests arrive' },
  { arabic: 'حَيَّاك الله',        transliteration: 'hayyaak allah',       english: 'God bless your arrival',         context: '🙏 Gulf welcome' },""",
    ),
    # SOCIAL_INVITATIONS_WORDS (8 → 12)
    (
        "english: \"You've brightened our home\",    context: '✨ Said to guests' },\n];",
        """  { arabic: 'أَبِي أَدعُوك',      transliteration: "abi ad'ouk",        english: 'I want to invite you',  context: '📩 Personal invitation' },
  { arabic: 'تَعَشَّى عِندَنا',    transliteration: "ta'ashsha 'indana",  english: 'Have dinner with us',   context: '🍽️ Dinner invitation' },
  { arabic: 'دَعوَة',             transliteration: "da'wa",             english: 'Invitation',            context: '📩 Formal invite' },
  { arabic: 'اِنبَسَط',           transliteration: 'inbasat',            english: 'Enjoy yourself!',       context: '🎉 Wishing fun' },""",
    ),
    # SOCIAL_RAMADAN_WORDS (8 → 12)
    (
        "english: 'Every year may you be well', context: '🎉 Celebration wish' },\n];",
        """  { arabic: 'تَراوِيح',      transliteration: 'taraawiyh',       english: 'Taraweh prayers',       context: '🕌 Ramadan night prayers' },
  { arabic: 'زَكاة',         transliteration: 'zakaah',          english: 'Zakat (charity)',       context: '💚 Islamic pillar' },
  { arabic: 'لَيلَة القَدر', transliteration: 'lailat il-qadr',  english: 'The Night of Power',    context: '✨ Most blessed night' },
  { arabic: 'الهِلَال',      transliteration: 'il-hilaal',       english: 'The crescent moon',     context: '🌙 Start of Ramadan' },""",
    ),
    # SOCIAL_COMPLIMENTS_WORDS (8 → 12)
    (
        "english: 'May God keep you',              context: '🙏 Affectionate blessing' },\n];",
        """  { arabic: 'أَبشِر',               transliteration: 'abshir',            english: 'Great news! / Sure!',  context: '🎉 Gulf positive response' },
  { arabic: 'عَلَى خَير دَايِمًا',  transliteration: 'ala khair daayiman', english: 'Always well',          context: '🙏 Blessing someone' },
  { arabic: 'حَبِيبِي',            transliteration: 'habiibi',            english: 'My dear (to a man)',   context: '💛 Affectionate address' },
  { arabic: 'يَسعِدَك',            transliteration: "yis'idak",           english: 'May you be happy',     context: '🙏 Response to compliment' },""",
    ),
    # SOCIAL_CONDOLENCES_WORDS (8 → 12)
    (
        "english: 'Get well soon',                  context: '💚 Wishing recovery' },\n];",
        """  { arabic: 'الصَّبر والسَّلامَة',  transliteration: 'is-sabr was-salaama',  english: 'Patience and safety',       context: '🙏 Comfort phrase' },
  { arabic: 'إِنَّا لِلَّهِ',       transliteration: 'inna lillaah',        english: 'We belong to God',          context: '🕊️ Said at time of loss' },
  { arabic: 'رَبُّنا يَرحَمه',      transliteration: 'rabbuna yarhamah',     english: 'May God have mercy on him', context: '🙏 For the deceased' },
  { arabic: 'الله يُقَوِّيَك',       transliteration: 'allah yuqawwiik',      english: 'May God give you strength', context: '💪 Support phrase' },""",
    ),
]

def main():
    with open(WORDS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    errors = []
    success = 0
    
    for i, (anchor_suffix, new_words) in enumerate(EXPANSIONS):
        if anchor_suffix not in content:
            errors.append(f"[{i}] Anchor NOT FOUND: {repr(anchor_suffix[:60])}")
            continue
        # Insert new_words before the closing "];"
        replacement = anchor_suffix.replace('\n];', '\n' + new_words + '\n];', 1)
        content = content.replace(anchor_suffix, replacement, 1)
        success += 1
        print(f"[{i}] ✅ Expanded")
    
    if errors:
        print("\n⚠️  ERRORS:")
        for e in errors:
            print(e)
    
    if content != original:
        with open(WORDS_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\n✅ File saved. {success}/{len(EXPANSIONS)} expansions applied.")
    else:
        print("\n⚠️  No changes made.")

if __name__ == '__main__':
    main()
