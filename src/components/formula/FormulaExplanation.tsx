export type FormulaSymbol = 'W' | 'KM' | 'F'
export const formulas: Record<
  FormulaSymbol,
  { formula: string; heading: string; explanation: string }
> = {
  W: {
    formula: 'W = KM × F',
    heading: 'Cari berat bebannya',
    explanation:
      'Kalikan keuntungan mekanis dengan gaya kuasa. Berat beban menyatakan gaya gravitasi yang bekerja pada benda.',
  },
  KM: {
    formula: 'KM = W / F',
    heading: 'Cari keuntungan mekanis',
    explanation:
      'Bagi berat beban dengan gaya kuasa. KM menunjukkan berapa kali gaya kuasa diperkecil dibandingkan berat beban.',
  },
  F: {
    formula: 'F = W / KM',
    heading: 'Cari gaya yang dibutuhkan',
    explanation:
      'Bagi berat beban dengan keuntungan mekanis. Makin besar KM, makin kecil gaya kuasa yang kamu perlukan.',
  },
}
export function FormulaExplanation({ selected }: { selected: FormulaSymbol }) {
  const data = formulas[selected]
  return (
    <div className="formula-explanation" aria-live="polite">
      <span className="eyebrow">KAMU MEMILIH {selected}</span>
      <h3>{data.heading}</h3>
      <p className="selected-equation" key={selected}>
        {data.formula}
      </p>
      <p>{data.explanation}</p>
    </div>
  )
}
