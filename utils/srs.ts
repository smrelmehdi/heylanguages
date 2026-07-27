import AsyncStorage from '@react-native-async-storage/async-storage';

export type QuizSrsResult = 'correct' | 'wrong';

export interface QuizSrsEntry {
  itemId: string;
  dueAt: number;
  intervalDays: number;
  correctStreak: number;
  wrongCount: number;
  lastResult: QuizSrsResult;
  updatedAt: number;
}

export interface QuizSrsSummary {
  dueCount: number;
  weakCount: number;
  stableCount: number;
  unseenCount: number;
}

type QuizSrsMap = Record<string, QuizSrsEntry>;

const QUIZ_SRS_STORAGE_KEY = 'quiz_srs_v1';
let srsWriteQueue = Promise.resolve();

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shuffle<T>(items: T[], seed?: string, getId?: (item: T) => string): T[] {
  if (seed && getId) {
    return [...items].sort((left, right) => {
      const leftId = getId(left);
      const rightId = getId(right);
      return stableHash(`${seed}:${leftId}`) - stableHash(`${seed}:${rightId}`) || leftId.localeCompare(rightId);
    });
  }
  return [...items];
}

async function readQuizSrsMap(): Promise<QuizSrsMap> {
  const raw = await AsyncStorage.getItem(QUIZ_SRS_STORAGE_KEY);
  if (!raw) return {};
  const parsed = JSON.parse(raw) as QuizSrsMap;
  return parsed ?? {};
}

async function loadQuizSrsMap(): Promise<QuizSrsMap> {
  try {
    // Public reads wait for queued writes so Home and Daily Review see the same
    // committed snapshot after an answer.
    await srsWriteQueue;
    return await readQuizSrsMap();
  } catch (error) {
    console.warn('Quiz SRS load error:', error);
    return {};
  }
}

export async function getQuizSrsSummary(itemIds: string[]): Promise<QuizSrsSummary> {
  const map = await loadQuizSrsMap();
  const now = Date.now();
  let dueCount = 0;
  let weakCount = 0;
  let stableCount = 0;
  let unseenCount = 0;

  for (const itemId of itemIds) {
    const entry = map[itemId];
    if (!entry) {
      unseenCount++;
      continue;
    }
    if (entry.dueAt <= now) {
      dueCount++;
      continue;
    }
    if (entry.wrongCount > 0) {
      weakCount++;
      continue;
    }
    stableCount++;
  }

  return { dueCount, weakCount, stableCount, unseenCount };
}

async function saveQuizSrsMap(map: QuizSrsMap): Promise<void> {
  await AsyncStorage.setItem(QUIZ_SRS_STORAGE_KEY, JSON.stringify(map));
}

function nextIntervalDays(correctStreak: number): number {
  if (correctStreak <= 1) return 1;
  if (correctStreak === 2) return 3;
  if (correctStreak === 3) return 7;
  if (correctStreak === 4) return 14;
  return 30;
}

export async function recordQuizSrsResult(itemId: string, correct: boolean): Promise<void> {
  const operation = srsWriteQueue.then(async () => {
    const map = await readQuizSrsMap();
    const existing = map[itemId];
    const now = Date.now();

    if (correct) {
      const correctStreak = (existing?.correctStreak ?? 0) + 1;
      const intervalDays = nextIntervalDays(correctStreak);
      map[itemId] = {
        itemId,
        dueAt: now + intervalDays * 24 * 60 * 60 * 1000,
        intervalDays,
        correctStreak,
        wrongCount: Math.max(0, (existing?.wrongCount ?? 0) - 1),
        lastResult: 'correct',
        updatedAt: now,
      };
    } else {
      map[itemId] = {
        itemId,
        dueAt: now,
        intervalDays: 0,
        correctStreak: 0,
        wrongCount: (existing?.wrongCount ?? 0) + 1,
        lastResult: 'wrong',
        updatedAt: now,
      };
    }

    await saveQuizSrsMap(map);
  });
  srsWriteQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

function priorityScore(entry: QuizSrsEntry | undefined, now: number): number {
  if (!entry) return 1;
  if (entry.dueAt <= now) return 100 + entry.wrongCount * 10;
  if (entry.wrongCount > 0) return 50 + entry.wrongCount * 5;
  return 10 - Math.min(entry.correctStreak, 5);
}

export async function prioritizeQuizItems<T>(
  items: T[],
  getId: (item: T) => string,
): Promise<T[]> {
  const map = await loadQuizSrsMap();
  const now = Date.now();

  return [...items]
    .sort((left, right) => {
      const leftEntry = map[getId(left)];
      const rightEntry = map[getId(right)];
      const scoreDelta = priorityScore(rightEntry, now) - priorityScore(leftEntry, now);
      if (scoreDelta !== 0) return scoreDelta;
      const leftUpdated = leftEntry?.updatedAt ?? 0;
      const rightUpdated = rightEntry?.updatedAt ?? 0;
      return leftUpdated - rightUpdated;
    });
}

export async function selectQuizItems<T>(
  items: T[],
  getId: (item: T) => string,
  count: number,
  attemptSeed?: string,
): Promise<T[]> {
  const map = await loadQuizSrsMap();
  const now = Date.now();
  const due: T[] = [];
  const weak: T[] = [];
  const unseen: T[] = [];
  const stable: T[] = [];

  for (const item of items) {
    const entry = map[getId(item)];
    if (!entry) {
      unseen.push(item);
      continue;
    }
    if (entry.dueAt <= now) {
      due.push(item);
      continue;
    }
    if (entry.wrongCount > 0) {
      weak.push(item);
      continue;
    }
    stable.push(item);
  }

  const selected: T[] = [];
  const used = new Set<string>();
  const pushUnique = (item: T) => {
    const id = getId(item);
    if (used.has(id) || selected.length >= count) return;
    used.add(id);
    selected.push(item);
  };

  for (const item of prioritizeByRecency(due, map, getId)) pushUnique(item);
  for (const item of prioritizeByRecency(weak, map, getId)) pushUnique(item);

  const weightedRest = [
    ...shuffle(unseen, `${attemptSeed}:unseen`, getId),
    ...shuffle(weak, `${attemptSeed}:weak-1`, getId),
    ...shuffle(weak, `${attemptSeed}:weak-2`, getId),
    ...shuffle(stable, `${attemptSeed}:stable`, getId),
  ];

  for (const item of weightedRest) pushUnique(item);

  for (const item of shuffle(items, `${attemptSeed}:all`, getId)) pushUnique(item);

  return selected.slice(0, Math.min(count, items.length));
}

function prioritizeByRecency<T>(
  items: T[],
  map: QuizSrsMap,
  getId: (item: T) => string,
): T[] {
  return [...items].sort((left, right) => {
    const leftEntry = map[getId(left)];
    const rightEntry = map[getId(right)];
    if (!leftEntry && !rightEntry) return 0;
    if (!leftEntry) return 1;
    if (!rightEntry) return -1;
    if (leftEntry.wrongCount !== rightEntry.wrongCount) {
      return rightEntry.wrongCount - leftEntry.wrongCount;
    }
    return leftEntry.updatedAt - rightEntry.updatedAt;
  });
}

export async function getTotalDueCount(): Promise<number> {
  const map = await loadQuizSrsMap();
  const now = Date.now();
  return Object.values(map).filter(e => e.dueAt <= now).length;
}

export async function getDueItemIds(): Promise<Set<string>> {
  const map = await loadQuizSrsMap();
  const now = Date.now();
  const ids = new Set<string>();
  for (const [id, entry] of Object.entries(map)) {
    if (entry.dueAt <= now) ids.add(id);
  }
  return ids;
}

export async function getResolvableDueCount(candidateIds: Iterable<string>): Promise<number> {
  const dueIds = await getDueItemIds();
  const uniqueCandidates = new Set(candidateIds);
  let count = 0;
  uniqueCandidates.forEach(id => {
    if (dueIds.has(id)) count += 1;
  });
  return count;
}
