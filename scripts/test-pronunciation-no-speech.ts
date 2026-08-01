import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  classifyUnusableSpeech,
  isKnownSpeechHallucination,
  NO_SPEECH_FEEDBACK,
  normalizePronunciationTranscript,
} from '../utils/pronunciation-validation';

const root = path.resolve(__dirname, '..');

assert.equal(classifyUnusableSpeech('', 'هلا'), 'no_speech');
assert.equal(classifyUnusableSpeech('   ', 'هلا'), 'no_speech');
assert.equal(classifyUnusableSpeech('ضوضاء', 'هلا', { confidence: 0.05 }), 'unusable_audio');
assert.equal(classifyUnusableSpeech('كلام', 'هلا', { noSpeechProbability: 0.9 }), 'no_speech');
assert.equal(classifyUnusableSpeech('هلا', 'هلا', { durationSeconds: 0.1 }), 'unusable_audio');

for (const phrase of [
  'اشتركوا في القناة',
  'اشترك في القناة',
  'لا تنسوا الاشتراك في القناة',
  'شكراً على المشاهدة!',
  'ترجمة نانسي قنقر',
]) {
  assert.equal(isKnownSpeechHallucination(phrase), true, phrase);
  assert.equal(classifyUnusableSpeech(phrase, 'هلا'), 'no_speech', phrase);
}

for (const word of ['هيه', 'شو', 'هلا', 'زين']) {
  assert.equal(classifyUnusableSpeech(word, word, { confidence: 0.9, durationSeconds: 0.5 }), null, word);
}
for (const word of ['أيوه', 'إيه', 'لأ', 'كويس']) {
  assert.equal(classifyUnusableSpeech(word, word, { confidence: 0.9, durationSeconds: 0.5 }), null, word);
}
assert.equal(classifyUnusableSpeech('أريد قهوة من فضلك', 'اريد قهوة من فضلك', { confidence: 0.8 }), null);
assert.equal(normalizePronunciationTranscript('شكراً'), 'شكرا');
assert.equal(NO_SPEECH_FEEDBACK, "I couldn't hear you. Try again.");

const wrapper = fs.readFileSync(path.join(root, 'utils/pronunciation.ts'), 'utf8');
const lesson = fs.readFileSync(path.join(root, 'app/lesson.tsx'), 'utf8');
const scenario = fs.readFileSync(path.join(root, 'app/scenario.tsx'), 'utf8');
const onboarding = fs.readFileSync(path.join(root, 'app/index.tsx'), 'utf8');
const edge = fs.readFileSync(path.join(root, 'supabase/functions/evaluate-speech/index.ts'), 'utf8');

assert.match(wrapper, /return \{ result: unusable, feedback: NO_SPEECH_FEEDBACK \}/);
assert.match(lesson, /evalResult\.result === 'no_speech'/);
assert.match(scenario, /status === 'no_speech'/);
assert.match(onboarding, /setPronScore\(unusable \? null/);
assert.doesNotMatch(onboarding, /Play my recording/);
assert.match(edge, /response_format', 'verbose_json'/);
assert.match(edge, /classifyUnusableSpeech\(transcription\.text/);
assert.match(edge, /file\.size < 512/);
assert.match(edge, /feedback: NO_SPEECH_FEEDBACK/);

console.log('Pronunciation no-speech and hallucination checks passed.');
