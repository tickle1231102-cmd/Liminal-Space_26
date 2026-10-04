export type SceneId = 'school' | 'park'

const STORAGE_KEY = 'after-hours.scene.v1'

/**
 * 어느 배경을 띄울지. 놀이공원이 기본값이고,
 * 심야 학교는 `?scene=school` 또는 저장된 설정으로 연다.
 */
export function loadScene(): SceneId {
  const q = new URLSearchParams(window.location.search).get('scene')
  if (q === 'park' || q === 'school') return q
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'school' ? 'school' : 'park'
}

export function saveScene(scene: SceneId): void {
  try {
    localStorage.setItem(STORAGE_KEY, scene)
  } catch {
    /* 저장 실패는 무시 — 기본값으로 계속 동작한다 */
  }
}
