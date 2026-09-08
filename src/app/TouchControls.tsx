import { useRef, useState, type TouchEvent } from 'react'
import {
  addTouchLook,
  pressInteract,
  setTouchMove,
} from '../input/controls'
import { isTouchPrimary } from './platform'

export function TouchControls({ enabled }: { enabled: boolean }) {
  const stickRef = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const touchId = useRef<number | null>(null)

  if (!enabled || !isTouchPrimary()) return null

  const onStickStart = (e: TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    const t = e.changedTouches[0]
    if (!t || !stickRef.current) return
    touchId.current = t.identifier
    updateStick(t.clientX, t.clientY, stickRef.current, setKnob)
  }

  const onStickMove = (e: TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    const t = findTouch(e, touchId.current)
    if (!t || !stickRef.current) return
    updateStick(t.clientX, t.clientY, stickRef.current, setKnob)
  }

  const onStickEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!findTouch(e, touchId.current)) return
    touchId.current = null
    setKnob({ x: 0, y: 0 })
    setTouchMove(0, 0)
  }

  return (
    <div className="touch-layer">
      <div
        ref={stickRef}
        className="touch-stick"
        onTouchStart={onStickStart}
        onTouchMove={onStickMove}
        onTouchEnd={onStickEnd}
        onTouchCancel={onStickEnd}
      >
        <div
          className="touch-stick-knob"
          style={{ ['--kx' as string]: `${knob.x}px`, ['--ky' as string]: `${knob.y}px` }}
        />
      </div>

      <LookPad />

      <button
        type="button"
        className="touch-action"
        onTouchStart={(e) => {
          e.preventDefault()
          pressInteract()
        }}
      >
        E
      </button>
    </div>
  )
}

function findTouch(
  e: TouchEvent,
  id: number | null,
): { clientX: number; clientY: number; identifier: number } | null {
  if (id == null) return null
  for (let i = 0; i < e.changedTouches.length; i++) {
    const c = e.changedTouches[i]
    if (c && c.identifier === id) return c
  }
  return null
}

function updateStick(
  clientX: number,
  clientY: number,
  el: HTMLDivElement,
  setKnob: (v: { x: number; y: number }) => void,
) {
  const rect = el.getBoundingClientRect()
  const dx = clientX - (rect.left + rect.width / 2)
  const dy = clientY - (rect.top + rect.height / 2)
  const max = rect.width * 0.35
  const x = Math.max(-1, Math.min(1, dx / max))
  const y = Math.max(-1, Math.min(1, -dy / max))
  setKnob({ x: x * max, y: -y * max })
  setTouchMove(x, y)
}

function LookPad() {
  const last = useRef<{ x: number; y: number } | null>(null)
  return (
    <div
      className="touch-look"
      onTouchStart={(e) => {
        const t = e.changedTouches[0]
        if (!t) return
        last.current = { x: t.clientX, y: t.clientY }
      }}
      onTouchMove={(e) => {
        const t = e.changedTouches[0]
        if (!t || !last.current) return
        addTouchLook(t.clientX - last.current.x, t.clientY - last.current.y)
        last.current = { x: t.clientX, y: t.clientY }
      }}
      onTouchEnd={() => {
        last.current = null
      }}
    />
  )
}
