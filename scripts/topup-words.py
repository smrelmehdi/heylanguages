#!/usr/bin/env python3
"""Top up remaining arrays to 12 words."""

WORDS_FILE = '/Users/mehdi/Desktop/HeyYusuf/constants/words.ts'

EXPANSIONS = [
    # NUMBERS_TENS (11 → 12) — add 1 word
    (
        "english: 'Three hundred', context: '🔢 300' },\n];",
        """  { arabic: 'خَمسمِئَة', displayArabic: 'خمسمئة', audioText: 'خمسمئة', evalTarget: 'خمسمئة', transliteration: 'khamsumiyya', english: 'Five hundred', context: '🔢 500' },""",
    ),
    # NUMBERS_HOURS (11 → 12) — add 1 word
    (
        "english: 'A little / soon',  context: '⏰ Gulf expression',   example: 'بَعَد شوَيَّة',         exampleTranslation: 'In a little while' },\n];\n\nexport const NUMBERS_MINUTES",
        """  { arabic: 'الفَجر', displayArabic: 'الفجر', audioText: 'الفجر', evalTarget: 'الفجر', transliteration: 'al-fajr', english: 'Dawn / Early morning', context: '🌅 Earliest prayer time' },
];

export const NUMBERS_MINUTES""",
    ),
    # NUMBERS_DAYS (11 → 12) — add 1 word
    (
        "english: 'Weekend (Gulf loanword)', context: '📅 Thu-Fri in Gulf' },\n];\n\nexport const NUMBERS_MONTHS",
        """  { arabic: 'اليَوم',  displayArabic: 'اليوم',  audioText: 'اليوم',  evalTarget: 'اليوم',  transliteration: 'il-yawm', english: 'Today', context: '📅 Current day', example: 'اليوم الأحد', exampleTranslation: "Today is Sunday" },
];

export const NUMBERS_MONTHS""",
    ),
    # SOCIAL_EMOTIONS (10 → 12) — add 2
    (
        "english: 'Excited',         context: '🤩 Emotions' },\n];\n\nexport const SOCIAL_WEDDINGS",
        """  { arabic: 'مُتوَتِّر',   transliteration: 'mutawattir', english: 'Nervous / Stressed', context: '😬 Emotions' },
  { arabic: 'مُرتاح',    transliteration: 'murtaah',    english: 'Relaxed / At ease',  context: '😌 Emotions' },
];

export const SOCIAL_WEDDINGS""",
    ),
    # SOCIAL_WEDDINGS (10 → 12) — add 2
    (
        "english: 'With harmony and children',  context: '💒 Traditional wedding wish' },\n];\n\nexport const SOCIAL_CONDOLENCES",
        """  { arabic: 'الأَفراح دَايِمَة',  transliteration: 'il-afraah daayima',  english: 'May happiness last forever', context: '🎊 Wedding blessing' },
  { arabic: 'ياهلا بالعَروسِين', transliteration: 'yahla bil-\'aroosain', english: 'Welcome to the newlyweds',    context: '💒 Greeting the couple' },
];

export const SOCIAL_CONDOLENCES""",
    ),
    # SOCIAL_RELIGION (10 → 12) — add 2
    (
        "english: 'God bless you',                 context: '🙏 Blessing someone' },\n];\n\nexport const SOCIAL_MANNERS",
        """  { arabic: 'الصَّلاة خَير',  transliteration: 'is-salaah khair',  english: 'Prayer is a blessing',   context: '🕌 Call to prayer phrase' },
  { arabic: 'رَمَضان كَريم',  transliteration: 'ramadhan kareem',  english: 'Generous Ramadan',       context: '🌙 Ramadan greeting' },
];

export const SOCIAL_MANNERS""",
    ),
    # SOCIAL_MANNERS (10 → 12) — add 2
    (
        "english: 'God give you strength',         context: '🙏 Thanking someone for work' },\n];\n",
        """  { arabic: 'إِيش مِن رَأيَك؟', transliteration: "eish min ra'yak?",  english: 'What do you think?',      context: '💭 Asking an opinion' },
  { arabic: 'زَيْن، شُكراً',    transliteration: 'zain, shukran',     english: 'Good, thank you',         context: '✅ Positive acknowledgement' },
];
""",
    ),
]

def main():
    with open(WORDS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    errors = []
    success = 0
    
    for i, (anchor, new_words) in enumerate(EXPANSIONS):
        if anchor not in content:
            errors.append(f"[{i}] NOT FOUND: {repr(anchor[:70])}")
            continue
        # Insert before the closing ];
        idx = anchor.rfind('\n];')
        if idx == -1:
            # Handle special cases where we gave a full replacement
            content = content.replace(anchor, new_words + anchor[anchor.rfind('\n];')+3:], 1)
        insert_before = anchor[:idx]
        insert_after  = anchor[idx:]
        replacement = insert_before + '\n' + new_words + insert_after
        content = content.replace(anchor, replacement, 1)
        success += 1
        print(f"[{i}] ✅ Expanded")
    
    if errors:
        print("\n⚠️  ERRORS:")
        for e in errors:
            print(e)
    
    if content != original:
        with open(WORDS_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\n✅ Saved. {success}/{len(EXPANSIONS)} applied.")
    else:
        print("\n⚠️  No changes made.")

if __name__ == '__main__':
    main()
