import assert from 'node:assert/strict';
import Module from 'node:module';

(globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ = true;
process.env.EXPO_PUBLIC_SUPABASE_URL ??= 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??= 'test-anon-key';
process.env.EXPO_PUBLIC_APP_ENV = 'development';
process.env.EXPO_PUBLIC_EGYPTIAN_UNIT1_CURRICULUM_VERSION = 'v2';
const extensions=(Module as typeof Module & {_extensions:Record<string,(module:{exports:unknown},filename:string)=>void>})._extensions;
for(const extension of ['.mp3','.png','.jpg','.jpeg','.webp']) extensions[extension]=(module,filename)=>{module.exports=filename;};

const { buildEgyptianUnit1CurriculumUnit, resolveEgyptianUnit1CurriculumVersion }=require('../data/curriculum/egyptian') as typeof import('../data/curriculum/egyptian');
const { buildMsaUnit1CurriculumUnit }=require('../data/curriculum/msa') as typeof import('../data/curriculum/msa');
const { buildGulfUnit1CurriculumUnit }=require('../data/curriculum/gulf') as typeof import('../data/curriculum/gulf');
const { getDialectContent }=require('../data/content-registry') as typeof import('../data/content-registry');
const { getDialectCurriculum }=require('../data/curriculum') as typeof import('../data/curriculum');
const { resolveCurriculumItem, getDialectContentMeta }=require('../utils/content-resolver') as typeof import('../utils/content-resolver');
const { getContentAccess }=require('../utils/access') as typeof import('../utils/access');
const { getQuizPassedAtThreshold }=require('../utils/quiz-scoring') as typeof import('../utils/quiz-scoring');
const { buildEgyptianBigReviewQuestions, buildEgyptianFirstArabicChallengeQuestions }=require('../data/egyptian-unit1-quizzes') as typeof import('../data/egyptian-unit1-quizzes');
const { EGYPTIAN_FIRST_CAFE_DIALOGUE, EGYPTIAN_UNIT1_MISSIONS }=require('../data/egyptian-unit1') as typeof import('../data/egyptian-unit1');

const expected=['first_arabic_words','polite_like_a_local','people_around_you','everyday_objects','food_and_drinks','describe_the_world','numbers_and_money','where_here_there','introduce_yourself','how_are_you','big_review','first_cafe_conversation','first_arabic_challenge'];
const unit=buildEgyptianUnit1CurriculumUnit('v2');
const legacy=buildEgyptianUnit1CurriculumUnit('legacy');
const egyptian=getDialectContent('egyptian');
const msa=getDialectContent('msa');
const gulf=getDialectContent('gulf');

assert.equal(unit.items.length,13);
assert.deepEqual(unit.items.map(item=>item.contentId),expected);
assert.deepEqual(legacy.items.map(item=>item.contentId),['basic_words','greetings','intro','quiz_u1']);
assert.equal(resolveEgyptianUnit1CurriculumVersion({requestedVersion:'v2',appEnv:'production',isLocalDevelopment:true}),'legacy');
assert.equal(resolveEgyptianUnit1CurriculumVersion({requestedVersion:'v2',appEnv:'preview',isLocalDevelopment:false}),'v2');
unit.items.forEach((item,index)=>{
  assert.ok(resolveCurriculumItem(item,egyptian),item.contentId);
  assert.equal(resolveCurriculumItem(item,msa),null);
  assert.equal(resolveCurriculumItem(item,gulf),null);
  assert.equal(egyptian.missions[item.contentId].audioMode,'none');
  assert.equal(egyptian.missions[item.contentId].pronunciationEnabled,index<10?true:undefined);
  assert.notEqual(egyptian.missions[item.contentId],msa.missions[item.contentId]);
  assert.notEqual(egyptian.missions[item.contentId],gulf.missions[item.contentId]);
});
assert.deepEqual(buildMsaUnit1CurriculumUnit('v2').items.map(item=>item.contentId),expected);
assert.deepEqual(buildGulfUnit1CurriculumUnit('v2').items.map(item=>item.contentId),expected);
assert.equal(EGYPTIAN_FIRST_CAFE_DIALOGUE.length,14);
assert.equal(unit.items[11].sceneImageKey,'Cafe');
assert.ok(egyptian.sceneImages.Cafe);
assert.equal(resolveCurriculumItem(unit.items[11],egyptian)?.sceneImage,egyptian.sceneImages.Cafe);

const review=buildEgyptianBigReviewQuestions('egyptian-review-audit');
const challenge=buildEgyptianFirstArabicChallengeQuestions('egyptian-challenge-audit');
assert.equal(review.length,24);
assert.equal(challenge.length,20);
assert.ok(challenge.every(question=>question.hideTransliterationBeforeAnswer));
assert.equal(challenge.some(question=>review.some(reviewQuestion=>reviewQuestion.id===question.id)),false);
const categories:Record<string,number>={};challenge.forEach(question=>{categories[question.category??'']=(categories[question.category??'']??0)+1;});
assert.deepEqual(categories,{mini_situation:4,best_reply:4,phrase_arrangement:4,translation:4,mixed_situation:4});
const positions=review.flatMap(question=>'options'in question?[question.options.findIndex(option=>option.isCorrect)]:[]);
assert.ok(positions.some(position=>position!==0));
positions.forEach((position,index)=>{if(index>=2)assert.ok(!(position===positions[index-1]&&position===positions[index-2]));});
const challengePositions=challenge.flatMap(question=>'options'in question?[question.options.findIndex(option=>option.isCorrect)]:[]);
challengePositions.forEach((position,index)=>{if(index>=2)assert.ok(!(position===challengePositions[index-1]&&position===challengePositions[index-2]));});
assert.deepEqual(buildEgyptianBigReviewQuestions('repeatable'),buildEgyptianBigReviewQuestions('repeatable'));
assert.notDeepEqual(buildEgyptianBigReviewQuestions('restart-a'),buildEgyptianBigReviewQuestions('restart-b'));
[...review,...challenge].forEach(question=>{if(!('options'in question))return;const keys=question.options.map(option=>'arabic'in option?option.arabic:'meaning'in option?option.meaning:JSON.stringify(option));assert.equal(new Set(keys).size,keys.length);assert.equal(question.options.filter(option=>option.isCorrect).length,1);});
const semanticIds=EGYPTIAN_UNIT1_MISSIONS.flatMap(mission=>[...(mission.lessonWords??[]).map(word=>(word as {conceptId?:string}).conceptId),...(mission.quizQuestions??[]).map(question=>question.id)]).filter(Boolean);
assert.equal(new Set(semanticIds).size,semanticIds.length);
assert.equal(getQuizPassedAtThreshold(15,20,16),false);
assert.equal(getQuizPassedAtThreshold(16,20,16),true);
assert.equal(getDialectContentMeta('egyptian','quiz_u1','quiz')?.contentId,'first_arabic_challenge');
assert.notEqual(getDialectContentMeta('msa','quiz_u1','quiz')?.dialect,'egyptian');
assert.notEqual(getDialectContentMeta('gulf','quiz_u1','quiz')?.dialect,'egyptian');

const curriculum=getDialectCurriculum('egyptian');const original=curriculum.units[0];curriculum.units[0]=unit;
try {
  const unit2=curriculum.units[1].items[0];
  const access=(completedContentIds:string[])=>getContentAccess({dialect:'egyptian',unitId:unit2.unitId,contentId:unit2.contentId,contentType:unit2.contentType,isPremium:true,isTestingUnlocked:false,completedContentIds});
  assert.equal(access(['egyptian:unit-1:first_cafe_conversation']).allowed,false);
  assert.equal(access(['egyptian:unit-1:first_arabic_challenge']).allowed,true);
  assert.equal(access(['egyptian:unit-1:quiz_u1']).allowed,true);
  assert.equal(access(['msa:unit-1:first_arabic_challenge']).allowed,false);
  assert.equal(access(['gulf:unit-1:first_arabic_challenge']).allowed,false);
} finally {curriculum.units[0]=original;}

for (const [dialect, v2Unit] of [['msa', buildMsaUnit1CurriculumUnit('v2')], ['gulf', buildGulfUnit1CurriculumUnit('v2')]] as const) {
  const other=getDialectCurriculum(dialect);const previous=other.units[0];other.units[0]=v2Unit;
  try {
    const unit2=other.units[1].items[0];
    assert.equal(getContentAccess({dialect,unitId:unit2.unitId,contentId:unit2.contentId,contentType:unit2.contentType,isPremium:true,isTestingUnlocked:false,completedContentIds:['egyptian:unit-1:first_arabic_challenge']}).allowed,false);
  } finally {other.units[0]=previous;}
}

console.log(JSON.stringify({status:'PASS',visibleMissions:13,resolvedMissions:13,pronunciationLessons:10,cafeTurns:14,reviewQuestions:24,challengeQuestions:20,categoryBalance:categories,dialectIsolation:true,legacyPreserved:true,productionFailsClosed:true},null,2));
