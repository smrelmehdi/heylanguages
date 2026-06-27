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
const VOICE_ID = 'VMy40598IGgDeaOE8phq'; // Fathy Hammad — Egyptian Arabic

// ── Basic Words (20 words) ────────────────────────────────────────────────────
const BASIC_WORDS = [
  { id: '1',  text: 'أيوه' },
  { id: '2',  text: 'لا' },
  { id: '3',  text: 'شكراً' },
  { id: '4',  text: 'لو سمحت' },
  { id: '5',  text: 'كويس' },
  { id: '6',  text: 'وحش' },
  { id: '7',  text: 'كبير' },
  { id: '8',  text: 'صغير' },
  { id: '9',  text: 'كتير' },
  { id: '10', text: 'شوية' },
  { id: '11', text: 'دلوقتي' },
  { id: '12', text: 'بعدين' },
  { id: '13', text: 'هنا' },
  { id: '14', text: 'هناك' },
  { id: '15', text: 'ماية' },
  { id: '16', text: 'أكل' },
  { id: '17', text: 'فلوس' },
  { id: '18', text: 'تمام' },
  { id: '19', text: 'يالله' },
  { id: '20', text: 'بكام' },
];

// ── Greetings (15 words) ──────────────────────────────────────────────────────
const GREETINGS_WORDS = [
  { id: '1',  text: 'السلام عليكم' },
  { id: '2',  text: 'وعليكم السلام' },
  { id: '3',  text: 'أهلاً وسهلاً' },
  { id: '4',  text: 'إزيك؟' },
  { id: '5',  text: 'إزيك؟' },
  { id: '6',  text: 'الحمد لله، كويس' },
  { id: '7',  text: 'صباح الخير' },
  { id: '8',  text: 'صباح النور' },
  { id: '9',  text: 'مساء الخير' },
  { id: '10', text: 'مساء النور' },
  { id: '11', text: 'مع السلامة' },
  { id: '12', text: 'الله يسلمك' },
  { id: '13', text: 'اتفضل' },
  { id: '14', text: 'نورتنا' },
  { id: '15', text: 'تصبح على خير' },
];

// ── Intro Yourself (15 words) ─────────────────────────────────────────────────
const INTRO_WORDS = [
  { id: '1',  text: 'أنا اسمي' },
  { id: '2',  text: 'اسمك إيه؟' },
  { id: '3',  text: 'اسمك إيه؟' },
  { id: '4',  text: 'تشرفنا' },
  { id: '5',  text: 'أنا من' },
  { id: '6',  text: 'إنت منين؟' },
  { id: '7',  text: 'إنتي منين؟' },
  { id: '8',  text: 'أنا ساكن في' },
  { id: '9',  text: 'أنا شغال' },
  { id: '10', text: 'أنا بتكلم عربي شوية' },
  { id: '11', text: 'أنا بتعلم مصري' },
  { id: '12', text: 'مش فاهم' },
  { id: '13', text: 'ممكن تعيد تاني؟' },
  { id: '14', text: 'بتتكلم إنجليزي؟' },
  { id: '15', text: 'أنا مبسوط إني هنا' },
];

const LESSON_SETS = [
  { name: 'basic-words', phrases: BASIC_WORDS },
  { name: 'greetings',   phrases: GREETINGS_WORDS },
  { name: 'intro',       phrases: INTRO_WORDS },
];

async function generateAudio(outputDir: string, id: string, text: string): Promise<void> {
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

  for (const lessonSet of LESSON_SETS) {
    const outputDir = pathResolve(`./assets/audio/egyptian/${lessonSet.name}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`\n📚 Generating ${lessonSet.phrases.length} files for Egyptian ${lessonSet.name}...`);
    for (const phrase of lessonSet.phrases) {
      await generateAudio(outputDir, phrase.id, phrase.text);
    }
    console.log(`✅ Done: assets/audio/egyptian/${lessonSet.name}/`);
  }

  console.log('\n🎉 All Egyptian lesson audio generated!');
}

main().catch(console.error);
