import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Download, Grid2X2, RotateCcw, Send } from 'lucide-react'
import { Breadcrumb } from '../components/navigation/Breadcrumb'
import { LessonNav } from '../components/navigation/LessonNav'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { QuestionNavigator, QuizProgress } from '../components/quiz/QuestionNavigator'
import { SubmitConfirmation } from '../components/quiz/SubmitConfirmation'
import { QuizDialog } from '../components/quiz/QuizDialog'
import { QuizResult } from '../components/quiz/QuizResult'
import { AnswerReview } from '../components/quiz/AnswerReview'
import { useQuiz } from '../hooks/useQuiz'
import { scoreQuiz } from '../lib/quiz/scoring'
import { quizStorageKey } from '../lib/quiz/state'
import type { QuizPackage, Solution } from '../types/quiz'

export function QuizPage({ quiz }: { quiz: QuizPackage }) {
  const { state, dispatch, storageError } = useQuiz(quizStorageKey(quiz.id, quiz.version))
  const [solutions, setSolutions] = useState<Solution[] | null>(null)
  const [review, setReview] = useState(false)
  const [dialog, setDialog] = useState<'submit' | 'navigate' | 'restart' | null>(null)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const firstRender = useRef(true)
  const answered = Object.keys(state.answers).length
  const question = quiz.questions[state.currentIndex]

  // No solution module request is made during an unsubmitted attempt.
  useEffect(() => {
    if (!state.submitted) return
    let active = true
    quiz
      .loadSolutions()
      .then((loadedSolutions) => {
        if (active) {
          setSolutions(loadedSolutions)
          setLoadError(null)
        }
      })
      .catch(() => {
        if (active)
          setLoadError(
            'Pembahasan belum berhasil dimuat. Jawabanmu tetap tersimpan. Coba muat kembali.',
          )
      })
    return () => {
      active = false
    }
  }, [state.submitted, retry, quiz])

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const id = !state.submitted
      ? 'current-question-title'
      : review
        ? 'review-title'
        : 'quiz-result-title'
    const target = document.getElementById(id)
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [state.currentIndex, state.submitted, review, solutions])

  function navigate(index: number) {
    dispatch({ type: 'navigate', index })
    setDialog(null)
  }

  async function submit() {
    if (busy || state.submitted) return
    setBusy(true)
    setLoadError(null)
    try {
      const loadedSolutions = await quiz.loadSolutions()
      setSolutions(loadedSolutions)
      dispatch({ type: 'submit' })
      setDialog(null)
    } catch {
      setLoadError(
        'Nilai belum berhasil dimuat. Periksa koneksi, lalu coba kumpulkan lagi. Jawabanmu tetap ada.',
      )
    } finally {
      setBusy(false)
    }
  }

  function restart() {
    dispatch({ type: 'reset' })
    setSolutions(null)
    setReview(false)
    setLoadError(null)
    setDialog(null)
  }

  return (
    <div className="container page-container quiz-page">
      <Breadcrumb />
      <header className="lesson-header quiz-page-heading">
        <div>
          <div className="section-kicker">RUANG LATIHAN / KATROL</div>
          <h1>
            {quiz.title}
            <span className="lesson-title-dot">.</span>
          </h1>
          <p>
            {state.submitted
              ? 'Latihan selesai. Saatnya melihat hasil dan pembahasan.'
              : 'Kerjakan dengan ritmemu. Jawaban bisa diubah sebelum dikumpulkan.'}
          </p>
        </div>
        <div className="quiz-heading-meta">
          <span className="status-pill">20 soal · Pilihan ganda</span>
          {quiz.pdfUrl && (
            <a className="quiz-pdf-link" href={quiz.pdfUrl} download>
              <Download size={14} /> Unduh PDF Soal
            </a>
          )}
        </div>
      </header>
      <LessonNav />
      {storageError && (
        <p className="quiz-error" role="alert">
          Browser belum bisa menyimpan progres. Tetap di halaman ini agar jawabanmu tidak hilang.
        </p>
      )}
      {!state.submitted ? (
        <>
          <div className="quiz-topbar">
            <QuizProgress answered={answered} />
            <span className="quiz-save-status">
              <Check size={14} />
              {storageError ? 'Progres belum tersimpan' : 'Tersimpan di perangkat ini'}
            </span>
          </div>
          <button
            className="button button-outline quiz-mobile-navigator"
            onClick={() => setDialog('navigate')}
          >
            <Grid2X2 size={17} /> Navigasi soal <span>{answered}/20</span>
          </button>
          <div className="quiz-layout">
            <div className="quiz-main">
              <QuestionCard
                key={question.id}
                question={question}
                selected={state.answers[question.id]}
                onSelect={(option) => dispatch({ type: 'answer', questionId: question.id, option })}
                onClear={() => dispatch({ type: 'clear', questionId: question.id })}
              />
              <div className="quiz-pagination">
                <button
                  className="button button-outline"
                  disabled={state.currentIndex === 0}
                  onClick={() => navigate(state.currentIndex - 1)}
                >
                  <ArrowLeft size={16} /> Sebelumnya
                </button>
                <span>{state.currentIndex + 1} / 20</span>
                <button
                  className="button button-dark"
                  disabled={state.currentIndex === 19}
                  onClick={() => navigate(state.currentIndex + 1)}
                >
                  Selanjutnya <ArrowRight size={16} />
                </button>
              </div>
              <button
                className="button button-dark quiz-mobile-submit"
                onClick={() => setDialog('submit')}
              >
                <Send size={16} /> Selesai &amp; Lihat Nilai
              </button>
            </div>
            <aside className="quiz-sidebar">
              <QuestionNavigator
                answers={state.answers}
                currentIndex={state.currentIndex}
                onNavigate={navigate}
              />
              <div className="quiz-submit-box">
                <p>Sudah yakin dengan jawabanmu?</p>
                <button className="button button-dark" onClick={() => setDialog('submit')}>
                  <Send size={16} /> Selesai &amp; Lihat Nilai
                </button>
                <small>Nilai dan pembahasan muncul setelah dikumpulkan.</small>
              </div>
              <button className="quiz-restart-link" onClick={() => setDialog('restart')}>
                <RotateCcw size={13} /> Mulai ulang latihan
              </button>
            </aside>
          </div>
          <button
            className="quiz-restart-link quiz-mobile-restart"
            onClick={() => setDialog('restart')}
          >
            <RotateCcw size={13} /> Mulai ulang latihan
          </button>
        </>
      ) : solutions ? (
        review ? (
          <AnswerReview
            submitted={state.submitted}
            questions={quiz.questions}
            solutions={solutions}
            answers={state.answers}
            onBack={() => setReview(false)}
            onRestart={() => setDialog('restart')}
          />
        ) : (
          <QuizResult
            result={scoreQuiz(state.answers, solutions)}
            onReview={() => setReview(true)}
            onRestart={() => setDialog('restart')}
          />
        )
      ) : (
        <div className="quiz-loading" role="status">
          {loadError ? (
            <>
              <p>{loadError}</p>
              <button
                className="button button-dark"
                onClick={() => {
                  setLoadError(null)
                  setRetry(retry + 1)
                }}
              >
                Muat kembali
              </button>
            </>
          ) : (
            'Memuat hasil latihan…'
          )}
        </div>
      )}
      {dialog === 'submit' && !state.submitted && (
        <SubmitConfirmation
          unanswered={20 - answered}
          busy={busy}
          error={loadError}
          onCancel={() => {
            if (!busy) {
              setDialog(null)
              setLoadError(null)
            }
          }}
          onConfirm={submit}
        />
      )}
      {dialog === 'navigate' && !state.submitted && (
        <QuizDialog
          title="Pilih nomor soal"
          className="quiz-navigation-dialog"
          onClose={() => setDialog(null)}
        >
          <QuizProgress answered={answered} />
          <QuestionNavigator
            answers={state.answers}
            currentIndex={state.currentIndex}
            onNavigate={navigate}
          />
        </QuizDialog>
      )}
      {dialog === 'restart' && (
        <QuizDialog title="Mulai latihan lagi?" onClose={() => setDialog(null)}>
          <p>
            Jawaban dan hasil latihan sebelumnya di perangkat ini akan dihapus. Kamu mulai kembali
            dari soal 1.
          </p>
          <div className="quiz-dialog-actions">
            <button
              className="button button-outline"
              autoFocus
              data-autofocus
              onClick={() => setDialog(null)}
            >
              Batal
            </button>
            <button className="button button-dark" onClick={restart}>
              <RotateCcw size={16} /> Mulai ulang
            </button>
          </div>
        </QuizDialog>
      )}
    </div>
  )
}
