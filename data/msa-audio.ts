import { MSA_UNIT1_AUDIO_BY_PATH } from './msa-unit1-audio';
import { MSA_UNIT2_AUDIO_BY_PATH } from './msa-unit2-audio';
import { MSA_UNIT3_AUDIO_BY_PATH } from './msa-unit3-audio';
import { MSA_UNIT4_AUDIO_BY_PATH } from './msa-unit4-audio';
import { MSA_UNIT5_AUDIO_BY_PATH } from './msa-unit5-audio';
import { MSA_UNIT6_AUDIO_BY_PATH } from './msa-unit6-audio';
import { MSA_UNIT7_AUDIO_BY_PATH } from './msa-unit7-audio';
import { MSA_UNIT8_AUDIO_BY_PATH } from './msa-unit8-audio';
import { MSA_UNIT9_AUDIO_BY_PATH } from './msa-unit9-audio';
import { MSA_UNIT10_AUDIO_BY_PATH } from './msa-unit10-audio';

export const MSA_AUDIO_BY_PATH: Record<string, any> = {
  ...MSA_UNIT1_AUDIO_BY_PATH,
  ...MSA_UNIT2_AUDIO_BY_PATH,
  ...MSA_UNIT3_AUDIO_BY_PATH,
  ...MSA_UNIT4_AUDIO_BY_PATH,
  ...MSA_UNIT5_AUDIO_BY_PATH,
  ...MSA_UNIT6_AUDIO_BY_PATH,
  ...MSA_UNIT7_AUDIO_BY_PATH,
  ...MSA_UNIT8_AUDIO_BY_PATH,
  ...MSA_UNIT9_AUDIO_BY_PATH,
  ...MSA_UNIT10_AUDIO_BY_PATH,
};

export function getMsaAudio(audioPath: string): any {
  const audio = MSA_AUDIO_BY_PATH[audioPath];
  if ((globalThis as { __DEV__?: boolean }).__DEV__ && audio == null) {
    console.warn(`[MSA audio] Missing canonical local asset: ${audioPath}`);
  }
  return audio ?? null;
}
