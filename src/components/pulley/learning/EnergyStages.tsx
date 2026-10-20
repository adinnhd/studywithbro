import { useState } from 'react'
import { calculateEnergy, calculateEnergyFromRope } from '../../../lib/physics/pulleyEnergy'
import { formatNumber as f } from '../../../lib/physics/pulley'
import { EnergyFlow } from './EnergyFlow'
import { LearningMetric, LearningNumber, StageHeading } from './LearningControls'

function EnergyExperiment({ work = false }: { work?: boolean }) {
  const [weight, setWeight] = useState(640)
  const [strands, setStrands] = useState(4)
  const [percent, setPercent] = useState(100)
  const [height, setHeight] = useState(1.5)
  const [rope, setRope] = useState(6)
  const result = work
    ? calculateEnergyFromRope({ weight, strands, efficiencyPercent: percent, rope })
    : calculateEnergy({ weight, strands, efficiencyPercent: percent, height })
  const actualHeight = work ? rope / strands : height
  const prefix = work ? 'Usaha' : 'Efisiensi'
  return (
    <div className="learning-experiment" aria-label={`Eksperimen ${prefix.toLowerCase()}`}>
      <div className="learning-experiment-title">
        <h3>{work ? 'Ke mana usaha tarikanmu pergi?' : 'Beban tetap, efisiensi berubah.'}</h3>
        <span className="status-pill">Langsung terhitung</span>
      </div>
      <div className="learning-controls">
        <LearningNumber
          label={`${prefix}: berat beban`}
          unit="N"
          min={10}
          max={2000}
          step={10}
          value={weight}
          onChange={setWeight}
        />
        <LearningNumber
          label={`${prefix}: ruas penopang`}
          unit="ruas"
          min={1}
          max={10}
          value={strands}
          onChange={setStrands}
        />
        {work ? (
          <LearningNumber
            label="Usaha: panjang tarikan"
            unit="m"
            min={0.1}
            max={30}
            step={0.1}
            value={rope}
            onChange={setRope}
          />
        ) : (
          <LearningNumber
            label="Efisiensi: tinggi angkat"
            unit="m"
            min={0.1}
            max={5}
            step={0.1}
            value={height}
            onChange={setHeight}
          />
        )}
        <LearningNumber
          label={`${prefix}: efisiensi sistem`}
          unit="%"
          min={1}
          max={100}
          value={percent}
          onChange={setPercent}
        />
      </div>
      <p className="learning-note">
        {work
          ? 'Mulai dari 100% untuk sistem ideal. Turunkan efisiensi untuk melihat pengaruh gesekan.'
          : `η = ${f(percent)}% = ${f(result.efficiency)} dalam bentuk desimal. F = w / (${f(result.efficiency)} × n).`}
      </p>
      <EnergyFlow {...result} weight={weight} height={actualHeight} />
      <dl className="learning-metrics" aria-live="polite" aria-atomic="true">
        <LearningMetric label="KM ideal = n" value={result.idealMA} />
        <LearningMetric label="KM aktual = w / F" value={result.actualMA} />
        <LearningMetric label="Gaya kuasa F" value={result.force} unit="N" />
        <LearningMetric label="Tarikan tali s" value={result.ropeDistance} unit="m" />
        <LearningMetric label="Kenaikan beban h" value={actualHeight} unit="m" />
        <LearningMetric label="Usaha masuk" value={result.inputWork} unit="J" />
        <LearningMetric label="Usaha berguna" value={result.outputWork} unit="J" />
        <LearningMetric label="Energi ke bentuk lain" value={result.lostEnergy} unit="J" />
      </dl>
      <details className="learning-details">
        <summary>Lihat langkah perhitungan eksperimen</summary>
        <ol className="learning-calculations">
          <li>
            Ubah persen: η = {f(percent)} / 100 = {f(result.efficiency)}.
          </li>
          <li>
            {work
              ? `h = s / n = ${f(rope)} / ${strands} = ${f(actualHeight)} m.`
              : `s = n × h = ${strands} × ${f(height)} = ${f(result.ropeDistance)} m.`}
          </li>
          <li>
            KM aktual = η × n = {f(result.efficiency)} × {strands} = {f(result.actualMA)}.
          </li>
          <li>
            F = w / (η × n) = {f(weight)} / ({f(result.efficiency)} × {strands}) ≈ {f(result.force)}{' '}
            N.
          </li>
          <li>
            U<sub>in</sub> = F × s ≈ {f(result.force)} × {f(result.ropeDistance)} ≈{' '}
            {f(result.inputWork)} J.
          </li>
          <li>
            U<sub>out</sub> = w × h = {f(weight)} × {f(actualHeight)} = {f(result.outputWork)} J.
          </li>
          <li>
            E<sub>hilang</sub> = U<sub>in</sub> − U<sub>out</sub> ≈ {f(result.inputWork)} −{' '}
            {f(result.outputWork)} ≈ {f(result.lostEnergy)} J.
          </li>
        </ol>
        <p>Angka tampilan dibulatkan; perhitungan memakai nilai lengkap.</p>
      </details>
      <p className="learning-challenge">
        <strong>Coba & amati:</strong>{' '}
        {work
          ? 'Pertahankan berat, tarikan, dan efisiensi 100%. Gandakan n: gaya berkurang, tetapi beban juga naik lebih rendah.'
          : 'Pertahankan berat dan tinggi. Turunkan efisiensi: usaha berguna tetap, sedangkan usaha masuk dan energi ke bentuk lain bertambah.'}
      </p>
    </div>
  )
}

export function WorkStage() {
  return (
    <section id="usaha" className="learning-stage">
      <StageHeading
        number={2}
        title="Gaya punya pasangan: perpindahan."
        description="Usaha dan energi, diterapkan khusus pada pengangkatan dengan katrol."
      />
      <div className="learning-concept">
        <p>
          Dalam fisika, gaya melakukan <strong>usaha</strong> ketika benda berpindah. Untuk gaya
          tetap yang searah perpindahan, usaha = gaya × perpindahan. Satuannya{' '}
          <strong>joule (J)</strong>; 1 J = 1 N × 1 m. Menahan beban tanpa memindahkannya
          menghasilkan usaha mekanis nol pada beban, meskipun tubuh bisa terasa lelah.
        </p>
        <p>
          Operator menarik tali sejauh <strong>s</strong> dengan gaya <strong>F</strong>. Beban
          dengan berat <strong>w</strong> naik setinggi <strong>h</strong>. Dua perpindahan ini
          berbeda: <strong>s = n × h</strong>.
        </p>
      </div>
      <div className="learning-formula-cards">
        <article>
          <span>Usaha masuk</span>
          <strong>
            U<sub>in</sub> = F × s
          </strong>
          <p>Energi yang diberikan operator lewat tarikan.</p>
        </article>
        <article>
          <span>Usaha berguna</span>
          <strong>
            U<sub>out</sub> = w × h
          </strong>
          <p>Energi yang menambah energi potensial gravitasi beban.</p>
        </article>
        <article>
          <span>Energi ke bentuk lain</span>
          <strong>
            E<sub>hilang</sub> = U<sub>in</sub> − U<sub>out</sub>
          </strong>
          <p>Bagian energi masuk yang tidak menjadi usaha angkat berguna.</p>
        </article>
      </div>
      <details className="learning-details">
        <summary>Kenapa memakai U, bukan W? Kenali simbolnya.</summary>
        <p>
          Banyak buku memakai W untuk Work (usaha) dan w untuk Weight (berat). Di materi baru ini,{' '}
          <strong>U menyatakan usaha (J)</strong> dan <strong>w menyatakan berat beban (N)</strong>.
          W pada simulator dasar dan mnemonic “WiFi” tetap berarti berat, sama dengan w di sini.
        </p>
        <p>
          F = gaya kuasa (N), s = panjang tali yang ditarik (m), h = kenaikan beban (m), n = jumlah
          ruas penopang (tanpa satuan). Massa m (kg) berbeda dari berat w = m × g (N).
        </p>
      </details>
      <p className="learning-note">
        <strong>Gaya lebih kecil, usaha belum tentu lebih kecil.</strong> Pada katrol ideal, U
        <sub>in</sub> = U<sub>out</sub>. Untuk beban dan tinggi yang sama, gaya yang lebih kecil
        dibayar dengan tarikan lebih panjang. Pada katrol nyata, U<sub>in</sub> ≥ U<sub>out</sub>.
      </p>
      <EnergyExperiment work />
      <a className="learning-next" href="#efisiensi">
        Lanjut: mengapa katrol nyata butuh usaha lebih besar? →
      </a>
    </section>
  )
}

export function EfficiencyStage() {
  return (
    <section id="efisiensi" className="learning-stage">
      <StageHeading
        number={3}
        title="Tak semua energi sampai ke beban."
        description="Efisiensi menunjukkan bagian usaha masuk yang menjadi usaha angkat berguna."
      />
      <div className="learning-two-column learning-concept">
        <article>
          <h3>Katrol ideal · η = 100%</h3>
          <p>
            Gesekan dan berat komponen diabaikan. Usaha masuk sama dengan usaha berguna. KM aktual =
            KM ideal = n.
          </p>
        </article>
        <article>
          <h3>Katrol nyata · η &lt; 100%</h3>
          <p>
            Ada energi yang berubah menjadi panas atau bunyi, misalnya akibat gesekan. Usaha masuk
            lebih besar daripada usaha berguna; KM aktual lebih kecil daripada KM ideal pada model
            ini.
          </p>
        </article>
      </div>
      <p className="learning-note">
        Asumsi seluruh eksperimen baru: beban bergerak perlahan dengan kecepatan tetap, tali tidak
        mulur, dan geometri tarikan s = n × h tetap berlaku. Efisiensi adalah nilai total sistem
        yang diketahui, bukan dihitung dari jenis gesekan atau jumlah roda.
      </p>
      <div className="learning-formula-cards">
        <article>
          <span>Dari usaha</span>
          <strong>
            η = (U<sub>out</sub> / U<sub>in</sub>) × 100%
          </strong>
          <p>Setara dengan η = [(w × h) / (F × s)] × 100%.</p>
        </article>
        <article>
          <span>Dari keuntungan mekanis</span>
          <strong>η = (KM aktual / KM ideal) × 100%</strong>
          <p>
            KM ideal = n; KM aktual = w / F. Hitung ruas yang benar-benar menopang blok bergerak,
            bukan jumlah roda.
          </p>
        </article>
        <article>
          <span>Mencari gaya nyata</span>
          <strong>F = w / (η × n)</strong>
          <p>
            Gunakan η desimal: 80% = 0,8. Memasukkan 80 alih-alih 0,8 membuat hasil 100 kali terlalu
            kecil.
          </p>
        </article>
      </div>
      <EnergyExperiment />
      <details className="learning-details">
        <summary>Dari usaha ke KM: kenapa rumusnya terhubung?</summary>
        <p>
          Dalam bentuk desimal: η = (w × h) / (F × s). Karena s = n × h dan h &gt; 0, maka η = w /
          (F × n) = (w / F) / n = KM aktual / KM ideal.
        </p>
        <p>
          Efisiensi lebih rendah berarti butuh gaya lebih besar untuk pengangkatan yang sama.
          Panjang tarikan tetap ditentukan geometri tali; menurunkan efisiensi tidak otomatis
          memperpanjangnya.
        </p>
      </details>
      <a className="learning-next" href="#analisis">
        Lanjut: pilih sistem yang cocok dengan kemampuanmu →
      </a>
    </section>
  )
}
