/* eslint-disable no-console */

import { createHash } from 'crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs';
import { dirname, resolve } from 'path';
import { spawnSync } from 'child_process';

const ROOT = resolve(__dirname, '..');
const MANIFEST_PATH = resolve(ROOT, 'tmp/msa-eleven-v3-dry-run.json');
const REPORT_DIR = resolve(ROOT, 'tmp/msa-eleven-v3-production-audio');
const VOICE_ID = 'xvhpbk8otnNHtT3fjCpr';
const MODEL_ID = 'eleven_v3';
// Match the approved sample recipe; this account does not permit the 192 kbps tier.
const OUTPUT_FORMAT = 'api-default';
const EXPECTED_COUNTS: Record<number, number> = {
  1: 51, 2: 80, 3: 62, 4: 57, 5: 56,
  6: 80, 7: 50, 8: 80, 9: 50, 10: 80,
};
const VOICE_SETTINGS = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0,
  use_speaker_boost: true,
};

type ManifestTarget = {
  unit: number;
  lessonOrScenarioId: string;
  itemOrTurnId: string;
  contentType: string;
  displayArabic: string;
  audioText: string;
  evalTarget: string;
  transliteration: string;
  english: string;
  outputPath: string;
  voiceId: string;
  modelId: string;
};

type AudioMetadata = {
  size: number;
  duration: number;
  sha256: string;
};

type GenerationRecord = ManifestTarget & AudioMetadata & {
  status: 'generated' | 'skipped-valid';
  voiceSettings: typeof VOICE_SETTINGS;
  outputFormat: string;
};

for (const envName of ['.env', '.env.local']) {
  try {
    const source = readFileSync(resolve(ROOT, envName), 'utf8');
    for (const line of source.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separator = trimmed.indexOf('=');
      if (separator < 1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // Local environment files are optional; the API key may already be exported.
  }
}

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const validateOnly = args.has('--validate-only');

function sleep(ms: number) {
  return new Promise(resolvePromise => setTimeout(resolvePromise, ms));
}

function readManifest(): ManifestTarget[] {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as { targets?: ManifestTarget[] };
  if (!Array.isArray(manifest.targets)) throw new Error('MSA dry-run manifest has no targets array.');
  return manifest.targets;
}

function validateTargets(targets: ManifestTarget[]) {
  const errors: string[] = [];
  const paths = new Set<string>();
  const ids = new Set<string>();
  const counts: Record<number, number> = {};

  if (targets.length !== 646) errors.push(`Expected 646 targets, found ${targets.length}.`);
  for (const target of targets) {
    counts[target.unit] = (counts[target.unit] ?? 0) + 1;
    if (!target.audioText?.trim()) errors.push(`${target.itemOrTurnId}: empty audioText.`);
    if (!target.displayArabic?.trim()) errors.push(`${target.itemOrTurnId}: empty displayArabic.`);
    if (!target.evalTarget?.trim()) errors.push(`${target.itemOrTurnId}: empty evalTarget.`);
    if (target.voiceId !== VOICE_ID) errors.push(`${target.itemOrTurnId}: wrong voice ${target.voiceId}.`);
    if (target.modelId !== MODEL_ID) errors.push(`${target.itemOrTurnId}: wrong model ${target.modelId}.`);
    const expectedPrefix = `assets/audio/msa/unit-${target.unit}/`;
    if (!target.outputPath.startsWith(expectedPrefix) || !target.outputPath.endsWith('.mp3')) {
      errors.push(`${target.itemOrTurnId}: unsafe output path ${target.outputPath}.`);
    }
    if (paths.has(target.outputPath)) errors.push(`Duplicate output path: ${target.outputPath}.`);
    if (ids.has(target.itemOrTurnId)) errors.push(`Duplicate target ID: ${target.itemOrTurnId}.`);
    paths.add(target.outputPath);
    ids.add(target.itemOrTurnId);
  }
  for (const [unitText, expected] of Object.entries(EXPECTED_COUNTS)) {
    const unit = Number(unitText);
    if (counts[unit] !== expected) errors.push(`Unit ${unit}: expected ${expected}, found ${counts[unit] ?? 0}.`);
  }
  if (errors.length) throw new Error(`MSA preflight failed:\n${errors.join('\n')}`);
}

function inspectMp3(filePath: string): AudioMetadata | null {
  if (!existsSync(filePath)) return null;
  const size = statSync(filePath).size;
  if (size <= 0) return null;
  const probe = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'a:0',
    '-show_entries', 'stream=codec_name:format=duration',
    '-of', 'json', filePath,
  ], { encoding: 'utf8' });
  if (probe.status !== 0) return null;
  try {
    const parsed = JSON.parse(probe.stdout) as {
      streams?: Array<{ codec_name?: string }>;
      format?: { duration?: string };
    };
    const duration = Number(parsed.format?.duration);
    if (parsed.streams?.[0]?.codec_name !== 'mp3' || !Number.isFinite(duration) || duration <= 0) return null;
    const sha256 = createHash('sha256').update(readFileSync(filePath)).digest('hex');
    return { size, duration, sha256 };
  } catch {
    return null;
  }
}

function isTransientStatus(status: number) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

async function generateTarget(target: ManifestTarget): Promise<AudioMetadata> {
  const outputPath = resolve(ROOT, target.outputPath);
  mkdirSync(dirname(outputPath), { recursive: true });
  const tempPath = `${outputPath}.partial-${process.pid}`;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is missing from the environment.');

  let lastError = 'Unknown ElevenLabs error';
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: 'POST',
          headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: target.audioText,
            model_id: MODEL_ID,
            voice_settings: VOICE_SETTINGS,
          }),
        },
      );
      if (!response.ok) {
        const body = (await response.text()).slice(0, 300);
        lastError = `HTTP ${response.status}: ${body}`;
        if (!isTransientStatus(response.status)) break;
      } else {
        writeFileSync(tempPath, Buffer.from(await response.arrayBuffer()));
        const metadata = inspectMp3(tempPath);
        if (!metadata) {
          lastError = 'ElevenLabs returned an invalid or empty MP3.';
        } else {
          renameSync(tempPath, outputPath);
          return metadata;
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    rmSync(tempPath, { force: true });
    if (attempt < 4) await sleep(1000 * 2 ** (attempt - 1));
  }
  rmSync(tempPath, { force: true });
  throw new Error(lastError);
}

function isApprovedReference(target: ManifestTarget) {
  const approved = new Set([
    'مرحباً', 'جيد', 'قهوة', 'ثلاثة عشر', 'هذا كتاب', 'عفواً', 'خمسون', 'غداً', 'أين؟', 'نعم',
    'أنتَ مهندس', 'أنتِ معلمة', 'عمري عشرون سنة', 'الساعة الثالثة والنصف', 'لست متعبا', 'سأذهب غداً',
    'الحاسوب لا يعمل', 'أرسل الملف بالبريد الإلكتروني', 'أرسلها لي على واتساب', 'لدي ألم في بطني',
    'نحتاج إلى سيارة إسعاف', 'هل لديك صعوبة في التنفس؟', 'كم سيستغرق الطريق؟',
    'سأعطيك الدواء، وإذا ساءت الحالة فاتصل بالطوارئ', 'إن شاء الله نلتقي مرة أخرى',
  ]);
  return approved.has(target.displayArabic);
}

function riskReasons(target: ManifestTarget) {
  const reasons: string[] = [];
  if (/[جقثذعحخغ]/.test(target.audioText)) reasons.push('marked consonant');
  if (target.audioText.replace(/[\s،.!؟?ًٌٍَُِّْـ]/g, '').length <= 4) reasons.push('short standalone');
  if (/\d|واحد|اثنان|ثلاث|أربع|خمس|ست|سبع|ثمان|تسع|عشر|مئة|ألف/.test(target.audioText)) reasons.push('number');
  if (/[؟?]/.test(target.audioText)) reasons.push('question');
  if (/طوارئ|إسعاف|شرطة|مستشفى|ألم|تنفس|دواء/.test(target.audioText)) reasons.push('emergency');
  if (/عمل|مكتب|اجتماع|مدير|حاسوب|البريد الإلكتروني|ملف/.test(target.audioText)) reasons.push('workplace');
  if (/واتساب|إنترنت/.test(target.audioText)) reasons.push('loanword');
  if ((target.audioText.match(/[ًٌٍَُِّْ]/g) ?? []).length >= 3) reasons.push('vocalized');
  return reasons;
}

function writeReports(records: GenerationRecord[], failures: Array<{ target: ManifestTarget; error: string }>) {
  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(resolve(REPORT_DIR, 'generation-record.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    voiceId: VOICE_ID,
    modelId: MODEL_ID,
    outputFormat: OUTPUT_FORMAT,
    voiceSettings: VOICE_SETTINGS,
    targetCount: records.length,
    failures,
    records,
  }, null, 2));

  const riskRows = records
    .map(record => ({ record, reasons: riskReasons(record), approved: isApprovedReference(record) }))
    .filter(row => row.reasons.length || row.approved)
    .map(({ record, reasons, approved }) =>
      `| ${record.unit} | ${record.itemOrTurnId} | ${record.displayArabic.replace(/\|/g, '\\|')} | ${approved ? 'approved-reference' : reasons.join(', ')} | ${record.outputPath} | |`,
    );
  writeFileSync(resolve(REPORT_DIR, 'PRONUNCIATION_RISK_REPORT.md'), [
    '# MSA Production Pronunciation Review',
    '',
    `Voice: ${VOICE_ID}`,
    `Model: ${MODEL_ID}`,
    '',
    '| Unit | Target | Display Arabic | Status / risk | Production file | Notes |',
    '| --- | --- | --- | --- | --- | --- |',
    ...riskRows,
    '',
  ].join('\n'));
}

async function main() {
  const targets = readManifest();
  validateTargets(targets);
  const existing = targets.map(target => ({
    target,
    metadata: inspectMp3(resolve(ROOT, target.outputPath)),
  }));
  const valid = existing.filter(item => item.metadata);
  const pending = existing.filter(item => !item.metadata).map(item => item.target);
  console.log(JSON.stringify({
    manifest: 'tmp/msa-eleven-v3-dry-run.json',
    targets: targets.length,
    validExisting: valid.length,
    needingGeneration: pending.length,
    unitCounts: EXPECTED_COUNTS,
    voiceId: VOICE_ID,
    modelId: MODEL_ID,
    outputFormat: OUTPUT_FORMAT,
  }, null, 2));
  if (dryRun) return;
  if (validateOnly && pending.length) process.exitCode = 1;
  if (validateOnly) return;

  const records: GenerationRecord[] = valid.map(({ target, metadata }) => ({
    ...target,
    ...metadata!,
    status: 'skipped-valid',
    voiceSettings: VOICE_SETTINGS,
    outputFormat: OUTPUT_FORMAT,
  }));
  const failures: Array<{ target: ManifestTarget; error: string }> = [];
  let cursor = 0;
  const worker = async (workerId: number) => {
    while (cursor < pending.length) {
      const index = cursor++;
      const target = pending[index];
      console.log(`[${index + 1}/${pending.length}] worker ${workerId}: ${target.outputPath}`);
      try {
        const metadata = await generateTarget(target);
        records.push({
          ...target,
          ...metadata,
          status: 'generated',
          voiceSettings: VOICE_SETTINGS,
          outputFormat: OUTPUT_FORMAT,
        });
      } catch (error) {
        failures.push({ target, error: error instanceof Error ? error.message : String(error) });
      }
      await sleep(250);
    }
  };
  await Promise.all([worker(1), worker(2)]);
  records.sort((a, b) => a.outputPath.localeCompare(b.outputPath));
  writeReports(records, failures);
  console.log(JSON.stringify({
    generated: records.filter(record => record.status === 'generated').length,
    skippedValid: records.filter(record => record.status === 'skipped-valid').length,
    failed: failures.length,
    reportDir: 'tmp/msa-eleven-v3-production-audio',
  }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
