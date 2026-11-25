import { EffectComposer, Vignette, Bloom, Noise, SMAA, N8AO } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import type { SpaceWorldProps } from '../types'
import { JjimAtmosphere } from './JjimAtmosphere'
import { EntranceZone } from './zones/EntranceZone'
import { AlleyZone } from './zones/AlleyZone'
import { ThemeRoom } from './zones/ThemeRoom'
import { HallZone } from './zones/HallZone'
import { SleepCaveZone } from './zones/SleepCaveZone'
import { StaffZone } from './zones/StaffZone'

/**
 * 새벽의 찜질방 — PRD 15절, docs/space-jjimjilbang-plan.md.
 * 입구 → 찜질 골목(족욕 수로·테마방 4개) → 대청마루 홀 → 토굴 수면실 → 직원 통로 → 카운터 뒤 문으로
 * 한 바퀴 도는 고리 동선. 2단계: 표면 재질, 랜드마크 모델(불가마 볼트·토굴·카운터·신발장), 방별 빛. 소품·오디오는 뒤 단계.
 */
export default function JjimjilbangWorld({ reduceMotion, quality }: SpaceWorldProps) {
  return (
    <>
      <JjimAtmosphere />
      <EntranceZone />
      <AlleyZone reduceMotion={reduceMotion} />
      <ThemeRoom kind="salt" />
      <ThemeRoom kind="clay" />
      <ThemeRoom kind="kiln" />
      <ThemeRoom kind="ice" />
      <HallZone />
      <SleepCaveZone />
      <StaffZone />
      {!reduceMotion && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          {/* 데스크톱 전용 접촉 그림자(AO) — 박스 셸이라 라이트맵 대신 화면 공간에서 */}
          {quality === 'high' ? (
            <N8AO aoRadius={0.8} distanceFalloff={0.6} intensity={1.8} halfRes color="#1c130b" />
          ) : (
            <></>
          )}
          <SMAA />
          <Bloom intensity={0.3} luminanceThreshold={0.75} luminanceSmoothing={0.4} mipmapBlur />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.045} />
          <Vignette offset={0.4} darkness={0.28} />
        </EffectComposer>
      )}
    </>
  )
}
