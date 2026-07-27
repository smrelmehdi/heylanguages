import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';
import { resolve } from 'node:path';
import type { DialectContent, DialogueTurn } from '../data/content-registry';

const extensions = (Module as typeof Module & {
  _extensions: Record<string, (module: { exports: unknown }, filename: string) => void>;
})._extensions;
for (const extension of ['.mp3', '.png', '.jpg', '.jpeg']) {
  extensions[extension] = (module, filename) => {
    module.exports = filename;
  };
}

const values = new Map<string, string>();
let failNextWrite = false;
let writeDelayMs = 0;
const storageMock = {
  getItem: async (key: string) => values.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    if (writeDelayMs > 0) {
      await new Promise(resolveDelay => setTimeout(resolveDelay, writeDelayMs));
    }
    if (failNextWrite) {
      failNextWrite = false;
      throw new Error('simulated persistence failure');
    }
    values.set(key, value);
  },
  multiSet: async (entries: [string, string][]) => {
    entries.forEach(([key, value]) => values.set(key, value));
  },
  removeItem: async (key: string) => {
    values.delete(key);
  },
};

const moduleWithLoader = Module as typeof Module & {
  _load: (request: string, parent: unknown, isMain: boolean) => unknown;
};
const originalLoad = moduleWithLoader._load;
moduleWithLoader._load = function loadForPhase1ATests(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') {
    return { __esModule: true, default: storageMock };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const {
  getDueItemIds,
  getResolvableDueCount,
  recordQuizSrsResult,
} = require('../utils/srs') as typeof import('../utils/srs');
const {
  buildPhase1ReviewQuestions,
  getPhase1ReviewAttemptScope,
  isDedicatedReviewRoute,
} = require('../utils/phase1-review') as typeof import('../utils/phase1-review');
const {
  createScopedAttemptSeedCache,
} = require('../utils/quiz-attempt') as typeof import('../utils/quiz-attempt');
const { getContentAccess, getQuizContentId } = require('../utils/access') as typeof import('../utils/access');
const { getPersistableQuizXp } = require('../utils/quiz-scoring') as typeof import('../utils/quiz-scoring');

const storageKey = 'quiz_srs_v1';
const parseStore = () => JSON.parse(values.get(storageKey) ?? '{}') as Record<string, unknown>;

async function testConcurrentWrites() {
  values.clear();
  await Promise.all(
    Array.from({ length: 20 }, (_, index) =>
      recordQuizSrsResult(`concurrent-${index + 1}`, false)
    ),
  );
  assert.equal(Object.keys(parseStore()).length, 20);
}

async function testFailedWriteRecovery() {
  values.clear();
  failNextWrite = true;
  await assert.rejects(recordQuizSrsResult('failed-write', false), /simulated persistence failure/);
  await recordQuizSrsResult('write-after-failure', false);
  assert.deepEqual(Object.keys(parseStore()), ['write-after-failure']);
}

async function testReadsWaitForQueuedWrites() {
  values.clear();
  writeDelayMs = 20;
  const pendingWrite = recordQuizSrsResult('pending-write', false);
  const dueIds = await getDueItemIds();
  await pendingWrite;
  writeDelayMs = 0;
  assert.equal(dueIds.has('pending-write'), true);
}

function createReviewContent(): DialectContent {
  const turns: DialogueTurn[] = [
    { type: 'waiter', arabic: 'تطلب إيه؟', transliteration: 'titlub eih?', english: 'What would you like?', audio: 1 },
    { type: 'user', arabic: 'عايز قهوة', transliteration: 'aayez ahwa', english: 'I want coffee', audio: 2 },
    { type: 'waiter', arabic: 'حاجة تانية؟', transliteration: 'haaga taanya?', english: 'Anything else?', audio: 3 },
    { type: 'user', arabic: 'عايز شاي', transliteration: 'aayez shaay', english: 'I want tea', audio: 4 },
    { type: 'waiter', arabic: 'سكر؟', transliteration: 'sukkar?', english: 'Sugar?', audio: 5 },
    { type: 'user', arabic: 'من غير سكر', transliteration: 'min gheir sukkar', english: 'Without sugar', audio: 6 },
    { type: 'waiter', arabic: 'الحساب؟', transliteration: 'il-hisaab?', english: 'The bill?', audio: 7 },
    { type: 'user', arabic: 'الحساب لو سمحت', transliteration: 'il-hisaab law samaht', english: 'The bill please', audio: 8 },
  ];
  return {
    voiceId: 'test',
    lessons: { basic: [], greetings: [], intro: [] },
    scenarios: { TestScenario: turns },
    sceneImages: {},
    availableLessons: [],
    availableScenarios: ['TestScenario'],
  };
}

async function testTruthfulBadge() {
  values.clear();
  const candidates = buildPhase1ReviewQuestions(createReviewContent(), 'egyptian', 'egyptian:review:1');
  assert.ok(candidates.length > 0);
  const resolvableId = candidates[0].id;
  const wrongDialectId = resolvableId.replace(/^egyptian_/, 'gulf_');
  const orphanId = 'egyptian_removed_scenario_scene';
  const unsupportedVocabularyId = 'egyptian_unit1:أيوه:Yes';

  await recordQuizSrsResult(resolvableId, false);
  await recordQuizSrsResult(wrongDialectId, false);
  await recordQuizSrsResult(orphanId, false);
  await recordQuizSrsResult(unsupportedVocabularyId, false);

  const badgeCount = await getResolvableDueCount(candidates.map(question => question.id));
  assert.equal(badgeCount, 1);
  assert.ok(candidates.some(question => question.id === resolvableId));

  return { resolvableId, wrongDialectId, orphanId, unsupportedVocabularyId, badgeCount };
}

async function testScopedAttemptSeedCache() {
  values.clear();
  const cache = createScopedAttemptSeedCache();
  const egyptianScope = getPhase1ReviewAttemptScope('egyptian');
  const gulfScope = getPhase1ReviewAttemptScope('gulf');

  const egyptian = await cache.resolve(egyptianScope);
  const egyptianRerender = await cache.resolve(egyptianScope);
  assert.deepEqual(egyptianRerender, egyptian);
  assert.equal(values.get(`quiz_attempt_counter:${egyptianScope}`), '1');

  const gulf = await cache.resolve(gulfScope);
  assert.equal(gulf?.scope, gulfScope);
  assert.notEqual(gulf?.seed, egyptian?.seed);

  const egyptianReturn = await cache.resolve(egyptianScope);
  assert.equal(egyptianReturn?.seed, egyptian?.seed);
  assert.equal(values.get(`quiz_attempt_counter:${egyptianScope}`), '1');

  const reloadedCache = createScopedAttemptSeedCache();
  const reloaded = await reloadedCache.resolve(egyptianScope);
  assert.equal(reloaded?.seed, egyptian?.seed);
  assert.equal(values.get(`quiz_attempt_counter:${egyptianScope}`), '1');

  const content = createReviewContent();
  const homeCandidates = buildPhase1ReviewQuestions(content, 'gulf', gulf!.seed);
  const reviewCandidates = buildPhase1ReviewQuestions(content, 'gulf', gulf!.seed);
  assert.deepEqual(
    homeCandidates.map(question => question.id),
    reviewCandidates.map(question => question.id),
  );

  const dueId = homeCandidates[0].id;
  await recordQuizSrsResult(dueId, false);
  const badgeCount = await getResolvableDueCount(homeCandidates.map(question => question.id));
  const reviewDue = reviewCandidates.filter(question => question.id === dueId);
  assert.ok(badgeCount > 0);
  assert.ok(reviewDue.length > 0);

  return {
    sameScopeReused: true,
    dialectScopeChanged: true,
    previousDialectPersistedSeedReused: true,
    rerenderDidNotRegenerate: true,
    reloadUsedPersistedSeed: true,
    homeReviewCandidateIdsMatch: true,
    positiveBadgeProducedCandidate: true,
  };
}

async function testStaleSeedCannotOverwriteCurrentScope() {
  const resolvers = new Map<string, (seed: string) => void>();
  const cache = createScopedAttemptSeedCache(scope => new Promise(resolveSeed => {
    resolvers.set(scope, resolveSeed);
  }));
  const egyptianScope = getPhase1ReviewAttemptScope('egyptian');
  const gulfScope = getPhase1ReviewAttemptScope('gulf');

  const egyptianPending = cache.resolve(egyptianScope);
  const gulfPending = cache.resolve(gulfScope);
  resolvers.get(gulfScope)!(`${gulfScope}:1`);
  const gulf = await gulfPending;
  resolvers.get(egyptianScope)!(`${egyptianScope}:1`);
  const staleEgyptian = await egyptianPending;

  assert.deepEqual(gulf, { scope: gulfScope, seed: `${gulfScope}:1` });
  assert.equal(staleEgyptian, null);
  assert.deepEqual(cache.peek(gulfScope), gulf);
  assert.equal(cache.peek(egyptianScope), null);
}

function testRouteAndReviewIsolation() {
  assert.equal(isDedicatedReviewRoute('review'), true);
  assert.equal(isDedicatedReviewRoute('not-a-route'), false);
  assert.equal(getQuizContentId('review'), null);
  assert.equal(getPersistableQuizXp(10, 10, 100, true), 0);

  const invalidAccess = getContentAccess({
    dialect: 'gulf',
    unitId: 'unit-1',
    contentId: 'not-real-content',
    contentType: 'quiz',
    isPremium: true,
    isTestingUnlocked: false,
    completedContentIds: [],
  });
  assert.deepEqual(invalidAccess, { allowed: false, reason: 'unavailable' });

  const quizSource = readFileSync(resolve(process.cwd(), 'app/quiz-unit2.tsx'), 'utf8');
  assert.ok(quizSource.includes("initialPassed && requestedUnit !== 'review'"));
  assert.ok(quizSource.includes("requestedUnit === 'review' || awardedQuestionIdsRef.current.has(q.id)"));
}

async function main() {
  await testConcurrentWrites();
  await testFailedWriteRecovery();
  await testReadsWaitForQueuedWrites();
  const badge = await testTruthfulBadge();
  const scopedSeed = await testScopedAttemptSeedCache();
  await testStaleSeedCannotOverwriteCurrentScope();
  testRouteAndReviewIsolation();
  console.log(JSON.stringify({
    status: 'PASS',
    concurrentWritesPreserved: 20,
    queueRecoveredAfterFailure: true,
    readsObserveCommittedQueue: true,
    reviewRouteBypassesOnlyDedicatedGate: true,
    reviewXp: 0,
    reviewCompletionWrite: false,
    invalidNormalRouteBlocked: true,
    scopedSeed,
    staleSeedCannotOverwriteCurrentScope: true,
    badge,
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
