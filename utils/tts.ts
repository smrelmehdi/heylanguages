import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { getAudioAsset, type AudioDialect } from '../constants/audio-manifest';
import { supabase } from './supabase';

const VOICE_GULF = 'rUaPbzcZIu8df8iNL9WZ';
const VOICE_EGYPTIAN = 'LXrTqFIgiubkrMkwvOUr';
const VOICE_MSA = 'xvhpbk8otnNHtT3fjCpr';       // Omar (MSA)

// Central playback state. Every call bumps `currentToken`; in-flight fetches
// and not-yet-started players check it and bail if superseded. Prevents
// overlap when the user taps rapidly.
let currentPlayer: any = null;
let currentToken = 0;
let currentSubscription: { remove?: () => void } | null = null;
let audioModeResetInFlight: Promise<void> | null = null;

const audioCache = new Map<string, string>();
const TTS_CACHE_PREFIX = 'tts_';
const TTS_CACHE_MAX_BYTES = 50 * 1024 * 1024;
const TTS_CACHE_TARGET_BYTES = 40 * 1024 * 1024;
const TTS_MEMORY_CACHE_MAX_ITEMS = 180;

type AudioSource = string | number | { uri?: string; assetId?: number };
type OptionalNetworkState = {
  isConnected?: boolean | null;
  isInternetReachable?: boolean | null;
};
type OptionalNetworkModule = {
  getNetworkStateAsync?: () => Promise<OptionalNetworkState>;
};

export interface PlayOptions {
  onComplete?: () => void;
}

type GenerateSpeechResponse = {
  audioBase64?: unknown;
  contentType?: unknown;
  error?: unknown;
};

let didWarnMissingExpoNetwork = false;

function getOptionalNetwork(): OptionalNetworkModule | null {
  try {
    // Optional native module: older dev clients may not include ExpoNetwork.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-network') as OptionalNetworkModule;
  } catch (error) {
    if (__DEV__ && !didWarnMissingExpoNetwork) {
      didWarnMissingExpoNetwork = true;
      console.warn('expo-network unavailable, using online fallback.', error);
    }
    return null;
  }
}

async function isRuntimeTtsOnline(): Promise<boolean> {
  const Network = getOptionalNetwork();
  if (!Network?.getNetworkStateAsync) return true;
  const network = await Network.getNetworkStateAsync();
  return Boolean(network.isConnected && network.isInternetReachable !== false);
}

function dialectForVoice(voiceId?: string): AudioDialect {
  if (voiceId === VOICE_EGYPTIAN) return 'egyptian';
  if (voiceId === VOICE_MSA) return 'msa';
  return 'gulf';
}

function audioLog(event: string, details?: Record<string, unknown>) {
  if (!__DEV__) return;
  if (details) console.log(`[audio:${event}]`, details);
  else console.log(`[audio:${event}]`);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

function disposeCurrent(reason = 'dispose') {
  audioLog('dispose', { reason, token: currentToken });
  if (currentSubscription) {
    try { currentSubscription.remove?.(); } catch {}
    currentSubscription = null;
  }
  if (currentPlayer) {
    try { currentPlayer.pause(); } catch {}
    try { currentPlayer.remove(); } catch {}
    currentPlayer = null;
  }
}

function clearCurrentPlayer(player: any) {
  if (currentPlayer !== player) return;
  if (currentSubscription) {
    try { currentSubscription.remove?.(); } catch {}
    currentSubscription = null;
  }
  try { player.remove(); } catch {}
  currentPlayer = null;
}

async function setPlaybackMode(reason: string) {
  if (!audioModeResetInFlight) {
    audioLog('mode:playback', { reason });
    audioModeResetInFlight = setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
      shouldPlayInBackground: false,
    })
      .catch(error => {
        console.warn('[audio mode playback error]', error);
      })
      .finally(() => {
        audioModeResetInFlight = null;
      });
  }
  await audioModeResetInFlight;
}

export async function prepareRecordingAudioMode(reason = 'recording'): Promise<void> {
  currentToken++;
  disposeCurrent(`recording:${reason}`);
  audioLog('mode:recording', { reason });
  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });
}

export async function restorePlaybackAudioMode(reason = 'recording-finished'): Promise<void> {
  await setPlaybackMode(reason);
}

export async function resetAudioPlayback(reason = 'manual-reset'): Promise<void> {
  currentToken++;
  disposeCurrent(reason);
  await setPlaybackMode(reason);
}

function trimMemoryCache() {
  while (audioCache.size > TTS_MEMORY_CACHE_MAX_ITEMS) {
    const oldestKey = audioCache.keys().next().value;
    if (!oldestKey) break;
    audioCache.delete(oldestKey);
  }
}

async function trimTtsFileCache() {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) return;

  try {
    const entries = await FileSystem.readDirectoryAsync(cacheDir);
    const ttsFiles = entries.filter(name => name.startsWith(TTS_CACHE_PREFIX) && name.endsWith('.mp3'));
    if (ttsFiles.length === 0) return;

    const fileInfos = await Promise.all(ttsFiles.map(async name => {
      const uri = cacheDir + name;
      const info = await FileSystem.getInfoAsync(uri);
      return {
        uri,
        size: info.exists && typeof info.size === 'number' ? info.size : 0,
        modified: info.exists && typeof info.modificationTime === 'number' ? info.modificationTime : 0,
      };
    }));

    let totalBytes = fileInfos.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes <= TTS_CACHE_MAX_BYTES) return;

    const sortedOldestFirst = [...fileInfos].sort((left, right) => left.modified - right.modified);
    for (const file of sortedOldestFirst) {
      if (totalBytes <= TTS_CACHE_TARGET_BYTES) break;
      try {
        await FileSystem.deleteAsync(file.uri, { idempotent: true });
        totalBytes -= file.size;
        for (const [key, cachedUri] of audioCache.entries()) {
          if (cachedUri === file.uri) {
            audioCache.delete(key);
          }
        }
      } catch (error) {
        console.warn('TTS cache trim delete error:', error);
      }
    }
  } catch (error) {
    console.warn('TTS cache trim error:', error);
  }
}

async function startPlayback(source: AudioSource, token: number, opts?: PlayOptions): Promise<void> {
  if (token !== currentToken) return;
  disposeCurrent('before-play');
  await setPlaybackMode('before-play');
  if (token !== currentToken) return;

  let player: any = null;
  try {
    audioLog('play:start', { token, sourceType: typeof source });
    player = createAudioPlayer(source as any, {
      keepAudioSessionActive: true,
      updateInterval: 100,
    });
    if (token !== currentToken) {
      try { player.remove(); } catch {}
      return;
    }
    currentPlayer = player;

    currentSubscription = player.addListener?.('playbackStatusUpdate', (status: any) => {
      if (token !== currentToken) return;
      if (status?.error) {
        console.warn('[audio playback error]', status.error);
        setPlaybackMode('playback-error').catch(() => {});
        clearCurrentPlayer(player);
        return;
      }
      if (status?.didJustFinish) {
        audioLog('play:finish', { token });
        opts?.onComplete?.();
        clearCurrentPlayer(player);
      }
    });

    player.play();
  } catch (err) {
    console.warn('[audio playback start error]', err);
    if (player) clearCurrentPlayer(player);
    else disposeCurrent('play-start-error');
    await setPlaybackMode('play-start-error');
  }
}

export async function speakArabic(
  text: string,
  voiceId?: string,
  opts?: PlayOptions,
): Promise<void> {
  // 1. Manifest lookup first — bypass ElevenLabs if we have a pre-gen asset.
  const dialect = dialectForVoice(voiceId);
  const asset = getAudioAsset(text, dialect);
  if (asset) {
    const token = ++currentToken;
    await startPlayback(asset, token, opts);
    return;
  }

  // 2. No manifest entry — fall through to runtime ElevenLabs fetch. Warn so
  // we can find missed static text. (Dynamic LLM chat responses will always
  // land here — that's expected.)
  console.warn(`[TTS fallback] No manifest entry for: ${text.slice(0, 80)}`);

  const token = ++currentToken;
  disposeCurrent('before-tts-fetch');
  await setPlaybackMode('before-tts-fetch');

  try {
    const effectiveVoiceId = voiceId ?? VOICE_GULF;
    const cacheKey = effectiveVoiceId + '_' + text.trim().toLowerCase();
    const cachedUri = audioCache.get(cacheKey);
    if (cachedUri) {
      const info = await FileSystem.getInfoAsync(cachedUri);
      if (token !== currentToken) return;
      if (info.exists) {
        await startPlayback({ uri: cachedUri }, token, opts);
        return;
      }
      audioCache.delete(cacheKey);
    }

    if (!(await isRuntimeTtsOnline())) {
      console.warn(`[TTS offline] Skipping runtime speech fetch while offline: ${text.slice(0, 80)}`);
      return;
    }

    const { data, error } = await supabase.functions.invoke<GenerateSpeechResponse>(
      'generate-speech',
      {
        body: {
          text,
          voiceId: effectiveVoiceId,
        },
      },
    );

    if (token !== currentToken) return;

    if (error) {
      console.warn('ElevenLabs error:', error.message);
      return;
    }

    if (data?.error) {
      console.warn('ElevenLabs error:', data.error);
      return;
    }

    if (typeof data?.audioBase64 !== 'string') {
      console.warn('ElevenLabs error: missing audio data');
      return;
    }

    const fileName = 'tts_' + effectiveVoiceId.slice(-8) + '_' + Math.abs(hashCode(text)) + '.mp3';
    const fileUri = FileSystem.cacheDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, data.audioBase64, { encoding: 'base64' });
    if (token !== currentToken) return;

    audioCache.set(cacheKey, fileUri);
    trimMemoryCache();
    trimTtsFileCache().catch(err => console.warn('TTS cache cleanup error:', err));
    await startPlayback({ uri: fileUri }, token, opts);
  } catch (err) {
    console.warn('TTS error:', err);
    await setPlaybackMode('tts-error');
  }
}

export async function playLocalAudio(source: AudioSource, opts?: PlayOptions): Promise<void> {
  const token = ++currentToken;
  try {
    await startPlayback(source, token, opts);
  } catch (err) {
    console.warn('Local audio play error:', err);
    await setPlaybackMode('local-audio-error');
  }
}

export function stopAudio(): void {
  currentToken++;
  disposeCurrent('stopAudio');
}
