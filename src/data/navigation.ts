import { Atom, BookOpen, Calculator, FlaskConical, Leaf, Orbit, Sparkles, Zap } from 'lucide-react'

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

export const physicsTopics = [
  {
    title: 'Katrol',
    description: 'Beban yang sama. Gaya yang berbeda. Kok bisa? Coba sendiri di lab katrol.',
    path: '/ipa/fisika/katrol',
    icon: Orbit,
    available: true,
    meta: '3 jenis katrol · Simulasi interaktif',
  },
  {
    title: 'Materi berikutnya',
    description: 'Eksperimen fisika lainnya sedang kami siapkan untuk kamu.',
    path: '/ipa/fisika/materi-lainnya',
    icon: Zap,
    available: false,
    meta: 'Coming soon',
  },
]

export const lessonTabs = [
  { label: 'Belajar Konsep', hash: '#konsep', icon: BookOpen },
  { label: 'Simulasi', hash: '#simulasi', icon: Orbit },
]

export const routeLabels: Record<string, string> = {
  ipa: 'IPA',
  fisika: 'Fisika',
  katrol: 'Katrol',
  latihan: 'Latihan Soal',
  a: 'Latihan A',
  b: 'Latihan B',
  c: 'Latihan C',
  matematika: 'Matematika',
  kimia: 'Kimia',
  biologi: 'Biologi',
  'coming-soon': 'Ruang eksplorasi',
  'materi-lainnya': 'Materi berikutnya',
}
