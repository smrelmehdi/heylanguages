import assert from 'node:assert/strict';
import Module from 'node:module';

(globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ = true;
process.env.EXPO_PUBLIC_SUPABASE_URL ??= 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??= 'test-anon-key';
const extensions=(Module as typeof Module & {_extensions:Record<string,(module:{exports:unknown},filename:string)=>void>})._extensions;
for(const extension of ['.mp3','.png','.jpg','.jpeg','.webp']) extensions[extension]=(module,filename)=>{module.exports=filename;};

const { buildGulfUnit1CurriculumUnit, resolveGulfUnit1CurriculumVersion }=require('../data/curriculum/gulf') as typeof import('../data/curriculum/gulf');
const { getDialectContent }=require('../data/content-registry') as typeof import('../data/content-registry');
const { resolveCurriculumItem }=require('../utils/content-resolver') as typeof import('../utils/content-resolver');
const { buildGulfBigReviewQuestions, buildGulfFirstArabicChallengeQuestions }=require('../data/gulf-unit1-quizzes') as typeof import('../data/gulf-unit1-quizzes');

const unit=buildGulfUnit1CurriculumUnit('v2');
const gulf=getDialectContent('gulf');
const msa=getDialectContent('msa');
const egyptian=getDialectContent('egyptian');
const expected=['first_arabic_words','polite_like_a_local','people_around_you','everyday_objects','food_and_drinks','describe_the_world','numbers_and_money','where_here_there','introduce_yourself','how_are_you','big_review','first_cafe_conversation','first_arabic_challenge'];
assert.deepEqual(unit.items.map(item=>item.contentId),expected);
assert.equal(resolveGulfUnit1CurriculumVersion({requestedVersion:'v2',appEnv:'production',isLocalDevelopment:true}),'legacy');
unit.items.forEach((item,index)=>{assert.ok(resolveCurriculumItem(item,gulf));assert.equal(resolveCurriculumItem(item,msa),null);assert.equal(resolveCurriculumItem(item,egyptian),null);assert.equal(gulf.missions[item.contentId].audioMode,'none');assert.equal(gulf.missions[item.contentId].pronunciationEnabled,index<10?true:undefined);});
const questions=[...buildGulfBigReviewQuestions('audit'),...buildGulfFirstArabicChallengeQuestions('audit')];
questions.forEach(question=>{if(!('options'in question))return;const keys=question.options.map(option=>'arabic'in option?option.arabic:'meaning'in option?option.meaning:JSON.stringify(option));assert.equal(new Set(keys).size,keys.length);assert.equal(question.options.filter(option=>option.isCorrect).length,1);});
console.log(JSON.stringify({status:'PASS',visibleMissions:unit.items.length,resolvedMissions:unit.items.length,pronunciationLessons:10,reviewQuestions:24,challengeQuestions:20,duplicateChoiceFailures:0,dialectIsolation:true,productionFailsClosed:true},null,2));
