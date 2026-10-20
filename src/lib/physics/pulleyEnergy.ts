/** Separate steady-lift model: SI units, inextensible rope, prescribed system efficiency. */
export interface EnergyInput {
  weight: number
  strands: number
  efficiencyPercent: number
  height: number
}

export const ENERGY_LIMITS = {
  weight: [0.01, 1000000],
  height: [0.1, 100],
  rope: [0.1, 1000],
  strands: [1, 10],
  efficiencyPercent: [1, 100],
  mass: [0.1, 10000],
  maxForce: [1, 100000],
  gravity: [0.1, 30],
} as const

function validate(value: number, name: keyof typeof ENERGY_LIMITS) {
  const [min, max] = ENERGY_LIMITS[name]
  if (!Number.isFinite(value) || value < min || value > max)
    throw new RangeError(`${name}: masukkan angka ${min}–${max}.`)
  if (name === 'strands' && !Number.isInteger(value))
    throw new RangeError('Jumlah ruas tali harus bilangan bulat.')
}

export function calculateEnergy(input: EnergyInput) {
  validate(input.weight, 'weight')
  validate(input.strands, 'strands')
  validate(input.efficiencyPercent, 'efficiencyPercent')
  // Heights derived from a rope input may be smaller than the height control's minimum.
  if (!Number.isFinite(input.height) || input.height <= 0 || input.height > 1000)
    throw new RangeError('Ketinggian harus lebih dari 0 hingga 1.000 m.')
  const efficiency = input.efficiencyPercent / 100
  const idealMA = input.strands
  const actualMA = efficiency * idealMA
  const force = input.weight / actualMA
  const ropeDistance = idealMA * input.height
  const outputWork = input.weight * input.height
  const inputWork = outputWork / efficiency
  return {
    efficiency,
    idealMA,
    actualMA,
    force,
    ropeDistance,
    outputWork,
    inputWork,
    lostEnergy: Math.max(0, inputWork - outputWork),
  }
}

export function calculateEnergyFromRope(input: Omit<EnergyInput, 'height'> & { rope: number }) {
  validate(input.rope, 'rope')
  validate(input.strands, 'strands')
  const height = input.rope / input.strands
  return { ...calculateEnergy({ ...input, height }), height }
}

export interface OperatorInput {
  mass: number
  gravity: number
  maxForce: number
  maxRope: number
  height: number
  efficiencyPercent: number
  strands: number
}

export function analyzeOperator(
  input: OperatorInput,
  choices: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
) {
  validate(input.mass, 'mass')
  validate(input.gravity, 'gravity')
  validate(input.maxForce, 'maxForce')
  validate(input.maxRope, 'rope')
  validate(input.height, 'height')
  validate(input.strands, 'strands')
  validate(input.efficiencyPercent, 'efficiencyPercent')
  const weight = input.mass * input.gravity
  // Weight is derived; reject derived values outside the supported learning model too.
  const evaluate = (strands: number) => {
    const result = calculateEnergy({
      weight,
      strands,
      height: input.height,
      efficiencyPercent: input.efficiencyPercent,
    })
    const forceOK = result.force <= input.maxForce + 1e-9
    const ropeOK = result.ropeDistance <= input.maxRope + 1e-9
    return {
      ...result,
      strands,
      forceOK,
      ropeOK,
      usable: forceOK && ropeOK,
      forceLimitedMass: (input.maxForce * result.actualMA) / input.gravity,
      maxMass: ropeOK ? (input.maxForce * result.actualMA) / input.gravity : 0,
    }
  }
  const configurations = choices.map(evaluate)
  const feasible = configurations.filter((configuration) => configuration.usable)
  const ropeFeasible = configurations.filter((configuration) => configuration.ropeOK)
  return {
    selected: evaluate(input.strands),
    configurations,
    feasible,
    maxMass: Math.max(0, ...ropeFeasible.map((configuration) => configuration.maxMass)),
  }
}
