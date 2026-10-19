import { Link } from 'react-router-dom'

export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="31"
      height="31"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 5v30M7 12.5l26 15M7 27.5l26-15"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="4" fill="var(--brand-hole, #f7f8f2)" />
    </svg>
  )
}
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="studywithbro, halaman utama">
      <BrandMark />
      <span>
        studywith<span className="brand-bro">bro</span>
        <span className="brand-dot">.</span>
      </span>
    </Link>
  )
}
