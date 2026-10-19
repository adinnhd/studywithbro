import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      math: DetailedHTMLProps<HTMLAttributes<MathMLElement>, MathMLElement>
      mfrac: DetailedHTMLProps<HTMLAttributes<MathMLElement>, MathMLElement>
      mtext: DetailedHTMLProps<HTMLAttributes<MathMLElement>, MathMLElement>
    }
  }
}
