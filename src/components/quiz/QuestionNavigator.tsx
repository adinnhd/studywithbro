import { Check, Circle, Map } from 'lucide-react'
import type { Answers } from '../../types/quiz'
import { QUIZ_SIZE } from '../../lib/quiz/state'

export function QuizProgress({ answered }: { answered: number }) {
  return (
    <div className="quiz-progress">
      <div>
        <span>Progress pengerjaan</span>
        <strong aria-live="polite">{answered} dari 20 soal terjawab</strong>
      </div>
      <progress value={answered} max={QUIZ_SIZE} aria-label="Progress pengerjaan" />
    </div>
  )
}

export function QuestionNavigator({
  answers,
  currentIndex,
  onNavigate,
}: {
  answers: Answers
  currentIndex: number
  onNavigate: (index: number) => void
}) {
  return (
    <nav className="question-navigator" aria-label="Navigasi nomor soal">
      <h2>
        <Map size={18} /> Navigasi soal
      </h2>
      <div className="quiz-number-grid">
        {Array.from({ length: QUIZ_SIZE }, (_, i) => {
          const answered = !!answers[i + 1]
          return (
            <button
              key={i}
              className={`${answered ? 'is-answered' : ''} ${currentIndex === i ? 'is-current' : ''}`}
              aria-current={currentIndex === i ? 'step' : undefined}
              aria-label={`Soal ${i + 1}, ${answered ? 'sudah dijawab' : 'belum dijawab'}${currentIndex === i ? ', sedang dibuka' : ''}`}
              onClick={() => onNavigate(i)}
            >
              {String(i + 1).padStart(2, '0')}
              {answered && <Check size={10} aria-hidden="true" />}
            </button>
          )
        })}
      </div>
      <ul className="quiz-legend">
        <li>
          <span className="legend-current" /> Sedang dibuka
        </li>
        <li>
          <Check size={14} /> Sudah dijawab
        </li>
        <li>
          <Circle size={13} /> Belum dijawab
        </li>
      </ul>
    </nav>
  )
}
