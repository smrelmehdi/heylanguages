export function stableQuizHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectWithAttemptSeed<T>(
  items: T[],
  count: number,
  attemptSeed: string,
  selectionKey: string,
  keyFor: (item: T) => string,
) {
  return [...items]
    .sort((left, right) => {
      const leftKey = keyFor(left);
      const rightKey = keyFor(right);
      const leftRank = stableQuizHash(`${attemptSeed}:${selectionKey}:${leftKey}`);
      const rightRank = stableQuizHash(`${attemptSeed}:${selectionKey}:${rightKey}`);
      return leftRank - rightRank || leftKey.localeCompare(rightKey);
    })
    .slice(0, count);
}
