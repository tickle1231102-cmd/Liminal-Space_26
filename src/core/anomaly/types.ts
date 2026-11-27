import type { Object3D } from 'three'

/**
 * 선택 모드 '이변 찾기'(PRD 14절)의 공간 쪽 계약. core는 특정 공간을 모른다 —
 * 공간이 SpaceDefinition.anomaly로 고리 구간과 이변 목록을 선언하면 core가 추첨·판정·되돌리기를 맡는다.
 */
export type AnomalyStrength = 'weak' | 'medium' | 'strong'

export type AnomalyDef = {
  id: string
  /** 약함은 자세히 봐야 보이고 강함은 바로 보인다 */
  strength: AnomalyStrength
  /** 뽑힐 비중 (기본 1) */
  weight?: number
  /** 기록용 설명 — 화면에 띄우지 않는다 */
  text: string
  /**
   * 씬을 직접 고치는 이변. 되돌리는 함수를 돌려준다(되돌릴 수 있는 변경만 허용).
   * 대부분의 이변은 이것 대신 공간 컴포넌트가 useAnomaly(id)로 스스로 달라진다.
   */
  apply?: (scene: Object3D) => () => void
}

/** 바닥 평면의 축 정렬 구역 */
export type AnomalyZone = { x: [number, number]; z: [number, number] }

export type AnomalyConfig = {
  /** 고리의 출발점(플레이어 발 위치)과 바라보는 방향 */
  start: [number, number, number]
  startYaw: number
  /** 끝 문 — 들어서면 "이상 없음, 앞으로"로 판정한다 */
  forward: AnomalyZone
  /** 출발 문 — 들어서면 "이상 있음, 돌아간다"로 판정한다 */
  back: AnomalyZone
  anomalies: AnomalyDef[]
  /** 이변이 없는 바퀴의 비율 (기본 0.35) */
  noneChance?: number
  /** 연속으로 맞혀야 하는 횟수 (기본 8) */
  goal?: number
}
