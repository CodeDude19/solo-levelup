/**
 * Core game constants and configuration
 */

// Base URL for assets (handles GitHub Pages subdirectory)
export const BASE_URL = import.meta.env.BASE_URL || '/';

// 6-Level System: Each level = a rank, XP thresholds increase
export const RANKS = [
  { name: 'Silver', level: 1, minXp: 0, color: '#c0c0c0', title: 'The Journey Begins', icon: `${BASE_URL}Silver_1_Rank.png` },
  { name: 'Gold', level: 2, minXp: 500, color: '#ffd700', title: 'Rising Hunter', icon: `${BASE_URL}Gold_1_Rank.png` },
  { name: 'Platinum', level: 3, minXp: 1500, color: '#00ff88', title: 'Proven Warrior', icon: `${BASE_URL}Platinum_1_Rank.png` },
  { name: 'Diamond', level: 4, minXp: 4000, color: '#00ffff', title: 'Elite Discipline', icon: `${BASE_URL}Diamond_1_Rank.png` },
  { name: 'Immortal', level: 5, minXp: 10000, color: '#9d4edd', title: 'Unbreakable Will', icon: `${BASE_URL}Immortal_1_Rank.png` },
  { name: 'Radiant', level: 6, minXp: 25000, color: '#ff6600', title: 'Shadow Monarch', icon: `${BASE_URL}Radiant_Rank.png` }
];

// Quest Priority Ranks (Threat Levels)
export const QUEST_RANKS = [
  { id: 'S', name: 'S-Rank', label: 'CRITICAL', color: '#ff3333', bgColor: 'rgba(255, 51, 51, 0.15)', icon: 'skull', description: 'Boss-level priority', multiplier: 2 },
  { id: 'A', name: 'A-Rank', label: 'HIGH', color: '#ff6600', bgColor: 'rgba(255, 102, 0, 0.15)', icon: 'flame', description: 'Urgent quest', multiplier: 1.5 },
  { id: 'B', name: 'B-Rank', label: 'NORMAL', color: '#00ffff', bgColor: 'rgba(0, 255, 255, 0.15)', icon: 'swords', description: 'Standard quest', multiplier: 1 },
  { id: 'C', name: 'C-Rank', label: 'LOW', color: '#808080', bgColor: 'rgba(128, 128, 128, 0.15)', icon: 'scroll', description: 'When you have time', multiplier: 0.75 }
];

// Game balance constants
export const DAILY_LOGIN_XP = 50;
export const MISSED_DAY_PENALTY = 100;
export const MAX_HEALTH = 100;
export const STREAK_BREAK_PENALTY = 20;
