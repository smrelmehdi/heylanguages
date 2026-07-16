/**
 * Temporary ElevenLabs settings test for isolated Unit 4 Arabic words.
 *
 * Generates comparable samples under tmp/elevenlabs-unit4-settings/.
 * Does not touch app audio assets or manifests.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

type VoiceSettings = {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
};

type Profile = {
  name: string;
  model_id: string;
  voice_settings: VoiceSettings;
};

const ROOT = process.cwd();
const OUT_DIR = resolve(ROOT, 'tmp/elevenlabs-unit4-settings');
const VOICE_SULTAN = 'rUaPbzcZIu8df8iNL9WZ';

// Same .env loading order as scripts/generate-all-audio.ts.
for (const envFileName of ['.env', '.env.local']) {
  try {
    const envFile = readFileSync(resolve(ROOT, envFileName), 'utf-8');
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  } catch {
    /* env files optional */
  }
}

const API_KEY = process.env.ELEVENLABS_API_KEY || '';

const words = [
  { text: 'ثلاثة', slug: 'thalatha' },
  { text: 'خمسة', slug: 'khamsa' },
  { text: 'سبعة', slug: 'sabaa' },
  { text: 'عشرة', slug: 'ashara' },
  { text: 'ستة عشر', slug: 'sitta-ashar' },
  { text: 'عشرين', slug: 'ishreen' },
  { text: 'سبعين', slug: 'sabeen' },
  { text: 'تسعين', slug: 'tiseen' },
  { text: 'ألف', slug: 'alf' },
  { text: 'سنة', slug: 'sana' },
  { text: 'رخيص', slug: 'rakhiis' },
  { text: 'خصم', slug: 'khasm' },
  { text: 'كم الساعة؟', slug: 'kam-as-saa-a' },
  { text: 'ساعة', slug: 'saa-a' },
  { text: 'الصبح', slug: 'as-subh' },
  { text: 'المساء', slug: 'al-masaa' },
  { text: 'مارس', slug: 'mars' },
];

const profiles: Profile[] = [
  {
    name: 'current-default',
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.35,
      similarity_boost: 0.85,
      style: 0.25,
      use_speaker_boost: true,
    },
  },
  {
    name: 'stable-flat',
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.8,
      similarity_boost: 0.85,
      style: 0,
      use_speaker_boost: true,
    },
  },
  {
    name: 'mid-stable',
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.6,
      similarity_boost: 0.85,
      style: 0,
      use_speaker_boost: true,
    },
  },
];

async function generateSample(profile: Profile, text: string, outputPath: string): Promise<void> {
  const payload = {
    text,
    model_id: profile.model_id,
    voice_settings: profile.voice_settings,
  };

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_SULTAN}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`ElevenLabs ${response.status} ${response.statusText}: ${errorText.slice(0, 500)}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(outputPath, buffer);
}

async function main() {
  if (!API_KEY) {
    console.error('Missing ELEVENLABS_API_KEY. Add it to .env.local.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Writing test audio to ${OUT_DIR}`);
  console.log(`Voice: Sultan (${VOICE_SULTAN})`);

  for (const profile of profiles) {
    const profileDir = resolve(OUT_DIR, profile.name);
    mkdirSync(profileDir, { recursive: true });

    const firstPayload = {
      text: words[0].text,
      model_id: profile.model_id,
      voice_settings: profile.voice_settings,
    };
    console.log(`\n[${profile.name}] first payload:`);
    console.log(JSON.stringify(firstPayload, null, 2));

    for (const word of words) {
      const outputPath = resolve(profileDir, `${word.slug}.mp3`);
      if (existsSync(outputPath)) {
        console.log(`skip ${profile.name}/${word.slug}.mp3`);
        continue;
      }

      console.log(`generate ${profile.name}/${word.slug}.mp3 ← ${word.text}`);
      await generateSample(profile, word.text, outputPath);
    }
  }

  console.log('\nDone.');
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
