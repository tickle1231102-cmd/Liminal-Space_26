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
      <World reduceMotion={comfort.reduceMotion} audioEnabled={audioEnabled} />
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

function InteractPrompt() {
  const { focused, heldId } = useInteraction()
  if (!focused && !heldId) return null
  const label = heldId
    ? 'E / Tap — release'
    : focused
      ? `E / Tap — ${focused.kind}`
      : null
  if (!label) return null
  return <div className="hud-prompt">{label}</div>
}
