import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { extname, join, relative, resolve } from 'path';
import { getAudioTargets, type AudioTarget } from './audio-catalog';

const ROOT = process.cwd();
const REPORT_DIR = resolve(ROOT, 'tmp/egyptian-unit67-production-audio');
const REGISTRY_PATH = resolve(ROOT, 'data/egyptian-unit67-audio.ts');
const UNIT_ROOTS = [
  resolve(ROOT, 'assets/audio/egyptian/unit-6'),
  resolve(ROOT, 'assets/audio/egyptian/unit-7'),
];

const RISK_TERMS: Array<[string, RegExp]> = [
  ['espresso', /إسبريسو|espresso/i],
  ['menu', /منيو|menu/i],
  ['Wi-Fi', /واي\s*فاي|wi-?fi/i],
  ['boarding', /بوردينج|boarding/i],
  ['بريك', /بريك/],
  ['باسورد', /باسورد/],
  ['موبايل', /موبايل/],
  ['كمبيوتر', /كمبيوتر/],
  ['مهندس', /مهندس/],
  ['محاسب', /محاسب/],
  ['قهوة مظبوط', /قهوة|مظبوط/],
  ['أوضة الاجتماعات', /أوضة\s+الاجتماعات/],
  ['رقم', /رقم/],
  ['طريق', /طريق/],
  ['وقت', /وقت/],
  ['جنيه', /جنيه/],
  ['جديد', /جديد/],
  ['اجتماع', /اجتماع/],
];

function walkMp3(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walkMp3(path);
    return entry.isFile() && extname(entry.name).toLowerCase() === '.mp3' ? [path] : [];
  });
}

function relativePath(path: string): string {
  return relative(ROOT, path).replaceAll('\\', '/');
}

function durationSeconds(path: string): number {
  const output = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    path,
  ], { encoding: 'utf8' }).trim();
  return Number(output);
}

function hasMp3Header(path: string): boolean {
  const bytes = readFileSync(path).subarray(0, 3);
  const id3 = bytes.toString('ascii') === 'ID3';
  const frameSync = bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
  return id3 || frameSync;
}

function targetText(target: AudioTarget): string {
  return [target.displayArabic, target.audioText, target.evalTarget, target.english].filter(Boolean).join(' ');
}

const unit6 = getAudioTargets({ sourceKey: 'egyptian-unit-6' });
const unit7 = getAudioTargets({ sourceKey: 'egyptian-unit-7' });
const targets = [...unit6, ...unit7];
const targetPaths = targets.map(target => target.audioPath.replaceAll('\\', '/'));
const targetPathSet = new Set(targetPaths);
const duplicateReferences = targetPaths.filter((path, index) => targetPaths.indexOf(path) !== index);

// audio-catalog installs a Node asset hook before these runtime curriculum imports.
const { getDialectProgressionItems } = require('../utils/content-resolver') as typeof import('../utils/content-resolver');
const { getDialectContent } = require('../data/content-registry') as typeof import('../data/content-registry');
const egyptianContent = getDialectContent('egyptian');
const offlinePaths: string[] = [];
const missingRuntimeAudio: string[] = [];
getDialectProgressionItems('egyptian')
  .filter(item => item.unitId === 'unit-6' || item.unitId === 'unit-7')
  .forEach(item => {
    if (item.contentType === 'lesson') {
      const words = item.lessonWords ?? (item.lessonKey ? egyptianContent.lessons[item.lessonKey] : undefined) ?? [];
      words.forEach(word => {
        if (word.audioPath) offlinePaths.push(word.audioPath);
        if (!word.audio) missingRuntimeAudio.push(word.audioPath ?? `${item.contentId}:unknown`);
      });
    }
    if (item.contentType === 'scenario' && item.scenarioName) {
      const turns = egyptianContent.scenarios[item.scenarioName] ?? [];
      turns.forEach(turn => {
        if (turn.audioPath) offlinePaths.push(turn.audioPath);
        if (!turn.audio) missingRuntimeAudio.push(turn.audioPath ?? `${item.contentId}:unknown`);
      });
    }
  });
const offlinePathSet = new Set(offlinePaths);
const duplicateOfflineReferences = offlinePaths.filter((path, index) => offlinePaths.indexOf(path) !== index);

const registry = readFileSync(REGISTRY_PATH, 'utf8');
const staticPaths = [...registry.matchAll(/require\('\.\.\/(assets\/audio\/egyptian\/unit-[67]\/[^']+\.mp3)'\)/g)]
  .map(match => match[1]);
const staticPathSet = new Set(staticPaths);

const files = UNIT_ROOTS.flatMap(walkMp3);
const filePaths = files.map(relativePath);
const filePathSet = new Set(filePaths);
const missingFiles = [...targetPathSet].filter(path => !filePathSet.has(path));
const missingStaticRequires = [...targetPathSet].filter(path => !staticPathSet.has(path));
const unreferencedFiles = [...filePathSet].filter(path => !targetPathSet.has(path));

const invalidFiles: string[] = [];
const suspiciousDurations: Array<{ path: string; duration: number }> = [];
const fileMetadata = files.map(path => {
  const size = statSync(path).size;
  let duration = Number.NaN;
  try {
    duration = durationSeconds(path);
  } catch {
    invalidFiles.push(relativePath(path));
  }
  if (!hasMp3Header(path) && !invalidFiles.includes(relativePath(path))) invalidFiles.push(relativePath(path));
  if (!Number.isFinite(duration) || duration < 0.35 || duration > 20) {
    suspiciousDurations.push({ path: relativePath(path), duration });
  }
  return { path: relativePath(path), size, duration };
});

const unitSummary = [6, 7].map(unit => {
  const prefix = `assets/audio/egyptian/unit-${unit}/`;
  const metadata = fileMetadata.filter(file => file.path.startsWith(prefix));
  return {
    unit,
    referencedCount: targetPaths.filter(path => path.startsWith(prefix)).length,
    fileCount: metadata.length,
    bytes: metadata.reduce((sum, file) => sum + file.size, 0),
  };
});

const risks = targets.flatMap(target => {
  const labels = RISK_TERMS.filter(([, pattern]) => pattern.test(targetText(target))).map(([label]) => label);
  if (!labels.length) return [];
  const metadata = fileMetadata.find(file => file.path === target.audioPath);
  return [{
    labels,
    id: target.id,
    audioText: target.audioText,
    path: target.audioPath,
    size: metadata?.size ?? 0,
    duration: metadata?.duration ?? null,
  }];
});
const matchedRiskLabels = new Set(risks.flatMap(risk => risk.labels));
const riskTermsWithoutDirectAudioMatch = RISK_TERMS
  .map(([label]) => label)
  .filter(label => !matchedRiskLabels.has(label));

const barber = unit6.find(target => target.audioPath.endsWith('/everyday-barber/w2.mp3'));
const directions = unit6.find(target => target.audioText === 'لأ، لِفّ شمال.');
const specialCases = {
  barberLocked: barber?.displayArabic === 'والجناب، عايزها قصيرة؟'
    && barber.audioText === 'والگيناب، عايزها قصيرة؟'
    && barber.evalTarget === 'والجناب، عايزها قصيرة؟',
  directionsLocked: Boolean(directions),
};

const totalBytes = fileMetadata.reduce((sum, file) => sum + file.size, 0);
const report = {
  generatedTargetCounts: { unit6: unit6.length, unit7: unit7.length, total: targets.length },
  unitSummary,
  totalUniqueReferences: targetPathSet.size,
  totalBytes,
  duplicateReferences: [...new Set(duplicateReferences)],
  missingFiles,
  missingStaticRequires,
  unreferencedFiles,
  invalidFiles,
  suspiciousDurations,
  specialCases,
  offlinePack: {
    unit6References: offlinePaths.filter(path => path.startsWith('assets/audio/egyptian/unit-6/')).length,
    unit7References: offlinePaths.filter(path => path.startsWith('assets/audio/egyptian/unit-7/')).length,
    totalUniqueReferences: offlinePathSet.size,
    missingRuntimeAudio,
    duplicateReferences: [...new Set(duplicateOfflineReferences)],
    targetsMissingFromOfflinePlan: [...targetPathSet].filter(path => !offlinePathSet.has(path)),
    unexpectedOfflinePaths: [...offlinePathSet].filter(path => !targetPathSet.has(path)),
  },
  riskTermsWithoutDirectAudioMatch,
  risks,
};

mkdirSync(REPORT_DIR, { recursive: true });
writeFileSync(join(REPORT_DIR, 'validation-report.json'), `${JSON.stringify(report, null, 2)}\n`);
const riskRows = risks.map(risk =>
  `| ${risk.labels.join(', ')} | ${risk.audioText.replaceAll('|', '\\|')} | \`${risk.path}\` | ${risk.size} | ${risk.duration?.toFixed(3) ?? 'invalid'} | |`,
);
writeFileSync(join(REPORT_DIR, 'PRONUNCIATION_RISKS.md'), [
  '# Egyptian Units 6-7 Pronunciation Risks',
  '',
  'Technically valid clips requiring manual listening. Presence here does not indicate generation failure.',
  '',
  '| Risk | audioText | File | Bytes | Duration (s) | Notes |',
  '|---|---|---|---:|---:|---|',
  ...riskRows,
  '',
].join('\n'));

console.log(JSON.stringify(report, null, 2));

const failed = targets.length !== 165
  || unit6.length !== 103
  || unit7.length !== 62
  || targetPathSet.size !== 165
  || staticPathSet.size !== 165
  || duplicateReferences.length > 0
  || missingFiles.length > 0
  || missingStaticRequires.length > 0
  || unreferencedFiles.length > 0
  || invalidFiles.length > 0
  || suspiciousDurations.length > 0
  || offlinePathSet.size !== 165
  || missingRuntimeAudio.length > 0
  || duplicateOfflineReferences.length > 0
  || [...targetPathSet].some(path => !offlinePathSet.has(path))
  || [...offlinePathSet].some(path => !targetPathSet.has(path))
  || !specialCases.barberLocked
  || !specialCases.directionsLocked;

if (failed) process.exitCode = 1;
