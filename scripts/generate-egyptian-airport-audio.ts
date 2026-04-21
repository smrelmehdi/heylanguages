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
const __dirname = pathResolve('./scripts');

const API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
const VOICE_ID = 'VMy40598IGgDeaOE8phq'; // Fathy Hammad — Egyptian Arabic

const PHRASES = [
  { id: 'u1', text: 'لو سمحت، كاونتر مصر للطيران فين؟' },
  { id: 'w1', text: 'على طول وبعدين يمين، هتلاقيه قدامك' },
  { id: 'u2', text: 'شكراً' },
  { id: 'w2', text: 'صباح الخير، الباسبور وتذكرة الطيران لو سمحت' },
  { id: 'u3', text: 'اتفضلي' },
  { id: 'w3', text: 'عايز مكان شباك ولا ممر؟' },
  { id: 'u4', text: 'شباك لو سمحتي' },
  { id: 'w4', text: 'عندك شنط هتشحنها؟' },
  { id: 'u5', text: 'أيوه، شنطة واحدة بس' },
  { id: 'w5', text: 'حطها على الميزان لو سمحت' },
  { id: 'w6', text: 'تمام، عشرين كيلو. البوردينج باس بتاعك، البوابة رقم تمنية' },
  { id: 'u6', text: 'الطيارة هتقلع الساعة كام؟' },
  { id: 'w7', text: 'الساعة تلاتة ونص، يعني عندك ساعة' },
  { id: 'u7', text: 'تمام، شكراً جزيلاً' },
  { id: 'w8', text: 'العفو، رحلة سعيدة' },
];

const outputDir = pathResolve('./assets/audio/egyptian/airport');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateAudio(id: string, text: string): Promise<void> {
  const filePath = path.join(outputDir, `${id}.mp3`);
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${id} already exists, skipping`);
    return;
  }

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
    console.error('Missing EXPO_PUBLIC_ELEVENLABS_API_KEY in environment');
    process.exit(1);
  }
  console.log(`🎙 Generating ${PHRASES.length} audio files with Fathy Hammad voice (Egyptian)...`);
  for (const phrase of PHRASES) {
    await generateAudio(phrase.id, phrase.text);
  }
  console.log('🎉 All done! Files saved to assets/audio/egyptian/airport/');
}

main().catch(console.error);
