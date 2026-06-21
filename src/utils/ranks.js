/**
 * Rank tier system for EcoMetrics gamification.
 * Maps user level to a named rank title.
 */

export const RANK_TIERS = [
  { minLevel: 1,  maxLevel: 2,  name: 'Seedling',  color: '#10b981' },
  { minLevel: 3,  maxLevel: 4,  name: 'Sapling',   color: '#059669' },
  { minLevel: 5,  maxLevel: 7,  name: 'Guardian',  color: '#0ea5e9' },
  { minLevel: 8,  maxLevel: 10, name: 'Steward',   color: '#6366f1' },
  { minLevel: 11, maxLevel: Infinity, name: 'Champion', color: '#f59e0b' },
];

/**
 * Returns the rank name and color for a given user level.
 * @param {number} level - Current user level (1+)
 * @returns {{ name: string, color: string }}
 */
export function getRank(level) {
  const tier = RANK_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel);
  return tier ?? RANK_TIERS[0];
}
