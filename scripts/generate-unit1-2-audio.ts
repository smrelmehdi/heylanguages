/**
 * Resumable generator for the approved Unit 1/2 v2 local-audio plan.
 *
 * Safe inspection:
 *   npx tsx scripts/generate-unit1-2-audio.ts --dry-run
 *
 * Generation (future; requires ELEVENLABS_API_KEY):
 *   npx tsx scripts/generate-unit1-2-audio.ts --report=reports/audio/unit1-2-generation.json
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import {
  buildUnit1_2AudioManifest,
  EGYPTIAN_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS,
  MSA_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS,
  MIN_VALID_AUDIO_BYTES,
  summarizeUnit1_2AudioManifest,
  type Unit1_2AudioManifestEntry,
} from './lib/unit1-2-audio-plan';

for (const envFileName of ['.env', '.env.local']) {
  try {
    for (const line of readFileSync(resolve(process.cwd(), envFileName), 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const equals = trimmed.indexOf('=');
      if (equals < 1) continue;
      const key = trimmed.slice(0, equals).trim();
      if (process.env[key] === undefined) process.env[key] = trimmed.slice(equals + 1).trim();
    }
  } catch {
    // Local environment files are optional; generation validates its key below.
  }
}

const args = process.argv.slice(2);
const flags = new Set(args);
const option = (name: string) => {
  const inline = args.find(arg => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? null : null;
};

const dryRun = flags.has('--dry-run');
const force = flags.has('--force');
const dialectFilter = option('--dialect');
const unitFilterRaw = option('--unit');
const missionFilter = option('--mission');
const audioKeyFilter = option('--audio-key');
const retryFailedReport = option('--retry-failed');
const egyptianBoundaryPilot = flags.has('--egyptian-boundary-pilot');
const egyptianBoundaryRisk = flags.has('--egyptian-boundary-risk');
const pilotAudioKeys = (option('--pilot-audio-keys') ?? '').split(',').filter(Boolean);
const pilotOutputDirectory = resolve(option('--pilot-output') ?? '/tmp/heyyusuf-egy-boundary-pilot');
const reportPath = resolve(process.cwd(), option('--report') ?? 'reports/audio/unit1-2-generation.json');
const delayMs = Number(option('--delay-ms') ?? 900);
const maxAttempts = Number(option('--max-attempts') ?? 3);

if (dialectFilter && !['msa', 'gulf', 'egyptian'].includes(dialectFilter)) throw new Error(`Unsupported --dialect: ${dialectFilter}`);
if (unitFilterRaw && !['1', '2'].includes(unitFilterRaw)) throw new Error(`Unsupported --unit: ${unitFilterRaw}`);
if (audioKeyFilter && !/^[a-f0-9]{20}$/.test(audioKeyFilter)) throw new Error(`Invalid --audio-key: ${audioKeyFilter}`);
if (!Number.isFinite(delayMs) || delayMs < 250) throw new Error('--delay-ms must be at least 250');
if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) throw new Error('--max-attempts must be between 1 and 5');
if (egyptianBoundaryPilot && pilotAudioKeys.length !== 6) throw new Error('Egyptian boundary pilot requires exactly six --pilot-audio-keys.');
if (egyptianBoundaryPilot && new Set(pilotAudioKeys).size !== pilotAudioKeys.length) throw new Error('Egyptian boundary pilot keys must be unique.');

type GenerationResult = {
  audioKey: string;
  referenceId: string;
  canonicalText: string;
  synthesisText: string;
  providerText: string;
  boundaryWrapped: boolean;
  outputPath: string;
  status: 'would_generate' | 'skipped_valid' | 'generated' | 'failed';
  attempts: number;
  error?: string;
};

function loadFailedKeys(path: string | null) {
  if (!path) return null;
  const parsed = JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8')) as { results?: GenerationResult[] };
  return new Set((parsed.results ?? []).filter(result => result.status === 'failed').map(result => result.audioKey));
}

function selectedEntries() {
  const failedKeys = loadFailedKeys(retryFailedReport);
  const all = buildUnit1_2AudioManifest();
  const matchingReferences = all.filter(entry =>
    (!dialectFilter || entry.dialect === dialectFilter)
    && (!unitFilterRaw || entry.unitNumber === Number(unitFilterRaw))
    && (!missionFilter || entry.missionSemanticId === missionFilter)
    && (!audioKeyFilter || entry.audioKey === audioKeyFilter)
    && (!egyptianBoundaryRisk || (EGYPTIAN_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS as readonly string[]).includes(entry.audioKey))
  );
  const selectedKeys = new Set(matchingReferences.map(entry => entry.audioKey));
  const selected = all.filter(entry =>
    entry.reuseSource === null
    && selectedKeys.has(entry.audioKey)
    && (!failedKeys || failedKeys.has(entry.audioKey)),
  );
  return { all, selected };
}

const boundarySafeKeys = new Set<string>([
  ...EGYPTIAN_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS,
  ...MSA_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS,
]);

function providerInput(entry: Unit1_2AudioManifestEntry) {
  const boundaryWrapped = boundarySafeKeys.has(entry.audioKey);
  return {
    synthesisText: entry.synthesisText,
    providerText: boundaryWrapped ? `[short pause] ${entry.synthesisText} [short pause]` : entry.synthesisText,
    boundaryWrapped,
  };
}

function validateMp3(path: string) {
  if (!existsSync(path) || statSync(path).size < MIN_VALID_AUDIO_BYTES) return false;
  const header = readFileSync(path).subarray(0, 3);
  const hasMp3Header = header.toString('ascii') === 'ID3' || (header[0] === 0xff && (header[1] & 0xe0) === 0xe0);
  if (!hasMp3Header) return false;
  const probe = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'a:0',
    '-show_entries', 'stream=codec_name:format=duration',
    '-of', 'json', path,
  ], { encoding: 'utf8' });
  if (probe.status !== 0) return false;
  try {
    const parsed = JSON.parse(probe.stdout) as { streams?: Array<{ codec_name?: string }>; format?: { duration?: string } };
    return parsed.streams?.[0]?.codec_name === 'mp3' && Number(parsed.format?.duration) > 0;
  } catch {
    return false;
  }
}

const sleep = (milliseconds: number) => new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));

class FatalProviderError extends Error {}

async function synthesize(
  entry: Unit1_2AudioManifestEntry,
  apiKey: string,
  providerText = entry.synthesisText,
  languageCode?: string,
) {
  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${entry.voiceId}?output_format=${entry.outputFormat}`;
  let lastError = 'unknown provider failure';
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: providerText,
          model_id: entry.model,
          voice_settings: entry.voiceSettings,
          ...(languageCode ? { language_code: languageCode } : {}),
        }),
      });
      if (response.status === 401 || response.status === 403) {
        throw new FatalProviderError(`ElevenLabs authentication failed (HTTP ${response.status}).`);
      }
      if (response.status === 402) throw new FatalProviderError('ElevenLabs quota or billing authorization failed (HTTP 402).');
      if (!response.ok) {
        lastError = `ElevenLabs HTTP ${response.status}`;
        if (response.status === 429 && attempt === maxAttempts) {
          throw new FatalProviderError('ElevenLabs rate or quota limit persisted after bounded retries (HTTP 429).');
        }
        if (response.status < 500 && response.status !== 408 && response.status !== 429) break;
      } else {
        return { bytes: Buffer.from(await response.arrayBuffer()), attempts: attempt };
      }
    } catch (error) {
      if (error instanceof FatalProviderError) throw error;
      lastError = error instanceof Error ? error.message : String(error);
    }
    if (attempt < maxAttempts) await sleep(750 * (2 ** (attempt - 1)));
  }
  throw new Error(lastError);
}

function audioDuration(path: string) {
  const probe = spawnSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path,
  ], { encoding: 'utf8' });
  const duration = Number(probe.stdout.trim());
  if (probe.status !== 0 || !(duration > 0)) throw new Error(`Could not read audio duration: ${path}`);
  return duration;
}

async function runEgyptianBoundaryPilot(apiKey: string) {
  if (!apiKey) throw new FatalProviderError('ELEVENLABS_API_KEY is required. The key value was not printed.');
  if (!pilotOutputDirectory.startsWith('/tmp/')) throw new Error('Egyptian boundary pilot output must stay under /tmp/.');
  const manifest = buildUnit1_2AudioManifest();
  const entries = pilotAudioKeys.map(audioKey => manifest.find(entry => entry.audioKey === audioKey && entry.reuseSource === null));
  if (entries.some(entry => !entry)) throw new Error('Every pilot key must resolve to a unique manifest generation source.');
  const selected = entries as Unit1_2AudioManifestEntry[];
  if (selected.some(entry => entry.dialect !== 'egyptian' || entry.model !== 'eleven_v3')) {
    throw new Error('Egyptian boundary pilot accepts only Egyptian eleven_v3 entries.');
  }
  mkdirSync(pilotOutputDirectory, { recursive: true });
  const results = [];
  for (const [index, entry] of selected.entries()) {
    const number = String(index + 1).padStart(2, '0');
    const originalPath = resolve(entry.intendedOutputPath);
    const originalCopy = resolve(pilotOutputDirectory, `${number}-original.mp3`);
    const generatedPath = resolve(pilotOutputDirectory, `${number}-pause-wrapped.mp3`);
    if (existsSync(originalCopy) || existsSync(generatedPath)) throw new Error(`Refusing to overwrite existing pilot output for item ${number}.`);
    const originalTemporary = `${originalCopy}.tmp-${process.pid}`;
    const generatedTemporary = `${generatedPath}.tmp-${process.pid}`;
    const providerText = `[short pause] ${entry.synthesisText} [short pause]`;
    try {
      copyFileSync(originalPath, originalTemporary);
      if (!validateMp3(originalTemporary)) throw new Error(`Original pilot source is not a valid MP3: ${entry.intendedOutputPath}`);
      renameSync(originalTemporary, originalCopy);
      const generated = await synthesize(entry, apiKey, providerText, 'ar');
      writeFileSync(generatedTemporary, generated.bytes, { flag: 'wx' });
      if (!validateMp3(generatedTemporary)) throw new Error('Pilot provider output was empty, too short, or not a readable MP3.');
      renameSync(generatedTemporary, generatedPath);
      results.push({
        sequence: index + 1,
        audioKey: entry.audioKey,
        referenceId: entry.referenceId,
        canonicalText: entry.canonicalText,
        synthesisText: entry.synthesisText,
        providerText,
        languageCode: 'ar',
        originalPath: entry.intendedOutputPath,
        originalCopy,
        generatedPath,
        durationBefore: audioDuration(originalCopy),
        durationAfter: audioDuration(generatedPath),
        attempts: generated.attempts,
      });
    } catch (error) {
      rmSync(originalTemporary, { force: true });
      rmSync(generatedTemporary, { force: true });
      throw error;
    }
    await sleep(delayMs);
  }
  console.log(JSON.stringify({ mode: 'egyptian-boundary-pilot', requestCount: results.length, results }, null, 2));
}

async function main() {
  if (egyptianBoundaryPilot) {
    await runEgyptianBoundaryPilot(process.env.ELEVENLABS_API_KEY ?? '');
    return;
  }
  const { all, selected } = selectedEntries();
  if (egyptianBoundaryRisk && (
    selected.length !== EGYPTIAN_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS.length
    || selected.some(entry => entry.dialect !== 'egyptian' || entry.model !== 'eleven_v3')
  )) throw new Error('Egyptian boundary-risk selection must resolve exactly the deterministic Egyptian eleven_v3 key set.');
  const apiKey = process.env.ELEVENLABS_API_KEY ?? '';
  const results: GenerationResult[] = [];
  let fatalError: string | null = null;
  if (!dryRun && !apiKey) fatalError = 'ELEVENLABS_API_KEY is required. The key value was not printed.';

  if (!fatalError) {
  for (const entry of selected) {
    const input = providerInput(entry);
    const destination = resolve(process.cwd(), entry.intendedOutputPath);
    if (!force && validateMp3(destination)) {
      results.push({ audioKey: entry.audioKey, referenceId: entry.referenceId, canonicalText: entry.canonicalText, ...input, outputPath: entry.intendedOutputPath, status: 'skipped_valid', attempts: 0 });
      continue;
    }
    if (dryRun) {
      results.push({ audioKey: entry.audioKey, referenceId: entry.referenceId, canonicalText: entry.canonicalText, ...input, outputPath: entry.intendedOutputPath, status: 'would_generate', attempts: 0 });
      continue;
    }

    const temporary = `${destination}.tmp-${process.pid}`;
    try {
      const generated = await synthesize(entry, apiKey, input.providerText);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(temporary, generated.bytes, { flag: 'wx' });
      if (!validateMp3(temporary)) throw new Error('Provider output was empty, too short, or not a readable MP3.');
      if (existsSync(destination) && !force) throw new Error('A destination file appeared during generation; refusing to overwrite it.');
      renameSync(temporary, destination);
      results.push({ audioKey: entry.audioKey, referenceId: entry.referenceId, canonicalText: entry.canonicalText, ...input, outputPath: entry.intendedOutputPath, status: 'generated', attempts: generated.attempts });
    } catch (error) {
      rmSync(temporary, { force: true });
      if (error instanceof FatalProviderError) {
        fatalError = error.message;
        results.push({
          audioKey: entry.audioKey,
          referenceId: entry.referenceId,
          canonicalText: entry.canonicalText,
          ...input,
          outputPath: entry.intendedOutputPath,
          status: 'failed',
          attempts: 0,
          error: error.message,
        });
        break;
      }
      results.push({
        audioKey: entry.audioKey,
        referenceId: entry.referenceId,
        canonicalText: entry.canonicalText,
        ...input,
        outputPath: entry.intendedOutputPath,
        status: 'failed',
        attempts: maxAttempts,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    await sleep(delayMs);
  }
  }

  const report = {
    schemaVersion: 2,
    dryRun,
    filters: {
      dialect: dialectFilter,
      unit: unitFilterRaw ? Number(unitFilterRaw) : null,
      mission: missionFilter,
      audioKey: audioKeyFilter,
      retryFailedReport,
      egyptianBoundaryRisk,
    },
    manifestSummary: summarizeUnit1_2AudioManifest(all),
    selectedUniqueClips: selected.length,
    fatalError,
    results,
  };
  if (dryRun) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    mkdirSync(dirname(reportPath), { recursive: true });
    const temporaryReport = `${reportPath}.tmp-${process.pid}`;
    writeFileSync(temporaryReport, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
    renameSync(temporaryReport, reportPath);
    console.log(`Generation report written to ${reportPath}`);
  }
  if (fatalError || results.some(result => result.status === 'failed')) process.exitCode = 1;
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
