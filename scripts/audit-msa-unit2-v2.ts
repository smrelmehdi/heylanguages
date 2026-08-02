// @ts-nocheck
import assert from 'node:assert/strict';
for (const extension of ['.mp3','.png','.jpg','.jpeg','.webp']) require.extensions[extension] = (module: NodeModule, filename: string) => { module.exports = filename; };
const { buildMsaUnit2CurriculumUnit, resolveMsaUnit2CurriculumVersion } = require('../data/curriculum/msa');
const { getDialectContent } = require('../data/content-registry');
const { resolveCurriculumItem } = require('../utils/content-resolver');
const { buildMsaUnit2BigReviewQuestions, buildMsaUnit2ChallengeQuestions } = require('../data/msa-unit2-quizzes');
const { getQuizPassedAtThreshold } = require('../utils/quiz-scoring');

const ids = ['around_the_home','where_are_my_things','simple_actions_at_home','getting_dressed','today_now_later','ready_or_missing','what_do_you_like','helping_at_home','leaving_and_coming_back','put_the_steps_together','big_review','getting_ready_with_yusuf','first_short_sentence_challenge'];
const unit = buildMsaUnit2CurriculumUnit('v2');
assert.equal(unit.title, 'Build Short Sentences');
assert.equal(unit.subtitle, 'Combine words for everyday life at home.');
assert.deepEqual(unit.items.map(item => item.missionId), ids);
assert.equal(new Set(ids).size, 13);
const content = getDialectContent('msa');
const resolved = unit.items.map((item: any) => resolveCurriculumItem(item, content));
assert.ok(resolved.every(Boolean), 'Every v2 mission must resolve');
resolved.slice(0, 10).forEach((entry: any, index: number) => {
  assert.equal(entry!.lessonWords?.length, 24, `${ids[index]} must contain 24 items`);
  assert.equal(entry!.missionContent?.audioMode, 'none');
  assert.equal(entry!.missionContent?.pronunciationEnabled, true);
  const triples = entry!.lessonWords!.map((word: any) => `${word.displayArabic ?? word.arabic}|${word.transliteration}|${word.english}`);
  if (ids[index] !== 'put_the_steps_together') assert.equal(new Set(triples).size, triples.length, `${ids[index]} has duplicate triples`);
  entry!.lessonWords!.forEach((word: any) => { assert.ok(word.arabic && word.transliteration && word.english); assert.equal(word.evalTarget, word.displayArabic); });
});
const review = buildMsaUnit2BigReviewQuestions('audit-review');
const challenge = buildMsaUnit2ChallengeQuestions('audit-challenge');
assert.equal(review.length, 24);
assert.equal(resolved[11]!.dialogue?.length, 24);
assert.equal(challenge.length, 20);
assert.deepEqual([...new Set(challenge.map(question => question.category))].sort(), ['best_reply','mini_situation','mixed_situation','phrase_arrangement','translation']);
for (const category of ['best_reply','mini_situation','mixed_situation','phrase_arrangement','translation']) assert.equal(challenge.filter(question => question.category === category).length, 4);
assert.equal(resolved[10]!.missionContent?.audioMode, 'none');
assert.equal(resolved[11]!.missionContent?.audioMode, 'none');
assert.equal(resolved[12]!.missionContent?.audioMode, 'none');
assert.equal(resolved[12]!.missionContent?.passingScore, 16);
assert.equal(getQuizPassedAtThreshold(15, 20, 16), false);
assert.equal(getQuizPassedAtThreshold(16, 20, 16), true);
assert.ok(challenge.every(question => question.format !== 'listening' && question.format !== 'scene_replay'));
assert.equal(review.some(question => challenge.some(other => other.id === question.id)), false);
assert.equal(new Set(review.map(question => question.id)).size, 24);
assert.equal(new Set(challenge.map(question => question.id)).size, 20);
assert.ok(review.every(question => !question.hideTransliterationBeforeAnswer));
assert.ok(challenge.every(question => question.hideTransliterationBeforeAnswer));
assert.equal(resolveMsaUnit2CurriculumVersion({ requestedVersion: 'v2', appEnv: 'production', isLocalDevelopment: true }), 'legacy');
assert.equal(resolveMsaUnit2CurriculumVersion({ requestedVersion: 'v2', appEnv: 'preview' }), 'v2');
assert.equal(buildMsaUnit2CurriculumUnit('legacy').items.filter(item => item.contentType === 'scenario').length, 10);
for (const bank of [review, challenge]) { const optionPositions = bank.filter(question => 'options' in question).map(question => question.options.findIndex(option => option.isCorrect)); let streak = 1; for (let index=1; index<optionPositions.length; index += 1) { streak = optionPositions[index] === optionPositions[index-1] ? streak + 1 : 1; assert.ok(streak <= 2); } }
for (const question of [...review, ...challenge]) if ('options' in question) { assert.equal(question.options.filter(option => option.isCorrect).length, 1); const labels = question.options.map(option => 'arabic' in option ? option.arabic : option.meaning); assert.equal(new Set(labels).size, labels.length); }
console.log('MSA Unit 2 v2 audit passed: 13 missions, 240 lesson items, 24 review questions, 24 dialogue turns, 20 challenge questions.');
