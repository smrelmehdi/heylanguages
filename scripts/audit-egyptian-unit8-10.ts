import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { getAudioTargets, type AudioTarget } from './audio-catalog';

const ROOT = process.cwd();
const REPORT_DIR = resolve(ROOT, 'tmp/egyptian-unit8-10-dry-run');
const UNIT_SOURCES = [
  { unit: 8, sourceKey: 'egyptian-unit-8' },
  { unit: 9, sourceKey: 'egyptian-unit-9' },
  { unit: 10, sourceKey: 'egyptian-unit-10' },
] as const;
const LOANWORD_RE = /إسبريسو|منيو|واي فاي|واتساب|أونلاين|إنستجرام|فولو|بوست|لينك|ويك إند|ماتش|جون|جيم|تيشيرت|ميكانيكي|بريك/i;
const TTS_SENSITIVE_RE = /قهوة|طريق|وقت|رقم|جنيه|جديد|اجتماع|دلوقتي|أقدر|مقفول|نقعد|نتقابل|هتبقى|هيبقى|الجن|الجيم|النجدة|بتوجع/i;
const MSA_OR_GULF_TRANSLIT_RE = /\b(?:rajul|qahwa|tariiq|waqt|muhandis|muhaasib|jamiil|jadiid|kayfa|ayna|shlon|wain|abghi|waayid)\b/i;

function duplicates(targets: AudioTarget[], field: 'audioText' | 'audioPath') {
  const grouped = new Map<string, string[]>();
  targets.forEach(target => {
    const value = target[field];
    const ids = grouped.get(value) ?? [];
    ids.push(target.id);
    grouped.set(value, ids);
  });
  return [...grouped.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([value, ids]) => ({ value, ids }));
}

function normalizedSpoken(text: string | undefined) {
  return (text ?? '').replace(/[.!؟،؛:'"\s]/g, '');
}

const units = UNIT_SOURCES.map(({ unit, sourceKey }) => {
  const targets = getAudioTargets({ sourceKey });
  const manifest = targets.map(target => ({
    id: target.id,
    kind: target.kind,
    sourceKey: target.sourceKey,
    line: target.line,
    displayArabic: target.displayArabic,
    audioText: target.audioText,
    evalTarget: target.evalTarget,
    transliteration: target.transliteration,
    english: target.english,
    audioPath: target.audioPath,
    voiceId: 'LXrTqFIgiubkrMkwvOUr',
    modelId: 'eleven_v3',
  }));
  return {
    unit,
    sourceKey,
    targets,
    manifest,
    duplicateSpokenText: duplicates(targets, 'audioText'),
    duplicatePaths: duplicates(targets, 'audioPath'),
    missingAudioText: targets.filter(target => !target.audioText.trim()).map(target => target.id),
    missingEvalTarget: targets.filter(target => !target.evalTarget?.trim()).map(target => target.id),
    shortRisk: targets.filter(target => normalizedSpoken(target.audioText).length <= 8).map(target => ({ id: target.id, audioText: target.audioText })),
    loanwordRisk: targets.filter(target => LOANWORD_RE.test(target.audioText)).map(target => ({ id: target.id, audioText: target.audioText })),
    longRisk: targets.filter(target => target.audioText.length > 100).map(target => ({ id: target.id, length: target.audioText.length, audioText: target.audioText })),
    ttsSensitive: targets.filter(target => TTS_SENSITIVE_RE.test(target.audioText)).map(target => ({ id: target.id, audioText: target.audioText })),
    nonPunctuationAudioOverrides: targets.filter(target =>
      normalizedSpoken(target.audioText) !== normalizedSpoken(target.displayArabic)
    ).map(target => ({ id: target.id, displayArabic: target.displayArabic, audioText: target.audioText })),
    jLeaks: targets.filter(target => /j/i.test(target.transliteration ?? '')).map(target => ({ id: target.id, transliteration: target.transliteration })),
    dialectLeaks: targets.filter(target => MSA_OR_GULF_TRANSLIT_RE.test(target.transliteration ?? '')).map(target => ({ id: target.id, transliteration: target.transliteration })),
  };
});

(globalThis as any).__DEV__ = false;
const { getDialectProgressionItems } = require('../utils/content-resolver') as typeof import('../utils/content-resolver');
const { resolveContent } = require('../utils/content-resolver') as typeof import('../utils/content-resolver');
const { EGYPTIAN_UNIT8_SCENARIOS } = require('../data/egyptian-emergencies') as typeof import('../data/egyptian-emergencies');
const { EGYPTIAN_UNIT9_LESSONS } = require('../data/egyptian-social') as typeof import('../data/egyptian-social');
const { EGYPTIAN_UNIT10_SCENARIOS } = require('../data/egyptian-friends') as typeof import('../data/egyptian-friends');
const unit8ContentIds = new Set(EGYPTIAN_UNIT8_SCENARIOS.map(scenario => scenario.contentId));

const progression = getDialectProgressionItems('egyptian');
const start = progression.findIndex(item => item.contentId === 'quiz_u7');
const advancedProgression = progression.slice(start).map(item => `${item.dialect}:${item.unitId}:${item.contentId}`);
const expectedImageAssets = [...EGYPTIAN_UNIT8_SCENARIOS, ...EGYPTIAN_UNIT10_SCENARIOS].map(scenario => {
  const interior = `assets/images/${scenario.imageId}-interior.png`;
  const entrance = scenario.entranceImageId ? `assets/images/${scenario.entranceImageId}.png` : null;
  return {
    unit: unit8ContentIds.has(scenario.contentId) ? 8 : 10,
    contentId: scenario.contentId,
    scenarioName: scenario.scenarioName,
    interior,
    interiorExists: existsSync(resolve(ROOT, interior)),
    entrance,
    entranceExists: entrance ? existsSync(resolve(ROOT, entrance)) : null,
    imageMode: entrance ? 'entrance-and-interior' : 'single-scene',
  };
});

const transliterationRecords = [
  ...EGYPTIAN_UNIT8_SCENARIOS.flatMap(scenario => scenario.dialogue.map((turn, index) => ({
    id: `unit8:${scenario.contentId}:${index + 1}`,
    transliteration: turn.transliteration,
    accepted: turn.acceptedTransliterations ?? [],
  }))),
  ...EGYPTIAN_UNIT9_LESSONS.flatMap(lessonItem => lessonItem.words.map((word, index) => ({
    id: `unit9:${lessonItem.contentId}:${index + 1}`,
    transliteration: word.transliteration,
    accepted: word.acceptedTransliterations ?? [],
  }))),
  ...EGYPTIAN_UNIT10_SCENARIOS.flatMap(scenario => scenario.dialogue.map((turn, index) => ({
    id: `unit10:${scenario.contentId}:${index + 1}`,
    transliteration: turn.transliteration,
    accepted: turn.acceptedTransliterations ?? [],
  }))),
];
const transliterationAudit = {
  recordsChecked: transliterationRecords.length,
  jLeaks: transliterationRecords.filter(record => /j/i.test(record.transliteration) || record.accepted.some(value => /j/i.test(value))),
  uppercaseLeaks: transliterationRecords.filter(record => /[A-Z]/.test(record.transliteration) || record.accepted.some(value => /[A-Z]/.test(value))),
  dialectLeaks: transliterationRecords.filter(record => MSA_OR_GULF_TRANSLIT_RE.test(record.transliteration) || record.accepted.some(value => MSA_OR_GULF_TRANSLIT_RE.test(value))),
  malformedAccepted: transliterationRecords.filter(record =>
    record.accepted.length === 0
    || record.accepted.some(value => !value.trim())
    || new Set(record.accepted).size !== record.accepted.length
  ),
};

const routeAudit = {
  validEgyptianUnit8: Boolean(resolveContent({ dialect: 'egyptian', unitId: 'unit-8', contentId: 'doctor-appointment', contentType: 'scenario' })),
  validEgyptianUnit9: Boolean(resolveContent({ dialect: 'egyptian', unitId: 'unit-9', contentId: 'invitations', contentType: 'lesson' })),
  validEgyptianUnit10: Boolean(resolveContent({ dialect: 'egyptian', unitId: 'unit-10', contentId: 'staying-in-touch', contentType: 'scenario' })),
  gulfRejectsEgyptianScenario: !resolveContent({ dialect: 'gulf', unitId: 'unit-8', contentId: 'doctor-appointment', contentType: 'scenario' }),
  msaResolvesItsOwnScenarioNamespace: (() => {
    const resolved = resolveContent({ dialect: 'msa', unitId: 'unit-8', contentId: 'doctor-appointment', contentType: 'scenario' });
    return resolved?.item.dialect === 'msa'
      && resolved.item.scenarioName !== 'EgyptianDoctorAppointment';
  })(),
  wrongTypeRejected: !resolveContent({ dialect: 'egyptian', unitId: 'unit-8', contentId: 'doctor-appointment', contentType: 'lesson' }),
  malformedRejected: !resolveContent({ dialect: 'egyptian', unitId: 'unit-8', contentId: '../doctor-appointment', contentType: 'scenario' }),
};

const allTargets = units.flatMap(unit => unit.targets);
const report = {
  targetCounts: Object.fromEntries(units.map(unit => [`unit${unit.unit}`, unit.targets.length])),
  totalTargets: allTargets.length,
  totalUniquePaths: new Set(allTargets.map(target => target.audioPath)).size,
  crossUnitDuplicatePaths: duplicates(allTargets, 'audioPath'),
  crossUnitDuplicateSpokenText: duplicates(allTargets, 'audioText'),
  units: units.map(({ targets: _targets, manifest: _manifest, ...unit }) => unit),
  advancedProgression,
  progressionEndsAt: advancedProgression[advancedProgression.length - 1],
  routeAudit,
  expectedImageAssets,
  transliterationAudit,
};

mkdirSync(REPORT_DIR, { recursive: true });
units.forEach(unit => {
  writeFileSync(
    resolve(REPORT_DIR, `egyptian-unit-${unit.unit}-audio-manifest.json`),
    `${JSON.stringify(unit.manifest, null, 2)}\n`,
  );
});
writeFileSync(resolve(REPORT_DIR, 'audit-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

const failed = allTargets.length !== 260
  || new Set(allTargets.map(target => target.audioPath)).size !== allTargets.length
  || units.some(unit => unit.missingAudioText.length || unit.missingEvalTarget.length || unit.duplicatePaths.length || unit.jLeaks.length || unit.dialectLeaks.length)
  || transliterationAudit.jLeaks.length || transliterationAudit.uppercaseLeaks.length || transliterationAudit.dialectLeaks.length || transliterationAudit.malformedAccepted.length
  || !Object.values(routeAudit).every(Boolean)
  || progression[progression.length - 1]?.contentId !== 'quiz_u10';
if (failed) process.exitCode = 1;
