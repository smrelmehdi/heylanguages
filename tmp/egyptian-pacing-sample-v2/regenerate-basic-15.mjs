import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const voiceId = 'LXrTqFIgiubkrMkwvOUr';
const modelId = 'eleven_v3';
const outDir = 'tmp/egyptian-pacing-sample-v2/basic-15-mayya-retry';
const apiKey = process.env.ELEVENLABS_API_KEY;

const voiceSettings = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0,
  use_speaker_boost: true,
};

const samples = [
  {
    id: 'basic-15-mayya-d',
    displayArabic: 'ماية',
    audioText: 'مَيَّة.',
    evalTarget: 'ماية',
    english: 'Water',
    note: 'Common Egyptian spelling with shadda to guide mayya.',
  },
  {
    id: 'basic-15-mayya-e',
    displayArabic: 'ماية',
    audioText: 'مَيَّة، لو سمحت.',
    evalTarget: 'ماية',
    english: 'Water',
    note: 'Request context while keeping target word first.',
  },
  {
    id: 'basic-15-mayya-f',
    displayArabic: 'ماية',
    audioText: 'عايز مَيَّة.',
    evalTarget: 'ماية',
    english: 'Water',
    note: 'Natural phrase context.',
  },
  {
    id: 'basic-15-mayya-g',
    displayArabic: 'ماية',
    audioText: 'مَيَّة باردة.',
    evalTarget: 'ماية',
    english: 'Water',
    note: 'Adds a following adjective to avoid clipping.',
  },
  {
    id: 'basic-15-mayya-h',
    displayArabic: 'ماية',
    audioText: 'إزازة مَيَّة.',
    evalTarget: 'ماية',
    english: 'Water',
    note: 'Very natural Egyptian phrase with clear target word.',
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
