import type { Word } from '../constants/words';
import type { DialectMissionContent } from '../data/curriculum';

export function getLessonCapabilities(missionContent?: DialectMissionContent) {
  const playbackEnabled = missionContent?.audioMode !== 'none';
  return {
    playbackEnabled,
    pronunciationEnabled: missionContent?.pronunciationEnabled ?? playbackEnabled,
  };
}

export function getLessonEvaluationPayload(word: Word, dialect: string, useDisplayedTarget: boolean) {
  return {
    targetText: useDisplayedTarget
      ? word.displayArabic ?? word.arabic
      : word.evalTarget ?? word.audioText ?? word.arabic,
    dialect,
    context: 'lesson' as const,
  };
}
