import { useId, useState } from 'react'
import { formatNumber } from '../../../lib/physics/pulley'

export function LearningNumber({
  label,
  unit,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  const id = useId()
  const shortLabel = label.includes(': ') ? label.slice(label.indexOf(': ') + 2) : label
  const displayLabel = shortLabel.charAt(0).toUpperCase() + shortLabel.slice(1)
  const [draft, setDraft] = useState<string | null>(null)
  const numeric = draft === null ? value : Number(draft)
  const invalid =
    draft !== null &&
    (draft.trim() === '' ||
      !Number.isFinite(numeric) ||
      numeric < min ||
      numeric > max ||
      (step === 1 && !Number.isInteger(numeric)))
  return (
    <div className="learning-control">
      <label htmlFor={id}>
        {displayLabel} <span>{unit}</span>
      </label>
      <input
        id={id}
        type="number"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={draft ?? value}
        aria-invalid={invalid}
        aria-describedby={`${id}-hint`}
        onChange={(event) => {
          const text = event.target.value
          setDraft(text)
          const next = Number(text)
          if (
            text.trim() &&
            Number.isFinite(next) &&
            next >= min &&
            next <= max &&
            (step !== 1 || Number.isInteger(next))
          )
            onChange(next)
        }}
        onBlur={() => setDraft(null)}
      />
      <input
        type="range"
        aria-label={`${label} — penggeser`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          setDraft(null)
          onChange(Number(event.target.value))
        }}
      />
      <small id={`${id}-hint`} className={invalid ? 'learning-error' : ''}>
        {invalid
          ? `Masukkan angka ${formatNumber(min)}–${formatNumber(max)}${step === 1 ? ' (bilangan bulat)' : ''}. Hasil memakai nilai valid terakhir.`
          : `${formatNumber(min)}–${formatNumber(max)} ${unit}`}
      </small>
    </div>
  )
}

export function LearningMetric({
  label,
  value,
  unit = '',
}: {
  label: string
  value: number
  unit?: string
}) {
  return (
    <div className="learning-metric">
      <dt>{label}</dt>
      <dd>
        {formatNumber(value)} <small>{unit}</small>
      </dd>
    </div>
  )
}

export function StageHeading({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <header className="learning-heading">
      <span className="learning-step">TAHAP 0{number}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  )
}
