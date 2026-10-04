import { DistanceLod } from '../DistanceLod'
import { SchoolAtmosphere } from './SchoolAtmosphere'
import { EntranceZone } from './EntranceZone'
import { CorridorZone } from './CorridorZone'
import { CafeteriaZone } from './CafeteriaZone'
import { BackstageZone } from './BackstageZone'
import { SchoolProps } from './SchoolProps'
import { SchoolFragments } from './SchoolFragments'
import { BroadcastNoise } from '../../audio/BroadcastNoise'

/** 현관에서 복도를 바라보고 서는 위치. */
export const SCHOOL_SPAWN: [number, number, number] = [0, 0.15, 18]

/**
 * 심야 학교 — PRD 12절의 존 매핑을 그대로 옮긴 구성.
 * 현관·신발장 → 중앙 복도·계단 → 급식실 / 강당·방송실.
 */
export function SchoolWorld({
  reduceMotion,
  audioEnabled,
}: {
  reduceMotion: boolean
  audioEnabled: boolean
}) {
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
    </>
  )
}
