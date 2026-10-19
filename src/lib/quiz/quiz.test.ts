import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { katrolQuestions } from '../../data/katrolQuestions'
import { katrolSolutions } from '../../data/katrolSolutions'
import { optionIds, type Answers } from '../../types/quiz'
import { answerStatus, scoreQuiz } from './scoring'
import { initialQuizState, quizReducer, restoreQuiz, serializeQuiz } from './state'

const expectedKeys = 'BCC DCCDDCD CACBDD BBC E'.replaceAll(' ', '').split('')

describe('PDF question bank and verified key', () => {
  it('contains exactly 20 ordered single-choice questions with 5 distinct A–E options', () => {
    expect(katrolQuestions.map((q) => q.id)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    expect(katrolSolutions.map((q) => q.id)).toEqual(katrolQuestions.map((q) => q.id))
    expect(katrolSolutions.map((s) => s.correctAnswer)).toEqual(expectedKeys)
    for (const q of katrolQuestions) {
      expect(q.options.map((o) => o.id)).toEqual(optionIds)
      expect(new Set(q.options.map((o) => o.text)).size).toBe(5)
      expect(
        q.options.filter((o) => o.id === katrolSolutions[q.id - 1].correctAnswer),
      ).toHaveLength(1)
      expect(q).not.toHaveProperty('correctAnswer')
      expect(q).not.toHaveProperty('explanation')
      expect(q).not.toHaveProperty('difficulty')
      expect(q).not.toHaveProperty('category')
      expect(q.text).not.toMatch(/MUDAH|SEDANG|SULIT|MULTI-JAWABAN|Pilih SEMUA/)
      expect(katrolSolutions[q.id - 1].explanation.length).toBeGreaterThan(30)
    }
  })

  it('preserves 5 original statements and the exact requested combinations for 15, 18, 20', () => {
    const combinations = {
      15: ['123', '234', '145', '124', '245'],
      18: ['134', '234', '245', '123', '345'],
      20: ['234', '123', '135', '245', '125'],
    }
    for (const id of [15, 18, 20] as const) {
      const q = katrolQuestions[id - 1]
      expect(q.statements).toHaveLength(5)
      expect(q.text).toContain('Kombinasi pernyataan yang benar adalah ...')
      expect(q.options.map((o) => o.text.replace(/\D/g, ''))).toEqual(combinations[id])
    }
    expect(katrolQuestions[14].statements?.[2]).toBe('Keuntungan mekanis aktual sistem adalah 4.')
    expect(katrolSolutions[17].explanation).toContain('A memiliki n = 3')
    expect(katrolSolutions[17].explanation).toContain('B memiliki n = 4')
  })

  it('includes all 7 source diagram panels as complete scalable SVG assets', () => {
    expect(katrolQuestions.filter((q) => q.image).map((q) => q.id)).toEqual([
      3, 5, 9, 12, 15, 18, 20,
    ])
    for (const q of katrolQuestions.filter((q) => q.image)) {
      const path = `public${q.image}`
      expect(existsSync(path)).toBe(true)
      const svg = readFileSync(path, 'utf8')
      expect(svg).toContain('viewBox="0 0 485')
      expect(svg).toContain('<path')
      expect(svg).not.toContain('<image')
    }
  })
})

describe('scoring without partial credit', () => {
  for (let correct = 0; correct <= 20; correct++) {
    it(`${correct} correct gives ${correct * 5}/100`, () => {
      const answers: Answers = {}
      katrolSolutions.slice(0, correct).forEach((s) => (answers[s.id] = s.correctAnswer))
      expect(scoreQuiz(answers, katrolSolutions)).toEqual({
        correct,
        incorrect: 0,
        unanswered: 20 - correct,
        score: correct * 5,
        accuracy: correct * 5,
      })
    })
  }

  it('distinguishes wrong from empty answers and ignores unrelated IDs', () => {
    const answers: Answers = { 1: 'B', 2: 'A', 99: 'B' }
    expect(scoreQuiz(answers, katrolSolutions)).toMatchObject({
      correct: 1,
      incorrect: 1,
      unanswered: 18,
      score: 5,
    })
    expect(answerStatus(answers, katrolSolutions[0])).toBe('correct')
    expect(answerStatus(answers, katrolSolutions[1])).toBe('incorrect')
    expect(answerStatus(answers, katrolSolutions[2])).toBe('unanswered')
  })

  it('gives zero when every answer is wrong', () => {
    const answers: Answers = Object.fromEntries(
      katrolSolutions.map((s) => [s.id, s.correctAnswer === 'A' ? 'B' : 'A']),
    )
    expect(scoreQuiz(answers, katrolSolutions)).toMatchObject({
      score: 0,
      incorrect: 20,
      unanswered: 0,
    })
  })
})

describe('quiz state and local persistence', () => {
  it('retains, changes and clears a single answer when navigating', () => {
    let state = quizReducer(initialQuizState(), { type: 'answer', questionId: 1, option: 'B' })
    state = quizReducer(state, { type: 'navigate', index: 19 })
    state = quizReducer(state, { type: 'navigate', index: 0 })
    expect(state.answers[1]).toBe('B')
    state = quizReducer(state, { type: 'answer', questionId: 1, option: 'C' })
    expect(state.answers).toEqual({ 1: 'C' })
    state = restoreQuiz(serializeQuiz(state))
    expect(state.answers).toEqual({ 1: 'C' })
    state = quizReducer(state, { type: 'clear', questionId: 1 })
    expect(state.answers).toEqual({})
  })

  it('locks answers and navigation on submission, including after refresh, and fully resets', () => {
    let state = quizReducer(initialQuizState(), { type: 'answer', questionId: 1, option: 'B' })
    state = restoreQuiz(serializeQuiz(quizReducer(state, { type: 'submit' })))
    expect(state.submitted).toBe(true)
    expect(quizReducer(state, { type: 'answer', questionId: 1, option: 'A' })).toEqual(state)
    expect(quizReducer(state, { type: 'clear', questionId: 1 })).toEqual(state)
    expect(quizReducer(state, { type: 'navigate', index: 2 })).toEqual(state)
    expect(quizReducer(state, { type: 'reset' })).toEqual(initialQuizState())
  })

  it('recovers from corrupt, outdated or invalid storage without unlocking review', () => {
    for (const raw of [
      null,
      '',
      '{',
      'null',
      '[]',
      '{}',
      '{"version":2}',
      '{"version":1,"submitted":true}',
    ])
      expect(restoreQuiz(raw)).toEqual(initialQuizState())
    expect(
      restoreQuiz(
        JSON.stringify({
          version: 1,
          answers: { 1: 'Z', 2: 'C', 21: 'A' },
          currentIndex: 3,
          submitted: false,
        }),
      ),
    ).toEqual({ answers: { 2: 'C' }, currentIndex: 3, submitted: false })
    expect(quizReducer(initialQuizState(), { type: 'navigate', index: 20 })).toEqual(
      initialQuizState(),
    )
    expect(quizReducer(initialQuizState(), { type: 'navigate', index: -1 })).toEqual(
      initialQuizState(),
    )
  })
})
