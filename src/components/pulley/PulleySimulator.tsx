import { ArrowUpRight, Check, CircleHelp, Pause, Play, Radio, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePulleySimulation } from '../../hooks/usePulleySimulation'
import { advantageExplanation, formatNumber } from '../../lib/physics/pulley'
import { PulleyControls } from './PulleyControls'
import { PulleyVisualization } from './PulleyVisualization'
import { PulleyStats } from './PulleyStats'
import { CalculationSteps } from './CalculationSteps'
import type { PulleyKind } from '../../types/pulley'

const options: { kind: PulleyKind; label: string; number: string }[] = [
  { kind: 'fixed', label: 'Katrol tetap', number: '01' },
  { kind: 'movable', label: 'Katrol bergerak', number: '02' },
  { kind: 'compound', label: 'Katrol majemuk', number: '03' },
]
export function PulleySimulator() {
  const sim = usePulleySimulation()
  const { input, result } = sim
  return (
    <>
      <section id="simulasi" className="simulator-section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">
              <Radio size={17} /> LAB INTERAKTIF
            </div>
            <h2>Sekarang, giliran kamu.</h2>
            <p className="section-description">
              Utak-atik bebannya. Ganti katrolnya. Temukan bedanya.
            </p>
          </div>
          <span className="live-badge">
            <span className="status-dot" /> Langsung terhitung
          </span>
        </div>
        <div className="simulator-shell">
          <div className="simulator-toolbar">
            <div className="pulley-type-tabs" role="group" aria-label="Jenis katrol">
              {options.map((option) => (
                <button
                  key={option.kind}
                  aria-pressed={input.kind === option.kind}
                  aria-label={`${option.number} ${option.label}`}
                  className={input.kind === option.kind ? 'selected' : ''}
                  onClick={() => sim.update('kind', option.kind)}
                >
                  <span aria-hidden="true">
                    {input.kind === option.kind ? <Check size={10} /> : option.number}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
            <span className="toolbar-caption">Eksperimen #001</span>
          </div>
          <div className="simulator-workspace">
            <PulleyControls input={input} update={sim.update} reset={sim.reset} />
            <div className="visual-panel">
              <div className="visual-panel-heading">
                <span>RUANG SIMULASI</span>
                <span className="km-badge">KM = {result.mechanicalAdvantage}</span>
              </div>
              <PulleyVisualization input={input} result={result} />
              <div className="visual-legend">
                <span>
                  <i className="legend-line support" />
                  Tali penopang
                </span>
                <span>
                  <i className="legend-line effort" />
                  Arah gaya
                </span>
                <span>
                  {result.supportingStrands} ruas ·{' '}
                  {input.kind === 'movable' ? 'Tarik ke atas' : 'Tarik ke bawah'}
                </span>
              </div>
              <div className="lift-control">
                <div>
                  <label htmlFor="lift-height">
                    Ketinggian angkat{' '}
                    <strong>
                      {formatNumber(input.heightCm, 0)} <small>cm</small>
                    </strong>
                  </label>
                  <input
                    id="lift-height"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={input.heightCm}
                    onChange={(e) => sim.update('heightCm', Number(e.target.value))}
                  />
                  <div className="range-labels">
                    <span>0 cm</span>
                    <span>100 cm</span>
                  </div>
                </div>
                <button
                  className="play-button"
                  onClick={sim.togglePlay}
                  disabled={sim.reducedMotion}
                  aria-label={sim.playing ? 'Jeda animasi' : 'Putar animasi'}
                >
                  {sim.playing ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" />
                  )}
                </button>
              </div>
              <p className="scale-note">
                Skala diagram menyesuaikan KM. Perpindahan tali selalu {result.mechanicalAdvantage}×
                perpindahan beban.
                {sim.reducedMotion &&
                  ' Animasi dinonaktifkan mengikuti preferensi gerak; gunakan slider.'}
              </p>
            </div>
          </div>
          <PulleyStats input={input} result={result} playing={sim.playing} />
        </div>
        <div className="insight-note">
          <span className="insight-icon">
            <Sparkles size={20} />
          </span>
          <p>
            <strong>Kenapa KM = {result.mechanicalAdvantage}?</strong>{' '}
            {advantageExplanation(input.kind, input.strands)}
            {input.mass === 0 &&
              ' Saat massa nol, W dan F sama-sama nol. KM tetap ditentukan susunan tali; rasio W/F tidak dihitung karena 0/0 tidak terdefinisi.'}
          </p>
        </div>
      </section>
      <CalculationSteps input={input} result={result} />
    </>
  )
}

export function PulleyPreview() {
  const sim = usePulleySimulation({ kind: 'movable', heightCm: 20 })
  return (
    <div className="hero-lab">
      <div className="hero-lab-heading">
        <span>
          <span className="status-dot" /> LAB MINI
        </span>
        <span>
          COBA LANGSUNG <ArrowUpRight size={13} />
        </span>
      </div>
      <div className="hero-lab-title">
        <h3>
          Lebih ringan.
          <br />
          Kok bisa?
        </h3>
        <span className="preview-km">
          KM <strong>{sim.result.mechanicalAdvantage}×</strong>
        </span>
      </div>
      <div className="preview-visual">
        <PulleyVisualization input={sim.input} result={sim.result} compact />
      </div>
      <div className="preview-result">
        <span>
          Beban <strong>{formatNumber(sim.input.mass)} kg</strong>
        </span>
        <span className="preview-equals">→</span>
        <span>
          Gaya yang dibutuhkan{' '}
          <strong>
            {formatNumber(sim.result.force)} <small>N</small>
          </strong>
        </span>
      </div>
      <div className="preview-slider">
        <label htmlFor="hero-lift">
          <span>Geser, lihat bebannya naik</span>
          <strong>{formatNumber(sim.input.heightCm, 0)} cm</strong>
        </label>
        <input
          id="hero-lift"
          aria-label="Ketinggian beban lab mini"
          type="range"
          min="0"
          max="100"
          value={sim.input.heightCm}
          onChange={(e) => sim.update('heightCm', Number(e.target.value))}
        />
      </div>
      <Link className="preview-link" to="/ipa/fisika/katrol#simulasi">
        Masuk ke lab katrol <ArrowUpRight size={16} />
      </Link>
      <div className="floating-lab-note">
        <CircleHelp size={15} />
        <span>
          Gaya setengahnya.
          <br />
          <strong>Paham bedanya?</strong>
        </span>
      </div>
    </div>
  )
}
