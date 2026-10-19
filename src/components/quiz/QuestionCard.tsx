import { useState } from 'react'
import { Check, Maximize2, Minus, Plus, RotateCcw } from 'lucide-react'
import type { OptionId, Question } from '../../types/quiz'
import { QuizDialog } from './QuizDialog'

// Preserve the source notation while displaying subscripts as mathematical typography.
export function scientificText(text: string) {
  return text
    .replace(/([Fs])_A/g, '$1ₐ')
    .replace(/([Fs])_B/g, '$1ᵦ')
    .replace(/F_1/g, 'F₁')
    .replace(/F_2/g, 'F₂')
}

export function QuestionDiagram({ question }: { question: Question }) {
  const [expanded, setExpanded] = useState(false)
  const [zoom, setZoom] = useState(1)
  if (!question.image) return null
  const description = `${question.imageLabel ?? 'Diagram katrol'}, diagram asli soal ${question.id}`
  return (
    <figure className="quiz-diagram">
      <img src={question.image} alt={description} />
      <figcaption>
        <span>Diagram soal {question.id}</span>
        <button
          onClick={() => {
            setZoom(1)
            setExpanded(true)
          }}
        >
          <Maximize2 size={15} /> Perbesar diagram
        </button>
      </figcaption>
      {expanded && (
        <QuizDialog
          title={`Diagram soal ${question.id}`}
          className="diagram-dialog"
          onClose={() => setExpanded(false)}
        >
          <div className="diagram-zoom-controls">
            <button
              className="button button-outline"
              aria-label="Perkecil diagram"
              disabled={zoom === 1}
              onClick={() => setZoom(zoom - 1)}
            >
              <Minus size={16} />
            </button>
            <span aria-live="polite">{zoom * 100}%</span>
            <button
              className="button button-outline"
              aria-label="Perbesar diagram lagi"
              disabled={zoom === 3}
              onClick={() => setZoom(zoom + 1)}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="diagram-scroll">
            <img src={question.image} alt={description} style={{ width: `${zoom * 100}%` }} />
          </div>
        </QuizDialog>
      )}
    </figure>
  )
}

export function QuestionContent({ question }: { question: Question }) {
  return (
    <>
      <p className="quiz-question-text">{scientificText(question.text)}</p>
      <QuestionDiagram question={question} />
      {question.statements && (
        <ol className="quiz-statements">
          {question.statements.map((statement, i) => (
            <li key={i}>
              <span>({i + 1})</span>
              <p>{scientificText(statement)}</p>
            </li>
          ))}
        </ol>
      )}
    </>
  )
}

export function AnswerOption({
  option,
  questionId,
  selected,
  onSelect,
}: {
  option: Question['options'][number]
  questionId: number
  selected: boolean
  onSelect: (option: OptionId) => void
}) {
  return (
    <label className={`quiz-option ${selected ? 'is-selected' : ''}`}>
      <input
        type="radio"
        name={`question-${questionId}`}
        value={option.id}
        checked={selected}
        onChange={() => onSelect(option.id)}
      />
      <span className="quiz-option-letter" aria-hidden="true">
        {option.id}
      </span>
      <span className="quiz-option-text">
        <span className="sr-only">{option.id}. </span>
        {scientificText(option.text)}
      </span>
      <span className="quiz-option-check" aria-hidden="true">
        {selected && <Check size={16} />}
      </span>
    </label>
  )
}

export function QuestionCard({
  question,
  selected,
  onSelect,
  onClear,
}: {
  question: Question
  selected?: OptionId
  onSelect: (option: OptionId) => void
  onClear: () => void
}) {
  return (
    <section className="question-card" aria-labelledby="current-question-title">
      <div className="question-card-heading">
        <h2 id="current-question-title" tabIndex={-1}>
          Soal {String(question.id).padStart(2, '0')}
        </h2>
        <span>/ 20</span>
      </div>
      <QuestionContent question={question} />
      <fieldset className="quiz-options">
        <legend className="sr-only">Pilih satu jawaban untuk soal {question.id}</legend>
        {question.options.map((option) => (
          <AnswerOption
            key={option.id}
            questionId={question.id}
            option={option}
            selected={selected === option.id}
            onSelect={onSelect}
          />
        ))}
      </fieldset>
      <div className="quiz-answer-footer">
        <span>Pilih satu jawaban.</span>
        <button disabled={!selected} onClick={onClear}>
          <RotateCcw size={14} /> Kosongkan jawaban
        </button>
      </div>
    </section>
  )
}
