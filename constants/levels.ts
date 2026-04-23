import { theme } from './theme';

export const LEVELS = [
  { name: 'Beginner',     minXP: 0,    maxXP: 500,      color: theme.colors.textTertiary,  icon: '🌱' },
  { name: 'Elementary',   minXP: 500,  maxXP: 1500,     color: theme.colors.accentPrimary, icon: '📚' },
  { name: 'Intermediate', minXP: 1500, maxXP: 3000,     color: theme.colors.accentPrimary, icon: '🗣️' },
  { name: 'Advanced',     minXP: 3000, maxXP: 6000,     color: theme.colors.accentWarm,    icon: '⭐' },
  { name: 'Fluent',       minXP: 6000, maxXP: Infinity, color: theme.colors.accentWarm,    icon: '🏆' },
];

export function getLevelFromXP(xp: number) {
  return LEVELS.find(l => xp >= l.minXP && xp < l.maxXP) ?? LEVELS[0];
}

export function getXPProgress(xp: number) {
  const level = getLevelFromXP(xp);
  if (level.maxXP === Infinity) return 100;
  const progress = ((xp - level.minXP) / (level.maxXP - level.minXP)) * 100;
  return Math.round(progress);
}

export function getXPToNextLevel(xp: number) {
  const level = getLevelFromXP(xp);
  if (level.maxXP === Infinity) return 0;
  return level.maxXP - xp;
}
