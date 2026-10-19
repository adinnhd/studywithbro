import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  FlaskConical,
  MousePointer2,
  Orbit,
  Play,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { subjects } from '../data/navigation'
import { SubjectCard } from '../components/ui/SubjectCard'
import { PulleyPreview } from '../components/pulley/PulleySimulator'

export function HomePage() {
  return (
    <>
      <section className="home-hero container">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span className="tiny-orbit">
              <Orbit size={15} />
            </span>{' '}
            RUANG BELAJAR, BUKAN RUANG HAFALAN
          </div>
          <h1>
            Belajar nggak
            <br />
            harus{' '}
            <span className="hero-word">
              ngebosenin
              <svg viewBox="0 0 440 22" preserveAspectRatio="none" aria-hidden="true">
                <path
                  d="M5 13Q210-2 434 12M14 19Q230 6 414 18"
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="hero-period">.</span>
          </h1>
          <p className="hero-description">
            Daripada cuma ngafalin rumus, mending cobain sendiri. Eksperimen, utak-atik, sampai
            beneran paham.
          </p>
          <div className="hero-actions">
            <Link className="button button-dark button-lg" to="/ipa">
              Mulai Belajar <ArrowUpRight size={18} />
            </Link>
            <Link className="button button-outline button-lg" to="/ipa/fisika/katrol#simulasi">
              <Play size={15} />
              Coba Simulasi Katrol
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="mini-check">✓</span> Gratis, tanpa akun.
            <span className="footnote-dot">·</span> Langsung bisa eksplorasi.
          </div>
          <div className="hero-scroll">
            <span className="scroll-line" />
            <span>SEDIKIT PENASARAN, BANYAK PEMAHAMAN</span>
            <ArrowDown size={14} />
          </div>
        </div>
        <div className="hero-playground">
          <div className="orbit-decoration" />
          <span className="hero-spark spark-one">✳</span>
          <span className="hero-spark spark-two">+</span>
          <PulleyPreview />
          <span className="playground-caption">KURANGI HAFALAN, TAMBAH PERCOBAAN.</span>
        </div>
      </section>
      <div className="belief-strip">
        <div className="container">
          <span>
            <MousePointer2 size={19} /> Cobain langsung
          </span>
          <i />
          <span>
            <Orbit size={20} /> Lihat cara kerjanya
          </span>
          <i />
          <span>
            <BookOpen size={18} /> Paham konsepnya
          </span>
          <span className="belief-tagline">
            Belajar bareng. <strong>Paham beneran.</strong>
            <Sparkles size={16} />
          </span>
        </div>
      </div>
      <section className="subjects-section container" id="materi">
        <div className="section-heading">
          <div>
            <div className="section-kicker">
              <span className="small-square" /> PILIH RASA PENASARANMU
            </div>
            <h2>Mau eksplorasi apa hari ini?</h2>
            <p className="section-description">
              Mulai dari yang bikin penasaran. Pelan-pelan, sampai paham.
            </p>
          </div>
          <span className="small-meta">
            RUANG EKSPLORASI <span>01 — 03</span>
          </span>
        </div>
        <div className="subject-grid">
          {subjects.map((subject) => (
            <SubjectCard key={subject.title} {...subject} />
          ))}
        </div>
      </section>
      <section className="featured-section container">
        <div className="featured-card">
          <div className="featured-visual" aria-hidden="true">
            <div className="featured-visual-grid" />
            <svg viewBox="0 0 380 280">
              <path d="M94 47h185" stroke="#648068" strokeWidth="7" strokeLinecap="round" />
              <path
                d="M120 49v129a26 26 0 0 0 52 0V94a26 26 0 0 1 52 0v110"
                fill="none"
                stroke="#d2ed8c"
                strokeWidth="5"
              />
              <path d="M198 50v44M146 178v37" stroke="#91a27d" strokeWidth="5" />
              <circle cx="198" cy="94" r="21" fill="#365d46" stroke="#9cb47f" strokeWidth="2" />
              <circle cx="146" cy="178" r="21" fill="#d0e79e" stroke="#a0bc7c" strokeWidth="2" />
              <circle cx="146" cy="178" r="5" fill="#365d46" />
              <circle cx="198" cy="94" r="5" fill="#d0e79e" />
              <rect x="113" y="215" width="66" height="42" rx="7" fill="#d0e79e" />
              <text
                x="146"
                y="242"
                fontSize="19"
                textAnchor="middle"
                fill="#365d46"
                fontWeight="700"
              >
                50 kg
              </text>
              <path d="M224 213v23l-6-8m6 8l6-8" stroke="#eea272" strokeWidth="3" fill="none" />
              <text x="241" y="235" fill="#eea272" fontSize="17" fontWeight="600">
                F
              </text>
            </svg>
            <span className="featured-visual-label">GAYA KECIL, IDE BESAR.</span>
          </div>
          <div className="featured-copy">
            <span className="featured-badge">
              <FlaskConical size={14} /> EKSPERIMEN PERTAMAMU
            </span>
            <h2>
              Angkat beban berat.
              <br />
              Pakai gaya lebih hemat.
            </h2>
            <p>
              Satu roda, seutas tali, dan cara pandang baru. Kenalan dengan katrol lewat simulasi
              yang bisa kamu utak-atik sendiri.
            </p>
            <div className="featured-meta">
              <span>IPA / Fisika</span>
              <span>3 jenis katrol</span>
              <span>Interaktif</span>
            </div>
            <Link className="button button-dark" to="/ipa/fisika/katrol">
              Eksplorasi Katrol <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="how-section container" id="cara-belajar">
        <div className="section-heading">
          <div>
            <div className="section-kicker">NGGAK PERLU RIBET</div>
            <h2>Dari “hah?” jadi “oh, gitu!”</h2>
          </div>
          <p className="how-intro">
            Belajar bukan lomba hafalan.
            <br />
            Kasih ruang buat mencoba.
          </p>
        </div>
        <div className="how-grid">
          {[
            {
              icon: MousePointer2,
              title: 'Pilih yang bikin penasaran',
              text: 'Cari materi yang mau kamu pahami. Mulai dari satu pertanyaan kecil.',
            },
            {
              icon: Orbit,
              title: 'Utak-atik, lihat bedanya',
              text: 'Geser slider, ganti nilai, dan amati apa yang terjadi. Kamu yang pegang kendali.',
            },
            {
              icon: BookOpen,
              title: 'Temukan “oh, gitu!”-mu',
              text: 'Hubungkan yang kamu lihat dengan konsep dan rumusnya. Paham, bukan sekadar hafal.',
            },
          ].map((item, i) => (
            <div className="how-card" key={item.title}>
              <span className="how-number">0{i + 1}</span>
              <span className="how-icon">
                <item.icon size={23} strokeWidth={1.6} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bottom-cta container">
        <div>
          <span className="eyebrow">BAWA RASA PENASARANMU</span>
          <h2>Yang susah, kita ulik bareng.</h2>
          <p>Nggak harus langsung jago. Mulai aja dulu.</p>
        </div>
        <Link to="/ipa" className="button button-lime">
          Yuk, Mulai Belajar <ArrowRight size={18} />
        </Link>
      </section>
    </>
  )
}
