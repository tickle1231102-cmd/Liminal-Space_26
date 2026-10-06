import { EffectComposer, Vignette, Bloom, Noise, SMAA } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import type { SpaceWorldProps } from '../types'
import { DistanceLod } from '../../core/world/DistanceLod'
import { SchoolAtmosphere } from './SchoolAtmosphere'
import { EntranceZone } from './zones/EntranceZone'
import { CorridorZone } from './zones/CorridorZone'
import { CafeteriaZone } from './zones/CafeteriaZone'
import { BackstageZone } from './zones/BackstageZone'
import { SchoolProps } from './SchoolProps'
import { SchoolFragments } from './SchoolFragments'
import { BroadcastNoise } from './audio/BroadcastNoise'

/**
 * 심야 학교 — PRD 12절의 존 매핑을 그대로 옮긴 구성.
 * 현관·신발장 → 중앙 복도·계단 → 급식실 / 강당·방송실.
 */
export default function SchoolWorld({ reduceMotion, audioEnabled }: SpaceWorldProps) {
  return (
    <>
      <SchoolAtmosphere reduceMotion={reduceMotion} />

      <EntranceZone reduceMotion={reduceMotion}>
        <SchoolProps zone="entrance" />
      </EntranceZone>

      <CorridorZone reduceMotion={reduceMotion}>
        <SchoolProps zone="corridor" />
      </CorridorZone>

      <DistanceLod center={[21.5, 0, -18]} near={52}>
        <CafeteriaZone reduceMotion={reduceMotion}>
          <SchoolProps zone="cafeteria" />
        </CafeteriaZone>
      </DistanceLod>

      <DistanceLod center={[-21, 0, -39.5]} near={58}>
        <BackstageZone reduceMotion={reduceMotion}>
          <SchoolProps zone="backstage" />
        </BackstageZone>
      </DistanceLod>

      <SchoolFragments />
      <BroadcastNoise enabled={audioEnabled} />
      {!reduceMotion && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <SMAA />
          <Bloom
            intensity={0.22}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.35}
            mipmapBlur
          />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.06} />
          <Vignette offset={0.35} darkness={0.34} />
        </EffectComposer>
      )}
    </>
  )
}
