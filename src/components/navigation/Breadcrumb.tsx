import { ArrowLeft, ChevronRight, House } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { routeLabels } from '../../data/navigation'

export function Breadcrumb() {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  const parent = '/' + parts.slice(0, -1).join('/')
  return (
    <div className="breadcrumb-row">
      <Link className="back-link" to={parent} aria-label="Kembali">
        <ArrowLeft size={16} />
        <span>Kembali</span>
      </Link>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/" aria-label="Beranda">
          <House size={14} />
        </Link>
        {parts.map((part, index) => (
          <span key={index}>
            <ChevronRight size={12} />
            {index === parts.length - 1 ? (
              <span aria-current="page">{routeLabels[part] ?? part}</span>
            ) : (
              <Link to={'/' + parts.slice(0, index + 1).join('/')}>
                {routeLabels[part] ?? part}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </div>
  )
}
