import { describe, expect, it } from 'vitest'
import { buildPulleyGeometry } from './geometry'

const values = Array.from({ length: 10 }, (_, i) => i + 1)

describe('continuous block-and-tackle geometry', () => {
  it.each(values)('KM=%i uses correct anchor, wheel counts, tangencies and support count', (n) => {
    const g = buildPulleyGeometry('compound', n, 0)
    expect(g.anchorMoving).toBe(n % 2 === 1)
    expect(g.supportCount).toBe(n)
    expect(g.wheelCount.moving).toBe(Math.floor(n / 2))
    expect(g.wheelCount.fixed).toBe(Math.ceil(n / 2))
    expect(g.wheels).toHaveLength(n)
    const support = g.segments.filter((s) => s.supporting)
    expect(support).toHaveLength(n)
    support.forEach((s) => {
      expect(s.from.x).toBe(s.to.x)
      expect(Math.min(s.from.y, s.to.y)).toBe(g.fixedY)
      expect(Math.max(s.from.y, s.to.y)).toBe(g.movingY)
    })
    // Every arc connects exactly to the preceding line and next line.
    g.wheels.forEach((w, i) => {
      expect(g.segments[i].to).toEqual({ x: w.x - w.radius, y: w.y })
      expect(g.segments[i + 1].from).toEqual({ x: w.x + w.radius, y: w.y })
    })
  })
  it.each(values)('KM=%i conserves complete drawn rope length for all lift heights', (n) => {
    const base = buildPulleyGeometry('compound', n, 0)
    for (let h = 0; h <= 100; h += 5) {
      const g = buildPulleyGeometry('compound', n, h)
      expect(g.ropeLengthPx).toBeCloseTo(base.ropeLengthPx, 8)
      expect(g.ropeTravelPx).toBeCloseTo(n * g.liftPx)
      expect(g.effort.y - base.effort.y).toBeCloseTo(n * g.liftPx)
      g.wheels.filter((w) => !w.moving).forEach((w) => expect(w.y).toBe(base.fixedY))
      g.wheels
        .filter((w) => w.moving)
        .forEach((w) => expect(w.y).toBeCloseTo(base.movingY - g.liftPx))
    }
  })
  it.each(values)('KM=%i places the load under the resultant supporting force', (n) => {
    const g = buildPulleyGeometry('compound', n, 50)
    const momentPerUnitTension = g.segments
      .filter((segment) => segment.supporting)
      .reduce((sum, segment) => sum + segment.from.x - g.load.x, 0)
    expect(momentPerUnitTension).toBeCloseTo(0, 10)
    expect(g.load.x).toBeGreaterThanOrEqual(g.bracket.left)
    expect(g.load.x).toBeLessThanOrEqual(g.bracket.right)
  })

  it('KM=1 is a fixed wheel with load tied to the rope', () => {
    const g = buildPulleyGeometry('compound', 1, 50)
    expect(g.wheelCount).toEqual({ fixed: 1, moving: 0 })
    expect(g.anchorMoving).toBe(true)
  })
  it('simple movable pulley has one wheel, two supports and upward pull', () => {
    const initial = buildPulleyGeometry('movable', 2, 0)
    const raised = buildPulleyGeometry('movable', 2, 100)
    expect(initial.wheelCount).toEqual({ fixed: 0, moving: 1 })
    expect(initial.supportCount).toBe(2)
    expect(raised.effort.y).toBeLessThan(initial.effort.y)
    expect(initial.effort.y - raised.effort.y).toBeCloseTo(2 * raised.liftPx)
    expect(raised.ropeLengthPx).toBeCloseTo(initial.ropeLengthPx)
  })
  it.each(values)('KM=%i wheel rotations satisfy no-slip velocity on both tangencies', (n) => {
    const base = buildPulleyGeometry('compound', n, 0)
    const moved = buildPulleyGeometry('compound', n, 10)
    // Signed downward displacement of the rope at the anchor.
    let ropeDisplacement = base.anchorMoving ? -moved.liftPx : 0
    moved.wheels.forEach((w) => {
      const centerDisplacement = w.moving ? -moved.liftPx : 0
      const angularDistance = ((w.rotation * Math.PI) / 180) * w.radius
      expect(centerDisplacement - angularDistance).toBeCloseTo(ropeDisplacement)
      ropeDisplacement = centerDisplacement + angularDistance
    })
    expect(ropeDisplacement).toBeCloseTo(n * moved.liftPx)
  })
})
