import { ArrowRight, CheckCircle2, CircleDashed, RotateCcw, XCircle } from 'lucide-react'
import type { QuizScore } from '../../lib/quiz/scoring'

export function QuizResult({
  result,
  onReview,
  onRestart,
}: {
  result: QuizScore
  onReview: () => void
  onRestart: () => void
}) {
  const message =
    result.score >= 80
      ? 'Pemahamanmu sudah kuat. Cek pembahasan untuk melengkapi yang terlewat.'
      : result.score >= 60
        ? 'Sudah ada konsep yang kamu kuasai. Mari cek bagian yang masih perlu dilatih.'
        : 'Ini titik awal belajarmu. Bahas satu per satu, lalu coba lagi saat siap.'
  return (
    <section className="quiz-result" aria-labelledby="quiz-result-title">
      <span className="section-kicker">LATIHAN SELESAI</span>
      <h2 id="quiz-result-title" tabIndex={-1}>
        Satu langkah lebih paham.
      </h2>
      <div
        className="quiz-score-circle"
        role="img"
        aria-label={`Nilai kamu: ${result.score} dari 100`}
        style={{ background: `conic-gradient(var(--green) ${result.score}%, #e0e7d7 0)` }}
      >
        <div>
          <span>Nilai kamu</span>
          <strong>
            {result.score}
            <small>/100</small>
          </strong>
        </div>
      </div>
      <p className="quiz-result-message">{message}</p>
      <div className="quiz-result-stats">
        <div className="status-correct">
          <CheckCircle2 size={20} />
          <strong>{result.correct}</strong>
          <span>Benar</span>
        </div>
        <div className="status-incorrect">
          <XCircle size={20} />
          <strong>{result.incorrect}</strong>
          <span>Salah</span>
        </div>
        <div className="status-unanswered">
          <CircleDashed size={20} />
          <strong>{result.unanswered}</strong>
          <span>Tidak dijawab</span>
        </div>
      </div>
      <div className="quiz-accuracy">
        <div>
          <span>Ketepatan dari seluruh 20 soal</span>
          <strong>{result.accuracy}%</strong>
        </div>
        <progress value={result.accuracy} max={100} aria-label="Persentase ketepatan" />
      </div>
      <p className="quiz-scoring-note">
        Setiap jawaban benar bernilai 5 poin. Salah dan kosong bernilai 0.
      </p>
      <div className="quiz-result-actions">
        <button className="button button-dark" onClick={onReview}>
          Lihat Pembahasan <ArrowRight size={17} />
        </button>
        <button className="button button-outline" onClick={onRestart}>
          <RotateCcw size={16} /> Coba Lagi
        </button>
      </div>
    </section>
  )
}
