/* eslint-disable no-console */
/**
 * Adds / rewires audio: require(...) fields on every turn in data/egyptian-dialogues.ts.
 * Assigns assets/audio/egyptian/<scenario>/w<N>.mp3 to waiter turns and
 *                 assets/audio/egyptian/<scenario>/u<N>.mp3 to user turns,
 * in order of appearance within each exported dialogue array.
 *
 * Run:
 *   npx ts-node --skip-project --compiler-options '{"module":"CommonJS"}' scripts/rewire-egyptian-dialogues-audio.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const filePath = resolve(process.cwd(), 'data/egyptian-dialogues.ts');
let source = readFileSync(filePath, 'utf8');

// Match each exported dialogue array block
const blockRegex = /export const ([A-Z_]+_DIALOGUE_EG):\s*DialogueTurn\[]\s*=\s*\[([\s\S]*?)\n\];/g;
let updatedBlocks = 0;
let insertedLines = 0;
let rewiredLines = 0;

function toScenarioFolder(exportName: string): string {
  return exportName
    .replace(/_DIALOGUE_EG$/, '')
    .toLowerCase()
    .replace(/_/g, '-');
}

source = source.replace(blockRegex, (_fullBlock, exportName: string, body: string) => {
  const scenarioFolder = toScenarioFolder(exportName);
  let waiterIndex = 0;
  let userIndex = 0;

  // Process line by line so we keep control over index counters per turn
  const updatedBody = body.replace(/\{[^\n]+type:\s*'([^']+)'[^\n]+\}/g, (line: string, type: string) => {
    const isWaiter = type === 'waiter';
    const idx = isWaiter ? ++waiterIndex : ++userIndex;
    const audioPath = `../assets/audio/egyptian/${scenarioFolder}/${isWaiter ? 'w' : 'u'}${idx}.mp3`;

    // Already has an audio field — rewrite the path
    if (/ audio:\s*require\(/.test(line)) {
      rewiredLines++;
      return line.replace(/ audio:\s*require\([^)]*\)/, ` audio: require('${audioPath}')`);
    }

    // No audio field — insert before the closing brace
    insertedLines++;
    return line.replace(/\s*\}$/, `, audio: require('${audioPath}') }`);
  });

  updatedBlocks++;
  return `export const ${exportName}: DialogueTurn[] = [${updatedBody}\n];`;
});

writeFileSync(filePath, source, 'utf8');
console.log(`Done. ${updatedBlocks} blocks processed — inserted ${insertedLines} audio fields, rewired ${rewiredLines}.`);
