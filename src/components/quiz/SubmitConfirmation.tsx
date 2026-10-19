import { Send } from 'lucide-react'
import { QuizDialog } from './QuizDialog'

export function SubmitConfirmation({
  unanswered,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  unanswered: number
  busy: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <QuizDialog title="Kumpulkan latihan?" onClose={onCancel} busy={busy}>
      <p>
        {unanswered > 0 ? (
          <>
            Masih ada <strong>{unanswered} soal belum dijawab</strong>. Soal kosong mendapat 0 poin.
            Kamu bisa kembali mengerjakan atau tetap mengumpulkan.
          </>
        ) : (
          'Semua 20 soal sudah dijawab. Pastikan pilihanmu sudah sesuai.'
        )}
      </p>
      <p>Setelah dikumpulkan, jawaban dikunci dan nilai langsung ditampilkan.</p>
      {error && (
        <p role="alert" className="quiz-error">
          {error}
        </p>
      )}
      <div className="quiz-dialog-actions">
        <button
          className="button button-outline"
          autoFocus
          data-autofocus
          disabled={busy}
          onClick={onCancel}
        >
          Kembali mengerjakan
        </button>
        <button className="button button-dark" disabled={busy} onClick={onConfirm}>
          <Send size={16} />
          {busy ? 'Menghitung nilai…' : 'Tetap kumpulkan'}
        </button>
      </div>
    </QuizDialog>
  )
}
