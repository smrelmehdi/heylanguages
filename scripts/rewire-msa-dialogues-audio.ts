/* eslint-disable no-console */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const filePath = resolve(process.cwd(), 'data/msa-dialogues.ts');
let source = readFileSync(filePath, 'utf8');

const blockRegex = /export const ([A-Z_]+_DIALOGUE_MSA):\s*DialogueTurn\[]\s*=\s*\[([\s\S]*?)\n\];/g;
let updatedBlocks = 0;
let updatedLines = 0;

function toScenarioFolder(exportName: string): string {
  return exportName
    .replace(/_DIALOGUE_MSA$/, '')
    .toLowerCase()
    .replace(/_/g, '-');
}

source = source.replace(blockRegex, (fullBlock, exportName: string, body: string) => {
  const scenarioFolder = toScenarioFolder(exportName);
  let waiterIndex = 0;
  let userIndex = 0;

  const updatedBody = body.replace(/(\{[^\n]*type:\s*'([^']+)'[^\n]*audio:\s*)require\([^)]*\)([^\n]*\})/g, (line, prefix: string, type: string, suffix: string) => {
    if (type === 'waiter') {
      waiterIndex += 1;
      updatedLines += 1;
      return `${prefix}require('../assets/audio/msa/${scenarioFolder}/w${waiterIndex}.mp3')${suffix}`;
    }

    userIndex += 1;
    updatedLines += 1;
    return `${prefix}require('../assets/audio/msa/${scenarioFolder}/u${userIndex}.mp3')${suffix}`;
  });

  updatedBlocks += 1;
  return `export const ${exportName}: DialogueTurn[] = [${updatedBody}\n];`;
});

writeFileSync(filePath, source, 'utf8');
console.log(`Rewired ${updatedLines} dialogue lines across ${updatedBlocks} MSA scenario blocks.`);
