import { Fragment, useId, useState } from 'react'

const groups = ['Dasar Katrol', 'Usaha', 'Efisiensi'] as const
type Group = (typeof groups)[number]
interface Formula {
  group: Group
  name: string
  when: string
  symbols: string
  forms: Record<string, string>
}
const formulas: Formula[] = [
  {
    group: 'Dasar Katrol',
    name: 'Berat beban',
    when: 'Saat massa diketahui. Berat adalah gaya gravitasi, bukan massa.',
    symbols: 'w: berat (N); m: massa (kg); g: percepatan gravitasi (m/s²).',
    forms: { w: 'w = m × g', m: 'm = w / g', g: 'g = w / m' },
  },
  {
    group: 'Dasar Katrol',
    name: 'Gaya pada katrol ideal',
    when: 'Untuk pengangkatan perlahan tanpa rugi energi. KM ideal sama dengan jumlah ruas penopang.',
    symbols: 'F: gaya kuasa (N); w: berat (N); n: jumlah ruas penopang (tanpa satuan).',
    forms: { F: 'F = w / n', w: 'w = F × n', n: 'n = w / F' },
  },
  {
    group: 'Dasar Katrol',
    name: 'Keuntungan mekanis',
    when: 'Membandingkan berat dan gaya tarik. Hasil merupakan KM aktual; pada kondisi ideal nilainya n.',
    symbols: 'KM: keuntungan mekanis (tanpa satuan); w: berat (N); F: gaya kuasa (N).',
    forms: { KM: 'KM = w / F', w: 'w = KM × F', F: 'F = w / KM' },
  },
  {
    group: 'Dasar Katrol',
    name: 'Jarak tarikan',
    when: 'Untuk tali tidak mulur pada konfigurasi yang benar, baik ideal maupun model nyata di materi ini.',
    symbols:
      's: panjang tarikan (m); n: jumlah ruas penopang (tanpa satuan); h: kenaikan beban (m).',
    forms: { s: 's = n × h', h: 'h = s / n', n: 'n = s / h' },
  },
  {
    group: 'Usaha',
    name: 'Usaha masuk',
    when: 'Gaya kuasa tetap dan searah perpindahan ujung tali.',
    symbols: 'U_in: usaha masuk (J); F: gaya kuasa (N); s: panjang tarikan (m).',
    forms: { U_in: 'U_in = F × s', F: 'F = U_in / s', s: 's = U_in / F' },
  },
  {
    group: 'Usaha',
    name: 'Usaha berguna',
    when: 'Menghitung energi untuk menaikkan beban dengan kecepatan tetap, atau pertambahan energi potensial gravitasinya.',
    symbols: 'U_out: usaha berguna (J); w: berat (N); h: kenaikan beban (m).',
    forms: { U_out: 'U_out = w × h', w: 'w = U_out / h', h: 'h = U_out / w' },
  },
  {
    group: 'Usaha',
    name: 'Energi ke bentuk lain',
    when: 'Mencari bagian energi yang tidak menjadi usaha angkat berguna. Energi ini tidak musnah.',
    symbols:
      'E_hilang: energi ke bentuk lain (J); U_in: usaha masuk (J); U_out: usaha berguna (J).',
    forms: {
      E_hilang: 'E_hilang = U_in − U_out',
      U_in: 'U_in = U_out + E_hilang',
      U_out: 'U_out = U_in − E_hilang',
    },
  },
  {
    group: 'Efisiensi',
    name: 'Efisiensi dari usaha',
    when: 'Gunakan ketika usaha masuk dan usaha berguna diketahui. Hasil η di sini dalam persen. Untuk mencari usaha, nilai persen berarti angka tanpa tanda %, misalnya 80 untuk 80%.',
    symbols:
      'η (%): efisiensi persen; nilai persen: angka persen, misalnya 80; U_in: usaha masuk (J); U_out: usaha berguna (J).',
    forms: {
      'η (%)': 'η (%) = (U_out / U_in) × 100%',
      U_out: 'U_out = (nilai persen / 100) × U_in',
      U_in: 'U_in = U_out / (nilai persen / 100)',
    },
  },
  {
    group: 'Efisiensi',
    name: 'KM aktual dan efisiensi',
    when: 'Berlaku jika s = n × h. Masukkan η dalam desimal, misalnya 80% → 0,8. Persentase efisiensi = (KM aktual / KM ideal) × 100%.',
    symbols: 'KM_aktual, KM_ideal, n: tanpa satuan; η: efisiensi desimal. KM_ideal = n.',
    forms: {
      KM_aktual: 'KM_aktual = η × n',
      'η (desimal)': 'η = KM_aktual / n',
      n: 'n = KM_aktual / η',
    },
  },
  {
    group: 'Efisiensi',
    name: 'Gaya pada sistem nyata',
    when: 'Gerak perlahan dengan s = n × h. Selalu gunakan η desimal. Hasil n harus sesuai konfigurasi tali yang mungkin.',
    symbols:
      'F: gaya kuasa (N); w: berat (N); n: ruas penopang (tanpa satuan); η: efisiensi desimal (0 < η ≤ 1).',
    forms: {
      F: 'F = w / (η × n)',
      w: 'w = η × n × F',
      n: 'n = w / (η × F)',
      'η (desimal)': 'η = w / (n × F)',
    },
  },
]

function Equation({ text }: { text: string }) {
  return (
    <>
      {text.split(/([UEKM]+_(?:in|out|hilang|aktual|ideal))/g).map((part, index) => {
        const [base, sub] = part.split('_')
        return (
          <Fragment key={index}>
            {sub ? (
              <>
                {base}
                <sub>{sub}</sub>
              </>
            ) : (
              part
            )}
          </Fragment>
        )
      })}
    </>
  )
}

function ReferenceCard({ formula }: { formula: Formula }) {
  const id = useId()
  const [target, setTarget] = useState(Object.keys(formula.forms)[0])
  return (
    <article className="reference-card">
      <h4>{formula.name}</h4>
      <label htmlFor={id}>Besaran yang dicari</label>
      <select id={id} value={target} onChange={(event) => setTarget(event.target.value)}>
        {Object.keys(formula.forms).map((symbol) => (
          <option key={symbol} value={symbol}>
            {symbol.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
      <p className="reference-equation" aria-live="polite">
        <Equation text={formula.forms[target]} />
      </p>
      <p>{formula.when}</p>
      <details>
        <summary>Arti simbol & satuan</summary>
        <p>
          <Equation text={formula.symbols} />
        </p>
      </details>
    </article>
  )
}

export function FormulaReference() {
  const [group, setGroup] = useState<Group>('Dasar Katrol')
  return (
    <section id="referensi-rumus" className="learning-stage formula-reference">
      <div className="learning-heading">
        <span className="learning-step">BEKAL SAAT MENGERJAKAN</span>
        <h2>Pilih yang dicari, temukan hubungannya.</h2>
        <p>
          Referensi rumus ini melengkapi segitiga dan mnemonic sebelumnya. Mulai dari konsep, lalu
          pilih rumus yang cocok.
        </p>
      </div>
      <div className="learning-choice" role="group" aria-label="Kelompok referensi rumus">
        {groups.map((item) => (
          <button key={item} aria-pressed={group === item} onClick={() => setGroup(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="reference-grid">
        {formulas
          .filter((formula) => formula.group === group)
          .map((formula) => (
            <ReferenceCard key={formula.name} formula={formula} />
          ))}
      </div>
      <p className="learning-note">
        Ubah cm ke m sebelum menghitung usaha. Pembagi harus lebih dari nol. Rumus pembagian untuk
        mencari η mengandaikan ada pengangkatan dengan usaha masuk positif. Hasil efisiensi di atas
        100% berarti data atau asumsi perlu diperiksa.
      </p>
    </section>
  )
}
