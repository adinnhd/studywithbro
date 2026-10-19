import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Lightbulb,
  MoveDown,
  MoveUp,
  Orbit,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Breadcrumb } from '../components/navigation/Breadcrumb'
import { LessonNav } from '../components/navigation/LessonNav'
import { PulleySimulator } from '../components/pulley/PulleySimulator'
import { PulleyVisualization } from '../components/pulley/PulleyVisualization'
import { FormulaTriangle } from '../components/formula/FormulaTriangle'
import { DEFAULT_INPUT, calculatePulley } from '../lib/physics/pulley'
import type { PulleyKind } from '../types/pulley'

const concepts: {
  kind: PulleyKind
  title: string
  km: string
  description: string
  example: string
}[] = [
  {
    kind: 'fixed',
    title: 'Katrol tetap',
    km: 'KM = 1',
    description:
      'Rodanya tetap di tempat. Mengubah arah gaya, jadi kamu bisa menarik ke bawah untuk mengangkat beban.',
    example: 'Contoh: katrol tiang bendera.',
  },
  {
    kind: 'movable',
    title: 'Katrol bergerak',
    km: 'KM = 2',
    description:
      'Rodanya ikut naik bersama beban. Dua ruas tali berbagi beban, sehingga gaya yang dibutuhkan tinggal setengahnya.',
    example: 'Contoh: katrol pengangkat barang.',
  },
  {
    kind: 'compound',
    title: 'Katrol majemuk',
    km: 'KM = n',
    description:
      'Gabungan roda tetap dan bergerak. Hitung ruas tali penopang blok bergerak untuk mengetahui KM-nya.',
    example: 'Contoh: sistem pengangkat pada derek.',
  },
]
export function PulleyLessonPage() {
  return (
    <div className="container lesson-page">
      <Breadcrumb />
      <header className="lesson-header">
        <div>
          <div className="section-kicker">
            <Orbit size={16} /> IPA <span>/</span> FISIKA <span>/</span> PESAWAT SEDERHANA
          </div>
          <h1>
            Katrol<span className="lesson-title-dot">.</span>
          </h1>
          <p>Beban yang sama. Gaya yang berbeda. Yuk, cari tahu kenapa.</p>
        </div>
        <div className="lesson-header-note">
          <span className="status-pill">
            <span className="status-dot" /> Materi interaktif
          </span>
          <span>TKA SMP · Belajar dengan mencoba</span>
        </div>
      </header>
      <LessonNav />
      <section id="konsep" className="concept-section">
        <div className="concept-intro">
          <div>
            <div className="section-kicker">
              <BookOpen size={16} /> KENALAN DULU, YUK
            </div>
            <h2>Roda kecil. Bantuan besar.</h2>
            <p>
              Katrol adalah roda beralur yang dilalui tali. Saat kamu menarik satu ujungnya, ujung
              lain bisa mengangkat beban. Ada yang membantu mengubah arah gaya, ada juga yang
              memperkecil gaya yang dibutuhkan.
            </p>
          </div>
          <aside className="concept-question">
            <Lightbulb size={23} />
            <p>
              Pernah menarik ember dari sumur?
              <br />
              <strong>Itu salah satu cara katrol bantu kita.</strong>
            </p>
          </aside>
        </div>
        <div className="concept-cards">
          {concepts.map((concept, index) => {
            const input = { ...DEFAULT_INPUT, kind: concept.kind, strands: 4 }
            return (
              <article className="concept-card" key={concept.kind}>
                <div className="concept-card-top">
                  <span>0{index + 1}</span>
                  <span className="km-badge">{concept.km}</span>
                </div>
                <div className="concept-visual">
                  <PulleyVisualization input={input} result={calculatePulley(input)} compact />
                </div>
                <h3>{concept.title}</h3>
                <p>{concept.description}</p>
                <small>{concept.example}</small>
              </article>
            )
          })}
        </div>
        <div className="km-explainer">
          <div>
            <span className="km-big">
              KM<span>?</span>
            </span>
            <div>
              <h3>Keuntungan mekanis = seberapa besar katrol membantu.</h3>
              <p>
                KM = W / F. Kalau KM = 4, kamu hanya butuh ¼ dari berat beban sebagai gaya kuasa.
                Pada katrol ideal, KM sama dengan jumlah ruas tali yang menopang beban bergerak.
              </p>
            </div>
          </div>
          <div className="km-tradeoff">
            <span>
              <MoveUp size={17} />
              KM makin besar
            </span>
            <ArrowRight size={15} />
            <span>
              <MoveDown size={17} />
              Gaya makin kecil
            </span>
          </div>
        </div>
        <a className="concept-next" href="#simulasi">
          Buktikan sendiri di simulasi <ArrowDown size={16} />
        </a>
      </section>
      <PulleySimulator />
      <FormulaTriangle />
      <section className="lesson-recap">
        <div>
          <span className="eyebrow">SUDAH MULAI KEBAYANG?</span>
          <h2>Dari coba-coba, jadi bisa.</h2>
          <ul>
            <li>
              <Check size={16} />
              Hitung ruas penopang, bukan jumlah rodanya.
            </li>
            <li>
              <Check size={16} />
              Gaya lebih kecil berarti tali ditarik lebih panjang.
            </li>
            <li>
              <Check size={16} />
              Model ideal: tanpa gesekan, gerak perlahan dengan kecepatan tetap.
            </li>
          </ul>
          <p>
            Referensi konsep:{' '}
            <a
              href="https://openstax.org/books/physics/pages/9-3-simple-machines"
              target="_blank"
              rel="noreferrer"
            >
              OpenStax — Simple Machines <ArrowUpRight size={12} />
            </a>
          </p>
        </div>
        <div className="recap-action">
          <BookOpen size={28} />
          <h3>Lanjut ke ruang latihan</h3>
          <p>Halaman latihan sudah disiapkan. Soal dan PDF menyusul.</p>
          <Link className="button button-dark" to="/ipa/fisika/katrol/latihan">
            Lihat Latihan <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  )
}
