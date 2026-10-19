import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { CategoryPage } from './pages/CategoryPage'
import { PulleyLessonPage } from './pages/PulleyLessonPage'
import { ExercisesPage, ExerciseDetailPage } from './pages/ExercisesPage'
import { ComingSoonPage } from './pages/ComingSoonPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="ipa" element={<CategoryPage type="ipa" />} />
        <Route path="ipa/fisika" element={<CategoryPage type="fisika" />} />
        <Route path="ipa/fisika/katrol" element={<PulleyLessonPage />} />
        <Route path="ipa/fisika/katrol/latihan" element={<ExercisesPage />} />
        <Route path="ipa/fisika/katrol/latihan/:exerciseId" element={<ExerciseDetailPage />} />
        {['matematika', 'coming-soon', 'ipa/kimia', 'ipa/biologi', 'ipa/fisika/materi-lainnya'].map(
          (path) => (
            <Route key={path} path={path} element={<ComingSoonPage />} />
          ),
        )}
        <Route path="*" element={<ComingSoonPage notFound />} />
      </Route>
    </Routes>
  )
}
