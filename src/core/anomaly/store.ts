import { useSyncExternalStore } from 'react'
import { createAnomalyDraw } from './draw'
import type { AnomalyConfig } from './types'

/**
 * 이변 찾기 모드의 진행 상태. 캔버스 안(AnomalyRunner·공간 컴포넌트)과 밖(AnomalyOverlay)이 함께 읽으므로
 * 컨텍스트가 아니라 모듈 상태 + 구독으로 둔다. 모드가 꺼져 있으면 enabled=false이고 공간은 평소 모습 그대로다.
 */
export type AnomalyPhase = 'walk' | 'out' | 'hold' | 'ending'

export type AnomalyState = {
  enabled: boolean
  /** 이번 바퀴의 이변 (없으면 null) */
  activeId: string | null
  /** 연속 정답 수 — 틀리면 조용히 0 */
  streak: number
  /** 지금까지 돈 바퀴 수. 바퀴마다 소품을 제자리로 되돌리는 키로도 쓴다 */
  lap: number
  goal: number
  phase: AnomalyPhase
}

const OFF: AnomalyState = { enabled: false, activeId: null, streak: 0, lap: 0, goal: 8, phase: 'walk' }
let state: AnomalyState = OFF
let draw: (() => string | null) | null = null
const listeners = new Set<() => void>()

function set(patch: Partial<AnomalyState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export const getAnomalyState = () => state
export function subscribeAnomaly(l: () => void) {
  listeners.add(l)
  return () => void listeners.delete(l)
}

export function beginAnomalyRun(config: AnomalyConfig, seed: string) {
  draw = createAnomalyDraw(seed, config.anomalies, config.noneChance)
  set({ enabled: true, activeId: draw(), streak: 0, lap: 0, goal: config.goal ?? 8, phase: 'walk' })
}

export function endAnomalyRun() {
  draw = null
  set(OFF)
}

/** 문에 닿았다: 이변이 없으면 앞으로, 있으면 뒤로가 정답. 화면이 어두워지는 단계로 넘어간다. */
export function judgeAnomaly(choice: 'forward' | 'back'): boolean {
  if (!state.enabled || state.phase !== 'walk') return false
  const correct = (state.activeId === null) === (choice === 'forward')
  const streak = correct ? state.streak + 1 : 0
  set({ streak, phase: streak >= state.goal ? 'ending' : 'out' })
  return correct
}

/** 화면이 완전히 어두워진 뒤: 다음 바퀴의 이변을 뽑는다. */
export function nextAnomalyLap() {
  if (!draw) return
  set({ lap: state.lap + 1, activeId: draw(), phase: 'hold' })
}

/** 개발용: 특정 이변을 바로 건다(화면 확인). 추첨 순서에는 영향을 주지 않는다. */
export function forceAnomaly(id: string | null) {
  if (state.enabled) set({ activeId: id })
}

export function resumeAnomalyWalk() {
  if (state.phase === 'hold') set({ phase: 'walk' })
}

export function useAnomalyState(): AnomalyState {
  return useSyncExternalStore(subscribeAnomaly, getAnomalyState)
}

/** 이 이변이 지금 걸려 있는가. 모드가 꺼져 있으면 늘 false. */
export function useAnomaly(id: string): boolean {
  const s = useAnomalyState()
  return s.enabled && s.activeId === id
}

/** 연속 정답 수 — 모드가 꺼져 있으면 null (카운터 사물을 아예 두지 않는다). */
export function useAnomalyStreak(): number | null {
  const s = useAnomalyState()
  return s.enabled ? s.streak : null
}

/** 바퀴 번호 — 모드가 꺼져 있으면 0. 소품을 바퀴마다 제자리로 되돌리는 key에 쓴다. */
export function useAnomalyLap(): number {
  return useAnomalyState().lap
}
