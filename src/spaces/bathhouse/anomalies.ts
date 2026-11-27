import type { AnomalyConfig, AnomalyDef } from '../../core/anomaly/types'

/**
 * 심야 센토의 이변(PRD 14절). 전부 소리 없이 '조금 틀린' 상태다 — 놀래키지 않고, 사람 형상도 없다.
 * 실제 변화는 각 컴포넌트가 useAnomaly(id)로 스스로 만든다(되돌리기는 리렌더로 끝난다).
 * 소리로만 드러나는 이변은 두지 않는다 — 소리를 끄고 하는 사람도 찾을 수 있어야 한다.
 */
export const BATH_ANOMALIES = [
  { id: 'noren-mirrored', strength: 'weak', text: '남탕 노렌의 글자가 좌우 반전됐다' },
  { id: 'price-changed', strength: 'weak', text: '요금표의 어른 요금이 480엔이 아니다' },
  { id: 'clock-moved', strength: 'weak', text: '2시 47분에 멈춰 있던 시계가 다른 시각이다' },
  { id: 'closed-sign-gone', strength: 'weak', text: '유리문 안쪽의 휴업 팻말이 없다' },
  { id: 'lamp-cold', strength: 'medium', text: '탈의실 등이 전부 차가운 흰빛이다' },
  { id: 'no-steam', strength: 'medium', text: '탕에서 김이 오르지 않는다' },
  { id: 'hot-tub-empty', strength: 'medium', text: '열탕에 물이 없다' },
  { id: 'locker-missing', strength: 'medium', text: '탈의실 동쪽 락커 한 줄이 없다' },
  { id: 'mural-sea', strength: 'strong', text: '후지산 벽화 자리에 여탕의 바다 벽화가 걸려 있다' },
  { id: 'water-dark', strength: 'strong', text: '대욕조의 물이 검다' },
  { id: 'noren-both-women', strength: 'strong', text: '두 입구 모두 붉은 女 노렌이다' },
] as const satisfies readonly AnomalyDef[]

export type BathAnomalyId = (typeof BATH_ANOMALIES)[number]['id']

/**
 * 고리: 겐칸 → 남탕 탈의실 → 욕실. 욕실 동쪽 보일러실 문에 들어서면 "이상 없음",
 * 겐칸 바깥 유리문으로 돌아가면 "이상 있음". 어느 쪽이든 겐칸 출발점으로 돌아온다.
 */
export const BATH_ANOMALY: AnomalyConfig = {
  start: [0, 0.15, 17],
  startYaw: 0,
  forward: { x: [14.3, 16], z: [-30.4, -27.6] },
  back: { x: [-2.6, 2.6], z: [19.2, 20.5] },
  anomalies: [...BATH_ANOMALIES],
}
