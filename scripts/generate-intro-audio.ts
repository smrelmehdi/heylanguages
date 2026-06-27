import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env manually
try {
  const envPath = resolve(process.cwd(), '.env');
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    process.env[key] = value;
  }
} catch (e) {
  console.error('Could not load .env file');
}

import * as fs from 'fs';
import * as path from 'path';
import { resolve as pathResolve } from 'path';

const API_KEY = process.env.ELEVENLABS_API_KEY || '';
const VOICE_ID = 'rUaPbzcZIu8df8iNL9WZ';

const PHRASES = [
  { id: '1',  text: 'اسمي' },
  { id: '2',  text: 'أنا من' },
  { id: '3',  text: 'عمري' },
  { id: '4',  text: 'أسكن في' },
  { id: '5',  text: 'أشتغل' },
  { id: '6',  text: 'أتكلم' },
  { id: '7',  text: 'شوية' },
  { id: '8',  text: 'أعرف' },
  { id: '9',  text: 'أحب' },
  { id: '10', text: 'كثير' },
  { id: '11', text: 'قليل' },
  { id: '12', text: 'سعيد' },
  { id: '13', text: 'متزوج' },
  { id: '14', text: 'عندي' },
  { id: '15', text: 'ما عندي' },
];

const outputDir = pathResolve('./assets/audio/intro');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateAudio(id: string, text: string): Promise<void> {
  const filePath = path.join(outputDir, `${id}.mp3`);

  console.log(`⏳ Generating ${id}: ${text}`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.85,
          style: 0.25,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    console.error(`✗ ${id} failed: ${response.status} ${await response.text()}`);
    return;
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(buffer));
  console.log(`✅ ${id} saved`);

  await new Promise(r => setTimeout(r, 500));
}

async function main() {
  if (!API_KEY) {
    console.error('Missing ELEVENLABS_API_KEY in environment');
    process.exit(1);
  }
  console.log(`🎙 Generating ${PHRASES.length} audio files with Sultan voice...`);
  for (const phrase of PHRASES) {
    await generateAudio(phrase.id, phrase.text);
  }
  console.log('🎉 All done! Files saved to assets/audio/intro/');
}

main().catch(console.error);
