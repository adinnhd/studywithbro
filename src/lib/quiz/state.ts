import { optionIds, type QuizState, type OptionId, type QuizPackageId } from '../../types/quiz'

export const QUIZ_SIZE = 20
export function quizStorageKey(packageId: QuizPackageId, bankVersion = 1) {
  return `studywithbro:katrol:latihan-${packageId}:v${bankVersion}`
}

// Keep the existing A key and serialized format compatible with saved attempts.
export const QUIZ_STORAGE_KEY = quizStorageKey('a')

export function initialQuizState(): QuizState {
  return { answers: {}, currentIndex: 0, submitted: false }
}

export type QuizAction =
  | { type: 'answer'; questionId: number; option: OptionId }
  | { type: 'clear'; questionId: number }
  | { type: 'navigate'; index: number }
  | { type: 'submit' }
  | { type: 'reset' }

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  if (action.type === 'reset') return initialQuizState()
  if (state.submitted) return state
  switch (action.type) {
    case 'answer':
      if (!validId(action.questionId) || !optionIds.includes(action.option)) return state
      return { ...state, answers: { ...state.answers, [action.questionId]: action.option } }
    case 'clear': {
      const answers = { ...state.answers }
      delete answers[action.questionId]
      return { ...state, answers }
    }
    case 'navigate':
      return Number.isInteger(action.index) && action.index >= 0 && action.index < QUIZ_SIZE
        ? { ...state, currentIndex: action.index }
        : state
    case 'submit':
      return { ...state, submitted: true }
  }
}

function validId(id: number) {
  return Number.isInteger(id) && id >= 1 && id <= QUIZ_SIZE
}

export function serializeQuiz(state: QuizState): string {
  return JSON.stringify({ version: 1, ...state })
}

export function restoreQuiz(raw: string | null): QuizState {
  if (!raw) return initialQuizState()
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1)
      return initialQuizState()
    const saved = value as Record<string, unknown>
    if (
      !saved.answers ||
      typeof saved.answers !== 'object' ||
      Array.isArray(saved.answers) ||
      !Number.isInteger(saved.currentIndex) ||
      (saved.currentIndex as number) < 0 ||
      (saved.currentIndex as number) >= QUIZ_SIZE ||
      typeof saved.submitted !== 'boolean'
    )
      return initialQuizState()
    const answers: QuizState['answers'] = {}
    for (const [id, option] of Object.entries(saved.answers)) {
      if (
        validId(Number(id)) &&
        String(Number(id)) === id &&
        optionIds.includes(option as OptionId)
      )
        answers[Number(id)] = option as OptionId
    }
    return { answers, currentIndex: saved.currentIndex as number, submitted: saved.submitted }
  } catch {
    return initialQuizState()
  }
}
