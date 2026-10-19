import { ArrowUpRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface SubjectCardProps {
  title: string
  eyebrow: string
  description: string
  path: string
  icon: LucideIcon
  color: string
  meta: string
  available: boolean
}
export function SubjectCard({
  title,
  eyebrow,
  description,
  path,
  icon: Icon,
  color,
  meta,
  available,
}: SubjectCardProps) {
  return (
    <Link className={`subject-card ${color}`} to={path}>
      <div className="subject-top">
        <span className="subject-icon">
          <Icon size={27} strokeWidth={1.65} />
        </span>
        <span className={available ? 'status-pill' : 'status-pill muted'}>
          {available && <span className="status-dot" />}
          {available ? 'Siap dieksplorasi' : 'Coming soon'}
        </span>
      </div>
      <span className="eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="subject-bottom">
        <span>{meta}</span>
        <span className="card-arrow">
          <ArrowUpRight size={19} />
        </span>
      </div>
    </Link>
  )
}
