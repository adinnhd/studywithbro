import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { calculatePulley, DEFAULT_INPUT, formatNumber as f } from '../../../lib/physics/pulley'
import { analyzeOperator, calculateEnergy } from '../../../lib/physics/pulleyEnergy'
import { PulleyVisualization } from '../PulleyVisualization'
import { LearningMetric, LearningNumber, StageHeading } from './LearningControls'
import { WorkedExamples } from './WorkedExamples'

function SystemComparison() {
  const [weight, setWeight] = useState(840)
  const [height, setHeight] = useState(1.4)
  const [systems, setSystems] = useState([
    { strands: 3, percent: 100 },
    { strands: 5, percent: 100 },
  ])
  const update = (index: number, key: 'strands' | 'percent', value: number) =>
    setSystems((previous) =>
      previous.map((system, i) => (i === index ? { ...system, [key]: value } : system)),
    )
  const results = systems.map((system) =>
    calculateEnergy({ weight, height, strands: system.strands, efficiencyPercent: system.percent }),
  )
  return (
    <div className="learning-experiment" aria-label="Perbandingan dua sistem">
      <h3>Satu beban, dua cara mengangkat.</h3>
      <p>
        Kedua sistem mengangkat beban yang sama ke tinggi yang sama. Mulai dari kondisi ideal, lalu
        coba efisiensi berbeda.
      </p>
      <div className="learning-controls comparison-shared">
        <LearningNumber
          label="Perbandingan: berat bersama"
          unit="N"
          min={10}
          max={2000}
          step={10}
          value={weight}
          onChange={setWeight}
        />
        <LearningNumber
          label="Perbandingan: tinggi bersama"
          unit="m"
          min={0.1}
          max={5}
          step={0.1}
          value={height}
          onChange={setHeight}
        />
      </div>
      <div className="learning-two-column comparison-systems">
        {systems.map((system, index) => {
          const result = results[index]
          // Reuse the existing rope geometry unchanged; display is a geometry snapshot.
          const input = {
            ...DEFAULT_INPUT,
            kind: 'compound' as const,
            mass: weight / 10,
            strands: system.strands,
            heightCm: 40,
          }
          const visualResult = { ...calculatePulley(input), force: result.force }
          return (
            <article
              className="comparison-system"
              key={index}
              aria-label={`Sistem ${index ? 'B' : 'A'}`}
            >
              <h4>Sistem {index ? 'B' : 'A'}</h4>
              <div className="comparison-visual">
                <PulleyVisualization input={input} result={visualResult} compact />
              </div>
              <p className="learning-note">
                Sketsa geometri pada kenaikan 40 cm. Target {f(height)} m dihitung di bawah; W pada
                sketsa = w.
              </p>
              <LearningNumber
                label={`Sistem ${index ? 'B' : 'A'}: ruas penopang`}
                unit="ruas"
                min={1}
                max={10}
                value={system.strands}
                onChange={(value) => update(index, 'strands', value)}
              />
              <LearningNumber
                label={`Sistem ${index ? 'B' : 'A'}: efisiensi`}
                unit="%"
                min={1}
                max={100}
                value={system.percent}
                onChange={(value) => update(index, 'percent', value)}
              />
              <dl className="learning-metrics" aria-live="polite">
                <LearningMetric label="Gaya kuasa" value={result.force} unit="N" />
                <LearningMetric label="Panjang tarikan" value={result.ropeDistance} unit="m" />
                <LearningMetric label="Usaha masuk" value={result.inputWork} unit="J" />
                <LearningMetric label="Usaha berguna" value={result.outputWork} unit="J" />
              </dl>
            </article>
          )
        })}
      </div>
      <p className="learning-challenge" aria-live="polite">
        <strong>Yang bisa disimpulkan:</strong>{' '}
        {systems[0].percent === systems[1].percent
          ? `Efisiensi keduanya sama. Usaha masuk sama-sama ${f(results[0].inputWork)} J meskipun jumlah ruas dapat berbeda. Menambah ruas menurunkan gaya dan memperpanjang tarikan.`
          : `Efisiensinya berbeda. Usaha masuk A = ${f(results[0].inputWork)} J dan B = ${f(results[1].inputWork)} J. Bandingkan F × s; gaya saja tidak cukup untuk menentukan usaha.`}
      </p>
      <details className="learning-details">
        <summary>Rumus & tantangan perbandingan</summary>
        <p>
          Untuk masing-masing sistem: s = n × h, F = w / (η × n), U<sub>in</sub> = w × h / η.
          Gunakan η desimal.
        </p>
        <p>
          Coba A dengan 2 ruas dan efisiensi 100%, lalu B dengan 5 ruas dan efisiensi 60%. B butuh
          gaya lebih kecil, tetapi usaha masuk lebih besar. Ini terjadi karena tarikan lebih panjang
          dan bagian energi bergunanya lebih kecil.
        </p>
      </details>
    </div>
  )
}

function Status({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className={`constraint-status ${ok ? 'pass' : 'fail'}`}>
      {ok ? <Check size={16} /> : <X size={16} />}
      {children}
    </span>
  )
}

function OperatorCase() {
  const [input, setInput] = useState({
    mass: 48,
    gravity: 10,
    maxForce: 220,
    maxRope: 9,
    height: 2.5,
    strands: 3,
    efficiencyPercent: 100,
  })
  const update = (key: keyof typeof input, value: number) =>
    setInput((previous) => ({ ...previous, [key]: value }))
  const analysis = analyzeOperator(input)
  const selected = analysis.selected
  return (
    <div className="learning-experiment" aria-label="Batas kemampuan operator">
      <h3>Kuat menarik belum tentu cukup.</h3>
      <p>
        Seorang pekerja ingin menaikkan peti, tetapi gaya tarik dan panjang tarikan yang tersedia
        terbatas. Mana susunan yang bisa dipakai?
      </p>
      <div className="learning-controls">
        <LearningNumber
          label="Operator: massa peti"
          unit="kg"
          min={1}
          max={500}
          step={0.5}
          value={input.mass}
          onChange={(value) => update('mass', value)}
        />
        <LearningNumber
          label="Operator: gaya maksimum"
          unit="N"
          min={1}
          max={2000}
          value={input.maxForce}
          onChange={(value) => update('maxForce', value)}
        />
        <LearningNumber
          label="Operator: panjang tarikan maksimum"
          unit="m"
          min={0.1}
          max={30}
          step={0.1}
          value={input.maxRope}
          onChange={(value) => update('maxRope', value)}
        />
        <LearningNumber
          label="Operator: tinggi target"
          unit="m"
          min={0.1}
          max={10}
          step={0.1}
          value={input.height}
          onChange={(value) => update('height', value)}
        />
        <LearningNumber
          label="Operator: ruas pilihan"
          unit="ruas"
          min={1}
          max={10}
          value={input.strands}
          onChange={(value) => update('strands', value)}
        />
        <LearningNumber
          label="Operator: efisiensi"
          unit="%"
          min={1}
          max={100}
          value={input.efficiencyPercent}
          onChange={(value) => update('efficiencyPercent', value)}
        />
      </div>
      <p className="learning-note">
        g = 10 m/s². “Tali maksimum” di sini berarti panjang yang dapat <strong>ditarik</strong>,
        bukan panjang seluruh tali yang terpasang pada roda dan tambatan. Semua pilihan diuji pada
        efisiensi yang sama.
      </p>
      <div className="operator-result" role="status" aria-live="polite">
        <h4>
          {input.strands} ruas: {selected.usable ? 'dapat digunakan' : 'belum memenuhi batas'}
        </h4>
        <Status ok={selected.forceOK}>
          Gaya {f(selected.force)} N {selected.forceOK ? '≤' : '>'} batas {f(input.maxForce)} N.
        </Status>
        <Status ok={selected.ropeOK}>
          Tarikan {f(selected.ropeDistance)} m {selected.ropeOK ? '≤' : '>'} tersedia{' '}
          {f(input.maxRope)} m.
        </Status>
        <p>
          {selected.ropeOK
            ? `Massa maksimum pada susunan ini = ${f(selected.maxMass)} kg.`
            : `Batas gaya saja memungkinkan ${f(selected.forceLimitedMass)} kg, tetapi target tinggi tidak tercapai karena tarikan tidak cukup. Tidak ada massa positif yang dapat mencapai target dengan susunan ini.`}
        </p>
      </div>
      <details className="learning-details">
        <summary>Mengapa ada batas bawah dan batas atas jumlah ruas?</summary>
        <p>
          Batas gaya: n ≥ w / (η × F maksimum). Batas tarikan: n ≤ s maksimum / h. Pilih bilangan
          bulat yang memenuhi keduanya.
        </p>
        <p>
          Massa maksimum dari batas gaya: m maksimum = F maksimum × η × n / g, hanya berlaku untuk
          mencapai target jika n × h ≤ s maksimum. Jika tarikan tidak cukup, mengganti massa saja
          tidak menyelesaikan masalah.
        </p>
      </details>
      <h4 className="configuration-heading">Uji semua susunan · 1–10 ruas</h4>
      <div className="configuration-list">
        {analysis.configurations.map((configuration) => (
          <button
            key={configuration.strands}
            aria-pressed={input.strands === configuration.strands}
            className={configuration.usable ? 'feasible' : ''}
            onClick={() => update('strands', configuration.strands)}
          >
            <strong>{configuration.strands} ruas</strong>
            <span>
              {f(configuration.force)} N · {f(configuration.ropeDistance)} m
            </span>
            <small>
              {configuration.usable
                ? 'Memenuhi keduanya'
                : [
                    !configuration.forceOK && 'Gaya terlalu besar',
                    !configuration.ropeOK && 'Tarikan kurang',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
            </small>
          </button>
        ))}
      </div>
      <p className="learning-challenge" aria-live="polite">
        {analysis.feasible.length
          ? `Peti ini dapat diangkat dengan ${analysis.feasible.map((configuration) => configuration.strands).join(', ')} ruas.`
          : 'Tidak ada susunan 1–10 ruas yang memenuhi seluruh batas untuk peti ini. Alasan setiap susunan ditampilkan di atas. Kurangi massa atau tinggi target, tambah kemampuan tarik atau panjang tarikan, atau tingkatkan efisiensi lalu uji lagi.'}{' '}
        Massa maksimum untuk target tinggi ini, dari pilihan 1–10 ruas:{' '}
        <strong>{f(analysis.maxMass)} kg</strong>.
      </p>
    </div>
  )
}

export function AdvancedStage() {
  return (
    <section id="analisis" className="learning-stage">
      <StageHeading
        number={4}
        title="Pilih sistemnya. Jelaskan alasannya."
        description="Hubungkan gaya, jarak, usaha, dan batas kemampuan dalam satu keputusan."
      />
      <SystemComparison />
      <OperatorCase />
      <WorkedExamples />
    </section>
  )
}
