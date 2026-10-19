import type { QuizPackage, QuizPackageId } from '../types/quiz'
import { katrolQuestions } from './katrolQuestions'
import { katrolBQuestions } from './katrolBQuestions'
import { katrolCQuestions } from './katrolCQuestions'

export const quizPackages: Record<QuizPackageId, QuizPackage> = {
  a: {
    id: 'a',
    title: 'Latihan A',
    version: 1,
    questions: katrolQuestions,
    pdfUrl: '/latihan/katrol/Studywithbro_Paket_A_Soal.pdf',
    loadSolutions: () => import('./katrolSolutions').then((module) => module.katrolSolutions),
  },
  b: {
    id: 'b',
    title: 'Latihan B',
    version: 1,
    questions: katrolBQuestions,
    pdfUrl: '/latihan/katrol/Studywithbro_Paket_B_Soal.pdf',
    loadSolutions: () => import('./katrolBSolutions').then((module) => module.katrolBSolutions),
  },
  c: {
    id: 'c',
    title: 'Latihan C',
    version: 1,
    questions: katrolCQuestions,
    pdfUrl: '/latihan/katrol/Studywithbro_Paket_C_Soal.pdf',
    loadSolutions: () => import('./katrolCSolutions').then((module) => module.katrolCSolutions),
  },
}

export function isQuizPackageId(id: string | undefined): id is QuizPackageId {
  return id === 'a' || id === 'b' || id === 'c'
}
