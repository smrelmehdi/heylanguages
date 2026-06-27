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

const API_KEY = process.env.ELEVENLABS_API_KEY || '';
const VOICE_ID = 'VMy40598IGgDeaOE8phq'; // Fathy Hammad — Egyptian Arabic

const PHRASES = [
  { id: 'u1', text: 'السلام عليكم، عندكم حاجة للصداع؟' },
  { id: 'w1', text: 'أيوه طبعاً. عايز بنادول ولا بروفين؟' },
  { id: 'u2', text: 'بنادول لو سمحت. بكام العلبة؟' },
  { id: 'w2', text: 'خمسة وعشرين جنيه' },
  { id: 'u3', text: 'تمام. وعندكم كريم للشمس؟' },
  { id: 'w3', text: 'أيوه، فيه نوعين. المستورد بميت جنيه والمصري بخمسين' },
  { id: 'u4', text: 'هاخد المصري' },
  { id: 'w4', text: 'حاجة تاني؟' },
  { id: 'u5', text: 'لا شكراً، بس كده' },
  { id: 'w5', text: 'المجموع خمسة وسبعين جنيه' },
  { id: 'u6', text: 'اتفضل، شكراً' },
  { id: 'w6', text: 'سلامتك يا باشا' },
];

const outputDir = pathResolve('./assets/audio/egyptian/pharmacy');
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
    console.error('Missing ELEVENLABS_API_KEY in environment');
    process.exit(1);
  }
  console.log(`🎙 Generating ${PHRASES.length} audio files with Fathy Hammad voice (Egyptian)...`);
  for (const phrase of PHRASES) {
    await generateAudio(phrase.id, phrase.text);
  }
  console.log('🎉 All done! Files saved to assets/audio/egyptian/pharmacy/');
}

main().catch(console.error);
