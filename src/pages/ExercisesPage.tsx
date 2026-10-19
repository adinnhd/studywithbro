import { ArrowUpRight, FileText, Info } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumb } from '../components/navigation/Breadcrumb'
import { LessonNav } from '../components/navigation/LessonNav'
import { ExerciseCard } from '../components/ui/ExerciseCard'
import { exercises } from '../data/exercises'
import { ComingSoonPage } from './ComingSoonPage'
import { QuizPage } from './QuizPage'
import { isQuizPackageId, quizPackages } from '../data/quizPackages'

export function ExercisesPage() {
  return (
    <div className="container page-container">
      <Breadcrumb />
      <header className="lesson-header">
        <div>
          <div className="section-kicker">
            <FileText size={16} /> RUANG LATIHAN / KATROL
          </div>
          <h1>Cek pemahamanmu.</h1>
          <p>Setelah mencoba, waktunya menghubungkan konsep dengan soal.</p>
        </div>
      </header>
      <LessonNav />
      <div className="exercise-notice">
        <Info size={20} />
        <p>
          <strong>Tiga paket, siap dikerjakan.</strong> Setiap paket berisi 20 soal interaktif.
          Jawaban tersimpan terpisah, dengan nilai dan pembahasan setelah selesai.
        </p>
      </div>
      <div className="exercise-grid">
        {exercises.map((exercise, index) => (
          <ExerciseCard key={exercise.id} exercise={exercise} index={index} />
        ))}
      </div>
      <div className="exercise-bottom">
        <span>Masih penasaran dengan cara kerjanya?</span>
        <Link to="/ipa/fisika/katrol#simulasi">
          Balik ke simulasi <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  )
}

export function ExerciseDetailPage() {
  const { exerciseId } = useParams()
  if (!isQuizPackageId(exerciseId)) return <ComingSoonPage notFound />
  const quiz = quizPackages[exerciseId]
  // Remount the attempt on package/version changes, including client-side navigation.
  return <QuizPage key={`${quiz.id}:${quiz.version}`} quiz={quiz} />
}
