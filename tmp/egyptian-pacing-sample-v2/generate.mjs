import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const voiceId = 'LXrTqFIgiubkrMkwvOUr';
const modelId = 'eleven_v3';
const outDir = 'tmp/egyptian-pacing-sample-v2';
const apiKey = process.env.ELEVENLABS_API_KEY;

const voiceSettings = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0,
  use_speaker_boost: true,
};

const samples = [
  // Basic Words sample
  { id: 'basic-01-aywa', source: 'data/egyptian-words.ts:BASIC_WORDS_EG[0]', displayArabic: 'أيوه', audioText: 'أيوه.', evalTarget: 'أيوه', english: 'Yes' },
  { id: 'basic-02-la', source: 'data/egyptian-words.ts:BASIC_WORDS_EG[1]', displayArabic: 'لا', audioText: 'لا.', evalTarget: 'لا', english: 'No' },
  { id: 'basic-03-shukran', source: 'data/egyptian-words.ts:BASIC_WORDS_EG[2]', displayArabic: 'شكراً', audioText: 'شكراً.', evalTarget: 'شكراً', english: 'Thank you' },
  { id: 'basic-04-law-samaht', source: 'data/egyptian-words.ts:BASIC_WORDS_EG[3]', displayArabic: 'لو سمحت', audioText: 'لو سمحت.', evalTarget: 'لو سمحت', english: 'Please / Excuse me' },
  { id: 'basic-05-kwayyis', source: 'data/egyptian-words.ts:BASIC_WORDS_EG[4]', displayArabic: 'كويس', audioText: 'كويس.', evalTarget: 'كويس', english: 'Good' },
  { id: 'basic-10-shwayya', source: 'data/egyptian-words.ts:BASIC_WORDS_EG[9]', displayArabic: 'شوية', audioText: 'شوية.', evalTarget: 'شوية', english: 'A little' },
  { id: 'basic-15-mayya', source: 'data/egyptian-words.ts:BASIC_WORDS_EG[14]', displayArabic: 'ماية', audioText: 'مَيَّه.', evalTarget: 'ماية', english: 'Water' },
  { id: 'basic-18-tamaam', source: 'data/egyptian-words.ts:BASIC_WORDS_EG[17]', displayArabic: 'تمام', audioText: 'تمام.', evalTarget: 'تمام', english: 'OK / Perfect' },
  { id: 'basic-19-yalla', source: 'data/egyptian-words.ts:BASIC_WORDS_EG[18]', displayArabic: 'يلا', audioText: 'يلا.', evalTarget: 'يلا', english: "Let's go" },
  { id: 'basic-20-bikam', source: 'data/egyptian-words.ts:BASIC_WORDS_EG[19]', displayArabic: 'بكام', audioText: 'بكام؟', evalTarget: 'بكام', english: 'How much' },

  // Greetings sample
  { id: 'greetings-01-salaam', source: 'data/egyptian-words.ts:GREETINGS_WORDS_EG[0]', displayArabic: 'السلام عليكم', audioText: 'السلام عليكم.', evalTarget: 'السلام عليكم', english: 'Peace be upon you' },
  { id: 'greetings-03-ahlan', source: 'data/egyptian-words.ts:GREETINGS_WORDS_EG[2]', displayArabic: 'أهلاً وسهلاً', audioText: 'أهلاً وسهلاً.', evalTarget: 'أهلاً وسهلاً', english: 'Welcome' },
  { id: 'greetings-04-izzayyak', source: 'data/egyptian-words.ts:GREETINGS_WORDS_EG[3]', displayArabic: 'إزيك؟', audioText: 'إزيك؟', evalTarget: 'إزيك؟', english: 'How are you?' },
  { id: 'greetings-05-aamel-eih', source: 'data/egyptian-words.ts:GREETINGS_WORDS_EG[4]', displayArabic: 'عامل إيه؟', audioText: 'عامل إيه؟', evalTarget: 'عامل إيه؟', english: 'How are you doing?' },
  { id: 'greetings-combo-izzayyak-aamel-eih', source: 'data/egyptian-words.ts:GREETINGS_WORDS_EG[3-4] pacing test', displayArabic: 'إزيك؟ عامل إيه؟', audioText: 'إزيك؟ عامل إيه؟', evalTarget: 'إزيك؟ عامل إيه؟', english: 'How are you? How are you doing?' },
  { id: 'greetings-06-alhamdulillah', source: 'data/egyptian-words.ts:GREETINGS_WORDS_EG[5]', displayArabic: 'الحمد لله، كويس', audioText: 'الحمد لله. كويس.', evalTarget: 'الحمد لله، كويس', english: "I'm good, praise God" },
  { id: 'greetings-11-goodbye', source: 'data/egyptian-words.ts:GREETINGS_WORDS_EG[10]', displayArabic: 'مع السلامة', audioText: 'مع السلامة.', evalTarget: 'مع السلامة', english: 'Goodbye' },
  { id: 'greetings-13-itfaddal', source: 'data/egyptian-words.ts:GREETINGS_WORDS_EG[12]', displayArabic: 'اتفضل', audioText: 'اتفضل.', evalTarget: 'اتفضل', english: 'Please / Go ahead / Here you go' },

  // Intro sample
  { id: 'intro-01-ana-ismi', source: 'data/egyptian-words.ts:INTRO_WORDS_EG[0]', displayArabic: 'أنا اسمي...', audioText: 'أنا اسمي.', evalTarget: 'أنا اسمي', english: 'My name is...' },
  { id: 'intro-02-ismak-eih', source: 'data/egyptian-words.ts:INTRO_WORDS_EG[1]', displayArabic: 'اسمك إيه؟', audioText: 'اسمك إيه؟', evalTarget: 'اسمك إيه؟', english: 'What is your name?' },
  { id: 'intro-06-inta-minein', source: 'data/egyptian-words.ts:INTRO_WORDS_EG[5]', displayArabic: 'إنت منين؟', audioText: 'إنت منين؟', evalTarget: 'إنت منين؟', english: 'Where are you from?' },
  { id: 'intro-10-arabi-shwayya', source: 'data/egyptian-words.ts:INTRO_WORDS_EG[9]', displayArabic: 'أنا بتكلم عربي شوية', audioText: 'أنا بتكلم عربي، شوية.', evalTarget: 'أنا بتكلم عربي شوية', english: 'I speak a little Arabic' },
  { id: 'intro-11-batallim-masri', source: 'data/egyptian-words.ts:INTRO_WORDS_EG[10]', displayArabic: 'أنا بتعلم مصري', audioText: 'أنا بتعلم مصري.', evalTarget: 'أنا بتعلم مصري', english: 'I am learning Egyptian' },
  { id: 'intro-12-mish-faahim', source: 'data/egyptian-words.ts:INTRO_WORDS_EG[11]', displayArabic: 'مش فاهم', audioText: 'مش فاهم.', evalTarget: 'مش فاهم', english: "I don't understand" },
  { id: 'intro-pacing-birraaha', source: 'data/egyptian-words.ts:INTRO_WORDS_EG[12] example pacing test', displayArabic: 'بالراحة لو سمحت، مش فاهم', audioText: 'بالراحة، لو سمحت. مش فاهم.', evalTarget: 'بالراحة لو سمحت، مش فاهم', english: "Slowly please, I don't understand" },
  { id: 'intro-13-repeat', source: 'data/egyptian-words.ts:INTRO_WORDS_EG[12]', displayArabic: 'ممكن تعيد تاني؟', audioText: 'ممكن تعيد تاني؟', evalTarget: 'ممكن تعيد تاني؟', english: 'Can you repeat?' },

  // First Cafe lines
  { id: 'cafe-00-user-salaam', source: 'data/egyptian-dialogues.ts:CAFE_DIALOGUE_EG[0]', displayArabic: 'السلام عليكم', audioText: 'السلام عليكم.', evalTarget: 'السلام عليكم', english: 'Peace be upon you' },
  { id: 'cafe-01-waiter-welcome', source: 'data/egyptian-dialogues.ts:CAFE_DIALOGUE_EG[1]', displayArabic: 'وعليكم السلام، أهلاً وسهلاً، اتفضل', audioText: 'وعليكم السلام. أهلاً وسهلاً. اتفضل.', evalTarget: 'وعليكم السلام، أهلاً وسهلاً، اتفضل', english: 'And upon you peace, welcome, please sit down' },
  { id: 'cafe-02-waiter-drink', source: 'data/egyptian-dialogues.ts:CAFE_DIALOGUE_EG[2]', displayArabic: 'تحب تشرب إيه؟', audioText: 'تحب تشرب إيه؟', evalTarget: 'تحب تشرب إيه؟', english: 'What would you like to drink?' },
  { id: 'cafe-03-user-coffee', source: 'data/egyptian-dialogues.ts:CAFE_DIALOGUE_EG[3]', displayArabic: 'عايز قهوة تركي لو سمحت', audioText: 'عايز قهوة تركي، لو سمحت.', evalTarget: 'عايز قهوة تركي لو سمحت', english: 'I want Turkish coffee please' },
  { id: 'cafe-04-waiter-sugar', source: 'data/egyptian-dialogues.ts:CAFE_DIALOGUE_EG[4]', displayArabic: 'سادة ولا مظبوط؟', audioText: 'سادة، ولا مظبوط؟', evalTarget: 'سادة ولا مظبوط؟', english: 'Plain or medium sweet?' },
  { id: 'cafe-05-user-medium', source: 'data/egyptian-dialogues.ts:CAFE_DIALOGUE_EG[5]', displayArabic: 'مظبوط لو سمحت', audioText: 'مظبوط، لو سمحت.', evalTarget: 'مظبوط لو سمحت', english: 'Medium sweet please' },
  { id: 'cafe-06-waiter-anything-else', source: 'data/egyptian-dialogues.ts:CAFE_DIALOGUE_EG[6]', displayArabic: 'تمام، حاجة تانية؟', audioText: 'تمام. حاجة تانية؟', evalTarget: 'تمام، حاجة تانية؟', english: 'Okay, anything else?' },
  { id: 'cafe-09-user-bill', source: 'data/egyptian-dialogues.ts:CAFE_DIALOGUE_EG[9]', displayArabic: 'الحساب بكام؟', audioText: 'الحساب كام؟ من فضلك.', evalTarget: 'الحساب بكام؟', english: 'How much is the bill?' },
];

async function synth(sample) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: sample.audioText,
      model_id: modelId,
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text().catch(() => '?')}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const filename = `${sample.id}.mp3`;
  await writeFile(join(outDir, filename), buffer);
  return { ...sample, filename, bytes: buffer.byteLength };
}

if (!apiKey) {
  console.error('Missing ELEVENLABS_API_KEY');
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

const generated = [];
const errors = [];
for (let i = 0; i < samples.length; i++) {
  const sample = samples[i];
  try {
    console.log(`[${i + 1}/${samples.length}] ${sample.id}: ${sample.audioText}`);
    generated.push(await synth(sample));
    if (i < samples.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 450));
    }
  } catch (error) {
    console.error(`FAILED ${sample.id}:`, error);
    errors.push({ ...sample, error: error instanceof Error ? error.message : String(error) });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  voiceId,
  modelId,
  voiceSettings,
  outputDirectory: outDir,
  sampleCount: samples.length,
  generatedCount: generated.length,
  errorCount: errors.length,
  generated,
  errors,
};

await writeFile(join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(
  join(outDir, 'README.md'),
  [
    '# Egyptian pacing sample v2',
    '',
    `Voice: ${voiceId}`,
    `Model: ${modelId}`,
    `Generated: ${generated.length}/${samples.length}`,
    '',
    'These files are tmp-only and are not wired into the app.',
    '',
    '## afplay',
    '',
    '```bash',
    `for f in ${outDir}/*.mp3; do echo "$f"; afplay "$f"; done`,
    '```',
    '',
  ].join('\n'),
);

if (errors.length) {
  process.exitCode = 1;
}
