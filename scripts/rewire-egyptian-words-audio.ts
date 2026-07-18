/* eslint-disable no-console */
/**
 * Adds audio: require(...) fields to all word entries in data/egyptian-words.ts
 * using numbered assets: assets/audio/egyptian/<lesson>/1.mp3, 2.mp3, ...
 *
 * Run:
 *   npx ts-node --skip-project --compiler-options '{"module":"CommonJS"}' scripts/rewire-egyptian-words-audio.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const filePath = resolve(process.cwd(), 'data/egyptian-words.ts');
let source = readFileSync(filePath, 'utf8');

const LESSON_MAP: Record<string, string> = {
  BASIC_WORDS_EG: 'basic-words',
  GREETINGS_WORDS_EG: 'greetings',
  INTRO_WORDS_EG: 'intro',
};

let insertedTotal = 0;
let rewiredTotal = 0;

for (const [exportName, folder] of Object.entries(LESSON_MAP)) {
  const blockRegex = new RegExp(
    `(export const ${exportName}[\\s\\S]*?=\\s*\\[)([\\s\\S]*?)(\\n\\];)`,
  );
  source = source.replace(blockRegex, (_m, open: string, body: string, close: string) => {
    let index = 0;
    const updatedBody = body.replace(/\{[^\n]+\}/g, (line: string) => {
      index++;
      const audioPath = `../assets/audio/egyptian/${folder}/${index}.mp3`;
      if (/ audio:\s*require\(/.test(line)) {
        rewiredTotal++;
        return line.replace(/ audio:\s*require\([^)]*\)/, ` audio: require('${audioPath}')`);
      }
      insertedTotal++;
      return line.replace(/\s*\}$/, `, audio: require('${audioPath}') }`);
    });
    return `${open}${updatedBody}${close}`;
  });
}

writeFileSync(filePath, source, 'utf8');
console.log(`Done. Inserted ${insertedTotal} audio fields, rewired ${rewiredTotal}.`);
