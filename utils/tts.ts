import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { getAudioAsset, type AudioDialect } from '../constants/audio-manifest';
import { AudioPlaybackLifecycle, type AudioPlaybackOwner } from './audio-lifecycle';
import { supabase } from './supabase';

const VOICE_GULF = 'rUaPbzcZIu8df8iNL9WZ';
const VOICE_EGYPTIAN = 'LXrTqFIgiubkrMkwvOUr';
const VOICE_MSA = 'xvhpbk8otnNHtT3fjCpr';       // Omar (MSA)

// One native player and one request owner for every playback path.
let currentPlayer: any = null;
let currentSubscription: { remove?: () => void } | null = null;
let playbackWatchdog: ReturnType<typeof setTimeout> | null = null;
let audioModeQueue: Promise<void> = Promise.resolve();
let requestedAudioMode: 'playback' | 'recording' | null = null;
let recordingModeOwner: AudioPlaybackOwner | null = null;
const playbackLifecycle = new AudioPlaybackLifecycle();

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
  owner?: AudioPlaybackOwner;
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

function audioWarn(event: string, details?: unknown) {
  if (!__DEV__) return;
  console.warn(`[audio:${event}]`, details ?? '');
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
  const { token, owner } = playbackLifecycle.snapshot();
  audioLog('dispose', { reason, token, owner: owner?.label });
  if (playbackWatchdog) {
    clearTimeout(playbackWatchdog);
    playbackWatchdog = null;
  }
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

function clearCurrentPlayer(player: any, token: number) {
  if (currentPlayer !== player) return;
  if (playbackWatchdog) {
    clearTimeout(playbackWatchdog);
    playbackWatchdog = null;
  }
  if (currentSubscription) {
    try { currentSubscription.remove?.(); } catch {}
    currentSubscription = null;
  }
  try { player.remove(); } catch {}
  currentPlayer = null;
  playbackLifecycle.finish(token);
}

function queueAudioMode(
  mode: Parameters<typeof setAudioModeAsync>[0],
  modeName: 'playback' | 'recording',
  reason: string,
  force = false,
) {
  if (!force && requestedAudioMode === modeName) return audioModeQueue;
  requestedAudioMode = modeName;
  audioModeQueue = audioModeQueue
    .catch(() => {})
    .then(async () => {
      audioLog('mode:apply', { reason, mode: modeName });
      try {
        await setAudioModeAsync(mode);
      } catch (error) {
        if (requestedAudioMode === modeName) requestedAudioMode = null;
        throw error;
      }
    });
  return audioModeQueue;
}

async function setPlaybackMode(reason: string, force = false) {
  await queueAudioMode({
      allowsRecording: false,
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
      shouldPlayInBackground: false,
    }, 'playback', reason, force);
}

export async function prepareRecordingAudioMode(reason = 'recording', owner?: AudioPlaybackOwner): Promise<void> {
  playbackLifecycle.stop();
  disposeCurrent(`recording:${reason}`);
  recordingModeOwner = owner ?? null;
  audioLog('mode:recording', { reason });
  await queueAudioMode({
    allowsRecording: true,
    playsInSilentMode: true,
    interruptionMode: 'duckOthers',
    shouldPlayInBackground: false,
  }, 'recording', `recording:${reason}`);
}

export async function restorePlaybackAudioMode(reason = 'recording-finished', owner?: AudioPlaybackOwner): Promise<void> {
  if (owner && recordingModeOwner && recordingModeOwner.id !== owner.id) {
    audioLog('mode:restore-ignored-stale-owner', {
      reason,
      owner: owner.label,
      recordingOwner: recordingModeOwner.label,
    });
    return;
  }
  recordingModeOwner = null;
  await setPlaybackMode(reason, true);
}

export async function resetAudioPlayback(reason = 'manual-reset'): Promise<void> {
  playbackLifecycle.stop();
  disposeCurrent(reason);
  await setPlaybackMode(reason, true);
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
  if (!playbackLifecycle.isCurrent(token)) return;
  disposeCurrent('before-play');
  await setPlaybackMode('before-play');
  if (!playbackLifecycle.isCurrent(token)) return;

  let player: any = null;
  try {
    audioLog('play:start', { token, owner: opts?.owner?.label, sourceType: typeof source });
    player = createAudioPlayer(source as any, {
      keepAudioSessionActive: true,
      updateInterval: 100,
    });
    if (!playbackLifecycle.isCurrent(token)) {
      try { player.remove(); } catch {}
      return;
    }
    currentPlayer = player;

    currentSubscription = player.addListener?.('playbackStatusUpdate', (status: any) => {
      if (!playbackLifecycle.isCurrent(token)) return;
      if (status?.error) {
        audioWarn('play:error', { token, owner: opts?.owner?.label, error: status.error });
        playbackLifecycle.stop();
        setPlaybackMode('playback-error', true).catch(() => {});
        clearCurrentPlayer(player, token);
        return;
      }
      if (status?.didJustFinish) {
        audioLog('play:finish', { token });
        opts?.onComplete?.();
        clearCurrentPlayer(player, token);
      }
    });

    player.play();
    playbackWatchdog = setTimeout(() => {
      if (!playbackLifecycle.isCurrent(token) || currentPlayer !== player) return;
      const loaded = Boolean(player.isLoaded);
      const playing = Boolean(player.playing);
      if (playing) return;
      const duration = Number(player.duration ?? 0);
      const currentTime = Number(player.currentTime ?? 0);
      const reachedEnd = loaded && duration > 0 && currentTime >= duration - 0.05;
      audioWarn('play:timeout', {
        token,
        owner: opts?.owner?.label,
        loaded,
        currentTime,
        duration,
        reachedEnd,
      });
      if (reachedEnd) opts?.onComplete?.();
      playbackLifecycle.stop();
      disposeCurrent('play-start-timeout');
      setPlaybackMode('play-start-timeout', true).catch(() => {});
    }, 5000);
  } catch (err) {
    audioWarn('play:start-error', err);
    if (player) clearCurrentPlayer(player, token);
    else disposeCurrent('play-start-error');
    await setPlaybackMode('play-start-error', true);
    throw err;
  }
}

export async function speakArabic(
  text: string,
  voiceId?: string,
  opts?: PlayOptions,
): Promise<void> {
  // 1. Manifest lookup first — bypass ElevenLabs if we have a pre-gen asset.
  const dialect = dialectForVoice(voiceId);
  // Legacy MSA manifest entries predate the standardized v3 curriculum. Do
  // not trust them by text; canonical packaged assets will be passed directly.
  const asset = dialect === 'msa' ? undefined : getAudioAsset(text, dialect);
  if (asset) {
    const token = playbackLifecycle.begin(opts?.owner ?? null);
    await startPlayback(asset, token, opts);
    return;
  }

  // 2. No manifest entry — fall through to runtime ElevenLabs fetch. Warn so
  // we can find missed static text. (Dynamic LLM chat responses will always
  // land here — that's expected.)
  console.warn(`[TTS fallback] No manifest entry for: ${text.slice(0, 80)}`);

  const token = playbackLifecycle.begin(opts?.owner ?? null);
  disposeCurrent('before-tts-fetch');
  await setPlaybackMode('before-tts-fetch');

  try {
    const effectiveVoiceId = voiceId ?? VOICE_GULF;
    const cacheKey = effectiveVoiceId + '_' + text.trim().toLowerCase();
    const cachedUri = audioCache.get(cacheKey);
    if (cachedUri) {
      const info = await FileSystem.getInfoAsync(cachedUri);
      if (!playbackLifecycle.isCurrent(token)) return;
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
          dialect: dialectForVoice(effectiveVoiceId),
        },
      },
    );

    if (!playbackLifecycle.isCurrent(token)) return;

    if (error) {
      console.warn('ElevenLabs error:', error.message);
      throw new Error(error.message);
    }

    if (data?.error) {
      console.warn('ElevenLabs error:', data.error);
      throw new Error(String(data.error));
    }

    if (typeof data?.audioBase64 !== 'string') {
      console.warn('ElevenLabs error: missing audio data');
      throw new Error('Speech generation returned no audio data.');
    }

    const fileName = 'tts_' + effectiveVoiceId.slice(-8) + '_' + Math.abs(hashCode(text)) + '.mp3';
    const fileUri = FileSystem.cacheDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, data.audioBase64, { encoding: 'base64' });
    if (!playbackLifecycle.isCurrent(token)) return;

    audioCache.set(cacheKey, fileUri);
    trimMemoryCache();
    trimTtsFileCache().catch(err => console.warn('TTS cache cleanup error:', err));
    await startPlayback({ uri: fileUri }, token, opts);
  } catch (err) {
    console.warn('TTS error:', err);
    await setPlaybackMode('tts-error', true);
    throw err;
  }
}

export async function playLocalAudio(source: AudioSource, opts?: PlayOptions): Promise<void> {
  const token = playbackLifecycle.begin(opts?.owner ?? null);
  try {
    await startPlayback(source, token, opts);
  } catch (err) {
    audioWarn('local:error', err);
    await setPlaybackMode('local-audio-error', true);
    throw err;
  }
}

export async function playLocalAudioWithTtsFallback(
  source: AudioSource | null | undefined,
  text: string,
  voiceId?: string,
  opts?: PlayOptions,
): Promise<void> {
  if (source != null) {
    try {
      await playLocalAudio(source, opts);
      return;
    } catch (error) {
      if (__DEV__) console.warn('[local audio fallback] Packaged playback failed; trying runtime TTS.', error);
    }
  }
  await speakArabic(text, voiceId, opts);
}

export function stopAudio(owner?: AudioPlaybackOwner): void {
  if (!playbackLifecycle.stop(owner)) {
    audioLog('stop:ignored-stale-owner', { owner: owner?.label });
    return;
  }
  disposeCurrent('stopAudio');
}

export function releaseAudioPlaybackOwner(owner: AudioPlaybackOwner): void {
  stopAudio(owner);
  audioLog('owner:released', { owner: owner.label });
}

export async function initializeAudioPlayback(): Promise<void> {
  await setPlaybackMode('app-initialize', true);
}

export async function handleAudioAppStateChange(state: string): Promise<void> {
  if (state === 'active') {
    recordingModeOwner = null;
    await setPlaybackMode('app-foreground', true);
    return;
  }
  stopAudio();
}

export type { AudioPlaybackOwner } from './audio-lifecycle';
