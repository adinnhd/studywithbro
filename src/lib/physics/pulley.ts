import type { PhysicsResult, PulleyKind, SimulationInput } from '../../types/pulley'

export const DEFAULT_INPUT: SimulationInput = {
  kind: 'fixed',
  mass: 50,
  gravity: 10,
  strands: 4,
  heightCm: 0,
}

export function mechanicalAdvantage(kind: PulleyKind, strands: number): number {
  if (!['fixed', 'movable', 'compound'].includes(kind))
    throw new RangeError('Jenis katrol tidak valid.')
  if (kind === 'fixed') return 1
  if (kind === 'movable') return 2
  if (!Number.isInteger(strands) || strands < 1 || strands > 10) {
    throw new RangeError('Jumlah ruas tali harus berupa bilangan bulat 1–10.')
  }
  return strands
}

export function effortForce(weight: number, advantage: number): number {
  if (!Number.isFinite(weight) || weight < 0) throw new RangeError('Berat tidak boleh negatif.')
  if (!Number.isFinite(advantage) || advantage <= 0)
    throw new RangeError('KM harus lebih dari nol.')
  return weight / advantage
}

export function calculatePulley(input: SimulationInput): PhysicsResult {
  const { mass, gravity, heightCm } = input
  if (!Number.isFinite(mass) || mass < 0 || mass > 1000)
    throw new RangeError('Massa harus antara 0–1.000 kg.')
  if (!Number.isFinite(gravity) || gravity <= 0 || gravity > 30)
    throw new RangeError('Gravitasi harus lebih dari 0 hingga 30 m/s².')
  if (!Number.isFinite(heightCm) || heightCm < 0 || heightCm > 100)
    throw new RangeError('Ketinggian harus antara 0–100 cm.')
  const km = mechanicalAdvantage(input.kind, input.strands)
  const weight = mass * gravity
  const force = effortForce(weight, km)
  const ropeDistanceCm = km * heightCm
  return {
    weight,
    force,
    mechanicalAdvantage: km,
    supportingStrands: km,
    ropeDistanceCm,
    loadWorkJ: (weight * heightCm) / 100,
    effortWorkJ: (force * ropeDistanceCm) / 100,
  }
}

export const formatNumber = (value: number, maxDigits = 2) =>
  new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: maxDigits,
  }).format(value)

export function advantageExplanation(kind: PulleyKind, strands: number): string {
  const km = mechanicalAdvantage(kind, strands)
  if (km === 1)
    return 'Satu ruas tali menopang beban. Katrol tetap mengubah arah tarikan, dengan besar gaya yang sama dengan berat beban.'
  if (kind === 'movable')
    return 'Dua ruas tali menopang katrol yang terhubung ke beban. Masing-masing menanggung setengah beratnya. Ujung tali ditarik ke atas.'
  return `${km} ruas tali menopang blok bergerak. Setiap ruas memiliki tegangan F yang sama, sehingga ${km} × F = W. ${km % 2 ? 'Ujung awal tali terikat pada blok beban.' : 'Ujung awal tali terikat pada rangka atas.'}`
}
