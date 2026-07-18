import { ALPHABET_AUDIO, type AlphabetAudioItem } from './alphabet-audio';
import { ALPHABET_AUDIO_EG } from './egyptian-alphabet-audio';
import { ALPHABET_AUDIO_MSA } from './msa-alphabet-audio';

export function getAlphabetAudioForDialect(dialect: string): AlphabetAudioItem[] {
  if (dialect === 'egyptian') return ALPHABET_AUDIO_EG;
  if (dialect === 'msa') return ALPHABET_AUDIO_MSA;
  return ALPHABET_AUDIO;
}
