import { describe, expect, it } from 'vitest'
import { calculatePulley, DEFAULT_INPUT, effortForce, mechanicalAdvantage } from './pulley'

describe('ideal pulley calculations', () => {
  it('defaults to 50 kg, gravity 10 and fixed KM=1', () => {
    expect(DEFAULT_INPUT.gravity).toBe(10)
    expect(calculatePulley(DEFAULT_INPUT)).toMatchObject({
      weight: 500,
      force: 500,
      mechanicalAdvantage: 1,
    })
  })
  it.each([
    [1, 2000],
    [2, 1000],
    [4, 500],
  ])('200 kg at g=10, KM=%i needs %i N', (strands, force) => {
    expect(calculatePulley({ ...DEFAULT_INPUT, kind: 'compound', mass: 200, strands }).force).toBe(
      force,
    )
  })
  it('50 N at KM=2 needs 25 N', () => expect(effortForce(50, 2)).toBe(25))
  it('4 × 10 cm is 40 cm and conserves work', () => {
    const result = calculatePulley({ ...DEFAULT_INPUT, kind: 'compound', strands: 4, heightCm: 10 })
    expect(result.ropeDistanceCm).toBe(40)
    expect(result.loadWorkJ).toBe(result.effortWorkJ)
  })
  it.each(Array.from({ length: 10 }, (_, i) => i + 1))('supports KM=%i', (strands) => {
    const result = calculatePulley({ ...DEFAULT_INPUT, kind: 'compound', strands, heightCm: 70 })
    expect(result.mechanicalAdvantage).toBe(strands)
    expect(result.effortWorkJ).toBeCloseTo(result.loadWorkJ)
  })
  it('fixed and movable are independent from compound setting', () => {
    expect(mechanicalAdvantage('fixed', 9)).toBe(1)
    expect(mechanicalAdvantage('movable', 9)).toBe(2)
  })
  it.each([
    { mass: -1 },
    { mass: NaN },
    { mass: Infinity },
    { mass: 1001 },
    { gravity: 0 },
    { gravity: -10 },
    { gravity: Infinity },
    { gravity: 31 },
    { heightCm: -1 },
    { heightCm: 101 },
    { heightCm: NaN },
    { kind: 'compound' as const, strands: 0 },
    { kind: 'compound' as const, strands: 11 },
    { kind: 'compound' as const, strands: 2.5 },
  ])('rejects invalid input %j', (input) => {
    expect(() => calculatePulley({ ...DEFAULT_INPUT, ...input })).toThrow(RangeError)
  })
  it('allows zero mass without dividing by weight', () => {
    expect(calculatePulley({ ...DEFAULT_INPUT, mass: 0 }).force).toBe(0)
    expect(() => effortForce(50, 0)).toThrow()
  })
})
