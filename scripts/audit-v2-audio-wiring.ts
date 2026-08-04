import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';

import { buildUnit1_2AudioManifest, UNIT1_2_AUDIO_UNIT_SOURCES } from './lib/unit1-2-audio-plan';
import { renderUnit1_2AudioRegistry } from './generate-unit1-2-audio-registry';

const nodeRequire = createRequire(import.meta.url);
for (const extension of ['.mp3', '.webp', '.png', '.jpg', '.jpeg']) {
  nodeRequire.extensions[extension] = (module, filename) => {
    module.exports = filename;
  };
}

async function main() {
  const [{ V2_AUDIO_REFERENCE_KEYS, V2_AUDIO_REGISTRY }, { getDialectContent }, { getV2AudioModule, withV2MissionAudio }] = await Promise.all([
    import('../constants/audio-v2-registry'),
    import('../data/content-registry'),
    import('../utils/v2-audio'),
  ]);

const manifest = buildUnit1_2AudioManifest();
const unique = manifest.filter(entry => entry.reuseSource === null);
assert.equal(unique.length, 1397, 'exactly 1,397 unique v2 modules');
assert.deepEqual(
  Object.fromEntries(['msa', 'gulf', 'egyptian'].map(dialect => [dialect, unique.filter(entry => entry.dialect === dialect).length])),
  { msa: 462, gulf: 469, egyptian: 466 },
);

const registrySource = readFileSync('constants/audio-v2-registry.ts', 'utf8');
assert.equal((registrySource.match(/require\('\.\.\/assets\/audio\/v2\//g) ?? []).length, 1397, 'one static require per unique clip');
assert.doesNotMatch(registrySource, /require\([^'"`]/, 'no dynamic require calls');
assert.equal(renderUnit1_2AudioRegistry(), renderUnit1_2AudioRegistry(), 'registry render is deterministic across runs');
assert.equal(registrySource, renderUnit1_2AudioRegistry(), 'checked-in registry is current');

const allKeys = Object.values(V2_AUDIO_REGISTRY).flatMap(entries => Object.keys(entries));
assert.equal(new Set(allKeys).size, 1397, 'registry audio keys are globally unique');
assert.equal(Object.keys(V2_AUDIO_REFERENCE_KEYS).length, manifest.length, 'every reference has a generated key mapping');
assert.equal(getV2AudioModule('msa', 'gulf:u1:first_arabic_words:lesson:1'), null, 'wrong-dialect lookup fails closed');
assert.equal(getV2AudioModule('msa', 'msa:u2:missing:lesson:1'), null, 'missing lookup fails closed');
const egyptianNoReference = 'egyptian:u1:first_arabic_words:lesson:4';
const egyptianNoEntry = manifest.find(entry => entry.referenceId === egyptianNoReference);
assert.ok(egyptianNoEntry);
assert.equal(egyptianNoEntry.audioKey, '8dfe6db4ba08bbd7ec65', 'synthesis override does not change the audio key');
assert.equal(egyptianNoEntry.canonicalText, 'لأ', 'synthesis override does not change canonical text');
assert.equal(egyptianNoEntry.synthesisText, 'لَأ.');
assert.equal(V2_AUDIO_REFERENCE_KEYS[egyptianNoReference], '8dfe6db4ba08bbd7ec65', 'registry mapping remains unchanged');
assert.equal(getDialectContent('egyptian').missions.first_arabic_words.lessonWords?.[3].displayArabic, 'لأ');
const egyptianBeforeLeavingReference = 'egyptian:u2:put_the_steps_together:lesson:4';
const egyptianBeforeLeavingEntry = manifest.find(entry => entry.referenceId === egyptianBeforeLeavingReference);
assert.ok(egyptianBeforeLeavingEntry);
assert.equal(egyptianBeforeLeavingEntry.audioKey, '15c3f23e452480d0d1b2', 'second synthesis override does not change the audio key');
assert.equal(egyptianBeforeLeavingEntry.canonicalText, 'قبل ما أطلع');
assert.equal(egyptianBeforeLeavingEntry.pronunciationTarget, 'قبل ما أطلع');
assert.equal(egyptianBeforeLeavingEntry.synthesisText, 'أَبْل ما أطلع.');
assert.equal(V2_AUDIO_REFERENCE_KEYS[egyptianBeforeLeavingReference], '15c3f23e452480d0d1b2', 'second registry mapping remains unchanged');
assert.equal(getDialectContent('egyptian').missions['unit2:put_the_steps_together'].lessonWords?.[3].displayArabic, 'قبل ما أطلع');
for (const [audioKey, canonicalText, synthesisText] of [
  ['ec5b028e9bdaf366d621', 'بني', 'بُنِّيّ'],
  ['ff4c737c7b03902be911', 'بخير، شكراً', 'بخير. شكراً.'],
  ['82a5b0d6131c4fc3ad2a', 'ضع', 'ضَعْ'],
  ['2b387d2090ccd02400c4', 'سترتي', 'سُتْرَتِي'],
] as const) {
  const entry = manifest.find(candidate => candidate.audioKey === audioKey && candidate.reuseSource === null);
  assert.ok(entry);
  assert.equal(entry.dialect, 'msa');
  assert.equal(entry.canonicalText, canonicalText);
  assert.equal(entry.pronunciationTarget, canonicalText);
  assert.equal(entry.synthesisText, synthesisText);
  assert.equal(entry.intendedOutputPath, `assets/audio/v2/msa/${audioKey}.mp3`);
  assert.equal(V2_AUDIO_REFERENCE_KEYS[entry.referenceId], audioKey, `MSA override ${audioKey} keeps its registry mapping`);
  assert.equal(V2_AUDIO_REGISTRY.msa[audioKey], getV2AudioModule('msa', entry.referenceId));
}
assert.doesNotMatch(registrySource, /assets\/audio\/(?!v2\/)/, 'v2 registry cannot collide with legacy paths');
assert.doesNotMatch(readFileSync('constants/audio-manifest.ts', 'utf8'), /assets\/audio\/v2\//, 'legacy registry cannot contain v2 paths');

const duplicateReference = manifest.find(entry => entry.reuseSource !== null);
assert.ok(duplicateReference, 'manifest contains a duplicate reference');
assert.equal(
  getV2AudioModule(duplicateReference.dialect, duplicateReference.referenceId),
  V2_AUDIO_REGISTRY[duplicateReference.dialect][duplicateReference.audioKey],
  'duplicate references reuse the same module within a dialect',
);

const missingCoverageMission = UNIT1_2_AUDIO_UNIT_SOURCES[0].missions[0];
const missingCoverageReference = `msa:u1:${missingCoverageMission.missionId}:lesson:1`;
const mutableReferenceKeys = V2_AUDIO_REFERENCE_KEYS as Record<string, string>;
const savedMissingCoverageKey = mutableReferenceKeys[missingCoverageReference];
delete mutableReferenceKeys[missingCoverageReference];
assert.equal(withV2MissionAudio('msa', 1, missingCoverageMission).audioMode, 'none', 'incomplete mission coverage fails closed');
mutableReferenceKeys[missingCoverageReference] = savedMissingCoverageKey;

for (const source of UNIT1_2_AUDIO_UNIT_SOURCES) {
  const content = getDialectContent(source.dialect);
  for (const canonicalMission of source.missions) {
    const registryKey = source.unitNumber === 1
      ? canonicalMission.missionId
      : `unit2:${canonicalMission.missionId}`;
    const resolved = content.missions[registryKey];
    assert.ok(resolved, `${source.dialect} u${source.unitNumber} ${canonicalMission.missionId} resolves`);
    assert.equal(resolved.missionId, canonicalMission.missionId);

    if (canonicalMission.missionKind === 'lesson') {
      assert.equal(resolved.audioMode, 'default', `${registryKey} enables complete local playback`);
      assert.equal(resolved.lessonWords?.length, canonicalMission.lessonWords?.length);
      resolved.lessonWords?.forEach((word, index) => {
        const canonical = canonicalMission.lessonWords![index];
        assert.equal(word.arabic, canonical.arabic, 'canonical Arabic unchanged');
        assert.equal(word.displayArabic, canonical.displayArabic, 'display Arabic unchanged');
        assert.equal(word.audioText, canonical.audioText, 'audio text unchanged');
        assert.equal(word.evalTarget, canonical.evalTarget, 'pronunciation target unchanged');
        assert.notEqual(word.audio, null, 'lesson reference resolves a module');
        const referenceId = `${source.dialect}:u${source.unitNumber}:${canonicalMission.missionId}:lesson:${index + 1}`;
        assert.equal(word.audio, getV2AudioModule(source.dialect, referenceId));
      });
    } else if (canonicalMission.missionKind === 'guided_dialogue') {
      assert.equal(resolved.audioMode, 'default', `${registryKey} enables complete dialogue playback`);
      assert.equal(resolved.dialogue?.length, canonicalMission.dialogue?.length);
      resolved.dialogue?.forEach((turn, index) => {
        const canonical = canonicalMission.dialogue![index];
        assert.equal(turn.arabic, canonical.arabic, 'dialogue Arabic unchanged');
        assert.equal(turn.displayArabic, canonical.displayArabic, 'dialogue display Arabic unchanged');
        assert.equal(turn.evalTarget, canonical.evalTarget, 'dialogue evaluation target unchanged');
        const referenceId = `${source.dialect}:u${source.unitNumber}:${canonicalMission.missionId}:turn:${index + 1}`;
        assert.equal(turn.audio, getV2AudioModule(source.dialect, referenceId));
      });
    } else if (canonicalMission.missionKind === 'review' || canonicalMission.missionKind === 'challenge') {
      assert.equal(resolved.audioMode, 'none', `${registryKey} remains text-only`);
      assert.equal(resolved.quizQuestions, canonicalMission.quizQuestions, 'text-only quiz bank is not decorated');
    }
  }
}

for (const entry of unique) {
  assert.ok(existsSync(entry.intendedOutputPath), `${entry.intendedOutputPath} exists`);
  assert.equal(V2_AUDIO_REFERENCE_KEYS[entry.referenceId], entry.audioKey);
  assert.ok(V2_AUDIO_REGISTRY[entry.dialect][entry.audioKey] != null, `${entry.dialect} ${entry.audioKey} resolves`);
  for (const otherDialect of ['msa', 'gulf', 'egyptian'] as const) {
    if (otherDialect !== entry.dialect) {
      assert.equal(V2_AUDIO_REGISTRY[otherDialect][entry.audioKey], undefined, 'no cross-dialect registry collision');
    }
  }
}

  console.log('Unit 1/2 v2 audio wiring audit passed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
