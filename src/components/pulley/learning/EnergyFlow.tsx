import { useId } from 'react'
import { ArrowDown, ArrowRight, Package, PersonStanding } from 'lucide-react'
import { formatNumber as f } from '../../../lib/physics/pulley'

/** Reusable flow: branch widths show shares of input energy, never disappearing energy. */
export function EnergyFlow({
  force,
  ropeDistance,
  weight,
  height,
  inputWork,
  outputWork,
  lostEnergy,
  efficiency,
}: {
  force: number
  ropeDistance: number
  weight: number
  height: number
  inputWork: number
  outputWork: number
  lostEnergy: number
  efficiency: number
}) {
  const id = useId()
  const usefulWidth = 60 * efficiency
  const lossWidth = 60 * (1 - efficiency)
  return (
    <figure className="energy-flow">
      <div className="energy-sides">
        <div className="energy-side">
          <span className="eyebrow">
            <PersonStanding size={18} aria-hidden="true" /> INPUT · OPERATOR
          </span>
          <p>
            Gaya <strong>{f(force)} N</strong> × tarikan <strong>{f(ropeDistance)} m</strong>
          </p>
          <div>
            U<sub>in</sub> = <strong>{f(inputWork)} J</strong>
          </div>
        </div>
        <ArrowRight className="energy-direction" size={22} aria-hidden="true" />
        <div className="energy-side useful">
          <span className="eyebrow">
            <Package size={18} aria-hidden="true" /> OUTPUT · BEBAN
          </span>
          <p>
            Berat <strong>{f(weight)} N</strong> × kenaikan <strong>{f(height)} m</strong>
          </p>
          <div>
            U<sub>out</sub> = <strong>{f(outputWork)} J</strong>
          </div>
        </div>
      </div>
      <svg
        viewBox="0 0 600 180"
        role="img"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
      >
        <title id={`${id}-title`}>
          Aliran energi: {f(efficiency * 100)}% menjadi usaha berguna
        </title>
        <desc id={`${id}-desc`}>
          Dari {f(inputWork)} joule usaha masuk, {f(outputWork)} joule mengangkat beban dan{' '}
          {f(lostEnergy)} joule berubah ke bentuk lain. Lebar cabang menunjukkan bagian dari energi
          masuk.
        </desc>
        <path d="M25 65H220" stroke="#71866a" strokeWidth="60" fill="none" />
        <path
          d={`M220 ${35 + usefulWidth / 2} C330 ${35 + usefulWidth / 2} 350 50 440 50 H550`}
          stroke="#365e40"
          strokeWidth={usefulWidth}
          fill="none"
        />
        {lossWidth > 0 && (
          <path
            d={`M220 ${95 - lossWidth / 2} C330 ${95 - lossWidth / 2} 330 140 440 140 H550`}
            stroke="#bd793e"
            strokeWidth={lossWidth}
            fill="none"
          />
        )}
        <text x="30" y="18" fill="#46563e" fontSize="14">
          Energi masuk · 100%
        </text>
        <text x="370" y="18" fill="#254c3c" fontSize="14">
          Berguna · {f(efficiency * 100)}%
        </text>
        <text x="365" y="173" fill="#79502c" fontSize="14">
          Bentuk lain · {f((1 - efficiency) * 100)}%
        </text>
      </svg>
      <figcaption>
        <ArrowDown size={16} aria-hidden="true" /> E<sub>hilang</sub> ={' '}
        <strong>{f(lostEnergy)} J</strong> · Energi ini tidak musnah; berubah menjadi panas, bunyi,
        atau bentuk lain. Lebar aliran menunjukkan proporsi, bukan besar energi mutlak.
      </figcaption>
    </figure>
  )
}
