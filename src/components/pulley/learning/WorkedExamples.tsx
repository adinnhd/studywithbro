import { useState } from 'react'
import { analyzeOperator, calculateEnergy } from '../../../lib/physics/pulleyEnergy'
import { formatNumber as f } from '../../../lib/physics/pulley'

const strategy = [
  'Catat besaran yang diketahui',
  'Tentukan yang ditanyakan',
  'Pilih model ideal atau nyata',
  'Tentukan ruas penopang',
  'Pilih rumus',
  'Hitung dengan satuan konsisten',
  'Periksa kewajaran hasil',
]
const energy = calculateEnergy({ weight: 684, strands: 3, height: 1.25, efficiencyPercent: 76 })
const operator = analyzeOperator({
  mass: 57,
  gravity: 10,
  maxForce: 190,
  maxRope: 10.5,
  height: 2.5,
  efficiencyPercent: 90,
  strands: 4,
})
const examples = [
  {
    title: 'Contoh 1 · Peti di gudang',
    story:
      'Peti seberat 684 N diangkat 1,25 m dengan 3 ruas penopang. Efisiensi sistem 76%. Berapa gaya tarik dan usaha masuk yang dibutuhkan?',
    formula: 'η = persen / 100; F = w / (η × n); s = n × h; U_in = F × s; U_out = w × h.',
    steps: [
      'Diketahui: w = 684 N, h = 1,25 m, n = 3, dan η = 76% = 0,76. Berat sudah dalam N, jadi tidak perlu dikali g lagi.',
      'Ditanyakan: gaya kuasa F dalam N dan usaha masuk U_in dalam J.',
      'Efisiensinya di bawah 100%, jadi gunakan model nyata. Beban diangkat perlahan dan tali tidak mulur.',
      'Tiga ruas menopang blok beban: KM ideal = 3. Ini tidak sama dengan menghitung jumlah rodanya.',
      'Cari F dengan w / (η × n), lalu cari s dengan n × h dan usaha masuk dengan F × s.',
      `F = 684 / (0,76 × 3) = ${f(energy.force)} N. Tarikan s = 3 × 1,25 = ${f(energy.ropeDistance)} m. Kalikan kedua hasil untuk mendapatkan usaha masuk.`,
      `Hasil: F = ${f(energy.force)} N; U_in = ${f(energy.inputWork)} J. Cek: U_out = ${f(energy.outputWork)} J, sehingga U_in > U_out. Energi ke bentuk lain = ${f(energy.lostEnergy)} J; U_out / U_in = 0,76.`,
    ],
  },
  {
    title: 'Contoh 2 · Pilih susunan yang pas',
    story:
      'Pekerja mengangkat peti 57 kg ke tinggi 2,5 m. Gaya maksimumnya 190 N dan panjang tarikan yang tersedia 10,5 m. Efisiensi semua pilihan 90%, g = 10 m/s². Pilih n dari 1–10 yang memenuhi kedua batas.',
    formula: 'w = m × g; n ≥ w / (η × F_maks); n ≤ s_maks / h; F = w / (η × n); s = n × h.',
    steps: [
      'Diketahui: m = 57 kg, g = 10 m/s², h = 2,5 m, F_maks = 190 N, s_maks = 10,5 m, η = 90% = 0,9.',
      'Ditanyakan: jumlah ruas bulat 1–10 yang memenuhi batas gaya sekaligus batas panjang tarikan.',
      'Gunakan sistem nyata. Ubah massa menjadi berat: w = 57 × 10 = 570 N.',
      'n belum diketahui. Setiap tambahan ruas mengurangi gaya, tetapi menambah panjang tarikan.',
      'Gunakan n ≥ w / (η × F_maks) dan n ≤ s_maks / h. Cari irisan keduanya, kemudian pilih bilangan bulat.',
      'Batas gaya: n ≥ 570 / (0,9 × 190) ≈ 3,33. Batas tali: n ≤ 10,5 / 2,5 = 4,2. Bilangan bulat harus berada di antara kedua batas ini.',
      `Hanya n = ${operator.feasible.map((item) => item.strands).join(', ')} yang memenuhi. Cek: F ≈ ${f(operator.selected.force)} N ≤ 190 N dan s = ${f(operator.selected.ropeDistance)} m ≤ 10,5 m. Memilih ruas lebih banyak belum tentu berhasil karena tali juga terbatas.`,
    ],
  },
]

export function WorkedExamples() {
  const [selected, setSelected] = useState(0)
  const [visible, setVisible] = useState(0)
  const [formula, setFormula] = useState(false)
  const example = examples[selected]
  return (
    <div className="learning-experiment worked-examples">
      <h3>Soal cerita: buka satu langkah dulu.</h3>
      <p>Pakai alur ini sebelum menghitung. Angka contoh disusun terpisah dari latihan A/B/C.</p>
      <ol className="story-strategy">
        {strategy.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="learning-choice" role="group" aria-label="Pilih contoh soal cerita">
        {examples.map((item, index) => (
          <button
            key={item.title}
            aria-pressed={selected === index}
            onClick={() => {
              setSelected(index)
              setVisible(0)
              setFormula(false)
            }}
          >
            {item.title}
          </button>
        ))}
      </div>
      <p className="story-prompt">{example.story}</p>
      {formula && <p className="story-formula">{example.formula}</p>}
      <ol className="worked-steps" aria-live="polite" aria-relevant="additions">
        {example.steps.slice(0, visible).map((step, index) => (
          <li key={step}>
            <strong>{strategy[index]}</strong>
            <p>{step}</p>
          </li>
        ))}
      </ol>
      <div className="learning-actions">
        <button
          className="button button-dark"
          disabled={visible === 7}
          onClick={() => setVisible((value) => value + 1)}
        >
          Lihat langkah berikutnya
        </button>
        <button
          className="button button-outline"
          aria-expanded={formula}
          onClick={() => setFormula((value) => !value)}
        >
          {formula ? 'Sembunyikan rumus' : 'Tampilkan rumus'}
        </button>
        <button
          className="button button-outline"
          disabled={visible === 7}
          onClick={() => setVisible(7)}
        >
          Lihat hasil akhir
        </button>
      </div>
      <p className="learning-note">
        {visible} dari 7 langkah terbuka. Ganti contoh untuk mulai lagi.
      </p>
    </div>
  )
}
