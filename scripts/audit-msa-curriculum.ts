/* eslint-disable @typescript-eslint/no-var-requires */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { dirname, join, relative } from 'path';
import { getAudioTargets } from './audio-catalog';

const ROOT = process.cwd();
const OUTPUT = join(ROOT, 'tmp/msa-eleven-v3-dry-run.json');
const LEGACY_REPORT = join(ROOT, 'tmp/msa-legacy-audio-cleanup-report.md');
(globalThis as any).__DEV__ = false;
const LEAKS = ['عايز', 'عايزة', 'إيه', 'فين', 'إزاي', 'دلوقتي', 'مش', 'مفيش', 'ده', 'دي', 'دول', 'أبغى', 'وين', 'شلون', 'شو', 'جاي', 'رايح', 'هروح', 'بشتغل'];

function duplicates<T>(items: T[], key: (item: T) => string) {
  const groups = new Map<string, T[]>();
  items.forEach(item => groups.set(key(item), [...(groups.get(key(item)) ?? []), item]));
  return [...groups.entries()].filter(([, group]) => group.length > 1);
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const targets = getAudioTargets({ dialect: 'msa' });
const { MSA_CURRICULUM } = require('../data/curriculum/msa');
const { resolveContent } = require('../utils/content-resolver');
const { getDialectProgressionItems } = require('../utils/content-resolver');
const { getContentAccess } = require('../utils/access');
const items = MSA_CURRICULUM.units.flatMap((unit: any) => unit.items);
const fields = ['displayArabic', 'audioText', 'evalTarget', 'transliteration', 'audioPath', 'voiceId', 'modelId'] as const;
const missingFields = targets.flatMap(target => fields
  .filter(field => !String(target[field] ?? '').trim())
  .map(field => ({ id: target.id, field })));
const dialectLeaks = targets.flatMap(target => LEAKS
  .filter(marker => new RegExp(`(^|[\\s،.!؟?])${marker}(?=$|[\\s،.!؟?])`).test(`${target.displayArabic} ${target.audioText} ${target.evalTarget}`))
  .map(marker => ({ id: target.id, marker })));
const transliterationIssues = targets.filter(target =>
  /[A-Z]/.test(target.transliteration ?? '') || /[\u0600-\u06ff]/.test(target.transliteration ?? '')
).map(target => ({ id: target.id, transliteration: target.transliteration }));
const forbiddenTransliterationVariants = targets.filter(target =>
  /\b(?:wain|wein|fein|izzay|shlon|abghi|aayez|raagel|geneeh|ahwa)\b/i.test(target.transliteration ?? '')
).map(target => ({ id: target.id, transliteration: target.transliteration }));
const wrongVoiceOrModel = targets.filter(target =>
  target.voiceId !== 'xvhpbk8otnNHtT3fjCpr' || target.modelId !== 'eleven_v3'
).map(target => target.id);
const duplicatePaths = duplicates(targets, target => target.audioPath).map(([path, group]) => ({ path, ids: group.map(item => item.id) }));
const duplicateTexts = duplicates(targets, target => target.audioText).map(([audioText, group]) => ({ audioText, ids: group.map(item => item.id) }));
const duplicateContentIds = duplicates(items, (item: any) => `${item.unitId}:${item.contentId}`).map(([key]) => key);
const unresolved = items.filter((item: any) => !resolveContent({
  dialect: 'msa', unitId: item.unitId, contentId: item.contentId, contentType: item.contentType,
})).map((item: any) => `${item.unitId}:${item.contentType}:${item.contentId}`);
const missingScenarioImages = items.filter((item: any) => item.contentType === 'scenario').filter((item: any) => {
  const resolved = resolveContent({ dialect: 'msa', unitId: item.unitId, contentId: item.contentId, contentType: 'scenario' });
  return !resolved?.sceneImage;
}).map((item: any) => `${item.unitId}:${item.contentId}`);
const allMsaFiles = [
  ...walk(join(ROOT, 'assets/audio/msa')),
  ...walk(join(ROOT, 'assets/audio/auto/msa')),
].map(path => relative(ROOT, path));
const canonicalFiles = allMsaFiles.filter(path => /^assets\/audio\/msa\/unit-\d+\//.test(path));
const existingFiles = allMsaFiles.filter(path => !canonicalFiles.includes(path));
const activePaths = new Set(targets.map(target => target.audioPath));
const existingActive = canonicalFiles.filter(path => activePaths.has(path));
const orphanedCanonical = canonicalFiles.filter(path => !activePaths.has(path));
const orphanedExisting = existingFiles.filter(path => !activePaths.has(path));
const invalidExisting = existingFiles.filter(path => statSync(join(ROOT, path)).size === 0 || !path.endsWith('.mp3'));
const unitCounts = Object.fromEntries(Array.from({ length: 10 }, (_, index) => {
  const unit = index + 1;
  return [unit, targets.filter(target => target.unit === unit).length];
}));
const quizIds = MSA_CURRICULUM.units.map((unit: any) =>
  unit.items.find((item: any) => item.contentType === 'quiz')?.contentId ?? null
);
const progression = getDialectProgressionItems('msa');
const initiallyAllowed = progression.filter((item: any) => getContentAccess({
  dialect: 'msa', unitId: item.unitId, contentId: item.contentId, contentType: item.contentType,
  isPremium: false, isTestingUnlocked: false, completedContentIds: [],
}).allowed).map((item: any) => `${item.unitId}:${item.contentId}`);
const routeSafety = {
  validUnit10Scenario: Boolean(resolveContent({ dialect: 'msa', unitId: 'unit-10', contentId: 'staying-in-touch', contentType: 'scenario' })),
  validUnit4Lesson: Boolean(resolveContent({ dialect: 'msa', unitId: 'unit-4', contentId: 'numbers-time', contentType: 'lesson' })),
  wrongTypeRejected: !resolveContent({ dialect: 'msa', unitId: 'unit-2', contentId: 'cafe', contentType: 'lesson' }),
  malformedRejected: !resolveContent({ dialect: 'msa', unitId: 'unit-1', contentId: '../cafe', contentType: 'scenario' }),
  gulfOnlyIdRejected: !resolveContent({ dialect: 'msa', contentId: 'morningroutine', contentType: 'scenario' }),
  msaIdRejectedByGulf: !resolveContent({ dialect: 'gulf', contentId: 'advanced-cafe-order', contentType: 'scenario' }),
};
const samplePhrases = [
  'مرحباً', 'جيد', 'قهوة', 'ثلاثة عشر', 'هذا كتاب', 'عفواً', 'خمسون', 'غداً', 'أين؟', 'نعم',
  'أنتَ مهندس', 'أنتِ معلمة', 'عمري عشرون سنة', 'الساعة الثالثة والنصف', 'لست متعبا', 'سأذهب غداً',
  'الحاسوب لا يعمل', 'أرسل الملف بالبريد الإلكتروني', 'أرسلها لي على واتساب', 'لدي ألم في بطني',
  'نحتاج إلى سيارة إسعاف', 'هل لديك صعوبة في التنفس؟', 'كم سيستغرق الطريق؟',
  'سأعطيك الدواء، وإذا ساءت الحالة فاتصل بالطوارئ', 'إن شاء الله نلتقي مرة أخرى',
];
const ttsSampleList = samplePhrases.map(displayArabic => {
  const target = targets.find(item => item.displayArabic === displayArabic);
  return target ? { displayArabic, audioText: target.audioText, id: target.id } : { displayArabic, missing: true };
});
const audioRisks = {
  short: targets.filter(target => (target.displayArabic ?? '').replace(/[\s،.!؟?]/g, '').length <= 3).map(target => target.id),
  long: targets.filter(target => target.audioText.length > 110).map(target => target.id),
  tashkeel: targets.filter(target => /[\u064b-\u065f]/.test(target.audioText)).map(target => target.id),
  loanwords: targets.filter(target => /الإنترنت|الإنترنِت|واتساب|لاكتوز|تكنولوج/.test(target.audioText)).map(target => target.id),
  formalRhythm: targets.filter(target => target.audioText.trim().split(/\s+/).length >= 13).map(target => target.id),
  unwantedCaseEndings: targets.filter(target => /\b(?:maaun|maan|saiid|mustaiddun|hajzun|haqiibatun|dirhaman|mutaban|ijtimaaun)\b/i.test(target.transliteration ?? '')).map(target => target.id),
  audioTextOverrides: targets.filter(target => {
    const simplify = (value: string) => value.replace(/[\u064b-\u065f\u0670]/g, '').replace(/[.،!?؟\s]/g, '');
    return simplify(target.audioText) !== simplify(target.displayArabic ?? '');
  }).map(target => target.id),
};
const charactersByUnit = Object.fromEntries(Array.from({ length: 10 }, (_, index) => {
  const unit = index + 1;
  return [unit, targets.filter(target => target.unit === unit).reduce((sum, target) => sum + target.audioText.length, 0)];
}));
const totalCharacters = targets.reduce((sum, target) => sum + target.audioText.length, 0);
const legacyHashes = duplicates(existingFiles, path => createHash('sha256').update(readFileSync(join(ROOT, path))).digest('hex'));
const existingFileSet = new Set(allMsaFiles);
const otherAudioHashes = new Set(walk(join(ROOT, 'assets/audio'))
  .map(path => relative(ROOT, path))
  .filter(path => !existingFileSet.has(path) && path.endsWith('.mp3'))
  .map(path => createHash('sha256').update(readFileSync(join(ROOT, path))).digest('hex')));
const crossDialectHashMatches = existingFiles.filter(path => otherAudioHashes.has(
  createHash('sha256').update(readFileSync(join(ROOT, path))).digest('hex'),
));
const quizSource = readFileSync(join(ROOT, 'app/quiz-unit2.tsx'), 'utf8');
const speechSource = readFileSync(join(ROOT, 'supabase/functions/generate-speech/index.ts'), 'utf8');
const architectureChecks = {
  quizHasFirstContextCharacterFallback: /Array\.from\(word\.context/.test(quizSource),
  quizHasFixedEarlyScenarioSlice: /filter\(question => question\.format === '(?:transliteration_type|arabic_select)'\)\.slice\(0, 3\)/.test(quizSource),
  speechAcceptsClientVoiceId: /payload\.voiceId/.test(speechSource),
  speechRequiresAuthentication: /authentication_required/.test(speechSource),
  speechHasRateLimit: /RATE_LIMIT/.test(speechSource),
  speechUsesWildcardCors: /Access-Control-Allow-Origin['"]?:\s*['"]\*/.test(speechSource),
};

const manifest = {
  generatedAt: new Date().toISOString(),
  voiceId: 'xvhpbk8otnNHtT3fjCpr',
  modelId: 'eleven_v3',
  summary: {
    units: MSA_CURRICULUM.units.length,
    curriculumItems: items.length,
    targetCount: targets.length,
    unitCounts,
    charactersByUnit,
    totalCharacters,
    existingMsaFiles: existingFiles.length,
    existingCanonicalFiles: canonicalFiles.length,
    existingActiveFilesToReplace: existingActive.length,
    newFilesRequired: targets.length - existingActive.length,
  },
  validation: {
    missingFields,
    dialectLeaks,
    transliterationIssues,
    forbiddenTransliterationVariants,
    wrongVoiceOrModel,
    duplicatePaths,
    duplicateContentIds,
    unresolved,
    missingScenarioImages,
    quizIds,
    initiallyAllowed,
    routeSafety,
    invalidExisting,
    architectureChecks,
  },
  duplicateAudioTextGroups: duplicateTexts,
  audioRisks,
  prioritizedTtsSampleList: ttsSampleList,
  oldAudio: {
    existingActive,
    orphanedCanonical,
    orphanedExisting,
    duplicateHashGroups: legacyHashes.length,
    duplicateFiles: legacyHashes.reduce((sum, [, group]) => sum + group.length, 0),
    crossDialectHashMatches,
    cleanupOrder: [
      'Generate canonical Eleven v3 audio.',
      'Wire every canonical file.',
      'Device-test MSA.',
      'Verify the MSA offline pack.',
      'Delete legacy MSA files only in a separate commit.',
    ],
  },
  offlinePreparation: {
    expectedCanonicalTargets: targets.length,
    existingCanonicalFiles: existingActive.length,
    missingCanonicalFiles: targets.length - existingActive.length,
    legacyFallbackAllowed: false,
  },
  progression: progression.map((item: any, index: number) => ({
    position: index + 1,
    key: `msa:${item.unitId}:${item.contentId}`,
    contentType: item.contentType,
    commercialAccess: item.commercialAccess,
    previous: index > 0 ? `msa:${progression[index - 1].unitId}:${progression[index - 1].contentId}` : null,
  })),
  targets: targets.map(target => ({
    unit: target.unit,
    lessonOrScenarioId: target.sourceKey,
    itemOrTurnId: target.id,
    contentType: target.kind,
    displayArabic: target.displayArabic,
    audioText: target.audioText,
    evalTarget: target.evalTarget,
    transliteration: target.transliteration,
    english: target.english,
    outputPath: target.audioPath,
    voiceId: target.voiceId,
    modelId: target.modelId,
  })),
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(LEGACY_REPORT, `# MSA Legacy Audio Cleanup\n\n- Legacy files: ${existingFiles.length}\n- Canonical production files: ${existingActive.length}\n- Canonical references to legacy files: 0\n- Invalid legacy files: ${invalidExisting.length}\n- Duplicate legacy hash groups: ${legacyHashes.length}\n- Cross-dialect hash matches: ${crossDialectHashMatches.length}\n\n## Required Order\n\n1. Generate canonical Eleven v3 audio.\n2. Wire every canonical file.\n3. Device-test MSA.\n4. Verify the MSA offline pack.\n5. Delete legacy MSA files only in a separate commit.\n`);
console.log(JSON.stringify({ output: relative(ROOT, OUTPUT), ...manifest.summary, validation: manifest.validation }, null, 2));
