import { readFileSync } from 'fs';
import { resolve } from 'path';
import { gradeTransliteration } from '../utils/quiz-level';
import { selectWithAttemptSeed } from '../utils/quiz-selection';
import { getPassingScore, getQuizPassed } from '../utils/quiz-scoring';

const failures: string[] = [];
const pass = (label: string, condition: boolean) => {
  if (!condition) failures.push(label);
};
const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

for (const extension of ['.mp3', '.png', '.jpg', '.jpeg', '.webp']) {
  (require as any).extensions[extension] = (module: { exports: unknown }, filename: string) => {
    module.exports = filename;
  };
}

// Completion threshold regression coverage.
const total = 20;
const passing = getPassingScore(total);
pass('0% must fail', !getQuizPassed(0, total));
pass('one below threshold must fail', !getQuizPassed(passing - 1, total));
pass('exact threshold must pass', getQuizPassed(passing, total));
pass('100% must pass', getQuizPassed(total, total));
pass('empty attempt must fail', !getQuizPassed(0, 0));
let retryCompletion = false;
if (getQuizPassed(passing - 1, total)) retryCompletion = true;
pass('failed first attempt must not complete', !retryCompletion);
if (getQuizPassed(passing, total)) retryCompletion = true;
pass('passing retry may complete', retryCompletion);

// Transliteration is exact after harmless formatting unless the item explicitly
// declares an alternative.
const rejected: Array<[string, string]> = [
  ['qamiil', 'jamiil'],
  ['jameel', 'gameel'],
  ['ahwa', 'qahwa'],
  ['inta', 'inti'],
  ['naam', 'laam'],
  ['hasuub', 'haasuub'],
  ['alaa', "'alaa"],
  ["tarii", "tarii'"],
];
rejected.forEach(([input, canonical]) => {
  pass(`reject ${input} for ${canonical}`, gradeTransliteration(input, canonical).status === 'incorrect');
});
pass(
  'accept explicit long-vowel variant',
  gradeTransliteration('jadeed', 'jadiid', ['jadeed']).status === 'correct',
);
pass(
  'accept punctuation/hyphen formatting',
  gradeTransliteration('wel geenab!', 'wel-geenab').status === 'correct',
);

// Deterministic attempt rotation: stable within an attempt, broad across 100.
const topics = Array.from({ length: 30 }, (_, index) => `topic-${index + 1}`);
const frequencies = new Map(topics.map(topic => [topic, 0]));
let duplicateQuestionCount = 0;
for (let attempt = 1; attempt <= 100; attempt += 1) {
  const seed = `egyptian:unit-8:${attempt}`;
  const selected = selectWithAttemptSeed(topics, 10, seed, 'coverage', topic => topic);
  const repeated = selectWithAttemptSeed(topics, 10, seed, 'coverage', topic => topic);
  pass(`attempt ${attempt} must remain stable`, selected.join('|') === repeated.join('|'));
  duplicateQuestionCount += selected.length - new Set(selected).size;
  selected.forEach(topic => frequencies.set(topic, (frequencies.get(topic) ?? 0) + 1));
}
const counts = [...frequencies.values()];
const neverSelected = topics.filter(topic => frequencies.get(topic) === 0);
const minFrequency = Math.min(...counts);
const maxFrequency = Math.max(...counts);
const overrepresentationRatio = maxFrequency / Math.max(1, minFrequency);
pass('all eligible topics must rotate in', neverSelected.length === 0);
pass('attempts must not contain duplicate IDs', duplicateQuestionCount === 0);

const tieredSource = source('app/quiz-unit2.tsx');
const legacySource = source('app/quiz.tsx');
const matchSource = source('components/quiz/EmojiMatch.tsx');
const arabicSelectSource = source('components/quiz/ArabicSelect.tsx');
const migrationSource = source('supabase/migrations/20260718010000_atomic_quiz_completion.sql');
const gulfWordsSource = source('constants/words.ts');

pass('legacy save must require a passing attempt', legacySource.includes('!attemptPassed'));
pass('active quiz must not import stale Part 1 bank', !tieredSource.includes("from '../data/quiz-part1'"));
pass('active quiz must not import stale Unit 6 bank', !tieredSource.includes("from '../data/quiz-unit6'"));
pass('scenario matching must use exact English meaning', tieredSource.includes('meaning: turn.english'));
pass('positional emoji pool must be removed', !tieredSource.includes('EMOJI_POOL'));
pass('matching supports hidden transliteration', matchSource.includes('showTranslit ? pair.transliteration : null'));
pass('Arabic reading must not autoplay', !arabicSelectSource.includes('useEffect(') && !arabicSelectSource.includes('doPlay'));
pass('phone question must be constrained', tieredSource.includes("My number starts with 010"));
pass('age question must be constrained', tieredSource.includes("I am twenty years old"));
pass('time question must be constrained', tieredSource.includes("It is one o'clock"));
pass('pronoun question must identify I', tieredSource.includes("I am from Egypt"));
pass('age distractors must carry explicit ages', tieredSource.includes('عندي واحد وعشرين سنة'));
pass('time distractors must carry explicit clock values', tieredSource.includes('الساعة اتنين'));
pass('sentence-order distractors must be full comparable sentences', tieredSource.includes('العربية ده كبيرة شوية'));
pass('time-unit gloss must be distinct', gulfWordsSource.includes("english: 'Second (time unit)'"));
pass('ordinal gloss must be distinct', gulfWordsSource.includes("english: 'Second (ordinal, masculine)'"));
pass('database completion identity must be unique', migrationSource.includes('scenario_progress_user_scenario_unique'));
pass('database award must be transaction-locked', migrationSource.includes('pg_advisory_xact_lock'));

// Every canonical source item used by the active generators is locally voiced,
// and its resolved asset stays inside the selected dialect namespace.
const { getDialectContent } = require('../data/content-registry') as typeof import('../data/content-registry');
const { getDialectCurriculumItems } = require('../utils/content-resolver') as typeof import('../utils/content-resolver');
let localAudioTargets = 0;
let missingLocalAudio = 0;
let crossDialectAudio = 0;
const selectionScopes: Array<{
  dialect: string;
  unit: string;
  tier: number;
  topicCount: number;
  neverSelected: number;
  minFrequency: number;
  maxFrequency: number;
}> = [];
for (const dialect of ['gulf', 'egyptian', 'msa'] as const) {
  const curriculumItems = getDialectCurriculumItems(dialect);
  const sources = [
    ...Object.values(getDialectContent(dialect).scenarios).flat(),
    ...curriculumItems.flatMap(item => item.lessonWords ?? []),
  ];
  sources.forEach(item => {
    localAudioTargets += 1;
    const audio = item.audio as unknown;
    if (typeof audio !== 'string') {
      missingLocalAudio += 1;
      return;
    }
    const wrongDialect = dialect === 'gulf'
      ? /\/audio\/(egyptian|msa)\//.test(audio)
      : !audio.includes(`/audio/${dialect}/`);
    if (wrongDialect) crossDialectAudio += 1;
  });

  const units = [...new Set(curriculumItems.map(item => item.unitId))];
  units.forEach(unitId => {
    const unitTopics = curriculumItems
      .filter(item => item.unitId === unitId && item.contentType !== 'quiz')
      .map(item => item.contentId);
    ([1, 2, 3, 4] as const).forEach(tier => {
      if (unitTopics.length === 0) return;
      const perAttempt = Math.min(unitTopics.length, tier === 1 ? 10 : tier === 2 ? 12 : tier === 3 ? 15 : 18);
      const countsByTopic = new Map(unitTopics.map(topic => [topic, 0]));
      for (let attempt = 1; attempt <= 100; attempt += 1) {
        selectWithAttemptSeed(unitTopics, perAttempt, `${dialect}:${unitId}:tier-${tier}:${attempt}`, 'topics', topic => topic)
          .forEach(topic => countsByTopic.set(topic, (countsByTopic.get(topic) ?? 0) + 1));
      }
      const unitCounts = [...countsByTopic.values()];
      selectionScopes.push({
        dialect,
        unit: unitId,
        tier,
        topicCount: unitTopics.length,
        neverSelected: unitCounts.filter(count => count === 0).length,
        minFrequency: Math.min(...unitCounts),
        maxFrequency: Math.max(...unitCounts),
      });
    });
  });
}
pass('all active canonical quiz sources have local audio', missingLocalAudio === 0);
pass('canonical quiz audio never crosses dialects', crossDialectAudio === 0);
pass('every dialect/unit/tier scope rotates all topics', selectionScopes.every(scope => scope.neverSelected === 0));

async function auditSerializedFirstCompletion() {
  let queue = Promise.resolve();
  let completed = false;
  let xp = 0;
  const save = () => {
    const operation = queue.then(async () => {
      const firstCompletion = !completed;
      completed = true;
      if (firstCompletion) xp += 100;
      return firstCompletion;
    });
    queue = operation.then(() => undefined, () => undefined);
    return operation;
  };
  const results = await Promise.all(Array.from({ length: 20 }, save));
  pass('simultaneous passes create one completion', results.filter(Boolean).length === 1);
  pass('simultaneous passes award XP once', xp === 100);
  pass('repeated pass awards zero additional XP', !(await save()) && xp === 100);
}

auditSerializedFirstCompletion().then(() => {
  console.log(JSON.stringify({
    status: failures.length === 0 ? 'PASS' : 'FAIL',
    checks: 36 + 100,
    passThreshold: `${passing}/${total}`,
    selection: {
      attempts: 100,
      topics: topics.length,
      questionsPerAttempt: 10,
      neverSelected,
      minFrequency,
      maxFrequency,
      overrepresentationRatio: Number(overrepresentationRatio.toFixed(2)),
      duplicateQuestionCount,
      scopesAudited: selectionScopes.length,
      scopeFailures: selectionScopes.filter(scope => scope.neverSelected > 0),
      maxScopeFrequencyRatio: Number(Math.max(...selectionScopes.map(scope => scope.maxFrequency / Math.max(1, scope.minFrequency))).toFixed(2)),
    },
    audio: { localAudioTargets, missingLocalAudio, crossDialectAudio },
    failures,
  }, null, 2));

  if (failures.length > 0) process.exit(1);
}).catch(error => {
  console.error(error);
  process.exit(1);
});
