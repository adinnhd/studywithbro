import { ArrowUpRight } from 'lucide-react'
import type { PhysicsTopic } from '../../data/navigation'
import { Link } from 'react-router-dom'

export function TopicCard({ topic, eyebrow }: { topic: PhysicsTopic; eyebrow?: string }) {
  const Icon = topic.icon
  return (
    <Link to={topic.path} className={`topic-card ${topic.available ? 'available' : ''}`}>
      <span className="topic-icon">
        <Icon size={30} />
      </span>
      <div>
        <span className="eyebrow">
          {eyebrow ?? (topic.available ? 'TERSEDIA SEKARANG' : 'SEDANG DISIAPKAN')}
        </span>
        <h3>{topic.title}</h3>
        <p>{topic.description}</p>
        <span className="topic-meta">{topic.meta}</span>
      </div>
      <ArrowUpRight size={23} />
    </Link>
  )
}
