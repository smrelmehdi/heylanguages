import assert from 'node:assert/strict';
import {
  AudioPlaybackLifecycle,
  createAudioPlaybackOwner,
} from '../utils/audio-lifecycle';

const lifecycle = new AudioPlaybackLifecycle();
const lesson = createAudioPlaybackOwner('lesson');
const scenario = createAudioPlaybackOwner('scenario');

const lessonToken = lifecycle.begin(lesson);
const scenarioToken = lifecycle.begin(scenario);
assert.equal(lifecycle.isCurrent(lessonToken), false, 'rapid replacement must stale the first request');
assert.equal(lifecycle.isCurrent(scenarioToken), true);

assert.equal(lifecycle.stop(lesson), false, 'stale screen cleanup must not stop newer audio');
assert.equal(lifecycle.isCurrent(scenarioToken), true);
assert.equal(lifecycle.stop(scenario), true);
assert.equal(lifecycle.isCurrent(scenarioToken), false);

for (let index = 0; index < 500; index += 1) {
  const token = lifecycle.begin(lesson);
  assert.equal(lifecycle.isCurrent(token), true);
  assert.equal(lifecycle.finish(token), true);
}

const failedToken = lifecycle.begin(lesson);
assert.equal(lifecycle.stop(lesson), true, 'playback error must invalidate the failed request');
const recoveryToken = lifecycle.begin(lesson);
assert.equal(lifecycle.isCurrent(failedToken), false);
assert.equal(lifecycle.isCurrent(recoveryToken), true, 'the next play must recover after an error');

const localToken = lifecycle.begin(lesson);
const runtimeTtsToken = lifecycle.begin(lesson);
const nextLocalToken = lifecycle.begin(lesson);
assert.equal(lifecycle.isCurrent(localToken), false);
assert.equal(lifecycle.isCurrent(runtimeTtsToken), false);
assert.equal(lifecycle.isCurrent(nextLocalToken), true);

assert.equal(lifecycle.stop(), true, 'dialect switch/background stop must invalidate any owner');
assert.equal(lifecycle.isCurrent(nextLocalToken), false);

console.log('Audio lifecycle regression tests passed.');
