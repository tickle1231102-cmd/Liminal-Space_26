import { useEffect, useState } from 'react'
import { GameCanvas } from './GameCanvas'
import { TouchControls } from './TouchControls'
import {
  loadComfortSettings,
  saveComfortSettings,
  type ComfortSettings,
} from './comfort'
import { detectPlatform, isTouchPrimary } from './platform'
import { SPACES, getSpace, loadSpaceId } from '../spaces/registry'
import {
  bindDesktopInput,
  pressReseed,
  requestPointerLock,
  setLookSensitivity,
} from '../core/input/controls'

export function App() {
  const [started, setStarted] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [comfort, setComfort] = useState<ComfortSettings>(() => loadComfortSettings())
  const [spaceId, setSpaceId] = useState(() => loadSpaceId())
  const space = getSpace(spaceId)
  const [pointerLocked, setPointerLocked] = useState(false)
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

  // Esc로 풀린 포인터 락을 화면 클릭으로 다시 잡는다 (버튼 클릭은 제외).
  useEffect(() => {
    if (!started || touch) return

    const onLockChange = () => setPointerLocked(document.pointerLockElement != null)
    const onClick = (e: MouseEvent) => {
      if (document.pointerLockElement) return
      if ((e.target as HTMLElement | null)?.closest('button')) return
      requestPointerLock(document.body)
    }

    onLockChange()
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('click', onClick)
    }
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
      <GameCanvas
        key={space.id}
        comfort={comfort}
        audioEnabled={audioEnabled}
        started={started}
        space={space}
      />
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
            <h1>{space.title}</h1>
            {space.intro.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>
              {touch
                ? '탭해서 입장 — 스틱 이동 · 드래그 시점 · JUMP / E'
                : `WASD 이동 · Space 점프 · 마우스 시점 · E ${space.interactVerb} · R 재시드`}
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {SPACES.filter((s) => s.id !== space.id).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  style={{
                    marginTop: '0.4rem',
                    background: 'transparent',
                    color: 'rgba(232,228,216,0.7)',
                    border: '1px solid rgba(232,228,216,0.22)',
                    padding: '0.35rem 0.7rem',
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSpaceId(s.id)
                  }}
                >
                  {s.name}로 →
                </button>
              ))}
            </div>
            <p style={{ opacity: 0.45, fontSize: '0.8rem' }}>
              platform: {platform} · [ ] FOV · M reduce motion · F3 FPS
            </p>
          </div>
        </div>
      )}

      {started && !touch && !pointerLocked && (
        <div className="hud-resume">드래그로 둘러보기 · 클릭하면 마우스 잠금 · Esc로 해제</div>
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
