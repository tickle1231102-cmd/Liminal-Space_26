import { useEffect } from 'react'
import { ANOMALY_FADE } from './AnomalyRunner'
import { useAnomalyState } from './store'

/** 새벽 장면을 보여 주는 시간(ms) — 끝나면 타이틀로 돌아간다 */
const ENDING_MS = 7000

/**
 * 캔버스 위에 덮는 화면 전환. 문에 닿으면 잠깐 어두워졌다 밝아지고(그 사이 출발점으로 돌아간다),
 * 여덟 번을 다 맞히면 새벽빛이 차오른 뒤 타이틀로 돌아간다. 글자·점수·게임오버 연출은 없다(PRD 14절).
 */
export function AnomalyOverlay() {
  const { enabled, phase } = useAnomalyState()
  const ending = enabled && phase === 'ending'

  useEffect(() => {
    if (!ending) return
    // 타이틀로: 같은 주소를 다시 연다(시작 화면부터). 앱 셸에 모드 전용 분기를 두지 않기 위한 방식이다
    const t = window.setTimeout(() => window.location.reload(), ENDING_MS)
    return () => window.clearTimeout(t)
  }, [ending])

  if (!enabled) return null
  const dark = phase === 'out' || phase === 'hold'
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          pointerEvents: 'none',
          opacity: dark ? 1 : 0,
          transition: `opacity ${ANOMALY_FADE}s linear`,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, #f6e7c8 0%, #f3c9a0 55%, #e9b79a 100%)',
          opacity: ending ? 1 : 0,
          transition: `opacity ${ENDING_MS * 0.6}ms ease-in`,
        }}
      />
    </>
  )
}
