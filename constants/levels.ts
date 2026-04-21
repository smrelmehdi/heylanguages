export const LEVELS = [
  { name: 'Beginner',     minXP: 0,    maxXP: 500,      color: '#888',    icon: '🌱' },
  { name: 'Elementary',   minXP: 500,  maxXP: 1500,     color: '#00897B', icon: '📚' },
  { name: 'Intermediate', minXP: 1500, maxXP: 3000,     color: '#1CB0F6', icon: '🗣️' },
  { name: 'Advanced',     minXP: 3000, maxXP: 6000,     color: '#FFD900', icon: '⭐' },
  { name: 'Fluent',       minXP: 6000, maxXP: Infinity,  color: '#FF9600', icon: '🏆' },
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
