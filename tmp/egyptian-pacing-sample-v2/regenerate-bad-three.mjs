import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const voiceId = 'LXrTqFIgiubkrMkwvOUr';
const modelId = 'eleven_v3';
const outDir = 'tmp/egyptian-pacing-sample-v2/bad-three-retry';
const apiKey = process.env.ELEVENLABS_API_KEY;

const voiceSettings = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0,
  use_speaker_boost: true,
};

const samples = [
  {
    id: 'basic-05-kwayyis-a',
    source: 'data/egyptian-words.ts:BASIC_WORDS_EG[4]',
    displayArabic: 'كويس',
    audioText: 'كُوَيِّس.',
    evalTarget: 'كويس',
    english: 'Good',
    note: 'Light tashkeel to guide Egyptian kwayyis pronunciation.',
  },
  {
    id: 'basic-05-kwayyis-b',
    source: 'data/egyptian-words.ts:BASIC_WORDS_EG[4]',
    displayArabic: 'كويس',
    audioText: 'كويس، تمام.',
    evalTarget: 'كويس',
    english: 'Good',
    note: 'Adds a natural following word to avoid clipped one-word output.',
  },
  {
    id: 'basic-05-kwayyis-c',
    source: 'data/egyptian-words.ts:BASIC_WORDS_EG[4]',
    displayArabic: 'كويس',
    audioText: 'كويس. الحمد لله.',
    evalTarget: 'كويس',
    english: 'Good',
    note: 'Phrase context for pacing; use only if isolated word keeps clipping.',
  },
  {
    id: 'basic-10-shwayya-a',
    source: 'data/egyptian-words.ts:BASIC_WORDS_EG[9]',
    displayArabic: 'شوية',
    audioText: 'شُوَيَّة.',
    evalTarget: 'شوية',
    english: 'A little',
    note: 'Light tashkeel to guide shwayya pronunciation.',
  },
  {
    id: 'basic-10-shwayya-b',
    source: 'data/egyptian-words.ts:BASIC_WORDS_EG[9]',
    displayArabic: 'شوية',
    audioText: 'شوية، بس.',
    evalTarget: 'شوية',
    english: 'A little',
    note: 'Adds short context to reduce clipped output.',
  },
  {
    id: 'basic-10-shwayya-c',
    source: 'data/egyptian-words.ts:BASIC_WORDS_EG[9]',
    displayArabic: 'شوية',
    audioText: 'عايز شوية.',
    evalTarget: 'شوية',
    english: 'A little',
    note: 'Natural phrase context if isolated word is too short.',
  },
  {
    id: 'basic-15-mayya-a',
    source: 'data/egyptian-words.ts:BASIC_WORDS_EG[14]',
    displayArabic: 'ماية',
    audioText: 'مَيَّه.',
    evalTarget: 'ماية',
    english: 'Water',
    note: 'Same clean tashkeel baseline for comparison.',
  },
  {
    id: 'basic-15-mayya-b',
    source: 'data/egyptian-words.ts:BASIC_WORDS_EG[14]',
    displayArabic: 'ماية',
    audioText: 'مَيَّه، لو سمحت.',
    evalTarget: 'ماية',
    english: 'Water',
    note: 'Natural request context to slow the target word.',
  },
  {
    id: 'basic-15-mayya-c',
    source: 'data/egyptian-words.ts:BASIC_WORDS_EG[14]',
    displayArabic: 'ماية',
    audioText: 'عايز مَيَّه.',
    evalTarget: 'ماية',
    english: 'Water',
    note: 'Natural phrase context for pronunciation and pacing.',
  },
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
    '# Egyptian pacing sample v2: bad-three retry',
    '',
    'Tmp-only retry variants for:',
    '- basic-05 / كويس',
    '- basic-10 / شوية',
    '- basic-15 / ماية',
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
