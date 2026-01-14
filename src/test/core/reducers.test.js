import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  addQuest,
  completeQuest,
  failQuest,
  deleteQuest,
  undoQuest,
  addHabit,
  deleteHabit,
  toggleHabit,
  addReward,
  deleteReward,
  buyReward,
  claimLoginReward,
  applyMissedDayPenalty
} from '../../core/reducers'

// Mock base state
const createBaseState = () => ({
  player: {
    name: 'TestHunter',
    totalXp: 1000,
    gold: 500,
    health: 100,
    totalQuestsCompleted: 5,
    totalHabitsCompleted: 10,
    longestStreak: 7,
    lastLoginDate: '2024-01-14',
    checkedInToday: false
  },
  quests: [
    { id: 'q1', name: 'Test Quest 1', rank: 'B', reward: 100, goldReward: 50, penalty: 25 },
    { id: 'q2', name: 'Test Quest 2', rank: 'A', reward: 150, goldReward: 75, penalty: 40 }
  ],
  questLog: [],
  habits: [
    { id: 'h1', name: 'Exercise', icon: 'flame' },
    { id: 'h2', name: 'Read', icon: 'scroll' }
  ],
  habitLog: {},
  habitStreaks: { h1: 3, h2: 0 },
  rewards: [
    { id: 'r1', name: 'Netflix', cost: 200 },
    { id: 'r2', name: 'Gaming', cost: 300 }
  ]
})

// ==================== QUEST TESTS ====================

describe('Quest Reducers', () => {
  let state

  beforeEach(() => {
    state = createBaseState()
  })

  describe('addQuest', () => {
    it('should add a quest to the list', () => {
      const newQuest = { id: 'q3', name: 'New Quest', rank: 'S', reward: 200, goldReward: 100, penalty: 50 }
      const newState = addQuest(state, newQuest)

      expect(newState.quests).toHaveLength(3)
      expect(newState.quests[2]).toEqual(newQuest)
    })

    it('should not modify original state', () => {
      const newQuest = { id: 'q3', name: 'New Quest' }
      addQuest(state, newQuest)

      expect(state.quests).toHaveLength(2)
    })
  })

  describe('completeQuest', () => {
    it('should add XP and gold when completing quest', () => {
      const quest = state.quests[0]
      const newState = completeQuest(state, quest)

      expect(newState.player.totalXp).toBe(1100) // 1000 + 100
      expect(newState.player.gold).toBe(550) // 500 + 50
    })

    it('should increment totalQuestsCompleted', () => {
      const quest = state.quests[0]
      const newState = completeQuest(state, quest)

      expect(newState.player.totalQuestsCompleted).toBe(6) // 5 + 1
    })

    it('should remove quest from active quests', () => {
      const quest = state.quests[0]
      const newState = completeQuest(state, quest)

      expect(newState.quests).toHaveLength(1)
      expect(newState.quests.find(q => q.id === 'q1')).toBeUndefined()
    })

    it('should add quest to questLog with completed=true', () => {
      const quest = state.quests[0]
      const newState = completeQuest(state, quest)

      expect(newState.questLog).toHaveLength(1)
      expect(newState.questLog[0].completed).toBe(true)
      expect(newState.questLog[0].completedAt).toBeDefined()
    })
  })

  describe('failQuest', () => {
    it('should apply double penalty to XP', () => {
      const quest = state.quests[0] // penalty: 25
      const newState = failQuest(state, quest)

      expect(newState.player.totalXp).toBe(950) // 1000 - (25 * 2)
    })

    it('should not let XP go below 0', () => {
      state.player.totalXp = 10
      const quest = { ...state.quests[0], penalty: 100 }
      const newState = failQuest(state, quest)

      expect(newState.player.totalXp).toBe(0)
    })

    it('should remove quest from active quests', () => {
      const quest = state.quests[0]
      const newState = failQuest(state, quest)

      expect(newState.quests.find(q => q.id === 'q1')).toBeUndefined()
    })

    it('should add quest to questLog with completed=false', () => {
      const quest = state.quests[0]
      const newState = failQuest(state, quest, 'manual')

      expect(newState.questLog[0].completed).toBe(false)
      expect(newState.questLog[0].failReason).toBe('manual')
      expect(newState.questLog[0].penaltyApplied).toBe(50) // 25 * 2
    })

    it('should track overdue reason', () => {
      const quest = state.quests[0]
      const newState = failQuest(state, quest, 'overdue')

      expect(newState.questLog[0].failReason).toBe('overdue')
    })
  })

  describe('deleteQuest', () => {
    it('should remove quest without logging', () => {
      const newState = deleteQuest(state, 'q1')

      expect(newState.quests).toHaveLength(1)
      expect(newState.questLog).toHaveLength(0)
    })
  })

  describe('undoQuest', () => {
    it('should restore completed quest and reverse rewards', () => {
      // First complete a quest
      const quest = state.quests[0]
      let newState = completeQuest(state, quest)

      // Then undo it
      const loggedQuest = newState.questLog[0]
      newState = undoQuest(newState, loggedQuest)

      expect(newState.player.totalXp).toBe(1000) // Back to original
      expect(newState.player.gold).toBe(500) // Back to original
      expect(newState.player.totalQuestsCompleted).toBe(5) // Back to original
      expect(newState.quests).toHaveLength(2)
      expect(newState.questLog).toHaveLength(0)
    })

    it('should restore failed quest and reverse penalty', () => {
      const quest = state.quests[0]
      let newState = failQuest(state, quest)

      const loggedQuest = newState.questLog[0]
      newState = undoQuest(newState, loggedQuest)

      expect(newState.player.totalXp).toBe(1000) // Penalty reversed
      expect(newState.quests).toHaveLength(2)
    })
  })
})

// ==================== HABIT TESTS ====================

describe('Habit Reducers', () => {
  let state

  beforeEach(() => {
    state = createBaseState()
  })

  describe('addHabit', () => {
    it('should add a habit to the list', () => {
      const newHabit = { id: 'h3', name: 'Meditate', icon: 'eye' }
      const newState = addHabit(state, newHabit)

      expect(newState.habits).toHaveLength(3)
      expect(newState.habits[2]).toEqual(newHabit)
    })
  })

  describe('deleteHabit', () => {
    it('should remove a habit', () => {
      const newState = deleteHabit(state, 'h1')

      expect(newState.habits).toHaveLength(1)
      expect(newState.habits.find(h => h.id === 'h1')).toBeUndefined()
    })
  })

  describe('toggleHabit', () => {
    const today = '2024-01-15'

    it('should complete habit and add XP with streak multiplier', () => {
      // h1 has streak of 3, so completing gives (3+1) * 10 = 40 XP
      const { newState, wasCompleted, xpGain, newStreak } = toggleHabit(state, 'h1', today)

      expect(wasCompleted).toBe(false) // It was NOT completed before
      expect(xpGain).toBe(40) // (3+1) * 10
      expect(newStreak).toBe(4)
      expect(newState.player.totalXp).toBe(1040)
      expect(newState.player.gold).toBe(505) // +5 gold
      expect(newState.habitLog[today]).toContain('h1')
      expect(newState.habitStreaks.h1).toBe(4)
    })

    it('should complete habit with no prior streak', () => {
      // h2 has streak of 0, so completing gives 1 * 10 = 10 XP
      const { newState, xpGain, newStreak } = toggleHabit(state, 'h2', today)

      expect(xpGain).toBe(10)
      expect(newStreak).toBe(1)
      expect(newState.habitStreaks.h2).toBe(1)
    })

    it('should uncomplete habit if already completed today', () => {
      // First complete
      let result = toggleHabit(state, 'h1', today)

      // Then uncomplete
      result = toggleHabit(result.newState, 'h1', today)

      expect(result.wasCompleted).toBe(true) // It WAS completed before
      expect(result.xpGain).toBe(0) // No XP for uncompleting
      expect(result.newStreak).toBe(3) // Back to 3
      expect(result.newState.habitLog[today]).not.toContain('h1')
    })

    it('should update longestStreak if new streak is higher', () => {
      state.habitStreaks.h1 = 10
      state.player.longestStreak = 7

      const { newState } = toggleHabit(state, 'h1', today)

      expect(newState.player.longestStreak).toBe(11)
    })

    it('should not update longestStreak if new streak is lower', () => {
      state.habitStreaks.h1 = 3
      state.player.longestStreak = 10

      const { newState } = toggleHabit(state, 'h1', today)

      expect(newState.player.longestStreak).toBe(10)
    })

    it('should increment totalHabitsCompleted', () => {
      const { newState } = toggleHabit(state, 'h1', today)

      expect(newState.player.totalHabitsCompleted).toBe(11)
    })
  })
})

// ==================== REWARD TESTS ====================

describe('Reward Reducers', () => {
  let state

  beforeEach(() => {
    state = createBaseState()
  })

  describe('addReward', () => {
    it('should add a reward to the shop', () => {
      const newReward = { id: 'r3', name: 'Movie', cost: 150 }
      const newState = addReward(state, newReward)

      expect(newState.rewards).toHaveLength(3)
      expect(newState.rewards[2]).toEqual(newReward)
    })
  })

  describe('deleteReward', () => {
    it('should remove a reward', () => {
      const newState = deleteReward(state, 'r1')

      expect(newState.rewards).toHaveLength(1)
      expect(newState.rewards.find(r => r.id === 'r1')).toBeUndefined()
    })
  })

  describe('buyReward', () => {
    it('should deduct gold when buying reward', () => {
      const reward = state.rewards[0] // cost: 200
      const { newState, success } = buyReward(state, reward)

      expect(success).toBe(true)
      expect(newState.player.gold).toBe(300) // 500 - 200
    })

    it('should fail if not enough gold', () => {
      state.player.gold = 100
      const reward = state.rewards[0] // cost: 200
      const { newState, success } = buyReward(state, reward)

      expect(success).toBe(false)
      expect(newState.player.gold).toBe(100) // Unchanged
    })

    it('should allow buying if exact gold amount', () => {
      state.player.gold = 200
      const reward = state.rewards[0] // cost: 200
      const { newState, success } = buyReward(state, reward)

      expect(success).toBe(true)
      expect(newState.player.gold).toBe(0)
    })
  })
})

// ==================== PLAYER TESTS ====================

describe('Player Reducers', () => {
  let state

  beforeEach(() => {
    state = createBaseState()
  })

  describe('claimLoginReward', () => {
    it('should add XP and mark as checked in', () => {
      const newState = claimLoginReward(state, 50, '2024-01-15')

      expect(newState.player.totalXp).toBe(1050)
      expect(newState.player.checkedInToday).toBe(true)
      expect(newState.player.lastLoginDate).toBe('2024-01-15')
    })
  })

  describe('applyMissedDayPenalty', () => {
    it('should deduct XP for missed days', () => {
      const newState = applyMissedDayPenalty(state, 200, '2024-01-16')

      expect(newState.player.totalXp).toBe(800) // 1000 - 200
      expect(newState.player.checkedInToday).toBe(false)
      expect(newState.player.lastLoginDate).toBe('2024-01-16')
    })

    it('should not let XP go below 0', () => {
      state.player.totalXp = 50
      const newState = applyMissedDayPenalty(state, 200, '2024-01-16')

      expect(newState.player.totalXp).toBe(0)
    })
  })
})
