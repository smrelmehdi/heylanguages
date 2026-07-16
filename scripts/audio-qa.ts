/* eslint-disable @typescript-eslint/no-var-requires */

import { existsSync, readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { AudioTarget, getAudioTargets } from './audio-catalog';
import {
    isAcceptedAudioVariant,
    looseArabicForAudioQa,
    normalizeArabicForAudioQa,
    similarity,
} from './audio-normalize';

type QaStatus = 'PASS' | 'CHECK' | 'FAIL';

type QaRow = {
  status: QaStatus;
  dialect: AudioTarget['dialect'];
  sourceKey: string;
  kind: AudioTarget['kind'];
  line?: number;
  audioText: string;
  transcript?: string;
  score?: number;
  audioPath: string;
  size: number | null;
  reason: string;
};

const args = process.argv.slice(2);
const flags = new Set(args);

function optionValue(name: string): string | null {
  const prefix = `${name}=`;
  const inline = args.find(arg => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf(name);
  if (index !== -1) return args[index + 1] ?? null;
  return null;
}

const SOURCE = optionValue('--source');
const KIND = optionValue('--kind');
const DIALECT = optionValue('--dialect');
const SHOW_PASS = flags.has('--show-pass');
const TRANSCRIBE = flags.has('--transcribe');
const FAIL_ONLY = flags.has('--fail-only');
const JSON_OUTPUT = flags.has('--json');
const EMIT_REGEN = flags.has('--emit-regen');
const LIMIT_ARG = optionValue('--limit');
const LIMIT = LIMIT_ARG === null ? null : Number(LIMIT_ARG);

const VALID_SOURCES = new Set([
  'basic-words',
  'greetings',
  'intro',
  'alphabet',
  'cafe',
  'taxi',
  'hotel',
  'restaurant',
  'supermarket',
  'pharmacy',
  'barbershop',
  'airport',
  'unit-4',
  'numbers-1-5',
  'numbers-6-10',
  'numbers-11-20',
  'numbers-tens',
  'numbers-age',
  'numbers-prices',
  'numbers-phone',
  'numbers-hours',
  'numbers-minutes',
  'numbers-days',
  'numbers-months',
  'numbers-dates',
  'numbers-ordering',
  'numbers-together',
]);
const VALID_KINDS = new Set(['lesson', 'scenario', 'quiz', 'alphabet']);
const VALID_DIALECTS = new Set(['gulf', 'egyptian', 'msa']);

if (SOURCE && !VALID_SOURCES.has(SOURCE)) {
  console.error(`✗ Unsupported --source value: ${SOURCE}`);
  console.error(`  Supported: ${[...VALID_SOURCES].join(', ')}`);
  process.exit(1);
}

if (KIND && !VALID_KINDS.has(KIND)) {
  console.error(`✗ Unsupported --kind value: ${KIND}`);
  console.error(`  Supported: ${[...VALID_KINDS].join(', ')}`);
  process.exit(1);
}

if (DIALECT && !VALID_DIALECTS.has(DIALECT)) {
  console.error(`✗ Unsupported --dialect value: ${DIALECT}`);
  console.error(`  Supported: ${[...VALID_DIALECTS].join(', ')}`);
  process.exit(1);
}

if (LIMIT_ARG !== null && (!Number.isInteger(LIMIT) || LIMIT === null || LIMIT < 1)) {
  console.error(`✗ Invalid --limit value: ${LIMIT_ARG}`);
  console.error('  Use a positive integer, e.g. --limit 10');
  process.exit(1);
}

function loadEnvFiles() {
  for (const envFileName of ['.env', '.env.local']) {
    try {
      const envFile = readFileSync(resolve(process.cwd(), envFileName), 'utf-8');
      for (const line of envFile.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        if (process.env[key]) continue;
        process.env[key] = trimmed.slice(eq + 1).trim();
      }
    } catch {
      /* env files optional */
    }
  }
}

function evaluateFilePresence(target: AudioTarget): QaRow {
  const audioText = target.audioText?.trim() ?? '';
  if (!audioText) {
    return {
      status: 'FAIL',
      dialect: target.dialect,
      sourceKey: target.sourceKey,
      kind: target.kind,
      line: target.line,
      audioText,
      audioPath: target.audioPath,
      size: null,
      reason: 'missing audioText',
    };
  }

  if (!target.audioPath?.trim()) {
    return {
      status: 'FAIL',
      dialect: target.dialect,
      sourceKey: target.sourceKey,
      kind: target.kind,
      line: target.line,
      audioText,
      audioPath: target.audioPath,
      size: null,
      reason: 'missing audioPath',
    };
  }

  const absolutePath = resolve(process.cwd(), target.audioPath);
  if (!existsSync(absolutePath)) {
    return {
      status: 'FAIL',
      dialect: target.dialect,
      sourceKey: target.sourceKey,
      kind: target.kind,
      line: target.line,
      audioText,
      audioPath: target.audioPath,
      size: null,
      reason: 'file missing',
    };
  }

  const size = statSync(absolutePath).size;
  if (size === 0) {
    return {
      status: 'FAIL',
      dialect: target.dialect,
      sourceKey: target.sourceKey,
      kind: target.kind,
      line: target.line,
      audioText,
      audioPath: target.audioPath,
      size,
      reason: '0 bytes',
    };
  }

  if (size < 1000) {
    return {
      status: 'CHECK',
      dialect: target.dialect,
      sourceKey: target.sourceKey,
      kind: target.kind,
      line: target.line,
      audioText,
      audioPath: target.audioPath,
      size,
      reason: '< 1000 bytes',
    };
  }

  return {
    status: 'PASS',
    dialect: target.dialect,
    sourceKey: target.sourceKey,
    kind: target.kind,
    line: target.line,
    audioText,
    audioPath: target.audioPath,
    size,
    reason: 'file present',
  };
}

type EvaluateSpeechResponse = {
  result?: unknown;
  feedback?: unknown;
  score?: unknown;
  transcript?: unknown;
  error?: unknown;
};

function normalizeScore(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
    ? value
    : undefined;
}

function classifyTranscript(target: QaRow, response: EvaluateSpeechResponse): QaRow {
  const transcript = typeof response.transcript === 'string' ? response.transcript.trim() : '';
  const score = normalizeScore(response.score);

  if (!transcript) {
    return {
      ...target,
      status: 'FAIL',
      transcript,
      score,
      reason: 'missing transcript',
    };
  }

  const normalizedTarget = normalizeArabicForAudioQa(target.audioText);
  const normalizedTranscript = normalizeArabicForAudioQa(transcript);
  const looseTarget = looseArabicForAudioQa(target.audioText);
  const looseTranscript = looseArabicForAudioQa(transcript);
  const closeSimilarity = similarity(normalizedTranscript, normalizedTarget);
  const looseSimilarity = similarity(looseTranscript, looseTarget);
  const transcriptHasDigits = /[0-9٠-٩]/.test(transcript);

  if (
    normalizedTranscript === normalizedTarget ||
    isAcceptedAudioVariant(target.audioText, transcript) ||
    (score !== undefined && score >= 85)
  ) {
    return {
      ...target,
      status: 'PASS',
      transcript,
      score,
      reason: normalizedTranscript === normalizedTarget ? 'transcript match' : 'accepted/high score',
    };
  }

  if (
    (score !== undefined && score >= 60) ||
    closeSimilarity >= 0.72 ||
    looseSimilarity >= 0.8
  ) {
    return {
      ...target,
      status: 'CHECK',
      transcript,
      score,
      reason: looseSimilarity >= 0.8 && closeSimilarity < 0.72 ? 'loose ة/ه match' : 'close transcript',
    };
  }

  if (transcriptHasDigits && score !== undefined && score >= 40) {
    return {
      ...target,
      status: 'CHECK',
      transcript,
      score,
      reason: 'numeric transcript variant',
    };
  }

  return {
    ...target,
    status: 'FAIL',
    transcript,
    score,
    reason: score !== undefined && score < 60 ? `low score ${score}` : 'wrong phrase',
  };
}

async function transcribeTarget(row: QaRow): Promise<QaRow> {
  if (row.status === 'FAIL') return row;

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ...row,
      status: 'CHECK',
      reason: 'transcription unavailable: missing Supabase env',
    };
  }

  try {
    const absolutePath = resolve(process.cwd(), row.audioPath);
    const fileBuffer = readFileSync(absolutePath);
    const form = new FormData();
    const blob = new Blob([fileBuffer], { type: 'audio/mpeg' });
    form.append('file', blob, row.audioPath.split('/').pop() ?? 'audio.mp3');
    form.append('targetText', row.audioText);
    form.append('dialect', row.dialect);
    form.append('context', row.kind);

    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/evaluate-speech`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: form,
    });

    const data = await response.json().catch(() => null) as EvaluateSpeechResponse | null;

    if (!response.ok || data?.error) {
      return {
        ...row,
        status: 'CHECK',
        reason: 'transcription unavailable',
      };
    }

    return classifyTranscript(row, data ?? {});
  } catch {
    return {
      ...row,
      status: 'CHECK',
      reason: 'transcription unavailable',
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolveDelay => setTimeout(resolveDelay, ms));
}

function pad(value: unknown, width: number): string {
  const text = String(value ?? '');
  return text.length >= width ? text : text.padEnd(width);
}

function shellEscapeSingleQuotes(value: string): string {
  return value.replace(/'/g, `'"'"'`);
}

function buildRegenCommand(row: QaRow): string {
  const prefix = `npx ts-node --skip-project --compiler-options '{"module":"CommonJS"}' scripts/generate-all-audio.ts`;

  if (row.kind === 'scenario') {
    const scenarioKey = row.dialect === 'msa'
      ? `msa-${row.sourceKey}`
      : row.dialect === 'egyptian'
        ? `egyptian-${row.sourceKey}`
        : row.sourceKey;
    return `${prefix} --scenario ${scenarioKey} --line ${row.line ?? 0} --provider elevenlabs --force`;
  }

  if (row.kind === 'lesson' && row.dialect === 'egyptian') {
    return `${prefix} --source egyptian --text '${shellEscapeSingleQuotes(row.audioText)}' --provider elevenlabs --force`;
  }

  if (row.kind === 'lesson' && row.dialect === 'msa') {
    return `${prefix} --source msa --text '${shellEscapeSingleQuotes(row.audioText)}' --provider elevenlabs --force`;
  }

  if (row.kind === 'lesson' && (row.sourceKey === 'basic-words' || row.sourceKey === 'greetings' || row.sourceKey === 'intro')) {
    return `${prefix} --lesson ${row.sourceKey} --text '${shellEscapeSingleQuotes(row.audioText)}' --provider elevenlabs --force`;
  }

  if (row.kind === 'lesson' && row.sourceKey.startsWith('numbers-')) {
    return `${prefix} --source unit-4 --text '${shellEscapeSingleQuotes(row.audioText)}' --provider elevenlabs --force`;
  }

  return `${prefix} --text '${shellEscapeSingleQuotes(row.audioText)}' --provider elevenlabs --force`;
}

async function main() {
  if (TRANSCRIBE) loadEnvFiles();

  const selectedTargets = getAudioTargets({
    dialect: DIALECT ?? undefined,
    sourceKey: SOURCE ?? undefined,
    kind: KIND ?? undefined,
  }).slice(0, LIMIT ?? undefined);

  const presenceRows = selectedTargets.map(evaluateFilePresence);
  const rows: QaRow[] = [];

  for (let i = 0; i < presenceRows.length; i++) {
    const row = TRANSCRIBE ? await transcribeTarget(presenceRows[i]) : presenceRows[i];
    rows.push(row);
    if (TRANSCRIBE && i < presenceRows.length - 1) await sleep(250);
  }

  const counts: Record<QaStatus, number> = { PASS: 0, CHECK: 0, FAIL: 0 };
  const bySourceKey = new Map<string, number>();

  for (const row of rows) {
    counts[row.status] += 1;
    bySourceKey.set(row.sourceKey, (bySourceKey.get(row.sourceKey) ?? 0) + 1);
  }

  if (JSON_OUTPUT) {
    console.log(JSON.stringify({
      summary: {
        total: rows.length,
        PASS: counts.PASS,
        CHECK: counts.CHECK,
        FAIL: counts.FAIL,
      },
      bySourceKey: Object.fromEntries([...bySourceKey.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
      rows,
    }, null, 2));
    return;
  }

  console.log(TRANSCRIBE ? '🎧 audio QA V2' : '🎧 audio QA V1');
  console.log('filters:', [
    SOURCE && `source=${SOURCE}`,
    KIND && `kind=${KIND}`,
    DIALECT && `dialect=${DIALECT}`,
    flags.has('--all') && 'all',
    SHOW_PASS && 'show-pass',
    TRANSCRIBE && 'transcribe',
    FAIL_ONLY && 'fail-only',
    EMIT_REGEN && 'emit-regen',
    LIMIT && `limit=${LIMIT}`,
  ].filter(Boolean).join(' ') || 'all');

  console.log('\nsummary:');
  console.log(`  total: ${rows.length}`);
  console.log(`  PASS:  ${counts.PASS}`);
  console.log(`  CHECK: ${counts.CHECK}`);
  console.log(`  FAIL:  ${counts.FAIL}`);

  console.log('\nby sourceKey:');
  [...bySourceKey.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([sourceKey, count]) => {
      console.log(`  ${sourceKey.padEnd(16)} ${count}`);
    });

  const printable = FAIL_ONLY
    ? rows.filter(row => row.status === 'FAIL')
    : SHOW_PASS
      ? rows
      : rows.filter(row => row.status !== 'PASS');

  console.log(FAIL_ONLY ? '\nFAIL items:' : SHOW_PASS ? '\nitems:' : '\nCHECK/FAIL items:');
  if (!printable.length) {
    console.log('  none');
    return;
  }

  console.log([
    pad('status', 7),
    pad('sourceKey', 16),
    pad('line', 5),
    pad('score', 7),
    pad('reason', 18),
    'audioText | transcript -> audioPath',
  ].join('  '));

  for (const row of printable) {
    console.log([
      pad(row.status, 7),
      pad(row.sourceKey, 16),
      pad(row.line ?? '', 5),
      pad(row.score ?? '', 7),
      pad(row.reason, 18),
      `${row.audioText || '(empty)'} | ${row.transcript ?? ''} -> ${row.audioPath}`,
    ].join('  '));
  }

  if (EMIT_REGEN) {
    const repairRows = rows.filter(row => row.status !== 'PASS');
    const uniqueCommands = [...new Set(repairRows.map(buildRegenCommand))];

    console.log('\nregen commands:');
    if (!uniqueCommands.length) {
      console.log('  none');
      return;
    }

    uniqueCommands.forEach(command => {
      console.log(`  ${command}`);
    });
  }
}

main().catch(error => {
  console.warn('[audio-qa] failed:', error?.message ?? error);
  process.exit(1);
});
