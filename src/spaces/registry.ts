import type { SpaceDefinition } from './types'
import { park } from './park'
import { school } from './school'

/** 새 공간은 src/spaces/<id>/index.ts를 만들고 여기 한 줄 추가한다. 첫 항목이 기본값. */
export const SPACES: SpaceDefinition[] = [park, school]

export function getSpace(id: string): SpaceDefinition {
  return SPACES.find((s) => s.id === id) ?? SPACES[0]
}

/** `?space=<id>` (구 `?scene=` 도 허용). 없으면 기본 공간. */
export function loadSpaceId(): string {
  const q = new URLSearchParams(window.location.search)
  return getSpace(q.get('space') ?? q.get('scene') ?? '').id
}
