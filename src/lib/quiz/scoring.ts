import type { Answers, AnswerStatus, Solution } from '../../types/quiz'

export function answerStatus(answers: Answers, solution: Solution): AnswerStatus {
  if (!answers[solution.id]) return 'unanswered'
  return answers[solution.id] === solution.correctAnswer ? 'correct' : 'incorrect'
}

// Solutions are supplied only after submission; this module contains no answer key.
export function scoreQuiz(answers: Answers, solutions: Solution[]) {
  if (solutions.length !== 20 || new Set(solutions.map((s) => s.id)).size !== 20)
    throw new Error('Paket penilaian harus berisi tepat 20 soal unik.')
  const correct = solutions.filter((s) => answerStatus(answers, s) === 'correct').length
  const unanswered = solutions.filter((s) => answerStatus(answers, s) === 'unanswered').length
  const incorrect = 20 - correct - unanswered
  // Accuracy uses all 20 questions, including unanswered questions.
  // Integer arithmetic avoids floating-point artifacts such as 55.00000000000001.
  return { correct, incorrect, unanswered, score: correct * 5, accuracy: correct * 5 }
}

export type QuizScore = ReturnType<typeof scoreQuiz>
