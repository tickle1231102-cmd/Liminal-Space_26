/**
 * 모드 선택. 지금은 주소의 `?mode=anomaly`로만 켠다 — 타이틀 화면의 '배회 / 이변 찾기' 선택은
 * 공간 전환 화면이 들어온 뒤에 붙인다(PRD 14절).
 */
export function anomalyModeRequested(): boolean {
  return new URLSearchParams(window.location.search).get('mode') === 'anomaly'
}

/** 추첨 시드 — `?aseed=`로 고정할 수 있다(검증·'오늘 밤의 시드'용). 없으면 실행마다 다르다. */
export function anomalySeed(): string {
  return new URLSearchParams(window.location.search).get('aseed') ?? `run-${Date.now().toString(36)}`
}
