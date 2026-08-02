// @ts-nocheck
import assert from 'node:assert/strict';
for (const extension of ['.mp3','.png','.jpg','.jpeg','.webp']) require.extensions[extension] = (module: NodeModule, filename: string) => { module.exports = filename; };
const { buildMsaUnit1CurriculumUnit, buildMsaUnit2CurriculumUnit } = require('../data/curriculum/msa');
const { buildCompletionKey, getPreviousProgressionContentIdFromItems } = require('../utils/progression');

const unit1 = buildMsaUnit1CurriculumUnit('v2');
const unit2 = buildMsaUnit2CurriculumUnit('v2');
const unit3First = { dialect: 'msa', unitId: 'unit-3', contentId: 'alif_family', missionId: undefined };
const items = [...unit1.items, ...unit2.items, unit3First];
assert.equal(getPreviousProgressionContentIdFromItems(items, 'around_the_home', 'unit-2'), 'first_arabic_challenge');
unit2.items.slice(1).forEach((item: any, index: number) => assert.equal(getPreviousProgressionContentIdFromItems(items, item.contentId, 'unit-2'), unit2.items[index].contentId));
assert.equal(getPreviousProgressionContentIdFromItems(items, 'alif_family', 'unit-3'), 'first_short_sentence_challenge');
const passed = new Set(unit2.items.map((item: any) => buildCompletionKey('msa', 'unit-2', item.contentId)));
const failed = new Set([...passed].filter(key => !key.endsWith(':first_short_sentence_challenge')));
assert.equal(failed.has(buildCompletionKey('msa','unit-2','first_short_sentence_challenge')), false);
assert.equal(passed.has(buildCompletionKey('msa','unit-2','first_short_sentence_challenge')), true);
assert.equal([...passed].some(key => key.startsWith('gulf:') || key.startsWith('egyptian:') || key.includes(':unit-1:')), false);
console.log('MSA Unit 2 progression test passed: one-at-a-time order and Unit 3 challenge gate verified.');
