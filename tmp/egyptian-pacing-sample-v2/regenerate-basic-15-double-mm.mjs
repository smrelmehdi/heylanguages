import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const voiceId = 'LXrTqFIgiubkrMkwvOUr';
const modelId = 'eleven_v3';
const outDir = 'tmp/egyptian-pacing-sample-v2/basic-15-double-mm-retry';
const apiKey = process.env.ELEVENLABS_API_KEY;

const voiceSettings = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0,
  use_speaker_boost: true,
};

const samples = [
  {
    id: 'basic-15-mayya-mm-a',
    displayArabic: 'ماية',
    audioText: 'ممَيَّة.',
    evalTarget: 'ماية',
    english: 'Water',
    note: 'Pronunciation-only doubled initial m.',
  },
  {
    id: 'basic-15-mayya-mm-b',
    displayArabic: 'ماية',
    audioText: 'مِمَيَّة.',
    evalTarget: 'ماية',
    english: 'Water',
    note: 'Doubled initial m with short kasra separator.',
  },
  {
    id: 'basic-15-mayya-mm-c',
    displayArabic: 'ماية',
    audioText: 'مْمَيَّة.',
    evalTarget: 'ماية',
    english: 'Water',
    note: 'Sukun plus doubled initial m.',
  },
  {
    id: 'basic-15-mayya-mm-d',
    displayArabic: 'ماية',
    audioText: 'ممَيَّة، لو سمحت.',
    evalTarget: 'ماية',
    english: 'Water',
    note: 'Doubled initial m with request context.',
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
    if (i < samples.length - 1) await new Promise(resolve => setTimeout(resolve, 450));
  } catch (error) {
    console.error(`FAILED ${sample.id}:`, error);
    errors.push({ ...sample, error: error instanceof Error ? error.message : String(error) });
  }
}

await writeFile(join(outDir, 'report.json'), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  voiceId,
  modelId,
  voiceSettings,
  outputDirectory: outDir,
  generatedCount: generated.length,
  errorCount: errors.length,
  generated,
  errors,
}, null, 2)}\n`);

if (errors.length) process.exitCode = 1;
