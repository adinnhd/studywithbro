import { describe, expect, it } from 'vitest'
import { analyzeOperator, calculateEnergy, calculateEnergyFromRope } from './pulleyEnergy'

const base = { weight: 900, strands: 3, efficiencyPercent: 80, height: 2 }
const operatorBase = {
  mass: 50,
  maxForce: 250,
  maxRope: 8,
  height: 3,
  efficiencyPercent: 100,
  gravity: 10,
  strands: 2,
}

describe('work and energy in a separate steady-lift model', () => {
  it('case A: ideal work from rope travel', () => {
    expect(
      calculateEnergyFromRope({ weight: 750, strands: 4, efficiencyPercent: 100, rope: 12 }),
    ).toMatchObject({
      height: 3,
      force: 187.5,
      inputWork: 2250,
      outputWork: 2250,
      lostEnergy: 0,
      idealMA: 4,
      actualMA: 4,
    })
  })

  it('case B: converts 80 percent to 0.8 and conserves total energy', () => {
    const result = calculateEnergy(base)
    expect(result).toMatchObject({
      efficiency: 0.8,
      idealMA: 3,
      ropeDistance: 6,
      inputWork: 2250,
      outputWork: 1800,
      lostEnergy: 450,
    })
    expect(result.force).toBeCloseTo(375)
    expect(result.actualMA).toBeCloseTo(2.4)
    expect(result.inputWork).toBeCloseTo(result.force * result.ropeDistance)
  })

  it('case C: less force trades for more rope, without reducing ideal work', () => {
    const a = calculateEnergy({ weight: 900, height: 1.6, strands: 3, efficiencyPercent: 100 })
    const b = calculateEnergy({ weight: 900, height: 1.6, strands: 5, efficiencyPercent: 100 })
    expect(a.force).toBe(300)
    expect(b.force).toBe(180)
    expect(a.ropeDistance).toBeCloseTo(4.8)
    expect(b.ropeDistance).toBe(8)
    expect(a.inputWork).toBe(1440)
    expect(b.inputWork).toBe(1440)
  })

  it('less efficiency increases input and dissipated energy at fixed load and height', () => {
    const ideal = calculateEnergy({ ...base, efficiencyPercent: 100 })
    const real = calculateEnergy(base)
    expect(real.outputWork).toBe(ideal.outputWork)
    expect(real.ropeDistance).toBe(ideal.ropeDistance)
    expect(real.inputWork).toBeGreaterThan(ideal.inputWork)
    expect(real.lostEnergy).toBeGreaterThan(ideal.lostEnergy)
    expect(real.force).toBeGreaterThan(ideal.force)
  })

  it('obeys force, distance, MA and energy identities across all configurations', () => {
    for (const strands of Array.from({ length: 10 }, (_, i) => i + 1))
      for (const efficiencyPercent of [1, 25, 76, 80, 99, 100])
        for (const height of [0.1, 1.25, 3, 100]) {
          const result = calculateEnergy({ weight: 684, strands, efficiencyPercent, height })
          expect(result.actualMA).toBeCloseTo(684 / result.force)
          expect(result.efficiency).toBeCloseTo(result.outputWork / result.inputWork)
          expect(result.actualMA / result.idealMA).toBeCloseTo(result.efficiency)
          expect(result.force * result.ropeDistance).toBeCloseTo(result.inputWork)
          expect(result.inputWork).toBeCloseTo(result.outputWork + result.lostEnergy)
          expect(result.lostEnergy).toBeGreaterThanOrEqual(0)
          expect(Number.isFinite(result.inputWork)).toBe(true)
        }
  })

  for (const key of ['weight', 'strands', 'efficiencyPercent', 'height'] as const)
    it.each([0, -1, NaN, Infinity, -Infinity])(`rejects invalid ${key} = %s`, (value) => {
      expect(() => calculateEnergy({ ...base, [key]: value })).toThrow(RangeError)
    })
  it.each([
    { strands: 1.5 },
    { strands: 11 },
    { efficiencyPercent: 101 },
    { height: 1001 },
    { weight: 1000001 },
  ])('rejects unsupported inputs %j', (invalid) => {
    expect(() => calculateEnergy({ ...base, ...invalid })).toThrow(RangeError)
  })
  it.each([0, -1, NaN, Infinity, 1001])('rejects invalid rope distance %s', (rope) => {
    expect(() => calculateEnergyFromRope({ ...base, rope })).toThrow(RangeError)
  })
})

describe('operator limits', () => {
  it('case D: only two strands meet rope constraint, with a 50 kg capacity', () => {
    const result = analyzeOperator(operatorBase, [2, 3, 4])
    expect(result.configurations.filter((item) => item.ropeOK).map((item) => item.strands)).toEqual(
      [2],
    )
    expect(result.feasible.map((item) => item.strands)).toEqual([2])
    expect(result.maxMass).toBe(50)
    expect(result.selected.maxMass).toBe(50)
    expect(result.selected.forceOK).toBe(true)
    expect(result.selected.ropeOK).toBe(true)
  })
  it('fails the selected system when force passes but rope does not', () => {
    const result = analyzeOperator({ ...operatorBase, strands: 4 })
    expect(result.selected.forceOK).toBe(true)
    expect(result.selected.ropeOK).toBe(false)
    expect(result.selected.usable).toBe(false)
    expect(result.selected.maxMass).toBe(0)
    expect(result.selected.forceLimitedMass).toBe(100)
  })
  it('explains no feasible system and distinguishes load failure from capacity', () => {
    const result = analyzeOperator({ ...operatorBase, mass: 51 })
    expect(result.feasible).toHaveLength(0)
    expect(result.maxMass).toBe(50)
    expect(result.configurations.every((item) => !item.forceOK || !item.ropeOK)).toBe(true)
  })
  it('no rope-feasible configuration has zero capacity for the target', () => {
    const result = analyzeOperator({ ...operatorBase, maxRope: 1 })
    expect(result.maxMass).toBe(0)
    expect(result.feasible).toHaveLength(0)
  })
  it('lower efficiency reduces capacity and raises required force', () => {
    const result = analyzeOperator({ ...operatorBase, mass: 40, efficiencyPercent: 80 })
    expect(result.selected.force).toBe(250)
    expect(result.selected.maxMass).toBe(40)
    expect(result.maxMass).toBe(40)
    expect(result.feasible.map((item) => item.strands)).toEqual([2])
  })
  it('checks the fresh worked example against both limits', () => {
    const result = analyzeOperator({
      mass: 57,
      gravity: 10,
      maxForce: 190,
      maxRope: 10.5,
      height: 2.5,
      efficiencyPercent: 90,
      strands: 4,
    })
    expect(result.feasible.map((item) => item.strands)).toEqual([4])
    expect(result.selected.force).toBeCloseTo(158.333333)
    expect(result.selected.ropeDistance).toBe(10)
  })
  for (const key of [
    'mass',
    'gravity',
    'maxForce',
    'maxRope',
    'height',
    'efficiencyPercent',
    'strands',
  ] as const)
    it.each([0, -1, NaN, Infinity])(`rejects invalid operator ${key} = %s`, (value) => {
      expect(() => analyzeOperator({ ...operatorBase, [key]: value })).toThrow(RangeError)
    })
  it('rejects fractional or invalid candidate configurations', () => {
    expect(() => analyzeOperator(operatorBase, [2, 2.5])).toThrow(RangeError)
    expect(() => analyzeOperator(operatorBase, [0])).toThrow(RangeError)
  })
})
