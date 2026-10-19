import { useState } from 'react'
import { CircleHelp, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { SimulationInput } from '../../types/pulley'
import { formatNumber } from '../../lib/physics/pulley'

interface Props {
  input: SimulationInput
  update: <K extends keyof SimulationInput>(key: K, value: SimulationInput[K]) => void
  reset: () => void
}
function NumberControl({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  id,
}: {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  id: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const numeric = Number(draft)
  const valid =
    draft === null ||
    (draft.trim() !== '' && Number.isFinite(numeric) && numeric >= min && numeric <= max)
  return (
    <div className="number-control">
      <label htmlFor={id}>{label}</label>
      <div className={`number-input ${!valid ? 'invalid' : ''}`}>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={draft ?? value}
          aria-invalid={!valid}
          aria-describedby={!valid ? `${id}-error` : undefined}
          onChange={(event) => {
            const raw = event.target.value
            setDraft(raw)
            const parsed = Number(raw)
            if (raw.trim() && Number.isFinite(parsed) && parsed >= min && parsed <= max)
              onChange(parsed)
          }}
          onBlur={() => setDraft(null)}
        />
        <span>{unit}</span>
      </div>
      {!valid && (
        <small className="input-error" id={`${id}-error`}>
          Masukkan angka {min}–{max}.
        </small>
      )}
      <input
        aria-label={`Slider ${label.toLowerCase()}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          setDraft(null)
          onChange(Number(event.target.value))
        }}
      />
      <div className="range-labels">
        <span>
          {min} {unit}
        </span>
        <span>
          {formatNumber(max)} {unit}
        </span>
      </div>
    </div>
  )
}
export function PulleyControls({ input, update, reset }: Props) {
  const [showHelp, setShowHelp] = useState(false)
  return (
    <aside className="pulley-controls">
      <div className="panel-label">
        <span>
          <SlidersHorizontal size={15} /> ATUR EKSPERIMEN
        </span>
        <button
          className="icon-button"
          aria-label="Reset simulasi"
          onClick={reset}
          title="Reset simulasi"
        >
          <RotateCcw size={16} />
        </button>
      </div>
      <NumberControl
        key={`mass-${input.kind}`}
        id="mass"
        label="Massa beban"
        unit="kg"
        value={input.mass}
        min={0}
        max={1000}
        step={1}
        onChange={(v) => update('mass', v)}
      />
      <NumberControl
        key={`gravity-${input.kind}`}
        id="gravity"
        label="Gravitasi"
        unit="m/s²"
        value={input.gravity}
        min={0.1}
        max={30}
        step={0.1}
        onChange={(v) => update('gravity', v)}
      />
      <p className="control-note">
        Di Bumi, biasanya kita pakai g = 10 m/s² untuk mempermudah hitungan.
      </p>
      {input.kind === 'compound' && (
        <div className="strand-control">
          <label htmlFor="strands">
            Ruas tali penopang <strong>{input.strands}</strong>
          </label>
          <input
            id="strands"
            type="range"
            min="1"
            max="10"
            step="1"
            value={input.strands}
            onChange={(e) => update('strands', Number(e.target.value))}
          />
          <div className="range-labels">
            <span>1 ruas</span>
            <span>10 ruas</span>
          </div>
          {input.strands === 1 && (
            <p className="control-note">1 ruas memakai katrol tetap, tanpa roda bergerak.</p>
          )}
        </div>
      )}
      <button
        className="help-toggle"
        aria-expanded={showHelp}
        onClick={() => setShowHelp(!showHelp)}
      >
        <CircleHelp size={16} /> Apa yang bisa dicoba?
      </button>
      {showHelp && (
        <p className="help-content">
          Coba massa 200 kg, lalu bandingkan gaya pada katrol tetap, bergerak, dan majemuk 4 ruas.
          Ganti ketinggian untuk membandingkan jarak tali.
        </p>
      )}
      <div className="ideal-note">
        <span className="status-dot" />
        <span>
          Model katrol ideal
          <br />
          <small>Tanpa gesekan · Tali & roda tanpa massa</small>
        </span>
      </div>
    </aside>
  )
}
