import { describe, it, expect } from 'vitest'
import { generateId } from '../../utils/generators'

describe('generateId', () => {
  it('should return a string', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
  })

  it('should return a 9 character string', () => {
    const id = generateId()
    expect(id.length).toBe(9)
  })

  it('should generate unique IDs', () => {
    const ids = new Set()
    for (let i = 0; i < 1000; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(1000)
  })

  it('should only contain alphanumeric characters', () => {
    const id = generateId()
    expect(id).toMatch(/^[a-z0-9]+$/)
  })
})
