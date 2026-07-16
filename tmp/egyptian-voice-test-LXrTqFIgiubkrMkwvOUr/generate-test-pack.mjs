import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const voiceId = 'LXrTqFIgiubkrMkwvOUr';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = dirname(fileURLToPath(import.meta.url));
const envPath = join(root, '.env.local');

function readElevenLabsKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  if (!existsSync(envPath)) return null;
  const match = readFileSync(envPath, 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

const apiKey = readElevenLabsKey();
if (!apiKey) {
  throw new Error('ELEVENLABS_API_KEY is not available in the environment or .env.local');
}

const samples = [
  {
    filename: '01-basic-yes.mp3',
    arabic: 'أيوه',
    english: 'Yes',
    source: 'data/egyptian-words.ts BASIC_WORDS_EG[0]',
  },
  {
    filename: '02-basic-thanks.mp3',
    arabic: 'شكراً',
    english: 'Thank you',
    source: 'data/egyptian-words.ts BASIC_WORDS_EG[2]',
  },
  {
    filename: '03-basic-please.mp3',
    arabic: 'لو سمحت',
    english: 'Please / Excuse me',
    source: 'data/egyptian-words.ts BASIC_WORDS_EG[3]',
  },
  {
    filename: '04-basic-how-much.mp3',
    arabic: 'بكام؟',
    english: 'How much?',
    source: 'data/egyptian-words.ts BASIC_WORDS_EG[19] stress variant',
  },
  {
    filename: '05-greeting-how-are-you.mp3',
    arabic: 'إزيك؟',
    english: 'How are you?',
    source: 'data/egyptian-words.ts GREETINGS_WORDS_EG[3]',
  },
  {
    filename: '06-goodbye.mp3',
    arabic: 'مع السلامة',
    english: 'Goodbye',
    source: 'data/egyptian-words.ts GREETINGS_WORDS_EG[10]',
  },
  {
    filename: '07-stress-want.mp3',
    arabic: 'عايز',
    english: 'I want',
    source: 'pronunciation stress test from Egyptian content root word',
  },
  {
    filename: '08-stress-where.mp3',
    arabic: 'فين؟',
    english: 'Where?',
    source: 'pronunciation stress test from Egyptian dialogue usage',
  },
  {
    filename: '09-stress-tired.mp3',
    arabic: 'أنا تعبان',
    english: 'I am tired',
    source: 'pronunciation stress test',
  },
  {
    filename: '10-cafe-line.mp3',
    arabic: 'عايز قهوة تركي لو سمحت',
    english: 'I want Turkish coffee please',
    source: 'data/egyptian-dialogues.ts CAFE_DIALOGUE_EG[3]',
  },
  {
    filename: '11-taxi-airport-stress.mp3',
    arabic: 'عايز أروح المطار',
    english: 'I want to go to the airport',
    source: 'pronunciation stress test adapted from data/egyptian-dialogues.ts TAXI_DIALOGUE_EG[2]',
  },
  {
    filename: '12-cafe-bill-stress.mp3',
    arabic: 'الحساب كام؟',
    english: 'How much is the bill?',
    source: 'pronunciation stress test adapted from data/egyptian-dialogues.ts CAFE_DIALOGUE_EG[9]',
  },
  {
    filename: '13-pharmacy-line.mp3',
    arabic: 'بنادول لو سمحت. بكام العلبة؟',
    english: 'Panadol please. How much is the box?',
    source: 'data/egyptian-dialogues.ts PHARMACY_DIALOGUE_EG[2]',
  },
  {
    filename: '14-barbershop-line.mp3',
    arabic: 'عايز أحلق شعري',
    english: 'I want to cut my hair',
    source: 'data/egyptian-dialogues.ts BARBERSHOP_DIALOGUE_EG[2]',
  },
  {
    filename: '15-airport-line.mp3',
    arabic: 'لو سمحت، كاونتر مصر للطيران فين؟',
    english: 'Excuse me, where is the EgyptAir counter?',
    source: 'data/egyptian-dialogues.ts AIRPORT_DIALOGUE_EG[0]',
  },
];

const voiceSettings = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0,
  use_speaker_boost: true,
};

const index = [];
const errors = [];

for (const sample of samples) {
  const dest = join(outDir, sample.filename);
  process.stdout.write(`Generating ${sample.filename} ... `);
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: sample.arabic,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voiceSettings,
      }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${body}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(dest, buffer);
    index.push({
      filename: sample.filename,
      arabic: sample.arabic,
      english: sample.english,
      source: sample.source,
      voiceId,
      settings: voiceSettings,
    });
    console.log('ok');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push({ filename: sample.filename, arabic: sample.arabic, error: message });
    console.log(`failed: ${message}`);
  }
}

writeFileSync(
  join(outDir, 'voice-test-index.json'),
  `${JSON.stringify({ voiceId, samples: index, errors }, null, 2)}\n`,
);

if (errors.length > 0) {
  process.exitCode = 1;
}
