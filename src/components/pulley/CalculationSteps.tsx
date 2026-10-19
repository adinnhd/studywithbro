import { Check, Equal } from 'lucide-react'
import type { PhysicsResult, SimulationInput } from '../../types/pulley'
import { formatNumber as f } from '../../lib/physics/pulley'

export function CalculationSteps({
  input,
  result,
}: {
  input: SimulationInput
  result: PhysicsResult
}) {
  return (
    <section className="calculation-section">
      <div className="section-kicker">
        <Equal size={17} /> DARI SIMULASI KE RUMUS
      </div>
      <h2>Hitung bareng, langkah demi langkah.</h2>
      <p className="section-description">
        Angkanya mengikuti eksperimenmu. Ubah input, lihat polanya.
      </p>
      <div className="calculation-grid">
        <div className="calculation-card">
          <span className="step-number">01</span>
          <h3>Catat yang diketahui</h3>
          <div className="math-lines">
            <p>
              <span>Massa (m)</span>
              <strong>{f(input.mass)} kg</strong>
            </p>
            <p>
              <span>Gravitasi (g)</span>
              <strong>{f(input.gravity)} m/s²</strong>
            </p>
            <p>
              <span>Keuntungan mekanis</span>
              <strong>{result.mechanicalAdvantage}</strong>
            </p>
          </div>
        </div>
        <div className="calculation-card">
          <span className="step-number">02</span>
          <h3>Cari berat bebannya</h3>
          <p className="math-equation">W = m × g</p>
          <p className="math-substitution">
            W = {f(input.mass)} × {f(input.gravity)}
          </p>
          <p className="calculation-answer">
            <Check size={15} />W = {f(result.weight)} N
          </p>
        </div>
        <div className="calculation-card">
          <span className="step-number">03</span>
          <h3>Hitung gaya kuasa</h3>
          <p className="math-equation">F = W / KM</p>
          <p className="math-substitution">
            F = {f(result.weight)} / {result.mechanicalAdvantage}
          </p>
          <p className="calculation-answer">
            <Check size={15} />F = {f(result.force)} N
          </p>
        </div>
      </div>
      <div className="work-note">
        <span>Gaya lebih kecil, tarikan lebih panjang.</span>
        <p>
          F × s = W × h → {f(result.force)} × {f(result.ropeDistanceCm / 100)} = {f(result.weight)}{' '}
          × {f(input.heightCm / 100)} = <strong>{f(result.loadWorkJ)} J</strong>. Usaha ideal tetap
          sama.
        </p>
      </div>
    </section>
  )
}
