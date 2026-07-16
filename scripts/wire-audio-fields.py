#!/usr/bin/env python3
"""
Wire audio: require() fields into constants/words.ts for unit-4 new words,
and all words in unit-7 and unit-9.

For unit-4 and unit-5: only words WITHOUT an existing audio: require() get one.
For unit-7 and unit-9: all words get audio: require() added.
"""

import re
import os

WORDS_FILE = 'constants/words.ts'
ROOT = 'assets/audio'

# (lesson_key, export_name, unit_folder)
LESSONS = [
    # Unit 4 – numbers
    ('numbers-1-5',       'NUMBERS_1_5_WORDS',       'unit-4/numbers-1-5'),
    ('numbers-6-10',      'NUMBERS_6_10_WORDS',       'unit-4/numbers-6-10'),
    ('numbers-11-20',     'NUMBERS_11_20_WORDS',      'unit-4/numbers-11-20'),
    ('numbers-tens',      'NUMBERS_TENS_WORDS',        'unit-4/numbers-tens'),
    ('numbers-age',       'NUMBERS_AGE_WORDS',         'unit-4/numbers-age'),
    ('numbers-prices',    'NUMBERS_PRICES_WORDS',      'unit-4/numbers-prices'),
    ('numbers-phone',     'NUMBERS_PHONE_WORDS',       'unit-4/numbers-phone'),
    ('numbers-hours',     'NUMBERS_HOURS_WORDS',       'unit-4/numbers-hours'),
    ('numbers-minutes',   'NUMBERS_MINUTES_WORDS',     'unit-4/numbers-minutes'),
    ('numbers-days',      'NUMBERS_DAYS_WORDS',        'unit-4/numbers-days'),
    ('numbers-months',    'NUMBERS_MONTHS_WORDS',      'unit-4/numbers-months'),
    ('numbers-dates',     'NUMBERS_DATES_WORDS',       'unit-4/numbers-dates'),
    ('numbers-ordering',  'NUMBERS_ORDERING_WORDS',    'unit-4/numbers-ordering'),
    ('numbers-together',  'NUMBERS_TOGETHER_WORDS',    'unit-4/numbers-together'),
    # Unit 5 – grammar
    ('grammar-pronouns',       'GRAMMAR_PRONOUNS_WORDS',       'unit-5/grammar-pronouns'),
    ('grammar-this-that',      'GRAMMAR_THIS_THAT_WORDS',      'unit-5/grammar-this-that'),
    ('grammar-possessives',    'GRAMMAR_POSSESSIVES_WORDS',    'unit-5/grammar-possessives'),
    ('grammar-present-verbs',  'GRAMMAR_PRESENT_VERBS_WORDS',  'unit-5/grammar-present-verbs'),
    ('grammar-past-verbs',     'GRAMMAR_PAST_VERBS_WORDS',     'unit-5/grammar-past-verbs'),
    ('grammar-want-need',      'GRAMMAR_WANT_NEED_WORDS',      'unit-5/grammar-want-need'),
    ('grammar-questions',      'GRAMMAR_QUESTIONS_WORDS',      'unit-5/grammar-questions'),
    ('grammar-negation',       'GRAMMAR_NEGATION_WORDS',       'unit-5/grammar-negation'),
    ('grammar-adjectives',     'GRAMMAR_ADJECTIVES_WORDS',     'unit-5/grammar-adjectives'),
    ('grammar-sentences',      'GRAMMAR_SENTENCES_WORDS',      'unit-5/grammar-sentences'),
    # Unit 7 – work
    ('work-office',     'WORK_OFFICE_WORDS',     'unit-7/work-office'),
    ('work-greetings',  'WORK_GREETINGS_WORDS',  'unit-7/work-greetings'),
    ('work-meeting',    'WORK_MEETING_WORDS',     'unit-7/work-meeting'),
    ('work-phone',      'WORK_PHONE_WORDS',       'unit-7/work-phone'),
    ('work-email',      'WORK_EMAIL_WORDS',       'unit-7/work-email'),
    ('work-schedule',   'WORK_SCHEDULE_WORDS',    'unit-7/work-schedule'),
    ('work-problems',   'WORK_PROBLEMS_WORDS',    'unit-7/work-problems'),
    ('work-smalltalk',  'WORK_SMALLTALK_WORDS',   'unit-7/work-smalltalk'),
    ('work-salary',     'WORK_SALARY_WORDS',      'unit-7/work-salary'),
    ('work-leaving',    'WORK_LEAVING_WORDS',     'unit-7/work-leaving'),
    # Unit 9 – social
    ('social-greetings',   'SOCIAL_GREETINGS_WORDS',   'unit-9/social-greetings'),
    ('social-family',      'SOCIAL_FAMILY_WORDS',       'unit-9/social-family'),
    ('social-invitations', 'SOCIAL_INVITATIONS_WORDS', 'unit-9/social-invitations'),
    ('social-ramadan',     'SOCIAL_RAMADAN_WORDS',      'unit-9/social-ramadan'),
    ('social-compliments', 'SOCIAL_COMPLIMENTS_WORDS', 'unit-9/social-compliments'),
    ('social-emotions',    'SOCIAL_EMOTIONS_WORDS',     'unit-9/social-emotions'),
    ('social-weddings',    'SOCIAL_WEDDINGS_WORDS',     'unit-9/social-weddings'),
    ('social-condolences', 'SOCIAL_CONDOLENCES_WORDS', 'unit-9/social-condolences'),
    ('social-religion',    'SOCIAL_RELIGION_WORDS',     'unit-9/social-religion'),
    ('social-manners',     'SOCIAL_MANNERS_WORDS',      'unit-9/social-manners'),
]

def audio_exists(folder, index_1based):
    return os.path.exists(os.path.join(ROOT, folder, f'{index_1based}.mp3'))

def wire_array(content, export_name, audio_folder):
    """Find the array in content and add audio: require() to words that don't already have it."""
    # Find the array body between "export const NAME: Word[] = [" and the matching "];"
    pattern = rf'(export const {re.escape(export_name)}: Word\[\] = \[)(.*?)(\n\];)'
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return content, 0, 0

    prefix = match.group(1)
    body = match.group(2)
    suffix = match.group(3)

    lines = body.split('\n')
    new_lines = []
    word_index = 0  # 0-based within the array
    added = 0
    skipped = 0

    for line in lines:
        # Count opening braces to track word index
        stripped = line.strip()
        if stripped.startswith('{ arabic:'):
            word_index += 1  # 1-based file index
            mp3_path = f'../assets/audio/{audio_folder}/{word_index}.mp3'
            if 'audio:' in line:
                # Already has audio field – skip
                new_lines.append(line)
                skipped += 1
            elif not audio_exists(audio_folder, word_index):
                # Audio file doesn't exist yet – skip
                new_lines.append(line)
            else:
                # Add audio field before closing }
                # Strip trailing comma/space/}
                line_stripped = line.rstrip()
                if line_stripped.endswith('},'):
                    line_stripped = line_stripped[:-2]
                    new_line = line_stripped + f",\n    audio: require('{mp3_path}') }},"
                elif line_stripped.endswith('}'):
                    line_stripped = line_stripped[:-1]
                    new_line = line_stripped + f",\n    audio: require('{mp3_path}') }}"
                else:
                    new_line = line
                new_lines.append(new_line)
                added += 1
        else:
            new_lines.append(line)

    new_body = '\n'.join(new_lines)
    new_content = content[:match.start()] + prefix + new_body + suffix + content[match.end():]
    return new_content, added, skipped

def main():
    with open(WORDS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    total_added = 0
    total_skipped = 0

    for lesson_key, export_name, audio_folder in LESSONS:
        content, added, skipped = wire_array(content, export_name, audio_folder)
        if added > 0:
            print(f'  ✅ {export_name}: +{added} audio fields wired ({skipped} already had audio)')
        elif skipped > 0:
            print(f'  ⏭️  {export_name}: all {skipped} words already wired')
        total_added += added
        total_skipped += skipped

    if content != original:
        with open(WORDS_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'\n✅ Saved. {total_added} audio fields added, {total_skipped} already present.')
    else:
        print('\n⚠️  No changes made.')

if __name__ == '__main__':
    main()
