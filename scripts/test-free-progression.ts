import assert from 'node:assert/strict';
import Module from 'node:module';

const extensions = (Module as typeof Module & { _extensions: Record<string, (module: { exports: unknown }) => void> })._extensions;
for (const extension of ['.mp3', '.png', '.jpg', '.jpeg']) {
  extensions[extension] = module => {
    module.exports = 1;
  };
}

const { getContentAccess } = require('../utils/access') as typeof import('../utils/access');
const { getDialectProgressionItems } = require('../utils/content-resolver') as typeof import('../utils/content-resolver');
const {
  buildCompletionKey,
  isFirstContentCompletion,
} = require('../utils/progression') as typeof import('../utils/progression');
const { getQuizPassed } = require('../utils/quiz-scoring') as typeof import('../utils/quiz-scoring');

const dialect = 'gulf';
const items = getDialectProgressionItems(dialect);
const [lesson1, lesson2] = items;

assert.equal(lesson1.contentId, 'basic_words');
assert.equal(lesson2.contentId, 'greetings');

const access = (
  item: (typeof items)[number],
  completedContentIds: Iterable<string>,
  options: { isPremium?: boolean; isTestingUnlocked?: boolean } = {},
) => getContentAccess({
  contentId: item.contentId,
  unitId: item.unitId,
  contentType: item.contentType,
  dialect,
  isPremium: options.isPremium ?? false,
  isTestingUnlocked: options.isTestingUnlocked ?? false,
  completedContentIds,
});

assert.deepEqual(access(lesson1, []), { allowed: true, reason: 'free' });
assert.equal(access(lesson2, []).reason, 'previous_incomplete');

const lesson1Key = buildCompletionKey(dialect, lesson1.unitId, lesson1.contentId);
assert.deepEqual(access(lesson2, [lesson1Key]), { allowed: true, reason: 'free' });
assert.deepEqual(access(lesson2, ['basic_words']), { allowed: true, reason: 'free' });

const egyptianItems = getDialectProgressionItems('egyptian');
const egyptianLesson2 = egyptianItems[1];
assert.equal(getContentAccess({
  contentId: egyptianLesson2.contentId,
  unitId: egyptianLesson2.unitId,
  contentType: egyptianLesson2.contentType,
  dialect: 'egyptian',
  isPremium: false,
  isTestingUnlocked: false,
  completedContentIds: ['basic_words'],
}).reason, 'previous_incomplete');

const persistedProgress = JSON.parse(JSON.stringify({ [lesson1Key]: true })) as Record<string, boolean>;
assert.equal(access(lesson2, Object.keys(persistedProgress).filter(key => persistedProgress[key])).allowed, true);

const unit1Quiz = items.find(item => item.contentId === 'quiz_u1');
const firstUnit2Item = items.find(item => item.contentId === 'cafe');
assert.ok(unit1Quiz && firstUnit2Item);
const beforeQuiz = items
  .slice(0, items.indexOf(unit1Quiz))
  .map(item => buildCompletionKey(dialect, item.unitId, item.contentId));

assert.equal(getQuizPassed(2, 4), false);
assert.equal(access(firstUnit2Item, beforeQuiz).reason, 'previous_incomplete');
assert.equal(getQuizPassed(3, 4), true);
const passedQuizProgress = [
  ...beforeQuiz,
  buildCompletionKey(dialect, unit1Quiz.unitId, unit1Quiz.contentId),
];
assert.deepEqual(access(firstUnit2Item, passedQuizProgress), { allowed: true, reason: 'free' });

assert.equal(isFirstContentCompletion(dialect, lesson1.contentId, []), true);
assert.equal(isFirstContentCompletion(dialect, lesson1.contentId, [lesson1Key]), false);
assert.equal(isFirstContentCompletion(dialect, lesson1.contentId, ['basic_words']), false);
assert.equal(isFirstContentCompletion(dialect, lesson1.contentId, [lesson1Key]) ? 60 : 0, 0);

assert.equal(access(lesson2, [], { isPremium: true }).reason, 'previous_incomplete');
assert.deepEqual(access(lesson2, [], { isTestingUnlocked: true }), { allowed: true, reason: 'testing' });

const firstPremiumItem = items.find(item => item.commercialAccess === 'premium');
assert.ok(firstPremiumItem);
const premiumIndex = items.indexOf(firstPremiumItem);
const completedBeforePremium = items
  .slice(0, premiumIndex)
  .map(item => buildCompletionKey(dialect, item.unitId, item.contentId));
assert.equal(access(firstPremiumItem, completedBeforePremium).reason, 'premium_required');
assert.deepEqual(access(firstPremiumItem, completedBeforePremium, { isPremium: true }), {
  allowed: true,
  reason: 'premium',
});

console.log('Free progression regression tests passed.');
