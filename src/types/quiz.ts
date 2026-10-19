export const optionIds = ['A', 'B', 'C', 'D', 'E'] as const
export type OptionId = (typeof optionIds)[number]

export interface Question {
  id: number
  text: string
  image?: string
  imageLabel?: string
  statements?: string[]
  options: { id: OptionId; text: string }[]
}

export interface Solution {
  id: number
  correctAnswer: OptionId
  explanation: string
}

export type Answers = Partial<Record<number, OptionId>>
export type AnswerStatus = 'correct' | 'incorrect' | 'unanswered'

export interface QuizState {
  answers: Answers
  currentIndex: number
  submitted: boolean
}

export type QuizPackageId = 'a' | 'b' | 'c'

export interface QuizPackage {
  id: QuizPackageId
  title: string
  version: number
  questions: Question[]
  pdfUrl?: string
  loadSolutions: () => Promise<Solution[]>
}
