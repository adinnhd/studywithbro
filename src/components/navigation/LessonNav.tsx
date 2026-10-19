import { FileText } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { lessonTabs } from '../../data/navigation'
const base = '/ipa/fisika/katrol'
export function LessonNav() {
  const { pathname, hash } = useLocation()
  const exercise = pathname.includes('/latihan')
  return (
    <nav className="lesson-nav" aria-label="Navigasi materi katrol">
      {lessonTabs.map((tab) => (
        <Link
          key={tab.hash}
          to={`${base}${tab.hash}`}
          className={!exercise && (hash || '#konsep') === tab.hash ? 'active' : ''}
          aria-current={!exercise && (hash || '#konsep') === tab.hash ? 'location' : undefined}
        >
          <tab.icon size={16} />
          {tab.label}
        </Link>
      ))}
      <Link
        to={`${base}/latihan`}
        className={exercise ? 'active' : ''}
        aria-current={exercise ? 'page' : undefined}
      >
        <FileText size={16} />
        Latihan Soal<span className="nav-count">3</span>
      </Link>
    </nav>
  )
}
