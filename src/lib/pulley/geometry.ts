import type { Point, PulleyGeometry, RopeSegment, Wheel, PulleyKind } from '../../types/pulley'
import { mechanicalAdvantage } from '../physics/pulley'

/**
 * An ideal, single continuous rope with vertical supporting segments and
 * semicircular tangencies. Even n: dead end on the fixed frame. Odd n:
 * dead end on the moving block. n=1 is the ordinary fixed pulley.
 *
 * Movable mode intentionally has NO direction-changing fixed sheave:
 * its free end is pulled upward. Compound n=2 adds that fixed sheave.
 * Every change in support length is balanced by the free end, so the
 * complete rendered rope length stays constant throughout lifting.
 */
export function buildPulleyGeometry(
  kind: PulleyKind,
  strands: number,
  heightCm: number,
): PulleyGeometry {
  const n = mechanicalAdvantage(kind, strands)
  if (!Number.isFinite(heightCm) || heightCm < 0 || heightCm > 100)
    throw new RangeError('Ketinggian tidak valid.')
  const radius = n <= 4 ? 24 : n <= 6 ? 21 : 17
  const fixedY = 91
  const scalePxPerCm = 1.2 / n
  const liftPx = heightCm * scalePxPerCm
  const movingY = 269 - liftPx
  const odd = n % 2 === 1
  const movingCount = Math.floor(n / 2)
  const simpleMovable = kind === 'movable'
  const fixedCount = simpleMovable ? 0 : Math.ceil(n / 2)
  const span = simpleMovable ? 2 * radius : (2 * n + (odd ? 2 : 0)) * radius
  const startX = (600 - span) / 2 - 15
  const anchor: Point = { x: startX, y: odd ? movingY : fixedY }
  const wheels: Wheel[] = []
  const segments: RopeSegment[] = []
  const path: string[] = [`M ${anchor.x} ${anchor.y}`]
  let previous = anchor
  let supportNumber = 0

  function line(to: Point, supporting: boolean) {
    if (supporting) supportNumber++
    segments.push({
      id: `rope-${segments.length}`,
      from: previous,
      to,
      supporting,
      number: supporting ? supportNumber : undefined,
    })
    path.push(`L ${to.x} ${to.y}`)
    previous = to
  }
  function arc(wheel: Wheel) {
    wheels.push(wheel)
    const end = { x: wheel.x + radius, y: wheel.y }
    // Sweep=0 takes the lower semicircle; sweep=1 takes the upper.
    path.push(`A ${radius} ${radius} 0 0 ${wheel.moving ? 0 : 1} ${end.x} ${end.y}`)
    previous = end
  }
  function rotation(multiplier: number) {
    return (((multiplier * liftPx) / radius) * 180) / Math.PI
  }

  if (simpleMovable) {
    const centerX = startX + radius
    line({ x: startX, y: movingY }, true)
    arc({ id: 'moving-0', x: centerX, y: movingY, radius, moving: true, rotation: rotation(-1) })
    // Upward free end contributes to the moving block's support too.
    line({ x: startX + 2 * radius, y: 170 - n * liftPx }, true)
  } else {
    for (let i = 0; i < n; i++) {
      const moving = odd ? i % 2 === 1 : i % 2 === 0
      const x = startX + (2 * i + 1) * radius
      const y = moving ? movingY : fixedY
      line({ x: x - radius, y }, true)
      const wheelIndex = Math.floor(i / 2)
      const multiplier = moving ? -(2 * wheelIndex + (odd ? 2 : 1)) : 2 * wheelIndex + (odd ? 1 : 2)
      arc({
        id: `${moving ? 'moving' : 'fixed'}-${wheelIndex}`,
        x,
        y,
        radius,
        moving,
        rotation: rotation(multiplier),
      })
    }
    line({ x: previous.x, y: 153 + n * liftPx }, false)
  }

  const movingWheels = wheels.filter((w) => w.moving)
  const movingPoints = movingWheels.map((w) => w.x)
  if (odd) movingPoints.push(anchor.x)
  const bracketLeft = Math.min(...movingPoints)
  const bracketRight = Math.max(...movingPoints)
  const bracketY = movingY + radius + 15
  // Each supporting strand contributes the same upward tension. Attach
  // the load under their force centroid so the massless block has zero
  // net torque, including odd configurations with a moving dead end.
  const supports = segments.filter((segment) => segment.supporting)
  const loadX = supports.reduce((sum, segment) => sum + segment.from.x, 0) / n
  const straightLength = segments.reduce(
    (sum, segment) =>
      sum + Math.hypot(segment.to.x - segment.from.x, segment.to.y - segment.from.y),
    0,
  )
  return {
    viewBox: `${(600 - Math.max(360, span + 140)) / 2} 0 ${Math.max(360, span + 140)} 420`,
    radius,
    anchor,
    anchorMoving: odd,
    wheels,
    segments,
    path: path.join(' '),
    supportCount: supportNumber,
    movingY,
    fixedY,
    bracket: { left: bracketLeft, right: bracketRight, y: bracketY },
    load: { x: loadX, y: bracketY + 17 },
    effort: previous,
    liftPx,
    ropeTravelPx: n * liftPx,
    scalePxPerCm,
    ropeLengthPx: straightLength + wheels.length * Math.PI * radius,
    wheelCount: { fixed: fixedCount, moving: movingCount },
  }
}
