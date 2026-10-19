// Import the supplied JSON without changing questions, options, diagrams or solutions.
// Only question data is included in the initial bundle; solutions have separate chunks.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const source = path.join(root, 'reference/katrol/paket-bc')
const expectedKeys = {
  b: 'D B C D C D C D D C C C B D C D C D D C',
  c: 'D C D D D D D C B D C B D C B C C D C B',
}
const letters = ['A', 'B', 'C', 'D', 'E']
const assets = new Set()
const outputs = []

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

for (const id of ['b', 'c']) {
  const bank = JSON.parse(
    await readFile(path.join(source, `data/latihan_${id}_katrol.json`), 'utf8'),
  )
  assert(
    bank.slug === `katrol-${id}` && bank.numberOfQuestions === 20 && bank.pointsPerCorrect === 5,
    `Invalid package ${id}`,
  )
  assert(bank.questions.length === 20, `Package ${id} must have 20 questions`)
  assert(
    bank.questions.map((q) => q.correctAnswer).join(' ') === expectedKeys[id],
    `Key mismatch in package ${id}`,
  )
  assert(
    new Set(bank.questions.map((q) => q.text)).size === 20,
    `Duplicate questions in package ${id}`,
  )
  const questions = []
  const solutions = []
  for (const [index, q] of bank.questions.entries()) {
    assert(
      q.id === index + 1 && typeof q.text === 'string' && q.text.length > 0,
      `Invalid question ${id}/${index + 1}`,
    )
    assert(
      q.options.length === 5 &&
        q.options.every(
          (o, i) => o.id === letters[i] && typeof o.text === 'string' && o.text.length > 0,
        ),
      `Invalid options ${id}/${q.id}`,
    )
    assert(
      new Set(q.options.map((o) => o.text)).size === 5 && letters.includes(q.correctAnswer),
      `Invalid single choice ${id}/${q.id}`,
    )
    assert(
      typeof q.explanation === 'string' && q.explanation.length > 0,
      `Missing explanation ${id}/${q.id}`,
    )
    const question = { id: q.id, text: q.text, options: q.options }
    if (q.image) {
      assert(
        /^\/studywithbro\/katrol\/katrol_(?:[1-9]|10)_ruas\.svg$/.test(q.image),
        `Invalid image ${q.image}`,
      )
      const name = path.basename(q.image)
      const svg = await readFile(path.join(source, 'assets', name), 'utf8')
      assert(svg.includes('<svg') && svg.includes('viewBox='), `Invalid SVG ${name}`)
      assets.add(name)
      question.image = q.image
    }
    questions.push(question)
    solutions.push({ id: q.id, correctAnswer: q.correctAnswer, explanation: q.explanation })
  }
  const prefix = `katrol${id.toUpperCase()}`
  for (const [suffix, data, type] of [
    ['Questions', questions, 'Question'],
    ['Solutions', solutions, 'Solution'],
  ]) {
    outputs.push([
      path.join(root, 'src/data', `${prefix}${suffix}.ts`),
      `// Generated from reference/katrol/paket-bc/data/latihan_${id}_katrol.json.\n` +
        `// Regenerate with: node scripts/import-katrol-bc.mjs\n` +
        `import type { ${type} } from '../types/quiz'\n\n` +
        `export const ${prefix}${suffix}: ${type}[] = ${JSON.stringify(data, null, 2)}\n`,
    ])
  }
}

// Validate both banks before writing any app data. Copy only referenced diagrams.
for (const [file, text] of outputs) await writeFile(file, text)
await mkdir(path.join(root, 'public/studywithbro/katrol'), { recursive: true })
for (const name of assets)
  await copyFile(
    path.join(source, 'assets', name),
    path.join(root, 'public/studywithbro/katrol', name),
  )
await mkdir(path.join(root, 'public/latihan/katrol'), { recursive: true })
for (const id of ['B', 'C']) {
  const name = `Studywithbro_Paket_${id}_Soal.pdf`
  await copyFile(path.join(source, 'pdf', name), path.join(root, 'public/latihan/katrol', name))
}
console.log(
  `Imported 40 questions and solutions, ${assets.size} referenced SVGs, and 2 question-only PDFs.`,
)
