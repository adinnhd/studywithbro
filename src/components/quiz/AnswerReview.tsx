import { useState } from 'react'
import { ArrowLeft, CheckCircle2, CircleDashed, RotateCcw, XCircle } from 'lucide-react'
import type { Answers, AnswerStatus, Question, Solution } from '../../types/quiz'
import { answerStatus } from '../../lib/quiz/scoring'
import { QuestionContent, scientificText } from './QuestionCard'
import { ExplanationCard } from './ExplanationCard'

const statuses = {
  correct: { text: 'Benar', icon: CheckCircle2 },
  incorrect: { text: 'Salah', icon: XCircle },
  unanswered: { text: 'Tidak dijawab', icon: CircleDashed },
}

export function AnswerReview({
  submitted,
  questions,
  solutions,
  answers,
  onBack,
  onRestart,
}: {
  submitted: boolean
  questions: Question[]
  solutions: Solution[]
  answers: Answers
  onBack: () => void
  onRestart: () => void
}) {
  const [filter, setFilter] = useState<'all' | AnswerStatus>('all')
  // This guard also protects accidental reuse of the review component.
  if (!submitted) return null
  const visible = questions.filter(
    (q) => filter === 'all' || answerStatus(answers, solutions[q.id - 1]) === filter,
  )
  return (
    <section className="quiz-review" aria-labelledby="review-title">
      <div className="quiz-review-heading">
        <div>
          <span className="section-kicker">SETELAH LATIHAN</span>
          <h2 id="review-title" tabIndex={-1}>
            Cek jawaban, pahami langkahnya.
          </h2>
          <p>Jawaban sudah dikunci. Pembahasan mengikuti PDF sumber.</p>
        </div>
        <button className="button button-outline" onClick={onBack}>
          <ArrowLeft size={16} /> Kembali ke nilai
        </button>
      </div>
      <div className="quiz-review-filters" role="group" aria-label="Filter pembahasan">
        {(
          [
            ['all', 'Semua soal'],
            ['incorrect', 'Jawaban salah'],
            ['unanswered', 'Belum dijawab'],
            ['correct', 'Jawaban benar'],
          ] as const
        ).map(([value, label]) => {
          const count =
            value === 'all'
              ? 20
              : solutions.filter((s) => answerStatus(answers, s) === value).length
          return (
            <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {label}
              <span>{count}</span>
            </button>
          )
        })}
      </div>
      <p className="quiz-filter-count" role="status">
        Menampilkan {visible.length} dari 20 soal
      </p>
      <div className="quiz-review-list">
        {visible.map((q) => {
          const solution = solutions[q.id - 1]
          const status = answerStatus(answers, solution)
          const { text, icon: Icon } = statuses[status]
          return (
            <article className="question-card quiz-review-card" key={q.id}>
              <div className="question-card-heading">
                <h2>Soal {String(q.id).padStart(2, '0')}</h2>
                <span className={`quiz-status status-${status}`}>
                  <Icon size={16} />
                  {text}
                </span>
              </div>
              <QuestionContent question={q} />
              <ul className="quiz-review-options">
                {q.options.map((option) => {
                  const correct = option.id === solution.correctAnswer
                  const selected = option.id === answers[q.id]
                  return (
                    <li
                      key={option.id}
                      className={`${correct ? 'review-correct' : ''} ${selected && !correct ? 'review-incorrect' : ''}`}
                    >
                      <span className="quiz-option-letter">{option.id}</span>
                      <span>{scientificText(option.text)}</span>
                      {(correct || selected) && (
                        <strong>
                          {correct ? (
                            <>
                              <CheckCircle2 size={14} /> Jawaban benar{selected && ' · pilihanmu'}
                            </>
                          ) : (
                            <>
                              <XCircle size={14} /> Pilihanmu
                            </>
                          )}
                        </strong>
                      )}
                    </li>
                  )
                })}
              </ul>
              <div className="quiz-answer-summary">
                <span>
                  Jawabanmu: <strong>{answers[q.id] ?? 'Tidak dijawab'}</strong>
                </span>
                <span>
                  Jawaban benar: <strong>{solution.correctAnswer}</strong>
                </span>
                <span>{status === 'correct' ? '+5 poin' : '0 poin'}</span>
              </div>
              <ExplanationCard explanation={solution.explanation} />
            </article>
          )
        })}
      </div>
      {!visible.length && <div className="quiz-empty">Tidak ada soal dalam filter ini.</div>}
      <div className="quiz-review-bottom">
        <button className="button button-outline" onClick={onBack}>
          <ArrowLeft size={16} /> Kembali ke nilai
        </button>
        <button className="button button-dark" onClick={onRestart}>
          <RotateCcw size={16} /> Coba Lagi
        </button>
      </div>
    </section>
  )
}
