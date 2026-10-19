import { ArrowLeft, ArrowUpRight, Construction } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Breadcrumb } from '../components/navigation/Breadcrumb'
import { routeLabels } from '../data/navigation'
import type { PhysicsCategory, PhysicsTopic } from '../data/navigation'

export function ComingSoonPage({
  notFound = false,
  topic,
  parent,
}: {
  notFound?: boolean
  topic?: PhysicsTopic
  parent?: PhysicsCategory
}) {
  const { pathname } = useLocation()
  const title =
    topic?.title ?? routeLabels[pathname.split('/').filter(Boolean).at(-1) ?? ''] ?? 'Materi baru'
  return (
    <div className="container page-container">
      <Breadcrumb />
      <section className="coming-soon">
        <span className="coming-icon">
          <Construction size={43} strokeWidth={1.4} />
        </span>
        <span className="eyebrow">
          {notFound
            ? '404 · HALAMAN TIDAK DITEMUKAN'
            : topic
              ? 'Coming Soon'
              : `${title.toUpperCase()} · COMING SOON`}
        </span>
        <h1>
          {notFound ? 'Sepertinya salah belok.' : topic ? title : 'Masih di meja eksperimen.'}
        </h1>
        <p>
          {notFound
            ? 'Alamat ini belum ada di ruang belajar kita. Kembali ke beranda atau coba lab katrol.'
            : topic
              ? 'Materi sedang disiapkan.'
              : `Ruang ${title.toLowerCase()} sedang kami siapkan. Sambil menunggu, ada katrol yang bisa kamu eksplorasi sekarang.`}
        </p>
        <div className="hero-actions">
          {parent ? (
            <Link to={parent.path} className="button button-dark">
              <ArrowLeft size={16} /> Kembali ke {parent.title}
            </Link>
          ) : (
            <>
              <Link to="/ipa/fisika/katrol" className="button button-dark">
                Coba Lab Katrol <ArrowUpRight size={17} />
              </Link>
            </>
          )}
          <Link to="/" className="button button-outline">
            <ArrowLeft size={16} />
            Ke Beranda
          </Link>
        </div>
        <span className="coming-footnote">studywithbro — Belajar bareng. Paham beneran.</span>
      </section>
    </div>
  )
}
