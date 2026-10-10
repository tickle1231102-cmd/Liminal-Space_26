/**
 * 렌더 품질 등급 — 앱 셸(GameCanvas)이 한 번 정한다. 모델 URL 헬퍼처럼 컴포넌트 트리 밖에서
 * 읽어야 하는 곳을 위해 모듈 상태로 둔다. 공간 컴포넌트는 SpaceWorldProps.quality를 쓴다.
 */
export type Quality = 'high' | 'low'

let current: Quality = 'high'
export const setQuality = (q: Quality) => void (current = q)
export const getQuality = () => current
