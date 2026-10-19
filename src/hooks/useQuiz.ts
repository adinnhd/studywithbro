import { useEffect, useReducer, useState } from 'react'
import {
  initialQuizState,
  QUIZ_STORAGE_KEY,
  quizReducer,
  restoreQuiz,
  serializeQuiz,
} from '../lib/quiz/state'

function readProgress(storageKey: string) {
  try {
    return { state: restoreQuiz(localStorage.getItem(storageKey)), storageError: false }
  } catch {
    return { state: initialQuizState(), storageError: true }
  }
}

export function useQuiz(storageKey = QUIZ_STORAGE_KEY) {
  const [initial] = useState(() => readProgress(storageKey))
  const [state, dispatch] = useReducer(quizReducer, initial.state)
  const [storageError, setStorageError] = useState(initial.storageError)

  useEffect(() => {
    try {
      if (!state.submitted && state.currentIndex === 0 && !Object.keys(state.answers).length)
        localStorage.removeItem(storageKey)
      else localStorage.setItem(storageKey, serializeQuiz(state))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [state, storageKey])

  return { state, dispatch, storageError }
}
