/**
 * Pure reducer functions for state management
 * These are pure functions that take state and return new state
 * Can be tested independently without React
 */

import { getToday } from '../utils/formatters'

// ==================== QUEST REDUCERS ====================

/**
 * Add a new quest to state
 */
export const addQuest = (state, quest) => ({
  ...state,
  quests: [...state.quests, quest]
})

/**
 * Complete a quest - add XP, gold, move to log
 */
export const completeQuest = (state, quest) => ({
  ...state,
  player: {
    ...state.player,
    totalXp: state.player.totalXp + quest.reward,
    gold: state.player.gold + quest.goldReward,
    totalQuestsCompleted: state.player.totalQuestsCompleted + 1
  },
  quests: state.quests.filter(q => q.id !== quest.id),
  questLog: [...state.questLog, {
    ...quest,
    completed: true,
    completedAt: new Date().toISOString()
  }]
})

/**
 * Fail a quest - deduct XP (double penalty), move to log
 */
export const failQuest = (state, quest, reason = 'manual') => {
  const doublePenalty = quest.penalty * 2
  return {
    ...state,
    player: {
      ...state.player,
      totalXp: Math.max(0, state.player.totalXp - doublePenalty)
    },
    quests: state.quests.filter(q => q.id !== quest.id),
    questLog: [...state.questLog, {
      ...quest,
      completed: false,
      penaltyApplied: doublePenalty,
      completedAt: new Date().toISOString(),
      failReason: reason
    }]
  }
}

/**
 * Delete a quest without logging
 */
export const deleteQuest = (state, questId) => ({
  ...state,
  quests: state.quests.filter(q => q.id !== questId)
})

/**
 * Undo a quest from the log - restore quest and reverse XP/gold changes
 */
export const undoQuest = (state, quest) => {
  const newQuestLog = state.questLog.filter(q => q.id !== quest.id)

  const restoredQuest = {
    id: quest.id,
    name: quest.name,
    rank: quest.rank,
    reward: quest.reward,
    goldReward: quest.goldReward,
    penalty: quest.penalty,
    createdAt: quest.createdAt
  }

  let newTotalXp = state.player.totalXp
  let newGold = state.player.gold
  let newTotalQuestsCompleted = state.player.totalQuestsCompleted

  if (quest.completed) {
    // Was completed - reverse the rewards
    newTotalXp = Math.max(0, newTotalXp - quest.reward)
    newGold = Math.max(0, newGold - quest.goldReward)
    newTotalQuestsCompleted = Math.max(0, newTotalQuestsCompleted - 1)
  } else {
    // Was failed - restore the penalty
    newTotalXp = newTotalXp + quest.penaltyApplied
  }

  return {
    ...state,
    player: {
      ...state.player,
      totalXp: newTotalXp,
      gold: newGold,
      totalQuestsCompleted: newTotalQuestsCompleted
    },
    quests: [...state.quests, restoredQuest],
    questLog: newQuestLog
  }
}

// ==================== HABIT REDUCERS ====================

/**
 * Add a new habit to state
 */
export const addHabit = (state, habit) => ({
  ...state,
  habits: [...state.habits, habit]
})

/**
 * Delete a habit
 */
export const deleteHabit = (state, habitId) => ({
  ...state,
  habits: state.habits.filter(h => h.id !== habitId)
})

/**
 * Toggle a habit for today
 * Returns { newState, wasCompleted, xpGain, newStreak }
 */
export const toggleHabit = (state, habitId, today = getToday()) => {
  const todayHabits = state.habitLog[today] || []
  const wasCompleted = todayHabits.includes(habitId)

  if (wasCompleted) {
    // Uncomplete - remove from log, decrease streak
    return {
      newState: {
        ...state,
        habitLog: {
          ...state.habitLog,
          [today]: state.habitLog[today].filter(id => id !== habitId)
        },
        habitStreaks: {
          ...state.habitStreaks,
          [habitId]: Math.max(0, (state.habitStreaks[habitId] || 0) - 1)
        }
      },
      wasCompleted: true,
      xpGain: 0,
      newStreak: Math.max(0, (state.habitStreaks[habitId] || 0) - 1)
    }
  } else {
    // Complete - add to log, increase streak, add XP
    const currentStreak = state.habitStreaks[habitId] || 0
    const newStreak = currentStreak + 1
    const xpGain = 10 * newStreak

    return {
      newState: {
        ...state,
        player: {
          ...state.player,
          totalXp: state.player.totalXp + xpGain,
          gold: state.player.gold + 5,
          totalHabitsCompleted: state.player.totalHabitsCompleted + 1,
          longestStreak: Math.max(state.player.longestStreak, newStreak)
        },
        habitLog: {
          ...state.habitLog,
          [today]: [...todayHabits, habitId]
        },
        habitStreaks: {
          ...state.habitStreaks,
          [habitId]: newStreak
        }
      },
      wasCompleted: false,
      xpGain,
      newStreak
    }
  }
}

// ==================== REWARD REDUCERS ====================

/**
 * Add a new reward to the shop
 */
export const addReward = (state, reward) => ({
  ...state,
  rewards: [...state.rewards, reward]
})

/**
 * Delete a reward from the shop
 */
export const deleteReward = (state, rewardId) => ({
  ...state,
  rewards: state.rewards.filter(r => r.id !== rewardId)
})

/**
 * Buy a reward - deduct gold
 * Returns { newState, success } - success is false if not enough gold
 */
export const buyReward = (state, reward) => {
  if (state.player.gold < reward.cost) {
    return { newState: state, success: false }
  }

  return {
    newState: {
      ...state,
      player: {
        ...state.player,
        gold: state.player.gold - reward.cost
      }
    },
    success: true
  }
}

// ==================== PLAYER REDUCERS ====================

/**
 * Claim daily login reward
 */
export const claimLoginReward = (state, xpAmount, today = getToday()) => ({
  ...state,
  player: {
    ...state.player,
    totalXp: state.player.totalXp + xpAmount,
    lastLoginDate: today,
    checkedInToday: true
  }
})

/**
 * Apply missed day penalty
 */
export const applyMissedDayPenalty = (state, penalty, today = getToday()) => ({
  ...state,
  player: {
    ...state.player,
    totalXp: Math.max(0, state.player.totalXp - penalty),
    lastLoginDate: today,
    checkedInToday: false
  }
})
