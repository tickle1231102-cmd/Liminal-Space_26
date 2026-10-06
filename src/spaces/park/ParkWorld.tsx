import { useMemo } from 'react'
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
import { DistanceLod } from '../../core/world/DistanceLod'
import type { SpaceWorldProps } from '../types'
import { Atmosphere } from './Atmosphere'
import { PlazaZone } from './zones/PlazaZone'
import { MidwayZone } from './zones/MidwayZone'
import { FoodAlleyZone } from './zones/FoodAlleyZone'
import { BackstageZone } from './zones/BackstageZone'
import { ProceduralProps, useBalloonTint } from './ProceduralProps'
import { NarrativeFragments } from './NarrativeFragments'
import { Balloon } from './objects/Balloon'
import { RideAudioSource } from './audio/RideAudioSource'

/** 야간 놀이공원 — 정문 광장 → 미드웨이 / 먹거리 골목 / 백스테이지. */
export default function ParkWorld({ reduceMotion, audioEnabled }: SpaceWorldProps) {
  const tint = useBalloonTint('plaza')
  const chroma = useMemo(() => new THREE.Vector2(0.0006, 0.0006), [])

  return (
    <>
      <Atmosphere reduceMotion={reduceMotion} />
      <PlazaZone>
        <ProceduralProps zone="plaza" />
      </PlazaZone>
      <DistanceLod center={[0, 0, -42]} near={60}>
        <MidwayZone>
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
      <RideAudioSource enabled={audioEnabled} />
      {!reduceMotion && (
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
    </>
  )
}
