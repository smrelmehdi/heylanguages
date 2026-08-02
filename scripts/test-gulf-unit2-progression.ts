// @ts-nocheck
import assert from 'node:assert/strict';
for(const extension of ['.mp3','.png','.jpg','.jpeg','.webp'])require.extensions[extension]=(module:NodeModule,filename:string)=>{module.exports=filename;};
const {buildGulfUnit1CurriculumUnit,buildGulfUnit2CurriculumUnit}=require('../data/curriculum/gulf');const {buildCompletionKey,getPreviousProgressionContentIdFromItems}=require('../utils/progression');
const unit1=buildGulfUnit1CurriculumUnit('v2');const unit2=buildGulfUnit2CurriculumUnit('v2');const unit3={dialect:'gulf',unitId:'unit-3',contentId:'alif_family'};const items=[...unit1.items,...unit2.items,unit3];
assert.equal(getPreviousProgressionContentIdFromItems(items,'around_the_home','unit-2'),'first_arabic_challenge');unit2.items.slice(1).forEach((item,index)=>assert.equal(getPreviousProgressionContentIdFromItems(items,item.contentId,'unit-2'),unit2.items[index].contentId));assert.equal(getPreviousProgressionContentIdFromItems(items,'alif_family','unit-3'),'first_short_sentence_challenge');
const passKey=buildCompletionKey('gulf','unit-2','first_short_sentence_challenge');const failed=new Set(unit2.items.slice(0,-1).map(item=>buildCompletionKey('gulf','unit-2',item.contentId)));const passed=new Set([...failed,passKey]);assert.equal(failed.has(passKey),false);assert.equal(passed.has(passKey),true);assert.ok([...passed].every(key=>key.startsWith('gulf:unit-2:')));
console.log('Gulf Unit 2 progression test passed: one-at-a-time order and Unit 3 challenge gate verified.');
