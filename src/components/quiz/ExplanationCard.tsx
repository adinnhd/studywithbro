import { Fragment } from 'react'
import { BookOpen } from 'lucide-react'
import { scientificText } from './QuestionCard'

// Native MathML renders fractions without a network dependency or raw LaTeX.
// All content comes from the supplied PDF explanations.
function ExplanationText({ text }: { text: string }) {
  const pattern =
    /(KM aktual|KM ideal|[\d.,]+|[A-Za-zη]+(?:_[AB12])?)\/(\([^()]+\)|KM aktual|KM ideal|[\d.,]+|[A-Za-zη]+(?:_[AB12])?)/g
  const parts = []
  let start = 0
  for (const match of text.matchAll(pattern)) {
    const index = match.index!
    parts.push(
      <Fragment key={`text-${index}`}>{scientificText(text.slice(start, index))}</Fragment>,
    )
    const numerator = scientificText(match[1])
    const denominator = scientificText(match[2].replace(/^\(|\)$/g, ''))
    parts.push(
      <math key={`fraction-${index}`} aria-label={`${numerator} dibagi ${denominator}`}>
        <mfrac>
          <mtext>{numerator}</mtext>
          <mtext>{denominator}</mtext>
        </mfrac>
      </math>,
    )
    start = index + match[0].length
  }
  parts.push(<Fragment key="end">{scientificText(text.slice(start))}</Fragment>)
  return <>{parts}</>
}

export function ExplanationCard({ explanation }: { explanation: string }) {
  return (
    <section className="explanation-card" aria-label="Pembahasan">
      <h3>
        <BookOpen size={17} /> Pembahasan
      </h3>
      <p>
        <ExplanationText text={explanation} />
      </p>
    </section>
  )
}
