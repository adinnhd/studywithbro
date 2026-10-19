import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_INPUT, calculatePulley } from '../lib/physics/pulley'
import type { SimulationInput } from '../types/pulley'
import { useReducedMotion } from './useReducedMotion'

export function usePulleySimulation(initial?: Partial<SimulationInput>) {
  const [input, setInput] = useState<SimulationInput>({ ...DEFAULT_INPUT, ...initial })
  const [playing, setPlaying] = useState(false)
  const reducedMotion = useReducedMotion()
  const progressRef = useRef(input.heightCm)
  progressRef.current = input.heightCm

  const update = useCallback(
    <K extends keyof SimulationInput>(key: K, value: SimulationInput[K]) => {
      setPlaying(false)
      setInput((old) => ({ ...old, [key]: value }))
    },
    [],
  )

  useEffect(() => {
    if (!playing || reducedMotion) return
    let last = 0
    let frame: number
    const tick = (time: number) => {
      if (!last) last = time
      const step = (Math.min(time - last, 50) / 1000) * 12
      last = time
      const heightCm = Math.min(100, progressRef.current + step)
      progressRef.current = heightCm
      setInput((old) => ({ ...old, heightCm }))
      if (heightCm >= 100) setPlaying(false)
      else frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, reducedMotion])

  useEffect(() => {
    if (reducedMotion) setPlaying(false)
  }, [reducedMotion])
  const togglePlay = () => {
    if (reducedMotion) return
    if (!playing && input.heightCm >= 100) setInput((old) => ({ ...old, heightCm: 0 }))
    setPlaying((old) => !old)
  }
  const reset = () => {
    setPlaying(false)
    setInput({ ...DEFAULT_INPUT, ...initial })
  }
  return {
    input,
    result: calculatePulley(input),
    playing,
    reducedMotion,
    update,
    togglePlay,
    reset,
  }
}
