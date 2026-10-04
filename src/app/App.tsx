import { useEffect, useState } from 'react'
import { GameCanvas } from './GameCanvas'
import { TouchControls } from './TouchControls'
import {
  loadComfortSettings,
  saveComfortSettings,
  type ComfortSettings,
} from './comfort'
import { detectPlatform, isTouchPrimary } from './platform'
import { loadScene, type SceneId } from './scene'
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
  const [scene, setScene] = useState<SceneId>(() => loadScene())
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
        key={scene}
        comfort={comfort}
        audioEnabled={audioEnabled}
        started={started}
        scene={scene}
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
            <h1>{scene === 'school' ? 'After Hours — 심야 학교' : 'After Hours'}</h1>
            {scene === 'school' ? (
              <>
                <p>야자 시간이 끝나지 않은 학교. 형광등은 그대로 켜져 있다.</p>
                <p>현관에서 시작해 중앙 복도로, 급식실과 강당·방송실로 이어집니다.</p>
                <p>
                  {touch
                    ? '탭해서 입장 — 스틱 이동 · 드래그 시점 · JUMP / E'
                    : 'WASD 이동 · Space 점프 · 마우스 시점 · E 밀기/끌기 · R 재시드'}
                </p>
              </>
            ) : (
              <>
                <p>폐장하지 않은 야간 놀이공원. 목표도 대사도 없다.</p>
                <p>빛나는 길을 따라가면 관람차(MIDWAY) 게이트로 이어집니다.</p>
                <p>
                  {touch
                    ? '탭해서 입장 — 스틱 이동 · 드래그 시점 · JUMP / E'
                    : 'WASD 이동 · Space 점프 · 마우스 시점 · E 상호작용 · R 재시드'}
                </p>
              </>
            )}
            <button
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
                setScene((s) => (s === 'school' ? 'park' : 'school'))
              }}
            >
              {scene === 'school' ? '놀이공원 프로토타입으로' : '심야 학교로'}
            </button>
            <p style={{ opacity: 0.45, fontSize: '0.8rem' }}>
              platform: {platform} · [ ] FOV · M reduce motion · F3 FPS
            </p>
          </div>
        </div>
      )}

      {started && !touch && !pointerLocked && (
        <div className="hud-resume">클릭해서 조작 복귀 · Esc로 해제</div>
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
