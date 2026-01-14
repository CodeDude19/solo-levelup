/**
 * Helper functions for game logic - XP, ranks, levels
 */

import { RANKS } from '../core/constants';

/**
 * Get current rank based on total XP
 * @param {number} totalXp - Total XP earned
 * @returns {Object} Current rank object
 */
export const getRank = (totalXp) => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalXp >= RANKS[i].minXp) return RANKS[i];
  }
  return RANKS[0];
};

/**
 * Get next rank (if any)
 * @param {number} totalXp - Total XP earned
 * @returns {Object|null} Next rank object or null if at max rank
 */
export const getNextRank = (totalXp) => {
  for (let i = 0; i < RANKS.length; i++) {
    if (totalXp < RANKS[i].minXp) return RANKS[i];
  }
  return null;
};

/**
 * Get level (1-6) based on XP
 * @param {number} totalXp - Total XP earned
 * @returns {number} Current level
 */
export const calculateLevel = (totalXp) => getRank(totalXp).level;

/**
 * Get XP progress within current rank (for progress bar)
 * @param {number} totalXp - Total XP earned
 * @returns {Object} Progress object with current, total, and percent
 */
export const calculateXpProgress = (totalXp) => {
  const currentRank = getRank(totalXp);
  const nextRank = getNextRank(totalXp);
  if (!nextRank) return { current: totalXp - currentRank.minXp, total: 0, percent: 100 };
  const currentInRank = totalXp - currentRank.minXp;
  const totalForRank = nextRank.minXp - currentRank.minXp;
  return { current: currentInRank, total: totalForRank, percent: (currentInRank / totalForRank) * 100 };
};
