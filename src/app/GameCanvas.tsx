import { Suspense, useCallback, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import {
  EffectComposer,
  Vignette,
  Bloom,
  Noise,
  ChromaticAberration,
  SMAA,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { PlayerController } from '../player/PlayerController'
import { InteractionProvider } from '../player/InteractionProvider'
import { DistanceLod } from '../world/DistanceLod'
import { Atmosphere } from '../world/Atmosphere'
import { PlazaZone } from '../world/PlazaZone'
import { MidwayZone } from '../world/MidwayZone'
import { FoodAlleyZone } from '../world/FoodAlleyZone'
import { BackstageZone } from '../world/BackstageZone'
import { ProceduralProps, useBalloonTint } from '../world/ProceduralProps'
import { NarrativeFragments } from '../world/NarrativeFragments'
import { Balloon } from '../objects/Balloon'
import { RideSeat } from '../objects/RideSeat'
import { RideAudioSource } from '../audio/RideAudioSource'
import { WorldSeedContext } from '../proc/WorldSeedContext'
import type { ComfortSettings } from '../app/comfort'
import { PerfSampler } from '../app/PerfHud'
import { Crosshair } from '../app/Hud'
import { useInteraction } from '../player/InteractionContext'

type GameSceneProps = {
  comfort: ComfortSettings
  audioEnabled: boolean
  started: boolean
}

function WorldContent({
  comfort,
  audioEnabled,
  started,
  onReseed,
}: {
  comfort: ComfortSettings
  audioEnabled: boolean
  started: boolean
  onReseed: () => void
}) {
  const tint = useBalloonTint('plaza')
  const [riding, setRiding] = useState(false)
  const [ridePos, setRidePos] = useState<THREE.Vector3 | null>(null)

  const onRideChange = useCallback((r: boolean, p: THREE.Vector3 | null) => {
    setRiding(r)
    setRidePos(p)
  }, [])

  const chroma = useMemo(() => new THREE.Vector2(0.0006, 0.0006), [])

  return (
    <>
      <Atmosphere reduceMotion={comfort.reduceMotion} />
      <PlazaZone>
        <ProceduralProps zone="plaza" />
      </PlazaZone>
      <DistanceLod center={[0, 0, -42]} near={60}>
        <MidwayZone>
          <RideSeat
            id="carousel-horse-0"
            label="Carousel horse"
            position={[2.9, 1.0, 0]}
            onRideChange={onRideChange}
          />
          <ProceduralProps zone="midway" />
        </MidwayZone>
      </DistanceLod>
      <DistanceLod center={[42, 0, 0]} near={55}>
        <FoodAlleyZone />
      </DistanceLod>
      <DistanceLod center={[-42, 0, -10]} near={55}>
        <BackstageZone />
      </DistanceLod>
      <NarrativeFragments />
      <Balloon color={tint} position={[2.8, 1.6, 5]} />
      <Balloon color="#5ec8e8" position={[-3.2, 2.0, 3]} id="balloon-1" />
      <Balloon color="#f2d36b" position={[5.5, 1.4, 7]} id="balloon-2" />
      <PlayerController
        comfort={comfort}
        onReseed={onReseed}
        riding={riding}
        rideWorldPos={ridePos}
        controlsEnabled={started}
      />
      <RideAudioSource enabled={audioEnabled} />
      {!comfort.reduceMotion && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <SMAA />
          <Bloom
            intensity={0.4}
            luminanceThreshold={0.65}
            luminanceSmoothing={0.4}
            mipmapBlur
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={chroma}
            radialModulation={false}
            modulationOffset={0}
          />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.08} />
          <Vignette offset={0.4} darkness={0.28} />
        </EffectComposer>
      )}
      <PerfSampler visible={comfort.showFps} />
    </>
  )
}

export function GameCanvas({ comfort, audioEnabled, started }: GameSceneProps) {
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
          camera={{ fov: comfort.fov, near: 0.1, far: 140, position: [0, 1.7, 12] }}
          gl={{
            antialias: !comfort.reduceMotion,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#07090f')
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.45
            gl.shadowMap.enabled = !comfort.reduceMotion
            gl.shadowMap.type = THREE.PCFSoftShadowMap
          }}
        >
          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]} colliders={false}>
              <WorldContent
                comfort={comfort}
                audioEnabled={audioEnabled}
                started={started}
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
