import type { DialectMissionContent, SupportedDialect } from '../data/curriculum/types';
import { V2_AUDIO_REFERENCE_KEYS, V2_AUDIO_REGISTRY, type V2AudioModule } from '../constants/audio-v2-registry';

export function getV2AudioModule(dialect: SupportedDialect, referenceId: string): V2AudioModule | null {
  if (!referenceId.startsWith(`${dialect}:`)) return null;
  const audioKey = V2_AUDIO_REFERENCE_KEYS[referenceId];
  return audioKey ? V2_AUDIO_REGISTRY[dialect][audioKey] ?? null : null;
}

export function withV2MissionAudio(
  dialect: SupportedDialect,
  unitNumber: 1 | 2,
  mission: DialectMissionContent,
): DialectMissionContent {
  if (mission.missionKind === 'review' || mission.missionKind === 'challenge') {
    return { ...mission, audioMode: 'none' };
  }

  if (mission.missionKind === 'lesson') {
    const lessonWords = mission.lessonWords ?? [];
    const resolvedWords = lessonWords.map((word, index) => {
      const referenceId = `${dialect}:u${unitNumber}:${mission.missionId}:lesson:${index + 1}`;
      const audio = getV2AudioModule(dialect, referenceId);
      return audio == null ? null : { ...word, audio };
    });
    if (resolvedWords.some(word => word === null) || resolvedWords.length === 0) {
      return { ...mission, audioMode: 'none' };
    }
    return {
      ...mission,
      lessonWords: resolvedWords as NonNullable<typeof resolvedWords[number]>[],
      audioMode: 'default',
      pronunciationEnabled: mission.pronunciationEnabled ?? false,
    };
  }

  if (mission.missionKind === 'guided_dialogue') {
    const dialogue = mission.dialogue ?? [];
    const resolvedTurns = dialogue.map((turn, index) => {
      const referenceId = `${dialect}:u${unitNumber}:${mission.missionId}:turn:${index + 1}`;
      const audio = getV2AudioModule(dialect, referenceId);
      return audio == null ? null : { ...turn, audio };
    });
    if (resolvedTurns.some(turn => turn === null) || resolvedTurns.length === 0) {
      return { ...mission, audioMode: 'none' };
    }
    return {
      ...mission,
      dialogue: resolvedTurns as NonNullable<typeof resolvedTurns[number]>[],
      audioMode: 'default',
      pronunciationEnabled: mission.pronunciationEnabled ?? false,
    };
  }

  return mission;
}

export function createV2MissionContentRegistry(
  dialect: SupportedDialect,
  unitNumber: 1 | 2,
  missions: readonly DialectMissionContent[],
) {
  return Object.fromEntries(missions.map(mission => {
    const key = unitNumber === 1 ? mission.missionId : `unit2:${mission.missionId}`;
    return [key, withV2MissionAudio(dialect, unitNumber, mission)];
  }));
}
