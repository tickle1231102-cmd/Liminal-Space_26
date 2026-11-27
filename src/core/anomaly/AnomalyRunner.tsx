import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { requestTeleport } from '../player/teleport'
import { anomalySeed } from './mode'
import {
  beginAnomalyRun,
  endAnomalyRun,
  forceAnomaly,
  getAnomalyState,
  judgeAnomaly,
  nextAnomalyLap,
  resumeAnomalyWalk,
  useAnomalyState,
} from './store'
import type { AnomalyConfig, AnomalyZone } from './types'

/** 화면이 어두워지는 시간(초) — AnomalyOverlay의 전환 시간과 같다 */
export const ANOMALY_FADE = 0.35
/** 어두운 채로 머무는 시간: 이 사이에 순간이동과 이변 교체가 끝난다 */
const HOLD = 0.25

const inside = (z: AnomalyZone, x: number, pz: number) => x >= z.x[0] && x <= z.x[1] && pz >= z.z[0] && pz <= z.z[1]

/**
 * 고리 구간 진행(PRD 14절). 캔버스 안에 둔다. 플레이어가 끝 문이나 출발 문에 닿으면 판정하고,
 * 화면이 어두워진 사이에 출발점으로 되돌려 다음 바퀴의 이변을 건다. 새 버튼은 없다 — 걷기만으로 고른다.
 */
export function AnomalyRunner({ config }: { config: AnomalyConfig }) {
  const { camera, scene } = useThree()
  const { activeId } = useAnomalyState()
  const timer = useRef(0)

  useEffect(() => {
    beginAnomalyRun(config, anomalySeed())
    // 개발용 콘솔 핸들: __anomaly() 상태, __anomaly.force(id) 특정 이변 걸기
    if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__anomaly = Object.assign(getAnomalyState, { force: forceAnomaly })
    return endAnomalyRun
  }, [config])

  // 씬을 직접 고치는 이변(apply)은 걸릴 때 적용하고 바뀔 때 되돌린다
  useEffect(() => {
    const def = config.anomalies.find((a) => a.id === activeId)
    return def?.apply?.(scene)
  }, [activeId, config, scene])

  useFrame((_, dt) => {
    const s = getAnomalyState()
    if (!s.enabled) return
    if (s.phase === 'walk') {
      const { x, z } = camera.position
      if (inside(config.forward, x, z)) judgeAnomaly('forward')
      else if (inside(config.back, x, z)) judgeAnomaly('back')
      timer.current = 0
    } else if (s.phase === 'out') {
      timer.current += dt
      if (timer.current >= ANOMALY_FADE) {
        requestTeleport(config.start, config.startYaw)
        nextAnomalyLap()
        timer.current = 0
      }
    } else if (s.phase === 'hold') {
      timer.current += dt
      if (timer.current >= HOLD) resumeAnomalyWalk()
    }
  })

  return null
}
