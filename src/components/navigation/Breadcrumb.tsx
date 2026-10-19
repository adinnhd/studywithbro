import { ArrowLeft, ChevronRight, House } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getBreadcrumbItems } from '../../data/navigation'

export function Breadcrumb() {
  const { pathname } = useLocation()
  const items = getBreadcrumbItems(pathname)
  const parent = items.at(-2)?.path ?? '/'
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
        {items.map((item, index) => (
          <span key={item.path}>
            <ChevronRight size={12} />
            {index === items.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <Link to={item.path}>{item.label}</Link>
            )}
          </span>
        ))}
      </nav>
    </div>
  )
}
