// @ts-nocheck
import assert from 'node:assert/strict';
for (const extension of ['.mp3','.png','.jpg','.jpeg','.webp']) require.extensions[extension]=(module:NodeModule,filename:string)=>{module.exports=filename;};
process.env.EXPO_PUBLIC_APP_ENV='preview';process.env.EXPO_PUBLIC_GULF_UNIT1_CURRICULUM_VERSION='v2';process.env.EXPO_PUBLIC_GULF_UNIT2_CURRICULUM_VERSION='v2';
const {buildGulfUnit2CurriculumUnit,resolveGulfUnit2CurriculumVersion}=require('../data/curriculum/gulf');
const {buildGulfUnit1CurriculumUnit}=require('../data/curriculum/gulf');
const {buildMsaUnit2CurriculumUnit}=require('../data/curriculum/msa');
const {getDialectContent}=require('../data/content-registry');
const {resolveCurriculumItem,getDialectContentMeta}=require('../utils/content-resolver');
const {buildGulfUnit2BigReviewQuestions,buildGulfUnit2ChallengeQuestions}=require('../data/gulf-unit2-quizzes');
const {getQuizPassedAtThreshold}=require('../utils/quiz-scoring');
const ids=['around_the_home','where_are_my_things','simple_actions_at_home','getting_dressed','today_now_later','ready_or_missing','what_do_you_like','helping_at_home','leaving_and_coming_back','put_the_steps_together','big_review','getting_ready_with_yusuf','first_short_sentence_challenge'];
const unit=buildGulfUnit2CurriculumUnit('v2'); const content=getDialectContent('gulf');
assert.equal(unit.title,'Build Short Sentences'); assert.equal(unit.subtitle,'Combine words for everyday life at home.'); assert.deepEqual(unit.items.map(item=>item.missionId),ids); assert.equal(new Set(ids).size,13);
const resolved=unit.items.map(item=>resolveCurriculumItem(item,content)); assert.ok(resolved.every(Boolean));
resolved.slice(0,10).forEach((entry,index)=>{assert.equal(entry.lessonWords.length,24);assert.equal(entry.missionContent.audioMode,'none');assert.equal(entry.missionContent.pronunciationEnabled,true);entry.lessonWords.forEach(word=>{assert.ok(word.arabic&&word.transliteration&&word.english);assert.equal(word.evalTarget,word.displayArabic);});});
resolved.slice(10).forEach(entry=>{assert.equal(entry.missionContent.audioMode,'none');assert.notEqual(entry.missionContent.pronunciationEnabled,true);});
const review=buildGulfUnit2BigReviewQuestions('audit-review'); const challenge=buildGulfUnit2ChallengeQuestions('audit-challenge');
assert.equal(review.length,24);assert.equal(resolved[11].dialogue.length,24);assert.equal(challenge.length,20);assert.ok(challenge.every(question=>question.format!=='listening'&&question.format!=='scene_replay'));
for(const category of ['mini_situation','best_reply','phrase_arrangement','translation','mixed_situation'])assert.equal(challenge.filter(question=>question.category===category).length,4);
assert.equal(getQuizPassedAtThreshold(15,20,16),false);assert.equal(getQuizPassedAtThreshold(16,20,16),true);assert.equal(resolved[12].missionContent.passingScore,16);
for(const bank of [review,challenge]){const positions=bank.filter(question=>'options'in question).map(question=>question.options.findIndex(option=>option.isCorrect));let streak=1;for(let index=1;index<positions.length;index++){streak=positions[index]===positions[index-1]?streak+1:1;assert.ok(streak<=2);}for(const question of bank)if('options'in question){assert.equal(question.options.filter(option=>option.isCorrect).length,1);const labels=question.options.map(option=>'arabic'in option?option.arabic:option.meaning);assert.equal(new Set(labels).size,labels.length);}}
const words=resolved.slice(0,10).flatMap(entry=>entry.lessonWords);assert.ok(words.some(word=>word.arabic==='جدام'&&word.transliteration==='jidaam'));assert.ok(words.some(word=>word.arabic==='هذا لايق عليك'));assert.ok(words.filter(word=>word.arabic.includes('جزمة')).every(word=>!word.transliteration.includes('gizma')));
const gulfU1=buildGulfUnit1CurriculumUnit('v2');assert.equal(getDialectContentMeta('gulf','big_review','quiz','unit-1').unitId,'unit-1');assert.equal(getDialectContentMeta('gulf','big_review','quiz','unit-2').unitId,'unit-2');assert.notEqual(resolveCurriculumItem(gulfU1.items.find(item=>item.missionId==='big_review'),content).missionContent, resolved[10].missionContent);
assert.equal(buildGulfUnit2CurriculumUnit('legacy').items.filter(item=>item.contentType==='scenario').length,8);assert.equal(resolveGulfUnit2CurriculumVersion({requestedVersion:'v2',appEnv:'production',isLocalDevelopment:true}),'legacy');assert.equal(resolveGulfUnit2CurriculumVersion({requestedVersion:'v2',appEnv:'preview'}),'v2');
const msaFirst=resolveCurriculumItem(buildMsaUnit2CurriculumUnit('v2').items[0],getDialectContent('msa')).lessonWords[0];assert.equal(msaFirst.arabic,'البيت');assert.equal(msaFirst.transliteration,'al-bayt');assert.notEqual(msaFirst.transliteration,resolved[0].lessonWords[0].transliteration);assert.equal(getDialectContent('egyptian').missions['unit2:around_the_home'],undefined);
console.log('Gulf Unit 2 v2 audit passed: 13 missions, 240 lesson items, 24 review questions, 24 dialogue turns, 20 challenge questions.');
