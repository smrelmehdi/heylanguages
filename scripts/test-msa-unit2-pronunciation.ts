import assert from 'node:assert/strict';
for (const extension of ['.mp3','.png','.jpg','.jpeg','.webp']) require.extensions[extension] = (module: NodeModule, filename: string) => { module.exports = filename; };
const { buildMsaUnit2CurriculumUnit } = require('../data/curriculum/msa');
const { getDialectContent } = require('../data/content-registry');
const { resolveCurriculumItem } = require('../utils/content-resolver');

const unit = buildMsaUnit2CurriculumUnit('v2');
const content = getDialectContent('msa');
unit.items.forEach((item: any, index: number) => {
  const mission = resolveCurriculumItem(item, content)?.missionContent;
  assert.ok(mission);
  if (index < 10) {
    assert.equal(mission.pronunciationEnabled, true);
    assert.equal(mission.audioMode, 'none');
    mission.lessonWords?.forEach((word: any) => assert.equal(word.evalTarget, word.displayArabic ?? word.arabic));
  } else {
    assert.notEqual(mission.pronunciationEnabled, true);
    assert.equal(mission.audioMode, 'none');
  }
});
console.log('MSA Unit 2 pronunciation capability test passed.');
