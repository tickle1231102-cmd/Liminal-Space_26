import { useEffect, useState } from 'react'
import { GameCanvas } from './GameCanvas'
import { TouchControls } from './TouchControls'
import {
  loadComfortSettings,
  saveComfortSettings,
  type ComfortSettings,
} from './comfort'
import { detectPlatform, isTouchPrimary } from './platform'
import {
  bindDesktopInput,
  pressReseed,
  requestPointerLock,
  setLookSensitivity,
} from '../input/controls'

export function App() {
  const [started, setStarted] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [comfort, setComfort] = useState<ComfortSettings>(() => loadComfortSettings())
  const platform = detectPlatform()
  const touch = isTouchPrimary()

  useEffect(() => {
    setLookSensitivity(comfort.lookSensitivity)
    saveComfortSettings(comfort)
  }, [comfort])

  useEffect(() => {
    if (!started || touch) return
    return bindDesktopInput(document.body)
  }, [started, touch])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'F3') {
        setComfort((c) => ({ ...c, showFps: !c.showFps }))
      }
      if (e.code === 'BracketLeft') {
        setComfort((c) => ({
          ...c,
          fov: Math.max(55, c.fov - 2),
        }))
      }
      if (e.code === 'BracketRight') {
        setComfort((c) => ({
          ...c,
          fov: Math.min(90, c.fov + 2),
        }))
      }
      if (e.code === 'KeyM') {
        setComfort((c) => ({ ...c, reduceMotion: !c.reduceMotion }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const begin = () => {
    setStarted(true)
    setAudioEnabled(true)
    if (!touch) requestPointerLock(document.body)
  }

  return (
    <div className="app-shell">
      <GameCanvas comfort={comfort} audioEnabled={audioEnabled} started={started} />
      <TouchControls enabled={started} />

      {!started && (
        <div
          className="hud-overlay"
          role="button"
          tabIndex={0}
          onClick={begin}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') begin()
          }}
        >
          <div className="hud-overlay-card">
            <h1>After Hours</h1>
            <p>폐장하지 않은 야간 놀이공원. 목표도 대사도 없다.</p>
            <p>클릭하면 입장 — 뒤 광장·네온·분수 반영이 보여야 정상입니다.</p>
            <p>
              {touch
                ? '탭해서 입장 — 왼쪽 스틱 이동, 오른쪽 드래그 시점'
                : 'WASD 이동 · 마우스 시점 · E 상호작용 · R 재시드'}
            </p>
            <p style={{ opacity: 0.45, fontSize: '0.8rem' }}>
              platform: {platform} · [ ] FOV · M reduce motion · F3 FPS
            </p>
          </div>
        </div>
      )}

      {started && (
        <button
          type="button"
          style={{
            position: 'absolute',
            right: 12,
            top: 12,
            zIndex: 12,
            background: 'rgba(10,12,18,0.4)',
            color: 'rgba(232,228,216,0.65)',
            border: '1px solid rgba(232,228,216,0.15)',
            padding: '0.35rem 0.6rem',
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
          onClick={() => pressReseed()}
        >
          RESEED
        </button>
      )}
    </div>
  )
}
