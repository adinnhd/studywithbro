import { useState } from 'react'
import { MousePointer2, Wifi } from 'lucide-react'
import { FormulaExplanation } from './FormulaExplanation'
import type { FormulaSymbol } from './FormulaExplanation'

export function FormulaTriangle() {
  const [selected, setSelected] = useState<FormulaSymbol>('KM')
  return (
    <section className="formula-section" id="rumus">
      <div className="section-kicker">
        <MousePointer2 size={17} /> RUMUS YANG BISA DIAJAK MAIN
      </div>
      <h2>Satu segitiga. Tiga cara ngitung.</h2>
      <p className="section-description">
        Klik simbol yang mau kamu cari. Rumusnya langsung muncul.
      </p>
      <div className="formula-grid">
        <div className="triangle-card">
          <div className="formula-triangle">
            <svg viewBox="0 0 300 250" fill="none" aria-hidden="true">
              <path
                d="M150 12Q154 12 158 19L291 233Q297 243 283 243H17Q3 243 9 233L142 19Q146 12 150 12Z"
                fill="#e9efdc"
                stroke="#c6d1b4"
                strokeWidth="2"
              />
              <path d="M75 136H225M150 136V242" stroke="#b2c09f" strokeWidth="2" />
            </svg>
            {(['W', 'KM', 'F'] as const).map((symbol) => (
              <button
                key={symbol}
                className={`triangle-symbol symbol-${symbol.toLowerCase()} ${selected === symbol ? 'selected' : ''}`}
                aria-label={`Cari ${symbol}`}
                aria-pressed={selected === symbol}
                onClick={() => setSelected(symbol)}
              >
                {symbol}
                {selected === symbol && <span className="symbol-selection">DICARI</span>}
              </button>
            ))}
          </div>
          <span className="triangle-hint">
            <MousePointer2 size={13} /> Pilih salah satu simbol
          </span>
        </div>
        <FormulaExplanation selected={selected} />
        <div className="mnemonic-card">
          <span className="mnemonic-icon">
            <Wifi size={22} />
          </span>
          <span className="eyebrow">BIAR GAMPANG NEMPEL</span>
          <h3>
            “Kamar Mandi
            <br />
            kebagian WiFi”
          </h3>
          <p>
            <strong>Kamar Mandi</strong> → KM
            <br />
            <strong>WiFi</strong> → W / F
          </p>
          <div className="mnemonic-equation">KM = W / F</div>
          <small>Singkatannya buat bantu ingat. Hubungan fisikanya tetap W dibagi F.</small>
        </div>
      </div>
      <div className="symbol-glossary">
        <span>
          <strong>W</strong> Weight <i>Berat beban (N)</i>
        </span>
        <span>
          <strong>F</strong> Force <i>Gaya kuasa (N)</i>
        </span>
        <span>
          <strong>KM</strong> Mechanical Advantage <i>Keuntungan mekanis (tanpa satuan)</i>
        </span>
      </div>
    </section>
  )
}
