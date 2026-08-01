import assert from 'node:assert/strict';
import { getLessonCapabilities, getLessonEvaluationPayload } from '../utils/lesson-pronunciation';

const capabilities=getLessonCapabilities({missionId:'first_arabic_words',missionKind:'lesson',audioMode:'none',pronunciationEnabled:true});
assert.deepEqual(capabilities,{playbackEnabled:false,pronunciationEnabled:true});
for(const targetText of ['أيوه','إيه','أهلاً','كويس','قول تاني، لو سمحت']) {
  assert.deepEqual(getLessonEvaluationPayload({arabic:targetText,displayArabic:targetText,evalTarget:'wrong',transliteration:'test',english:'test',context:'test'},'egyptian',true),{targetText,dialect:'egyptian',context:'lesson'});
}
assert.deepEqual(getLessonCapabilities({missionId:'big_review',missionKind:'review',audioMode:'none'}),{playbackEnabled:false,pronunciationEnabled:false});
console.log('Egyptian Unit 1 pronunciation capability tests passed (7 checks).');
