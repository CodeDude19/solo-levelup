import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getToday, formatTimeRemaining } from '../../utils/formatters'

describe('getToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return date in YYYY-MM-DD format', () => {
    vi.setSystemTime(new Date(2024, 0, 15)) // Jan 15, 2024
    expect(getToday()).toBe('2024-01-15')
  })

  it('should pad single digit months', () => {
    vi.setSystemTime(new Date(2024, 4, 5)) // May 5, 2024
    expect(getToday()).toBe('2024-05-05')
  })

  it('should pad single digit days', () => {
    vi.setSystemTime(new Date(2024, 11, 1)) // Dec 1, 2024
    expect(getToday()).toBe('2024-12-01')
  })

  it('should handle year boundaries', () => {
    vi.setSystemTime(new Date(2023, 11, 31)) // Dec 31, 2023
    expect(getToday()).toBe('2023-12-31')
  })
})

describe('formatTimeRemaining', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return "NOW" for past dates', () => {
    expect(formatTimeRemaining('2024-01-14T12:00:00')).toBe('NOW')
  })

  it('should return "NOW" for current time', () => {
    expect(formatTimeRemaining('2024-01-15T12:00:00')).toBe('NOW')
  })

  it('should format minutes only', () => {
    expect(formatTimeRemaining('2024-01-15T12:45:00')).toBe('45m')
  })

  it('should format hours and minutes', () => {
    expect(formatTimeRemaining('2024-01-15T15:30:00')).toBe('3h 30m')
  })

  it('should format days and hours', () => {
    expect(formatTimeRemaining('2024-01-17T15:00:00')).toBe('2d 3h')
  })

  it('should handle exactly 1 day', () => {
    expect(formatTimeRemaining('2024-01-16T12:00:00')).toBe('1d 0h')
  })

  it('should handle exactly 1 hour', () => {
    expect(formatTimeRemaining('2024-01-15T13:00:00')).toBe('1h 0m')
  })
})
