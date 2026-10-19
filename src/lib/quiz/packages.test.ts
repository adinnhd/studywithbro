import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import sourceB from '../../../reference/katrol/paket-bc/data/latihan_b_katrol.json'
import sourceC from '../../../reference/katrol/paket-bc/data/latihan_c_katrol.json'
import { isQuizPackageId, quizPackages } from '../../data/quizPackages'
import { optionIds, type Answers, type QuizPackageId } from '../../types/quiz'
import { scoreQuiz } from './scoring'
import {
  initialQuizState,
  QUIZ_STORAGE_KEY,
  quizReducer,
  quizStorageKey,
  restoreQuiz,
  serializeQuiz,
} from './state'

const sources = { b: sourceB, c: sourceC }
const keys = {
  b: 'D B C D C D C D D C C C B D C D C D D C',
  c: 'D C D D D D D C B D C B D C B C C D C B',
}

describe.each(['b', 'c'] as const)('package %s source fidelity', (id) => {
  const quiz = quizPackages[id]
  const source = sources[id]

  it('preserves all 20 JSON questions, options, order and diagram URLs exactly', () => {
    expect(quiz.questions).toHaveLength(20)
    expect(quiz.questions).toEqual(
      source.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        ...(q.image ? { image: q.image } : {}),
      })),
    )
    expect(new Set(quiz.questions.map((q) => q.text)).size).toBe(20)
    expect(quiz.questions.map((q) => q.id)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    for (const q of quiz.questions) {
      expect(q.options.map((o) => o.id)).toEqual(optionIds)
      expect(new Set(q.options.map((o) => o.text)).size).toBe(5)
      for (const hidden of ['correctAnswer', 'explanation', 'difficulty', 'proof', 'category'])
        expect(q).not.toHaveProperty(hidden)
    }
  })

  it('loads exactly the supplied answer key and explanations separately', async () => {
    const solutions = await quiz.loadSolutions()
    expect(solutions.map((s) => s.correctAnswer).join(' ')).toBe(keys[id])
    expect(solutions).toEqual(
      source.questions.map(({ id, correctAnswer, explanation }) => ({
        id,
        correctAnswer,
        explanation,
      })),
    )
    for (const [index, solution] of solutions.entries())
      expect(
        quiz.questions[index].options.filter((o) => o.id === solution.correctAnswer),
      ).toHaveLength(1)
  })

  it('serves original SVG bytes for every referenced image and only the question PDF', () => {
    for (const q of quiz.questions) {
      if (!q.image) continue
      const name = q.image.split('/').at(-1)
      expect(readFileSync(`public${q.image}`)).toEqual(
        readFileSync(`reference/katrol/paket-bc/assets/${name}`),
      )
      expect(readFileSync(`public${q.image}`, 'utf8')).toMatch(/<svg[^>]*viewBox=/)
    }
    const filename = `Studywithbro_Paket_${id.toUpperCase()}_Soal.pdf`
    expect(quiz.pdfUrl).toBe(`/latihan/katrol/${filename}`)
    expect(readFileSync(`public${quiz.pdfUrl}`)).toEqual(
      readFileSync(`reference/katrol/paket-bc/pdf/${filename}`),
    )
  })

  for (let correct = 0; correct <= 20; correct++) {
    it(`grades ${correct} correct as ${correct * 5}, without partial points`, async () => {
      const solutions = await quiz.loadSolutions()
      const answers: Answers = {}
      for (const s of solutions.slice(0, correct)) answers[s.id] = s.correctAnswer
      expect(scoreQuiz(answers, solutions)).toEqual({
        correct,
        incorrect: 0,
        unanswered: 20 - correct,
        score: correct * 5,
        accuracy: correct * 5,
      })
    })
  }

  it('scores a mixed submission with blanks and an all-wrong submission correctly', async () => {
    const solutions = await quiz.loadSolutions()
    const answers: Answers = {}
    for (const s of solutions.slice(0, 12)) answers[s.id] = s.correctAnswer
    for (const s of solutions.slice(12, 17)) answers[s.id] = s.correctAnswer === 'A' ? 'B' : 'A'
    expect(scoreQuiz(answers, solutions)).toEqual({
      correct: 12,
      incorrect: 5,
      unanswered: 3,
      score: 60,
      accuracy: 60,
    })
    const wrong: Answers = Object.fromEntries(
      solutions.map((s) => [s.id, s.correctAnswer === 'A' ? 'B' : 'A']),
    )
    expect(scoreQuiz(wrong, solutions)).toMatchObject({
      correct: 0,
      incorrect: 20,
      unanswered: 0,
      score: 0,
    })
  })
})

describe('package isolation and compatibility', () => {
  it('preserves the original A namespace and provides distinct package/version keys', () => {
    expect(QUIZ_STORAGE_KEY).toBe('studywithbro:katrol:latihan-a:v1')
    expect(quizStorageKey('a')).toBe(QUIZ_STORAGE_KEY)
    expect(new Set(['a', 'b', 'c'].map((id) => quizStorageKey(id as QuizPackageId))).size).toBe(3)
    expect(quizStorageKey('b', 2)).not.toBe(quizStorageKey('b', 1))
    for (const id of ['a', 'b', 'c']) expect(isQuizPackageId(id)).toBe(true)
    for (const id of ['z', '', undefined, '__proto__']) expect(isQuizPackageId(id)).toBe(false)
  })

  it('restores separate attempts and resets only the selected package, including submitted blanks', () => {
    const storage = new Map<string, string>()
    for (const [index, id] of (['a', 'b', 'c'] as const).entries()) {
      let state = quizReducer(initialQuizState(), { type: 'navigate', index })
      state = quizReducer(state, { type: 'answer', questionId: index + 1, option: 'D' })
      storage.set(quizStorageKey(id), serializeQuiz(state))
    }
    const aBefore = storage.get(quizStorageKey('a'))
    const cBefore = storage.get(quizStorageKey('c'))
    let b = restoreQuiz(storage.get(quizStorageKey('b'))!)
    expect(b).toEqual({ answers: { 2: 'D' }, currentIndex: 1, submitted: false })
    b = quizReducer(b, { type: 'submit' })
    expect(b.submitted).toBe(true)
    expect(quizReducer(b, { type: 'answer', questionId: 1, option: 'A' })).toEqual(b)
    storage.set(quizStorageKey('b'), serializeQuiz(b))
    expect(restoreQuiz(storage.get(quizStorageKey('b'))!).submitted).toBe(true)
    storage.set(quizStorageKey('b'), serializeQuiz(quizReducer(b, { type: 'reset' })))
    expect(restoreQuiz(storage.get(quizStorageKey('b'))!)).toEqual(initialQuizState())
    expect(storage.get(quizStorageKey('a'))).toBe(aBefore)
    expect(storage.get(quizStorageKey('c'))).toBe(cBefore)
  })

  it('does not publish source banks or teacher PDFs in the static directory', () => {
    const paths = readdirSync('public', { recursive: true }).map(String)
    expect(
      paths.filter((p) => /Kunci|Pembahasan|latihan_[bc]_katrol\.json|PROMPT_CODEX/.test(p)),
    ).toEqual([])
    expect(paths.filter((p) => p.endsWith('.pdf')).sort()).toEqual([
      'latihan/katrol/Studywithbro_Paket_A_Soal.pdf',
      'latihan/katrol/Studywithbro_Paket_B_Soal.pdf',
      'latihan/katrol/Studywithbro_Paket_C_Soal.pdf',
    ])
    expect(quizPackages.a.pdfUrl).toBe('/latihan/katrol/Studywithbro_Paket_A_Soal.pdf')
    expect(readFileSync(`public${quizPackages.a.pdfUrl}`)).toEqual(
      readFileSync('reference/katrol/paket-a/pdf/Studywithbro_Latihan_Katrol.pdf'),
    )
  })
})
