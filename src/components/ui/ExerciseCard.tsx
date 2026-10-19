import { ArrowUpRight, Download, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Exercise } from '../../data/exercises'

export function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  return (
    <article className="exercise-card">
      <div className="exercise-card-top">
        <span className="exercise-index">0{index + 1}</span>
        <FileText size={25} strokeWidth={1.4} />
      </div>
      <span className="eyebrow">{exercise.focus}</span>
      <h2>{exercise.title}</h2>
      <p>{exercise.description}</p>
      <div className="exercise-card-bottom">
        <Link
          className="button button-dark"
          to={`/ipa/fisika/katrol/latihan/${exercise.id}`}
          aria-label={`Kerjakan ${exercise.title}`}
        >
          Kerjakan <ArrowUpRight size={17} />
        </Link>
        {exercise.pdfUrl && (
          <a
            className="exercise-pdf-link"
            href={exercise.pdfUrl}
            download
            aria-label={`Unduh PDF Soal ${exercise.title}`}
          >
            <Download size={15} /> Unduh PDF Soal
          </a>
        )}
      </div>
    </article>
  )
}
