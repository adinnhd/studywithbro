import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Brand } from '../ui/Brand'
import { routeLabels } from '../../data/navigation'

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname, hash } = useLocation()
  useEffect(() => {
    setMenuOpen(false)
    const parts = pathname.split('/').filter(Boolean)
    const label = routeLabels[parts.at(-1) ?? '']
    document.title = label
      ? `${label} — studywithbro`
      : 'studywithbro — Belajar bareng. Paham beneran.'
    const frame = requestAnimationFrame(() => {
      if (hash)
        document
          .getElementById(hash.slice(1))
          ?.scrollIntoView({ behavior: 'instant', block: 'start' })
      else window.scrollTo({ top: 0, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return (
    <>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className={`desktop-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navigasi utama">
            <Link className={pathname === '/' && !hash ? 'active' : ''} to="/">
              Beranda
            </Link>
            <Link className={pathname !== '/' ? 'active' : ''} to="/ipa">
              Jelajahi Materi <span className="nav-new">BARU</span>
            </Link>
            <Link to="/#cara-belajar">Cara Belajar</Link>
          </nav>
          <Link className="button button-dark header-cta" to="/ipa">
            Mulai Belajar <ArrowUpRight size={16} />
          </Link>
          <button
            className="mobile-menu icon-button"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <Brand />
            <p>Belajar bareng. Paham beneran.</p>
          </div>
          <p className="footer-note">
            Dibuat untuk rasa penasaranmu.
            <br />
            <span>Eksplorasi kecil, pemahaman besar.</span>
          </p>
          <span className="footer-copy">© {new Date().getFullYear()} studywithbro</span>
        </div>
      </footer>
    </>
  )
}
