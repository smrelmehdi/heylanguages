import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import type { QuizQuestion } from '../data/quiz-types';
import {
  buildUnit1_2AudioManifest,
  normalizeUnit1_2AudioText,
  summarizeUnit1_2AudioManifest,
  unit1_2AudioKey,
  UNIT1_2_AUDIO_ROOT,
  EGYPTIAN_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS,
  MSA_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS,
  UNIT1_2_AUDIO_SYNTHESIS_OVERRIDES,
  UNIT1_2_AUDIO_UNIT_SOURCES,
  UNIT1_2_AUDIO_VOICE_CONFIG,
  type Unit1_2AudioManifestEntry,
} from './lib/unit1-2-audio-plan';

const root = process.cwd();
const entries = buildUnit1_2AudioManifest(root);
const byReferenceId = new Map(entries.map(entry => [entry.referenceId, entry]));
assert.equal(byReferenceId.size, entries.length, 'reference IDs are unique');

function requiresListening(question: QuizQuestion) {
  return question.format === 'listening' || question.format === 'scene_replay' || question.format === 'transliteration_type';
}

const expectedReferenceIds = new Set<string>();
for (const source of UNIT1_2_AUDIO_UNIT_SOURCES) {
  assert.equal(source.missions.length, 13, `${source.dialect} Unit ${source.unitNumber} has 13 missions`);
  for (const mission of source.missions) {
    if (mission.missionKind === 'lesson') {
      for (const [index, word] of (mission.lessonWords ?? []).entries()) {
        const referenceId = `${source.dialect}:u${source.unitNumber}:${mission.missionId}:lesson:${index + 1}`;
        expectedReferenceIds.add(referenceId);
        const entry = byReferenceId.get(referenceId);
        assert.ok(entry, `${referenceId} has manifest coverage`);
        assert.equal(entry.contentType, 'lesson_item');
        assert.equal(entry.pronunciationTarget, word.evalTarget ?? word.displayArabic ?? word.arabic);
        assert.equal(entry.exactArabicSourceText, word.audioText ?? word.displayArabic ?? word.arabic);
      }
    } else if (mission.missionKind === 'guided_dialogue') {
      for (const [index, turn] of (mission.dialogue ?? []).entries()) {
        const referenceId = `${source.dialect}:u${source.unitNumber}:${mission.missionId}:turn:${index + 1}`;
        expectedReferenceIds.add(referenceId);
        const entry = byReferenceId.get(referenceId);
        assert.ok(entry, `${referenceId} has manifest coverage`);
        assert.equal(entry.contentType, 'guided_dialogue_turn');
        assert.equal(entry.itemIndex, index + 1, `${referenceId} preserves turn order`);
        assert.equal(entry.speaker, turn.speakerRole ?? turn.type, `${referenceId} preserves speaker`);
        assert.equal(entry.exactArabicSourceText, turn.audioText ?? turn.displayArabic ?? turn.arabic);
      }
    } else if (mission.missionKind === 'review' || mission.missionKind === 'challenge') {
      for (const [index, question] of (mission.quizQuestions ?? []).entries()) {
        const referenceId = `${source.dialect}:u${source.unitNumber}:${mission.missionId}:question:${question.id}`;
        if (requiresListening(question)) {
          expectedReferenceIds.add(referenceId);
          const entry = byReferenceId.get(referenceId);
          assert.ok(entry, `${referenceId} listening question has audio coverage`);
          assert.equal(entry.itemIndex, index + 1);
          assert.equal(entry.questionId, question.id);
          assert.equal(entry.exactArabicSourceText, question.audioText);
        } else {
          assert.equal(byReferenceId.has(referenceId), false, `${referenceId} text-only question is excluded`);
        }
      }
    }
  }
}

assert.deepEqual(new Set(entries.map(entry => entry.referenceId)), expectedReferenceIds, 'manifest has no orphaned mappings');

for (const entry of entries) {
  const voice = UNIT1_2_AUDIO_VOICE_CONFIG[entry.dialect];
  assert.equal(entry.voiceId, voice.voiceId, `${entry.referenceId} uses its dialect voice`);
  assert.equal(entry.model, voice.model, `${entry.referenceId} uses its dialect model`);
  assert.equal(entry.normalizedText, normalizeUnit1_2AudioText(entry.exactArabicSourceText));
  assert.equal(entry.canonicalText, entry.exactArabicSourceText);
  assert.match(entry.audioKey, /^[a-f0-9]{20}$/);
  assert.equal(entry.intendedOutputPath, `${UNIT1_2_AUDIO_ROOT}/${entry.dialect}/${entry.audioKey}.mp3`);
  assert.equal(entry.intendedOutputPath.includes('/unit-1/'), false, 'v2 output cannot collide with legacy Unit 1 paths');
  assert.equal(entry.intendedOutputPath.includes('/unit-2/'), false, 'v2 output cannot collide with legacy Unit 2 paths');
  assert.equal(entry.validationStatus, 'ready');
  if (entry.existingFileStatus === 'valid') {
    assert.ok(statSync(resolve(root, entry.intendedOutputPath)).size >= 4096, `${entry.intendedOutputPath} is nonempty and readable`);
  }
}

const synthesisOverrides = entries.filter(entry => entry.synthesisText !== entry.canonicalText);
assert.equal(new Set(synthesisOverrides.map(entry => entry.audioKey)).size, 8, 'exactly eight clips have synthesis-only pronunciation overrides');
const egyptianNo = synthesisOverrides.find(entry => entry.audioKey === '8dfe6db4ba08bbd7ec65');
assert.ok(egyptianNo);
assert.equal(egyptianNo.audioKey, '8dfe6db4ba08bbd7ec65');
assert.equal(egyptianNo.canonicalText, 'لأ');
assert.equal(egyptianNo.exactArabicSourceText, 'لأ');
assert.equal(egyptianNo.pronunciationTarget, 'لأ');
assert.equal(egyptianNo.synthesisText, 'لَأ.');
assert.equal(egyptianNo.intendedOutputPath, 'assets/audio/v2/egyptian/8dfe6db4ba08bbd7ec65.mp3');
const egyptianBeforeLeaving = synthesisOverrides.find(entry => entry.audioKey === '15c3f23e452480d0d1b2');
assert.ok(egyptianBeforeLeaving);
assert.equal(egyptianBeforeLeaving.canonicalText, 'قبل ما أطلع');
assert.equal(egyptianBeforeLeaving.exactArabicSourceText, 'قبل ما أطلع');
assert.equal(egyptianBeforeLeaving.pronunciationTarget, 'قبل ما أطلع');
assert.equal(egyptianBeforeLeaving.synthesisText, 'أَبْل ما أطلع.');
assert.equal(egyptianBeforeLeaving.audioKey, unit1_2AudioKey('egyptian', normalizeUnit1_2AudioText('قبل ما أطلع')));
assert.equal(egyptianBeforeLeaving.intendedOutputPath, 'assets/audio/v2/egyptian/15c3f23e452480d0d1b2.mp3');
assert.deepEqual(UNIT1_2_AUDIO_SYNTHESIS_OVERRIDES, {
  '8dfe6db4ba08bbd7ec65': 'لَأ.',
  '15c3f23e452480d0d1b2': 'أَبْل ما أطلع.',
  '76ab2cccbedb732b53e6': 'هِنا',
  '2f9b9c9048b46e25b695': 'إنتَ منين؟',
  'ec5b028e9bdaf366d621': 'بُنِّيّ',
  'ff4c737c7b03902be911': 'بخير. شكراً.',
  '82a5b0d6131c4fc3ad2a': 'ضَعْ',
  '2b387d2090ccd02400c4': 'سُتْرَتِي',
});
for (const [audioKey, canonicalText, synthesisText] of [
  ['76ab2cccbedb732b53e6', 'هنا', 'هِنا'],
  ['2f9b9c9048b46e25b695', 'إنت منين؟', 'إنتَ منين؟'],
] as const) {
  const entry = synthesisOverrides.find(candidate => candidate.audioKey === audioKey);
  assert.ok(entry);
  assert.equal(entry.canonicalText, canonicalText);
  assert.equal(entry.exactArabicSourceText, canonicalText);
  assert.equal(entry.pronunciationTarget, canonicalText);
  assert.equal(entry.synthesisText, synthesisText);
  assert.equal(entry.audioKey, unit1_2AudioKey('egyptian', normalizeUnit1_2AudioText(canonicalText)));
}

const msaOverrides = [
  ['ec5b028e9bdaf366d621', 'بني', 'بُنِّيّ'],
  ['ff4c737c7b03902be911', 'بخير، شكراً', 'بخير. شكراً.'],
  ['82a5b0d6131c4fc3ad2a', 'ضع', 'ضَعْ'],
  ['2b387d2090ccd02400c4', 'سترتي', 'سُتْرَتِي'],
] as const;
assert.deepEqual(MSA_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS, msaOverrides.map(([audioKey]) => audioKey));
assert.equal(new Set(MSA_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS).size, 4, 'MSA boundary-safe keys are unique');
for (const [audioKey, canonicalText, synthesisText] of msaOverrides) {
  const sources = entries.filter(entry => entry.audioKey === audioKey && entry.reuseSource === null);
  assert.equal(sources.length, 1, `MSA override ${audioKey} has one generation source`);
  const entry = sources[0];
  assert.equal(entry.dialect, 'msa');
  assert.equal(entry.canonicalText, canonicalText);
  assert.equal(entry.exactArabicSourceText, canonicalText);
  assert.equal(entry.pronunciationTarget, canonicalText);
  assert.equal(entry.synthesisText, synthesisText);
  assert.equal(entry.audioKey, unit1_2AudioKey('msa', normalizeUnit1_2AudioText(canonicalText)));
  assert.equal(entry.intendedOutputPath, `assets/audio/v2/msa/${audioKey}.mp3`);
}
assert.equal(
  MSA_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS.some(key => EGYPTIAN_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS.includes(key as never)),
  false,
  'boundary-safe keys cannot collide across dialects',
);

assert.equal(EGYPTIAN_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS.length, 38);
assert.equal(new Set(EGYPTIAN_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS).size, 38, 'boundary-safe keys are unique');
for (const audioKey of EGYPTIAN_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS) {
  const sources = entries.filter(entry => entry.audioKey === audioKey && entry.reuseSource === null);
  assert.equal(sources.length, 1, `boundary key ${audioKey} has one generation source`);
  assert.equal(sources[0].dialect, 'egyptian');
  assert.equal(sources[0].model, 'eleven_v3');
}

assert.equal(
  entries.filter(entry => entry.dialect === 'egyptian').every(entry => entry.voiceId === 'LXrTqFIgiubkrMkwvOUr'),
  true,
  'all Egyptian entries use the approved Egyptian voice',
);

const identityGroups = new Map<string, Unit1_2AudioManifestEntry[]>();
for (const entry of entries) {
  const identity = [entry.dialect, entry.normalizedText, entry.voiceId, entry.model, JSON.stringify(entry.voiceSettings), entry.outputFormat].join('\u0000');
  identityGroups.set(identity, [...(identityGroups.get(identity) ?? []), entry]);
}
for (const group of identityGroups.values()) {
  assert.equal(new Set(group.map(entry => entry.audioKey)).size, 1, 'same-dialect duplicates share one key');
  assert.equal(group[0].reuseSource, null, 'first duplicate is the generation source');
  for (const duplicate of group.slice(1)) assert.equal(duplicate.reuseSource, group[0].referenceId);
}

const textGroups = new Map<string, Unit1_2AudioManifestEntry[]>();
for (const entry of entries) textGroups.set(entry.normalizedText, [...(textGroups.get(entry.normalizedText) ?? []), entry]);
for (const group of textGroups.values()) {
  if (new Set(group.map(entry => entry.dialect)).size < 2) continue;
  for (const dialect of ['msa', 'gulf', 'egyptian'] as const) {
    const dialectEntries = group.filter(entry => entry.dialect === dialect);
    if (!dialectEntries.length) continue;
    const foreignKeys = new Set(group.filter(entry => entry.dialect !== dialect).map(entry => entry.audioKey));
    assert.equal(dialectEntries.some(entry => foreignKeys.has(entry.audioKey)), false, 'cross-dialect text is never deduplicated');
  }
}

const pathToKey = new Map<string, string>();
for (const entry of entries) {
  const priorKey = pathToKey.get(entry.intendedOutputPath);
  if (priorKey) assert.equal(priorKey, entry.audioKey, 'an output path never aliases another key');
  pathToKey.set(entry.intendedOutputPath, entry.audioKey);
}
assert.equal(pathToKey.size, new Set(entries.map(entry => entry.audioKey)).size, 'unique clips have unique output paths');

const serialized = JSON.stringify(entries);
assert.doesNotMatch(serialized, /ELEVENLABS_API_KEY|SUPABASE_SERVICE_ROLE|OPENAI_API_KEY|xi-api-key/i);

const ttsSource = readFileSync(resolve(root, 'utils/tts.ts'), 'utf8');
const edgeSource = readFileSync(resolve(root, 'supabase/functions/generate-speech/index.ts'), 'utf8');
const generatorSource = readFileSync(resolve(root, 'scripts/generate-unit1-2-audio.ts'), 'utf8');
for (const [dialect, voice] of Object.entries(UNIT1_2_AUDIO_VOICE_CONFIG)) {
  assert.ok(ttsSource.includes(voice.voiceId), `${dialect} voice agrees with client playback configuration`);
  assert.ok(edgeSource.includes(voice.voiceId), `${dialect} voice agrees with Edge Function configuration`);
  assert.ok(edgeSource.includes(voice.model), `${dialect} model agrees with Edge Function configuration`);
}

for (const requiredGeneratorBehavior of [
  '--dry-run', '--dialect', '--unit', '--mission', '--audio-key', '--retry-failed', '--force', '--report',
  'skipped_valid', 'FatalProviderError', 'output_format=', '.tmp-', 'renameSync', 'MIN_VALID_AUDIO_BYTES', 'ffprobe',
  '--egyptian-boundary-pilot', '--pilot-audio-keys', "providerText, 'ar'", '[short pause]',
  '--egyptian-boundary-risk', 'EGYPTIAN_UNIT1_2_BOUNDARY_SAFE_AUDIO_KEYS', 'input.providerText',
  'pilotAudioKeys.length !== 6', "entry.dialect !== 'egyptian'", "entry.model !== 'eleven_v3'",
]) {
  assert.ok(generatorSource.includes(requiredGeneratorBehavior), `generator includes ${requiredGeneratorBehavior}`);
}
assert.doesNotMatch(generatorSource, /console\.(?:log|error)\([^\n]*apiKey/si, 'generator never logs the API key');
assert.ok(generatorSource.includes('providerText = entry.synthesisText'), 'future forced generation defaults to synthesisText');
assert.ok(generatorSource.includes('text: providerText'), 'provider request uses the selected synthesis text');
assert.ok(generatorSource.includes('`[short pause] ${entry.synthesisText} [short pause]`'), 'boundary wrapping is applied after synthesis overrides');
assert.ok(generatorSource.includes('synthesize(entry, apiKey, input.providerText)'), 'boundary generation omits language_code');

const summary = summarizeUnit1_2AudioManifest(entries);
console.log('Unit 1/2 audio manifest audit passed.');
console.log(JSON.stringify(summary, null, 2));
