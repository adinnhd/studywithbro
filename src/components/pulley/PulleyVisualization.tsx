import { useId } from 'react'
import { buildPulleyGeometry } from '../../lib/pulley/geometry'
import { formatNumber } from '../../lib/physics/pulley'
import type { PhysicsResult, SimulationInput } from '../../types/pulley'

export function PulleyVisualization({
  input,
  result,
  compact = false,
}: {
  input: SimulationInput
  result: PhysicsResult
  compact?: boolean
}) {
  const id = useId().replace(/:/g, '')
  const g = buildPulleyGeometry(input.kind, input.strands, input.heightCm)
  const viewBoxLeft = Number(g.viewBox.split(' ')[0])
  const n = result.mechanicalAdvantage
  const up = input.kind === 'movable'
  const beamLeft = Math.min(g.anchor.x, ...g.wheels.filter((w) => !w.moving).map((w) => w.x)) - 35
  const beamRight = Math.max(g.anchor.x, ...g.wheels.filter((w) => !w.moving).map((w) => w.x)) + 35
  const title = `${input.kind === 'fixed' || n === 1 ? 'Katrol tetap' : up ? 'Katrol bergerak' : 'Katrol majemuk'}: ${n} ruas penopang, beban ${formatNumber(input.mass)} kilogram, gaya kuasa ${formatNumber(result.force)} Newton.`
  return (
    <svg
      className={`pulley-svg ${compact ? 'compact' : ''}`}
      viewBox={g.viewBox}
      role="img"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      <title id={`${id}-title`}>{title}</title>
      <desc id={`${id}-description`}>
        Tali hijau bernomor menopang beban. Beban naik {formatNumber(input.heightCm)} cm dan ujung
        tali ditarik {formatNumber(result.ropeDistanceCm)} cm ke {up ? 'atas' : 'bawah'}. Roda atas
        tetap diam pada rangka, roda bawah bergerak bersama beban.
      </desc>
      <defs>
        <pattern id={`${id}-beam`} width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M-2 9L9-2M7 11l4-4" stroke="#c1c7ba" strokeWidth="1.5" />
        </pattern>
        <marker
          id={`${id}-arrow-orange`}
          markerWidth="7"
          markerHeight="7"
          refX="5"
          refY="3"
          orient="auto"
          viewBox="0 0 7 6"
        >
          <path d="M0 0l6 3-6 3z" fill="#e17b47" />
        </marker>
        <marker
          id={`${id}-arrow-green`}
          markerWidth="7"
          markerHeight="7"
          refX="5"
          refY="3"
          orient="auto"
          viewBox="0 0 7 6"
        >
          <path d="M0 0l6 3-6 3z" fill="#356b4c" />
        </marker>
      </defs>
      {/* Axle supports are behind rope and wheels. */}
      <rect
        x={beamLeft}
        y="37"
        width={Math.max(100, beamRight - beamLeft)}
        height="16"
        rx="3"
        fill={`url(#${id}-beam)`}
      />
      <path
        d={`M ${beamLeft} 53 H ${Math.max(beamLeft + 100, beamRight)}`}
        stroke="#9ca696"
        strokeWidth="2"
      />
      {g.wheels
        .filter((w) => !w.moving)
        .map((w) => (
          <path key={w.id} d={`M${w.x} 53V${w.y}`} stroke="#8e9a8b" strokeWidth="5" />
        ))}
      {!g.anchorMoving && (
        <path d={`M${g.anchor.x} 53V${g.anchor.y}`} stroke="#8e9a8b" strokeWidth="4" />
      )}
      {g.wheels
        .filter((w) => w.moving)
        .map((w) => (
          <path key={w.id} d={`M${w.x} ${w.y}V${g.bracket.y}`} stroke="#97a78e" strokeWidth="5" />
        ))}
      {g.anchorMoving && (
        <path d={`M${g.anchor.x} ${g.anchor.y}V${g.bracket.y}`} stroke="#8e9a8b" strokeWidth="4" />
      )}
      <path
        d={`M${g.bracket.left} ${g.bracket.y}H${g.bracket.right}M${g.load.x} ${g.bracket.y}V${g.load.y}`}
        stroke="#7b9274"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* One uninterrupted rope. Supporting straight segments are overpainted green. */}
      <path
        d={g.path}
        fill="none"
        stroke="#788c73"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {g.segments
        .filter((s) => s.supporting)
        .map((s) => (
          <path
            key={s.id}
            d={`M${s.from.x} ${s.from.y}L${s.to.x} ${s.to.y}`}
            fill="none"
            stroke="#4d8057"
            strokeWidth="4"
          />
        ))}
      {g.wheels.map((w) => (
        <g key={w.id} transform={`translate(${w.x} ${w.y})`}>
          <circle
            r={w.radius - 3}
            fill={w.moving ? '#d8e9b2' : '#e7ebdf'}
            stroke="#506e4e"
            strokeWidth="2"
          />
          <g transform={`rotate(${w.rotation})`} stroke="#789168" strokeWidth="1.7">
            <path d={`M0 ${3 - w.radius}V${w.radius - 3}M${3 - w.radius} 0H${w.radius - 3}`} />
            <circle r={w.radius - 7} fill="none" strokeDasharray="3 6" />
          </g>
          <circle r="4" fill="#355b3c" />
          <circle r="1.3" fill="#edf3e6" />
        </g>
      ))}
      <circle
        cx={g.anchor.x}
        cy={g.anchor.y}
        r="5"
        fill="#4c7251"
        stroke="#f7f9ee"
        strokeWidth="2"
      />
      {g.segments
        .filter((s) => s.supporting)
        .map((s) => {
          const y = up && s.number === 2 ? (s.from.y + s.to.y) / 2 : (g.fixedY + g.movingY) / 2
          return (
            <g key={`number-${s.id}`} transform={`translate(${s.from.x} ${y})`}>
              <circle r="9" fill="#f3f7e8" stroke="#719064" />
              <text textAnchor="middle" dy="3.5" fontSize="10" fontWeight="700" fill="#355b3c">
                {s.number}
              </text>
            </g>
          )
        })}
      <g transform={`translate(${g.load.x} ${g.load.y})`}>
        <rect
          x="-43"
          width="86"
          height="52"
          rx="9"
          fill="#d9eead"
          stroke="#8ba569"
          strokeWidth="1.5"
        />
        <path
          d="M-31 0V-4Q-31-11-23-11H23Q31-11 31-4V0"
          fill="none"
          stroke="#6e8c57"
          strokeWidth="2"
        />
        <path d="M-32 7H32" stroke="#ecf5d6" strokeWidth="2" />
        <text y="32" textAnchor="middle" fontSize="20" fontWeight="700" fill="#365638">
          {formatNumber(input.mass)}{' '}
          <tspan fontSize="11" fontWeight="500">
            kg
          </tspan>
        </text>
        <circle cy="57" r="3" fill="#d57f4b" />
        <path
          d="M0 60V85"
          stroke="#e17b47"
          strokeWidth="2"
          markerEnd={`url(#${id}-arrow-orange)`}
        />
        <text x="10" y="79" fontSize="13" fontWeight="700" fill="#b86635">
          W{' '}
          <tspan fontSize="11" fontWeight="400">
            {formatNumber(result.weight)} N
          </tspan>
        </text>
      </g>
      <circle cx={g.effort.x} cy={g.effort.y} r="4.5" fill="#e17b47" />
      <path
        d={`M${g.effort.x} ${g.effort.y + (up ? -7 : 7)}v${up ? -28 : 28}`}
        stroke="#e17b47"
        strokeWidth="2.5"
        markerEnd={`url(#${id}-arrow-orange)`}
      />
      <text
        x={g.effort.x + 14}
        y={g.effort.y + (up ? -16 : 25)}
        fontSize="14"
        fontWeight="700"
        fill="#b86635"
      >
        F
      </text>
      <text x={g.effort.x + 14} y={g.effort.y + (up ? 1 : 43)} fontSize="12" fill="#b86635">
        {formatNumber(result.force)} N
      </text>
      {input.heightCm > 0 && !compact && (
        <g>
          <path
            d={`M${g.load.x - 62} 333V${333 - g.liftPx}`}
            stroke="#356b4c"
            strokeWidth="1.8"
            markerEnd={`url(#${id}-arrow-green)`}
          />
          <text
            x={Math.max(viewBoxLeft + 6, g.load.x - 110)}
            y={350}
            textAnchor="start"
            fontSize="11"
            fill="#356b4c"
          >
            h = {formatNumber(input.heightCm, 0)} cm
          </text>
        </g>
      )}
    </svg>
  )
}
