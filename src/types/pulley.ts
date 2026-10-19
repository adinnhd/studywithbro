export type PulleyKind = 'fixed' | 'movable' | 'compound'

export interface SimulationInput {
  kind: PulleyKind
  mass: number
  gravity: number
  strands: number
  heightCm: number
}

export interface PhysicsResult {
  weight: number
  mechanicalAdvantage: number
  force: number
  supportingStrands: number
  ropeDistanceCm: number
  loadWorkJ: number
  effortWorkJ: number
}

export interface Point {
  x: number
  y: number
}
export interface Wheel extends Point {
  id: string
  radius: number
  moving: boolean
  rotation: number
}
export interface RopeSegment {
  id: string
  from: Point
  to: Point
  supporting: boolean
  number?: number
}
export interface PulleyGeometry {
  viewBox: string
  radius: number
  anchor: Point
  anchorMoving: boolean
  wheels: Wheel[]
  segments: RopeSegment[]
  path: string
  supportCount: number
  movingY: number
  fixedY: number
  bracket: { left: number; right: number; y: number }
  load: Point
  effort: Point
  liftPx: number
  ropeTravelPx: number
  scalePxPerCm: number
  ropeLengthPx: number
  wheelCount: { fixed: number; moving: number }
}
