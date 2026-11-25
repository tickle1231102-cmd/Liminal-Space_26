import { Suspense, lazy, useCallback, useMemo, useState, type ComponentType } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import * as THREE from 'three'
import { PlayerController } from '../core/player/PlayerController'
import { InteractionProvider } from '../core/player/InteractionProvider'
import { useInteraction } from '../core/player/InteractionContext'
import { WorldSeedContext } from '../core/proc/WorldSeedContext'
import type { SpaceDefinition, SpaceWorldProps } from '../spaces/types'
import type { ComfortSettings } from './comfort'
import { PerfSampler } from './PerfHud'
import { Crosshair } from './Hud'
import { setQuality } from '../core/world/quality'
import { detectPlatform, isTouchPrimary } from './platform'

/** 모바일(Capacitor·터치 기기)은 저사양 프리셋 */
const QUALITY: SpaceWorldProps['quality'] =
  detectPlatform() === 'capacitor' || isTouchPrimary() ? 'low' : 'high'
setQuality(QUALITY)

type GameSceneProps = {
  comfort: ComfortSettings
  audioEnabled: boolean
  started: boolean
  space: SpaceDefinition
}

// lazy()는 모듈 수준에서 공간당 한 번만 만든다 — 렌더 중에 만들면 Suspense 재시도마다 새로 생겨 영원히 로딩된다.
const worldCache = new Map<string, ComponentType<SpaceWorldProps>>()
function worldFor(space: SpaceDefinition) {
  let World = worldCache.get(space.id)
  if (!World) {
    World = lazy(space.load)
    worldCache.set(space.id, World)
  }
  return World
}

function WorldContent({
  comfort,
  audioEnabled,
  started,
  space,
  onReseed,
}: {
  comfort: ComfortSettings
  audioEnabled: boolean
  started: boolean
  space: SpaceDefinition
  onReseed: () => void
}) {
  const World = worldFor(space)

  return (
    <>
      <World reduceMotion={comfort.reduceMotion} audioEnabled={audioEnabled} quality={QUALITY} />
      <PlayerController
        spawn={space.spawn}
        comfort={comfort}
        onReseed={onReseed}
        controlsEnabled={started}
      />
      <PerfSampler visible={comfort.showFps} />
    </>
  )
}

export function GameCanvas({ comfort, audioEnabled, started, space }: GameSceneProps) {
  const [seed, setSeed] = useState('after-hours-proto')
  const [generation, setGeneration] = useState(0)

  const reseed = useCallback(() => {
    setSeed(`after-hours-${Date.now().toString(36)}`)
    setGeneration((g) => g + 1)
  }, [])

  const seedApi = useMemo(
    () => ({ seed, generation, reseed }),
    [seed, generation, reseed],
  )

  return (
    <WorldSeedContext.Provider value={seedApi}>
      <InteractionProvider>
        <Canvas
          shadows={!comfort.reduceMotion}
          dpr={comfort.reduceMotion ? [1, 1.25] : [1, 1.85]}
          camera={{
            fov: comfort.fov,
            near: 0.1,
            far: 140,
            position: [space.spawn[0], 1.7, space.spawn[2] + 2],
          }}
          gl={{
            antialias: !comfort.reduceMotion,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(space.clearColor)
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = space.exposure
            gl.shadowMap.enabled = !comfort.reduceMotion
            gl.shadowMap.type = THREE.PCFSoftShadowMap
          }}
        >
          <Suspense fallback={<BootPlaceholder />}>
            <Physics gravity={[0, -9.81, 0]} colliders={false}>
              <WorldContent
                comfort={comfort}
                audioEnabled={audioEnabled}
                started={started}
                space={space}
                onReseed={reseed}
              />
            </Physics>
          </Suspense>
        </Canvas>
        <Crosshair />
        <InteractPrompt />
      </InteractionProvider>
    </WorldSeedContext.Provider>
  )
}

/** Visible while Rapier WASM / heavy scene chunks resolve — avoids a blank canvas. */
function BootPlaceholder() {
  return (
    <mesh position={[0, 1.2, 0]}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshBasicMaterial color="#5ec8e8" wireframe />
    </mesh>
  )
}

const KEY = isTouchPrimary() ? 'E 버튼' : 'E'
const VERB = { push: '잡기', grab: '잡기', ride: '타기' } as const

/**
 * 상호작용 안내. 바라보는 중이면 "E 잡기 · 바가지", 들고 있는 동안에는 무엇을 들고 있는지와
 * 놓는 법을 계속 보여 준다 (휘두르다 놓치면 바로 사라져서 놓친 걸 알 수 있다).
 */
function InteractPrompt() {
  const { focused, heldId, getAll } = useInteraction()
  const held = heldId ? getAll().find((i) => i.id === heldId) : undefined
  if (held) {
    const riding = held.kind === 'ride'
    return (
      <div className="hud-prompt hud-prompt--held" key={held.id}>
        <span className="hud-prompt__main">
          <span className="hud-prompt__dot" />
          <strong>{held.label}</strong> {riding ? '타는 중' : '들고 있음'}
        </span>
        <span className="hud-prompt__sub">
          {KEY} {riding ? '내리기' : '놓기'}
          {!riding && ' · 세게 휘두르면 놓침'}
        </span>
      </div>
    )
  }
  if (!focused) return null
  return (
    <div className="hud-prompt" key={focused.id}>
      {KEY} {VERB[focused.kind]} · {focused.label}
    </div>
  )
}
