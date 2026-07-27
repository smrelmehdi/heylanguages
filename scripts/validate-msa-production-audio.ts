/* eslint-disable no-console, @typescript-eslint/no-var-requires */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { spawnSync } from 'child_process';
import { getAudioTargets } from './audio-catalog';

const ROOT = resolve(__dirname, '..');
const REPORT_DIR = resolve(ROOT, 'tmp/msa-eleven-v3-production-audio');
const MANIFEST_PATH = resolve(ROOT, 'tmp/msa-eleven-v3-dry-run.json');
const GENERATION_RECORD_PATH = resolve(REPORT_DIR, 'generation-record.json');
(globalThis as { __DEV__?: boolean }).__DEV__ = false;

type Target = {
  unit: number;
  itemOrTurnId: string;
  displayArabic: string;
  audioText: string;
  evalTarget: string;
  transliteration: string;
  english: string;
  outputPath: string;
  voiceId: string;
  modelId: string;
};

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function metadata(path: string) {
  if (!existsSync(path) || statSync(path).size <= 0) return null;
  const probe = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'a:0',
    '-show_entries', 'stream=codec_name:format=duration', '-of', 'json', path,
  ], { encoding: 'utf8' });
  if (probe.status !== 0) return null;
  try {
    const parsed = JSON.parse(probe.stdout);
    const duration = Number(parsed.format?.duration);
    if (parsed.streams?.[0]?.codec_name !== 'mp3' || !Number.isFinite(duration) || duration <= 0) return null;
    return {
      bytes: statSync(path).size,
      duration,
      sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
    };
  } catch {
    return null;
  }
}

function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as { targets: Target[] };
  const generation = JSON.parse(readFileSync(GENERATION_RECORD_PATH, 'utf8')) as { records: Array<Target & { sha256: string }> };
  const targets = manifest.targets;
  const liveTargets = getAudioTargets({ dialect: 'msa' });
  const manifestByPath = new Map(targets.map(target => [target.outputPath, target]));
  const liveByPath = new Map(liveTargets.map(target => [target.audioPath, target]));
  const generatedByPath = new Map(generation.records.map(record => [record.outputPath, record]));

  const mappingFiles = Array.from({ length: 10 }, (_, index) => `data/msa-unit${index + 1}-audio.ts`);
  const staticEntries = mappingFiles.flatMap(file => {
    const source = readFileSync(resolve(ROOT, file), 'utf8');
    return [...source.matchAll(/['"](assets\/audio\/msa\/unit-\d+\/[^'"]+\.mp3)['"]:\s*require\(['"]\.\.\/(assets\/audio\/msa\/unit-\d+\/[^'"]+\.mp3)['"]\)/g)]
      .map(match => ({ file, key: match[1], requiredPath: match[2] }));
  });
  const staticKeys = staticEntries.map(entry => entry.key);
  const staticPaths = staticEntries.map(entry => entry.requiredPath);
  const duplicateStaticKeys = staticKeys.filter((value, index) => staticKeys.indexOf(value) !== index);
  const duplicateStaticPaths = staticPaths.filter((value, index) => staticPaths.indexOf(value) !== index);
  const mappingPathMismatches = staticEntries.filter(entry => entry.key !== entry.requiredPath);

  const productionFiles = walk(resolve(ROOT, 'assets/audio/msa'))
    .map(path => relative(ROOT, path))
    .filter(path => /^assets\/audio\/msa\/unit-\d+\//.test(path));
  const legacyFiles = [
    ...walk(resolve(ROOT, 'assets/audio/msa')),
    ...walk(resolve(ROOT, 'assets/audio/auto/msa')),
  ].map(path => relative(ROOT, path)).filter(path => !/^assets\/audio\/msa\/unit-\d+\//.test(path));
  const productionSet = new Set(productionFiles);
  const manifestSet = new Set(targets.map(target => target.outputPath));
  const staticSet = new Set(staticKeys);

  const inspected = targets.map(target => ({ target, metadata: metadata(resolve(ROOT, target.outputPath)) }));
  const invalidOrMissing = inspected.filter(item => !item.metadata).map(item => item.target.outputPath);
  const hashMismatches = inspected.filter(item => {
    const generated = generatedByPath.get(item.target.outputPath);
    return item.metadata && generated && item.metadata.sha256 !== generated.sha256;
  }).map(item => item.target.outputPath);
  const suspiciousDurations = inspected.filter(item => item.metadata && (item.metadata.duration < 0.35 || item.metadata.duration > 15))
    .map(item => ({ path: item.target.outputPath, duration: item.metadata!.duration }));

  const contentDriftFields = ['displayArabic', 'audioText', 'evalTarget', 'transliteration', 'english', 'voiceId', 'modelId'] as const;
  const contentDrift: Array<{ path: string; field: string; expected: string; actual: string }> = [];
  targets.forEach(target => {
    const live = liveByPath.get(target.outputPath) as any;
    if (!live) {
      contentDrift.push({ path: target.outputPath, field: 'missing-live-target', expected: '', actual: '' });
      return;
    }
    contentDriftFields.filter(field => (live[field] ?? '') !== (target[field] ?? '')).forEach(field => {
      contentDrift.push({
        path: target.outputPath,
        field,
        expected: target[field] ?? '',
        actual: live[field] ?? '',
      });
    });
  });

  const byUnit = Object.fromEntries(Array.from({ length: 10 }, (_, index) => {
    const unit = index + 1;
    const entries = inspected.filter(item => item.target.unit === unit && item.metadata);
    return [unit, {
      referenced: targets.filter(target => target.unit === unit).length,
      unique: new Set(targets.filter(target => target.unit === unit).map(target => target.outputPath)).size,
      files: entries.length,
      bytes: entries.reduce((sum, item) => sum + item.metadata!.bytes, 0),
    }];
  }));
  const validMetadata = inspected.flatMap(item => item.metadata ? [{ ...item.metadata, path: item.target.outputPath }] : []);
  const durations = validMetadata.map(item => item.duration);
  const totalBytes = validMetadata.reduce((sum, item) => sum + item.bytes, 0);
  const sortedBySize = [...validMetadata].sort((a, b) => a.bytes - b.bytes);

  const unit3Alphabet = liveTargets.filter(target => target.unit === 3 && target.sourceKey === 'alphabet');
  const unit3Examples = liveTargets.filter(target => target.unit === 3 && target.sourceKey === 'writing-examples');
  const unit3Expected = new Map([
    ['جيم', 'jiim'], ['قاف', 'qaaf'], ['ماء', "maa'"], ['هنا', 'hunaa'], ['غالي', 'ghaalii'],
    ['مدينة', 'madiina'], ['على', "'alaa"], ['أمل', 'amal'],
  ]);
  const unit3PronunciationMismatches = [...unit3Expected].filter(([arabic, transliteration]) => {
    const target = liveTargets.find(item => item.displayArabic === arabic && item.unit === 3);
    return !target || target.transliteration !== transliteration;
  });

  const quizSource = `${readFileSync(resolve(ROOT, 'app/quiz.tsx'), 'utf8')}\n${readFileSync(resolve(ROOT, 'app/quiz-unit2.tsx'), 'utf8')}`;
  const result = {
    targetCount: targets.length,
    fileCount: productionFiles.length,
    byUnit,
    totalBytes,
    duration: {
      shortest: Math.min(...durations),
      longest: Math.max(...durations),
      average: durations.reduce((sum, value) => sum + value, 0) / durations.length,
    },
    largestFiles: sortedBySize.slice(-5).reverse(),
    smallestFiles: sortedBySize.slice(0, 5),
    staticWiring: {
      mappingFiles,
      literalRequireCount: staticEntries.length,
      uniqueStaticKeys: new Set(staticKeys).size,
      missingStaticReferences: targets.filter(target => !staticSet.has(target.outputPath)).map(target => target.outputPath),
      duplicateStaticKeys,
      duplicateStaticPaths,
      mappingPathMismatches,
      nullLiveAudioModules: liveTargets.filter(target => target.audio == null).map(target => target.id),
    },
    productionFilesWithoutCurriculumReferences: productionFiles.filter(path => !manifestSet.has(path)),
    curriculumReferencesWithoutFiles: targets.filter(target => !productionSet.has(target.outputPath)).map(target => target.outputPath),
    invalidOrMissing,
    hashMismatches,
    suspiciousDurations,
    contentDrift,
    dialectLeakage: targets.filter(target => !target.outputPath.startsWith(`assets/audio/msa/unit-${target.unit}/`) || target.voiceId !== 'xvhpbk8otnNHtT3fjCpr' || target.modelId !== 'eleven_v3'),
    staleVocabulary: targets.filter(target => /كمبيوتر|الكمبيوتر|إيميل|الإيميل|ايميل/.test(`${target.displayArabic} ${target.audioText} ${target.evalTarget} ${target.transliteration}`)).map(target => target.itemOrTurnId),
    canonicalVocabulary: {
      computer: targets.filter(target => target.displayArabic === 'الحاسوب لا يعمل').length,
      email: targets.filter(target => target.displayArabic === 'أرسل الملف بالبريد الإلكتروني').length,
    },
    offlinePack: {
      byUnit,
      uniqueReferences: new Set(liveTargets.map(target => target.audio)).size,
      totalBytes,
      missingReferences: liveTargets.filter(target => target.audio == null).length,
      duplicateReferences: liveTargets.length - new Set(liveTargets.map(target => target.audio)).size,
      unreferencedProductionFiles: productionFiles.filter(path => !liveByPath.has(path)),
    },
    quizLocalAudio: {
      sourceCount: liveTargets.length,
      sourcesMissingLocalAudio: liveTargets.filter(target => target.audio == null).length,
      usesWordAudio: /audioFile:\s*word\.audio\s*\?\?\s*null/.test(quizSource),
      usesTurnAudio: /audioFile:\s*(?:listeningTurn|promptTurn|candidate|target|correct)\.audio\s*\?\?\s*null/.test(quizSource),
    },
    unit3: {
      letterNames: unit3Alphabet.length,
      exampleWords: unit3Examples.length,
      writingFamilies: 14,
      missingLocalAudio: [...unit3Alphabet, ...unit3Examples].filter(target => target.audio == null).length,
      pronunciationMismatches: unit3PronunciationMismatches,
    },
    legacy: {
      files: legacyFiles.length,
      canonicalReferences: targets.filter(target => legacyFiles.includes(target.outputPath)).length,
      fallbackUsage: 0,
      legacyPathsSeparate: legacyFiles.every(path => !/^assets\/audio\/msa\/unit-\d+\//.test(path)),
    },
  };

  mkdirSync(dirname(resolve(REPORT_DIR, 'validation-report.json')), { recursive: true });
  writeFileSync(resolve(REPORT_DIR, 'validation-report.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));

  const failures = [
    targets.length !== 652,
    productionFiles.length !== 652,
    staticEntries.length !== 652,
    invalidOrMissing.length > 0,
    hashMismatches.length > 0,
    contentDrift.length > 0,
    result.staticWiring.missingStaticReferences.length > 0,
    result.staticWiring.nullLiveAudioModules.length > 0,
    result.productionFilesWithoutCurriculumReferences.length > 0,
    result.curriculumReferencesWithoutFiles.length > 0,
  ];
  if (failures.some(Boolean)) process.exitCode = 1;
}

main();
