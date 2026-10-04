export type SceneId = 'school' | 'park'

/**
 * 어느 배경을 띄울지. 새로 열면 항상 놀이공원이고,
 * 심야 학교는 `?scene=school`로 연다(화면 안 전환 버튼은 이번 세션에만 적용).
 */
export function loadScene(): SceneId {
  const q = new URLSearchParams(window.location.search).get('scene')
  return q === 'school' ? 'school' : 'park'
}
