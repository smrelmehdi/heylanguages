import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';
import { resolve } from 'node:path';

type PlayerBehavior =
  | 'start'
  | 'native-error'
  | 'silent'
  | 'playing-no-status'
  | 'zero-finish'
  | 'short-finish'
  | 'create-throw'
  | 'play-throw';

const realSetTimeout = globalThis.setTimeout;
const wait = (milliseconds: number) => new Promise(resolveWait => realSetTimeout(resolveWait, milliseconds));
(globalThis as typeof globalThis & { __DEV__: boolean }).__DEV__ = false;
(globalThis as any).setTimeout = (
  callback: (...args: any[]) => void,
  milliseconds?: number,
  ...args: any[]
) => realSetTimeout(
  callback,
  milliseconds === 5000 ? 20 : milliseconds === 20000 ? 30 : milliseconds,
  ...args,
);

let behaviorQueue: PlayerBehavior[] = [];
let manifestAsset: number | undefined;
let networkState: { isConnected?: boolean | null; isInternetReachable?: boolean | null } = {
  isConnected: true,
  isInternetReachable: true,
};
let invokeMode: 'success' | 'hang' = 'success';
let invokeCount = 0;
const players: MockPlayer[] = [];

class MockPlayer {
  readonly behavior: PlayerBehavior;
  isLoaded = true;
  playing = false;
  duration = 1;
  currentTime = 0;
  removed = false;
  listener: ((status: any) => void) | null = null;
  staleListener: ((status: any) => void) | null = null;

  constructor() {
    this.behavior = behaviorQueue.shift() ?? 'start';
  }

  addListener(_event: string, listener: (status: any) => void) {
    this.listener = listener;
    this.staleListener = listener;
    return { remove: () => { this.listener = null; } };
  }

  play() {
    if (this.behavior === 'play-throw') throw new Error('play failed');
    if (this.behavior === 'playing-no-status') {
      this.playing = true;
      return;
    }
    if (this.behavior === 'silent') return;
    queueMicrotask(() => {
      if (this.behavior === 'start') {
        this.playing = true;
        this.listener?.({ playing: true, currentTime: 0 });
      } else if (this.behavior === 'native-error') {
        this.listener?.({ error: 'native failure' });
      } else if (this.behavior === 'zero-finish') {
        this.duration = 0;
        this.currentTime = 0;
        this.listener?.({ didJustFinish: true, isLoaded: true, duration: 0, currentTime: 0 });
      } else if (this.behavior === 'short-finish') {
        this.duration = 0.03;
        this.currentTime = 0.03;
        this.listener?.({ didJustFinish: true, isLoaded: true, duration: 0.03, currentTime: 0.03 });
      }
    });
  }

  pause() {
    this.playing = false;
  }

  remove() {
    this.removed = true;
    this.listener = null;
  }
}

const storageFiles = new Set<string>();
const moduleWithLoader = Module as typeof Module & {
  _load: (request: string, parent: unknown, isMain: boolean) => unknown;
};
const originalLoad = moduleWithLoader._load;
moduleWithLoader._load = function loadForAudioTests(request, parent, isMain) {
  if (request === 'expo-audio') {
    return {
      createAudioPlayer: () => {
        if (behaviorQueue[0] === 'create-throw') {
          behaviorQueue.shift();
          throw new Error('create failed');
        }
        const player = new MockPlayer();
        players.push(player);
        return player;
      },
      setAudioModeAsync: async () => {},
    };
  }
  if (request === 'expo-file-system/legacy') {
    return {
      cacheDirectory: '/tmp/',
      getInfoAsync: async (uri: string) => ({ exists: storageFiles.has(uri) }),
      readDirectoryAsync: async () => [],
      writeAsStringAsync: async (uri: string) => { storageFiles.add(uri); },
      deleteAsync: async (uri: string) => { storageFiles.delete(uri); },
    };
  }
  if (request === '../constants/audio-manifest') {
    return { getAudioAsset: () => manifestAsset };
  }
  if (request === './supabase') {
    return {
      supabase: {
        functions: {
          invoke: async () => {
            invokeCount += 1;
            if (invokeMode === 'hang') return new Promise(() => {});
            return { data: { audioBase64: 'dGVzdA==' }, error: null };
          },
        },
      },
    };
  }
  if (request === 'expo-network') {
    return { getNetworkStateAsync: async () => networkState };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const {
  AudioPlaybackError,
  handleAudioAppStateChange,
  playLocalAudio,
  playLocalAudioWithTtsFallback,
  prepareRecordingAudioMode,
  releaseAudioPlaybackOwner,
  resetAudioPlayback,
  speakArabic,
  stopAudio,
} = require('../utils/tts') as typeof import('../utils/tts');
const { createAudioPlaybackOwner } = require('../utils/audio-lifecycle') as typeof import('../utils/audio-lifecycle');

function useBehaviors(...behaviors: PlayerBehavior[]) {
  behaviorQueue = [...behaviors];
}

async function expectFailure(promise: Promise<void>, code: string) {
  await assert.rejects(promise, error => error instanceof AudioPlaybackError && error.code === code);
}

async function main() {
  const owner = createAudioPlaybackOwner('settlement-test');

  useBehaviors('start');
  await playLocalAudio(1, { owner });

  useBehaviors('native-error');
  await expectFailure(playLocalAudio(1, { owner }), 'native_failure');

  useBehaviors('create-throw');
  await expectFailure(playLocalAudio(1, { owner }), 'invalid_audio');

  useBehaviors('play-throw');
  await expectFailure(playLocalAudio(1, { owner }), 'native_failure');

  useBehaviors('silent');
  const timeoutPlayerIndex = players.length;
  await expectFailure(playLocalAudio(1, { owner }), 'start_timeout');
  assert.equal(players[timeoutPlayerIndex].removed, true);

  useBehaviors('silent');
  const ownerStopped = playLocalAudio(1, { owner });
  await wait(2);
  stopAudio(owner, 'owner-stop');
  await ownerStopped;

  useBehaviors('silent');
  const ownerReleased = playLocalAudio(1, { owner });
  await wait(2);
  releaseAudioPlaybackOwner(owner, 'owner-release');
  await ownerReleased;

  useBehaviors('silent');
  const componentUnmounted = playLocalAudio(1, { owner });
  await wait(2);
  releaseAudioPlaybackOwner(owner);
  await componentUnmounted;

  useBehaviors('silent', 'start');
  const replaced = playLocalAudio(1, { owner });
  await wait(2);
  const replacement = playLocalAudio(2, { owner });
  await Promise.all([replaced, replacement]);

  useBehaviors('silent');
  const backgrounded = playLocalAudio(1, { owner });
  await wait(2);
  await handleAudioAppStateChange('background');
  await backgrounded;

  useBehaviors('silent');
  const dialectChanged = playLocalAudio(1, { owner });
  await wait(2);
  stopAudio(undefined, 'dialect-change');
  await dialectChanged;

  useBehaviors('silent');
  const recordingPrepared = playLocalAudio(1, { owner });
  await wait(2);
  await prepareRecordingAudioMode('test', owner);
  await recordingPrepared;

  useBehaviors('silent');
  const manuallyReset = playLocalAudio(1, { owner });
  await wait(2);
  await resetAudioPlayback();
  await manuallyReset;

  useBehaviors('playing-no-status');
  await playLocalAudio(1, { owner });

  useBehaviors('silent', 'start');
  const staleStartIndex = players.length;
  const staleAttempt = playLocalAudio(1, { owner });
  await wait(2);
  const currentAttempt = playLocalAudio(2, { owner });
  await Promise.all([staleAttempt, currentAttempt]);
  const currentPlayer = players[staleStartIndex + 1];
  players[staleStartIndex].staleListener?.({ error: 'stale failure' });
  assert.equal(currentPlayer.removed, false);
  await wait(25);
  assert.equal(currentPlayer.removed, false);

  invokeCount = 0;
  useBehaviors('silent');
  const cancelledFallback = playLocalAudioWithTtsFallback(1, 'cancelled fallback', undefined, { owner });
  await wait(2);
  stopAudio(owner);
  await cancelledFallback;
  assert.equal(invokeCount, 0);

  networkState = { isConnected: true, isInternetReachable: true };
  invokeMode = 'success';
  useBehaviors('native-error', 'start');
  await playLocalAudioWithTtsFallback(1, 'eligible fallback', undefined, { owner });
  assert.equal(invokeCount, 1);

  manifestAsset = undefined;
  networkState = { isConnected: false, isInternetReachable: false };
  await expectFailure(speakArabic('offline missing unique', undefined, { owner }), 'offline_unavailable');

  manifestAsset = 7;
  useBehaviors('start');
  await speakArabic('offline packaged', undefined, { owner });

  manifestAsset = undefined;
  networkState = { isConnected: null, isInternetReachable: null };
  useBehaviors('start');
  await speakArabic('unknown network unique', undefined, { owner });

  networkState = { isConnected: true, isInternetReachable: true };
  useBehaviors('zero-finish');
  await expectFailure(playLocalAudio(1, { owner }), 'invalid_audio');

  let completed = false;
  useBehaviors('short-finish');
  await playLocalAudio(1, { owner, onComplete: () => { completed = true; } });
  assert.equal(completed, true);

  invokeMode = 'hang';
  await expectFailure(speakArabic('runtime timeout unique', undefined, { owner }), 'runtime_tts_timeout');
  invokeMode = 'success';

  const scenarioSource = readFileSync(resolve(process.cwd(), 'app/scenario.tsx'), 'utf8');
  assert.match(scenarioSource, /Scenario audio playback failed/);
  for (const component of [
    'components/quiz/ListeningChallenge.tsx',
    'components/quiz/SceneReplay.tsx',
    'components/quiz/TransliterationInput.tsx',
  ]) {
    const source = readFileSync(resolve(process.cwd(), component), 'utf8');
    assert.match(source, /isMountedRef/);
    assert.match(source, /setIsStartingAudio\(false\)/);
  }

  console.log(JSON.stringify({
    status: 'PASS',
    checks: 27,
    normalStart: 'resolved',
    nativeError: 'native_failure',
    timeout: 'start_timeout',
    cancellations: 'resolved without fallback',
    watchdogPlaying: 'resolved',
    instantFinish: 'validated',
    connectivityUnknown: 'treated as potentially online',
    runtimeTtsTimeout: 'runtime_tts_timeout',
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
