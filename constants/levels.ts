import { theme } from './theme';

export const LEVELS = [
  { name: 'Beginner',     minXP: 0,    maxXP: 500,      color: theme.colors.textTertiary,  icon: '🌱' },
  { name: 'Elementary',   minXP: 500,  maxXP: 1500,     color: theme.colors.accentPrimary, icon: '📚' },
  { name: 'Intermediate', minXP: 1500, maxXP: 3000,     color: theme.colors.accentPrimary, icon: '🗣️' },
  { name: 'Advanced',     minXP: 3000, maxXP: 6000,     color: theme.colors.accentWarm,    icon: '⭐' },
  { name: 'Fluent',       minXP: 6000, maxXP: Infinity, color: theme.colors.accentWarm,    icon: '🏆' },
];

export function getLevelFromXP(xp: number) {
  const normalizedXp = Math.max(0, xp);
  return LEVELS.find(l => normalizedXp >= l.minXP && normalizedXp < l.maxXP) ?? LEVELS[0];
}

export function getXPProgress(xp: number) {
  const normalizedXp = Math.max(0, xp);
  const level = getLevelFromXP(normalizedXp);
  if (level.maxXP === Infinity) return 100;
  const progress = ((normalizedXp - level.minXP) / (level.maxXP - level.minXP)) * 100;
  // Do not display 100% until the next level has actually been reached.
  return Math.min(99, Math.max(0, Math.round(progress)));
}

export function getXPToNextLevel(xp: number) {
  const normalizedXp = Math.max(0, xp);
  const level = getLevelFromXP(normalizedXp);
  if (level.maxXP === Infinity) return 0;
  return level.maxXP - normalizedXp;
}
