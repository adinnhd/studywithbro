import { quizPackages } from './quizPackages'
import type { QuizPackageId } from '../types/quiz'

export interface Exercise {
  id: string
  title: string
  description: string
  focus: string
  pdfUrl: string | null
  interactive?: boolean
}

export const exercises: Exercise[] = (['a', 'b', 'c'] satisfies QuizPackageId[]).map((id) => ({
  id,
  title: quizPackages[id].title,
  description: 'Kerjakan 20 soal katrol, cek nilai, lalu pelajari pembahasannya.',
  focus: 'Latihan mandiri',
  pdfUrl: quizPackages[id].pdfUrl ?? null,
  interactive: true,
}))
