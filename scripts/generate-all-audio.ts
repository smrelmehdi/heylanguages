/**
 * Unified audio-asset generator for HeyYusuf.
 *
 * Collects every static Arabic (and English letter-name) text used by the app,
 * reuses existing mp3s where possible, generates the rest via ElevenLabs, and
 * writes two manifests:
 *   - assets/audio/manifest.json   (tooling/debug)
 *   - constants/audio-manifest.ts  (runtime lookup used by utils/tts.ts)
 *
 * Run:
 *   ts-node --skip-project scripts/generate-all-audio.ts [--dry-run] [--match-only] [--force] [--lesson basic-words|greetings|intro] [--scenario cafe]
 */

/* eslint-disable @typescript-eslint/no-var-requires */

// ── Load .env, then .env.local so private local values can override defaults ─
import { createHash } from 'crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'path';

for (const envFileName of ['.env', '.env.local']) {
  try {
    const envFile = readFileSync(resolve(process.cwd(), envFileName), 'utf-8');
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

// ── Allow data files to import .mp3 / image assets via require() ───────────
// The data files (constants/words.ts, data/gulf-dialogues.ts, etc.) embed
// `audio: require('../assets/audio/.../x.mp3')` calls intended for Metro.
// Node/ts-node can't load those — intercept and return the path string so
// imports succeed.
const Module: any = require('module');
const realRequire = Module.prototype.require;
const ASSET_RE = /\.(mp3|wav|m4a|png|jpe?g|webp|gif|svg|ttf|otf)$/i;
Module.prototype.require = function (id: string) {
  if (typeof id === 'string' && ASSET_RE.test(id)) {
    // Return the resolved absolute path so callers can dedupe by path.
    try {
      return resolve(dirname(this.filename), id);
    } catch {
      return id;
    }
  }
  return realRequire.call(this, id);
};

// ── CLI flags ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flags = new Set(args);
const DRY_RUN = flags.has('--dry-run');
const MATCH_ONLY = flags.has('--match-only');
const FORCE = flags.has('--force');
const CATALOG_DRY_RUN = flags.has('--catalog-dry-run');
const VARIANT_TEST = flags.has('--variant-test');
const SEQUENCE_TEST = flags.has('--sequence-test');
const SULTAN_ALPHABET_TEST = flags.has('--sultan-alphabet-test');

function optionValue(name: string): string | null {
  const prefix = `${name}=`;
  const inline = args.find(arg => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf(name);
  if (index !== -1) return args[index + 1] ?? null;
  return null;
}

const LESSON = optionValue('--lesson');
const BASIC_WORDS_ONLY = LESSON === 'basic-words';
const GREETINGS_ONLY = LESSON === 'greetings';
const INTRO_ONLY = LESSON === 'intro';
const NARROW_LESSON = BASIC_WORDS_ONLY || GREETINGS_ONLY || INTRO_ONLY;
const SOURCE = optionValue('--source');
const ALPHABET_SOURCE_ONLY = SOURCE === 'alphabet';
const UNIT_4_SOURCE_ONLY = SOURCE === 'unit-4';
const UNIT_5_SOURCE_ONLY = SOURCE === 'unit-5';
const UNIT_7_SOURCE_ONLY = SOURCE === 'unit-7';
const UNIT_9_SOURCE_ONLY = SOURCE === 'unit-9';
const MSA_SOURCE_ONLY = SOURCE === 'msa';
const EGYPTIAN_SOURCE_ONLY = SOURCE === 'egyptian';
const PROVIDER = optionValue('--provider');
const ALPHABET_MODE = optionValue('--alphabet-mode');
const SCENARIO = optionValue('--scenario');
type ScenarioDialect = 'gulf' | 'msa' | 'egyptian';
const SCENARIO_CONFIG: Record<string, { exportName: string; folder: string; label: string; dialect?: ScenarioDialect }> = {
  cafe:                  { exportName: 'CAFE_DIALOGUE',                   folder: 'cafe',                  label: 'CAFE_DIALOGUE' },
  taxi:                  { exportName: 'TAXI_DIALOGUE',                   folder: 'taxi',                  label: 'TAXI_DIALOGUE' },
  hotel:                 { exportName: 'HOTEL_DIALOGUE',                  folder: 'hotel',                 label: 'HOTEL_DIALOGUE' },
  restaurant:            { exportName: 'RESTAURANT_DIALOGUE',             folder: 'restaurant',            label: 'RESTAURANT_DIALOGUE' },
  supermarket:           { exportName: 'SUPERMARKET_DIALOGUE',            folder: 'supermarket',           label: 'SUPERMARKET_DIALOGUE' },
  pharmacy:              { exportName: 'PHARMACY_DIALOGUE',               folder: 'pharmacy',              label: 'PHARMACY_DIALOGUE' },
  barbershop:            { exportName: 'BARBERSHOP_DIALOGUE',             folder: 'barbershop',            label: 'BARBERSHOP_DIALOGUE' },
  airport:               { exportName: 'AIRPORT_DIALOGUE',                folder: 'airport',               label: 'AIRPORT_DIALOGUE' },
  'morning-routine':     { exportName: 'MORNING_ROUTINE_DIALOGUE',        folder: 'morning-routine',       label: 'MORNING_ROUTINE_DIALOGUE' },
  'at-gym':              { exportName: 'GYM_DIALOGUE',                    folder: 'at-gym',                label: 'GYM_DIALOGUE' },
  'cooking-home':        { exportName: 'COOKING_HOME_DIALOGUE',           folder: 'cooking-home',          label: 'COOKING_HOME_DIALOGUE' },
  'weather-chat':        { exportName: 'WEATHER_CHAT_DIALOGUE',           folder: 'weather-chat',          label: 'WEATHER_CHAT_DIALOGUE' },
  'doctor-visit':        { exportName: 'DOCTOR_VISIT_DIALOGUE',           folder: 'doctor-visit',          label: 'DOCTOR_VISIT_DIALOGUE' },
  'at-bank':             { exportName: 'BANK_DIALOGUE',                   folder: 'at-bank',               label: 'BANK_DIALOGUE' },
  'friday-gathering':    { exportName: 'FRIDAY_GATHERING_DIALOGUE',       folder: 'friday-gathering',      label: 'FRIDAY_GATHERING_DIALOGUE' },
  'neighbor-visit':      { exportName: 'NEIGHBOR_VISIT_DIALOGUE',         folder: 'neighbor-visit',        label: 'NEIGHBOR_VISIT_DIALOGUE' },
  'lost-in-city':        { exportName: 'LOST_IN_CITY_DIALOGUE',           folder: 'lost-in-city',          label: 'LOST_IN_CITY_DIALOGUE' },
  'car-breakdown':       { exportName: 'CAR_BREAKDOWN_DIALOGUE',          folder: 'car-breakdown',         label: 'CAR_BREAKDOWN_DIALOGUE' },
  'police-station':      { exportName: 'POLICE_STATION_DIALOGUE',         folder: 'police-station',        label: 'POLICE_STATION_DIALOGUE' },
  'hospital-emergency':  { exportName: 'HOSPITAL_EMERGENCY_DIALOGUE',     folder: 'hospital-emergency',    label: 'HOSPITAL_EMERGENCY_DIALOGUE' },
  'lost-wallet':         { exportName: 'LOST_WALLET_DIALOGUE',            folder: 'lost-wallet',           label: 'LOST_WALLET_DIALOGUE' },
  'flight-problem':      { exportName: 'FLIGHT_PROBLEM_DIALOGUE',         folder: 'flight-problem',        label: 'FLIGHT_PROBLEM_DIALOGUE' },
  'asking-for-help':     { exportName: 'ASKING_FOR_HELP_DIALOGUE',        folder: 'asking-for-help',       label: 'ASKING_FOR_HELP_DIALOGUE' },
  'friends-new-neighbor':{ exportName: 'FRIENDS_NEW_NEIGHBOR_DIALOGUE',   folder: 'friends-new-neighbor',  label: 'FRIENDS_NEW_NEIGHBOR_DIALOGUE' },
  'friends-football':    { exportName: 'FRIENDS_FOOTBALL_DIALOGUE',       folder: 'friends-football',      label: 'FRIENDS_FOOTBALL_DIALOGUE' },
  'friends-gaming':      { exportName: 'FRIENDS_GAMING_DIALOGUE',         folder: 'friends-gaming',        label: 'FRIENDS_GAMING_DIALOGUE' },
  'friends-weekend':     { exportName: 'FRIENDS_WEEKEND_DIALOGUE',        folder: 'friends-weekend',       label: 'FRIENDS_WEEKEND_DIALOGUE' },
  'friends-social-media':{ exportName: 'FRIENDS_SOCIAL_MEDIA_DIALOGUE',   folder: 'friends-social-media',  label: 'FRIENDS_SOCIAL_MEDIA_DIALOGUE' },
  'friends-road-trip':   { exportName: 'FRIENDS_ROAD_TRIP_DIALOGUE',      folder: 'friends-road-trip',     label: 'FRIENDS_ROAD_TRIP_DIALOGUE' },
  'friends-birthday':    { exportName: 'FRIENDS_BIRTHDAY_DIALOGUE',       folder: 'friends-birthday',      label: 'FRIENDS_BIRTHDAY_DIALOGUE' },
  'friends-farewell':    { exportName: 'FRIENDS_FAREWELL_DIALOGUE',       folder: 'friends-farewell',      label: 'FRIENDS_FAREWELL_DIALOGUE' },
  // MSA (Modern Standard Arabic) scenarios — output to assets/audio/msa/<scenario>/
  'msa-cafe':        { exportName: 'CAFE_DIALOGUE_MSA',        folder: 'msa/cafe',        label: 'CAFE_DIALOGUE_MSA' },
  'msa-taxi':        { exportName: 'TAXI_DIALOGUE_MSA',        folder: 'msa/taxi',        label: 'TAXI_DIALOGUE_MSA' },
  'msa-hotel':       { exportName: 'HOTEL_DIALOGUE_MSA',       folder: 'msa/hotel',       label: 'HOTEL_DIALOGUE_MSA' },
  'msa-restaurant':  { exportName: 'RESTAURANT_DIALOGUE_MSA',  folder: 'msa/restaurant',  label: 'RESTAURANT_DIALOGUE_MSA' },
  'msa-supermarket': { exportName: 'SUPERMARKET_DIALOGUE_MSA', folder: 'msa/supermarket', label: 'SUPERMARKET_DIALOGUE_MSA' },
  'msa-pharmacy':    { exportName: 'PHARMACY_DIALOGUE_MSA',    folder: 'msa/pharmacy',    label: 'PHARMACY_DIALOGUE_MSA' },
  'msa-barbershop':  { exportName: 'BARBERSHOP_DIALOGUE_MSA',  folder: 'msa/barbershop',  label: 'BARBERSHOP_DIALOGUE_MSA' },
  'msa-airport':     { exportName: 'AIRPORT_DIALOGUE_MSA',     folder: 'msa/airport',     label: 'AIRPORT_DIALOGUE_MSA' },
  // Egyptian scenarios — generated with the Egyptian v3 voice into assets/audio/egyptian/<scenario>/
  'egyptian-cafe':        { exportName: 'CAFE_DIALOGUE_EG',        folder: 'egyptian/cafe',        label: 'CAFE_DIALOGUE_EG',        dialect: 'egyptian' },
  'egyptian-taxi':        { exportName: 'TAXI_DIALOGUE_EG',        folder: 'egyptian/taxi',        label: 'TAXI_DIALOGUE_EG',        dialect: 'egyptian' },
  'egyptian-hotel':       { exportName: 'HOTEL_DIALOGUE_EG',       folder: 'egyptian/hotel',       label: 'HOTEL_DIALOGUE_EG',       dialect: 'egyptian' },
  'egyptian-restaurant':  { exportName: 'RESTAURANT_DIALOGUE_EG',  folder: 'egyptian/restaurant',  label: 'RESTAURANT_DIALOGUE_EG',  dialect: 'egyptian' },
  'egyptian-supermarket': { exportName: 'SUPERMARKET_DIALOGUE_EG', folder: 'egyptian/supermarket', label: 'SUPERMARKET_DIALOGUE_EG', dialect: 'egyptian' },
  'egyptian-pharmacy':    { exportName: 'PHARMACY_DIALOGUE_EG',    folder: 'egyptian/pharmacy',    label: 'PHARMACY_DIALOGUE_EG',    dialect: 'egyptian' },
  'egyptian-barbershop':  { exportName: 'BARBERSHOP_DIALOGUE_EG',  folder: 'egyptian/barbershop',  label: 'BARBERSHOP_DIALOGUE_EG',  dialect: 'egyptian' },
  'egyptian-airport':     { exportName: 'AIRPORT_DIALOGUE_EG',     folder: 'egyptian/airport',     label: 'AIRPORT_DIALOGUE_EG',     dialect: 'egyptian' },
};
const SCENARIO_ONLY = SCENARIO ? SCENARIO_CONFIG[SCENARIO] ?? null : null;
const LINE_ARG = optionValue('--line');
const LINE_INDEX = LINE_ARG === null ? null : Number(LINE_ARG);
const TEXT_FILTER = optionValue('--text');

if (LESSON && !NARROW_LESSON) {
  console.error(`✗ Unsupported --lesson value: ${LESSON}`);
  console.error('  Supported: basic-words, greetings, intro');
  process.exit(1);
}

if (SCENARIO && !SCENARIO_ONLY) {
  console.error(`✗ Unsupported --scenario value: ${SCENARIO}`);
  console.error(`  Supported: ${Object.keys(SCENARIO_CONFIG).join(', ')}`);
  process.exit(1);
}

if (SOURCE && !ALPHABET_SOURCE_ONLY && !UNIT_4_SOURCE_ONLY && !UNIT_5_SOURCE_ONLY && !UNIT_7_SOURCE_ONLY && !UNIT_9_SOURCE_ONLY && !MSA_SOURCE_ONLY && !EGYPTIAN_SOURCE_ONLY) {
  console.error(`✗ Unsupported --source value: ${SOURCE}`);
  console.error('  Supported: alphabet, unit-4, unit-5, unit-7, unit-9, msa, egyptian');
  process.exit(1);
}

if (PROVIDER && PROVIDER !== 'elevenlabs') {
  console.error(`✗ Unsupported --provider value: ${PROVIDER}`);
  console.error('  Supported: elevenlabs');
  process.exit(1);
}

if (ALPHABET_MODE && ALPHABET_MODE !== 'stable') {
  console.error(`✗ Unsupported --alphabet-mode value: ${ALPHABET_MODE}`);
  console.error('  Supported: stable');
  process.exit(1);
}

if (ALPHABET_MODE && !ALPHABET_SOURCE_ONLY) {
  console.error('✗ --alphabet-mode is only supported with --source alphabet');
  process.exit(1);
}

if ([LESSON, SCENARIO, SOURCE].filter(Boolean).length > 1) {
  console.error('✗ Use only one of --lesson, --scenario, or --source');
  process.exit(1);
}

if (LINE_ARG !== null) {
  const parsedLineIndex = LINE_INDEX;
  if (parsedLineIndex === null || !Number.isInteger(parsedLineIndex) || parsedLineIndex < 0) {
    console.error(`✗ Invalid --line value: ${LINE_ARG}`);
    console.error('  Use a zero-based CAFE_DIALOGUE index, e.g. --line 17, or a 1-based lesson number.');
    process.exit(1);
  }
}

if (LINE_ARG !== null && !SCENARIO_ONLY && !GREETINGS_ONLY && !INTRO_ONLY && !ALPHABET_SOURCE_ONLY) {
  console.error(`✗ --line is only supported with --scenario ${Object.keys(SCENARIO_CONFIG).join('|')}, --lesson greetings, --lesson intro, or --source alphabet`);
  process.exit(1);
}

if (VARIANT_TEST && (!ALPHABET_SOURCE_ONLY || LINE_INDEX !== 1)) {
  console.error('✗ --variant-test is only supported with --source alphabet --line 1');
  process.exit(1);
}

if (SEQUENCE_TEST && (!ALPHABET_SOURCE_ONLY || LINE_INDEX !== null)) {
  console.error('✗ --sequence-test is only supported with --source alphabet');
  process.exit(1);
}

if (SULTAN_ALPHABET_TEST && (!ALPHABET_SOURCE_ONLY || LINE_INDEX !== 1)) {
  console.error('✗ --sultan-alphabet-test is only supported with --source alphabet --line 1');
  process.exit(1);
}

// ── Config ─────────────────────────────────────────────────────────────────
const VOICE_GULF = 'rUaPbzcZIu8df8iNL9WZ';      // Sultan
const VOICE_EGYPTIAN = 'LXrTqFIgiubkrMkwvOUr';   // Egyptian v3 voice
const VOICE_MSA = 'xvhpbk8otnNHtT3fjCpr';        // Omar (MSA)
const MODEL_DEFAULT = 'eleven_multilingual_v2';
const MODEL_EGYPTIAN = 'eleven_v3';
const API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ROOT = process.cwd();
const AUTO_DIR = resolve(ROOT, 'assets/audio/auto');
const MANIFEST_JSON = resolve(ROOT, 'assets/audio/manifest.json');
const MANIFEST_TS = resolve(ROOT, 'constants/audio-manifest.ts');
// Optimized for pronunciation consistency in language-learning audio.
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0,
  use_speaker_boost: true,
};

type Bucket = 'gulf' | 'egyptian' | 'msa' | 'en';
interface Target {
  text: string;        // original, tashkeel preserved
  bucket: Bucket;      // filesystem folder under auto/
  manifestKey: 'gulf' | 'egyptian' | 'msa'; // which runtime manifest bucket this entry lives in
  voiceId: string;     // for hashing + ElevenLabs
  modelId: string;     // ElevenLabs model to use for this target
  source: string;      // "gulf-dialogues:CAFE[0]" — for logging
  outputPath?: string; // optional direct output path for narrow lesson runs
  itemIndex?: number;  // 1-based lesson item index for narrow lesson logs
  lineIndex?: number;  // 0-based scenario line index for narrow scenario logs
  turnType?: string;   // scenario speaker type for narrow scenario logs
  voiceSettings?: { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean };
}

// Normalization must match utils/tts.ts cache-key rule: trim + lowercase,
// tashkeel PRESERVED.
function normalize(text: string): string {
  return text.trim().toLowerCase();
}

// Secondary fuzzy-match key used ONLY during the existing-file reuse step.
// Lets data-text "اَلسَّلَامُ عَلَيْكُم" match a sibling script's "السلام عليكم".
// U+064B..U+0652 covers fatha/damma/kasra/shadda/sukun/tanween/etc.,
// U+0670 is dagger alif, U+0640 is tatweel.
const TASHKEEL_RE = /[ً-ْٰـ]/g;
function stripTashkeel(s: string): string {
  return s.replace(TASHKEEL_RE, '');
}
function fuzzyKey(voiceId: string, text: string): string {
  return voiceId + '::' + stripTashkeel(normalize(text));
}

function hashFor(text: string, voiceId: string): string {
  return createHash('sha256')
    .update(voiceId + ':' + normalize(text))
    .digest('hex')
    .slice(0, 8);
}

// ── Target collection ──────────────────────────────────────────────────────
function collectTargets(): Target[] {
  const out: Target[] = [];
  const seen = new Set<string>();

  const add = (
    text: unknown,
    bucket: Bucket,
    source: string,
    manifestKey: 'gulf' | 'egyptian' | 'msa' = bucket === 'egyptian' ? 'egyptian' : bucket === 'msa' ? 'msa' : 'gulf',
    options: Pick<Target, 'outputPath' | 'itemIndex' | 'lineIndex' | 'turnType' | 'voiceSettings'> & { allowDuplicate?: boolean } = {},
  ) => {
    if (typeof text !== 'string') return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const voiceId = manifestKey === 'egyptian' ? VOICE_EGYPTIAN : manifestKey === 'msa' ? VOICE_MSA : VOICE_GULF;
    // Dedupe by (manifestKey, normalized) so we generate each voice+text once.
    const dedupeKey = manifestKey + '::' + normalize(trimmed);
    if (!options.allowDuplicate) {
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);
    }
    const modelId = manifestKey === 'egyptian' ? MODEL_EGYPTIAN : MODEL_DEFAULT;
    const { allowDuplicate: _allowDuplicate, ...targetOptions } = options;
    out.push({ text: trimmed, bucket, manifestKey, voiceId, modelId, source, ...targetOptions });
  };

  const collectEgyptianWords = () => {
    try {
      const egw = require('../data/egyptian-words');
      const lessonFolders: Record<string, string> = {
        BASIC_WORDS_EG: 'egyptian/basic-words',
        GREETINGS_WORDS_EG: 'egyptian/greetings',
        INTRO_WORDS_EG: 'egyptian/intro',
      };
      for (const [name, arr] of Object.entries(egw)) {
        if (!Array.isArray(arr)) continue;
        arr.forEach((w: any, i: number) => {
          if (w && typeof w.arabic === 'string') {
            const text = w.audioText ?? w.displayArabic ?? w.arabic;
            add(text, 'egyptian', `egyptian-words:${name}[${i}]`, 'egyptian', {
              outputPath: lessonFolders[name] ? resolve(ROOT, 'assets/audio', lessonFolders[name], `${i + 1}.mp3`) : undefined,
              itemIndex: i + 1,
              allowDuplicate: true,
            });
          }
        });
      }
    } catch (e) {
      console.warn('Could not load egyptian-words:', (e as Error).message);
    }
  };

  const collectEgyptianDialogues = () => {
    try {
      const ed = require('../data/egyptian-dialogues');
      const scenarioFolders: Record<string, string> = {
        CAFE_DIALOGUE_EG: 'egyptian/cafe',
        TAXI_DIALOGUE_EG: 'egyptian/taxi',
        HOTEL_DIALOGUE_EG: 'egyptian/hotel',
        RESTAURANT_DIALOGUE_EG: 'egyptian/restaurant',
        SUPERMARKET_DIALOGUE_EG: 'egyptian/supermarket',
        PHARMACY_DIALOGUE_EG: 'egyptian/pharmacy',
        BARBERSHOP_DIALOGUE_EG: 'egyptian/barbershop',
        AIRPORT_DIALOGUE_EG: 'egyptian/airport',
      };
      for (const [name, arr] of Object.entries(ed)) {
        if (!Array.isArray(arr)) continue;
        let waiterIndex = 0;
        let userIndex = 0;
        arr.forEach((t: any, i: number) => {
          if (t && typeof t.arabic === 'string') {
            const text = t.audioText ?? t.displayArabic ?? t.arabic;
            const isWaiter = t.type === 'waiter';
            const fileIndex = isWaiter ? ++waiterIndex : ++userIndex;
            const filePrefix = isWaiter ? 'w' : 'u';
            add(text, 'egyptian', `egyptian-dialogues:${name}[${i}]`, 'egyptian', {
              outputPath: scenarioFolders[name] ? resolve(ROOT, 'assets/audio', scenarioFolders[name], `${filePrefix}${fileIndex}.mp3`) : undefined,
              itemIndex: i,
              lineIndex: i,
              turnType: t.type,
              allowDuplicate: true,
            });
          }
        });
      }
    } catch (e) {
      console.warn('Could not load egyptian-dialogues:', (e as Error).message);
    }
  };

  if (ALPHABET_SOURCE_ONLY && SULTAN_ALPHABET_TEST) {
    const highStabilitySettings = {
      stability: 0.8,
      similarity_boost: 0.85,
      style: 0,
      use_speaker_boost: true,
    };
    const tests = [
      { suffix: 'a', text: 'ألف' },
      { suffix: 'b', text: 'اَلِف' },
      { suffix: 'c', text: 'أَلِف' },
      { suffix: 'd', text: 'ألف', voiceSettings: highStabilitySettings },
      { suffix: 'e', text: 'اَلِف', voiceSettings: highStabilitySettings },
      { suffix: 'f', text: 'أَلِف', voiceSettings: highStabilitySettings },
    ];
    tests.forEach((test, i) => {
      add(test.text, 'gulf', `audio-catalog:sultan-alphabet-test[${test.suffix}]`, 'gulf', {
        outputPath: resolve(ROOT, 'assets/audio/alphabet', `test-sultan-alif-${test.suffix}.mp3`),
        itemIndex: i + 1,
        voiceSettings: test.voiceSettings,
        allowDuplicate: true,
      });
    });
    return out;
  }

  if (ALPHABET_SOURCE_ONLY && VARIANT_TEST) {
    const variants = ['أَلِفْ', 'أَلِف', 'أَلِفٌ', 'اَلِفْ'];
    variants.forEach((text, i) => {
      add(text, 'gulf', `audio-catalog:alphabet-variant-test[${i + 1}]`, 'gulf', {
        outputPath: resolve(ROOT, 'assets/audio/alphabet', `test-alif-${i + 1}.mp3`),
        itemIndex: i + 1,
      });
    });
    return out;
  }

  if (ALPHABET_SOURCE_ONLY && SEQUENCE_TEST) {
    add('ألف\nباء\nتاء\nثاء\nجيم', 'gulf', 'audio-catalog:alphabet-sequence-test[1-5]', 'gulf', {
      outputPath: resolve(ROOT, 'assets/audio/alphabet/test-sequence-1-5.mp3'),
      itemIndex: 1,
    });
    return out;
  }

  if (ALPHABET_SOURCE_ONLY) {
    const { getAudioTargets } = require('./audio-catalog');
    const alphabetTargets = getAudioTargets({ sourceKey: 'alphabet' });
    const stableAlphabetSettings = ALPHABET_MODE === 'stable'
      ? {
          stability: 0.8,
          similarity_boost: 0.85,
          style: 0,
          use_speaker_boost: true,
        }
      : undefined;
    if (LINE_INDEX !== null && !alphabetTargets.some((target: any) => target.line === LINE_INDEX)) {
      console.error(`✗ --line ${LINE_INDEX} is out of range for alphabet (1-${alphabetTargets.length})`);
      process.exit(1);
    }
    alphabetTargets.forEach((target: any) => {
      if (LINE_INDEX !== null && target.line !== LINE_INDEX) return;
      add(ALPHABET_MODE === 'stable' ? target.displayArabic : target.audioText, 'gulf', `audio-catalog:alphabet[${target.index}]`, 'gulf', {
        outputPath: resolve(ROOT, target.audioPath),
        itemIndex: target.line ?? target.index + 1,
        voiceSettings: stableAlphabetSettings,
      });
    });
    return out;
  }

  if (UNIT_4_SOURCE_ONLY) {
    const { getAudioTargets } = require('./audio-catalog');
    const unit4Targets = getAudioTargets({ sourceKey: 'unit-4' });
    unit4Targets.forEach((target: any) => {
      add(target.audioText, 'gulf', `audio-catalog:${target.sourceKey}[${target.index}]`, 'gulf', {
        outputPath: resolve(ROOT, target.audioPath),
        itemIndex: target.line ?? target.index + 1,
        allowDuplicate: true,
      });
    });
    return out;
  }

  if (UNIT_5_SOURCE_ONLY) {
    const { getAudioTargets } = require('./audio-catalog');
    const unit5Targets = getAudioTargets({ sourceKey: 'unit-5' });
    unit5Targets.forEach((target: any) => {
      add(target.audioText, 'gulf', `audio-catalog:${target.sourceKey}[${target.index}]`, 'gulf', {
        outputPath: resolve(ROOT, target.audioPath),
        itemIndex: target.line ?? target.index + 1,
        allowDuplicate: true,
      });
    });
    return out;
  }

  if (UNIT_7_SOURCE_ONLY) {
    const { getAudioTargets } = require('./audio-catalog');
    const unit7Targets = getAudioTargets({ sourceKey: 'unit-7' });
    unit7Targets.forEach((target: any) => {
      add(target.audioText, 'gulf', `audio-catalog:${target.sourceKey}[${target.index}]`, 'gulf', {
        outputPath: resolve(ROOT, target.audioPath),
        itemIndex: target.line ?? target.index + 1,
        allowDuplicate: true,
      });
    });
    return out;
  }

  if (UNIT_9_SOURCE_ONLY) {
    const { getAudioTargets } = require('./audio-catalog');
    const unit9Targets = getAudioTargets({ sourceKey: 'unit-9' });
    unit9Targets.forEach((target: any) => {
      add(target.audioText, 'gulf', `audio-catalog:${target.sourceKey}[${target.index}]`, 'gulf', {
        outputPath: resolve(ROOT, target.audioPath),
        itemIndex: target.line ?? target.index + 1,
        allowDuplicate: true,
      });
    });
    return out;
  }

  if (MSA_SOURCE_ONLY) {
    // Generate lesson words for MSA track
    const msaWords = require('../data/msa-words');
    const msaLessonMap: Record<string, string> = {
      BASIC_WORDS_MSA: 'msa/basic-words',
      GREETINGS_WORDS_MSA: 'msa/greetings',
      INTRO_WORDS_MSA: 'msa/intro',
    };
    for (const [exportName, folder] of Object.entries(msaLessonMap)) {
      const arr = msaWords[exportName];
      if (!Array.isArray(arr)) continue;
      arr.forEach((w: any, i: number) => {
        if (!w || typeof w.arabic !== 'string') return;
        const text = w.audioText ?? w.displayArabic ?? w.arabic;
        add(text, 'msa', `msa-words:${exportName}[${i}]`, 'msa', {
          outputPath: resolve(ROOT, 'assets/audio', folder, `${i + 1}.mp3`),
          itemIndex: i + 1,
          allowDuplicate: true,
        });
      });
    }
    return out;
  }

  if (SCENARIO_ONLY) {
    const scenarioDialect: ScenarioDialect = SCENARIO_ONLY.dialect ?? (SCENARIO_ONLY.folder.startsWith('msa/') ? 'msa' : 'gulf');
    const dialogueModule = scenarioDialect === 'msa'
      ? require('../data/msa-dialogues')
      : scenarioDialect === 'egyptian'
        ? require('../data/egyptian-dialogues')
        : require('../data/gulf-dialogues');
    const scenarioTurns = dialogueModule[SCENARIO_ONLY.exportName];
    if (!Array.isArray(scenarioTurns)) return out;
    if (LINE_INDEX !== null && LINE_INDEX >= scenarioTurns.length) {
      console.error(`✗ --line ${LINE_INDEX} is out of range for ${SCENARIO_ONLY.exportName} (0-${scenarioTurns.length - 1})`);
      process.exit(1);
    }

    const bucket: Bucket = scenarioDialect;
    const manifestKey = scenarioDialect;
    let waiterIndex = 0;
    let userIndex = 0;
    scenarioTurns.forEach((turn: any, i: number) => {
      if (!turn || typeof turn.arabic !== 'string') return;
      const text = turn.audioText ?? turn.displayArabic ?? turn.arabic;
      const isWaiter = turn.type === 'waiter';
      const fileIndex = isWaiter ? ++waiterIndex : ++userIndex;
      const filePrefix = isWaiter ? 'w' : 'u';
      if (LINE_INDEX !== null && i !== LINE_INDEX) return;
      add(text, bucket, `${scenarioDialect}-dialogues:${SCENARIO_ONLY.exportName}[${i}]`, manifestKey, {
        outputPath: resolve(ROOT, 'assets/audio', SCENARIO_ONLY.folder, `${filePrefix}${fileIndex}.mp3`),
        itemIndex: i,
        lineIndex: i,
        turnType: turn.type,
        allowDuplicate: scenarioDialect === 'egyptian',
      });
    });
    return out;
  }

  if (EGYPTIAN_SOURCE_ONLY) {
    collectEgyptianWords();
    collectEgyptianDialogues();
    return out;
  }

  // ── constants/words.ts (Gulf) ────────────────────────────────────────────
  const words = require('../constants/words');
  for (const [name, arr] of Object.entries(words)) {
    if (!Array.isArray(arr)) continue;
    if (BASIC_WORDS_ONLY && name !== 'BASIC_WORDS') continue;
    if (GREETINGS_ONLY && name !== 'GREETINGS_WORDS') continue;
    if (INTRO_ONLY && name !== 'INTRO_WORDS') continue;
    if (GREETINGS_ONLY && LINE_INDEX !== null && (LINE_INDEX < 1 || LINE_INDEX > arr.length)) {
      console.error(`✗ --line ${LINE_INDEX} is out of range for GREETINGS_WORDS (1-${arr.length})`);
      process.exit(1);
    }
    if (INTRO_ONLY && LINE_INDEX !== null && (LINE_INDEX < 1 || LINE_INDEX > arr.length)) {
      console.error(`✗ --line ${LINE_INDEX} is out of range for INTRO_WORDS (1-${arr.length})`);
      process.exit(1);
    }
    arr.forEach((w: any, i: number) => {
      if (w && typeof w.arabic === 'string') {
        if (GREETINGS_ONLY && LINE_INDEX !== null && i !== LINE_INDEX - 1) return;
        if (INTRO_ONLY && LINE_INDEX !== null && i !== LINE_INDEX - 1) return;
        const text = (name === 'BASIC_WORDS' || name === 'GREETINGS_WORDS' || name === 'INTRO_WORDS') ? (w.audioText ?? w.arabic) : w.arabic;
        const options = BASIC_WORDS_ONLY && name === 'BASIC_WORDS'
          ? {
              outputPath: resolve(ROOT, 'assets/audio/basic-words', `${i + 1}.mp3`),
              itemIndex: i + 1,
            }
          : GREETINGS_ONLY && name === 'GREETINGS_WORDS'
            ? {
                outputPath: resolve(ROOT, 'assets/audio/greetings', `${i + 1}.mp3`),
                itemIndex: i + 1,
              }
          : INTRO_ONLY && name === 'INTRO_WORDS'
            ? {
                outputPath: resolve(ROOT, 'assets/audio/intro', `${i + 1}.mp3`),
                itemIndex: i + 1,
              }
          : {};
        add(text, 'gulf', `words:${name}[${i}]`, 'gulf', options);
      }
    });
  }

  if (NARROW_LESSON) return out;

  // ── data/egyptian-words.ts ───────────────────────────────────────────────
  collectEgyptianWords();

  // ── data/gulf-dialogues.ts ───────────────────────────────────────────────
  const gd = require('../data/gulf-dialogues');
  for (const [name, arr] of Object.entries(gd)) {
    if (!Array.isArray(arr)) continue;
    arr.forEach((t: any, i: number) => {
      if (t && typeof t.arabic === 'string') {
        add(t.arabic, 'gulf', `gulf-dialogues:${name}[${i}]`);
      }
    });
  }

  // ── data/egyptian-dialogues.ts ───────────────────────────────────────────
  collectEgyptianDialogues();

  // ── data/msa-words.ts ───────────────────────────────────────────────────
  try {
    const msaw = require('../data/msa-words');
    for (const [name, arr] of Object.entries(msaw)) {
      if (!Array.isArray(arr)) continue;
      arr.forEach((w: any, i: number) => {
        if (w && typeof w.arabic === 'string') {
          add(w.audioText ?? w.displayArabic ?? w.arabic, 'msa', `msa-words:${name}[${i}]`, 'msa');
        }
      });
    }
  } catch (e) {
    console.warn('Could not load msa-words:', (e as Error).message);
  }

  // ── data/msa-dialogues.ts ───────────────────────────────────────────────
  try {
    const msad = require('../data/msa-dialogues');
    for (const [name, arr] of Object.entries(msad)) {
      if (!Array.isArray(arr)) continue;
      arr.forEach((t: any, i: number) => {
        if (t && typeof t.arabic === 'string') {
          add(t.audioText ?? t.displayArabic ?? t.arabic, 'msa', `msa-dialogues:${name}[${i}]`, 'msa');
        }
      });
    }
  } catch (e) {
    console.warn('Could not load msa-dialogues:', (e as Error).message);
  }

  // ── data/quiz-part1.ts & quiz-unit6.ts audioText fallbacks ───────────────
  for (const rel of ['../data/quiz-part1', '../data/quiz-unit6']) {
    try {
      const q = require(rel);
      for (const [name, arr] of Object.entries(q)) {
        if (!Array.isArray(arr)) continue;
        arr.forEach((item: any, i: number) => {
          if (item && typeof item.audioText === 'string') {
            add(item.audioText, 'gulf', `${rel}:${name}[${i}]`);
          }
        });
      }
    } catch {
      /* optional file */
    }
  }

  // ── Letter families (duplicated from app/writing.tsx) ────────────────────
  // These are passed to speakArabic() without a voiceId arg, so they use the
  // default Sultan voice. nameAudio is the Arabic letter name in Arabic script
  // (e.g. "أَلِف", "بَاء") so ElevenLabs pronounces it natively.
  const LETTERS: { nameAudio: string; arabic: string }[] = [
    { nameAudio: 'ألف',         arabic: 'أَهْلاً' },
    { nameAudio: 'باء',         arabic: 'بَيْت' },
    { nameAudio: 'تاء',         arabic: 'تَمْر' },
    { nameAudio: 'ثاء',         arabic: 'ثَعْلَب' },
    { nameAudio: 'جيم',         arabic: 'جَمِيل' },
    { nameAudio: 'حاء',         arabic: 'حَياة' },
    { nameAudio: 'خاء',         arabic: 'خَيْر' },
    { nameAudio: 'دال',         arabic: 'دَرْهَم' },
    { nameAudio: 'ذال',         arabic: 'ذَهَب' },
    { nameAudio: 'راء',         arabic: 'رَجُل' },
    { nameAudio: 'زاي',         arabic: 'زَيْت' },
    { nameAudio: 'سين',         arabic: 'سَيَّارة' },
    { nameAudio: 'شين',         arabic: 'شُكْراً' },
    { nameAudio: 'صاد',         arabic: 'صَبَاح' },
    { nameAudio: 'ضاد',         arabic: 'ضَيْف' },
    { nameAudio: 'طاء',         arabic: 'طَعَام' },
    { nameAudio: 'ظاء',         arabic: 'ظَرِيف' },
    { nameAudio: 'عين',         arabic: 'عَيْن' },
    { nameAudio: 'غين',         arabic: 'غَالي' },
    { nameAudio: 'فاء',         arabic: 'فُنْدُق' },
    { nameAudio: 'قاف',         arabic: 'قَهْوَة' },
    { nameAudio: 'كاف',         arabic: 'كَلِمَة' },
    { nameAudio: 'لام',         arabic: 'لَيْلَة' },
    { nameAudio: 'ميم',         arabic: 'مَاء' },
    { nameAudio: 'نون',         arabic: 'نَعَم' },
    { nameAudio: 'هاء',         arabic: 'هُنَا' },
    { nameAudio: 'واو',         arabic: 'وَقْت' },
    { nameAudio: 'ياء',         arabic: 'يَوْم' },
    { nameAudio: 'تاء مربوطة',  arabic: 'مَدِينَة' },
    { nameAudio: 'همزة',        arabic: 'مَاء' },
    { nameAudio: 'ألف مقصورة',  arabic: 'عَلى' },
  ];
  for (const L of LETTERS) {
    add(L.nameAudio, 'gulf', 'letters:nameAudio', 'gulf');
    add(L.arabic,    'gulf', 'letters:word',     'gulf');
  }

  // ── Encouragements (from app/scenario.tsx) ───────────────────────────────
  const ENCOURAGEMENTS = ['ممتاز', 'أحسنت', 'رائع', 'بالضبط', 'جيد جداً'];
  for (const e of ENCOURAGEMENTS) {
    add(e, 'gulf',     'encouragements', 'gulf');
    add(e, 'egyptian', 'encouragements', 'egyptian');
  }

  return out;
}

// ── Existing-file index ────────────────────────────────────────────────────
// Parse every sibling generator script to recover their (voice, text) →
// file path mapping. A target whose (voice, normalized text) matches an
// existing file can skip ElevenLabs.
interface ExistingEntry { voiceId: string; text: string; path: string; }

function scanSiblingScripts(): ExistingEntry[] {
  const scriptsDir = resolve(ROOT, 'scripts');
  const files = readdirSync(scriptsDir).filter(
    f => f.endsWith('.ts') && f.startsWith('generate-') && f !== 'generate-all-audio.ts',
  );
  const out: ExistingEntry[] = [];
  for (const file of files) {
    const src = readFileSync(join(scriptsDir, file), 'utf-8');
    const voiceMatch = src.match(/VOICE_ID\s*=\s*['"]([^'"]+)['"]/);
    const dirMatch = src.match(/pathResolve\(['"]\.\/(assets\/audio\/[^'"]+)['"]\)/);
    if (!voiceMatch || !dirMatch) continue;
    const voiceId = voiceMatch[1];
    const outDir = resolve(ROOT, dirMatch[1]);
    // Extract PHRASES entries: { id: '…', text: '…' }
    const phraseRe = /\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*text:\s*['"]([^'"]+)['"]\s*\}/g;
    let m: RegExpExecArray | null;
    while ((m = phraseRe.exec(src)) !== null) {
      const id = m[1];
      const text = m[2];
      const filePath = join(outDir, `${id}.mp3`);
      if (existsSync(filePath)) {
        out.push({ voiceId, text, path: filePath });
      }
    }
  }
  return out;
}

// Scan data files for `arabic: '…'` entries that already have `audio: require(
// '../assets/audio/…' )` wired. This gives us (tashkeel-preserved text → path)
// pairs that beat the sibling-script fuzzy matches.
function scanWiredDataFiles(): ExistingEntry[] {
  const out: ExistingEntry[] = [];
  const files = [
    { rel: 'constants/words.ts',           voiceId: VOICE_GULF },
    { rel: 'data/gulf-dialogues.ts',       voiceId: VOICE_GULF },
    { rel: 'data/egyptian-dialogues.ts',   voiceId: VOICE_EGYPTIAN },
    { rel: 'data/egyptian-words.ts',       voiceId: VOICE_EGYPTIAN },
    { rel: 'data/msa-dialogues.ts',        voiceId: VOICE_MSA },
    { rel: 'data/msa-words.ts',            voiceId: VOICE_MSA },
    { rel: 'data/quiz-part1.ts',           voiceId: VOICE_GULF },
    { rel: 'data/quiz-unit6.ts',           voiceId: VOICE_GULF },
  ];
  for (const { rel, voiceId } of files) {
    const abs = resolve(ROOT, rel);
    if (!existsSync(abs)) continue;
    const src = readFileSync(abs, 'utf-8');
    // arabic text + require on same object line (loose match, works on flat
    // objects). Arabic text captured between single quotes.
    const re = /arabic:\s*'([^']+)'[\s\S]*?audio(?:File)?:\s*require\(\s*['"]\.\.\/([^'"]+)['"]\s*\)/g;
    // Audio-text fallback for quiz files: audioText: '…' audioFile: require('…')
    const re2 = /audioText:\s*'([^']+)'[\s\S]*?audioFile:\s*require\(\s*['"]\.\.\/([^'"]+)['"]\s*\)/g;
    for (const re_i of [re, re2]) {
      let m: RegExpExecArray | null;
      while ((m = re_i.exec(src)) !== null) {
        const text = m[1];
        const filePath = resolve(ROOT, m[2]);
        if (existsSync(filePath)) {
          out.push({ voiceId, text, path: filePath });
        }
      }
    }
  }
  return out;
}

// ── Manifest writers ───────────────────────────────────────────────────────
interface ManifestEntry { bucket: Bucket; manifestKey: 'gulf' | 'egyptian' | 'msa'; hash: string; path: string; text: string; source: string; }

function writeManifests(entriesByTarget: Map<Target, ManifestEntry>) {
  if (!existsSync(dirname(MANIFEST_TS))) mkdirSync(dirname(MANIFEST_TS), { recursive: true });

  // JSON manifest (keyed "<dialect>:<normalized>")
  const jsonOut: Record<string, any> = {};
  for (const [target, e] of entriesByTarget) {
    const absPath = isAbsolute(e.path) ? e.path : resolve(ROOT, e.path);
    jsonOut[`${e.manifestKey}:${normalize(target.text)}`] = {
      hash: e.hash,
      dialect: e.manifestKey,
      bucket: e.bucket,
      path: relative(ROOT, absPath),
      text: target.text,
      source: e.source,
    };
  }
  writeFileSync(MANIFEST_JSON, JSON.stringify(jsonOut, null, 2), 'utf-8');
  console.log(`✓ wrote ${relative(ROOT, MANIFEST_JSON)} (${Object.keys(jsonOut).length} entries)`);

  // TS manifest — keyed by manifestKey dialect
  const perDialect: Record<'gulf' | 'egyptian' | 'msa', Array<{ norm: string; rel: string }>> = { gulf: [], egyptian: [], msa: [] };
  const seen = new Set<string>();
  for (const [target, e] of entriesByTarget) {
    const norm = normalize(target.text);
    const combo = e.manifestKey + '::' + norm;
    if (seen.has(combo)) continue;
    seen.add(combo);
    perDialect[e.manifestKey].push({ norm, rel: e.path });
  }

  const lines: string[] = [];
  lines.push('// AUTO-GENERATED by scripts/generate-all-audio.ts — do not edit');
  lines.push('// Regenerate: npm run generate-audio');
  lines.push('');
  lines.push("export type AudioDialect = 'gulf' | 'egyptian' | 'msa';");
  lines.push('');
  lines.push('export const AUDIO_MANIFEST: Record<AudioDialect, Record<string, any>> = {');
  for (const d of ['gulf', 'egyptian', 'msa'] as const) {
    lines.push(`  ${d}: {`);
    for (const { norm, rel } of perDialect[d]) {
      // relative path from constants/audio-manifest.ts to the mp3
      const reqPath = './' + relative(dirname(MANIFEST_TS), rel);
      lines.push(`    ${JSON.stringify(norm)}: require(${JSON.stringify(reqPath)}),`);
    }
    lines.push('  },');
  }
  lines.push('};');
  lines.push('');
  lines.push('// Keep in sync with utils/tts.ts cache-key rule: trim + lowercase, tashkeel preserved.');
  lines.push('export function normalizeAudioKey(text: string): string {');
  lines.push('  return text.trim().toLowerCase();');
  lines.push('}');
  lines.push('');
  lines.push("export function getAudioAsset(text: string, dialect: AudioDialect = 'gulf'): any {");
  lines.push('  const key = normalizeAudioKey(text);');
  lines.push('  return AUDIO_MANIFEST[dialect]?.[key] ?? null;');
  lines.push('}');
  lines.push('');

  writeFileSync(MANIFEST_TS, lines.join('\n'), 'utf-8');
  console.log(`✓ wrote ${relative(ROOT, MANIFEST_TS)} (${perDialect.gulf.length + perDialect.egyptian.length + perDialect.msa.length} entries)`);
}

// ── ElevenLabs generator ───────────────────────────────────────────────────
async function synth(target: Target, destPath: string): Promise<boolean> {
  const attempt = async (): Promise<boolean> => {
    try {
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${target.voiceId}`, {
        method: 'POST',
        headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: target.text,
          model_id: target.modelId,
          voice_settings: target.voiceSettings ?? DEFAULT_VOICE_SETTINGS,
        }),
      });
      if (!r.ok) {
        console.error(`   ✗ HTTP ${r.status}: ${await r.text().catch(() => '?')}`);
        return false;
      }
      const buf = await r.arrayBuffer();
      if (!existsSync(dirname(destPath))) mkdirSync(dirname(destPath), { recursive: true });
      writeFileSync(destPath, Buffer.from(buf));
      return true;
    } catch (err) {
      console.error(`   ✗ network: ${(err as Error).message}`);
      return false;
    }
  };
  let ok = await attempt();
  if (!ok) {
    await new Promise(r => setTimeout(r, 1500));
    console.log('   ↻ retrying…');
    ok = await attempt();
  }
  return ok;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎙  generate-all-audio');
  console.log('flags:', [
    DRY_RUN && 'DRY-RUN',
    MATCH_ONLY && 'MATCH-ONLY',
    FORCE && 'FORCE',
    CATALOG_DRY_RUN && 'CATALOG-DRY-RUN',
    VARIANT_TEST && 'VARIANT-TEST',
    SEQUENCE_TEST && 'SEQUENCE-TEST',
    SULTAN_ALPHABET_TEST && 'SULTAN-ALPHABET-TEST',
    LESSON && `LESSON=${LESSON}`,
    SCENARIO && `SCENARIO=${SCENARIO}`,
    SOURCE && `SOURCE=${SOURCE}`,
    PROVIDER && `PROVIDER=${PROVIDER}`,
    ALPHABET_MODE && `ALPHABET-MODE=${ALPHABET_MODE}`,
    LINE_INDEX !== null && `LINE=${LINE_INDEX}`,
  ].filter(Boolean).join(' ') || '(none)');

  if (CATALOG_DRY_RUN) {
    const { getAudioCatalog } = require('./audio-catalog');
    const catalog = getAudioCatalog();
    const bySourceKey = new Map<string, number>();

    for (const target of catalog) {
      bySourceKey.set(target.sourceKey, (bySourceKey.get(target.sourceKey) ?? 0) + 1);
    }

    console.log(`→ catalog targets: ${catalog.length}`);
    console.log('\nby sourceKey:');
    [...bySourceKey.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([sourceKey, count]) => {
        console.log(`  ${sourceKey.padEnd(16)} ${count}`);
      });

    console.log('\nfirst 10 targets:');
    for (const target of catalog.slice(0, 10)) {
      console.log(JSON.stringify({
        id: target.id,
        dialect: target.dialect,
        kind: target.kind,
        sourceKey: target.sourceKey,
        line: target.line,
        speaker: target.speaker,
        audioText: target.audioText,
        audioPath: target.audioPath,
      }));
    }

    console.log('\n(catalog dry-run — no files written, no ElevenLabs calls, no manifest changes)');
    return;
  }

  const targets = collectTargets();
  const filteredTargets = TEXT_FILTER
    ? targets.filter(t => t.text.replace(/\.$/,'').trim() === TEXT_FILTER.trim())
    : targets;
  if (TEXT_FILTER && filteredTargets.length === 0) {
    console.error(`✗ --text "${TEXT_FILTER}" matched no targets`);
    process.exit(1);
  }
  console.log(`→ collected ${filteredTargets.length}${TEXT_FILTER ? ` (filtered from ${targets.length})` : ''} unique (voice × text) targets`);

  const fromSiblings = scanSiblingScripts();
  const fromWired = scanWiredDataFiles();
  console.log(`→ indexed ${fromSiblings.length} from sibling scripts, ${fromWired.length} from wired data fields`);

  // Primary index: exact match on (voice × normalized text, tashkeel preserved)
  const exactIdx = new Map<string, string>();
  // Secondary index: fuzzy match on (voice × tashkeel-stripped text)
  const fuzzyIdx = new Map<string, string>();
  const reuseDisabled = NARROW_LESSON || ALPHABET_SOURCE_ONLY || UNIT_4_SOURCE_ONLY || UNIT_5_SOURCE_ONLY || UNIT_7_SOURCE_ONLY || UNIT_9_SOURCE_ONLY || MSA_SOURCE_ONLY || EGYPTIAN_SOURCE_ONLY || (SCENARIO_ONLY && FORCE);
  if (!reuseDisabled) {
    for (const e of [...fromWired, ...fromSiblings]) {
      const k1 = e.voiceId + '::' + normalize(e.text);
      const k2 = fuzzyKey(e.voiceId, e.text);
      if (!exactIdx.has(k1)) exactIdx.set(k1, e.path);
      if (!fuzzyIdx.has(k2)) fuzzyIdx.set(k2, e.path);
    }
  } else if (SCENARIO_ONLY) {
    console.log(`→ ${SCENARIO} scenario mode: existing-file reuse disabled with --force; targets will use audioText`);
  } else if (ALPHABET_SOURCE_ONLY) {
    console.log('→ alphabet source mode: existing-file reuse disabled; targets will use catalog audioText');
  } else if (UNIT_4_SOURCE_ONLY) {
    console.log('→ unit-4 source mode: existing-file reuse disabled; targets will use catalog audioText');
  } else if (UNIT_5_SOURCE_ONLY) {
    console.log('→ unit-5 source mode: existing-file reuse disabled; targets will use catalog audioText');
  } else if (UNIT_7_SOURCE_ONLY) {
    console.log('→ unit-7 source mode: existing-file reuse disabled; targets will use catalog audioText');
  } else if (UNIT_9_SOURCE_ONLY) {
    console.log('→ unit-9 source mode: existing-file reuse disabled; targets will use catalog audioText');
  } else if (EGYPTIAN_SOURCE_ONLY) {
    console.log('→ Egyptian source mode: existing-file reuse disabled; targets will use audioText with Eleven v3');
  } else {
    console.log(`→ ${LESSON} lesson mode: existing-file reuse disabled; targets will use audioText`);
  }

  const matched: { target: Target; src: string; dest: string; hash: string; kind: 'exact' | 'fuzzy' }[] = [];
  const toGen:   { target: Target;             dest: string; hash: string }[] = [];
  const already: { target: Target;             dest: string; hash: string }[] = [];

  for (const t of filteredTargets) {
    const hash = hashFor(t.text, t.voiceId);
    const dest = t.outputPath ?? join(AUTO_DIR, t.bucket, `${hash}.mp3`);
    if (!FORCE && existsSync(dest)) {
      already.push({ target: t, dest, hash });
      continue;
    }
    const exact = exactIdx.get(t.voiceId + '::' + normalize(t.text));
    if (exact) {
      matched.push({ target: t, src: exact, dest, hash, kind: 'exact' });
      continue;
    }
    const fuzzy = fuzzyIdx.get(fuzzyKey(t.voiceId, t.text));
    if (fuzzy) {
      matched.push({ target: t, src: fuzzy, dest, hash, kind: 'fuzzy' });
      continue;
    }
    toGen.push({ target: t, dest, hash });
  }

  const exactMatches = matched.filter(m => m.kind === 'exact').length;
  const fuzzyMatches = matched.filter(m => m.kind === 'fuzzy').length;

  console.log('\n── Plan ──────────────────────────────');
  console.log(`✓ already in auto/:     ${already.length}`);
  console.log(`↪ free (copy existing): ${matched.length}  (exact: ${exactMatches}, fuzzy: ${fuzzyMatches})`);
  console.log(`⏳ need ElevenLabs:      ${toGen.length}`);

  // Credit estimate (character count)
  const chars = toGen.reduce((s, x) => s + x.target.text.length, 0);
  console.log(`\nElevenLabs cost: ~${chars.toLocaleString()} characters`);

  // Source breakdown for items needing generation
  if (toGen.length) {
    const breakdown = new Map<string, number>();
    for (const x of toGen) {
      const sourceParts = x.target.source.split(/[:\[]/);
      const label = x.target.source.startsWith('audio-catalog:')
        ? sourceParts[1] ?? sourceParts[0]
        : sourceParts[0];
      breakdown.set(label, (breakdown.get(label) ?? 0) + 1);
    }
    console.log('\nto-generate by source:');
    [...breakdown.entries()].sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
      console.log(`  ${k.padEnd(40)} ${v}`);
    });
  }

  // Sample of what'd be generated
  if (toGen.length && (DRY_RUN || flags.has('--verbose'))) {
    const sample = NARROW_LESSON || SCENARIO_ONLY || SOURCE ? toGen : toGen.slice(0, 15);
    console.log(NARROW_LESSON || SCENARIO_ONLY || SOURCE ? '\nwould generate:' : '\nsample (first 15):');
    for (const x of sample) {
      if (NARROW_LESSON) {
        console.log(`  ${String(x.target.itemIndex).padStart(2, '0')}. ${x.target.text} → ${relative(ROOT, x.dest)}`);
      } else if (SOURCE) {
        console.log(`  ${String(x.target.itemIndex).padStart(2, '0')}. ${x.target.text} → ${relative(ROOT, x.dest)}`);
      } else if (SCENARIO_ONLY) {
        console.log(`  ${x.target.itemIndex}. ${x.target.turnType} "${x.target.text}" → ${relative(ROOT, x.dest)}`);
      } else {
        console.log(`  [${x.target.manifestKey}] ${relative(ROOT, x.dest)} ← ${x.target.text.slice(0, 50).padEnd(50)} (${x.target.source})`);
      }
    }
  }

  if (DRY_RUN) {
    console.log('\n(dry-run — no files written, no ElevenLabs calls)');
    return;
  }

  // ── Copy matched files ───────────────────────────────────────────────────
  for (const { target, src, dest } of matched) {
    if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    console.log(`↪ [copy] ${target.bucket}/${basename(dest)}  ← ${relative(ROOT, src)}`);
  }

  // ── Generate missing via ElevenLabs ──────────────────────────────────────
  const failed: Target[] = [];
  if (!MATCH_ONLY) {
    if (!API_KEY) {
      console.error('\n✗ Missing ELEVENLABS_API_KEY in environment');
      process.exit(1);
    }
    for (let i = 0; i < toGen.length; i++) {
      const { target, dest } = toGen[i];
      console.log(`⏳ [${i + 1}/${toGen.length}] ${target.manifestKey} "${target.text.slice(0, 50)}"`);
      const ok = await synth(target, dest);
      if (!ok) failed.push(target);
      if (i < toGen.length - 1) await new Promise(r => setTimeout(r, 500));
    }
  } else if (toGen.length) {
    console.log(`\n(--match-only: skipped ${toGen.length} ElevenLabs generations)`);
  }

  if (LESSON) {
    console.log(`\n--lesson ${LESSON}: skipped manifest writing; existing manifests were left untouched`);
    if (failed.length) {
      console.log(`\n⚠ ${failed.length} failed:`);
      for (const f of failed.slice(0, 20)) {
        console.log(`  [${f.manifestKey}] ${f.text.slice(0, 60)}  (${f.source})`);
      }
      if (failed.length > 20) console.log(`  … and ${failed.length - 20} more`);
    }
    console.log('\n🎉 done');
    return;
  }

  if (SCENARIO) {
    console.log(`\n--scenario ${SCENARIO}: skipped manifest writing; existing manifests were left untouched`);
    if (failed.length) {
      console.log(`\n⚠ ${failed.length} failed:`);
      for (const f of failed.slice(0, 20)) {
        console.log(`  [${f.manifestKey}] ${f.text.slice(0, 60)}  (${f.source})`);
      }
      if (failed.length > 20) console.log(`  … and ${failed.length - 20} more`);
    }
    console.log('\n🎉 done');
    return;
  }

  if (SOURCE) {
    console.log(`\n--source ${SOURCE}: skipped manifest writing; existing manifests were left untouched`);
    if (failed.length) {
      console.log(`\n⚠ ${failed.length} failed:`);
      for (const f of failed.slice(0, 20)) {
        console.log(`  [${f.manifestKey}] ${f.text.slice(0, 60)}  (${f.source})`);
      }
      if (failed.length > 20) console.log(`  … and ${failed.length - 20} more`);
    }
    console.log('\n🎉 done');
    return;
  }

  // ── Build manifest from whatever is on disk now ──────────────────────────
  const entries = new Map<Target, ManifestEntry>();
  for (const list of [already, matched, toGen]) {
    for (const { target, dest, hash } of list) {
      if (!existsSync(dest)) continue; // skipped / failed
      entries.set(target, {
        bucket: target.bucket,
        manifestKey: target.manifestKey,
        hash,
        path: dest,
        text: target.text,
        source: target.source,
      });
    }
  }
  writeManifests(entries);

  if (failed.length) {
    console.log(`\n⚠ ${failed.length} failed (not in manifest):`);
    for (const f of failed.slice(0, 20)) {
      console.log(`  [${f.manifestKey}] ${f.text.slice(0, 60)}  (${f.source})`);
    }
    if (failed.length > 20) console.log(`  … and ${failed.length - 20} more`);
  }

  console.log('\n🎉 done');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
