import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

/** Runs inside Canvas — must never return DOM nodes (R3F only allows THREE hosts). */
export function PerfSampler({ visible }: { visible: boolean }) {
  const frames = useRef(0)
  const last = useRef(performance.now())
  const frameTimes = useRef<number[]>([])
  const elRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!visible) {
      elRef.current?.remove()
      elRef.current = null
      return
    }
    const el = document.createElement('div')
    el.className = 'hud-stats'
    el.setAttribute('aria-hidden', 'true')
    document.body.appendChild(el)
    elRef.current = el
    return () => {
      el.remove()
      elRef.current = null
    }
  }, [visible])

  useFrame((_, dt) => {
    if (!visible) return
    frames.current += 1
    frameTimes.current.push(dt * 1000)
    if (frameTimes.current.length > 120) frameTimes.current.shift()
    const now = performance.now()
    if (now - last.current < 500) return

    const fps = Math.round((frames.current * 1000) / (now - last.current))
    const avg =
      frameTimes.current.reduce((a, b) => a + b, 0) / Math.max(1, frameTimes.current.length)
    const max = Math.max(...frameTimes.current)
    const text = `FPS ${fps}\navg ${avg.toFixed(1)}ms\nmax ${max.toFixed(1)}ms`
    if (elRef.current) elRef.current.textContent = text
    ;(window as unknown as { __AH_PERF__?: object }).__AH_PERF__ = {
      fps,
      avgFrameMs: avg,
      maxFrameMs: max,
      at: Date.now(),
    }
    frames.current = 0
    last.current = now
  })

  return null
}
