import { EffectComposer, Vignette, Bloom, Noise, SMAA, N8AO } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { DistanceLod } from '../../core/world/DistanceLod'
import type { SpaceWorldProps } from '../types'
import { BathAtmosphere } from './BathAtmosphere'
import { GenkanZone } from './zones/GenkanZone'
import { DressingZone } from './zones/DressingZone'
import { BathHallZone } from './zones/BathHallZone'
import { BoilerZone } from './zones/BoilerZone'
import { WomenDressingZone } from './zones/WomenDressingZone'
import { ServiceCorridorZone } from './zones/ServiceCorridorZone'
import { BathProps } from './BathProps'
import { BathFragments } from './BathFragments'
import { BathAudio } from './BathAudio'

/**
 * 심야 센토 — PRD 13절. 겐칸 → 반다이·탈의실 → 욕실 → 보일러실·사우나.
 * 여탕 날개(x<-10)는 겐칸 모서리 붉은 노렌으로 들어가는 거울상 구역. 여탕 욕실에서는 배관 복도로
 * 보일러실 철창까지 갈 수 있다(건너가지는 못한다).
 */
export default function BathhouseWorld({ reduceMotion, audioEnabled, quality }: SpaceWorldProps) {
  return (
    <>
      <BathAtmosphere reduceMotion={reduceMotion} />
      <GenkanZone />
      <DressingZone />
      <BathHallZone reduceMotion={reduceMotion} quality={quality} />
      <WomenDressingZone />
      {/* 여탕 욕실 — 콜라이더는 항상 살아 있고 렌더만 거리로 끈다 */}
      <DistanceLod center={[-28, 0, -23]} near={40}>
        <BathHallZone reduceMotion={reduceMotion} quality={quality} side="women" />
      </DistanceLod>
      <BathProps zone="genkan" />
      <BathProps zone="dressing" />
      <BathProps zone="hall" />
      <BathProps zone="tub" />
      <BathProps zone="w-dressing" />
      <BathProps zone="w-hall" />
      <BathProps zone="w-tub" />
      <BathFragments />
      <BathAudio enabled={audioEnabled} />
      <ServiceCorridorZone />
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
