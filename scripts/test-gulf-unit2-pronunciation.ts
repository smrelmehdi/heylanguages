// @ts-nocheck
import assert from 'node:assert/strict';
for(const extension of ['.mp3','.png','.jpg','.jpeg','.webp'])require.extensions[extension]=(module:NodeModule,filename:string)=>{module.exports=filename;};
process.env.EXPO_PUBLIC_APP_ENV='preview';process.env.EXPO_PUBLIC_GULF_UNIT2_CURRICULUM_VERSION='v2';
const {buildGulfUnit2CurriculumUnit}=require('../data/curriculum/gulf');const {getDialectContent}=require('../data/content-registry');const {resolveCurriculumItem}=require('../utils/content-resolver');
const unit=buildGulfUnit2CurriculumUnit('v2');const content=getDialectContent('gulf');
unit.items.forEach((item,index)=>{const mission=resolveCurriculumItem(item,content).missionContent;if(index<10){assert.equal(mission.audioMode,'none');assert.equal(mission.pronunciationEnabled,true);mission.lessonWords.forEach(word=>assert.equal(word.evalTarget,word.displayArabic));}else{assert.equal(mission.audioMode,'none');assert.notEqual(mission.pronunciationEnabled,true);}});
console.log('Gulf Unit 2 pronunciation capability test passed.');
