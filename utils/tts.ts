import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { getAudioAsset, type AudioDialect } from '../constants/audio-manifest';
import { AudioPlaybackLifecycle, type AudioPlaybackOwner } from './audio-lifecycle';
import { resolveOfflineAudioSource } from './offline-pack';
import { getOptionalNetwork } from './optional-network';
import { supabase } from './supabase';

const VOICE_GULF = 'rUaPbzcZIu8df8iNL9WZ';
const VOICE_EGYPTIAN = 'LXrTqFIgiubkrMkwvOUr';
const VOICE_MSA = 'xvhpbk8otnNHtT3fjCpr';       // Omar (MSA)

// One native player and one request owner for every playback path.
let currentPlayer: any = null;
let currentSubscription: { remove?: () => void } | null = null;
let audioModeQueue: Promise<void> = Promise.resolve();
let requestedAudioMode: 'playback' | 'recording' | null = null;
let recordingModeOwner: AudioPlaybackOwner | null = null;
const playbackLifecycle = new AudioPlaybackLifecycle();

const audioCache = new Map<string, string>();
const TTS_CACHE_PREFIX = 'tts_';
const TTS_CACHE_MAX_BYTES = 50 * 1024 * 1024;
const TTS_CACHE_TARGET_BYTES = 40 * 1024 * 1024;
const TTS_MEMORY_CACHE_MAX_ITEMS = 180;
const PLAYBACK_START_TIMEOUT_MS = 5000;
const RUNTIME_TTS_TIMEOUT_MS = 20000;

type AudioSource = string | number | { uri?: string; assetId?: number };
export interface PlayOptions {
  onComplete?: () => void;
  owner?: AudioPlaybackOwner;
}

export type AudioCancellationReason =
  | 'owner-stop'
  | 'owner-release'
  | 'replacement'
  | 'component-unmount'
  | 'app-background'
  | 'dialect-change'
  | 'recording-preparation'
  | 'manual-reset';

export type AudioFailureCode =
  | 'offline_unavailable'
  | 'start_timeout'
  | 'native_failure'
  | 'invalid_audio'
  | 'runtime_tts_timeout';

export class AudioPlaybackError extends Error {
  readonly code: AudioFailureCode;

  constructor(code: AudioFailureCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'AudioPlaybackError';
    this.code = code;
  }
}

export function isAudioPlaybackError(error: unknown): error is AudioPlaybackError {
  return error instanceof AudioPlaybackError;
}

type GenerateSpeechResponse = {
  audioBase64?: unknown;
  contentType?: unknown;
  error?: unknown;
};

type PlaybackStartOutcome =
  | { status: 'started' }
  | { status: 'cancelled'; reason: AudioCancellationReason };

type PlaybackAttemptSettlement = {
  token: number;
  player: any;
  settled: boolean;
  timeout: ReturnType<typeof setTimeout> | null;
  resolve: (outcome: PlaybackStartOutcome) => void;
  reject: (error: AudioPlaybackError) => void;
};

let currentPlaybackAttempt: PlaybackAttemptSettlement | null = null;

async function isRuntimeTtsOnline(): Promise<boolean> {
  const Network = getOptionalNetwork();
  if (!Network?.getNetworkStateAsync) return true;
  const network = await Network.getNetworkStateAsync();
  if (network.isConnected === false || network.isInternetReachable === false) return false;
  return true;
}

async function withRuntimeTtsTimeout<T>(operation: PromiseLike<T>): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      Promise.resolve(operation),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new AudioPlaybackError(
            'runtime_tts_timeout',
            'Speech generation timed out. Please try again.',
          ));
        }, RUNTIME_TTS_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
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

function settlePlaybackAttempt(
  token: number,
  player: any,
  settle: (attempt: PlaybackAttemptSettlement) => void,
) {
  const attempt = currentPlaybackAttempt;
  if (!attempt || attempt.token !== token || attempt.player !== player || attempt.settled) return false;
  attempt.settled = true;
  if (attempt.timeout) {
    clearTimeout(attempt.timeout);
    attempt.timeout = null;
  }
  currentPlaybackAttempt = null;
  settle(attempt);
  return true;
}

function resolveStarted(token: number, player: any) {
  return settlePlaybackAttempt(token, player, attempt => attempt.resolve({ status: 'started' }));
}

function resolveCancelled(token: number, player: any, reason: AudioCancellationReason) {
  return settlePlaybackAttempt(token, player, attempt => attempt.resolve({ status: 'cancelled', reason }));
}

function rejectFailure(token: number, player: any, error: AudioPlaybackError) {
  return settlePlaybackAttempt(token, player, attempt => attempt.reject(error));
}

function disposeCurrent(reason = 'dispose', cancellationReason: AudioCancellationReason = 'replacement') {
  const { token, owner } = playbackLifecycle.snapshot();
  audioLog('dispose', { reason, token, owner: owner?.label });
  const player = currentPlayer;
  const attempt = currentPlaybackAttempt;
  if (player && attempt && attempt.player === player) {
    resolveCancelled(attempt.token, player, cancellationReason);
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
  const attempt = currentPlaybackAttempt;
  if (attempt && attempt.player === player && attempt.token === token) {
    resolveCancelled(token, player, 'replacement');
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
  disposeCurrent(`recording:${reason}`, 'recording-preparation');
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
  disposeCurrent(reason, 'manual-reset');
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
  disposeCurrent('before-play', 'replacement');
  await setPlaybackMode('before-play');
  if (!playbackLifecycle.isCurrent(token)) return;

  let player: any = null;
  let playerCreated = false;
  try {
    const resolvedSource = await resolveOfflineAudioSource(source) as AudioSource;
    if (!playbackLifecycle.isCurrent(token)) return;
    audioLog('play:start', {
      token,
      owner: opts?.owner?.label,
      sourceType: typeof resolvedSource,
      offlinePackResolved: resolvedSource !== source,
    });
    player = createAudioPlayer(resolvedSource as any, {
      keepAudioSessionActive: true,
      updateInterval: 100,
    });
    playerCreated = true;
    if (!playbackLifecycle.isCurrent(token)) {
      try { player.remove(); } catch {}
      return;
    }
    currentPlayer = player;

    const startAck = new Promise<PlaybackStartOutcome>((resolve, reject) => {
      currentPlaybackAttempt = {
        token,
        player,
        settled: false,
        timeout: null,
        resolve,
        reject,
      };
    });
    // A synchronous player.play() throw may reject before startAck is awaited.
    startAck.catch(() => {});

    currentSubscription = player.addListener?.('playbackStatusUpdate', (status: any) => {
      if (!playbackLifecycle.isCurrent(token)) return;
      if (status?.error) {
        rejectFailure(
          token,
          player,
          new AudioPlaybackError('native_failure', String(status.error)),
        );
        audioWarn('play:error', { token, owner: opts?.owner?.label, error: status.error });
        playbackLifecycle.stop();
        setPlaybackMode('playback-error', true).catch(() => {});
        clearCurrentPlayer(player, token);
        return;
      }

      const currentTime = Number(status?.currentTime ?? player.currentTime ?? 0);
      const duration = Number(status?.duration ?? player.duration ?? 0);
      const loaded = status?.isLoaded !== false && player.isLoaded !== false;
      const credibleFinish = Boolean(
        status?.didJustFinish &&
        loaded &&
        duration > 0 &&
        currentTime > 0 &&
        currentTime >= Math.max(0, duration - 0.05)
      );
      const wasAwaitingStart = Boolean(
        currentPlaybackAttempt?.token === token &&
        currentPlaybackAttempt.player === player
      );

      if (status?.playing || currentTime > 0 || credibleFinish) {
        resolveStarted(token, player);
      }
      if (status?.didJustFinish) {
        if (!credibleFinish && currentPlaybackAttempt?.player === player) {
          rejectFailure(
            token,
            player,
            new AudioPlaybackError('invalid_audio', 'Audio finished without evidence of playable content.'),
          );
        }
        audioLog('play:finish', { token });
        if (credibleFinish || !wasAwaitingStart) opts?.onComplete?.();
        clearCurrentPlayer(player, token);
      }
    });

    player.play();
    const attempt = currentPlaybackAttempt;
    if (!attempt || attempt.token !== token || attempt.player !== player) return;
    attempt.timeout = setTimeout(() => {
      if (
        !playbackLifecycle.isCurrent(token) ||
        currentPlayer !== player ||
        currentPlaybackAttempt?.token !== token ||
        currentPlaybackAttempt.player !== player
      ) return;
      const loaded = Boolean(player.isLoaded);
      const playing = Boolean(player.playing);
      if (playing) {
        resolveStarted(token, player);
        return;
      }
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
      rejectFailure(
        token,
        player,
        new AudioPlaybackError('start_timeout', 'Audio playback did not start in time.'),
      );
      playbackLifecycle.stop();
      disposeCurrent('play-start-timeout', 'replacement');
      setPlaybackMode('play-start-timeout', true).catch(() => {});
    }, PLAYBACK_START_TIMEOUT_MS);

    // Do not report success until playback actually starts (or finishes instantly).
    await startAck;
  } catch (err) {
    const error = isAudioPlaybackError(err)
      ? err
      : new AudioPlaybackError(
          playerCreated ? 'native_failure' : 'invalid_audio',
          err instanceof Error ? err.message : 'Audio playback failed to start.',
          { cause: err },
        );
    if (player) rejectFailure(token, player, error);
    audioWarn('play:start-error', error);
    if (player) clearCurrentPlayer(player, token);
    else disposeCurrent('play-start-error', 'replacement');
    await setPlaybackMode('play-start-error', true);
    throw error;
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
      throw new AudioPlaybackError(
        'offline_unavailable',
        'Offline and no packaged audio available for this phrase.',
      );
    }

    const { data, error } = await withRuntimeTtsTimeout(
      supabase.functions.invoke<GenerateSpeechResponse>(
        'generate-speech',
        {
          body: {
            text,
            dialect: dialectForVoice(effectiveVoiceId),
          },
        },
      ),
    );

    if (!playbackLifecycle.isCurrent(token)) return;

    if (error) {
      console.warn('ElevenLabs error:', error.message);
      throw new AudioPlaybackError('native_failure', error.message, { cause: error });
    }

    if (data?.error) {
      console.warn('ElevenLabs error:', data.error);
      throw new AudioPlaybackError('native_failure', String(data.error));
    }

    if (typeof data?.audioBase64 !== 'string') {
      console.warn('ElevenLabs error: missing audio data');
      throw new AudioPlaybackError('invalid_audio', 'Speech generation returned no audio data.');
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

export function stopAudio(
  owner?: AudioPlaybackOwner,
  reason: AudioCancellationReason = 'owner-stop',
): void {
  if (!playbackLifecycle.stop(owner)) {
    audioLog('stop:ignored-stale-owner', { owner: owner?.label });
    return;
  }
  disposeCurrent('stopAudio', reason);
}

export function releaseAudioPlaybackOwner(
  owner: AudioPlaybackOwner,
  reason: AudioCancellationReason = 'component-unmount',
): void {
  stopAudio(owner, reason);
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
  stopAudio(undefined, 'app-background');
}

export type { AudioPlaybackOwner } from './audio-lifecycle';
