import { describe, it, expect } from 'vitest'
import { getRank, getNextRank, calculateLevel, calculateXpProgress } from './helpers'

describe('getRank', () => {
  it('should return Silver rank for 0 XP', () => {
    const rank = getRank(0)
    expect(rank.name).toBe('Silver')
    expect(rank.level).toBe(1)
  })

  it('should return Silver rank for XP below 500', () => {
    expect(getRank(100).name).toBe('Silver')
    expect(getRank(499).name).toBe('Silver')
  })

  it('should return Gold rank for XP 500-1499', () => {
    expect(getRank(500).name).toBe('Gold')
    expect(getRank(1000).name).toBe('Gold')
    expect(getRank(1499).name).toBe('Gold')
  })

  it('should return Platinum rank for XP 1500-3999', () => {
    expect(getRank(1500).name).toBe('Platinum')
    expect(getRank(3999).name).toBe('Platinum')
  })

  it('should return Diamond rank for XP 4000-9999', () => {
    expect(getRank(4000).name).toBe('Diamond')
    expect(getRank(9999).name).toBe('Diamond')
  })

  it('should return Immortal rank for XP 10000-24999', () => {
    expect(getRank(10000).name).toBe('Immortal')
    expect(getRank(24999).name).toBe('Immortal')
  })

  it('should return Radiant rank for XP 25000+', () => {
    expect(getRank(25000).name).toBe('Radiant')
    expect(getRank(100000).name).toBe('Radiant')
  })
})

describe('getNextRank', () => {
  it('should return Gold as next rank for 0 XP', () => {
    const nextRank = getNextRank(0)
    expect(nextRank.name).toBe('Gold')
  })

  it('should return Platinum as next rank for 500 XP', () => {
    const nextRank = getNextRank(500)
    expect(nextRank.name).toBe('Platinum')
  })

  it('should return null for max rank (25000+ XP)', () => {
    const nextRank = getNextRank(25000)
    expect(nextRank).toBeNull()
  })

  it('should return next rank at boundary', () => {
    expect(getNextRank(499).name).toBe('Gold')
    expect(getNextRank(1499).name).toBe('Platinum')
  })
})

describe('calculateLevel', () => {
  it('should return level 1 for Silver rank', () => {
    expect(calculateLevel(0)).toBe(1)
    expect(calculateLevel(499)).toBe(1)
  })

  it('should return level 2 for Gold rank', () => {
    expect(calculateLevel(500)).toBe(2)
  })

  it('should return level 6 for Radiant rank', () => {
    expect(calculateLevel(25000)).toBe(6)
  })
})

describe('calculateXpProgress', () => {
  it('should calculate progress within Silver rank', () => {
    const progress = calculateXpProgress(250)
    expect(progress.current).toBe(250)
    expect(progress.total).toBe(500) // Silver to Gold is 500 XP
    expect(progress.percent).toBe(50)
  })

  it('should calculate progress within Gold rank', () => {
    const progress = calculateXpProgress(1000)
    expect(progress.current).toBe(500) // 1000 - 500 (Gold min)
    expect(progress.total).toBe(1000) // 1500 - 500
    expect(progress.percent).toBe(50)
  })

  it('should return 100% for max rank', () => {
    const progress = calculateXpProgress(30000)
    expect(progress.percent).toBe(100)
  })

  it('should handle exact rank boundaries', () => {
    const progress = calculateXpProgress(500)
    expect(progress.current).toBe(0) // Just entered Gold
    expect(progress.percent).toBe(0)
  })
})
