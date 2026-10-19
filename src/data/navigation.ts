import { Atom, BookOpen, Calculator, FlaskConical, Leaf, Orbit, Sparkles, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const subjects = [
  {
    title: 'IPA',
    eyebrow: 'KENALI CARA DUNIA BEKERJA',
    description: 'Dari gaya yang nggak terlihat sampai hal kecil yang bikin penasaran.',
    path: '/ipa',
    icon: Atom,
    color: 'green',
    meta: 'Fisika, Kimia & Biologi',
    available: true,
  },
  {
    title: 'Matematika',
    eyebrow: 'TEMUKAN POLANYA',
    description: 'Angka, bentuk, dan logika. Biar rumus punya cerita yang masuk akal.',
    path: '/matematika',
    icon: Calculator,
    color: 'purple',
    meta: 'Segera bisa dieksplorasi',
    available: false,
  },
  {
    title: 'Ruang eksplorasi',
    eyebrow: 'MASIH BANYAK YANG SERU',
    description: 'Pelajaran baru sedang disiapkan. Ruang buat rasa penasaranmu.',
    path: '/coming-soon',
    icon: Sparkles,
    color: 'orange',
    meta: 'Coming soon',
    available: false,
  },
] as const

export const scienceSubjects = [
  {
    title: 'Fisika',
    eyebrow: 'GAYA, GERAK & ENERGI',
    description: 'Cari tahu kenapa benda bergerak, jatuh, dan bisa terasa lebih ringan.',
    path: '/ipa/fisika',
    icon: Orbit,
    color: 'green',
    meta: '1 materi interaktif',
    available: true,
  },
  {
    title: 'Kimia',
    eyebrow: 'MATERI & PERUBAHAN',
    description: 'Kenalan dengan zat dan reaksi yang ada di sekeliling kita.',
    path: '/ipa/kimia',
    icon: FlaskConical,
    color: 'purple',
    meta: 'Segera hadir',
    available: false,
  },
  {
    title: 'Biologi',
    eyebrow: 'KEHIDUPAN DI SEKITAR KITA',
    description: 'Eksplorasi makhluk hidup, dari sel kecil sampai ekosistem.',
    path: '/ipa/biologi',
    icon: Leaf,
    color: 'orange',
    meta: 'Segera hadir',
    available: false,
  },
] as const

export interface PhysicsTopic {
  title: string
  description: string
  path: string
  icon: LucideIcon
  available: boolean
  meta: string
}

export interface PhysicsCategory {
  title: string
  description: string
  path: string
  icon: LucideIcon
  topics: PhysicsTopic[]
}

const workEnergyPath = '/ipa/fisika/usaha-dan-energi'
const simpleMachinesPath = '/ipa/fisika/pesawat-sederhana'

function pendingTopic(parent: string, slug: string, title: string): PhysicsTopic {
  return {
    title,
    description: 'Materi sedang disiapkan.',
    path: `${parent}/${slug}`,
    icon: BookOpen,
    available: false,
    meta: 'Coming Soon',
  }
}

export const physicsCategories: PhysicsCategory[] = [
  {
    title: 'Usaha dan Energi',
    description: 'Pelajari bagaimana gaya, gerak, dan energi saling berkaitan.',
    path: workEnergyPath,
    icon: Zap,
    topics: [
      pendingTopic(workEnergyPath, 'usaha-dan-perpindahan', 'Usaha dan Perpindahan'),
      pendingTopic(workEnergyPath, 'energi-kinetik-dan-potensial', 'Energi Kinetik dan Potensial'),
      pendingTopic(
        workEnergyPath,
        'energi-mekanik-dan-kekekalannya',
        'Energi Mekanik dan Kekekalannya',
      ),
      pendingTopic(workEnergyPath, 'transformasi-energi', 'Transformasi Energi'),
      pendingTopic(workEnergyPath, 'hubungan-usaha-dan-energi', 'Hubungan Usaha dan Energi'),
      pendingTopic(workEnergyPath, 'daya', 'Daya'),
    ],
  },
  {
    title: 'Pesawat Sederhana',
    description: 'Kenali cara kerja alat yang membantu meringankan pekerjaan.',
    path: simpleMachinesPath,
    icon: Orbit,
    topics: [
      {
        title: 'Katrol',
        description: 'Beban yang sama. Gaya yang berbeda. Kok bisa? Coba sendiri di lab katrol.',
        path: '/ipa/fisika/katrol',
        icon: Orbit,
        available: true,
        meta: '3 jenis katrol · Simulasi interaktif',
      },
      pendingTopic(simpleMachinesPath, 'tuas', 'Tuas'),
      pendingTopic(simpleMachinesPath, 'bidang-miring', 'Bidang Miring'),
      pendingTopic(simpleMachinesPath, 'roda-berporos', 'Roda Berporos'),
    ],
  },
]

// Categories can be browsed even when their lessons are still being prepared.
export const physicsTopics: PhysicsTopic[] = physicsCategories.map((category) => {
  const available = category.topics.filter((topic) => topic.available).length
  return {
    title: category.title,
    description: category.description,
    path: category.path,
    icon: category.icon,
    available: true,
    meta: `${category.topics.length} submateri · ${available ? `${available} tersedia` : 'Coming Soon'}`,
  }
})

export const lessonTabs = [
  { label: 'Belajar Konsep', hash: '#konsep', icon: BookOpen },
  { label: 'Simulasi', hash: '#simulasi', icon: Orbit },
]

export const routeLabels: Record<string, string> = {
  ipa: 'IPA',
  fisika: 'Fisika',
  latihan: 'Latihan Soal',
  a: 'Latihan A',
  b: 'Latihan B',
  c: 'Latihan C',
  matematika: 'Matematika',
  kimia: 'Kimia',
  biologi: 'Biologi',
  'coming-soon': 'Ruang eksplorasi',
  'materi-lainnya': 'Materi berikutnya',
  ...Object.fromEntries(
    physicsCategories
      .flatMap((category) => [category, ...category.topics])
      .map((item) => [item.path.split('/').at(-1)!, item.title]),
  ),
}

export interface BreadcrumbItem {
  path: string
  label: string
}

export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split('/').filter(Boolean)
  const items = parts.map((part, index) => ({
    path: '/' + parts.slice(0, index + 1).join('/'),
    label: routeLabels[part] ?? part,
  }))
  // A lesson's curriculum parent can differ from its URL parent. This preserves
  // legacy lesson/exercise URLs while deriving the hierarchy from the same data.
  for (const category of physicsCategories) {
    for (const topic of category.topics) {
      const index = items.findIndex((item) => item.path === topic.path)
      if (index !== -1 && !items.some((item) => item.path === category.path))
        items.splice(index, 0, { path: category.path, label: category.title })
    }
  }
  return items
}
