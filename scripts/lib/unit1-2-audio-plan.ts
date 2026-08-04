import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import type { DialectMissionContent, SupportedDialect } from '../../data/curriculum/types';
import type { QuizQuestion } from '../../data/quiz-types';
import {
  MSA_BIG_REVIEW_MISSION,
  MSA_DESCRIBE_THE_WORLD_MISSION,
  MSA_EVERYDAY_OBJECTS_MISSION,
  MSA_FIRST_ARABIC_CHALLENGE_MISSION,
  MSA_FIRST_ARABIC_WORDS_MISSION,
  MSA_FIRST_CAFE_CONVERSATION_MISSION,
  MSA_FOOD_AND_DRINKS_MISSION,
  MSA_HOW_ARE_YOU_MISSION,
  MSA_INTRODUCE_YOURSELF_MISSION,
  MSA_NUMBERS_AND_MONEY_MISSION,
  MSA_PEOPLE_AROUND_YOU_MISSION,
  MSA_POLITE_LIKE_A_LOCAL_MISSION,
  MSA_WHERE_HERE_THERE_MISSION,
} from '../../data/msa-unit1';
import { MSA_UNIT2_V2_MISSIONS } from '../../data/msa-unit2-v2';
import { GULF_UNIT1_MISSIONS } from '../../data/gulf-unit1';
import { GULF_UNIT2_V2_MISSIONS } from '../../data/gulf-unit2-v2';
import { EGYPTIAN_UNIT1_MISSIONS } from '../../data/egyptian-unit1';
import { EGYPTIAN_UNIT2_V2_MISSIONS } from '../../data/egyptian-unit2-v2';

export const UNIT1_2_AUDIO_VOICE_CONFIG = {
  msa: { voiceId: 'xvhpbk8otnNHtT3fjCpr', model: 'eleven_v3' },
  gulf: { voiceId: 'rUaPbzcZIu8df8iNL9WZ', model: 'eleven_multilingual_v2' },
  egyptian: { voiceId: 'LXrTqFIgiubkrMkwvOUr', model: 'eleven_v3' },
} as const;

export const UNIT1_2_AUDIO_VOICE_SETTINGS = {
  stability: 0.75,
  similarity_boost: 0.85,
  style: 0,
  use_speaker_boost: true,
} as const;

export const UNIT1_2_AUDIO_OUTPUT_FORMAT = 'mp3_44100_128' as const;
export const UNIT1_2_AUDIO_ROOT = 'assets/audio/v2';
export const MIN_VALID_AUDIO_BYTES = 4096;

/** Provider-only pronunciation hints. Canonical text still owns identity, display, and evaluation. */
export const UNIT1_2_AUDIO_SYNTHESIS_OVERRIDES: Readonly<Record<string, string>> = {
  '8dfe6db4ba08bbd7ec65': 'لَأ.',
  '15c3f23e452480d0d1b2': 'أَبْل ما أطلع.',
  '76ab2cccbedb732b53e6': 'هِنا',
  '2f9b9c9048b46e25b695': 'إنتَ منين؟',
  'ec5b028e9bdaf366d621': 'بُنِّيّ',
  'ff4c737c7b03902be911': 'بخير. شكراً.',
  '82a5b0d6131c4fc3ad2a': 'ضَعْ',
  '2b387d2090ccd02400c4': 'سُتْرَتِي',
};

/** MSA clips with manually approved pronunciation and provider-boundary treatment. */
export const MSA_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS = [
  'ec5b028e9bdaf366d621',
  'ff4c737c7b03902be911',
  '82a5b0d6131c4fc3ad2a',
  '2b387d2090ccd02400c4',
] as const;

/** Egyptian clips confirmed by the deterministic cutoff-risk audit to need provider boundary padding. */
export const EGYPTIAN_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS = [
  'ed4cc0c6d4b68376b479', '76ab2cccbedb732b53e6', '11bbb80f490c190009e9', 'f88d6f07ae6d14c09b5b',
  '423280b13edf409d77fb', '0742df8b4a6093507e4e', '7dec51e46c163c270787', '2f9b9c9048b46e25b695',
  '83a2a44939b39e6fbebb', '687319208bbeb2a79842', 'aca59e2dc8e0dcdc219f', '0f93bed80e02a29ade4d',
  '643d872bf1daa116faac', '46415df3afac571efe84', 'ad43b49b2dd1ff31a65f', '703b5feb7c8e97500ed6',
  'f4482978bf63e3bfb695', 'e253de9c08c0cadaf7ef', '2e60f7ee1f6242130bee', '2086248fb327213d2120',
  'f6e6aece0e0f4940d10e', '0797b234435e44edf976', '4671220598ec70e00665', '8629223c62ed9fdc2ec0',
  'f5bc6344aa923ee2736d', 'eb06eafde23385069b0f', 'ce8ddead3889d398ffb5', 'fe77196892d715a8ccbd',
  '5d2b03741ac8b3b0a8d8', 'ca4c65a328ed472f3e24', '4d102cec6c6b455c2806', '5ce9dc0e3557f80848bc',
  'c817b89e98c47dd87d42', 'ab2576c9b1783f7bbfc4', '148a3bfe5487c9c796d2', '182cac8d798647ff0ade',
  '15cb23a0e990ca3ac1c4', '628f5b1afcdb0f96183b',
] as const;

type ManifestContentType = 'lesson_item' | 'review_listening' | 'guided_dialogue_turn' | 'challenge_listening';
type ExistingFileStatus = 'missing' | 'valid' | 'zero_byte' | 'suspiciously_short' | 'unreadable';
type ValidationStatus = 'ready' | 'missing_source_text' | 'invalid_existing_file';

export type Unit1_2AudioManifestEntry = {
  referenceId: string;
  dialect: SupportedDialect;
  unitNumber: 1 | 2;
  missionSemanticId: string;
  itemIndex: number;
  contentType: ManifestContentType;
  speaker: string | null;
  exactArabicSourceText: string;
  canonicalText: string;
  synthesisText: string;
  normalizedText: string;
  pronunciationTarget: string | null;
  voiceId: string;
  model: string;
  voiceSettings: typeof UNIT1_2_AUDIO_VOICE_SETTINGS;
  outputFormat: typeof UNIT1_2_AUDIO_OUTPUT_FORMAT;
  audioKey: string;
  intendedOutputPath: string;
  existingFileStatus: ExistingFileStatus;
  generationRequired: boolean;
  reuseSource: string | null;
  legacyCandidatePath: string | null;
  curriculumSourceFile: string;
  questionId: string | null;
  validationStatus: ValidationStatus;
};

type UnitSource = {
  dialect: SupportedDialect;
  unitNumber: 1 | 2;
  missions: readonly DialectMissionContent[];
  curriculumSourceFile: string;
  quizSourceFile: string;
};

const MSA_UNIT1_MISSIONS: readonly DialectMissionContent[] = [
  MSA_FIRST_ARABIC_WORDS_MISSION,
  MSA_POLITE_LIKE_A_LOCAL_MISSION,
  MSA_PEOPLE_AROUND_YOU_MISSION,
  MSA_EVERYDAY_OBJECTS_MISSION,
  MSA_FOOD_AND_DRINKS_MISSION,
  MSA_DESCRIBE_THE_WORLD_MISSION,
  MSA_NUMBERS_AND_MONEY_MISSION,
  MSA_WHERE_HERE_THERE_MISSION,
  MSA_INTRODUCE_YOURSELF_MISSION,
  MSA_HOW_ARE_YOU_MISSION,
  MSA_BIG_REVIEW_MISSION,
  MSA_FIRST_CAFE_CONVERSATION_MISSION,
  MSA_FIRST_ARABIC_CHALLENGE_MISSION,
];

export const UNIT1_2_AUDIO_UNIT_SOURCES: readonly UnitSource[] = [
  { dialect: 'msa', unitNumber: 1, missions: MSA_UNIT1_MISSIONS, curriculumSourceFile: 'data/msa-unit1.ts', quizSourceFile: 'data/msa-unit1-quizzes.ts' },
  { dialect: 'msa', unitNumber: 2, missions: MSA_UNIT2_V2_MISSIONS, curriculumSourceFile: 'data/msa-unit2-v2.ts', quizSourceFile: 'data/msa-unit2-quizzes.ts' },
  { dialect: 'gulf', unitNumber: 1, missions: GULF_UNIT1_MISSIONS, curriculumSourceFile: 'data/gulf-unit1.ts', quizSourceFile: 'data/gulf-unit1-quizzes.ts' },
  { dialect: 'gulf', unitNumber: 2, missions: GULF_UNIT2_V2_MISSIONS, curriculumSourceFile: 'data/gulf-unit2-v2.ts', quizSourceFile: 'data/gulf-unit2-quizzes.ts' },
  { dialect: 'egyptian', unitNumber: 1, missions: EGYPTIAN_UNIT1_MISSIONS, curriculumSourceFile: 'data/egyptian-unit1.ts', quizSourceFile: 'data/egyptian-unit1-quizzes.ts' },
  { dialect: 'egyptian', unitNumber: 2, missions: EGYPTIAN_UNIT2_V2_MISSIONS, curriculumSourceFile: 'data/egyptian-unit2-v2.ts', quizSourceFile: 'data/egyptian-unit2-quizzes.ts' },
] as const;

export function normalizeUnit1_2AudioText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function stableConfigJson() {
  const settings = UNIT1_2_AUDIO_VOICE_SETTINGS;
  return JSON.stringify({
    stability: settings.stability,
    similarity_boost: settings.similarity_boost,
    style: settings.style,
    use_speaker_boost: settings.use_speaker_boost,
  });
}

export function unit1_2AudioKey(dialect: SupportedDialect, normalizedText: string): string {
  const voice = UNIT1_2_AUDIO_VOICE_CONFIG[dialect];
  return createHash('sha256')
    .update([
      'heyyusuf-v2',
      dialect,
      normalizedText,
      voice.voiceId,
      voice.model,
      stableConfigJson(),
      UNIT1_2_AUDIO_OUTPUT_FORMAT,
    ].join('\u0000'))
    .digest('hex')
    .slice(0, 20);
}

function fileStatus(root: string, relativePath: string): ExistingFileStatus {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath)) return 'missing';
  try {
    const size = statSync(absolutePath).size;
    if (size === 0) return 'zero_byte';
    if (size < MIN_VALID_AUDIO_BYTES) return 'suspiciously_short';
    const header = readFileSync(absolutePath).subarray(0, 3);
    const looksLikeMp3 = header.toString('ascii') === 'ID3' || (header[0] === 0xff && (header[1] & 0xe0) === 0xe0);
    return looksLikeMp3 ? 'valid' : 'unreadable';
  } catch {
    return 'unreadable';
  }
}

function legacyCandidates(root: string) {
  const candidates = new Map<string, string>();
  const legacyManifestPath = resolve(root, 'assets/audio/manifest.json');
  if (!existsSync(legacyManifestPath)) return candidates;
  try {
    const legacy = JSON.parse(readFileSync(legacyManifestPath, 'utf8')) as Record<string, { dialect?: string; text?: string; path?: string }>;
    for (const value of Object.values(legacy)) {
      if (!value.dialect || !value.text || !value.path) continue;
      const key = `${value.dialect}\u0000${normalizeUnit1_2AudioText(value.text)}`;
      if (fileStatus(root, value.path) === 'valid') candidates.set(key, value.path);
    }
  } catch {
    // An unreadable legacy manifest cannot authorize reuse.
  }
  return candidates;
}

function listeningText(question: QuizQuestion): string | null {
  if (question.format === 'listening' || question.format === 'scene_replay' || question.format === 'transliteration_type') {
    return question.audioText;
  }
  return null;
}

type PendingReference = Omit<Unit1_2AudioManifestEntry,
  'canonicalText' | 'synthesisText' | 'normalizedText' | 'voiceId' | 'model' | 'voiceSettings' | 'outputFormat' | 'audioKey' |
  'intendedOutputPath' | 'existingFileStatus' | 'generationRequired' | 'reuseSource' |
  'legacyCandidatePath' | 'validationStatus'>;

function collectReferences(): PendingReference[] {
  const references: PendingReference[] = [];
  for (const source of UNIT1_2_AUDIO_UNIT_SOURCES) {
    for (const mission of source.missions) {
      if (mission.missionKind === 'lesson') {
        for (const [index, word] of (mission.lessonWords ?? []).entries()) {
          const exactArabicSourceText = word.audioText ?? word.displayArabic ?? word.arabic;
          references.push({
            referenceId: `${source.dialect}:u${source.unitNumber}:${mission.missionId}:lesson:${index + 1}`,
            dialect: source.dialect,
            unitNumber: source.unitNumber,
            missionSemanticId: mission.missionId,
            itemIndex: index + 1,
            contentType: 'lesson_item',
            speaker: null,
            exactArabicSourceText,
            pronunciationTarget: word.evalTarget ?? word.displayArabic ?? word.arabic,
            curriculumSourceFile: source.curriculumSourceFile,
            questionId: null,
          });
        }
      } else if (mission.missionKind === 'guided_dialogue') {
        for (const [index, turn] of (mission.dialogue ?? []).entries()) {
          const exactArabicSourceText = turn.audioText ?? turn.displayArabic ?? turn.arabic;
          references.push({
            referenceId: `${source.dialect}:u${source.unitNumber}:${mission.missionId}:turn:${index + 1}`,
            dialect: source.dialect,
            unitNumber: source.unitNumber,
            missionSemanticId: mission.missionId,
            itemIndex: index + 1,
            contentType: 'guided_dialogue_turn',
            speaker: turn.speakerRole ?? turn.type,
            exactArabicSourceText,
            pronunciationTarget: turn.evalTarget ?? null,
            curriculumSourceFile: source.curriculumSourceFile,
            questionId: null,
          });
        }
      } else if (mission.missionKind === 'review' || mission.missionKind === 'challenge') {
        for (const [index, question] of (mission.quizQuestions ?? []).entries()) {
          const exactArabicSourceText = listeningText(question);
          if (!exactArabicSourceText) continue;
          references.push({
            referenceId: `${source.dialect}:u${source.unitNumber}:${mission.missionId}:question:${question.id}`,
            dialect: source.dialect,
            unitNumber: source.unitNumber,
            missionSemanticId: mission.missionId,
            itemIndex: index + 1,
            contentType: mission.missionKind === 'review' ? 'review_listening' : 'challenge_listening',
            speaker: null,
            exactArabicSourceText,
            pronunciationTarget: null,
            curriculumSourceFile: source.quizSourceFile,
            questionId: question.id,
          });
        }
      }
    }
  }
  return references;
}

export function buildUnit1_2AudioManifest(root = process.cwd()): Unit1_2AudioManifestEntry[] {
  const firstReferenceByKey = new Map<string, string>();
  const candidates = legacyCandidates(root);
  return collectReferences().map(reference => {
    const normalizedText = normalizeUnit1_2AudioText(reference.exactArabicSourceText);
    const voice = UNIT1_2_AUDIO_VOICE_CONFIG[reference.dialect];
    const audioKey = unit1_2AudioKey(reference.dialect, normalizedText);
    const synthesisText = UNIT1_2_AUDIO_SYNTHESIS_OVERRIDES[audioKey] ?? reference.exactArabicSourceText;
    const intendedOutputPath = `${UNIT1_2_AUDIO_ROOT}/${reference.dialect}/${audioKey}.mp3`;
    const existingFileStatus = fileStatus(root, intendedOutputPath);
    const dedupeKey = [
      reference.dialect,
      normalizedText,
      voice.voiceId,
      voice.model,
      stableConfigJson(),
      UNIT1_2_AUDIO_OUTPUT_FORMAT,
    ].join('\u0000');
    const reuseSource = firstReferenceByKey.get(dedupeKey) ?? null;
    if (!reuseSource) firstReferenceByKey.set(dedupeKey, reference.referenceId);
    const validationStatus: ValidationStatus = !normalizedText
      ? 'missing_source_text'
      : existingFileStatus === 'zero_byte' || existingFileStatus === 'suspiciously_short' || existingFileStatus === 'unreadable'
        ? 'invalid_existing_file'
        : 'ready';
    return {
      ...reference,
      canonicalText: reference.exactArabicSourceText,
      synthesisText,
      normalizedText,
      voiceId: voice.voiceId,
      model: voice.model,
      voiceSettings: UNIT1_2_AUDIO_VOICE_SETTINGS,
      outputFormat: UNIT1_2_AUDIO_OUTPUT_FORMAT,
      audioKey,
      intendedOutputPath,
      existingFileStatus,
      generationRequired: reuseSource === null && existingFileStatus !== 'valid',
      reuseSource,
      legacyCandidatePath: candidates.get(`${reference.dialect}\u0000${normalizedText}`) ?? null,
      validationStatus,
    };
  });
}

export function summarizeUnit1_2AudioManifest(entries: readonly Unit1_2AudioManifestEntry[]) {
  const unique = new Map(entries.map(entry => [entry.audioKey, entry]));
  const byDialectUnit: Record<string, { references: number; uniqueClips: number; missing: number }> = {};
  for (const dialect of ['msa', 'gulf', 'egyptian'] as const) {
    for (const unitNumber of [1, 2] as const) {
      const refs = entries.filter(entry => entry.dialect === dialect && entry.unitNumber === unitNumber);
      const clips = new Map(refs.map(entry => [entry.audioKey, entry]));
      byDialectUnit[`${dialect}:unit-${unitNumber}`] = {
        references: refs.length,
        uniqueClips: clips.size,
        missing: [...clips.values()].filter(entry => entry.existingFileStatus === 'missing').length,
      };
    }
  }
  return {
    references: entries.length,
    uniqueClips: unique.size,
    existingValid: [...unique.values()].filter(entry => entry.existingFileStatus === 'valid').length,
    missing: [...unique.values()].filter(entry => entry.existingFileStatus === 'missing').length,
    invalid: [...unique.values()].filter(entry => !['valid', 'missing'].includes(entry.existingFileStatus)).length,
    legacyCandidates: [...unique.values()].filter(entry => entry.legacyCandidatePath !== null).length,
    byDialectUnit,
  };
}
