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
 * 한 바퀴 도는 고리 동선. 1단계 화이트박스: 박스와 콜라이더, 수로 물 영역까지. 소품·오디오·후처리는 뒤 단계.
 */
export default function JjimjilbangWorld({ reduceMotion }: SpaceWorldProps) {
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
    </>
  )
}
