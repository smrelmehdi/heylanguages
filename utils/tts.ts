import { createAudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { getAudioAsset, type AudioDialect } from '../constants/audio-manifest';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const VOICE_GULF = 'rUaPbzcZIu8df8iNL9WZ';
const VOICE_EGYPTIAN = 'VMy40598IGgDeaOE8phq';

// Central playback state. Every call bumps `currentToken`; in-flight fetches
// and not-yet-started players check it and bail if superseded. Prevents
// overlap when the user taps rapidly.
let currentPlayer: any = null;
let currentToken = 0;

// Tap debounce — silently ignore any new play call within DEBOUNCE_MS of the
// previous one. Fires in addition to the token guard.
const DEBOUNCE_MS = 150;
let lastPlayAt = 0;

const audioCache = new Map<string, string>();

type AudioSource = string | number | { uri?: string; assetId?: number };

export interface PlayOptions {
  onComplete?: () => void;
}

function dialectForVoice(voiceId?: string): AudioDialect {
  return voiceId === VOICE_EGYPTIAN ? 'egyptian' : 'gulf';
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

function disposeCurrent() {
  if (currentPlayer) {
    try { currentPlayer.remove(); } catch {}
    currentPlayer = null;
  }
}

function debounced(): boolean {
  const now = Date.now();
  if (now - lastPlayAt < DEBOUNCE_MS) return true;
  lastPlayAt = now;
  return false;
}

function startPlayback(source: AudioSource, token: number, opts?: PlayOptions) {
  if (token !== currentToken) return;
  disposeCurrent();

  const player: any = createAudioPlayer(source as any);
  if (token !== currentToken) {
    try { player.remove(); } catch {}
    return;
  }
  currentPlayer = player;

  if (opts?.onComplete) {
    const sub = player.addListener('playbackStatusUpdate', (status: any) => {
      if (status?.didJustFinish) {
        try { sub.remove(); } catch {}
        if (currentPlayer === player) {
          opts.onComplete?.();
        }
      }
    });
  }

  player.play();
}

export async function speakArabic(
  text: string,
  voiceId?: string,
  opts?: PlayOptions,
): Promise<void> {
  if (debounced()) return;

  // 1. Manifest lookup first — bypass ElevenLabs if we have a pre-gen asset.
  const dialect = dialectForVoice(voiceId);
  const asset = getAudioAsset(text, dialect);
  if (asset) {
    const token = ++currentToken;
    startPlayback(asset, token, opts);
    return;
  }

  // 2. No manifest entry — fall through to runtime ElevenLabs fetch. Warn so
  // we can find missed static text. (Dynamic LLM chat responses will always
  // land here — that's expected.)
  console.warn(`[TTS fallback] No manifest entry for: ${text.slice(0, 80)}`);

  const token = ++currentToken;
  disposeCurrent();

  try {
    if (!ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs key not set');
      return;
    }

    const effectiveVoiceId = voiceId ?? VOICE_GULF;
    const cacheKey = effectiveVoiceId + '_' + text.trim().toLowerCase();
    const cachedUri = audioCache.get(cacheKey);
    if (cachedUri) {
      const info = await FileSystem.getInfoAsync(cachedUri);
      if (token !== currentToken) return;
      if (info.exists) {
        startPlayback({ uri: cachedUri }, token, opts);
        return;
      }
      audioCache.delete(cacheKey);
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${effectiveVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.85,
            style: 0.25,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (token !== currentToken) return;
    if (!response.ok) {
      console.warn('ElevenLabs error:', response.status);
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    if (token !== currentToken) return;

    const base64 = arrayBufferToBase64(arrayBuffer);
    const fileName = 'tts_' + effectiveVoiceId.slice(-8) + '_' + Math.abs(hashCode(text)) + '.mp3';
    const fileUri = FileSystem.cacheDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: 'base64' });
    if (token !== currentToken) return;

    audioCache.set(cacheKey, fileUri);
    startPlayback({ uri: fileUri }, token, opts);
  } catch (err) {
    console.warn('TTS error:', err);
  }
}

export function playLocalAudio(source: AudioSource, opts?: PlayOptions): void {
  if (debounced()) return;
  const token = ++currentToken;
  try {
    startPlayback(source, token, opts);
  } catch (err) {
    console.warn('Local audio play error:', err);
  }
}

export function stopAudio(): void {
  currentToken++;
  disposeCurrent();
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
