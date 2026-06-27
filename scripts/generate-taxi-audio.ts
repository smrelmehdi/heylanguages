import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env, then .env.local so private local values can override defaults
for (const envFileName of ['.env', '.env.local']) {
  try {
    const envPath = resolve(process.cwd(), envFileName);
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
    // Env files are optional for scripts; missing keys are checked before generation.
  }
}

import * as fs from 'fs';
import * as path from 'path';
import { resolve as pathResolve } from 'path';
const __dirname = pathResolve('./scripts');

const API_KEY = process.env.ELEVENLABS_API_KEY || '';
const VOICE_ID = 'rUaPbzcZIu8df8iNL9WZ';

const PHRASES = [
  { id: 'w1', text: 'السلام عليكم' },
  { id: 'u1', text: 'وعليكم السلام' },
  { id: 'w2', text: 'وين تروح؟' },
  { id: 'u2', text: 'برج خليفة من فضلك' },
  { id: 'w3', text: 'حاضر، تفضل' },
  { id: 'u3', text: 'شكراً' },
  { id: 'w4', text: 'من وين أنت؟' },
  { id: 'u4', text: 'أنا من المغرب' },
  { id: 'w5', text: 'مرحبا! تحب دبي؟' },
  { id: 'u5', text: 'إيه، دبي حلوة' },
  { id: 'w6', text: 'الحين وصلنا' },
  { id: 'u6', text: 'كم الحساب؟' },
  { id: 'w7', text: 'خمسة وعشرين درهم' },
  { id: 'u7', text: 'تفضل، هذا لك' },
  { id: 'w8', text: 'شكراً، في أمان الله' },
  { id: 'u8', text: 'الله يسلمك' },
];

const outputDir = pathResolve('./assets/audio/taxi');
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
  console.log('🎉 All done! Files saved to assets/audio/taxi/');
}

main().catch(console.error);
