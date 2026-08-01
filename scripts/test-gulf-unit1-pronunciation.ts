import assert from 'node:assert/strict';
import { getLessonCapabilities, getLessonEvaluationPayload } from '../utils/lesson-pronunciation';

const gulfCapabilities=getLessonCapabilities({missionId:'first_arabic_words',missionKind:'lesson',audioMode:'none',pronunciationEnabled:true});
assert.deepEqual(gulfCapabilities,{playbackEnabled:false,pronunciationEnabled:true});
assert.deepEqual(getLessonEvaluationPayload({arabic:'هِيَه',displayArabic:'هيه',evalTarget:'wrong',transliteration:'heh',english:'Yes',context:'test'},'gulf',true),{targetText:'هيه',dialect:'gulf',context:'lesson'});
assert.deepEqual(getLessonEvaluationPayload({arabic:'تكلم شوي شوي',displayArabic:'تكلم شوي شوي',transliteration:'takallam shway shway',english:'Speak slowly',context:'test'},'gulf',true),{targetText:'تكلم شوي شوي',dialect:'gulf',context:'lesson'});
assert.deepEqual(getLessonCapabilities({missionId:'msa',missionKind:'lesson',audioMode:'none'}),{playbackEnabled:false,pronunciationEnabled:false});
assert.deepEqual(getLessonCapabilities(undefined),{playbackEnabled:true,pronunciationEnabled:true});
console.log('Gulf Unit 1 pronunciation capability tests passed (5 checks).');
