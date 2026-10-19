import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function QuizDialog({
  title,
  children,
  onClose,
  className = '',
  busy = false,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  className?: string
  busy?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    dialog?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    return () => dialog?.close()
  }, [])
  return (
    <dialog
      ref={ref}
      className={`quiz-dialog ${className}`}
      aria-labelledby="quiz-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
    >
      <div className="quiz-dialog-heading">
        <h2 id="quiz-dialog-title">{title}</h2>
        <button className="icon-button" aria-label="Tutup dialog" onClick={onClose} disabled={busy}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}
