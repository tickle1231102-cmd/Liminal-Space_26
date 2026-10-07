import { EffectComposer, Vignette, Bloom, Noise, SMAA, N8AO } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { DistanceLod } from '../../core/world/DistanceLod'
import type { SpaceWorldProps } from '../types'
import { BathAtmosphere } from './BathAtmosphere'
import { GenkanZone } from './zones/GenkanZone'
import { DressingZone } from './zones/DressingZone'
import { BathHallZone } from './zones/BathHallZone'
import { BoilerZone } from './zones/BoilerZone'
import { BathProps } from './BathProps'
import { BathFragments } from './BathFragments'
import { BathAudio } from './BathAudio'

/**
 * 심야 센토 — PRD 13절. 겐칸 → 반다이·탈의실 → 욕실 → 보일러실·사우나.
 * 0단계 화이트박스: 동선·스케일·콜라이더만 확정한다.
 */
export default function BathhouseWorld({ reduceMotion, audioEnabled, quality }: SpaceWorldProps) {
  return (
    <>
      <BathAtmosphere reduceMotion={reduceMotion} />
      <GenkanZone />
      <DressingZone />
      <BathHallZone reduceMotion={reduceMotion} quality={quality} />
      <BathProps zone="genkan" />
      <BathProps zone="dressing" />
      <BathProps zone="hall" />
      <BathProps zone="tub" />
      <BathFragments />
      <BathAudio enabled={audioEnabled} />
      <DistanceLod center={[20, 0, -28]} near={40}>
        <BoilerZone />
      </DistanceLod>
      {!reduceMotion && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          {/* 데스크톱 전용 접촉 그림자(AO) — 인스턴스 모듈이라 라이트맵 대신 화면 공간에서 */}
          {quality === 'high' ? (
            <N8AO aoRadius={0.9} distanceFalloff={0.6} intensity={2.2} halfRes color="#1a120c" />
          ) : (
            <></>
          )}
          <SMAA />
          <Bloom intensity={0.35} luminanceThreshold={0.7} luminanceSmoothing={0.45} mipmapBlur />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.05} />
          <Vignette offset={0.38} darkness={0.3} />
        </EffectComposer>
      )}
    </>
  )
}
