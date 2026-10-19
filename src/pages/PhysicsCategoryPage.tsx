import { Breadcrumb } from '../components/navigation/Breadcrumb'
import { TopicCard } from '../components/ui/TopicCard'
import type { PhysicsCategory } from '../data/navigation'

export function PhysicsCategoryPage({ category }: { category: PhysicsCategory }) {
  const Icon = category.icon
  return (
    <div className="container page-container physics-category-page">
      <Breadcrumb />
      <header className="category-header">
        <span className="page-icon">
          <Icon size={32} />
        </span>
        <div className="section-kicker">IPA / FISIKA</div>
        <h1>{category.title}</h1>
        <p>{category.description}</p>
      </header>
      <div className="topic-grid">
        {category.topics.map((topic) => (
          <TopicCard key={topic.path} topic={topic} />
        ))}
      </div>
    </div>
  )
}
