import { Atom, Orbit, Sparkles } from 'lucide-react'
import { Breadcrumb } from '../components/navigation/Breadcrumb'
import { SubjectCard } from '../components/ui/SubjectCard'
import { TopicCard } from '../components/ui/TopicCard'
import { physicsTopics, scienceSubjects } from '../data/navigation'

export function CategoryPage({ type }: { type: 'ipa' | 'fisika' }) {
  const physics = type === 'fisika'
  const Icon = physics ? Orbit : Atom
  return (
    <div className="container page-container">
      <Breadcrumb />
      <div className="category-header">
        <span className="page-icon">
          <Icon size={32} />
        </span>
        <div className="section-kicker">{physics ? 'IPA / FISIKA' : 'RUANG EKSPLORASI / IPA'}</div>
        <h1>{physics ? 'Fisika itu dekat.' : 'Dunia ini penuh pertanyaan.'}</h1>
        <p>
          {physics
            ? 'Dari ember sumur sampai alat berat. Temukan konsep di balik hal sehari-hari.'
            : 'Yuk, cari tahu cara dunia bekerja. Pilih bidang yang bikin kamu penasaran.'}
        </p>
      </div>
      {physics ? (
        <div className="topic-grid">
          {physicsTopics.map((topic) => (
            <TopicCard key={topic.title} topic={topic} />
          ))}
        </div>
      ) : (
        <div className="subject-grid">
          {scienceSubjects.map((subject) => (
            <SubjectCard key={subject.title} {...subject} />
          ))}
        </div>
      )}
      <div className="category-note">
        <Sparkles size={18} />
        <p>Mulai kecil, pahami satu konsep. Materi baru akan hadir bertahap.</p>
      </div>
    </div>
  )
}
