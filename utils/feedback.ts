/**
 * feedback.ts
 * Single source of truth for all quiz/lesson haptic + sound feedback.
 *
 * Sound files expected in assets/audio/fx/:
 *   correct.mp3  — short bright ding
 *   wrong.mp3    — low dull thud
 *   close.mp3    — soft mid-tone "almost"
 *   streak.mp3   — quick upward chime burst
 *   levelup.mp3  — triumphant short fanfare
 *
 * If a file is absent the call silently falls back to haptics only.
 */

import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

// ─── Sound assets ─────────────────────────────────────────────────────────────
// Swap null → require('../assets/audio/fx/correct.mp3') once files are added.
const SFX = {
  correct: require('../assets/audio/fx/correct.mp3') as number,
  wrong:   require('../assets/audio/fx/wrong.mp3') as number,
  close:   require('../assets/audio/fx/close.mp3') as number,
  streak:  require('../assets/audio/fx/streak.mp3') as number,
  levelup: require('../assets/audio/fx/levelup.mp3') as number,
};

// ─── Internal helper ──────────────────────────────────────────────────────────
function playFx(asset: number | null): void {
  if (!asset) return;
  try {
    const player = createAudioPlayer(asset);
    player.play();
    // Dispose after 4 s (well past any UI sound)
    setTimeout(() => { try { player.remove(); } catch {} }, 4000);
  } catch {
    // Never crash the UI over a sound
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Correct answer — bright haptic + ding */
export function feedbackCorrect(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  playFx(SFX.correct);
}

/** Wrong answer — error haptic + thud */
export function feedbackWrong(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  playFx(SFX.wrong);
}

/** Close / almost — warning haptic + soft tone */
export function feedbackClose(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  playFx(SFX.close);
}

/**
 * Streak moment (3-in-a-row, 5-in-a-row, etc.)
 * Fires a rapid double-tap haptic pattern then a chime.
 */
export async function feedbackStreak(): Promise<void> {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  await delay(80);
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await delay(80);
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  playFx(SFX.streak);
}

/**
 * Level-up — long celebratory pattern then fanfare.
 */
export async function feedbackLevelUp(): Promise<void> {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await delay(100);
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await delay(60);
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await delay(60);
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  playFx(SFX.levelup);
}

/** Soft tap — used for button presses that aren't answer events */
export function feedbackTap(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

// ─── Util ──────────────────────────────────────────────────────────────────────
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
