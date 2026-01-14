/**
 * Initial state management - handles localStorage hydration
 */

import { MAX_HEALTH } from './constants';
import { getToday } from '../utils/formatters';

/**
 * Get initial application state from localStorage or create default state
 * @returns {Object} Application state
 */
export const getInitialState = () => {
  const saved = localStorage.getItem('theSystem');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Deduplicate questLog - only remove true duplicates (same ID + same completedAt)
      if (parsed.questLog && parsed.questLog.length > 0) {
        parsed.questLog = [...new Map(parsed.questLog.map(q => [`${q.id}-${q.completedAt}`, q])).values()];
      }
      return parsed;
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
  }

  return {
    onboarded: false,
    player: {
      name: 'Hunter',
      track: 'custom',
      totalXp: 0,
      gold: 100,
      health: MAX_HEALTH,
      lastLoginDate: null,
      checkedInToday: false,
      createdAt: getToday(),
      totalQuestsCompleted: 0,
      totalHabitsCompleted: 0,
      longestStreak: 0
    },
    quests: [],
    questLog: [],
    habits: [],
    habitLog: {},
    habitStreaks: {},
    vision: {
      fuel: '',
      fear: ''
    },
    rewards: [
      { id: '1', name: '1 Episode Netflix', cost: 200, icon: 'gift' },
      { id: '2', name: 'Snack Break', cost: 100, icon: 'gift' },
      { id: '3', name: '30min Gaming', cost: 300, icon: 'gift' }
    ]
  };
};
