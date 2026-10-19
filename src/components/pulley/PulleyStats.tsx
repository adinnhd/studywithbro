import { ArrowDownRight, Gauge, MoveVertical, Weight } from 'lucide-react'
import type { PhysicsResult, SimulationInput } from '../../types/pulley'
import { formatNumber } from '../../lib/physics/pulley'

export function PulleyStats({
  input,
  result,
  playing = false,
}: {
  input: SimulationInput
  result: PhysicsResult
  playing?: boolean
}) {
  const stats = [
    {
      label: 'Berat beban',
      value: formatNumber(result.weight),
      unit: 'N',
      formula: 'W = m × g',
      icon: Weight,
    },
    {
      label: 'Keuntungan mekanis',
      value: formatNumber(result.mechanicalAdvantage),
      unit: '×',
      formula: `${result.supportingStrands} ruas penopang`,
      icon: Gauge,
    },
    {
      label: 'Gaya kuasa',
      value: formatNumber(result.force),
      unit: 'N',
      formula: 'F = W / KM',
      icon: ArrowDownRight,
    },
    {
      label: 'Tali yang ditarik',
      value: formatNumber(result.ropeDistanceCm),
      unit: 'cm',
      formula: `Beban naik ${formatNumber(input.heightCm, 0)} cm`,
      icon: MoveVertical,
    },
  ]
  return (
    <div className="pulley-stats" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
      {stats.map(({ label, value, unit, formula, icon: Icon }, i) => (
        <div className={`stat-card ${i === 2 ? 'highlight' : ''}`} key={label}>
          <div className="stat-label">
            <Icon size={16} />
            {label}
          </div>
          <p>
            <strong>{value}</strong> <span>{unit}</span>
          </p>
          <small>{formula}</small>
        </div>
      ))}
    </div>
  )
}
