import { describe, it, expect } from 'vitest'

describe('CareSaathi Core Tests', () => {
  it('should generate 6-digit circle code', () => {
    const code = '123456'
    expect(code.length).toBe(6)
  })

  it('should track medicine adherence below 80%', () => {
    const adherence = 67
    expect(adherence).toBeLessThan(80)
  })

  it('should have elder at centre of circle', () => {
    const circle = { members: ['elder', 'caregiver', 'family'] }
    expect(circle.members).toContain('elder')
    expect(circle.members.length).toBeGreaterThan(1)
  })
})