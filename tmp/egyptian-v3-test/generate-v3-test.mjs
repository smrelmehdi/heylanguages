import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function optionValue(name, fallback = null) {
  const args = process.argv.slice(2);
  const prefix = `${name}=`;
  const inline = args.find(arg => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1] ?? fallback;
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '..', '..');
const envPath = join(root, '.env.local');
const voiceId = optionValue('--voice-id', 'LXrTqFIgiubkrMkwvOUr');
const modelId = optionValue('--model-id', 'eleven_v3');
const outDir = resolve(root, optionValue('--out-dir', 'tmp/egyptian-v3-test'));
const outputFormatArg = optionValue('--output-format', 'default');
const outputFormat = outputFormatArg === 'default' || outputFormatArg === 'none' ? null : outputFormatArg;

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

const voiceSettings = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0,
  use_speaker_boost: true,
};

const samples = [
  { filename: '01-izzayyak.mp3', text: 'إزيك؟' },
  { filename: '02-izzayak-alt.mp3', text: 'إزايك؟' },
  { filename: '03-izzayyak-aamel-eih.mp3', text: 'إزيك؟ عامل إيه؟' },
  { filename: '04-airport.mp3', text: 'أنا عايز أروح المطار' },
  { filename: '05-bill.mp3', text: 'الحساب كام؟' },
  { filename: '06-bathroom.mp3', text: 'فين الحمام؟' },
  { filename: '07-thanks.mp3', text: 'شكراً' },
  { filename: '08-goodbye.mp3', text: 'مع السلامة' },
  { filename: '09-coffee.mp3', text: 'عايز قهوة' },
  { filename: '10-tired.mp3', text: 'أنا تعبان' },
  { filename: '11-how-much-this.mp3', text: 'بكام ده؟' },
  { filename: '12-please.mp3', text: 'من فضلك' },
];

const payloads = [];
const errors = [];

for (const sample of samples) {
  const requestBody = {
    text: sample.text,
    model_id: modelId,
    voice_settings: voiceSettings,
  };
  const url = outputFormat
    ? `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${encodeURIComponent(outputFormat)}`
    : `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const payload = {
    filename: sample.filename,
    text: sample.text,
    voice_id: voiceId,
    model_id: modelId,
    voice_settings: voiceSettings,
    output_format: outputFormat,
    request_url: url.replace(voiceId, '{voice_id}'),
    request_body: requestBody,
  };

  process.stdout.write(`Generating ${sample.filename} ... `);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    payload.response_status = response.status;
    if (!response.ok) {
      payload.response_body = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${payload.response_body}`);
    }
    writeFileSync(join(outDir, sample.filename), Buffer.from(await response.arrayBuffer()));
    payloads.push(payload);
    console.log('ok');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push({ ...payload, error: message });
    console.log(`failed: ${message}`);
  }
}

writeFileSync(
  join(outDir, 'voice-test-payloads.json'),
  `${JSON.stringify({ voice_id: voiceId, model_id: modelId, output_format: outputFormat, samples: payloads, errors }, null, 2)}\n`,
);

if (errors.length > 0) {
  process.exitCode = 1;
}
